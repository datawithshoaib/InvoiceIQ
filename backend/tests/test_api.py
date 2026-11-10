from app.schemas import ExpenseCategory
from app.schemas.extraction import InvoiceExtraction, SqlPlan
from tests.conftest import ScriptedChatModel


def test_health(make_client) -> None:
    assert make_client().get("/health").json() == {"status": "ok"}


def test_list_and_get_invoices_use_camel_case(make_client) -> None:
    client = make_client()
    invoices = client.get("/api/v1/invoices").json()
    assert len(invoices) == 9
    first = invoices[0]
    assert {"vendorName", "invoiceNumber", "lineItems", "status"} <= first.keys()
    assert client.get(f"/api/v1/invoices/{first['id']}").json()["id"] == first["id"]
    assert client.get("/api/v1/invoices/missing").status_code == 404


def test_extract_from_text(make_client) -> None:
    extraction = InvoiceExtraction(
        invoice_number="R-1",
        vendor_name="Blue Bottle",
        date="2024-10-02",
        subtotal=10.0,
        tax=0.8,
        total=10.8,
        category=ExpenseCategory.MEALS_ENTERTAINMENT,
    )
    client = make_client(ScriptedChatModel({InvoiceExtraction: [extraction]}))

    response = client.post("/api/v1/extract", data={"text": "Blue Bottle receipt R-1 total 10.80"})

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "validated"
    assert body["invoice"]["vendorName"] == "Blue Bottle"
    assert [s["node"] for s in body["steps"]] == ["ingest", "guardrails", "extract", "validate", "persist"]
    assert len(client.get("/api/v1/invoices").json()) == 10


def test_extract_requires_content(make_client) -> None:
    assert make_client(ScriptedChatModel()).post("/api/v1/extract", data={"text": "  "}).status_code == 422


def test_extract_rejects_unsupported_file(make_client) -> None:
    client = make_client(ScriptedChatModel())
    files = {"file": ("x.zip", b"PK..", "application/zip")}
    assert client.post("/api/v1/extract", files=files).status_code == 415


def test_query_endpoint(make_client) -> None:
    plan = SqlPlan(
        sql=(
            "SELECT vendor_name, SUM(total) AS total_spent FROM invoices "
            "GROUP BY vendor_name ORDER BY total_spent DESC LIMIT 3"
        ),
        explanation="Top vendors.",
        chart_type="bar",
    )
    client = make_client(ScriptedChatModel({SqlPlan: [plan]}))

    body = client.post("/api/v1/query", json={"question": "Top 3 vendors?"}).json()

    assert body["status"] == "ok"
    assert body["chartType"] == "bar"
    assert body["rows"][0]["vendor_name"] == "Apple Store Inc."


def test_llm_endpoints_return_503_without_credentials(make_client, monkeypatch) -> None:
    from app.core import llm as llm_module
    from app.core.config import Settings

    monkeypatch.setattr(llm_module, "get_settings", lambda: Settings(google_api_key=None, _env_file=None))
    llm_module.get_chat_model.cache_clear()
    try:
        response = make_client().post("/api/v1/query", json={"question": "Total spend?"})
    finally:
        llm_module.get_chat_model.cache_clear()
    assert response.status_code == 503
    assert "GOOGLE_API_KEY" in response.json()["detail"]


def test_guardrail_endpoints(make_client) -> None:
    client = make_client()
    assert client.post("/api/v1/guardrails/sql", json={"sql": "DROP TABLE invoices"}).json()["isSafe"] is False
    pii = client.post("/api/v1/guardrails/pii", json={"text": "SSN 123-45-6789"}).json()
    assert pii["text"] == "SSN [REDACTED_SSN]"
    assert client.post("/api/v1/guardrails/prompt", json={"text": "hello"}).json()["isInjection"] is False
    math = client.post("/api/v1/guardrails/math", json={"subtotal": 1, "tax": 1, "total": 3}).json()
    assert math["isValid"] is False


def test_guardrail_eval_endpoint(make_client) -> None:
    report = make_client().post("/api/v1/evals/guardrails").json()
    assert report["suite"] == "guardrails"
    assert all(m["passed"] for m in report["metrics"])
