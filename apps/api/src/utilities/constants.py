import os

from pydantic import RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class _Constants(BaseSettings, frozen=True):
    model_config = SettingsConfigDict(env_file=".env.local")
    DATABASE_URL: str
    OPENAI_API_KEY: str
    JWT_SECRET_KEY: str
    MODE: str = "production"
    GITHUB_TOKEN: str
    REDIS_BROKER_URL: RedisDsn
    CELERY_BEAT_SCHEDULE: str
    FRONTEND_ALLOWED_ORIGINS: set[str] = set()

    def __init__(self):
        # TODO: Investigate if there is a better way
        if os.getenv("MODE") == "test":
            # Skip environment variable validation in test mode
            return
        super().__init__()

    @property
    def IS_DEVELOPMENT(self) -> bool:
        return self.MODE == "development"


constants = _Constants()

# Only export the constants object
__all__ = ["constants"]
