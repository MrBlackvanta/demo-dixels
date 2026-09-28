import { useScalar } from '../../../lib/store';
import { persona as personaStore } from '../../../lib/data';
import { DeskConsole } from './DeskConsole';
import { RequestConsole } from './RequestConsole';

const DESK_PERSONAS = ['FacilityManager', 'Admin'];

export function OmniServe() {
  const [persona] = useScalar(personaStore);

  return (
    <div className="relative">
      <div
        className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[76rem] px-6 py-8">
        {DESK_PERSONAS.includes(persona) ? <DeskConsole /> : <RequestConsole />}
      </div>
    </div>
  );
}
