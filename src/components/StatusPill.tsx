import { BadgeCheck, CircleSlash, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  state: 'up' | 'warn' | 'down' | 'unknown';
  label?: string;
};

export default function StatusPill({ state, label }: Props) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium';
  const map = {
    up: 'bg-success/15 text-success-foreground border border-success/30',
    warn: 'bg-warning/15 text-warning-foreground border border-warning/30',
    down: 'bg-destructive/15 text-destructive-foreground border border-destructive/30',
    unknown: 'bg-muted text-muted-foreground border border-border',
  } as const;
  const Icon = state === 'up' ? BadgeCheck : state === 'warn' ? Clock : state === 'down' ? CircleSlash : Clock;
  return (
    <span className={cn(base, map[state])} aria-live="polite">
      <Icon size={14} aria-hidden />
      {label ?? (state === 'up' ? 'OK' : state === 'warn' ? 'Lento' : state === 'down' ? 'Indisponível' : 'Desconhecido')}
    </span>
  );
}
