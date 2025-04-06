import threading

from configuration.logger import get_logger

logger = get_logger()


class TaskCoordinator:
    """
    Simple coordinator class to manage shared state between Celery tasks.
    Uses a singleton pattern to ensure consistent state across imports.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(TaskCoordinator, cls).__new__(cls)
                cls._instance._scraper_running = False
                cls._instance._classifier_running = False
            return cls._instance

    def set_scraper_running(self, value):
        """Set the scraper running state."""
        self._scraper_running = value

    def is_scraper_running(self):
        """Check if the scraper is currently running."""
        return self._scraper_running

    def set_classifier_running(self, value):
        """Set the classifier running state."""
        self._classifier_running = value

    def is_classifier_running(self):
        """Check if the classifier is already running."""
        return self._classifier_running
