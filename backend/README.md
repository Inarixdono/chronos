# Chronos Print Backend

FastAPI backend that manages the print agent connection and job queue.

## Setup

```bash
cd backend
uv sync          # or: pip install -e .
```

## Running

```bash
# from chronos/ root
uvicorn backend.main:app --reload
```

Interactive API docs: http://localhost:8000/docs

## Validation steps

### 1. Start the backend
```bash
cd chronos
uvicorn backend.main:app --reload
```

### 2. Start the agent (in a second terminal)
```bash
cd chronos/agent
uv run agent/main.py --connect
# Or with a custom backend URL:
BACKEND_WS_URL=ws://localhost:8000/ws/agent uv run agent/main.py --connect
```

### 3. Verify registration
```
GET /api/agent/status
```
Expected: `{ "connected": true, "printers": ["..."], "selected_printer": null }`

### 4. Select a printer
```
POST /api/agent/printer
{ "printer_name": "<name from printers list>" }
```

### 5. Create a print job
```
POST /api/jobs
{ "lines": ["Line 1", "Line 2", "Line 3"] }
```
Note the `id` in the response.

### 6. Trigger printing
```
POST /api/jobs/{id}/print
```
Expected: `{ "job_id": 1, "status": "printing" }`

### 7. Confirm result
```
GET /api/jobs
```
Expected: job status is `"done"` (or `"failed"` with an `error` field if the printer raised).

## Architecture

```
browser / curl
     │
     ▼
FastAPI (backend/)
  ├── GET/POST /api/agent/*   ← agent status & printer selection
  ├── GET/POST /api/jobs/*    ← job management & print trigger
  └── WS /ws/agent           ← persistent connection to the print agent
           │
           ▼
     agent/main.py --connect
       ├── registers printer list on connect
       ├── receives "print" commands
       └── sends "print_result" after each job
```

## State

Runtime state is held in memory (`backend/state.py`) — not persisted.
Jobs are stored in SQLite (`chronos.db`) via SQLAlchemy.
