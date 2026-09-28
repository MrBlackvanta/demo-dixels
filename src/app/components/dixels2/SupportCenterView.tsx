import React, { useState, useEffect, useRef } from 'react';
import { 
  LifeBuoy, Search, AlertCircle, Wrench, Wifi, ShieldCheck, Mail, CheckCircle, CheckCircle2, 
  ChevronRight, Activity, Filter, Siren, MessageSquare, Plus, Zap, Server, 
  Cpu, Globe, Printer, Lock, RefreshCw, ArrowUpRight, Timer, Play, Terminal, MapPin,
  Paperclip, Send, X, AlertTriangle, FileText, Thermometer, Coffee, Droplets, Mic,
  Loader2, Star, ThumbsUp, Inbox, ArrowRight, Building, Layers, Edit2, Sparkles, Check,
  BookOpen, ExternalLink, Info, Monitor, User, Minimize2, MoreHorizontal, Phone, Copy,
  Video, Car, Utensils, Bot, UserCircle2, CornerDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addMinutes } from 'date-fns';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/card';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useEnterpriseContext, Ticket, TicketMessage } from './EnterpriseContext';

// --- Types & Mock Data ---

interface SystemMetric {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  history: { time: string; value: number }[];
  icon: any;
}

const METRICS_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 30) + 70
}));

// Updated System Vitals with requested data
const SYSTEM_VITALS: SystemMetric[] = [
  { 
    id: 'net', name: 'Dubai HQ Network Latency', value: 24, unit: 'ms', status: 'healthy', 
    history: METRICS_DATA.map(d => ({ ...d, value: 20 + Math.random() * 10 })), icon: Wifi 
  },
  { 
    id: 'email', name: 'Email Service', value: '100', unit: '%', status: 'healthy', 
    history: METRICS_DATA.map(d => ({ ...d, value: 99 + Math.random() })), icon: Mail 
  },
  { 
    id: 'webex', name: 'Webex', value: '99.8', unit: '%', status: 'warning', 
    history: METRICS_DATA.map(d => ({ ...d, value: d.value - 10 })), icon: Video 
  },
  { 
    id: 'cafe', name: 'Smart Cafe', value: 'Open', unit: '', status: 'healthy', 
    history: METRICS_DATA.map(d => ({ ...d, value: 50 + Math.random() * 20 })), icon: Utensils 
  },
  { 
    id: 'visitor', name: 'Visitor Access', value: 'Active', unit: '', status: 'healthy', 
    history: METRICS_DATA.map(d => ({ ...d, value: 80 + Math.random() * 10 })), icon: User 
  },
  { 
    id: 'parking', name: 'Smart Parking', value: '45', unit: 'free', status: 'healthy', 
    history: METRICS_DATA.map(d => ({ ...d, value: 100 - (d.value) })), icon: Car 
  },
];

// Expanded, Useful Quick Actions
const QUICK_ACTIONS = [
    { id: 'wifi-guest', label: 'Guest Wi-Fi', icon: Wifi, desc: 'Show guest credentials' },
    { id: 'printer-fix', label: 'Printer Status', icon: Printer, desc: 'Check local devices' },
    { id: 'phishing', label: 'Report Phishing', icon: ShieldCheck, desc: 'Flag suspicious email' },
    { id: 'clean', label: 'Request Cleaning', icon: Droplets, desc: 'Dispatch to location' },
];

