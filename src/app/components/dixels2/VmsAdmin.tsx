import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Shield, 
  FileText, 
  Palette, 
  Globe, 
  UserCheck, 
  Settings, 
  AlertTriangle, 
  Upload,
  Plus,
  Car,
  LayoutGrid,
  Clock,
  Mail,
  Link as LinkIcon,
  Save,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useVms } from './VmsContext';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';

export const VmsAdmin: React.FC = () => {
  const { visitors, config, updateConfig } = useVms();

  // Parking Logic
  const TOTAL_SPOTS = 40;
  const reservedVisitors = visitors.filter(v => v.parking && (v.status === 'expected' || v.status === 'upcoming' || v.status === 'checked-in'));
  const occupiedCount = reservedVisitors.length;
  const occupancyRate = Math.round((occupiedCount / TOTAL_SPOTS) * 100);
  
  // Generate visual parking map
  const parkingSpots = Array.from({ length: TOTAL_SPOTS }, (_, i) => {
     const visitor = reservedVisitors[i]; // Simply map first N visitors to spots for demo
     return {
        id: i + 1,
        status: visitor ? (visitor.status === 'checked-in' ? 'occupied' : 'reserved') : 'free',
        visitorName: visitor?.name
     };
  });

  const VISITOR_HOURS_DATA = [
    { time: '08:00', visitors: 12 },
    { time: '09:00', visitors: 45 },
    { time: '10:00', visitors: 68 },
    { time: '11:00', visitors: 52 },
    { time: '12:00', visitors: 30 },
    { time: '13:00', visitors: 48 },
    { time: '14:00', visitors: 60 },
    { time: '15:00', visitors: 42 },
    { time: '16:00', visitors: 25 },
    { time: '17:00', visitors: 10 },
  ];

  const VISITOR_TYPE_DATA = [
    { name: 'Client', value: 40, color: '#0d9488' },
    { name: 'VIP', value: 5, color: '#7c3aed' },
    { name: 'VVIP', value: 2, color: '#d97706' },
    { name: 'Vendor', value: 20, color: '#64748b' },
    { name: 'Interview', value: 10, color: '#cbd5e1' },
    { name: 'Personal', value: 23, color: '#94a3b8' },
  ];

  const TOP_HOSTS_DATA = [
    { name: 'Sarah Chen', visits: 24 },
    { name: 'Mike Ross', visits: 18 },
    { name: 'Jessica P.', visits: 15 },
    { name: 'David Kim', visits: 12 },
    { name: 'Alex T.', visits: 10 },
  ];

  const handleSave = () => {
      toast.success("Configuration saved successfully");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden">
       {/* Header */}
       <header className="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
          <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                   <Settings className="text-slate-400" />
                   Visitor Management Configuration
                </h2>
                <p className="text-slate-500 mt-1 ml-9">Global settings for check-in workflows, security policies, and compliance.</p>
             </div>
             <div className="flex gap-3">
                <Button variant="outline">Discard Changes</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleSave}>
                   <Save size={16} /> Save Configuration
                </Button>
             </div>
          </div>
       </header>

       <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto w-full">
             <Tabs defaultValue="general" className="space-y-8">
                <TabsList className="bg-white p-1 border border-slate-200 h-auto w-full justify-start rounded-lg shadow-sm sticky top-0 z-10 flex-wrap">
                   <TabsTrigger value="general" className="px-4 py-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 gap-2">
                      <Settings size={16} /> General & Constraints
                   </TabsTrigger>
                   <TabsTrigger value="host" className="px-4 py-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 gap-2">
                      <Globe size={16} /> Host Portal
                   </TabsTrigger>
                   <TabsTrigger value="security" className="px-4 py-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 gap-2">
                      <Shield size={16} /> Security & Compliance
                   </TabsTrigger>
                   <TabsTrigger value="branding" className="px-4 py-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 gap-2">
                      <Palette size={16} /> Branding
                   </TabsTrigger>
                   <TabsTrigger value="nda" className="px-4 py-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 gap-2">
                      <FileText size={16} /> Documents
                   </TabsTrigger>
                   <TabsTrigger value="parking" className="px-4 py-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 gap-2">
                      <Car size={16} /> Parking
                   </TabsTrigger>
                   <TabsTrigger value="analytics" className="px-4 py-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 gap-2">
                      <BarChart3 size={16} /> Analytics
                   </TabsTrigger>
                </TabsList>

                {/* General & Constraints */}
                <TabsContent value="general" className="space-y-6">
                   <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2 space-y-6">
                         <Card>
                            <CardHeader>
                               <CardTitle>Visitor Constraints</CardTitle>
                               <CardDescription>Define rules for visitor limits and operating hours.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                     <Label>Max Visitors Per Host (Daily)</Label>
                                     <Input type="number" defaultValue={10} />
                                     <p className="text-xs text-slate-500">Limits the number of active invites per employee.</p>
                                  </div>
                                  <div className="space-y-2">
                                     <Label>Max Group Size</Label>
                                     <Input type="number" defaultValue={20} />
                                     <p className="text-xs text-slate-500">Larger groups require admin approval.</p>
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <Label>Checkout Grace Period (Minutes)</Label>
                                  <Input 
                                    type="number" 
                                    value={config.checkoutGracePeriodMinutes} 
                                    onChange={e => updateConfig({ checkoutGracePeriodMinutes: parseInt(e.target.value) || 0 })}
                                  />
                                  <p className="text-xs text-slate-500">Time allowed after expected checkout before triggering alerts.</p>
                               </div>
                               <Separator />
                               <div className="space-y-4">
                                  <Label className="flex items-center gap-2"><Clock size={16} /> Operating Hours for Visitors</Label>
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-1">
                                        <Label className="text-xs font-normal">Earliest Check-in</Label>
                                        <Input type="time" defaultValue="08:00" />
                                     </div>
                                     <div className="space-y-1">
                                        <Label className="text-xs font-normal">Latest Check-in</Label>
                                        <Input type="time" defaultValue="17:00" />
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                     <Switch id="weekend-allow" />
                                     <Label htmlFor="weekend-allow" className="font-normal">Allow Weekend Access</Label>
                                  </div>
                               </div>
                            </CardContent>
                         </Card>

                         <Card>
                            <CardHeader>
                               <CardTitle>Approval Workflows</CardTitle>
                               <CardDescription>Configure when manager approval is required.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                     <Label className="text-base">VIP & Government Officials</Label>
                                     <p className="text-xs text-slate-500">Require Security Director approval</p>
                                  </div>
                                  <Switch checked={true} />
                               </div>
                               <Separator />
                               <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                     <Label className="text-base">Large Groups ({'>'}10)</Label>
                                     <p className="text-xs text-slate-500">Require Facilities Manager approval</p>
                                  </div>
                                  <Switch checked={true} />
                               </div>
                               <Separator />
                               <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                     <Label className="text-base">Out of Hours Access</Label>
                                     <p className="text-xs text-slate-500">Require Line Manager approval</p>
                                  </div>
                                  <Switch checked={false} />
                               </div>
                            </CardContent>
                         </Card>
                      </div>

                      <div className="col-span-1 space-y-6">
                         <Card>
                            <CardHeader>
                               <CardTitle>System Toggles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <div className="flex items-center justify-between">
                                  <Label className="flex flex-col">
                                     <span>Self-Service Kiosk</span>
                                     <span className="font-normal text-xs text-slate-500">Enable iPad mode</span>
                                  </Label>
                                  <Switch checked={true} />
                               </div>
                               <Separator />
                               <div className="flex items-center justify-between">
                                  <Label className="flex flex-col">
                                     <span>Badge Printing</span>
                                     <span className="font-normal text-xs text-slate-500">Auto-print on arrival</span>
                                  </Label>
                                  <Switch checked={true} />
                               </div>
                               <Separator />
                               <div className="flex items-center justify-between">
                                  <Label className="flex flex-col">
                                     <span>Pre-registration</span>
                                     <span className="font-normal text-xs text-slate-500">Required for entry</span>
                                  </Label>
                                  <Switch checked={false} />
                               </div>
                            </CardContent>
                         </Card>
                      </div>
                   </div>
                </TabsContent>

                {/* Host Portal */}
                <TabsContent value="host" className="space-y-6">
                   <Card>
                      <CardHeader>
                         <CardTitle>Digital Invitation Settings</CardTitle>
                         <CardDescription>Customize the experience for external guests.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                               <div className="space-y-2">
                                  <Label>Custom Domain / Host URL</Label>
                                  <div className="flex gap-2">
                                     <div className="bg-slate-100 border border-slate-200 px-3 py-2 rounded-l-md text-slate-500 text-sm flex items-center">
                                        https://
                                     </div>
                                     <Input defaultValue="visitors.dixels.com" className="rounded-l-none" />
                                  </div>
                                  <p className="text-xs text-slate-500">CNAME verification required for custom domains.</p>
                               </div>

                               <div className="space-y-4">
                                  <Label className="text-base font-semibold">Notification Triggers</Label>
                                  <div className="space-y-3">
                                     <div className="flex items-center gap-2">
                                        <Switch checked={true} id="email-invite" />
                                        <Label htmlFor="email-invite" className="font-normal">Send Invitation Email</Label>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Switch checked={true} id="sms-invite" />
                                        <Label htmlFor="sms-invite" className="font-normal">Send SMS with QR Code</Label>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Switch checked={true} id="reminder" />
                                        <Label htmlFor="reminder" className="font-normal">Send Reminder (24h before)</Label>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Switch checked={true} id="arrival" />
                                        <Label htmlFor="arrival" className="font-normal">Notify Host upon Arrival (Push/Slack)</Label>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
                               <Label className="flex items-center gap-2"><Mail size={16}/> Email Template Preview</Label>
                               <div className="bg-white border border-slate-200 rounded p-4 shadow-sm text-sm space-y-3">
                                  <div className="border-b border-slate-100 pb-2 font-semibold">Subject: You're invited to Dixels HQ</div>
                                  <div className="space-y-2 text-slate-600">
                                     <p>Hello <strong>[Guest Name]</strong>,</p>
                                     <p>You have a scheduled visit with <strong>[Host Name]</strong> at Dixels HQ.</p>
                                     <div className="bg-slate-100 p-3 rounded text-center my-4">
                                        <p className="font-bold text-slate-900">Wed, Oct 12 • 10:00 AM</p>
                                        <p className="text-xs text-teal-600 underline mt-1">Add to Calendar</p>
                                     </div>
                                     <p>Please present the attached QR code at reception.</p>
                                  </div>
                               </div>
                               <Button variant="outline" size="sm" className="w-full">Customize Template</Button>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </TabsContent>

                {/* Branding Settings */}
                <TabsContent value="branding" className="space-y-6">
                   <Card>
                      <CardHeader>
                         <CardTitle>Kiosk Appearance</CardTitle>
                         <CardDescription>Customize the look and feel of the self-service iPad app.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                         <div className="flex items-start gap-8">
                            <div className="w-64 h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-50 hover:border-teal-500 transition-colors">
                               <Upload size={24} />
                               <span className="text-xs font-medium">Upload Logo (PNG/SVG)</span>
                            </div>
                            <div className="flex-1 space-y-4">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <Label>Accent Color</Label>
                                     <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded bg-teal-600 shadow-sm border border-slate-200" />
                                        <Input value="#0D9488" className="font-mono" />
                                     </div>
                                  </div>
                                  <div className="space-y-2">
                                     <Label>Background Style</Label>
                                     <Select defaultValue="light">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                           <SelectItem value="light">Clean White</SelectItem>
                                           <SelectItem value="dark">Dark Mode</SelectItem>
                                           <SelectItem value="image">Custom Image</SelectItem>
                                        </SelectContent>
                                     </Select>
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <Label>Welcome Message</Label>
                                  <Input defaultValue="Welcome to Dixels HQ" />
                               </div>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <Card className="border-red-100">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <Shield className="text-red-600" size={20} /> Internal Watchlist
                            </CardTitle>
                            <CardDescription>Manage blocked individuals and security alerts.</CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <Label className="text-base">Enable Watchlist Screening</Label>
                                  <p className="text-xs text-slate-500">Automatically flag visitors matching the internal blocklist.</p>
                               </div>
                               <Switch checked={true} />
                            </div>

                            <Separator />

                            {/* Add New Block */}
                            <div className="space-y-3">
                               <Label>Add to Blacklist</Label>
                               <div className="flex gap-2">
                                  <Input placeholder="Full Name" className="flex-1" />
                                  <Input placeholder="Reason (Optional)" className="flex-1" />
                                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Block</Button>
                               </div>
                            </div>

                            {/* List of Blocked Users (Mocked for UI) */}
                            <div className="space-y-3">
                               <Label>Active Blocks (2)</Label>
                               <div className="bg-slate-50 rounded-md border border-slate-200 divide-y divide-slate-100">
                                  <div className="p-3 flex justify-between items-center text-sm">
                                     <div>
                                        <span className="font-medium text-slate-900">John Smith</span>
                                        <span className="text-slate-500 ml-2 text-xs">• Security Incident #882</span>
                                     </div>
                                     <Button variant="ghost" size="sm" className="h-6 text-slate-400 hover:text-red-600">Remove</Button>
                                  </div>
                                  <div className="p-3 flex justify-between items-center text-sm">
                                     <div>
                                        <span className="font-medium text-slate-900">Sarah Connor</span>
                                        <span className="text-slate-500 ml-2 text-xs">• Banned (Terminated)</span>
                                     </div>
                                     <Button variant="ghost" size="sm" className="h-6 text-slate-400 hover:text-red-600">Remove</Button>
                                  </div>
                               </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-sm text-red-800 flex items-start gap-3">
                               <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                <div>
                                   <span className="font-bold">Automatic Alert:</span> When a name matches the blacklist, do not auto-print badge. Notify Security immediately.
                                </div>
                            </div>
                         </CardContent>
                      </Card>

                      <Card>
                         <CardHeader>
                            <CardTitle>Data Compliance (GDPR)</CardTitle>
                            <CardDescription>Manage data retention and privacy settings.</CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-6">
                            <div className="space-y-2">
                               <Label>Data Retention Period</Label>
                               <Select defaultValue="30">
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                     <SelectItem value="30">30 Days</SelectItem>
                                     <SelectItem value="90">90 Days</SelectItem>
                                     <SelectItem value="365">1 Year</SelectItem>
                                     <SelectItem value="forever">Indefinite (Not Recommended)</SelectItem>
                                  </SelectContent>
                               </Select>
                               <p className="text-xs text-slate-500">Visitor PII (Photo, ID) will be hard-deleted after this period.</p>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <Label>Anonymize on Delete</Label>
                                  <p className="text-xs text-slate-500">Keep statistical data but remove PII</p>
                               </div>
                               <Switch checked={true} />
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <Label>Visitor Consent Prompt</Label>
                                  <p className="text-xs text-slate-500">Require explicit consent for data processing</p>
                               </div>
                               <Switch checked={true} />
                            </div>
                         </CardContent>
                      </Card>
                   </div>
                </TabsContent>

                {/* NDA Settings */}
                <TabsContent value="nda" className="space-y-6">
                   <Card>
                      <CardHeader>
                         <CardTitle>Non-Disclosure Agreement</CardTitle>
                         <CardDescription>Edit the legal text presented to visitors during check-in.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">Reset to Default</Button>
                            <Button size="sm" className="bg-teal-600 text-white">Save Changes</Button>
                         </div>
                         <Textarea 
                            className="min-h-[300px] font-mono text-sm leading-relaxed"
                            defaultValue={`NON-DISCLOSURE AGREEMENT
 
 1. CONFIDENTIALITY
 Visitor agrees to keep confidential all proprietary information...
 
 2. RESTRICTIONS
 Visitor shall not record, photograph, or otherwise capture...
 
 3. LIABILITY
 Visitor assumes all risks associated with their visit...`} 
                         />
                      </CardContent>
                   </Card>
                </TabsContent>

                {/* Parking Settings */}
                <TabsContent value="parking" className="space-y-6">
                   <div className="grid grid-cols-3 gap-6">
                      <Card className="col-span-2">
                         <CardHeader>
                            <CardTitle>Parking Occupancy</CardTitle>
                            <CardDescription>Real-time tracking of visitor parking allocations.</CardDescription>
                         </CardHeader>
                         <CardContent>
                            {/* Stats */}
                            <div className="flex items-center justify-between mb-6">
                               <div className="flex gap-6">
                                  <div>
                                     <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Spots</p>
                                     <p className="text-2xl font-bold text-slate-900">{TOTAL_SPOTS}</p>
                                  </div>
                                  <div>
                                     <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Occupied</p>
                                     <p className="text-2xl font-bold text-teal-600">{occupiedCount}</p>
                                  </div>
                                  <div>
                                     <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Available</p>
                                     <p className="text-2xl font-bold text-slate-400">{TOTAL_SPOTS - occupiedCount}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <Badge variant={occupancyRate > 90 ? "destructive" : "secondary"} className="text-sm">
                                     {occupancyRate}% Full
                                  </Badge>
                               </div>
                            </div>

                            {/* Visual Grid */}
                            <div className="grid grid-cols-8 gap-2">
                               {parkingSpots.map((spot) => (
                                  <div 
                                     key={spot.id} 
                                     className={cn(
                                        "aspect-[2/3] rounded border flex flex-col items-center justify-center gap-1 text-xs transition-colors relative group",
                                        spot.status === 'free' ? "bg-slate-50 border-slate-200 text-slate-400" :
                                        spot.status === 'occupied' ? "bg-red-50 border-red-200 text-red-700" :
                                        "bg-blue-50 border-blue-200 text-blue-700" // reserved
                                     )}
                                  >
                                     <Car size={14} />
                                     <span className="font-bold">{spot.id}</span>
                                     
                                     {spot.status !== 'free' && (
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                           {spot.visitorName} ({spot.status})
                                        </div>
                                     )}
                                  </div>
                               ))}
                            </div>
                            
                            <div className="flex gap-4 mt-4 text-xs text-slate-500 justify-center">
                               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded" /> Available</div>
                               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded" /> Reserved</div>
                               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-50 border border-red-200 rounded" /> Occupied</div>
                            </div>
                         </CardContent>
                      </Card>

                      <Card>
                         <CardHeader>
                            <CardTitle>Rules & Capacity</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-6">
                            <div className="space-y-2">
                               <Label>Total Capacity</Label>
                               <div className="flex gap-2">
                                  <Input type="number" defaultValue={40} />
                                  <Button variant="outline">Update</Button>
                               </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                               <Label className="flex flex-col">
                                  <span>License Plate Required</span>
                                  <span className="font-normal text-xs text-slate-500">For security validation</span>
                               </Label>
                               <Switch checked={false} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                               <Label className="flex flex-col">
                                  <span>Valet Service</span>
                                  <span className="font-normal text-xs text-slate-500">VIP Guests only</span>
                               </Label>
                               <Switch checked={true} />
                            </div>
                         </CardContent>
                      </Card>
                   </div>
                </TabsContent>

                {/* Analytics Settings */}
                <TabsContent value="analytics" className="space-y-6">
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Total Visits (Monthly)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1,284</div>
                                <p className="text-xs text-teal-600 flex items-center mt-1">+12% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Avg. Duration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">48m</div>
                                <p className="text-xs text-slate-500 mt-1">Target: 60m</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Peak Hour</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">10:00 AM</div>
                                <p className="text-xs text-slate-500 mt-1">68 concurrent visitors</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Security Incidents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">3</div>
                                <p className="text-xs text-red-600 mt-1">Requires review</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Peak Visitor Hours */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Peak Visitor Traffic</CardTitle>
                                <CardDescription>Hourly breakdown of visitor check-ins</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={VISITOR_HOURS_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <RechartsTooltip />
                                        <Bar dataKey="visitors" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Visitor Type Breakdown */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Visitor Type Breakdown</CardTitle>
                                <CardDescription>Distribution by purpose of visit</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={VISITOR_TYPE_DATA}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {VISITOR_TYPE_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 mt-4">
                                    {VISITOR_TYPE_DATA.map((type) => (
                                        <div key={type.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                            <span className="text-xs text-slate-600">{type.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {/* Top Hosts */}
                        <Card className="col-span-1">
                           <CardHeader>
                              <CardTitle>Top Hosts</CardTitle>
                              <CardDescription>Most active employees</CardDescription>
                           </CardHeader>
                           <CardContent>
                              <div className="space-y-4">
                                 {TOP_HOSTS_DATA.map((host, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                                             {idx + 1}
                                          </div>
                                          <span className="text-sm font-medium">{host.name}</span>
                                       </div>
                                       <div className="text-sm text-slate-500 font-mono">{host.visits} visits</div>
                                    </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>

                        {/* Space Utilization (Heatmap Concept) */}
                        <Card className="col-span-2">
                           <CardHeader>
                              <CardTitle>Space Utilization Heatmap</CardTitle>
                              <CardDescription>Most frequently booked meeting rooms</CardDescription>
                           </CardHeader>
                           <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                 {[
                                    { name: 'Executive Boardroom', score: 92 },
                                    { name: 'Focus Room A', score: 45 },
                                    { name: 'Focus Room B', score: 30 },
                                    { name: 'Open Work Area', score: 78 },
                                    { name: 'Coffee Lounge', score: 60 },
                                    { name: 'Lab 1', score: 85 },
                                 ].map((room, idx) => (
                                    <div key={idx} className="space-y-1">
                                       <div className="flex justify-between text-xs mb-1">
                                          <span className="font-medium">{room.name}</span>
                                          <span className="text-slate-500">{room.score}% Occupancy</span>
                                       </div>
                                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                          <div 
                                             className={cn("h-full rounded-full", 
                                                room.score > 80 ? "bg-red-500" : 
                                                room.score > 60 ? "bg-amber-500" : 
                                                "bg-teal-500"
                                             )} 
                                             style={{ width: `${room.score}%` }} 
                                          />
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>
                    </div>
                </TabsContent>
             </Tabs>
          </div>
       </div>
    </div>
  );
};
