import sys

from printer import get_printers, print_receipt
from receipt import build_test_receipt


def main() -> None:
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


if __name__ == "__main__":
    main()
