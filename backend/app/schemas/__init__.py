"""Pydantic v2 API schemas.

API models serialize to camelCase (the frontend convention) while Python code
stays snake_case. LLM structured-output models live in `app.schemas.extraction`.
"""

from enum import StrEnum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class ExpenseCategory(StrEnum):
    SOFTWARE_SAAS = "Software & SaaS"
    CLOUD_INFRASTRUCTURE = "Cloud Infrastructure"
    OFFICE_FACILITIES = "Office & Facilities"
    MEALS_ENTERTAINMENT = "Meals & Entertainment"
    TRAVEL_TRANSPORT = "Travel & Transport"
    HARDWARE_EQUIPMENT = "Hardware & Equipment"
    MARKETING_ADS = "Marketing & Ads"
    PROFESSIONAL_SERVICES = "Professional Services"
    OTHER = "Other"


InvoiceStatus = Literal["validated", "needs_review"]
ChartType = Literal["bar", "line", "pie", "metric", "table"]


# --- Invoices -----------------------------------------------------------------


class LineItemRead(CamelModel):
    id: str
    description: str
    quantity: float
    unit_price: float
    amount: float


class InvoiceRead(CamelModel):
    id: str
    invoice_number: str
    vendor_name: str
    vendor_address: str | None = None
    date: str
    due_date: str | None = None
    currency: str
    subtotal: float
    tax: float
    total: float
    category: ExpenseCategory
    payment_method: str | None = None
    status: InvoiceStatus
    validation_warnings: list[str] = Field(default_factory=list)
    detected_pii: list[str] = Field(default_factory=list)
    file_name: str
    raw_text: str | None = None
    processing_time_ms: float
    line_items: list[LineItemRead] = Field(default_factory=list)


# --- Extraction ---------------------------------------------------------------


class PipelineStep(CamelModel):
    node: str
    status: Literal["completed", "flagged", "failed", "skipped"]
    message: str
    duration_ms: float


class ExtractionResponse(CamelModel):
    status: Literal["validated", "needs_review", "rejected"]
    invoice: InvoiceRead | None = None
    steps: list[PipelineStep]
    detected_pii: list[str] = Field(default_factory=list)
    validation_errors: list[str] = Field(default_factory=list)
    attempts: int


# --- Text-to-SQL --------------------------------------------------------------


class QueryRequest(CamelModel):
    question: str = Field(..., min_length=3, max_length=500)


class QueryResponse(CamelModel):
    question: str
    status: Literal["ok", "blocked", "error"]
    sql: str | None = None
    explanation: str
    columns: list[str] = Field(default_factory=list)
    rows: list[dict[str, Any]] = Field(default_factory=list)
    chart_type: ChartType = "table"
    metric_label: str | None = None
    metric_value: float | None = None
    violations: list[str] = Field(default_factory=list)
    attempts: int
    execution_time_ms: float


# --- Guardrails ---------------------------------------------------------------


class TextPayload(CamelModel):
    text: str = Field(..., max_length=20_000)


class SqlPayload(CamelModel):
    sql: str = Field(..., max_length=5_000)


class MathPayload(CamelModel):
    subtotal: float
    tax: float
    total: float


class PiiResult(CamelModel):
    text: str
    redacted_count: int
    detected_types: list[str]


class PromptInjectionResult(CamelModel):
    is_injection: bool
    flags: list[str]


class SqlGuardResult(CamelModel):
    is_safe: bool
    violations: list[str]
    normalized_sql: str | None = None


class MathCheckResult(CamelModel):
    is_valid: bool
    expected_total: float
    reported_total: float
    discrepancy: float
    details: str


# --- Evals --------------------------------------------------------------------


class EvalMetric(CamelModel):
    name: str
    score: float = Field(..., ge=0.0, le=1.0)
    threshold: float = Field(..., ge=0.0, le=1.0)
    passed: bool
    samples: int
    description: str


class EvalCaseResult(CamelModel):
    suite: str
    case: str
    expected: str
    actual: str
    passed: bool


class EvalReport(CamelModel):
    suite: str
    metrics: list[EvalMetric]
    cases: list[EvalCaseResult]
    duration_ms: float
