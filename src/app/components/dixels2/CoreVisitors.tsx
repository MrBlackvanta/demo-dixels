import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  X, 
  QrCode, 
  FileText, 
  Download, 
  Printer,
  UserPlus,
  Filter,
  ArrowRight,
  Shield,
  ShieldAlert,
  Ban,
  UserX,
  AlertTriangle,
  Eye,
  CheckSquare,
  ClipboardList,
  Car,
  Upload,
  FileSpreadsheet,
  Trash2,
  ScanLine,
  CreditCard,
  Smartphone,
  Loader2,
  ScanFace,
  User,
  Camera,
  Edit,
  XCircle,
  Copy,
  Package as PackageIcon,
  Truck
} from 'lucide-react';
import { DuplicateVisitDialog } from './DuplicateVisitDialog';
import { BadgeInventory } from './BadgeInventory';
import { CheckInDialog } from './CheckInDialog';
import { CheckOutDialog } from './CheckOutDialog';
import { DigitalPassDialog } from './DigitalPassDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useVms, Package } from './VmsContext';

// --- Mock Location Data (Derived from SpaceManagement) ---
const LOCATIONS_DATA = [
  {
    id: 'b1',
    name: 'Global HQ',
    floors: [
      { id: 'f1', name: 'Level 1 - Lobby & Public' },
      { id: 'f2', name: 'Level 2 - R&D' },
      { id: 'f3', name: 'Level 3 - Executive' },
    ]
  },
  {
    id: 'b2',
    name: 'Innovation Center',
    floors: [
      { id: 'f1-ic', name: 'Ground Floor' },
      { id: 'f2-ic', name: 'Labs' },
    ]
  }
];

const SPACES_DATA = [
  { id: 's1', name: 'Executive Boardroom', floorId: 'f3', type: 'Meeting Room' },
  { id: 's2', name: 'Focus Room A', floorId: 'f3', type: 'Huddle' },
  { id: 's3', name: 'Focus Room B', floorId: 'f3', type: 'Huddle' },
  { id: 's4', name: 'Open Work Area', floorId: 'f3', type: 'Desk Area' },
  { id: 's5', name: 'Coffee Lounge', floorId: 'f3', type: 'Social' },
  { id: 's6', name: 'Lab 1', floorId: 'f2-ic', type: 'Lab' },
  { id: 's7', name: 'Main Lobby', floorId: 'f1', type: 'Public' },
];

const INITIAL_BLACKLIST = [
   { id: 99, name: 'John Smith', company: 'Unknown', reason: 'Attempted unauthorized entry', date: '2024-10-15' }
];

