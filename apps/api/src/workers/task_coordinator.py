import threading


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
                cls._instance._fetcher_running = False
                cls._instance._classifier_running = False
            return cls._instance

    def set_fetcher_running(self, value):
        """Set the fetcher running state."""
        self._fetcher_running = value

    def is_fetcher_running(self):
        """Check if the fetcher is currently running."""
        return self._fetcher_running

    def set_classifier_running(self, value):
        """Set the classifier running state."""
        self._classifier_running = value

    def is_classifier_running(self):
        """Check if the classifier is already running."""
        return self._classifier_running
