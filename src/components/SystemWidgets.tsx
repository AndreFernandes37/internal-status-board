import { Cpu, Gauge, HardDrive, Network, ThermometerSun, Timer } from 'lucide-react';
import type { SystemInfo } from '@/lib/types';

function pct(n: number) { return `${n.toFixed(0)}%`; }
function bytes(n: number) { return n > 0 ? `${(n/1024/1024/1024).toFixed(1)} GB` : '—'; }
function uptime(sec: number) {
  const d = Math.floor(sec / 86400); const h = Math.floor((sec % 86400)/3600); const m = Math.floor((sec % 3600)/60);
  return `${d}d ${h}h ${m}m`;
}

type Props = { data?: SystemInfo };

export default function SystemWidgets({ data }: Props) {
  const items = [
    {
      icon: Gauge, title: 'CPU', value: data ? pct(data.cpu.usage) : '—',
      sub: 'média instantânea'
    },
    {
      icon: HardDrive, title: 'Disco', value: data?.disk ? pct(data.disk.usedPercent) : '—',
      sub: data?.disk ? `${bytes(data.disk.available)} livres` : '—'
    },
    {
      icon: ThermometerSun, title: 'Temperatura', value: data?.cpu.temp.available ? `${data?.cpu.temp.value} °C` : 'sensor indisponível',
      sub: 'CPU'
    },
    {
      icon: Cpu, title: 'RAM', value: data ? pct(data.mem.usedPercent) : '—',
      sub: data ? `${bytes(data.mem.used)} / ${bytes(data.mem.total)}` : '—'
    },
    {
      icon: Timer, title: 'Uptime', value: data ? uptime(data.uptimeSec) : '—',
      sub: 'host'
    },
    {
      icon: Network, title: 'LAN IP', value: data?.network?.ipv4 ?? '—',
      sub: data?.network?.iface ?? '—'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border bg-card/60 backdrop-blur-sm p-4 flex items-center gap-3">
          <div className="rounded-md bg-accent/40 p-2 border border-accent/30 text-accent-foreground"><it.icon size={18} /></div>
          <div>
            <div className="text-xs text-muted-foreground">{it.title}</div>
            <div className="text-base font-medium text-foreground">{it.value}</div>
            <div className="text-xs text-muted-foreground">{it.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
