import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  MapPin, 
  Search,
  Filter,
  CheckCircle2,
  History,
  UserPlus,
  Briefcase,
  ArrowRight,
  Copy,
  Car,
  FileSpreadsheet,
  Trash2,
  Upload,
  AlertCircle,
  Check,
  X,
  User,
  MessageSquare,
  Edit,
  RefreshCw,
  XCircle,
  Link,
  Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { DuplicateVisitDialog } from './DuplicateVisitDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useVms } from './VmsContext';

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

export const VmsHost: React.FC = () => {
  const { visitors, packages, addVisitor, addVisitors, updateVisitor, emergencyMode } = useVms();
  
  // Mock Pending Visitors (Self-Registered via Kiosk/Link)
  // In a real app, these would come from the API with status='pending-approval'
  const [pendingVisitors, setPendingVisitors] = useState([
     { 
        id: 'p-1', 
        name: 'Michael Brown', 
        company: 'Tech Consultants', 
        email: 'm.brown@example.com', 
        date: 'Today', 
        time: '02:00 PM', 
        type: 'Vendor', 
        status: 'pending-approval', 
        requestSource: 'Kiosk Self-Reg',
        reason: 'Urgent server maintenance'
     },
     { 
        id: 'p-2', 
        name: 'Emily Wilson', 
        company: 'Design Co', 
        email: 'emily@design.co', 
        date: 'Tomorrow', 
        time: '10:00 AM', 
        type: 'Interview', 
        status: 'pending-approval', 
        requestSource: 'Host Link',
        reason: 'Product Design Interview - Round 2'
     }
  ]);

  // Filter for current user (Sarah Chen)
  const myVisitors = visitors.filter(v => v.host === 'Sarah Chen');
  
  // Filter my packages
  const myPackages = packages.filter(p => p.recipient === 'Sarah Chen' && p.status === 'pending');

  const [isInviteOpen, setInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [suggestions, setSuggestions] = useState<{name: string, email: string, company: string}[]>([]);
  const [inviteMode, setInviteMode] = useState('single');
  const [duplicateVisitor, setDuplicateVisitor] = useState<any>(null);

  const handleConfirmDuplicate = (date: string, time: string) => {
     if (!duplicateVisitor) return;
     
     const location = duplicateVisitor.location || 'My Office';
     
     addVisitor({
        name: duplicateVisitor.name,
        company: duplicateVisitor.company,
        email: duplicateVisitor.email,
        type: duplicateVisitor.type,
        date: date,
        time: time,
        parking: duplicateVisitor.parking,
        location: location,
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
         locationType: 'office', // defaulting to office for simplicity or parse location string if needed
         buildingId: '',
         floorId: '',
         spaceId: '',
         representativeName: duplicateVisitor.representativeName || '',
         representativePhone: duplicateVisitor.representativePhone || '',
         securityEscort: duplicateVisitor.securityEscortRequired || false
      });
      setEditingId(null);
      setInviteMode('single');
      setInviteOpen(true);
      setDuplicateVisitor(null);
  };
  
  // Single Invite State
  const [inviteForm, setInviteForm] = useState({
     name: '',
     email: '',
     company: '',
     type: 'Client',
     date: '',
     time: '',
     parking: false,
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
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Derive previous guests from history for autocomplete
  const previousGuests = useMemo(() => {
    const unique = new Map();
    visitors.forEach(v => {
      if (!unique.has(v.email)) {
        unique.set(v.email, { name: v.name, email: v.email, company: v.company });
      }
    });
    return Array.from(unique.values());
  }, [visitors]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInviteForm(prev => ({ ...prev, email: val }));
    
    if (val.length > 0) {
       const matches = previousGuests.filter(g => 
          g.email.toLowerCase().includes(val.toLowerCase()) || 
          g.name.toLowerCase().includes(val.toLowerCase())
       );
       setSuggestions(matches);
    } else {
       setSuggestions([]);
    }
  };

  const selectGuest = (guest: {name: string, email: string, company: string}) => {
     setInviteForm(prev => ({
        ...prev,
        email: guest.email,
        name: guest.name,
        company: guest.company
     }));
     setSuggestions([]);
  };

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

  const handleInvite = () => {
     if(!inviteForm.email) {
        toast.error("Email is required");
        return;
     }

     const location = getLocationString(inviteForm.locationType, inviteForm.buildingId, inviteForm.floorId, inviteForm.spaceId);
     
     if (editingId) {
        updateVisitor(editingId, {
           name: inviteForm.name,
           company: inviteForm.company,
           email: inviteForm.email,
           date: inviteForm.date,
           time: inviteForm.time,
           type: inviteForm.type,
           parking: inviteForm.parking,
           location,
           representativeName: inviteForm.type === 'VVIP' ? inviteForm.representativeName : undefined,
           representativePhone: inviteForm.type === 'VVIP' ? inviteForm.representativePhone : undefined,
           securityEscortRequired: inviteForm.type === 'VVIP' || inviteForm.type === 'VIP' ? inviteForm.securityEscort : false
        });
        toast.success("Visit updated successfully");
        setEditingId(null);
     } else {
        const newVisitor = addVisitor({
           name: inviteForm.name, // Context handles empty name
           company: inviteForm.company || 'Guest',
           email: inviteForm.email,
           date: inviteForm.date || 'Tomorrow',
           time: inviteForm.time || '09:00 AM',
           type: inviteForm.type,
           parking: inviteForm.parking,
           location,
           representativeName: inviteForm.type === 'VVIP' ? inviteForm.representativeName : undefined,
           representativePhone: inviteForm.type === 'VVIP' ? inviteForm.representativePhone : undefined,
           securityEscortRequired: inviteForm.type === 'VVIP' || inviteForm.type === 'VIP' ? inviteForm.securityEscort : false
        });
        toast.success(`Invitation sent to ${newVisitor.email}`);
     }
     
     setInviteOpen(false);
     setInviteForm({ 
        name: '', email: '', company: '', type: 'Client', date: '', time: '', parking: false,
        locationType: 'office', buildingId: '', floorId: '', spaceId: '',
        representativeName: '', representativePhone: '', securityEscort: false
     });
  };

  // Group Logic
  const handleParseCsv = () => {
     if (!csvText.trim()) return;
     
     const lines = csvText.trim().split('\n');
     const newRows = lines.map(line => {
       const [email, name, company] = line.split(',').map(s => s.trim());
       return { email: email || '', name: name || '', company: company || '' };
     }).filter(row => row.email);

     setGroupInvites(prev => [...prev.filter(r => r.email), ...newRows]); // Keep existing valid rows + new ones
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

     const location = getLocationString(groupLocation.type, groupLocation.buildingId, groupLocation.floorId, groupLocation.spaceId);

     const newVisitors = validRows.map(row => ({
        email: row.email,
        name: row.name,
        company: row.company,
        host: 'Sarah Chen',
        type: groupType,
        status: 'upcoming' as const,
        securityStatus: 'pending' as const,
        location
     }));

     // @ts-ignore
     addVisitors(newVisitors);
     setInviteOpen(false);
     setGroupInvites([
        { email: '', name: '', company: '' },
        { email: '', name: '', company: '' },
        { email: '', name: '', company: '' }
     ]);
     setGroupLocation({ type: 'office', buildingId: '', floorId: '', spaceId: '' });
     toast.success(`Sent ${newVisitors.length} invitations`);
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

  // Approval Logic
  const handleApprove = (id: string) => {
      const visitor = pendingVisitors.find(v => v.id === id);
      if (!visitor) return;

      // Move to real visitors
      addVisitor({
          name: visitor.name,
          company: visitor.company,
          email: visitor.email,
          date: visitor.date,
          time: visitor.time,
          type: visitor.type,
          status: 'expected'
      });

      setPendingVisitors(prev => prev.filter(v => v.id !== id));
      toast.success(`${visitor.name} has been approved.`);
  };

  const handleDeny = (id: string) => {
      setPendingVisitors(prev => prev.filter(v => v.id !== id));
      toast.info("Request denied.");
  };

  const activeList = myVisitors.filter(v => 
     v.status === 'expected' || v.status === 'upcoming' || v.status === 'checked-in' || v.status === 'registered'
  );
  const historyList = myVisitors.filter(v => 
     v.status === 'completed' || v.status === 'checked-out' || v.status === 'cancelled' || v.status === 'denied' || v.status === 'no-show'
  );

  const displayList = activeTab === 'upcoming' ? activeList : historyList;

  const stats = {
    expected: myVisitors.filter(v => v.status === 'expected' || v.status === 'upcoming' || v.status === 'registered').length,
    checkedIn: myVisitors.filter(v => v.status === 'checked-in').length,
    total: myVisitors.length
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden">
       {emergencyMode && (
         <div className="bg-red-600 text-white p-4 flex items-center justify-between animate-pulse px-6 flex-shrink-0 z-50">
            <div className="flex items-center gap-3">
               <AlertCircle size={24} className="fill-white text-red-600" />
               <div>
                  <h3 className="font-bold text-lg">EMERGENCY EVACUATION IN PROGRESS</h3>
                  <p className="text-red-100 text-sm">Please proceed to the nearest exit immediately. Do not use elevators.</p>
               </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded font-bold">
               MUSTER POINT A
            </div>
         </div>
       )}

       {/* Invite Dialog */}
       <Dialog open={isInviteOpen} onOpenChange={setInviteOpen}>
         <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>{editingId ? "Edit Visit Details" : "Invite Guest"}</DialogTitle>
               <DialogDescription>{editingId ? "Update the schedule or details for this visit." : "Send a digital invitation with QR code and directions."}</DialogDescription>
            </DialogHeader>

            <Tabs value={inviteMode} onValueChange={setInviteMode} className="w-full flex-1 overflow-hidden flex flex-col">
               <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                  <TabsTrigger value="single" disabled={!!editingId}>Single Invite</TabsTrigger>
                  <TabsTrigger value="group" disabled={!!editingId}>Group Invite</TabsTrigger>
               </TabsList>

               <TabsContent value="single" className="space-y-4 py-4 flex-1 overflow-y-auto">
                  <div className="space-y-2 relative">
                     <Label>Email Address <span className="text-red-500">*</span></Label>
                     <Input 
                        placeholder="Start typing email to search previous guests..." 
                        type="email"
                        value={inviteForm.email}
                        onChange={handleEmailChange}
                        autoFocus
                        className="border-slate-200 focus-visible:ring-teal-500"
                     />
                     {suggestions.length > 0 && inviteForm.email && !suggestions.find(s => s.email === inviteForm.email) && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 overflow-hidden max-h-[200px] overflow-y-auto">
                           <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50">Recent Guests</div>
                           {suggestions.map((guest) => (
                              <button 
                                 key={guest.email}
                                 className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 flex items-center justify-between group transition-colors"
                                 onClick={() => selectGuest(guest)}
                              >
                                 <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{guest.name}</span>
                                    <span className="text-xs text-slate-500">{guest.email}</span>
                                 </div>
                                 <span className="text-xs text-slate-400 group-hover:text-teal-600">{guest.company}</span>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Guest Name <span className="text-slate-400 font-normal text-xs">(Optional)</span></Label>
                        <Input 
                           placeholder="Jane Doe" 
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
                        <Input type="date" value={inviteForm.date} onChange={e => setInviteForm({...inviteForm, date: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label>Time</Label>
                        <Input type="time" value={inviteForm.time} onChange={e => setInviteForm({...inviteForm, time: e.target.value})} />
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
                           <SelectItem value="Vendor">Vendor / Contractor</SelectItem>
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
                           <RadioGroupItem value="office" id="host-loc-office" />
                           <Label htmlFor="host-loc-office" className="font-normal cursor-pointer">My Office</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                           <RadioGroupItem value="specific" id="host-loc-specific" />
                           <Label htmlFor="host-loc-specific" className="font-normal cursor-pointer">Specific Space</Label>
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
                  
                  <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
                     <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Parking Required</Label>
                        <p className="text-xs text-slate-500">Reserve a spot in the visitor lot</p>
                     </div>
                     <Switch checked={inviteForm.parking} onCheckedChange={c => setInviteForm({...inviteForm, parking: c})} />
                  </div>

                  <DialogFooter className="mt-4">
                     <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                     <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleInvite}>
                        {editingId ? "Save Changes" : "Send Invite"}
                     </Button>
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
                                  <RadioGroupItem value="office" id="grp-host-office" />
                                  <Label htmlFor="grp-host-office" className="font-normal cursor-pointer text-sm">My Office</Label>
                               </div>
                               <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="specific" id="grp-host-specific" />
                                  <Label htmlFor="grp-host-specific" className="font-normal cursor-pointer text-sm">Specific Space</Label>
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

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
         <div>
            <h2 className="text-xl font-bold text-slate-900">My Visitors</h2>
            <p className="text-xs text-slate-500">Manage your upcoming appointments and guests</p>
         </div>
         <div className="flex items-center gap-3">
            {pendingVisitors.length > 0 && (
               <Badge variant="destructive" className="animate-pulse bg-amber-500 hover:bg-amber-600">
                  {pendingVisitors.length} Pending Approvals
               </Badge>
            )}
            <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => setInviteOpen(true)}>
               <UserPlus size={16} /> New Invitation
            </Button>
         </div>
      </header>

      <div className="flex-1 w-full overflow-y-auto min-h-0">
         <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
         
         {/* Pending Approvals Section */}
         {pendingVisitors.length > 0 && (
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-amber-600 font-medium text-sm px-1">
                  <AlertCircle size={16} /> 
                  <span>Action Required ({pendingVisitors.length})</span>
               </div>
               <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
                  {pendingVisitors.map((visitor) => (
                     <div key={visitor.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-9 w-9 border border-slate-100 bg-amber-50">
                              <AvatarFallback className="text-xs font-medium text-amber-700">{visitor.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div>
                              <div className="flex items-center gap-2">
                                 <span className="font-medium text-sm text-slate-900">{visitor.name}</span>
                                 <span className="text-xs text-slate-400">•</span>
                                 <span className="text-xs text-slate-500">{visitor.company}</span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                 <span className="font-medium text-slate-700">{visitor.date} @ {visitor.time}</span>
                                 <span className="text-slate-300">|</span>
                                 <span>{visitor.requestSource}</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           {visitor.reason && (
                              <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 max-w-[200px] truncate hidden md:block">
                                 <span className="font-medium text-slate-600">Note:</span> {visitor.reason}
                              </div>
                           )}
                           <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeny(visitor.id)}>
                                 Deny
                              </Button>
                              <Button size="sm" className="h-8 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-sm" onClick={() => handleApprove(visitor.id)}>
                                 Approve
                              </Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Deliveries Notification Section */}
         {myPackages.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                     <Package size={20} />
                  </div>
                  <div>
                     <h3 className="font-bold text-indigo-900">You have {myPackages.length} package{myPackages.length > 1 ? 's' : ''} at reception</h3>
                     <p className="text-sm text-indigo-700">Please pick them up at your earliest convenience.</p>
                  </div>
               </div>
               <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setActiveTab('deliveries')}>
                  View Details
               </Button>
            </div>
         )}

         {/* Quick Stats */}
         <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-none shadow-md">
               <CardContent className="p-4 flex items-center justify-between">
                  <div>
                     <p className="text-teal-100 text-xs font-medium uppercase tracking-wider">Expected Today</p>
                     <div className="text-3xl font-bold mt-1">{stats.expected}</div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                     <Clock size={20} />
                  </div>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-4 flex items-center justify-between">
                  <div>
                     <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Checked In</p>
                     <div className="text-3xl font-bold text-slate-900 mt-1">{stats.checkedIn}</div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                     <CheckCircle2 size={20} />
                  </div>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-4 flex items-center justify-between">
                  <div>
                     <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total History</p>
                     <div className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                     <History size={20} />
                  </div>
               </CardContent>
            </Card>
         </div>

         <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 py-3 px-6">
               <div className="flex items-center justify-between">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                     <TabsList>
                        <TabsTrigger value="upcoming">Active & Upcoming</TabsTrigger>
                        <TabsTrigger value="deliveries" className="gap-2">
                           My Deliveries
                           {myPackages.length > 0 && (
                              <Badge className="h-5 px-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none shadow-none">
                                 {myPackages.length}
                              </Badge>
                           )}
                        </TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                     </TabsList>
                  </Tabs>
                  <div className="relative w-64">
                     <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <Input placeholder="Search visitors..." className="pl-9 h-9 bg-slate-50 border-slate-200" />
                  </div>
               </div>
            </CardHeader>
            
            <div className="flex-1 overflow-auto">
               {activeTab === 'deliveries' ? (
                  <Table>
                     <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                           <TableHead>Package ID</TableHead>
                           <TableHead>Carrier</TableHead>
                           <TableHead>Tracking #</TableHead>
                           <TableHead>Arrived At</TableHead>
                           <TableHead>Location</TableHead>
                           <TableHead>Status</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {myPackages.length === 0 ? (
                           <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                 No pending deliveries found.
                              </TableCell>
                           </TableRow>
                        ) : (
                           myPackages.map((pkg) => (
                              <TableRow key={pkg.id}>
                                 <TableCell className="font-mono text-xs text-slate-500">{pkg.id}</TableCell>
                                 <TableCell className="font-medium">{pkg.carrier}</TableCell>
                                 <TableCell className="font-mono text-xs text-slate-500">{pkg.trackingNumber || '-'}</TableCell>
                                 <TableCell>{pkg.arrivedAt}</TableCell>
                                 <TableCell>{pkg.location}</TableCell>
                                 <TableCell>
                                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none shadow-none">
                                       Ready for Pickup
                                    </Badge>
                                 </TableCell>
                              </TableRow>
                           ))
                        )}
                     </TableBody>
                  </Table>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-[250px]">Visitor</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Visit Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {displayList.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                              No {activeTab} visitors found.
                           </TableCell>
                        </TableRow>
                     ) : (
                        displayList.map((visitor) => (
                           <TableRow key={visitor.id} className="group">
                              <TableCell>
                                 <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                       <AvatarImage src={visitor.photo} />
                                       <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                                          {visitor.name.charAt(0)}
                                       </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                       <span className="font-medium text-slate-900">{visitor.name}</span>
                                       <span className="text-xs text-slate-500">{visitor.email}</span>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center gap-1 text-slate-600">
                                    <Briefcase size={14} className="text-slate-400" />
                                    {visitor.company}
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center gap-1 text-slate-600 max-w-[150px] truncate" title={visitor.location || 'My Office'}>
                                    <MapPin size={14} className="text-slate-400 shrink-0" />
                                    <span className="truncate text-xs">{visitor.location || 'My Office'}</span>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <div className="flex flex-col text-sm">
                                    <span className="font-medium text-slate-900">{visitor.date}</span>
                                    <span className="text-xs text-slate-500">{visitor.time}</span>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <Badge variant="outline" className={cn("font-normal", 
                                    visitor.type === 'VIP' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                    visitor.type === 'VVIP' ? "bg-amber-100 text-amber-800 border-amber-300 font-bold shadow-sm" :
                                    ""
                                 )}>
                                    {visitor.type}
                                 </Badge>
                              </TableCell>
                              <TableCell>
                                 <Badge 
                                    className={cn(
                                       "font-medium border-none",
                                       visitor.status === 'expected' ? "bg-blue-50 text-blue-700 hover:bg-blue-100" :
                                       visitor.status === 'upcoming' ? "bg-slate-100 text-slate-700 hover:bg-slate-200" :
                                       visitor.status === 'checked-in' ? "bg-green-50 text-green-700 hover:bg-green-100" :
                                       "bg-gray-50 text-gray-500"
                                    )}
                                 >
                                    {visitor.status.replace('-', ' ')}
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                          <MoreHorizontal size={16} />
                                       </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                       <DropdownMenuLabel>Manage Visit</DropdownMenuLabel>
                                       
                                       {/* Active / Future Visits */}
                                       {(visitor.status === 'upcoming' || visitor.status === 'expected') && (
                                          <>
                                             <DropdownMenuItem onClick={() => {
                                                const link = `https://dixels-vms.com/invite/${visitor.inviteCode || 'INV-123'}`;
                                                
                                                // Fallback copy mechanism for iframe environments
                                                const copyToClipboard = (text: string) => {
                                                   if (navigator.clipboard && navigator.clipboard.writeText) {
                                                      navigator.clipboard.writeText(text)
                                                         .then(() => toast.success("Invite link copied to clipboard"))
                                                         .catch(() => fallbackCopy(text));
                                                   } else {
                                                      fallbackCopy(text);
                                                   }
                                                };

                                                const fallbackCopy = (text: string) => {
                                                   try {
                                                      const textArea = document.createElement("textarea");
                                                      textArea.value = text;
                                                      textArea.style.position = "fixed"; // Avoid scrolling to bottom
                                                      document.body.appendChild(textArea);
                                                      textArea.focus();
                                                      textArea.select();
                                                      const successful = document.execCommand('copy');
                                                      document.body.removeChild(textArea);
                                                      if (successful) {
                                                         toast.success("Invite link copied to clipboard");
                                                      } else {
                                                         throw new Error("Copy failed");
                                                      }
                                                   } catch (err) {
                                                      // If all else fails, show the link to the user
                                                      toast.message("Could not auto-copy", {
                                                         description: text,
                                                         action: {
                                                            label: "Close",
                                                            onClick: () => {}
                                                         }
                                                      });
                                                   }
                                                };

                                                copyToClipboard(link);
                                             }}>
                                                <Link className="mr-2 h-4 w-4" /> Copy Invite Link
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => setDuplicateVisitor(visitor)}>
                                                <Copy className="mr-2 h-4 w-4" /> Duplicate Visit
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => {
                                                setInviteForm({
                                                   name: visitor.name,
                                                   email: visitor.email,
                                                   company: visitor.company,
                                                   type: visitor.type,
                                                   // Handle "Today" case or pass standard date
                                                   date: visitor.date === 'Today' ? new Date().toISOString().split('T')[0] : visitor.date,
                                                   time: visitor.time,
                                                   parking: visitor.parking,
                                                   locationType: 'office',
                                                   buildingId: '',
                                                   floorId: '',
                                                   spaceId: '',
                                                   representativeName: visitor.representativeName || '',
                                                   representativePhone: visitor.representativePhone || '',
                                                   securityEscort: visitor.securityEscortRequired || false
                                                });
                                                setEditingId(visitor.id);
                                                setInviteMode('single');
                                                setInviteOpen(true);
                                             }}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit / Reschedule
                                             </DropdownMenuItem>
                                             <DropdownMenuSeparator />
                                             <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => {
                                                updateVisitor(visitor.id, { status: 'cancelled' });
                                                toast.success("Visit cancelled");
                                             }}>
                                                <XCircle className="mr-2 h-4 w-4" /> Cancel Visit
                                             </DropdownMenuItem>
                                          </>
                                       )}

                                       {/* On-site */}
                                       {visitor.status === 'checked-in' && (
                                          <DropdownMenuItem disabled>
                                             <CheckCircle2 className="mr-2 h-4 w-4" /> Currently On-site
                                          </DropdownMenuItem>
                                       )}

                                       {/* Past / Cancelled */}
                                       {(visitor.status === 'completed' || visitor.status === 'checked-out' || visitor.status === 'cancelled' || visitor.status === 'denied') && (
                                          <DropdownMenuItem onClick={() => setDuplicateVisitor(visitor)}>
                                             <RefreshCw className="mr-2 h-4 w-4" /> Re-invite Guest
                                          </DropdownMenuItem>
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
         </div>
      <DuplicateVisitDialog 
        open={!!duplicateVisitor}
        onOpenChange={(open) => !open && setDuplicateVisitor(null)}
        visitor={duplicateVisitor}
        onDuplicate={handleConfirmDuplicate}
        onEditFull={handleEditDuplicateFull}
      />
      </div>
    </div>
  );
};
