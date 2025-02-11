from contextlib import contextmanager

from configuration.logger import get_logger
from fastapi import FastAPI
from utilities.constants import constants


@contextmanager
def configure_startup_info(app: FastAPI):
    logger = get_logger()
    if not constants.IS_DEVELOPMENT:
        logger.info('Running in production mode')
    else:
        logger.debug('============= STARTUP INFORMATION =============')
        logger.debug(f'Mode: {constants.MODE}')
        logger.debug('===============================================')
    yield


__all__ = ['configure_startup_info']
