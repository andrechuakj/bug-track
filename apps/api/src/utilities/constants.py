from pydantic_settings import BaseSettings, SettingsConfigDict


class _Constants(BaseSettings, frozen=True):
    model_config = SettingsConfigDict(env_file=".env.local")
    DATABASE_URL: str
    OPENAI_API_KEY: str
    JWT_SECRET_KEY: str
    MODE: str = "production"

    @property
    def IS_DEVELOPMENT(self) -> bool:
        return self.MODE == "development"


constants = _Constants()

# Only export the constants object
__all__ = ["constants"]
