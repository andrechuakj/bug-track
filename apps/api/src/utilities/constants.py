from dotenv import find_dotenv, load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

dotenv_path = find_dotenv(".env.local") or ".env.local"
load_dotenv(dotenv_path)


class _Constants(BaseSettings, frozen=True):
    model_config = SettingsConfigDict(env_file=".env.local")
    DATABASE_URL: str
    OPENAI_API_KEY: str
    MODE: str = "production"

    @property
    def IS_DEVELOPMENT(self) -> bool:
        return self.MODE == "development"


constants = _Constants()

# Only export the constants object
__all__ = ["constants"]
