from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage
from langchain_core.runnables import RunnableLambda
from pydantic import BaseModel
from sqlalchemy.pool import StaticPool

from app.core.llm import get_chat_model
from app.db.seed import init_db
from app.db.session import Database, get_database
from app.main import create_app


class ScriptedChatModel:
    """Minimal stand-in for a LangChain chat model.

    `structured` maps a schema class to a queue of responses (pydantic instances,
    dicts, or exceptions) returned by `with_structured_output(schema).invoke()`.
    """

    def __init__(self, structured: dict[type[BaseModel], list[Any]] | None = None, text: str = "") -> None:
        self.structured = structured or {}
        self.text = text
        self.calls: list[tuple[str, Any]] = []

    def with_structured_output(self, schema: type[BaseModel]) -> RunnableLambda:
        def respond(messages: Any) -> Any:
            self.calls.append((schema.__name__, messages))
            response = self.structured[schema].pop(0)
            if isinstance(response, Exception):
                raise response
            return response

        return RunnableLambda(respond)

    def invoke(self, messages: Any) -> AIMessage:
        self.calls.append(("invoke", messages))
        return AIMessage(content=self.text)


@pytest.fixture
def db() -> Iterator[Database]:
    database = Database.from_url("sqlite://", poolclass=StaticPool)
    init_db(database, seed=True)
    yield database
    database.engine.dispose()


@pytest.fixture
def make_client(db: Database) -> Iterator[Any]:
    clients: list[TestClient] = []

    def factory(llm: ScriptedChatModel | None = None) -> TestClient:
        app = create_app()
        app.dependency_overrides[get_database] = lambda: db
        if llm is not None:
            app.dependency_overrides[get_chat_model] = lambda: llm
        client = TestClient(app)
        client.__enter__()
        clients.append(client)
        return client

    yield factory
    for client in clients:
        client.__exit__(None, None, None)
