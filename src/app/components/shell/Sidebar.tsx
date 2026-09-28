import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { NAV_BY_PERSONA } from '../../lib/products';
import type { Persona } from '../../lib/products';
import { cn } from '../ui/utils';
import dixelsLogo from 'figma:asset/247d65801bbc3aad30cb75db0c08362c2b40b62f.png';

interface SidebarProps {
  persona: Persona;
  open: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ persona, open, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const groups = NAV_BY_PERSONA[persona];
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMobileClose();
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onMobileClose]);

  const nav = (expanded: boolean) => (
    <nav aria-label="Products" className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
      {groups.map((group) => (
        <div key={group.title} className="mb-5">
          {expanded ? (
            <p className="mb-1.5 px-3 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink-subtle">
              {group.title}
            </p>
          ) : (
            <div className="mx-auto mb-3 h-px w-6 bg-line" />
          )}

          <ul className="space-y-0.5">
            {group.items.map((product) => (
              <li key={product.id}>
                <NavLink
                  to={product.path}
                  onClick={onMobileClose}
                  title={!expanded ? `${product.name} · ${product.descriptor}` : undefined}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-sm px-3 py-2 transition-colors duration-[180ms]',
                      !expanded && 'justify-center px-0',
                      isActive ? 'text-brand-700' : 'text-ink-muted hover:bg-nt-50 hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId={expanded ? 'nav-active' : 'nav-active-rail'}
                          transition={{ duration: 0.24, ease: [0.22, 0.8, 0.25, 1] }}
                          className="absolute inset-0 rounded-sm bg-brand-50"
                          aria-hidden="true"
                        />
                      )}
                      <product.icon
                        size={17}
                        strokeWidth={1.8}
                        className="relative shrink-0"
                        aria-hidden="true"
                      />
                      {expanded && (
                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate text-[0.8125rem] font-medium leading-tight">
                            {product.name}
                          </span>
                          <span
                            className={cn(
                              'block truncate text-[0.6875rem] leading-tight transition-colors',
                              isActive ? 'text-brand-500' : 'text-ink-subtle',
                            )}
                          >
                            {product.descriptor}
                          </span>
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <motion.aside
        animate={{ width: open ? 264 : 76 }}
        transition={{ duration: 0.24, ease: [0.22, 0.8, 0.25, 1] }}
        className="relative z-20 hidden shrink-0 flex-col border-r border-line bg-nt-0 lg:flex"
      >
        <div className="flex h-16 items-center justify-between px-4">
          <img
            src={dixelsLogo}
            alt="Dixels"
            className={cn('object-contain', open ? 'h-7' : 'h-7 w-7 object-left')}
          />
          {open && (
            <button
              type="button"
              onClick={onToggle}
              className="dx-btn-ghost px-1.5 py-1.5"
              aria-label="Collapse navigation"
            >
              <PanelLeftClose size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {!open && (
          <button
            type="button"
            onClick={onToggle}
            className="dx-btn-ghost mx-auto mb-2 px-1.5 py-1.5"
            aria-label="Expand navigation"
          >
            <PanelLeftOpen size={16} aria-hidden="true" />
          </button>
        )}

        {nav(open)}
      </motion.aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="absolute inset-0 bg-nt-950/30 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Products"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 0.8, 0.25, 1] }}
            className="absolute inset-y-0 left-0 flex w-[17rem] flex-col border-r border-line bg-nt-0"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <img src={dixelsLogo} alt="Dixels" className="h-7 object-contain" />
              <button
                type="button"
                onClick={onMobileClose}
                className="dx-btn-ghost px-1.5 py-1.5"
                aria-label="Close navigation"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            {nav(true)}
          </motion.div>
        </div>
      )}
    </>
  );
}
