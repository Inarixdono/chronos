from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import state as state

router = APIRouter(prefix="/api/agent", tags=["agent"])


class PrinterSelect(BaseModel):
    printer_name: str


@router.get("/status")
def agent_status():
    return {
        "connected": state.active_connection is not None,
        "printers": state.printers,
        "selected_printer": state.selected_printer,
    }


@router.post("/printer")
def select_printer(body: PrinterSelect):
    if body.printer_name not in state.printers:
        raise HTTPException(status_code=400, detail=f"Unknown printer: {body.printer_name!r}")
    state.selected_printer = body.printer_name
    return {"selected_printer": state.selected_printer}
