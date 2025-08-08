import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/ServiceCard';
import StatusPill from '@/components/StatusPill';
import SystemWidgets from '@/components/SystemWidgets';
import { fetchConfig, subscribeSSE, fetchHealth, fetchSystem } from '@/lib/api';
import type { AppConfig, HealthItem, ServiceConfig, SystemInfo } from '@/lib/types';

const Index = () => {
  const [cfg, setCfg] = useState<AppConfig | null>(null);
  const [health, setHealth] = useState<HealthItem[] | null>(null);
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig().then(setCfg).catch(() => setCfg({ refreshSeconds: 15, services: [] }));
  }, []);

  useEffect(() => {
    const off1 = subscribeSSE<HealthItem[]>('/api/health/stream', (d) => setHealth(d));
    const off2 = subscribeSSE<SystemInfo>('/api/system/stream', (d) => setSystem(d));
    return () => { off1(); off2(); };
  }, []);

  const mapHealth = useMemo(() => {
    const byName = new Map<string, HealthItem>();
    health?.forEach(h => byName.set(h.name, h));
    return byName;
  }, [health]);

  const onRefresh = async () => {
    try {
      setLoading(true);
      const d = await fetchHealth(true);
      setHealth(d);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Home Hub</h1>
          <div className="flex items-center gap-2">
            <Button onClick={onRefresh} disabled={loading}>
              {loading ? 'A atualizar...' : 'Atualizar agora'}
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium">Links Rápidos</h2>
          <p className="text-sm text-muted-foreground">Aceda rapidamente aos seus serviços</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cfg?.services.map((svc: ServiceConfig) => (
            <ServiceCard key={svc.name} service={svc} health={mapHealth.get(svc.name) || undefined} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Estado dos Serviços</h2>
            <p className="text-sm text-muted-foreground">Atualização automática a cada {cfg?.refreshSeconds ?? 15}s</p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Serviço</th>
                <th className="text-left p-3 font-medium">URL</th>
                <th className="text-left p-3 font-medium">Estado</th>
                <th className="text-left p-3 font-medium">Latência</th>
                <th className="text-left p-3 font-medium">HTTP</th>
              </tr>
            </thead>
            <tbody>
              {cfg?.services.map((svc) => {
                const h = mapHealth.get(svc.name);
                const state: 'up' | 'warn' | 'down' | 'unknown' = !h ? 'unknown' : h.ok ? (h.ms && h.ms > 1000 ? 'warn' : 'up') : 'down';
                return (
                  <tr key={svc.name} className="border-t">
                    <td className="p-3">{svc.name}</td>
                    <td className="p-3 text-muted-foreground">{svc.url}</td>
                    <td className="p-3"><StatusPill state={state} /></td>
                    <td className="p-3">{h?.ms ? `${h.ms} ms` : '—'}</td>
                    <td className="p-3">{h?.status ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium">Servidor</h2>
          <p className="text-sm text-muted-foreground">Métricas do host</p>
        </div>
        <SystemWidgets data={system ?? undefined} />
      </section>
    </main>
  );
};

export default Index;
