from fastapi import APIRouter

from app.api.deps import DatabaseDep
from app.db.models import QUERYABLE_TABLES
from app.schemas import (
    MathCheckResult,
    MathPayload,
    PiiResult,
    PromptInjectionResult,
    SqlGuardResult,
    SqlPayload,
    TextPayload,
)
from app.services import guardrails

router = APIRouter(prefix="/guardrails", tags=["Guardrails"])


@router.post("/pii", response_model=PiiResult)
def redact_pii(payload: TextPayload) -> PiiResult:
    return guardrails.redact_pii(payload.text)


@router.post("/prompt", response_model=PromptInjectionResult)
def check_prompt(payload: TextPayload) -> PromptInjectionResult:
    return guardrails.detect_prompt_injection(payload.text)


@router.post("/sql", response_model=SqlGuardResult)
def check_sql(payload: SqlPayload, db: DatabaseDep) -> SqlGuardResult:
    return guardrails.validate_sql(payload.sql, QUERYABLE_TABLES, dialect=db.dialect)


@router.post("/math", response_model=MathCheckResult)
def check_math(payload: MathPayload) -> MathCheckResult:
    return guardrails.check_invoice_math(payload.subtotal, payload.tax, payload.total)
