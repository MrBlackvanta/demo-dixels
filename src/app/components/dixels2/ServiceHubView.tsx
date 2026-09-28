import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Briefcase, Monitor, Wrench, Shield, FileText, 
  CreditCard, Gift, Clock, Calendar, ChevronRight, 
  Info, LayoutGrid, List, Sparkles, Loader2,
  BookOpen, Heart, Video, Laptop, FileBox, Printer, Users, Building, Plus,
  Ticket as TicketIcon, CheckCircle2, AlertCircle, Timer, ArrowLeft,
  Server, Link as LinkIcon, Send, User, Bot, MessageSquare,
  Check, Circle, XCircle, ArrowRight
} from 'lucide-react';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useEnterpriseContext, Ticket, TicketMessage } from './EnterpriseContext';
import { format, addDays, subDays } from 'date-fns';

// --- Types & Data ---

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: 'IT' | 'HR' | 'Facilities' | 'Finance';
  icon: any;
  popular?: boolean;
  sla: string;
  formType: 'simple' | 'approval' | 'complex';
  source?: 'ServiceNow' | 'ManageEngine' | 'Jira' | 'Workday';
}

const SERVICE_CATALOG: ServiceItem[] = [
  // IT
  { id: 'it-1', name: 'Request New Laptop', description: 'Standard issue MacBook or Dell XPS for employees.', category: 'IT', icon: Laptop, popular: true, sla: '3 Days', formType: 'approval', source: 'ServiceNow' },
  { id: 'it-2', name: 'Software License', description: 'Request access to Adobe, Jira, or other software.', category: 'IT', icon: FileBox, sla: '1 Day', formType: 'simple', source: 'Jira' },
  { id: 'it-3', name: 'Monitor Request', description: '27-inch 4K external monitor.', category: 'IT', icon: Monitor, sla: '2 Days', formType: 'simple' },
  { id: 'it-4', name: 'VPN Access', description: 'Remote access configuration for secure connection.', category: 'IT', icon: Shield, sla: '4 Hours', formType: 'approval', source: 'ManageEngine' },
  
  // HR
  { id: 'hr-1', name: 'Employment Verification', description: 'Letter confirming employment status and salary.', category: 'HR', icon: FileText, popular: true, sla: '1 Day', formType: 'simple', source: 'Workday' },
  { id: 'hr-2', name: 'Leave Adjustment', description: 'Correction for annual leave balance.', category: 'HR', icon: Calendar, sla: '2 Days', formType: 'approval', source: 'Workday' },
  { id: 'hr-3', name: 'Onboarding Kit', description: 'Welcome pack for new joiners.', category: 'HR', icon: Gift, sla: '5 Days', formType: 'simple' },
  
  // Facilities
  { id: 'fac-1', name: 'Access Badge Replacement', description: 'Lost or damaged security badge replacement.', category: 'Facilities', icon: CreditCard, popular: true, sla: '1 Day', formType: 'simple' },
  { id: 'fac-2', name: 'Ergonomic Chair', description: 'Request for specialized seating.', category: 'Facilities', icon: Briefcase, sla: '7 Days', formType: 'approval', source: 'ServiceNow' },
  { id: 'fac-3', name: 'Business Cards', description: 'Print new set of standard business cards.', category: 'Facilities', icon: Printer, sla: '5 Days', formType: 'simple' },

  // Finance
  { id: 'fin-1', name: 'Corporate Card', description: 'Apply for a company credit card.', category: 'Finance', icon: CreditCard, sla: '10 Days', formType: 'complex' },
];

// --- Workflow Logic ---

interface WorkflowStep {
    id: string;
    title: string;
    status: 'completed' | 'current' | 'pending' | 'rejected';
    date?: Date;
    assignee?: string;
    role?: string;
    comments?: string;
}

