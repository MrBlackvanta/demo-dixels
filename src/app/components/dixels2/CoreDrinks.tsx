import React, { useState, useMemo, useEffect } from 'react';
import { 
  Coffee, 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ChefHat, 
  Truck, 
  LayoutDashboard, 
  Settings, 
  Users,
  Utensils,
  Bell,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Monitor,
  HelpCircle,
  ArrowLeft,
  PanelRight,
  MoreVertical,
  RefreshCcw,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  X,
  Trash2,
  List,
  Sparkles,
  Zap,
  CalendarDays,
  User,
  ArrowRight,
  BarChart3,
  Edit,
  Power,
  AlertTriangle,
  Heart,
  Star,
  Info,
  Check,
  MessageSquare,
  Printer,
  Download,
  LifeBuoy,
  Wrench,
  Briefcase,
  Laptop,
  Hammer,
  ClipboardList,
  Activity,
  Layers,
  GitPullRequest,
  PlayCircle,
  StopCircle,
  Archive
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Domain Models ---

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
type ProductCategory = 'coffee' | 'tea' | 'cold' | 'snack' | 'meal';

interface ProductOption {
  id: string;
  name: string;
  type: 'select' | 'radio' | 'check';
  choices: { label: string; priceMod?: number }[];
  required?: boolean;
}

interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  description: string;
  calories?: number;
  tags?: string[];
  allergens?: string[];
  available: boolean;
  stock?: number;
  minStock?: number;
  customization?: ProductOption[];
  availableFloors?: number[]; // If undefined, available on all floors
}

interface CartItem {
  itemId: string; // Unique ID for the cart line item
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>; // Option ID -> Choice Label
  totalPrice: number;
  notes?: string;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  location: string;
  timestamp: Date;
  estimatedCompletion?: Date;
  type?: 'order' | 'assistance'; // New field to distinguish service requests
  message?: string; // Optional message for assistance requests
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'warning' | 'error' | 'maintenance';
  location: string;
  lastService: string;
  issue?: string;
}

interface Robot {
  id: string;
  name: string;
  status: 'idle' | 'delivering' | 'returning' | 'charging' | 'maintenance';
  battery: number;
  location: string;
}

interface StockLog {
  id: string;
  productId: string;
  productName: string;
  change: number;
  newLevel: number;
  reason: 'consumption' | 'manual_adjustment' | 'restock' | 'waste';
  timestamp: Date;
  userId: string;
}



// --- Smart Features Types ---

interface SmartRules {
   happyHour: boolean;
   autoStock: boolean;
   breakfastMode: boolean;
}

interface HappyHourConfig {
   start: string;
   end: string;
   discount: number;
   includedCategories: string[];
   days: string[];
}

interface BreakfastConfig {
   start: string;
   end: string;
   highlightCategories: string[];
   checklist: string[];
}

interface RestockConfig {
   threshold: number;
   autoApproveLimit: number;
   suppliers: string[];
}

interface RestockItem {
   id: number;
   item: string;
   qty: number;
   supplier: string;
   cost: number;
   status: string;
}

// --- Mock Data ---

const COMMON_COFFEE_OPTIONS: ProductOption[] = [
  {
    id: 'size',
    name: 'Size',
    type: 'radio',
    required: true,
    choices: [
      { label: 'Regular (12oz)', priceMod: 0 },
      { label: 'Large (16oz)', priceMod: 0.75 }
    ]
  },
  {
    id: 'milk',
    name: 'Milk Choice',
    type: 'radio',
    required: true,
    choices: [
      { label: 'Whole Milk', priceMod: 0 },
      { label: 'Oat Milk', priceMod: 0.75 },
      { label: 'Almond Milk', priceMod: 0.75 },
      { label: 'Soy Milk', priceMod: 0.50 },
      { label: 'Skim Milk', priceMod: 0 }
    ]
  },
  {
    id: 'sweetness',
    name: 'Sweetness',
    type: 'radio',
    required: false,
    choices: [
      { label: 'No Sugar', priceMod: 0 },
      { label: 'Light Sweet', priceMod: 0 },
      { label: 'Normal', priceMod: 0 },
      { label: 'Extra Sweet', priceMod: 0 }
    ]
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-vip-1',
    name: 'Gold Leaf Cappuccino',
    category: 'coffee',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600',
    description: 'Our signature cappuccino dusted with 24k edible gold. Exclusive to Executive floors.',
    calories: 180,
    tags: ['VIP', 'Exclusive'],
    available: true,
    stock: 50,
    minStock: 5,
    availableFloors: [40],
    customization: COMMON_COFFEE_OPTIONS
  },
  {
    id: 'p1',
    name: 'Artisan Pour-Over',
    category: 'coffee',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600',
    description: 'Single-origin beans, hand-poured for maximum flavor clarity.',
    calories: 5,
    tags: ['Popular', 'Vegan'],
    available: true,
    stock: 200,
    minStock: 20,
    customization: [
      {
         id: 'size',
         name: 'Size',
         type: 'radio',
         required: true,
         choices: [{ label: 'Regular', priceMod: 0 }, { label: 'Large', priceMod: 0.5 }]
      }
    ]
  },
  {
    id: 'p2',
    name: 'Flat White',
    category: 'coffee',
    price: 4.25,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600',
    description: 'Double espresso with micro-foam. Smooth and velvety.',
    calories: 120,
    tags: ['Staff Pick'],
    allergens: ['Dairy'],
    available: true,
    stock: 150,
    minStock: 15,
    customization: COMMON_COFFEE_OPTIONS
  },
  {
    id: 'p3',
    name: 'Iced Matcha Latte',
    category: 'tea',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1515825838458-f2a94b20105a?q=80&w=600',
    description: 'Ceremonial grade matcha served over ice with milk of choice.',
    calories: 140,
    tags: ['Healthy', 'Antioxidant'],
    available: true,
    stock: 100,
    minStock: 10,
    customization: COMMON_COFFEE_OPTIONS
  },
  {
    id: 'p4',
    name: 'Cold Brew Nitrogen',
    category: 'cold',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600',
    description: 'Slow-steeped cold brew infused with nitrogen for a creamy head.',
    calories: 5,
    tags: ['New', 'Caffeine Kick'],
    available: true,
    stock: 5,
    minStock: 10,
    customization: [
      {
         id: 'size',
         name: 'Size',
         type: 'radio',
         required: true,
         choices: [{ label: 'Regular', priceMod: 0 }, { label: 'Large', priceMod: 1.0 }]
      },
      {
        id: 'flavor',
        name: 'Flavor Shot',
        type: 'radio',
        required: false,
        choices: [
           { label: 'None', priceMod: 0 },
           { label: 'Vanilla', priceMod: 0.5 },
           { label: 'Caramel', priceMod: 0.5 },
           { label: 'Hazelnut', priceMod: 0.5 }
        ]
      }
    ]
  },
  {
    id: 'p5',
    name: 'Avocado Sourdough',
    category: 'snack',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1588137372308-15f75323ca8d?q=80&w=600',
    description: 'Toasted sourdough topped with smashed avocado, seeds, and chili flakes.',
    calories: 320,
    tags: ['Vegan', 'Meal'],
    allergens: ['Gluten', 'Sesame'],
    available: false,
    stock: 0,
    minStock: 5
  },
  {
    id: 'p6',
    name: 'Blueberry Muffin',
    category: 'snack',
    price: 3.75,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=600',
    description: 'Freshly baked daily with organic blueberries.',
    calories: 380,
    allergens: ['Gluten', 'Eggs', 'Dairy'],
    available: true,
    stock: 45,
    minStock: 12,
    customization: [
      {
         id: 'warm',
         name: 'Preparation',
         type: 'radio',
         required: true,
         choices: [{ label: 'Room Temp', priceMod: 0 }, { label: 'Warmed Up', priceMod: 0 }]
      }
    ]
  }
];

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', name: 'La Marzocco Strada', type: 'Espresso Machine', status: 'operational', location: 'L4 Bar', lastService: '2 days ago' },
  { id: 'eq-2', name: 'Nuova Simonelli', type: 'Grinder', status: 'warning', location: 'L4 Bar', lastService: '1 month ago', issue: 'Burr replacement due' },
  { id: 'eq-3', name: 'Sub-Zero Pro', type: 'Refrigerator', status: 'operational', location: 'L4 Kitchen', lastService: '3 months ago' },
  { id: 'eq-4', name: 'Robot Dock A', type: 'Docking Station', status: 'error', location: 'L4 Hall', lastService: '1 day ago', issue: 'Connection fault' }
];

const MOCK_ROBOTS: Robot[] = [
  { id: 'bot-1', name: 'R2-Brew', status: 'delivering', battery: 78, location: 'Floor 4' },
  { id: 'bot-2', name: 'C-3POur', status: 'idle', battery: 100, location: 'Dock' },
  { id: 'bot-3', name: 'BB-Latte', status: 'charging', battery: 45, location: 'Dock' }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8820',
    userId: 'u1',
    userName: 'Alex Morgan',
    items: [{ 
       itemId: 'item-0', 
       product: MOCK_PRODUCTS[0], 
       quantity: 1, 
       selectedOptions: { "Size": "Regular" }, 
       totalPrice: 4.50 
    }],
    total: 4.50,
    status: 'completed',
    location: 'Desk 4-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // Yesterday
  },
  {
    id: 'ORD-8821',
    userId: 'u1',
    userName: 'Alex Morgan',
    items: [{ 
       itemId: 'item-1', 
       product: MOCK_PRODUCTS[1], 
       quantity: 1, 
       selectedOptions: { "Milk Choice": "Oat Milk", "Size": "Regular (12oz)" }, 
       totalPrice: 5.00 
    }],
    total: 5.00,
    status: 'ready',
    location: 'Meeting Room 4B',
    timestamp: new Date(Date.now() - 1000 * 60 * 12)
  },
  {
    id: 'ORD-8822',
    userId: 'u2',
    userName: 'Sarah Chen',
    items: [{ 
       itemId: 'item-2',
       product: MOCK_PRODUCTS[3], 
       quantity: 2, 
       selectedOptions: { "Size": "Regular" }, 
       totalPrice: 10.00 
    }],
    total: 10.00,
    status: 'preparing',
    location: 'Desk 4-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  // --- New Mock Data for Smart Features ---
  {
    id: 'ORD-8823',
    userId: 'u3',
    userName: 'Mike Ross',
    items: [{ itemId: 'i3', product: MOCK_PRODUCTS[0], quantity: 1, totalPrice: 3.50, selectedOptions: {} }],
    total: 3.50,
    status: 'pending',
    location: 'Main Lobby', // Floor 1
    timestamp: new Date(Date.now() - 1000 * 60 * 2)
  },
  {
    id: 'ORD-8824',
    userId: 'u4',
    userName: 'Harvey Specter',
    items: [{ itemId: 'i4', product: MOCK_PRODUCTS[2], quantity: 1, totalPrice: 4.50, selectedOptions: {} }],
    total: 4.50,
    status: 'pending',
    location: 'Conf Room "Skyline"', // Floor 12
    timestamp: new Date(Date.now() - 1000 * 60 * 8)
  },
  { // Rush Mode Trigger 1
    id: 'ORD-8825',
    userId: 'u5',
    userName: 'Donna Paulsen',
    items: [{ itemId: 'i5', product: MOCK_PRODUCTS[1], quantity: 1, totalPrice: 5.00, selectedOptions: { "Milk": "Oat" } }],
    total: 5.00,
    status: 'pending',
    location: 'Desk 4-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 1)
  },
  { // Rush Mode Trigger 2
    id: 'ORD-8826',
    userId: 'u6',
    userName: 'Louis Litt',
    items: [{ itemId: 'i6', product: MOCK_PRODUCTS[4], quantity: 1, totalPrice: 8.50, selectedOptions: {} }],
    total: 8.50,
    status: 'pending',
    location: 'Meeting Room 4A',
    timestamp: new Date(Date.now() - 1000 * 60 * 3)
  },
  { // Rush Mode Trigger 3
    id: 'ORD-8827',
    userId: 'u7',
    userName: 'Rachel Zane',
    items: [{ itemId: 'i7', product: MOCK_PRODUCTS[2], quantity: 2, totalPrice: 9.00, selectedOptions: {} }],
    total: 9.00,
    status: 'pending',
    location: 'Huddle Space North', // Floor 4
    timestamp: new Date(Date.now() - 1000 * 60 * 4)
  },
  { // Rush Mode Trigger 4
    id: 'ORD-8828',
    userId: 'u8',
    userName: 'Jessica Pearson',
    items: [{ itemId: 'i8', product: MOCK_PRODUCTS[0], quantity: 1, totalPrice: 3.50, selectedOptions: { "Size": "Large" } }],
    total: 3.50,
    status: 'preparing',
    location: 'Desk 4-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 6)
  },
  { // Service Request Mock
    id: 'REQ-9001',
    userId: 'u9',
    userName: 'Robert Zane',
    items: [],
    total: 0,
    status: 'pending',
    location: 'Meeting Room 4A',
    timestamp: new Date(),
    type: 'assistance',
    message: 'We need water and cleanup service ASAP.'
  }
];

// --- Smart Location Logic ---

interface BuildingLocation {
  id: string;
  name: string;
  type: 'desk' | 'room' | 'area';
  floor: number;
  status?: 'available' | 'busy' | 'closed';
}

const TOWER_LOCATIONS: Record<number, BuildingLocation[]> = {
  1: [
    { id: 'l1-lobby', name: 'Main Lobby', type: 'area', floor: 1, status: 'available' },
    { id: 'l1-recep', name: 'Reception Desk', type: 'desk', floor: 1, status: 'available' },
    { id: 'l1-wait', name: 'Waiting Area B', type: 'area', floor: 1, status: 'available' }
  ],
  4: [
    { id: 'l4-102', name: 'Desk 4-102 (My Desk)', type: 'desk', floor: 4, status: 'available' },
    { id: 'l4-mr-a', name: 'Meeting Room 4A', type: 'room', floor: 4, status: 'busy' },
    { id: 'l4-mr-b', name: 'Meeting Room 4B', type: 'room', floor: 4, status: 'available' },
    { id: 'l4-huddle', name: 'Huddle Space North', type: 'area', floor: 4, status: 'available' }
  ],
  12: [
    { id: 'l12-conf', name: 'Conf Room "Skyline"', type: 'room', floor: 12, status: 'busy' },
    { id: 'l12-hot', name: 'Hot Desk Zone A', type: 'area', floor: 12, status: 'available' }
  ],
  40: [
    { id: 'l40-board', name: 'Boardroom', type: 'room', floor: 40, status: 'available' },
    { id: 'l40-exec', name: 'Executive Lounge', type: 'area', floor: 40, status: 'available' }
  ]
};

export const getFloorFromLocation = (locationName: string): number => {
  for (const [fStr, locs] of Object.entries(TOWER_LOCATIONS)) {
    if (locs.some(l => l.name === locationName)) return parseInt(fStr);
  }
  const match = locationName.match(/(?:Floor|Desk)\s+(\d+)/i) || locationName.match(/^(\d+)-/);
  if (match) return parseInt(match[1]);
  return 4; 
};

