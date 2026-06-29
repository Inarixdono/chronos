interface Props {
  connected: boolean;
  printers: string[];
  selectedPrinter: string | null;
}

export default function AgentStatus({ connected }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          connected ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      <span className="text-sm text-gray-700">
        {connected ? "Agente conectado" : "Agente desconectado"}
      </span>
    </div>
  );
}
