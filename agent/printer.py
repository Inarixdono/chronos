try:
    import win32print
except ImportError:
    win32print = None


def get_printers() -> list[str]:
    if win32print is None:
        raise RuntimeError(
            "pywin32 is not available. Install it with: pip install pywin32. "
            "This module requires Windows."
        )
    flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    printers = win32print.EnumPrinters(flags)
    return [p[2] for p in printers]


def print_receipt(printer_name: str, lines: list[str]) -> None:
    from escpos.printer import Win32Raw

    with Win32Raw(printer_name) as p:
        for line in lines:
            p.text(line + "\n")
        p.cut()
