"""Schema creation and demo-data seeding."""

import json
import logging
from pathlib import Path
from typing import Any

from sqlalchemy import func, select

from app.db.models import Base, Invoice, LineItem
from app.db.session import Database

logger = logging.getLogger(__name__)

SEED_FILE = Path(__file__).with_name("seed_invoices.json")


def load_seed_invoices() -> list[dict[str, Any]]:
    return json.loads(SEED_FILE.read_text(encoding="utf-8"))


def init_db(db: Database, *, seed: bool) -> None:
    Base.metadata.create_all(db.engine)
    if not seed:
        return
    with db.session_factory.begin() as session:
        if session.scalar(select(func.count()).select_from(Invoice)):
            return
        for record in load_seed_invoices():
            items = record.pop("line_items")
            session.add(
                Invoice(
                    **record,
                    status="validated",
                    line_items=[LineItem(position=i, **item) for i, item in enumerate(items)],
                )
            )
    logger.info("Seeded demo invoices from %s", SEED_FILE.name)
