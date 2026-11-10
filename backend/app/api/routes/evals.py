from typing import Annotated

from fastapi import APIRouter, Query
from starlette.concurrency import run_in_threadpool

from app.api.deps import ChatModelDep
from app.evals.suites import run_extraction_suite, run_guardrail_suite
from app.schemas import EvalReport

router = APIRouter(prefix="/evals", tags=["Evaluations"])


@router.post("/guardrails", response_model=EvalReport)
def evaluate_guardrails() -> EvalReport:
    """Deterministic guardrail benchmark (no LLM calls)."""
    return run_guardrail_suite()


@router.post("/extraction", response_model=EvalReport)
async def evaluate_extraction(llm: ChatModelDep, limit: Annotated[int, Query(ge=1, le=50)] = 3) -> EvalReport:
    """Run the extraction pipeline against annotated invoices (makes LLM calls)."""
    return await run_in_threadpool(run_extraction_suite, llm, limit=limit)
