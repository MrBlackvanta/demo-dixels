import React, { useState } from 'react';
import { 
  LayoutDashboard, ListTodo, Users, Settings, 
  Search, Bell, Filter, MoreHorizontal, 
  CheckCircle2, Clock, AlertCircle, 
  ArrowUpRight, ArrowDownRight,
  TrendingUp, Zap, Shield, Inbox, Check, X, MessageSquare, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

// Mock Data Types (Shared with Employee View ideally)
interface Ticket {
  id: string;
  subject: string;
  requester: { name: string; avatar?: string; role: string; vip?: boolean };
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'open' | 'pending' | 'resolved';
  category: string;
  created: Date;
  assignee?: string;
  description?: string;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TIC-3921',
    subject: 'Urgent: Conference Room B Projector Failure',
    description: 'The projector in Room B keeps shutting down every 5 minutes. We have a client presentation in 1 hour.',
    requester: { name: 'Sarah Chen', role: 'Product Designer', vip: true },
    priority: 'critical',
    status: 'new',
    category: 'Facilities',
    created: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: 'TIC-3920',
    subject: 'VPN Access Request for New Hire',
    description: 'Please provision VPN access for the new frontend developer starting next Monday.',
    requester: { name: 'Mike Ross', role: 'Engineering Manager' },
    priority: 'medium',
    status: 'open',
    category: 'IT Access',
    created: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    assignee: 'David K.'
  },
  {
    id: 'TIC-3919',
    subject: 'Spill in 4th Floor Kitchen',
    description: 'Large coffee spill near the refrigerator. Needs mopping to prevent slipping.',
    requester: { name: 'Jenny Wilson', role: 'Marketing' },
    priority: 'high',
    status: 'pending',
    category: 'Facilities',
    created: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    assignee: 'Cleaning Crew'
  },
  {
    id: 'TIC-3918',
    subject: 'Figma License Upgrade',
    description: 'I need to edit variables in the design system, which requires a full Editor license.',
    requester: { name: 'Alex Morgan', role: 'Design' },
    priority: 'low',
    status: 'resolved',
    category: 'Software',
    created: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    assignee: 'System'
  }
];

const PriorityBadge = ({ priority }: { priority: Ticket['priority'] }) => {
  const styles = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <Badge variant="outline" className={cn("capitalize font-semibold shadow-none", styles[priority])}>
      {priority}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: Ticket['status'] }) => {
  const styles = {
    new: "bg-indigo-100 text-indigo-700 border-indigo-200",
    open: "bg-sky-100 text-sky-700 border-sky-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit", styles[status])}>
      <div className={cn("w-1.5 h-1.5 rounded-full", status === 'new' ? 'bg-indigo-500' : status === 'resolved' ? 'bg-green-500' : 'bg-current')} />
      <span className="capitalize">{status}</span>
    </div>
  );
};

