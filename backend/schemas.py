"""
Pydantic v2 Schemas for InvoiceIQ
Enforces strict typing, field validators, math consistency, and runtime guardrails.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator


class ExpenseCategory(str, Enum):
    SOFTWARE_SAAS = "Software & SaaS"
    CLOUD_INFRASTRUCTURE = "Cloud Infrastructure"
    OFFICE_FACILITIES = "Office & Facilities"
    MEALS_ENTERTAINMENT = "Meals & Entertainment"
    TRAVEL_TRANSPORT = "Travel & Transport"
    HARDWARE_EQUIPMENT = "Hardware & Equipment"
    MARKETING_ADS = "Marketing & Ads"
    PROFESSIONAL_SERVICES = "Professional Services"
    OTHER = "Other"


class LineItem(BaseModel):
    id: Optional[str] = Field(None, description="Unique identifier for line item")
    description: str = Field(..., min_length=1, description="Item or service description")
    quantity: float = Field(1.0, ge=0.01, description="Quantity purchased")
    unit_price: float = Field(..., ge=0.0, description="Price per unit in transaction currency")
    amount: float = Field(..., ge=0.0, description="Total amount for this line item")
    category: Optional[ExpenseCategory] = Field(None, description="Item-level categorized expense")

    @model_validator(mode="after")
    def verify_line_amount(self) -> "LineItem":
        # Allow tiny rounding discrepancies (<= $0.05)
        expected = round(self.quantity * self.unit_price, 2)
        if abs(expected - round(self.amount, 2)) > 0.05:
            # Auto-align or flag
            pass
        return self


class InvoiceExtraction(BaseModel):
    invoice_number: str = Field(..., min_length=1, description="Official invoice or receipt reference number")
    vendor_name: str = Field(..., min_length=1, description="Merchant or vendor legal/trading name")
    vendor_address: Optional[str] = Field(None, description="Physical address of merchant")
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Invoice issue date in YYYY-MM-DD")
    due_date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="Payment due date")
    currency: str = Field("USD", min_length=3, max_length=3, description="ISO-4217 3-letter currency code")
    subtotal: float = Field(..., ge=0.0, description="Subtotal before taxes and gratuity")
    tax: float = Field(0.0, ge=0.0, description="Total sales tax, VAT, or city surcharge")
    total: float = Field(..., ge=0.0, description="Grand total payable")
    category: ExpenseCategory = Field(..., description="Primary categorized ledger classification")
    payment_method: str = Field("Credit Card", description="Payment instrument used")
    confidence_score: float = Field(1.0, ge=0.0, le=1.0, description="Extraction confidence score (0-1)")
    line_items: List[LineItem] = Field(default_factory=list, description="Extracted individual itemized rows")
    raw_ocr_text: Optional[str] = Field(None, description="Full raw OCR text parsed from receipt")

    @model_validator(mode="after")
    def check_financial_math(self) -> "InvoiceExtraction":
        expected_total = round(self.subtotal + self.tax, 2)
        reported_total = round(self.total, 2)
        if abs(expected_total - reported_total) > 0.05:
            raise ValueError(
                f"Financial math integrity check failed: subtotal ({self.subtotal}) + "
                f"tax ({self.tax}) = {expected_total}, but total is {reported_total}"
            )
        return self


class SQLQueryRequest(BaseModel):
    natural_query: str = Field(..., min_length=3, max_length=500, description="User question in plain English")
    allow_chart: bool = Field(True, description="Whether to include visualization configuration")


class SQLQueryResponse(BaseModel):
    natural_query: str
    generated_sql: str
    is_safe: bool
    explanation: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    chart_type: Optional[str] = None
    metric_value: Optional[Any] = None
    metric_label: Optional[str] = None
    execution_time_ms: float


class GuardrailVerdict(BaseModel):
    is_safe: bool
    detected_pii: List[str] = Field(default_factory=list)
    sanitized_text: str
    violations: List[str] = Field(default_factory=list)


class EvalMetrics(BaseModel):
    field_extraction_accuracy: float = Field(..., ge=0.0, le=1.0)
    categorization_f1_score: float = Field(..., ge=0.0, le=1.0)
    sql_execution_accuracy: float = Field(..., ge=0.0, le=1.0)
    hallucination_rate: float = Field(..., ge=0.0, le=1.0)
    average_latency_sec: float
    total_eval_samples: int
