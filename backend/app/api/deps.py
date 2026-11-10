"""FastAPI dependencies. Override these in tests via `app.dependency_overrides`."""

from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends
from langchain_core.language_models import BaseChatModel
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.llm import get_chat_model
from app.db.session import Database, get_database


def get_session(db: Annotated[Database, Depends(get_database)]) -> Iterator[Session]:
    with db.session_factory() as session:
        yield session


SettingsDep = Annotated[Settings, Depends(get_settings)]
DatabaseDep = Annotated[Database, Depends(get_database)]
SessionDep = Annotated[Session, Depends(get_session)]
ChatModelDep = Annotated[BaseChatModel, Depends(get_chat_model)]
