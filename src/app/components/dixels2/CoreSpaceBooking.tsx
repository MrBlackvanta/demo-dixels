import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Filter, 
  MapPin, 
  MoreHorizontal, 
  CheckCircle2, 
  X,
  Plus,
  LayoutGrid, 
  List as ListIcon,
  Info,
  BarChart3,
  AlertTriangle,
  History,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GanttChartSquare,
  Armchair,
  Monitor,
  Wifi,
  Video,
  Coffee,
  Trash2,
  Lock,
  Unlock,
  Eye,
  RefreshCcw,
  Download,
  FileText,
  TrendingUp,
  PieChart,
  Edit,
  Sparkles,
  Zap,
  ArrowUpRight,
  Repeat,
  Mail,
  Bell,
  FilterX,
  LogIn,
  LogOut,
  Wand2,
  Layers,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CalendarDays,
  UserCheck,
  Check,
  XCircle,
  FileClock,
  ArrowRight
} from 'lucide-react';
import { 
  format, 
  addDays, 
  subDays, 
  isSameDay, 
  addWeeks, 
  isAfter, 
  setHours, 
  setMinutes, 
  addMinutes, 
  isWithinInterval, 
  startOfDay, 
  isBefore, 
  differenceInMinutes, 
  parse,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWithinInterval as dateIsWithinInterval
} from 'date-fns';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from '../ui/context-menu';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';

// --- Types ---

type ViewMode = 'timeline' | 'grid' | 'weekly';
type BookingType = 'standard' | 'maintenance' | 'internal-block' | 'cleaning' | 'vip';
type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
type BookingStatus = 'confirmed' | 'cancelled' | 'pending' | 'checked-in' | 'completed' | 'rejected';

interface Space {
  id: string;
  name: string;
  type: 'Meeting Room' | 'Desk' | 'Huddle' | 'Phone Booth' | 'Training';
  capacity: number;
  floor: string;
  image: string;
  amenities: string[];
  status: 'available' | 'booked' | 'maintenance' | 'cleaning';
  utilization: number;
  lastCleaned?: string;
  requiresApproval?: boolean;
}

interface Booking {
  id: string;
  spaceId: string;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  title: string;
  type: BookingType;
  organizer: string;
  attendees: number;
  status: BookingStatus;
  recurrence?: RecurrenceType;
  checkInTime?: string;
  seriesId?: string;
  approvedBy?: string;
  rejectionReason?: string;
  requestDate?: Date;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  bookingId?: string;
}

// --- Mock Data ---

const AMENITIES_LIST = ['Video Conf', 'Whiteboard', 'Coffee', 'TV', 'HDMI', 'Monitor', 'Projector', 'Soundproof', 'Private', 'Catering'];

