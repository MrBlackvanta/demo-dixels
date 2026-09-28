import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { QrCode, Share2, Download, MapPin, Building2, Info, ArrowRight, ExternalLink, Navigation, ShieldCheck, AlertCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

interface DigitalPassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitor: any;
}

export const DigitalPassDialog: React.FC<DigitalPassDialogProps> = ({ open, onOpenChange, visitor }) => {
  const [showBackupCode, setShowBackupCode] = useState(false);

  if (!visitor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white max-h-[95vh] flex flex-col border-none shadow-2xl">
        
        {/* Pass Header */}
        <div className="bg-slate-900 text-white p-6 pb-12 text-center relative overflow-hidden flex-shrink-0">
          <div className="relative z-10 flex flex-col items-center">
             <div className="flex items-center gap-2 mb-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                <ShieldCheck size={14} className="text-teal-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Official Visitor Pass</span>
             </div>
             <h3 className="font-bold text-lg tracking-wide">THE EXECUTIVE COUNCIL HQ</h3>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-500 rounded-full blur-[60px] opacity-20" />
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 -mt-10 relative z-20">
            <div className="px-5 pb-6 flex flex-col items-center">
                {/* Profile Section */}
                <Avatar className="w-24 h-24 border-[4px] border-white shadow-xl mb-3 ring-1 ring-slate-100 bg-white">
                    <AvatarImage src={visitor.photo} />
                    <AvatarFallback className="text-3xl bg-slate-100 text-slate-600 font-bold">
                        {visitor.name?.substring(0,2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold text-slate-900 text-center leading-tight">{visitor.name}</h2>
                <div className="flex items-center gap-2 mt-1 mb-5">
                   <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 border-0">{visitor.company}</Badge>
                </div>
                
                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    <div className="bg-white p-3 rounded-xl text-center border border-slate-200 shadow-sm relative overflow-hidden group hover:border-teal-200 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 rounded-l-xl"></div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Date</p>
                        <p className="font-bold text-slate-800">{visitor.date === 'Today' ? new Date().toLocaleDateString() : visitor.date}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl text-center border border-slate-200 shadow-sm relative overflow-hidden group hover:border-teal-200 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 rounded-l-xl"></div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Time</p>
                        <p className="font-bold text-slate-800">{visitor.time}</p>
                    </div>
                </div>

                {/* Building Access & Location Section */}
                <div className="w-full space-y-3 mb-6">
                    {/* 1. Building Access */}
                    <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                                <Building2 size={18} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-blue-900 mb-1">Building Access</h4>
                                <p className="text-xs text-slate-700 font-medium">The Executive Council HQ, Tower A</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">Level 1 Main Reception • <span className="text-slate-400 italic">Opposite Central Park</span></p>
                                
                                <a 
                                    href="https://maps.google.com" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline bg-white px-2 py-1 rounded-md border border-blue-100 shadow-sm transition-all"
                                >
                                    <Navigation size={10} /> Get Directions
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    {/* 3. Meeting Location (Distinct) */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 shadow-sm">
                         <div className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                                 <MapPin size={18} />
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-1">Meeting Location</h4>
                                <p className="text-xs font-medium text-slate-700">{visitor.location || "Executive Boardroom"}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">Please wait in the lobby for your host</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 2. QR Code Section */}
                <div className="w-full mb-6">
                    {!showBackupCode ? (
                       <div className="bg-white p-6 border-[3px] border-dashed border-slate-200 rounded-2xl w-full flex flex-col items-center justify-center relative group transition-all hover:border-teal-400 hover:bg-teal-50/10">
                           <div className="absolute top-3 right-3">
                              <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 font-normal">Standard</Badge>
                           </div>
                           
                           {/* Main QR Code - Large */}
                           <div className="relative p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                              <QrCode size={180} className="text-slate-900" />
                           </div>
                           
                           <p className="text-[10px] text-slate-400 mt-3 font-mono tracking-[0.2em] font-medium">{visitor.inviteCode || 'INV-8829-XJ'}</p>
                           
                           <p className="text-[11px] text-slate-500 mt-2 font-medium bg-slate-100 px-3 py-1 rounded-full">
                              Scan at Turnstile or Kiosk
                           </p>
                       </div>
                    ) : (
                       <div className="bg-slate-900 p-6 rounded-2xl w-full flex flex-col items-center justify-center text-white relative animate-in zoom-in-95 duration-200">
                           <div className="absolute top-3 right-3">
                              <Badge className="text-[10px] bg-red-500 text-white border-0 font-bold hover:bg-red-600">BACKUP</Badge>
                           </div>
                           
                           <p className="text-xs text-slate-300 mb-4 font-medium uppercase tracking-wide">Emergency Entry Code</p>
                           
                           <div className="bg-white p-3 rounded-lg">
                              <QrCode size={180} className="text-black" />
                           </div>
                           
                           <p className="text-xs text-slate-400 mt-4 text-center max-w-[200px]">
                              Use this code if facial recognition is unavailable.
                           </p>
                       </div>
                    )}
                    
                    {/* Toggle Option */}
                    <button 
                        onClick={() => setShowBackupCode(!showBackupCode)}
                        className="w-full mt-2 text-xs text-slate-500 hover:text-slate-800 font-medium py-2 flex items-center justify-center gap-1 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        {showBackupCode ? (
                           <>Hide Backup Code</>
                        ) : (
                           <>
                             <AlertCircle size={12} className="text-amber-500" /> 
                             Issues with Face ID? View Backup Code
                           </>
                        )}
                    </button>
                </div>

                {/* 4. General Visit Instructions */}
                <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                    <div className="flex items-center gap-2 mb-3 text-slate-900">
                        <div className="bg-teal-100 p-1 rounded text-teal-700">
                           <Info size={12} />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wide">Visitor Guidelines</h4>
                    </div>
                    <ul className="space-y-2.5">
                        <li className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                           <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0"></span>
                           <span><strong>Check-in Required:</strong> Please verify your ID at the ground floor security desk upon arrival.</span>
                        </li>
                        <li className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                           <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0"></span>
                           <span><strong>Badge Policy:</strong> Keep this digital pass ready or wear your printed badge visibly at all times.</span>
                        </li>
                        <li className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                           <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0"></span>
                           <span><strong>Emergency:</strong> In case of alarm, follow green exit signs to the nearest stairwell. Do not use elevators.</span>
                        </li>
                    </ul>
                </div>

                {/* Wallet Buttons */}
                <div className="flex flex-col gap-3 w-full">
                    <Button className="w-full bg-black text-white hover:bg-slate-800 h-12 rounded-xl flex items-center justify-center gap-3 relative overflow-hidden group shadow-md transition-all hover:shadow-lg">
                        <div className="flex items-center gap-2 z-10">
                            <svg viewBox="0 0 512 512" fill="currentColor" className="w-6 h-6">
                                <path d="M360.8 288.7c-17.6-21.3-29.3-48.4-29.3-78.5 0-60.6 42.1-98.8 45.3-101.5-2.5-1.1-6-2.5-10.7-4.2-14.7-5.5-35.3-9.5-62.7 2-27.1 11.4-44.1 12.3-56.7 12.3-14.4 0-35.1-1.7-60-12.3-44.1-18.7-72.3 8.3-72.3 8.3-64.8 77.3-55 210.3 11 306.4 17.6 25.5 45.6 63.8 81 63.8 23.2 0 31.7-16.1 66.7-16.1 34.1 0 41.6 16.1 66.7 16.1 27.6 0 50.4-24.8 71.3-55.3 8.8-12.8 19.9-32.3 26.9-52.6-2.5-1.3-47.6-23.7-65.2-46.6zM286.3 75.3c15-18.4 25.1-43.9 22.3-69.8-21.6 0.9-47.8 14.4-63.3 32.7-13.9 16.3-26.1 42.6-22.8 67.7 24.1 1.9 48.8-12.2 63.8-30.6z"/>
                            </svg>
                            <span className="font-semibold text-sm">Add to Apple Wallet</span>
                        </div>
                    </Button>
                    <Button className="w-full bg-white text-black border border-slate-200 hover:bg-slate-50 h-12 rounded-xl flex items-center justify-center gap-3 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="w-6 h-6">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 4.62c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="font-semibold text-sm">Add to Google Wallet</span>
                        </div>
                    </Button>
                </div>
            </div>
        </ScrollArea>
        
        {/* Footer Actions */}
        <DialogFooter className="bg-white p-4 flex gap-3 justify-center border-t border-slate-100 flex-shrink-0 z-30">
           <Button variant="outline" size="sm" className="gap-2 flex-1 border-slate-200">
              <Share2 size={16} /> Share Pass
           </Button>
           <Button variant="outline" size="sm" className="gap-2 flex-1 border-slate-200" onClick={() => window.print()}>
              <Download size={16} /> Download PDF
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