const INTENT_MAP = [
    { keywords: ['wifi', 'internet', 'slow', 'connect', 'vpn'], category: 'Network', hint: 'We detected a potential network issue. Try resetting your VPN adapter.', fixType: 'vpn', priority: 'High', followUp: 'Are you connected via cable or Wi-Fi?' },
    { keywords: ['new monitor', 'new laptop', 'macbook', 'keyboard', 'mouse', 'headset', 'dock'], category: 'Hardware', hint: 'Hardware requests must be placed through the Service Catalog.', fixType: 'redirect', priority: 'Low', followUp: 'Is this for a new employee or replacement?' },
    { keywords: ['license', 'new account', 'access to', 'install'], category: 'Software', hint: 'Software licenses are managed in the Service Hub.', fixType: 'redirect', priority: 'Low', followUp: 'Which software specifically do you need access to?' },
    { keywords: ['guest', 'password', 'policy', 'handbook', 'holiday', 'hours', 'prayer time'], category: 'General', hint: 'Here is the information from the Campus Guide.', fixType: 'article', priority: 'Low', articleTitle: 'Guest Wifi Access', articleBody: 'The guest network is "TEC-Guest". No password required, just accept the T&C on the splash page.' },
    { keywords: ['print', 'printer', 'paper', 'jam'], category: 'Hardware', hint: 'Troubleshooting steps for printers.', fixType: 'article', priority: 'Low', articleTitle: 'Printer Troubleshooting', articleBody: 'For paper jams, please open tray 2. For toner replacement, contact facilities.', followUp: 'Is the printer displaying any error codes?' },
    { keywords: ['cold', 'hot', 'freezing', 'warm', 'temperature', 'ac', 'air', 'thermostat'], category: 'Facilities', hint: 'Temperature adjustments typically take 45 mins.', fixType: 'ticket', priority: 'Low', followUp: 'Is it too hot or too cold?' },
    { keywords: ['dirty', 'spill', 'clean', 'trash', 'bin', 'toilet', 'mess'], category: 'Cleaning', hint: 'Dispatching cleaning crew to your location.', fixType: 'ticket', priority: 'High', followUp: 'Is it a liquid spill or general cleaning?' },
    { keywords: ['coffee', 'water', 'tea', 'milk', 'sugar', 'pantry', 'snack'], category: 'Pantry', hint: 'Pantry request logged.', fixType: 'ticket', priority: 'Low' },
    { keywords: ['projector', 'hdmi', 'cable', 'sound', 'mic', 'camera', 'meeting', 'zoom'], category: 'AV Support', hint: 'AV Support has been notified.', fixType: 'ticket', priority: 'High', followUp: 'Are you in a meeting right now?' },
    { keywords: ['figma', 'jira', 'slack', 'software', 'login', 'error', 'bug', 'broken', 'fail'], category: 'Software', hint: 'Software issue detected.', fixType: 'ticket', priority: 'Medium', followUp: 'Can you please provide the error message?' },
];

const LOCATION_DATA = {
    buildings: ['Dubai HQ', 'Logistics Center', 'Remote'],
    floors: ['Floor 40', 'Floor 41', 'Floor 42'],
    spaces: [
        { id: 'my-desk', name: 'My Desk (4B-22)', type: 'desk' },
        { id: 'mr-alpha', name: 'Meeting Room Alpha', type: 'room' },
        { id: 'mr-beta', name: 'Meeting Room Beta', type: 'room' },
        { id: 'pantry-42', name: 'Floor 42 Pantry', type: 'facility' },
        { id: 'prayer-m', name: 'Male Prayer Room', type: 'facility' },
    ]
};

// --- Components ---

