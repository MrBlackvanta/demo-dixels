import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { authed, persona as personaStore, sidebarOpen as sidebarStore } from '../../lib/data';
import { productByPath } from '../../lib/products';
import type { Persona } from '../../lib/products';
import { useScalar } from '../../lib/store';

export function AppShell() {
  const location = useLocation();
  const [persona, setPersona] = useScalar(personaStore);
  const [open, setOpen] = useScalar(sidebarStore);
  const [, setAuthed] = useScalar(authed);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const product = productByPath(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-nt-50 text-ink">
      <Sidebar
        persona={persona}
        open={open}
        onToggle={() => setOpen(!open)}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={product?.name ?? 'Dixels'}
          descriptor={product?.descriptor ?? 'The agentic experience OS'}
          persona={persona}
          onPersonaChange={(next: Persona) => setPersona(next)}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onSignOut={() => setAuthed(false)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 0.8, 0.25, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} persona={persona} />
    </div>
  );
}
