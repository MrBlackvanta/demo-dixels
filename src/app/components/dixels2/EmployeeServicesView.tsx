import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Clock, Filter, ArrowRight, Sparkles, Laptop, Monitor, 
  LifeBuoy, Activity, Users, Star, Inbox, Layers, Check, 
  PanelLeftClose, PanelLeftOpen, Menu, Command as CommandIcon,
  Cpu, Building2, Wallet, Plus, X, MapPin, Briefcase, Loader2,
  Calendar, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '../ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// --- Types ---

interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'IT' | 'HR' | 'Facilities' | 'Finance' | 'General';
  slaHours: number;
  popular?: boolean;
  approvalRequired?: boolean;
}

interface Ticket {
  id: string;
  serviceName: string;
  status: 'new' | 'in_progress' | 'waiting' | 'resolved';
  date: Date;
}

// --- Mock Data ---

const SERVICES: ServiceDefinition[] = [
    { id: 's1', name: 'MacBook Pro 16"', description: 'Standard developer workstation with M3 Max chip.', icon: Laptop, category: 'IT', slaHours: 48, popular: true, approvalRequired: true },
    { id: 's2', name: 'Figma License', description: 'Design tool access for product teams.', icon: Monitor, category: 'IT', slaHours: 2, popular: true, approvalRequired: false },
    { id: 's3', name: 'Standing Desk', description: 'Electric adjustable desk for your workspace.', icon: Building2, category: 'Facilities', slaHours: 72, approvalRequired: true },
    { id: 's4', name: 'Corporate Card', description: 'Request a new physical or virtual expense card.', icon: Wallet, category: 'Finance', slaHours: 24, approvalRequired: true },
    { id: 's5', name: 'New Hire Setup', description: 'Complete onboarding package for new employees.', icon: Users, category: 'HR', slaHours: 120, popular: true, approvalRequired: true },
    { id: 's6', name: 'Developer Monitor', description: '4K 32-inch Dell UltraSharp display.', icon: Monitor, category: 'IT', slaHours: 48, approvalRequired: false },
    { id: 's7', name: 'Gym Reimbursement', description: 'Submit monthly wellness expenses.', icon: Activity, category: 'HR', slaHours: 12, approvalRequired: false },
    { id: 's8', name: 'Guest Wi-Fi', description: 'Generate temporary access for visitors.', icon: LinkIcon, category: 'IT', slaHours: 0, popular: true, approvalRequired: false },
];

const INITIAL_REQUESTS: Ticket[] = [
    { id: 'REQ-1023', serviceName: 'Figma License', status: 'resolved', date: new Date(Date.now() - 86400000) },
    { id: 'REQ-1024', serviceName: 'Standing Desk', status: 'waiting', date: new Date(Date.now() - 172800000) },
    { id: 'REQ-1025', serviceName: 'Guest Wi-Fi', status: 'new', date: new Date() },
];

function LinkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

// --- Components ---

const ServiceIcon = ({ icon: Icon, className }: { icon: any, className?: string }) => (
    <Icon className={className} size={24} />
);

const StatusBadge = ({ status }: { status: Ticket['status'] }) => {
  const styles = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    waiting: "bg-purple-50 text-purple-700 border-purple-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
  };
  return <Badge variant="outline" className={cn("capitalize font-semibold", styles[status])}>{status.replace('_', ' ')}</Badge>;
};

