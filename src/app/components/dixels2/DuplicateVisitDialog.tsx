import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Calendar as CalendarIcon, Clock, Edit } from 'lucide-react';

interface DuplicateVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitor: any;
  onDuplicate: (date: string, time: string) => void;
  onEditFull: () => void;
  isReception?: boolean;
}

export const DuplicateVisitDialog: React.FC<DuplicateVisitDialogProps> = ({
  open,
  onOpenChange,
  visitor,
  onDuplicate,
  onEditFull,
  isReception = false
}) => {
  // Default to tomorrow
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    if (open && visitor) {
        setDate(getTomorrowDate());
        setTime(visitor.time || '09:00');
    }
  }, [open, visitor]);

  if (!visitor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Duplicate Visit</DialogTitle>
          <DialogDescription>
            Re-invite <strong>{visitor.name}</strong> from {visitor.company}?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon size={14} /> New Date
              </Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock size={14} /> New Time
              </Label>
              <Input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600 border border-slate-100">
             <div className="flex justify-between items-start">
                <div>
                   <p className="font-medium text-slate-800">Review Details</p>
                   <p>Type: {visitor.type}</p>
                   {visitor.type === 'VVIP' && <p className="text-amber-600">VVIP Protocol Active</p>}
                   <p>Location: {visitor.location || 'My Office'}</p>
                </div>
                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-auto p-1 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                   onClick={() => {
                      onOpenChange(false);
                      onEditFull();
                   }}
                >
                   <Edit size={12} className="mr-1" /> Edit
                </Button>
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
             onDuplicate(date, time);
             onOpenChange(false);
          }}>
             Schedule Visit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
