import asyncio
import json
import logging
import os
import sys

from printer import get_printers, print_receipt
from receipt import build_test_receipt

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CLI mode (original, no flags)
# ---------------------------------------------------------------------------


def cli_main() -> None:
    printers = get_printers()
    if not printers:
        print("No printers found.")
        sys.exit(0)

    for i, name in enumerate(printers):
        print(f"[{i}] {name}")

    raw = input("Select printer number: ").strip()
    if not raw.isdigit() or int(raw) >= len(printers):
        print(f"Invalid selection: '{raw}'")
        sys.exit(1)

    selected = printers[int(raw)]
    print(f"Selected: {selected}")

    answer = input("Print test receipt? (y/n): ").strip().lower()
    if answer != "y":
        print("Cancelled.")
        sys.exit(0)

    try:
        print_receipt(selected, build_test_receipt())
        print("Printed successfully.")
    except Exception as e:
        print(f"Print failed: {e}")
        sys.exit(1)


# ---------------------------------------------------------------------------
# WebSocket agent mode (--connect)
# ---------------------------------------------------------------------------

BACKEND_WS_URL_DEFAULT = "ws://localhost:8000/ws/agent"


async def ws_main() -> None:
    import websockets

    url = os.environ.get("BACKEND_WS_URL", BACKEND_WS_URL_DEFAULT)
    backoff = 1

    while True:
        try:
            logger.info("Connecting to %s", url)
            async with websockets.connect(url) as ws:
                backoff = 1  # reset on successful connect

                printers = get_printers()
                registration = {"event": "register", "printers": printers}
                await ws.send(json.dumps(registration))
                logger.info("Registered with printers: %s", printers)

                async for raw in ws:
                    msg = json.loads(raw)
                    logger.info("Received: %s", msg)

                    if msg.get("event") == "print":
                        job_id: int = msg["job_id"]
                        printer_name: str = msg["printer_name"]
                        lines: list[str] = msg["lines"]
                        try:
                            print_receipt(printer_name, lines)
                            result = {
                                "event": "print_result",
                                "job_id": job_id,
                                "success": True,
                                "error": None,
                            }
                            logger.info("Job %s printed successfully", job_id)
                        except Exception as exc:
                            result = {
                                "event": "print_result",
                                "job_id": job_id,
                                "success": False,
                                "error": str(exc),
                            }
                            logger.error("Job %s failed: %s", job_id, exc)
                        await ws.send(json.dumps(result))

        except Exception as exc:
            logger.warning("Connection lost (%s). Reconnecting in %ss...", exc, backoff)
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 30)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> None:
    if "--connect" in sys.argv:
        asyncio.run(ws_main())
    else:
        cli_main()


if __name__ == "__main__":
    main()
