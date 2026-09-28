import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { AppShell } from './components/shell/AppShell';
import { Login } from './components/shell/Login';
import { Today } from './components/views/Today';
import { LegacyModule } from './components/views/LegacyModule';
import { authed as authedStore, seedDemoData } from './lib/data';
import { useScalar } from './lib/store';
import { VmsProvider } from './components/dixels2/VmsContext';
import { EnterpriseProvider } from './components/dixels2/EnterpriseContext';

const Nourish = lazy(() =>
  import('./components/views/nourish/Nourish').then((m) => ({ default: m.Nourish })),
);

const load = {
  calendar: lazy(() => import('./components/dixels2/CoreCalendar').then((m) => ({ default: m.CoreCalendar }))),
  taskflow: lazy(() => import('./components/dixels2/WorkloadManagement').then((m) => ({ default: m.WorkloadManagement }))),
  atmosphere: lazy(() => import('./components/dixels2/SmartControlView').then((m) => ({ default: m.SmartControlView }))),
  spaceos: lazy(() => import('./components/dixels2/CoreSpaceBooking').then((m) => ({ default: m.CoreSpaceBooking }))),
  pathfinder: lazy(() => import('./components/dixels2/CampusGuideView').then((m) => ({ default: m.CampusGuideView }))),
  twinspace: lazy(() => import('./components/dixels2/SpaceManagement').then((m) => ({ default: m.SpaceManagement }))),
  buildingops: lazy(() => import('./components/dixels2/FacilitySmartControl').then((m) => ({ default: m.FacilitySmartControl }))),
  visitflow: lazy(() => import('./components/dixels2/VmsHost').then((m) => ({ default: m.VmsHost }))),
  vmsadmin: lazy(() => import('./components/dixels2/VmsAdmin').then((m) => ({ default: m.VmsAdmin }))),
  security: lazy(() => import('./components/dixels2/VmsSecurity').then((m) => ({ default: m.VmsSecurity }))),
  gather: lazy(() => import('./components/dixels2/EventsView').then((m) => ({ default: m.EventsView }))),
  tribes: lazy(() => import('./components/dixels2/CommunitiesView').then((m) => ({ default: m.CommunitiesView }))),
  omniserve: lazy(() => import('./components/dixels2/ServiceHubView').then((m) => ({ default: m.ServiceHubView }))),
  resolve: lazy(() => import('./components/dixels2/SupportCenterView').then((m) => ({ default: m.SupportCenterView }))),
  livecanvas: lazy(() => import('./components/dixels2/SignageManager').then((m) => ({ default: m.SignageManager }))),
  content: lazy(() => import('./components/dixels2/ContentManagerView').then((m) => ({ default: m.ContentManagerView }))),
  vault: lazy(() => import('./components/dixels2/DigitalAssetsView').then((m) => ({ default: m.DigitalAssetsView }))),
};

function ModuleFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite">
      <span className="flex items-center gap-2.5 text-[0.8125rem] text-ink-muted">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-brand-600" />
        Loading
      </span>
    </div>
  );
}

function App() {
  const [authed, setAuthed] = useScalar(authedStore);

  useEffect(() => {
    seedDemoData();
  }, []);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <EnterpriseProvider>
      <VmsProvider>
        <BrowserRouter>
          <Suspense fallback={<ModuleFallback />}>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/today" replace />} />
                <Route path="/today" element={<Today />} />
                <Route path="/calendar" element={<LegacyModule id="calendar" Component={load.calendar} />} />
                <Route path="/taskflow" element={<LegacyModule id="taskflow" Component={load.taskflow} />} />
                <Route path="/atmosphere" element={<LegacyModule id="atmosphere" Component={load.atmosphere} />} />
                <Route path="/spaceos" element={<LegacyModule id="spaceos" Component={load.spaceos} />} />
                <Route path="/pathfinder" element={<LegacyModule id="pathfinder" Component={load.pathfinder} />} />
                <Route path="/twinspace" element={<LegacyModule id="twinspace" Component={load.twinspace} padded />} />
                <Route path="/building-ops" element={<LegacyModule id="buildingops" Component={load.buildingops} />} />
                <Route path="/visitflow" element={<LegacyModule id="visitflow" Component={load.visitflow} />} />
                <Route path="/visitflow/admin" element={<LegacyModule id="vmsadmin" Component={load.vmsadmin} />} />
                <Route path="/security" element={<LegacyModule id="security" Component={load.security} />} />
                <Route path="/gather" element={<LegacyModule id="gather" Component={load.gather} />} />
                <Route path="/tribes" element={<LegacyModule id="tribes" Component={load.tribes} />} />
                <Route path="/nourish" element={<Nourish />} />
                <Route path="/omniserve" element={<LegacyModule id="omniserve" Component={load.omniserve} />} />
                <Route path="/resolve" element={<LegacyModule id="resolve" Component={load.resolve} />} />
                <Route path="/livecanvas" element={<LegacyModule id="livecanvas" Component={load.livecanvas} />} />
                <Route path="/content" element={<LegacyModule id="content" Component={load.content} />} />
                <Route path="/vault" element={<LegacyModule id="vault" Component={load.vault} />} />
                <Route path="*" element={<LegacyModule id="unbuilt" />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </VmsProvider>
    </EnterpriseProvider>
  );
}

export default App;
