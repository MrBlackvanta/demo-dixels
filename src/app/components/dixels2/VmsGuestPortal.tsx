import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronRight, 
  Camera, 
  ShieldCheck, 
  User, 
  ArrowRight,
  ScanLine,
  Loader2,
  ArrowLeft,
  Fingerprint,
  CreditCard,
  Globe,
  Building2,
  ScanFace,
  PenTool,
  QrCode
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardFooter } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';

// Types
type RegistrationStep = 'email' | 'otp' | 'method' | 'details' | 'id-scan' | 'nda' | 'face-id' | 'success';

interface FormData {
  email: string;
  otp: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  countryCode: string;
  mobile: string;
  company: string;
  idType: string;
  idNumber: string;
  idImage: string | null;
  faceImage: string | null;
  parking: boolean;
  plate: string;
  ndaSigned: boolean;
  signatureName: string;
  location: string;
}

const INITIAL_DATA: FormData = {
  email: '',
  otp: '',
  firstName: '',
  secondName: '',
  thirdName: '',
  lastName: '',
  countryCode: '+971',
  mobile: '',
  company: '',
  idType: 'emirates-id',
  idNumber: '',
  idImage: null,
  faceImage: null,
  parking: false,
  plate: '',
  ndaSigned: false,
  signatureName: '',
  location: 'Global HQ, Level 3 - Executive Boardroom'
};

