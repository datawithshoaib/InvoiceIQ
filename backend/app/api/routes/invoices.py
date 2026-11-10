from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import SessionDep
from app.db.models import Invoice
from app.schemas import InvoiceRead

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("", response_model=list[InvoiceRead])
def list_invoices(session: SessionDep) -> list[Invoice]:
    return list(session.scalars(select(Invoice).order_by(Invoice.created_at.desc(), Invoice.date.desc())))


@router.get("/{invoice_id}", response_model=InvoiceRead)
def get_invoice(invoice_id: str, session: SessionDep) -> Invoice:
    invoice = session.get(Invoice, invoice_id)
    if invoice is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Invoice {invoice_id} not found")
    return invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(invoice_id: str, session: SessionDep) -> None:
    invoice = session.get(Invoice, invoice_id)
    if invoice is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Invoice {invoice_id} not found")
    session.delete(invoice)
    session.commit()
