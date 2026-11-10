"""Application settings loaded from environment variables / `.env`."""

from functools import lru_cache
from typing import Annotated

from pydantic import AliasChoices, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "InvoiceIQ API"
    environment: str = "development"
    log_level: str = "INFO"

    database_url: str = "sqlite:///./invoiceiq.db"
    seed_sample_data: bool = True

    # Comma-separated list in the environment, e.g. "http://localhost:3000,https://app.example.com".
    cors_origins: Annotated[list[str], NoDecode] = Field(default_factory=lambda: ["http://localhost:3000"])

    # Any `provider:model` string understood by `langchain.chat_models.init_chat_model`.
    llm_model: str = "google_genai:gemini-2.5-flash"
    llm_temperature: float = 0.0
    google_api_key: SecretStr | None = Field(
        default=None, validation_alias=AliasChoices("GOOGLE_API_KEY", "GEMINI_API_KEY")
    )
    openai_api_key: SecretStr | None = None

    max_extraction_attempts: int = Field(default=3, ge=1, le=5)
    max_sql_attempts: int = Field(default=3, ge=1, le=5)
    sql_row_limit: int = Field(default=200, ge=1, le=5000)
    max_upload_bytes: int = 10 * 1024 * 1024

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_csv(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
