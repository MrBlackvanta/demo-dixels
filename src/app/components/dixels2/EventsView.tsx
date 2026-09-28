import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  Heart, 
  Share2, 
  ArrowRight, 
  Video, 
  Mic, 
  Coffee, 
  Zap, 
  Ticket, 
  ChevronRight, 
  MoreHorizontal, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  List, 
  Grid, 
  CalendarDays,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parse 
} from 'date-fns';

// --- Mock Data ---

const CATEGORIES = [
  { id: 'all', label: 'All Events' },
  { id: 'learning', label: 'Learning & Dev' },
  { id: 'social', label: 'Social & Fun' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'townhall', label: 'Town Halls' },
];

const INITIAL_EVENTS = [
  {
    id: 'e1',
    title: 'Global Tech Summit 2024',
    category: 'Learning & Dev',
    date: 'Oct 24, 2024',
    time: '09:00 AM - 05:00 PM',
    location: 'Main Auditorium & Virtual',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    organizer: 'Tech Guild',
    attendees: 450,
    price: 'Free',
    isRegistered: true,
    description: 'Join us for our annual flagship technology conference featuring keynote speakers from industry leaders, breakout sessions on AI, Cloud Native, and Security, and networking opportunities.',
    tags: ['Technology', 'Innovation', 'Keynote']
  },
  {
    id: 'e2',
    title: 'Wellness Wednesday: Yoga Flow',
    category: 'Wellness',
    date: 'Oct 25, 2024',
    time: '08:00 AM - 09:00 AM',
    location: 'Roof Garden',
    image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&q=80',
    organizer: 'Wellness Committee',
    attendees: 24,
    price: 'Free',
    isRegistered: false,
    description: 'Start your day centered and energized with our weekly morning yoga session. Suitable for all levels. Mats provided.',
    tags: ['Health', 'Fitness', 'Mindfulness']
  },
  {
    id: 'e3',
    title: 'Q4 All-Hands Meeting',
    category: 'Town Halls',
    date: 'Oct 28, 2024',
    time: '02:00 PM - 03:30 PM',
    location: 'Virtual Stream',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    organizer: 'Executive Team',
    attendees: 1200,
    price: 'Mandatory',
    isRegistered: true,
    description: 'Quarterly business review, strategic updates for the upcoming year, and employee recognition awards.',
    tags: ['Company Update', 'Strategy']
  },
  {
    id: 'e4',
    title: 'Barista Workshop: Latte Art',
    category: 'Social & Fun',
    date: 'Oct 30, 2024',
    time: '04:00 PM - 05:30 PM',
    location: 'Smart Café',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    organizer: 'Café Team',
    attendees: 12,
    price: '$15',
    isRegistered: false,
    description: 'Learn the secrets of pouring the perfect rosetta. Includes tasting and a bag of beans to take home.',
    tags: ['Social', 'Coffee', 'Workshop']
  },
  {
    id: 'e5',
    title: 'Design Thinking Masterclass',
    category: 'Learning & Dev',
    date: 'Nov 02, 2024',
    time: '01:00 PM - 04:00 PM',
    location: 'Innovation Lab',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80',
    organizer: 'Product Design',
    attendees: 35,
    price: 'Free',
    isRegistered: false,
    description: 'A hands-on workshop applying design thinking principles to real-world business challenges.',
    tags: ['Design', 'Workshop', 'Product']
  }
];

