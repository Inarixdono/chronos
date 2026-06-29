import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

import state
from database import get_db
from models import PrintJob

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/agent")
async def agent_ws(websocket: WebSocket):
    if state.active_connection is not None:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    state.active_connection = websocket
    logger.info("Agent connected")

    try:
        raw = await websocket.receive_text()
        msg = json.loads(raw)
        if msg.get("event") == "register":
            state.printers = msg.get("printers", [])
            logger.info("Agent registered printers: %s", state.printers)

        async for text in websocket.iter_text():
            msg = json.loads(text)
            if msg.get("event") == "print_result":
                _handle_print_result(msg)

    except WebSocketDisconnect:
        logger.info("Agent disconnected")
    finally:
        state.active_connection = None
        state.printers = []
        state.selected_printer = None


def _handle_print_result(msg: dict) -> None:
    job_id: int = msg.get("job_id")
    success: bool = msg.get("success", False)
    error: str | None = msg.get("error")

    db: Session = next(get_db())
    try:
        job = db.get(PrintJob, job_id)
        if job is None:
            logger.warning("print_result for unknown job_id=%s", job_id)
            return
        job.status = "done" if success else "failed"
        job.error = error
        if success:
            job.printed_at = datetime.now(timezone.utc)
        db.commit()
        logger.info("Job %s marked %s", job_id, job.status)
    finally:
        db.close()
