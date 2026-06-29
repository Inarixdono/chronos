from fastapi import WebSocket

active_connection: WebSocket | None = None
printers: list[str] = []
selected_printer: str | None = None
