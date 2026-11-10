"""LangGraph Text-to-SQL agent.

START -> screen_question --(injection)--> END (blocked)
              |
              v
         generate_sql <------------------+
              |                          | retry with guardrail / DB error feedback
              v                          |
         guard_sql ----(unsafe)----------+--> END (blocked, attempts exhausted)
              |
              v
         execute_sql ---(db error)-------+--> END (error, attempts exhausted)
              |
              v
             END (ok)
"""

import time
from datetime import date
from typing import Any, Literal, TypedDict

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph
from sqlalchemy import Engine, text
from sqlalchemy.schema import CreateTable

from app.db.models import QUERYABLE_TABLES, Base
from app.schemas import ExpenseCategory, QueryResponse
from app.schemas.extraction import SqlPlan
from app.services.guardrails import detect_prompt_injection, validate_sql

SQL_SYSTEM_PROMPT = """You are a senior financial data analyst writing {dialect} SQL for InvoiceIQ.

Schema:
{schema}

Expense categories: {categories}

Rules:
- Write exactly ONE read-only SELECT statement (CTEs allowed). Never modify data.
- Only use the tables above. Dates are TEXT formatted YYYY-MM-DD; month = SUBSTR(date, 1, 7).
- Today is {today}. Resolve relative periods ("last quarter", "this year") using the most recent
  invoice date in the data when the question implies historical data.
- Alias aggregates with descriptive snake_case names (e.g. total_spent, invoice_count).
- Put the label column first and the main numeric column second for bar/pie charts.
- Order results meaningfully and add LIMIT {limit} unless the result is a single aggregate row."""


class SqlAgentState(TypedDict, total=False):
    question: str
    plan: SqlPlan | None
    sql: str | None
    violations: list[str]
    error: str | None
    attempts: int
    columns: list[str]
    rows: list[dict[str, Any]]
    status: Literal["ok", "blocked", "error"]


def describe_schema(engine: Engine) -> str:
    return "\n".join(
        str(CreateTable(table).compile(engine)).strip()
        for name, table in Base.metadata.tables.items()
        if name in QUERYABLE_TABLES
    )


def _execute_read_only(engine: Engine, sql: str, row_limit: int) -> tuple[list[str], list[dict[str, Any]]]:
    """Execute inside a transaction that the database itself enforces as read-only."""
    with engine.connect() as conn:
        dialect = engine.dialect.name
        if dialect == "sqlite":
            conn.exec_driver_sql("PRAGMA query_only = ON")
        elif dialect == "postgresql":
            conn.exec_driver_sql("SET TRANSACTION READ ONLY")
        try:
            result = conn.execute(text(sql))
            columns = list(result.keys())
            rows = [dict(zip(columns, row, strict=True)) for row in result.fetchmany(row_limit)]
            return columns, rows
        finally:
            conn.rollback()
            if dialect == "sqlite":
                conn.exec_driver_sql("PRAGMA query_only = OFF")


def build_sql_agent(
    llm: BaseChatModel,
    engine: Engine,
    *,
    max_attempts: int = 3,
    row_limit: int = 200,
) -> CompiledStateGraph:
    dialect = engine.dialect.name
    system_prompt = SQL_SYSTEM_PROMPT.format(
        dialect=dialect,
        schema=describe_schema(engine),
        categories=", ".join(f"'{c.value}'" for c in ExpenseCategory),
        today=date.today().isoformat(),
        limit=row_limit,
    )
    planner = llm.with_structured_output(SqlPlan)

    def screen_question(state: SqlAgentState) -> dict[str, Any]:
        verdict = detect_prompt_injection(state["question"])
        if verdict.is_injection:
            return {
                "status": "blocked",
                "violations": [f"Prompt injection detected: {flag}" for flag in verdict.flags],
            }
        return {"violations": []}

    def generate_sql(state: SqlAgentState) -> dict[str, Any]:
        messages = [SystemMessage(system_prompt), HumanMessage(state["question"])]
        previous = state.get("sql")
        if previous and (state.get("violations") or state.get("error")):
            problems = "\n".join(f"- {v}" for v in state.get("violations") or [state.get("error")])
            messages.append(
                HumanMessage(f"Your previous query was rejected:\n{previous}\nProblems:\n{problems}\nFix it.")
            )
        result = planner.invoke(messages)
        plan = result if isinstance(result, SqlPlan) else SqlPlan.model_validate(result)
        return {"plan": plan, "sql": plan.sql.strip(), "attempts": state.get("attempts", 0) + 1, "error": None}

    def guard_sql(state: SqlAgentState) -> dict[str, Any]:
        verdict = validate_sql(state["sql"] or "", QUERYABLE_TABLES, dialect=dialect)
        if verdict.is_safe:
            return {"violations": [], "sql": verdict.normalized_sql}
        return {"violations": verdict.violations, "status": "blocked"}

    def execute_sql(state: SqlAgentState) -> dict[str, Any]:
        try:
            columns, rows = _execute_read_only(engine, state["sql"] or "", row_limit)
        except Exception as exc:  # noqa: BLE001 - DB errors are fed back to the LLM
            return {"error": str(getattr(exc, "orig", exc)), "status": "error"}
        return {"columns": columns, "rows": rows, "status": "ok", "error": None}

    def after_screen(state: SqlAgentState) -> str:
        return END if state.get("status") == "blocked" else "generate_sql"

    def after_guard(state: SqlAgentState) -> str:
        if not state.get("violations"):
            return "execute_sql"
        return "generate_sql" if state.get("attempts", 0) < max_attempts else END

    def after_execute(state: SqlAgentState) -> str:
        if state.get("error") and state.get("attempts", 0) < max_attempts:
            return "generate_sql"
        return END

    builder = StateGraph(SqlAgentState)
    builder.add_node("screen_question", screen_question)
    builder.add_node("generate_sql", generate_sql)
    builder.add_node("guard_sql", guard_sql)
    builder.add_node("execute_sql", execute_sql)

    builder.add_edge(START, "screen_question")
    builder.add_conditional_edges("screen_question", after_screen, ["generate_sql", END])
    builder.add_edge("generate_sql", "guard_sql")
    builder.add_conditional_edges("guard_sql", after_guard, ["execute_sql", "generate_sql", END])
    builder.add_conditional_edges("execute_sql", after_execute, ["generate_sql", END])
    return builder.compile()


def answer_question(agent: CompiledStateGraph, question: str) -> QueryResponse:
    started = time.perf_counter()
    state: SqlAgentState = agent.invoke({"question": question, "attempts": 0})
    plan = state.get("plan")
    status = state.get("status", "error")
    rows = state.get("rows", [])
    columns = state.get("columns", [])

    chart_type = plan.chart_type if plan else "table"
    metric_value: float | None = None
    if status == "ok" and chart_type == "metric":
        numeric = [v for v in (rows[0].values() if len(rows) == 1 else []) if isinstance(v, int | float)]
        if numeric:
            metric_value = float(numeric[-1])
        else:
            chart_type = "table"

    if status == "ok":
        explanation = plan.explanation if plan else ""
    elif status == "blocked":
        explanation = "The request was blocked by the safety guardrails."
    else:
        explanation = f"The query failed to execute: {state.get('error')}"

    return QueryResponse(
        question=question,
        status=status,
        sql=state.get("sql"),
        explanation=explanation,
        columns=columns,
        rows=rows,
        chart_type=chart_type,
        metric_label=plan.metric_label if plan and metric_value is not None else None,
        metric_value=metric_value,
        violations=state.get("violations", []),
        attempts=state.get("attempts", 0),
        execution_time_ms=round((time.perf_counter() - started) * 1000, 2),
    )
