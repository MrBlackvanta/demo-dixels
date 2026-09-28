import type { ComponentType } from 'react';
import { useLocation } from 'react-router';
import { Sparkles } from 'lucide-react';
import { persona as personaStore } from '../../lib/data';
import { productByPath } from '../../lib/products';
import { useScalar } from '../../lib/store';
import { cn } from '../ui/utils';

interface LegacyModuleProps {
  id: string;
  Component?: ComponentType<{ persona?: string }>;
  withPersona?: boolean;
  padded?: boolean;
}

export function LegacyModule({ id, Component, withPersona, padded }: LegacyModuleProps) {
  const location = useLocation();
  const [persona] = useScalar(personaStore);
  const product = productByPath(location.pathname);

  if (!Component) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-lg place-items-center px-6 text-center">
        <div>
          <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Sparkles size={20} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="dx-h3 mb-2">{product?.name ?? 'This Dixel'}</h2>
          <p className="text-body text-ink-muted">
            {product?.descriptor ?? 'Not part of the demo yet'} — queued for the revamp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-legacy-module={id} className={cn('dx-legacy', padded && 'p-6')}>
      {withPersona ? <Component persona={persona} /> : <Component />}
    </div>
  );
}
