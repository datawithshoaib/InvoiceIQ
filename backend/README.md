# InvoiceIQ - FastAPI & LangGraph Backend Service

Enterprise-grade microservice for multi-modal document extraction, LangGraph state machine routing, Pydantic v2 validation, Text-to-SQL financial intelligence, NeMo Guardrails, and Ragas Evaluations.

## Tech Stack
- **Framework**: FastAPI (Python 3.10+) & Uvicorn
- **AI Agent Framework**: LangChain & LangGraph (StateGraph with checkpointers and conditional edges)
- **Validation**: Pydantic v2 (strict model validators, financial math consistency)
- **Database & ORM**: SQLAlchemy & SQLite / PostgreSQL
- **Safety**: Guardrails Engine (PII masking with PCI-DSS regex, SQL AST validator, prompt injection filter)
- **Evaluations**: Benchmark test runner measuring Field Accuracy, Categorization F1, SQL Execution Accuracy, and Hallucination rate

## Getting Started

### 1. Setup Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file:
```env
OPENAI_API_KEY="your-openai-api-key"
# or
GEMINI_API_KEY="your-gemini-api-key"
DATABASE_URL="sqlite:///./invoiceiq.db"
```

### 3. Run FastAPI Dev Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
API Documentation will be live at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 4. Run Docker Container
```bash
docker build -t invoiceiq-backend .
docker run -p 8000:8000 invoiceiq-backend
```
