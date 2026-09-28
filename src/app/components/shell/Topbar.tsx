import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { CURRENT_USER, notifications as notificationsCol } from '../../lib/data';
import { PERSONA_LABELS } from '../../lib/products';
import type { Persona } from '../../lib/products';
import { useCollection } from '../../lib/store';
import { cn } from '../ui/utils';

interface TopbarProps {
  title: string;
  descriptor: string;
  persona: Persona;
  onPersonaChange: (persona: Persona) => void;
  onOpenCommand: () => void;
  onOpenMobileNav: () => void;
  onSignOut: () => void;
}

export function Topbar({
  title,
  descriptor,
  persona,
  onPersonaChange,
  onOpenCommand,
  onOpenMobileNav,
  onSignOut,
}: TopbarProps) {
  const navigate = useNavigate();
  const notifications = useCollection(notificationsCol);
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-nt-0/85 px-4 backdrop-blur-xl sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="dx-btn-ghost -ml-1 shrink-0 px-2 py-2 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-[0.9375rem] font-medium leading-tight tracking-[-0.01em] text-ink">
          {title}
        </h1>
        <p className="truncate text-[0.6875rem] leading-tight text-ink-subtle">{descriptor}</p>
      </div>

      <button
        type="button"
        onClick={onOpenCommand}
        className="ml-auto hidden h-9 w-full max-w-xs items-center gap-2 rounded-md border border-line bg-nt-50 px-3 text-left text-[0.8125rem] text-ink-subtle transition-colors duration-[180ms] hover:border-line-strong hover:bg-nt-0 md:flex"
      >
        <Search size={14} aria-hidden="true" />
        <span className="flex-1 truncate">Search or ask Cortex</span>
        <kbd className="rounded border border-line bg-nt-0 px-1.5 py-0.5 font-sans text-[0.625rem] text-ink-subtle">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={onOpenCommand}
        className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-md text-ink-muted transition-colors duration-[180ms] hover:bg-nt-100 hover:text-ink md:hidden"
        aria-label="Search or ask Cortex"
      >
        <Search size={17} strokeWidth={1.8} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-md text-ink-muted transition-colors duration-[180ms] hover:bg-nt-100 hover:text-ink"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      >
        <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[0.5625rem] font-medium text-nt-0">
            {unread}
          </span>
        )}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors duration-[180ms] hover:bg-nt-100"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-[0.6875rem] font-medium text-nt-0">
              {CURRENT_USER.initials}
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-[0.8125rem] font-medium leading-tight text-ink">
                {CURRENT_USER.name}
              </span>
              <span className="block text-[0.6875rem] leading-tight text-ink-subtle">
                {PERSONA_LABELS[persona]}
              </span>
            </span>
            <ChevronDown size={14} className="text-ink-subtle" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <span className="block text-[0.8125rem] font-medium text-ink">{CURRENT_USER.name}</span>
            <span className="block text-[0.6875rem] text-ink-subtle">{CURRENT_USER.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[0.625rem] uppercase tracking-[0.14em] text-ink-subtle">
            View as
          </DropdownMenuLabel>
          {(Object.keys(PERSONA_LABELS) as Persona[]).map((key) => (
            <DropdownMenuItem
              key={key}
              onSelect={() => onPersonaChange(key)}
              className={cn('text-[0.8125rem]', key === persona && 'text-brand-700')}
            >
              {PERSONA_LABELS[key]}
              {key === persona && <span className="ml-auto text-brand-600">•</span>}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onSignOut} className="text-[0.8125rem]">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
