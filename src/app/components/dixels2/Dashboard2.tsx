import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInMinutes, addDays } from 'date-fns';
import { 
  Sparkles, Calendar, Users, Coffee, MapPin, LifeBuoy, ArrowRight, Clock, Zap, Bus, Activity, 
  Car, Utensils, Sun, Footprints, User, ChevronRight, Thermometer, Wind, Music, Moon, Monitor, 
  CheckCircle2, AlertCircle, Ticket, MessageSquare, Play, Plus, Bell, Search, MoreHorizontal, 
  Briefcase, Megaphone, Layout, Settings2, Edit3, X, Check, Laptop, Printer, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';
import { useEnterpriseContext } from './EnterpriseContext';
import { useVms } from './VmsContext';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// --- Types ---

interface QuickAction {
    id: string;
    label: string;
    type: 'coffee' | 'room' | 'visitor' | 'service' | 'link';
    icon: any;
    color: string;
    bg: string;
    payload?: any;
}

// --- Mock Data ---

const NEWS_DATA = [
    {
        id: 1,
        title: "Global Sustainability Goals 2026",
        category: "Company News",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        summary: "We are proud to announce our new initiative to reduce carbon footprint by 40%.",
        date: "2h ago",
        readTime: "4 min read"
    },
    {
        id: 2,
        title: "New 'Focus Pods' Installed on L4",
        category: "Facility Update",
        image: "https://images.unsplash.com/photo-1517502886303-f53907141855?auto=format&fit=crop&w=800&q=80",
        summary: "Experience the next generation of sound-proof workspaces starting today.",
        date: "5h ago",
        readTime: "2 min read"
    }
];

const COMPANY_EVENTS = [
    {
        id: 1,
        title: "Q1 Town Hall",
        date: new Date(new Date().setHours(14, 0, 0, 0)),
        location: "Main Auditorium & Teams",
        attendees: 450,
        type: "All Hands"
    },
    {
        id: 2,
        title: "Wellness Workshop: Yoga",
        date: addDays(new Date(), 1),
        location: "Roof Garden",
        attendees: 24,
        type: "Wellness"
    },
    {
        id: 3,
        title: "Design System Review",
        date: addDays(new Date(), 2),
        location: "Creative Lab",
        attendees: 12,
        type: "Workshop"
    }
];

const DEFAULT_ACTIONS: QuickAction[] = [
    { id: 'coffee-1', label: 'Morning Brew', type: 'coffee', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', payload: { item: 'Flat White', notes: 'Oat Milk' } },
    { id: 'room-1', label: 'Book 4A (1h)', type: 'room', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50', payload: { room: 'Meeting Room 4A', duration: 60 } },
    { id: 'visitor-1', label: 'Invite Guest', type: 'visitor', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', payload: {} },
    { id: 'print-1', label: 'Print @ L4', type: 'service', icon: Printer, color: 'text-slate-600', bg: 'bg-slate-50', payload: { printer: 'L4-Main' } },
];

const LIVE_PULSE = [
    { id: 'gym', label: 'Fitness Center', status: 'Busy', occupancy: 75, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'cafe', label: 'Main Cafeteria', status: 'Quiet', occupancy: 20, icon: Utensils, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const CAFE_RECOMMENDATION = {
    type: 'Morning Ritual',
    item: 'Oat Flat White',
    calories: 120,
    price: '$4.50',
    readyTime: '5 mins'
};

// --- Components ---

interface DashboardProps {
    onNavigate: (tabId: string) => void;
}

const CreateShortcutDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (action: QuickAction) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<QuickAction['type']>('coffee');
    const [details, setDetails] = useState<any>({});
    const [label, setLabel] = useState('');

    const reset = () => {
        setStep(1);
        setType('coffee');
        setDetails({});
        setLabel('');
    };

    const handleSave = () => {
        let icon = Zap;
        let color = 'text-slate-600';
        let bg = 'bg-slate-50';

        switch(type) {
            case 'coffee': icon = Coffee; color = 'text-amber-600'; bg = 'bg-amber-50'; break;
            case 'room': icon = Calendar; color = 'text-indigo-600'; bg = 'bg-indigo-50'; break;
            case 'visitor': icon = Users; color = 'text-purple-600'; bg = 'bg-purple-50'; break;
            case 'service': icon = LifeBuoy; color = 'text-blue-600'; bg = 'bg-blue-50'; break;
        }

        onSave({
            id: `custom-${Date.now()}`,
            label: label || 'New Shortcut',
            type,
            icon,
            color,
            bg,
            payload: details
        });
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => { if(!o) reset(); onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{step === 1 ? 'Choose Action Type' : 'Configure Shortcut'}</DialogTitle>
                    <DialogDescription>Create a personalized quick action for your dashboard.</DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        {[
                            { id: 'coffee', label: 'Order Coffee', icon: Coffee, desc: 'Reorder favorite drink' },
                            { id: 'room', label: 'Book Room', icon: Calendar, desc: 'Instant room reservation' },
                            { id: 'visitor', label: 'Invite Guest', icon: Users, desc: 'Pre-fill visitor pass' },
                            { id: 'service', label: 'Service Request', icon: LifeBuoy, desc: 'Report issue or request' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setType(t.id as any); setStep(2); }}
                                className="flex flex-col items-start p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                            >
                                <div className="p-2 rounded-lg bg-white border border-slate-100 mb-3 group-hover:scale-110 transition-transform">
                                    <t.icon size={20} className="text-slate-700" />
                                </div>
                                <div className="font-bold text-slate-900">{t.label}</div>
                                <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-3">
                            {type === 'coffee' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Drink</Label>
                                        <Select onValueChange={(v) => setDetails({...details, item: v})}>
                                            <SelectTrigger><SelectValue placeholder="Select drink..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Flat White">Flat White</SelectItem>
                                                <SelectItem value="Cappuccino">Cappuccino</SelectItem>
                                                <SelectItem value="Latte">Latte</SelectItem>
                                                <SelectItem value="Nitro Brew">Nitro Brew</SelectItem>
                                                <SelectItem value="Matcha Latte">Matcha Latte</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Customization / Notes</Label>
                                        <Input placeholder="e.g. Oat milk, extra hot..." onChange={(e) => setDetails({...details, notes: e.target.value})} />
                                    </div>
                                </>
                            )}

                            {type === 'room' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Preferred Room</Label>
                                        <Select onValueChange={(v) => setDetails({...details, room: v})}>
                                            <SelectTrigger><SelectValue placeholder="Select room..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Meeting Room 4A">Meeting Room 4A</SelectItem>
                                                <SelectItem value="Meeting Room 4B">Meeting Room 4B</SelectItem>
                                                <SelectItem value="Huddle North">Huddle North</SelectItem>
                                                <SelectItem value="Phone Booth 1">Phone Booth 1</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration</Label>
                                        <Select onValueChange={(v) => setDetails({...details, duration: v})}>
                                            <SelectTrigger><SelectValue placeholder="Duration..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">30 Minutes</SelectItem>
                                                <SelectItem value="60">1 Hour</SelectItem>
                                                <SelectItem value="90">1.5 Hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                            
                             {type === 'visitor' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Default Guest Name (Optional)</Label>
                                        <Input placeholder="e.g. John Doe" onChange={(e) => setDetails({...details, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Default Location</Label>
                                        <Input placeholder="e.g. Main Lobby" defaultValue="Main Lobby" onChange={(e) => setDetails({...details, location: e.target.value})} />
                                    </div>
                                </>
                            )}

                             {type === 'service' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Request Type</Label>
                                        <Select onValueChange={(v) => setDetails({...details, serviceType: v})}>
                                            <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                                <SelectItem value="it">IT Support</SelectItem>
                                                <SelectItem value="catering">Catering</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input placeholder="e.g. HDMI cable not working" onChange={(e) => setDetails({...details, desc: e.target.value})} />
                                    </div>
                                </>
                            )}

                            <div className="pt-4 border-t border-slate-100">
                                <div className="space-y-2">
                                    <Label>Shortcut Label</Label>
                                    <Input 
                                        placeholder={`e.g. My ${type === 'coffee' ? 'Morning Coffee' : type === 'room' ? 'Team Sync' : 'Action'}`} 
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === 2 && <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>}
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    {step === 2 && <Button onClick={handleSave} className="bg-slate-900 text-white">Create Shortcut</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const Dashboard2: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { calendarEvents, smartControls, updateSmartControls, incidents, serviceRequests } = useEnterpriseContext();
  const { visitors } = useVms();
  const [editingActions, setEditingActions] = useState(false);
  const [userActions, setUserActions] = useState<QuickAction[]>(DEFAULT_ACTIONS);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Derived State: Next Event
  const nextEvent = calendarEvents
    .filter(e => e.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

  // Derived State: Future events for timeline
  const futureEvents = calendarEvents
    .filter(e => e.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(1, 4); // Get next 3 after current

  const timeUntilNext = nextEvent ? differenceInMinutes(nextEvent.start, new Date()) : null;

  // Derived State: Active Ticket
  const activeIncident = incidents.find(t => t.status !== 'Resolved');
  const activeRequest = serviceRequests.find(t => t.status !== 'Resolved');
  const activeTicket = activeIncident || activeRequest;

  // Derived State: Visitors
  const upcomingVisitors = visitors.filter(v => 
      (v.status === 'expected' || v.status === 'upcoming') && 
      (v.date === 'Today' || v.date === new Date().toISOString().split('T')[0])
  );

  const handleSceneChange = (scene: string) => {
    updateSmartControls({ activeScene: scene });
    if (scene === 'focus') {
        updateSmartControls({ lightingLevel: 30, dnd: true });
        toast.success("Focus Mode Activated");
    } else if (scene === 'relax') {
        updateSmartControls({ lightingLevel: 50, dnd: false });
        toast.success("Relax Mode Activated");
    }
  };

  const executeAction = (action: QuickAction) => {
      if (editingActions) return;
      
      const { type, payload } = action;

      switch(type) {
          case 'coffee': 
             toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
                 loading: `Ordering ${payload.item || 'Coffee'}...`,
                 success: `Order confirmed! ${payload.item} is being prepared.`,
                 error: 'Order failed'
             });
             break;
          case 'room': 
             onNavigate('calendar');
             toast.success(`Checking availability for ${payload.room}...`);
             break;
          case 'visitor': 
             onNavigate('visitors');
             if (payload.name) toast.info(`Starting invite for ${payload.name}`);
             break;
          case 'service':
             toast.success(`Service request (${payload.serviceType}) sent!`);
             break;
          default: 
             toast.info("Action triggered");
      }
  };

  const handleOrderCoffee = (e: React.MouseEvent) => {
      e.stopPropagation();
      toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
          loading: 'Placing order at Smart Café...',
          success: `Order #8821 confirmed! ready in 5 mins.`,
          error: 'Order failed'
      });
  };

  const removeAction = (id: string) => {
      setUserActions(prev => prev.filter(a => a.id !== id));
  };

  const addAction = (newAction: QuickAction) => {
      setUserActions(prev => [...prev, newAction]);
      toast.success("Shortcut created!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 pt-6">
      
      <CreateShortcutDialog 
         isOpen={isCreatorOpen} 
         onClose={() => setIsCreatorOpen(false)} 
         onSave={addAction} 
      />

      {/* Innovative Compact Welcome */}
      <div className="flex items-center justify-between mb-[32px] animate-in fade-in slide-in-from-top-4 duration-700 mt-[-32px] mr-[0px] ml-[0px]">
          <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <Avatar className="h-12 w-12 border-2 border-white relative">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" />
                      <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full z-10"></div>
              </div>
              <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      Hello, Sarah
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                          Product Lead
                      </span>
                  </h1>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="text-slate-400">{format(new Date(), 'EEEE, MMM do')}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <Sparkles size={10} /> 85% Productivity Score
                      </span>
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur rounded-full border border-slate-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide hidden sm:inline">Real-time</span>
              </div>

              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 group">
                  <div className="flex items-center gap-2 border-r border-slate-100 pr-3">
                      <Sun size={14} className="text-amber-500 group-hover:rotate-12 transition-transform" />
                      <span className="text-xs font-medium text-slate-600">24°C</span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                      {format(new Date(), 'h:mm a')}
                  </div>
              </div>
              <Button 
                  variant="outline" 
                  size="icon" 
                  className={cn(
                      "rounded-full w-10 h-10 transition-all duration-300",
                      editingActions 
                          ? "bg-slate-900 text-white border-slate-900 rotate-90" 
                          : "bg-white text-slate-400 hover:text-slate-900 hover:border-slate-300"
                  )}
                  onClick={() => setEditingActions(!editingActions)}
              >
                  {editingActions ? <Check size={16} /> : <Settings2 size={16} />}
              </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PRIMARY COLUMN (8 Cols) - MY FOCUS */}
          <div className="lg:col-span-8 space-y-6">
              
              {/* SECTION A: MY REALITY (Next Event + Live Status) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* HERO: Up Next (Most Critical) */}
                  <div 
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
                    onClick={() => onNavigate('calendar')}
                  >
                       <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 z-0" />
                       
                       <div className="relative z-10">
                           <div className="flex justify-between items-start mb-4">
                               <div className="flex items-center gap-2">
                                   <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                       <Clock size={20} />
                                   </div>
                                   <span className="text-sm font-bold text-indigo-600 uppercase tracking-wide">Up Next</span>
                               </div>
                               {nextEvent && (
                                   <Badge className={cn("border-0", timeUntilNext && timeUntilNext < 15 ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700")}>
                                       {timeUntilNext ? `In ${timeUntilNext} min` : 'Now'}
                                   </Badge>
                               )}
                           </div>
                           
                           {nextEvent ? (
                               <>
                                   <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-2">{nextEvent.title}</h3>
                                   <div className="space-y-1.5 mb-4">
                                       <div className="flex items-center gap-2 text-sm text-slate-600">
                                           <Clock size={14} className="text-slate-400" /> 
                                           <span>{format(nextEvent.start, 'h:mm a')} - {format(nextEvent.end, 'h:mm a')}</span>
                                       </div>
                                       <div className="flex items-center gap-2 text-sm text-slate-600">
                                           <MapPin size={14} className="text-slate-400" /> 
                                           <span>{nextEvent.location}</span>
                                       </div>
                                   </div>
                               </>
                           ) : (
                               <div className="py-4 text-slate-400 text-sm">No upcoming meetings.</div>
                           )}
                       </div>

                       <div className="relative z-10 flex gap-2 mt-auto pt-4 border-t border-slate-100">
                           <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-lg">
                               Join Now
                           </Button>
                           <Button size="sm" variant="outline" className="flex-1">
                               <Footprints size={14} className="mr-2" /> Wayfind
                           </Button>
                       </div>
                  </div>

                  {/* LIVE STACK: Status Updates & Orders (Live Activities) */}
                  <div className="space-y-4">
                      
                      {/* Smart Café Quick Access */}
                      <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm relative overflow-hidden cursor-pointer hover:bg-emerald-100/50 transition-colors" onClick={(e) => handleOrderCoffee(e)}>
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                              <Coffee size={60} className="text-emerald-900" />
                          </div>
                          <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                                        <Coffee size={14} />
                                      </div>
                                      <span className="text-xs font-bold text-emerald-700 uppercase">Smart Café</span>
                                  </div>
                                  <Badge variant="secondary" className="bg-white/60 text-emerald-700 hover:bg-white text-[10px] h-5 border-0">
                                    {CAFE_RECOMMENDATION.readyTime}
                                  </Badge>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 mb-1">Morning Ritual</h4>
                              <p className="text-xs text-slate-500 mb-3">Reorder: {CAFE_RECOMMENDATION.item}</p>
                              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold shadow-sm">
                                Order Now
                              </Button>
                          </CardContent>
                      </Card>

                      {/* Visitor / Ticket Status */}
                      {upcomingVisitors.length > 0 ? (
                           <Card className="border-purple-200 bg-purple-50/50 shadow-sm cursor-pointer hover:bg-purple-100/50 transition-colors" onClick={() => onNavigate('visitors')}>
                               <CardContent className="p-4 flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                                       <Users size={18} />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                       <div className="text-xs font-bold text-purple-700 mb-0.5">VMS Alert</div>
                                       <div className="text-sm font-semibold text-slate-900 truncate">Guest arriving at 2:00 PM</div>
                                       <div className="text-xs text-slate-500 truncate">{upcomingVisitors[0].name} • {upcomingVisitors[0].company}</div>
                                   </div>
                                   <ChevronRight size={16} className="text-purple-400" />
                               </CardContent>
                           </Card>
                      ) : (
                           <Card className="border-slate-200 bg-white shadow-sm cursor-pointer hover:border-slate-300 transition-colors" onClick={() => onNavigate('drinks')}>
                               <CardContent className="p-4 flex items-center justify-center h-full min-h-[100px] text-slate-400 hover:text-slate-600 transition-colors gap-2">
                                   <Plus size={16} />
                                   <span className="text-sm font-medium">New Order / Task</span>
                               </CardContent>
                           </Card>
                      )}
                  </div>
              </div>

              {/* SECTION B: QUICK ACTIONS (Personalized Grid) */}
              <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Zap size={16} className="text-amber-500" /> Quick Actions
                      </h3>
                      {editingActions && <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">Edit Mode Active</Badge>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {userActions.map(action => (
                          <motion.button
                              key={action.id}
                              layout
                              onClick={() => executeAction(action)}
                              className={cn(
                                  "flex flex-col items-center justify-center p-4 rounded-xl border transition-all bg-white relative group",
                                  editingActions ? "border-dashed border-slate-300" : "border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-1"
                              )}
                          >
                              {editingActions && (
                                  <div 
                                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 cursor-pointer hover:bg-red-200 z-10 shadow-sm"
                                    onClick={(e) => { e.stopPropagation(); removeAction(action.id); }}
                                  >
                                      <X size={14} />
                                  </div>
                              )}
                              
                              <div className={cn("p-2.5 rounded-lg mb-2 transition-colors", action.bg, action.color, "group-hover:scale-110")}>
                                  <action.icon size={22} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{action.label}</span>
                              {action.payload?.item && <span className="text-[9px] text-slate-400 mt-0.5">{action.payload.item}</span>}
                              {action.payload?.room && <span className="text-[9px] text-slate-400 mt-0.5">{action.payload.room}</span>}
                          </motion.button>
                      ))}
                      
                      {editingActions && (
                          <button 
                             onClick={() => setIsCreatorOpen(true)}
                             className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors h-full min-h-[100px]"
                          >
                              <Plus size={24} className="mb-2" />
                              <span className="text-xs font-bold">Add New</span>
                          </button>
                      )}
                  </div>
              </div>

              {/* SECTION C: THE REST (News & Discovery - Deprioritized) */}
              <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2">
                          <Layout size={16} /> Feed & Updates
                      </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Compact News Card */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors cursor-pointer group">
                          <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${NEWS_DATA[0].image})` }} />
                              <div>
                                  <div className="flex items-center justify-between mb-1">
                                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-slate-100 text-slate-500">{NEWS_DATA[0].category}</Badge>
                                      <span className="text-[10px] text-slate-400">{NEWS_DATA[0].date}</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1 group-hover:text-indigo-600 transition-colors">{NEWS_DATA[0].title}</h4>
                                  <p className="text-xs text-slate-500 line-clamp-1">{NEWS_DATA[0].summary}</p>
                              </div>
                          </div>
                      </div>

                      {/* Compact Events Card */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-slate-500 uppercase">Next Company Event</span>
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5">{COMPANY_EVENTS[0].type}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="text-center bg-teal-50 rounded-lg px-2.5 py-1.5">
                                  <div className="text-[10px] font-bold text-teal-600 uppercase">{format(COMPANY_EVENTS[0].date, 'MMM')}</div>
                                  <div className="text-lg font-bold text-slate-900 leading-none">{format(COMPANY_EVENTS[0].date, 'd')}</div>
                              </div>
                              <div>
                                  <h4 className="text-sm font-bold text-slate-900">{COMPANY_EVENTS[0].title}</h4>
                                  <div className="text-xs text-slate-500">{format(COMPANY_EVENTS[0].date, 'h:mm a')} • {COMPANY_EVENTS[0].location}</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

          </div>

          {/* SECONDARY COLUMN (4 Cols) - UTILITY & CONTEXT */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* TIMELINE (My Schedule) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900">Rest of Today</h3>
                      <Calendar size={14} className="text-slate-400" />
                  </div>
                  
                  <div className="relative pl-2 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                      {futureEvents.map((evt, i) => (
                          <div key={i} className="relative flex items-start gap-3 group cursor-pointer">
                              <div className="relative z-10 w-5 h-5 rounded-full border-2 border-white bg-slate-200 group-hover:bg-indigo-500 transition-colors ring-1 ring-slate-100" />
                              <div className="flex-1 -mt-1">
                                  <div className="text-xs font-semibold text-slate-500 mb-0.5">{format(evt.start, 'h:mm a')}</div>
                                  <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{evt.title}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{evt.location}</div>
                              </div>
                          </div>
                      ))}
                      {futureEvents.length === 0 && (
                          <div className="text-xs text-slate-400 italic pl-8">No more events scheduled.</div>
                      )}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-4 text-xs text-slate-500" onClick={() => onNavigate('calendar')}>
                      View Full Calendar
                  </Button>
              </div>

              {/* MY SPACE (Environment) */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -mr-6 -mt-6 pointer-events-none" />
                   
                   <div className="flex items-center justify-between mb-6 relative z-10">
                       <h3 className="text-sm font-bold flex items-center gap-2">
                           <Monitor size={16} className="text-teal-400" /> My Space
                       </h3>
                       <div className="text-xs font-mono text-teal-300">{smartControls.temp}°C</div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 mb-4">
                       <button 
                           onClick={() => handleSceneChange('focus')}
                           className={cn(
                               "p-3 rounded-xl border text-left transition-all",
                               smartControls.activeScene === 'focus' ? "bg-white/10 border-white/20 shadow-inner ring-1 ring-teal-500/50" : "bg-transparent border-white/5 hover:bg-white/5 text-slate-400"
                           )}
                       >
                           <Moon size={16} className="mb-2 text-indigo-300" />
                           <div className="text-xs font-bold text-white">Focus</div>
                       </button>
                       <button 
                           onClick={() => handleSceneChange('relax')}
                           className={cn(
                               "p-3 rounded-xl border text-left transition-all",
                               smartControls.activeScene === 'relax' ? "bg-white/10 border-white/20 shadow-inner ring-1 ring-amber-500/50" : "bg-transparent border-white/5 hover:bg-white/5 text-slate-400"
                           )}
                       >
                           <Sun size={16} className="mb-2 text-amber-300" />
                           <div className="text-xs font-bold text-white">Relax</div>
                       </button>
                   </div>
                   <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400 hover:text-white" onClick={() => onNavigate('control')}>
                       Advanced Controls <ChevronRight size={12} className="ml-1" />
                   </Button>
              </div>

              {/* CAMPUS PULSE (Context) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900">Campus Pulse</h3>
                      <Badge variant="outline" className="text-[10px] font-normal">Live</Badge>
                  </div>
                  <div className="space-y-4">
                      {LIVE_PULSE.map(item => (
                          <div key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className={cn("p-1.5 rounded-md", item.bg, item.color)}>
                                      <item.icon size={14} />
                                  </div>
                                  <div>
                                      <div className="text-xs font-semibold text-slate-900">{item.label}</div>
                                      <div className={cn("text-[10px] font-medium", item.color)}>{item.status}</div>
                                  </div>
                              </div>
                              <div className="text-right w-16">
                                  <Progress value={item.occupancy} className="h-1.5 mb-1" />
                                  <div className="text-[10px] text-slate-400">{item.occupancy}% Full</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};