# InvoiceIQ backend

FastAPI service with two LangGraph agents (invoice extraction and Text-to-SQL), deterministic guardrails, and eval suites. Managed with **uv**.

## Setup

```bash
cp .env.example .env     # set GOOGLE_API_KEY (or switch LLM_MODEL, see below)
uv sync                  # creates .venv from uv.lock
uv run fastapi dev       # http://localhost:8000/docs
```

### Choosing a model

`LLM_MODEL` accepts any `provider:model` string supported by LangChain's `init_chat_model`. The default is `google_genai:gemini-2.5-flash`. For OpenAI:

```bash
uv sync --extra openai
# .env: LLM_MODEL=openai:gpt-4.1-mini and OPENAI_API_KEY=...
```

## Commands

| Task                              | Command                                     |
| --------------------------------- | ------------------------------------------- |
| Dev server (reload)               | `uv run fastapi dev`                        |
| Tests                             | `uv run pytest`                             |
| Lint / format                     | `uv run ruff check . && uv run ruff format .` |
| Guardrail eval (CI gate, no LLM)  | `uv run python -m app.evals guardrails`     |
| Extraction eval (LLM calls)       | `uv run python -m app.evals extraction --limit 5` |
| Add a dependency                  | `uv add <package>` / `uv add --dev <package>` |
| Docker                            | `docker build -t invoiceiq-api . && docker run -p 8000:8000 --env-file .env invoiceiq-api` |

## Layout

```
app/
  main.py               app factory, lifespan (create tables + seed), routers, 503 handler
  core/config.py        pydantic-settings (env / .env)
  core/llm.py           init_chat_model factory
  db/                   SQLAlchemy 2.0 models, Database wiring, seed data
  schemas/              API models (camelCase JSON) and LLM structured-output models
  services/guardrails.py PII redaction, prompt-injection, sqlglot SQL guard, math checks
  agents/extraction.py  LangGraph: ingest → guardrails → extract ⇄ validate → persist
  agents/sql_agent.py   LangGraph: screen → generate ⇄ guard → execute (read-only)
  evals/                eval suites + CLI
  api/                  dependencies and route modules
tests/                  pytest; agents run against a scripted fake chat model
```

## API

| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| GET    | `/health`                    | Liveness                                     |
| GET    | `/api/v1/invoices`           | List invoices                                |
| GET    | `/api/v1/invoices/{id}`      | Invoice detail                               |
| DELETE | `/api/v1/invoices/{id}`      | Delete an invoice                            |
| POST   | `/api/v1/extract`            | Multipart `file` (PDF/image/text) or `text`  |
| POST   | `/api/v1/query`              | `{ "question": "..." }` → SQL + rows + chart |
| POST   | `/api/v1/guardrails/{pii,prompt,sql,math}` | Individual guardrails          |
| POST   | `/api/v1/evals/guardrails`   | Deterministic guardrail suite                |
| POST   | `/api/v1/evals/extraction`   | LLM extraction suite (`?limit=3`)            |
