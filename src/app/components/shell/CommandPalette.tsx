import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Coffee, RotateCcw, Sparkles, UserPlus } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command';
import { ALL_PRODUCTS, NAV_BY_PERSONA } from '../../lib/products';
import type { Persona } from '../../lib/products';
import { resetDemo } from '../../lib/store';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona;
}

export function CommandPalette({ open, onOpenChange, persona }: CommandPaletteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  const available = NAV_BY_PERSONA[persona].flatMap((group) => group.items);
  const availableIds = new Set(available.map((product) => product.id));
  const rest = ALL_PRODUCTS.filter((product) => !availableIds.has(product.id));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search products, or ask Cortex…" />
      <CommandList>
        <CommandEmpty>Nothing matched.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => run(() => navigate('/nourish'))}>
            <Coffee size={15} aria-hidden="true" />
            Order a coffee
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/visitflow'))}>
            <UserPlus size={15} aria-hidden="true" />
            Invite a guest
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/cortex'))}>
            <Sparkles size={15} aria-hidden="true" />
            Ask Cortex to plan my day
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Your products">
          {available.map((product) => (
            <CommandItem
              key={product.id}
              value={`${product.name} ${product.descriptor}`}
              onSelect={() => run(() => navigate(product.path))}
            >
              <product.icon size={15} aria-hidden="true" />
              <span>{product.name}</span>
              <span className="ml-auto text-[0.6875rem] text-ink-subtle">{product.descriptor}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {rest.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="All Dixels">
              {rest.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.descriptor}`}
                  onSelect={() => run(() => navigate(product.path))}
                >
                  <product.icon size={15} aria-hidden="true" />
                  <span>{product.name}</span>
                  <span className="ml-auto text-[0.6875rem] text-ink-subtle">
                    {product.descriptor}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Demo">
          <CommandItem
            onSelect={() =>
              run(() => {
                resetDemo();
                window.location.reload();
              })
            }
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset demo data
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
