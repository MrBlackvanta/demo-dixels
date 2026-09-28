import React from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { CreditCard, AlertTriangle } from 'lucide-react';

interface CheckOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitor: any;
  onConfirm: (returnBadge: boolean) => void;
}

export const CheckOutDialog: React.FC<CheckOutDialogProps> = ({
  open,
  onOpenChange,
  visitor,
  onConfirm
}) => {
  if (!visitor) return null;

  const hasBadge = !!visitor.badgeNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Check Out Visitor</DialogTitle>
          <DialogDescription>
             Confirm check-out for <strong>{visitor.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {hasBadge && (
           <div className="flex flex-col items-center justify-center py-6 gap-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                 <CreditCard size={24} />
              </div>
              <div className="text-center">
                 <h3 className="text-lg font-bold text-amber-900">Collect Badge #{visitor.badgeNumber}</h3>
                 <p className="text-sm text-amber-700">Visitor must return their badge before leaving.</p>
              </div>
           </div>
        )}
        
        {!hasBadge && (
           <div className="py-4 text-slate-600">
              Visitor has no physical badge assigned. Proceed with checkout?
           </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-between">
          {hasBadge ? (
             <>
               <Button 
                  variant="destructive" 
                  size="sm"
                  className="mr-auto"
                  onClick={() => {
                     if (confirm("Are you sure? This marks the badge as LOST.")) {
                        onConfirm(false); // Lost
                        onOpenChange(false);
                     }
                  }}
               >
                  Badge Lost
               </Button>
               <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button onClick={() => {
                     onConfirm(true); // Returned
                     onOpenChange(false);
                  }}>
                     Badge Returned
                  </Button>
               </div>
             </>
          ) : (
             <>
               <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
               <Button onClick={() => {
                  onConfirm(true); 
                  onOpenChange(false);
               }}>
                  Confirm Checkout
               </Button>
             </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
