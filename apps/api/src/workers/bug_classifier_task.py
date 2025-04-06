import time

from configuration.logger import get_logger
from domain.config import get_session
from services.bug_classifier_service import BugClassifierService
from workers.celery_app import celery_app
from workers.task_coordinator import TaskCoordinator


@celery_app.task(bind=True, max_retries=3)
def classify_bugs_task(self, bug_ids=None):
    """
    Runs the bug classifier as a background task.
    Can classify specific bugs by ID or all unclassified bugs if bug_ids is None.
    """
    logger = get_logger()
    coordinator = TaskCoordinator()
    coordinator.set_classifier_running(True)
    logger.info(
        f"Starting bug classification task: {'specific bugs' if bug_ids else 'all unclassified bugs'}"
    )

    total_classified = self.request.get("total_classified", 0)

    try:
        while True:
            with get_session() as session:
                if bug_ids:
                    # Future implementation for specific bug IDs
                    logger.info(f"Classifying specific {len(bug_ids)} bug reports.")
                    # TODO: Implement specific bug classification
                    classified_count = 0
                    break
                else:
                    # Classify all unclassified bugs in this batch
                    classified_count = BugClassifierService.classify_unclassified_bugs(
                        session
                    )

                    total_classified += classified_count
                    self.update_state(state={"total_classified": total_classified})

                    if classified_count > 0:
                        continue

                    # Check if fetcher is still running
                    if not coordinator.is_fetcher_running():
                        break

                    logger.info("Waiting for more bugs from fetcher...")
                    time.sleep(5)

        coordinator.set_classifier_running(False)
        logger.info(
            f"Classification task completed. Total classified: {total_classified} bug reports."
        )
        return total_classified

    except Exception as e:
        logger.error(f"Error in classification task: {e}")
        if self.request.retries >= self.max_retries:
            coordinator.set_classifier_running(False)
        raise self.retry(exc=e, countdown=30)
