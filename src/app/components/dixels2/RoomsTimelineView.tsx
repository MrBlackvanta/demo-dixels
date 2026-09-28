import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Settings,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Video,
  Wifi,
  Monitor,
  Coffee,
  MapPin,
  Lock,
  Grid,
  List,
  Maximize2,
  Building,
  UserPlus,
  Check,
  X,
  Zap,
  Armchair,
  Tv,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { cn } from '../ui/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

// --- Types ---

export interface RoomSchedule {
  id: string;
  name: string;
  floor: string;
  building: string;
  capacity: number;
  features: string[];
  schedule?: Array<{ 
    start: number; 
    duration: number; 
    title: string; 
    organizer?: string; // Name of organizer
    owner?: string;     // ID or Name of owner ('Me' for current user)
    attendees?: string[]; // List of attendee IDs/Names
    private?: boolean;
    type?: string;
  }>;
  distance?: number;
  type?: string;
}

interface RoomsTimelineViewProps {
  filteredRooms: RoomSchedule[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  handleRoomGridClick: (roomId: string, hour: number) => void;
}

interface Colleague {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  department: string;
}

// --- Mock Data ---

const COLLEAGUES: Colleague[] = [
  { id: 'c1', name: 'Sarah Chen', avatar: 'SC', status: 'online', department: 'Engineering' },
  { id: 'c2', name: 'John Doe', avatar: 'JD', status: 'busy', department: 'Product' },
  { id: 'c3', name: 'Mike Ross', avatar: 'MR', status: 'offline', department: 'Sales' },
  { id: 'c4', name: 'Elena Rodriguez', avatar: 'ER', status: 'online', department: 'Design' },
  { id: 'c5', name: 'David Kim', avatar: 'DK', status: 'online', department: 'Engineering' },
  { id: 'c6', name: 'Amanda Smith', avatar: 'AS', status: 'busy', department: 'Marketing' },
  { id: 'c7', name: 'James Wilson', avatar: 'JW', status: 'offline', department: 'Finance' },
  { id: 'c8', name: 'Maria Garcia', avatar: 'MG', status: 'online', department: 'HR' },
];

const AMENITIES_LIST = [
  { id: 'Video Conf', label: 'Video Conf', icon: Video },
  { id: 'Whiteboard', label: 'Whiteboard', icon: Monitor },
  { id: 'Catering', label: 'Catering', icon: Coffee },
  { id: 'Smart Board', label: 'Smart Board', icon: Tv },
  { id: 'Phone Bridge', label: 'Phone Bridge', icon: Wifi },
];

const SPACE_TYPES = ['Conference', 'Huddle', 'Phone Booth', 'Board Room', 'Training Room', 'Desk'];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// --- Helpers ---

// Mock function to generate busy slots for a colleague on a given date
const getColleagueSchedule = (colleagueId: string, date: Date) => {
  // Deterministic pseudo-random based on ID and Date
  const seed = colleagueId.charCodeAt(0) + date.getDate();
  const busySlots: { start: number; duration: number }[] = [];
  
  const numEvents = (seed % 4) + 1; // 1-4 events
  for (let i = 0; i < numEvents; i++) {
    const start = 9 + ((seed * (i + 1)) % 8); // Between 9 and 17
    const duration = 1 + ((seed * (i + 2)) % 2); // 1-2 hours
    busySlots.push({ start, duration });
  }
  return busySlots;
};

export const RoomsTimelineView: React.FC<RoomsTimelineViewProps> = ({
  filteredRooms,
  currentDate,
  setCurrentDate,
  handleRoomGridClick
}) => {
  // --- State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColleagues, setSelectedColleagues] = useState<string[]>([]);
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAvailableNow, setShowAvailableNow] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [zoomLevel, setZoomLevel] = useState(1);

  // --- Derived Data ---

  // Unique floors
  const floors = useMemo(() => {
    const uniqueFloors = Array.from(new Set(filteredRooms.map(r => r.floor))).sort();
    return ['all', ...uniqueFloors];
  }, [filteredRooms]);

