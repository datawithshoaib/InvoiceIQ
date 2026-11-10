"""FastAPI application entrypoint (`uv run fastapi dev`)."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import evals, extraction, guardrails, invoices, query
from app.core.config import get_settings
from app.core.llm import LLMNotConfiguredError
from app.db.seed import init_db
from app.db.session import get_database


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    db = app.dependency_overrides.get(get_database, get_database)()
    init_db(db, seed=settings.seed_sample_data)
    yield
    db.engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    logging.basicConfig(level=settings.log_level)

    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="Invoice extraction (LangGraph), guarded Text-to-SQL analytics, guardrails and evals.",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["*"],
    )

    @app.exception_handler(LLMNotConfiguredError)
    async def llm_not_configured(_: Request, exc: LLMNotConfiguredError) -> JSONResponse:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"detail": str(exc)})

    @app.get("/health", tags=["Health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    api = APIRouter(prefix="/api/v1")
    for module in (invoices, extraction, query, guardrails, evals):
        api.include_router(module.router)
    app.include_router(api)
    return app


app = create_app()