const DEFAULT_SPACES: Space[] = [
  { id: 's1', name: 'Boardroom Alpha', type: 'Meeting Room', capacity: 12, floor: 'Level 3', image: 'https://images.unsplash.com/photo-1660935159733-ace8237cc4a2?q=80&w=400', amenities: ['Video Conf', 'Whiteboard', 'Coffee'], status: 'available', utilization: 78, lastCleaned: '2 hours ago', requiresApproval: true },
  { id: 's2', name: 'Huddle West', type: 'Huddle', capacity: 4, floor: 'Level 3', image: 'https://images.unsplash.com/photo-1692133226337-55e513450a32?q=80&w=400', amenities: ['TV', 'HDMI'], status: 'booked', utilization: 45, lastCleaned: 'Yesterday' },
  { id: 's3', name: 'Hot Desk 304-A', type: 'Desk', capacity: 1, floor: 'Level 3', image: 'https://images.unsplash.com/photo-1761818645915-260598d569a7?q=80&w=400', amenities: ['Monitor'], status: 'maintenance', utilization: 12, lastCleaned: '3 days ago' },
  { id: 's4', name: 'Hot Desk 304-B', type: 'Desk', capacity: 1, floor: 'Level 3', image: 'https://images.unsplash.com/photo-1761818645915-260598d569a7?q=80&w=400', amenities: ['Monitor'], status: 'available', utilization: 30, lastCleaned: '5 hours ago' },
  { id: 's5', name: 'Innovation Lab', type: 'Training', capacity: 30, floor: 'Level 2', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400', amenities: ['Projector', 'Whiteboard'], status: 'available', utilization: 92, lastCleaned: '1 hour ago', requiresApproval: true },
  { id: 's6', name: 'Focus Pod 1', type: 'Phone Booth', capacity: 1, floor: 'Level 3', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400', amenities: ['Soundproof'], status: 'available', utilization: 65, lastCleaned: 'Today' },
  { id: 's7', name: 'Executive Suite', type: 'Meeting Room', capacity: 8, floor: 'Level 4', image: 'https://images.unsplash.com/photo-1503423594390-861a64f5d723?q=80&w=400', amenities: ['Private', 'Catering'], status: 'available', utilization: 15, lastCleaned: 'Yesterday', requiresApproval: true },
];

const DEFAULT_BOOKINGS: Booking[] = [
  { id: 'b1', spaceId: 's1', date: new Date(), startTime: '09:00', endTime: '10:30', title: 'Q4 Strategy', type: 'standard', organizer: 'Sarah Chen', attendees: 8, status: 'checked-in', checkInTime: '08:55', seriesId: 'ser-1', recurrence: 'weekly', requestDate: subDays(new Date(), 2) },
  { id: 'b2', spaceId: 's1', date: new Date(), startTime: '13:00', endTime: '14:00', title: 'Client Sync', type: 'standard', organizer: 'Mike Ross', attendees: 4, status: 'confirmed', requestDate: subDays(new Date(), 1) },
  { id: 'b3', spaceId: 's2', date: new Date(), startTime: '10:00', endTime: '12:00', title: 'Design Review', type: 'standard', organizer: 'Jessica Pearson', attendees: 3, status: 'confirmed', requestDate: new Date() },
  { id: 'b4', spaceId: 's3', date: new Date(), startTime: '08:00', endTime: '18:00', title: 'Maintenance: Monitor Repair', type: 'maintenance', organizer: 'Sys Admin', attendees: 0, status: 'confirmed', requestDate: subDays(new Date(), 5) },
  { id: 'b5', spaceId: 's5', date: new Date(), startTime: '09:00', endTime: '17:00', title: 'Onboarding Workshop', type: 'standard', organizer: 'HR', attendees: 25, status: 'pending', requestDate: new Date() },
  { id: 'b6', spaceId: 's7', date: new Date(), startTime: '11:00', endTime: '13:00', title: 'Board Lunch', type: 'vip', organizer: 'CEO Office', attendees: 6, status: 'pending', requestDate: new Date() },
];

const HISTORY_LOGS: LogEntry[] = [
  { id: 'l1', timestamp: new Date(new Date().setHours(10, 42)), action: 'Booking Created', user: 'Sarah Chen', details: 'Booked Boardroom Alpha for Q4 Strategy', status: 'success' },
  { id: 'l2', timestamp: new Date(new Date().setHours(9, 15)), action: 'Space Maintenance', user: 'Admin System', details: 'Hot Desk 304-A marked for repair', status: 'warning' },
  { id: 'l3', timestamp: subDays(new Date(), 1), action: 'Auto-Cancellation', user: 'System', details: 'No check-in detected for Focus Pod 1', status: 'success' },
  { id: 'l4', timestamp: subDays(new Date(), 1), action: 'Booking Updated', user: 'Mike Ross', details: 'Extended Innovation Lab by 30 mins', status: 'success' },
  { id: 'l5', timestamp: subDays(new Date(), 22), action: 'Failed Check-in', user: 'Guest User', details: 'Invalid credentials at Huddle West', status: 'error' },
];

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); 

// --- Helpers ---

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const getBookingPosition = (start: string, end: string, zoomLevel = 2, startHour = 8) => {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const dayStartMin = startHour * 60;
  const pxPerMin = zoomLevel; 
  const left = (startMin - dayStartMin) * pxPerMin;
  const width = (endMin - startMin) * pxPerMin;
  return { left, width };
};

const getVerticalBookingPosition = (start: string, end: string, startHour = 8) => {
   const startMin = timeToMinutes(start);
   const endMin = timeToMinutes(end);
   const dayStartMin = startHour * 60;
   const pxPerMin = 1.5; 
   const top = (startMin - dayStartMin) * pxPerMin;
   const height = (endMin - startMin) * pxPerMin;
   return { top, height };
};

const getBookingColor = (type: BookingType, status: BookingStatus) => {
  if (status === 'checked-in') return 'bg-green-100 border-green-300 text-green-800';
  if (status === 'cancelled') return 'bg-slate-100 border-slate-200 text-slate-400 decoration-line-through';
  if (status === 'pending') return 'bg-amber-100 border-amber-300 text-amber-800 border-dashed';
  if (status === 'rejected') return 'bg-red-50 border-red-200 text-red-400 opacity-60 decoration-line-through';
  
  switch (type) {
    case 'maintenance': return 'bg-red-100 border-red-300 text-red-800 striped-bg-red';
    case 'internal-block': return 'bg-slate-200 border-slate-400 text-slate-700';
    case 'cleaning': return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'vip': return 'bg-purple-100 border-purple-300 text-purple-800';
    default: return 'bg-teal-100 border-teal-300 text-teal-800';
  }
};

const checkOverlap = (newStart: string, newEnd: string, existingStart: string, existingEnd: string) => {
  const nStart = timeToMinutes(newStart);
  const nEnd = timeToMinutes(newEnd);
  const eStart = timeToMinutes(existingStart);
  const eEnd = timeToMinutes(existingEnd);
  return nStart < eEnd && nEnd > eStart;
};

// --- Components ---

const ApprovalsView: React.FC<{ 
   bookings: Booking[], 
   spaces: Space[],
   onApprove: (id: string) => void,
   onReject: (id: string) => void 
}> = ({ bookings, spaces, onApprove, onReject }) => {
   const pendingBookings = bookings.filter(b => b.status === 'pending');

   return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="text-amber-500" />
                  Pending Approvals
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
                     {pendingBookings.length} Requests
                  </Badge>
               </CardTitle>
               <CardDescription>
                  Review and authorize restricted space access requests.
               </CardDescription>
            </CardHeader>
            <CardContent>
               {pendingBookings.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                     <CheckCircle2 size={48} className="mx-auto mb-3 text-green-500 opacity-50" />
                     <p>All caught up! No pending requests.</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {pendingBookings.map(booking => {
                        const space = spaces.find(s => s.id === booking.spaceId);
                        return (
                           <div key={booking.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow gap-4">
                              <div className="flex items-start gap-4">
                                 <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">
                                    {booking.organizer.charAt(0)}
                                 </div>
                                 <div>
                                    <h4 className="font-semibold text-sm">{booking.title}</h4>
                                    <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                                       <span className="flex items-center gap-1"><Users size={12} /> {booking.organizer}</span>
                                       <span className="hidden sm:inline">•</span>
                                       <span className="flex items-center gap-1"><MapPin size={12} /> {space?.name}</span>
                                       <span className="hidden sm:inline">•</span>
                                       <span className="flex items-center gap-1"><CalendarIcon size={12} /> {format(booking.date, 'MMM d')}</span>
                                       <span className="hidden sm:inline">•</span>
                                       <span className="flex items-center gap-1"><Clock size={12} /> {booking.startTime} - {booking.endTime}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-slate-400">
                                       Requested on {booking.requestDate ? format(booking.requestDate, 'MMM d, yyyy HH:mm') : 'N/A'}
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2 w-full md:w-auto">
                                 <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1 md:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => onReject(booking.id)}
                                 >
                                    <XCircle size={14} className="mr-2" /> Reject
                                 </Button>
                                 <Button 
                                    size="sm" 
                                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => onApprove(booking.id)}
                                 >
                                    <Check size={14} className="mr-2" /> Approve
                                 </Button>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
};

const InsightsView: React.FC<{ bookings: Booking[], spaces: Space[] }> = ({ bookings, spaces }) => {
  const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({ from: subDays(new Date(), 6), to: new Date() });
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('all'); // specific space or 'all'

  const filteredData = useMemo(() => {
     if (!dateRange.from || !dateRange.to) return { activeBookings: [], daysInRange: 1 };

     const start = startOfDay(dateRange.from);
     const end = new Date(dateRange.to);
     end.setHours(23, 59, 59, 999);

     const daysInRange = Math.max(1, differenceInMinutes(end, start) / 1440); // Approx days

     const filtered = bookings.filter(b => {
        // Space Filter
        if (selectedSpaceId !== 'all' && b.spaceId !== selectedSpaceId) return false;
        
        // Status Filter
        if (b.status === 'cancelled' || b.status === 'rejected') return false;

        // Date Filter
        return isWithinInterval(b.date, { start, end });
     });

     return { activeBookings: filtered, daysInRange };
  }, [bookings, dateRange, selectedSpaceId]);

  const stats = useMemo(() => {
    const { activeBookings, daysInRange } = filteredData;
    const activeSpaceCount = selectedSpaceId === 'all' ? spaces.length : 1;
    
    // Utilization
    const totalMinutesBooked = activeBookings.reduce((acc, b) => {
       const duration = timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
       return acc + duration;
    }, 0);
    
    // Capacity: spaces * 10 hours * 60 mins * days
    const totalAvailableMinutes = activeSpaceCount * 10 * 60 * Math.ceil(daysInRange); 
    const utilization = Math.round((totalMinutesBooked / totalAvailableMinutes) * 100) || 0;
    
    // Ghost Bookings
    const now = new Date();
    const ghostBookings = activeBookings.filter(b => {
       if (b.status !== 'confirmed') return false;
       // Only count past bookings
       if (isBefore(b.date, startOfDay(now))) return true;
       if (isSameDay(b.date, now)) {
          const nowMin = now.getHours() * 60 + now.getMinutes();
          const startMin = timeToMinutes(b.startTime);
          return startMin < nowMin;
       }
       return false;
    }).length;

    // Type Distribution
    const typeCounts: Record<string, number> = {};
    activeBookings.forEach(b => {
       const type = b.type === 'standard' ? 'Meeting' : b.type.charAt(0).toUpperCase() + b.type.slice(1);
       typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const typeData = Object.entries(typeCounts).map(([name, value]) => ({ 
       name, 
       value, 
       color: name === 'Meeting' ? '#0f766e' : name === 'Vip' ? '#7e22ce' : name === 'Maintenance' ? '#ef4444' : '#0d9488'
    }));

    // Trend Data (Hourly if 1 day, Daily if > 1 day)
    let trendData = [];
    const isSingleDay = Math.ceil(daysInRange) <= 1;

    if (isSingleDay) {
       // Hourly Trend
       trendData = HOURS.map(hour => {
          const hourMin = hour * 60;
          const count = activeBookings.filter(b => {
             const s = timeToMinutes(b.startTime);
             const e = timeToMinutes(b.endTime);
             return s <= hourMin && e > hourMin;
          }).length;
          // Percentage of available spaces occupied at this hour
          const percentage = Math.round((count / activeSpaceCount) * 100);
          return { name: `${hour}:00`, usage: percentage };
       });
    } else {
       // Daily Trend
       const daysMap = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
       trendData = daysMap.map(day => {
          const dayBookings = activeBookings.filter(b => isSameDay(b.date, day));
          const dayMinutes = dayBookings.reduce((acc, b) => acc + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime)), 0);
          const dayCapacity = activeSpaceCount * 10 * 60;
          const usage = Math.round((dayMinutes / dayCapacity) * 100);
          return { name: format(day, 'MMM d'), usage };
       });
    }

    // Top Spaces (only relevant if 'all' spaces selected)
    let topSpaces = [];
    if (selectedSpaceId === 'all') {
       const spaceUsage: Record<string, number> = {};
       activeBookings.forEach(b => {
          spaceUsage[b.spaceId] = (spaceUsage[b.spaceId] || 0) + 1;
       });
       topSpaces = Object.entries(spaceUsage)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([id, count]) => {
             const space = spaces.find(s => s.id === id);
             return { name: space?.name || id, count, image: space?.image };
          });
    }

    // Avg Meeting Duration
    const avgDuration = activeBookings.length > 0 
       ? Math.round(totalMinutesBooked / activeBookings.length) 
       : 0;

    return { 
       total: activeBookings.length, 
       utilization, 
       ghostBookings, 
       typeData, 
       trendData, 
       topSpaces, 
       avgDuration,
       isSingleDay 
    };
  }, [filteredData, spaces, selectedSpaceId, dateRange]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
         <div>
            <h2 className="text-lg font-bold text-slate-800">Analytics Dashboard</h2>
            <p className="text-xs text-slate-500">Real-time utilization metrics and trends.</p>
         </div>
         <div className="flex flex-wrap gap-2 items-center">
            {/* Space Filter */}
            <Select value={selectedSpaceId} onValueChange={setSelectedSpaceId}>
               <SelectTrigger className="w-[180px] h-9 text-xs">
                  <SelectValue placeholder="Filter by Space" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Spaces</SelectItem>
                  {spaces.map(s => (
                     <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
               </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <Popover>
               <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal text-xs h-9 w-[240px]", !dateRange && "text-muted-foreground")}>
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {dateRange?.from ? (
                        dateRange.to ? (
                           <>
                              {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                           </>
                        ) : (
                           format(dateRange.from, "LLL dd, y")
                        )
                     ) : (
                        <span>Pick a date range</span>
                     )}
                  </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                     initialFocus
                     mode="range"
                     defaultMonth={dateRange?.from}
                     selected={dateRange}
                     onSelect={(range: any) => setDateRange(range || { from: new Date(), to: new Date() })}
                     numberOfMonths={2}
                  />
               </PopoverContent>
            </Popover>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.utilization}%</div>
            <p className="text-xs text-slate-500">Average occupancy for period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ghost Bookings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.ghostBookings}</div>
            <p className="text-xs text-slate-500">Missed check-ins</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration} min</div>
            <p className="text-xs text-slate-500">Average meeting length</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500">Bookings in selected range</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>{stats.isSingleDay ? 'Hourly Occupancy' : 'Daily Utilization Trend'}</CardTitle>
            <CardDescription>
               {stats.isSingleDay ? 'Space utilization trends throughout the day.' : 'Occupancy rates over the selected date range.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="usage" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Spaces List (or Distribution if single space selected) */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{selectedSpaceId === 'all' ? 'Most Popular Spaces' : 'Type Distribution'}</CardTitle>
            <CardDescription>{selectedSpaceId === 'all' ? 'Top utilized rooms this period.' : 'Breakdown of booking types.'}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSpaceId === 'all' ? (
               <div className="space-y-4">
                  {stats.topSpaces.map((s, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="font-bold text-slate-400 w-4">{i + 1}</div>
                        <img src={s.image} alt={s.name} className="w-10 h-10 rounded-md object-cover bg-slate-100" />
                        <div className="flex-1 min-w-0">
                           <div className="font-medium text-sm truncate" title={s.name}>{s.name}</div>
                           <div className="text-xs text-slate-500">{s.count} Bookings</div>
                        </div>
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-teal-500" style={{ width: `${Math.min(100, (s.count / Math.max(1, stats.topSpaces[0]?.count)) * 100)}%` }} />
                        </div>
                     </div>
                  ))}
                  {stats.topSpaces.length === 0 && <div className="text-center text-slate-400 text-sm py-8">No data available</div>}
               </div>
            ) : (
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <RechartsPieChart>
                        <Pie
                           data={stats.typeData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {stats.typeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36}/>
                        <RechartsTooltip />
                     </RechartsPieChart>
                  </ResponsiveContainer>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Heatmap */}
      <Card>
         <CardHeader>
            <CardTitle>Usage Heatmap</CardTitle>
            <CardDescription>Intensity of bookings by day of week and hour.</CardDescription>
         </CardHeader>
         <CardContent>
            <HeatmapChart bookings={filteredData.activeBookings} />
         </CardContent>
      </Card>
    </div>
  );
};

const HeatmapChart: React.FC<{ bookings: Booking[] }> = ({ bookings }) => {
   const data = useMemo(() => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const matrix = days.map(day => ({ day, hours: new Array(9).fill(0) }));
      
      bookings.forEach(booking => {
         if (booking.status === 'cancelled' || booking.status === 'rejected') return;
         
         const dayIndex = new Date(booking.date).getDay();
         const startHour = parseInt(booking.startTime.split(':')[0]);
         const endHour = parseInt(booking.endTime.split(':')[0]);
         
         for (let h = startHour; h < endHour; h++) {
            if (h >= 9 && h <= 17) {
               const hourIndex = h - 9;
               matrix[dayIndex].hours[hourIndex] += 10; 
            }
         }
      });
 
      return matrix.filter(d => d.day !== 'Sun' && d.day !== 'Sat');
   }, [bookings]);
 
   return (
      <div className="grid grid-cols-[auto_repeat(9,1fr)] gap-1">
        <div className="h-8"></div>
        {Array.from({length: 9}, (_, i) => i + 9).map(h => (
          <div key={h} className="text-center text-xs text-slate-500 font-medium">{h}:00</div>
        ))}
        
        {data.map(day => (
          <React.Fragment key={day.day}>
            <div className="flex items-center text-xs font-medium text-slate-500 h-8">{day.day}</div>
            {day.hours.map((intensity, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-8 rounded-sm transition-all hover:scale-105 cursor-default",
                  intensity === 0 ? "bg-slate-50" :
                  intensity < 20 ? "bg-teal-50" :
                  intensity < 40 ? "bg-teal-100" :
                  intensity < 60 ? "bg-teal-200" :
                  intensity < 80 ? "bg-teal-400" : "bg-teal-600"
                )}
                title={`Utilization Index: ${intensity}`}
              />
            ))}
          </React.Fragment>
        ))}
        <div className="col-span-10 flex justify-end items-center gap-2 mt-4 text-xs text-slate-500">
           <span>Low</span>
           <div className="flex gap-1">
              <div className="w-3 h-3 bg-teal-50 rounded-sm"></div>
              <div className="w-3 h-3 bg-teal-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-teal-600 rounded-sm"></div>
           </div>
           <span>High</span>
        </div>
      </div>
   );
 };

const HistoryView: React.FC<{ logs: LogEntry[], onExport: () => void }> = ({ logs, onExport }) => {
  const [filterAction, setFilterAction] = useState('all');
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({ from: subDays(new Date(), 7), to: new Date() });
  
  const filteredLogs = logs.filter(log => {
      const matchesAction = filterAction === 'all' || log.action.toLowerCase().includes(filterAction.toLowerCase());
      const matchesDate = isWithinInterval(new Date(log.timestamp), { start: startOfDay(dateRange.from), end: new Date(dateRange.to.setHours(23,59,59)) });
      return matchesAction && matchesDate;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
               <CardTitle>System Logs</CardTitle>
               <CardDescription>Comprehensive audit trail of platform activities.</CardDescription>
             </div>
             <div className="flex flex-wrap gap-2 items-center">
               <Popover>
                  <PopoverTrigger asChild>
                     <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal text-xs h-9", !dateRange && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                           dateRange.to ? (
                              <>
                                 {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                              </>
                           ) : (
                              format(dateRange.from, "LLL dd, y")
                           )
                        ) : (
                           <span>Pick a date</span>
                        )}
                     </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                     <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range: any) => setDateRange(range || { from: new Date(), to: new Date() })}
                        numberOfMonths={2}
                     />
                  </PopoverContent>
               </Popover>

               <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue placeholder="Filter Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="booking">Bookings</SelectItem>
                    <SelectItem value="check-in">Check-ins</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="approval">Approvals</SelectItem>
                  </SelectContent>
               </Select>
               
               <Button variant="outline" size="sm" onClick={() => toast.success("Logs Refreshed")}>
                  <RefreshCcw size={14} className="mr-2" /> Refresh
               </Button>
               <Button variant="outline" size="sm" onClick={onExport}>
                  <Download size={14} className="mr-2" /> Export
               </Button>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                       No logs found for the selected criteria.
                    </TableCell>
                 </TableRow>
              ) : (
                  filteredLogs.map(log => (
                     <TableRow key={log.id}>
                        <TableCell className="font-medium text-slate-500 text-xs">{format(new Date(log.timestamp), 'MMM d, HH:mm')}</TableCell>
                        <TableCell className="font-medium text-sm">{log.action}</TableCell>
                        <TableCell className="text-sm">{log.user}</TableCell>
                        <TableCell className="text-slate-500 text-xs max-w-xs truncate" title={log.details}>{log.details}</TableCell>
                        <TableCell>
                        <Badge variant="outline" className={cn(
                           "border-0 text-[10px]",
                           log.status === 'success' && "bg-green-50 text-green-700",
                           log.status === 'warning' && "bg-orange-50 text-orange-700",
                           log.status === 'error' && "bg-red-50 text-red-700"
                        )}>
                           {log.status.toUpperCase()}
                        </Badge>
                        </TableCell>
                     </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <div>Showing {filteredLogs.length} events</div>
          <div className="flex gap-2">
             <Button variant="ghost" size="sm" disabled>Previous</Button>
             <Button variant="ghost" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const WeeklyView: React.FC<{
  space: Space,
  bookings: Booking[],
  currentDate: Date,
  onBookingClick: (booking: Booking) => void,
  onSlotClick: (spaceId: string, time: string, date: Date) => void,
}> = ({ space, bookings, currentDate, onBookingClick, onSlotClick }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  
  return (
     <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
           <div>
              <h3 className="font-bold text-lg">{space.name}</h3>
              <p className="text-xs text-slate-500">Weekly Schedule • {space.floor}</p>
           </div>
           <div className="flex gap-2 text-sm text-slate-500">
              {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
           </div>
        </div>
        <div className="flex-1 overflow-auto">
           <div className="flex min-w-max">
              <div className="w-16 flex-shrink-0 border-r bg-slate-50 pt-10">
                 {HOURS.map(h => (
                    <div key={h} className="h-[90px] border-b text-xs text-slate-400 text-center -mt-2">
                       {h}:00
                    </div>
                 ))}
              </div>
              
              {weekDays.map(day => (
                 <div key={day.toISOString()} className="flex-1 min-w-[140px] border-r relative group">
                    <div className={cn(
                       "h-10 border-b flex flex-col items-center justify-center sticky top-0 bg-white z-10",
                       isSameDay(day, new Date()) && "bg-blue-50 text-blue-700"
                    )}>
                       <span className="text-xs font-semibold uppercase">{format(day, 'EEE')}</span>
                       <span className="text-sm font-bold">{format(day, 'd')}</span>
                    </div>
                    
                    <div className="relative h-[1170px]"> 
                       {HOURS.map(h => (
                          <div key={h} className="h-[90px] border-b border-slate-100" />
                       ))}
                       
                       {HOURS.map(h => (
                          <div 
                             key={h} 
                             className="absolute w-full h-[90px] z-0 hover:bg-slate-50 cursor-pointer" 
                             style={{ top: (h - 8) * 90 }}
                             onClick={() => onSlotClick(space.id, `${h.toString().padStart(2, '0')}:00`, day)}
                          />
                       ))}
                       
                       {bookings
                          .filter(b => b.spaceId === space.id && isSameDay(b.date, day) && b.status !== 'cancelled' && b.status !== 'rejected')
                          .map(booking => {
                             const { top, height } = getVerticalBookingPosition(booking.startTime, booking.endTime);
                             return (
                                <div
                                   key={booking.id}
                                   className={cn(
                                      "absolute left-1 right-1 rounded-md border text-xs p-2 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all z-10",
                                      getBookingColor(booking.type, booking.status)
                                   )}
                                   style={{ top: `${top}px`, height: `${height}px` }}
                                   onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                                >
                                   <div className="font-semibold truncate">{booking.title}</div>
                                   <div className="text-[10px] opacity-80 truncate">{booking.startTime} - {booking.endTime}</div>
                                </div>
                             );
                          })}
                    </div>
                 </div>
              ))}
           </div>
        </div>
     </div>
  );
};

const TimelineView: React.FC<{ 
  spaces: Space[], 
  bookings: Booking[], 
  onSlotClick: (spaceId: string, time: string) => void,
  onBookingClick: (booking: Booking) => void,
  onEditSpace: (space: Space) => void,
  onCheckIn: (bookingId: string) => void,
  onCancelBooking: (bookingId: string) => void,
  showCurrentTime?: boolean,
  zoomLevel: number,
  onViewWeekly: (space: Space) => void
}> = ({ spaces, bookings, onSlotClick, onBookingClick, onEditSpace, onCheckIn, onCancelBooking, showCurrentTime, zoomLevel, onViewWeekly }) => {
  
  const [now, setNow] = useState(new Date());
  const [collapsedFloors, setCollapsedFloors] = useState<string[]>([]);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCurrentTime) return;
    const interval = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(interval);
  }, [showCurrentTime]);

  const handleScroll = () => {
     if (headerRef.current && bodyRef.current) {
        headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
     }
  };

  const currentTimePosition = useMemo(() => {
    if (!showCurrentTime) return null;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startOfDay = 8 * 60;
    if (totalMinutes < startOfDay || totalMinutes > 20 * 60) return null;
    return (totalMinutes - startOfDay) * zoomLevel;
  }, [now, showCurrentTime, zoomLevel]);

  const spacesByFloor = useMemo(() => {
    const groups: Record<string, Space[]> = {};
    spaces.forEach(s => {
      if (!groups[s.floor]) groups[s.floor] = [];
      groups[s.floor].push(s);
    });
    return groups;
  }, [spaces]);

  const sortedFloors = useMemo(() => Object.keys(spacesByFloor).sort(), [spacesByFloor]);

  const toggleFloor = (floor: string) => {
    setCollapsedFloors(prev => 
      prev.includes(floor) ? prev.filter(f => f !== floor) : [...prev, floor]
    );
  };
  
  const hourWidth = 60 * zoomLevel;
  const totalWidth = 12 * hourWidth; 

  return (
    <div className="border rounded-lg bg-white overflow-hidden flex flex-col h-full shadow-sm relative">
      <div 
         ref={headerRef} 
         className="flex border-b bg-slate-50 overflow-hidden select-none"
         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="w-56 shrink-0 border-r p-3 font-semibold text-slate-500 text-sm bg-slate-50 flex justify-between items-center sticky left-0 z-30 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
          <span>Resource</span>
          <span className="text-xs font-normal text-slate-400">{spaces.length} Spaces</span>
        </div>
        <div className="flex h-10 shrink-0" style={{ width: totalWidth }}> 
           {HOURS.map(h => (
             <div key={h} className="shrink-0 border-r flex items-center justify-center text-xs text-slate-400 font-medium" style={{ width: hourWidth }}>
               {h}:00
             </div>
           ))}
        </div>
      </div>

      <div 
         ref={bodyRef} 
         onScroll={handleScroll} 
         className="flex-1 overflow-auto relative"
      >
         <div className="min-w-max pb-12"> 
            {sortedFloors.map(floor => (
               <React.Fragment key={floor}>
                  <div className="flex bg-slate-100/80 border-b sticky left-0 z-20 w-full min-w-full">
                     <div 
                        className="w-56 shrink-0 border-r px-3 py-1.5 font-bold text-xs text-slate-600 bg-slate-100/80 flex items-center gap-2 cursor-pointer hover:bg-slate-200/80 sticky left-0 z-30 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]"
                        onClick={() => toggleFloor(floor)}
                     >
                        {collapsedFloors.includes(floor) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        {floor}
                     </div>
                     <div className="flex-1" />
                  </div>

                  {!collapsedFloors.includes(floor) && spacesByFloor[floor].map(space => (
                    <div key={space.id} className="flex border-b h-16 group hover:bg-slate-50/50 transition-colors">
                       <div className="w-56 shrink-0 border-r p-3 flex flex-col justify-center bg-white sticky left-0 z-20 group-hover:bg-slate-50/50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                          <div className="flex justify-between items-start">
                             <div className="truncate pr-2">
                                <ContextMenu>
                                   <ContextMenuTrigger>
                                      <div className="font-medium text-sm truncate cursor-pointer hover:text-teal-600 hover:underline">{space.name}</div>
                                   </ContextMenuTrigger>
                                   <ContextMenuContent>
                                      <ContextMenuItem onClick={() => onEditSpace(space)}><Edit size={14} className="mr-2"/> Edit Space</ContextMenuItem>
                                      <ContextMenuItem onClick={() => onViewWeekly(space)}><CalendarDays size={14} className="mr-2"/> View Weekly Schedule</ContextMenuItem>
                                   </ContextMenuContent>
                                </ContextMenu>
                                <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                                   <Users size={10} /> {space.capacity} • {space.type}
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-1">
                                {space.status === 'maintenance' && <Zap size={12} className="text-red-500 shrink-0" />}
                                {space.requiresApproval && <ShieldAlert size={12} className="text-amber-500 shrink-0" title="Requires Approval" />}
                             </div>
                          </div>
                       </div>

                       <div className="relative shrink-0" style={{ width: totalWidth }}>
                          {currentTimePosition !== null && (
                            <div 
                              className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none flex flex-col items-center"
                              style={{ left: `${currentTimePosition}px` }}
                            >
                               <div className="w-2 h-2 rounded-full bg-red-500 -mt-1" />
                            </div>
                          )}

                          <div className="absolute inset-0 flex pointer-events-none">
                             {HOURS.map(h => (
                                <div key={h} className="border-r h-full border-slate-100" style={{ width: hourWidth }} />
                             ))}
                          </div>

                          <div className="absolute inset-0 flex z-0">
                             {Array.from({ length: 12 * 2 }).map((_, i) => (
                                <div 
                                   key={i} 
                                   className="h-full hover:bg-teal-50/30 cursor-pointer border-r border-transparent hover:border-teal-100 transition-colors"
                                   style={{ width: hourWidth / 2 }}
                                   onClick={() => {
                                      const hour = Math.floor(i / 2) + 8;
                                      const min = (i % 2) * 30;
                                      onSlotClick(space.id, `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
                                   }}
                                />
                             ))}
                          </div>

                          {bookings.filter(b => b.spaceId === space.id && b.status !== 'cancelled' && b.status !== 'rejected').map(booking => {
                             const { left, width } = getBookingPosition(booking.startTime, booking.endTime, zoomLevel);
                             return (
                                <ContextMenu key={booking.id}>
                                   <ContextMenuTrigger>
                                      <div
                                         className={cn(
                                            "absolute top-2 bottom-2 rounded-md border text-xs p-1.5 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all z-10",
                                            getBookingColor(booking.type, booking.status)
                                         )}
                                         style={{ left: `${left}px`, width: `${width}px` }}
                                         onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                                      >
                                         <div className="flex items-center gap-1 font-semibold truncate">
                                            {booking.recurrence && booking.recurrence !== 'none' && <Repeat size={10} className="shrink-0" />}
                                            {booking.status === 'checked-in' && <CheckCircle2 size={10} className="shrink-0 text-green-700" />}
                                            {booking.status === 'pending' && <Clock size={10} className="shrink-0 text-amber-700" />}
                                            <span className="truncate">{booking.title}</span>
                                         </div>
                                         <div className="text-[10px] opacity-80 truncate">{booking.organizer}</div>
                                      </div>
                                   </ContextMenuTrigger>
                                   <ContextMenuContent>
                                      <ContextMenuLabel>Booking Options</ContextMenuLabel>
                                      <ContextMenuSeparator />
                                      <ContextMenuItem onClick={() => onBookingClick(booking)}>
                                         <Eye size={14} className="mr-2" /> View Details
                                      </ContextMenuItem>
                                      {booking.status !== 'checked-in' && booking.status !== 'cancelled' && booking.status !== 'pending' && (
                                         <ContextMenuItem onClick={() => onCheckIn(booking.id)}>
                                            <LogIn size={14} className="mr-2" /> Check In
                                         </ContextMenuItem>
                                      )}
                                      <ContextMenuItem className="text-red-600" onClick={() => onCancelBooking(booking.id)}>
                                         <Trash2 size={14} className="mr-2" /> Cancel Booking
                                      </ContextMenuItem>
                                   </ContextMenuContent>
                                </ContextMenu>
                             );
                          })}
                       </div>
                    </div>
                  ))}
               </React.Fragment>
            ))}
         </div>
      </div>
      
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border shadow-sm p-2 rounded-md text-[10px] flex gap-3 z-30">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Standard</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-200 border border-amber-400"></div> Pending</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Checked In</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> VIP</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Maintenance</div>
      </div>
    </div>
  );
};

export const CoreSpaceBooking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scheduler');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [zoomLevel, setZoomLevel] = useState(2); 
  
  // State Initialization with LocalStorage persistence
  const [spaces, setSpaces] = useState<Space[]>(() => {
     try {
        const saved = localStorage.getItem('dixels_spaces_v2');
        return saved ? JSON.parse(saved) : DEFAULT_SPACES;
     } catch(e) { return DEFAULT_SPACES; }
  });
  
  const [bookings, setBookings] = useState<Booking[]>(() => {
     try {
        const saved = localStorage.getItem('dixels_bookings_v2');
        return saved ? JSON.parse(saved).map((b: any) => ({ ...b, date: new Date(b.date), requestDate: b.requestDate ? new Date(b.requestDate) : undefined })) : DEFAULT_BOOKINGS;
     } catch(e) { return DEFAULT_BOOKINGS; }
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
     // Hydrate dates for logs
     return HISTORY_LOGS.map(l => ({...l, timestamp: new Date(l.timestamp)}));
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Persistence Effects
  useEffect(() => {
     localStorage.setItem('dixels_spaces_v2', JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
     localStorage.setItem('dixels_bookings_v2', JSON.stringify(bookings));
  }, [bookings]);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewSpace, setViewSpace] = useState<Space | null>(null);

  const [isBookDialogOpen, setBookDialogOpen] = useState(false);
  const [isSmartBookOpen, setSmartBookOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isSpaceEditOpen, setSpaceEditOpen] = useState(false);
  const [isReportIssueOpen, setReportIssueOpen] = useState(false);
  
  const [selectedSlot, setSelectedSlot] = useState<{spaceId: string, time: string} | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [issueSpace, setIssueSpace] = useState<Space | null>(null);
  
  const [filterType, setFilterType] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterCapacity, setFilterCapacity] = useState([1]);
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [smartBookResults, setSmartBookResults] = useState<Space[]>([]);

  const [bookingForm, setBookingForm] = useState({
     title: '',
     type: 'standard' as BookingType,
     duration: '60',
     recurrence: 'none' as RecurrenceType
  });

  const [smartBookCriteria, setSmartBookCriteria] = useState({
     attendees: 4,
     date: new Date(),
     time: '09:00',
     duration: '60',
     amenities: [] as string[]
  });

  const logAction = (action: string, details: string, user: string = 'Admin User', status: 'success' | 'warning' | 'error' = 'success') => {
      const newLog: LogEntry = {
         id: `log-${Date.now()}`,
         timestamp: new Date(),
         action,
         user,
         details,
         status
      };
      setLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (title: string, message: string) => {
     const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        timestamp: new Date(),
        read: false
     };
     setNotifications(prev => [newNotif, ...prev]);
  };

  const handleExportCSV = () => {
     const headers = ['ID', 'Title', 'Organizer', 'Date', 'Start Time', 'End Time', 'Status', 'Space ID', 'Approved By'];
     const rows = bookings.map(b => [
        b.id,
        `"${b.title}"`,
        `"${b.organizer}"`,
        format(b.date, 'yyyy-MM-dd'),
        b.startTime,
        b.endTime,
        b.status,
        b.spaceId,
        b.approvedBy || ''
     ]);
     
     const csvContent = "data:text/csv;charset=utf-8," + 
        [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
     
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `bookings_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     
     logAction('Data Export', 'Bookings exported to CSV');
     toast.success("Export Successful", { description: "CSV file has been downloaded." });
  };

  const filteredBookings = useMemo(() => {
    let result = bookings.filter(b => b.status !== 'rejected');
    
    if (showMyBookings) {
       result = result.filter(b => b.organizer === 'Admin User' || b.organizer === 'Sarah Chen');
    }

    if (viewMode === 'weekly' && viewSpace) {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = addDays(start, 6);
        return result.filter(b => b.spaceId === viewSpace.id && isWithinInterval(b.date, { start, end }));
    }
    
    return result.filter(b => isSameDay(b.date, currentDate));
  }, [bookings, currentDate, viewMode, viewSpace, showMyBookings]);

  const filteredSpaces = spaces.filter(s => {
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterFloor !== 'all' && s.floor !== filterFloor) return false;
    if (s.capacity < filterCapacity[0]) return false;
    if (filterAmenities.length > 0) {
      const hasAllAmenities = filterAmenities.every(a => s.amenities.includes(a));
      if (!hasAllAmenities) return false;
    }
    
    if (showAvailableOnly) {
       if (s.status !== 'available') return false;
    }
    
    return true;
  });

  const getNextBooking = (spaceId: string) => {
     const now = new Date();
     const todayBookings = bookings
        .filter(b => b.spaceId === spaceId && isSameDay(b.date, now) && (b.status === 'confirmed' || b.status === 'checked-in'))
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
     
     if (todayBookings.length === 0) return null;
     
     const currentHour = now.getHours();
     const currentMin = now.getMinutes();
     const currentTimeVal = currentHour * 60 + currentMin;

     const next = todayBookings.find(b => timeToMinutes(b.endTime) > currentTimeVal);
     return next || null;
  };

  const handleSlotClick = (spaceId: string, time: string, dateOverride?: Date) => {
    const targetDate = dateOverride || currentDate;
    const spaceBookings = bookings.filter(b => b.spaceId === spaceId && isSameDay(b.date, targetDate) && b.status !== 'cancelled' && b.status !== 'rejected');
    const proposedStart = time;
    
    const hasOverlap = spaceBookings.some(b => {
      return checkOverlap(proposedStart, proposedStart, b.startTime, b.endTime);
    });
    
    if (hasOverlap) {
       toast.error("Slot already occupied");
       return;
    }

    if (dateOverride) setCurrentDate(dateOverride);

    setSelectedSlot({ spaceId, time });
    setBookingForm({ ...bookingForm, title: '', type: 'standard', recurrence: 'none' });
    setBookDialogOpen(true);
  };

  const handleCreateBooking = () => {
     if (!selectedSlot) return;
     const space = spaces.find(s => s.id === selectedSlot.spaceId);
     if (!space) return;

     const startMin = timeToMinutes(selectedSlot.time);
     const endMin = startMin + parseInt(bookingForm.duration);
     const endHour = Math.floor(endMin / 60);
     const endMinute = endMin % 60;
     const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

     const spaceBookings = bookings.filter(b => b.spaceId === space.id && isSameDay(b.date, currentDate));
     const hasOverlap = spaceBookings.some(b => {
        if (b.status === 'cancelled' || b.status === 'rejected') return false;
        return checkOverlap(selectedSlot.time, endTime, b.startTime, b.endTime);
     });

     if (hasOverlap) {
        toast.error("Booking Conflict", { description: "The selected time overlaps with an existing reservation." });
        return;
     }

     const newBookings: Booking[] = [];
     const recurrenceCount = bookingForm.recurrence === 'none' ? 1 : 5; 
     const seriesId = bookingForm.recurrence !== 'none' ? `ser-${Date.now()}` : undefined;
     
     // Determine status based on space approval requirement
     const initialStatus: BookingStatus = space.requiresApproval && bookingForm.type !== 'maintenance' ? 'pending' : 'confirmed';

     for (let i = 0; i < recurrenceCount; i++) {
        let bookingDate = currentDate;
        if (bookingForm.recurrence === 'daily') bookingDate = addDays(currentDate, i);
        if (bookingForm.recurrence === 'weekly') bookingDate = addWeeks(currentDate, i);
        
        newBookings.push({
          id: `new-${Date.now()}-${i}`,
          spaceId: space.id,
          date: bookingDate,
          startTime: selectedSlot.time,
          endTime,
          title: bookingForm.title || (bookingForm.type === 'maintenance' ? 'Scheduled Maintenance' : 'New Meeting'),
          type: bookingForm.type,
          organizer: 'Admin User',
          attendees: 0,
          status: initialStatus,
          recurrence: bookingForm.recurrence,
          seriesId,
          requestDate: new Date()
        });
     }

     setBookings(prev => [...prev, ...newBookings]);
     setBookDialogOpen(false);
     
     if (initialStatus === 'pending') {
         addNotification('Approval Requested', `Your booking for ${space.name} requires facility approval.`);
         logAction('Booking Requested', `Booking requested for ${space.name}. Status: Pending`);
         toast.info('Request Submitted', { description: "This space requires approval. You will be notified once confirmed." });
     } else {
         addNotification('Booking Created', `${bookingForm.title} scheduled in ${space.name}.`);
         logAction('Booking Created', `Created ${bookingForm.type} booking for ${space.name}`);
         if (bookingForm.recurrence !== 'none') {
            toast.success('Recurring Reservation Created', { description: `${recurrenceCount} sessions booked.` });
         } else {
            toast.success('Reservation Created');
         }
     }
  };

  const performSmartSearch = () => {
     let matchingSpaces = spaces.filter(s => {
        if (s.capacity < smartBookCriteria.attendees) return false;
        if (smartBookCriteria.amenities.length > 0) {
           const hasAmenities = smartBookCriteria.amenities.every(a => s.amenities.includes(a));
           if (!hasAmenities) return false;
        }
        return true;
     });

     const startMin = timeToMinutes(smartBookCriteria.time);
     const endMin = startMin + parseInt(smartBookCriteria.duration);
     const endHour = Math.floor(endMin / 60);
     const endMinute = endMin % 60;
     const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
     
     const relevantBookings = bookings.filter(b => isSameDay(b.date, smartBookCriteria.date) && b.status !== 'cancelled' && b.status !== 'rejected');

     matchingSpaces = matchingSpaces.filter(space => {
         const spaceBookings = relevantBookings.filter(b => b.spaceId === space.id);
         const hasOverlap = spaceBookings.some(b => checkOverlap(smartBookCriteria.time, endTime, b.startTime, b.endTime));
         return !hasOverlap;
     });

     setSmartBookResults(matchingSpaces);
     if (matchingSpaces.length === 0) {
        toast.warning("No spaces found", { description: "Try adjusting your criteria." });
     }
  };

  const handleSmartBookConfirm = (space: Space) => {
      const startMin = timeToMinutes(smartBookCriteria.time);
      const endMin = startMin + parseInt(smartBookCriteria.duration);
      const endHour = Math.floor(endMin / 60);
      const endMinute = endMin % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      // Check if space requires approval
      const initialStatus: BookingStatus = space.requiresApproval ? 'pending' : 'confirmed';

      const newBooking: Booking = {
         id: `smart-${Date.now()}`,
         spaceId: space.id,
         date: smartBookCriteria.date,
         startTime: smartBookCriteria.time,
         endTime: endTime,
         title: 'Smart Booking',
         type: 'standard',
         organizer: 'Smart System',
         attendees: smartBookCriteria.attendees,
         status: initialStatus,
         recurrence: 'none',
         requestDate: new Date()
      };

      setBookings(prev => [...prev, newBooking]);
      setSmartBookOpen(false);
      setSmartBookResults([]);
      
      if (initialStatus === 'pending') {
          addNotification('Approval Requested', `Smart booking for ${space.name} requires facility approval.`);
          logAction('Smart Booking Requested', `Smart booking requested for ${space.name}. Status: Pending`);
          toast.info('Request Submitted', { description: "This space requires approval." });
      } else {
          addNotification('Smart Booking Confirmed', `Reserved ${space.name} for ${smartBookCriteria.attendees} people.`);
          logAction('Smart Booking Created', `Smart booking created for ${space.name}`);
          toast.success("Room Booked Successfully", { description: `${space.name} has been reserved.` });
      }
  };

  const handleApproveBooking = (id: string) => {
     setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed', approvedBy: 'Facility Manager' } : b));
     const booking = bookings.find(b => b.id === id);
     logAction('Booking Approved', `Approved booking ${booking?.title} by ${booking?.organizer}`);
     addNotification('Booking Approved', `Request for ${booking?.title} has been approved.`);
     toast.success("Booking Approved");
  };

  const handleRejectBooking = (id: string) => {
     setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected', rejectionReason: 'Admin Rejected' } : b));
     const booking = bookings.find(b => b.id === id);
     logAction('Booking Rejected', `Rejected booking ${booking?.title}`);
     toast.info("Booking Rejected");
  };

  const handleDeleteBooking = (id: string) => {
     const booking = bookings.find(b => b.id === id);
     
     if (booking?.seriesId) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        logAction('Booking Cancelled', `Cancelled recurring instance: ${booking.title}`);
        addNotification('Booking Cancelled', `Cancelled instance of recurring series: ${booking.title}`);
        toast.success('Booking Instance Cancelled');
     } else {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        logAction('Booking Cancelled', `Cancelled booking: ${booking?.title}`);
        addNotification('Booking Cancelled', `Cancelled: ${booking?.title}`);
        toast.success('Booking Cancelled');
     }
     setDetailsOpen(false);
  };

  const handleCheckIn = (id: string) => {
     setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'checked-in', checkInTime: format(new Date(), 'HH:mm') } : b));
     setDetailsOpen(false);
     logAction('Check-in', `User checked in to booking ${id}`);
     addNotification('Check-in Successful', 'Verified attendance for booking.');
     toast.success("Checked In Successfully");
  };

  const toggleAmenityFilter = (amenity: string) => {
    setFilterAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleEditSpace = (space: Space) => {
    setEditingSpace(space);
    setSpaceEditOpen(true);
  };

  const saveSpaceChanges = () => {
     if (editingSpace) {
        setSpaces(prev => prev.map(s => s.id === editingSpace.id ? editingSpace : s));
        setSpaceEditOpen(false);
        logAction('Space Updated', `Updated configuration for ${editingSpace.name}`);
        toast.success("Space Updated");
     }
  };
  
  const handleReportIssue = (space: Space) => {
     setIssueSpace(space);
     setReportIssueOpen(true);
  };

  const submitIssue = () => {
     if (issueSpace) {
        const newBooking: Booking = {
           id: `maint-${Date.now()}`,
           spaceId: issueSpace.id,
           date: currentDate,
           startTime: format(new Date(), 'HH:mm'),
           endTime: '18:00',
           title: 'Unscheduled Maintenance',
           type: 'maintenance',
           organizer: 'Facility Manager',
           attendees: 0,
           status: 'confirmed'
        };
        setBookings(prev => [...prev, newBooking]);
        setSpaces(prev => prev.map(s => s.id === issueSpace.id ? { ...s, status: 'maintenance' } : s));
        setReportIssueOpen(false);
        logAction('Issue Reported', `Maintenance logged for ${issueSpace.name}`, 'Facility Manager', 'warning');
        addNotification('Issue Reported', `Maintenance logged for ${issueSpace.name}.`);
        toast.success("Maintenance Request Logged", { description: `${issueSpace.name} marked as 'Maintenance'.` });
     }
  };

  const handleViewWeekly = (space: Space) => {
      setViewSpace(space);
      setViewMode('weekly');
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900">
       <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Space Management
                <Badge variant="secondary" className="font-normal text-xs bg-teal-50 text-teal-700 border-teal-200">Facility Manager</Badge>
             </h1>
          </div>
          
          <div className="flex items-center gap-2">
             <Popover>
               <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 relative">
                     <Bell size={18} />
                     {notifications.some(n => !n.read) && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                     )}
                  </Button>
               </PopoverTrigger>
               <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b font-semibold text-sm flex justify-between items-center">
                     <span>Notifications</span>
                     <span className="text-xs text-slate-400 cursor-pointer" onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}>Mark all read</span>
                  </div>
                  <ScrollArea className="h-[300px]">
                     <div className="p-2 space-y-1">
                        {notifications.length === 0 ? (
                           <div className="text-center py-8 text-xs text-slate-400">No new notifications</div>
                        ) : (
                           notifications.map(n => (
                              <div key={n.id} className={cn("p-2 rounded-md text-sm", n.read ? "opacity-60" : "bg-slate-50 border-l-2 border-teal-500")}>
                                 <div className="font-medium text-xs text-slate-500 mb-0.5">{format(n.timestamp, 'HH:mm')}</div>
                                 <div className="font-medium">{n.title}</div>
                                 <div className="text-xs text-slate-500">{n.message}</div>
                              </div>
                           ))
                        )}
                     </div>
                  </ScrollArea>
               </PopoverContent>
             </Popover>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto ml-4">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="scheduler" className="gap-2"><CalendarIcon size={14} /> Scheduler</TabsTrigger>
              <TabsTrigger value="approvals" className="gap-2 relative">
                 <ShieldAlert size={14} /> Approvals
                 {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center">{pendingCount}</span>}
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2"><BarChart3 size={14} /> Insights</TabsTrigger>
              <TabsTrigger value="history" className="gap-2"><History size={14} /> Logs</TabsTrigger>
            </TabsList>
          </Tabs>
       </div>

       <div className="flex-1 overflow-hidden">
          {activeTab === 'scheduler' && (
             <div className="flex h-full">
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto hidden md:flex">
                   <div className="p-4 space-y-6">
                      <div className="flex items-center justify-between mb-2">
                         <h3 className="font-semibold text-sm">Filters</h3>
                         <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-500 hover:text-red-500" onClick={() => {
                            setFilterType('all');
                            setFilterFloor('all');
                            setFilterCapacity([1]);
                            setFilterAmenities([]);
                            setShowAvailableOnly(false);
                            setShowMyBookings(false);
                         }}>
                            <FilterX size={12} className="mr-1" /> Reset
                         </Button>
                      </div>
                      
                      <div className="space-y-3">
                         <Label className="text-xs font-semibold text-slate-500 uppercase">Search</Label>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                            <Input placeholder="Find a room..." className="pl-9 h-9 text-xs" />
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 border p-2 rounded-md bg-slate-50">
                           <Switch id="show-available" checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
                           <Label htmlFor="show-available" className="text-xs font-medium cursor-pointer">Available Now Only</Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-2 rounded-md bg-slate-50">
                           <Switch id="show-my-bookings" checked={showMyBookings} onCheckedChange={setShowMyBookings} />
                           <Label htmlFor="show-my-bookings" className="text-xs font-medium cursor-pointer flex items-center gap-1"><UserCheck size={12}/> My Bookings</Label>
                        </div>
                      </div>

                      <div className="space-y-3">
                         <Label className="text-xs font-semibold text-slate-500 uppercase">Capacity ({filterCapacity[0]}+)</Label>
                         <Slider value={filterCapacity} onValueChange={setFilterCapacity} max={50} step={1} className="py-2" />
                      </div>

                      <div className="space-y-3">
                         <Label className="text-xs font-semibold text-slate-500 uppercase">Space Type</Label>
                         <div className="space-y-2">
                            {['All', 'Meeting Room', 'Huddle', 'Desk', 'Phone Booth'].map(t => (
                               <div key={t} className="flex items-center space-x-2">
                                  <Checkbox 
                                     id={`type-${t}`} 
                                     checked={t === 'All' ? filterType === 'all' : filterType === t}
                                     onCheckedChange={() => setFilterType(t === 'All' ? 'all' : t)}
                                  />
                                  <label htmlFor={`type-${t}`} className="text-sm font-medium leading-none cursor-pointer">
                                     {t}
                                  </label>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-3">
                         <Label className="text-xs font-semibold text-slate-500 uppercase">Amenities</Label>
                         <div className="grid grid-cols-2 gap-2">
                            {AMENITIES_LIST.map(a => (
                               <div key={a} className="flex items-center space-x-2">
                                  <Checkbox 
                                     id={`amenity-${a}`}
                                     checked={filterAmenities.includes(a)}
                                     onCheckedChange={() => toggleAmenityFilter(a)}
                                  />
                                  <label htmlFor={`amenity-${a}`} className="text-xs leading-none cursor-pointer truncate" title={a}>
                                     {a}
                                  </label>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-3">
                         <Label className="text-xs font-semibold text-slate-500 uppercase">Floor</Label>
                         <Select value={filterFloor} onValueChange={setFilterFloor}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Floor" /></SelectTrigger>
                            <SelectContent>
                               <SelectItem value="all">All Floors</SelectItem>
                               <SelectItem value="Level 1">Level 1</SelectItem>
                               <SelectItem value="Level 2">Level 2</SelectItem>
                               <SelectItem value="Level 3">Level 3</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                   </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 p-4 overflow-hidden">
                   <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                      <div className="flex items-center gap-2 bg-white border p-1 rounded-lg">
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
                            <ChevronLeft size={16} />
                         </Button>
                         
                         <Popover>
                            <PopoverTrigger asChild>
                               <Button variant="ghost" className="h-7 px-2 font-semibold text-sm w-40">
                                  {format(currentDate, 'EEE, MMM d, yyyy')}
                               </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                               <Calendar
                                  mode="single"
                                  selected={currentDate}
                                  onSelect={(d) => d && setCurrentDate(d)}
                                  initialFocus
                               />
                            </PopoverContent>
                         </Popover>

                         <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                            <ChevronRight size={16} />
                         </Button>
                         <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500" onClick={() => setCurrentDate(new Date())}>Today</Button>
                      </div>

                      <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 bg-white border p-1 rounded-lg">
                            <Button 
                               variant="ghost" 
                               size="sm" 
                               className={cn("h-7 px-3 text-xs gap-2", viewMode === 'timeline' && "bg-slate-100 text-slate-900")}
                               onClick={() => setViewMode('timeline')}
                            >
                               <GanttChartSquare size={14} /> Timeline
                            </Button>
                            <Button 
                               variant="ghost" 
                               size="sm" 
                               className={cn("h-7 px-3 text-xs gap-2", viewMode === 'grid' && "bg-slate-100 text-slate-900")}
                               onClick={() => setViewMode('grid')}
                            >
                               <LayoutGrid size={14} /> Grid
                            </Button>
                            {viewMode === 'weekly' && (
                               <Button variant="ghost" size="sm" className="h-7 px-3 text-xs bg-slate-100 text-slate-900 gap-2">
                                  <CalendarDays size={14} /> Weekly
                               </Button>
                            )}
                         </div>
                         {viewMode === 'timeline' && (
                             <div className="flex items-center gap-1 bg-white border p-1 rounded-lg">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(Math.max(1, zoomLevel / 2))} disabled={zoomLevel <= 1}>
                                    <ZoomOut size={14} />
                                </Button>
                                <span className="text-[10px] w-8 text-center text-slate-500">{zoomLevel * 60}px</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(Math.min(4, zoomLevel * 2))} disabled={zoomLevel >= 4}>
                                    <ZoomIn size={14} />
                                </Button>
                             </div>
                         )}
                         <Button className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4 text-xs font-medium" onClick={() => {
                            setSmartBookResults([]);
                            setSmartBookOpen(true);
                         }}>
                            <Wand2 size={14} className="mr-2" /> Smart Book
                         </Button>
                      </div>
                   </div>

                   {viewMode === 'timeline' ? (
                      <TimelineView 
                         spaces={filteredSpaces} 
                         bookings={filteredBookings} 
                         onSlotClick={handleSlotClick}
                         onBookingClick={(b) => { setSelectedBooking(b); setDetailsOpen(true); }}
                         onEditSpace={handleEditSpace}
                         onCheckIn={handleCheckIn}
                         onCancelBooking={handleDeleteBooking}
                         showCurrentTime={isSameDay(currentDate, new Date())}
                         zoomLevel={zoomLevel}
                         onViewWeekly={handleViewWeekly}
                      />
                   ) : viewMode === 'grid' ? (
                      <ScrollArea className="h-full">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                            {filteredSpaces.map(space => {
                               const nextBooking = getNextBooking(space.id);
                               return (
                               <Card key={space.id} className="group overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                                  <div className="relative h-32 bg-slate-100 shrink-0">
                                     <img src={space.image} alt={space.name} className="w-full h-full object-cover" />
                                     <div className="absolute top-2 right-2">
                                        <Badge className={cn("border-0", space.status === 'available' ? 'bg-green-500' : space.status === 'maintenance' ? 'bg-red-500' : 'bg-slate-500')}>
                                           {space.status}
                                        </Badge>
                                     </div>
                                     {space.status === 'maintenance' && (
                                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                                           <Badge variant="secondary" className="bg-white/90 text-red-600 border-red-200"><Zap size={12} className="mr-1" /> Maintenance</Badge>
                                        </div>
                                     )}
                                     {space.requiresApproval && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 opacity-90"><ShieldAlert size={10} className="mr-1"/> Approval Req.</Badge>
                                        </div>
                                     )}
                                  </div>
                                  <CardHeader className="p-4 pb-2 shrink-0">
                                     <div className="flex justify-between items-start">
                                        <CardTitle className="text-base truncate">{space.name}</CardTitle>
                                        <ContextMenu>
                                          <ContextMenuTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                                <MoreHorizontal size={14} />
                                             </Button>
                                          </ContextMenuTrigger>
                                          <ContextMenuContent>
                                             <ContextMenuItem onClick={() => handleEditSpace(space)}><Edit size={14} className="mr-2"/> Edit Space</ContextMenuItem>
                                             <ContextMenuItem onClick={() => handleViewWeekly(space)}><CalendarDays size={14} className="mr-2"/> View Weekly Schedule</ContextMenuItem>
                                             <ContextMenuItem onClick={() => handleReportIssue(space)} className="text-red-600"><AlertCircle size={14} className="mr-2"/> Report Issue</ContextMenuItem>
                                          </ContextMenuContent>
                                        </ContextMenu>
                                     </div>
                                     <CardDescription className="text-xs">{space.floor} • {space.type}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0 flex-1">
                                     <div className="flex gap-2 mb-3 flex-wrap h-10 overflow-hidden content-start">
                                        {space.amenities.map(a => (
                                           <Badge key={a} variant="outline" className="text-[10px] h-5 px-1 font-normal text-slate-500">
                                              {a}
                                           </Badge>
                                        ))}
                                     </div>
                                     
                                     <div className="bg-slate-50 rounded-md p-2 mb-2">
                                        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Up Next</div>
                                        {nextBooking ? (
                                           <div className="text-xs">
                                              <div className="font-medium truncate">{nextBooking.title}</div>
                                              <div className="text-slate-500">{nextBooking.startTime} - {nextBooking.endTime}</div>
                                           </div>
                                        ) : (
                                           <div className="text-xs text-slate-400 italic">No more bookings today</div>
                                        )}
                                     </div>

                                  </CardContent>
                                  <CardFooter className="p-4 pt-0 shrink-0">
                                     <div className="flex w-full gap-2">
                                        <Button variant="outline" size="sm" className="h-8 flex-1 text-xs" onClick={() => handleReportIssue(space)}>Report</Button>
                                        <Button size="sm" className="h-8 flex-1 text-xs" onClick={() => handleSlotClick(space.id, '09:00')}>Book</Button>
                                     </div>
                                  </CardFooter>
                               </Card>
                            )})}
                         </div>
                      </ScrollArea>
                   ) : (
                      // Weekly View
                      viewSpace && (
                        <div className="h-full flex flex-col">
                           <div className="mb-2">
                              <Button variant="ghost" size="sm" onClick={() => setViewMode('timeline')} className="text-xs">
                                 <ChevronLeft size={12} className="mr-1" /> Back to Timeline
                              </Button>
                           </div>
                           <WeeklyView 
                              space={viewSpace} 
                              bookings={filteredBookings} 
                              currentDate={currentDate} 
                              onBookingClick={(b) => { setSelectedBooking(b); setDetailsOpen(true); }}
                              onSlotClick={handleSlotClick}
                           />
                        </div>
                      )
                   )}
                </main>
             </div>
          )}

          {activeTab === 'approvals' && (
             <ScrollArea className="h-full">
                <ApprovalsView 
                  bookings={bookings} 
                  spaces={spaces}
                  onApprove={handleApproveBooking}
                  onReject={handleRejectBooking}
                />
             </ScrollArea>
          )}

          {activeTab === 'insights' && (
             <ScrollArea className="h-full">
                <InsightsView bookings={bookings} spaces={spaces} />
             </ScrollArea>
          )}

          {activeTab === 'history' && (
             <ScrollArea className="h-full">
                <HistoryView logs={logs} onExport={handleExportCSV} />
             </ScrollArea>
          )}
       </div>

       {/* Create Booking Dialog */}
       <Dialog open={isBookDialogOpen} onOpenChange={setBookDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
             <DialogHeader>
                <DialogTitle>New Reservation</DialogTitle>
                <DialogDescription>
                   {selectedSlot && `${spaces.find(s => s.id === selectedSlot.spaceId)?.name} • ${format(currentDate, 'MMMM d')}`}
                </DialogDescription>
             </DialogHeader>
             <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="title" className="text-right">Title</Label>
                   <Input 
                      id="title" 
                      className="col-span-3" 
                      value={bookingForm.title} 
                      onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })} 
                      placeholder="Meeting Title"
                   />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="type" className="text-right">Type</Label>
                   <Select 
                      value={bookingForm.type} 
                      onValueChange={(v: BookingType) => setBookingForm({ ...bookingForm, type: v })}
                   >
                      <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="standard">Standard Meeting</SelectItem>
                         <SelectItem value="vip">VIP / Executive</SelectItem>
                         <SelectItem value="internal-block">Block (Internal)</SelectItem>
                         <SelectItem value="maintenance">Maintenance</SelectItem>
                         <SelectItem value="cleaning">Cleaning</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="duration" className="text-right">Duration</Label>
                   <Select 
                      value={bookingForm.duration} 
                      onValueChange={(v) => setBookingForm({ ...bookingForm, duration: v })}
                   >
                      <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="30">30 Minutes</SelectItem>
                         <SelectItem value="60">1 Hour</SelectItem>
                         <SelectItem value="90">1.5 Hours</SelectItem>
                         <SelectItem value="120">2 Hours</SelectItem>
                         <SelectItem value="240">4 Hours</SelectItem>
                         <SelectItem value="480">All Day (8h)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="recurrence" className="text-right">Repeat</Label>
                   <Select 
                      value={bookingForm.recurrence} 
                      onValueChange={(v: RecurrenceType) => setBookingForm({ ...bookingForm, recurrence: v })}
                   >
                      <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="none">No Repeat</SelectItem>
                         <SelectItem value="daily">Daily (5 Days)</SelectItem>
                         <SelectItem value="weekly">Weekly (5 Weeks)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>
             <DialogFooter>
                <Button type="submit" onClick={handleCreateBooking}>Confirm</Button>
             </DialogFooter>
          </DialogContent>
       </Dialog>

       {/* Smart Book Dialog */}
       <Dialog open={isSmartBookOpen} onOpenChange={setSmartBookOpen}>
          <DialogContent className="sm:max-w-[600px]">
             <DialogHeader>
                <DialogTitle>Smart Book</DialogTitle>
                <DialogDescription>Let us find the perfect room for your needs.</DialogDescription>
             </DialogHeader>
             <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                         <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                               <CalendarIcon className="mr-2 h-4 w-4" />
                               {format(smartBookCriteria.date, 'PPP')}
                            </Button>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0">
                            <Calendar
                               mode="single"
                               selected={smartBookCriteria.date}
                               onSelect={(d) => d && setSmartBookCriteria({ ...smartBookCriteria, date: d })}
                               initialFocus
                            />
                         </PopoverContent>
                      </Popover>
                   </div>
                   <div className="space-y-2">
                      <Label>Time</Label>
                      <Select value={smartBookCriteria.time} onValueChange={(v) => setSmartBookCriteria({...smartBookCriteria, time: v})}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="09:00">09:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="13:00">01:00 PM</SelectItem>
                            <SelectItem value="14:00">02:00 PM</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>
                <div className="space-y-2">
                   <Label>Attendees</Label>
                   <Slider 
                     value={[smartBookCriteria.attendees]} 
                     onValueChange={([v]) => setSmartBookCriteria({...smartBookCriteria, attendees: v})} 
                     max={20} 
                     step={1} 
                     className="py-2"
                   />
                   <div className="text-xs text-slate-500 text-right">{smartBookCriteria.attendees} People</div>
                </div>
                <div className="space-y-2">
                   <Label>Required Amenities</Label>
                   <div className="flex flex-wrap gap-2">
                      {['Video Conf', 'Whiteboard', 'Coffee'].map(a => (
                         <Badge 
                           key={a} 
                           variant={smartBookCriteria.amenities.includes(a) ? "default" : "outline"} 
                           className="cursor-pointer hover:opacity-80"
                           onClick={() => {
                              const newAmenities = smartBookCriteria.amenities.includes(a) 
                                 ? smartBookCriteria.amenities.filter(am => am !== a)
                                 : [...smartBookCriteria.amenities, a];
                              setSmartBookCriteria({...smartBookCriteria, amenities: newAmenities});
                           }}
                        >
                           {a}
                        </Badge>
                      ))}
                   </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={performSmartSearch} className="w-full sm:w-auto">
                     <Search size={14} className="mr-2" /> Search Availability
                  </Button>
                </div>

                {smartBookResults.length > 0 && (
                   <div className="mt-4 border-t pt-4">
                      <Label className="mb-2 block">Available Spaces</Label>
                      <ScrollArea className="h-[200px] border rounded-md p-2">
                         <div className="space-y-2">
                            {smartBookResults.map(space => (
                               <div key={space.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md border border-transparent hover:border-slate-100 transition-colors">
                                  <div className="flex items-center gap-3">
                                     <img src={space.image} className="w-10 h-10 rounded-md object-cover" />
                                     <div>
                                        <div className="font-medium text-sm">{space.name}</div>
                                        <div className="text-xs text-slate-500">{space.type} • Capacity: {space.capacity}</div>
                                     </div>
                                  </div>
                                  <Button size="sm" onClick={() => handleSmartBookConfirm(space)}>Book</Button>
                               </div>
                            ))}
                         </div>
                      </ScrollArea>
                   </div>
                )}
             </div>
          </DialogContent>
       </Dialog>

       {/* Report Issue Dialog */}
       <Dialog open={isReportIssueOpen} onOpenChange={setReportIssueOpen}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Report Issue</DialogTitle>
               <DialogDescription>Log a maintenance request for {issueSpace?.name}. This will block the space for the rest of the day.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid gap-2">
                  <Label>Issue Type</Label>
                  <Select>
                     <SelectTrigger><SelectValue placeholder="Select issue type" /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="cleaning">Cleaning Required</SelectItem>
                        <SelectItem value="equipment">Equipment Failure</SelectItem>
                        <SelectItem value="hvac">HVAC / Temperature</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the issue..." />
               </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setReportIssueOpen(false)}>Cancel</Button>
               <Button variant="destructive" onClick={submitIssue}>Log Issue & Block Space</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* View Booking Details Dialog */}
       <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden text-left">
             {selectedBooking && (
                <>
                   <div className={cn("h-4 w-full", getBookingColor(selectedBooking.type, selectedBooking.status).split(' ')[0])} />
                   
                   <DialogHeader className="px-6 pt-6 pb-2 text-left">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <div className="flex items-center gap-2">
                               <DialogTitle className="text-xl font-bold">{selectedBooking.title}</DialogTitle>
                               {selectedBooking.recurrence && selectedBooking.recurrence !== 'none' && (
                                  <Badge variant="secondary" className="text-[10px] h-5 px-1"><Repeat size={10} className="mr-1" /> Recurring</Badge>
                               )}
                               {selectedBooking.status === 'checked-in' && (
                                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><CheckCircle2 size={10} className="mr-1" /> Checked In</Badge>
                               )}
                               {selectedBooking.status === 'pending' && (
                                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50"><Clock size={10} className="mr-1" /> Pending Approval</Badge>
                               )}
                               {selectedBooking.status === 'cancelled' && (
                                  <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Cancelled</Badge>
                               )}
                            </div>
                            <DialogDescription className="text-sm text-slate-500">
                               Organized by {selectedBooking.organizer}
                            </DialogDescription>
                         </div>
                         <Badge variant="outline">{selectedBooking.type.toUpperCase()}</Badge>
                      </div>
                   </DialogHeader>

                   <div className="p-6 pt-2">
                      <div className="space-y-4 mb-6">
                         <div className="flex items-center gap-3 text-sm">
                            <Clock className="text-slate-400" size={16} />
                            <span>{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm">
                            <CalendarIcon className="text-slate-400" size={16} />
                            <span>{format(selectedBooking.date, 'EEEE, MMMM d, yyyy')}</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm">
                            <MapPin className="text-slate-400" size={16} />
                            <span>{spaces.find(s => s.id === selectedBooking.spaceId)?.name}</span>
                         </div>
                         {selectedBooking.status === 'pending' && (
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-md text-sm text-amber-800 flex gap-2">
                               <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                               <div>
                                  <span className="font-semibold block">Approval Required</span>
                                  This booking is pending confirmation from the facility team.
                               </div>
                            </div>
                         )}
                      </div>
                      <div className="flex gap-3">
                         {selectedBooking.status === 'pending' && (
                            <div className="flex w-full gap-2">
                               <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => { handleApproveBooking(selectedBooking.id); setDetailsOpen(false); }}>
                                  Approve
                               </Button>
                               <Button variant="outline" className="flex-1 text-red-600" onClick={() => { handleRejectBooking(selectedBooking.id); setDetailsOpen(false); }}>
                                  Reject
                               </Button>
                            </div>
                         )}
                         {selectedBooking.status !== 'checked-in' && selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'pending' && (
                            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCheckIn(selectedBooking.id)}>
                               <LogIn size={14} className="mr-2" /> Check In
                            </Button>
                         )}
                         {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'rejected' && (
                           <Button 
                              className={cn("flex-1", selectedBooking.status === 'pending' ? "hidden" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300")}
                              variant="outline"
                              onClick={() => handleDeleteBooking(selectedBooking.id)}
                           >
                              <Trash2 size={16} className="mr-2" /> Cancel Booking
                           </Button>
                         )}
                      </div>
                   </div>
                </>
             )}
          </DialogContent>
       </Dialog>

       {/* Space Edit Sheet */}
       <Sheet open={isSpaceEditOpen} onOpenChange={setSpaceEditOpen}>
          <SheetContent>
             <SheetHeader>
                <SheetTitle>Edit Space</SheetTitle>
                <SheetDescription>Update configuration for {editingSpace?.name}</SheetDescription>
             </SheetHeader>
             {editingSpace && (
                <div className="grid gap-4 py-4">
                   <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={editingSpace.name} onChange={(e) => setEditingSpace({ ...editingSpace, name: e.target.value })} />
                   </div>
                   <div className="grid gap-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input id="capacity" type="number" value={editingSpace.capacity} onChange={(e) => setEditingSpace({ ...editingSpace, capacity: parseInt(e.target.value) })} />
                   </div>
                   <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={editingSpace.status} onValueChange={(v: any) => setEditingSpace({ ...editingSpace, status: v })}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="cleaning">Cleaning Required</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="flex items-center space-x-2 border p-3 rounded-md">
                      <Switch 
                         id="requires-approval" 
                         checked={editingSpace.requiresApproval || false} 
                         onCheckedChange={(checked) => setEditingSpace({ ...editingSpace, requiresApproval: checked })}
                      />
                      <div className="flex-1">
                         <Label htmlFor="requires-approval" className="cursor-pointer">Require Approval</Label>
                         <div className="text-[10px] text-slate-500">Bookings must be approved by an admin.</div>
                      </div>
                   </div>
                   <div className="grid gap-2">
                      <Label>Amenities</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                         {AMENITIES_LIST.map(a => (
                            <div key={a} className="flex items-center space-x-2">
                               <Checkbox 
                                  id={`edit-amenity-${a}`}
                                  checked={editingSpace.amenities.includes(a)}
                                  onCheckedChange={(checked) => {
                                     const newAmenities = checked 
                                        ? [...editingSpace.amenities, a]
                                        : editingSpace.amenities.filter(am => am !== a);
                                     setEditingSpace({ ...editingSpace, amenities: newAmenities });
                                  }}
                               />
                               <label htmlFor={`edit-amenity-${a}`} className="text-xs">{a}</label>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}
             <SheetFooter>
                <Button onClick={saveSpaceChanges}>Save Changes</Button>
             </SheetFooter>
          </SheetContent>
       </Sheet>
    </div>
  );
};