const SmartLocationPicker: React.FC<{
  value: string;
  onChange: (loc: string) => void;
  variant?: 'sidebar' | 'header';
}> = ({ value, onChange, variant = 'sidebar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFloor, setActiveFloor] = useState<number | null>(4); // Default to user's floor

  // Mock Calendar Event for "Smart" suggestion
  const nextMeeting = {
    title: "Weekly Sync",
    location: "Meeting Room 4A",
    time: "Starts in 10m"
  };

  const floors = [40, 12, 4, 1]; // Sort desc

  const filteredLocations = useMemo(() => {
    if (!search) return null;
    const all: BuildingLocation[] = [];
    Object.values(TOWER_LOCATIONS).forEach(locs => all.push(...locs));
    return all.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {variant === 'sidebar' ? (
        <div className="mt-2 w-full" onClick={(e) => e.stopPropagation()}>
           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">Delivering To</div>
           <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between h-9 bg-white border-slate-200 text-slate-700 font-normal hover:bg-slate-50 hover:text-teal-700 shadow-sm"
              onClick={() => setIsOpen(true)}
           >
              <div className="flex items-center gap-2 truncate">
                 <MapPin size={14} className="text-teal-600 shrink-0" />
                 <span className="truncate font-medium">{value}</span>
              </div>
              <ChevronDown size={14} className="opacity-50 shrink-0" />
           </Button>
        </div>
      ) : (
        <Button 
           variant="outline" 
           size="sm" 
           className="w-auto min-w-[180px] max-w-[240px] justify-between h-9 bg-white border-slate-200 text-slate-700 font-normal hover:bg-slate-50 hover:text-teal-700 shadow-sm"
           onClick={() => setIsOpen(true)}
        >
           <div className="flex items-center gap-2 truncate">
              <MapPin size={14} className="text-teal-600 shrink-0" />
              <div className="flex flex-col items-start leading-none gap-0.5">
                 <span className="truncate font-medium text-xs">{value}</span>
                 <span className="text-[10px] text-slate-400 font-normal">Floor {getFloorFromLocation(value)}</span>
              </div>
           </div>
           <ChevronDown size={14} className="opacity-50 shrink-0 ml-2" />
        </Button>
      )}

      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b bg-slate-50">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="text-teal-600" size={20} /> Select Delivery Location
          </DialogTitle>
          <DialogDescription>
             Choose a destination within Dixels Tower.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-2 border-b">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                 placeholder="Search room, desk, or floor..." 
                 className="pl-9 bg-slate-50 border-slate-200"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <ScrollArea className="h-[400px]">
           {search ? (
              <div className="p-2">
                 <div className="text-xs font-bold text-slate-400 px-2 py-2">SEARCH RESULTS</div>
                 {filteredLocations && filteredLocations.length > 0 ? (
                    filteredLocations.map(loc => (
                       <button
                          key={loc.id}
                          onClick={() => { onChange(loc.name); setIsOpen(false); }}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                       >
                          <MapPin size={16} className="text-slate-400" />
                          <div>
                             <div className="font-medium text-slate-900">{loc.name}</div>
                             <div className="text-xs text-slate-500">Floor {loc.floor} • {loc.type}</div>
                          </div>
                       </button>
                    ))
                 ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">No locations found.</div>
                 )}
              </div>
           ) : (
              <div className="p-2 space-y-4">
                 {/* Smart Suggestion */}
                 <div className="mx-2 mt-2">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-3 relative overflow-hidden">
                       <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600 z-10">
                          <CalendarDays size={18} />
                       </div>
                       <div className="flex-1 z-10">
                          <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-0.5">Suggested</div>
                          <div className="font-medium text-slate-900 text-sm">{nextMeeting.location}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                             <span className="font-medium text-indigo-600">{nextMeeting.title}</span> • {nextMeeting.time}
                          </div>
                       </div>
                       <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 bg-white/80 hover:bg-white text-indigo-700 z-10 shadow-sm"
                          onClick={() => { onChange(nextMeeting.location); setIsOpen(false); }}
                       >
                          Select
                       </Button>
                       {/* Decoration */}
                       <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"></div>
                    </div>
                 </div>

                 {/* Favorites / Recent */}
                 <div>
                    <div className="text-xs font-bold text-slate-400 px-2 mb-1 flex items-center gap-2">
                       <Star size={12} /> SAVED LOCATIONS
                    </div>
                    <button
                        onClick={() => { onChange("Desk 4-102 (My Desk)"); setIsOpen(false); }}
                        className="w-full text-left flex items-center gap-3 p-2 px-3 rounded-lg hover:bg-slate-50 transition-colors group"
                     >
                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                           <User size={16} />
                        </div>
                        <div>
                           <div className="font-medium text-slate-900">My Desk (4-102)</div>
                           <div className="text-xs text-slate-500">Floor 4 • Engineering</div>
                        </div>
                        {value === "Desk 4-102 (My Desk)" && <Check size={16} className="ml-auto text-teal-600" />}
                     </button>
                 </div>

                 <Separator />

                 {/* Building Directory */}
                 <div>
                    <div className="text-xs font-bold text-slate-400 px-2 mb-2 flex items-center gap-2">
                       <LayoutDashboard size={12} /> BUILDING DIRECTORY
                    </div>
                    <div className="flex gap-2 mb-2 px-2 overflow-x-auto pb-2 hide-scrollbar">
                       {floors.map(f => (
                          <button
                             key={f}
                             onClick={() => setActiveFloor(f)}
                             className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                                activeFloor === f
                                   ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                   : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                             )}
                          >
                             Floor {f}
                          </button>
                       ))}
                    </div>
                    
                    <div className="space-y-1">
                       {activeFloor && TOWER_LOCATIONS[activeFloor]?.map(loc => (
                          <button
                             key={loc.id}
                             onClick={() => { onChange(loc.name); setIsOpen(false); }}
                             className={cn(
                                "w-full text-left flex items-center gap-3 p-2 px-3 rounded-lg hover:bg-slate-50 transition-colors",
                                value === loc.name && "bg-teal-50/50"
                             )}
                          >
                             <div className={cn(
                                "w-2 h-2 rounded-full",
                                loc.status === 'busy' ? "bg-red-400" : "bg-green-400"
                             )} title={loc.status} />
                             <div className="flex-1">
                                <div className="font-medium text-sm text-slate-900">{loc.name}</div>
                                <div className="text-[10px] text-slate-500 capitalize">{loc.type} • {loc.status}</div>
                             </div>
                             {value === loc.name && <Check size={14} className="text-teal-600" />}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// --- Product Detail Dialog ---

const ProductDetailDialog: React.FC<{
   product: Product | null;
   isOpen: boolean;
   onClose: () => void;
   onAddToCart: (item: CartItem) => void;
}> = ({ product, isOpen, onClose, onAddToCart }) => {
   const [quantity, setQuantity] = useState(1);
   const [selectedOptions, setSelectedOptions] = useState<Record<string, { label: string; priceMod: number }>>({});
   const [notes, setNotes] = useState('');

   // Reset state when product changes
   useEffect(() => {
      if (product) {
         setQuantity(1);
         setNotes('');
         // Set default required options
         const defaults: Record<string, { label: string; priceMod: number }> = {};
         product.customization?.forEach(opt => {
            if (opt.required && opt.choices.length > 0) {
               defaults[opt.name] = opt.choices[0];
            }
         });
         setSelectedOptions(defaults);
      }
   }, [product]);

   const currentPrice = useMemo(() => {
      if (!product) return 0;
      const base = product.price;
      const mods = Object.values(selectedOptions).reduce((sum, opt) => sum + opt.priceMod, 0);
      return (base + mods) * quantity;
   }, [product, selectedOptions, quantity]);

   const handleOptionSelect = (optName: string, choice: { label: string; priceMod: number }) => {
      setSelectedOptions(prev => ({
         ...prev,
         [optName]: choice
      }));
   };

   const handleAdd = () => {
      if (!product) return;
      
      // Validation: Check required options
      const missingRequired = product.customization?.some(opt => opt.required && !selectedOptions[opt.name]);
      if (missingRequired) {
         toast.error("Please select all required options");
         return;
      }

      // Convert complex option state to simple record for cart
      const simplifiedOptions: Record<string, string> = {};
      Object.entries(selectedOptions).forEach(([key, val]) => {
         simplifiedOptions[key] = val.label;
      });

      onAddToCart({
         itemId: `cart-${Date.now()}`,
         product,
         quantity,
         selectedOptions: simplifiedOptions,
         totalPrice: currentPrice,
         notes: notes.trim()
      });
      onClose();
   };

   if (!product) return null;

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md p-0 overflow-hidden gap-0" aria-describedby="product-description">
            <DialogHeader className="sr-only">
               <DialogTitle>{product.name}</DialogTitle>
               <DialogDescription id="product-description">
                  Customize your {product.name} order
               </DialogDescription>
            </DialogHeader>
            <div className="relative h-48 bg-slate-100">
               <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
               <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute top-2 right-2 rounded-full h-8 w-8 bg-white/80 hover:bg-white text-slate-900"
                  onClick={onClose}
               >
                  <X size={16} />
               </Button>
               {product.tags?.[0] && (
                  <Badge className="absolute bottom-2 left-2 bg-white/90 text-slate-900 shadow-sm backdrop-blur">
                     {product.tags[0]}
                  </Badge>
               )}
            </div>
            
            <ScrollArea className="max-h-[60vh]">
               <div className="p-6 space-y-6">
                  <div>
                     <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
                        <span className="text-xl font-bold text-teal-700">${product.price.toFixed(2)}</span>
                     </div>
                     <p className="text-slate-500 text-sm leading-relaxed">{product.description}</p>
                     
                     <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                        {product.calories && (
                           <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                              <Zap size={12} /> {product.calories} kcal
                           </div>
                        )}
                        {product.allergens && (
                           <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">
                              <AlertTriangle size={12} /> {product.allergens.join(', ')}
                           </div>
                        )}
                     </div>
                  </div>

                  <Separator />

                  {/* Customization Options */}
                  {product.customization?.map(opt => (
                     <div key={opt.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                           <Label className="text-base font-semibold text-slate-800">
                              {opt.name} {opt.required && <span className="text-red-500">*</span>}
                           </Label>
                           {opt.required && <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Required</span>}
                        </div>
                        
                        {opt.type === 'radio' && (
                           <div className="grid gap-2">
                              {opt.choices.map((choice, idx) => (
                                 <div 
                                    key={idx}
                                    onClick={() => handleOptionSelect(opt.name, { label: choice.label, priceMod: choice.priceMod || 0 })}
                                    className={cn(
                                       "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                       selectedOptions[opt.name]?.label === choice.label 
                                          ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600" 
                                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                 >
                                    <span className="text-sm font-medium">{choice.label}</span>
                                    {choice.priceMod ? (
                                       <span className="text-xs text-slate-500">+{choice.priceMod.toFixed(2)}</span>
                                    ) : null}
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  ))}

                  <div className="space-y-2">
                     <Label className="text-base font-semibold text-slate-800">Special Instructions</Label>
                     <Textarea 
                        placeholder="e.g. Extra hot, leave room for cream..." 
                        className="resize-none text-sm"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                     />
                  </div>
               </div>
            </ScrollArea>

            <div className="p-4 border-t bg-slate-50 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                     >
                        <Minus size={14} />
                     </Button>
                     <span className="font-semibold w-6 text-center">{quantity}</span>
                     <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(quantity + 1)}
                     >
                        <Plus size={14} />
                     </Button>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-slate-500">Total</p>
                     <p className="text-lg font-bold text-slate-900">${currentPrice.toFixed(2)}</p>
                  </div>
               </div>
               <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white" onClick={handleAdd}>
                  Add to Cart - ${currentPrice.toFixed(2)}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

// --- View Components ---

const StockHistoryDialog: React.FC<{
   isOpen: boolean;
   onClose: () => void;
   product: Product | null;
   logs: StockLog[];
}> = ({ isOpen, onClose, product, logs }) => {
   if (!product) return null;

   const productLogs = logs.filter(l => l.productId === product.id).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Stock History</DialogTitle>
               <DialogDescription>Audit trail for {product.name}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto -mr-4 pr-4">
               {productLogs.length === 0 ? (
                  <div className="text-center p-8 text-slate-400 text-sm">No stock history recorded.</div>
               ) : (
                  <div className="space-y-4">
                     {productLogs.map(log => (
                        <div key={log.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <Badge variant={log.change > 0 ? "default" : "secondary"} className={cn("text-[10px] h-5", log.change > 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-600")}>
                                    {log.change > 0 ? "+" : ""}{log.change}
                                 </Badge>
                                 <span className="font-bold text-sm text-slate-800">New Level: {log.newLevel}</span>
                              </div>
                              <p className="text-xs text-slate-500 capitalize">{log.reason.replace('_', ' ')} • User: {log.userId}</p>
                           </div>
                           <div className="text-right">
                              <div className="text-xs font-mono text-slate-400">{format(log.timestamp, 'MMM d')}</div>
                              <div className="text-xs font-mono text-slate-400">{format(log.timestamp, 'HH:mm')}</div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
};

const ProductEditDialog: React.FC<{
   product: Product | null;
   isOpen: boolean;
   onClose: () => void;
   onSave: (product: Product) => void;
}> = ({ product, isOpen, onClose, onSave }) => {
   const [activeTab, setActiveTab] = useState("basic");
   const [formData, setFormData] = useState<Product>({
      id: '',
      name: '',
      category: 'coffee',
      price: 0,
      image: '',
      description: '',
      calories: 0,
      tags: [],
      allergens: [],
      available: true,
      customization: []
   });

   useEffect(() => {
      if (isOpen) {
         if (product) {
            setFormData(JSON.parse(JSON.stringify(product))); // Deep copy
         } else {
            setFormData({
               id: `p-${Date.now()}`,
               name: '',
               category: 'coffee',
               price: 0,
               image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600',
               description: '',
               calories: 0,
               tags: [],
               allergens: [],
               available: true,
               customization: []
            });
         }
         setActiveTab("basic");
      }
   }, [product, isOpen]);

   const handleSave = () => {
      if (!formData.name || formData.price < 0) {
         toast.error("Please fill in valid name and price");
         return;
      }
      onSave(formData);
      onClose();
   };

   // ... rest of helper functions ...

   const addCustomizationOption = () => {
      setFormData(prev => ({
         ...prev,
         customization: [
            ...(prev.customization || []),
            {
               id: `opt-${Date.now()}`,
               name: 'New Option',
               type: 'radio',
               required: false,
               choices: [{ label: 'Default', priceMod: 0 }]
            }
         ]
      }));
   };

   const updateOption = (idx: number, updates: Partial<ProductOption>) => {
      const newOpts = [...(formData.customization || [])];
      newOpts[idx] = { ...newOpts[idx], ...updates };
      setFormData({ ...formData, customization: newOpts });
   };

   const removeOption = (idx: number) => {
      const newOpts = [...(formData.customization || [])];
      newOpts.splice(idx, 1);
      setFormData({ ...formData, customization: newOpts });
   };

   const addChoice = (optIdx: number) => {
      const newOpts = [...(formData.customization || [])];
      newOpts[optIdx].choices.push({ label: 'New Choice', priceMod: 0 });
      setFormData({ ...formData, customization: newOpts });
   };

   const updateChoice = (optIdx: number, choiceIdx: number, updates: { label?: string, priceMod?: number }) => {
      const newOpts = [...(formData.customization || [])];
      newOpts[optIdx].choices[choiceIdx] = { ...newOpts[optIdx].choices[choiceIdx], ...updates };
      setFormData({ ...formData, customization: newOpts });
   };

   const removeChoice = (optIdx: number, choiceIdx: number) => {
      const newOpts = [...(formData.customization || [])];
      newOpts[optIdx].choices.splice(choiceIdx, 1);
      setFormData({ ...formData, customization: newOpts });
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-2">
               <DialogTitle>{product ? 'Edit Product' : 'Create New Product'}</DialogTitle>
               <DialogDescription>
                  Configure product details, attributes, and customization options.
               </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col">
               <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <div className="px-6 border-b">
                     <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Attributes</TabsTrigger>
                        <TabsTrigger value="customization">Customization</TabsTrigger>
                     </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                     <TabsContent value="basic" className="mt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label>Product Name</Label>
                              <Input 
                                 value={formData.name} 
                                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                                 placeholder="e.g. Caramel Macchiato" 
                              />
                           </div>
                           <div className="space-y-2">
                              <Label>Category</Label>
                              <Select 
                                 value={formData.category} 
                                 onValueChange={(val: any) => setFormData({...formData, category: val})}
                              >
                                 <SelectTrigger>
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {['coffee', 'tea', 'cold', 'snack', 'meal'].map(c => (
                                       <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label>Price ($)</Label>
                              <Input 
                                 type="number" 
                                 step="0.01" 
                                 min="0"
                                 value={formData.price} 
                                 onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} 
                              />
                           </div>
                           <div className="space-y-2">
                              <Label>Calories (kcal)</Label>
                              <Input 
                                 type="number" 
                                 value={formData.calories || 0} 
                                 onChange={(e) => setFormData({...formData, calories: parseInt(e.target.value)})} 
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <Label>Description</Label>
                           <Textarea 
                              value={formData.description} 
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              rows={3} 
                           />
                        </div>

                        <div className="space-y-2">
                           <Label>Image URL</Label>
                           <div className="flex gap-4">
                              <Input 
                                 value={formData.image} 
                                 onChange={(e) => setFormData({...formData, image: e.target.value})} 
                                 className="flex-1"
                              />
                              <div className="w-16 h-10 rounded border overflow-hidden bg-slate-100 flex-shrink-0">
                                 <img src={formData.image} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                              </div>
                           </div>
                           <p className="text-[10px] text-slate-500">Paste an Unsplash URL for best results.</p>
                        </div>
                     </TabsContent>

                     <TabsContent value="details" className="mt-0 space-y-6">
                        <div className="space-y-3">
                           <Label>Tags (Comma separated)</Label>
                           <Input 
                              value={formData.tags?.join(', ') || ''} 
                              onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                              placeholder="e.g. Popular, Vegan, Spicy" 
                           />
                           <div className="flex flex-wrap gap-2">
                              {formData.tags?.map((t, i) => (
                                 <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <Label>Allergens (Comma separated)</Label>
                           <Input 
                              value={formData.allergens?.join(', ') || ''} 
                              onChange={(e) => setFormData({...formData, allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                              placeholder="e.g. Dairy, Gluten, Nuts" 
                           />
                           <div className="flex flex-wrap gap-2">
                              {formData.allergens?.map((t, i) => (
                                 <Badge key={i} variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">{t}</Badge>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <Label>Floor Availability (Leave empty for All Floors)</Label>
                           <div className="flex flex-wrap gap-2">
                              {Object.keys(TOWER_LOCATIONS).map((floor) => {
                                 const f = parseInt(floor);
                                 const isSelected = formData.availableFloors?.includes(f);
                                 return (
                                    <Button
                                       key={f}
                                       variant={isSelected ? "default" : "outline"}
                                       size="sm"
                                       className={cn("h-7 text-xs", isSelected && "bg-slate-900 text-white")}
                                       onClick={() => {
                                          const current = formData.availableFloors || [];
                                          const next = current.includes(f) 
                                             ? current.filter(x => x !== f)
                                             : [...current, f];
                                          setFormData({ ...formData, availableFloors: next });
                                       }}
                                    >
                                       Floor {f}
                                       {isSelected && <Check size={12} className="ml-1" />}
                                    </Button>
                                 );
                              })}
                              <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 className="h-7 text-xs text-slate-500"
                                 onClick={() => setFormData({ ...formData, availableFloors: [] })}
                                 disabled={!formData.availableFloors || formData.availableFloors.length === 0}
                              >
                                 Reset (All)
                              </Button>
                           </div>
                           <p className="text-[10px] text-slate-500">
                              Restrict this product to specific floors (e.g., VIP items). If none selected, it appears everywhere.
                           </p>
                        </div>

                        <div className="flex items-center space-x-2 border p-4 rounded-lg bg-slate-50">
                           <Switch 
                              id="avail-mode" 
                              checked={formData.available}
                              onCheckedChange={(c) => setFormData({...formData, available: c})}
                           />
                           <Label htmlFor="avail-mode" className="flex-1">
                              Mark as Available
                              <span className="block text-xs font-normal text-slate-500">
                                 Turn off to mark this product as "Sold Out" immediately.
                              </span>
                           </Label>
                        </div>
                     </TabsContent>

                     <TabsContent value="customization" className="mt-0 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                           <Label className="text-base">Customization Options</Label>
                           <Button size="sm" variant="outline" onClick={addCustomizationOption}>
                              <Plus size={14} className="mr-1" /> Add Option
                           </Button>
                        </div>
                        
                        {(!formData.customization || formData.customization.length === 0) && (
                           <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-400">
                              <Settings size={24} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No customization options yet.</p>
                           </div>
                        )}

                        <div className="space-y-4">
                           {formData.customization?.map((opt, optIdx) => (
                              <Card key={opt.id} className="relative group">
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-500"
                                    onClick={() => removeOption(optIdx)}
                                 >
                                    <X size={14} />
                                 </Button>
                                 <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 pr-6">
                                       <div className="space-y-1">
                                          <Label className="text-xs">Option Name</Label>
                                          <Input 
                                             value={opt.name} 
                                             onChange={(e) => updateOption(optIdx, { name: e.target.value })} 
                                             className="h-8 text-sm"
                                          />
                                       </div>
                                       <div className="space-y-1">
                                          <Label className="text-xs">Type</Label>
                                          <Select 
                                             value={opt.type} 
                                             onValueChange={(val: any) => updateOption(optIdx, { type: val })}
                                          >
                                             <SelectTrigger className="h-8 text-sm">
                                                <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                <SelectItem value="radio">Single Select (Radio)</SelectItem>
                                                <SelectItem value="check">Multi Select (Check)</SelectItem>
                                             </SelectContent>
                                          </Select>
                                       </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                       <Switch 
                                          id={`req-${opt.id}`} 
                                          checked={opt.required} 
                                          onCheckedChange={(c) => updateOption(optIdx, { required: c })}
                                       />
                                       <Label htmlFor={`req-${opt.id}`} className="text-xs">Required Selection</Label>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-md space-y-2">
                                       <div className="flex justify-between items-center">
                                          <Label className="text-xs text-slate-500 uppercase font-bold">Choices</Label>
                                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => addChoice(optIdx)}>
                                             <Plus size={10} className="mr-1" /> Add Choice
                                          </Button>
                                       </div>
                                       {opt.choices.map((choice, cIdx) => (
                                          <div key={cIdx} className="flex gap-2 items-center">
                                             <Input 
                                                value={choice.label} 
                                                onChange={(e) => updateChoice(optIdx, cIdx, { label: e.target.value })}
                                                className="h-7 text-xs flex-1"
                                                placeholder="Label"
                                             />
                                             <div className="relative w-20">
                                                <span className="absolute left-2 top-1.5 text-xs text-slate-400">$</span>
                                                <Input 
                                                   type="number" 
                                                   value={choice.priceMod || 0} 
                                                   onChange={(e) => updateChoice(optIdx, cIdx, { priceMod: parseFloat(e.target.value) })}
                                                   className="h-7 text-xs pl-5"
                                                />
                                             </div>
                                             <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-7 w-7 text-slate-400 hover:text-red-500"
                                                onClick={() => removeChoice(optIdx, cIdx)}
                                             >
                                                <Minus size={12} />
                                             </Button>
                                          </div>
                                       ))}
                                    </div>
                                 </CardContent>
                              </Card>
                           ))}
                        </div>
                     </TabsContent>
                  </div>
               </Tabs>
            </div>

            <DialogFooter className="p-4 border-t bg-slate-50">
               <Button variant="outline" onClick={onClose}>Cancel</Button>
               <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800">
                  {product ? 'Save Changes' : 'Create Product'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

const EmptyState = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center p-6">
    <div className="bg-slate-100 p-4 rounded-full mb-4">
      <Icon size={32} className="opacity-50" />
    </div>
    <h3 className="font-medium text-slate-700">{title}</h3>
    <p className="text-sm mt-1 max-w-[200px]">{desc}</p>
  </div>
);

const OrderStatusStepper: React.FC<{ status: OrderStatus }> = ({ status }) => {
  if (status === 'cancelled') return <div className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded text-center">Order Cancelled</div>;
  if (status === 'completed') return <div className="text-green-600 text-xs font-bold bg-green-50 p-2 rounded text-center">Order Completed</div>;

  const steps = ['pending', 'preparing', 'ready', 'delivering'];
  const currentIdx = steps.indexOf(status);
  
  return (
     <div className="flex items-center justify-between px-2 pt-2 pb-2">
        {steps.map((step, idx) => {
           const isCompleted = idx < currentIdx;
           const isCurrent = idx === currentIdx;
           return (
              <div key={step} className="flex flex-col items-center gap-1 flex-1 relative">
                 {/* Connector Line */}
                 {idx !== 0 && (
                    <div className={cn(
                       "absolute top-1.5 -left-[50%] w-[100%] h-0.5",
                       idx <= currentIdx ? "bg-teal-500" : "bg-slate-200"
                    )} />
                 )}
                 <div className={cn(
                    "w-3 h-3 rounded-full z-10 transition-colors",
                    isCompleted || isCurrent ? "bg-teal-500" : "bg-slate-200",
                    isCurrent && "ring-2 ring-teal-200 scale-125"
                 )} />
                 <span className={cn(
                    "text-[8px] font-medium uppercase tracking-tight",
                    isCurrent ? "text-teal-700 font-bold" : "text-slate-400"
                 )}>
                    {step}
                 </span>
              </div>
           );
        })}
     </div>
  );
};

const AIConciergeDialog: React.FC<{
   isOpen: boolean;
   onClose: () => void;
   products: Product[];
   onAddToCart: (item: CartItem) => void;
}> = ({ isOpen, onClose, products, onAddToCart }) => {
   const [query, setQuery] = useState("");
   const [isThinking, setIsThinking] = useState(false);
   const [suggestion, setSuggestion] = useState<{ text: string, product?: Product } | null>(null);

   const handleAsk = (q: string = query) => {
      if (!q.trim()) return;
      setIsThinking(true);
      setSuggestion(null);
      setQuery(q);

      // Simulate AI Latency
      setTimeout(() => {
         const lower = q.toLowerCase();
         let match: Product | undefined;
         let reason = "Here is a popular choice for you.";

         const available = products.filter(p => p.available);

         if (lower.includes("tired") || lower.includes("sleepy") || lower.includes("energy") || lower.includes("caffeine")) {
            match = available.find(p => p.category === 'coffee' && (p.name.includes("Espresso") || p.name.includes("Brew") || p.calories! < 50));
            reason = "It sounds like you need a boost. High caffeine, low drag.";
         } else if (lower.includes("stressed") || lower.includes("relax") || lower.includes("calm")) {
            match = available.find(p => p.category === 'tea' || p.name.includes("Herbal"));
            reason = "Take a moment to breathe with something soothing.";
         } else if (lower.includes("hungry") || lower.includes("lunch") || lower.includes("food")) {
            match = available.find(p => p.category === 'meal' || p.category === 'snack');
            reason = "Fuel for the engine. This is a favorite.";
         } else if (lower.includes("hot") || lower.includes("summer") || lower.includes("refresh")) {
            match = available.find(p => p.category === 'cold');
            reason = "Cool down with this refreshing option.";
         } else if (lower.includes("surprise") || lower.includes("new")) {
            match = available[Math.floor(Math.random() * available.length)];
            reason = "Feeling adventurous? Try this.";
         }

         if (!match) match = available[0];

         setSuggestion({ text: reason, product: match });
         setIsThinking(false);
      }, 1200);
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[2rem]">
            <div className="bg-slate-900 p-6 pb-8 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/30">
                     <Sparkles size={24} />
                  </div>
                  <DialogTitle className="text-white font-bold text-lg">AI Barista</DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs">
                     Tell me how you're feeling, and I'll find your perfect drink.
                  </DialogDescription>
               </div>
            </div>

            <div className="p-4 -mt-4 bg-white rounded-t-[2rem] relative z-20 min-h-[300px] flex flex-col">
               <div className="flex-1 space-y-4 mb-4">
                  {!suggestion && !isThinking && (
                     <div className="grid grid-cols-2 gap-2">
                        {["I need energy ⚡️", "Something refreshing 🧊", "I'm hungry 🥯", "Surprise me 🎲"].map(prompt => (
                           <button 
                              key={prompt}
                              onClick={() => handleAsk(prompt)}
                              className="text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-100 transition-colors text-left"
                           >
                              {prompt}
                           </button>
                        ))}
                     </div>
                  )}

                  {isThinking && (
                     <div className="flex flex-col items-center justify-center h-40 space-y-3">
                        <div className="flex gap-1">
                           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <p className="text-xs font-bold text-indigo-500">Analyzing your vibe...</p>
                     </div>
                  )}

                  {suggestion && suggestion.product && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4"
                     >
                        <div className="flex gap-3 mb-3">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                              <Sparkles size={14} />
                           </div>
                           <p className="text-sm text-indigo-900 font-medium leading-tight pt-1">
                              {suggestion.text}
                           </p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-sm flex gap-3 items-center group cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => onAddToCart({
                           itemId: `ai-${Date.now()}`,
                           product: suggestion.product!,
                           quantity: 1,
                           totalPrice: suggestion.product!.price,
                           selectedOptions: {}
                        })}>
                           <img src={suggestion.product.image} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                           <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-900 text-sm truncate">{suggestion.product.name}</div>
                              <div className="text-indigo-600 text-xs font-bold">${suggestion.product.price.toFixed(2)}</div>
                           </div>
                           <Button size="icon" className="h-8 w-8 rounded-full bg-indigo-600 text-white shadow-md group-hover:scale-110 transition-transform">
                              <Plus size={16} />
                           </Button>
                        </div>
                     </motion.div>
                  )}
               </div>

               <div className="relative">
                  <Input 
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     placeholder="Type a request..." 
                     className="pr-10 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500"
                     onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  />
                  <Button 
                     size="icon" 
                     variant="ghost" 
                     className="absolute right-1 top-1 h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                     onClick={() => handleAsk()}
                  >
                     <ArrowRight size={16} />
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

const EmployeeOrderingView: React.FC<{
  products: Product[],
  onPlaceOrder: (items: CartItem[], location: string) => void,
  userOrders: Order[],
  smartRules: SmartRules,
  happyHourConfig: HappyHourConfig,
  breakfastConfig: BreakfastConfig
}> = ({ products, onPlaceOrder, userOrders, smartRules, happyHourConfig, breakfastConfig }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Desk 4-102');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dietary, setDietary] = useState<{vegan: boolean, gf: boolean}>({ vegan: false, gf: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartSectionOpen, setIsCartSectionOpen] = useState(true);
  const [isActiveOrdersSectionOpen, setIsActiveOrdersSectionOpen] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(['p2', 'p4']); // Initial mock favorites
  const [isAIBaristaOpen, setIsAIBaristaOpen] = useState(false);

  // Auto-switch category for Breakfast Mode
  useEffect(() => {
     if (smartRules.breakfastMode) {
        setActiveCategory('all'); // Show all so we can see the sorted list
     }
  }, [smartRules.breakfastMode]);

  // Filter orders for Sidebar (Active) vs History (Completed)
  const activeOrders = userOrders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const pastOrders = userOrders.filter(o => ['completed', 'cancelled'].includes(o.status)).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

  const categories = ['all', 'favorites', 'coffee', 'tea', 'cold', 'snack', 'meal'];

  // Determine current floor from delivery location
  const currentFloor = useMemo(() => {
     for (const [fStr, locs] of Object.entries(TOWER_LOCATIONS)) {
        if (locs.some(l => l.name === deliveryLocation)) return parseInt(fStr);
     }
     // Heuristic fallback
     const match = deliveryLocation.match(/(?:Floor|Desk)\s+(\d+)/i) || deliveryLocation.match(/^(\d+)-/);
     if (match) return parseInt(match[1]);
     return 4; // Default to main floor
  }, [deliveryLocation]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchCat = activeCategory === 'all' || 
                       (activeCategory === 'favorites' ? favorites.includes(p.id) : p.category === activeCategory);
      
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchVegan = !dietary.vegan || (p.tags?.includes('Vegan') || false);
      const matchGF = !dietary.gf || (!p.allergens?.includes('Gluten'));
      
      // Filter by floor availability
      const matchFloor = !p.availableFloors || p.availableFloors.length === 0 || p.availableFloors.includes(currentFloor);

      return matchCat && matchSearch && matchVegan && matchGF && matchFloor;
    });

    // Apply Breakfast Mode Sorting
    if (smartRules.breakfastMode && activeCategory === 'all') {
       result = result.sort((a, b) => {
          const aPrio = breakfastConfig.highlightCategories.includes(a.category) ? 2 : (a.category === 'meal' ? -1 : 1);
          const bPrio = breakfastConfig.highlightCategories.includes(b.category) ? 2 : (b.category === 'meal' ? -1 : 1);
          return bPrio - aPrio;
       });
    }

    return result;
  }, [products, activeCategory, searchTerm, dietary, currentFloor, favorites, smartRules.breakfastMode, breakfastConfig]);


  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    setIsSidebarOpen(true);
    setIsCartSectionOpen(true);
    toast.success(`Added ${item.product.name} to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId));
  };

  const reorder = (order: Order) => {
     order.items.forEach(item => {
        addToCart({
           ...item,
           itemId: `cart-${Date.now()}-${Math.random()}`
        });
     });
     toast.success("Added items from past order to cart");
  };

  const toggleFavorite = (e: React.MouseEvent, productId: string) => {
     e.stopPropagation();
     setFavorites(prev => {
        const isFav = prev.includes(productId);
        if (isFav) {
           toast.info("Removed from favorites");
           return prev.filter(id => id !== productId);
        } else {
           toast.success("Added to favorites");
           return [...prev, productId];
        }
     });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onPlaceOrder(cart, deliveryLocation);
    setCart([]);
    toast.success("Order placed! We'll notify you when it's ready.");
  };

  // Smart suggestion logic
  const suggestion = useMemo(() => {
    const hour = new Date().getHours();
    const available = products.filter(p => p.available);
    if (hour < 11) return available.find(p => p.category === 'coffee');
    if (hour >= 11 && hour < 14) return available.find(p => p.category === 'meal'); 
    return available.find(p => p.category === 'snack' || p.category === 'cold'); 
  }, [products]);

  const favoriteProducts = useMemo(() => products.filter(p => favorites.includes(p.id)), [products, favorites]);

  return (
    <div className="flex h-full gap-6">
      <ProductDetailDialog 
         product={selectedProduct} 
         isOpen={!!selectedProduct} 
         onClose={() => setSelectedProduct(null)} 
         onAddToCart={addToCart}
      />

      <AIConciergeDialog 
         isOpen={isAIBaristaOpen}
         onClose={() => setIsAIBaristaOpen(false)}
         products={products}
         onAddToCart={(item) => {
            addToCart(item);
            setIsAIBaristaOpen(false);
         }}
      />

      {/* Main Menu Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Tabs defaultValue="menu" className="h-full flex flex-col">
           <div className="flex items-center justify-between mb-4 px-1 pt-1 flex-shrink-0">
              <div>
                  <h1 className="text-2xl font-bold text-slate-900">Smart Café</h1>
                  <p className="text-slate-500 text-sm">Fuel your day with premium selections.</p>
              </div>
              <div className="flex items-center gap-4">

                 
                 <div className="hidden md:block">
                     <SmartLocationPicker value={deliveryLocation} onChange={setDeliveryLocation} variant="header" />
                 </div>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={cn("text-slate-500", isSidebarOpen && "bg-slate-100 text-slate-900")}
                    title="Toggle Cart"
                 >
                    <PanelRight size={20} />
                 </Button>
                 <TabsList>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="history">Order History</TabsTrigger>

                 </TabsList>
              </div>
           </div>



           <TabsContent value="menu" className="flex-1 flex flex-col min-h-0 data-[state=active]:flex overflow-hidden relative">
              <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
                 {/* Quick Favorites Section */}
                 {favoriteProducts.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                         <Heart size={12} className="text-rose-500 fill-rose-500" /> Your Favorites
                      </h3>
                      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                         {favoriteProducts.map(p => (
                            <button 
                               key={p.id}
                               onClick={() => setSelectedProduct(p)}
                               className="flex items-center gap-3 p-2 pr-4 bg-white border border-slate-200 rounded-full hover:shadow-md transition-shadow flex-shrink-0 group"
                            >
                               <img src={p.image} className="w-8 h-8 rounded-full object-cover" />
                               <div className="text-left">
                                  <div className="text-sm font-semibold text-slate-800">{p.name}</div>
                                  <div className="text-[10px] text-slate-500">Order again</div>
                               </div>
                               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-colors ml-2">
                                  <Plus size={14} />
                               </div>
                            </button>
                         ))}
                      </div>
                    </div>
                 )}
                 
                 {/* Smart Banner */}
                 {suggestion && (
                   <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 sm:p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden group mb-6 gap-4">
                      <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 transform translate-x-32 group-hover:translate-x-20 transition-transform duration-700 pointer-events-none"></div>
                      <div className="relative z-10 flex items-start sm:items-center gap-4 flex-1 min-w-0">
                         <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-teal-500/20 flex-shrink-0 flex items-center justify-center text-teal-400">
                           <Sparkles size={20} />
                         </div>
                         <div className="min-w-0 flex-1">
                           <h3 className="font-bold text-base sm:text-lg truncate">Recommended for you</h3>
                           <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">Based on the time of day, try our <span className="text-white font-medium">{suggestion.name}</span>.</p>
                         </div>
                      </div>
                      <Button onClick={() => setSelectedProduct(suggestion)} className="relative z-10 bg-teal-600 hover:bg-teal-500 text-white border-none flex-shrink-0 w-full md:w-auto">
                        View Item
                      </Button>
                   </div>
                 )}

                 {/* Filters */}
                 <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2 mb-6 space-y-4">
                   <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
                     <div className="flex gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 hide-scrollbar">
                       {categories.map(cat => (
                         <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={cn(
                             "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                             activeCategory === cat 
                               ? "bg-slate-900 text-white shadow-md" 
                               : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                           )}
                         >
                           {cat === 'favorites' && <Heart size={12} className={cn(activeCategory === 'favorites' ? "fill-white" : "fill-slate-400 text-slate-400")} />}
                           {cat.charAt(0).toUpperCase() + cat.slice(1)}
                         </button>
                       ))}
                     </div>
                     
                     <div className="flex items-center gap-4 w-full xl:w-auto">
                        <div className="flex items-center gap-4 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                           <div className="flex items-center gap-2">
                              <Checkbox 
                                 id="vegan" 
                                 checked={dietary.vegan} 
                                 onCheckedChange={(c) => setDietary(prev => ({...prev, vegan: !!c}))} 
                              />
                              <Label htmlFor="vegan" className="text-xs font-medium text-slate-600 cursor-pointer">Vegan</Label>
                           </div>
                           <Separator orientation="vertical" className="h-4" />
                           <div className="flex items-center gap-2">
                              <Checkbox 
                                 id="gf" 
                                 checked={dietary.gf} 
                                 onCheckedChange={(c) => setDietary(prev => ({...prev, gf: !!c}))} 
                              />
                              <Label htmlFor="gf" className="text-xs font-medium text-slate-600 cursor-pointer">No Gluten</Label>
                           </div>
                        </div>

                        <div className="relative flex-1 xl:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search items..." 
                            className="pl-9 h-9 bg-white border-slate-200 rounded-full focus-visible:ring-teal-500"
                          />
                        </div>
                     </div>
                   </div>
                 </div>

                 {/* Product Grid - Responsive Columns */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-20">
                   {filteredProducts.map(product => {
                      const isFav = favorites.includes(product.id);
                      return (
                        <motion.div 
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => product.available && setSelectedProduct(product)}
                          className={cn(
                             "group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer",
                             !product.available && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            
                            {/* Favorite Button */}
                            <button 
                               onClick={(e) => toggleFavorite(e, product.id)}
                               className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform active:scale-95"
                            >
                               <Heart size={16} className={cn("transition-colors", isFav ? "fill-rose-500 text-rose-500" : "text-slate-400")} />
                            </button>

                            {product.tags && product.tags.length > 0 && (
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {product.tags.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {!product.available && (
                               <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                  <div className="bg-white text-slate-800 px-3 py-1 font-bold rounded-full shadow-sm text-xs border border-slate-200 uppercase tracking-wide">
                                     Sold Out
                                  </div>
                               </div>
                            )}
                            {product.available && (
                               <div className="absolute bottom-3 right-3 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-900 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                 <Plus size={20} />
                               </div>
                            )}
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-slate-900 leading-tight">{product.name}</h3>
                              <span className="font-semibold text-teal-700">${product.price.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Zap size={10} /> {product.calories} kcal
                            </div>
                          </div>
                        </motion.div>
                      );
                   })}
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="history" className="flex-1 flex flex-col min-h-0 data-[state=active]:flex overflow-hidden relative">
              <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
                 {pastOrders.length === 0 ? (
                    <EmptyState icon={Clock} title="No past orders" desc="Your order history will appear here." />
                 ) : (
                    <div className="space-y-4 pb-20">
                       {pastOrders.map(order => (
                          <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                   <Badge variant="outline" className="font-mono text-xs">{format(order.timestamp, 'MMM d, yyyy h:mm a')}</Badge>
                                   <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 capitalize">{order.status}</Badge>
                                </div>
                                <div className="space-y-1">
                                   {order.items.map((item, idx) => (
                                      <div key={idx} className="text-sm font-medium text-slate-800">
                                         {item.quantity}x {item.product.name}
                                         <span className="text-slate-400 text-xs ml-2 font-normal">
                                            ({Object.values(item.selectedOptions).join(', ')})
                                         </span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="text-right">
                                   <div className="text-xs text-slate-500">Total</div>
                                   <div className="font-bold text-slate-900">${order.total.toFixed(2)}</div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => reorder(order)}>
                                   <RefreshCcw size={14} className="mr-2" /> Reorder
                                </Button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar: Cart & Status */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex-shrink-0 flex flex-col gap-6 overflow-hidden h-full pl-4 border-l border-slate-100 bg-slate-50/30"
          >
             <div className="w-80 flex flex-col gap-6 h-full pb-2">
                {/* Cart Card */}
                <Card className="flex-shrink-0 shadow-lg border-slate-200 overflow-hidden flex flex-col transition-all duration-300" style={{ flex: isCartSectionOpen ? '1' : '0 auto' }}>
                   <CardHeader className="bg-slate-50/50 pb-4 border-b cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => setIsCartSectionOpen(!isCartSectionOpen)}>
                      <div className="flex items-center justify-between">
                         <CardTitle className="text-lg flex items-center gap-2">
                           <div className="bg-teal-100 text-teal-700 p-1.5 rounded-md">
                             <ShoppingCart size={18} />
                           </div>
                           Current Order
                         </CardTitle>
                         <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                           {isCartSectionOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                         </Button>
                      </div>
                      {isCartSectionOpen && (
                         <CardDescription className="px-1">
                           <SmartLocationPicker value={deliveryLocation} onChange={setDeliveryLocation} />
                         </CardDescription>
                      )}
                   </CardHeader>
                   
                   {isCartSectionOpen && (
                      <>
                         <div className="flex-1 overflow-y-auto bg-white">
                           {cart.length === 0 ? (
                             <EmptyState icon={Coffee} title="Your cart is empty" desc="Select items from the menu to get started." />
                           ) : (
                             <div className="p-4 space-y-4">
                               {cart.map((item, idx) => (
                                  <div key={item.itemId} className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300 group">
                                     <div className="relative">
                                        <img src={item.product.image} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center border-2 border-white">
                                           {item.quantity}
                                        </div>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                           <h4 className="text-sm font-semibold truncate text-slate-800">{item.product.name}</h4>
                                           <span className="text-xs font-bold text-slate-900">${item.totalPrice.toFixed(2)}</span>
                                        </div>
                                        
                                        {/* Options Display */}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {Object.entries(item.selectedOptions).map(([key, val]) => (
                                             <span key={key} className="text-[10px] text-slate-500 bg-slate-50 px-1 rounded border border-slate-100">
                                                {val}
                                             </span>
                                          ))}
                                        </div>
                                        {item.notes && (
                                           <div className="text-[10px] text-amber-600 mt-1 italic">Note: {item.notes}</div>
                                        )}

                                        <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button onClick={() => removeFromCart(item.itemId)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                                              <Trash2 size={12} /> Remove
                                           </button>
                                        </div>
                                     </div>
                                  </div>
                               ))}
                             </div>
                           )}
                         </div>

                         <div className="p-4 bg-slate-50 border-t space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium">
                              <span className="text-slate-600">Total</span>
                              <span className="text-lg text-slate-900">${cartTotal.toFixed(2)}</span>
                            </div>
                            <Button className="w-full bg-slate-900 hover:bg-slate-800" size="lg" disabled={cart.length === 0} onClick={handleCheckout}>
                              Place Order
                            </Button>
                         </div>
                      </>
                   )}
                </Card>

                {/* Active Orders Tracking */}
                <Card className="shrink-0 flex flex-col transition-all duration-300" style={{ maxHeight: isActiveOrdersSectionOpen ? '300px' : 'auto' }}>
                  <CardHeader className="pb-2 cursor-pointer hover:bg-slate-50" onClick={() => setIsActiveOrdersSectionOpen(!isActiveOrdersSectionOpen)}>
                     <div className="flex items-center justify-between">
                       <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                         <Clock size={14} /> Active Orders
                       </CardTitle>
                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                           {isActiveOrdersSectionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                       </Button>
                     </div>
                  </CardHeader>
                  {isActiveOrdersSectionOpen && (
                     <div className="flex-1 overflow-y-auto">
                        <div className="p-4 pt-0 space-y-3">
                           {activeOrders.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No active orders.</p>
                           ) : (
                              activeOrders.map(order => (
                                 <div key={order.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-1">
                                       <span className="text-xs font-mono text-slate-500">#{order.id.slice(-4)}</span>
                                       <span className="text-[10px] text-slate-400">{format(order.timestamp, 'HH:mm')}</span>
                                    </div>
                                    <div className="text-xs font-bold text-slate-800 mb-2 truncate">
                                       {order.items.length} items • {order.items.map(i => i.product.name).join(', ')}
                                    </div>
                                    <OrderStatusStepper status={order.status} />
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  )}
                </Card>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StockControlProps {
  product: Product;
  onUpdateStock: (productId: string, newStock: number, reason: StockLog['reason']) => void;
  variant?: 'admin' | 'barista';
}

const StockControl: React.FC<StockControlProps> = ({ product, onUpdateStock, variant = 'admin' }) => {
   const isLow = product.stock !== undefined && product.minStock !== undefined && product.stock <= product.minStock;
   const percent = product.stock && product.minStock ? Math.min(100, (product.stock / (product.minStock * 4)) * 100) : 0;
   
   const handleAdjust = (delta: number) => {
      const current = product.stock || 0;
      const next = Math.max(0, current + delta);
      
      let reason: StockLog['reason'] = 'manual_adjustment';
      if (variant === 'barista') {
         if (delta < 0) reason = 'waste'; 
         else reason = 'restock'; 
      } else {
         if (delta > 0) reason = 'restock';
         else if (delta < 0) reason = 'manual_adjustment';
      }
      
      onUpdateStock(product.id, next, reason);
   };

   if (variant === 'barista') {
      return (
         <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
             <div className="flex justify-between items-center">
                 <span className="font-bold text-sm text-slate-700">{product.name}</span>
                 <Badge variant={isLow ? "destructive" : "outline"} className={cn("text-[10px] h-5", isLow ? "bg-red-100 text-red-600 border-red-200" : "bg-white")}>
                    {product.stock} Units
                 </Badge>
             </div>
             <div className="grid grid-cols-2 gap-2">
                 <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-700 hover:bg-red-50 bg-white" onClick={(e) => { e.stopPropagation(); handleAdjust(-1); }}>
                    <Trash2 size={12} className="mr-1.5" /> Waste
                 </Button>
                 <Button size="sm" variant="outline" className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white" onClick={(e) => { e.stopPropagation(); handleAdjust(5); }}>
                    <Plus size={12} className="mr-1.5" /> Restock
                 </Button>
             </div>
         </div>
      );
   }

   return (
      <div className="space-y-1.5">
         <div className="flex items-center gap-2">
            <Button 
               variant="outline" 
               size="icon" 
               className="h-6 w-6 rounded-md"
               onClick={() => handleAdjust(-1)}
            >
               <Minus size={10} />
            </Button>
            <div className="flex-1 text-center">
               <span className={cn("text-sm font-bold block leading-none", isLow ? "text-red-600" : "text-slate-700")}>
                  {product.stock}
               </span>
            </div>
            <Button 
               variant="outline" 
               size="icon" 
               className="h-6 w-6 rounded-md"
               onClick={() => handleAdjust(1)}
            >
               <Plus size={10} />
            </Button>
         </div>
         <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
               className={cn("h-full rounded-full transition-all duration-500", isLow ? "bg-red-500" : "bg-emerald-500")} 
               style={{ width: `${percent}%` }} 
            />
         </div>
         {isLow && (
            <div className="text-[9px] font-bold text-red-500 flex items-center gap-1 justify-center">
               <AlertTriangle size={8} /> Low Stock
            </div>
         )}
      </div>
   );
};

const BaristaKDSView: React.FC<{
   orders: Order[];
   products: Product[];
   onUpdateStatus: (orderId: string, status: OrderStatus) => void;
   onToggleAvailability: (productId: string) => void;
   onUpdateStock: (productId: string, newStock: number, reason: StockLog['reason']) => void;
}> = ({ orders, products, onUpdateStatus, onToggleAvailability, onUpdateStock }) => {
   const [kitchenFloor, setKitchenFloor] = useState("4");
   const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
   const [viewingItem, setViewingItem] = useState<CartItem | null>(null);
   const [isStockOpen, setIsStockOpen] = useState(false);
   const [isMapExpanded, setIsMapExpanded] = useState(false);
   const [notifyOrder, setNotifyOrder] = useState<Order | null>(null);
  
  // Reset map expansion when closing order view
  useEffect(() => {
     if (!viewingOrder) setIsMapExpanded(false);
  }, [viewingOrder]);
  
  // Smart Kitchen Logic: Active Filtering
  const floorOrders = useMemo(() => {
    return orders.filter(o => {
      const orderFloor = getFloorFromLocation(o.location);
      return orderFloor === parseInt(kitchenFloor);
    });
  }, [orders, kitchenFloor]);
  
  const pendingOrders = floorOrders.filter(o => ['pending', 'preparing'].includes(o.status));
  
  // Rush Mode: Auto-detect high volume
  const isRushMode = pendingOrders.length > 4;

  // Assistance Requests
  const assistanceRequests = useMemo(() => {
     return orders.filter(o => o.type === 'assistance' && o.status !== 'completed' && o.status !== 'cancelled' && getFloorFromLocation(o.location) === parseInt(kitchenFloor));
  }, [orders, kitchenFloor]);

  const pendingCounts = useMemo(() => {
     const counts: Record<string, number> = {};
     pendingOrders.forEach(o => {
        if (o.type === 'assistance') return;
        o.items.forEach(i => {
           counts[i.product.category] = (counts[i.product.category] || 0) + i.quantity;
        });
     });
     return counts;
  }, [pendingOrders]);

  const handleNotify = (message: string) => {
     if (!notifyOrder) return;
     toast.success(`Message sent to ${notifyOrder.userName}: "${message}"`);
     setNotifyOrder(null);
  };

  const cannedMessages = [
     "Order is ready!",
     "Running 5 mins late, sorry!",
     "We are out of Oat Milk, please come to counter.",
     "Please pick up at the main counter."
  ];

  const columns = [
    { id: 'pending', label: 'New Orders', color: 'bg-amber-500', bg: 'bg-slate-50', icon: Bell },
    { id: 'preparing', label: 'In Progress', color: 'bg-blue-500', bg: 'bg-slate-50', icon: ChefHat },
    { id: 'ready', label: 'Ready for Pickup', color: 'bg-green-500', bg: 'bg-green-50/30', icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] -m-4 p-2 font-sans selection:bg-indigo-100">
       {/* Background Decoration */}
       <div className="fixed inset-0 pointer-events-none opacity-[0.015]" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
       />

      {/* Modals */}
      <Dialog open={!!viewingOrder} onOpenChange={(o) => !o && setViewingOrder(null)}>
         <DialogContent className="max-w-[98vw] w-full p-0 gap-0 bg-slate-50/95 backdrop-blur-sm shadow-2xl rounded-xl flex flex-col overflow-hidden outline-none h-[92vh] border border-white/20">
             <div className="sr-only">
               <DialogTitle>Order #{viewingOrder?.id}</DialogTitle>
               <DialogDescription>Full order details and location context.</DialogDescription>
            </div>
            
            {viewingOrder && (
               <div className="flex flex-col h-full">
                  {/* Light Header Bar */}
                  <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-20">
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                           <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                              Order #{viewingOrder.id.slice(-4)}
                           </h2>
                           <Badge variant="secondary" className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border",
                              viewingOrder.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                              viewingOrder.status === 'preparing' ? "bg-blue-50 text-blue-600 border-blue-100" :
                              viewingOrder.status === 'ready' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                           )}>
                              {viewingOrder.status}
                           </Badge>
                        </div>
                        <div className="h-3 w-px bg-slate-200" />
                        <span className="text-xs text-slate-500 font-medium">{format(viewingOrder.timestamp, 'h:mm a')} • {format(viewingOrder.timestamp, 'MMM d')}</span>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 rounded-full transition-colors" onClick={() => window.print()}>
                           <Printer size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 rounded-full transition-colors" onClick={() => setViewingOrder(null)}>
                           <X size={16} />
                        </Button>
                     </div>
                  </div>

                  {/* Clean Context Bar */}
                  <div className="bg-white/40 border-b border-slate-200 px-6 py-3 flex items-start gap-12 shrink-0 relative z-10">
                     {/* Customer Info */}
                     <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-9 h-9 rounded-full bg-slate-50 p-0.5 ring-1 ring-slate-100">
                           <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingOrder.userName}`} 
                              className="w-full h-full rounded-full bg-white" 
                              alt={viewingOrder.userName}
                           />
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-slate-800 leading-tight">{viewingOrder.userName}</div>
                           <button className="text-[10px] font-medium text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-1">
                              Message Customer
                           </button>
                        </div>
                     </div>

                     {/* Location Info - Expandable */}
                     <div className="flex items-center gap-3 flex-1">
                         <div className={cn(
                           "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                           isMapExpanded ? "bg-indigo-50 text-indigo-600" : "bg-white border border-slate-100 text-slate-400"
                         )}>
                           <MapPin size={16} className={cn(isMapExpanded && "fill-current")} />
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-slate-800 flex items-center gap-2 leading-tight">
                              {viewingOrder.location}
                              <button 
                                 onClick={() => setIsMapExpanded(!isMapExpanded)}
                                 className="text-[9px] uppercase font-bold tracking-wider text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/50"
                              >
                                 {isMapExpanded ? "Close Map" : "View Map"}
                              </button>
                           </div>
                           <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                              <span>Floor {getFloorFromLocation(viewingOrder.location)}</span>
                              <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                              <span>Zone B</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Expanded Map View */}
                  <AnimatePresence>
                     {isMapExpanded && (
                        <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 280, opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="bg-slate-50 border-b border-slate-200 shrink-0 relative overflow-hidden"
                        >
                           <div className="absolute inset-0 opacity-[0.03]" 
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1h2v2H1V1zm4 0h2v2H5V1zm4 0h2v2H9V1z' fill='%23000000' fill-rule='evenodd'/%3E%3C/svg%3E")` }} 
                           />
                           
                           <div className="absolute inset-0 flex items-center justify-center">
                              {/* Simple Map Representation */}
                              <div className="w-3/4 h-3/4 border border-slate-200 bg-white rounded-lg shadow-sm relative overflow-hidden">
                                 <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Floor Plan • Level {getFloorFromLocation(viewingOrder.location)}</div>
                                 <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100" />
                                 <div className="absolute left-1/3 top-0 bottom-0 w-px bg-slate-100" />
                                 <div className="absolute right-1/3 top-0 bottom-0 w-px bg-slate-100" />
                                 
                                 {/* Pin */}
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="relative">
                                       <span className="absolute -inset-3 rounded-full bg-indigo-500/10 animate-ping"></span>
                                       <div className="w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md z-10" />
                                    </div>
                                    <div className="bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-medium shadow-lg mt-2 transform translate-y-1">
                                       {viewingOrder.location}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>

                  {/* Main Content Area */}
                  <div className="flex-1 overflow-y-auto bg-slate-50/30">
                     <div className="max-w-full mx-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Order Items
                           </h3>
                           <Badge variant="outline" className="text-slate-500 border-slate-200 font-normal text-[10px] h-5">
                              {viewingOrder.items.length} Items
                           </Badge>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                           {viewingOrder.items.map((item, i) => (
                              <div key={i} className="flex gap-6 p-4 rounded-lg border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300/60 transition-all items-start">
                                 {/* Image */}
                                 <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                    <img src={item.product.image} className="w-full h-full object-cover" />
                                 </div>
                                 
                                 {/* Content Container - Full Width Row */}
                                 <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-start gap-6">
                                    
                                    {/* Product Details */}
                                    <div className="flex-1 min-w-[200px]">
                                       <div className="flex items-center gap-3 mb-1">
                                          <h4 className="text-base font-bold text-slate-800">{item.product.name}</h4>
                                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium border-none px-2 h-5 text-[10px]">
                                             {item.product.category}
                                          </Badge>
                                       </div>
                                       
                                       <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
                                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                             Object.entries(item.selectedOptions).map(([k,v]) => (
                                                <div key={k} className="flex flex-col">
                                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{k}</span>
                                                   <span className="text-sm font-medium text-slate-700">{v}</span>
                                                </div>
                                             ))
                                          )}
                                          
                                          {item.notes && (
                                              <div className="flex flex-col w-full mt-1">
                                                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Note</span>
                                                <div className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-1.5 rounded border border-rose-100/50 inline-block self-start italic">
                                                   "{item.notes}"
                                                </div>
                                              </div>
                                          )}
                                       </div>
                                    </div>

                                    {/* Right Side: Price & Quantity */}
                                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:gap-1 min-w-[100px] md:text-right border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 shrink-0 h-full">
                                       <div className="flex flex-col items-end">
                                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total</span>
                                          <span className="text-lg font-bold text-slate-800">${(item.totalPrice * item.quantity).toFixed(2)}</span>
                                       </div>
                                       
                                       <div className="flex items-center gap-2 mt-2 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                          <span className="text-[10px] font-bold text-slate-500 uppercase">Qty</span>
                                          <span className="text-sm font-bold text-slate-900">{item.quantity}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Clean Footer */}
                  <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between z-20">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                        <span className="text-xl font-bold text-slate-800 leading-none mt-0.5">${viewingOrder.items.reduce((acc, i) => acc + (i.totalPrice * i.quantity), 0).toFixed(2)}</span>
                     </div>
                     
                     <div className="flex gap-3">
                        <Button variant="outline" className="h-9 px-6 text-xs border-slate-200 font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setViewingOrder(null)}>
                           Close
                        </Button>
                        <Button className="h-9 px-6 text-xs bg-slate-900 text-white hover:bg-slate-800 font-semibold shadow-md shadow-slate-200/50">
                           <CheckCircle2 size={14} className="mr-2" /> Mark Ready
                        </Button>
                     </div>
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>

      <Dialog open={!!viewingItem} onOpenChange={(o) => !o && setViewingItem(null)}>
         <DialogContent className="max-w-lg border-none shadow-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
               <DialogTitle className="text-xl font-black tracking-tight text-slate-900">Recipe Card</DialogTitle>
               <DialogDescription className="text-slate-500 font-medium">Standard Operating Procedure</DialogDescription>
            </DialogHeader>
            {viewingItem && (
               <div className="space-y-6 py-4">
                  <div className="flex items-start gap-5">
                     <div className="relative">
                        <img src={viewingItem.product.image} className="w-24 h-24 rounded-2xl object-cover shadow-lg ring-1 ring-black/5" />
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                           <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-900 border-none px-2.5 py-0.5 text-xs font-bold">
                              {viewingItem.product.category}
                           </Badge>
                        </div>
                     </div>
                     <div className="space-y-1 py-1">
                        <h3 className="font-black text-3xl text-slate-900 tracking-tight leading-none">{viewingItem.product.name}</h3>
                        <p className="text-slate-400 font-medium text-sm">Base Product ID: {viewingItem.product.id.slice(0,6)}</p>
                     </div>
                  </div>
                  
                  <div className="grid gap-4">
                     <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Utensils size={12} /> Formulation
                        </h4>
                        <ul className="space-y-3">
                           <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">1</div> 
                              2 shots Espresso (Standard)
                           </li>
                           <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">2</div>
                              Steamed Milk to 140°F
                           </li>
                           <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">3</div>
                              1 pump Vanilla Syrup (Base)
                           </li>
                        </ul>
                     </div>

                     {viewingItem.selectedOptions && Object.keys(viewingItem.selectedOptions).length > 0 && (
                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
                           <h4 className="font-bold text-xs text-amber-600/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Star size={12} /> Modifiers
                           </h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(viewingItem.selectedOptions).map(([k,v]) => (
                                 <div key={k} className="bg-white border border-amber-100 text-amber-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                                    <span className="text-[10px] uppercase text-amber-500/80 font-bold">{k}:</span>
                                    {v}
                                 </div>
                              ))}
                            </div>
                        </div>
                     )}
                     
                     {viewingItem.notes && (
                        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex gap-4 items-center">
                           <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <AlertCircle size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-xs text-red-900 uppercase tracking-widest mb-0.5">Special Request</h4>
                              <p className="text-red-700 font-bold text-base leading-tight">"{viewingItem.notes}"</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}
            <DialogFooter>
               <Button size="lg" className="w-full sm:w-auto rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800" onClick={() => setViewingItem(null)}>Close Card</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={!!notifyOrder} onOpenChange={(o) => !o && setNotifyOrder(null)}>
         <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
               <DialogTitle className="text-xl font-black">Notify Customer</DialogTitle>
               <DialogDescription>Send a status update to {notifyOrder?.userName}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
               {cannedMessages.map((msg, i) => (
                  <Button key={i} variant="outline" className="justify-start text-left h-16 text-base px-5 rounded-2xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700 group" onClick={() => handleNotify(msg)}>
                     <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mr-4 group-hover:bg-teal-100 transition-colors">
                        <MessageSquare size={20} />
                     </div>
                     {msg}
                  </Button>
               ))}
            </div>
         </DialogContent>
      </Dialog>

      <Dialog open={isStockOpen} onOpenChange={setIsStockOpen}>
         <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border-none shadow-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
               <DialogTitle className="text-xl font-black">Quick Inventory</DialogTitle>
               <DialogDescription>Report waste or restock items quickly.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 -mr-4 pr-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                  {products.map(p => (
                     <div 
                        key={p.id} 
                        className={cn(
                           "flex flex-col gap-3 p-4 rounded-2xl border transition-all",
                           p.available ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-60 grayscale"
                        )}
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className={cn("w-3 h-3 rounded-full ring-4", p.available ? "bg-emerald-500 ring-emerald-100" : "bg-rose-500 ring-rose-100")} />
                              <span className={cn("font-bold text-sm text-slate-700", !p.available && "line-through text-slate-400")}>{p.name}</span>
                           </div>
                           <Switch checked={p.available} onCheckedChange={() => onToggleAvailability(p.id)} />
                        </div>
                        
                        <Separator className="bg-slate-100" />
                        
                        <StockControl 
                           product={p} 
                           onUpdateStock={onUpdateStock} 
                           variant="barista" 
                        />
                     </div>
                  ))}
               </div>
            </ScrollArea>
         </DialogContent>
      </Dialog>

      {/* Modern HUD Header */}
      <header className="mb-3 sticky top-0 z-50">
         <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-xl p-2 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Left Zone: Identity & Mode */}
            <div className="flex items-center gap-3 px-1">
               <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shadow-inner transition-all duration-500", 
                  isRushMode ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
               )}>
                  {isRushMode ? <Zap size={16} fill="currentColor" /> : <ChefHat size={16} />}
               </div>
               
               <div className="flex items-baseline gap-2">
                  <h1 className="font-black text-slate-900 leading-none tracking-tight text-base">Kitchen OS</h1>
                  <div className="flex items-center gap-2">
                     {isRushMode ? (
                        <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                           <AlertTriangle size={8} strokeWidth={3} /> Rush
                        </span>
                     ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                        </span>
                     )}
                  </div>
               </div>
            </div>

            {/* Middle Zone: Floor Selector & Quick Stats */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
               {/* Location Pill */}
               <div className="flex items-center bg-slate-100/50 rounded-lg p-0.5 pl-3 border border-slate-200/50 h-8">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Zone</span>
                  <Select value={kitchenFloor} onValueChange={setKitchenFloor}>
                     <SelectTrigger className="border-none bg-white shadow-sm h-7 rounded-md px-3 min-w-[120px] focus:ring-0 font-bold text-slate-800 hover:text-indigo-600 transition-colors text-xs">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="1">L1 • Lobby</SelectItem>
                        <SelectItem value="4">L4 �� Main Cafe</SelectItem>
                        <SelectItem value="12">L12 • Sky Bar</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               {/* Metric Pills */}
               <div className="hidden lg:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-0.5 bg-slate-50 rounded-lg border border-slate-100 h-8">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Queue</span>
                     <span className="text-base font-black text-slate-900 leading-none">{pendingOrders.length}</span>
                  </div>
               </div>
            </div>

            {/* Right Zone: Tools */}
            <div className="flex items-center gap-1 pl-3 border-l border-slate-100">
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsStockOpen(true)}>
                  <Power size={16} />
               </Button>
               <Avatar className="h-8 w-8 border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>K</AvatarFallback>
               </Avatar>
            </div>
         </div>
      </header>

      {/* Main KDS Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        {/* Assistance Lane (If any) */}
        {assistanceRequests.length > 0 && (
           <div className="mb-4 mx-0 min-w-[1024px]">
              <div className="flex items-center gap-2 mb-2 px-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 <h2 className="font-black text-indigo-900 text-xs uppercase tracking-widest">Assistance Requests</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                 {assistanceRequests.map(req => (
                    <motion.div
                       key={req.id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="bg-indigo-600 rounded-lg p-3 shadow-md shadow-indigo-200/50 text-white relative overflow-hidden group border border-indigo-500"
                    >
                       <div className="absolute top-0 right-0 p-2 opacity-10">
                          <Users size={48} />
                       </div>
                       <div className="relative z-10 flex justify-between items-start mb-2">
                          <div>
                             <h3 className="font-bold text-sm leading-tight">{req.location}</h3>
                             <p className="text-indigo-200 text-[10px] font-medium">by {req.userName}</p>
                          </div>
                          <span className="bg-white/20 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold">{format(req.timestamp, 'HH:mm')}</span>
                       </div>
                       
                       <p className="relative z-10 text-xs font-medium mb-3 bg-black/10 p-1.5 rounded border border-white/5 truncate">
                          "{req.message || "Needs assistance in the room."}"
                       </p>

                       <div className="relative z-10 flex gap-1.5">
                          <Button 
                             size="sm" 
                             className="flex-1 h-7 bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none text-xs"
                             onClick={() => handleNotify(`Staff is on the way to ${req.location}!`)}
                          >
                             Ack
                          </Button>
                          <Button 
                             size="sm" 
                             variant="outline"
                             className="h-7 w-7 p-0 bg-transparent border-white/30 text-white hover:bg-white/10"
                             onClick={() => onUpdateStatus(req.id, 'completed')}
                          >
                             <Check size={14} />
                          </Button>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        )}

        <div className="grid grid-cols-3 h-full min-w-[1024px] gap-3">
          {columns.map(col => {
             const colOrders = floorOrders.filter(o => o.status === col.id);
             const Icon = col.icon;
             
             return (
               <div key={col.id} className="flex flex-col h-full min-h-0">
                  {/* Transparent Column Header */}
                  <div className="mb-2 px-1 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", col.color.replace('bg-', 'bg-').replace('500', '400'))} />
                        <h2 className="font-black text-slate-400 text-xs uppercase tracking-widest">{col.label}</h2>
                     </div>
                     <Badge className="bg-white text-slate-900 shadow-sm border border-slate-100 font-mono font-bold rounded px-1.5 py-0 text-xs h-5">
                        {colOrders.length}
                     </Badge>
                  </div>
                  
                  {/* Lane Container */}
                  <div className="flex-1 overflow-y-auto pr-1 pb-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {colOrders.map(order => {
                          const minutesElapsed = Math.floor((new Date().getTime() - order.timestamp.getTime()) / 60000);
                          const isUrgent = col.id !== 'ready' && minutesElapsed > 5;
                          const hasAllergens = order.items.some(i => i.product.allergens && i.product.allergens.length > 0);

                          return (
                          <motion.div 
                             key={order.id} 
                             layoutId={order.id}
                             initial={{ opacity: 0, scale: 0.95, y: 10 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             transition={{ type: "spring", stiffness: 300, damping: 30 }}
                             onClick={() => setViewingOrder(order)}
                             className={cn(
                                "bg-white rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 hover:ring-1 hover:ring-indigo-300 transition-all duration-200 relative overflow-hidden group border cursor-pointer select-none",
                                isUrgent ? "border-rose-200 shadow-rose-50" : "border-slate-200/60"
                             )}
                          >
                             {/* Urgent Indicator Glow */}
                             {isUrgent && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl -mr-8 -mt-8 pointer-events-none" />}

                             <div className="p-3 flex flex-col gap-3">
                                {/* Ticket Header - Enhanced Identity */}
                                <div className="flex justify-between items-start gap-3">
                                   <div className="flex-1 min-w-0">
                                      <div className="flex items-start gap-3">
                                         <Avatar className="h-10 w-10 ring-2 ring-slate-50 shadow-sm shrink-0 mt-0.5">
                                            <AvatarFallback className="text-xs bg-indigo-50 text-indigo-700 font-black">
                                               {order.userName.substring(0,2).toUpperCase()}
                                            </AvatarFallback>
                                         </Avatar>
                                         <div className="flex flex-col min-w-0 gap-1.5">
                                            <div>
                                                <h4 className="font-black text-base text-slate-900 tracking-tight leading-none truncate">{order.userName}</h4>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                   <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-50 px-1 rounded">#{order.id.slice(-4)}</span>
                                                   {hasAllergens && (
                                                      <span className="text-[9px] font-bold uppercase text-rose-600 bg-rose-50 px-1 rounded flex items-center gap-0.5">
                                                          <AlertCircle size={8} strokeWidth={3} /> Allergy
                                                      </span>
                                                   )}
                                                </div>
                                            </div>

                                            {/* High-Visibility Location Badge */}
                                            <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1 rounded-md shadow-sm w-fit group-hover:bg-indigo-600 transition-colors">
                                               <MapPin size={10} strokeWidth={3} className="text-indigo-300 group-hover:text-white/80 shrink-0" /> 
                                               <span className="text-[10px] font-black uppercase tracking-wider truncate">{order.location}</span>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                   
                                   {/* Timer Dial */}
                                   <div className={cn(
                                      "relative w-10 h-10 rounded-xl flex flex-col items-center justify-center border shadow-sm shrink-0 transition-colors",
                                      isUrgent ? "bg-rose-50 border-rose-100 text-rose-600 shadow-rose-100" : "bg-white border-slate-100 text-slate-900 group-hover:border-indigo-100 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                   )}>
                                      <span className="text-sm font-black leading-none tracking-tight">{Math.max(0, minutesElapsed)}</span>
                                      <span className="text-[8px] font-bold uppercase opacity-50 text-[0.5rem] leading-none mt-0.5">Min</span>
                                   </div>
                                </div>

                                <Separator className="bg-slate-50" />

                                {/* Items List */}
                                <div className="space-y-2">
                                   {order.items.map((item, i) => (
                                      <div 
                                         key={i} 
                                         // Item click is now redundant if card click opens details, but keeping for specificity if needed
                                         // Or we can stop propagation if we want specific item details
                                         onClick={(e) => { e.stopPropagation(); setViewingItem(item); }}
                                         className="flex items-start gap-2 p-1.5 -ml-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group/item"
                                      >
                                         {/* Smart Qty Badge */}
                                         <div className="w-5 h-5 shrink-0 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm mt-0.5 group-hover/item:bg-indigo-600 transition-colors">
                                            {item.quantity}
                                         </div>
                                         
                                         <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm text-slate-800 leading-tight group-hover/item:text-indigo-900 transition-colors">{item.product.name}</div>
                                            
                                            {/* Modifiers Chips */}
                                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                               <div className="flex flex-wrap gap-0.5 mt-1">
                                                  {Object.entries(item.selectedOptions).map(([k,v]) => (
                                                     <span key={k} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0 rounded border border-slate-200 group-hover/item:border-indigo-100 group-hover/item:bg-indigo-50/50">
                                                        {v}
                                                     </span>
                                                  ))}
                                               </div>
                                            )}
                                            
                                            {/* Notes Alert */}
                                            {item.notes && (
                                               <div className="mt-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 flex items-start gap-1">
                                                  <span className="uppercase text-[8px] tracking-wider opacity-70 mt-0.5">Note:</span>
                                                  {item.notes}
                                               </div>
                                            )}
                                         </div>
                                      </div>
                                   ))}
                                </div>

                                {/* Smart Actions Footer */}
                                <div className="pt-1 mt-auto grid grid-cols-4 gap-1.5" onClick={(e) => e.stopPropagation()}>
                                   {col.id === 'pending' && (
                                      <>
                                         <Button variant="ghost" size="sm" className="h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 p-0" onClick={() => { if (confirm("Reject?")) onUpdateStatus(order.id, 'cancelled'); }}>
                                            <X size={16} />
                                         </Button>
                                         <Button variant="ghost" size="sm" className="h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100 p-0" onClick={() => setNotifyOrder(order)}>
                                            <MessageSquare size={16} />
                                         </Button>
                                         <Button size="sm" className="col-span-2 h-8 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-sm transition-all" onClick={() => onUpdateStatus(order.id, 'preparing')}>
                                           Prep
                                         </Button>
                                      </>
                                   )}
                                   {col.id === 'preparing' && (
                                      <>
                                         <Button variant="ghost" size="sm" className="h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100 p-0" onClick={() => setNotifyOrder(order)}>
                                            <MessageSquare size={16} />
                                         </Button>
                                         <Button size="sm" className="col-span-3 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-200 hover:shadow-emerald-300 transition-all" onClick={() => onUpdateStatus(order.id, 'ready')}>
                                           Done
                                         </Button>
                                      </>
                                   )}
                                   {col.id === 'ready' && (
                                      <div className="col-span-4 h-8 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-xs">
                                         <CheckCircle2 size={14} className="fill-emerald-100" /> Ready
                                      </div>
                                   )}
                                </div>
                             </div>
                          </motion.div>
                        );
                        })}
                        
                        {/* Empty State */}
                        {colOrders.length === 0 && (
                           <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200/60 rounded-xl bg-slate-50/30">
                              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                                 <Icon size={24} className="text-slate-300" />
                              </div>
                              <p className="font-bold text-slate-400">No tickets in {col.label}</p>
                           </div>
                        )}
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

const DeliveryDashboard: React.FC<{
  orders: Order[],
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}> = ({ orders, onUpdateStatus }) => {
   const readyForDelivery = orders.filter(o => o.status === 'ready' || o.status === 'delivering');

   return (
     <div className="flex flex-col h-full gap-6 bg-[#F8FAFC] -m-4 sm:-m-6 md:-m-8 p-4 sm:p-6 md:p-8 font-sans">
       <div className="flex items-center justify-between flex-shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
               <Truck size={24} />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Smart Delivery</h1>
               <p className="text-sm font-medium text-slate-500 mt-1">Autonomous Logistics & Runner Management</p>
            </div>
         </div>
         <Badge variant="outline" className="text-sm px-3 py-1 h-9 rounded-full border-slate-200 bg-white shadow-sm font-bold text-slate-600">
            {readyForDelivery.length} Active Jobs
         </Badge>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 gap-6 min-h-0">
       {/* Sidebar List */}
       <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="p-5 border-b border-slate-50 bg-white flex justify-between items-center z-10 sticky top-0">
             <h2 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <List size={16} className="text-teal-500" /> Dispatch Queue
             </h2>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
             <div className="p-3 space-y-3">
                {readyForDelivery.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Package size={24} className="opacity-50" />
                      </div>
                      <span className="font-bold text-sm">No active deliveries</span>
                   </div>
                ) : (
                   readyForDelivery.map(order => (
                      <motion.div 
                        layoutId={`delivery-${order.id}`}
                        key={order.id} 
                        className={cn(
                         "p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                         order.status === 'delivering' 
                           ? "bg-teal-50 border-teal-100 shadow-md shadow-teal-100/50" 
                           : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                      )}>
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                               <Avatar className="h-6 w-6 ring-2 ring-white shadow-sm">
                                  <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700 font-bold">{order.userName.substring(0,2)}</AvatarFallback>
                               </Avatar>
                               <div>
                                  <div className="font-bold text-xs text-slate-900 leading-tight">{order.userName}</div>
                                  <span className="text-[9px] font-mono font-bold text-slate-400">#{order.id.slice(-4)}</span>
                               </div>
                            </div>
                            {order.status === 'delivering' && (
                               <Badge className="bg-teal-500 hover:bg-teal-600 border-none text-[9px] font-bold px-1.5 py-0 animate-pulse">
                                  EN ROUTE
                               </Badge>
                            )}
                         </div>

                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 mb-2 bg-slate-100/50 p-1.5 rounded border border-slate-200/50">
                            <MapPin size={12} className="text-teal-600 shrink-0" />
                            <span className="truncate">{order.location}</span>
                         </div>

                         <div className="text-[10px] font-medium text-slate-500 mb-3 pl-1 line-clamp-2 leading-relaxed">
                            {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                         </div>

                         <div className="grid grid-cols-2 gap-1.5">
                            {order.status === 'ready' ? (
                               <Button size="sm" className="col-span-2 h-8 rounded-lg bg-slate-900 hover:bg-teal-600 text-white font-bold text-xs shadow-sm transition-all" onClick={() => onUpdateStatus(order.id, 'delivering')}>
                                  <Truck size={12} className="mr-1.5" /> Start Delivery
                               </Button>
                            ) : (
                               <Button size="sm" className="col-span-2 h-8 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-sm shadow-teal-200 transition-all" onClick={() => onUpdateStatus(order.id, 'completed')}>
                                  <CheckCircle2 size={12} className="mr-1.5" /> Complete Drop-off
                               </Button>
                            )}
                         </div>
                      </motion.div>
                   ))
                )}
             </div>
          </div>
       </div>

       {/* Map View */}
       <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 relative overflow-hidden flex flex-col shadow-lg shadow-slate-200/50">
          <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-md">
             <h3 className="text-xs font-black flex items-center gap-1.5 text-slate-800 uppercase tracking-wide">
                <MapPin size={14} className="text-teal-500" /> Logistics Map • L4
             </h3>
          </div>

          <div className="flex-1 relative flex items-center justify-center bg-slate-50 overflow-hidden group">
             {/* Dynamic Grid Background */}
             <div className="absolute inset-0 opacity-[0.03]" 
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }} 
             />
             
             {/* Building Footprint */}
             <div className="w-[85%] h-[75%] border-[3px] border-slate-300/50 bg-white rounded-[2rem] relative shadow-2xl overflow-hidden transform group-hover:scale-[1.01] transition-transform duration-700">
                {/* Architectural Lines */}
                <div className="absolute top-0 left-1/3 w-px h-full bg-slate-100"></div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100"></div>
                <div className="absolute right-0 top-1/4 w-1/4 h-px bg-slate-100"></div>
                
                {/* Zone Labels */}
                <div className="absolute top-8 left-8 text-xs font-black text-slate-200 uppercase tracking-[0.2em]">North Wing</div>
                <div className="absolute bottom-8 right-8 text-xs font-black text-slate-200 uppercase tracking-[0.2em]">South Wing</div>
                
                {/* Floor Label */}
                <div className="absolute bottom-6 left-8">
                   <h1 className="text-8xl font-black text-slate-100 tracking-tighter leading-none select-none">04</h1>
                </div>

                {/* Animated Order Pins */}
                {readyForDelivery.map((order, i) => (
                   <motion.div
                      layoutId={`pin-${order.id}`}
                      key={order.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className={cn(
                         "absolute flex flex-col items-center cursor-pointer group/pin",
                         order.status === 'delivering' ? "z-30" : "z-20"
                      )}
                      style={{
                         top: `${30 + (i * 15) % 50}%`,
                         left: `${25 + (i * 20) % 55}%`
                      }}
                   >
                      <div className="relative">
                         {order.status === 'delivering' && (
                            <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-20 scale-150"></div>
                         )}
                         <div className={cn(
                            "h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg border-[3px] border-white transition-all duration-300 group-hover/pin:-translate-y-2",
                            order.status === 'delivering' 
                              ? "bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-teal-200" 
                              : "bg-white text-slate-700 shadow-slate-200"
                         )}>
                            {order.status === 'delivering' ? <Truck size={16} /> : <Package size={16} />}
                         </div>
                         
                         {/* Pin Tooltip */}
                         <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 opacity-0 group-hover/pin:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-xl pointer-events-none">
                            {order.userName} • {order.location}
                         </div>
                      </div>
                   </motion.div>
                ))}
             </div>
          </div>
       </div>
     </div>
   </div>
   );
};

const AdminAnalyticsView: React.FC<{
   orders: Order[],
   products: Product[],
   equipment: Equipment[],
   robots: Robot[],
   onToggleAvailability: (id: string) => void,
   onSaveProduct: (product: Product) => void,
   onUpdateEquipment: (eq: Equipment) => void,
   onUpdateRobot: (bot: Robot) => void,
   stockLogs: StockLog[],
   onAddStockLog: (log: StockLog) => void,
   // Smart Props
   smartRules: { happyHour: boolean, autoStock: boolean, breakfastMode: boolean },
   setSmartRules: React.Dispatch<React.SetStateAction<{ happyHour: boolean, autoStock: boolean, breakfastMode: boolean }>>,
   happyHourConfig: any,
   setHappyHourConfig: any,
   showHappyHourConfig: boolean,
   setShowHappyHourConfig: React.Dispatch<React.SetStateAction<boolean>>,
   breakfastConfig: any,
   setBreakfastConfig: any,
   showBreakfastConfig: boolean,
   setShowBreakfastConfig: React.Dispatch<React.SetStateAction<boolean>>,
   restockConfig: any,
   setRestockConfig: any,
   showRestockConfig: boolean,
   setShowRestockConfig: React.Dispatch<React.SetStateAction<boolean>>,
   restockQueue: any[],
   setRestockQueue: any,
   breakfastPrep: any[],
   setBreakfastPrep: any
 }> = ({ 
    orders, products, equipment, robots, stockLogs,
    onToggleAvailability, onSaveProduct, onUpdateEquipment, onUpdateRobot, onAddStockLog,
    smartRules, setSmartRules, happyHourConfig, setHappyHourConfig, showHappyHourConfig, setShowHappyHourConfig,
    breakfastConfig, setBreakfastConfig, showBreakfastConfig, setShowBreakfastConfig, 
    restockConfig, setRestockConfig, showRestockConfig, setShowRestockConfig,
    restockQueue, setRestockQueue, breakfastPrep, setBreakfastPrep
 }) => {
   const [activeTab, setActiveTab] = useState("overview");
   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
   const [viewingHistoryProduct, setViewingHistoryProduct] = useState<Product | null>(null);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   
   // Menu Management State
   const [menuSearch, setMenuSearch] = useState("");
   const [menuCategoryFilter, setMenuCategoryFilter] = useState("all");

   // Data & Logs State
   const [orderSearch, setOrderSearch] = useState("");
   const [orderStatusFilter, setOrderStatusFilter] = useState("all");
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // New: for detail view
   const [logSearch, setLogSearch] = useState("");
   
   
   // Facility Settings State
   const [workingHours, setWorkingHours] = useState({ start: "07:00", end: "20:00" });
   const [kitchenStatus, setKitchenStatus] = useState<Record<string, boolean>>({
      "1": true,
      "4": true,
      "12": true,
      "40": false
   });

   const handleEdit = (p: Product) => {
      setEditingProduct(p);
      setIsDialogOpen(true);
   };

   const handleCreate = () => {
      setEditingProduct(null);
      setIsDialogOpen(true);
   };
   
   const handleAddEquipment = () => {
      const newEq: Equipment = {
         id: `eq-${Date.now()}`,
         name: 'New Machine',
         type: 'Generic',
         status: 'operational',
         location: 'Storage',
         lastService: 'Just now'
      };
      onUpdateEquipment(newEq);
      toast.success("New equipment added to inventory");
   };

   const handleAddRobot = () => {
      const newBot: Robot = {
         id: `bot-${Date.now()}`,
         name: `Unit-${Math.floor(Math.random() * 1000)}`,
         status: 'idle',
         battery: 100,
         location: 'Dock'
      };
      onUpdateRobot(newBot);
      toast.success("New robot unit activated");
   };

   const cycleEquipmentStatus = (eq: Equipment) => {
      const statuses: Equipment['status'][] = ['operational', 'warning', 'error', 'maintenance'];
      const nextIdx = (statuses.indexOf(eq.status) + 1) % statuses.length;
      onUpdateEquipment({ ...eq, status: statuses[nextIdx] });
   };

   const cycleRobotStatus = (bot: Robot) => {
      const statuses: Robot['status'][] = ['idle', 'delivering', 'returning', 'charging', 'maintenance'];
      const nextIdx = (statuses.indexOf(bot.status) + 1) % statuses.length;
      onUpdateRobot({ ...bot, status: statuses[nextIdx] });
   };
   
   const toggleKitchen = (floorId: string) => {
      setKitchenStatus(prev => ({
         ...prev,
         [floorId]: !prev[floorId]
      }));
      toast.success(`Kitchen on Floor ${floorId} is now ${!kitchenStatus[floorId] ? 'Online' : 'Offline'}`);
   };

   const saveHours = () => {
      toast.success(`Working hours updated: ${workingHours.start} - ${workingHours.end}`);
   };

   const toggleSmartRule = (rule: keyof typeof smartRules) => {
      if (rule === 'happyHour' && !smartRules.happyHour) {
         setShowHappyHourConfig(true);
         return;
      }
      if (rule === 'breakfastMode' && !smartRules.breakfastMode) {
         setShowBreakfastConfig(true); // Open config before activating
         return;
      }

      setSmartRules(prev => {
         const newState = { ...prev, [rule]: !prev[rule] };
         if (rule === 'happyHour') {
            toast(newState.happyHour ? "Happy Hour Activated!" : "Happy Hour Ended.");
         }
         if (rule === 'breakfastMode') {
            toast(newState.breakfastMode ? "Breakfast Mode Active" : "Returning to Standard Menu");
         }
         return newState;
      });
   };

   const activateHappyHour = () => {
      setShowHappyHourConfig(false);
      setSmartRules(prev => ({ ...prev, happyHour: true }));
      toast.success(`Happy Hour Activated! ${happyHourConfig.discount}% OFF from ${happyHourConfig.start} to ${happyHourConfig.end}`);
   };

   const activateBreakfastMode = () => {
      setShowBreakfastConfig(false);
      setSmartRules(prev => ({ ...prev, breakfastMode: true }));
      toast.success("Breakfast Mode Activated: Morning Menu Prioritized");
   };
   
   // Analytics Calculations
   const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
   const activeOrdersCount = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
   
   // Filtered Products for Menu Tab
   const filteredAdminProducts = useMemo(() => {
      return products.filter(p => {
         const matchesSearch = p.name.toLowerCase().includes(menuSearch.toLowerCase());
         const matchesCategory = menuCategoryFilter === 'all' || p.category === menuCategoryFilter;
         return matchesSearch && matchesCategory;
      });
   }, [products, menuSearch, menuCategoryFilter]);

   // Update Stock Handler
   const updateStock = (productId: string, newStock: number, reason: StockLog['reason'] = 'manual_adjustment') => {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const change = newStock - (product.stock || 0);
      
      onSaveProduct({ ...product, stock: Math.max(0, newStock) });
      
      // Log Manual Adjustment
      onAddStockLog({
         id: `log-${Date.now()}`,
         productId: product.id,
         productName: product.name,
         change: change,
         newLevel: Math.max(0, newStock),
         reason: reason,
         timestamp: new Date(),
         userId: 'Admin'
      });
      
      // Check for low stock alert if auto-stock is on
      if (smartRules.autoStock && product.minStock && newStock <= product.minStock) {
         toast.warning(`Low Stock Alert: ${product.name} is below minimum threshold!`);
      }
   };

   // Mock hourly data - typically comes from backend
   const hourlyData = [
     { time: '8AM', orders: 12 },
     { time: '9AM', orders: 45 },
     { time: '10AM', orders: 38 },
     { time: '11AM', orders: 25 },
     { time: '12PM', orders: 60 },
     { time: '1PM', orders: 45 },
     { time: '2PM', orders: 30 },
     { time: '3PM', orders: 20 },
   ];
 
   const categoryData = useMemo(() => {
     const counts: Record<string, number> = {};
     orders.forEach(o => {
       o.items.forEach(i => {
         counts[i.product.category] = (counts[i.product.category] || 0) + i.quantity;
       });
     });
     // Fallback if no orders
     if (Object.keys(counts).length === 0) return [
       { name: 'Coffee', value: 45 },
       { name: 'Tea', value: 15 },
       { name: 'Snacks', value: 30 },
       { name: 'Meals', value: 10 }
     ];
     return Object.entries(counts).map(([name, value]) => ({ name, value }));
   }, [orders]);
 
   const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
 
   return (
     <div className="h-full flex flex-col gap-6 overflow-hidden pr-2">
       <div className="flex items-center justify-between flex-shrink-0">
         <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
           <LayoutDashboard className="text-indigo-600" /> 
           Smart Café Management
         </h1>
         
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-slate-100 p-1">
               <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
               <TabsTrigger value="data" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Orders & Logs</TabsTrigger>
               <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Inventory</TabsTrigger>
               <TabsTrigger value="menu" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Menu Ops</TabsTrigger>
               <TabsTrigger value="facility" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Facility Health</TabsTrigger>

            </TabsList>
         </Tabs>
       </div>

       <ProductEditDialog 
          product={editingProduct} 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
          onSave={onSaveProduct}
       />
       
       <StockHistoryDialog 
          product={viewingHistoryProduct}
          isOpen={!!viewingHistoryProduct}
          onClose={() => setViewingHistoryProduct(null)}
          logs={stockLogs}
       />
       
       {/* Happy Hour Config Dialog */}
       <Dialog open={showHappyHourConfig} onOpenChange={setShowHappyHourConfig}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-500" /> Configure Happy Hour
               </DialogTitle>
               <DialogDescription>Customize timing, products, and discount rules.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
               {/* Time & Days */}
               <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-slate-500">Schedule</Label>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <Label className="text-xs">Start Time</Label>
                        <Input type="time" value={happyHourConfig.start} onChange={(e) => setHappyHourConfig({...happyHourConfig, start: e.target.value})} />
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-xs">End Time</Label>
                        <Input type="time" value={happyHourConfig.end} onChange={(e) => setHappyHourConfig({...happyHourConfig, end: e.target.value})} />
                     </div>
                  </div>
                  <div className="flex gap-1">
                     {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <button
                           key={day}
                           onClick={() => setHappyHourConfig(prev => ({
                              ...prev,
                              days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
                           }))}
                           className={cn(
                              "h-8 w-8 rounded-full text-[10px] font-bold transition-all",
                              happyHourConfig.days.includes(day) ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                           )}
                        >
                           {day.charAt(0)}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Discount Rules */}
               <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-slate-500">Discount Logic</Label>
                  <div className="flex gap-4">
                     <div className="flex-1 space-y-1.5">
                        <Label className="text-xs">Discount %</Label>
                        <div className="relative">
                           <Input type="number" value={happyHourConfig.discount} onChange={(e) => setHappyHourConfig({...happyHourConfig, discount: parseInt(e.target.value)})} className="pr-8" />
                           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                        </div>
                     </div>
                     <div className="flex-[2] space-y-1.5">
                        <Label className="text-xs">Included Categories</Label>
                        <div className="flex flex-wrap gap-2">
                           {['coffee', 'tea', 'cold', 'snack', 'meal'].map(cat => (
                              <Badge 
                                 key={cat}
                                 variant="outline" 
                                 className={cn(
                                    "cursor-pointer capitalize",
                                    happyHourConfig.includedCategories.includes(cat) ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "text-slate-500 border-slate-200 hover:border-slate-300"
                                 )}
                                 onClick={() => setHappyHourConfig(prev => ({
                                    ...prev,
                                    includedCategories: prev.includedCategories.includes(cat) 
                                       ? prev.includedCategories.filter(c => c !== cat) 
                                       : [...prev.includedCategories, cat]
                                 }))}
                              >
                                 {cat}
                              </Badge>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setShowHappyHourConfig(false)}>Cancel</Button>
               <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={activateHappyHour}>Save & Activate</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Breakfast Mode Config Dialog */}
       <Dialog open={showBreakfastConfig} onOpenChange={setShowBreakfastConfig}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" /> Breakfast Mode Setup
               </DialogTitle>
               <DialogDescription>Define morning service parameters and transition tasks.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
               <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-slate-500">Service Window</Label>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <Label className="text-xs">Start Service</Label>
                        <Input type="time" value={breakfastConfig.start} onChange={(e) => setBreakfastConfig({...breakfastConfig, start: e.target.value})} />
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-xs">End Service</Label>
                        <Input type="time" value={breakfastConfig.end} onChange={(e) => setBreakfastConfig({...breakfastConfig, end: e.target.value})} />
                     </div>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <Label className="text-xs font-bold uppercase text-slate-500">Transition Checklist</Label>
                     <Button size="sm" variant="ghost" className="h-6 text-[10px] text-amber-600" onClick={() => {
                        const task = prompt("New Task Name:");
                        if (task) setBreakfastConfig(p => ({...p, checklist: [...p.checklist, task]}));
                     }}>+ Add Task</Button>
                  </div>
                  <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-[150px] overflow-y-auto">
                     {breakfastConfig.checklist.map((task, i) => (
                        <div key={i} className="p-2 flex justify-between items-center group">
                           <span className="text-sm text-slate-700">{task}</span>
                           <button 
                              onClick={() => setBreakfastConfig(p => ({...p, checklist: p.checklist.filter((_, idx) => idx !== i)}))}
                              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <X size={14} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setShowBreakfastConfig(false)}>Cancel</Button>
               <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={activateBreakfastMode}>Launch Morning Service</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Auto-Restock Config Dialog */}
       <Dialog open={showRestockConfig} onOpenChange={setShowRestockConfig}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <Zap size={18} className="text-teal-500" /> Auto-Restock Settings
               </DialogTitle>
               <DialogDescription>Configure supply chain automation rules.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <div className="flex justify-between">
                        <Label className="text-xs font-bold uppercase text-slate-500">Low Stock Threshold</Label>
                        <span className="text-xs font-bold text-teal-600">{restockConfig.threshold} Units</span>
                     </div>
                     <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        value={restockConfig.threshold} 
                        onChange={(e) => setRestockConfig({...restockConfig, threshold: parseInt(e.target.value)})}
                        className="w-full accent-teal-500"
                     />
                     <p className="text-[10px] text-slate-400">Products falling below this level trigger a restock request.</p>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase text-slate-500">Auto-Approval Budget</Label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <Input 
                           type="number" 
                           value={restockConfig.autoApproveLimit} 
                           onChange={(e) => setRestockConfig({...restockConfig, autoApproveLimit: parseInt(e.target.value)})}
                           className="pl-6"
                        />
                     </div>
                     <p className="text-[10px] text-slate-400">Orders under this amount are automatically sent to suppliers.</p>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase text-slate-500">Connected Suppliers</Label>
                     <div className="flex flex-wrap gap-2">
                        {restockConfig.suppliers.map(sup => (
                           <Badge key={sup} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
                              {sup}
                           </Badge>
                        ))}
                        <Badge variant="outline" className="border-dashed border-slate-300 text-slate-400 hover:text-slate-600 cursor-pointer">+ Link Supplier</Badge>
                     </div>
                  </div>
               </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setShowRestockConfig(false)}>Close</Button>
               <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { setShowRestockConfig(false); toast.success("Restock rules updated"); }}>Save Configuration</Button>
            </DialogFooter>
         </DialogContent>
       </Dialog>

       <div className="flex-1 overflow-y-auto -mr-2 pr-2 pb-4">

         {activeTab === 'overview' && (
            <div className="space-y-6">
               {/* Key Metrics */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <Card>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                     <p className="text-xs text-green-600 flex items-center mt-1"><TrendingUp size={12} className="mr-1"/> +8% vs yesterday</p>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium text-slate-500">Active Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{activeOrdersCount}</div>
                     <p className="text-xs text-slate-500 mt-1">Pending or In Progress</p>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium text-slate-500">Avg Prep Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">4m 12s</div>
                     <p className="text-xs text-green-600 mt-1">-15s vs target</p>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium text-slate-500">Stock Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold text-amber-600">{products.filter(p => !p.available).length}</div>
                     <p className="text-xs text-slate-500 mt-1">Items Out of Stock</p>
                  </CardContent>
               </Card>
               </div>
         
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Traffic Chart */}
               <Card className="p-6">
                  <h3 className="font-semibold mb-6 flex items-center gap-2">
                     <BarChart3 size={18} /> Order Volume (Today)
                  </h3>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} fontSize={12} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} />
                        <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="orders" fill="#0d9488" radius={[4, 4, 0, 0]} />
                     </BarChart>
                     </ResponsiveContainer>
                  </div>
               </Card>
         
               {/* Category Chart */}
               <Card className="p-6">
                  <h3 className="font-semibold mb-6 flex items-center gap-2">
                     <PieChart size={18} /> Category Distribution
                  </h3>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={categoryData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {categoryData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Pie>
                        <RechartsTooltip />
                     </PieChart>
                     </ResponsiveContainer>
                  </div>
               </Card>
               </div>
            </div>
         )}

         {activeTab === 'data' && (
            <Tabs defaultValue="insights" className="space-y-4">
               <div className="flex items-center justify-between">
                  <TabsList className="bg-slate-100 h-9 p-1">
                     <TabsTrigger value="insights" className="text-xs h-7">Insights & Trends</TabsTrigger>
                     <TabsTrigger value="orders" className="text-xs h-7">Order History</TabsTrigger>
                     <TabsTrigger value="logs" className="text-xs h-7">System Logs</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="h-8 text-xs gap-2" onClick={() => toast.success("Exporting data...")}>
                        <Download size={14} /> Export CSV
                     </Button>
                  </div>
               </div>

               <TabsContent value="insights" className="space-y-6">
                  {/* Top Level KPIs for Reports */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                        <CardContent className="p-4">
                           <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Conversion Rate</div>
                           <div className="text-2xl font-black text-slate-900">
                              {Math.round((orders.filter(o => o.status === 'completed').length / Math.max(1, orders.length)) * 100)}%
                           </div>
                           <div className="text-[10px] text-slate-400 mt-1">Orders Completed</div>
                        </CardContent>
                     </Card>
                     <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                         <CardContent className="p-4">
                           <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Avg Ticket</div>
                           <div className="text-2xl font-black text-slate-900">
                              ${(orders.reduce((acc, o) => acc + o.total, 0) / Math.max(1, orders.length)).toFixed(2)}
                           </div>
                           <div className="text-[10px] text-slate-400 mt-1">Per Order</div>
                        </CardContent>
                     </Card>
                     <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
                        <CardContent className="p-4">
                           <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Peak Hour</div>
                           <div className="text-2xl font-black text-slate-900">09:00 AM</div>
                           <div className="text-[10px] text-slate-400 mt-1">Highest Volume</div>
                        </CardContent>
                     </Card>
                     <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100">
                        <CardContent className="p-4">
                           <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Cancellations</div>
                           <div className="text-2xl font-black text-slate-900">
                              {orders.filter(o => o.status === 'cancelled').length}
                           </div>
                           <div className="text-[10px] text-slate-400 mt-1">Total Voided</div>
                        </CardContent>
                     </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Top Products Chart */}
                     <Card>
                        <CardHeader>
                           <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <Star size={16} className="text-amber-500" /> Best Sellers
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                 <BarChart 
                                    layout="vertical" 
                                    data={
                                       Object.entries(orders.reduce((acc: Record<string, number>, o) => {
                                          o.items.forEach(i => acc[i.product.name] = (acc[i.product.name] || 0) + i.quantity);
                                          return acc;
                                       }, {}))
                                       .map(([name, value]) => ({ name, value }))
                                       .sort((a,b) => b.value - a.value)
                                       .slice(0, 5)
                                    }
                                    margin={{ left: 40 }}
                                 >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} interval={0} />
                                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                 </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </CardContent>
                     </Card>

                     {/* Waste Analysis */}
                     <Card>
                        <CardHeader>
                           <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <Trash2 size={16} className="text-rose-500" /> Waste & Loss
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                    <Pie
                                       data={
                                          Object.entries(stockLogs.filter(l => l.reason === 'waste').reduce((acc: Record<string, number>, l) => {
                                             acc[l.productName] = (acc[l.productName] || 0) + Math.abs(l.change);
                                             return acc;
                                          }, {}))
                                          .map(([name, value]) => ({ name, value }))
                                       }
                                       cx="50%"
                                       cy="50%"
                                       innerRadius={60}
                                       outerRadius={80}
                                       paddingAngle={5}
                                       dataKey="value"
                                    >
                                       {['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'].map((color, index) => (
                                          <Cell key={`cell-${index}`} fill={color} />
                                       ))}
                                    </Pie>
                                    <RechartsTooltip />
                                 </PieChart>
                              </ResponsiveContainer>
                           </div>
                           <div className="text-center text-xs text-slate-400 mt-2">
                              Recorded Waste by Product
                           </div>
                        </CardContent>
                     </Card>
                  </div>

                  {/* Detailed Product Breakdown Table */}
                  <Card>
                     <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                           <Coffee size={16} className="text-indigo-500" /> Product Performance Report
                        </CardTitle>
                     </CardHeader>
                     <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                           <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b">
                              <tr>
                                 <th className="px-4 py-3">Product Name</th>
                                 <th className="px-4 py-3 text-right">Units Sold</th>
                                 <th className="px-4 py-3 text-right">Orders</th>
                                 <th className="px-4 py-3 text-right">Revenue</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {Object.entries(orders.reduce((acc: Record<string, { qty: number, revenue: number, count: number }>, o) => {
                                 o.items.forEach(i => {
                                    if (!acc[i.product.name]) acc[i.product.name] = { qty: 0, revenue: 0, count: 0 };
                                    acc[i.product.name].qty += i.quantity;
                                    acc[i.product.name].revenue += i.totalPrice;
                                    acc[i.product.name].count += 1;
                                 });
                                 return acc;
                              }, {}))
                              .sort((a,b) => b[1].revenue - a[1].revenue)
                              .map(([name, stats]) => (
                                 <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900">{name}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-600">{stats.qty}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-600">{stats.count}</td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600">${stats.revenue.toFixed(2)}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </Card>
               </TabsContent>

               <TabsContent value="orders" className="space-y-4">
                  <Card>
                     <CardHeader className="py-3 px-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                           <Search size={14} className="text-slate-400" />
                           <Input 
                              placeholder="Search ID, Customer, or Product..." 
                              className="h-8 w-full sm:w-64 text-xs bg-white"
                              value={orderSearch}
                              onChange={(e) => setOrderSearch(e.target.value)}
                           />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                           <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                              <SelectTrigger className="h-8 w-[140px] text-xs bg-white">
                                 <SelectValue placeholder="Filter Status" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">All Statuses</SelectItem>
                                 <SelectItem value="completed">Completed</SelectItem>
                                 <SelectItem value="cancelled">Cancelled</SelectItem>
                                 <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </CardHeader>
                     <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                           <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b">
                              <tr>
                                 <th className="px-4 py-3">Order ID</th>
                                 <th className="px-4 py-3">Time</th>
                                 <th className="px-4 py-3">Customer</th>
                                 <th className="px-4 py-3">Location</th>
                                 <th className="px-4 py-3">Details</th>
                                 <th className="px-4 py-3">Total</th>
                                 <th className="px-4 py-3">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {orders
                                 .filter(o => {
                                    const term = orderSearch.toLowerCase();
                                    const matchSearch = o.id.toLowerCase().includes(term) || 
                                                        o.userName.toLowerCase().includes(term) ||
                                                        o.items.some(i => i.product.name.toLowerCase().includes(term));
                                    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                                    return matchSearch && matchStatus;
                                 })
                                 .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())
                                 .map(order => (
                                 <tr 
                                    key={order.id} 
                                    className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedOrder(order)}
                                 >
                                    <td className="px-4 py-3 font-mono text-indigo-600 font-medium group-hover:underline">#{order.id.slice(-4)}</td>
                                    <td className="px-4 py-3 text-slate-600">{format(order.timestamp, 'MMM d, HH:mm')}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{order.userName}</td>
                                    <td className="px-4 py-3 text-slate-600">{order.location}</td>
                                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                                       {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-900">${order.total.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                       <Badge variant="outline" className={cn(
                                          "capitalize",
                                          order.status === 'completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                          order.status === 'cancelled' ? "bg-red-50 text-red-700 border-red-200" :
                                          "bg-slate-100 text-slate-700"
                                       )}>
                                          {order.status}
                                       </Badge>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </Card>

                  {/* Order Detail Dialog */}
                  <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                     <DialogContent className="max-w-md">
                        <DialogHeader>
                           <DialogTitle className="flex items-center justify-between">
                              <span>Order #{selectedOrder?.id.slice(-6)}</span>
                              <Badge variant={selectedOrder?.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                                 {selectedOrder?.status}
                              </Badge>
                           </DialogTitle>
                           <DialogDescription>
                              Customer: <span className="font-medium text-slate-900">{selectedOrder?.userName}</span> • {selectedOrder && format(selectedOrder.timestamp, 'PPpp')}
                           </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-2">
                           <div className="rounded-lg border divide-y">
                              {selectedOrder?.items.map((item, idx) => (
                                 <div key={idx} className="p-3 flex justify-between items-start text-sm">
                                    <div className="flex gap-3">
                                       <div className="font-bold text-slate-500 bg-slate-100 w-6 h-6 rounded flex items-center justify-center text-xs">
                                          {item.quantity}
                                       </div>
                                       <div>
                                          <div className="font-medium text-slate-900">{item.product.name}</div>
                                          {item.options && Object.keys(item.options).length > 0 && (
                                             <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                                                {Object.entries(item.options).map(([optId, values]) => (
                                                   <div key={optId} className="flex gap-1">
                                                      <span className="text-slate-400">•</span>
                                                      <span>{Array.isArray(values) ? values.join(', ') : values}</span>
                                                   </div>
                                                ))}
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                    <div className="font-medium text-slate-700">${item.totalPrice.toFixed(2)}</div>
                                 </div>
                              ))}
                           </div>
                           
                           <div className="flex justify-between items-center pt-2 px-1">
                               <div className="text-slate-500 text-sm">Location: {selectedOrder?.location}</div>
                               <div className="flex items-center gap-3">
                                   <span className="text-sm font-medium text-slate-600">Total</span>
                                   <span className="text-xl font-bold text-slate-900">${selectedOrder?.total.toFixed(2)}</span>
                               </div>
                           </div>
                        </div>

                        <DialogFooter className="sm:justify-between gap-2 border-t pt-4 mt-2">
                           <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>Close</Button>
                           <Button size="sm" variant="outline" onClick={() => toast.success("Receipt sent to printer")}>
                              <Printer size={14} className="mr-2" /> Print Receipt
                           </Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>
               </TabsContent>

               <TabsContent value="logs" className="space-y-4">
                   <Card>
                     <CardHeader className="py-3 px-4 border-b flex flex-row items-center gap-4 bg-slate-50/50">
                        <Search size={14} className="text-slate-400" />
                        <Input 
                           placeholder="Search logs..." 
                           className="h-8 w-64 text-xs bg-white"
                           value={logSearch}
                           onChange={(e) => setLogSearch(e.target.value)}
                        />
                     </CardHeader>
                     <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                           <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b">
                              <tr>
                                 <th className="px-4 py-3">Timestamp</th>
                                 <th className="px-4 py-3">User</th>
                                 <th className="px-4 py-3">Product</th>
                                 <th className="px-4 py-3 text-right">Change</th>
                                 <th className="px-4 py-3">Reason</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {stockLogs
                                 .filter(l => l.productName.toLowerCase().includes(logSearch.toLowerCase()) || l.userId.toLowerCase().includes(logSearch.toLowerCase()))
                                 .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())
                                 .map(log => (
                                 <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-500 font-mono">{format(log.timestamp, 'MMM d, HH:mm:ss')}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{log.userId}</td>
                                    <td className="px-4 py-3 text-slate-700">{log.productName}</td>
                                    <td className={cn("px-4 py-3 font-bold text-right", log.change > 0 ? "text-emerald-600" : "text-red-600")}>
                                       {log.change > 0 ? "+" : ""}{log.change}
                                    </td>
                                    <td className="px-4 py-3">
                                       <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-600 border-slate-200">
                                          {log.reason.replace('_', ' ')}
                                       </Badge>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                        {stockLogs.length === 0 && (
                           <div className="p-8 text-center text-slate-400 italic">No logs recorded yet.</div>
                        )}
                     </div>
                   </Card>
               </TabsContent>
            </Tabs>
         )}

         {activeTab === 'inventory' && (
            <Card>
               <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                     <CardTitle className="flex items-center gap-2"><Package size={18} /> Inventory Management</CardTitle>
                     <CardDescription>Monitor stock levels and manage replenishment.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="outline" onClick={() => toast.success("Stock report exported to CSV")}>
                        <Download size={14} className="mr-2" /> Export Report
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="border-t">
                     <div className="grid grid-cols-12 gap-4 p-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b">
                        <div className="col-span-4">Product</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-4">Stock Level</div>
                        <div className="col-span-2 text-right">History</div>
                     </div>
                     <div className="divide-y">
                        {products.map(product => {
                           const isLow = product.stock !== undefined && product.minStock !== undefined && product.stock <= product.minStock;
                           const isOut = product.stock === 0;
                           
                           return (
                              <div key={product.id} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-slate-50/50 transition-colors">
                                 <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden shrink-0">
                                       <img src={product.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                       <div className="font-medium text-sm text-slate-900 truncate">{product.name}</div>
                                       <div className="text-xs text-slate-500">{product.category}</div>
                                    </div>
                                 </div>
                                 <div className="col-span-2 flex justify-center">
                                    {isOut ? (
                                       <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">Out of Stock</Badge>
                                    ) : isLow ? (
                                       <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Low Stock</Badge>
                                    ) : (
                                       <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">In Stock</Badge>
                                    )}
                                 </div>
                                 <div className="col-span-4">
                                    <StockControl product={product} onUpdateStock={updateStock} variant="admin" />
                                 </div>
                                 <div className="col-span-2 flex justify-end">
                                    <Button 
                                       size="sm" 
                                       variant="ghost"
                                       className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                                       onClick={() => setViewingHistoryProduct(product)}
                                    >
                                       <Clock size={16} />
                                    </Button>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </CardContent>
            </Card>
         )}

         {activeTab === 'menu' && (
            <div className="space-y-6">
               {/* Smart Operations Center */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 1. Happy Hour Intelligence */}
                  <Card className={cn("overflow-hidden border-indigo-100 shadow-sm transition-all duration-300", smartRules.happyHour ? "ring-2 ring-indigo-500 shadow-indigo-100" : "")}>
                     <div className="bg-gradient-to-r from-indigo-50 to-white p-4 border-b border-indigo-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                              <Sparkles size={16} />
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-800 text-sm">Happy Hour Protocol</h3>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Revenue Optimization</p>
                           </div>
                        </div>
                        <Switch 
                           checked={smartRules.happyHour} 
                           onCheckedChange={() => toggleSmartRule('happyHour')}
                           className="data-[state=checked]:bg-indigo-600"
                        />
                     </div>
                     <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-medium">Current Status</span>
                           <Badge variant={smartRules.happyHour ? "default" : "secondary"} className={cn("uppercase text-[10px] tracking-wider", smartRules.happyHour ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-100 text-slate-500")}>
                              {smartRules.happyHour ? "Active • 2x Points" : "Standby"}
                           </Badge>
                        </div>
                        
                        {/* Data Density: Projected Impact */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Proj. Uplift</span>
                              <span className="text-lg font-black text-indigo-600">+18.5%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div 
                                 className="h-full bg-indigo-500" 
                                 initial={{ width: 0 }}
                                 animate={{ width: smartRules.happyHour ? "65%" : "0%" }}
                              />
                           </div>
                           <p className="text-[10px] text-slate-400">Based on historical Friday data</p>
                        </div>

                        {/* Controls */}
                        <div className="space-y-3 pt-2">
                           <div className="flex justify-between text-xs font-medium text-slate-700">
                              <span>Timing</span>
                              <span>{happyHourConfig.start} - {happyHourConfig.end}</span>
                           </div>
                           <div className="flex justify-between text-xs font-medium text-slate-700">
                              <span>Discount Depth</span>
                              <span>{happyHourConfig.discount}%</span>
                           </div>
                           <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs h-8 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => setShowHappyHourConfig(true)}
                           >
                              Configure Rules
                           </Button>
                        </div>
                     </CardContent>
                  </Card>

                  {/* 2. Service Mode Transition */}
                  <Card className={cn("overflow-hidden border-amber-100 shadow-sm transition-all duration-300", smartRules.breakfastMode ? "ring-2 ring-amber-500 shadow-amber-100" : "")}>
                     <div className="bg-gradient-to-r from-amber-50 to-white p-4 border-b border-amber-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                              <Clock size={16} />
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-800 text-sm">Service Period</h3>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Menu & Facility Control</p>
                           </div>
                        </div>
                        <Badge variant="outline" className="bg-white text-amber-600 border-amber-200">
                           {smartRules.breakfastMode ? "Breakfast" : "Lunch"}
                        </Badge>
                     </div>
                     <CardContent className="p-4 space-y-4">
                        {/* Timeline Visualization */}
                        <div className="relative pt-2 pb-6">
                           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2" />
                           <div className="flex justify-between relative z-10">
                              <div className="flex flex-col items-center gap-1">
                                 <div className={cn("w-3 h-3 rounded-full border-2 border-white shadow-sm", smartRules.breakfastMode ? "bg-amber-500 ring-2 ring-amber-200" : "bg-slate-300")} />
                                 <span className="text-[10px] font-bold text-slate-400">06:00</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                 <div className={cn("w-3 h-3 rounded-full border-2 border-white shadow-sm", !smartRules.breakfastMode ? "bg-amber-500 ring-2 ring-amber-200" : "bg-slate-300")} />
                                 <span className="text-[10px] font-bold text-slate-400">11:00</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                 <div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                                 <span className="text-[10px] font-bold text-slate-400">22:00</span>
                              </div>
                           </div>
                        </div>

                        {/* Transition Checklist */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                           <h4 className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                              Transition Protocol
                              <span className="text-slate-400">{breakfastPrep.filter(t => t.done).length}/{breakfastPrep.length}</span>
                           </h4>
                           <div className="space-y-1.5">
                              {breakfastPrep.map((task, i) => (
                                 <div key={i} onClick={() => {
                                    const newPrep = [...breakfastPrep];
                                    newPrep[i].done = !newPrep[i].done;
                                    setBreakfastPrep(newPrep);
                                 }} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={cn(
                                       "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                       task.done ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-300 group-hover:border-slate-400"
                                    )}>
                                       {task.done && <Check size={10} />}
                                    </div>
                                    <span className={cn("text-xs transition-colors", task.done ? "text-slate-400 line-through" : "text-slate-700")}>{task.task}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-2">
                           <Button 
                              onClick={() => toggleSmartRule('breakfastMode')}
                              className={cn("flex-1 h-8 text-xs font-semibold", smartRules.breakfastMode ? "bg-slate-900 text-white" : "bg-amber-100 text-amber-700 hover:bg-amber-200")}
                           >
                              {smartRules.breakfastMode ? "Switch to Lunch Menu" : "Activate Breakfast Mode"}
                           </Button>
                           <Button 
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => setShowBreakfastConfig(true)}
                           >
                              <Settings size={14} />
                           </Button>
                        </div>
                     </CardContent>
                  </Card>

                  {/* 3. Auto-Restock Intelligence */}
                  <Card className={cn("overflow-hidden border-teal-100 shadow-sm transition-all duration-300", smartRules.autoStock ? "ring-2 ring-teal-500 shadow-teal-100" : "")}>
                     <div className="bg-gradient-to-r from-teal-50 to-white p-4 border-b border-teal-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                              <Zap size={16} />
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-800 text-sm">Supply Chain AI</h3>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Auto-Replenishment</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => setShowRestockConfig(true)} className="text-teal-400 hover:text-teal-600 transition-colors">
                              <Settings size={14} />
                           </button>
                           <Switch 
                              checked={smartRules.autoStock} 
                              onCheckedChange={() => toggleSmartRule('autoStock')}
                              className="data-[state=checked]:bg-teal-600"
                           />
                        </div>
                     </div>
                     <CardContent className="p-4 space-y-4">
                         <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-medium">Integration Status</span>
                           <div className="flex items-center gap-1.5 text-teal-600 font-bold text-[10px] uppercase bg-teal-50 px-2 py-0.5 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                              Sysco Connect
                           </div>
                        </div>

                        {/* Approval Queue */}
                        <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                           <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Approval Queue</span>
                              <Badge className="h-4 px-1 bg-slate-200 text-slate-600 hover:bg-slate-300 border-none text-[9px]">{restockQueue.length}</Badge>
                           </div>
                           <div className="max-h-[100px] overflow-y-auto">
                              {restockQueue.length === 0 ? (
                                 <div className="p-4 text-center text-xs text-slate-400 italic">All caught up!</div>
                              ) : (
                                 restockQueue.map((item) => (
                                    <div key={item.id} className="p-2 flex justify-between items-center border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                       <div>
                                          <div className="text-xs font-semibold text-slate-800">{item.item}</div>
                                          <div className="text-[10px] text-slate-400">{item.qty} units • ${item.cost}</div>
                                       </div>
                                       <div className="flex gap-1">
                                          <button onClick={() => setRestockQueue(q => q.filter(i => i.id !== item.id))} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-red-500 transition-colors">
                                             <X size={12} />
                                          </button>
                                          <button onClick={() => {
                                             toast.success(`Order placed for ${item.item}`);
                                             setRestockQueue(q => q.filter(i => i.id !== item.id));
                                          }} className="p-1 hover:bg-teal-100 rounded text-slate-400 hover:text-teal-600 transition-colors">
                                             <Check size={12} />
                                          </button>
                                       </div>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>

                        <Button 
                           variant="outline"
                           className="w-full h-8 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                           disabled={restockQueue.length === 0}
                           onClick={() => {
                              toast.success(`${restockQueue.length} orders approved and sent to suppliers.`);
                              setRestockQueue([]);
                           }}
                        >
                           Approve All Pending
                        </Button>
                     </CardContent>
                  </Card>
               </div>

               {/* Menu List */}
               <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                     <div>
                        <CardTitle className="flex items-center gap-2"><List size={18} /> Product Catalog</CardTitle>
                        <CardDescription>Manage inventory, pricing, and availability.</CardDescription>
                     </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                           <Input 
                              placeholder="Search products..." 
                              value={menuSearch}
                              onChange={(e) => setMenuSearch(e.target.value)}
                              className="pl-9 h-9"
                           />
                        </div>
                        <Select value={menuCategoryFilter} onValueChange={setMenuCategoryFilter}>
                           <SelectTrigger className="w-[140px] h-9">
                              <SelectValue placeholder="Category" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Items</SelectItem>
                              <SelectItem value="coffee">Coffee</SelectItem>
                              <SelectItem value="tea">Tea</SelectItem>
                              <SelectItem value="cold">Cold Drinks</SelectItem>
                              <SelectItem value="snack">Snacks</SelectItem>
                              <SelectItem value="meal">Meals</SelectItem>
                           </SelectContent>
                        </Select>
                        <Button onClick={handleCreate} className="bg-slate-900 text-white gap-2 h-9">
                           <Plus size={16} /> <span className="hidden sm:inline">Add Item</span>
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="border-t">
                        <div className="grid grid-cols-12 gap-4 p-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b">
                           <div className="col-span-5 sm:col-span-4">Product</div>
                           <div className="col-span-2 hidden sm:block">Category</div>
                           <div className="col-span-3 sm:col-span-2">Stock Level</div>
                           <div className="col-span-4 text-right">Actions</div>
                        </div>
                        <div className="divide-y">
                           {filteredAdminProducts.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 text-sm">No products found matching your filters.</div>
                           ) : (
                              filteredAdminProducts.map(product => {
                                 const isLowStock = product.stock !== undefined && product.minStock !== undefined && product.stock <= product.minStock;
                                 const stockPercent = product.stock && product.minStock ? Math.min(100, (product.stock / (product.minStock * 4)) * 100) : 0;
                                 
                                 return (
                                 <div key={product.id} className={cn("grid grid-cols-12 gap-4 p-3 items-center hover:bg-slate-50/50 transition-colors", isLowStock && smartRules.autoStock && "bg-red-50/50")}>
                                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                                       <img src={product.image} className={cn("w-10 h-10 rounded-md object-cover bg-slate-100", !product.available && "opacity-50 grayscale")} />
                                       <div className="min-w-0">
                                          <div className="font-medium text-sm text-slate-900 truncate">{product.name}</div>
                                          <div className="text-xs text-slate-500 line-clamp-1 hidden sm:block">{product.description}</div>
                                          <div className="text-[10px] text-slate-400 sm:hidden capitalize">{product.category}</div>
                                       </div>
                                    </div>
                                    <div className="col-span-2 hidden sm:block">
                                       <Badge variant="outline" className="capitalize font-normal text-xs">{product.category}</Badge>
                                       <div className="mt-1 text-xs font-medium text-slate-600">
                                          ${product.price.toFixed(2)}
                                          {smartRules.happyHour && ['snack', 'cold'].includes(product.category) && (
                                             <span className="ml-1 text-[10px] text-green-600 bg-green-50 px-1 rounded">-{happyHourConfig.discount}%</span>
                                          )}
                                       </div>
                                    </div>
                                    <div className="col-span-3 sm:col-span-2">
                                       <span className={cn("text-xs font-bold", isLowStock ? "text-red-600" : "text-slate-500")}>
                                          {product.stock} Units
                                       </span>
                                    </div>
                                    <div className="col-span-4 flex justify-end gap-2">
                                       <Button 
                                          size="sm" 
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hidden sm:flex"
                                          onClick={() => handleEdit(product)}
                                       >
                                          <Edit size={14} />
                                       </Button>
                                       <Button 
                                          size="sm" 
                                          variant={product.available ? "outline" : "secondary"} 
                                          className={cn("h-8 gap-2 text-xs w-full sm:w-28", product.available ? "text-green-600 border-green-200 bg-green-50/50 hover:bg-green-100" : "text-slate-500")}
                                          onClick={() => onToggleAvailability(product.id)}
                                       >
                                          {product.available ? (
                                             <><CheckCircle2 size={12} /> <span className="hidden sm:inline">Active</span></>
                                          ) : (
                                             <><Power size={12} /> <span className="hidden sm:inline">Sold Out</span></>
                                          )}
                                       </Button>
                                    </div>
                                 </div>
                                 );
                              })
                           )}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         )}

         {activeTab === 'facility' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Operating Hours */}
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Clock size={18} /> Café Operating Hours
                        </CardTitle>
                        <CardDescription>Set the automatic opening and closing times for orders.</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="flex items-end gap-4">
                           <div className="space-y-2">
                              <Label>Opening Time</Label>
                              <Input 
                                 type="time" 
                                 value={workingHours.start} 
                                 onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
                                 className="w-32"
                              />
                           </div>
                           <div className="space-y-2">
                              <Label>Closing Time</Label>
                              <Input 
                                 type="time" 
                                 value={workingHours.end} 
                                 onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
                                 className="w-32"
                              />
                           </div>
                           <Button className="bg-slate-900 text-white" onClick={saveHours}>
                              Save
                           </Button>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Robot Fleet Status */}
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                           <CardTitle className="flex items-center gap-2">
                              <Truck size={18} /> Robot Fleet Status
                           </CardTitle>
                           <CardDescription>Real-time telemetry from delivery units.</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleAddRobot}>
                           <Plus size={14} /> Add Robot
                        </Button>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-3">
                           {robots.map(bot => (
                              <div 
                                 key={bot.id} 
                                 className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
                                 onClick={() => cycleRobotStatus(bot)}
                                 title="Click to cycle status"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 rounded-full ring-2 ring-transparent group-hover:ring-slate-200 transition-all", bot.status === 'delivering' ? "bg-teal-500 animate-pulse" : bot.status === 'charging' ? "bg-amber-500" : bot.status === 'maintenance' ? "bg-red-500" : "bg-slate-400")} />
                                    <div>
                                       <div className="font-bold text-xs text-slate-800">{bot.name}</div>
                                       <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                                          {bot.location}
                                          <span className="font-semibold text-slate-400">• {bot.status}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="text-[10px] font-mono font-bold text-slate-600">{bot.battery}%</div>
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                       <div 
                                          className={cn("h-full rounded-full", bot.battery < 20 ? "bg-red-500" : "bg-green-500")} 
                                          style={{ width: `${bot.battery}%` }}
                                       />
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </CardContent>
                  </Card>
               </div>

               {/* Kitchen Status */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <ChefHat size={18} /> Kitchen Availability
                     </CardTitle>
                     <CardDescription>Manually override kitchen status by floor.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(kitchenStatus).map(([floor, isOpen]) => (
                           <div key={floor} className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                              <div className="flex justify-between items-start">
                                 <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                                    isOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                                 )}>
                                    L{floor}
                                 </div>
                                 <Switch 
                                    checked={isOpen} 
                                    onCheckedChange={() => toggleKitchen(floor)} 
                                 />
                              </div>
                              <div>
                                 <h4 className="font-bold text-sm text-slate-900">Level {floor}</h4>
                                 <p className={cn("text-[10px] font-medium uppercase tracking-wide mt-1", isOpen ? "text-emerald-600" : "text-slate-500")}>
                                    {isOpen ? "Online" : "Offline"}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               {/* Environment Sensors */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <BarChart3 size={18} /> Environment Telemetry
                     </CardTitle>
                     <CardDescription>Sensor readings from café zones.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                           { label: "Temp (L4)", val: "72°F", status: "optimal" },
                           { label: "Humidity", val: "45%", status: "optimal" },
                           { label: "CO2 Levels", val: "420ppm", status: "optimal" },
                           { label: "Noise Level", val: "65dB", status: "warning" },
                           { label: "Light Level", val: "850 lux", status: "optimal" },
                           { label: "Occupancy", val: "85%", status: "warning" },
                        ].map((sensor, i) => (
                           <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                              <div>
                                 <div className="text-[10px] uppercase font-bold text-slate-400">{sensor.label}</div>
                                 <div className="text-lg font-bold text-slate-700">{sensor.val}</div>
                              </div>
                              <div className={cn("w-2 h-2 rounded-full", sensor.status === 'optimal' ? "bg-emerald-500" : "bg-amber-500")} />
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               {/* Equipment Health Monitoring */}
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                        <CardTitle className="flex items-center gap-2">
                           <Settings size={18} /> Equipment Health
                        </CardTitle>
                        <CardDescription>Maintenance alerts and device status.</CardDescription>
                     </div>
                     <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleAddEquipment}>
                        <Plus size={14} /> Add Equipment
                     </Button>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {equipment.map(item => (
                           <div 
                              key={item.id} 
                              className={cn(
                                 "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                                 item.status === 'operational' ? "bg-white border-slate-200" : 
                                 item.status === 'warning' ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
                              )}
                              onClick={() => cycleEquipmentStatus(item)}
                              title="Click to cycle status"
                           >
                              <div className={cn(
                                 "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                 item.status === 'operational' ? "bg-slate-100 text-slate-500" : 
                                 item.status === 'warning' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                              )}>
                                 {item.status === 'operational' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                                    <Badge variant="outline" className={cn(
                                       "uppercase text-[9px] h-5",
                                       item.status === 'operational' ? "text-slate-500 border-slate-200" : 
                                       item.status === 'warning' ? "text-amber-700 border-amber-200 bg-amber-50" : "text-red-700 border-red-200 bg-red-50"
                                    )}>
                                       {item.status}
                                    </Badge>
                                 </div>
                                 <p className="text-xs text-slate-500 mt-0.5">{item.type} • {item.location}</p>
                                 
                                 {item.issue && (
                                    <div className="mt-2 text-xs font-medium text-red-600 bg-white/50 px-2 py-1 rounded border border-red-100/50 inline-block">
                                       Issue: {item.issue}
                                    </div>
                                 )}
                                 
                                 <div className="mt-3 text-[10px] text-slate-400 font-medium">
                                    Last Service: {item.lastService}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            </div>
         )}
       </div>
     </div>
   );
 };



// --- Main Container ---

export const CoreDrinks: React.FC<{ persona: string }> = ({ persona }) => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [robots, setRobots] = useState<Robot[]>(MOCK_ROBOTS);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);


  // Smart Rules State
  const [smartRules, setSmartRules] = useState<SmartRules>({
     happyHour: false,
     autoStock: true,
     breakfastMode: false
  });
  const [showHappyHourConfig, setShowHappyHourConfig] = useState(false);
  const [happyHourConfig, setHappyHourConfig] = useState<HappyHourConfig>({ 
     start: '16:00', 
     end: '19:00', 
     discount: 20,
     includedCategories: ['cold', 'snack'],
     days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  });
  
  const [showBreakfastConfig, setShowBreakfastConfig] = useState(false);
  const [breakfastConfig, setBreakfastConfig] = useState<BreakfastConfig>({
     start: "06:00",
     end: "11:00",
     highlightCategories: ["coffee", "tea", "snack"],
     checklist: ["Pre-heat Pastry Ovens", "Switch Digital Menus", "Verify Milk Stock"]
  });
  const [breakfastPrep, setBreakfastPrep] = useState(
     breakfastConfig.checklist.map(task => ({ task, done: false }))
  );
  
  const [showRestockConfig, setShowRestockConfig] = useState(false);
  const [restockConfig, setRestockConfig] = useState<RestockConfig>({
     threshold: 15,
     autoApproveLimit: 200,
     suppliers: ["Sysco", "EcoPack", "Local Dairy"]
  });
  const [restockQueue, setRestockQueue] = useState<RestockItem[]>([
     { id: 1, item: "Oat Milk", qty: 40, supplier: "Sysco", cost: 120, status: 'pending' },
     { id: 2, item: "Paper Cups (12oz)", qty: 500, supplier: "EcoPack", cost: 85, status: 'pending' }
  ]);

  // Sync prep list if config changes
  useEffect(() => {
     setBreakfastPrep(breakfastConfig.checklist.map(task => ({ task, done: false })));
  }, [breakfastConfig.checklist]);

  // Determine view based on persona
  const viewMode = useMemo(() => {
    if (['CafeteriaStaff'].includes(persona)) return 'kds';
    if (['DeliveryRunner'].includes(persona)) return 'delivery';
    if (['Admin', 'FacilityManager'].includes(persona)) return 'admin';
    return 'employee';
  }, [persona]);

  const handlePlaceOrder = (items: CartItem[], location: string) => {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      userId: 'currentUser',
      userName: 'You',
      items: items,
      total,
      status: 'pending',
      location,
      timestamp: new Date()
    };

    setOrders([newOrder, ...orders]);
    
    // Consume Stock
    setProducts(prevProducts => prevProducts.map(p => {
       const orderedItem = items.find(i => i.product.id === p.id);
       if (orderedItem && p.stock !== undefined) {
          const newStock = Math.max(0, p.stock - orderedItem.quantity);
          
          // Log Consumption
          setStockLogs(prev => [...prev, {
             id: `log-${Date.now()}-${Math.random()}`,
             productId: p.id,
             productName: p.name,
             change: -orderedItem.quantity,
             newLevel: newStock,
             reason: 'consumption',
             timestamp: new Date(),
             userId: 'system'
          }]);

          // Auto-mark sold out if stock hits 0
          return { ...p, stock: newStock, available: newStock > 0 };
       }
       return p;
    }));
    
    // Simulate Robot Assignment for Delivery (Mock)
    // In a real app, this would happen when status becomes 'ready' or 'delivering'
  };

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    toast.info(`Order #${orderId} updated to ${status}`);
  };

  const handleToggleAvailability = (productId: string) => {
     setProducts(prev => prev.map(p => {
        if (p.id === productId) {
           const newStatus = !p.available;
           toast(newStatus ? `${p.name} is now Available` : `${p.name} is now Sold Out`);
           return { ...p, available: newStatus };
        }
        return p;
     }));
  };

  const handleSaveProduct = (product: Product) => {
     setProducts(prev => {
        const exists = prev.some(p => p.id === product.id);
        if (exists) {
           return prev.map(p => p.id === product.id ? product : p);
        }
        return [...prev, product];
     });
     toast.success("Product saved successfully");
  };

  const handleUpdateEquipment = (eq: Equipment) => {
     setEquipment(prev => {
        const exists = prev.some(e => e.id === eq.id);
        if (exists) return prev.map(e => e.id === eq.id ? eq : e);
        return [...prev, eq];
     });
  };

  const handleUpdateRobot = (bot: Robot) => {
     setRobots(prev => {
        const exists = prev.some(r => r.id === bot.id);
        if (exists) return prev.map(r => r.id === bot.id ? bot : r);
        return [...prev, bot];
     });
  };

  return (
    <div className="h-full bg-slate-50 p-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-full"
        >
          {viewMode === 'employee' && (
             <EmployeeOrderingView 
                products={products} 
                onPlaceOrder={handlePlaceOrder} 
                userOrders={orders.filter(o => o.userId === 'currentUser' || o.id.startsWith('ORD-882'))}
                smartRules={smartRules}
                happyHourConfig={happyHourConfig}
                breakfastConfig={breakfastConfig}
             />
          )}
          {viewMode === 'kds' && (
             <BaristaKDSView 
                orders={orders} 
                products={products}
                onUpdateStatus={handleStatusUpdate} 
                onToggleAvailability={handleToggleAvailability}
                smartRules={smartRules}
                breakfastPrep={breakfastPrep}
                onUpdateStock={(id, stock, reason) => {
                   // Reuse the updateStock logic from Admin view, but simplified
                   const product = products.find(p => p.id === id);
                   if (!product) return;
                   const change = stock - (product.stock || 0);
                   
                   handleSaveProduct({ ...product, stock: Math.max(0, stock) });
                   
                   // Log
                   setStockLogs(prev => [...prev, {
                      id: `log-${Date.now()}`,
                      productId: product.id,
                      productName: product.name,
                      change: change,
                      newLevel: Math.max(0, stock),
                      reason: reason,
                      timestamp: new Date(),
                      userId: 'Barista'
                   }]);
                }}
             />
          )}
          {viewMode === 'delivery' && (
             <DeliveryDashboard orders={orders} onUpdateStatus={handleStatusUpdate} />
          )}
          {viewMode === 'admin' && (
             <AdminAnalyticsView 
                orders={orders} 
                products={products}
                equipment={equipment}
                robots={robots}
                stockLogs={stockLogs}
                onToggleAvailability={handleToggleAvailability} 
                onSaveProduct={handleSaveProduct}
                onUpdateEquipment={handleUpdateEquipment}
                onUpdateRobot={handleUpdateRobot}
                onAddStockLog={(log) => setStockLogs(prev => [log, ...prev])}
                // Smart Rules Props
                smartRules={smartRules}
                setSmartRules={setSmartRules}
                happyHourConfig={happyHourConfig}
                setHappyHourConfig={setHappyHourConfig}
                showHappyHourConfig={showHappyHourConfig}
                setShowHappyHourConfig={setShowHappyHourConfig}
                breakfastConfig={breakfastConfig}
                setBreakfastConfig={setBreakfastConfig}
                showBreakfastConfig={showBreakfastConfig}
                setShowBreakfastConfig={setShowBreakfastConfig}
                restockConfig={restockConfig}
                setRestockConfig={setRestockConfig}
                showRestockConfig={showRestockConfig}
                setShowRestockConfig={setShowRestockConfig}
                restockQueue={restockQueue}
                setRestockQueue={setRestockQueue}
                breakfastPrep={breakfastPrep}
                setBreakfastPrep={setBreakfastPrep}
             />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