const getWorkflowSteps = (ticket: Ticket): WorkflowStep[] => {
    // Generate mock workflow based on ticket status and service
    const steps: WorkflowStep[] = [];
    const createdDate = ticket.messages[0]?.timestamp || new Date();
    
    // Step 1: Submission (Always completed)
    steps.push({
        id: 'step-1',
        title: 'Request Submitted',
        status: 'completed',
        date: createdDate,
        assignee: 'You',
        role: 'Requester'
    });

    if (ticket.service === 'Finance' || ticket.service === 'HR') {
        // Approval Workflow
        const isApproved = ticket.status === 'In Progress' || ticket.status === 'Resolved';
        
        steps.push({
            id: 'step-2',
            title: 'Manager Approval',
            status: isApproved ? 'completed' : ticket.status === 'Pending Approval' ? 'current' : 'pending',
            date: isApproved ? addDays(createdDate, 1) : undefined,
            assignee: 'James Thompson',
            role: 'Line Manager',
            comments: isApproved ? 'Approved for Q3 budget.' : undefined
        });

        steps.push({
            id: 'step-3',
            title: 'Department Processing',
            status: ticket.status === 'Resolved' ? 'completed' : (isApproved && ticket.status === 'In Progress') ? 'current' : 'pending',
            assignee: `${ticket.service} Ops Team`,
            role: 'Fulfillment'
        });
    } else {
        // Standard Fulfillment Workflow
        steps.push({
            id: 'step-2',
            title: 'Triage & Assignment',
            status: ticket.status !== 'New' ? 'completed' : 'current',
            date: ticket.status !== 'New' ? addMinutes(createdDate, 30) : undefined,
            assignee: 'Service Desk',
            role: 'Triage'
        });

        steps.push({
            id: 'step-3',
            title: 'Fulfillment',
            status: ticket.status === 'Resolved' ? 'completed' : (ticket.status === 'In Progress' ? 'current' : 'pending'),
            assignee: ticket.agent,
            role: 'Technician'
        });
    }

    // Final Step
    steps.push({
        id: 'step-final',
        title: 'Request Completed',
        status: ticket.status === 'Resolved' ? 'completed' : 'pending',
        date: ticket.status === 'Resolved' ? new Date() : undefined
    });

    return steps;
};

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

// --- Components ---

