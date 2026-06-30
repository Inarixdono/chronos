# Thermal Receipt Print Agent

Local agent that detects Windows printers and prints thermal receipts. It runs in
two modes:

- **CLI mode** — interactively pick a printer and print a test receipt.
- **WebSocket agent mode** (`--connect`) — connect to the backend, register the
  local printers, and print receipts on demand from print jobs sent over the
  socket.

## Setup

```bash
uv sync
```

## CLI mode

Run without flags to list printers, pick one by number, and confirm to print a
test receipt.

```bash
uv run main.py
```

```
[0] Microsoft Print to PDF
[1] POS80-01
Select printer number: 1
Selected: POS80-01
Print test receipt? (y/n): y
Printed successfully.
```

## WebSocket agent mode

Run with `--connect` to keep a persistent connection to the backend. On connect,
the agent enumerates local printers and sends a `register` event. It then listens
for `print` jobs and replies with a `print_result` for each.

```bash
uv run main.py --connect
```

- The backend URL defaults to `ws://localhost:8000/ws/agent` and can be
  overridden with the `BACKEND_WS_URL` environment variable.
- The agent reconnects automatically with exponential backoff (1s up to 30s) if
  the connection drops.

### Protocol

On connect, the agent sends:

```json
{ "event": "register", "printers": ["POS80-01", "Microsoft Print to PDF"] }
```

The backend sends print jobs:

```json
{ "event": "print", "job_id": 42, "printer_name": "POS80-01", "lines": ["line 1", "line 2"] }
```

The agent replies with the result:

```json
{ "event": "print_result", "job_id": 42, "success": true, "error": null }
```

## Notes

- `pywin32` requires Windows. On other platforms `get_printers()` raises
  `RuntimeError`.
- Receipts are printed via `python-escpos` using the `Win32Raw` backend; each line
  is written followed by a paper cut.