const VitalCard = ({ metric }: { metric: SystemMetric }) => (
  <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm shrink-0 min-w-[160px] hover:border-slate-300 transition-colors">
    <div className={cn("p-2 rounded-full", metric.status === 'healthy' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
      <metric.icon size={18} />
    </div>
    <div>
      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">{metric.name}</div>
      <div className={cn("text-sm font-bold", metric.status === 'healthy' ? "text-emerald-700" : "text-amber-700")}>
        {metric.value} <span className="text-[10px] font-normal text-slate-400">{metric.unit}</span>
      </div>
    </div>
  </div>
);

// New AI Diagnostic Chat Component
const AiDiagnosticInterface = ({ 
    initialQuery, 
    onClose,
    onSubmitTicket 
}: { 
    initialQuery: string;
    onClose: () => void;
    onSubmitTicket: (subject: string, category: string, priority: string) => void;
}) => {
    const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'ai'; text: string; options?: { label: string; action: string }[] }>>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [intent, setIntent] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Analysis
    useEffect(() => {
        if (initialQuery && messages.length === 0) {
            // Add user's initial query
            const userMsg = { id: '1', role: 'user' as const, text: initialQuery };
            setMessages([userMsg]);
            setIsTyping(true);

            // Simulate AI Analysis
            setTimeout(() => {
                const lowerSubject = initialQuery.toLowerCase();
                const matchedIntent = INTENT_MAP.find(intent => 
                    intent.keywords.some(keyword => lowerSubject.includes(keyword))
                );
                
                setIntent(matchedIntent);

                let aiResponseText = "I can help with that.";
                let options: { label: string; action: string }[] = [];

                if (matchedIntent) {
                    if (matchedIntent.followUp) {
                        aiResponseText = `I see you're having an issue with ${matchedIntent.category}. ${matchedIntent.followUp}`;
                    } else {
                        aiResponseText = `I understand you have a request regarding ${matchedIntent.category}. ${matchedIntent.hint}`;
                    }

                    if (matchedIntent.fixType === 'vpn') {
                        options = [{ label: "Run Auto-Fix", action: 'fix_vpn' }, { label: "Create Ticket", action: 'ticket' }];
                    } else if (matchedIntent.fixType === 'redirect') {
                        options = [{ label: "Go to Catalog", action: 'catalog' }, { label: "Create Ticket", action: 'ticket' }];
                    } else if (matchedIntent.fixType === 'article') {
                        options = [{ label: "Read Article", action: 'article' }, { label: "Still Need Help", action: 'ticket' }];
                    } else {
                         options = [{ label: "Yes, Create Ticket", action: 'ticket_confirm' }, { label: "Cancel", action: 'cancel' }];
                    }

                } else {
                    aiResponseText = "I'm not 100% sure I understand. Could you provide a bit more detail, or should I just create a general support ticket for you?";
                    options = [{ label: "Create General Ticket", action: 'ticket' }];
                }

                setMessages(prev => [...prev, { 
                    id: '2', 
                    role: 'ai', 
                    text: aiResponseText,
                    options: options
                }]);
                setIsTyping(false);
            }, 1500);
        }
    }, [initialQuery]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMsg = { id: Date.now().toString(), role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simple mock conversation logic
        setTimeout(() => {
            let response = "I've noted that. Is there anything else you'd like to add before I submit this?";
            let options = [{ label: "Submit Ticket", action: 'ticket_confirm' }];
            
            // Contextual replies based on previous intent
            if (intent?.category === 'Hardware' && input.toLowerCase().includes('screen')) {
                response = "Got it. Screen issues are prioritized. I can submit a hardware request now.";
            } else if (intent?.category === 'Network' && input.toLowerCase().includes('wifi')) {
                response = "Thanks for confirming. Since it's Wi-Fi related, have you tried forgetting the network and reconnecting?";
                options = [{ label: "Yes, didn't work", action: 'ticket_confirm' }, { label: "I'll try that", action: 'cancel' }];
            }

            setMessages(prev => [...prev, { 
                id: (Date.now() + 1).toString(), 
                role: 'ai', 
                text: response,
                options: options
            }]);
            setIsTyping(false);
        }, 1200);
    };

    const handleOption = (action: string) => {
        if (action === 'ticket' || action === 'ticket_confirm') {
            onSubmitTicket(initialQuery, intent?.category || 'General', intent?.priority || 'Medium');
        } else if (action === 'fix_vpn') {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user' as const, text: "Run Auto-Fix" }]);
            setIsTyping(true);
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    id: (Date.now() + 1).toString(), 
                    role: 'ai', 
                    text: "I've reset your network adapter settings. Please try connecting again in 30 seconds. If it persists, I'll escalate this automatically.",
                    options: [{ label: "It works now!", action: 'cancel' }, { label: "Still broken", action: 'ticket' }]
                }]);
                setIsTyping(false);
            }, 2000);
        } else if (action === 'catalog') {
            toast.info("Redirecting to Service Catalog...");
            onClose();
        } else if (action === 'cancel') {
            onClose();
        } else if (action === 'article') {
             setMessages(prev => [...prev, { 
                id: (Date.now() + 1).toString(), 
                role: 'ai', 
                text: `Here is the article content: ${intent.articleBody}`,
                options: [{ label: "Thanks, I'm good", action: 'cancel' }, { label: "Need more help", action: 'ticket' }]
            }]);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-sm">TEC AI Assistant</div>
                        <div className="text-xs text-indigo-200">Diagnosing & Resolving Issues</div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-200 hover:text-white hover:bg-indigo-500 rounded-full" onClick={onClose}>
                    <X size={18} />
                </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                            msg.role === 'ai' ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-600"
                        )}>
                            {msg.role === 'ai' ? <Sparkles size={14} /> : <UserCircle2 size={16} />}
                        </div>
                        <div className="space-y-2">
                            <div className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                msg.role === 'ai' ? "bg-white text-slate-800 rounded-tl-none border border-slate-100" : "bg-indigo-600 text-white rounded-tr-none"
                            )}>
                                {msg.text}
                            </div>
                            {msg.options && (
                                <div className="flex flex-wrap gap-2">
                                    {msg.options.map((opt, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => handleOption(opt.action)}
                                            className="text-xs font-medium px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex gap-3 max-w-[90%] mr-auto">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                            <Sparkles size={14} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <div className="relative">
                    <Input 
                        placeholder="Reply to AI Assistant..." 
                        className="pr-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button 
                        size="icon" 
                        className="absolute right-1 top-1 h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg" 
                        onClick={handleSend}
                    >
                        <CornerDownLeft size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const SupportCenterView = () => {
    // --- Enterprise Context Integration ---
    const { incidents: activeTickets, addIncident: addTicket, resolveTicket } = useEnterpriseContext();

    // Search & Analysis State
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiActive, setIsAiActive] = useState(false);

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
    
    // Ticket List State
    const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'resolved'>('all');
    
    // New Ticket Form State
    const [newTicketSubject, setNewTicketSubject] = useState('');
    const [newTicketDesc, setNewTicketDesc] = useState('');
    const [newTicketCategory, setNewTicketCategory] = useState('');
    
    // Smart Location State
    const [locBuilding, setLocBuilding] = useState('Dubai HQ');
    const [locFloor, setLocFloor] = useState('Floor 42');
    const [locSpace, setLocSpace] = useState('my-desk');

    // Chat State
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

    // Quick Actions State
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (selectedTicket) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedTicket?.messages]);

    const filteredTickets = activeTickets.filter(t => {
        if (ticketFilter === 'all') return true;
        if (ticketFilter === 'open') return t.status !== 'Resolved';
        if (ticketFilter === 'resolved') return t.status === 'Resolved';
        return true;
    });

    const getFullLocationName = () => {
        const spaceName = LOCATION_DATA.spaces.find(s => s.id === locSpace)?.name || locSpace;
        return `${locBuilding}, ${locFloor}, ${spaceName}`;
    };

    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchQuery.trim().length > 2) {
            setIsAiActive(true);
        }
    };

    const handleSubmitTicket = () => {
        const fullLocation = getFullLocationName();

        addTicket({
            subject: newTicketSubject,
            description: newTicketDesc,
            service: newTicketCategory || 'General',
            priority: 'Medium',
            location: fullLocation
        });

        setIsNewTicketOpen(false);
        setNewTicketSubject('');
        setNewTicketDesc('');
        setNewTicketCategory('');
        setSearchQuery(''); 
        toast.success("Ticket submitted successfully");
    };
    
    const handleAiSubmitTicket = (subject: string, category: string, priority: string) => {
        const fullLocation = getFullLocationName();

        addTicket({
            subject: subject,
            description: "Ticket created via AI Assistant interaction.",
            service: category || 'General',
            priority: priority as any || 'Medium',
            location: fullLocation
        });
        
        setIsAiActive(false);
        setSearchQuery('');
        toast.success("Ticket submitted successfully");
    };

    const handleQuickAction = async (actionId: string, label: string) => {
        setLoadingAction(actionId);
        
        // Smart Actions Logic
        if (actionId === 'wifi-guest') {
            await new Promise((resolve) => setTimeout(resolve, 600));
            toast.message("Guest Wi-Fi Details", {
                description: (
                    <div className="space-y-2 mt-1">
                        <div className="flex justify-between text-sm"><span>SSID:</span> <span className="font-mono font-bold">TEC-Guest</span></div>
                        <div className="flex justify-between text-sm"><span>Pass:</span> <span className="font-mono font-bold">Welcome2024</span></div>
                    </div>
                ),
                duration: 6000,
            });
        } else if (actionId === 'phishing') {
            await new Promise((resolve) => setTimeout(resolve, 800));
            toast.success("Security Alert Logged", { description: "The InfoSec team has been notified of potential phishing." });
        } else if (actionId === 'printer-fix') {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.info("Printer Status: OK", { description: "Nearest printer (West Hall) is online with 85% toner." });
        } else {
            // Generic Action
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.success(`${label} request sent`);
        }
        
        setLoadingAction(null);
    };

    const handleResolveTicket = () => {
        if (!selectedTicket) return;
        
        resolveTicket(selectedTicket.id);
        
        // Optimistic UI update for the currently selected ticket view
        // The list is updated automatically via context, but we need to update the selectedTicket state
        const updatedTicket = { 
            ...selectedTicket, 
            status: 'Resolved' as const, 
            eta: 'Completed',
            messages: [...selectedTicket.messages, { id: Date.now().toString(), author: 'System', role: 'event' as const, text: 'Ticket marked as resolved by user', timestamp: new Date() }] 
        };
        setSelectedTicket(updatedTicket);
        toast.success("Ticket marked as resolved");
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        setIsSending(true);
        
        // Note: In a real app, this would be an API call which updates the context
        // For now, we are just mocking the local update since EnterpriseContext doesn't support adding messages yet
        // If we want this to persist, we'd need to add 'addTicketMessage' to the context.
        // For now, we will just simulate it locally in the view.
        
        const userMsg: TicketMessage = {
            id: Date.now().toString(),
            author: 'You',
            role: 'user',
            text: replyText,
            timestamp: new Date()
        };
        
        const updatedWithUser = { ...selectedTicket, messages: [...selectedTicket.messages, userMsg] };
        setSelectedTicket(updatedWithUser);
        setReplyText('');

        setTimeout(() => {
            const aiMsg: TicketMessage = {
                id: (Date.now() + 1).toString(),
                author: 'Support AI',
                role: 'agent',
                text: "I've received your update. An agent will review this shortly.",
                timestamp: new Date()
            };
            setSelectedTicket(prev => prev ? ({ ...prev, messages: [...prev.messages, aiMsg] }) : null);
            setIsSending(false);
        }, 1000);
    };

    return (
        <div className="flex h-full bg-slate-50 overflow-hidden font-sans">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Support Center</h1>
                        <p className="text-xs text-slate-500">IT, Facilities & HR Helpdesk</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                             <div className="text-xs font-semibold text-slate-400 uppercase">Support Status</div>
                             <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                All Systems Operational
                             </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* System Vitals */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {SYSTEM_VITALS.map(metric => <VitalCard key={metric.id} metric={metric} />)}
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Left Column: Quick Actions & Search */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            
                            {/* AI Search Bar */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Sparkles size={120} />
                                </div>
                                
                                <h2 className="text-xl font-bold mb-4 relative z-10">How can we help you today?</h2>
                                
                                <div className="relative z-10 max-w-2xl">
                                    <form onSubmit={handleSearchSubmit}>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-3.5 text-indigo-200" size={20} />
                                            <Input 
                                                placeholder="Describe your issue (e.g., 'Webex is lagging' or 'Need a new mouse')..." 
                                                className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-indigo-200 focus-visible:ring-white/30 text-lg transition-all focus:bg-white/20"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {searchQuery.length > 2 && (
                                                <Button type="submit" size="sm" className="absolute right-2 top-2 bg-white text-indigo-600 hover:bg-indigo-50">
                                                    Analyze <ArrowRight size={14} className="ml-1" />
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* AI Diagnostic Interface Expansion */}
                                <AnimatePresence>
                                    {isAiActive && (
                                        <div className="mt-4">
                                            <AiDiagnosticInterface 
                                                initialQuery={searchQuery} 
                                                onClose={() => setIsAiActive(false)} 
                                                onSubmitTicket={handleAiSubmitTicket}
                                            />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Quick Actions Grid */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {QUICK_ACTIONS.map(action => (
                                        <button 
                                            key={action.id}
                                            disabled={!!loadingAction}
                                            onClick={() => handleQuickAction(action.id, action.label)}
                                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all text-left group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors text-slate-600 group-hover:text-indigo-600">
                                                    {loadingAction === action.id ? <Loader2 size={20} className="animate-spin" /> : <action.icon size={20} />}
                                                </div>
                                            </div>
                                            <div className="font-semibold text-slate-900 text-sm group-hover:text-indigo-700">{action.label}</div>
                                            <div className="text-xs text-slate-500 mt-1">{action.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Tickets List */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <h3 className="font-bold text-slate-900">Active Requests</h3>
                                        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                            {(['all', 'open', 'resolved'] as const).map((filter) => (
                                                <button
                                                    key={filter}
                                                    onClick={() => setTicketFilter(filter)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-md text-xs font-medium capitalize transition-all",
                                                        ticketFilter === filter ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setIsNewTicketOpen(true)}>
                                        <Plus size={16} className="mr-2" /> New Ticket
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                <TableHead className="w-[35%]">Request Details</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Agent</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">ETA</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTickets.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center h-32 text-slate-500">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <Inbox size={24} className="mb-2 opacity-20" />
                                                            <p>No tickets found matching your filter.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredTickets.map(ticket => (
                                                    <TableRow 
                                                        key={ticket.id} 
                                                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                                                        onClick={() => setSelectedTicket(ticket)}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn(
                                                                    "w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                                                                    ticket.status === 'Resolved' ? "bg-green-500" : "bg-indigo-500"
                                                                )} />
                                                                <div>
                                                                    <div className="font-medium text-slate-900 truncate max-w-[250px]">{ticket.subject}</div>
                                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{ticket.id}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Layers size={14} className="text-slate-400" />
                                                                {ticket.service}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={cn(
                                                                "font-normal capitalize text-xs",
                                                                ticket.priority === 'Critical' ? "bg-red-50 text-red-700 border-red-100" :
                                                                ticket.priority === 'High' ? "bg-orange-50 text-orange-700 border-orange-100" :
                                                                ticket.priority === 'Medium' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                                "bg-slate-100 text-slate-600 border-slate-200"
                                                            )}>
                                                                {ticket.priority}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <User size={14} className="text-slate-400" />
                                                                {ticket.agent}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={ticket.status === 'Resolved' ? 'outline' : 'secondary'} className={cn(
                                                                "gap-1 shadow-none font-medium text-xs",
                                                                ticket.status === 'Resolved' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600"
                                                            )}>
                                                                {ticket.status === 'Resolved' ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                                                                {ticket.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1.5 text-sm text-slate-600">
                                                                <Timer size={14} className="text-slate-400" />
                                                                <span>{ticket.eta}</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Live Diagnostics / Notifications */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            
                            {/* Smart Location Context */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <MapPin size={14} /> My Location
                                </h3>
                                <div className="space-y-3">
                                    <Select value={locBuilding} onValueChange={setLocBuilding}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {LOCATION_DATA.buildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select value={locFloor} onValueChange={setLocFloor}>
                                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {LOCATION_DATA.floors.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={locSpace} onValueChange={setLocSpace}>
                                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {LOCATION_DATA.spaces.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Knowledge Base Recommendations */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <BookOpen size={14} /> Suggested Articles
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { title: "Configuring VPN on macOS", views: 1240 },
                                        { title: "Guest Wi-Fi Policy 2024", views: 850 },
                                        { title: "Meeting Room AirPlay Guide", views: 520 },
                                    ].map((article, i) => (
                                        <a key={i} href="#" className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 group transition-colors">
                                            <div className="mt-1 text-slate-400 group-hover:text-indigo-500">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 leading-snug">{article.title}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{article.views} views • Updated yesterday</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8">
                                    View Service Catalog
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Detail Sidebar (Sheet) */}
            <Sheet open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
                <SheetContent className="sm:max-w-[540px] p-0 flex flex-col h-full bg-slate-50">
                    {selectedTicket && (
                        <>
                            <SheetHeader className="bg-white border-b border-slate-200 p-6 pb-4 space-y-0 block text-left">
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="outline" className="font-mono text-slate-500">{selectedTicket.id}</Badge>
                                    <Badge className={cn(
                                        selectedTicket.priority === 'Critical' ? "bg-red-100 text-red-700" :
                                        selectedTicket.priority === 'High' ? "bg-orange-100 text-orange-700" :
                                        "bg-blue-100 text-blue-700"
                                    )}>{selectedTicket.priority}</Badge>
                                </div>
                                <SheetTitle className="text-xl font-bold text-slate-900 mb-2">{selectedTicket.subject}</SheetTitle>
                                <SheetDescription className="text-sm text-slate-500 mb-4 text-left">
                                    {selectedTicket.description}
                                </SheetDescription>
                                
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <User size={16} className="text-slate-400" />
                                        <span className="font-medium">{selectedTicket.agent}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Layers size={16} className="text-slate-400" />
                                        <span>{selectedTicket.service}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="truncate max-w-[150px]">{selectedTicket.location || 'Unknown Location'}</span>
                                    </div>
                                </div>
                            </SheetHeader>

                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    {selectedTicket.messages.map((msg) => (
                                        <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                            <Avatar className="h-8 w-8 border-2 border-white shadow-sm mt-1">
                                                <AvatarFallback className={cn("text-[10px]", msg.role === 'agent' ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600")}>
                                                    {msg.author.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={cn(
                                                "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                                                msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : 
                                                msg.role === 'event' ? "bg-transparent border border-slate-200 shadow-none text-slate-500 text-xs py-2 italic w-full text-center" :
                                                "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                            )}>
                                                {msg.role !== 'event' && <div className="font-bold text-xs mb-1 opacity-70">{msg.author}</div>}
                                                {msg.text}
                                                <div className={cn("text-[10px] mt-2 opacity-50 text-right", msg.role === 'event' && "hidden")}>
                                                    {format(new Date(msg.timestamp), "h:mm a")}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            <div className="p-4 bg-white border-t border-slate-200">
                                {selectedTicket.status === 'Resolved' ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                        <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
                                        <h3 className="font-bold text-green-800">Ticket Resolved</h3>
                                        <p className="text-sm text-green-600">This ticket has been closed. If you need further assistance, please open a new request.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Textarea 
                                                placeholder="Type your reply..." 
                                                className="min-h-[80px] pr-12 resize-none"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendReply())}
                                            />
                                            <Button 
                                                size="icon" 
                                                className="absolute right-2 bottom-2 h-8 w-8"
                                                onClick={handleSendReply}
                                                disabled={!replyText.trim() || isSending}
                                            >
                                                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                            </Button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Paperclip size={16} /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Phone size={16} /></Button>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                onClick={handleResolveTicket}
                                            >
                                                <CheckCircle2 size={14} className="mr-2" /> Mark as Resolved
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* New Ticket Dialog */}
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create Support Request</DialogTitle>
                        <DialogDescription>
                            Submit a new ticket to the helpdesk.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">Subject</Label>
                            <Input 
                                id="subject" 
                                className="col-span-3" 
                                placeholder="e.g. Printer jamming on L4" 
                                value={newTicketSubject}
                                onChange={(e) => setNewTicketSubject(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Select value={newTicketCategory} onValueChange={setNewTicketCategory}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hardware">Hardware</SelectItem>
                                    <SelectItem value="Software">Software</SelectItem>
                                    <SelectItem value="Network">Network</SelectItem>
                                    <SelectItem value="Facilities">Facilities</SelectItem>
                                    <SelectItem value="Access">Access Control</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="desc" className="text-right mt-2">Description</Label>
                            <Textarea 
                                id="desc" 
                                className="col-span-3" 
                                placeholder="Please provide as much detail as possible..." 
                                rows={5}
                                value={newTicketDesc}
                                onChange={(e) => setNewTicketDesc(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitTicket} disabled={!newTicketSubject}>Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
