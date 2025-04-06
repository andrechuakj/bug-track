import time
from datetime import datetime, timezone

from configuration.logger import get_logger
from domain.config import get_session
from domain.models import BugReport
from domain.models.DBMSSystem import get_dbms_systems
from github import (
    BadCredentialsException,
    Github,
    GithubException,
    RateLimitExceededException,
)
from utilities.constants import constants
from workers.bug_classifier_task import classify_bugs_task
from workers.celery_app import celery_app
from workers.task_coordinator import TaskCoordinator


def get_github_client():
    if not constants.GITHUB_TOKEN:
        raise ValueError("GitHub Token not found!")
    return Github(constants.GITHUB_TOKEN, per_page=100)


def build_github_query(repo: str, latest_issue_time: datetime | None) -> str:
    base_query = f"repo:{repo} is:issue label:fuzz/sqlancer"
    if latest_issue_time:
        base_query += f" created:>{latest_issue_time.isoformat()}"
    return base_query


@celery_app.task(bind=True, max_retries=3)
def fetch_github_issues_task(self):
    """Fetches new GitHub issues and stores them in the database."""
    logger = get_logger()
    coordinator = TaskCoordinator()
    coordinator.set_fetcher_running(True)
    logger.info("Starting fetch github issues task")

    try:
        g = get_github_client()
        with get_session() as session:
            dbms_systems = get_dbms_systems(session)
        if not dbms_systems:
            logger.warning("No DBMS IDs found. Exiting task.")
            coordinator.set_fetcher_running(False)
            return
    except BadCredentialsException:
        logger.error("Invalid GitHub Token! Task will not retry.")
        coordinator.set_fetcher_running(False)
        return
    except Exception as e:
        logger.exception(f"Failed to initialize GitHub client or load DBMS IDs: {e}")
        coordinator.set_fetcher_running(False)
        raise self.retry(exc=e, countdown=30)

    total_issues_count = self.request.get("total_issues_count", 0)

    for dbms in dbms_systems:
        repo = dbms.repository
        dbms_id = dbms.id

        try:
            with get_session() as session:
                latest_issue_time = BugReport.get_latest_bug_report_time(
                    session, dbms_id
                )

            query = build_github_query(repo, latest_issue_time)
            logger.info(f"[DBMS {dbms_id}] Searching with query: {query}")
            search_results = g.search_issues(query, sort="created", order="asc")

            page = 0
            while True:
                with get_session() as session:
                    page_issues = search_results.get_page(page)
                    if not page_issues:
                        logger.info(f"[DBMS {dbms_id}] No more new issues.")
                        break

                    for issue in page_issues:
                        try:
                            bug_report = BugReport(
                                dbms_id=dbms_id,
                                title=issue.title.strip(),
                                description=issue.body.strip() if issue.body else "",
                                url=issue.html_url,
                                issue_created_at=issue.created_at.replace(
                                    tzinfo=timezone.utc
                                ),
                                issue_updated_at=(
                                    issue.updated_at.replace(tzinfo=timezone.utc)
                                    if issue.updated_at
                                    else None
                                ),
                                issue_closed_at=(
                                    issue.closed_at.replace(tzinfo=timezone.utc)
                                    if issue.closed_at
                                    else None
                                ),
                                is_closed=issue.state == "closed",
                            )
                            BugReport.save_bug_report(session, bug_report)
                            total_issues_count += 1
                            self.update_state(
                                state={"total_issues_count": total_issues_count}
                            )
                            logger.info(
                                f"[DBMS {dbms_id}] Stored issue: {issue.title} (ID: {bug_report.id})"
                            )
                        except Exception as save_error:
                            logger.exception(
                                f"[DBMS {dbms_id}] Failed to save issue: {issue.title} - {save_error}"
                            )

                if not coordinator.is_classifier_running():
                    classify_bugs_task.delay()

                page += 1
                time.sleep(2)

        except RateLimitExceededException:
            reset_time = g.get_rate_limit().search.reset
            wait_time = max(
                (reset_time - datetime.now(timezone.utc)).total_seconds(), 1
            )
            logger.warning(
                f"[DBMS {dbms_id}] Rate limit exceeded. Will retry at {reset_time.strftime('%Y-%m-%d %H:%M:%S %Z')} "
                f"(in {int(wait_time)} seconds)."
            )
            raise self.retry(countdown=wait_time)

        except GithubException as e:
            logger.error(f"[DBMS {dbms_id}] GitHub API error: {e}. Retrying in 60s...")
            raise self.retry(exc=e, countdown=60)

        except Exception as e:
            logger.exception(
                f"[DBMS {dbms_id}] Unexpected error: {e}. Retrying in 30s..."
            )
            raise self.retry(exc=e, countdown=30)

        finally:
            coordinator.set_fetcher_running(False)

    logger.info(
        f"Finished fetching issues. Total new issues stored: {total_issues_count}."
    )
    return total_issues_count
