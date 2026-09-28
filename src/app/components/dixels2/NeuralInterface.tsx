import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  Mic, 
  Command, 
  ArrowRight, 
  Calendar, 
  Zap, 
  Coffee, 
  Shield, 
  FileText, 
  Users, 
  X,
  ChevronRight,
  MoreHorizontal,
  BarChart3,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Monitor,
  User,
  AlertTriangle,
  Server,
  Wifi,
  Video,
  FileCheck
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEnterpriseContext } from './EnterpriseContext';
import { addDays, format } from 'date-fns';

interface NeuralInterfaceProps {
  currentContext: string;
  onNavigate?: (tab: string) => void;
}

// Context configuration defines the "Soul" of the AI for each module
const CONTEXT_CONFIG: Record<string, { color: string; suggestions: string[]; icon: any }> = {
  home: { 
    color: "from-indigo-500 to-purple-500", 
    suggestions: ["What's on my agenda?", "Webex is not working", "Find Sarah Connor"],
    icon: Sparkles
  },
  calendar: { 
    color: "from-blue-500 to-cyan-500", 
    suggestions: ["Schedule meeting", "Find free room", "Block focus time"],
    icon: Calendar
  },
  visitors: { 
    color: "from-orange-500 to-amber-500", 
    suggestions: ["Register VIP guest", "Print badge", "View expected arrivals"],
    icon: Users
  },
  cafe: { 
    color: "from-emerald-500 to-green-500", 
    suggestions: ["Pre-order lunch", "What's on the menu?", "Report issue"],
    icon: Coffee
  },
  cms: { 
    color: "from-pink-500 to-rose-500", 
    suggestions: ["Draft announcement", "Check moderation", "Analyze engagement"],
    icon: FileText
  },
  support: { 
    color: "from-violet-500 to-fuchsia-500", 
    suggestions: ["Report IT issue", "Request software", "Knowledge base"],
    icon: Zap
  },
  default: {
    color: "from-slate-500 to-slate-700",
    suggestions: ["How can I help?", "Search system", "Open settings"],
    icon: Command
  }
};

const MOCK_ANALYTICS = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 200 },
  { name: 'Fri', value: 450 },
];

