import { useState } from "react";
import { createJob, triggerPrint } from "../api/client";

interface Props {
  onJobCreated: (jobId: number) => void;
}

const DEFAULT_LINES =
  "=== TICKET DE PRUEBA ===\nComedor: Cafeteria Norte\nEmpleado: Jeniel Urena";

type StatusMsg = { kind: "success" | "error"; text: string } | null;

export default function JobForm({ onJobCreated }: Props) {
  const [lines, setLines] = useState(DEFAULT_LINES);
  const [lastJobId, setLastJobId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusMsg>(null);

  async function handleCreate() {
    setStatus(null);
    try {
      const job = await createJob(lines.split("\n"));
      setLastJobId(job.id);
      onJobCreated(job.id);
      setStatus({ kind: "success", text: `Job #${job.id} en cola` });
    } catch (err) {
      setStatus({ kind: "error", text: (err as Error).message });
    }
  }

  async function handlePrint() {
    if (lastJobId === null) return;
    setStatus(null);
    try {
      await triggerPrint(lastJobId);
      setStatus({ kind: "success", text: `Imprimiendo job #${lastJobId}...` });
    } catch (err) {
      setStatus({ kind: "error", text: (err as Error).message });
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Líneas del ticket</label>
      <textarea
        className="block w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
        rows={5}
        value={lines}
        onChange={(e) => setLines(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleCreate}
        >
          Agregar a cola
        </button>
        <button
          className="rounded bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={lastJobId === null}
          onClick={handlePrint}
        >
          Imprimir último
        </button>
      </div>
      {status && (
        <p
          className={`text-sm ${
            status.kind === "success" ? "text-green-700" : "text-red-600"
          }`}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
