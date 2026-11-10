"""Structured-output schemas handed to the LLM (snake_case, no aliases)."""

from pydantic import BaseModel, Field

from app.schemas import ChartType, ExpenseCategory

DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"


class ExtractedLineItem(BaseModel):
    description: str = Field(..., min_length=1, description="Item or service description")
    quantity: float = Field(1.0, gt=0, description="Quantity purchased")
    unit_price: float = Field(..., description="Price per unit")
    amount: float = Field(..., description="Line total (quantity * unit_price)")


class InvoiceExtraction(BaseModel):
    """Fields extracted from a single invoice or receipt."""

    invoice_number: str = Field(..., min_length=1, description="Invoice or receipt reference number")
    vendor_name: str = Field(..., min_length=1, description="Merchant or vendor name")
    vendor_address: str | None = Field(None, description="Vendor postal address, if present")
    date: str = Field(..., pattern=DATE_PATTERN, description="Issue date formatted YYYY-MM-DD")
    due_date: str | None = Field(None, pattern=DATE_PATTERN, description="Due date formatted YYYY-MM-DD")
    currency: str = Field("USD", min_length=3, max_length=3, description="ISO-4217 currency code")
    subtotal: float = Field(..., ge=0, description="Amount before tax, after discounts")
    tax: float = Field(0.0, ge=0, description="Total tax / VAT / surcharge")
    total: float = Field(..., ge=0, description="Grand total payable")
    category: ExpenseCategory = Field(..., description="Best-fitting expense ledger category")
    payment_method: str | None = Field(
        None, description="Payment instrument, keeping any card masking exactly as written"
    )
    line_items: list[ExtractedLineItem] = Field(default_factory=list)


class SqlPlan(BaseModel):
    """A single read-only SQL query answering the user's question."""

    sql: str = Field(..., description="One SELECT statement (CTEs allowed). No comments, no trailing text.")
    explanation: str = Field(..., description="One or two sentences explaining what the query computes")
    chart_type: ChartType = Field(
        ...,
        description=(
            "metric: one row with a single numeric answer; bar/pie: label + numeric column; "
            "line: time series ordered by period; table: anything else"
        ),
    )
    metric_label: str | None = Field(None, description="Short label when chart_type is metric")
