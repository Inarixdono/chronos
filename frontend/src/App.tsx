import { useEffect, useState } from "react";
import {
  getAgentStatus,
  getJobs,
  selectPrinter,
} from "./api/client";
import type { AgentStatus as AgentStatusType, Job } from "./api/client";
import AgentStatus from "./components/AgentStatus";
import PrinterSelector from "./components/PrinterSelector";
import JobForm from "./components/JobForm";
import JobList from "./components/JobList";

const POLL_INTERVAL_MS = 3000;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function App() {
  const [agentStatus, setAgentStatus] = useState<AgentStatusType>({
    connected: false,
    printers: [],
    selected_printer: null,
  });
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function poll() {
      try {
        const [status, jobList] = await Promise.all([getAgentStatus(), getJobs()]);
        setAgentStatus(status);
        setJobs(jobList);
      } catch {}
    }
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  async function handleSelectPrinter(name: string) {
    setAgentStatus((prev) => ({ ...prev, selected_printer: name }));
    try {
      await selectPrinter(name);
    } catch (err) {
      console.error("selectPrinter failed:", err);
    }
  }

  function handleJobCreated() {
    getJobs().then(setJobs).catch(() => {});
  }

  const { connected, printers, selected_printer } = agentStatus;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Chronos · Impresión de Tickets
        </h1>

        <Section title="Estado del agente">
          <AgentStatus
            connected={connected}
            printers={printers}
            selectedPrinter={selected_printer}
          />
        </Section>

        {connected && (
          <Section title="Impresora">
            <PrinterSelector
              printers={printers}
              selectedPrinter={selected_printer}
              onSelect={handleSelectPrinter}
            />
          </Section>
        )}

        {connected && selected_printer && (
          <Section title="Nuevo trabajo">
            <JobForm onJobCreated={handleJobCreated} />
          </Section>
        )}

        <Section title="Cola de trabajos">
          <JobList jobs={jobs} />
        </Section>
      </div>
    </div>
  );
}
