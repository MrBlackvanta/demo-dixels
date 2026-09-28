import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { QrCode, UserPlus, ChevronRight, ArrowLeft, Camera, CheckCircle2, PenTool, Printer, User, Keyboard, Loader2, ScanFace, MapPin, Navigation, AlertTriangle, Siren } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { useVms } from './VmsContext';

export const VmsKiosk: React.FC = () => {
  const { findVisitorByCode, updateVisitor, visitors, emergencyMode } = useVms();
  const [step, setStep] = useState<'home' | 'scan' | 'face-scan' | 'code' | 'details' | 'photo' | 'nda' | 'success'>('home');
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null as number | string | null,
    name: '',
    email: '',
    company: '',
    host: '',
    photo: null as string | null,
    inviteCode: '',
    location: ''
  });
  
  // Signature Mock
  const [agreedToNDA, setAgreedToNDA] = useState(false);

  // If Emergency Mode is active, override everything
  if (emergencyMode) {
     return (
        <div className="h-full w-full bg-red-600 flex flex-col items-center justify-center text-white p-8 relative overflow-hidden animate-in fade-in duration-300">
           {/* Flashing Background Effect */}
           <div className="absolute inset-0 bg-red-700/50 animate-pulse" />
           
           <div className="z-10 text-center max-w-2xl space-y-8">
              <div className="h-40 w-40 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                 <Siren size={80} className="text-white drop-shadow-lg" />
              </div>
              
              <h1 className="text-6xl font-black tracking-tight drop-shadow-md">EVACUATE</h1>
              <h2 className="text-3xl font-bold text-red-100">EMERGENCY PROTOCOL ACTIVATED</h2>
              
              <div className="bg-white text-red-700 rounded-xl p-8 shadow-2xl text-left space-y-4">
                 <div className="flex items-center gap-4">
                    <AlertTriangle size={32} />
                    <span className="text-xl font-bold">INSTRUCTIONS:</span>
                 </div>
                 <ol className="list-decimal list-inside space-y-2 text-xl font-medium">
                    <li>Stop check-in procedures immediately.</li>
                    <li>Proceed to the nearest emergency exit.</li>
                    <li>Do not use elevators.</li>
                    <li>Assemble at <strong>Muster Point A</strong> (Main Parking Lot).</li>
                 </ol>
              </div>

              <div className="text-red-200 font-mono text-sm animate-pulse">
                 SYSTEM LOCKED • CHECK-IN SUSPENDED
              </div>
           </div>
        </div>
     );
  }

  const handleCapture = () => {
    setFormData(prev => ({ ...prev, photo: 'captured' }));
    setStep('nda');
  };

  const simulateScan = () => {
     setLoading(true);
     // Find a mock visitor to simulate (the first one that is not checked in)
     const targetVisitor = visitors.find(v => v.status === 'expected' || v.status === 'upcoming' || v.status === 'registered') || visitors[0];

     setTimeout(() => {
        setLoading(false);
        if (targetVisitor) {
           setFormData({
              id: targetVisitor.id,
              name: targetVisitor.name,
              email: targetVisitor.email,
              company: targetVisitor.company,
              host: targetVisitor.host,
              photo: targetVisitor.photo || null,
              inviteCode: targetVisitor.inviteCode || 'QR-SCAN',
              location: targetVisitor.location || 'Main Conference Room'
           });
           
           if (!targetVisitor.photo) {
              toast.info(`Welcome ${targetVisitor.name.split(' ')[0]}. Face ID registration required for entry.`);
              setStep('photo');
           } else {
              toast.success(`Invite found! Welcome back, ${targetVisitor.name.split(' ')[0]}.`);
              setStep('nda');
           }
        } else {
           toast.error("No valid invite found in simulation.");
        }
     }, 1500);
  };

  const simulateFaceScan = () => {
     setLoading(true);
     // Simulate finding a registered face
     const targetVisitor = visitors.find(v => v.status === 'expected' || v.status === 'upcoming' || v.status === 'registered') || visitors[0];
     
     setTimeout(() => {
        setLoading(false);
        if (targetVisitor) {
           setFormData({
              id: targetVisitor.id,
              name: targetVisitor.name,
              email: targetVisitor.email,
              company: targetVisitor.company,
              host: targetVisitor.host,
              photo: 'captured', // Face ID implies photo exists
              inviteCode: targetVisitor.inviteCode || 'FACE-ID',
              location: targetVisitor.location || 'Main Conference Room'
           });
           toast.success(`Face Identified: ${targetVisitor.name}`);
           setStep('nda');
        } else {
           toast.error("Face not recognized. Please use QR code.");
        }
     }, 2000);
  };

  const verifyCode = () => {
     if (formData.inviteCode.length < 4) {
        toast.error("Invalid code");
        return;
     }
     setLoading(true);
     
     // Check context
     const visitor = findVisitorByCode(formData.inviteCode);
     
     setTimeout(() => {
        setLoading(false);
        if (visitor) {
           setFormData({
              id: visitor.id,
              name: visitor.name,
              email: visitor.email,
              company: visitor.company,
              host: visitor.host,
              photo: visitor.photo || null,
              inviteCode: visitor.inviteCode || '',
              location: visitor.location || 'Main Conference Room'
           });

           if (!visitor.photo) {
              toast.info(`Welcome ${visitor.name}. Face ID registration required for entry.`);
              setStep('photo');
           } else {
              toast.success(`Code verified. Welcome, ${visitor.name}.`);
              setStep('nda');
           }
        } else {
           toast.error("Invite code not found. Please try again.");
        }
     }, 1000);
  };

  const completeCheckIn = () => {
     if (formData.id) {
        updateVisitor(formData.id, { 
           status: 'checked-in', 
           photo: formData.photo 
        });
     }
     setStep('success');
  };

  return (
    <div className="h-full flex flex-col bg-white font-sans relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-600/5 skew-x-12 translate-x-20 pointer-events-none" />
       
       {/* Header / Branding */}
       <div className="absolute top-8 left-12 z-20 pointer-events-none">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-200">D</div>
             <span className="text-xl font-bold text-slate-900">Dixels HQ</span>
          </div>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10 overflow-y-auto">
          <AnimatePresence mode="wait">
             
             {/* HOME SCREEN */}
             {step === 'home' && (
                <motion.div 
                   key="home"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="text-center w-full max-w-4xl"
                >
                   <div className="mb-16">
                      <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">Welcome to Dixels Platform</h1>
                      <p className="text-xl text-slate-500">Please select an option to begin your check-in</p>
                   </div>

                   <div className="grid grid-cols-3 gap-6">
                      <button 
                         onClick={() => setStep('scan')}
                         className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-teal-500 hover:shadow-xl hover:shadow-teal-100 hover:-translate-y-1 transition-all group duration-300"
                      >
                         <div className="h-24 w-24 rounded-full bg-teal-50 flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            <QrCode size={40} />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-2">Scan Invite</h3>
                         <p className="text-slate-500 text-center text-sm">QR Code or Invite Code</p>
                      </button>

                      <button 
                         onClick={() => setStep('face-scan')}
                         className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-purple-500 hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 transition-all group duration-300 relative overflow-hidden"
                      >
                         {/* Badge for 'New' */}
                         <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full">FAST</div>
                         
                         <div className="h-24 w-24 rounded-full bg-purple-50 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <ScanFace size={40} />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-2">Face Check-in</h3>
                         <p className="text-slate-500 text-center text-sm">Biometric Fast Track</p>
                      </button>

                      <button 
                         onClick={() => setStep('details')}
                         className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 transition-all group duration-300"
                      >
                         <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <UserPlus size={40} />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-2">New Visitor</h3>
                         <p className="text-slate-500 text-center text-sm">Register for a visit</p>
                      </button>
                   </div>
                </motion.div>
             )}

             {/* SCAN QR SCREEN */}
             {step === 'scan' && (
                <motion.div
                   key="scan"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.1 }}
                   className="w-full max-w-md text-center"
                >
                   <h2 className="text-3xl font-bold text-slate-900 mb-8">Scan Your Invite</h2>
                   
                   {isLoading ? (
                      <div className="bg-slate-50 rounded-3xl aspect-square w-full mb-8 flex flex-col items-center justify-center">
                         <Loader2 size={48} className="text-teal-600 animate-spin mb-4" />
                         <p className="text-slate-500 font-medium">Verifying invite...</p>
                      </div>
                   ) : (
                      <div className="bg-black rounded-3xl aspect-square w-full mb-8 flex items-center justify-center relative overflow-hidden shadow-2xl group cursor-pointer" onClick={simulateScan}>
                         <div className="absolute inset-0 border-4 border-teal-500/50 rounded-3xl animate-pulse z-10" />
                         <Camera size={48} className="text-slate-700 mb-2" />
                         <span className="text-slate-500 absolute bottom-8">Align QR code within frame</span>
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                         
                         {/* Overlay for interaction hint */}
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium">Tap to simulate scan</span>
                         </div>
                      </div>
                   )}
                   
                   <div className="space-y-4">
                      <Button variant="outline" className="w-full h-12" onClick={() => setStep('code')}>
                         <Keyboard className="mr-2" size={18} /> Enter Invite Code Manually
                      </Button>
                      <Button size="lg" variant="ghost" onClick={() => setStep('home')} className="w-full text-slate-400">
                         Cancel
                      </Button>
                   </div>
                </motion.div>
             )}

             {/* FACE SCAN SCREEN */}
             {step === 'face-scan' && (
                <motion.div
                   key="face-scan"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.1 }}
                   className="w-full max-w-md text-center"
                >
                   <h2 className="text-3xl font-bold text-slate-900 mb-8">Look at the Camera</h2>
                   
                   {isLoading ? (
                      <div className="bg-slate-50 rounded-full aspect-square w-64 mx-auto mb-8 flex flex-col items-center justify-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-green-500/20 animate-pulse" />
                         <CheckCircle2 size={64} className="text-green-600 mb-4 z-10" />
                         <p className="text-green-700 font-bold z-10">Face Recognized!</p>
                      </div>
                   ) : (
                      <div className="bg-black rounded-full aspect-square w-64 mx-auto mb-8 flex items-center justify-center relative overflow-hidden shadow-2xl group cursor-pointer border-4 border-white" onClick={simulateFaceScan}>
                         <div className="absolute inset-0 border-4 border-purple-500/50 rounded-full animate-pulse z-10" />
                         <User size={80} className="text-slate-700" />
                         
                         {/* Face Grid Overlay */}
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-30"></div>
                         
                         {/* Scanning Beam */}
                         <motion.div 
                            className="absolute top-0 w-full h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"
                            animate={{ top: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                         />

                         <div className="absolute bottom-6 text-white/80 text-xs font-mono">BIOMETRIC SCAN</div>
                         
                         {/* Overlay for interaction hint */}
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <span className="text-white font-medium">Tap to Scan</span>
                         </div>
                      </div>
                   )}
                   
                   <div className="space-y-4">
                      <p className="text-slate-500 text-sm mb-4">Please remove sunglasses and face mask</p>
                      <Button size="lg" variant="ghost" onClick={() => setStep('home')} className="w-full text-slate-400">
                         Cancel
                      </Button>
                   </div>
                </motion.div>
             )}

             {/* MANUAL CODE ENTRY */}
             {step === 'code' && (
                <motion.div
                   key="code"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="w-full max-w-md text-center"
                >
                   <h2 className="text-3xl font-bold text-slate-900 mb-2">Enter Invite Code</h2>
                   <p className="text-slate-500 mb-8">Found in your invitation email</p>

                   <div className="space-y-6">
                      <Input 
                         className="h-16 text-center text-2xl font-mono tracking-[0.5em] uppercase bg-slate-50"
                         placeholder="INV-XXXX"
                         maxLength={9}
                         value={formData.inviteCode}
                         onChange={e => setFormData({...formData, inviteCode: e.target.value.toUpperCase()})}
                      />
                      
                      <Button 
                         size="lg" 
                         className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-700 text-white"
                         onClick={verifyCode}
                         disabled={isLoading || !formData.inviteCode}
                      >
                         {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                      </Button>
                      
                      <Button size="lg" variant="ghost" onClick={() => setStep('scan')} className="w-full text-slate-400">
                         Back to Camera
                      </Button>
                   </div>
                </motion.div>
             )}

             {/* REGISTRATION: DETAILS */}
             {step === 'details' && (
                <motion.div
                   key="details"
                   initial={{ opacity: 0, x: 50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -50 }}
                   className="w-full max-w-lg"
                >
                   <div className="mb-8 text-center">
                      <div className="flex justify-center gap-2 mb-4">
                         <div className="h-2 w-2 rounded-full bg-blue-600" />
                         <div className="h-2 w-2 rounded-full bg-slate-200" />
                         <div className="h-2 w-2 rounded-full bg-slate-200" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">Your Details</h2>
                      <p className="text-slate-500">Please tell us a bit about yourself</p>
                   </div>

                   <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="space-y-2">
                         <Label className="text-base">Full Name</Label>
                         <Input 
                            className="h-14 text-lg bg-slate-50" 
                            placeholder="e.g. Jane Doe"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-base">Email Address</Label>
                         <Input 
                            className="h-14 text-lg bg-slate-50" 
                            placeholder="jane@company.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-base">Company</Label>
                         <Input 
                            className="h-14 text-lg bg-slate-50" 
                            placeholder="e.g. Acme Inc."
                            value={formData.company}
                            onChange={e => setFormData({...formData, company: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-base">Visiting Host</Label>
                         <Select value={formData.host} onValueChange={v => setFormData({...formData, host: v})}>
                            <SelectTrigger className="h-14 text-lg bg-slate-50">
                               <SelectValue placeholder="Select who you're visiting" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                               <SelectItem value="John Doe">John Doe</SelectItem>
                               <SelectItem value="Facilities">Facilities Manager</SelectItem>
                               <SelectItem value="HR">Human Resources</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   <div className="flex gap-4 mt-8">
                      <Button size="lg" variant="outline" onClick={() => setStep('home')} className="flex-1 h-14 text-lg">Cancel</Button>
                      <Button 
                         size="lg" 
                         className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                         disabled={!formData.name || !formData.host}
                         onClick={() => setStep('photo')}
                      >
                         Continue <ChevronRight className="ml-2" />
                      </Button>
                   </div>
                </motion.div>
             )}

             {/* REGISTRATION: PHOTO */}
             {step === 'photo' && (
                <motion.div
                   key="photo"
                   initial={{ opacity: 0, x: 50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -50 }}
                   className="w-full max-w-lg text-center"
                >
                   <div className="mb-8">
                      <div className="flex justify-center gap-2 mb-4">
                         <div className="h-2 w-2 rounded-full bg-blue-200" />
                         <div className="h-2 w-2 rounded-full bg-blue-600" />
                         <div className="h-2 w-2 rounded-full bg-slate-200" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">Face Registration</h2>
                      <p className="text-slate-500">Required for secure entry</p>
                   </div>

                   <div className="relative bg-slate-900 rounded-2xl aspect-[4/3] w-full mb-8 overflow-hidden shadow-lg group">
                      {/* Camera Simulation */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <User size={120} className="text-slate-700" />
                      </div>
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                         <button 
                            onClick={handleCapture}
                            className="h-16 w-16 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center hover:scale-105 hover:border-blue-500 transition-all shadow-lg"
                         >
                            <div className="h-12 w-12 bg-red-500 rounded-full" />
                         </button>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                         <div className="px-2 py-1 bg-black/50 text-white text-xs rounded font-mono flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> LIVE
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      {/* Only show back if we came from details (no ID) - hard to detect in this simple state, but OK */}
                      <Button size="lg" variant="outline" onClick={() => setStep('home')} className="flex-1 h-14 text-lg">Cancel</Button>
                      {/* Enforced means no skipping */}
                      {/* <Button size="lg" variant="ghost" onClick={handleCapture} className="text-slate-400">Skip</Button> */}
                   </div>
                </motion.div>
             )}

             {/* REGISTRATION: NDA */}
             {step === 'nda' && (
                <motion.div
                   key="nda"
                   initial={{ opacity: 0, x: 50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -50 }}
                   className="w-full max-w-2xl"
                >
                   <div className="mb-6 text-center">
                      <div className="flex justify-center gap-2 mb-4">
                         <div className="h-2 w-2 rounded-full bg-blue-200" />
                         <div className="h-2 w-2 rounded-full bg-blue-200" />
                         <div className="h-2 w-2 rounded-full bg-blue-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">Security & Compliance</h2>
                      <p className="text-slate-500">Please review and sign the Non-Disclosure Agreement</p>
                   </div>

                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-64 overflow-y-auto mb-6 text-sm text-slate-600 font-serif leading-relaxed shadow-inner">
                      <h4 className="font-bold text-slate-900 mb-2 uppercase">Non-Disclosure Agreement</h4>
                      <p className="mb-4">This Non-Disclosure Agreement (the "Agreement") is entered into by and between Dixels Platform ("Disclosing Party") and the Visitor ("Receiving Party") for the purpose of preventing the unauthorized disclosure of Confidential Information as defined below.</p>
                      <p className="mb-4">1. <strong>Confidential Information.</strong> "Confidential Information" shall mean all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged.</p>
                      <p className="mb-4">2. <strong>Obligations of Receiving Party.</strong> Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party.</p>
                      <p className="mb-4">3. <strong>Time Period.</strong> The nondisclosure provisions of this Agreement shall survive the termination of this Agreement and Receiving Party's duty to hold Confidential Information in confidence shall remain in effect until the Confidential Information no longer qualifies as a trade secret or until Disclosing Party sends Receiving Party written notice releasing Receiving Party from this Agreement.</p>
                      <p>By signing below, I acknowledge that I have read and understand the terms of this Agreement.</p>
                   </div>

                   <div 
                      className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 mb-6 text-center cursor-pointer hover:border-blue-400 transition-colors relative"
                      onClick={() => setAgreedToNDA(true)}
                   >
                      {agreedToNDA ? (
                         <div className="flex flex-col items-center text-blue-600">
                            <div className="font-handwriting text-4xl mb-2 transform -rotate-2">{formData.name || 'Visitor Signature'}</div>
                            <p className="text-xs text-slate-400">Digitally Signed on {new Date().toLocaleDateString()}</p>
                            <div className="absolute top-2 right-2 text-green-500"><CheckCircle2 /></div>
                         </div>
                      ) : (
                         <div className="flex flex-col items-center text-slate-400">
                            <PenTool className="mb-2" />
                            <span className="font-medium">Tap here to sign digitally</span>
                         </div>
                      )}
                   </div>

                   <div className="flex gap-4">
                      <Button size="lg" variant="outline" onClick={() => setStep('photo')} className="flex-1 h-14 text-lg">Back</Button>
                      <Button 
                         size="lg" 
                         className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                         disabled={!agreedToNDA}
                         onClick={completeCheckIn}
                      >
                         Complete Check-in
                      </Button>
                   </div>
                </motion.div>
             )}

             {/* SUCCESS & BADGE */}
             {step === 'success' && (
                <motion.div
                   key="success"
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center w-full max-w-lg"
                >
                   <div className="mb-6">
                      <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-lg shadow-green-50">
                         <CheckCircle2 size={40} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">You're all set!</h2>
                      <p className="text-slate-500 text-sm">{formData.host} has been notified.</p>
                   </div>

                   {/* Digital Wayfinding */}
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <Navigation size={16} className="text-teal-600" />
                            <span className="font-bold text-sm text-slate-700">Directions</span>
                         </div>
                         <span className="text-[10px] font-mono bg-white border px-2 py-1 rounded text-slate-500 max-w-[150px] truncate">
                            {formData.location}
                         </span>
                      </div>
                      <div className="relative aspect-[2/1] bg-slate-100 p-4 overflow-hidden">
                         {/* Simple SVG Floorplan */}
                         <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-sm select-none">
                            <defs>
                               <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                               </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            
                            {/* Building Outline */}
                            <rect x="10" y="10" width="380" height="180" rx="4" fill="white" stroke="#cbd5e1" strokeWidth="2" />
                            
                            {/* Corridors */}
                            <path d="M 50 100 L 350 100" stroke="#f1f5f9" strokeWidth="40" />
                            <path d="M 120 20 L 120 180" stroke="#f1f5f9" strokeWidth="30" />
                            
                            {/* Rooms (Generic Layout) */}
                            <rect x="20" y="20" width="80" height="60" rx="2" fill="#f8fafc" stroke="#e2e8f0" />
                            <rect x="20" y="120" width="80" height="60" rx="2" fill="#f8fafc" stroke="#e2e8f0" />
                            
                            <rect x="150" y="20" width="80" height="60" rx="2" fill="#f8fafc" stroke="#e2e8f0" />
                            <rect x="150" y="120" width="80" height="60" rx="2" fill="#f8fafc" stroke="#e2e8f0" />
                            
                            {/* Destination Zone (Highlighted) */}
                            <g className="animate-pulse">
                               <rect x="260" y="20" width="110" height="160" rx="4" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                               <text x="315" y="100" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#059669">DESTINATION</text>
                               <text x="315" y="115" fontSize="8" textAnchor="middle" fill="#059669">{formData.location.split(',')[0]}</text>
                            </g>
                            
                            {/* Path */}
                            <path 
                               d="M 50 100 L 120 100 L 120 100 L 260 100" 
                               fill="none"
                               stroke="#10b981" 
                               strokeWidth="3" 
                               strokeLinecap="round" 
                               strokeDasharray="6 6"
                            />
                            
                            {/* Start Point */}
                            <circle cx="50" cy="100" r="6" fill="#0f172a" stroke="white" strokeWidth="2" />
                            <text x="50" y="125" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0f172a">YOU</text>
                            
                            {/* End Point */}
                            <circle cx="260" cy="100" r="6" fill="#10b981" stroke="white" strokeWidth="2" />
                         </svg>
                      </div>
                      <div className="bg-slate-50 p-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
                         Follow the green indicators to your meeting room
                      </div>
                   </div>

                   {/* Digital Badge Preview */}
                   <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden mb-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-teal-600 p-3 text-white text-center">
                         <div className="font-bold text-sm tracking-wider">VISITOR PASS</div>
                      </div>
                      <div className="p-4">
                         <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-100 flex-shrink-0">
                               {formData.photo === 'captured' ? (
                                  <User size={80} className="text-slate-400 translate-y-2 translate-x-1" />
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
                               )}
                            </div>
                            <div className="text-left flex-1">
                               <h3 className="text-xl font-bold text-slate-900 leading-tight">{formData.name}</h3>
                               <p className="text-sm text-slate-500 mb-2">{formData.company}</p>
                               <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0">Authorized</Badge>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 text-left border-t border-slate-100 pt-4 mt-4">
                            <div>
                               <p className="text-[10px] text-slate-400 uppercase">Host</p>
                               <p className="font-medium text-sm text-slate-900">{formData.host}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-slate-400 uppercase">Valid Until</p>
                               <p className="font-medium text-sm text-slate-900">18:00 TODAY</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <Button size="lg" className="w-full h-12 text-base bg-slate-900 text-white" onClick={() => {
                      toast.info("Printing Badge...");
                      setTimeout(() => setStep('home'), 2000);
                   }}>
                      <Printer className="mr-2" size={18} /> Print Badge & Close
                   </Button>
                </motion.div>
             )}

          </AnimatePresence>
       </div>
    </div>
  );
};