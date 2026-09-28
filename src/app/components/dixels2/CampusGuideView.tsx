import React, { useState } from 'react';
import { 
  Search, MapPin, Calendar, Users, FileText, Siren, ArrowRight,
  BookOpen, Building2, Coffee, Printer, Monitor, Compass, Sun, Moon,
  Bus, Dumbbell, Utensils, Clock, User, Armchair, ChevronRight, Zap, Car, Wifi, Sparkles,
  Cpu, Briefcase, Wrench, GraduationCap, Wind, Thermometer, Activity, Footprints, Shield, Heart,
  Layout, Filter, Star, Phone, AlertTriangle, Accessibility, UserCircle,
  Plus, Minus, Share, ArrowLeft, Mail, Maximize2, Minimize2, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { toast } from "sonner";

// --- Mock Data ---

const MOCK_MAP_MARKERS: Record<string, Array<{ id: string, x: number, y: number, label: string, status?: string, meta?: string, icon?: any }>> = {
    printers: [
        { id: 'p1', x: 20, y: 30, label: 'Printer 4A', status: 'Online', meta: 'Color • A3/A4', icon: Printer },
        { id: 'p2', x: 45, y: 60, label: 'Printer 4B', status: 'Paper Jam', meta: 'B&W Only', icon: Printer },
        { id: 'p3', x: 80, y: 40, label: 'Printer 4C', status: 'Low Toner', meta: 'Color • Photo', icon: Printer },
    ],
    exits: [
        { id: 'e1', x: 10, y: 90, label: 'Exit A', meta: 'Stairs to G', icon: Footprints },
        { id: 'e2', x: 90, y: 90, label: 'Exit B', meta: 'Fire Escape', icon: Footprints },
    ],
    coffee: [
        { id: 'c1', x: 30, y: 50, label: 'Pantry', status: 'Open', meta: 'Snacks & Drinks', icon: Coffee },
        { id: 'c2', x: 70, y: 20, label: 'Cafe', status: 'Busy', meta: 'Barista on duty', icon: Coffee },
    ],
    rooms: [
        { id: 'm1', x: 50, y: 10, label: 'Conf Room A', status: 'Available', meta: '8 Seats • TV', icon: Users },
        { id: 'm2', x: 60, y: 50, label: 'Conf Room B', status: 'Occupied', meta: '4 Seats • Whiteboard', icon: Users },
        // Available Rooms from the list
        { id: 'r1', x: 25, y: 25, label: 'Focus Pod A', status: 'Free', meta: '1 Seat', icon: Armchair },
        { id: 'r2', x: 75, y: 75, label: 'Meeting Room Beta', status: 'Free', meta: '4 Seats', icon: Users },
        { id: 'r3', x: 35, y: 65, label: 'Creative Lab', status: 'Free', meta: '8 Seats', icon: Sparkles },
    ],
    medical: [
        { id: 'f1', x: 85, y: 85, label: 'First Aid', meta: 'Kit & Defib', icon: Heart }
    ],
    access: [
        { id: 'a1', x: 15, y: 85, label: 'Ramp Access', meta: 'Main Entrance', icon: Accessibility },
        { id: 'a2', x: 85, y: 15, label: 'Accessible Lift', meta: 'All Floors', icon: Accessibility },
        { id: 'a3', x: 50, y: 50, label: 'Accessible Washroom', meta: 'Central Wing', icon: Accessibility }
    ],
    prayer: [
        { id: 'pr1', x: 80, y: 30, label: 'Male Prayer Room', meta: 'East Wing', icon: Moon },
        { id: 'pr2', x: 20, y: 70, label: 'Female Prayer Room', meta: 'West Wing', icon: Moon },
    ]
};

const STAFF = [
    { id: 's1', name: 'Dr. Sarah Smith', role: 'Head of IT Infrastructure', dept: 'IT Services', email: 'sarah.s@dixel.com', ext: '1024', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces' },
    { id: 's2', name: 'James Wilson', role: 'Facilities Manager', dept: 'Facilities', email: 'j.wilson@dixel.com', ext: '2045', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces' },
    { id: 's3', name: 'Anita Roy', role: 'HR Director', dept: 'Human Resources', email: 'anita.r@dixel.com', ext: '3301', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop&crop=faces' },
    { id: 's4', name: 'Michael Chen', role: 'Security Supervisor', dept: 'Security', email: 'm.chen@dixel.com', ext: '9110', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces' },
];

const EMERGENCY_CONTACTS = [
    { label: 'Campus Security', number: 'Ext 9999', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Medical Emergency', number: 'Ext 9111', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Facilities Help', number: 'Ext 5000', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const SAFETY_TIPS = [
    { title: 'Evacuation', desc: 'Use stairs only. Do not use elevators during fire alarms.' },
    { title: 'First Aid', desc: 'AEDs are located near every elevator lobby on all floors.' },
    { title: 'Report Hazard', desc: 'Dial Ext 5000 immediately for spills or electrical issues.' },
];

const AVAILABLE_ROOMS = [
    { id: 'r1', name: 'Focus Pod A', floor: '40', capacity: 1, type: 'Pod', image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80' },
    { id: 'r2', name: 'Meeting Room Beta', floor: '42', capacity: 4, type: 'Meeting', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80' },
    { id: 'r3', name: 'Creative Lab', floor: '41', capacity: 8, type: 'Collab', image: 'https://images.unsplash.com/photo-1517502884422-41e157d2839a?w=400&q=80' },
];

const GUIDES = [
    { id: 'g1', title: 'Office Map: Dubai HQ', icon: MapPin, category: 'Wayfinding', desc: 'Interactive floor plans for Sheikh Zayed Rd.', type: 'document',
      author: 'Facilities Team', lastUpdated: '2 days ago', 
      sections: [
          { title: 'Overview', content: 'This interactive map covers all 4 floors of the Dubai HQ. You can search for meeting rooms, printers, and coffee stations. The layout was last updated in Jan 2025 following the renovation of the North Wing.' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', caption: 'North Wing Renovation Layout', alt: 'Office Plan' }
      ]
    },
    { id: 'g2', title: 'Prayer Room Locations', icon: Moon, category: 'Facilities', desc: 'Male & Female prayer rooms on each floor.', type: 'document',
      author: 'HR Dept', lastUpdated: '1 month ago',
      linkedLocations: ['pr1', 'pr2'],
      sections: [
          { title: 'Locations', content: 'Prayer rooms are available on every floor. Male prayer rooms are located in the East Wing (near the elevators), and Female prayer rooms are in the West Wing. Ablution facilities are attached to each room.' }
      ]
    },
    { id: 'g3', title: 'Visitor Access (Gate 5)', icon: Users, category: 'Security', desc: 'Registration process for external guests.', type: 'document',
      author: 'Security', lastUpdated: '1 week ago',
      sections: [
          { title: 'Registration Process', content: 'All external visitors must be pre-registered via the Visitor Management System 24 hours in advance. Guests should present a valid ID at Gate 5 reception to receive their temporary access badge.' },
          { type: 'video', thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80', title: 'Visitor Badge Tutorial' }
      ]
    },
    { id: 'g4', title: 'Emergency Procedures', icon: Siren, category: 'Safety', desc: 'Evacuation routes and assembly points.', type: 'document',
      author: 'Safety Officer', lastUpdated: '3 days ago',
      sections: [
           { title: 'Evacuation Route', content: 'In case of fire, do not use the elevators. Proceed calmly to the nearest stairwell (marked with green exit signs). The assembly point is the parking lot B across the main street.' },
           { type: 'image', url: 'https://images.unsplash.com/photo-1762960246763-dcb1e92b0b58?w=800&q=80', caption: 'Emergency Exit Signage', alt: 'Exit Sign' },
           { title: 'Assembly Points', content: 'Wardens in orange vests will guide you to the safe zone. Do not re-enter the building until the "All Clear" signal is given.' }
      ]
    },
    { id: 'g5', title: 'Accessible Routes Guide', icon: Accessibility, category: 'Accessibility', desc: 'Wheelchair ramps, elevators, and accessible restrooms.', type: 'document',
      author: 'Facilities Team', lastUpdated: '2 months ago',
      sections: [
          { title: 'Campus Accessibility', content: 'The campus is fully accessible. Ramps are installed at the Main Entrance and Gate 5. All elevators are wheelchair-friendly. Accessible restrooms are located in the central core of every floor next to the main lobby.' }
      ]
    },
];

const CATEGORIES = [
    { id: 'workplace', label: 'Workplace', icon: Building2, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'amenities', label: 'Amenities', icon: Coffee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'facilities', label: 'Facilities', icon: Printer, color: 'text-slate-600', bg: 'bg-slate-50' },
    { id: 'safety', label: 'Safety & Access', icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'library', label: 'My Library', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const POPULAR_RESOURCES = [
    { id: 'r1', title: 'IT Handbook 2025', views: '2.4k views', tag: 'Policy', icon: FileText, type: 'document',
      author: 'IT Support', lastUpdated: 'Jan 10, 2025', readTime: '5 min read',
      sections: [
          { title: '1. Acceptable Use Policy', content: 'All company devices are monitored for security purposes. Personal use of company laptops is permitted within reasonable limits, provided it does not interfere with productivity or violate local laws.' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1760604359590-0f0dc7dbbf3c?w=800&q=80', caption: 'Standard Workstation Setup', alt: 'Laptop Setup' },
          { title: '2. Password Security', content: 'Passwords must be at least 12 characters long and include a mix of special characters. MFA (Multi-Factor Authentication) is mandatory for all remote access via VPN.' },
          { title: '3. Software Installation', content: 'Users are not permitted to install unapproved software. To request new software, please use the "Request Software" service in the IT Services portal. Admin rights are granted on a case-by-case basis.' }
      ]
    },
    { id: 'r2', title: 'Holiday Calendar', views: '1.8k views', tag: 'HR', icon: Calendar, type: 'document',
      author: 'HR Dept', lastUpdated: 'Dec 20, 2024', readTime: '2 min read',
      sections: [
          { title: 'Public Holidays', content: 'The company observes all statutory public holidays. If a holiday falls on a weekend, a day in lieu will be provided.' },
          { title: 'Floating Holidays', content: 'Employees are entitled to 2 floating holidays per year for cultural or religious observances not covered by the standard calendar.' }
      ]
    },
    { id: 'r3', title: 'Cafeteria Menu', views: '950 views', tag: 'Daily', icon: Utensils, type: 'document',
      author: 'Catering Services', lastUpdated: 'Today, 9:00 AM', readTime: '1 min read',
      sections: [
           { title: 'Breakfast (8:00 - 10:30)', content: 'Oatmeal, Fresh Fruit, Scrambled Eggs, Croissants.' },
           { type: 'image', url: 'https://images.unsplash.com/photo-1697902577366-5d6b80d7877e?w=800&q=80', caption: 'Freshly Brewed Coffee & Pastries', alt: 'Coffee' },
           { title: 'Lunch (12:00 - 14:30)', content: 'Today\'s Special: Grilled Salmon with Asparagus. Vegetarian Option: Mushroom Risotto.' }
      ]
    },
];

const DEPARTMENTS = [
    { id: 'it', label: 'IT Services', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50', link: 'Tech Support, VPN, Hardware', 
      description: 'The central hub for all technology support, hardware provisioning, and network security.',
      services: [
          { label: 'Report Issue', icon: AlertTriangle },
          { label: 'Request Device', icon: Monitor },
          { label: 'Reset Password', icon: UserCircle },
          { label: 'WiFi Access', icon: Wifi }
      ],
      location: 'Room 404', hours: 'Mon-Fri, 09:00 - 17:00', contact: 'helpdesk@dixel.com',
      mapX: 55, mapY: 15,
      staffIds: ['s1']
    },
    { id: 'hr', label: 'Human Resources', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', link: 'Benefits, Leave, Payroll',
      description: 'Supporting our people with benefits, career development, and workplace wellbeing.',
      services: [
          { label: 'Leave Request', icon: Calendar },
          { label: 'Payslips', icon: FileText },
          { label: 'Health Insurance', icon: Heart },
          { label: 'Policy Hub', icon: BookOpen }
      ],
      location: 'Room 302', hours: 'Mon-Thu, 10:00 - 16:00', contact: 'hr@dixel.com',
      mapX: 65, mapY: 55,
      staffIds: ['s3']
    },
    { id: 'fac', label: 'Facilities', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50', link: 'Repairs, Cleaning, AC',
      description: 'Ensuring a safe, clean, and comfortable working environment for everyone.',
      services: [
          { label: 'Report Fix', icon: Wrench },
          { label: 'Book Cleaning', icon: Sparkles },
          { label: 'AC Control', icon: Thermometer },
          { label: 'Move Furniture', icon: Armchair }
      ],
      location: 'B1 Basement', hours: '24/7 Operations', contact: 'fm@dixel.com',
      mapX: 20, mapY: 80,
      staffIds: ['s2']
    },
    { id: 'sec', label: 'Security Office', icon: Shield, color: 'text-slate-700', bg: 'bg-slate-100', link: 'Access Cards, Visitors',
      description: 'Protecting our campus assets and managing secure access for employees and guests.',
      services: [
          { label: 'New Badge', icon: User },
          { label: 'Visitor Pass', icon: Users },
          { label: 'Lost & Found', icon: Search },
          { label: 'Emergency', icon: Siren }
      ],
      location: 'Lobby L1', hours: '24/7 Manned Desk', contact: 'security@dixel.com',
      mapX: 10, mapY: 10,
      staffIds: ['s4']
    },
];

export const CampusGuideView = () => {
    const [selectedOffice, setSelectedOffice] = useState('dubai');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null); // Unified selection (guide, dept, staff, or map marker)
    const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
    
    // View State
    const [viewMode, setViewMode] = useState<'split' | 'full'>('split');

    // Map State
    const [activeMapLayer, setActiveMapLayer] = useState<string | null>(null);
    const [mapZoom, setMapZoom] = useState(1);
    const [showAccessibility, setShowAccessibility] = useState(false);

    // Navigation State
    const [showNavigation, setShowNavigation] = useState(false);
    const [navigationTarget, setNavigationTarget] = useState<string | null>(null);

    // --- Derived State & Filter Logic ---

    // Auto-switch view mode based on context
    React.useEffect(() => {
        if (selectedItem?.type === 'document' || activeCategory === 'knowledge' || activeCategory === 'workplace') {
            setViewMode('full');
        } else if (activeCategory && ['facilities', 'amenities', 'safety'].includes(activeCategory)) {
            setViewMode('split');
        } else if (selectedItem?.mapX) {
            setViewMode('split');
        }
    }, [selectedItem, activeCategory]);

    // When a category is selected, auto-switch map layer if applicable
    React.useEffect(() => {
        // Reset accessibility when changing categories to avoid confusion, unless explicitly handled
        if (activeCategory !== 'facilities') setShowAccessibility(false);

        if (!activeCategory) {
            setActiveMapLayer(null);
            return;
        }
        if (['facilities', 'amenities', 'safety'].includes(activeCategory)) {
            if (activeCategory === 'amenities') setActiveMapLayer('coffee');
            if (activeCategory === 'facilities') setActiveMapLayer('printers'); // Default to printers, can switch
            if (activeCategory === 'safety') setActiveMapLayer('exits');
        }
    }, [activeCategory]);

    // Toggle Accessibility Layer
    React.useEffect(() => {
        if (showAccessibility) {
            setActiveMapLayer('access');
        } else {
            // Restore previous layer based on category if we turn off accessibility
            if (activeCategory === 'facilities') setActiveMapLayer('printers');
            else if (activeCategory === 'amenities') setActiveMapLayer('coffee');
            else if (activeCategory === 'safety') setActiveMapLayer('exits');
            else setActiveMapLayer(null);
        }
    }, [showAccessibility, activeCategory]);

    // Unified Search Filtering
    const getFilteredContent = () => {
        const query = searchQuery.toLowerCase();
        
        // If searching, ignore categories and return mixed results
        if (query) {
            return {
                guides: [...GUIDES, ...POPULAR_RESOURCES].filter(g => g.title.toLowerCase().includes(query) || g.desc?.toLowerCase().includes(query) || g.content?.toLowerCase().includes(query)),
                staff: STAFF.filter(s => s.name.toLowerCase().includes(query) || s.role.toLowerCase().includes(query)),
                departments: DEPARTMENTS.filter(d => d.label.toLowerCase().includes(query) || d.services.some((s: any) => s.label?.toLowerCase().includes(query))),
                locations: Object.values(MOCK_MAP_MARKERS).flat().filter(m => m.label.toLowerCase().includes(query)),
                rooms: AVAILABLE_ROOMS.filter(r => r.name.toLowerCase().includes(query))
            };
        }

        // If Category Selected
        if (activeCategory) {
            if (activeCategory === 'library') return {
                guides: [...GUIDES, ...POPULAR_RESOURCES].filter(g => bookmarkedIds.includes(g.id)),
                staff: STAFF.filter(s => bookmarkedIds.includes(s.id)),
                departments: DEPARTMENTS.filter(d => bookmarkedIds.includes(d.id)),
                locations: Object.values(MOCK_MAP_MARKERS).flat().filter(m => bookmarkedIds.includes(m.id)),
                rooms: AVAILABLE_ROOMS.filter(r => bookmarkedIds.includes(r.id))
            };
            if (activeCategory === 'knowledge') return {
                guides: [...GUIDES, ...POPULAR_RESOURCES],
                departments: [],
                staff: [],
                rooms: []
            };
            if (activeCategory === 'workplace') return { 
                departments: DEPARTMENTS, 
                staff: STAFF,
                rooms: AVAILABLE_ROOMS,
                guides: GUIDES.filter(g => g.category === 'Wayfinding' || g.category === 'HR') 
            };
            if (activeCategory === 'amenities') return { 
                locations: MOCK_MAP_MARKERS.coffee, 
                guides: GUIDES.filter(g => g.category === 'Facilities') 
            };
            if (activeCategory === 'facilities') return { 
                locations: showAccessibility ? MOCK_MAP_MARKERS.access : [...MOCK_MAP_MARKERS.printers, ...MOCK_MAP_MARKERS.rooms], 
                departments: DEPARTMENTS.filter(d => d.id === 'fac') 
            };
            if (activeCategory === 'safety') return { 
                locations: [...MOCK_MAP_MARKERS.exits, ...MOCK_MAP_MARKERS.medical], 
                guides: GUIDES.filter(g => g.category === 'Safety'),
                emergencyContacts: EMERGENCY_CONTACTS,
                safetyTips: SAFETY_TIPS
            };
        }

        // Default "Home" View Data
        return {
            guides: GUIDES.slice(0, 3), // Top guides
            departments: [],
            staff: [],
            rooms: []
        };
    };

    const results = getFilteredContent();
    const isHomeView = !searchQuery && !activeCategory && !selectedItem;
    const hasResults = Object.values(results).some(arr => arr && arr.length > 0);

    const handleNavigate = () => {
        if (selectedItem) {
            setNavigationTarget(selectedItem.label || selectedItem.title || selectedItem.name);
            setShowNavigation(true);
            setViewMode('split'); // Ensure map is visible for navigation
            toast.success(`Calculating route to ${selectedItem.label || selectedItem.title || selectedItem.name}...`, {
                description: "Follow the blue path on the map."
            });
            // In a real app, this would trigger the pathfinding algorithm
        }
    };

    const handleSelectItem = (item: any) => {
        setSelectedItem(item);
        
        // Smart Layer Switching logic
        // If the item implies a specific map layer, switch to it automatically
        if (item.id.startsWith('p')) setActiveMapLayer('printers');
        if (item.id.startsWith('c')) setActiveMapLayer('coffee');
        if (item.id.startsWith('e')) setActiveMapLayer('exits');
        if (item.id.startsWith('m') || item.id.startsWith('r')) setActiveMapLayer('rooms'); // Rooms
        if (item.id.startsWith('a')) {
             setShowAccessibility(true);
             setActiveMapLayer('access');
        }
    };

    const handleShowOnMap = (item: any) => {
        // If item has mock coords (like Departments), we can "fake" a marker for it
        if (item.mapX && item.mapY) {
            setViewMode('split'); // Ensure map is visible
            setMapZoom(2);
            // Simulate focusing on a specific reception desk
            toast.success(`Locating ${item.label} Reception Desk...`);
            
            // Optionally we could set a temporary "highlight" marker here in a real app
        }
    };

    const toggleBookmark = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (bookmarkedIds.includes(id)) {
            setBookmarkedIds(prev => prev.filter(bid => bid !== id));
            toast.info("Removed from bookmarks");
        } else {
            setBookmarkedIds(prev => [...prev, id]);
            toast.success("Added to bookmarks");
        }
    };

    const getRelatedStaff = (staffIds: string[] | undefined) => {
        if (!staffIds) return [];
        return STAFF.filter(s => staffIds.includes(s.id));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
            
            {/* 1. Global Header Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-600 text-white p-2 rounded-lg">
                        <Compass size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-none">Campus Guide</h1>
                        <p className="text-xs text-slate-500 mt-1">Dubai HQ • Level 4</p>
                    </div>
                </div>

                <div className="flex-1 max-w-xl w-full mx-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={16} />
                        <Input 
                            className="pl-10 bg-slate-100 border-transparent focus:bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-100 transition-all h-10 w-full" 
                            placeholder="Find people, printers, coffee, or meeting rooms..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Clear</span>
                                &times;
                            </button>
                        )}
                    </div>
                </div>

                <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                    <SelectTrigger className="w-[160px] border-slate-200 bg-white">
                        <SelectValue placeholder="Select Office" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="dubai">Dubai HQ</SelectItem>
                        <SelectItem value="auh">Abu Dhabi Hub</SelectItem>
                        <SelectItem value="ruh">Riyadh Office</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 2. Main Split View Layout */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left: The Immersive Map (65%) */}
                <div className={cn("relative bg-slate-100 overflow-hidden transition-all duration-500 ease-in-out", viewMode === 'full' ? "w-0 flex-none opacity-0" : "flex-1 opacity-100")}>
                    <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
                    
                    {/* Map Interaction Layer */}
                    <div className="absolute inset-0 flex items-center justify-center">
                         {/* This is where the Canvas/Map component would be. Using our mock visual. */}
                        <div className="relative w-full h-full max-w-3xl max-h-[80%] opacity-80 transition-transform duration-500 ease-in-out" style={{ transform: `scale(${mapZoom})` }}>
                            {/* Abstract Floorplan Lines */}
                            <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 800 600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path className="text-slate-300 fill-white" d="M100,100 L700,100 L700,500 L100,500 Z" />
                                <path className="text-slate-200" d="M100,200 L700,200" />
                                <path className="text-slate-200" d="M300,100 L300,500" />
                                <path className="text-slate-200" d="M500,100 L500,500" />
                            </svg>

                             {/* Center Hub: "You Are Here" */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-teal-500/20 rounded-full animate-ping" />
                                    <div className="absolute -inset-12 bg-teal-500/10 rounded-full blur-2xl" />
                                    <div className="relative z-10 bg-white p-1.5 rounded-full shadow-xl border border-teal-100">
                                        <div className="w-4 h-4 bg-teal-600 rounded-full border-2 border-white" />
                                    </div>
                                </div>
                                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider translate-y-2">
                                    You are here
                                </div>
                             </div>

                             {/* Render Markers */}
                             {(activeMapLayer ? MOCK_MAP_MARKERS[activeMapLayer] : []).map(m => (
                                 <motion.button
                                    key={m.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setSelectedItem(m)}
                                    className={cn(
                                        "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors z-20",
                                        selectedItem?.id === m.id ? "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2" : "bg-teal-500 text-white"
                                    )}
                                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                                 >
                                     <div className="w-2 h-2 bg-white rounded-full" />
                                 </motion.button>
                             ))}
                        </div>
                    </div>

                    {/* On-Map Controls */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-3">
                         <div className="bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-lg shadow-sm flex flex-col gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600" onClick={() => setMapZoom(z => Math.min(z + 0.2, 2))}><Plus size={16} /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600" onClick={() => setMapZoom(z => Math.max(z - 0.2, 0.6))}><Minus size={16} /></Button>
                         </div>
                         
                         <Button 
                            variant="secondary" 
                            className={cn(
                                "h-10 w-10 p-0 rounded-lg shadow-sm border border-slate-200 transition-colors",
                                showAccessibility ? "bg-teal-600 text-white hover:bg-teal-700 border-teal-600" : "bg-white text-slate-600 hover:bg-slate-50"
                            )}
                            onClick={() => setShowAccessibility(!showAccessibility)}
                            title="Toggle Accessibility Map"
                         >
                             <Accessibility size={20} />
                         </Button>
                    </div>

                    <div className="absolute top-6 right-6">
                        <div className="bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 flex items-center gap-2 shadow-sm">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Occupancy
                        </div>
                    </div>
                </div>

                {/* Right: The Smart Sidebar (35% - Fixed Width) */}
                <div className={cn("bg-white border-l border-slate-200 flex flex-col z-30 shadow-xl h-full overflow-hidden transition-all duration-500 ease-in-out", viewMode === 'full' ? "flex-1 w-full border-l-0" : "w-[400px] shrink-0")}>
                    
                    {selectedItem ? (
                        // --- A. DETAIL VIEW ---
                        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)} className="-ml-2">
                                        <ArrowLeft size={18} />
                                    </Button>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setViewMode(viewMode === 'split' ? 'full' : 'split')} title={viewMode === 'split' ? "Expand View" : "Show Map"}>
                                    {viewMode === 'split' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className={cn("p-6", viewMode === 'full' ? "max-w-4xl mx-auto w-full" : "")}>
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-600">
                                        {selectedItem.icon ? <selectedItem.icon size={24}/> : <MapPin size={24}/>}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedItem.label || selectedItem.title || selectedItem.name}</h2>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                        {selectedItem.desc || selectedItem.description || selectedItem.meta || "No additional details available for this location."}
                                    </p>

                                    {/* Action Buttons (Standard) */}
                                    {(!selectedItem.services || typeof selectedItem.services[0] !== 'object') && (
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {(selectedItem.type === 'document') ? (
                                             <Button 
                                                className={cn("w-full transition-colors", viewMode === 'split' ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                                                onClick={() => setViewMode(viewMode === 'split' ? 'full' : 'split')}
                                             >
                                                {viewMode === 'split' ? <Maximize2 size={16} className="mr-2" /> : <Minimize2 size={16} className="mr-2" />}
                                                {viewMode === 'split' ? "Read Full Screen" : "Exit Full Screen"}
                                             </Button>
                                        ) : (selectedItem.mapX || selectedItem.x) ? (
                                             <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => (selectedItem.mapX ? handleShowOnMap(selectedItem) : handleNavigate())}>
                                                {selectedItem.mapX ? <MapPin size={16} className="mr-2" /> : <Footprints size={16} className="mr-2" />}
                                                {selectedItem.mapX ? "Show on Map" : "Navigate"}
                                             </Button>
                                        ) : (
                                             <Button className="w-full bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" disabled>
                                                <MapPin size={16} className="mr-2" /> No Location
                                             </Button>
                                        )}
                                        
                                        <Button variant="outline" className="w-full" onClick={() => toast.success("Link copied to clipboard")}>
                                            <Share size={16} className="mr-2" /> Share
                                        </Button>
                                    </div>
                                    )}

                                    {/* --- DEPARTMENT SERVICE HUB VIEW --- */}
                                    {selectedItem.services && typeof selectedItem.services[0] === 'object' && (
                                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500 delay-100">
                                            
                                            {/* Department Header Info */}
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <div className="flex items-start gap-4">
                                                    <div className={cn("p-3 rounded-lg bg-white shadow-sm", selectedItem.color)}>
                                                        {selectedItem.icon ? <selectedItem.icon size={24}/> : <Building2 size={24}/>}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 mb-1">About {selectedItem.label}</h3>
                                                        <p className="text-xs text-slate-500 leading-relaxed">
                                                            {selectedItem.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</div>
                                                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                                                            <MapPin size={12} className="text-teal-600"/> {selectedItem.location}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Opening Hours</div>
                                                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                                                            <Clock size={12} className="text-teal-600"/> {selectedItem.hours}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Service Grid */}
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 mb-3">How can we help?</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {selectedItem.services.map((service: any, idx: number) => (
                                                        <Button key={idx} variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 bg-white border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all hover:shadow-sm" onClick={() => toast.success(`Opened ${service.label} tool`)}>
                                                            <div className="p-2 bg-slate-50 rounded-full text-slate-600 group-hover:text-teal-600">
                                                                <service.icon size={18} />
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-700">{service.label}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Key Contacts */}
                                            {getRelatedStaff(selectedItem.staffIds).length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3">Key Contacts</h3>
                                                    <div className="space-y-2">
                                                        {getRelatedStaff(selectedItem.staffIds).map(person => (
                                                            <div key={person.id} onClick={() => handleSelectItem(person)} className="flex items-center gap-3 p-2 rounded-lg border border-transparent hover:bg-slate-50 cursor-pointer transition-colors">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={person.image} />
                                                                    <AvatarFallback>{person.name[0]}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="text-xs font-bold text-slate-900">{person.name}</div>
                                                                    <div className="text-[10px] text-slate-500">{person.role}</div>
                                                                </div>
                                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-300">
                                                                    <ChevronRight size={14} />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact Actions */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                 <Button variant="outline" className="w-full justify-center" onClick={() => toast.success(`Emailing ${selectedItem.contact}`)}>
                                                    <Mail size={16} className="mr-2 text-slate-400" /> Contact Team
                                                </Button>
                                                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" onClick={() => handleShowOnMap(selectedItem)}>
                                                    <MapPin size={16} className="mr-2" /> Visit Desk
                                                </Button>
                                            </div>

                                        </div>
                                    )}

                                    {/* --- DOCUMENT VIEW RENDERING --- */}
                                    {selectedItem.type === 'document' && (
                                        <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
                                            {/* Meta Header */}
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100">{selectedItem.tag || selectedItem.category}</Badge>
                                                        {selectedItem.readTime && <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">• {selectedItem.readTime}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Article Content */}
                                            <div className="prose prose-sm prose-slate max-w-none">
                                                {/* Author / Date */}
                                                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                        {selectedItem.author?.[0] || 'D'}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900">{selectedItem.author}</div>
                                                        <div className="text-[10px] text-slate-500">Updated {selectedItem.lastUpdated}</div>
                                                    </div>
                                                </div>
                                                
                                                {/* Sections Render */}
                                                {selectedItem.sections ? (
                                                    <div className="space-y-8">
                                                        {selectedItem.sections.map((section: any, idx: number) => (
                                                            <div key={idx} className="animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                                                {section.title && <h4 className="text-sm font-bold text-slate-900 mb-3">{section.title}</h4>}
                                                                
                                                                {/* Image Block */}
                                                                {section.type === 'image' && (
                                                                     <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                                                                         <div className="relative aspect-video">
                                                                             <img src={section.url} alt={section.alt || section.title} className="w-full h-full object-cover" />
                                                                         </div>
                                                                         {section.caption && <div className="p-2 bg-slate-50 border-t border-slate-100"><p className="text-[10px] text-slate-500 italic text-center">{section.caption}</p></div>}
                                                                     </div>
                                                                )}

                                                                {/* Video Block (Mock) */}
                                                                {section.type === 'video' && (
                                                                     <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-black relative aspect-video flex items-center justify-center group cursor-pointer" onClick={() => toast.success("Playing video...")}>
                                                                         {section.thumbnail && <img src={section.thumbnail} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />}
                                                                         <div className="absolute inset-0 flex items-center justify-center z-10">
                                                                             <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/30">
                                                                                 <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1 drop-shadow-sm" />
                                                                             </div>
                                                                         </div>
                                                                         <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-bold tracking-wide z-10">02:45</div>
                                                                     </div>
                                                                )}

                                                                {section.content && <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{section.content}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selectedItem.content}</p>
                                                )}
                                            </div>

                                                {/* Linked Locations */}
                                                {selectedItem.linkedLocations && (
                                                    <div className="mt-8 mb-4 pt-6 border-t border-slate-100">
                                                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <MapPin size={16} className="text-teal-600"/> Navigate to Location
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {selectedItem.linkedLocations.map((locId: string) => {
                                                                const loc = Object.values(MOCK_MAP_MARKERS).flat().find(m => m.id === locId);
                                                                if (!loc) return null;
                                                                return (
                                                                    <div key={loc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer group" onClick={() => handleShowOnMap(loc)}>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="bg-white p-2 rounded-md text-teal-600 shadow-sm border border-slate-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                                                                {loc.icon ? <loc.icon size={16} /> : <MapPin size={16} />}
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-sm font-bold text-slate-900">{loc.label}</div>
                                                                                <div className="text-xs text-slate-500">{loc.meta}</div>
                                                                            </div>
                                                                        </div>
                                                                        <Button size="sm" className="h-8 bg-white text-teal-600 border border-teal-200 hover:bg-teal-50 shadow-none">
                                                                            Navigate
                                                                        </Button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Actions Footer */}
                                            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                                                 <Button 
                                                    variant={bookmarkedIds.includes(selectedItem.id) ? "default" : "outline"} 
                                                    className={cn("flex-1", bookmarkedIds.includes(selectedItem.id) ? "bg-teal-600 hover:bg-teal-700" : "")}
                                                    onClick={(e) => toggleBookmark(selectedItem.id, e)}
                                                 >
                                                    <Star size={16} className={cn("mr-2", bookmarkedIds.includes(selectedItem.id) ? "fill-white" : "")} /> 
                                                    {bookmarkedIds.includes(selectedItem.id) ? "Saved" : "Save to Library"}
                                                 </Button>
                                                 <Button variant="outline" className="flex-1" onClick={() => toast.success("PDF Download started...")}>
                                                    <Share size={16} className="mr-2" /> Download
                                                 </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contextual Info (Staff/Hours/Etc) - Standard */}
                                    {selectedItem.services && typeof selectedItem.services[0] === 'string' && (
                                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500 delay-100">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs uppercase font-bold tracking-wider">
                                                        <MapPin size={12} /> Location
                                                    </div>
                                                    <div className="font-semibold text-slate-900">{selectedItem.location}</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs uppercase font-bold tracking-wider">
                                                        <Clock size={12} /> Hours
                                                    </div>
                                                    <div className="font-semibold text-slate-900">{selectedItem.hours}</div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 mb-3">Key Services</h3>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {selectedItem.services.map((service: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                                            <span className="text-sm text-slate-700">{service}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedItem.role && (
                                        <div className="bg-slate-50 rounded-xl p-4 space-y-4 animate-in slide-in-from-bottom duration-500 delay-100">
                                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</span>
                                                <span className="text-sm font-semibold text-slate-900">{selectedItem.dept}</span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-lg border border-slate-200 text-teal-600"><Phone size={16}/></div>
                                                    <div className="text-sm"><span className="block font-bold text-slate-900">Ext {selectedItem.ext}</span><span className="text-slate-500">Direct Line</span></div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-lg border border-slate-200 text-teal-600"><Mail size={16}/></div>
                                                    <div className="text-sm"><span className="block font-bold text-slate-900">Email</span><span className="text-slate-500 truncate w-40">{selectedItem.email}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fallback for Generic Items with minimal contact info */}
                                    {(!selectedItem.services && !selectedItem.role && selectedItem.email) && (
                                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-lg border border-slate-200 text-teal-600"><Phone size={16}/></div>
                                                <div className="text-sm"><span className="block font-bold text-slate-900">Ext {selectedItem.ext}</span><span className="text-slate-500">Direct Line</span></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-lg border border-slate-200 text-teal-600"><Mail size={16}/></div>
                                                <div className="text-sm"><span className="block font-bold text-slate-900">Email</span><span className="text-slate-500 truncate w-40">{selectedItem.email}</span></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- B. EXPLORER VIEW ---
                        <div className="flex flex-col h-full overflow-hidden">
                            
                            {/* Categories Grid (Top of Sidebar) */}
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Explore Categories</h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400" onClick={() => setViewMode(viewMode === 'split' ? 'full' : 'split')} title={viewMode === 'split' ? "Expand View" : "Show Map"}>
                                         {viewMode === 'split' ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-2 rounded-xl border transition-all h-20",
                                                activeCategory === cat.id 
                                                    ? "bg-teal-50 border-teal-200 text-teal-700 ring-1 ring-teal-200" 
                                                    : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:shadow-sm"
                                            )}
                                        >
                                            <cat.icon size={20} className="mb-1.5" />
                                            <span className="text-[10px] font-bold text-center leading-tight">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Results List */}
                            <div className="flex-1 overflow-y-auto">
                                <div className={cn("p-4 space-y-6", viewMode === 'full' ? "max-w-4xl mx-auto w-full" : "")}>
                                    
                                    {/* 1. Category Context Header */}
                                    {activeCategory && (
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-bold text-lg capitalize flex items-center gap-2">
                                                {CATEGORIES.find(c => c.id === activeCategory)?.icon && React.createElement(CATEGORIES.find(c => c.id === activeCategory)!.icon, { size: 18, className: "text-teal-600" })}
                                                {activeCategory}
                                            </h2>
                                            <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400" onClick={() => setActiveCategory(null)}>Clear</Button>
                                        </div>
                                    )}

                                    {/* 2. List Results */}
                                    {isHomeView && (
                                        <div className="space-y-6">
                                            {/* Quick Guides */}
                                            <section>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-sm font-bold text-slate-900">Recommended Guides</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    {results.guides?.map(guide => (
                                                        <div key={guide.id} onClick={() => handleSelectItem(guide)} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors cursor-pointer group">
                                                            <div className="bg-slate-100 p-2 rounded-md text-slate-500 group-hover:text-teal-600 transition-colors">
                                                                <guide.icon size={16} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-900 group-hover:text-teal-700">{guide.title}</div>
                                                                <div className="text-xs text-slate-500">{guide.desc}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Quick Directory */}
                                            <section>
                                                <h3 className="text-sm font-bold text-slate-900 mb-3">Directory & Resources</h3>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 bg-white border-slate-200 hover:border-teal-200 hover:bg-teal-50" onClick={() => setActiveCategory('workplace')}>
                                                        <Users size={20} className="text-teal-600"/>
                                                        <span className="text-xs font-semibold">Staff & Depts</span>
                                                    </Button>
                                                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 bg-white border-slate-200 hover:border-teal-200 hover:bg-teal-50" onClick={() => setActiveCategory('safety')}>
                                                        <Shield size={20} className="text-rose-600"/>
                                                        <span className="text-xs font-semibold">Safety & Help</span>
                                                    </Button>
                                                </div>
                                                <Button variant="outline" className="w-full h-auto py-3 flex items-center justify-center gap-2 bg-white border-slate-200 hover:border-teal-200 hover:bg-teal-50 mb-4" onClick={() => setActiveCategory('knowledge')}>
                                                    <BookOpen size={18} className="text-purple-600"/>
                                                    <span className="text-xs font-semibold">Knowledge Hub</span>
                                                </Button>
                                                
                                                <div className="space-y-2">
                                                    {DEPARTMENTS.slice(0, 2).map(dept => (
                                                        <div key={dept.id} onClick={() => handleSelectItem(dept)} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-teal-200 cursor-pointer">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn("p-1.5 rounded-md", dept.bg, dept.color)}><dept.icon size={16}/></div>
                                                                <span className="text-sm font-medium text-slate-700">{dept.label}</span>
                                                            </div>
                                                            <ChevronRight size={14} className="text-slate-300" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Popular Resources */}
                                            <section>
                                                <h3 className="text-sm font-bold text-slate-900 mb-3">Popular Resources</h3>
                                                <div className="space-y-2">
                                                    {POPULAR_RESOURCES.map(res => (
                                                        <div key={res.id} onClick={() => handleSelectItem(res)} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-teal-200 cursor-pointer bg-white group">
                                                            <div className="bg-slate-50 p-2 rounded-lg text-slate-500 group-hover:text-teal-600 transition-colors">
                                                                <res.icon size={16} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-semibold text-slate-900">{res.title}</div>
                                                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">{res.tag}</span>
                                                                    <span>• {res.views}</span>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300">
                                                                <ChevronRight size={14} />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        </div>
                                    )}

                                    {/* Search/Filter Results */}
                                    {(!isHomeView) && (
                                        <div className="space-y-4">
                                            
                                            {/* Empty State */}
                                            {!hasResults && !activeCategory && (
                                                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                                        <Search size={24} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-slate-900">No results found</h3>
                                                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                                                        We couldn't find anything matching "{searchQuery}". Try a different term.
                                                    </p>
                                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchQuery('')}>
                                                        Clear Search
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Library Empty State */}
                                            {!hasResults && activeCategory === 'library' && (
                                                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                                                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-500">
                                                        <Star size={24} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-slate-900">Your Library is Empty</h3>
                                                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                                                        Save guides, locations, and staff here for quick access.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Safety: Emergency Contacts & Tips */}
                                            {activeCategory === 'safety' && (
                                                <div className="space-y-4 animate-in slide-in-from-right duration-500">
                                                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                                                        <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <Siren size={14} /> Emergency Numbers
                                                        </h3>
                                                        <div className="space-y-2 mb-4">
                                                            {results.emergencyContacts?.map((contact, i) => (
                                                                <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-rose-100 shadow-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn("p-1.5 rounded-md", contact.bg, contact.color)}>
                                                                            <contact.icon size={14} />
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-slate-700">{contact.label}</span>
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-900">{contact.number}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Separator className="bg-rose-200 my-3" />
                                                        <div className="space-y-2">
                                                            {results.safetyTips?.map((tip, i) => (
                                                                <div key={i}>
                                                                    <div className="text-xs font-bold text-rose-800">{tip.title}</div>
                                                                    <div className="text-[10px] text-rose-600 leading-tight">{tip.desc}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {results.locations?.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">On Map</div>
                                                    {results.locations?.map((loc: any) => (
                                                        <div key={loc.id} onClick={() => handleSelectItem(loc)} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-teal-200 cursor-pointer mb-2 bg-white">
                                                            <div className="w-2 h-2 rounded-full bg-teal-500" />
                                                            <div className="flex-1">
                                                                <div className="text-sm font-bold text-slate-900">{loc.label}</div>
                                                                <div className="text-xs text-slate-500">{loc.meta}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {results.rooms?.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Available Rooms</div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {results.rooms.map(room => (
                                                            <div key={room.id} onClick={() => handleSelectItem(room)} className="flex gap-3 p-2 rounded-lg border border-slate-100 bg-white hover:border-teal-200 cursor-pointer group">
                                                                <div className="w-16 h-16 rounded-md bg-slate-100 overflow-hidden shrink-0">
                                                                    <img src={room.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                                </div>
                                                                <div className="flex-1 py-1">
                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700">{room.name}</h4>
                                                                        <Badge variant="secondary" className="text-[10px] h-5 bg-teal-50 text-teal-700 hover:bg-teal-100">Free</Badge>
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 mt-1">{room.type} • {room.capacity} Seats • L{room.floor}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {results.departments?.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Departments</div>
                                                    {results.departments?.map(dept => (
                                                        <div key={dept.id} onClick={() => handleSelectItem(dept)} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-teal-200 cursor-pointer mb-2 bg-white">
                                                            <div className={cn("p-2 rounded-md shrink-0", dept.bg, dept.color)}><dept.icon size={18}/></div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-900">{dept.label}</div>
                                                                <div className="text-xs text-slate-500 line-clamp-2">{dept.description}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {results.staff?.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Staff Directory</div>
                                                    {results.staff?.map(person => (
                                                         <div key={person.id} onClick={() => handleSelectItem(person)} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-teal-200 cursor-pointer mb-2 bg-white">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={person.image} />
                                                                <AvatarFallback>{person.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-900">{person.name}</div>
                                                                <div className="text-xs text-slate-500">{person.role}</div>
                                                            </div>
                                                         </div>
                                                    ))}
                                                </div>
                                            )}

                                            {results.guides?.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Related Guides</div>
                                                    {results.guides?.map(guide => (
                                                        <div key={guide.id} onClick={() => handleSelectItem(guide)} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors cursor-pointer group mb-2 bg-white">
                                                            <div className="bg-slate-100 p-2 rounded-md text-slate-500 group-hover:text-teal-600 transition-colors">
                                                                <guide.icon size={16} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-900 group-hover:text-teal-700">{guide.title}</div>
                                                                <div className="text-xs text-slate-500">{guide.desc}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Navigation Overlay */}
            <AnimatePresence>
                {showNavigation && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-end sm:justify-center p-4">
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <Footprints size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Navigating...</h3>
                                <p className="text-slate-500">
                                    Calculating best route to <span className="font-semibold text-slate-900">{navigationTarget}</span>
                                </p>
                            </div>
                            
                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</div>
                                    <span className="text-slate-700">Walk straight 20m from your location</span>
                                </div>
                                <div className="h-4 w-0.5 bg-slate-300 ml-3" />
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</div>
                                    <span className="text-slate-700">Turn right at the main reception</span>
                                </div>
                                <div className="h-4 w-0.5 bg-slate-300 ml-3" />
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                                        <MapPin size={12} />
                                    </div>
                                    <span className="text-slate-900 font-bold">Arrive at destination</span>
                                </div>
                            </div>

                            <Button className="w-full h-12 text-lg bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200" onClick={() => { setShowNavigation(false); toast.info("Navigation ended"); }}>
                                End Navigation
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
