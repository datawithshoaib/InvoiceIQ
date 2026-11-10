"""SQLAlchemy 2.0 ORM models."""

from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    invoice_number: Mapped[str] = mapped_column(String(128), index=True)
    vendor_name: Mapped[str] = mapped_column(String(256), index=True)
    vendor_address: Mapped[str | None] = mapped_column(String(512))
    date: Mapped[str] = mapped_column(String(10), index=True, comment="YYYY-MM-DD")
    due_date: Mapped[str | None] = mapped_column(String(10))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    subtotal: Mapped[float] = mapped_column(Float)
    tax: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float)
    category: Mapped[str] = mapped_column(String(64), index=True)
    payment_method: Mapped[str | None] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(32), default="validated", comment="validated | needs_review")
    validation_warnings: Mapped[list[str]] = mapped_column(JSON, default=list)
    detected_pii: Mapped[list[str]] = mapped_column(JSON, default=list)
    file_name: Mapped[str] = mapped_column(String(256))
    raw_text: Mapped[str | None] = mapped_column(Text)
    processing_time_ms: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    line_items: Mapped[list["LineItem"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan", lazy="selectin", order_by="LineItem.position"
    )


class LineItem(Base):
    __tablename__ = "line_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    invoice_id: Mapped[str] = mapped_column(ForeignKey("invoices.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(default=0)
    description: Mapped[str] = mapped_column(String(512))
    quantity: Mapped[float] = mapped_column(Float, default=1.0)
    unit_price: Mapped[float] = mapped_column(Float)
    amount: Mapped[float] = mapped_column(Float)

    invoice: Mapped[Invoice] = relationship(back_populates="line_items")


# Tables the Text-to-SQL agent is allowed to read.
QUERYABLE_TABLES = frozenset({Invoice.__tablename__, LineItem.__tablename__})
