# InvoiceIQ

AI invoice and receipt intelligence:

- **Extraction Studio**: upload a PDF, image or text receipt. A LangGraph pipeline OCRs it, redacts PII, extracts a Pydantic-validated invoice, checks the math, retries with feedback, and stores the result.
- **Ask InvoiceIQ**: natural-language questions answered by a LangGraph Text-to-SQL agent. Generated SQL is AST-validated and runs on a read-only connection.
- **Guardrails**: PII redaction, prompt-injection screening, SQL validation and financial math checks, each with an interactive testbench.
- **Evals**: a deterministic guardrail suite gates CI; an LLM extraction suite scores field accuracy against annotated invoices.

| Layer    | Stack                                                                     |
| -------- | ------------------------------------------------------------------------- |
| Backend  | Python 3.13, **uv**, **FastAPI**, Pydantic v2, SQLAlchemy 2.0, sqlglot    |
| AI       | **LangChain** (`init_chat_model`, structured output), **LangGraph**       |
| Frontend | **Next.js** (App Router), **shadcn/ui**, **Tailwind CSS** v4, Recharts    |
| Tooling  | ruff, pytest, ESLint, Prettier, GitHub Actions                            |

```
backend/    FastAPI service (uv project) – see backend/README.md
frontend/   Next.js app – see frontend/README.md
```

## Quick start

Prerequisites: [uv](https://docs.astral.sh/uv/), Node.js 22+, and a Gemini API key (or any provider supported by `init_chat_model`).

```bash
cd backend
cp .env.example .env        # add GOOGLE_API_KEY
uv sync
uv run fastapi dev          # http://localhost:8000/docs
```

```bash
cd frontend
cp .env.example .env.local  # API_URL=http://localhost:8000
npm install
npm run dev                 # http://localhost:3000
```

The backend seeds nine sample invoices on first start. The ledger, guardrails and guardrail evals work without an API key. Extraction, Text-to-SQL and the extraction eval return `503` until a key is configured.

## Architecture

```
Browser ──► Next.js (Server Components + client islands)
              │  /api/v1/* rewrite (same origin, no CORS)
              ▼
           FastAPI ──► LangGraph extraction graph ──► SQLAlchemy (SQLite / Postgres)
                   └─► LangGraph Text-to-SQL graph ──► read-only connection
```

The **Architecture** page in the app describes both graphs and the main design decisions.