export const NeuralInterface: React.FC<NeuralInterfaceProps> = ({ currentContext, onNavigate }) => {
  const { addIncident: addTicket, addCalendarEvent, registerVisitor } = useEnterpriseContext();

  const [mode, setMode] = useState<'idle' | 'active' | 'processing' | 'result'>('idle');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  
  // Smart Minimization State
  const [isMinimized, setIsMinimized] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Normalize context
  const normalizedContext = (currentContext === 'vms_admin' ? 'visitors' : 
                            currentContext === 'drinks' ? 'cafe' : 
                            currentContext === 'dashboard' ? 'home' : 
                            CONTEXT_CONFIG[currentContext] ? currentContext : 'default');
  
  const config = CONTEXT_CONFIG[normalizedContext];

  // Maximize on navigation (Context Change)
  useEffect(() => {
      setIsMinimized(false);
  }, [currentContext]);

  // Click Outside to Minimize
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
              if (mode === 'idle') {
                  setIsMinimized(true);
              }
          }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mode]);

  // Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setMode('active');
        setIsMinimized(false);
        // Give time for the animation and rendering
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && mode !== 'idle') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  const handleVoice = () => {
    setIsListening(true);
    // Mock listening
    setTimeout(() => {
        const voiceQuery = normalizedContext === 'support' ? "Webex is not working" : 
                          normalizedContext === 'calendar' ? "Find me a quiet room for 2 people" :
                          "Show me the visitor analytics for this week";
        setQuery(voiceQuery);
        setIsListening(false);
        // Auto submit
        setTimeout(() => handleSubmit(undefined, voiceQuery), 500);
    }, 2000);
  };

  const handleSubmit = (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const q = overrideQuery || query;
    if (!q.trim()) return;
    
    setMode('processing');
    
    // Simulate AI thinking
    setTimeout(() => {
      const mockResult = generateMockResult(q, normalizedContext);
      setResult(mockResult);
      
      // Initialize form values if result is a form
      if (mockResult.type === 'form' && mockResult.fields) {
          const initValues: Record<string, string> = {};
          mockResult.fields.forEach((f: any) => {
              initValues[f.id || f.label] = f.value || '';
          });
          setFormValues(initValues);
      } else {
          setFormValues({});
      }
      
      setMode('result');
    }, 1200);
  };

  // Generic interaction handler for result actions
  const handleInteraction = (action: any) => {
      if (!action) return;

      if (action.type === 'link') {
          if (onNavigate) onNavigate(action.value);
          handleReset();
      } 
      else if (action.type === 'next_step') {
          // Simulate step transition delay
          setMode('processing');
          setTimeout(() => {
              const nextResult = generateNextStep(action.value, result);
              setResult(nextResult);
               // Initialize form values for next step
              if (nextResult.type === 'form' && nextResult.fields) {
                  const initValues: Record<string, string> = {};
                  nextResult.fields.forEach((f: any) => {
                      initValues[f.id || f.label] = f.value || '';
                  });
                  setFormValues(initValues);
              }
              setMode('result');
          }, 600);
      }
      else if (action.type === 'submit') {
           setMode('processing');
           
           // EXECUTE GLOBAL ACTIONS
           if (action.payload?.type === 'ticket') {
               // Use form values if available, otherwise fallback to payload
               const ticketData = { ...action.payload.data };
               // Map form values back to ticket data if they exist
               if (formValues['Subject']) ticketData.subject = formValues['Subject'];
               if (formValues['Description']) ticketData.description = formValues['Description'];
               
               addTicket(ticketData);
           } else if (action.payload?.type === 'event') {
               const eventData = { ...action.payload.data };
               
               // Map form values to event data
               if (formValues['Title']) eventData.title = formValues['Title'];
               if (formValues['Location']) eventData.location = formValues['Location'];
               
               // Parse Date/Time from form if edited
               // This is a simplified parsing for the mock
               // Ideally we'd have date/time pickers
               
               addCalendarEvent(eventData);
           } else if (action.payload?.type === 'visitor') {
               const visitorData = { ...action.payload.data };
               if (formValues['Guest Name']) visitorData.name = formValues['Guest Name'];
               if (formValues['Company']) visitorData.company = formValues['Company'];
               
               registerVisitor(visitorData);
           }

           // Determine next destination
           let nextLink = currentContext;
           if (action.payload?.type === 'ticket') nextLink = 'support';
           if (action.payload?.type === 'event') nextLink = 'calendar';
           if (action.payload?.type === 'visitor') nextLink = 'visitors';

           setTimeout(() => {
               setResult({
                   type: 'success',
                   title: 'Success',
                   content: action.successMessage || 'Action completed successfully.',
                   action: { 
                       label: nextLink === currentContext ? 'Done' : `View in ${nextLink.charAt(0).toUpperCase() + nextLink.slice(1)}`, 
                       type: 'link', 
                       value: nextLink 
                   }
               });
               setMode('result');
           }, 800);
      }
  };

  // Helper to generate the next step in a workflow
  const generateNextStep = (stepId: string, currentResult: any) => {
      if (stepId === 'ticket_form_webex') {
          return {
              type: 'form',
              title: "New Support Ticket",
              subtitle: "Pre-filled based on your diagnostics",
              fields: [
                  { id: "Subject", label: "Subject", value: "Webex Connection Failure", readOnly: false },
                  { id: "Category", label: "Category", value: "Conferencing / Video", readOnly: true },
                  { id: "Priority", label: "Priority", value: "High (Detected)", readOnly: true },
                  { id: "Device", label: "Device", value: "MacBook Pro M2", readOnly: true },
                  { id: "Description", label: "Description", value: "Automated ticket from Neural Interface: Webex connection issues detected on MacBook Pro M2.", placeholder: "Additional details..." }
              ],
              primaryAction: { 
                  label: "Submit Ticket", 
                  type: 'submit', 
                  successMessage: "Ticket has been created. IT has been notified.",
                  payload: {
                      type: 'ticket',
                      data: {
                          subject: "Webex Connection Failure",
                          service: "Software",
                          priority: "High",
                          description: "Automated ticket from Neural Interface: Webex connection issues detected on MacBook Pro M2.",
                          location: "Dubai HQ"
                      }
                  }
              },
              secondaryAction: { label: "Cancel", type: 'link', value: 'home' }
          };
      }
      return currentResult;
  }

  const generateMockResult = (q: string, ctx: string) => {
    const text = q.toLowerCase();
    
    // --- COMPLEX WORKFLOW: WEBEX ISSUE ---
    if (text.includes('webex') || (text.includes('not working') && ctx === 'support')) {
        return {
            type: 'diagnosis',
            title: "Webex Service Alert",
            content: "I've detected a regional service degradation for Webex in North America. 45 other users have reported similar connectivity issues in the last hour.",
            metrics: [
                { label: "Status", value: "Degraded", color: "text-red-500", icon: AlertTriangle },
                { label: "Packet Loss", value: "12%", color: "text-amber-500", icon: Wifi },
                { label: "Reports", value: "+45", color: "text-slate-600", icon: Users }
            ],
            recommendation: "It is recommended to use Zoom as a backup until service is restored.",
            primaryAction: { label: "Raise Ticket", type: 'next_step', value: 'ticket_form_webex' },
            secondaryAction: { label: "View Status Page", type: 'link', value: 'support' } // Mock link
        };
    }

    // --- CALENDAR / SCHEDULING ---
    if (text.includes('agenda') || text.includes('schedule') || text.includes('meeting') || text.includes('book')) {
      if (text.includes('schedule') || text.includes('book') || text.includes('meeting')) {
          // Parse Intent
          const title = text.replace(/schedule|book|meeting|with|tomorrow|at|on/gi, '').trim() || "New Meeting";
          const isTomorrow = text.includes('tomorrow');
          const date = isTomorrow ? addDays(new Date(), 1) : new Date();
          
          // Basic time parsing (very naive)
          const timeMatch = text.match(/(\d{1,2})(?:am|pm|:00)/);
          if (timeMatch) {
             let h = parseInt(timeMatch[1]);
             if (text.includes('pm') && h < 12) h += 12;
             date.setHours(h, 0, 0, 0);
          } else {
             date.setHours(9, 0, 0, 0); // Default 9am
          }
          
          const endDate = new Date(date.getTime() + 60 * 60000); // 1 hour

          return {
             type: 'form',
             title: "Schedule Meeting",
             subtitle: "I've prepared a calendar invite based on your request.",
             fields: [
                { id: 'Title', label: 'Event Title', value: title, placeholder: "Meeting Title" },
                { id: 'Date', label: 'Date', value: format(date, 'yyyy-MM-dd'), readOnly: true }, // Simple read-only for now
                { id: 'Time', label: 'Time', value: format(date, 'HH:mm'), readOnly: true },
                { id: 'Location', label: 'Location', value: 'Teams / Remote', placeholder: "Room or Location" }
             ],
             primaryAction: {
                label: "Send Invite",
                type: 'submit',
                successMessage: "Meeting scheduled and invites sent.",
                payload: {
                   type: 'event',
                   data: {
                      title: title,
                      start: date,
                      end: endDate,
                      location: 'Teams / Remote',
                      type: 'meeting',
                      attendees: 3
                   }
                }
             }
          };
      }
    
      return {
        type: 'list',
        title: "Upcoming Agenda",
        items: [
          { icon: Calendar, label: "Design Sync", sub: "10:00 AM • Room 402", action: { type: 'link', value: 'calendar' } },
          { icon: Users, label: "Team Lunch", sub: "12:30 PM • Smart Café", action: { type: 'link', value: 'cafe' } },
          { icon: FileText, label: "Q4 Planning", sub: "3:00 PM • Boardroom", action: { type: 'link', value: 'cms' } }
        ],
        primaryAction: { label: "Open Calendar", type: 'link', value: 'calendar' }
      };
    }
    
    if (text.includes('room') || text.includes('find') || text.includes('quiet')) {
        // Helper to create booking payload
        const createBookingAction = (roomName: string, minutes: number) => ({
            type: 'submit',
            successMessage: `${roomName} booked for ${minutes} mins.`,
            payload: {
                type: 'event',
                data: {
                    title: "Focus Time",
                    start: new Date(), // Now
                    end: new Date(new Date().getTime() + minutes * 60000),
                    location: roomName,
                    attendees: 1,
                    type: 'focus'
                }
            }
        });

      return {
        type: 'list',
        title: "Available Rooms Nearby",
        items: [
          { icon: MapPin, label: "Focus Room A", sub: "Available until 2:00 PM • Capacity: 2", action: createBookingAction("Focus Room A", 30) },
          { icon: MapPin, label: "Meeting Room 404", sub: "Available now • Capacity: 6", action: createBookingAction("Meeting Room 404", 60) },
          { icon: MapPin, label: "Phone Booth 3", sub: "Available in 15m • Capacity: 1", action: createBookingAction("Phone Booth 3", 15) }
        ],
        primaryAction: { label: "View Floorplan", type: 'link', value: 'calendar' }
      };
    }

    // --- CAFE ---
    if (text.includes('menu') || text.includes('lunch') || text.includes('food')) {
      return {
        type: 'card',
        title: "Today's Specials",
        content: "The Smart Café is serving Grilled Salmon with Asparagus and a Vegan Buddha Bowl.",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
        primaryAction: { label: "Order Now", type: 'link', value: 'drinks' }
      };
    }

    // --- VISITORS ---
    if (text.includes('guest') || text.includes('visitor')) {
      if (text.includes('analytics') || text.includes('stats') || text.includes('count')) {
          return {
              type: 'chart',
              title: "Visitor Analytics",
              content: "Visitor traffic is up 12% this week compared to last week.",
              data: MOCK_ANALYTICS,
              primaryAction: { label: "View Full Report", type: 'link', value: 'vms_admin' }
          };
      }
      return {
        type: 'form',
        title: "Register Visitor",
        subtitle: "Quick Entry",
        fields: [
            { id: "Guest Name", label: "Guest Name", placeholder: "e.g. John Doe" },
            { id: "Company", label: "Company", placeholder: "e.g. Acme Corp" }
        ],
        primaryAction: { 
            label: "Create Pass", 
            type: 'submit', 
            successMessage: "Visitor pass created and emailed to guest.",
            payload: {
                type: 'visitor',
                data: {
                    name: 'Guest', // Will be overwritten by form values
                    company: 'Visitor',
                    arrival: new Date(),
                    host: 'Me'
                }
            }
        }
      };
    }

    // --- PEOPLE ---
    if (text.includes('colleague') || text.includes('who') || text.includes('find person') || text.includes('sarah')) {
         return {
            type: 'list',
            title: "People Search",
            items: [
                { icon: User, label: "Sarah Connor", sub: "Product Manager • Online", action: { type: 'link', value: 'home' } },
                { icon: User, label: "Sarah Miller", sub: "Engineering Lead • In Meeting", action: { type: 'link', value: 'home' } }
            ],
            primaryAction: { label: "View Directory", type: 'link', value: 'home' }
         };
    }

    // Default Fallback
    return {
      type: 'text',
      title: "I can help with that",
      content: `I've analyzed your request about "${q}". Would you like me to search the Knowledge Base or start a new workflow?`,
      primaryAction: { label: "Search Knowledge Base", type: 'link', value: 'support' }
    };
  };

  const handleReset = () => {
    setMode('idle');
    setQuery('');
    setResult(null);
    setFormValues({});
    setIsListening(false);
    setIsMinimized(false);
  };

  return (
    <div 
        ref={containerRef}
        className="fixed bottom-8 left-0 right-0 z-50 flex flex-col items-center justify-end pointer-events-none px-4"
    >
      
      {/* RESULT CARD (Floats above) */}
      <AnimatePresence>
        {mode === 'result' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-4 pointer-events-auto w-full max-w-lg relative z-50"
          >
            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5">
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white bg-gradient-to-tr shadow-sm", config.color)}>
                    <Sparkles size={12} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{result.title}</div>
                    {result.subtitle && <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{result.subtitle}</div>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReset}>
                  <X size={14} />
                </Button>
              </div>

              {/* Card Content */}
              <div className="p-4">
                
                {/* DIAGNOSIS VIEW */}
                {result.type === 'diagnosis' && (
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="shrink-0 mt-1">
                                <AlertTriangle className="text-amber-500" size={24} />
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">{result.content}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                            {result.metrics?.map((m: any, i: number) => (
                                <div key={i} className="bg-slate-50 border border-slate-100 p-2 rounded-lg flex flex-col items-center text-center">
                                    <m.icon className={cn("mb-1", m.color)} size={16} />
                                    <span className="text-xs text-slate-500 font-medium">{m.label}</span>
                                    <span className="text-sm font-bold text-slate-800">{m.value}</span>
                                </div>
                            ))}
                        </div>

                        {result.recommendation && (
                            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex gap-2 items-start border border-blue-100">
                                <Zap size={14} className="mt-0.5 shrink-0" />
                                {result.recommendation}
                            </div>
                        )}
                    </div>
                )}

                {/* FORM VIEW (AUTO-FILLED) */}
                {result.type === 'form' && (
                    <div className="space-y-3">
                        {result.fields?.map((f: any, i: number) => (
                            <div key={i} className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">{f.label}</label>
                                <Input 
                                    value={formValues[f.id || f.label] || ''} 
                                    onChange={(e) => setFormValues(prev => ({ ...prev, [f.id || f.label]: e.target.value }))}
                                    placeholder={f.placeholder}
                                    readOnly={f.readOnly}
                                    className={cn("h-9 text-sm", f.readOnly ? "bg-slate-50 text-slate-500 border-dashed" : "bg-white")} 
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* SUCCESS VIEW */}
                {result.type === 'success' && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Done!</h3>
                        <p className="text-slate-600 text-sm max-w-[200px]">{result.content}</p>
                    </div>
                )}

                {/* LIST VIEW */}
                {result.type === 'list' && (
                  <div className="space-y-2">
                    {result.items.map((item: any, i: number) => (
                      <div 
                          key={i} 
                          className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer", item.action && "hover:bg-blue-50/50")}
                          onClick={() => item.action && handleInteraction(item.action)}
                      >
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <item.icon size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.sub}</div>
                        </div>
                        {item.action && (
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* SIMPLE TEXT/CARD VIEW */}
                {result.type === 'text' && (
                  <p className="text-slate-600 text-sm leading-relaxed">{result.content}</p>
                )}

                {result.type === 'card' && (
                  <div className="flex gap-4">
                    {result.image && (
                      <img src={result.image} className="w-20 h-20 object-cover rounded-lg shadow-sm" alt="Result" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-2">{result.content}</p>
                    </div>
                  </div>
                )}

                {/* CHART VIEW */}
                {result.type === 'chart' && (
                    <div className="space-y-4">
                         <p className="text-sm text-slate-600">{result.content}</p>
                         <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={result.data}>
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {result.data.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index === 2 ? '#6366f1' : '#cbd5e1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                )}
              </div>

              {/* CARD ACTIONS */}
              <div className="p-2 bg-slate-50/50 flex justify-end gap-2 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={handleReset}>Close</Button>
                {result.primaryAction && (
                    <Button 
                        size="sm" 
                        className={cn("text-white bg-gradient-to-r shadow-md border-none", config.color)} 
                        onClick={() => handleInteraction(result.primaryAction)}
                    >
                        {result.primaryAction.label} <ArrowRight size={14} className="ml-1" />
                    </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN INTERFACE PILL */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "pointer-events-auto relative z-50 flex items-center shadow-2xl backdrop-blur-2xl border border-white/20 ring-1 ring-black/5 overflow-hidden",
          // IDLE STATE (Normal)
          mode === 'idle' && !isMinimized ? "rounded-full bg-white/80 hover:bg-white/95 h-14 pl-1.5 pr-6 cursor-pointer gap-3 w-auto min-w-[200px]" : 
          // IDLE STATE (Minimized)
          mode === 'idle' && isMinimized ? "rounded-full bg-white/80 hover:bg-white/95 h-12 w-12 justify-center cursor-pointer shadow-xl hover:scale-110" :
          // ACTIVE STATE
          "rounded-2xl bg-white/95 h-16 w-full max-w-2xl px-2"
        )}
        onClick={() => {
            if (mode === 'idle') {
                if (isMinimized) {
                    setIsMinimized(false);
                } else {
                    setMode('active');
                    setTimeout(() => inputRef.current?.focus(), 100);
                }
            }
        }}
        onMouseEnter={() => {
            if (mode === 'idle' && isMinimized) {
                setIsMinimized(false);
            }
        }}
        initial={false}
      >
        <AnimatePresence mode="wait">
        {/* IDLE STATE */}
        {mode === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className={cn("flex items-center w-full", isMinimized ? "justify-center" : "gap-3")}
          >
            <motion.div 
                layoutId="neural-icon"
                className={cn("rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-tr animate-pulse", config.color, isMinimized ? "h-9 w-9" : "h-11 w-11")}
            >
              <config.icon size={isMinimized ? 16 : 20} />
            </motion.div>
            
            {!isMinimized && (
                <>
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                        className="flex flex-col items-start whitespace-nowrap"
                    >
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{normalizedContext} AI</span>
                       <span className="text-sm font-medium text-slate-800">How can I help?</span>
                    </motion.div>
                    
                    {/* Quick Chips */}
                    <div className="flex items-center gap-2 ml-4 border-l border-slate-200 pl-4 overflow-hidden">
                       {config.suggestions.slice(0, 2).map((s, i) => (
                         <motion.button
                           key={s}
                           initial={{ opacity: 0, x: 10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.2 + (0.1 * i) }}
                           className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap hidden sm:block"
                           onClick={(e) => {
                             e.stopPropagation();
                             setQuery(s);
                             setMode('active');
                           }}
                         >
                           {s}
                         </motion.button>
                       ))}
                    </div>
                </>
            )}
          </motion.div>
        )}

        {/* ACTIVE / PROCESSING STATE */}
        {(mode === 'active' || mode === 'processing' || mode === 'result') && (
          <motion.form 
            key="active"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="flex items-center w-full gap-2"
            onSubmit={(e) => handleSubmit(e)}
          >
             <motion.div 
                 layoutId="neural-icon"
                 className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr transition-all duration-500", 
                 (mode === 'processing' || isListening) ? "animate-spin rounded-full" : "rounded-xl",
                 config.color
             )}>
                {(mode === 'processing' || isListening) ? <Sparkles size={18} /> : <config.icon size={20} />}
             </motion.div>

             <Input 
                ref={inputRef}
                autoFocus
                className="flex-1 h-12 border-none bg-transparent text-lg shadow-none focus-visible:ring-0 px-2 placeholder:text-slate-400"
                placeholder={isListening ? "Listening..." : `Ask ${normalizedContext} AI...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && mode !== 'result' && !isListening && setMode('idle')}
                disabled={isListening}
             />
             
             <div className="flex items-center gap-1 pr-1">
                 {!query && !isListening && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-slate-600"
                        onClick={handleVoice}
                    >
                       <Mic size={20} />
                    </Button>
                 )}
                 {(query || isListening) && (
                    <Button type="submit" size="icon" className={cn("rounded-lg text-white shadow-sm transition-all bg-gradient-to-r", config.color)} disabled={isListening}>
                       <ArrowRight size={18} />
                    </Button>
                 )}
             </div>
          </motion.form>
        )}
        </AnimatePresence>
      </motion.div>
      
      {/* Keyboard Shortcut Hint - Hide when minimized */}
      <AnimatePresence>
         {mode === 'idle' && !isMinimized && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 0.5, y: 0 }} 
               exit={{ opacity: 0 }}
               className="mt-2 text-[10px] font-medium text-slate-400 flex items-center gap-1 bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm"
            >
               <Command size={10} /> + K to open
            </motion.div>
         )}
      </AnimatePresence>

      {/* BACKDROP BLUR OVERLAY (When active) */}
      <AnimatePresence>
         {(mode !== 'idle') && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-white/20 backdrop-blur-sm z-30 pointer-events-auto"
               onClick={handleReset}
            />
         )}
      </AnimatePresence>

    </div>
  );
};
