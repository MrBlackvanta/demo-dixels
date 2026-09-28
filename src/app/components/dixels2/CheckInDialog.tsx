import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useVms } from './VmsContext';
import { CreditCard, User, AlertCircle, Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../ui/utils';

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitor: any;
  onConfirm: (badgeNumber?: string) => void;
}

export const CheckInDialog: React.FC<CheckInDialogProps> = ({
  open,
  onOpenChange,
  visitor,
  onConfirm
}) => {
  const { badges } = useVms();
  const [selectedBadge, setSelectedBadge] = useState<string>('none');
  const [openCombobox, setOpenCombobox] = useState(false);
  
  const availableBadges = badges.filter(b => b.status === 'available');

  if (!visitor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Check In Visitor</DialogTitle>
          <DialogDescription>
            Assign a visitor badge to complete check-in.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
           <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="bg-white p-2 rounded-full border border-slate-200">
                 <User className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                 <p className="font-medium text-slate-900">{visitor.name}</p>
                 <p className="text-sm text-slate-500">{visitor.company}</p>
                 <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{visitor.type}</span>
                    <span className="text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Host: {visitor.host}</span>
                 </div>
              </div>
           </div>

           <div className="space-y-3">
              <Label className="flex items-center gap-2">
                 <CreditCard size={14} /> Assign Badge (Optional)
              </Label>
              
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                 <PopoverTrigger asChild>
                    <Button
                       variant="outline"
                       role="combobox"
                       aria-expanded={openCombobox}
                       className="w-full justify-between"
                    >
                       {selectedBadge !== 'none'
                          ? `Badge #${availableBadges.find((b) => b.number === selectedBadge)?.number}`
                          : "Select a badge..."}
                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-[380px] p-0">
                    <Command>
                       <CommandInput placeholder="Search badge number..." />
                       <CommandList>
                           <CommandEmpty>No available badges found.</CommandEmpty>
                           <CommandGroup>
                              <CommandItem
                                 value="none"
                                 onSelect={() => {
                                    setSelectedBadge('none');
                                    setOpenCombobox(false);
                                 }}
                              >
                                 <Check
                                    className={cn(
                                       "mr-2 h-4 w-4",
                                       selectedBadge === 'none' ? "opacity-100" : "opacity-0"
                                    )}
                                 />
                                 No Badge / Digital Only
                              </CommandItem>
                              {availableBadges.map((badge) => (
                                 <CommandItem
                                    key={badge.id}
                                    value={badge.number}
                                    onSelect={(currentValue) => {
                                       setSelectedBadge(currentValue === selectedBadge ? 'none' : currentValue);
                                       setOpenCombobox(false);
                                    }}
                                 >
                                    <Check
                                       className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedBadge === badge.number ? "opacity-100" : "opacity-0"
                                       )}
                                    />
                                    Badge #{badge.number}
                                 </CommandItem>
                              ))}
                           </CommandGroup>
                       </CommandList>
                    </Command>
                 </PopoverContent>
              </Popover>

              {selectedBadge === 'none' && (
                 <div className="flex items-center gap-2 text-amber-600 text-xs mt-2 bg-amber-50 p-2 rounded border border-amber-100">
                    <AlertCircle size={12} />
                    <span>Warning: Physical badge is recommended for security.</span>
                 </div>
              )}
           </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
             onConfirm(selectedBadge === 'none' ? undefined : selectedBadge);
             onOpenChange(false);
          }}>
             Complete Check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
