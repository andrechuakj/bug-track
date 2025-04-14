import time

from configuration.logger import get_logger
from domain.config import get_session
from services.bug_vectorizer_service import BugVectorizerService
from workers.celery_app import celery_app
from workers.task_coordinator import TaskCoordinator


@celery_app.task(bind=True, max_retries=3)
def vectorize_bugs_task(self):
    """
    Runs the bug vectorizer as a background task.
    Vectorizes all unvectorized bugs.
    """
    logger = get_logger()
    coordinator = TaskCoordinator()
    coordinator.set_vectorizer_running(True)
    logger.info("Starting bug vectorization task")

    total_vectorized = self.request.get("total_vectorized", 0)

    try:
        while True:
            with get_session() as session:
                # Vectorize all unvectorized bugs in this batch
                vectorized_count = BugVectorizerService.vectorize_no_vector_bug_reports(
                    session
                )

                total_vectorized += vectorized_count
                self.update_state(state={"total_vectorized": total_vectorized})

                if vectorized_count > 0:
                    continue

                # Check if fetcher is still running
                if not coordinator.is_fetcher_running():
                    break

                logger.info("Waiting for more bugs from fetcher...")
                time.sleep(5)

        coordinator.set_vectorizer_running(False)
        logger.info(
            f"Vectorization task completed. Total vectorized: {total_vectorized} bug reports."
        )
        return total_vectorized

    except Exception as e:
        logger.error(f"Error in vectorizer task: {e}")
        if self.request.retries >= self.max_retries:
            coordinator.set_vectorizer_running(False)
        raise self.retry(exc=e, countdown=30)
