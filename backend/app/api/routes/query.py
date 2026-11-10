from fastapi import APIRouter

from app.agents.sql_agent import answer_question, build_sql_agent
from app.api.deps import ChatModelDep, DatabaseDep, SettingsDep
from app.schemas import QueryRequest, QueryResponse

router = APIRouter(prefix="/query", tags=["Text-to-SQL"])


@router.post("", response_model=QueryResponse)
def query_financial_data(
    request: QueryRequest, llm: ChatModelDep, db: DatabaseDep, settings: SettingsDep
) -> QueryResponse:
    """Answer a natural-language question with guarded, read-only SQL."""
    agent = build_sql_agent(llm, db.engine, max_attempts=settings.max_sql_attempts, row_limit=settings.sql_row_limit)
    return answer_question(agent, request.question)
