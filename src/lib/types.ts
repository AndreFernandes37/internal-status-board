export type ServiceConfig = {
  name: string;
  url: string;
  method?: 'GET' | 'HEAD';
  timeoutMs?: number;
  ignoreTls?: boolean;
};

export type AppConfig = {
  refreshSeconds: number;
  services: ServiceConfig[];
};

export type HealthItem = {
  name: string;
  url: string;
  ok: boolean;
  status: number;
  ms: number | null;
};

export type SystemInfo = {
  load: { avg1: number; current: number };
  cpu: { usage: number; temp: { value: number | null; available: boolean } };
  mem: { total: number; used: number; usedPercent: number };
  disk: { mount: string; size: number; used: number; usedPercent: number; available: number } | null;
  uptimeSec: number;
  network: { iface: string | null; ipv4: string | null };
  ts: number;
};
