import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Video, 
  Phone,
  Sparkles,
  Star,
  CheckCircle2,
  X,
  ArrowRight,
  Building2,
  UserPlus,
  Coffee,
  LayoutGrid,
  Mail,
  Edit,
  Trash,
  Map as MapIcon,
  GripVertical,
  Info,
  Calendar as CalendarIcon,
  Filter,
  Paperclip,
  Link as LinkIcon,
  Monitor,
  Wifi,
  User,
  ListChecks,
  FileText,
  ArrowLeft,
  BadgeCheck,
  Bot,
  Zap,
  Lightbulb,
  GripHorizontal,
  RefreshCw,
  Globe,
  Wand2,
  AlertTriangle,
  MoreHorizontal,
  Utensils,
  HelpCircle,
  QrCode,
  Layers,
  Car,
  Copy,
  Palette,
  Forward,
  Play,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { useEnterpriseContext } from './EnterpriseContext';
import { RoomsTimelineView } from './RoomsTimelineView';

// --- Date Utilities ---
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

// --- NLP Mock Parser ---
const parseNaturalLanguage = (input: string) => {
  const lower = input.toLowerCase();
  const now = new Date();
  
  // Intent
  let intent = '';
  if (lower.includes('call') || lower.includes('phone')) intent = 'call';
  else if (lower.includes('client') || lower.includes('customer')) intent = 'client';
  else if (lower.includes('focus') || lower.includes('work')) intent = 'focus';
  else if (lower.includes('meeting') || lower.includes('sync') || lower.includes('team')) intent = 'meeting';
  
  // Date
  let dateOffset = 0;
  if (lower.includes('tomorrow')) dateOffset = 1;
  else if (lower.includes('next week')) dateOffset = 7;
  else if (lower.includes('friday')) {
     const currentDay = now.getDay(); // 0-6
     const diff = 5 - currentDay + (currentDay >= 5 ? 7 : 0);
     dateOffset = diff;
  }
  
  // Time
  let time = 9; // default
  const timeMatch = lower.match(/(\d{1,2})(?:am|pm|:00)/);
  if (timeMatch) {
     let t = parseInt(timeMatch[1]);
     if (lower.includes('pm') && t < 12) t += 12;
     time = t;
  }

  // Title extraction (naive)
  const title = input.replace(/(tomorrow|next week|friday|monday|at \d+(?:am|pm)|on)/gi, '').trim();

  return {
     intent,
     date: addDays(now, dateOffset),
     time,
     title: title.charAt(0).toUpperCase() + title.slice(1) || "New Event"
  };
};

// --- Mock Data ---
const INITIAL_COLLEAGUES = [
  { id: 'c1', name: 'Sarah Chen', avatar: 'SC', status: 'online', selected: false, color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
  { id: 'c2', name: 'John Doe', avatar: 'JD', status: 'busy', selected: false, color: 'bg-rose-100 border-rose-300 text-rose-700' },
  { id: 'c3', name: 'Mike Ross', avatar: 'MR', status: 'offline', selected: false, color: 'bg-amber-100 border-amber-300 text-amber-700' },
  { id: 'c4', name: 'Elena Rodriguez', avatar: 'ER', status: 'online', selected: false, color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  { id: 'c5', name: 'David Kim', avatar: 'DK', status: 'online', selected: false, color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: 'c6', name: 'Amanda Smith', avatar: 'AS', status: 'busy', selected: false, color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: 'c7', name: 'James Wilson', avatar: 'JW', status: 'offline', selected: false, color: 'bg-gray-100 border-gray-300 text-gray-700' },
  { id: 'c8', name: 'Maria Garcia', avatar: 'MG', status: 'online', selected: false, color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: 'c9', name: 'Robert Johnson', avatar: 'RJ', status: 'busy', selected: false, color: 'bg-cyan-100 border-cyan-300 text-cyan-700' },
  { id: 'c10', name: 'Lisa Wong', avatar: 'LW', status: 'online', selected: false, color: 'bg-orange-100 border-orange-300 text-orange-700' },
];

const FLOORS = Array.from({ length: 50 }, (_, i) => `L${i + 1}`);
const AMENITIES = ['Video Conf', 'Whiteboard', 'Catering', 'Dual Monitor', 'Wireless Present', 'Smart Board', 'Phone Bridge', 'Podcast Setup', 'Recording'];
const TEAMS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Product', 'Customer Success', 'Legal'];

// Helper to check overlap
const hasOverlap = (schedule: any[], start: number, duration: number) => {
  return schedule.some(s => 
    (start < s.start + s.duration) && (start + duration > s.start)
  );
};

const ROOMS = Array.from({ length: 200 }).map((_, i) => {
  const floorIdx = Math.floor(i / 4); // 4 rooms per floor
  const types = ['Conference', 'Huddle', 'Phone Booth', 'Board Room', 'Training Room'];
  const type = types[i % types.length];
  
  return {
    id: `room-${i}`,
    name: type === 'Conference' ? `Conf ${floorIdx + 1}${String.fromCharCode(65 + (i % 4))}` : 
          type === 'Board Room' ? `Board ${floorIdx + 1}${String.fromCharCode(65 + (i % 4))}` :
          type === 'Training Room' ? `Training ${floorIdx + 1}${String.fromCharCode(65 + (i % 4))}` :
          type === 'Huddle' ? `Huddle ${floorIdx + 1}${String.fromCharCode(65 + (i % 4))}` : 
          `Booth ${floorIdx + 1}${String.fromCharCode(65 + (i % 4))}`,
    type,
    capacity: type === 'Conference' ? 8 + (i%3)*4 : 
              type === 'Board Room' ? 12 + (i%2)*6 :
              type === 'Training Room' ? 20 + (i%3)*10 :
              type === 'Huddle' ? 4 : 1,
    floor: FLOORS[Math.min(floorIdx, 49)],
    features: AMENITIES.filter(() => Math.random() > 0.5),
    distance: Math.floor(Math.random() * 500),
    image: `https://images.unsplash.com/photo-${['1497366216548-37526070297c', '1497366811353-33c3451b8ad2', '1517502886303-f53907141855', '1600607686527-6fb886090705'][i%4]}?auto=format&fit=crop&w=200&q=80`,
    schedule: [] 
  };
});

// --- Components ---

const FloorPlanModal = ({ isOpen, onClose, room }: { isOpen: boolean, onClose: () => void, room: any }) => {
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <MapIcon size={20} /> {room?.floor || 'L1'} Floor Plan
               </DialogTitle>
               <DialogDescription>Location of {room?.name}</DialogDescription>
            </DialogHeader>
            <div className="relative bg-slate-100 rounded-xl h-[400px] border border-slate-200 overflow-hidden flex items-center justify-center">
               {/* Mock Floor Plan SVG */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ 
                     backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' 
                  }} 
               />
               <svg viewBox="0 0 800 400" className="w-full h-full">
                  {/* Building Outline */}
                  <path d="M50,50 L750,50 L750,350 L50,350 Z" fill="white" stroke="#cbd5e1" strokeWidth="4" />
                  {/* Hallways */}
                  <path d="M50,200 L750,200" stroke="#e2e8f0" strokeWidth="20" />
                  <path d="M400,50 L400,350" stroke="#e2e8f0" strokeWidth="20" />
                  
                  {/* Rooms */}
                  <rect x="80" y="80" width="120" height="80" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="220" y="80" width="120" height="80" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="600" y="240" width="120" height="80" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                  
                  {/* Highlighted Room */}
                  <g transform="translate(460, 80)">
                     <rect width="140" height="100" fill="#ccfbf1" stroke="#0d9488" strokeWidth="3" rx="4" />
                     <circle cx="70" cy="50" r="20" fill="#0d9488" fillOpacity="0.2" />
                     <text x="70" y="55" textAnchor="middle" fill="#0f766e" fontSize="14" fontWeight="bold">{room?.name}</text>
                     <path d="M70,100 L80,120 L60,120 Z" fill="#0d9488" />
                  </g>
                  
                  {/* User Location */}
                  <g transform="translate(50, 300)">
                     <circle r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                     <circle r="16" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
                     <text x="20" y="5" fill="#1e293b" fontSize="12" fontWeight="medium">You</text>
                  </g>
               </svg>
            </div>
         </DialogContent>
      </Dialog>
   );
};

