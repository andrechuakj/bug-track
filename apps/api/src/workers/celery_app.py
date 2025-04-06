import os
import threading

from celery import Celery
from celery.apps.beat import Beat
from celery.apps.worker import Worker
from celery.schedules import crontab
from configuration.logger import get_logger
from utilities.constants import constants

celery_app = Celery("tasks", broker=constants.REDIS_BROKER_URL)

celery_app.conf.update(
    task_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_pool="solo" if os.name == "nt" else "prefork",
    imports=["workers.issues_scraper_worker"],
)


def start_worker():
    logger = get_logger()
    try:
        worker = Worker(app=celery_app, loglevel="info")
        worker.start()
    except Exception as e:
        logger.error(f"Worker failed: {e}")
        raise


def start_beat():
    logger = get_logger()
    try:
        beat = Beat(app=celery_app, loglevel="info")
        beat.run()
    except Exception as e:
        logger.error(f"Beat failed: {e}")
        raise


def setup_beat_schedule():
    from workers.issues_scraper_worker import fetch_github_issues_task

    celery_app.conf.beat_schedule = {
        "fetch-github-issues": {
            "task": fetch_github_issues_task.name,
            "schedule": crontab(
                minute=constants.CELERY_BEAT_SCHEDULE.split()[0],
                hour=constants.CELERY_BEAT_SCHEDULE.split()[1],
            ),
        },
    }


def start_celery_workers():
    logger = get_logger()
    logger.info("Starting Celery workers and beat")
    try:
        worker_thread = threading.Thread(target=start_worker, daemon=True)
        worker_thread.start()
        logger.info("Celery worker started successfully")

        setup_beat_schedule()
        beat_thread = threading.Thread(target=start_beat, daemon=True)
        beat_thread.start()
        logger.info("Celery beat started successfully")

    except KeyboardInterrupt:
        logger.info("Stopping Celery workers and beat")
        raise
    except Exception as e:
        logger.error(f"Error starting Celery workers and beat: {e}")
        raise