  const hasActiveFilters = searchQuery || floorFilter !== 'all' || minCapacity > 0 || selectedTypes.length > 0 || selectedAmenities.length > 0 || showAvailableNow || showMyBookings || selectedColleagues.length > 0;

  const resetFilters = () => {
      setSearchQuery('');
      setFloorFilter('all');
      setMinCapacity(0);
      setSelectedTypes([]);
      setSelectedAmenities([]);
      setSelectedColleagues([]);
      setShowAvailableNow(false);
      setShowMyBookings(false);
  };

  // Current Time (for "Available Now")
  const currentHour = new Date().getHours();

  // Filtered Rooms Logic
  const displayRooms = useMemo(() => {
    return filteredRooms.filter(room => {
      // Search
      if (searchQuery && !room.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Floor
      if (floorFilter !== 'all' && room.floor !== floorFilter) {
        return false;
      }

      // Capacity
      if (minCapacity > 0 && room.capacity < minCapacity) {
        return false;
      }

      // Space Type
      if (selectedTypes.length > 0 && (!room.type || !selectedTypes.includes(room.type))) {
        return false;
      }

      // Amenities
      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every(a => room.features.includes(a));
        if (!hasAll) return false;
      }

      // Available Now
      if (showAvailableNow) {
        const isBusyNow = room.schedule?.some(s => 
          currentHour >= s.start && currentHour < s.start + s.duration
        );
        if (isBusyNow) return false;
      }

      // My Bookings
      if (showMyBookings) {
        const hasMyBooking = room.schedule?.some(s => s.owner === 'Me' || s.attendees?.includes('Me'));
        if (!hasMyBooking) return false;
      }

      // Team Availability Filter (Implicit: if finding for team, show rooms that can fit team)
      if (selectedColleagues.length > 0) {
        // Optional: Filter by capacity to fit team?
        // Let's assume user wants to see all rooms, but highlights show availability
        // But logical to filter out rooms too small for the group + me
        if (room.capacity < selectedColleagues.length + 1) {
           // Can uncomment to enforce capacity
           // return false; 
        }
      }

      return true;
    }).slice(0, 50); // Performance limit
  }, [filteredRooms, searchQuery, floorFilter, minCapacity, selectedTypes, selectedAmenities, showAvailableNow, showMyBookings, selectedColleagues, currentHour]);

