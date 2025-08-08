import { ExternalLink, Server } from 'lucide-react';
import StatusPill from './StatusPill';
import { HealthItem, ServiceConfig } from '@/lib/types';

type Props = {
  service: ServiceConfig;
  health?: HealthItem;
};

export default function ServiceCard({ service, health }: Props) {
  const state: 'up' | 'warn' | 'down' | 'unknown' = !health
    ? 'unknown'
    : health.ok
    ? health.ms !== null && health.ms > 1000
      ? 'warn'
      : 'up'
    : 'down';

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border bg-card/60 backdrop-blur-sm hover:bg-card transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-accent/40 p-2 border border-accent/30 text-accent-foreground">
            <Server size={18} />
          </div>
          <div>
            <div className="font-medium text-sm text-foreground">{service.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[220px]">{service.url}</div>
          </div>
        </div>
        <ExternalLink size={16} className="opacity-60 group-hover:opacity-100" />
      </div>
      <div className="px-4 pb-4 flex items-center justify-between text-xs text-muted-foreground">
        <StatusPill state={state} />
        <span>{health?.ms ? `${health.ms} ms` : '—'}</span>
      </div>
    </a>
  );
}