export const VmsGuestPortal: React.FC = () => {
  const [step, setStep] = useState<RegistrationStep>('email');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [cameraActive, setCameraActive] = useState(false);
  const [showBackupQr, setShowBackupQr] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Simulation of sending OTP
  const handleSendOTP = () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast.success(`OTP sent to ${formData.email}`);
    }, 1000);
  };

  // Simulation of verifying OTP
  const handleVerifyOTP = () => {
    if (formData.otp.length < 4) {
      toast.error("Please enter the 4-digit code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('method'); // Go to method selection (UAE Pass vs Manual)
    }, 1000);
  };

  // Digital ID Integration Simulation
  const handleDigitalIdLogin = (provider: 'uae-pass' | 'nafath') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate pulling data from provider
      setFormData(prev => ({
        ...prev,
        firstName: provider === 'uae-pass' ? 'Ahmed' : 'Mohammed',
        secondName: 'Bin',
        thirdName: provider === 'uae-pass' ? 'Saeed' : 'Abdullah',
        lastName: provider === 'uae-pass' ? 'Al-Mansoori' : 'Al-Saud',
        mobile: '501234567',
        idNumber: provider === 'uae-pass' ? '784-1990-1234567-1' : '1012345678',
        idType: provider === 'uae-pass' ? 'emirates-id' : 'national-id'
      }));
      toast.success(`Authenticated with ${provider === 'uae-pass' ? 'UAE PASS' : 'Nafath'}`);
      setStep('details'); // Go to review details
    }, 2000);
  };

  // Simulated OCR Scanning
  const handleScanId = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFormData(prev => ({
        ...prev,
        firstName: 'John',
        lastName: 'Doe',
        idNumber: '784-1985-5551234-2',
        idImage: 'scanned'
      }));
      toast.success("ID Scanned & Data Parsed");
      setStep('details'); // Populate details after scan
    }, 2500);
  };

  const handleFaceCapture = () => {
    setCameraActive(true);
    setTimeout(() => {
      setCameraActive(false);
      setFormData(prev => ({ ...prev, faceImage: 'captured' }));
      toast.success("Face Biometrics Enrolled");
      setStep('success');
    }, 3000);
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <div className="space-y-3 pt-2">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Welcome Visitor</h3>
              <p className="text-xs text-slate-500">Enter your email to begin secure registration</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email Address</Label>
              <Input 
                type="email" 
                placeholder="name@company.com" 
                className="h-10"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <Button className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-sm" onClick={handleSendOTP} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Send OTP Code"}
            </Button>
          </div>
        );

      case 'otp':
        return (
          <div className="space-y-3 pt-2">
             <Button variant="ghost" size="sm" className="-ml-4 text-slate-400 h-8 text-xs" onClick={() => setStep('email')}>
               <ArrowLeft size={14} className="mr-1" /> Back
             </Button>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Verify Identity</h3>
              <p className="text-xs text-slate-500">Enter the 4-digit code sent to {formData.email}</p>
            </div>
            <div className="flex justify-center gap-2 py-2">
               <Input 
                  className="text-center text-xl tracking-[1em] font-mono h-12 w-48" 
                  maxLength={4} 
                  placeholder="0000"
                  value={formData.otp}
                  onChange={e => setFormData({...formData, otp: e.target.value})}
               />
            </div>
            <Button className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-sm" onClick={handleVerifyOTP} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Verify Code"}
            </Button>
            <p className="text-[10px] text-center text-slate-400 cursor-pointer hover:text-teal-600">Resend Code</p>
          </div>
        );

      case 'method':
        return (
          <div className="space-y-3 pt-2">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Registration Method</h3>
              <p className="text-xs text-slate-500">Use your digital ID for instant verification</p>
            </div>
            
            <div className="grid gap-2">
              <button 
                onClick={() => handleDigitalIdLogin('uae-pass')}
                className="relative group overflow-hidden w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center px-4 gap-3 shadow-sm hover:shadow-md"
              >
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center shrink-0">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/UAE_Pass_Logo.png/640px-UAE_Pass_Logo.png" className="w-full h-full object-contain opacity-0" alt="UAE Pass" /> 
                   <span className="text-white font-bold text-[8px] absolute">UAE<br/>PASS</span>
                </div>
                <div className="text-left">
                   <div className="font-semibold text-slate-900 text-sm">Login with UAE PASS</div>
                   <div className="text-[10px] text-green-600 font-medium">Recommended for UAE Residents</div>
                </div>
                <ChevronRight className="ml-auto text-slate-300 group-hover:text-slate-600" size={16} />
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 via-red-500 to-black opacity-20"></div>
              </button>

              <button 
                onClick={() => handleDigitalIdLogin('nafath')}
                className="relative group overflow-hidden w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center px-4 gap-3 shadow-sm hover:shadow-md"
              >
                <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
                   KSA
                </div>
                <div className="text-left">
                   <div className="font-semibold text-slate-900 text-sm">Login with Nafath</div>
                   <div className="text-[10px] text-slate-500">For Saudi Nationals & Residents</div>
                </div>
                <ChevronRight className="ml-auto text-slate-300 group-hover:text-slate-600" size={16} />
              </button>
            </div>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] text-slate-400 uppercase">Or enter manually</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <Button variant="outline" className="w-full h-10 text-sm" onClick={() => setStep('id-scan')}>
               Continue with Manual Entry
            </Button>
          </div>
        );

      case 'id-scan':
         return (
            <div className="space-y-3 pt-2">
               <Button variant="ghost" size="sm" className="-ml-4 text-slate-400 h-8 text-xs" onClick={() => setStep('method')}>
                  <ArrowLeft size={14} className="mr-1" /> Back
               </Button>
               <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Scan Identity Document</h3>
                  <p className="text-xs text-slate-500">We'll attempt to read your details automatically</p>
               </div>

               <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:border-teal-500 hover:bg-teal-50 transition-all cursor-pointer group min-h-[140px]" onClick={handleScanId}>
                  {loading ? (
                     <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                           <ScanLine size={32} className="text-teal-600 animate-pulse" />
                           <div className="absolute inset-0 bg-teal-500/20 animate-ping rounded-full"></div>
                        </div>
                        <p className="text-xs font-medium text-teal-700">Analyzing Document...</p>
                     </div>
                  ) : (
                     <>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                           <Camera size={20} />
                        </div>
                        <div>
                           <h4 className="font-semibold text-slate-900 text-sm">Tap to Scan</h4>
                           <p className="text-[10px] text-slate-500 mt-0.5">Passport or ID Card</p>
                        </div>
                     </>
                  )}
               </div>

               <div className="text-center pt-2">
                  <button className="text-xs text-teal-600 hover:underline font-medium" onClick={() => setStep('details')}>
                     Skip and enter details manually
                  </button>
               </div>
            </div>
         );

      case 'details':
        return (
          <div className="space-y-3 pb-2 pt-2">
             <div className="flex items-center justify-between">
               <Button variant="ghost" size="sm" className="-ml-4 text-slate-400 h-8 text-xs" onClick={() => setStep('method')}>
                  <ArrowLeft size={14} className="mr-1" /> Back
               </Button>
               <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Step 2 of 4</span>
             </div>
            
            <div className="text-center mb-1">
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                 <Label className="text-[10px]">First Name <span className="text-red-500">*</span></Label>
                 <Input className="h-9 text-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <Label className="text-[10px]">Second Name</Label>
                 <Input className="h-9 text-sm" value={formData.secondName} onChange={e => setFormData({...formData, secondName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <Label className="text-[10px]">Third Name</Label>
                 <Input className="h-9 text-sm" value={formData.thirdName} onChange={e => setFormData({...formData, thirdName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <Label className="text-[10px]">Last Name <span className="text-red-500">*</span></Label>
                 <Input className="h-9 text-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
               <Label className="text-[10px]">Company / Organization</Label>
               <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <Input className="pl-9 h-9 text-sm" placeholder="Where are you from?" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
               </div>
            </div>

            <div className="space-y-1">
               <Label className="text-[10px]">Mobile Number <span className="text-red-500">*</span></Label>
               <div className="flex gap-2">
                  <Select value={formData.countryCode} onValueChange={v => setFormData({...formData, countryCode: v})}>
                     <SelectTrigger className="w-[90px] h-9 text-sm">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="+971">🇦🇪 +971</SelectItem>
                        <SelectItem value="+966">🇸🇦 +966</SelectItem>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44</SelectItem>
                     </SelectContent>
                  </Select>
                  <Input 
                     className="flex-1 h-9 text-sm" 
                     placeholder="50 123 4567" 
                     value={formData.mobile}
                     onChange={e => setFormData({...formData, mobile: e.target.value})}
                  />
               </div>
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-2">
               <div className="space-y-1">
                  <Label className="text-[10px]">ID Type <span className="text-red-500">*</span></Label>
                  <Select value={formData.idType} onValueChange={v => setFormData({...formData, idType: v})}>
                     <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="emirates-id">Emirates ID</SelectItem>
                        <SelectItem value="national-id">National ID</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px]">ID Number <span className="text-red-500">*</span></Label>
                  <Input 
                     className="h-9 text-sm"
                     value={formData.idNumber}
                     onChange={e => setFormData({...formData, idNumber: e.target.value})}
                     placeholder="Number"
                  />
               </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-slate-700">Parking Required?</div>
               </div>
               <Switch checked={formData.parking} onCheckedChange={c => setFormData({...formData, parking: c})} className="scale-75 origin-right" />
            </div>
            
            {formData.parking && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <Label className="text-[10px]">License Plate <span className="text-red-500">*</span></Label>
                  <Input 
                     className="h-9 text-sm mt-1"
                     value={formData.plate}
                     onChange={e => setFormData({...formData, plate: e.target.value})}
                     placeholder="DXB A 12345"
                  />
               </motion.div>
            )}

            <Button className="w-full h-10 bg-slate-900 hover:bg-slate-800 mt-2 text-sm" onClick={() => {
               if (!formData.firstName || !formData.lastName || !formData.mobile || !formData.idNumber) {
                  toast.error("Please fill in all required fields");
                  return;
               }
               if (formData.parking && !formData.plate) {
                  toast.error("Parking requires license plate");
                  return;
               }
               setStep('nda');
            }}>
               Continue <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        );

      case 'nda':
        return (
         <div className="space-y-3 pb-2 pt-2">
            <div className="flex items-center justify-between">
               <Button variant="ghost" size="sm" className="-ml-4 text-slate-400 h-8 text-xs" onClick={() => setStep('details')}>
                  <ArrowLeft size={14} className="mr-1" /> Back
               </Button>
               <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Step 3 of 4</span>
            </div>

            <div className="text-center mb-1">
               <h3 className="text-base font-bold text-slate-900">Safety & NDA Policy</h3>
               <p className="text-xs text-slate-500">Please review before entering</p>
            </div>

            <ScrollArea className="h-[140px] rounded-md border border-slate-200 bg-slate-50 p-3 text-[10px] text-slate-600 leading-relaxed">
               <h4 className="font-bold text-slate-900 mb-1">Non-Disclosure & Site Safety Agreement</h4>
               <p className="mb-1">
                  1. <strong>Confidentiality:</strong> I understand that during my visit to the Dixels Headquarters, I may be exposed to confidential information, trade secrets, or proprietary technology. I agree not to disclose, copy, or transmit any such information to any third party without express written permission.
               </p>
               <p className="mb-1">
                  2. <strong>No Photography:</strong> Photography, video recording, and audio recording are strictly prohibited within the premises unless authorized by the Security Department.
               </p>
               <p className="mb-1">
                  3. <strong>Escort Policy:</strong> All visitors must be escorted by their host at all times while in secured areas. Unescorted movement is restricted to the lobby and cafeteria.
               </p>
               <p className="mb-1">
                  4. <strong>Safety:</strong> I agree to follow all safety instructions provided by security personnel and signage. In case of emergency, I will follow the evacuation route to the nearest assembly point.
               </p>
               <p className="mb-1">
                  5. <strong>Data Privacy:</strong> I consent to the collection and processing of my personal data, including biometric data (Face ID), for security and access control purposes in accordance with local regulations.
               </p>
            </ScrollArea>

            <div className="space-y-3">
               <div className="flex items-start gap-2">
                  <Checkbox 
                     id="nda-check" 
                     checked={formData.ndaSigned} 
                     onCheckedChange={(c) => setFormData({...formData, ndaSigned: c as boolean})}
                  />
                  <label htmlFor="nda-check" className="text-xs leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pt-0.5 text-slate-700">
                     I have read, understood, and agree to the terms and conditions stated above.
                  </label>
               </div>

               <div className="space-y-1">
                  <Label className="text-[10px]">Digital Signature (Type Full Name)</Label>
                  <div className="relative">
                     <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <Input 
                        value={formData.signatureName} 
                        onChange={e => setFormData({...formData, signatureName: e.target.value})}
                        placeholder="e.g. John Doe"
                        className="pl-9 font-serif italic text-base h-10"
                     />
                  </div>
               </div>
            </div>

            <Button className="w-full h-10 bg-slate-900 hover:bg-slate-800 mt-2 text-sm" onClick={() => {
               if (!formData.ndaSigned) {
                  toast.error("You must agree to the NDA policy");
                  return;
               }
               if (formData.signatureName.trim().length < 3) {
                  toast.error("Please sign with your full name");
                  return;
               }
               setStep('face-id');
            }}>
               Accept & Continue <ArrowRight size={14} className="ml-2" />
            </Button>
         </div>
        );

      case 'face-id':
         return (
            <div className="space-y-4 text-center pt-4">
               <Button variant="ghost" size="sm" className="absolute top-4 left-4 text-slate-400 h-8 w-8 p-0" onClick={() => setStep('nda')}>
                  <ArrowLeft size={16} />
               </Button>
               
               <div className="space-y-1 pt-2">
                  <h3 className="text-lg font-bold text-slate-900">Biometric Enrollment</h3>
                  <p className="text-xs text-slate-500">Optional: Fast-track your entry</p>
               </div>

               <div className="relative w-40 h-40 mx-auto">
                  <div className={cn(
                     "w-full h-full rounded-full border-4 overflow-hidden relative bg-slate-100",
                     cameraActive ? "border-teal-500" : "border-slate-200"
                  )}>
                     {cameraActive ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                           {/* Scanning Effect */}
                           <motion.div 
                              className="absolute top-0 w-full h-full bg-gradient-to-b from-transparent via-teal-500/20 to-transparent"
                              animate={{ top: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           />
                           <User size={48} className="text-slate-700" />
                           <div className="absolute bottom-4 text-[10px] text-white font-medium bg-black/50 px-2 rounded">
                              Turn head slightly left
                           </div>
                        </div>
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                           <User size={64} />
                        </div>
                     )}
                  </div>
                  {/* Camera Icon Badge */}
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-slate-100">
                     <Fingerprint className="text-teal-600" size={20} />
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-[10px] text-blue-700 text-left flex gap-2 leading-tight">
                     <ShieldCheck size={16} className="shrink-0" />
                     <p>Your face data is encrypted and used solely for building access. It is automatically deleted after your visit.</p>
                  </div>

                  <Button 
                     className={cn("w-full h-10 text-base", cameraActive ? "bg-slate-400" : "bg-teal-600 hover:bg-teal-700")}
                     onClick={handleFaceCapture}
                     disabled={cameraActive}
                  >
                     {cameraActive ? "Scanning Face..." : "Start Face Scan"}
                  </Button>

                  <Button 
                     variant="ghost" 
                     className="w-full text-slate-500 hover:text-slate-800 text-xs h-8"
                     onClick={() => {
                        toast.info("You can complete face registration at the kiosk later.");
                        setStep('success');
                     }}
                     disabled={cameraActive}
                  >
                     Skip for now
                  </Button>
               </div>
            </div>
         );

      case 'success':
        return (
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="text-center space-y-4 pt-2 pb-2"
          >
             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={24} />
             </div>
             
             <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-slate-900">Registration Complete!</h3>
                <p className="text-xs text-slate-500">You are approved for entry.</p>
             </div>

             {/* Digital Wallet Options */}
             <div className="flex flex-col gap-2 pt-1 w-full">
                <button className="w-full bg-black text-white hover:bg-slate-800 h-11 rounded-xl flex items-center justify-center gap-2 relative overflow-hidden group transition-all shadow-sm">
                   <div className="flex items-center gap-2 z-10">
                      <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5">
                         <path d="M360.8 288.7c-17.6-21.3-29.3-48.4-29.3-78.5 0-60.6 42.1-98.8 45.3-101.5-2.5-1.1-6-2.5-10.7-4.2-14.7-5.5-35.3-9.5-62.7 2-27.1 11.4-44.1 12.3-56.7 12.3-14.4 0-35.1-1.7-60-12.3-44.1-18.7-72.3 8.3-72.3 8.3-64.8 77.3-55 210.3 11 306.4 17.6 25.5 45.6 63.8 81 63.8 23.2 0 31.7-16.1 66.7-16.1 34.1 0 41.6 16.1 66.7 16.1 27.6 0 50.4-24.8 71.3-55.3 8.8-12.8 19.9-32.3 26.9-52.6-2.5-1.3-47.6-23.7-65.2-46.6zM286.3 75.3c15-18.4 25.1-43.9 22.3-69.8-21.6 0.9-47.8 14.4-63.3 32.7-13.9 16.3-26.1 42.6-22.8 67.7 24.1 1.9 48.8-12.2 63.8-30.6z"/>
                      </svg>
                      <span className="font-medium text-sm">Add to Apple Wallet</span>
                   </div>
                </button>
                <button className="w-full bg-white text-black border border-slate-200 hover:bg-slate-50 h-11 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                   <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                         <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
                         <path fill="#EA4335" d="M12 4.62c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="font-medium text-sm">Add to Google Wallet</span>
                   </div>
                </button>
             </div>

             {/* Locations - Split */}
             <div className="w-full space-y-2 mt-2">
                 <div className="flex items-start gap-3 p-2.5 rounded-lg border border-blue-100 bg-blue-50/50 text-left">
                     <Building2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                     <div>
                         <p className="text-[10px] font-semibold text-blue-900 mb-0.5">Building Access</p>
                         <p className="text-[10px] text-blue-700">Dixels Global HQ, Tower A</p>
                         <div className="flex items-center gap-1 mt-1 cursor-pointer hover:underline text-blue-600">
                             <span className="text-[9px]">View Entrance Map</span>
                             <ArrowRight size={8} />
                         </div>
                     </div>
                 </div>
                 
                 <div className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-left">
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                         <div className="w-2 h-2 rounded-full bg-slate-400" />
                      </div>
                      <div>
                         <p className="text-[10px] font-semibold text-slate-700 mb-0.5">Meeting Location</p>
                         <p className="text-[10px] text-slate-600">{formData.location || "Executive Boardroom, Level 3"}</p>
                      </div>
                 </div>
             </div>

             <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm w-full mt-2 group relative">
                {!showBackupQr ? (
                   <>
                      {formData.faceImage ? (
                         <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden border-4 border-teal-500 shadow-md">
                                <ScanFace size={48} className="text-teal-700" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                <CheckCircle2 size={16} className="text-white" />
                            </div>
                         </div>
                      ) : (
                         <QrCode size={120} className="text-slate-900" />
                      )}
                      <div className="text-center mt-1">
                         <div className="text-sm font-bold text-slate-900">{formData.faceImage ? "Face ID Ready" : "Scan Code at Kiosk"}</div>
                         <p className="text-[10px] text-slate-400 leading-tight font-mono tracking-wider">
                            INV-8829-XJ
                         </p>
                      </div>
                   </>
                ) : (
                   <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                      <QrCode size={140} className="text-slate-900" />
                      <div className="text-[10px] font-mono text-slate-400 mt-2">BACKUP ENTRY CODE</div>
                   </div>
                )}
                
                <button 
                   onClick={() => setShowBackupQr(!showBackupQr)}
                   className="absolute top-2 right-2 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-teal-600 transition-colors"
                   title="Toggle Backup QR"
                >
                   <QrCode size={14} />
                </button>
             </div>

             {/* General Instructions */}
             <div className="w-full bg-slate-50 rounded-lg p-3 border border-slate-100 text-left">
                 <h4 className="text-[10px] font-bold uppercase tracking-wide text-slate-700 mb-2 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-teal-600" /> Visit Guidelines
                 </h4>
                 <ul className="text-[9px] text-slate-500 space-y-1.5 list-disc pl-3 marker:text-slate-300">
                     <li>Present pass at ground floor security desk.</li>
                     <li>Wear badge visibly at all times.</li>
                     <li>Follow green exit signs in emergency.</li>
                     <li>No photography in secure areas.</li>
                 </ul>
             </div>
          </motion.div>
        );
    }
  };

  // Progress Calculation
  const getProgress = () => {
     switch(step) {
        case 'email': return 10;
        case 'otp': return 25;
        case 'method': return 40;
        case 'id-scan': return 50;
        case 'details': return 60;
        case 'nda': return 75;
        case 'face-id': return 85;
        case 'success': return 100;
        default: return 0;
     }
  };

  return (
    <div className="fixed inset-0 bg-slate-50/50 z-50 overflow-y-auto">
       <div className="min-h-full flex items-center justify-center p-4">
          <Card className="w-full max-w-sm border-none shadow-xl bg-white relative flex flex-col min-h-[500px] md:min-h-auto my-auto">
             {/* Progress Bar */}
             <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full z-10 rounded-t-xl overflow-hidden">
             <motion.div 
                className="h-full bg-gradient-to-r from-teal-500 to-blue-600" 
                initial={{ width: '10%' }}
                animate={{ width: `${getProgress()}%` }}
                transition={{ duration: 0.5 }}
             />
          </div>

          <CardHeader className="text-center pb-2 pt-6">
             <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={18} className="text-teal-600" />
                <span className="text-sm font-bold text-slate-900 tracking-wide uppercase">Dixels SecurePass</span>
             </div>
          </CardHeader>

          <div className="flex-1 bg-white px-4 pb-4">
             <AnimatePresence mode="wait">
                <motion.div 
                   key={step}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.2 }}
                   className="flex-1 flex flex-col h-full"
                >
                   {renderStep()}
                </motion.div>
             </AnimatePresence>
          </div>
          
          <CardFooter className="bg-white p-3 text-center border-t border-slate-50 mt-auto">
             <div className="flex items-center justify-center gap-2 w-full opacity-50 grayscale hover:grayscale-0 transition-all">
                <Globe size={10} />
                <span className="text-[9px] text-slate-400">Powered by Dixels Platform 2.0</span>
             </div>
          </CardFooter>
       </Card>
       </div>
    </div>
  );
};