  // --- Handlers ---

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleColleague = (id: string) => {
    setSelectedColleagues(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // --- Render ---

  return (
    <TooltipProvider>
      <div className="flex h-full bg-slate-50/50 overflow-hidden select-none relative">
        
        {/* Left Sidebar - Advanced Filters */}
        <div className={cn(
          "bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-20 h-full transition-all duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] overflow-hidden",
          isSidebarOpen ? "w-[280px]" : "w-14 items-center"
        )}>
          {/* Sidebar Header */}
          <div className={cn(
            "border-b border-slate-100 flex items-center flex-shrink-0 h-14",
            isSidebarOpen ? "justify-between px-4" : "justify-center px-0 w-full"
          )}>
            {isSidebarOpen ? (
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Filter size={16} className="text-teal-600" />
                <span className="text-sm">Filters</span>
                {hasActiveFilters && (
                    <button 
                        onClick={resetFilters}
                        className="text-[10px] text-slate-500 hover:text-red-500 underline ml-2 transition-colors"
                    >
                        Reset
                    </button>
                )}
              </div>
            ) : (
              <Filter size={16} className="text-teal-600" />
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded transition-colors text-slate-500"
            >
              {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            </button>
          </div>

          {/* Sidebar Content */}
          {isSidebarOpen && (
            <ScrollArea className="flex-1 min-h-0 w-full">
              <div className="p-4 space-y-6 pb-20">
                
                {/* 1. Availability & Personal */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <Label htmlFor="available-now" className="text-sm font-medium text-slate-700">Available Now Only</Label>
                      <Switch 
                         id="available-now" 
                         checked={showAvailableNow} 
                         onCheckedChange={setShowAvailableNow} 
                         className="data-[state=checked]:bg-teal-600"
                      />
                   </div>
                   <div className="flex items-center justify-between">
                      <Label htmlFor="my-bookings" className="text-sm font-medium text-slate-700">My Bookings</Label>
                      <Switch 
                         id="my-bookings" 
                         checked={showMyBookings} 
                         onCheckedChange={setShowMyBookings}
                         className="data-[state=checked]:bg-teal-600"
                      />
                   </div>
                </div>

                <Separator />

                {/* 2. Team / Colleagues */}
                <div className="space-y-3">
                   <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Find for Colleagues</Label>
                   <p className="text-[10px] text-slate-500 mb-2">Select colleagues to see rooms available for everyone.</p>
                   
                   <Popover>
                      <PopoverTrigger asChild>
                         <Button variant="outline" className="w-full justify-start text-left font-normal text-slate-600 border-slate-200 hover:border-teal-500 hover:text-teal-700">
                            <Users className="mr-2 h-4 w-4" />
                            {selectedColleagues.length > 0 ? `${selectedColleagues.length} selected` : "Select colleagues..."}
                         </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[240px]" align="start">
                         <Command>
                            <CommandInput placeholder="Search colleagues..." />
                            <CommandList>
                               <CommandEmpty>No colleague found.</CommandEmpty>
                               <CommandGroup>
                                  {COLLEAGUES.map(colleague => (
                                     <CommandItem
                                        key={colleague.id}
                                        onSelect={() => toggleColleague(colleague.id)}
                                        className="cursor-pointer"
                                     >
                                        <div className={cn(
                                           "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300",
                                           selectedColleagues.includes(colleague.id) ? "bg-teal-600 border-teal-600 text-white" : "opacity-50 [&_svg]:invisible"
                                        )}>
                                           <Check className="h-3 w-3" />
                                        </div>
                                        <Avatar className="h-6 w-6 mr-2">
                                           <AvatarFallback className="text-[10px] bg-slate-100">{colleague.avatar}</AvatarFallback>
                                        </Avatar>
                                        <span className="flex-1 truncate">{colleague.name}</span>
                                     </CommandItem>
                                  ))}
                               </CommandGroup>
                            </CommandList>
                         </Command>
                      </PopoverContent>
                   </Popover>

                   {selectedColleagues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                         {selectedColleagues.map(id => {
                            const c = COLLEAGUES.find(x => x.id === id);
                            if(!c) return null;
                            return (
                               <Badge key={id} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 gap-1 pr-1 font-normal">
                                  {c.avatar}
                                  <span className="ml-1">{c.name.split(' ')[0]}</span>
                                  <button onClick={() => toggleColleague(id)} className="ml-1 hover:text-red-500"><X size={10} /></button>
                               </Badge>
                            );
                         })}
                      </div>
                   )}
                </div>

                <Separator />

                {/* 3. Room Criteria */}
                <div className="space-y-4">
                   <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Criteria</Label>
                   
                   {/* Floor */}
                   <div>
                      <Label className="text-xs text-slate-500 mb-1.5 block">Floor</Label>
                      <select
                        value={floorFilter}
                        onChange={(e) => setFloorFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-white hover:border-teal-500 focus:border-teal-500 focus:outline-none transition-colors"
                      >
                        {floors.map(floor => (
                          <option key={floor} value={floor}>
                            {floor === 'all' ? 'All Floors' : `Floor ${floor}`}
                          </option>
                        ))}
                      </select>
                   </div>

                   {/* Capacity */}
                   <div>
                      <div className="flex justify-between mb-1.5">
                         <Label className="text-xs text-slate-500">Min Capacity</Label>
                         <span className="text-xs font-medium text-slate-900">{minCapacity === 0 ? 'Any' : `${minCapacity} ppl`}</span>
                      </div>
                      <Slider 
                         value={[minCapacity]} 
                         onValueChange={(vals) => setMinCapacity(vals[0])} 
                         max={20} 
                         step={2} 
                         className="py-2"
                      />
                   </div>

                   {/* Space Type */}
                   <div>
                      <Label className="text-xs text-slate-500 mb-2 block">Space Type</Label>
                      <div className="flex flex-wrap gap-1.5">
                         {SPACE_TYPES.map(type => (
                            <button
                               key={type}
                               onClick={() => toggleType(type)}
                               className={cn(
                                  "px-2 py-1 rounded-md text-[10px] font-medium border transition-colors",
                                  selectedTypes.includes(type)
                                     ? "bg-teal-50 border-teal-200 text-teal-700"
                                     : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                               )}
                            >
                               {type}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Amenities */}
                   <div>
                      <Label className="text-xs text-slate-500 mb-2 block">Amenities</Label>
                      <div className="grid grid-cols-2 gap-2">
                         {AMENITIES_LIST.map(item => (
                            <button
                               key={item.id}
                               onClick={() => toggleAmenity(item.id)}
                               className={cn(
                                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] border transition-all text-left",
                                  selectedAmenities.includes(item.id)
                                     ? "bg-teal-50 border-teal-200 text-teal-700"
                                     : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                               )}
                            >
                               <item.icon size={12} />
                               <span className="truncate">{item.label}</span>
                            </button>
                         ))}
                      </div>
                   </div>
                </div>

                <Separator />
                
                {/* Stats */}
                <div className="text-[10px] text-slate-400 text-center">
                   Showing {displayRooms.length} rooms
                </div>

              </div>
            </ScrollArea>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white shadow-xl z-10 m-2 rounded-xl border border-slate-200">
          
          {/* Top Toolbar */}
          <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
            {/* Left: Date Navigation */}
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Timeline</h2>
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateDate('prev')} className="h-8 w-8">
                  <ChevronLeft size={14} />
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200 min-w-[140px] justify-center">
                  <Calendar size={14} className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-900">{formatDate(currentDate)}</span>
                </div>
                <Button variant="outline" size="icon" onClick={() => navigateDate('next')} className="h-8 w-8">
                   <ChevronRight size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs h-8">
                   Today
                </Button>
              </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-sm mx-8">
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              {viewMode === 'timeline' && (
                 <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 mr-2 items-center">
                    <button 
                       onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))} 
                       disabled={zoomLevel <= 0.5}
                       className="p-1.5 rounded-md hover:bg-white hover:text-teal-700 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                       <ZoomOut size={14} />
                    </button>
                    <span className="text-[10px] font-medium text-slate-500 w-[32px] text-center select-none">
                       {Math.round(zoomLevel * 100)}%
                    </span>
                    <button 
                       onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))} 
                       disabled={zoomLevel >= 3}
                       className="p-1.5 rounded-md hover:bg-white hover:text-teal-700 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                       <ZoomIn size={14} />
                    </button>
                 </div>
              )}

              <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === 'timeline' ? "bg-white shadow text-teal-700" : "hover:bg-slate-200 text-slate-600"
                  )}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === 'list' ? "bg-white shadow text-teal-700" : "hover:bg-slate-200 text-slate-600"
                  )}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-slate-50/50 relative">
             {displayRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                       <Search size={24} className="opacity-50" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">No rooms found</p>
                    <p className="text-sm mt-1 max-w-xs text-center">We couldn't find any rooms matching your filters. Try adjusting criteria.</p>
                    <Button 
                       variant="outline" 
                       className="mt-6"
                       onClick={resetFilters}
                    >
                       Clear All Filters
                    </Button>
                </div>
             ) : viewMode === 'list' ? (
                <div className="p-6 max-w-5xl mx-auto space-y-4 pb-20">
                  {displayRooms.map(room => {
                    // Calculate availability status
                    const now = new Date();
                    const isToday = currentDate.toDateString() === now.toDateString();
                    const currentH = now.getHours();
                    const currentM = now.getMinutes();
                    const currentDecimal = isToday ? currentH + currentM/60 : -1;
                    
                    const currentBooking = isToday ? room.schedule?.find(s => 
                       currentDecimal >= s.start && currentDecimal < s.start + s.duration
                    ) : null;
                    
                    // Team Availability Check
                    const teamBusyNow = isToday && selectedColleagues.length > 0 && selectedColleagues.some(id => {
                        const s = getColleagueSchedule(id, currentDate);
                        return s.some(b => currentDecimal >= b.start && currentDecimal < b.start + b.duration);
                    });
                    
                    const nextBooking = isToday ? room.schedule?.find(s => s.start > currentDecimal) : room.schedule?.[0];
                    
                    return (
                       <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                          {/* Info Column */}
                          <div className="sm:w-64 flex-shrink-0">
                             <div className="flex items-start justify-between mb-2">
                                <div>
                                   <h3 className="font-bold text-slate-900 text-lg">{room.name}</h3>
                                   <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                      <Building size={12} /> {room.floor}
                                      <span>•</span>
                                      <Users size={12} /> {room.capacity}
                                   </div>
                                </div>
                                {room.type && <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">{room.type}</Badge>}
                             </div>
                             
                             {/* Status Badge */}
                             <div className={cn(
                                "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium mb-4",
                                currentBooking 
                                   ? "bg-rose-50 text-rose-700" 
                                   : teamBusyNow
                                      ? "bg-amber-50 text-amber-700"
                                      : isToday && selectedColleagues.length > 0 
                                         ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                         : isToday ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"
                             )}>
                                <div className={cn("w-2 h-2 rounded-full", 
                                   currentBooking ? "bg-rose-500" 
                                   : teamBusyNow ? "bg-amber-500"
                                   : isToday && selectedColleagues.length > 0 ? "bg-emerald-500" 
                                   : isToday ? "bg-teal-500" : "bg-slate-400"
                                )} />
                                {currentBooking 
                                   ? "Busy Now" 
                                   : teamBusyNow 
                                      ? "Team Busy"
                                      : isToday && selectedColleagues.length > 0 
                                         ? "Best Match" 
                                         : isToday ? "Available" : "Viewing Schedule"
                                }
                             </div>
                             
                             {/* Features */}
                             <div className="flex flex-wrap gap-1.5">
                                {room.features.map(f => (
                                   <span key={f} className="text-[10px] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500">{f}</span>
                                ))}
                             </div>
                          </div>
                          
                          {/* Timeline Column */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                             {/* Mini Timeline Visualization */}
                             <div className="mb-4">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                   <span>9 AM</span>
                                   <span>12 PM</span>
                                   <span>3 PM</span>
                                   <span>6 PM</span>
                                </div>
                                <div className="h-8 bg-slate-50 rounded-md relative overflow-hidden border border-slate-100">
                                   {/* Team Availability Background Layer */}
                                   {selectedColleagues.length > 0 && HOURS.map(h => {
                                      // Check team busy for this hour
                                      const busyNames = selectedColleagues.filter(id => {
                                         const sched = getColleagueSchedule(id, currentDate);
                                         return sched.some(s => h >= s.start && h < s.start + s.duration);
                                      });
                                      const isTeamBusy = busyNames.length > 0;
                                      
                                      const left = ((h-9)/9)*100;
                                      const width = (1/9)*100;
                                      
                                      return (
                                         <div 
                                            key={`team-${h}`}
                                            className={cn(
                                               "absolute top-0 bottom-0 pointer-events-none transition-colors",
                                               isTeamBusy 
                                                  ? "bg-slate-200/50 pattern-diagonal-lines-sm opacity-50" 
                                                  : "bg-emerald-100/40"
                                            )}
                                            style={{ left: `${left}%`, width: `${width}%` }}
                                         />
                                      );
                                   })}

                                   {/* Hour markers */}
                                   {[9,10,11,12,13,14,15,16,17,18].map(h => (
                                      <div key={h} className="absolute top-0 bottom-0 w-px bg-slate-200" style={{ left: `${((h-9)/9)*100}%` }} />
                                   ))}
                                   
                                   {/* Current Time Marker */}
                                   {isToday && currentDecimal >= 9 && currentDecimal <= 18 && (
                                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${((currentDecimal-9)/9)*100}%` }} />
                                   )}
                                   
                                   {/* Bookings */}
                                   {room.schedule?.map((s, i) => {
                                      if (s.start + s.duration < 9 || s.start > 18) return null;
                                      const left = Math.max(0, (s.start - 9) / 9) * 100;
                                      const width = (s.duration / 9) * 100;
                                      // Clip width
                                      const maxWidth = 100 - left;
                                      const actualWidth = Math.min(width, maxWidth);
                                      
                                      return (
                                         <Tooltip key={i}>
                                            <TooltipTrigger asChild>
                                               <div 
                                                  className={cn("absolute top-1 bottom-1 rounded-sm", s.private ? "bg-slate-300 pattern-dots" : "bg-teal-200")}
                                                  style={{ left: `${left}%`, width: `${actualWidth}%` }}
                                               />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                               {s.private ? "Busy" : s.title} ({s.start}:00 - {s.start + s.duration}:00)
                                            </TooltipContent>
                                         </Tooltip>
                                      );
                                   })}
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-300 mt-1">
                                   <span>09:00</span>
                                   <span>12:00</span>
                                   <span>18:00</span>
                                </div>
                             </div>
                             
                             {/* Next Booking Info */}
                             <div className="flex items-center justify-between text-sm">
                                 <div className="text-slate-600">
                                    {currentBooking ? (
                                       <span>Busy until <span className="font-semibold text-slate-900">{currentBooking.start + currentBooking.duration}:00</span></span>
                                    ) : nextBooking ? (
                                       <span>Free until <span className="font-semibold text-slate-900">{nextBooking.start}:00</span></span>
                                    ) : (
                                       <span className="text-teal-600">Free for the rest of the day</span>
                                    )}
                                 </div>
                                 <Button size="sm" variant="outline" onClick={() => handleRoomGridClick(room.id, Math.floor(currentDecimal) + 1)}>
                                    Schedule
                                 </Button>
                             </div>
                          </div>
                       </div>
                    );
                  })}
                </div>
             ) : (
            <div style={{ minWidth: `${1600 * zoomLevel}px` }} className="pb-10 transition-all duration-300 ease-out">
              {/* Hour Headers */}
              <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex">
                  <div className="sticky left-0 z-50 w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50/95 backdrop-blur px-4 py-3 flex items-center justify-between shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Room
                    </span>
                    <Badge variant="outline" className="bg-white font-normal text-xs text-slate-400">{displayRooms.length}</Badge>
                  </div>
                  <div className="flex-1 flex relative">
                    {/* Current Time Indicator Line (Header part) */}
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-red-500 z-40 pointer-events-none"
                      style={{ 
                         left: `${((new Date().getHours() + new Date().getMinutes()/60) / 24) * 100}%`,
                         display: currentDate.toDateString() === new Date().toDateString() ? 'block' : 'none'
                      }} 
                    >
                       <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
                    </div>

                    {HOURS.map(hour => (
                      <div
                        key={hour}
                        className="flex-1 min-w-0 border-r border-slate-100 px-1 py-3 text-center group bg-white hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
                          {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Availability Header Row */}
                {selectedColleagues.length > 0 && (
                  <div className="flex border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
                    <div className="sticky left-0 z-40 w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50/95 backdrop-blur px-4 py-2 flex items-center justify-between shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Users size={12} />
                          Team Schedule
                       </span>
                    </div>
                    <div className="flex-1 flex relative">
                        {HOURS.map(hour => {
                           const busyColleagueNames = selectedColleagues
                             .filter(colleagueId => {
                               const schedule = getColleagueSchedule(colleagueId, currentDate);
                               return schedule.some(s => hour >= s.start && hour < s.start + s.duration);
                             })
                             .map(id => COLLEAGUES.find(c => c.id === id)?.name || id);
                           
                           const teamBusy = busyColleagueNames.length > 0;
                           
                           return (
                              <div 
                                 key={hour}
                                 className={cn(
                                    "flex-1 min-w-0 border-r border-slate-200/50 relative h-8 transition-colors flex items-center justify-center",
                                    teamBusy 
                                       ? "bg-slate-100 pattern-diagonal-lines-sm pattern-slate-200 cursor-help" 
                                       : "bg-emerald-50/30 hover:bg-emerald-50"
                                 )}
                              >
                                 {!teamBusy && (
                                    <Tooltip>
                                       <TooltipTrigger>
                                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                       </TooltipTrigger>
                                       <TooltipContent className="bg-emerald-600 text-white border-emerald-700">
                                          <p className="font-semibold">Team is Free</p>
                                          <p className="text-[10px] opacity-90">All selected colleagues are available.</p>
                                       </TooltipContent>
                                    </Tooltip>
                                 )}
                                 {teamBusy && (
                                    <Tooltip>
                                       <TooltipTrigger asChild>
                                          <div className="w-full h-full opacity-0 hover:opacity-100 flex items-center justify-center">
                                             <span className="text-[9px] font-bold text-slate-400">{busyColleagueNames.length}</span>
                                          </div>
                                       </TooltipTrigger>
                                       <TooltipContent>
                                          <div className="text-xs font-semibold mb-1">Busy Colleagues:</div>
                                          <ul className="list-disc pl-3 text-[10px]">
                                             {busyColleagueNames.map(name => <li key={name}>{name}</li>)}
                                          </ul>
                                       </TooltipContent>
                                    </Tooltip>
                                 )}
                              </div>
                           );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Room Rows */}
              <div className="divide-y divide-slate-100">
                {displayRooms.map((room, idx) => (
                  <div
                    key={room.id}
                    className="flex bg-white hover:bg-slate-50 transition-colors group"
                  >
                    {/* Room Info - Sticky & Compact */}
                    <div className="sticky left-0 z-20 w-64 flex-shrink-0 border-r border-slate-200 bg-white group-hover:bg-slate-50 transition-colors px-4 py-0 flex flex-col justify-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-between mb-1.5">
                         <Popover>
                            <PopoverTrigger asChild>
                               <div className="font-semibold text-sm text-slate-900 truncate cursor-pointer hover:text-teal-600 transition-colors" title={room.name}>
                                 {room.name}
                               </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0" align="start">
                               <div className="p-4">
                                  <h3 className="font-bold text-sm mb-1">{room.name}</h3>
                                  <p className="text-xs text-slate-500 mb-3">{room.building || 'Main Building'}, Floor {room.floor}</p>
                                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3">
                                     <div className="flex items-center gap-2">
                                        <Users size={14} className="text-slate-400" />
                                        <span>{room.capacity} People</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Building size={14} className="text-slate-400" />
                                        <span>{room.type || 'Room'}</span>
                                     </div>
                                  </div>
                                  {room.features.length > 0 && (
                                     <div className="flex flex-wrap gap-1">
                                        {room.features.map(f => (
                                           <Badge key={f} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-slate-100 text-slate-600">
                                              {f}
                                           </Badge>
                                        ))}
                                     </div>
                                  )}
                               </div>
                               <div className="h-32 bg-slate-50 flex items-center justify-center border-t border-slate-100">
                                  <div className="text-center text-slate-400">
                                     <MapPin size={24} className="mx-auto mb-1 opacity-20" />
                                     <span className="text-[10px]">Room Map Preview</span>
                                  </div>
                               </div>
                            </PopoverContent>
                         </Popover>
                         {room.type && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1 py-0 bg-slate-100 text-slate-500">
                               {room.type}
                            </Badge>
                         )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <span className="text-xs text-slate-500 flex items-center gap-1.5">
                             <Building size={11} className="text-slate-400" />
                             {room.floor}
                           </span>
                           <span className="text-xs text-slate-500 flex items-center gap-1.5">
                             <Users size={11} className="text-slate-400" />
                             {room.capacity}
                           </span>
                         </div>
                         
                         {/* Compact Features Icons */}
                         <div className="flex gap-1.5">
                           {room.features.includes('Video Conf') && <Video size={11} className="text-slate-400" />}
                           {room.features.includes('Whiteboard') && <Monitor size={11} className="text-slate-400" />}
                           {room.features.includes('Catering') && <Coffee size={11} className="text-slate-400" />}
                         </div>
                      </div>
                    </div>

                    {/* Timeline Slots */}
                    <div className="flex-1 flex relative h-16">
                      {/* Current Time Line in grid */}
                      <div 
                         className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none opacity-50"
                         style={{ 
                            left: `${((new Date().getHours() + new Date().getMinutes()/60) / 24) * 100}%`,
                            display: currentDate.toDateString() === new Date().toDateString() ? 'block' : 'none'
                         }} 
                      />

                      {HOURS.map(hour => {
                        const booking = room.schedule?.find(
                          s => hour >= s.start && hour < s.start + s.duration
                        );
                        const isStart = booking && hour === booking.start;
                        
                        // Privacy Logic
                        const isMyBooking = booking && (booking.owner === 'Me' || booking.attendees?.includes('Me'));
                        const isPrivate = booking && !isMyBooking;
                        
                        // Team Availability Logic
                        let busyColleagueNames: string[] = [];
                        if (selectedColleagues.length > 0) {
                           // Check if ANY selected colleague is busy at this hour
                           busyColleagueNames = selectedColleagues.filter(colleagueId => {
                              const schedule = getColleagueSchedule(colleagueId, currentDate);
                              return schedule.some(s => hour >= s.start && hour < s.start + s.duration);
                           })
                           .map(id => COLLEAGUES.find(c => c.id === id)?.name || id);
                        }
                        const teamBusy = busyColleagueNames.length > 0;

                        // Determine visual state
                        // Priority: Booking > Team Busy > Free
                        
                        return (
                          <div
                            key={hour}
                            onClick={() => !booking && !teamBusy && handleRoomGridClick(room.id, hour)}
                            className={cn(
                              "flex-1 min-w-0 border-r border-slate-100 relative transition-all",
                              // Background coloring
                              booking 
                                 ? "bg-slate-50 cursor-not-allowed" // Booked slot
                                 : teamBusy
                                    ? "bg-slate-50/50 cursor-not-allowed pattern-diagonal-lines-sm pattern-slate-200" // Team is busy
                                    : selectedColleagues.length > 0
                                        ? "bg-emerald-50/30 hover:bg-emerald-100 cursor-pointer" // Team Match
                                        : "hover:bg-teal-50 cursor-pointer" // Standard Free
                            )}
                          >
                            {/* Best Time Indicator (Free + Team Free) */}
                            {selectedColleagues.length > 0 && !booking && !teamBusy && (
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                  <div className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm border border-emerald-200 flex items-center gap-1">
                                    <Users size={10} />
                                    Match
                                  </div>
                               </div>
                            )}
                            {/* Team Busy Indicator Overlay */}
                            {teamBusy && !booking && (
                               <Tooltip>
                                  <TooltipTrigger asChild>
                                     <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-help">
                                        <Users size={14} className="text-slate-400" />
                                     </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                     <div className="text-xs font-semibold mb-1">Busy Colleagues:</div>
                                     <ul className="list-disc pl-3 text-[10px]">
                                        {typeof busyColleagueNames !== 'undefined' ? busyColleagueNames.map(name => (
                                           <li key={name}>{name}</li>
                                        )) : <li>Team is busy</li>}
                                     </ul>
                                  </TooltipContent>
                               </Tooltip>
                            )}

                            {/* Booking Block */}
                            {booking && isStart && (
                              <div
                                className={cn(
                                  "absolute inset-y-1 left-0.5 z-10 rounded-md border text-xs overflow-hidden shadow-sm transition-transform hover:scale-[1.02]",
                                  isPrivate 
                                     ? "bg-slate-100 border-slate-200 text-slate-400 pattern-dots pattern-slate-300" 
                                     : "bg-teal-100 border-teal-200 text-teal-800"
                                )}
                                style={{
                                  width: `calc(${booking.duration * 100}% - 4px)`
                                }}
                              >
                                <div className="px-2 py-1 h-full flex flex-col justify-center">
                                  {isPrivate ? (
                                    <div className="flex items-center gap-1.5">
                                      <Lock size={12} />
                                      <span className="font-medium">Busy</span>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="font-semibold truncate leading-tight">
                                        {booking.title}
                                      </div>
                                      <div className="text-[10px] opacity-80 truncate mt-0.5">
                                        {booking.organizer || booking.owner || "Unknown"}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Hover Plus Icon for free slots */}
                            {!booking && !teamBusy && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <UserPlus size={14} className="text-teal-400" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}


              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
