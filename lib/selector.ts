export type Workload = {
  application: "nextjs" | "docker" | "wordpress" | "n8n";
  traffic: "starter" | "growing" | "busy";
  containers: number;
  database: boolean;
  storage: number;
};

export function estimateServer(input: Workload) {
  const base = input.application === "n8n" ? 2 : 1;
  const traffic = { starter: 0, growing: 1, busy: 3 }[input.traffic];
  const containerMemory = Math.ceil(Math.max(0, input.containers - 2) / 3);
  const rawRam = base + traffic + containerMemory + (input.database ? 1 : 0);
  const ram = rawRam <= 2 ? 2 : rawRam <= 4 ? 4 : rawRam <= 8 ? 8 : 16;
  const cpu = ram <= 2 ? 1 : ram <= 4 ? 2 : ram <= 8 ? 4 : 6;
  const storage = Math.max(input.storage, input.database ? 40 : 25);
  return { ram, cpu, storage };
}
