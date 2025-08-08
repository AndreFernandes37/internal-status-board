import { AppConfig, HealthItem, SystemInfo } from './types';

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch('/config/services.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao carregar configuração');
  return res.json();
}

export function subscribeSSE<T>(url: string, onData: (data: T) => void) {
  let es: EventSource | null = null;
  try {
    es = new EventSource(url, { withCredentials: true });
    es.onmessage = (e) => {
      try { onData(JSON.parse(e.data)); } catch {}
    };
    es.onerror = () => { /* will retry by browser */ };
  } catch {}
  return () => { es?.close(); };
}

export async function fetchHealth(force = false): Promise<HealthItem[]> {
  const url = force ? '/api/health?force=true' : '/api/health';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha no health-check');
  return res.json();
}

export async function fetchSystem(): Promise<SystemInfo> {
  const res = await fetch('/api/system', { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha no system info');
  return res.json();
}
