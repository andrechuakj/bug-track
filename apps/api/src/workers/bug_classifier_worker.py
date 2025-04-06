from configuration.logger import get_logger
from domain.config import get_session
from services.bug_classifier_service import BugClassifierService
from workers.celery_app import celery_app


@celery_app.task(bind=True, max_retries=3)
def classify_bugs_task(self, bug_ids=None):
    """
    Runs the bug classifier as a background task.
    Can classify specific bugs by ID or all unclassified bugs if bug_ids is None.
    """
    logger = get_logger()
    logger.info(
        f"Starting bug classification task: {'specific bugs' if bug_ids else 'all unclassified bugs'}"
    )

    try:
        with get_session() as session:
            if bug_ids:
                # Future implementation for specific bug IDs
                logger.info(f"Classifying specific {len(bug_ids)} bug reports.")
                # TODO: Implement specific bug classification
                classified_count = 0
            else:
                # Classify all unclassified bugs
                classified_count = BugClassifierService.classify_unclassified_bugs(
                    session
                )

            logger.info(f"Classified {classified_count} bug reports.")
            return classified_count

    except Exception as e:
        logger.error(f"Error in classification task: {e}")
        raise self.retry(exc=e, countdown=30)