const WorkflowVisualizer = ({ ticket }: { ticket: Ticket }) => {
    const steps = getWorkflowSteps(ticket);
    
    return (
        <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            {steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isPending = step.status === 'pending';
                
                return (
                    <div key={step.id} className="relative">
                        {/* Dot Indicator */}
                        <div className={cn(
                            "absolute -left-[29px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10",
                            isCompleted ? "border-emerald-500 text-emerald-600" :
                            isCurrent ? "border-indigo-600 text-indigo-600 ring-4 ring-indigo-50" :
                            "border-slate-300 text-slate-300"
                        )}>
                            {isCompleted ? <Check size={12} strokeWidth={3} /> : 
                             isCurrent ? <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" /> : 
                             <Circle size={8} className="fill-slate-100" />}
                        </div>

                        {/* Content */}
                        <div className={cn(
                            "flex flex-col",
                            isPending && "opacity-50 grayscale"
                        )}>
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={cn("text-sm font-semibold", isCurrent ? "text-indigo-900" : "text-slate-900")}>
                                    {step.title}
                                </h4>
                                {step.date && (
                                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {format(step.date, 'MMM d, h:mm a')}
                                    </span>
                                )}
                            </div>
                            
                            {(step.assignee || step.status === 'current') && (
                                <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                                    {step.assignee && (
                                        <span className="flex items-center gap-1.5">
                                            <User size={12} /> {step.assignee}
                                            {step.role && <span className="text-slate-400">({step.role})</span>}
                                        </span>
                                    )}
                                    {isCurrent && <Badge variant="secondary" className="h-5 text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100">In Progress</Badge>}
                                </div>
                            )}

                            {step.comments && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 italic relative mt-1">
                                    <div className="absolute -top-1.5 left-4 w-3 h-3 bg-slate-50 border-t border-l border-slate-200 rotate-45" />
                                    "{step.comments}"
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const ServiceHubView = () => {
    const { serviceRequests: tickets, addServiceRequest: addTicket, addTicketMessage } = useEnterpriseContext();
    const [view, setView] = useState<'catalog' | 'requests'>('catalog');
    
    // Catalog State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Request Handling
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
    const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
    
    // Ticket Detail State
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [commentText, setCommentText] = useState('');
    const [isAddCommentOpen, setIsAddCommentOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Form State
    const [requestStep, setRequestStep] = useState(1);
    const [requestReason, setRequestReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Custom Request Form State
    const [customSubject, setCustomSubject] = useState('');
    const [customCategory, setCustomCategory] = useState<string>('IT');
    const [customPriority, setCustomPriority] = useState<string>('Medium');

    // Keep selectedTicket in sync with context updates
    useEffect(() => {
        if (selectedTicket) {
            const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
            }
        }
    }, [tickets, selectedTicket?.id]);

    const filteredServices = SERVICE_CATALOG.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              service.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeTab === 'all' || service.category === activeTab;
        return matchesSearch && matchesCategory;
    });

    const handleServiceSubmit = () => {
        if (!selectedService) return;
        setIsSubmitting(true);
        
        setTimeout(() => {
            addTicket({
                subject: `Request: ${selectedService.name}`,
                description: requestReason || "No additional details provided.",
                service: selectedService.category,
                priority: 'Medium',
                location: 'Remote Request'
            });
            
            setIsSubmitting(false);
            setRequestStep(2); // Show success
        }, 1000);
    };

    const handleCustomSubmit = () => {
        if (!customSubject || !requestReason) return;
        setIsSubmitting(true);

        setTimeout(() => {
            addTicket({
                subject: customSubject,
                description: requestReason,
                service: customCategory,
                priority: customPriority as any,
                location: 'Custom Request'
            });

            setIsSubmitting(false);
            setIsCustomRequestOpen(false);
            setCustomSubject('');
            setRequestReason('');
            toast.success("Custom Request Submitted");
            setView('requests'); // Switch to requests view to show the new ticket
        }, 1000);
    };

    const handleAddComment = () => {
        if (!selectedTicket || !commentText.trim()) return;
        
        addTicketMessage(selectedTicket.id, commentText, 'user', 'Sarah Chen');
        setCommentText('');
        setIsAddCommentOpen(false);
        toast.success("Comment added to request");
    };

    const closeServiceSheet = () => {
        setSelectedService(null);
        setRequestStep(1);
        setRequestReason('');
    };

    return (
        <div className="flex h-full bg-slate-50 font-sans flex-col relative overflow-hidden">
            {/* Header */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    {view === 'requests' && (
                        <Button variant="ghost" size="icon" onClick={() => setView('catalog')} className="md:hidden">
                            <ArrowLeft size={20} />
                        </Button>
                    )}
                    <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">Service Hub</h2>
                    <Separator orientation="vertical" className="h-4 hidden md:block" />
                    <p className="text-sm text-slate-500 hidden md:block">
                        {view === 'catalog' ? 'Catalog & Requests' : 'My Ticket History'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        size="sm" 
                        variant={view === 'requests' ? "secondary" : "outline"}
                        onClick={() => setView(view === 'catalog' ? 'requests' : 'catalog')}
                        className={cn(view === 'requests' && "bg-slate-100")}
                    >
                        {view === 'catalog' ? 'My Requests' : 'Back to Catalog'}
                    </Button>
                    <Button 
                        size="sm" 
                        className="bg-teal-600 hover:bg-teal-700 text-white gap-2" 
                        onClick={() => setIsCustomRequestOpen(true)}
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Custom Request</span>
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 p-2 md:p-4 overflow-hidden flex flex-col max-w-7xl mx-auto w-full">
                {view === 'catalog' ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                            <TabsList className="h-9 w-full md:w-auto overflow-x-auto justify-start bg-slate-100 p-1 no-scrollbar">
                                <TabsTrigger value="all" className="text-xs">All Services</TabsTrigger>
                                <TabsTrigger value="IT" className="text-xs gap-2"><Monitor size={12}/> IT</TabsTrigger>
                                <TabsTrigger value="HR" className="text-xs gap-2"><Users size={12}/> HR</TabsTrigger>
                                <TabsTrigger value="Facilities" className="text-xs gap-2"><Building size={12}/> Facilities</TabsTrigger>
                                <TabsTrigger value="Finance" className="text-xs gap-2"><CreditCard size={12}/> Finance</TabsTrigger>
                            </TabsList>
                            
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <Input 
                                        placeholder="Search catalog..." 
                                        className="pl-9 h-9 text-sm bg-white border-slate-200 focus-visible:ring-indigo-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex bg-slate-100 rounded-lg p-1 shrink-0">
                                    <button 
                                        onClick={() => setViewMode('grid')}
                                        className={cn("p-1 rounded transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
                                    >
                                        <LayoutGrid size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={cn("p-1 rounded transition-all", viewMode === 'list' ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
                                    >
                                        <List size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto -mx-2 px-2">
                            {/* Useful Resources */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {[
                                    { title: 'Knowledge Base', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
                                    { title: 'IT Policies', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { title: 'Handbook', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
                                    { title: 'Training', icon: Video, color: 'text-cyan-600', bg: 'bg-cyan-50' }
                                ].map((resource, i) => (
                                    <button 
                                        key={i}
                                        className="flex items-center p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all text-left group"
                                        onClick={() => toast.info(`Opening ${resource.title}...`)}
                                    >
                                        <div className={cn("p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform", resource.bg, resource.color)}>
                                            <resource.icon size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{resource.title}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Catalog Grid */}
                            <div className="space-y-2 pb-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {activeTab === 'all' ? 'All Services' : `${activeTab} Services`}
                                    </h3>
                                    <span className="text-xs text-slate-500">{filteredServices.length} items</span>
                                </div>
                                
                                {filteredServices.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                                        <Search className="mx-auto text-slate-300 mb-4" size={32} />
                                        <h3 className="text-sm font-medium text-slate-900">No services found</h3>
                                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms.</p>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "grid gap-4",
                                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                                    )}>
                                        {filteredServices.map(service => (
                                            <div 
                                                key={service.id}
                                                onClick={() => setSelectedService(service)}
                                                className={cn(
                                                    "bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group p-4",
                                                    viewMode === 'list' && "flex items-center gap-4 py-3"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-2.5 rounded-lg transition-colors shrink-0 flex items-center justify-center relative",
                                                    viewMode === 'grid' ? "mb-4 w-fit" : "w-10 h-10",
                                                    service.category === 'IT' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                                                    service.category === 'HR' ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white" :
                                                    service.category === 'Facilities' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                                                    "bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white"
                                                )}>
                                                    <service.icon size={viewMode === 'list' ? 18 : 24} />
                                                    {service.source && viewMode === 'grid' && (
                                                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 border border-white" title={`Synced from ${service.source}`} />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-700 truncate">{service.name}</h3>
                                                        {viewMode === 'list' && (
                                                            <div className="flex items-center gap-2">
                                                                {service.source && (
                                                                    <Badge variant="outline" className="text-[10px] h-5 bg-slate-50 text-slate-500 border-slate-200 gap-1 font-normal">
                                                                        <LinkIcon size={8} /> {service.source}
                                                                    </Badge>
                                                                )}
                                                                <Badge variant="outline" className="text-[10px] h-5">{service.category}</Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{service.description}</p>
                                                    
                                                    {viewMode === 'grid' && (
                                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary" className="text-[10px] bg-slate-50 text-slate-500 border-slate-100 shadow-none">
                                                                    {service.sla}
                                                                </Badge>
                                                                {service.source && (
                                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1" title={`Synced from ${service.source}`}>
                                                                        <LinkIcon size={10} />
                                                                        <span className="hidden sm:inline truncate max-w-[60px]">{service.source}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                                Request <ChevronRight size={12} />
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {viewMode === 'list' && (
                                                    <ChevronRight className="text-slate-300 group-hover:text-indigo-400" size={16} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Tabs>
                ) : (
                    // My Requests View
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900">Active Requests</h3>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {tickets.length} Total
                                </Badge>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="hidden md:table-cell">Service</TableHead>
                                        <TableHead className="hidden md:table-cell">Last Update</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                                                No active requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tickets.map((ticket) => (
                                            <TableRow 
                                                key={ticket.id} 
                                                className="group cursor-pointer hover:bg-slate-50"
                                                onClick={() => setSelectedTicket(ticket)}
                                            >
                                                <TableCell className="font-mono text-xs text-slate-500">{ticket.id}</TableCell>
                                                <TableCell className="font-medium text-slate-900">
                                                    {ticket.subject}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "font-normal",
                                                        ticket.status === 'New' && "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
                                                        ticket.status === 'In Progress' && "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
                                                        ticket.status === 'Pending Approval' && "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
                                                        ticket.status === 'Resolved' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
                                                    )} variant="secondary">
                                                        {ticket.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            ticket.priority === 'Critical' ? "bg-red-500" :
                                                            ticket.priority === 'High' ? "bg-orange-500" :
                                                            ticket.priority === 'Medium' ? "bg-blue-500" : "bg-slate-400"
                                                        )} />
                                                        <span className="text-xs text-slate-600">{ticket.priority}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-slate-500 text-xs">{ticket.service}</TableCell>
                                                <TableCell className="hidden md:table-cell text-slate-500 text-xs">
                                                    {ticket.messages.length > 0 ? format(new Date(ticket.messages[ticket.messages.length - 1].timestamp), 'MMM d, h:mm a') : 'Just now'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        View <ArrowRight size={14} className="ml-1" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>

            {/* Catalog Item Sheet */}
            <Sheet open={!!selectedService} onOpenChange={closeServiceSheet}>
                <SheetContent className="sm:max-w-[500px] p-0 flex flex-col h-full bg-slate-50">
                    {selectedService && (
                        <>
                            <SheetHeader className="bg-white border-b border-slate-200 p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        selectedService.category === 'IT' ? "bg-blue-100 text-blue-600" :
                                        selectedService.category === 'HR' ? "bg-rose-100 text-rose-600" :
                                        "bg-emerald-100 text-emerald-600"
                                    )}>
                                        <selectedService.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <SheetTitle className="text-lg font-bold">{selectedService.name}</SheetTitle>
                                        <SheetDescription className="text-xs flex items-center gap-2 mt-1">
                                            {selectedService.category} Service Request
                                            {selectedService.source && (
                                                <span className="flex items-center gap-1 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">
                                                    <LinkIcon size={8} /> Synced from {selectedService.source}
                                                </span>
                                            )}
                                        </SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-6">
                                {requestStep === 1 ? (
                                    <div className="space-y-6">
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="font-semibold text-slate-900 mb-2 text-sm">Service Details</h3>
                                            <p className="text-sm text-slate-600 leading-relaxed mb-4">{selectedService.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    <Clock size={12} /> SLA: {selectedService.sla}
                                                </div>
                                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    <Info size={12} /> Approval Required
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {selectedService.source && (
                                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex gap-3">
                                                <Server className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-700">External Integration</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        This request will be automatically routed to <strong>{selectedService.source}</strong> for fulfillment. 
                                                        You can still track status here.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <Label htmlFor="reason" className="text-slate-700">Reason for Request <span className="text-red-500">*</span></Label>
                                            <Textarea 
                                                id="reason" 
                                                placeholder="Please describe why you need this service..." 
                                                className="min-h-[120px] bg-white resize-none"
                                                value={requestReason}
                                                onChange={(e) => setRequestReason(e.target.value)}
                                            />
                                            <p className="text-xs text-slate-400">Please provide as much detail as possible.</p>
                                        </div>

                                        {selectedService.formType === 'approval' && (
                                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3">
                                                <Info className="text-amber-600 shrink-0 mt-0.5" size={16} />
                                                <p className="text-xs text-amber-800">This request requires manager approval. An email notification will be sent automatically.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                            <Sparkles size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Request Submitted!</h3>
                                        <p className="text-slate-500 max-w-xs text-sm">Your request for <strong>{selectedService.name}</strong> has been successfully logged.</p>
                                    </div>
                                )}
                            </div>

                            <SheetFooter className="p-4 bg-white border-t border-slate-200">
                                {requestStep === 1 ? (
                                    <div className="flex gap-3 w-full">
                                        <Button variant="outline" className="flex-1" onClick={closeServiceSheet}>Cancel</Button>
                                        <Button 
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" 
                                            disabled={!requestReason || isSubmitting}
                                            onClick={handleServiceSubmit}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                            Submit Request
                                        </Button>
                                    </div>
                                ) : (
                                    <Button className="w-full" onClick={closeServiceSheet}>Close</Button>
                                )}
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Custom Request Sheet */}
            <Sheet open={isCustomRequestOpen} onOpenChange={setIsCustomRequestOpen}>
                <SheetContent className="sm:max-w-[500px] p-0 flex flex-col h-full bg-slate-50">
                    <SheetHeader className="bg-white border-b border-slate-200 p-6">
                        <SheetTitle className="text-lg font-bold">New Custom Request</SheetTitle>
                        <SheetDescription className="text-xs">Submit a request that doesn't fit into the catalog.</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="custom-subject">Subject <span className="text-red-500">*</span></Label>
                            <Input 
                                id="custom-subject" 
                                placeholder="E.g., Issue with office heating" 
                                className="bg-white"
                                value={customSubject}
                                onChange={(e) => setCustomSubject(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label>Category</Label>
                                <Select value={customCategory} onValueChange={setCustomCategory}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IT">IT Support</SelectItem>
                                        <SelectItem value="HR">HR & Payroll</SelectItem>
                                        <SelectItem value="Facilities">Facilities</SelectItem>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                        <SelectItem value="Legal">Legal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label>Priority</Label>
                                <Select value={customPriority} onValueChange={setCustomPriority}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="custom-reason">Description <span className="text-red-500">*</span></Label>
                            <Textarea 
                                id="custom-reason" 
                                placeholder="Describe the issue or request in detail..." 
                                className="min-h-[150px] bg-white resize-none"
                                value={requestReason}
                                onChange={(e) => setRequestReason(e.target.value)}
                            />
                        </div>
                    </div>

                    <SheetFooter className="p-4 bg-white border-t border-slate-200">
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1" onClick={() => setIsCustomRequestOpen(false)}>Cancel</Button>
                            <Button 
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white" 
                                disabled={!customSubject || !requestReason || isSubmitting}
                                onClick={handleCustomSubmit}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                Submit
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Ticket Detail Sheet (Workflow View) */}
            <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <SheetContent className="sm:max-w-[600px] p-0 flex flex-col h-full bg-slate-50">
                    {selectedTicket && (
                        <>
                            <SheetHeader className="bg-white border-b border-slate-200 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono text-[10px] text-slate-500 border-slate-200">
                                                {selectedTicket.id}
                                            </Badge>
                                            <Badge className={cn(
                                                "font-normal",
                                                selectedTicket.status === 'New' && "bg-blue-100 text-blue-700 border-blue-200",
                                                selectedTicket.status === 'In Progress' && "bg-amber-100 text-amber-700 border-amber-200",
                                                selectedTicket.status === 'Pending Approval' && "bg-purple-100 text-purple-700 border-purple-200",
                                                selectedTicket.status === 'Resolved' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                            )} variant="secondary">
                                                {selectedTicket.status}
                                            </Badge>
                                        </div>
                                        <SheetTitle className="text-xl font-bold">{selectedTicket.subject}</SheetTitle>
                                        <SheetDescription className="text-xs">
                                            Reported via {selectedTicket.location || 'Support Portal'} • {format(new Date(selectedTicket.messages[0].timestamp), 'MMMM d, yyyy')}
                                        </SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                                <div className="p-6 space-y-8">
                                    {/* Description Card */}
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-semibold text-slate-900 mb-2 text-sm">Request Details</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{selectedTicket.description}</p>
                                        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-4">
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Service</span>
                                                <p className="text-xs font-medium text-slate-700 mt-0.5">{selectedTicket.service}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Priority</span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", 
                                                        selectedTicket.priority === 'Critical' ? "bg-red-500" :
                                                        selectedTicket.priority === 'High' ? "bg-orange-500" :
                                                        selectedTicket.priority === 'Medium' ? "bg-blue-500" : "bg-slate-400"
                                                    )} />
                                                    <p className="text-xs font-medium text-slate-700">{selectedTicket.priority}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ETA</span>
                                                <p className="text-xs font-medium text-slate-700 mt-0.5">{selectedTicket.eta}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Workflow Visualization */}
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-6 text-sm flex items-center gap-2">
                                            <List size={16} className="text-slate-400" /> 
                                            Request Workflow
                                        </h3>
                                        <WorkflowVisualizer ticket={selectedTicket} />
                                    </div>

                                    {/* Activity Log (Read Only) */}
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-4 text-sm flex items-center gap-2">
                                            <MessageSquare size={16} className="text-slate-400" />
                                            Activity History
                                        </h3>
                                        <div className="space-y-4 pl-4 border-l border-slate-100">
                                            {selectedTicket.messages.map((msg) => (
                                                <div key={msg.id} className="text-sm">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-slate-900">{msg.author}</span>
                                                        <span className="text-xs text-slate-400">{format(new Date(msg.timestamp), 'MMM d, h:mm a')}</span>
                                                    </div>
                                                    <p className="text-slate-600 text-sm">{msg.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <SheetFooter className="p-4 bg-white border-t border-slate-200">
                                <div className="flex gap-3 w-full">
                                    <Dialog open={isAddCommentOpen} onOpenChange={setIsAddCommentOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex-1 border-dashed">
                                                <Plus size={16} className="mr-2" /> Add Comment / File
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Comment</DialogTitle>
                                                <DialogDescription>
                                                    Add a note or update to this request.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Textarea 
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Type your comment here..."
                                                className="min-h-[100px]"
                                            />
                                            <DialogFooter>
                                                <Button onClick={handleAddComment}>Post Comment</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    
                                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => toast.error("Request cancellation is not available at this stage.")}>
                                        Withdraw Request
                                    </Button>
                                </div>
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
