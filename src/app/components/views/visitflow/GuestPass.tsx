import { Car, Clock, Copy, MapPin } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Visit } from '../../../lib/data';
import { formatDay, initials } from './visits';

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Invite link copied');
  } catch {
    toast.message('Copy it by hand', { description: text });
  }
};

export function GuestPass({ visit }: { visit: Visit }) {
  const code = visit.code ?? '—';

  return (
    <div className="overflow-hidden rounded-lg border border-brand-200">
      <div className="dx-wash-deep relative px-5 py-4 text-nt-0">
        <div className="dx-grid-texture absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-nt-0/15 text-[0.8125rem] font-medium backdrop-blur-sm"
          >
            {initials(visit.guest)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-body font-medium">{visit.guest}</span>
            <span className="block truncate text-[0.6875rem] text-nt-0/70">{visit.company}</span>
          </span>
          {visit.kind && visit.kind !== 'Guest' && (
            <span className="ml-auto shrink-0 rounded-full bg-nt-0/15 px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide backdrop-blur-sm">
              {visit.kind}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5 bg-nt-0 px-5 py-4">
        <p className="flex items-center gap-2 text-[0.8125rem] text-ink">
          <Clock size={13} className="shrink-0 text-ink-subtle" aria-hidden="true" />
          {formatDay(visit.date)} at {visit.time}
        </p>
        {visit.location && (
          <p className="flex items-center gap-2 text-[0.8125rem] text-ink">
            <MapPin size={13} className="shrink-0 text-ink-subtle" aria-hidden="true" />
            {visit.location}
          </p>
        )}
        {visit.parking && (
          <p className="flex items-center gap-2 text-[0.8125rem] text-ink">
            <Car size={13} className="shrink-0 text-ink-subtle" aria-hidden="true" />
            Visitor bay reserved · B1
          </p>
        )}

        <div className="flex items-center gap-2 pt-1.5">
          <span className="flex-1 rounded-md border border-dashed border-line-strong bg-nt-50 px-3 py-2 text-center text-body font-medium tracking-[0.14em] tabular-nums text-ink">
            {code}
          </span>
          <button
            type="button"
            onClick={() => copy(`https://dixels.app/pass/${code}`)}
            aria-label={`Copy the invite link for ${visit.guest}`}
            className="dx-btn-secondary shrink-0 px-2.5"
          >
            <Copy size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
