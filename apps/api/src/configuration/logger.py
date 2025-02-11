import logging
from contextlib import contextmanager
from logging import Logger, getLogger

from fastapi import FastAPI
from utilities.constants import constants

_logger: Logger = None


def get_logger():
    if _logger is None:
        raise ValueError('Logger has not been configured.')
    return _logger


@contextmanager
def configure_logger(app: FastAPI):
    '''
    Configures the logger for the application.
    Must be done as a lifecycle event as the logger
    is not available until the application is running,
    when in production mode.
    '''
    global _logger
    # To view all loggers, use logging.root.manager.loggerDict
    _logger = getLogger('uvicorn')
    _logger.info(f'Configuring logger for application: {app.title}')
    if constants.IS_DEVELOPMENT:
        _logger.setLevel(logging.DEBUG)
        _logger.debug('Running in development mode')
    else:
        _logger.setLevel(logging.INFO)
    yield


__all__ = ['configure_logger', 'get_logger']
