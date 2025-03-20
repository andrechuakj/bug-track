from logging import Logger

from configuration.logger import get_logger


class Service:
    """Base class for all services. Provides a logger property."""

    _logger_initialized = False
    _logger = None

    @property
    def logger(self) -> Logger:
        if not self._logger_initialized:
            clazz = self.__class__.__name__
            self._logger = get_logger().getChild(clazz)
            self._logger.info(f"Initializing logger for service {clazz}")
            self._logger_initialized = True
        return self._logger
