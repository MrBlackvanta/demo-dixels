import { useScalar } from '../../../lib/store';
import { persona as personaStore } from '../../../lib/data';
import { FrontDesk } from './FrontDesk';
import { HostConsole } from './HostConsole';

const DESK_PERSONAS = ['Reception', 'Security'];

export function VisitFlow() {
  const [persona] = useScalar(personaStore);

  return (
    <div className="relative">
      <div className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70" aria-hidden="true" />

      <div className="relative mx-auto max-w-[76rem] px-6 py-8">
        {DESK_PERSONAS.includes(persona) ? <FrontDesk /> : <HostConsole />}
      </div>
    </div>
  );
}
