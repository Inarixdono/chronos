const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body.detail) message = body.detail;
    } catch {}
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export interface AgentStatus {
  connected: boolean;
  printers: string[];
  selected_printer: string | null;
}

export interface Job {
  id: number;
  lines: string[];
  status: "pending" | "printing" | "done" | "failed";
  error: string | null;
  created_at: string | null;
  printed_at: string | null;
}

export function getAgentStatus(): Promise<AgentStatus> {
  return request<AgentStatus>("/api/agent/status");
}

export function selectPrinter(name: string): Promise<{ selected_printer: string }> {
  return request("/api/agent/printer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ printer_name: name }),
  });
}

export function createJob(lines: string[]): Promise<Job> {
  return request<Job>("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines }),
  });
}

export function triggerPrint(id: number): Promise<{ job_id: number; status: string }> {
  return request(`/api/jobs/${id}/print`, { method: "POST" });
}

export function getJobs(): Promise<Job[]> {
  return request<Job[]>("/api/jobs");
}