export const EventsView: React.FC = () => {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<typeof INITIAL_EVENTS[0] | null>(null);
  const [isHostOpen, setHostOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'browse' | 'schedule' | 'calendar'>('browse');
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 9)); // October 2024
  const [isShareOpen, setShareOpen] = useState(false);

  // Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Social & Fun',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error('Please fill in required fields');
      return;
    }

    const createdEvent = {
      id: `e${Date.now()}`,
      ...newEvent,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80', // Default placeholder
      organizer: 'You',
      attendees: 1,
      price: 'Free',
      isRegistered: true,
      tags: ['New']
    };

    setEvents([createdEvent, ...events]);
    setHostOpen(false);
    toast.success('Event hosted successfully!');
    setNewEvent({ title: '', category: 'Social & Fun', date: '', time: '', location: '', description: '' });
  };

  const handleRegister = (eventId: string, isRegistered: boolean) => {
    setEvents(events.map(e => {
        if (e.id === eventId) {
            return {
                ...e,
                isRegistered: !isRegistered,
                attendees: isRegistered ? e.attendees - 1 : e.attendees + 1
            };
        }
        return e;
    }));
    
    if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(prev => prev ? ({
            ...prev,
            isRegistered: !isRegistered,
            attendees: isRegistered ? prev.attendees - 1 : prev.attendees + 1
        }) : null);
    }

    toast.success(isRegistered ? "Registration cancelled" : "You're going!");
  };

  const filteredEvents = events.filter(event => {
    // If in Schedule mode, only show registered events
    if (viewMode === 'schedule' && !event.isRegistered) return false;

    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'learning' && event.category.includes('Learning')) ||
      (selectedCategory === 'social' && event.category.includes('Social')) ||
      (selectedCategory === 'wellness' && event.category.includes('Wellness')) ||
      (selectedCategory === 'townhall' && event.category.includes('Town'));
    
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featuredEvent = events[0];

  // Calendar Helpers
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
            {/* Calendar Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h3>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft size={16} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRightIcon size={16} />
                        </Button>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(2024, 9))}>Today</Button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
                {calendarDays.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const dayEvents = events.filter(e => {
                        // Parse mock date "Oct 24, 2024"
                        try {
                            const eventDate = parse(e.date, 'MMM dd, yyyy', new Date());
                            return isSameDay(eventDate, day);
                        } catch {
                            return false;
                        }
                    });

                    return (
                        <div 
                            key={day.toString()} 
                            className={cn(
                                "border-r border-b border-slate-100 p-2 min-h-[100px] flex flex-col gap-1 transition-colors hover:bg-slate-50",
                                !isCurrentMonth && "bg-slate-50/50 text-slate-400"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                                isSameDay(day, new Date(2024, 9, 24)) ? "bg-teal-600 text-white" : "text-slate-700"
                            )}>
                                {format(day, 'd')}
                            </span>
                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                                {dayEvents.map(event => (
                                    <button 
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={cn(
                                            "text-[10px] text-left px-2 py-1 rounded truncate w-full font-medium transition-colors",
                                            event.category.includes('Learning') ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                                            event.category.includes('Wellness') ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                                            event.category.includes('Town') ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" :
                                            "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                        )}
                                    >
                                        {event.time.split(' - ')[0]} {event.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  if (selectedEvent) {
    return (
      <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto">
          {/* Hero Header */}
          <div className="relative h-80 w-full shrink-0">
             <img src={selectedEvent.image} className="w-full h-full object-cover" alt="Cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
             
             <Button variant="secondary" size="sm" className="absolute top-6 left-6 z-10 gap-2 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md" onClick={() => setSelectedEvent(null)}>
                <ArrowLeft size={16} /> Back to Events
             </Button>

             <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-5xl mx-auto">
                   <div className="flex items-start justify-between">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2">
                            <Badge className="bg-teal-500 hover:bg-teal-600 text-white border-none">{selectedEvent.category}</Badge>
                            {selectedEvent.isRegistered && (
                               <Badge variant="outline" className="bg-emerald-500/20 text-emerald-100 border-emerald-500/50 gap-1">
                                  <CheckCircle2 size={12} /> Registered
                               </Badge>
                            )}
                         </div>
                         <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none shadow-sm">{selectedEvent.title}</h1>
                         <div className="flex items-center gap-6 text-slate-200 text-lg">
                            <div className="flex items-center gap-2"><CalendarIcon size={20} className="text-teal-400"/> {selectedEvent.date}</div>
                            <div className="flex items-center gap-2"><Clock size={20} className="text-teal-400"/> {selectedEvent.time}</div>
                            <div className="flex items-center gap-2"><MapPin size={20} className="text-teal-400"/> {selectedEvent.location}</div>
                         </div>
                      </div>
                      
                      <div className="hidden md:block bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center min-w-[120px]">
                         <div className="text-3xl font-bold text-white">{selectedEvent.date.split(' ')[1].replace(',','')}</div>
                         <div className="text-sm font-medium text-slate-300 uppercase tracking-wider">{selectedEvent.date.split(' ')[0]}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                <div className="prose prose-slate max-w-none">
                   <h3 className="text-xl font-bold text-slate-900 mb-4">About this Event</h3>
                   <p className="text-slate-600 leading-relaxed text-lg">{selectedEvent.description}</p>
                   <p className="text-slate-600 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                   </p>
                </div>

                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-4">Agenda Highlights</h3>
                   <div className="space-y-4">
                      {[1,2,3].map((i) => (
                         <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-teal-200 transition-colors">
                            <div className="w-16 flex flex-col items-center justify-center border-r border-slate-100 pr-4">
                               <span className="text-sm font-bold text-slate-900">10:00</span>
                               <span className="text-xs text-slate-500">AM</span>
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-900">Keynote Session {i}</h4>
                               <p className="text-sm text-slate-500">Main Hall • Speaker Name</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <Card className="border-slate-200 shadow-md sticky top-6">
                   <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                         <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Registration</div>
                         <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">{selectedEvent.price}</span>
                            {selectedEvent.price !== 'Free' && <span className="text-sm text-slate-500">/ person</span>}
                         </div>
                      </div>

                      <div className="space-y-3">
                         {selectedEvent.isRegistered ? (
                            <Button 
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2" 
                                size="lg"
                                onClick={() => handleRegister(selectedEvent.id, true)}
                            >
                               <CheckCircle2 size={18} /> You're Going!
                            </Button>
                         ) : (
                            <Button 
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2" 
                                size="lg" 
                                onClick={() => handleRegister(selectedEvent.id, false)}
                            >
                               <Ticket size={18} /> Register Now
                            </Button>
                         )}
                         <Button variant="outline" className="w-full gap-2" onClick={() => setShareOpen(true)}>
                            <Share2 size={18} /> Share Event
                         </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                         <h4 className="font-bold text-slate-900 flex items-center gap-2"><Users size={16}/> {selectedEvent.attendees} Attending</h4>
                         <div className="flex -space-x-2 overflow-hidden">
                            {[1,2,3,4,5].map(i => (
                               <Avatar key={i} className="border-2 border-white w-8 h-8">
                                  <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedEvent.id}${i}`} />
                                  <AvatarFallback>U</AvatarFallback>
                               </Avatar>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-600 border-2 border-white font-medium">
                               +42
                            </div>
                         </div>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 leading-relaxed">
                         Organized by <span className="font-bold text-slate-700">{selectedEvent.organizer}</span>. 
                         For questions, contact the event team directly through the Service Hub.
                      </div>
                   </CardContent>
                </Card>
             </div>
          </div>
        </div>

        {/* Share Dialog */}
        <Dialog open={isShareOpen} onOpenChange={setShareOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Event</DialogTitle>
                    <DialogDescription>Invite colleagues to join you at this event.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Invite Colleagues</Label>
                        <Input placeholder="Search by name or email..." />
                    </div>
                    <div className="text-sm text-slate-500">
                        Suggested:
                        <div className="flex gap-2 mt-2">
                            {['Alice', 'Bob', 'Charlie'].map(name => (
                                <Badge key={name} variant="outline" className="cursor-pointer hover:bg-slate-50">
                                    <Plus size={12} className="mr-1"/> {name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShareOpen(false)}>Cancel</Button>
                    <Button onClick={() => { toast.success('Invitations sent!'); setShareOpen(false); }}>Send Invites</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
        <div>
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="text-teal-600" size={24} />
              Events
           </h2>
           <p className="text-xs text-slate-500">Discover, learn, and connect</p>
        </div>
        
        {/* View Toggle */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <Button 
                variant={viewMode === 'browse' ? 'white' : 'ghost'} 
                size="sm" 
                className={cn("h-8 text-xs gap-2", viewMode === 'browse' && "shadow-sm")}
                onClick={() => setViewMode('browse')}
            >
                <Grid size={14} /> Browse
            </Button>
            <Button 
                variant={viewMode === 'calendar' ? 'white' : 'ghost'} 
                size="sm" 
                className={cn("h-8 text-xs gap-2", viewMode === 'calendar' && "shadow-sm")}
                onClick={() => setViewMode('calendar')}
            >
                <CalendarIcon size={14} /> Calendar
            </Button>
            <Button 
                variant={viewMode === 'schedule' ? 'white' : 'ghost'} 
                size="sm" 
                className={cn("h-8 text-xs gap-2", viewMode === 'schedule' && "shadow-sm")}
                onClick={() => setViewMode('schedule')}
            >
                <List size={14} /> My Schedule
            </Button>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative w-48 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                 placeholder="Search events..." 
                 className="pl-9 h-9 bg-slate-50 border-slate-200"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <Button className="bg-slate-900 text-white gap-2" onClick={() => setHostOpen(true)}>
              <Plus size={16} /> Host Event
           </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
         <div className="p-6 max-w-7xl mx-auto space-y-8">
            
            {/* Featured Hero (Only in Browse Mode) */}
            {viewMode === 'browse' && !searchQuery && (
               <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[21/9] md:aspect-[24/8] shadow-lg group cursor-pointer" onClick={() => setSelectedEvent(featuredEvent)}>
                  <img 
                     src={featuredEvent.image} 
                     alt="Featured" 
                     className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center items-start max-w-2xl">
                     <Badge className="bg-teal-500 text-white border-none mb-4 hover:bg-teal-600">Featured Event</Badge>
                     <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{featuredEvent.title}</h2>
                     <p className="text-slate-200 text-lg mb-8 line-clamp-2">{featuredEvent.description}</p>
                     <div className="flex items-center gap-6 text-white font-medium mb-8">
                        <div className="flex items-center gap-2"><CalendarIcon size={18} className="text-teal-400"/> {featuredEvent.date}</div>
                        <div className="flex items-center gap-2"><MapPin size={18} className="text-teal-400"/> {featuredEvent.location}</div>
                     </div>
                     <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 border-none gap-2">
                        View Details <ArrowRight size={16} />
                     </Button>
                  </div>
               </div>
            )}

            {/* Filter Tabs - Hide in Calendar View to save space/reduce complexity */}
            {viewMode !== 'calendar' && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                    <TabsList className="bg-transparent p-0 h-auto gap-2">
                        {CATEGORIES.map(cat => (
                            <TabsTrigger 
                            key={cat.id} 
                            value={cat.id}
                            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 data-[state=active]:shadow-none rounded-full border border-transparent data-[state=active]:border-teal-200 px-4 py-2"
                            >
                            {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-900">
                    <Filter size={14} /> More Filters
                </Button>
                </div>
            )}

            {/* Content Switcher */}
            {viewMode === 'calendar' ? (
                renderCalendar()
            ) : viewMode === 'schedule' ? (
                // --- SCHEDULE VIEW (List Layout) ---
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Your Upcoming Agenda</h3>
                    {filteredEvents.length > 0 ? filteredEvents.map(event => (
                        <div key={event.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-6 hover:border-teal-300 transition-colors group cursor-pointer" onClick={() => setSelectedEvent(event)}>
                            <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative hidden md:block">
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                    {event.date}
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50">{event.category}</Badge>
                                    <span className="text-xs text-slate-400">•</span>
                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Clock size={12}/> {event.time}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-xl group-hover:text-teal-700 transition-colors mb-2">{event.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1.5"><MapPin size={16} /> {event.location}</div>
                                    <div className="flex items-center gap-1.5"><Users size={16} /> {event.attendees} attendees</div>
                                </div>
                            </div>
                            <div className="self-center flex flex-col items-end gap-2">
                                <Button variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 gap-2">
                                    <CheckCircle2 size={16} /> Going
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <CalendarDays size={32} />
                             </div>
                             <h3 className="text-lg font-bold text-slate-900">Your schedule is empty</h3>
                             <p className="text-slate-500 mb-6">Browse events and RSVP to see them here.</p>
                             <Button onClick={() => setViewMode('browse')}>Browse Events</Button>
                        </div>
                    )}
                </div>
            ) : (
                // --- BROWSE VIEW (Grid Layout) ---
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map(event => (
                    <Card key={event.id} className="group overflow-hidden border-slate-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer h-full flex flex-col" onClick={() => setSelectedEvent(event)}>
                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-900 shadow-sm">
                            {event.price}
                            </div>
                            {event.category.includes('Town') && (
                            <div className="absolute top-3 left-3 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
                                <Video size={10} /> Corporate
                            </div>
                            )}
                            {event.isRegistered && (
                                <div className="absolute bottom-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Going
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col">
                            <div className="text-xs font-semibold text-teal-600 mb-2 uppercase tracking-wide">{event.category}</div>
                            <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors">{event.title}</h3>
                            <div className="space-y-2 mb-4 flex-1">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <CalendarIcon size={14} /> {event.date}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock size={14} /> {event.time.split(' - ')[0]}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <MapPin size={14} /> {event.location}
                            </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${event.id}${i}`} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                ))}
                                {event.attendees > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 border-2 border-white">
                                        +{event.attendees - 3}
                                    </div>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-teal-50 hover:text-teal-700">
                                Details <ChevronRight size={14} />
                            </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                </div>
            )}

            {filteredEvents.length === 0 && viewMode === 'browse' && (
               <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                     <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No events found</h3>
                  <p className="text-slate-500">Try adjusting your filters or search terms.</p>
               </div>
            )}
         </div>
      </div>

      {/* Host Event Dialog */}
      <Dialog open={isHostOpen} onOpenChange={setHostOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Host an Event</DialogTitle>
                <DialogDescription>Create a new event to share with the community. All events are subject to approval.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Title</Label>
                    <Input className="col-span-3" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Weekly Design Crit" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Category</Label>
                    <Select value={newEvent.category} onValueChange={v => setNewEvent({...newEvent, category: v})}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                <SelectItem key={c.id} value={c.label}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Date & Time</Label>
                    <div className="col-span-3 flex gap-2">
                        <Input type="date" className="flex-1" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                        <Input type="time" className="flex-1" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Location</Label>
                    <Input className="col-span-3" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="e.g. Meeting Room 3B" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Description</Label>
                    <Textarea className="col-span-3" rows={4} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Tell people what this event is about..." />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setHostOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateEvent} className="bg-slate-900 text-white">Create Event</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