const ContextMenu = ({ 
   position, 
   onClose, 
   onAction 
}: { 
   position: { x: number, y: number }, 
   onClose: () => void, 
   onAction: (action: string) => void 
}) => (
   <div 
      className="fixed z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 animate-in zoom-in-95 duration-100 overflow-hidden"
      style={{ top: position.y, left: position.x }}
      onMouseLeave={onClose}
   >
      <button onClick={() => onAction('join')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700">
         <Play size={14} className="text-teal-600" /> Join Meeting
      </button>
      <button onClick={() => onAction('email')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700">
         <Mail size={14} /> Email Attendees
      </button>
      <div className="h-px bg-slate-100 my-1" />
      <button onClick={() => onAction('duplicate')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700">
         <Copy size={14} /> Duplicate
      </button>
      <div className="px-4 py-2 flex items-center gap-2">
         <Palette size={14} className="text-slate-400" />
         <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 cursor-pointer hover:scale-125 transition-transform" onClick={() => onAction('color-blue')} />
            <div className="w-3 h-3 rounded-full bg-purple-500 cursor-pointer hover:scale-125 transition-transform" onClick={() => onAction('color-purple')} />
            <div className="w-3 h-3 rounded-full bg-amber-500 cursor-pointer hover:scale-125 transition-transform" onClick={() => onAction('color-amber')} />
            <div className="w-3 h-3 rounded-full bg-rose-500 cursor-pointer hover:scale-125 transition-transform" onClick={() => onAction('color-rose')} />
         </div>
      </div>
      <div className="h-px bg-slate-100 my-1" />
      <button onClick={() => onAction('delete')} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
         <Trash size={14} /> Cancel Event
      </button>
   </div>
);

const QuickBookPopover = ({
  position,
  onClose,
  onSave,
  onExpand
}: {
  position: { x: number, y: number, time: number, date: Date } | null,
  onClose: () => void,
  onSave: (data: any) => void,
  onExpand: (data?: any) => void
}) => {
  if (!position) return null;
  
  const [title, setTitle] = useState('');
  const [intent, setIntent] = useState('internal');
  const [room, setRoom] = useState<any>(null);
  const [findingRoom, setFindingRoom] = useState(false);
  const [startTime, setStartTime] = useState(position.time);
  const [duration, setDuration] = useState(1);

  // Reset when position changes
  useEffect(() => {
     setStartTime(position.time);
     setDuration(1);
     setRoom(null);
     setTitle('');
     setIntent('internal');
  }, [position]);

  const handleQuickSave = () => {
    if (!title.trim()) return;
    onSave({
       title,
       type: intent,
       start: startTime,
       duration: duration,
       date: position.date,
       room: room ? room.name : 'Remote',
       owner: 'Me'
    });
    onClose();
  };

  const findNearbyRoom = () => {
      setFindingRoom(true);
      // Mock API call
      setTimeout(() => {
         setRoom({ name: 'Conf Room 1', capacity: 12, id: 'room-0' });
         setFindingRoom(false);
      }, 600);
  };

  const handleExpand = () => {
     onExpand({
        title,
        intent,
        time: startTime,
        duration: duration,
        room: room?.id 
     });
  };

  return (
    <div 
       className="fixed z-50 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-in zoom-in-95 duration-200"
       style={{ 
          top: position.y, 
          left: position.x,
          transform: 'translate(10px, -50%)'
       }}
    >
       <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Quick Book</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2" onClick={onClose}><X size={14}/></Button>
       </div>
       
       <div className="space-y-3">
          <div>
             <Input 
               placeholder="Event title..." 
               className="font-medium border-slate-200 focus-visible:ring-teal-500"
               autoFocus
               value={title}
               onChange={e => setTitle(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleQuickSave()}
             />
          </div>
          
          <div className="flex gap-2">
             {['internal', 'focus', 'call'].map(t => (
                <button
                   key={t}
                   onClick={() => setIntent(t)}
                   className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize",
                      intent === t 
                         ? "bg-teal-50 border-teal-200 text-teal-700" 
                         : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                   )}
                >
                   {t}
                </button>
             ))}
          </div>

          {/* Room Finder Section */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
             <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={14} className={room ? "text-teal-600" : "text-slate-400"} />
                {findingRoom ? (
                   <span className="animate-pulse text-slate-400">Locating nearby room...</span>
                ) : room ? (
                   <span className="font-medium text-slate-900">{room.name}</span>
                ) : (
                   <span>No Room (Remote)</span>
                )}
             </div>
             {!room ? (
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={findNearbyRoom}>
                   Find Room
                </Button>
             ) : (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600" onClick={() => setRoom(null)}>
                   <X size={12} />
                </Button>
             )}
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
             <div className="flex items-center gap-1">
                <Clock size={12} />
                <select 
                   className="bg-transparent font-medium text-slate-700 cursor-pointer outline-none hover:text-teal-600"
                   value={startTime}
                   onChange={(e) => setStartTime(parseFloat(e.target.value))}
                >
                   {[8,9,10,11,12,13,14,15,16,17].map(h => (
                      <option key={h} value={h}>{h}:00</option>
                   ))}
                </select>
             </div>
             <select
                className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 font-medium text-slate-700 cursor-pointer outline-none hover:border-teal-500 focus:border-teal-500"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
             >
                <option value={0.5}>30m</option>
                <option value={1}>1h</option>
                <option value={1.5}>1.5h</option>
                <option value={2}>2h</option>
             </select>
          </div>

          <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
             <Button 
                size="sm" 
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleQuickSave}
                disabled={!title}
             >
                Book
             </Button>
             <Button 
                size="sm" 
                variant="outline"
                className="px-2"
                onClick={handleExpand}
                title="More Options"
             >
                <MoreHorizontal size={16} />
             </Button>
          </div>
       </div>
    </div>
  );
};

const EventCard = ({ 
  event, 
  onClick, 
  onContextMenu,
  compact = false,
  onDragEnd,
  onResizeEnd
}: { 
  event: any, 
  onClick: () => void, 
  onContextMenu?: (e: React.MouseEvent, event: any) => void,
  compact?: boolean,
  onDragEnd?: (id: number, newStart: number) => void,
  onResizeEnd?: (id: number, newDuration: number) => void
}) => {
  const isTeamEvent = event.owner && event.owner !== 'Me';
  
  const baseStyles = isTeamEvent 
    ? `${event.color || 'bg-slate-100 border-slate-300 text-slate-600'} opacity-90`
    : event.type === 'client' ? "bg-purple-50 border-purple-500 text-purple-700" 
    : event.type === 'company' ? "bg-amber-50 border-amber-500 text-amber-700" 
    : event.type === 'personal' ? "bg-slate-50 border-slate-400 text-slate-600" 
    : "bg-blue-50 border-blue-500 text-blue-700";

  return (
    <motion.div
      drag={!compact && !isTeamEvent && onDragEnd ? "y" : false} 
      dragConstraints={{ top: -((event.start - 8) * 60), bottom: (18 - (event.start + event.duration)) * 60 }}
      dragElastic={0} // Removed elasticity for precise grid feel
      dragMomentum={false}
      onContextMenu={(e) => {
         if (onContextMenu) {
            e.preventDefault();
            onContextMenu(e, event);
         }
      }}
      onDragEnd={(_, info: PanInfo) => {
        if (!onDragEnd || isTeamEvent) return;
        const movePixels = info.offset.y;
        // Snap to 15 minutes (15px)
        const moveQuarterHours = Math.round(movePixels / 15);
        const moveHours = moveQuarterHours * 0.25;
        
        if (moveHours !== 0) {
          onDragEnd(event.id, Math.max(8, Math.min(18 - event.duration, event.start + moveHours)));
        }
      }}
      onClick={(e) => { 
        e.stopPropagation(); 
        onClick(); 
      }}
      className={cn(
        "absolute rounded-md text-xs cursor-pointer border-l-2 shadow-sm hover:shadow-md transition-all group overflow-hidden z-20 pointer-events-auto",
        compact ? "p-1" : "p-2",
        baseStyles,
        !compact && !isTeamEvent && "hover:scale-[1.02] active:cursor-grabbing active:scale-105 active:z-30",
        isTeamEvent && "z-10 border-l-[3px] border-dashed"
      )}
      style={{ 
        left: compact ? '2px' : isTeamEvent ? '20%' : '4px', 
        right: compact ? '2px' : isTeamEvent ? '4px' : '20%', 
        top: `${(event.start - 8) * 60 + 2}px`, 
        height: `${event.duration * 60 - 4}px` 
      }}
    >
      <div className="font-semibold truncate flex justify-between items-center">
        <div className="flex items-center gap-1 truncate">
           <span className="truncate">
             {isTeamEvent ? `${event.owner}: ${event.title}` : event.title}
           </span>
           {event.recurrence && event.recurrence !== 'none' && <RefreshCw size={10} className="opacity-70" />}
        </div>
        {!compact && event.hasVC && <Video size={10} className="ml-1 flex-shrink-0" />}
        {!compact && !isTeamEvent && <GripVertical size={10} className="opacity-0 group-hover:opacity-50" />}
      </div>
      {!compact && event.duration >= 0.5 && (
        <div className="flex items-center gap-1 mt-0.5 opacity-80">
          <Clock size={10} />
          <span>
             {Math.floor(event.start)}:{event.start % 1 === 0 ? '00' : (event.start % 1 * 60).toFixed(0)} - 
             {Math.floor(event.start + event.duration)}:{(event.start + event.duration) % 1 === 0 ? '00' : ((event.start + event.duration) % 1 * 60).toFixed(0)}
          </span>
        </div>
      )}
      {!compact && event.room && event.duration >= 1 && (
        <div className="flex items-center gap-1 mt-0.5 opacity-80">
           <MapPin size={10} />
           <span className="truncate">{event.room}</span>
        </div>
      )}
      
      {/* Resize Handle */}
      {!compact && !isTeamEvent && onResizeEnd && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-opacity"
          drag="y"
          dragConstraints={{ top: 0, bottom: 300 }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={(_, info) => {
             const addPixels = info.offset.y;
             // Snap to 15 minutes (15px)
             const addHours = Math.round(addPixels / 15) * 0.25;
             if (Math.abs(addHours) >= 0.25) {
                onResizeEnd(event.id, Math.max(0.25, Math.min(8, event.duration + addHours)));
             }
          }}
          onClick={(e) => e.stopPropagation()}
        >
           <div className="w-8 h-1 bg-black/20 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
};

const EventDetailSheet = ({ event, isOpen, onClose, onDelete }: { event: any, isOpen: boolean, onClose: () => void, onDelete: (id: number) => void }) => {
  if (!event) return null;
  
  const isTeamEvent = event.owner && event.owner !== 'Me';
  const [activeTab, setActiveTab] = useState('details');
  
  // Mock state for AI items
  const [checkedItems, setCheckedItems] = useState<{[key: string]: boolean}>({});

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[540px] p-0">
         <SheetHeader className="sr-only">
            <SheetTitle>{event.title}</SheetTitle>
            <SheetDescription>Event details.</SheetDescription>
         </SheetHeader>

         <div className="bg-slate-50 border-b border-slate-200 p-6 pb-0">
            <div className="flex justify-between items-start mb-4">
               <Badge className={cn(
                 "px-2 py-1",
                 event.type === 'client' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
               )}>
                 {isTeamEvent ? `Organizer: ${event.owner}` : event.type === 'client' ? 'Client Meeting' : 'Internal Sync'}
               </Badge>
               <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
               </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
               {event.title}
               {event.recurrence && event.recurrence !== 'none' && <Badge variant="outline" className="bg-white text-slate-500 font-normal gap-1"><RefreshCw size={10} /> {event.recurrence}</Badge>}
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
               <div className="flex items-center gap-1"><CalendarIcon size={14}/> {event.dateStr}</div>
               <div className="flex items-center gap-1"><Clock size={14}/> {event.start}:00 - {event.start + event.duration}:00</div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
               <TabsList className="w-full justify-start rounded-none border-b border-transparent bg-transparent p-0">
                  <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 px-4 pb-3 pt-2">Details</TabsTrigger>
                  <TabsTrigger value="ai-insights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 px-4 pb-3 pt-2 flex gap-1.5 items-center"><Sparkles size={14} className="text-teal-500" /> Smart Recap</TabsTrigger>
               </TabsList>
            </Tabs>
         </div>

         <ScrollArea className="h-[calc(100vh-220px)]">
            {activeTab === 'details' ? (
              <div className="p-6 space-y-8">
                 {/* Actions */}
                 {!isTeamEvent && (
                   <div className="grid grid-cols-2 gap-3">
                      {event.hasVC ? (
                         <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2">
                            <Video size={16} /> Join Meeting
                         </Button>
                      ) : (
                         <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2">
                            <Mail size={16} /> Email Attendees
                         </Button>
                      )}
                      <Button 
                         variant="outline" 
                         className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                         onClick={() => {
                           if(window.confirm("Delete this event?")) { onDelete(event.id); onClose(); }
                         }}
                      >
                         <Trash size={16} className="mr-2"/> Cancel Event
                      </Button>
                   </div>
                 )}
  
                 {/* Details Grid */}
                 <div className="grid grid-cols-1 gap-6">
                    {/* Digital Visitor Pass */}
                    {event.visitor && (
                       <div className="space-y-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 text-purple-600">
                             <BadgeCheck size={14} /> Digital Visitor Pass
                          </h3>
                          <div className="relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                             <div className="absolute top-0 right-0 p-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                             </div>
                             <div className="p-6 flex flex-col items-center text-center">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-md mb-3">
                                   <AvatarFallback className="bg-purple-200 text-purple-700 text-xl">{event.visitor.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <h4 className="text-lg font-bold text-purple-900">{event.visitor}</h4>
                                <p className="text-sm text-purple-600 mb-4">Acme Corp • Guest</p>
                                
                                <div className="bg-white p-2 rounded-lg border border-purple-100 shadow-sm mb-4">
                                   <QrCode size={80} className="text-slate-900" />
                                </div>
                                
                                <div className="w-full grid grid-cols-2 gap-2 text-left bg-white/50 rounded-lg p-3 border border-purple-100/50">
                                   <div>
                                      <div className="text-[10px] text-slate-500 uppercase font-bold">Access Level</div>
                                      <div className="text-sm font-medium text-slate-900">L2, L3 Conf</div>
                                   </div>
                                   <div>
                                      <div className="text-[10px] text-slate-500 uppercase font-bold">Wi-Fi Code</div>
                                      <div className="text-sm font-medium text-slate-900 font-mono">GUEST-8823</div>
                                   </div>
                                </div>
                             </div>
                             <div className="bg-purple-100 px-4 py-2 text-center text-xs text-purple-700 font-medium">
                                Valid for {event.dateStr}
                             </div>
                          </div>
                       </div>
                    )}

                    {/* Attendees */}
                    <div>
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Users size={14} /> Attendees
                       </h3>
                       <div className="flex -space-x-2 overflow-hidden">
                          {INITIAL_COLLEAGUES.map((c) => (
                             <Avatar key={c.id} className="inline-block border-2 border-white h-8 w-8">
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">{c.avatar}</AvatarFallback>
                             </Avatar>
                          ))}
                          <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-white bg-slate-100 text-[10px] font-medium text-slate-500">
                             +2
                          </div>
                       </div>
                    </div>

                    {/* Agenda */}
                    {event.agenda && event.agenda.length > 0 && (
                       <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <ListChecks size={14} /> Agenda
                          </h3>
                          <ul className="space-y-2">
                             {event.agenda.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 group">
                                   <Checkbox 
                                      id={`item-${i}`} 
                                      className="mt-0.5"
                                      checked={checkedItems[`item-${i}`]}
                                      onCheckedChange={(c) => setCheckedItems({...checkedItems, [`item-${i}`]: !!c})}
                                   />
                                   <label 
                                      htmlFor={`item-${i}`} 
                                      className={cn("leading-tight cursor-pointer", checkedItems[`item-${i}`] && "line-through text-slate-400")}
                                   >
                                      {item}
                                   </label>
                                </li>
                             ))}
                          </ul>
                       </div>
                    )}

                    {/* Attachments */}
                    {event.hasAttachments && (
                       <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <Paperclip size={14} /> Attachments
                          </h3>
                          <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 transition-colors cursor-pointer">
                             <div className="h-8 w-8 bg-red-50 text-red-600 rounded flex items-center justify-center">
                                <FileText size={16} />
                             </div>
                             <div>
                                <div className="text-sm font-medium text-slate-900">Q3_Presentation.pdf</div>
                                <div className="text-xs text-slate-500">2.4 MB • PDF</div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
            ) : (
               <div className="p-6 space-y-6">
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                     <h3 className="font-bold text-teal-900 flex items-center gap-2 mb-2">
                        <Sparkles size={16} /> AI Meeting Recap
                     </h3>
                     <p className="text-sm text-teal-800 mb-3">
                        Generating transcript and action items...
                     </p>
                     <div className="space-y-2">
                        <div className="h-2 bg-teal-200/50 rounded-full w-3/4 animate-pulse" />
                        <div className="h-2 bg-teal-200/50 rounded-full w-1/2 animate-pulse" />
                        <div className="h-2 bg-teal-200/50 rounded-full w-5/6 animate-pulse" />
                     </div>
                  </div>
               </div>
            )}
         </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// --- Recurrence Utilities ---
type RecurrenceRule = {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  days?: number[]; // 0=Sun, 1=Mon...
  until?: Date;
  count?: number;
  endType: 'never' | 'date' | 'count';
};

const getRecurrenceSummary = (rule: RecurrenceRule | null): string => {
  if (!rule) return "Does not repeat";
  
  const { freq, interval, days, endType, until, count } = rule;
  const unit = freq === 'daily' ? 'day' : freq === 'weekly' ? 'week' : freq === 'monthly' ? 'month' : 'year';
  const plural = interval > 1 ? 's' : '';
  
  let text = interval === 1 ? `${freq.charAt(0).toUpperCase() + freq.slice(1)}` : `Every ${interval} ${unit}${plural}`;
  
  if (freq === 'weekly' && days && days.length > 0) {
     const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
     if (days.length === 7) text = interval === 1 ? "Daily" : `Every ${interval} weeks on all days`;
     else if (days.length === 5 && !days.includes(0) && !days.includes(6)) text = interval === 1 ? "Every weekday" : `Every ${interval} weeks on weekdays`;
     else text += ` on ${days.map(d => dayNames[d]).join(', ')}`;
  }
  
  if (endType === 'date' && until) text += `, until ${until.toLocaleDateString()}`;
  if (endType === 'count' && count) text += `, for ${count} times`;
  
  return text;
};

const formatTimeValue = (t: number) => {
   const h = Math.floor(t);
   const m = Math.round((t - h) * 60);
   return `${h}:${m.toString().padStart(2, '0')}`;
};

const RecurrencePicker = ({ 
   value, 
   onChange 
}: { 
   value: RecurrenceRule | null, 
   onChange: (rule: RecurrenceRule | null) => void 
}) => {
   const [isOpen, setIsOpen] = useState(false);
   
   // Internal state for the form
   const [freq, setFreq] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
   const [interval, setInterval] = useState(1);
   const [days, setDays] = useState<number[]>([]);
   const [endType, setEndType] = useState<'never' | 'date' | 'count'>('never');
   const [until, setUntil] = useState<Date | undefined>(undefined);
   const [count, setCount] = useState(10);

   // Load from value when opening
   useEffect(() => {
      if (value) {
         setFreq(value.freq);
         setInterval(value.interval);
         setDays(value.days || []);
         setEndType(value.endType);
         setUntil(value.until);
         setCount(value.count || 10);
      } else {
         // Default defaults
         setFreq('weekly');
         setInterval(1);
         setDays([new Date().getDay()]); // Default to today
         setEndType('never');
      }
   }, [value, isOpen]);

   const handleSave = () => {
      onChange({ freq, interval, days: freq === 'weekly' ? days : undefined, endType, until, count });
      setIsOpen(false);
   };

   const toggleDay = (d: number) => {
      if (days.includes(d)) setDays(days.filter(x => x !== d));
      else setDays([...days, d].sort());
   };

   return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal w-full", !value && "text-muted-foreground")}>
               <RefreshCw className="mr-2 h-4 w-4 opacity-50" />
               <span className="truncate">{getRecurrenceSummary(value)}</span>
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[425px] z-[60]">
            <DialogHeader>
               <DialogTitle>Custom Recurrence</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                  <div className="flex items-center justify-between">
                     <Label className="w-16">Repeat</Label>
                     <Select value={freq} onValueChange={(v: any) => setFreq(v)}>
                        <SelectTrigger className="flex-1 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent className="z-[70]">
                           <SelectItem value="daily">Daily</SelectItem>
                           <SelectItem value="weekly">Weekly</SelectItem>
                           <SelectItem value="monthly">Monthly</SelectItem>
                           <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <Label className="w-16">Every</Label>
                     <div className="flex items-center gap-2 flex-1">
                        <Input 
                           type="number" min={1} max={99} 
                           className="h-8 w-16" 
                           value={interval} 
                           onChange={e => setInterval(Math.max(1, parseInt(e.target.value) || 1))} 
                        />
                        <span className="text-sm text-slate-500">
                           {freq === 'daily' ? 'day' : freq === 'weekly' ? 'week' : freq === 'monthly' ? 'month' : 'year'}{interval > 1 ? 's' : ''}
                        </span>
                     </div>
                  </div>

                  {freq === 'weekly' && (
                     <div className="space-y-2 pt-2">
                        <Label>On these days</Label>
                        <div className="flex justify-between">
                           {['S','M','T','W','T','F','S'].map((d, i) => (
                              <div 
                                 key={i}
                                 className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-colors",
                                    days.includes(i) ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                 )}
                                 onClick={() => toggleDay(i)}
                              >
                                 {d}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                     <Label>Ends</Label>
                     <RadioGroup value={endType} onValueChange={(v: any) => setEndType(v)} className="space-y-2">
                        <div className="flex items-center space-x-2">
                           <RadioGroupItem value="never" id="r-never" />
                           <Label htmlFor="r-never" className="font-normal cursor-pointer">Never</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                           <RadioGroupItem value="date" id="r-date" />
                           <Label htmlFor="r-date" className="font-normal cursor-pointer">On date</Label>
                           {endType === 'date' && (
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-7 w-[130px] text-xs px-2 ml-auto font-normal">
                                       {until ? until.toLocaleDateString() : "Pick date"}
                                    </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0 z-[70]" align="end">
                                    <Calendar mode="single" selected={until} onSelect={setUntil} initialFocus />
                                 </PopoverContent>
                              </Popover>
                           )}
                        </div>
                        <div className="flex items-center space-x-2">
                           <RadioGroupItem value="count" id="r-count" />
                           <Label htmlFor="r-count" className="font-normal cursor-pointer">After</Label>
                           {endType === 'count' && (
                              <div className="flex items-center gap-2 ml-auto">
                                 <Input 
                                    type="number" min={1} className="h-7 w-16 text-xs" 
                                    value={count} 
                                    onChange={e => setCount(parseInt(e.target.value))} 
                                 />
                                 <span className="text-xs text-slate-500">occurrences</span>
                              </div>
                           )}
                        </div>
                     </RadioGroup>
                  </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => { onChange(null); setIsOpen(false); }}>Remove Recurrence</Button>
               <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

const WizardOverlay = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  initialTime,
  initialDateStr,
  rooms,
  colleagues = []
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (data: any) => void,
  initialData?: any,
  initialTime?: number,
  initialDateStr?: string,
  rooms: any[],
  colleagues?: any[]
}) => {
  const [step, setStep] = useState(initialData ? 1 : 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [intent, setIntent] = useState(initialData?.intent || 'meeting');
  const [time, setTime] = useState(initialData?.time || initialTime || 9);
  const [duration, setDuration] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(initialData?.room || null);
  const [host, setHost] = useState('Me');
  const [description, setDescription] = useState('');
  const [agendaItems, setAgendaItems] = useState<string[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [newVisitor, setNewVisitor] = useState({ name: '', email: '', company: '' });
  const [invitedColleagues, setInvitedColleagues] = useState<string[]>([]);
  const [colleagueSearch, setColleagueSearch] = useState('');
  const [hasVC, setHasVC] = useState(false);
  const [hasAttachments, setHasAttachments] = useState(false);
  const [capacity, setCapacity] = useState(4);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | null>(null);
  const [nearestToMe, setNearestToMe] = useState(false);
  const [teammateSearch, setTeammateSearch] = useState('');
  const [showFloorPlan, setShowFloorPlan] = useState<any>(null);
  const [dateStr, setDateStr] = useState(initialDateStr || '');
   const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // New: Services State
  const [services, setServices] = useState({
     catering: false,
     itSupport: false,
     layout: 'standard'
  });

  useEffect(() => {
     if (isOpen) {
        // Reset or Load Data
        if (initialData) {
           setTitle(initialData.title || '');
           setIntent(initialData.intent || 'meeting');
           setTime(initialData.time || 9);
           setDuration(initialData.duration || 1);
           setSelectedRoom(initialData.room || null);
           // Smart Defaults
           handleIntentSelect(initialData.intent || 'meeting', true);
        } else {
           // Clean State
           setStep(0);
           setTitle('');
           setDateStr('');
           setSelectedRoom(null);
           setRecurrence(null);
           setServices({ catering: false, itSupport: false, layout: 'standard' });
        }
     }
  }, [isOpen, initialData]);

  const handleIntentSelect = (selectedIntent: string, isAiTriggered = false) => {
     setIntent(selectedIntent);
     
     // Smart Defaults based on Intent
     if (selectedIntent === 'call') {
        if(!title) setTitle('Quick Call');
        setCapacity(1);
     } else if (selectedIntent === 'focus') {
        if(!title) setTitle('Focus Time');
        setCapacity(1);
     } else if (selectedIntent === 'client') {
        setCapacity(6);
        setHasVC(true); 
     } else {
        // Meeting
        setCapacity(4);
     }
     setStep(1);
  };

  // AI Agenda Generator
  const generateAiAgenda = () => {
    if (!title) return;
    
    const items = [];
    const t = title.toLowerCase();
    
    if (t.includes('roadmap') || t.includes('plan')) {
       items.push("Review previous quarter metrics", "Present new strategic goals", "Resource allocation discussion", "Timeline sign-off");
    } else if (t.includes('sync') || t.includes('standup')) {
       items.push("Team updates (round robin)", "Blockers & Risks", "Action items review");
    } else if (t.includes('client') || t.includes('demo')) {
       items.push("Introductions", "Product Demo", "Q&A Session", "Next Steps");
    } else {
       items.push("Context & Background", "Main Discussion Points", "Next Steps & Owners");
    }
    
    setAgendaItems(items);
    toast.success("Agenda generated by AI");
  };

  // Calculate Available Rooms with "Smart Scoring"
   // Calculate Available Rooms with "Smart Scoring"
   const smartRooms = useMemo(() => {
     if (!rooms) return [];
     
     // Teammate Logic
     const targetColleague = teammateSearch ? colleagues?.find(c => c.name.toLowerCase().includes(teammateSearch.toLowerCase())) : null;
     const teammateFloor = targetColleague ? (['c1', 'c4'].includes(targetColleague.id) ? 'L2' : 'L1') : null;

     // Mock Personalization
     const myFavorites = ['1', '5', '9']; 
     const myTeamLocation = 'L3'; 
 
     // Base Availability Filter
     const available = rooms.filter(r => {
        const isBlocked = r.schedule.some((s: any) => 
           (time < s.start + s.duration) && (time + duration > s.start)
        );
        return !isBlocked;
     });
 
     // Scoring & Filtering
     return available.map(room => {
        let score = 0;
        if (room.capacity >= capacity) {
           score += 10;
           if (room.capacity <= capacity + 2) score += 5;
        } else return null; 
 
        // Contextual Scoring
        if (hasVC && room.features.includes('Video Conf')) score += 20;
        if (nearestToMe && room.floor === 'L2') score += 15; 
        if (intent === 'client' && room.type === 'Conference') score += 15;
        if (intent === 'focus' && room.type === 'Phone Booth') score += 25;
        
        // Personalization Scoring
        if (myFavorites.includes(room.id)) score += 30; 
        if (room.floor === myTeamLocation) score += 5;

        // Teammate Boost
        if (teammateFloor && room.floor === teammateFloor) score += 40;
 
        return { 
            ...room, 
            score, 
            isFavorite: myFavorites.includes(room.id),
            isTeammateNear: teammateFloor && room.floor === teammateFloor,
            teammateName: targetColleague?.name.split(' ')[0]
        };
     })
     .filter(Boolean)
     .sort((a, b) => b!.score - a!.score)
     .slice(0, 12); 
   }, [rooms, time, duration, capacity, hasVC, nearestToMe, intent, selectedRoom, teammateSearch, colleagues]);

  if (!isOpen) return null;

  const addAgenda = () => {
     if(newAgendaItem.trim()) {
        setAgendaItems([...agendaItems, newAgendaItem]);
        setNewAgendaItem('');
     }
  };

  const handleConfirm = () => {
     if (step === 2 && !title) { toast.error("Please enter a title"); return; }
     if (step < 3) { setStep(step + 1); return; }
     
     const newEvent = {
        title,
        type: intent || 'internal',
        start: time,
        duration,
        room: selectedRoom ? rooms.find(r => r.id === selectedRoom)?.name : 'Remote',
        owner: host,
        desc: description,
        agenda: agendaItems,
        visitors,
        attendees: invitedColleagues.map((id: string) => colleagues.find((c: any) => c.id === id)),
        hasVC,
        hasAttachments,
        recurrence,
        services, // NEW
        dateStr: dateStr || initialDateStr
     };
     
     onSave(newEvent);
     onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <FloorPlanModal isOpen={!!showFloorPlan} onClose={() => setShowFloorPlan(null)} room={showFloorPlan} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
      >
        {/* Wizard Header */}
        <div className="h-16 border-b border-slate-100 flex justify-between items-center px-8 bg-white flex-shrink-0">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">
                 <Sparkles size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                 {step === 0 ? "What would you like to do?" : "Schedule Event"}
              </h2>
           </div>
           
           {/* Step Indicator (Only show if not step 0) */}
           {step > 0 && (
              <div className="flex items-center gap-2">
                 <div className={cn("h-2 w-2 rounded-full transition-colors", step >= 1 ? "bg-teal-500" : "bg-slate-200")} />
                 <div className="w-8 h-[2px] bg-slate-100" />
                 <div className={cn("h-2 w-2 rounded-full transition-colors", step >= 2 ? "bg-teal-500" : "bg-slate-200")} />
                 <div className="w-8 h-[2px] bg-slate-100" />
                 <div className={cn("h-2 w-2 rounded-full transition-colors", step >= 3 ? "bg-teal-500" : "bg-slate-200")} />
              </div>
           )}

           <Button variant="ghost" size="icon" onClick={onClose}><X size={20} className="text-slate-400" /></Button>
        </div>

        <div className="flex-1 flex min-h-0 bg-slate-50/50">
           {/* Main Content Area */}
           <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1">
                 <div className="p-8 max-w-4xl mx-auto w-full h-full">
                    <AnimatePresence mode="wait">
                       
                       {/* STEP 0: INTENT GRID */}
                       {step === 0 && (
                          <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col justify-center">
                             
                             <div className="mb-8 max-w-2xl mx-auto w-full">
                                <h3 className="text-xl font-semibold mb-4 text-slate-800 text-center">How can I help you schedule?</h3>
                                <div className="relative">
                                   <Textarea 
                                     placeholder="e.g. Book a client meeting next Tuesday at 2pm for 5 people..."
                                     className="h-24 text-lg resize-none pr-12 bg-white shadow-sm border-slate-200 focus:border-teal-500"
                                     value={title}
                                     onChange={e => setTitle(e.target.value)}
                                     onKeyDown={e => {
                                        if(e.key === 'Enter' && !e.shiftKey) {
                                           e.preventDefault();
                                           const result = parseNaturalLanguage(title);
                                           if (result.title) setTitle(result.title);
                                           if (result.time) setTime(result.time);
                                           handleIntentSelect(result.intent || 'meeting');
                                        }
                                     }}
                                   />
                                   <Button 
                                      size="icon" 
                                      className="absolute bottom-3 right-3 h-8 w-8 bg-teal-600 hover:bg-teal-700 rounded-full"
                                      onClick={() => {
                                           const result = parseNaturalLanguage(title);
                                           if (result.title) setTitle(result.title);
                                           if (result.time) setTime(result.time);
                                           handleIntentSelect(result.intent || 'meeting');
                                      }}
                                   >
                                      <ArrowRight size={16} />
                                   </Button>
                                </div>
                                <div className="flex justify-center gap-2 mt-3">
                                    <Badge variant="outline" className="cursor-pointer hover:bg-slate-50 text-slate-500 font-normal" onClick={() => setTitle("Weekly Sync on Monday at 10am")}>Weekly Sync</Badge>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-slate-50 text-slate-500 font-normal" onClick={() => setTitle("Client Demo for Acme Corp")}>Client Demo</Badge>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-slate-50 text-slate-500 font-normal" onClick={() => setTitle("Focus time for deep work")}>Focus Time</Badge>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                {[
                                   { id: 'meeting', icon: Users, label: 'Team Meeting', desc: 'Book a room & invite team', color: 'text-blue-600', bg: 'bg-blue-50' },
                                   { id: 'client', icon: Building2, label: 'Client Visit', desc: 'Register visitor & book VC', color: 'text-purple-600', bg: 'bg-purple-50' },
                                   { id: 'focus', icon: Coffee, label: 'Focus Time', desc: 'Find a quiet spot', color: 'text-amber-600', bg: 'bg-amber-50' },
                                   { id: 'call', icon: Phone, label: 'Quick Call', desc: 'Find a phone booth now', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                ].map((item) => (
                                   <button
                                      key={item.id}
                                      onClick={() => handleIntentSelect(item.id)}
                                      className="flex flex-col items-start p-6 rounded-2xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-lg hover:bg-teal-50/10 transition-all text-left group relative overflow-hidden"
                                   >
                                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-teal-500">
                                         <ArrowRight size={24} />
                                      </div>
                                      <div className={cn("p-4 rounded-xl mb-4 transition-colors", item.bg, item.color)}>
                                         <item.icon size={32} />
                                      </div>
                                      <span className="font-bold text-xl text-slate-900 mb-1">{item.label}</span>
                                      <span className="text-sm text-slate-500">{item.desc}</span>
                                   </button>
                                ))}
                             </div>
                          </motion.div>
                       )}

                       {/* STEP 1: LOGISTICS */}
                       {step === 1 && (
                          <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                             <ScrollArea className="h-[calc(85vh-100px)] px-8 pt-8">
                                <div className="space-y-8 max-w-3xl mx-auto pb-20">
                             
                             {/* Time & Online Controls */}
                             <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                   <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Clock size={16}/> Time & Date</h3>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                         <Label className="text-xs text-slate-500">Date</Label>
                                         <Popover>
                                            <PopoverTrigger asChild>
                                               <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateStr && "text-muted-foreground")}>
                                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                                  {dateStr ? format(new Date(dateStr), "PPP") : <span>Pick a date</span>}
                                               </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 z-[100]" align="start">
                                               <Calendar
                                                  mode="single"
                                                  selected={dateStr ? new Date(dateStr) : undefined}
                                                  onSelect={(date) => {
                                                      if(date) setDateStr(date.toISOString());
                                                  }}
                                                  initialFocus
                                               />
                                            </PopoverContent>
                                         </Popover>
                                      </div>
                                      <div className="space-y-1.5">
                                         <Label className="text-xs text-slate-500">Start Time</Label>
                                         <Select value={time.toString()} onValueChange={(v) => setTime(parseFloat(v))}>
                                            <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                                            <SelectContent className="max-h-[200px] z-[100]">
                                               {(() => {
                                                  const opts = [];
                                                  for (let h = 7; h <= 20; h += 0.5) {
                                                     opts.push(<SelectItem key={h} value={h.toString()}>{formatTimeValue(h)}</SelectItem>);
                                                  }
                                                  return opts;
                                               })()}
                                            </SelectContent>
                                         </Select>
                                      </div>
                                      <div className="space-y-1.5">
                                         <Label className="text-xs text-slate-500">Duration</Label>
                                         <Select value={duration.toString()} onValueChange={(v) => setDuration(parseFloat(v))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent className="z-[100]">
                                               <SelectItem value="0.5">30 Mins</SelectItem>
                                               <SelectItem value="1">1 Hour</SelectItem>
                                               <SelectItem value="1.5">1.5 Hours</SelectItem>
                                               <SelectItem value="2">2 Hours</SelectItem>
                                               <SelectItem value="3">3 Hours</SelectItem>
                                               <SelectItem value="4">4 Hours</SelectItem>
                                            </SelectContent>
                                         </Select>
                                      </div>
                                      <div className="space-y-1.5">
                                         <Label className="text-xs text-slate-500">Repeat</Label>
                                         <RecurrencePicker value={recurrence} onChange={setRecurrence} />
                                      </div>
                                   </div>
                                </div>

                                <div className="col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                   <div>
                                      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-1"><LinkIcon size={16}/> Online</h3>
                                      <p className="text-xs text-slate-500">Add meeting link</p>
                                   </div>
                                   <div className="flex items-center justify-between mt-2">
                                      <span className="text-sm font-medium">Generate Link</span>
                                      <Switch checked={hasVC} onCheckedChange={setHasVC} />
                                   </div>
                                </div>
                             </div>



                             {/* Room Finding Controls */}
                             <div className="space-y-4">
                                <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                      <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Building2 size={16}/> Find a Room</h3>
                                      {/* Smart Filters */}
                                      <div className="flex items-center gap-2">
                                         <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs border cursor-pointer transition-colors", nearestToMe ? "bg-teal-100 border-teal-200 text-teal-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")} onClick={() => setNearestToMe(!nearestToMe)}>
                                            <MapPin size={12} /> Near Me
                                         </div>
                                         <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs border cursor-pointer transition-colors", hasVC ? "bg-teal-100 border-teal-200 text-teal-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")} onClick={() => setHasVC(!hasVC)}>
                                            <Video size={12} /> VC
                                         </div>
                                         <div className="flex items-center gap-2 text-xs border border-slate-200 rounded-full px-2 py-1 bg-white">
                                            <Users size={12} className="text-slate-400" />
                                            <input 
                                               type="number" 
                                               value={capacity} 
                                               onChange={e => setCapacity(parseInt(e.target.value))} 
                                               className="w-8 border-0 p-0 text-center focus:ring-0 text-slate-700 h-4" 
                                            />
                                         </div>
                                      </div>
                                   </div>
                                   {/* Teammate Finder */}
                                   <div className="relative">
                                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                      <Input 
                                         placeholder="Sit near a colleague (e.g. Sarah)..." 
                                         className="pl-9 h-9 bg-white border-slate-200 text-sm"
                                         value={teammateSearch}
                                         onChange={e => setTeammateSearch(e.target.value)}
                                      />
                                      {teammateSearch && (
                                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-teal-600 font-medium animate-in fade-in">
                                            {smartRooms.some((r:any) => r.isTeammateNear) ? "Found matches!" : "Searching..."}
                                         </div>
                                      )}
                                   </div>
                                </div>

                                <ScrollArea className="h-[300px] border border-slate-200 rounded-xl bg-white">
                                   <div className="p-2 space-y-6">
                                      {/* Recommended Section */}
                                      {smartRooms.some((r: any) => r.score >= 35 || r.isFavorite) && (
                                         <div>
                                            <h4 className="px-1 mb-2 text-xs font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                                               <Sparkles size={12} /> Recommended for you
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                               {smartRooms.filter((r: any) => r.score >= 35 || r.isFavorite).map((room: any) => (
                                                  <div 
                                                     key={room.id}
                                                     onClick={() => setSelectedRoom(room.id)}
                                                     className={cn(
                                                        "relative p-3 rounded-lg border transition-all cursor-pointer flex gap-3 hover:shadow-md group",
                                                        selectedRoom === room.id 
                                                           ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500" 
                                                           : "bg-white border-slate-200 hover:border-slate-300"
                                                     )}
                                                  >
                                                     <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                                                        <ImageWithFallback src={room.image} className="h-full w-full object-cover" />
                                                        {room.isFavorite && <div className="absolute top-0 left-0 bg-amber-400 text-white p-0.5 rounded-br"><Star size={10} fill="currentColor" /></div>}
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                           <h4 className="font-bold text-sm text-slate-900 truncate">{room.name}</h4>
                                                           <div className="flex gap-1 flex-wrap justify-end">
                                                              {room.isTeammateNear && <Badge className="h-4 px-1 text-[10px] bg-indigo-100 text-indigo-700 hover:bg-indigo-100 shadow-none border-0">Near {room.teammateName}</Badge>}
                                                              {room.score > 40 && !room.isTeammateNear && <Badge className="h-4 px-1 text-[10px] bg-teal-100 text-teal-700 hover:bg-teal-100 shadow-none border-0">Best Match</Badge>}
                                                           </div>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{room.floor} • {room.capacity} Seats</div>
                                                        <div className="flex gap-1 mt-2">
                                                           {room.features.includes('Video Conf') && <Video size={12} className="text-slate-400" />}
                                                           {room.features.includes('Whiteboard') && <Monitor size={12} className="text-slate-400" />}
                                                           {room.features.includes('Catering') && <Coffee size={12} className="text-slate-400" />}
                                                        </div>
                                                     </div>
                                                     {selectedRoom === room.id && (
                                                        <div className="absolute top-2 right-2 bg-teal-600 text-white rounded-full p-0.5">
                                                           <CheckCircle2 size={12} />
                                                        </div>
                                                     )}
                                                     <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                           size="sm" 
                                                           variant="secondary" 
                                                           className="h-6 text-[10px] px-2 bg-white/90 hover:bg-teal-100 text-teal-700 border border-teal-200 shadow-sm"
                                                           onClick={(e) => { e.stopPropagation(); setShowFloorPlan(room); }}
                                                        >
                                                           <MapIcon size={10} className="mr-1" /> Map
                                                        </Button>
                                                     </div>
                                                  </div>
                                               ))}
                                            </div>
                                         </div>
                                      )}
                                      
                                      {/* Other Rooms Section */}
                                      {smartRooms.some((r: any) => r.score < 35 && !r.isFavorite) && (
                                         <div>
                                            <h4 className="px-1 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Other Available Rooms</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                               {smartRooms.filter((r: any) => r.score < 35 && !r.isFavorite).map((room: any) => (
                                                  <div 
                                                     key={room.id}
                                                     onClick={() => setSelectedRoom(room.id)}
                                                     className={cn(
                                                        "relative p-3 rounded-lg border transition-all cursor-pointer flex gap-3 hover:shadow-md group",
                                                        selectedRoom === room.id 
                                                           ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500" 
                                                           : "bg-white border-slate-200 hover:border-slate-300"
                                                     )}
                                                  >
                                                     <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                        <ImageWithFallback src={room.image} className="h-full w-full object-cover" />
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                           <h4 className="font-bold text-sm text-slate-900 truncate">{room.name}</h4>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{room.floor} • {room.capacity} Seats</div>
                                                        <div className="flex gap-1 mt-2">
                                                           {room.features.includes('Video Conf') && <Video size={12} className="text-slate-400" />}
                                                           {room.features.includes('Whiteboard') && <Monitor size={12} className="text-slate-400" />}
                                                           {room.features.includes('Catering') && <Coffee size={12} className="text-slate-400" />}
                                                        </div>
                                                     </div>
                                                     {selectedRoom === room.id && (
                                                        <div className="absolute top-2 right-2 bg-teal-600 text-white rounded-full p-0.5">
                                                           <CheckCircle2 size={12} />
                                                        </div>
                                                     )}
                                                     <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                           size="sm" 
                                                           variant="secondary" 
                                                           className="h-6 text-[10px] px-2 bg-white/90 hover:bg-teal-100 text-teal-700 border border-teal-200 shadow-sm"
                                                           onClick={(e) => { e.stopPropagation(); setShowFloorPlan(room); }}
                                                        >
                                                           <MapIcon size={10} className="mr-1" /> Map
                                                        </Button>
                                                     </div>
                                                  </div>
                                               ))}
                                            </div>
                                         </div>
                                      )}

                                      {smartRooms.length === 0 && (
                                         <div className="col-span-2 py-12 text-center text-slate-400">
                                            <Search size={32} className="mx-auto mb-2 opacity-20"/>
                                            <p>No rooms match your specific criteria.</p>
                                            <Button variant="link" onClick={() => {setCapacity(1); setNearestToMe(false);}}>Clear Filters</Button>
                                         </div>
                                      )}
                                   </div>
                                </ScrollArea>
                             </div>

                             {/* Services Section (Moved) */}
                             {selectedRoom && (
                                <div className="space-y-4 mt-6">
                                   {!smartRooms.find(r => r.id === selectedRoom) && (
                                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                                         <AlertTriangle size={16} />
                                         <span className="font-medium">Selected room is not available at this time.</span>
                                      </div>
                                   )}
                                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                                      <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Utensils size={16}/> Room Services</h3>
                                      <div className="grid grid-cols-3 gap-4">
                                         <div className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md",
                                            services.catering ? "bg-teal-50 border-teal-500" : "bg-white border-slate-200"
                                         )} onClick={() => setServices({...services, catering: !services.catering})}>
                                            <div className="flex justify-between items-start mb-2">
                                               <Coffee size={20} className={services.catering ? "text-teal-600" : "text-slate-400"} />
                                               {services.catering && <CheckCircle2 size={16} className="text-teal-600" />}
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">Catering</div>
                                            <div className="text-xs text-slate-500">Coffee & Snacks</div>
                                         </div>
 
                                         <div className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md",
                                            services.itSupport ? "bg-teal-50 border-teal-500" : "bg-white border-slate-200"
                                         )} onClick={() => setServices({...services, itSupport: !services.itSupport})}>
                                            <div className="flex justify-between items-start mb-2">
                                               <HelpCircle size={20} className={services.itSupport ? "text-teal-600" : "text-slate-400"} />
                                               {services.itSupport && <CheckCircle2 size={16} className="text-teal-600" />}
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">IT Support</div>
                                            <div className="text-xs text-slate-500">Tech Assist</div>
                                         </div>
 
                                         <div className="border rounded-lg p-3 bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed">
                                            <div className="flex justify-between items-start mb-2">
                                               <Layers size={20} className="text-slate-400" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-900 mb-1">Layout</div>
                                            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                               Standard <Badge variant="secondary" className="h-4 text-[10px] px-1 bg-slate-200 text-slate-500 hover:bg-slate-200">Fixed</Badge>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             )}

                                 </div>
                              </ScrollArea>
                           </motion.div>
                        )}

                       {/* STEP 2: DETAILS */}
                       {step === 2 && (
                          <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                             <ScrollArea className="h-[calc(85vh-100px)] px-8 pt-8">
                                <div className="space-y-8 max-w-3xl mx-auto pb-20">
                                   <div className="space-y-6">
                                <div>
                                   <Label className="text-base font-semibold mb-2 block">What is this meeting about?</Label>
                                   <Input 
                                      placeholder="Event Title (e.g. Q3 Roadmap Review)" 
                                      className="h-12 text-lg bg-white"
                                      value={title} onChange={e => setTitle(e.target.value)}
                                      autoFocus
                                   />
                                </div>

                                {/* Invite Team Section */}
                                <div className="space-y-3">
                                   <Label className="text-sm font-semibold block">Invite Team</Label>
                                   
                                   {/* Selected Colleagues Chips */}
                                   {invitedColleagues.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                         {invitedColleagues.map(id => {
                                            const c = colleagues.find((col: any) => col.id === id);
                                            if(!c) return null;
                                            return (
                                               <Badge key={id} variant="outline" className="pl-1 pr-2 py-1 gap-2 bg-white hover:bg-red-50 hover:border-red-200 group transition-colors cursor-pointer shadow-sm" onClick={() => setInvitedColleagues(invitedColleagues.filter(i => i !== id))}>
                                                  <Avatar className="h-5 w-5">
                                                     <AvatarFallback className={cn("text-[10px] text-white", c.color?.split(' ')[0].replace('bg-', 'bg-') || "bg-slate-500")}>{c.avatar}</AvatarFallback>
                                                  </Avatar>
                                                  <span className="text-slate-600 group-hover:text-red-600">{c.name}</span>
                                                  <X size={12} className="text-slate-300 group-hover:text-red-400" />
                                               </Badge>
                                            )
                                         })}
                                      </div>
                                   )}

                                   {/* Search & Add */}
                                   <div className="relative">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                      <Input 
                                         placeholder="Search by name..." 
                                         className="pl-9 bg-white" 
                                         value={colleagueSearch}
                                         onChange={e => setColleagueSearch(e.target.value)}
                                      />
                                      
                                      {/* Search Results Dropdown */}
                                      {colleagueSearch && (
                                         <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                                            {/* Internal Colleagues Matches */}
                                            {colleagues.filter((c: any) => c.name.toLowerCase().includes(colleagueSearch.toLowerCase()) && !invitedColleagues.includes(c.id)).map((c: any) => (
                                               <div 
                                                  key={c.id} 
                                                  className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer transition-colors"
                                                  onClick={() => {
                                                     setInvitedColleagues([...invitedColleagues, c.id]);
                                                     setColleagueSearch('');
                                                  }}
                                               >
                                                  <Avatar className="h-6 w-6">
                                                     <AvatarFallback className={cn("text-[10px] text-white", c.color?.split(' ')[0].replace('bg-', 'bg-') || "bg-slate-500")}>{c.avatar}</AvatarFallback>
                                                  </Avatar>
                                                  <div className="flex-1">
                                                     <div className="text-sm font-medium text-slate-900">{c.name}</div>
                                                     <div className="text-xs text-slate-500">{c.status}</div>
                                                  </div>
                                                  <Plus size={14} className="text-slate-400" />
                                               </div>
                                            ))}

                                            {/* External Invite Option */}
                                            {colleagueSearch.includes('@') && colleagueSearch.includes('.') && (
                                                <div 
                                                   className="flex items-center gap-3 p-2 hover:bg-purple-50 cursor-pointer transition-colors border-t border-slate-100"
                                                   onClick={() => {
                                                      const email = colleagueSearch;
                                                      const domain = email.split('@')[1];
                                                      const companyName = domain ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) : 'External';
                                                      const namePart = email.split('@')[0];
                                                      const fullName = namePart.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
                                                      
                                                      setVisitors([...visitors, { name: fullName, email, company: companyName, type: 'regular', parking: false }]);
                                                      setColleagueSearch('');
                                                      setIntent('client');
                                                   }}
                                                >
                                                   <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">
                                                      <Mail size={12} />
                                                   </div>
                                                   <div className="flex-1">
                                                      <div className="text-sm font-medium text-purple-900">Invite external guest</div>
                                                      <div className="text-xs text-purple-600">{colleagueSearch}</div>
                                                   </div>
                                                   <Plus size={14} className="text-purple-400" />
                                                </div>
                                            )}

                                            {colleagues.filter((c: any) => c.name.toLowerCase().includes(colleagueSearch.toLowerCase()) && !invitedColleagues.includes(c.id)).length === 0 && !colleagueSearch.includes('@') && (
                                                <div className="p-3 text-center text-sm text-slate-500">No colleagues found</div>
                                            )}
                                         </div>
                                      )}
                                      
                                      {/* Quick Add Suggestions (if no search) */}
                                      {!colleagueSearch && (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                             {colleagues.filter((c: any) => !invitedColleagues.includes(c.id)).slice(0, 4).map((c: any) => (
                                                 <div 
                                                   key={c.id}
                                                   onClick={() => setInvitedColleagues([...invitedColleagues, c.id])}
                                                   className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-slate-200 hover:border-teal-200 hover:bg-teal-50/50 cursor-pointer transition-all group"
                                                >
                                                   <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white", c.id === 'c1' ? "bg-indigo-500" : c.id === 'c2' ? "bg-rose-500" : "bg-amber-500")}>
                                                      {c.avatar}
                                                   </div>
                                                   <span className="text-xs text-slate-600 group-hover:text-teal-700">{c.name}</span>
                                                   <Plus size={10} className="text-slate-300 group-hover:text-teal-500 opacity-0 group-hover:opacity-100" />
                                                </div>
                                             ))}
                                          </div>
                                      )}
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   <Label>Host (Book on behalf of)</Label>
                                   <Select value={host} onValueChange={setHost}>
                                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                         <SelectItem value="Me">Me (Myself)</SelectItem>
                                         {INITIAL_COLLEAGUES.map(c => (
                                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                         ))}
                                      </SelectContent>
                                   </Select>
                                </div>

                                {/* Visitor Registration Section (Shown if visitors exist) */}
                                {visitors.length > 0 && (
                                   <div className="border border-dashed border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/30">
                                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                                         <BadgeCheck size={18} className="text-teal-600" /> Visitor Registration
                                      </div>
                                      
                                      {/* Added Visitors List */}
                                      {visitors.length > 0 && (
                                          <div className="space-y-2">
                                             {visitors.map((v, idx) => (
                                                 <div key={idx} className="flex items-center justify-between bg-white/60 p-2 rounded border border-slate-100">
                                                     <div className="flex items-center gap-3">
                                                         <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                                                             {v.name.charAt(0)}
                                                         </div>
                                                         <div>
                                                             <div className="text-sm font-medium text-slate-900">{v.name}</div>
                                                             <div className="text-xs text-slate-500">{v.email} • {v.company}</div>
                                                         </div>
                                                     </div>
                                                     <div className="flex items-center gap-2">
                                                         <Select value={v.type || 'regular'} onValueChange={(val) => {
                                                             const newVisitors = [...visitors];
                                                             newVisitors[idx].type = val;
                                                             setVisitors(newVisitors);
                                                         }}>
                                                             <SelectTrigger className="h-7 w-[85px] text-[10px] px-2 bg-white border-slate-200">
                                                                 <SelectValue />
                                                             </SelectTrigger>
                                                             <SelectContent>
                                                                 <SelectItem value="regular">Regular</SelectItem>
                                                                 <SelectItem value="vip">VIP</SelectItem>
                                                                 <SelectItem value="vvip">VVIP</SelectItem>
                                                             </SelectContent>
                                                         </Select>

                                                         <Tooltip>
                                                             <TooltipTrigger asChild>
                                                                 <Button 
                                                                     variant="ghost" 
                                                                     size="icon" 
                                                                     className={cn("h-7 w-7", v.parking ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-slate-400 hover:text-blue-600 hover:bg-slate-100")}
                                                                     onClick={() => {
                                                                         const newVisitors = [...visitors];
                                                                         newVisitors[idx].parking = !newVisitors[idx].parking;
                                                                         setVisitors(newVisitors);
                                                                     }}
                                                                 >
                                                                     <Car size={14} />
                                                                 </Button>
                                                             </TooltipTrigger>
                                                             <TooltipContent>Parking Required</TooltipContent>
                                                         </Tooltip>

                                                         <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => setVisitors(visitors.filter((_, i) => i !== idx))}>
                                                             <X size={14} />
                                                         </Button>
                                                     </div>
                                                 </div>
                                             ))}
                                          </div>
                                      )}

                                      <div className="flex gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                                          <Info size={14} className="mt-0.5 flex-shrink-0"/>
                                          <p>Invitation emails have been queued. Guests will be asked to complete their registration profile (Name, Company, NDA) before arrival.</p>
                                      </div>
                                   </div>
                                )}

                                <div className="space-y-2">
                                   <div className="flex justify-between items-center">
                                      <Label>Agenda Items</Label>
                                      <Button 
                                         variant="outline" 
                                         size="sm" 
                                         className="h-6 text-xs text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-700 gap-1.5"
                                         onClick={generateAiAgenda}
                                         disabled={!title}
                                      >
                                         <Sparkles size={12} /> Auto-Generate
                                      </Button>
                                   </div>
                                   <div className="bg-white border border-slate-200 rounded-lg p-1 space-y-1">
                                      {agendaItems.map((item, i) => (
                                         <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                                            <span>{i+1}. {item}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => setAgendaItems(agendaItems.filter((_, idx) => idx !== i))}><X size={12}/></Button>
                                         </div>
                                      ))}
                                      <div className="flex items-center gap-2 p-1">
                                         <Input 
                                            placeholder="Add agenda item..." 
                                            className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-9"
                                            value={newAgendaItem}
                                            onChange={e => setNewAgendaItem(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addAgenda()}
                                         />
                                         <Button size="sm" variant="ghost" onClick={addAgenda} disabled={!newAgendaItem}><Plus size={16}/></Button>
                                      </div>
                                   </div>
                                </div>

                                <div 
                                  className={cn(
                                     "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                                     hasAttachments ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300 bg-slate-50"
                                  )}
                                  onClick={() => setHasAttachments(!hasAttachments)}
                                >
                                   <div className={cn("h-10 w-10 rounded-full flex items-center justify-center mb-2", hasAttachments ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-500")}>
                                      <Paperclip size={20} />
                                   </div>
                                   <p className="text-sm font-medium text-slate-900">
                                      {hasAttachments ? "1 File Attached" : "Attach Files"}
                                   </p>
                                </div>
                                   </div>
                                </div>
                             </ScrollArea>
                          </motion.div>
                       )}

                       {/* STEP 3: REVIEW */}
                       {step === 3 && (
                          <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6 max-w-3xl mx-auto">
                             <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 text-center">
                                <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-teal-900">Ready to Schedule</h3>
                                <p className="text-teal-700/80">Please review the details below before confirming.</p>
                             </div>

                             <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                                <div className="p-4 flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                      <CalendarIcon size={20} />
                                   </div>
                                   <div className="flex-1">
                                      <div className="text-xs font-semibold text-slate-400 uppercase">Event</div>
                                      <div className="font-medium text-slate-900">{title}</div>
                                      {visitors.length > 0 && <div className="text-xs text-purple-600 mt-1">Visitors: {visitors.map(v => v.name).join(', ')}</div>}
                                   </div>
                                   <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Edit</Button>
                                </div>
                                
                                <div className="p-4 flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                      <Clock size={20} />
                                   </div>
                                   <div className="flex-1">
                                      <div className="text-xs font-semibold text-slate-400 uppercase">Time</div>
                                      <div className="font-medium text-slate-900">{dateStr ? format(new Date(dateStr), "PPP") : initialDateStr}, {formatTimeValue(time)} - {formatTimeValue(time+duration)}</div>
                                      {recurrence && <div className="text-xs text-teal-600 mt-1 flex items-center gap-1"><RefreshCw size={10} /> {getRecurrenceSummary(recurrence)}</div>}
                                   </div>
                                   <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit</Button>
                                </div>

                                <div className="p-4 flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                      <MapPin size={20} />
                                   </div>
                                   <div className="flex-1">
                                      <div className="text-xs font-semibold text-slate-400 uppercase">Location</div>
                                      <div className="font-medium text-slate-900">{selectedRoom ? rooms.find(r => r.id === selectedRoom)?.name : 'Remote Meeting'}</div>
                                      {/* Services Summary */}
                                      {(services.catering || services.itSupport) && (
                                         <div className="flex gap-2 mt-1">
                                            {services.catering && <Badge variant="secondary" className="text-[9px] h-4 bg-orange-100 text-orange-700">Catering</Badge>}
                                            {services.itSupport && <Badge variant="secondary" className="text-[9px] h-4 bg-blue-100 text-blue-700">IT Support</Badge>}
                                         </div>
                                      )}
                                   </div>
                                   <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit</Button>
                                </div>
                             </div>
                          </motion.div>
                       )}

                    </AnimatePresence>
                 </div>
              </ScrollArea>
           </div>
        </div>

        {/* Footer Controls (Hidden on Step 0) */}
        {step > 0 && (
           <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center z-10">
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                 <ArrowLeft size={16}/> Back
              </Button>
              
              <Button 
                className={cn(
                   "px-8 gap-2 text-white transition-all",
                   step === 3 ? "bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200" : "bg-slate-900 hover:bg-slate-800"
                )} 
                onClick={handleConfirm}
              >
                 {step === 3 ? "Confirm Booking" : "Continue"} {step !== 3 && <ArrowRight size={16} />}
              </Button>
           </div>
        )}
      </motion.div>
    </div>
  );
};

export const CoreCalendar: React.FC = () => {
  const { calendarEvents, addCalendarEvent } = useEnterpriseContext();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [wizardTime, setWizardTime] = useState<number | undefined>(undefined);
  const [wizardDate, setWizardDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'personal' | 'rooms'>('personal');
  const [timeView, setTimeView] = useState<'day' | 'week'>('day');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, event: any } | null>(null);

  // AI Input
  const [nlpInput, setNlpInput] = useState('');
  const [aiPreFill, setAiPreFill] = useState<any>(null);
  const [parsedNlp, setParsedNlp] = useState<any>(null);

  // Quick Book State
  const [quickBookPos, setQuickBookPos] = useState<{ x: number, y: number, time: number, date: Date } | null>(null);

  // Find Time State
  const [showFindTime, setShowFindTime] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState<any[]>([]);
  
  // Conflict Solver State
  const [showConflictSolver, setShowConflictSolver] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);

  // Dynamic Data State
  const [events, setEvents] = useState<any[]>([]);
  const [roomSchedules, setRoomSchedules] = useState<any[]>([]);

  // Team State
  const [colleagues, setColleagues] = useState(INITIAL_COLLEAGUES);
  const [showAddColleague, setShowAddColleague] = useState(false);
  const [newColleagueName, setNewColleagueName] = useState('');

  // Current Time Line State
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    floors: [] as string[],
    capacity: 0,
    amenities: [] as string[],
    search: '',
    maxDistance: 500,
    showOnlyAvailable: false,
    teams: [] as string[]
  });
  
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

  // --- Date Logic ---
  const weekStart = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  // Combine local events with context events
  const displayEvents = useMemo(() => {
      const contextMapped = calendarEvents.map(evt => {
          const duration = (evt.end.getTime() - evt.start.getTime()) / (1000 * 60 * 60);
          const start = evt.start.getHours() + evt.start.getMinutes() / 60;
          return {
              id: evt.id, // Keep ID as string or number (context uses string)
              title: evt.title,
              type: evt.type === 'meeting' ? 'internal' : evt.type, // Map types
              start: start,
              duration: duration,
              date: evt.start,
              dateStr: format(evt.start, "PPP"),
              attendees: [],
              owner: 'Me', // Assuming context events are user's
              location: evt.location,
              room: evt.location
          };
      });
      return [...events, ...contextMapped];
  }, [events, calendarEvents]);

  // --- Effects ---

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input/textarea is focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      
      if (e.key === 'c' || e.key === 'C') {
        setWizardDate(currentDate);
        setWizardTime(9);
        setAiPreFill(null);
        setWizardOpen(true);
      }
      if (e.key === 't' || e.key === 'T') {
        setCurrentDate(new Date());
      }
      if (e.key === 'd' || e.key === 'D') {
        setTimeView('day');
      }
      if (e.key === 'w' || e.key === 'W') {
        setTimeView('week');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate]);

  // NLP Parsing Effect
  useEffect(() => {
     if (nlpInput.length > 3) {
        const result = parseNaturalLanguage(nlpInput);
        setParsedNlp(result);
     } else {
        setParsedNlp(null);
     }
  }, [nlpInput]);

  // 1. Update Current Time Line
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      // Only show if within view (8am - 6pm)
      if (currentHour >= 8 && currentHour <= 18) {
        const minutesFrom8am = (currentHour - 8) * 60 + currentMin;
        setCurrentTimePosition(minutesFrom8am);
      } else {
        setCurrentTimePosition(null);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // 2. Procedural Data Generation (including Team Events)
  useEffect(() => {
    const seed = weekStart.getTime(); 
    const newEvents: any[] = [];

    // Generate "My" events
    const titles = ['Product Sync', 'Client Review', 'Lunch Break', 'Dev Standup', 'Design Crit', 'Town Hall', 'Focus Time'];
    const types = ['internal', 'client', 'personal', 'internal', 'internal', 'company', 'personal'];
    
    weekDays.forEach((day, dayIdx) => {
       // Random number of events per day (1-3)
       const count = 1 + Math.floor((seed + dayIdx) % 3); 
       
       for(let i=0; i<count; i++) {
         const start = 9 + Math.floor(((seed * (i+1)) % 8));
         const duration = 1 + ((seed * (i+2)) % 2); // 1 or 2 hours
         
         if(!hasOverlap(newEvents.filter(e => isSameDay(e.date, day)), start, duration)) {
            newEvents.push({
               id: seed + dayIdx * 100 + i,
               title: titles[(dayIdx + i) % titles.length],
               type: types[(dayIdx + i) % types.length],
               start,
               duration,
               date: day,
               dateStr: `${DAYS[day.getDay()]} ${day.getDate()}`,
               attendees: ['SC', 'JD'],
               room: i % 2 === 0 ? 'Meeting Room A' : undefined,
               owner: 'Me'
            });
         }
       }
    });

    // Generate "Team" events for selected colleagues
    colleagues.filter(c => c.selected).forEach((colleague, cIdx) => {
       weekDays.forEach((day, dayIdx) => {
          // Deterministic random based on colleague ID and date
          const cSeed = seed + dayIdx + (cIdx + 1) * 500;
          const count = 1 + (cSeed % 3); 
          
          for(let i=0; i<count; i++) {
             const start = 8 + (cSeed * (i+1)) % 9;
             const duration = 1;
             
             // Only add if it doesn't overlap strongly with existing (simple check)
             newEvents.push({
                id: `team-${colleague.id}-${dayIdx}-${i}`,
                title: 'Busy',
                type: 'internal',
                start,
                duration,
                date: day,
                dateStr: `${DAYS[day.getDay()]} ${day.getDate()}`,
                owner: colleague.name,
                color: colleague.color,
                isTeam: true
             });
          }
       });
    });

    setEvents(newEvents);
    
    // Also regenerate room schedules for the "Rooms View"
    const newRoomSchedules = ROOMS.map(room => {
       const schedule = [];
       const count = Math.floor((seed + parseInt(room.id.split('-')[1])) % 4);
       for(let k=0; k<count; k++) {
         const start = 8 + ((seed + k) % 9);
         const isMe = Math.random() > 0.85;
         schedule.push({
            id: `rs-${room.id}-${k}`,
            title: isMe ? 'Product Sync' : 'Booked',
            start,
            duration: 1,
            user: isMe ? 'Me' : 'System',
            owner: isMe ? 'Me' : 'System',
            attendees: isMe ? ['Me'] : [],
            type: 'internal'
         });
       }
       return { ...room, schedule };
    });
    setRoomSchedules(newRoomSchedules);

  }, [weekStart, colleagues]); // Re-run when week OR selected colleagues change

  // --- Actions ---

  const handleContextAction = (action: string) => {
     if (!contextMenu) return;
     const { event } = contextMenu;
     
     if (action === 'delete') {
        handleDeleteEvent(event.id);
     } else if (action === 'duplicate') {
        const newEvent = { ...event, id: Date.now(), start: Math.min(17, event.start + 1) };
        setEvents(prev => [...prev, newEvent]);
        toast.success("Event duplicated");
     } else if (action === 'join') {
        toast.success("Joining meeting...");
     } else if (action.startsWith('color-')) {
        const colorMap: any = {
           'color-blue': 'bg-blue-50 border-blue-500 text-blue-700',
           'color-purple': 'bg-purple-50 border-purple-500 text-purple-700',
           'color-amber': 'bg-amber-50 border-amber-500 text-amber-700',
           'color-rose': 'bg-rose-50 border-rose-500 text-rose-700',
        };
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, color: colorMap[action] } : e));
        toast.success("Color updated");
     } else if (action === 'email') {
        toast.success("Email client opened");
     }
     setContextMenu(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const days = timeView === 'week' ? 7 : 1;
    setCurrentDate(addDays(currentDate, direction === 'next' ? days : -days));
  };

  const handleEventMove = (id: number, newStart: number) => {
    // Find the event being moved
    const event = displayEvents.find(e => e.id === id); // Use displayEvents
    if (!event) return;

    // Check for conflicts
    const hasConflict = displayEvents.some(e => 
       e.id !== id && 
       isSameDay(e.date, event.date) && 
       (newStart < e.start + e.duration) && (newStart + event.duration > e.start)
    );

    if (hasConflict) {
       // Trigger AI Conflict Solver
       setConflictData({
          event,
          targetStart: newStart,
          alternative: newStart + 1 // Simple mock alternative
       });
       setShowConflictSolver(true);
       return;
    }

    setEvents(prev => prev.map(e => e.id === id ? { ...e, start: newStart } : e));
    toast.success("Event rescheduled");
  };

  const handleEventResize = (id: number, newDuration: number) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, duration: newDuration } : e));
    toast.success("Duration updated");
  };

  const handleGridClick = (time: number, date: Date, event: React.MouseEvent) => {
    // Get click coordinates for popover
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setQuickBookPos({
       x: rect.left + window.scrollX,
       y: rect.top + window.scrollY,
       time,
       date
    });
  };

  // New: Handle clicking on Room Gantt empty space
  const handleRoomGridClick = (room: any, time: number) => {
     setAiPreFill({
        title: "New Event",
        intent: "meeting",
        room: room.id,
        time: time,
        date: currentDate
     });
     setWizardTime(time);
     setWizardDate(currentDate);
     setWizardOpen(true);
  };

  const handleSaveEvent = (newEvent: any) => {
     // Save to Context for global access
     const startHour = newEvent.start;
     const duration = newEvent.duration;
     const date = quickBookPos?.date || wizardDate;
     
     // Construct Date objects
     const startDate = new Date(date);
     startDate.setHours(Math.floor(startHour), Math.round((startHour % 1) * 60));
     
     const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

     addCalendarEvent({
         title: newEvent.title,
         start: startDate,
         end: endDate,
         location: newEvent.room || 'Remote',
         attendees: (newEvent.attendees?.length || 0) + (newEvent.visitors?.length || 0),
         type: newEvent.type === 'internal' ? 'meeting' : newEvent.type
     });

     // Keep local state logic for immediate feedback if needed, 
     // but context should handle it.
     // For mock purposes, we also add to local state to support the "drag and drop" features which rely on `setEvents`
     const id = Date.now();
     const evt = {
        ...newEvent,
        id,
        date: date, 
        dateStr: `${DAYS[date.getDay()]} ${date.getDate()}`,
     };
     
     setEvents(prev => [...prev, evt]);
     toast.success("Booking Confirmed!");
  };
  
  const handleDeleteEvent = (id: number) => {
     setEvents(prev => prev.filter(e => e.id !== id));
     toast.success("Event deleted");
  };

  const toggleColleague = (id: string) => {
    setColleagues(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const addColleague = () => {
    if (newColleagueName.trim()) {
      const colors = ['bg-pink-100 border-pink-300 text-pink-700', 'bg-cyan-100 border-cyan-300 text-cyan-700', 'bg-lime-100 border-lime-300 text-lime-700'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      setColleagues(prev => [...prev, {
        id: `c-${Date.now()}`,
        name: newColleagueName,
        avatar: newColleagueName.substring(0, 2).toUpperCase(),
        status: 'offline',
        selected: true,
        color: randomColor
      }]);
      setNewColleagueName('');
      setShowAddColleague(false);
      toast.success(`${newColleagueName} added to team view`);
    }
  };

  const handleAiPlan = () => {
     if(!nlpInput.trim()) {
        setWizardDate(new Date()); 
        setWizardTime(9); 
        setAiPreFill(null);
        setWizardOpen(true);
        return;
     }

     const parsed = parseNaturalLanguage(nlpInput);
     setAiPreFill(parsed);
     setWizardDate(parsed.date);
     setWizardTime(parsed.time);
     setWizardOpen(true);
     setNlpInput('');
     toast.success("AI suggestions ready");
  };

  const handleOptimize = () => {
     toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
           loading: 'AI is analyzing your schedule...',
           success: 'Schedule Optimized! 2 hours of deep work created.',
           error: 'Failed to optimize'
        }
     );
     // Mock optimization: Move morning meetings to afternoon
     // This is just a visual simulation
     setTimeout(() => {
        setEvents(prev => prev.map(e => {
           if (e.owner === 'Me' && e.start < 12) {
              return { ...e, start: e.start + 4 }; // Shift to afternoon
           }
           return e;
        }));
     }, 1500);
  };

  // New: Find Common Time Logic
  const findCommonTime = () => {
     const selectedPeers = colleagues.filter(c => c.selected);
     if(selectedPeers.length === 0) {
        toast.error("Select at least one colleague");
        return;
     }

     const candidates: any[] = [];
     
     // Scan next 3 days
     for(let d=0; d<3; d++) {
        const scanDate = addDays(weekStart, d + (new Date().getDay() - 1)); // Align with view
        
        for(let h=9; h<=17; h++) { // 9am-5pm
           // Check if anyone is busy
           const isBlocked = events.some(e => 
              isSameDay(e.date, scanDate) && 
              (e.start < h + 1) && (e.start + e.duration > h) && // overlap logic
              (e.owner === 'Me' || selectedPeers.some(p => p.name === e.owner))
           );

           if(!isBlocked) {
              candidates.push({
                 date: scanDate,
                 time: h,
                 score: Math.random() // Mock score for "better" times
              });
           }
        }
     }

     const top3 = candidates.sort((a,b) => b.score - a.score).slice(0,3);
     setSuggestedSlots(top3);
     setShowFindTime(true);
  };

  // Filter Logic - MUST be before early return so filteredRooms is available
  const filteredRooms = useMemo(() => {
    const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
    
    return roomSchedules.filter(r => {
      // Text search
      if (filters.search && !r.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !r.type?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      // Floor filter
      if (filters.floors.length && !filters.floors.includes(r.floor)) return false;
      
      // Capacity filter
      if (r.capacity < filters.capacity) return false;
      
      // Amenities filter
      if (filters.amenities.length && !filters.amenities.every(a => r.features.includes(a))) return false;
      
      // Distance filter
      if (r.distance && r.distance > filters.maxDistance) return false;
      
      // Availability filter
      if (filters.showOnlyAvailable) {
        const hasConflict = r.schedule && r.schedule.some((s: any) => 
          (currentHour < s.start + s.duration) && (currentHour + 1 > s.start)
        );
        if (hasConflict) return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by availability first, then by capacity match, then by distance
      const aAvailable = !a.schedule?.some((s: any) => 
        (currentHour < s.start + s.duration) && (currentHour + 1 > s.start)
      );
      const bAvailable = !b.schedule?.some((s: any) => 
        (currentHour < s.start + s.duration) && (currentHour + 1 > s.start)
      );
      
      if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;
      
      const aCapDiff = Math.abs(a.capacity - (filters.capacity || 4));
      const bCapDiff = Math.abs(b.capacity - (filters.capacity || 4));
      if (aCapDiff !== bCapDiff) return aCapDiff - bCapDiff;
      
      return (a.distance || 0) - (b.distance || 0);
    });
  }, [roomSchedules, filters]);
  
  // EARLY RETURN: Render new enterprise timeline if in rooms mode
  // if (forceNewTimeline && viewMode === 'rooms') {
  //    console.log('⚡ EARLY RETURN - Rendering new timeline!');
  //    return renderRoomsView();
  // }

  // Active Meeting Detection
  const activeEvent = events.find(e => {
     const now = new Date();
     const currentHour = now.getHours() + now.getMinutes() / 60;
     return isSameDay(e.date, now) && e.owner === 'Me' && (currentHour >= e.start - 0.25 && currentHour < e.start + e.duration);
  });

  return (
    <div className="flex h-full bg-white font-sans relative overflow-hidden">
      <TooltipProvider>
        {/* Context Menu */}
        <AnimatePresence>
           {contextMenu && (
              <>
                 <div className="fixed inset-0 z-50 bg-transparent" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }} />
                 <ContextMenu 
                    position={contextMenu} 
                    onClose={() => setContextMenu(null)} 
                    onAction={handleContextAction} 
                 />
              </>
           )}
        </AnimatePresence>

        {/* Quick Book Popover */}
        <AnimatePresence>
           {quickBookPos && (
              <>
                 <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setQuickBookPos(null)} />
                 <QuickBookPopover 
                    position={quickBookPos} 
                    onClose={() => setQuickBookPos(null)}
                    onSave={handleSaveEvent}
                    onExpand={(data) => {
                       setWizardTime(data?.time || quickBookPos.time);
                       setWizardDate(quickBookPos.date);
                       setAiPreFill({
                          time: data?.time || quickBookPos.time,
                          date: quickBookPos.date,
                          title: data?.title,
                          intent: data?.intent,
                          room: data?.room
                       });
                       setQuickBookPos(null);
                       setWizardOpen(true);
                    }}
                 />
              </>
           )}
        </AnimatePresence>

        <AnimatePresence>
          {isWizardOpen && (
             <WizardOverlay 
               isOpen={isWizardOpen} 
               onClose={() => { setWizardOpen(false); setWizardTime(undefined); setAiPreFill(null); }} 
               onSave={handleSaveEvent}
               initialData={aiPreFill}
               initialTime={wizardTime} 
               initialDateStr={wizardDate.toLocaleDateString()} 
               rooms={roomSchedules}
               colleagues={colleagues}
             />
          )}
        </AnimatePresence>

        {/* Find Time Dialog */}
        <Dialog open={showFindTime} onOpenChange={setShowFindTime}>
           <DialogContent>
              <DialogHeader>
                 <DialogTitle>Suggested Meeting Times</DialogTitle>
                 <DialogDescription>
                    Based on your team's availability, these slots work best.
                 </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                 {suggestedSlots.map((slot, i) => (
                    <button 
                       key={i}
                       onClick={() => {
                          setWizardDate(slot.date);
                          setWizardTime(slot.time);
                          setAiPreFill({ title: "Team Sync", intent: "meeting" });
                          setShowFindTime(false);
                          setWizardOpen(true);
                       }}
                       className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all group"
                    >
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                             {slot.time}
                          </div>
                          <div className="text-left">
                             <div className="font-semibold text-slate-900">{DAYS[slot.date.getDay()]} {slot.date.getDate()}</div>
                             <div className="text-xs text-slate-500">1 Hour • All attendees available</div>
                          </div>
                       </div>
                       <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-600" />
                    </button>
                 ))}
              </div>
           </DialogContent>
        </Dialog>

        {/* Conflict Solver Dialog */}
        <Dialog open={showConflictSolver} onOpenChange={setShowConflictSolver}>
           <DialogContent>
              <DialogHeader>
                 <DialogTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle size={20} /> Scheduling Conflict Detected
                 </DialogTitle>
                 <DialogDescription>
                    That time slot is already booked. AI recommends:
                 </DialogDescription>
              </DialogHeader>
              
              {conflictData && (
                 <div className="py-4 space-y-4">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                       <div className="text-sm text-amber-800 font-medium">
                          Move "{conflictData.event.title}" to {conflictData.alternative}:00?
                       </div>
                       <div className="text-xs text-amber-600 mt-1">
                          This slot is free for all attendees.
                       </div>
                    </div>
                 </div>
              )}

              <DialogFooter>
                 <Button variant="outline" onClick={() => setShowConflictSolver(false)}>Cancel</Button>
                 <Button 
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => {
                       setEvents(prev => prev.map(e => e.id === conflictData.event.id ? { ...e, start: conflictData.alternative } : e));
                       setShowConflictSolver(false);
                       toast.success("Resolved with AI suggestion");
                    }}
                 >
                    Accept Suggestion
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

        <EventDetailSheet 
          event={selectedEvent} 
          isOpen={!!selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onDelete={handleDeleteEvent}
        />

        {/* Sidebar */}
        {viewMode === 'personal' && (
        <div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col flex-shrink-0 overflow-hidden h-screen">


          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pb-24">
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                {/* Mini Calendar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  {/* Weather Widget (Mock) */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="text-3xl">⛅</div>
                        <div>
                           <div className="text-sm font-bold text-slate-900">16°C</div>
                           <div className="text-xs text-slate-500">Partly Cloudy</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Dubai</div>
                        <div className="text-xs text-slate-600">H: 18° L: 14°</div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm text-slate-900">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(addDays(currentDate, -30))}><ChevronLeft size={12}/></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(addDays(currentDate, 30))}><ChevronRight size={12}/></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                     {DAYS.map(d => <span key={d}>{d.substring(0,1)}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {Array.from({length: 30}, (_, i) => {
                       const dayNum = i + 1;
                       const d = new Date(currentDate);
                       d.setDate(dayNum);
                       const isSelected = isSameDay(d, currentDate);
                       const isToday = isSameDay(d, new Date());

                       return (
                        <button 
                          key={i} 
                          onClick={() => setCurrentDate(d)}
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center transition-colors relative",
                            isSelected ? "bg-teal-600 text-white font-bold hover:bg-teal-700" : "text-slate-700 hover:bg-slate-100",
                            isToday && !isSelected && "text-teal-600 font-bold bg-teal-50"
                          )}
                        >
                          {dayNum}
                          {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-600" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Smart Actions */}
                <div className="grid grid-cols-2 gap-2">
                   <Button 
                      variant="outline" 
                      className="w-full bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 text-slate-600 border-slate-200 text-xs h-auto py-2 flex-col gap-1"
                      onClick={handleOptimize}
                   >
                      <Wand2 size={16} className="text-amber-500 mb-1" /> 
                      <span>Optimize Day</span>
                   </Button>
                   <Button 
                      variant="outline" 
                      disabled={colleagues.filter(c => c.selected).length === 0}
                      className="w-full bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-600 border-slate-200 text-xs h-auto py-2 flex-col gap-1 disabled:opacity-50"
                      onClick={findCommonTime}
                   >
                      <Users size={16} className="text-indigo-500 mb-1" /> 
                      <span>Find Team Time</span>
                   </Button>
                </div>

                {/* Colleagues Filter */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Team Schedules</h3>
                     <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddColleague(!showAddColleague)}>
                           <UserPlus size={14} className="text-slate-400 hover:text-teal-600" />
                        </Button>
                     </div>
                  </div>
                  
                  {showAddColleague && (
                     <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2">
                        <Input 
                           placeholder="Name..." 
                           className="h-8 text-xs" 
                           value={newColleagueName}
                           onChange={(e) => setNewColleagueName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && addColleague()}
                        />
                        <Button size="sm" className="h-8 w-8 p-0 bg-teal-600 hover:bg-teal-700" onClick={addColleague}><Plus size={14}/></Button>
                     </div>
                  )}

                  <div className="space-y-2">
                     {colleagues.map(colleague => (
                        <div 
                           key={colleague.id} 
                           className={cn(
                              "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                              colleague.selected ? "bg-white border-slate-200 shadow-sm" : "bg-transparent border-transparent hover:bg-slate-50 opacity-60"
                           )}
                           onClick={() => toggleColleague(colleague.id)}
                        >
                           <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border", colleague.color)}>
                              {colleague.avatar}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-900 truncate">{colleague.name}</div>
                              <div className="flex items-center gap-1.5">
                                 <div className={cn("h-1.5 w-1.5 rounded-full", 
                                    colleague.status === 'online' ? "bg-emerald-500" : 
                                    colleague.status === 'busy' ? "bg-rose-500" : "bg-slate-300"
                                 )} />
                                 <span className="text-[10px] text-slate-500 capitalize">{colleague.status}</span>
                              </div>
                           </div>
                           {colleague.selected && <CheckCircle2 size={14} className="text-teal-600" />}
                        </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Main Calendar Grid */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden">
           {/* Header */}
           <div className="h-16 border-b border-slate-200 bg-white flex justify-between items-center px-6 flex-shrink-0">
              <div className="flex items-center gap-4">
                 <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {viewMode === 'personal' ? "My Calendar" : "Room Overview"}
                 </h1>
                 <div className="flex bg-slate-100 rounded-lg p-1">
                    <button 
                       onClick={() => setViewMode('personal')}
                       className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", viewMode === 'personal' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                       Personal
                    </button>
                    <button 
                       onClick={() => setViewMode('rooms')}
                       className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", viewMode === 'rooms' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                       Rooms
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="flex bg-slate-100 rounded-lg p-1">
                    <button 
                       onClick={() => setTimeView('day')}
                       className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", timeView === 'day' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                       Day
                    </button>
                    <button 
                       onClick={() => setTimeView('week')}
                       className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", timeView === 'week' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                       Week
                    </button>
                 </div>
                 <Separator orientation="vertical" className="h-6" />
                 <Button 
                    onClick={() => {
                       setAiPreFill(null);
                       setWizardDate(currentDate);
                       setWizardTime(9);
                       setWizardOpen(true);
                    }} 
                    className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-lg shadow-slate-200"
                 >
                    <Plus size={16} /> New Event
                 </Button>
              </div>
           </div>

           {/* Calendar Grid */}
           <div className="flex-1 overflow-hidden relative">
              {viewMode === 'personal' ? (
              <ScrollArea className="h-full">
                 <div className="min-w-[800px] p-6 pb-20 h-full">
                    <div className="flex flex-col h-full">
                       {/* Day Headers (Sticky Top) */}
                          <div className="flex ml-16 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur z-40">
                             {(timeView === 'day' ? [currentDate] : weekDays).map((day, i) => {
                                const isToday = isSameDay(day, new Date());
                                return (
                                   <div key={i} className="flex-1 text-center py-2 border-r border-slate-100 last:border-0">
                                      <div className={cn("text-xs font-bold", isToday ? "text-teal-600" : "text-slate-500")}>
                                         {DAYS[day.getDay()].substring(0,3)}
                                      </div>
                                      <div className={cn("text-lg font-bold leading-none", isToday ? "text-teal-600" : "text-slate-900")}>
                                         {day.getDate()}
                                      </div>
                                   </div>
                                );
                             })}
                          </div>

                          <div className="flex flex-1 relative min-h-[660px]"> {/* 11 hours * 60px */}
                             {/* Time Axis (Left Sticky) */}
                             <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50 sticky left-0 z-30">
                                {hours.map(h => (
                                   <div key={h} className="h-[60px] relative">
                                      <span className="absolute -top-2 right-2 text-xs text-slate-400 font-medium">{h}:00</span>
                                   </div>
                                ))}
                             </div>

                             {/* Grid Columns */}
                             <div className="flex-1 flex relative">
                                {/* Background Grid Lines */}
                                <div className="absolute inset-0 pointer-events-none z-0">
                                   {hours.map((_, idx) => (
                                      <div key={idx} className="h-[60px] border-b border-slate-100 w-full relative">
                                         <div className="absolute top-[30px] left-0 right-0 border-b border-slate-50 w-full" />
                                      </div>
                                   ))}
                                </div>

                                {/* Current Time Indicator (Horizontal Line) */}
                                {currentTimePosition && (
                                   <div 
                                      className="absolute left-0 right-0 h-px bg-red-500 z-20 pointer-events-none flex items-center"
                                      style={{ top: `${currentTimePosition}px` }} 
                                   >
                                      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
                                   </div>
                                )}

                                {/* Day Columns */}
                                {(timeView === 'day' ? [currentDate] : weekDays).map((day, i) => {
                                   const dayEvents = events.filter(e => isSameDay(e.date, day));
                                   return (
                                      <div 
                                         key={i} 
                                         className="flex-1 relative border-r border-slate-100 last:border-0 group min-w-[150px]"
                                         onClick={(e) => {
                                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                            const y = e.clientY - rect.top;
                                            const hourIndex = Math.floor(y / 60);
                                            handleGridClick(8 + hourIndex, day, e);
                                         }}
                                      >
                                         {dayEvents.map(event => (
                                            <EventCard 
                                               key={event.id} 
                                               event={event}
                                               onClick={() => setSelectedEvent(event)}
                                               onContextMenu={(e, evt) => {
                                                  setContextMenu({ x: e.clientX, y: e.clientY, event: evt });
                                               }}
                                               onDragEnd={handleEventMove}
                                               onResizeEnd={handleEventResize}
                                            />
                                         ))}
                                      </div>
                                   );
                                })}
                             </div>
                          </div>
                       </div>
                    </div>
              </ScrollArea>
              ) : (
                 <RoomsTimelineView 
                    filteredRooms={filteredRooms}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    handleRoomGridClick={(id, hour) => handleRoomGridClick({id}, hour)}
                 />
              )}
           </div>
        </div>
      </TooltipProvider>
    </div>
  );
};