"""Engine / session wiring, exposed to FastAPI through a single dependency."""

from collections.abc import Iterator
from dataclasses import dataclass
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


@dataclass(frozen=True)
class Database:
    engine: Engine
    session_factory: sessionmaker[Session]

    @classmethod
    def from_url(cls, url: str, **engine_kwargs: object) -> "Database":
        if url.startswith("sqlite"):
            engine_kwargs.setdefault("connect_args", {"check_same_thread": False})
        engine = create_engine(url, **engine_kwargs)
        return cls(engine=engine, session_factory=sessionmaker(engine, expire_on_commit=False))

    @property
    def dialect(self) -> str:
        return self.engine.dialect.name


@lru_cache
def get_database() -> Database:
    return Database.from_url(get_settings().database_url)


def session_scope(db: Database) -> Iterator[Session]:
    with db.session_factory() as session:
        yield session
