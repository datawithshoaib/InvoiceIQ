import io
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pypdf import PdfReader
from pypdf.errors import PdfReadError
from starlette.concurrency import run_in_threadpool

from app.agents.extraction import ExtractionInput, build_extraction_graph, image_to_data_url, run_extraction
from app.api.deps import ChatModelDep, DatabaseDep, SessionDep, SettingsDep
from app.db.models import Invoice
from app.schemas import ExtractionResponse, InvoiceRead, PipelineStep

router = APIRouter(prefix="/extract", tags=["Extraction"])

IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}
TEXT_TYPES = {"text/plain", "text/csv", "text/markdown"}


def _pdf_text(data: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(data))
    except PdfReadError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, f"Unreadable PDF: {exc}") from exc
    return "\n".join(page.extract_text() or "" for page in reader.pages).strip()


@router.post("", response_model=ExtractionResponse)
async def extract_invoice(
    llm: ChatModelDep,
    db: DatabaseDep,
    session: SessionDep,
    settings: SettingsDep,
    file: Annotated[UploadFile | None, File(description="PDF, image or text invoice")] = None,
    text: Annotated[str | None, Form(max_length=50_000, description="Raw invoice text")] = None,
) -> ExtractionResponse:
    """Run the LangGraph extraction pipeline on an uploaded file or pasted text."""
    payload: ExtractionInput = {"file_name": "pasted-text.txt", "raw_text": (text or "").strip()}

    if file is not None and file.filename:
        data = await file.read(settings.max_upload_bytes + 1)
        if len(data) > settings.max_upload_bytes:
            raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, "File is too large")
        content_type = (file.content_type or "").split(";")[0]
        payload["file_name"] = file.filename
        if content_type == "application/pdf" or file.filename.lower().endswith(".pdf"):
            payload["raw_text"] = _pdf_text(data)
            if not payload["raw_text"]:
                raise HTTPException(
                    status.HTTP_422_UNPROCESSABLE_CONTENT, "PDF has no text layer; upload an image of it instead."
                )
        elif content_type in IMAGE_TYPES:
            payload["image_data_url"] = image_to_data_url(data, content_type)
            payload["raw_text"] = ""
        elif content_type in TEXT_TYPES:
            payload["raw_text"] = data.decode("utf-8", errors="replace").strip()
        else:
            raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, f"Unsupported file type: {content_type}")

    if not payload.get("raw_text") and not payload.get("image_data_url"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Provide a file or invoice text")

    graph = build_extraction_graph(llm, db.session_factory, max_attempts=settings.max_extraction_attempts)
    # LangGraph's sync invoke runs the (blocking) LLM calls; keep it off the event loop.
    state = await run_in_threadpool(run_extraction, graph, payload)

    invoice_id = state.get("invoice_id")
    invoice = session.get(Invoice, invoice_id) if invoice_id else None
    return ExtractionResponse(
        status=state.get("status", "rejected"),
        invoice=InvoiceRead.model_validate(invoice) if invoice else None,
        steps=[PipelineStep.model_validate(step) for step in state.get("steps", [])],
        detected_pii=state.get("detected_pii", []),
        validation_errors=[*state.get("validation_errors", []), *state.get("injection_flags", [])],
        attempts=state.get("attempts", 0),
    )
