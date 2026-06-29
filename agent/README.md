# Thermal Receipt Print Agent

CLI tool that detects local printers on Windows and prints a test receipt to a selected one.

## Setup

```bash
uv sync
uv run main.py
```

## Usage

Run the script, pick a printer by number, and confirm to print.

```
[0] Microsoft Print to PDF
[1] POS80-01
Select printer number: 1
Selected: POS80-01
Print test receipt? (y/n): y
Printed successfully.
```

## Notes

- `pywin32` requires Windows. On other platforms `get_printers()` will raise `RuntimeError`.
- The receipt is printed via `python-escpos` using the `Win32Raw` backend.
- No web server, no WebSocket, no frontend — pure agent logic.
