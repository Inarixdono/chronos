from datetime import date


def build_test_receipt() -> list[str]:
    today = date.today().strftime("%Y-%m-%d")
    return [
        "=== TICKET DE PRUEBA ===",
        "",
        "Comedor: Cafeteria Norte",
        "Empleado: Jeniel Urena",
        f"Fecha: {today}",
        "",
        "Ticket #001",
        "------------------------",
    ]
