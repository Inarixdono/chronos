import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import state as state
from database import get_db
from models import PrintJob

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class CreateJobBody(BaseModel):
    lines: list[str]


@router.post("")
def create_job(body: CreateJobBody, db: Session = Depends(get_db)):
    job = PrintJob(lines=body.lines, status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    return _serialize(job)


@router.post("/{job_id}/print")
async def trigger_print(job_id: int, db: Session = Depends(get_db)):
    if state.active_connection is None:
        raise HTTPException(status_code=409, detail="Agent not connected")
    if state.selected_printer is None:
        raise HTTPException(status_code=409, detail="No printer selected")

    job = db.get(PrintJob, job_id)
    if job is None:
        raise HTTPException(status_code=409, detail=f"Job {job_id} not found")
    if job.status != "pending":
        raise HTTPException(status_code=409, detail=f"Job {job_id} is not pending (status={job.status!r})")

    job.status = "printing"
    db.commit()

    command = {
        "event": "print",
        "job_id": job_id,
        "printer_name": state.selected_printer,
        "lines": job.lines,
    }
    await state.active_connection.send_text(json.dumps(command))
    logger.info("Sent print command for job %s to printer %s", job_id, state.selected_printer)

    return {"job_id": job_id, "status": "printing"}


@router.get("")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(PrintJob).order_by(PrintJob.created_at.desc()).all()
    return [_serialize(j) for j in jobs]


def _serialize(job: PrintJob) -> dict:
    return {
        "id": job.id,
        "lines": job.lines,
        "status": job.status,
        "error": job.error,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "printed_at": job.printed_at.isoformat() if job.printed_at else None,
    }
