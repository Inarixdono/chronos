import type { Job } from "../api/client";

interface Props {
  jobs: Job[];
}

const STATUS_BADGE: Record<Job["status"], string> = {
  pending: "bg-gray-100 text-gray-600",
  printing: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-DO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function JobList({ jobs }: Props) {
  if (jobs.length === 0) {
    return <p className="text-sm text-gray-400 italic">No hay trabajos en la cola.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="pb-2 pr-4">ID</th>
            <th className="pb-2 pr-4">Estado</th>
            <th className="pb-2 pr-4">Líneas</th>
            <th className="pb-2">Creado</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b border-gray-100 last:border-0">
              <td className="py-2 pr-4 font-mono text-gray-700">#{job.id}</td>
              <td className="py-2 pr-4">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[job.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {job.status}
                </span>
              </td>
              <td className="py-2 pr-4 text-gray-600">{job.lines.length}</td>
              <td className="py-2 text-gray-500">{formatDate(job.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
