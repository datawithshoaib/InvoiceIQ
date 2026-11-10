"""
SQLAlchemy Database Models and Engine for InvoiceIQ
Provides ORM mapping for SQLite / PostgreSQL instances.
"""

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import datetime

Base = declarative_base()


class InvoiceModel(Base):
    __tablename__ = "invoices"

    id = Column(String(64), primary_key=True)
    invoice_number = Column(String(128), index=True, nullable=False)
    vendor_name = Column(String(256), index=True, nullable=False)
    vendor_address = Column(String(512), nullable=True)
    date = Column(String(32), index=True, nullable=False)
    due_date = Column(String(32), nullable=True)
    currency = Column(String(8), default="USD", nullable=False)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    category = Column(String(128), index=True, nullable=False)
    payment_method = Column(String(128), default="Credit Card")
    confidence_score = Column(Float, default=1.0)
    raw_ocr_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    line_items = relationship("LineItemModel", back_populates="invoice", cascade="all, delete-orphan")


class LineItemModel(Base):
    __tablename__ = "line_items"

    id = Column(String(64), primary_key=True)
    invoice_id = Column(String(64), ForeignKey("invoices.id"), nullable=False)
    description = Column(String(512), nullable=False)
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(128), nullable=True)

    invoice = relationship("InvoiceModel", back_populates="line_items")


# Default SQLite DB engine for local dev and testing
DATABASE_URL = "sqlite:///./invoiceiq.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)