export const CoreVisitors: React.FC = () => {
  const { visitors, packages, addVisitor, addVisitors, updateVisitor, addPackage, updatePackage, stats, isOverdue, emergencyMode, assignBadge, returnBadge, markBadgeLost } = useVms();
  const [blacklist, setBlacklist] = useState(INITIAL_BLACKLIST);
  
  // Package State
  const [isPackageOpen, setPackageOpen] = useState(false);
  const [newPackage, setNewPackage] = useState<Partial<Package>>({
     recipient: '',
     carrier: 'FedEx',
     trackingNumber: '',
     location: 'Reception'
  });

  const [search, setSearch] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [checkInVisitor, setCheckInVisitor] = useState<any>(null);
  const [checkOutVisitor, setCheckOutVisitor] = useState<any>(null);
  const [passVisitor, setPassVisitor] = useState<any>(null);
  
  // Dialog States
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [isWalkInOpen, setWalkInOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('arrivals');
  const [duplicateVisitor, setDuplicateVisitor] = useState<any>(null);

  const handleConfirmDuplicate = (date: string, time: string) => {
     if (!duplicateVisitor) return;
     
     const location = duplicateVisitor.location || 'TBD';
     
     addVisitor({
        name: duplicateVisitor.name,
        company: duplicateVisitor.company,
        email: duplicateVisitor.email,
        type: duplicateVisitor.type,
        date: date,
        time: time,
        parking: duplicateVisitor.parking,
        location: location,
        hostName: duplicateVisitor.hostName, // Preserve host for reception
        status: 'upcoming',
        representativeName: duplicateVisitor.representativeName,
        representativePhone: duplicateVisitor.representativePhone,
        securityEscortRequired: duplicateVisitor.securityEscortRequired
     });
     
     toast.success(`Visit duplicated for ${date}`);
     setDuplicateVisitor(null);
  };
  
  const handleEditDuplicateFull = () => {
      if (!duplicateVisitor) return;
      
      setInviteForm({
         name: duplicateVisitor.name,
         email: duplicateVisitor.email,
         company: duplicateVisitor.company,
         type: duplicateVisitor.type,
         date: 'Tomorrow', 
         time: duplicateVisitor.time,
         parking: duplicateVisitor.parking,
         locationType: 'office',
         buildingId: '',
         floorId: '',
         spaceId: '',
         hostName: duplicateVisitor.hostName || ''
      });
      setInviteOpen(true);
      setDuplicateVisitor(null);
  };

  const [inviteMode, setInviteMode] = useState('single'); // 'single' | 'group'
  
  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
     name: '',
     email: '',
     company: '',
     type: 'Client',
     date: '',
     time: '',
     locationType: 'office',
     buildingId: '',
     floorId: '',
     spaceId: '',
     representativeName: '',
     representativePhone: '',
     securityEscort: false
  });

  // Group Invite State
  const [groupInvites, setGroupInvites] = useState<{email: string, name: string, company: string}[]>([
     { email: '', name: '', company: '' },
     { email: '', name: '', company: '' },
     { email: '', name: '', company: '' }
  ]);
  const [groupType, setGroupType] = useState('Client');
  const [groupLocation, setGroupLocation] = useState({
     type: 'office',
     buildingId: '',
     floorId: '',
     spaceId: ''
  });

  const [showCsvPaste, setShowCsvPaste] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Walk-in Form State
  const [walkInForm, setWalkInForm] = useState({
     name: '',
     company: '',
     host: '',
     type: 'Client',
     idNumber: '',
     mobile: '',
     parking: false,
     plate: '',
     photo: null as string | null,
     representativeName: '',
     representativePhone: '',
     securityEscort: false
  });
  const [isScanning, setIsScanning] = useState(false);

  // Edit Form State
  const [isEditOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
     id: '',
     name: '',
     company: '',
     email: '',
     type: 'Client',
     host: '',
     date: '',
     time: '',
     parking: false,
     idNumber: '',
     mobile: '',
     plate: '',
     photo: null as string | null,
     status: 'upcoming' as any,
     representativeName: '',
     representativePhone: '',
     securityEscort: false
  });

  const getLocationString = (type: string, buildingId: string, floorId: string, spaceId: string) => {
     if (type === 'office') return 'My Office (Global HQ, L3)';
     
     if (!buildingId) return 'TBD';
     
     const building = LOCATIONS_DATA.find(b => b.id === buildingId);
     const floor = building?.floors.find(f => f.id === floorId);
     const space = SPACES_DATA.find(s => s.id === spaceId);
     
     const parts = [];
     if (building) parts.push(building.name);
     if (floor) parts.push(floor.name);
     if (space) parts.push(space.name);
     
     return parts.join(', ') || 'TBD';
  };

  const handleEditClick = (visitor: any) => {
     setEditForm({
        id: visitor.id,
        name: visitor.name,
        company: visitor.company,
        email: visitor.email,
        type: visitor.type,
        host: visitor.host,
        date: visitor.date === 'Today' ? new Date().toISOString().split('T')[0] : visitor.date,
        time: visitor.time,
        parking: visitor.parking || false,
        idNumber: visitor.idNumber || '',
        mobile: visitor.mobile || '',
        plate: visitor.plate || '',
        photo: visitor.photo || null,
        status: visitor.status,
        representativeName: visitor.representativeName || '',
        representativePhone: visitor.representativePhone || '',
        securityEscort: visitor.securityEscortRequired || false
     });
     setEditOpen(true);
  };

  const handleLogPackage = () => {
     if (!newPackage.recipient) {
        toast.error("Recipient name is required");
        return;
     }

     const pkg: Package = {
        id: `PKG-${Date.now()}`,
        recipient: newPackage.recipient || 'Unknown',
        carrier: (newPackage.carrier as any) || 'Other',
        trackingNumber: newPackage.trackingNumber || '',
        status: 'pending',
        arrivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: newPackage.location || 'Reception'
     };
     addPackage(pkg);
     setPackageOpen(false);
     setNewPackage({ recipient: '', carrier: 'FedEx', trackingNumber: '', location: 'Reception' });
     toast.success(`Package logged for ${pkg.recipient}`);
     
     // Simulate notification
     setTimeout(() => toast.info(`Notification sent to ${pkg.recipient}`), 1000);
  };

  const handlePickupPackage = (id: string) => {
     updatePackage(id, { status: 'picked-up' });
     toast.success("Package marked as picked up");
  };

  const handleEditScanId = () => {
     setIsScanning(true);
     // Simulate scanning delay
     setTimeout(() => {
        setIsScanning(false);
        setEditForm(prev => ({
           ...prev,
           // In a real app, this would extract data from OCR
           idNumber: '784-1985-1234567-1',
           mobile: prev.mobile || '+971 50 123 4567',
        }));
        toast.success("Document Scanned & Data Extracted");
     }, 1500);
  };

  const handleSaveEdit = () => {
     if (!editForm.name) {
        toast.error("Name is required");
        return;
     }

     // Auto-update status to 'registered' if they have photo & ID and aren't checked in yet
     let newStatus = editForm.status;
     if ((editForm.status === 'upcoming' || editForm.status === 'expected') && editForm.photo && editForm.idNumber) {
        newStatus = 'registered';
     }
     
     updateVisitor(editForm.id, {
        name: editForm.name,
        company: editForm.company,
        email: editForm.email,
        type: editForm.type,
        host: editForm.host,
        date: editForm.date,
        time: editForm.time,
        parking: editForm.parking,
        idNumber: editForm.idNumber,
        mobile: editForm.mobile,
        plate: editForm.plate,
        photo: editForm.photo,
        status: newStatus,
        representativeName: editForm.type === 'VVIP' ? editForm.representativeName : undefined,
        representativePhone: editForm.type === 'VVIP' ? editForm.representativePhone : undefined,
        securityEscortRequired: editForm.type === 'VVIP' || editForm.type === 'VIP' ? editForm.securityEscort : false
     });
     
     setEditOpen(false);
     toast.success("Visitor details updated");
  };

  const handleInvite = () => {
     if(!inviteForm.email) {
        toast.error("Email is required");
        return;
     }
     
     const newVisitor = addVisitor({
        name: inviteForm.name,
        email: inviteForm.email,
        company: inviteForm.company || 'Guest',
        host: 'Reception Desk', 
        time: inviteForm.time || '09:00 AM',
        type: inviteForm.type,
        representativeName: inviteForm.type === 'VVIP' ? inviteForm.representativeName : undefined,
        representativePhone: inviteForm.type === 'VVIP' ? inviteForm.representativePhone : undefined,
        securityEscortRequired: inviteForm.type === 'VVIP' || inviteForm.type === 'VIP' ? inviteForm.securityEscort : false
     });
     
     setInviteOpen(false);
     setInviteForm({ 
        name: '', email: '', company: '', type: 'Client', date: '', time: '', 
        locationType: 'office', buildingId: '', floorId: '', spaceId: '',
        representativeName: '', representativePhone: '', securityEscort: false
     });
     toast.success(`Invite sent to ${newVisitor.email}`);
  };

  const handleScanId = () => {
     setIsScanning(true);
     // Simulate scanning delay
     setTimeout(() => {
        setIsScanning(false);
        setWalkInForm(prev => ({
           ...prev,
           name: 'David Kim',
           company: 'Samsung Electronics',
           idNumber: '784-1985-1234567-1',
           mobile: '+971 50 987 6543',
           type: 'Vendor'
        }));
        toast.success("ID Scanned & Verified");
     }, 1500);
  };

  const handleParseCsv = () => {
     if (!csvText.trim()) return;
     
     const lines = csvText.trim().split('\n');
     const newRows = lines.map(line => {
       const [email, name, company] = line.split(',').map(s => s.trim());
       return { email: email || '', name: name || '', company: company || '' };
     }).filter(row => row.email);

     setGroupInvites(prev => [...prev.filter(r => r.email), ...newRows]);
     setCsvText('');
     setShowCsvPaste(false);
     toast.success(`Added ${newRows.length} guests from text`);
  };

  const handleSendGroup = () => {
     const validRows = groupInvites.filter(r => r.email);
     if (validRows.length === 0) {
        toast.error("Please add at least one guest with an email");
        return;
     }

     const newVisitors = validRows.map(row => ({
        email: row.email,
        name: row.name,
        company: row.company,
        host: 'Reception Desk',
        type: groupType,
        status: 'upcoming' as const,
        securityStatus: 'pending' as const
     }));

     // @ts-ignore
     addVisitors(newVisitors);
     setInviteOpen(false);
     setGroupInvites([
        { email: '', name: '', company: '' },
        { email: '', name: '', company: '' },
        { email: '', name: '', company: '' }
     ]);
     toast.success(`Sent ${newVisitors.length} invitations successfully.`);
  };

  const updateGroupRow = (index: number, field: keyof typeof groupInvites[0], value: string) => {
     const newRows = [...groupInvites];
     newRows[index] = { ...newRows[index], [field]: value };
     setGroupInvites(newRows);
  };

  const removeGroupRow = (index: number) => {
     const newRows = groupInvites.filter((_, i) => i !== index);
     setGroupInvites(newRows);
  };

  const addGroupRow = () => {
     setGroupInvites([...groupInvites, { email: '', name: '', company: '' }]);
  };

  const handleWalkIn = () => {
     if(!walkInForm.name || !walkInForm.host) {
        toast.error("Name and Host are required");
        return;
     }
     if(!walkInForm.idNumber) {
        toast.error("ID Number is mandatory for security");
        return;
     }

     const newVisitor = addVisitor({
        name: walkInForm.name,
        company: walkInForm.company || 'Walk-in Guest',
        host: walkInForm.host,
        email: '', 
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: walkInForm.type,
        status: 'checked-in', 
        securityStatus: 'cleared',
        parking: walkInForm.parking,
        photo: walkInForm.photo,
        representativeName: walkInForm.type === 'VVIP' ? walkInForm.representativeName : undefined,
        representativePhone: walkInForm.type === 'VVIP' ? walkInForm.representativePhone : undefined,
        securityEscortRequired: walkInForm.type === 'VVIP' || walkInForm.type === 'VIP' ? walkInForm.securityEscort : false
     });

     setWalkInOpen(false);
     setWalkInForm({ 
        name: '', company: '', host: '', type: 'Client', idNumber: '', mobile: '', parking: false, plate: '', photo: null,
        representativeName: '', representativePhone: '', securityEscort: false 
     });
     toast.success(`Walk-in registered: ${newVisitor.name}`);
     setSelectedVisitor(newVisitor); 
  };

  // Security Actions
  const handleAdmit = (visitor: any) => {
      setCheckInVisitor(visitor);
  };
  
  const handleConfirmAdmit = (badgeNumber?: string) => {
      if (!checkInVisitor) return;
      
      if (badgeNumber) {
         assignBadge(checkInVisitor.id, badgeNumber);
      } else {
         updateVisitor(checkInVisitor.id, { status: 'checked-in', securityStatus: 'cleared' });
         toast.success(`${checkInVisitor.name} admitted successfully.`);
      }
      setCheckInVisitor(null);
      setSelectedVisitor(null);
  };

  const handleCheckOut = (visitor: any) => {
     setCheckOutVisitor(visitor);
  };

  const handleConfirmCheckOut = (isReturned: boolean) => {
      if (!checkOutVisitor) return;
      
      if (checkOutVisitor.badgeNumber) {
         if (isReturned) {
            returnBadge(checkOutVisitor.id);
         } else {
            markBadgeLost(checkOutVisitor.badgeNumber);
            // Ensure visitor is still checked out
            updateVisitor(checkOutVisitor.id, { status: 'checked-out', badgeNumber: undefined });
         }
      } else {
         updateVisitor(checkOutVisitor.id, { status: 'checked-out' });
         toast.success("Checked out successfully");
      }
      
      setCheckOutVisitor(null);
      setSelectedVisitor(null);
  };

  const handleDeny = (visitor: any) => {
      updateVisitor(visitor.id, { status: 'denied', securityStatus: 'denied' });
      toast.error(`${visitor.name} entry denied.`);
      setSelectedVisitor(null);
  };

  const handleBlacklist = (visitor: any) => {
      const reason = prompt("Reason for blacklisting:");
      if (!reason) return;

      setBlacklist([...blacklist, { id: Date.now(), name: visitor.name, company: visitor.company, reason, date: new Date().toISOString().split('T')[0] }]);
      
      // Also deny them
      updateVisitor(visitor.id, { status: 'denied', securityStatus: 'blacklisted' });
      
      toast.error(`${visitor.name} added to Watchlist.`);
      setSelectedVisitor(null);
  };

  const handleNoShow = (visitor: any) => {
      updateVisitor(visitor.id, { status: 'no-show' });
      toast.info(`${visitor.name} marked as No Show.`);
      setSelectedVisitor(null);
  };

  // Filter Logic
  const filteredPackages = packages.filter(p => 
     p.recipient.toLowerCase().includes(search.toLowerCase()) || 
     (p.trackingNumber && p.trackingNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredVisitors = visitors.filter(v => 
     (v.name.toLowerCase().includes(search.toLowerCase()) || 
     v.company.toLowerCase().includes(search.toLowerCase())) &&
     (() => {
        if (activeTab === 'checked-in') return v.status === 'checked-in';
        if (activeTab === 'departed') return v.status === 'checked-out' || v.status === 'completed' || v.status === 'cancelled';
        if (activeTab === 'all') return true;
        // Default 'arrivals' - show everything not finished
        return v.status !== 'checked-out' && v.status !== 'completed' && v.status !== 'cancelled' && v.status !== 'checked-in' && v.status !== 'no-show';
     })()
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans relative">
       {emergencyMode && (
         <div className="bg-red-600 text-white p-4 flex items-center justify-between animate-pulse px-6 flex-shrink-0 z-50">
            <div className="flex items-center gap-3">
               <AlertTriangle size={24} className="fill-white text-red-600" />
               <div>
                  <h3 className="font-bold text-lg">EMERGENCY EVACUATION ACTIVE</h3>
                  <p className="text-red-100 text-sm">Direct all visitors to Muster Point A. Do not accept new check-ins.</p>
               </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded font-bold">
               STOP CHECK-IN
            </div>
         </div>
       )}

      {/* Package Logging Dialog */}
      <Dialog open={isPackageOpen} onOpenChange={setPackageOpen}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle>Log Incoming Package</DialogTitle>
               <DialogDescription>Record a new delivery for an employee.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="space-y-2">
                  <Label>Recipient Name</Label>
                  <Input 
                     placeholder="e.g. Sarah Chen" 
                     value={newPackage.recipient}
                     onChange={e => setNewPackage({...newPackage, recipient: e.target.value})}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Carrier</Label>
                     <Select value={newPackage.carrier} onValueChange={v => setNewPackage({...newPackage, carrier: v as any})}>
                        <SelectTrigger>
                           <SelectValue placeholder="Select Carrier" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="FedEx">FedEx</SelectItem>
                           <SelectItem value="UPS">UPS</SelectItem>
                           <SelectItem value="DHL">DHL</SelectItem>
                           <SelectItem value="USPS">USPS</SelectItem>
                           <SelectItem value="Amazon">Amazon</SelectItem>
                           <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label>Location</Label>
                     <Input 
                        value={newPackage.location}
                        onChange={e => setNewPackage({...newPackage, location: e.target.value})}
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>Tracking Number <span className="text-slate-400 font-normal text-xs">(Optional)</span></Label>
                  <Input 
                     placeholder="Scan or type tracking #" 
                     value={newPackage.trackingNumber}
                     onChange={e => setNewPackage({...newPackage, trackingNumber: e.target.value})}
                  />
               </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setPackageOpen(false)}>Cancel</Button>
               <Button className="bg-slate-900 text-white" onClick={handleLogPackage} disabled={!newPackage.recipient}>Log Package</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setInviteOpen}>
         <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Invite Visitors</DialogTitle>
               <DialogDescription>Pre-register guests or upload bulk lists.</DialogDescription>
            </DialogHeader>
            
            <Tabs value={inviteMode} onValueChange={setInviteMode} className="w-full flex-1 overflow-hidden flex flex-col">
               <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                  <TabsTrigger value="single">Single Invite</TabsTrigger>
                  <TabsTrigger value="group">Group Invite</TabsTrigger>
               </TabsList>
               
               <TabsContent value="single" className="py-4 space-y-4 flex-1 overflow-y-auto">
                  <div className="space-y-2">
                     <Label>Email Address <span className="text-red-500">*</span></Label>
                     <Input 
                        placeholder="john@example.com" 
                        type="email"
                        value={inviteForm.email}
                        onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Guest Name <span className="text-slate-400 font-normal text-xs">(Optional)</span></Label>
                        <Input 
                           placeholder="John Doe" 
                           value={inviteForm.name}
                           onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label>Company <span className="text-slate-400 font-normal text-xs">(Optional)</span></Label>
                        <Input 
                           placeholder="Acme Inc." 
                           value={inviteForm.company}
                           onChange={e => setInviteForm({...inviteForm, company: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Date</Label>
                        <Input 
                           type="date" 
                           value={inviteForm.date} 
                           onChange={e => setInviteForm({...inviteForm, date: e.target.value})} 
                        />
                     </div>
                     <div className="space-y-2">
                        <Label>Time</Label>
                        <Input 
                           type="time" 
                           value={inviteForm.time} 
                           onChange={e => setInviteForm({...inviteForm, time: e.target.value})} 
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label>Visit Type</Label>
                     <Select value={inviteForm.type} onValueChange={v => setInviteForm({...inviteForm, type: v, securityEscort: v === 'VVIP' ? true : false})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="Client">Client Meeting</SelectItem>
                           <SelectItem value="VIP">VIP Guest</SelectItem>
                           <SelectItem value="VVIP">VVIP Guest</SelectItem>
                           <SelectItem value="Interview">Interview</SelectItem>
                           <SelectItem value="Vendor">Vendor / Delivery</SelectItem>
                           <SelectItem value="Personal">Personal</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  {inviteForm.type === 'VVIP' && (
                     <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-700 font-medium pb-2 border-b border-amber-200/50">
                           <span className="text-sm">VVIP Protocol Active</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label className="text-amber-900">Representative Name</Label>
                              <Input 
                                 placeholder="e.g. Executive Assistant"
                                 className="bg-white border-amber-200"
                                 value={inviteForm.representativeName}
                                 onChange={e => setInviteForm({...inviteForm, representativeName: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-amber-900">Rep. Phone</Label>
                              <Input 
                                 placeholder="+1 555..."
                                 className="bg-white border-amber-200"
                                 value={inviteForm.representativePhone}
                                 onChange={e => setInviteForm({...inviteForm, representativePhone: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>
                  )}

                  {(inviteForm.type === 'VVIP' || inviteForm.type === 'VIP') && (
                     <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <div className="space-y-0.5">
                           <Label className="text-sm font-medium">Security Escort Required</Label>
                           <p className="text-xs text-slate-500">Security will be notified to escort guest upon arrival</p>
                        </div>
                        <Switch checked={inviteForm.securityEscort} onCheckedChange={c => setInviteForm({...inviteForm, securityEscort: c})} />
                     </div>
                  )}

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                     <Label>Meeting Location</Label>
                     <RadioGroup 
                        value={inviteForm.locationType} 
                        onValueChange={v => setInviteForm({...inviteForm, locationType: v})}
                        className="flex gap-4"
                     >
                        <div className="flex items-center space-x-2">
                           <RadioGroupItem value="office" id="loc-office" />
                           <Label htmlFor="loc-office" className="font-normal cursor-pointer">My Office</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                           <RadioGroupItem value="specific" id="loc-specific" />
                           <Label htmlFor="loc-specific" className="font-normal cursor-pointer">Specific Space</Label>
                        </div>
                     </RadioGroup>
                     
                     {inviteForm.locationType === 'specific' && (
                        <div className="grid grid-cols-3 gap-3 pt-2">
                           <Select value={inviteForm.buildingId} onValueChange={v => setInviteForm({...inviteForm, buildingId: v, floorId: '', spaceId: ''})}>
                              <SelectTrigger><SelectValue placeholder="Building" /></SelectTrigger>
                              <SelectContent>
                                 {LOCATIONS_DATA.map(b => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           
                           <Select 
                              value={inviteForm.floorId} 
                              onValueChange={v => setInviteForm({...inviteForm, floorId: v, spaceId: ''})}
                              disabled={!inviteForm.buildingId}
                           >
                              <SelectTrigger><SelectValue placeholder="Floor" /></SelectTrigger>
                              <SelectContent>
                                 {LOCATIONS_DATA.find(b => b.id === inviteForm.buildingId)?.floors.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           
                           <Select 
                              value={inviteForm.spaceId} 
                              onValueChange={v => setInviteForm({...inviteForm, spaceId: v})}
                              disabled={!inviteForm.floorId}
                           >
                              <SelectTrigger><SelectValue placeholder="Space" /></SelectTrigger>
                              <SelectContent>
                                 {SPACES_DATA.filter(s => s.floorId === inviteForm.floorId).map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                     )}
                  </div>
                  <DialogFooter className="mt-4">
                     <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                     <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleInvite}>Send Invite</Button>
                  </DialogFooter>
               </TabsContent>

               <TabsContent value="group" className="py-4 space-y-4 flex-1 overflow-y-auto flex flex-col">
                  {/* Visit Type & Location Selector for Group */}
                   <div className="flex flex-col gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <Label className="whitespace-nowrap">Visit Type:</Label>
                            <Select value={groupType} onValueChange={setGroupType}>
                               <SelectTrigger className="bg-white w-[180px]"><SelectValue /></SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="Client">Client Meeting</SelectItem>
                                  <SelectItem value="VIP">VIP Guest</SelectItem>
                                  <SelectItem value="VVIP">VVIP Guest</SelectItem>
                                  <SelectItem value="Interview">Interview</SelectItem>
                                  <SelectItem value="Vendor">Vendor / Contractor</SelectItem>
                                  <SelectItem value="Personal">Personal</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         
                         <div className="flex items-center gap-4">
                            <Label>Location:</Label>
                            <RadioGroup 
                               value={groupLocation.type} 
                               onValueChange={v => setGroupLocation({...groupLocation, type: v})}
                               className="flex gap-4"
                            >
                               <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="office" id="grp-office" />
                                  <Label htmlFor="grp-office" className="font-normal cursor-pointer text-sm">My Office</Label>
                               </div>
                               <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="specific" id="grp-specific" />
                                  <Label htmlFor="grp-specific" className="font-normal cursor-pointer text-sm">Specific Space</Label>
                               </div>
                            </RadioGroup>
                         </div>
                      </div>

                      {groupLocation.type === 'specific' && (
                         <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/50">
                           <Select value={groupLocation.buildingId} onValueChange={v => setGroupLocation({...groupLocation, buildingId: v, floorId: '', spaceId: ''})}>
                              <SelectTrigger className="bg-white h-8 text-sm"><SelectValue placeholder="Building" /></SelectTrigger>
                              <SelectContent>
                                 {LOCATIONS_DATA.map(b => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           
                           <Select 
                              value={groupLocation.floorId} 
                              onValueChange={v => setGroupLocation({...groupLocation, floorId: v, spaceId: ''})}
                              disabled={!groupLocation.buildingId}
                           >
                              <SelectTrigger className="bg-white h-8 text-sm"><SelectValue placeholder="Floor" /></SelectTrigger>
                              <SelectContent>
                                 {LOCATIONS_DATA.find(b => b.id === groupLocation.buildingId)?.floors.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           
                           <Select 
                              value={groupLocation.spaceId} 
                              onValueChange={v => setGroupLocation({...groupLocation, spaceId: v})}
                              disabled={!groupLocation.floorId}
                           >
                              <SelectTrigger className="bg-white h-8 text-sm"><SelectValue placeholder="Space" /></SelectTrigger>
                              <SelectContent>
                                 {SPACES_DATA.filter(s => s.floorId === groupLocation.floorId).map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                         </div>
                      )}
                   </div>

                  {showCsvPaste ? (
                     <div className="space-y-4 border border-slate-200 p-4 rounded-lg bg-slate-50">
                        <div className="flex justify-between items-center">
                           <Label>Paste CSV Data</Label>
                           <Button variant="ghost" size="sm" onClick={() => setShowCsvPaste(false)}>Cancel</Button>
                        </div>
                        <p className="text-xs text-slate-500">Format: Email, Name, Company</p>
                        <Textarea 
                           value={csvText}
                           onChange={e => setCsvText(e.target.value)}
                           placeholder={`john@example.com, John Doe, Acme Inc\nsarah@test.com, Sarah Smith, Global Corp`}
                           className="font-mono text-xs min-h-[100px]"
                        />
                        <Button size="sm" onClick={handleParseCsv}>Parse & Add</Button>
                     </div>
                  ) : (
                     <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-500">Add multiple guests for a single meeting.</div>
                        <Button variant="outline" size="sm" onClick={() => setShowCsvPaste(true)} className="gap-2">
                           <Upload size={14} /> Import CSV
                        </Button>
                     </div>
                  )}

                  <div className="border rounded-lg overflow-hidden flex-1 min-h-[200px]">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-slate-50 hover:bg-slate-50">
                              <TableHead className="w-[40%]">Email <span className="text-red-500">*</span></TableHead>
                              <TableHead className="w-[30%]">Name</TableHead>
                              <TableHead className="w-[25%]">Company</TableHead>
                              <TableHead className="w-[5%]"></TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {groupInvites.map((row, idx) => (
                              <TableRow key={idx}>
                                 <TableCell className="p-2">
                                    <Input 
                                       value={row.email} 
                                       onChange={e => updateGroupRow(idx, 'email', e.target.value)}
                                       placeholder="email@company.com"
                                       className="h-8 text-sm border-slate-200"
                                    />
                                 </TableCell>
                                 <TableCell className="p-2">
                                    <Input 
                                       value={row.name} 
                                       onChange={e => updateGroupRow(idx, 'name', e.target.value)}
                                       placeholder="Optional"
                                       className="h-8 text-sm border-slate-200"
                                    />
                                 </TableCell>
                                 <TableCell className="p-2">
                                    <Input 
                                       value={row.company} 
                                       onChange={e => updateGroupRow(idx, 'company', e.target.value)}
                                       placeholder="Optional"
                                       className="h-8 text-sm border-slate-200"
                                    />
                                 </TableCell>
                                 <TableCell className="p-2 text-center">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => removeGroupRow(idx)}>
                                       <Trash2 size={14} />
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
                  
                  <Button variant="outline" className="w-full border-dashed border-slate-300 text-slate-500 hover:border-teal-500 hover:text-teal-600" onClick={addGroupRow}>
                     <Plus size={14} className="mr-2" /> Add Another Guest
                  </Button>

                  <DialogFooter className="mt-4 pt-4 border-t border-slate-100">
                     <div className="flex-1 text-xs text-slate-400 self-center">
                        {groupInvites.filter(r => r.email).length} guests to invite
                     </div>
                     <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                     <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSendGroup}>Send Invites</Button>
                  </DialogFooter>
               </TabsContent>
            </Tabs>
         </DialogContent>
      </Dialog>

      {/* Walk-in Dialog */}
      <Dialog open={isWalkInOpen} onOpenChange={setWalkInOpen}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle>Walk-in Registration</DialogTitle>
               <DialogDescription>Register an unexpected visitor arriving now.</DialogDescription>
            </DialogHeader>
            
            {/* Scan ID Button */}
            <div className="flex justify-center py-2">
               <Button 
                  variant="outline" 
                  className={cn(
                     "w-full h-20 border-dashed border-2 flex flex-col gap-2 transition-colors",
                     isScanning ? "border-teal-500 bg-teal-50 text-teal-600" : "border-slate-200 hover:border-slate-300 text-slate-500"
                  )}
                  onClick={handleScanId}
                  disabled={isScanning}
               >
                  {isScanning ? (
                     <>
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-xs font-medium">Scanning ID Document...</span>
                     </>
                  ) : (
                     <>
                        <ScanLine size={24} />
                        <span className="text-xs font-medium">Scan Passport or ID Card</span>
                     </>
                  )}
               </Button>
            </div>

            <div className="relative flex items-center py-2">
               <div className="flex-grow border-t border-slate-200"></div>
               <span className="flex-shrink-0 mx-4 text-xs text-slate-400 uppercase">Or enter manually</span>
               <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid gap-4 py-2">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Full Name <span className="text-red-500">*</span></Label>
                     <Input 
                        placeholder="Visitor Name" 
                        value={walkInForm.name}
                        onChange={e => setWalkInForm({...walkInForm, name: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label>ID / Passport No. <span className="text-red-500">*</span></Label>
                     <Input 
                        placeholder="Document #" 
                        value={walkInForm.idNumber}
                        onChange={e => setWalkInForm({...walkInForm, idNumber: e.target.value})}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Company</Label>
                     <Input 
                        placeholder="Company Name" 
                        value={walkInForm.company}
                        onChange={e => setWalkInForm({...walkInForm, company: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label>Mobile Number</Label>
                     <Input 
                        placeholder="+971..." 
                        value={walkInForm.mobile}
                        onChange={e => setWalkInForm({...walkInForm, mobile: e.target.value})}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Host <span className="text-red-500">*</span></Label>
                     <Select value={walkInForm.host} onValueChange={v => setWalkInForm({...walkInForm, host: v})}>
                        <SelectTrigger><SelectValue placeholder="Select Host" /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                           <SelectItem value="John Doe">John Doe</SelectItem>
                           <SelectItem value="HR Dept">HR Department</SelectItem>
                           <SelectItem value="Reception">Reception</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label>Purpose</Label>
                     <Select value={walkInForm.type} onValueChange={v => setWalkInForm({...walkInForm, type: v, securityEscort: v === 'VVIP' ? true : false})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="Client">Meeting</SelectItem>
                           <SelectItem value="VIP">VIP</SelectItem>
                           <SelectItem value="VVIP">VVIP</SelectItem>
                           <SelectItem value="Interview">Interview</SelectItem>
                           <SelectItem value="Vendor">Delivery / Vendor</SelectItem>
                           <SelectItem value="Personal">Personal</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {walkInForm.type === 'VVIP' && (
                  <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                     <div className="flex items-center gap-2 text-amber-700 font-medium pb-2 border-b border-amber-200/50">
                        <span className="text-sm">VVIP Protocol Active</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-amber-900">Representative Name</Label>
                           <Input 
                              placeholder="e.g. Executive Assistant"
                              className="bg-white border-amber-200"
                              value={walkInForm.representativeName}
                              onChange={e => setWalkInForm({...walkInForm, representativeName: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-amber-900">Rep. Phone</Label>
                           <Input 
                              placeholder="+1 555..."
                              className="bg-white border-amber-200"
                              value={walkInForm.representativePhone}
                              onChange={e => setWalkInForm({...walkInForm, representativePhone: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>
               )}

               {(walkInForm.type === 'VVIP' || walkInForm.type === 'VIP') && (
                  <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
                     <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Security Escort Required</Label>
                        <p className="text-xs text-slate-500">Security will be notified to escort guest upon arrival</p>
                     </div>
                     <Switch checked={walkInForm.securityEscort} onCheckedChange={c => setWalkInForm({...walkInForm, securityEscort: c})} />
                  </div>
               )}

               <div className="flex items-center justify-between border border-slate-200 rounded-lg p-2 px-3 bg-slate-50">
                  <div className="flex items-center gap-2">
                     <Car size={16} className="text-slate-500" />
                     <Label className="text-sm font-medium cursor-pointer" htmlFor="parking-toggle">Parking Required?</Label>
                  </div>
                  <Switch id="parking-toggle" checked={walkInForm.parking} onCheckedChange={c => setWalkInForm({...walkInForm, parking: c})} />
               </div>
               
               {walkInForm.parking && (
                  <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="space-y-2"
                  >
                     <Label>License Plate</Label>
                     <Input 
                        placeholder="DXB A 12345" 
                        value={walkInForm.plate}
                        onChange={e => setWalkInForm({...walkInForm, plate: e.target.value})}
                     />
                  </motion.div>
               )}

               <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
                  <Label>Biometric Enrollment <span className="text-red-500">*</span></Label>
                  <div className="flex gap-4 items-center">
                     <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative shrink-0">
                        {walkInForm.photo ? (
                           <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" className="w-full h-full object-cover" alt="Face" />
                        ) : (
                           <User size={32} className="text-slate-300" />
                        )}
                     </div>
                     <div className="flex-1 space-y-2">
                        <Button 
                           variant="outline" 
                           className={cn("w-full justify-start", walkInForm.photo ? "border-green-200 text-green-700 bg-green-50" : "")}
                           onClick={() => {
                              toast.info("Camera activated. Capturing face...");
                              setTimeout(() => {
                                 setWalkInForm(prev => ({ ...prev, photo: 'captured' }));
                                 toast.success("Face enrolled successfully");
                              }, 1500);
                           }}
                        >
                           {walkInForm.photo ? (
                              <><CheckCircle2 size={16} className="mr-2" /> Face Enrolled</>
                           ) : (
                              <><Camera size={16} className="mr-2" /> Capture Face Photo</>
                           )}
                        </Button>
                        <p className="text-[10px] text-slate-400">Visitor must look directly at the camera.</p>
                     </div>
                  </div>
               </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setWalkInOpen(false)}>Cancel</Button>
               <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleWalkIn}>Check In Now</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

       {/* Edit Visitor Dialog */}
       <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[600px]">
             <DialogHeader>
                <DialogTitle>Edit Visitor Details</DialogTitle>
                <DialogDescription>Update information for {editForm.name}</DialogDescription>
             </DialogHeader>

             {/* Scan ID Button for Edit */}
             <div className="flex justify-center py-2 px-1">
                <Button 
                   variant="outline" 
                   className={cn(
                      "w-full h-16 border-dashed border-2 flex flex-col gap-1 transition-colors",
                      isScanning ? "border-teal-500 bg-teal-50 text-teal-600" : "border-slate-200 hover:border-slate-300 text-slate-500"
                   )}
                   onClick={handleEditScanId}
                   disabled={isScanning}
                >
                   {isScanning ? (
                      <>
                         <Loader2 className="animate-spin" size={20} />
                         <span className="text-xs font-medium">Scanning Document...</span>
                      </>
                   ) : (
                      <>
                         <ScanLine size={20} />
                         <span className="text-xs font-medium">Scan Passport or ID to Auto-fill</span>
                      </>
                   )}
                </Button>
             </div>
             
             <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Full Name <span className="text-red-500">*</span></Label>
                      <Input 
                         value={editForm.name}
                         onChange={e => setEditForm({...editForm, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                         value={editForm.email}
                         onChange={e => setEditForm({...editForm, email: e.target.value})}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Company</Label>
                      <Input 
                         value={editForm.company}
                         onChange={e => setEditForm({...editForm, company: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>Host</Label>
                      <Select value={editForm.host} onValueChange={v => setEditForm({...editForm, host: v})}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                            <SelectItem value="Mike Ross">Mike Ross</SelectItem>
                            <SelectItem value="Facilities">Facilities</SelectItem>
                            <SelectItem value="Reception Desk">Reception Desk</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <Input 
                         value={editForm.mobile}
                         onChange={e => setEditForm({...editForm, mobile: e.target.value})}
                         placeholder="+971..."
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>ID / Passport No.</Label>
                      <Input 
                         value={editForm.idNumber}
                         onChange={e => setEditForm({...editForm, idNumber: e.target.value})}
                         placeholder="Document ID"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                         type="date"
                         value={editForm.date}
                         onChange={e => setEditForm({...editForm, date: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>Time</Label>
                      <Input 
                         type="time"
                         value={editForm.time}
                         onChange={e => setEditForm({...editForm, time: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={editForm.type} onValueChange={v => setEditForm({...editForm, type: v, securityEscort: v === 'VVIP' ? true : false})}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="Client">Client</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="VVIP">VVIP</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Vendor">Vendor</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                {editForm.type === 'VVIP' && (
                   <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 text-amber-700 font-medium pb-2 border-b border-amber-200/50">
                         <span className="text-sm">VVIP Protocol Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label className="text-amber-900">Representative Name</Label>
                            <Input 
                               placeholder="e.g. Executive Assistant"
                               className="bg-white border-amber-200"
                               value={editForm.representativeName}
                               onChange={e => setEditForm({...editForm, representativeName: e.target.value})}
                            />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-amber-900">Rep. Phone</Label>
                            <Input 
                               placeholder="+1 555..."
                               className="bg-white border-amber-200"
                               value={editForm.representativePhone}
                               onChange={e => setEditForm({...editForm, representativePhone: e.target.value})}
                            />
                         </div>
                      </div>
                   </div>
                )}

                {(editForm.type === 'VVIP' || editForm.type === 'VIP') && (
                   <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="space-y-0.5">
                         <Label className="text-sm font-medium">Security Escort Required</Label>
                         <p className="text-xs text-slate-500">Security will be notified to escort guest upon arrival</p>
                      </div>
                      <Switch checked={editForm.securityEscort} onCheckedChange={c => setEditForm({...editForm, securityEscort: c})} />
                   </div>
                )}

                <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
                   <Label htmlFor="edit-parking" className="cursor-pointer">Parking Required</Label>
                   <Switch 
                      id="edit-parking"
                      checked={editForm.parking}
                      onCheckedChange={c => setEditForm({...editForm, parking: c})}
                   />
                </div>

                {editForm.parking && (
                   <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                   >
                      <Label>License Plate</Label>
                      <Input 
                         placeholder="DXB A 12345" 
                         value={editForm.plate}
                         onChange={e => setEditForm({...editForm, plate: e.target.value})}
                      />
                   </motion.div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
                   <Label>Biometric Enrollment</Label>
                   <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative shrink-0">
                         {editForm.photo ? (
                            <img src={editForm.photo === 'captured' ? "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" : editForm.photo} className="w-full h-full object-cover" alt="Face" />
                         ) : (
                            <User size={32} className="text-slate-300" />
                         )}
                      </div>
                      <div className="flex-1 space-y-2">
                         <Button 
                            variant="outline" 
                            className={cn("w-full justify-start", editForm.photo ? "border-green-200 text-green-700 bg-green-50" : "")}
                            onClick={() => {
                               toast.info("Camera activated. Capturing face...");
                               setTimeout(() => {
                                  setEditForm(prev => ({ ...prev, photo: 'captured' }));
                                  toast.success("Face enrolled successfully");
                               }, 1500);
                            }}
                         >
                            {editForm.photo ? (
                               <><CheckCircle2 size={16} className="mr-2" /> Face Enrolled</>
                            ) : (
                               <><Camera size={16} className="mr-2" /> Capture Face Photo</>
                            )}
                         </Button>
                      </div>
                   </div>
                </div>
             </div>

             <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSaveEdit}>Save Changes</Button>
             </DialogFooter>
          </DialogContent>
       </Dialog>

      {/* Visitor Review Modal */}
      <Dialog open={!!selectedVisitor} onOpenChange={(open) => !open && setSelectedVisitor(null)}>
         <DialogContent className="sm:max-w-[600px] overflow-hidden p-0 gap-0">
            <DialogHeader className="sr-only">
               <DialogTitle>Visitor Details</DialogTitle>
               <DialogDescription>Review and manage visitor access for {selectedVisitor?.name}</DialogDescription>
            </DialogHeader>
            {selectedVisitor && (
               <div className="flex flex-col">
                  {/* Header */}
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                     <div className="flex gap-4">
                        <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                           <AvatarFallback className="text-xl bg-slate-200 text-slate-500">{selectedVisitor.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">{selectedVisitor.name}</h2>
                           <p className="text-slate-500 text-sm flex items-center gap-2">
                              {selectedVisitor.company}
                              <Badge variant="secondary" className={cn(
                                 "text-xs h-5",
                                 selectedVisitor.type === 'VIP' ? "bg-purple-100 text-purple-700" :
                                 selectedVisitor.type === 'VVIP' ? "bg-amber-100 text-amber-800 font-bold" :
                                 ""
                              )}>{selectedVisitor.type}</Badge>
                           </p>
                           {selectedVisitor.type === 'VVIP' && (
                              <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-amber-50 rounded border border-amber-200 text-xs font-medium text-amber-800">
                                 <Users size={12} />
                                 Rep: {selectedVisitor.representativeName || 'N/A'} ({selectedVisitor.representativePhone || 'No Phone'})
                              </div>
                           )}
                           {selectedVisitor.securityEscortRequired && (
                              <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-50 rounded border border-red-200 text-xs font-medium text-red-800">
                                 <Shield size={12} /> Security Escort Required
                              </div>
                           )}
                           <div className="flex items-center gap-2 mt-2 text-xs">
                              <Badge variant={selectedVisitor.status === 'checked-in' ? 'default' : 'outline'} className={cn(
                                 selectedVisitor.status === 'checked-in' ? "bg-teal-100 text-teal-700 hover:bg-teal-100 border-teal-200" : "text-slate-500"
                              )}>
                                 {selectedVisitor.status.toUpperCase()}
                              </Badge>
                              {selectedVisitor.securityStatus === 'cleared' ? (
                                 <span className="text-emerald-600 flex items-center gap-1"><Shield size={12}/> Cleared</span>
                              ) : selectedVisitor.securityStatus === 'blacklisted' ? (
                                 <span className="text-red-600 flex items-center gap-1"><Ban size={12}/> Blacklisted</span>
                              ) : (
                                 <span className="text-amber-600 flex items-center gap-1"><AlertTriangle size={12}/> Review Needed</span>
                              )}
                           </div>
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" onClick={() => setSelectedVisitor(null)}><X size={20} /></Button>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <Label className="text-xs text-slate-500 uppercase tracking-wider">Host</Label>
                           <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                 {selectedVisitor.host.charAt(0)}
                              </div>
                              <span className="text-sm font-medium">{selectedVisitor.host}</span>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <Label className="text-xs text-slate-500 uppercase tracking-wider">Expected Time</Label>
                           <div className="flex items-center gap-2 text-sm">
                              <Clock size={14} className="text-slate-400" /> {selectedVisitor.time}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <Label className="text-xs text-slate-500 uppercase tracking-wider">Contact</Label>
                           <div className="flex items-center gap-2 text-sm">
                              <Mail size={14} className="text-slate-400" /> {selectedVisitor.email || 'N/A'}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <Label className="text-xs text-slate-500 uppercase tracking-wider">Documents</Label>
                           <div className="flex items-center gap-2 text-sm text-blue-600">
                              <FileText size={14} /> <span className="underline cursor-pointer">NDA Signed</span>
                           </div>
                        </div>
                        {selectedVisitor.location && (
                           <div className="space-y-1 col-span-2 border-t border-slate-100 pt-3 mt-1">
                              <Label className="text-xs text-slate-500 uppercase tracking-wider">Location</Label>
                              <div className="flex items-center gap-2 text-sm">
                                 <MapPin size={14} className="text-slate-400" /> {selectedVisitor.location}
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Identity Verification Section */}
                     <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <Label className="text-xs text-slate-500 uppercase tracking-wider mb-3 block">Identity Verification</Label>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                              <div className="flex items-center gap-2">
                                 <CreditCard size={16} className="text-slate-400" />
                                 <span className="text-sm font-medium text-slate-700">ID Document</span>
                              </div>
                              {selectedVisitor.securityStatus === 'cleared' ? (
                                 <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                    <CheckCircle2 size={10} /> Verified
                                 </Badge>
                              ) : (
                                 <Badge variant="outline" className="bg-slate-50 text-slate-500 gap-1">
                                    Pending
                                 </Badge>
                              )}
                           </div>
                           <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                              <div className="flex items-center gap-2">
                                 <ScanFace size={16} className="text-slate-400" />
                                 <span className="text-sm font-medium text-slate-700">Biometrics</span>
                              </div>
                              {/* Mock logic: if cleared or upcoming with photo, show enrolled */}
                              {(selectedVisitor.securityStatus === 'cleared' || selectedVisitor.photo) ? (
                                 <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                    <CheckCircle2 size={10} /> Enrolled
                                 </Badge>
                              ) : (
                                 <Badge variant="outline" className="bg-slate-50 text-slate-500 gap-1">
                                    Pending
                                 </Badge>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Warning Banner if matches blacklist name roughly */}
                     {blacklist.some(b => b.name === selectedVisitor.name) && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex gap-3 items-start">
                           <AlertTriangle className="text-red-600 mt-0.5" size={16} />
                           <div>
                              <h4 className="text-sm font-bold text-red-900">Potential Watchlist Match</h4>
                              <p className="text-xs text-red-700">Name matches an entry in the blacklist. Verify identity carefully.</p>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                     <div className="flex gap-2">
                        <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 gap-2" onClick={() => handleBlacklist(selectedVisitor)}>
                           <Ban size={16} /> Blacklist
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={() => toast.info("Printing visitor badge...")}>
                           <Printer size={16} /> Print Badge
                        </Button>
                     </div>
                     
                     {selectedVisitor.status !== 'checked-in' && selectedVisitor.status !== 'denied' && (
                        <div className="flex gap-2">
                           <Button variant="ghost" onClick={() => handleDeny(selectedVisitor)}>Deny Entry</Button>
                           <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => handleAdmit(selectedVisitor)}>
                              <CheckCircle2 size={16} /> Admit Visitor
                           </Button>
                        </div>
                     )}
                     {selectedVisitor.status === 'checked-in' && (
                        <Button variant="outline" className="text-slate-600 border-slate-300" onClick={() => {
                            updateVisitor(selectedVisitor.id, { status: 'checked-out' });
                            setSelectedVisitor(null);
                            toast.success("Checked out successfully");
                        }}>
                           Check Out
                        </Button>
                     )}
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between px-4 py-2 md:py-0 flex-shrink-0 gap-2 md:gap-0">
         <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">Reception Desk</h2>
            <span className="hidden md:inline text-slate-300">|</span>
            <div className="flex gap-4 text-sm text-slate-600">
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                           <div className="w-2 h-2 rounded-full bg-teal-500" />
                           <span className="font-medium text-xs md:text-sm">{stats.checkedIn} On-site</span>
                        </div>
                     </TooltipTrigger>
                     <TooltipContent>Total visitors currently in the building</TooltipContent>
                  </Tooltip>
               </TooltipProvider>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-medium text-xs md:text-sm">{stats.expected} Pending</span>
               </div>
            </div>
         </div>
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Button size="sm" variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 whitespace-nowrap" onClick={() => setWalkInOpen(true)}>
               <UserPlus size={14} className="mr-2" /> Walk-in
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white gap-2 whitespace-nowrap" onClick={() => setInviteOpen(true)}>
               <Mail size={14} /> Invite
            </Button>
         </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-2 md:p-4 overflow-hidden flex flex-col max-w-7xl mx-auto w-full">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
               <TabsList className="h-9 w-full md:w-auto overflow-x-auto justify-start">
                  <TabsTrigger value="arrivals" className="text-xs">Arrivals</TabsTrigger>
                  <TabsTrigger value="checked-in" className="text-xs">Checked In</TabsTrigger>
                  <TabsTrigger value="departed" className="text-xs">Departed</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs">History</TabsTrigger>
                  <TabsTrigger value="watchlist" className="text-xs text-red-600 data-[state=active]:text-red-700 data-[state=active]:bg-red-50">
                     <ShieldAlert size={12} className="mr-1" /> Watchlist
                  </TabsTrigger>
                  <TabsTrigger value="deliveries" className="text-xs gap-1">
                     <PackageIcon size={12} /> Deliveries
                  </TabsTrigger>
                  <TabsTrigger value="badges" className="text-xs gap-1">
                     <CreditCard size={12} /> Badges
                  </TabsTrigger>
               </TabsList>
               
               <div className="flex items-center gap-2">
                  <div className="relative flex-1 md:w-64">
                     <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <Input 
                        placeholder="Search guests..." 
                        className="pl-9 h-9 text-sm bg-white border-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 bg-white">
                     <Filter size={14} />
                  </Button>
               </div>
            </div>

            <Card className="flex-1 flex flex-col min-h-0 border-slate-200 shadow-sm bg-white overflow-hidden">
               <div className="flex-1 overflow-auto">
                  {activeTab === 'badges' ? (
                     <div className="p-2 md:p-4">
                        <BadgeInventory />
                     </div>
                  ) : activeTab === 'watchlist' ? (
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-slate-50 hover:bg-slate-50">
                              <TableHead>Name</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Date Added</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {blacklist.length === 0 ? (
                              <TableRow>
                                 <TableCell colSpan={5} className="text-center h-24 text-slate-500">No users on the watchlist.</TableCell>
                              </TableRow>
                           ) : (
                              blacklist.map((item) => (
                                 <TableRow key={item.id}>
                                    <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                                    <TableCell>{item.company}</TableCell>
                                    <TableCell className="text-red-600">{item.reason}</TableCell>
                                    <TableCell className="text-slate-500">{item.date}</TableCell>
                                    <TableCell className="text-right">
                                       <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                                          if(confirm("Remove from watchlist?")) {
                                             setBlacklist(blacklist.filter(b => b.id !== item.id));
                                          }
                                       }}>Remove</Button>
                                    </TableCell>
                                 </TableRow>
                              ))
                           )}
                        </TableBody>
                     </Table>
                  ) : activeTab === 'deliveries' ? (
                     <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                           <div className="flex items-center gap-2">
                              <PackageIcon className="text-slate-400" size={18} />
                              <h3 className="font-semibold text-slate-700">Incoming Packages</h3>
                           </div>
                           <Button size="sm" className="bg-slate-900 text-white gap-2" onClick={() => setPackageOpen(true)}>
                              <Plus size={16} /> Log Package
                           </Button>
                        </div>
                        <div className="flex-1 overflow-auto">
                           <Table>
                              <TableHeader>
                                 <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead>ID</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Carrier</TableHead>
                                    <TableHead>Tracking</TableHead>
                                    <TableHead>Arrival Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {filteredPackages.length === 0 ? (
                                    <TableRow>
                                       <TableCell colSpan={7} className="text-center h-24 text-slate-500">No packages found.</TableCell>
                                    </TableRow>
                                 ) : (
                                    filteredPackages.map((pkg) => (
                                       <TableRow key={pkg.id}>
                                          <TableCell className="font-mono text-xs text-slate-500">{pkg.id}</TableCell>
                                          <TableCell className="font-medium text-slate-900">{pkg.recipient}</TableCell>
                                          <TableCell>
                                             <div className="flex items-center gap-2">
                                                <Truck size={14} className="text-slate-400" />
                                                {pkg.carrier}
                                             </div>
                                          </TableCell>
                                          <TableCell className="font-mono text-xs text-slate-500">{pkg.trackingNumber || '-'}</TableCell>
                                          <TableCell>{pkg.arrivedAt}</TableCell>
                                          <TableCell>
                                             <Badge variant="outline" className={cn(
                                                "font-normal",
                                                pkg.status === 'picked-up' ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700 border-amber-200"
                                             )}>
                                                {pkg.status === 'picked-up' ? 'Picked Up' : 'Pending Pickup'}
                                             </Badge>
                                          </TableCell>
                                          <TableCell className="text-right">
                                             {pkg.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                   <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-teal-50 hover:text-teal-600" onClick={() => toast.success(`Notification sent to ${pkg.recipient}`)}>
                                                      Notify
                                                   </Button>
                                                   <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePickupPackage(pkg.id)}>
                                                      Mark Picked Up
                                                   </Button>
                                                </div>
                                             )}
                                          </TableCell>
                                       </TableRow>
                                    ))
                                 )}
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                  ) : (
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-slate-50 hover:bg-slate-50">
                              <TableHead className="w-[200px] md:w-[250px]">Visitor</TableHead>
                              <TableHead className="hidden md:table-cell">Host</TableHead>
                              <TableHead className="hidden lg:table-cell">Location</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead className="hidden sm:table-cell">Badge</TableHead>
                              <TableHead className="hidden sm:table-cell">Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredVisitors.length === 0 ? (
                              <TableRow>
                                 <TableCell colSpan={6} className="text-center h-32 text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                       <Users size={24} className="mb-2 opacity-50"/>
                                       No visitors found
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ) : (
                              filteredVisitors.map((visitor) => (
                                 <TableRow 
                                    key={visitor.id} 
                                    className="cursor-pointer hover:bg-slate-50/80"
                                    onClick={() => setSelectedVisitor(visitor)}
                                 >
                                    <TableCell>
                                       <div className="flex items-center gap-3">
                                          <Avatar className="h-9 w-9 border border-slate-200">
                                             <AvatarFallback className={cn(
                                                "text-xs font-medium",
                                                visitor.status === 'checked-in' ? "bg-teal-50 text-teal-700" : 
                                                visitor.status === 'denied' ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500",
                                                isOverdue(visitor) && "bg-red-100 text-red-700"
                                             )}>
                                                {visitor.name.substring(0,2)}
                                             </AvatarFallback>
                                          </Avatar>
                                          <div>
                                             <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                                {visitor.name}
                                                {isOverdue(visitor) && (
                                                   <Badge variant="destructive" className="h-4 px-1 text-[10px]">Overdue</Badge>
                                                )}
                                             </div>
                                             <div className="text-xs text-slate-500">{visitor.company}</div>
                                          </div>
                                       </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                       <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                          <Users size={14} className="text-slate-400" />
                                          <span>{visitor.host}</span>
                                       </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                       <div className="flex items-center gap-1.5 text-sm text-slate-600 max-w-[150px] truncate" title={visitor.location || 'My Office'}>
                                          <MapPin size={14} className="text-slate-400 shrink-0" />
                                          <span className="truncate">{visitor.location || 'My Office'}</span>
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                          <Clock size={14} className="text-slate-400" />
                                          <span>{visitor.time}</span>
                                       </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                       {visitor.badgeNumber ? (
                                          <Badge variant="outline" className="font-mono bg-slate-50 border-slate-200">
                                             #{visitor.badgeNumber}
                                          </Badge>
                                       ) : (
                                          <span className="text-xs text-slate-400">-</span>
                                       )}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                       <div className="flex items-center gap-2">
                                          <Badge variant="secondary" className={cn(
                                             "font-normal capitalize text-xs",
                                             visitor.type === 'Client' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                             visitor.type === 'Vendor' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                             visitor.type === 'VIP' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                             visitor.type === 'VVIP' ? "bg-amber-100 text-amber-800 border-amber-200 font-bold" :
                                             "bg-slate-100 text-slate-600 border-slate-200"
                                          )}>
                                             {visitor.type}
                                          </Badge>
                                          {visitor.parking && (
                                             <div className="bg-slate-100 p-1 rounded text-slate-500" title="Parking Required">
                                                <Car size={14} />
                                             </div>
                                          )}
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       {visitor.status === 'checked-in' ? (
                                          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-teal-200 font-medium gap-1 shadow-none">
                                             <CheckCircle2 size={10} /> Checked In
                                          </Badge>
                                       ) : visitor.status === 'denied' ? (
                                          <Badge variant="destructive" className="gap-1 shadow-none">
                                             <Ban size={10} /> Denied
                                          </Badge>
                                       ) : (visitor.status === 'checked-out' || visitor.status === 'completed') ? (
                                          <Badge variant="outline" className="text-slate-500 bg-slate-50 font-medium shadow-none">
                                             Departed
                                          </Badge>
                                       ) : visitor.status === 'registered' ? (
                                          <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 font-medium shadow-none gap-1">
                                             <CheckSquare size={10} /> Registered
                                          </Badge>
                                       ) : visitor.status === 'no-show' ? (
                                          <Badge variant="outline" className="text-slate-500 bg-slate-100 border-slate-200 font-medium shadow-none gap-1">
                                             <XCircle size={10} /> No Show
                                          </Badge>
                                       ) : (
                                          <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 font-medium shadow-none">
                                             Invited
                                          </Badge>
                                       )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                <MoreHorizontal size={16} />
                                             </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedVisitor(visitor); }}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(visitor); }}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDuplicateVisitor(visitor); }}>
                                                <Copy className="mr-2 h-4 w-4" /> Duplicate Visit
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("Printing badge..."); }}>
                                                <Printer className="mr-2 h-4 w-4" /> Print Badge
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPassVisitor(visitor); }}>
                                                <Smartphone className="mr-2 h-4 w-4" /> Digital Pass
                                             </DropdownMenuItem>
                                             <DropdownMenuSeparator />
                                             
                                             {visitor.status === 'checked-in' ? (
                                                <DropdownMenuItem onClick={(e) => { 
                                                   e.stopPropagation();
                                                   updateVisitor(visitor.id, { status: 'checked-out' });
                                                   toast.success("Checked out successfully");
                                                }}>
                                                   <ArrowRight className="mr-2 h-4 w-4" /> Check Out
                                                </DropdownMenuItem>
                                             ) : (visitor.status !== 'denied' && visitor.status !== 'checked-out' && visitor.status !== 'completed') && (
                                                <DropdownMenuItem onClick={(e) => { 
                                                   e.stopPropagation();
                                                   handleAdmit(visitor);
                                                }}>
                                                   <CheckCircle2 className="mr-2 h-4 w-4" /> Check In
                                                </DropdownMenuItem>
                                             )}

                                             {(visitor.status !== 'checked-in' && visitor.status !== 'checked-out' && visitor.status !== 'completed' && visitor.status !== 'denied' && visitor.status !== 'no-show') && (
                                                <>
                                                   <DropdownMenuSeparator />
                                                   <DropdownMenuItem className="text-slate-500" onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleNoShow(visitor);
                                                   }}>
                                                      <XCircle className="mr-2 h-4 w-4" /> Mark as No Show
                                                   </DropdownMenuItem>
                                                   <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => { 
                                                      e.stopPropagation();
                                                      handleDeny(visitor);
                                                   }}>
                                                      <Ban className="mr-2 h-4 w-4" /> Deny Entry
                                                   </DropdownMenuItem>
                                                </>
                                             )}
                                          </DropdownMenuContent>
                                       </DropdownMenu>
                                    </TableCell>
                                 </TableRow>
                              ))
                           )}
                        </TableBody>
                     </Table>
                  )}
               </div>
            </Card>
         </Tabs>
      <DuplicateVisitDialog 
         open={!!duplicateVisitor}
         onOpenChange={(open) => !open && setDuplicateVisitor(null)}
         visitor={duplicateVisitor}
         onDuplicate={handleConfirmDuplicate}
         onEditFull={handleEditDuplicateFull}
         isReception={true}
      />
      
      <CheckInDialog 
         open={!!checkInVisitor}
         onOpenChange={(open) => !open && setCheckInVisitor(null)}
         visitor={checkInVisitor}
         onConfirm={handleConfirmAdmit}
      />

      <CheckOutDialog 
         open={!!checkOutVisitor}
         onOpenChange={(open) => !open && setCheckOutVisitor(null)}
         visitor={checkOutVisitor}
         onConfirm={handleConfirmCheckOut}
      />
      
      <DigitalPassDialog 
         open={!!passVisitor}
         onOpenChange={(open) => !open && setPassVisitor(null)}
         visitor={passVisitor}
      />
      </div>
    </div>
  );
};
