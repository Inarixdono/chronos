interface Props {
  printers: string[];
  selectedPrinter: string | null;
  onSelect: (name: string) => void;
}

export default function PrinterSelector({ printers, selectedPrinter, onSelect }: Props) {
  const empty = printers.length === 0;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Impresora</label>
      <select
        className="block w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={empty}
        value={selectedPrinter ?? ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        {empty ? (
          <option value="">Sin impresoras disponibles</option>
        ) : (
          <>
            {!selectedPrinter && <option value="">Seleccionar impresora...</option>}
            {printers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </>
        )}
      </select>
      {selectedPrinter && (
        <p className="text-xs text-gray-500">Impresora activa: {selectedPrinter}</p>
      )}
    </div>
  );
}