export const EmployeeServicesView = () => {
  const [viewMode, setViewMode] = useState<'recommended' | 'favorites' | 'browse'>('recommended');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['s1']));
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  
  // Request State
  const [myRequests, setMyRequests] = useState<Ticket[]>(INITIAL_REQUESTS);
  const [formReason, setFormReason] = useState('');
  const [formDate, setFormDate] = useState('');

  // Command Palette Keybind
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavorites(next);
  };

  const handleCategoryToggle = (cat: string) => {
      if (viewMode !== 'browse') {
          setViewMode('browse');
          setSelectedCategories([cat]);
          return;
      }
      setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleSubmitRequest = () => {
      if (!selectedService) return;
      
      const newTicket: Ticket = {
          id: `REQ-${Math.floor(Math.random() * 10000)}`,
          serviceName: selectedService.name,
          status: selectedService.approvalRequired ? 'waiting' : 'new',
          date: new Date()
      };
      
      setMyRequests([newTicket, ...myRequests]);
      setSelectedService(null);
      setFormReason('');
      setFormDate('');
      toast.success("Request submitted successfully", {
          description: `REQ-${Math.floor(Math.random() * 10000)} has been created.`
      });
  };

  const filteredServices = SERVICES.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      
      if (viewMode === 'recommended') return s.popular;
      if (viewMode === 'favorites') return favorites.has(s.id);
      if (viewMode === 'browse') return selectedCategories.length === 0 || selectedCategories.includes(s.category);
      return true;
  });

  const SidebarContent = () => (
      <div className="flex flex-col h-full bg-white">
          <div className="p-4 space-y-6">
              <div className="space-y-1">
                  {!isSidebarCollapsed && <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Smart Views</div>}
                  <TooltipProvider delayDuration={0}>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <button onClick={() => setViewMode('recommended')} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left", viewMode === 'recommended' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50", isSidebarCollapsed && "justify-center px-0")}>
                                  <Sparkles size={20} className={viewMode === 'recommended' ? "text-indigo-600" : "text-slate-400"} />
                                  {!isSidebarCollapsed && "Recommended"}
                              </button>
                          </TooltipTrigger>
                          {isSidebarCollapsed && <TooltipContent side="right">Recommended</TooltipContent>}
                      </Tooltip>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <button onClick={() => setViewMode('favorites')} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left", viewMode === 'favorites' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50", isSidebarCollapsed && "justify-center px-0")}>
                                  <Star size={20} className={viewMode === 'favorites' ? "text-indigo-600" : "text-slate-400"} />
                                  {!isSidebarCollapsed && "Favorites"}
                              </button>
                          </TooltipTrigger>
                          {isSidebarCollapsed && <TooltipContent side="right">Favorites</TooltipContent>}
                      </Tooltip>
                  </TooltipProvider>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-1">
                  {!isSidebarCollapsed && <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog</div>}
                  <TooltipProvider delayDuration={0}>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <button onClick={() => { setViewMode('browse'); setSelectedCategories([]); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left", viewMode === 'browse' && selectedCategories.length === 0 ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50", isSidebarCollapsed && "justify-center px-0")}>
                                  <Layers size={20} />
                                  {!isSidebarCollapsed && "All Services"}
                              </button>
                          </TooltipTrigger>
                          {isSidebarCollapsed && <TooltipContent side="right">All Services</TooltipContent>}
                      </Tooltip>
                      {[
                          { id: 'IT', icon: Cpu, label: 'Technology' },
                          { id: 'Facilities', icon: Building2, label: 'Facilities' },
                          { id: 'HR', icon: Users, label: 'People' },
                          { id: 'Finance', icon: Wallet, label: 'Finance' },
                      ].map(cat => (
                          <Tooltip key={cat.id}>
                              <TooltipTrigger asChild>
                                  <button onClick={() => handleCategoryToggle(cat.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left", viewMode === 'browse' && selectedCategories.includes(cat.id) ? "bg-indigo-50 text-indigo-900" : "text-slate-600 hover:bg-slate-50", isSidebarCollapsed && "justify-center px-0")}>
                                      <cat.icon size={20} className={viewMode === 'browse' && selectedCategories.includes(cat.id) ? "text-indigo-600" : "text-slate-400"} />
                                      {!isSidebarCollapsed && <span className="flex-1">{cat.label}</span>}
                                      {!isSidebarCollapsed && viewMode === 'browse' && selectedCategories.includes(cat.id) && <Check size={14} className="text-indigo-600" />}
                                  </button>
                              </TooltipTrigger>
                              {isSidebarCollapsed && <TooltipContent side="right">{cat.label}</TooltipContent>}
                          </Tooltip>
                      ))}
                  </TooltipProvider>
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC] text-slate-900 font-sans">
      
      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search catalog..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Services">
            {SERVICES.map(s => (
                <CommandItem key={s.id} onSelect={() => { setSelectedService(s); setCommandOpen(false); }}>
                    <s.icon className="mr-2 h-4 w-4 text-slate-500" />
                    {s.name}
                </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                  {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
              <Sheet>
                  <SheetTrigger asChild>
                      <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Menu size={20} /></button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[280px]">
                      <SidebarContent />
                  </SheetContent>
              </Sheet>
              
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                      <Briefcase size={18} />
                  </div>
                  <div>
                      <h1 className="font-bold text-slate-900 leading-none">Service Hub</h1>
                      <div className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-wide uppercase">Provisioning & Hardware</div>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => setCommandOpen(true)}>
                  <Search size={14} className="mr-2 text-slate-400" />
                  <span className="mr-2">Find service...</span>
                  <kbd className="font-mono text-[10px] bg-white px-1.5 rounded border border-slate-300 text-slate-400">⌘K</kbd>
              </div>
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <MapPin size={12} className="text-indigo-500" />
                  Dubai HQ
              </div>
          </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <motion.div 
             animate={{ width: isSidebarCollapsed ? 80 : 260 }} 
             className="hidden lg:block border-r border-slate-200 bg-white shrink-0 overflow-hidden"
          >
              <SidebarContent />
          </motion.div>

          {/* Main Canvas */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-[1400px] mx-auto space-y-10">
                  
                  {/* Search Hero */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                          <h2 className="text-2xl font-bold text-slate-900">
                              {viewMode === 'recommended' ? 'Recommended for you' : 
                               viewMode === 'favorites' ? 'Your Favorites' : 
                               selectedCategories.length > 0 ? `${selectedCategories[0]} Services` : 'All Services'}
                          </h2>
                          <p className="text-slate-500 mt-1">
                              {filteredServices.length} items found
                          </p>
                      </div>
                      <div className="w-full md:w-96 relative group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                          <Input 
                              placeholder="Search services..." 
                              value={searchQuery} 
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm"
                          />
                      </div>
                  </div>

                  {/* Service Grid */}
                  {filteredServices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredServices.map(service => (
                              <motion.div
                                  layoutId={`service-${service.id}`}
                                  key={service.id}
                                  onClick={() => setSelectedService(service)}
                                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all cursor-pointer group relative flex flex-col h-full"
                              >
                                  <button onClick={(e) => toggleFavorite(e, service.id)} className="absolute top-4 right-4 text-slate-300 hover:text-amber-400 transition-colors z-10">
                                      <Star size={18} className={cn(favorites.has(service.id) ? "fill-amber-400 text-amber-400" : "")} />
                                  </button>
                                  
                                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 mb-5 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                      <ServiceIcon icon={service.icon} />
                                  </div>
                                  
                                  <div className="mb-4">
                                      <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight group-hover:text-indigo-700 transition-colors">{service.name}</h3>
                                      <p className="text-sm text-slate-500 line-clamp-2">{service.description}</p>
                                  </div>

                                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-medium">
                                      <span className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                          <Clock size={12} /> {service.slaHours}h SLA
                                      </span>
                                      <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 font-bold translate-x-2 group-hover:translate-x-0">
                                          Request <ArrowRight size={14} />
                                      </span>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  ) : (
                      <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                           <Inbox size={48} className="mx-auto text-slate-200 mb-4" />
                           <h3 className="text-slate-900 font-bold">No services found</h3>
                           <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                           <Button variant="link" onClick={() => { setSearchQuery(''); setViewMode('browse'); setSelectedCategories([]); }}>Clear Filters</Button>
                      </div>
                  )}

                  {/* My Recent Requests Preview */}
                  {myRequests.length > 0 && (
                      <div className="pt-8 border-t border-slate-200">
                          <h3 className="text-lg font-bold text-slate-900 mb-4">Your Active Requests</h3>
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                              {myRequests.map((ticket, i) => (
                                  <div key={ticket.id} className={cn("flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer", i !== myRequests.length - 1 && "border-b border-slate-100")}>
                                      <div className="flex items-center gap-4">
                                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", ticket.status === 'resolved' ? "bg-green-50 text-green-600 border-green-100" : "bg-indigo-50 text-indigo-600 border-indigo-100")}>
                                              {ticket.status === 'resolved' ? <Check size={18} /> : <Loader2 size={18} className={ticket.status === 'in_progress' ? "animate-spin" : ""} />}
                                          </div>
                                          <div>
                                              <div className="font-bold text-slate-900 text-sm">{ticket.serviceName}</div>
                                              <div className="text-xs text-slate-500 font-mono">{ticket.id}</div>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <span className="text-xs text-slate-400 hidden sm:inline">{format(ticket.date, 'MMM d, h:mm a')}</span>
                                          <StatusBadge status={ticket.status} />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Service Detail Modal */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent className="sm:max-w-2xl">
              {selectedService && (
                  <>
                      <DialogHeader>
                          <div className="flex items-start gap-4 mb-2">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                                  <ServiceIcon icon={selectedService.icon} />
                              </div>
                              <div>
                                  <DialogTitle className="text-xl">{selectedService.name}</DialogTitle>
                                  <DialogDescription className="mt-1">{selectedService.description}</DialogDescription>
                              </div>
                          </div>
                      </DialogHeader>

                      <div className="py-4 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Estimated Delivery</div>
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                      <Clock size={16} className="text-slate-400" />
                                      {selectedService.slaHours} hours
                                  </div>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Approval Required</div>
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                      {selectedService.approvalRequired ? (
                                          <span className="text-amber-600 flex items-center gap-2"><Check size={16} /> Manager</span>
                                      ) : (
                                          <span className="text-green-600 flex items-center gap-2"><Check size={16} /> Auto-Approve</span>
                                      )}
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div className="grid gap-2">
                                  <Label>Reason for Request</Label>
                                  <Textarea 
                                      placeholder="Please explain why you need this service..." 
                                      value={formReason}
                                      onChange={(e) => setFormReason(e.target.value)}
                                  />
                              </div>

                              <div className="grid gap-2">
                                  <Label>Required By</Label>
                                  <Input 
                                      type="date" 
                                      value={formDate}
                                      onChange={(e) => setFormDate(e.target.value)}
                                  />
                              </div>
                          </div>
                          
                          {selectedService.approvalRequired && (
                              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-3">
                                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                  <p>This request requires approval from your line manager (James Thompson). You will be notified via email once approved.</p>
                              </div>
                          )}
                      </div>

                      <DialogFooter>
                          <Button variant="ghost" onClick={() => setSelectedService(null)}>Cancel</Button>
                          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmitRequest}>Submit Request</Button>
                      </DialogFooter>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
};