export const AdminServiceDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState(MOCK_TICKETS);

  // KPIs
  const kpis = [
    { label: 'Open Tickets', value: '24', change: '+12%', trend: 'up', icon: Inbox, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Avg Response', value: '14m', change: '-2m', trend: 'down', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Critical Incidents', value: '1', change: 'Slack Outage', trend: 'neutral', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'CSAT Score', value: '4.8', change: '+0.2', trend: 'up', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleUpdateStatus = (status: Ticket['status']) => {
     if (!selectedTicket) return;
     setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status } : t));
     setSelectedTicket(prev => prev ? { ...prev, status } : null);
     toast.success(`Ticket marked as ${status}`);
  };

  return (
    <div className="flex h-full bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6">
           <div className="flex items-center gap-2 text-white font-bold text-lg mb-8">
              <Shield className="text-indigo-500" />
              Admin Desk
           </div>
           
           <nav className="space-y-1">
              {[
                 { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                 { id: 'queue', label: 'Ticket Queue', icon: ListTodo, count: 24 },
                 { id: 'team', label: 'Team', icon: Users },
                 { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => (
                 <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                       "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                       activeTab === item.id ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"
                    )}
                 >
                    <div className="flex items-center gap-3">
                       <item.icon size={18} />
                       {item.label}
                    </div>
                    {item.count && (
                       <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{item.count}</span>
                    )}
                 </button>
              ))}
           </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-800">
           <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-slate-700">
                 <AvatarFallback className="bg-slate-800 text-slate-400">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                 <div className="text-sm font-medium text-white truncate">John Doe</div>
                 <div className="text-xs text-slate-500 truncate">IT Admin</div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
           <div className="flex items-center gap-4 flex-1">
              <div className="relative w-96">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <Input className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl" placeholder="Search tickets, users, or assets..." />
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-slate-500 relative">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </Button>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
           <div className="max-w-7xl mx-auto space-y-8">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-4">
                 {kpis.map((kpi, i) => (
                    <Card key={i} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                       <CardContent className="p-5 flex items-start justify-between">
                          <div>
                             <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                             <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                             <div className={cn("flex items-center gap-1 text-xs font-medium mt-1", kpi.trend === 'up' ? "text-emerald-600" : kpi.trend === 'down' ? "text-emerald-600" : "text-amber-600")}>
                                {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : kpi.trend === 'down' ? <ArrowDownRight size={12} /> : <AlertCircle size={12} />}
                                {kpi.change}
                             </div>
                          </div>
                          <div className={cn("p-2 rounded-lg", kpi.bg)}>
                             <kpi.icon size={20} className={kpi.color} />
                          </div>
                       </CardContent>
                    </Card>
                 ))}
              </div>

              {/* Ticket Queue */}
              <Card className="shadow-sm border-slate-200 overflow-hidden">
                 <CardHeader className="bg-white border-b border-slate-100 px-6 py-4 flex flex-row items-center justify-between">
                    <div>
                       <CardTitle className="text-lg font-bold text-slate-900">Incoming Requests</CardTitle>
                       <CardDescription>Real-time feed of employee support tickets</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button variant="outline" size="sm" className="gap-2 rounded-lg h-9">
                          <Filter size={14} /> Filter
                       </Button>
                       <Button variant="outline" size="sm" className="gap-2 rounded-lg h-9">
                          <ArrowDownRight size={14} /> Sort
                       </Button>
                    </div>
                 </CardHeader>
                 <div className="p-0">
                    <Table>
                       <TableHeader>
                          <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50/50">
                             <TableHead className="w-[400px] font-semibold text-slate-500">Subject</TableHead>
                             <TableHead className="font-semibold text-slate-500">Requester</TableHead>
                             <TableHead className="font-semibold text-slate-500">Status</TableHead>
                             <TableHead className="font-semibold text-slate-500">Priority</TableHead>
                             <TableHead className="font-semibold text-slate-500">Created</TableHead>
                             <TableHead className="text-right font-semibold text-slate-500">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {tickets.map(ticket => (
                             <TableRow 
                                key={ticket.id} 
                                className="group hover:bg-indigo-50/30 cursor-pointer transition-colors border-slate-100"
                                onClick={() => setSelectedTicket(ticket)}
                             >
                                <TableCell className="font-medium py-4">
                                   <div className="flex flex-col">
                                      <span className="text-slate-900 font-semibold group-hover:text-indigo-600 transition-colors">{ticket.subject}</span>
                                      <span className="text-xs text-slate-500">{ticket.category} • #{ticket.id}</span>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                         <AvatarFallback className="bg-white border border-slate-200 text-slate-600 text-xs font-medium shadow-sm">{ticket.requester.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                         <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                            {ticket.requester.name}
                                            {ticket.requester.vip && <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] bg-amber-100 text-amber-700 border-amber-200">VIP</Badge>}
                                         </span>
                                         <span className="text-xs text-slate-500">{ticket.requester.role}</span>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <StatusBadge status={ticket.status} />
                                </TableCell>
                                <TableCell>
                                   <PriorityBadge priority={ticket.priority} />
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                   {format(ticket.created, 'h:mm a')}
                                </TableCell>
                                <TableCell className="text-right">
                                   <div className="flex justify-end gap-1">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                         <Eye size={16} />
                                      </Button>
                                   </div>
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
              </Card>

           </div>
        </main>
      </div>

      {/* Ticket Details Drawer */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
         <SheetContent className="w-[400px] sm:w-[600px] p-0 border-l shadow-2xl flex flex-col h-full bg-slate-50/50">
            {selectedTicket && (
               <>
                  <SheetHeader className="bg-white border-b p-6 space-y-4">
                     <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-slate-500 font-mono bg-slate-50">{selectedTicket.id}</Badge>
                        <div className="flex items-center gap-2">
                           {selectedTicket.priority === 'critical' && (
                              <div className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md border border-red-100">
                                 <AlertCircle size={12} /> High Priority
                              </div>
                           )}
                        </div>
                     </div>
                     <div>
                        <SheetTitle className="text-xl font-bold text-slate-900 leading-tight mb-2">
                           {selectedTicket.subject}
                        </SheetTitle>
                        <SheetDescription className="flex items-center gap-2 text-sm">
                           <Clock size={14} /> Created {format(selectedTicket.created, 'MMM d, h:mm a')}
                        </SheetDescription>
                     </div>
                     
                     <div className="flex gap-3 pt-2">
                        <Select onValueChange={(val) => handleUpdateStatus(val as Ticket['status'])} defaultValue={selectedTicket.status}>
                           <SelectTrigger className="w-[140px] h-9">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                           </SelectContent>
                        </Select>
                        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-9">
                           <MessageSquare size={16} className="mr-2" /> Reply
                        </Button>
                     </div>
                  </SheetHeader>

                  <ScrollArea className="flex-1">
                     <div className="p-6 space-y-8">
                        {/* Requester Info */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                 <AvatarFallback className="bg-indigo-100 text-indigo-700">{selectedTicket.requester.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                 <div className="font-semibold text-slate-900">{selectedTicket.requester.name}</div>
                                 <div className="text-xs text-slate-500">{selectedTicket.requester.role}</div>
                              </div>
                           </div>
                           <Button variant="outline" size="sm">View Profile</Button>
                        </div>

                        {/* Description */}
                        <div>
                           <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Description</h4>
                           <div className="prose prose-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-200">
                              <p>{selectedTicket.description || 'No description provided.'}</p>
                           </div>
                        </div>

                        {/* Activity Timeline (Mock) */}
                        <div>
                           <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Activity</h4>
                           <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                              <div className="relative">
                                 <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100" />
                                 <div className="text-sm text-slate-500">
                                    <span className="font-semibold text-slate-900">System</span> created ticket
                                    <div className="text-xs mt-1">{format(selectedTicket.created, 'h:mm a')}</div>
                                 </div>
                              </div>
                              {selectedTicket.status !== 'new' && (
                                 <div className="relative">
                                    <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white ring-1 ring-indigo-100" />
                                    <div className="text-sm text-slate-500">
                                       <span className="font-semibold text-slate-900">John Doe</span> changed status to <span className="font-medium text-indigo-600 capitalize">{selectedTicket.status}</span>
                                       <div className="text-xs mt-1">Just now</div>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </ScrollArea>

                  <div className="p-4 bg-white border-t border-slate-200">
                     <div className="relative">
                        <Textarea placeholder="Type an internal note or reply..." className="min-h-[80px] pr-12 resize-none" />
                        <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 bg-slate-900 hover:bg-slate-800">
                           <ArrowUpRight size={16} />
                        </Button>
                     </div>
                  </div>
               </>
            )}
         </SheetContent>
      </Sheet>
    </div>
  );
};
