import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import { getHealth, loadConfig } from './health.js';
import { getSystemInfo } from './system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 8080);

function basicAuth(req, res, next) {
  const user = process.env.BASIC_USER || '';
  const pass = process.env.BASIC_PASS || '';
  const auth = req.headers['authorization'];
  if (!user || !pass) return res.status(500).send('Missing BASIC_USER/BASIC_PASS');
  if (!auth) {
    res.set('WWW-Authenticate', 'Basic realm="Home Hub"');
    return res.status(401).send('Authentication required');
  }
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    res.set('WWW-Authenticate', 'Basic realm="Home Hub"');
    return res.status(401).send('Invalid auth');
  }
  const decoded = Buffer.from(encoded, 'base64').toString();
  const idx = decoded.indexOf(':');
  const u = decoded.slice(0, idx);
  const p = decoded.slice(idx + 1);
  if (u === user && p === pass) return next();
  res.set('WWW-Authenticate', 'Basic realm="Home Hub"');
  return res.status(401).send('Unauthorized');
}

// Apply basic auth to everything
app.use(basicAuth);

// Minimal rate limit for /api/*
const limiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

// APIs
app.get('/api/health', async (req, res) => {
  try {
    const force = String(req.query.force || 'false') === 'true';
    const data = await getHealth(force);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'health_failed' });
  }
});

app.get('/api/system', async (req, res) => {
  try {
    const data = await getSystemInfo();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'system_failed' });
  }
});

// SSE streams
app.get('/api/health/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const { refreshSeconds } = loadConfig();
  let active = true;

  const tick = async () => {
    if (!active) return;
    try {
      const data = await getHealth(false);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {}
  };

  const interval = setInterval(tick, (refreshSeconds || 15) * 1000);
  tick();

  req.on('close', () => {
    active = false;
    clearInterval(interval);
  });
});

app.get('/api/system/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let active = true;
  const interval = setInterval(async () => {
    if (!active) return;
    try {
      const data = await getSystemInfo();
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {}
  }, 5000);

  req.on('close', () => {
    active = false;
    clearInterval(interval);
  });
});

// Serve config file (read-only)
app.get('/config/services.json', (req, res) => {
  const p = path.resolve(process.cwd(), 'config/services.json');
  if (!fs.existsSync(p)) return res.status(404).send('config not found');
  res.sendFile(p);
});

// Static client
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath, { index: false }));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Home Hub listening on http://0.0.0.0:${PORT}`);
});
