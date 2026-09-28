import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  AlertTriangle, 
  Shield, 
  UserCheck, 
  Camera, 
  Lock, 
  MapPin, 
  Clock, 
  AlertOctagon, 
  Search,
  Filter,
  MoreHorizontal,
  Activity,
  Eye,
  History,
  Siren,
  Radio,
  Megaphone,
  CheckCircle,
  XCircle,
  PersonStanding,
  ArrowRight
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useVms } from './VmsContext';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Progress } from '../ui/progress';

export const VmsSecurity: React.FC = () => {
  const { stats, visitors, isOverdue, emergencyMode, triggerEvacuation, markVisitorSafe } = useVms();
  const [activeTab, setActiveTab] = useState('live');
  const [showEvacConfirm, setShowEvacConfirm] = useState(false);
  
  // Filter for active people on site for evacuation list
  const activeEvacuees = visitors.filter(v => v.status === 'checked-in');
  const safeCount = activeEvacuees.filter(v => v.securityStatus === 'cleared').length;
  const totalCount = activeEvacuees.length;
  const progress = totalCount > 0 ? (safeCount / totalCount) * 100 : 0;

  const startEvacuation = () => {
     setShowEvacConfirm(false);
     triggerEvacuation("Emergency Evacuation");
  };

  const overdueVisitors = visitors.filter(isOverdue);
  const escortRequiredVisitors = visitors.filter(v => v.securityEscortRequired && (v.status === 'expected' || v.status === 'checked-in') && (v.date === 'Today' || v.date === new Date().toISOString().split('T')[0]));

  const accessLogs = [
    { id: 1, user: 'Michael Johnson', type: 'Visitor', location: 'Main Lobby Turnstile', time: '10:05 AM', status: 'granted', avatar: 'MJ', alert: false },
    { id: 2, user: 'Sarah Chen', type: 'Employee', location: 'Elevator Bank B', time: '10:02 AM', status: 'granted', avatar: 'SC', alert: false },
    { id: 3, user: 'Unknown', type: 'Unknown', location: 'Server Room (Restricted)', time: '09:55 AM', status: 'denied', alert: true, avatar: '?' },
    { id: 4, user: 'David Miller', type: 'Service', location: 'Loading Dock', time: '08:15 AM', status: 'granted', avatar: 'DM', alert: false },
    { id: 5, user: 'James Wilson', type: 'Employee', location: 'Main Lobby', time: '08:10 AM', status: 'granted', avatar: 'JW', alert: false },
    { id: 6, user: 'Emily Davis', type: 'Visitor', location: 'Parking Gate 2', time: '08:05 AM', status: 'granted', avatar: 'ED', alert: false },
  ];

  const alerts = [
    { id: 1, title: 'Watchlist Match', desc: 'Potential match for "Blocked User" at North Entrance', severity: 'high', time: '2 mins ago', location: 'North Entrance' },
    { id: 2, title: 'Door Forced', desc: 'Emergency Exit Stairwell A sensor triggered', severity: 'critical', time: '15 mins ago', location: 'Stairwell A' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="text-teal-600 fill-teal-100" /> 
              Security Operations
           </h2>
           <p className="text-sm text-slate-500">Real-time Access Monitoring & Incident Response</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online
           </div>
           {!emergencyMode && (
             <Button variant="destructive" className="gap-2 shadow-sm" onClick={() => setShowEvacConfirm(true)}>
                <Siren size={16} /> Declare Incident
             </Button>
           )}
           {emergencyMode && (
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => triggerEvacuation(null)}>
                 End Emergency Mode
              </Button>
           )}
        </div>
      </header>

      {/* Evacuation Confirmation Dialog */}
      <Dialog open={showEvacConfirm} onOpenChange={setShowEvacConfirm}>
         <DialogContent className="border-red-200">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle /> Confirm Emergency Evacuation
               </DialogTitle>
               <DialogDescription>
                  This will trigger building-wide alarms, notify all hosts, and switch all screens to mustering mode.
                  <br /><br />
                  <strong>Are you sure you want to proceed?</strong>
               </DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setShowEvacConfirm(false)}>Cancel</Button>
               <Button variant="destructive" className="gap-2" onClick={startEvacuation}>
                  <Siren size={16} /> INITIATE EVACUATION
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {emergencyMode ? (
         <div className="flex-1 overflow-hidden flex flex-col p-6 bg-red-50/30 animate-in fade-in zoom-in-95 duration-300">
            {/* Mustering Dashboard */}
            <div className="flex items-center justify-between mb-8">
               <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-red-700 flex items-center gap-3">
                     <Siren size={32} className="animate-pulse" />
                     EMERGENCY MUSTERING ACTIVE
                  </h1>
                  <p className="text-red-600/80 font-medium">Head Count in Progress • Muster Point A & B</p>
               </div>
               <div className="text-right">
                  <div className="text-4xl font-bold text-slate-900">{safeCount} <span className="text-xl text-slate-400 font-normal">/ {totalCount}</span></div>
                  <p className="text-sm font-bold uppercase text-slate-500 tracking-wider">Accounted For</p>
               </div>
            </div>

            <div className="mb-8 space-y-2">
               <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Evacuation Progress</span>
                  <span>{Math.round(progress)}%</span>
               </div>
               <Progress value={progress} className="h-4 bg-red-100 [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600" />
            </div>

            <div className="flex-1 bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden flex flex-col">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Missing Personnel ({totalCount - safeCount})</h3>
                  <div className="flex gap-2">
                     <Button size="sm" variant="outline" onClick={() => {
                        activeEvacuees.forEach(v => markVisitorSafe(v.id));
                        toast.success("All marked as safe");
                     }}>Mark All Safe (Drill)</Button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {activeEvacuees.sort((a,b) => (a.securityStatus === 'cleared' ? 1 : -1)).map((person) => (
                        <div key={person.id} className={cn(
                           "flex items-center justify-between p-4 rounded-lg border transition-all",
                           person.securityStatus === 'cleared' 
                              ? "bg-green-50 border-green-200 opacity-60" 
                              : "bg-white border-red-200 shadow-sm border-l-4 border-l-red-500"
                        )}>
                           <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-slate-100">
                                 <AvatarFallback className={person.type === 'Visitor' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>
                                    {person.name.charAt(0)}
                                 </AvatarFallback>
                              </Avatar>
                              <div>
                                 <p className="font-bold text-slate-900">{person.name}</p>
                                 <p className="text-xs text-slate-500 flex items-center gap-1">
                                    {person.type} • <MapPin size={10} /> {person.location || 'Unknown'}
                                 </p>
                              </div>
                           </div>
                           
                           {person.securityStatus === 'cleared' ? (
                              <div className="flex flex-col items-center text-green-600">
                                 <CheckCircle size={24} />
                                 <span className="text-[10px] font-bold uppercase mt-1">Safe</span>
                              </div>
                           ) : (
                              <Button 
                                 size="sm" 
                                 className="bg-green-600 hover:bg-green-700 text-white"
                                 onClick={() => markVisitorSafe(person.id)}
                              >
                                 Mark Safe
                              </Button>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      ) : (
      <div className="flex-1 overflow-hidden flex gap-6 p-6">
         {/* Left Panel: Dashboard & Monitoring */}
         <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
               <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Visitors</p>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{stats.checkedIn}</div>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UserCheck size={20} />
                     </div>
                  </CardContent>
               </Card>
               <Card className="border-red-200 bg-red-50/30">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Active Alerts</p>
                        <div className="text-2xl font-bold text-red-700 mt-1">2</div>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center animate-pulse">
                        <AlertOctagon size={20} />
                     </div>
                  </CardContent>
               </Card>
               <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cameras</p>
                        <div className="text-2xl font-bold text-slate-900 mt-1">128<span className="text-sm text-slate-400 font-normal">/128</span></div>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Camera size={20} />
                     </div>
                  </CardContent>
               </Card>
               <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Perimeter</p>
                        <div className="text-2xl font-bold text-emerald-600 mt-1">Secure</div>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Lock size={20} />
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Main Feed & Tabs */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
               <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                     <TabsList>
                        <TabsTrigger value="live" className="gap-2"><Activity size={14}/> Live Feed</TabsTrigger>
                        <TabsTrigger value="cameras" className="gap-2"><Camera size={14}/> Cameras</TabsTrigger>
                        <TabsTrigger value="history" className="gap-2"><History size={14}/> Log History</TabsTrigger>
                     </TabsList>
                  </Tabs>
                  <div className="flex items-center gap-2">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <Input placeholder="Filter logs..." className="pl-8 h-8 w-48 bg-slate-50 border-slate-200" />
                     </div>
                     <Button variant="outline" size="icon" className="h-8 w-8"><Filter size={14}/></Button>
                  </div>
               </div>

               <div className="flex-1 overflow-hidden relative bg-slate-50/50">
                  {activeTab === 'live' && (
                     <div className="h-full overflow-auto bg-white">
                        <Table>
                           <TableHeader>
                              <TableRow className="bg-slate-50 hover:bg-slate-50">
                                 <TableHead className="w-[250px]">User</TableHead>
                                 <TableHead>Location</TableHead>
                                 <TableHead>Time</TableHead>
                                 <TableHead className="text-right">Status</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {accessLogs.map(log => (
                                 <TableRow key={log.id} className={cn(
                                    "hover:bg-slate-50 transition-colors",
                                    log.alert && "bg-red-50/30 hover:bg-red-50/50"
                                 )}>
                                    <TableCell>
                                       <div className="flex items-center gap-3">
                                          <Avatar className={cn("h-9 w-9 border", log.alert ? "border-red-200" : "border-slate-200")}>
                                             <AvatarFallback className={cn(log.alert ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600", "text-xs font-medium")}>
                                                {log.avatar}
                                             </AvatarFallback>
                                          </Avatar>
                                          <div>
                                             <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-900">{log.user}</span>
                                                {log.alert && <Badge variant="destructive" className="h-4 px-1 text-[10px] rounded-sm">ALERT</Badge>}
                                             </div>
                                             <Badge variant="outline" className="mt-1 text-[10px] h-4 px-1 text-slate-500 border-slate-200 font-normal">
                                                {log.type}
                                             </Badge>
                                          </div>
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                          <MapPin size={14} className="text-slate-400" />
                                          {log.location}
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       <div className="flex items-center gap-1.5 text-sm font-mono text-slate-500">
                                          <Clock size={14} className="text-slate-400" />
                                          {log.time}
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <Badge variant="outline" className={cn(
                                          "font-medium border-transparent",
                                          log.status === 'granted' ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                                       )}>
                                          {log.status.toUpperCase()}
                                       </Badge>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  )}

                  {activeTab === 'cameras' && (
                     <div className="p-4 grid grid-cols-2 gap-4 h-full overflow-y-auto">
                        {[1,2,3,4].map(cam => (
                           <div key={cam} className="bg-black rounded-lg overflow-hidden relative group aspect-video shadow-sm">
                              <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                                 <span className="bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
                                 </span>
                                 <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">CAM-0{cam}</span>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                 <Camera size={32} className="text-slate-700" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className="flex justify-between items-center">
                                    <span className="text-white text-xs">Main Lobby {cam}</span>
                                    <Button size="sm" variant="secondary" className="h-6 text-[10px]">Expand</Button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Right Panel: Alerts & Watchlist */}
         <div className="w-80 flex-shrink-0 flex flex-col gap-6">
            {/* Priority Alerts */}
            <Card className="border-red-200 shadow-sm">
               <CardHeader className="pb-3 bg-red-50/50 border-b border-red-100">
                  <CardTitle className="text-sm font-bold text-red-900 flex items-center gap-2">
                     <AlertTriangle size={16} className="text-red-600" /> Priority Alerts
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-red-100">
                     {escortRequiredVisitors.map(visitor => (
                        <div key={`escort-${visitor.id}`} className="p-4 hover:bg-amber-50/50 transition-colors bg-amber-50/30 border-l-4 border-amber-500">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-amber-800">Escort Required</span>
                              <span className="text-xs text-amber-600/70 font-mono">{visitor.time}</span>
                           </div>
                           <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                              {visitor.type} <strong>{visitor.name}</strong> requires security escort upon arrival.
                           </p>
                           <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3">
                              <MapPin size={10} /> {visitor.location || 'Reception'}
                           </div>
                           <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs w-full bg-amber-600 hover:bg-amber-700 text-white border-0">Assign Officer</Button>
                           </div>
                        </div>
                     ))}
                     {overdueVisitors.map(visitor => (
                        <div key={`overdue-${visitor.id}`} className="p-4 hover:bg-red-50/50 transition-colors bg-red-50/30 border-l-4 border-red-500">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-red-800">Checkout Overdue</span>
                              <span className="text-xs text-red-600/70 font-mono">Now</span>
                           </div>
                           <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                              Visitor <strong>{visitor.name}</strong> has exceeded expected checkout time ({visitor.expectedCheckout}).
                           </p>
                           <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3">
                              <MapPin size={10} /> {visitor.location || 'Unknown Location'}
                           </div>
                           <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs w-full bg-red-600 hover:bg-red-700 text-white border-0">Locate</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">Contact Host</Button>
                           </div>
                        </div>
                     ))}
                     {alerts.map(alert => (
                        <div key={alert.id} className="p-4 hover:bg-red-50/50 transition-colors">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-red-800">{alert.title}</span>
                              <span className="text-xs text-red-600/70 font-mono">{alert.time}</span>
                           </div>
                           <p className="text-xs text-slate-600 mb-2 leading-relaxed">{alert.desc}</p>
                           <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3">
                              <MapPin size={10} /> {alert.location}
                           </div>
                           <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs w-full bg-red-600 hover:bg-red-700 text-white border-0">Investigate</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">Dismiss</Button>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900">Quick Actions</CardTitle>
               </CardHeader>
               <CardContent className="p-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center text-center hover:border-teal-500 hover:text-teal-600">
                     <Radio size={20} />
                     <span className="text-[10px]">Broadcast</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center text-center hover:border-teal-500 hover:text-teal-600">
                     <Lock size={20} />
                     <span className="text-[10px]">Lockdown</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center text-center hover:border-teal-500 hover:text-teal-600">
                     <Eye size={20} />
                     <span className="text-[10px]">Watchlist</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center text-center hover:border-teal-500 hover:text-teal-600">
                     <History size={20} />
                     <span className="text-[10px]">Reports</span>
                  </Button>
               </CardContent>
            </Card>
         </div>
       </div>
      )}
    </div>
  );
};
