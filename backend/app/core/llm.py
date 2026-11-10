"""Chat model factory built on LangChain's provider-agnostic `init_chat_model`."""

from functools import lru_cache

from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel

from app.core.config import get_settings


class LLMNotConfiguredError(RuntimeError):
    """Raised when an endpoint needs an LLM but no credentials are configured."""


@lru_cache
def get_chat_model() -> BaseChatModel:
    settings = get_settings()
    provider = settings.llm_model.split(":", 1)[0] if ":" in settings.llm_model else ""
    kwargs: dict[str, object] = {"temperature": settings.llm_temperature}

    if provider == "google_genai":
        if settings.google_api_key is None:
            raise LLMNotConfiguredError("Set GOOGLE_API_KEY (or GEMINI_API_KEY) to enable LLM features.")
        kwargs["google_api_key"] = settings.google_api_key.get_secret_value()
    elif provider == "openai":
        if settings.openai_api_key is None:
            raise LLMNotConfiguredError("Set OPENAI_API_KEY to enable LLM features.")
        kwargs["api_key"] = settings.openai_api_key.get_secret_value()

    return init_chat_model(settings.llm_model, **kwargs)
