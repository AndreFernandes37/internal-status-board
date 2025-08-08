import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import got from 'got';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.resolve(process.cwd(), 'config/services.json');

let cache = {
  at: 0,
  data: [] as any[],
};

const CACHE_TTL_MS = 10_000; // 10s

export function loadConfig() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw) as {
    refreshSeconds: number;
    services: Array<{
      name: string;
      url: string;
      method?: 'GET' | 'HEAD';
      timeoutMs?: number;
      ignoreTls?: boolean;
    }>;
  };
}

async function checkService(svc: any) {
  const start = Date.now();
  try {
    const response = await got(svc.url, {
      method: svc.method || 'GET',
      timeout: { request: svc.timeoutMs || 4000 },
      https: { rejectUnauthorized: !(svc.ignoreTls === true) },
      throwHttpErrors: false,
      http2: false,
    });
    const ms = Date.now() - start;
    const status = response.statusCode;
    return {
      name: svc.name,
      url: svc.url,
      ok: status >= 200 && status < 400,
      status,
      ms,
    };
  } catch (err: any) {
    const ms = Date.now() - start;
    return {
      name: svc.name,
      url: svc.url,
      ok: false,
      status: 0,
      ms,
    };
  }
}

export async function getHealth(force = false) {
  const now = Date.now();
  if (!force && cache.at && now - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }
  const cfg = loadConfig();
  const results = await Promise.all(cfg.services.map(checkService));
  cache = { at: now, data: results };
  return results;
}
