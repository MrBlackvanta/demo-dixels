import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Map as MapIcon, 
  List, 
  Plus, 
  Search, 
  Settings, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronDown, 
  Layers,
  Maximize2,
  Filter,
  Download,
  Upload,
  CheckCircle2,
  X,
  Save,
  Scan,
  Wifi,
  Video,
  Thermometer,
  CreditCard,
  Users,
  Calendar,
  Image as ImageIcon,
  Box,
  ArrowRight,
  Globe,
  Lock,
  Cpu,
  Zap,
  Clock,
  MousePointer2,
  Hand,
  Square,
  PenTool,
  Grab,
  Move,
  Activity,
  ThermometerSun,
  Grid,
  Link as LinkIcon,
  Trash2,
  AlertCircle,
  Shield,
  Eye,
  Radio,
  Smartphone,
  EyeOff,
  FileImage,
  Pencil,
  RefreshCcw,
  Shapes,
  ZoomIn,
  ZoomOut,
  Copy,
  MoreVertical,
  Magnet,
  Command,
  ChevronUp,
  Minus,
  Maximize,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  Wind,
  Sun,
  Volume2,
  Accessibility,
  Armchair,
  Timer,
  DollarSign,
  Briefcase,
  Signal,
  Coffee,
  Utensils,
  Headphones,
  Sparkles,
  History,
  Battery,
  Network,
  AlertTriangle,
  Lightbulb,
  QrCode,
  Layout,
  RotateCcw,
  Power,
  Monitor,
  CalendarDays,
  FileText,
  Paperclip,
  Cloud,
  Droplets,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, AreaChart, Area, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Slider } from '../ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { cn } from '../ui/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// --- Types ---

type ViewMode = 'map' | 'list';
type SelectionType = 'building' | 'floor' | 'zone' | 'space' | 'device' | null;
type MapTool = 'select' | 'draw-rect' | 'draw-poly' | 'pan';
type VisualizationMode = 'standard' | 'heatmap' | 'occupancy';
type DrawTarget = 'space' | 'zone';
type ChartMetric = 'temp' | 'co2' | 'occupancy';

interface Point {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

interface Entity {
  id: string;
  name: string;
  type: string;
}

interface Integration {
  id: string;
  category: 'access' | 'video' | 'sensor' | 'app';
  provider: string;
  name: string;
  status: 'active' | 'syncing' | 'error' | 'offline';
  meta?: string;
  coordinates?: Point; // Device position on map
  signal?: 'high' | 'medium' | 'low';
  battery?: number;
}

interface Zone {
  id: string;
  name: string;
  color: string;
  points: Point[];
}

interface Space extends Entity {
  // Identity
  type: 'Meeting Room' | 'Huddle' | 'Desk Area' | 'Social';
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  
  // Physical
  area: number;
  ceilingHeight?: number;
  amenities: string[];
  points: Point[];
  floorId: string;
  zoneId?: string;
  image?: string;

  // Config State
  maintenanceMode?: boolean;
  environmentalTargets?: {
    temp: number;
    co2: number;
    lux: number;
  };
  seatingLayout?: 'boardroom' | 'classroom' | 'u-shape' | 'theater';

  // Booking State
  allowBooking?: boolean;
  bookingStrategy?: 'instant' | 'request' | 'restricted';
  hourlyRate?: number;
  costCenter?: string;
  accessLevel?: 'all' | 'engineering' | 'executive';
  minDuration?: number;
  maxDuration?: number;
  requireCheckIn?: boolean;
  bufferTime?: number;
  
  // Services
  services?: {
    catering: boolean;
    cleaning: boolean;
    itSupport: boolean;
    lunch: boolean;
  };

  // Live Data
  sensors?: {
    temp: number;
    co2: number;
    occupancy: number;
  };
  integrations: Integration[];
}

// --- Mock Data Helpers ---
const rectToPoints = (x: number, y: number, w: number, h: number): Point[] => [
  { x, y },
  { x: x + w, y },
  { x: x + w, y: y + h },
  { x, y: y + h }
];

const getCentroid = (points: Point[]): Point => {
  if (points.length === 0) return { x: 0, y: 0 };
  const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return { x, y };
};

// Mock sensor history data
const mockHistoryData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  temp: 20 + Math.random() * 3,
  co2: 400 + Math.random() * 400,
  occupancy: Math.floor(Math.random() * 15)
}));

const mockEvents = [
  { id: 1, time: '2 mins ago', type: 'occupancy', message: 'Occupancy detected', icon: Users, color: 'text-emerald-500' },
  { id: 2, time: '15 mins ago', type: 'temp', message: 'Temp adjusted to 22°C', icon: Thermometer, color: 'text-orange-500' },
  { id: 3, time: '1 hour ago', type: 'system', message: 'System check passed', icon: Activity, color: 'text-blue-500' },
];

const hierarchy = [
  {
    id: 'b1',
    name: 'Global HQ',
    location: 'New York, NY',
    floors: [
      { id: 'f1', name: 'Level 1 - Lobby & Public', level: 1, spacesCount: 12 },
      { id: 'f2', name: 'Level 2 - R&D', level: 2, spacesCount: 45 },
      { id: 'f3', name: 'Level 3 - Executive', level: 3, spacesCount: 8 },
    ]
  },
  {
    id: 'b2',
    name: 'Innovation Center',
    location: 'San Francisco, CA',
    floors: [
      { id: 'f1-ic', name: 'Ground Floor', level: 1, spacesCount: 20 },
      { id: 'f2-ic', name: 'Labs', level: 2, spacesCount: 15 },
    ]
  }
];

const mockZones: Zone[] = [
  { id: 'z1', name: 'Executive Wing', color: 'fill-indigo-500/20 stroke-indigo-500', points: rectToPoints(5, 5, 60, 45) },
  { id: 'z2', name: 'Social Hub', color: 'fill-orange-500/20 stroke-orange-500', points: rectToPoints(68, 5, 25, 45) }
];

const mockSpaces: Space[] = [
  { 
    id: 's1', 
    name: 'Executive Boardroom', 
    type: 'Meeting Room', 
    capacity: 20, 
    status: 'available', 
    area: 45,
    ceilingHeight: 3.2,
    floorId: 'f3', 
    amenities: ['Video Conf', 'Catering', 'Wheelchair Accessible'], 
    points: rectToPoints(10, 10, 30, 20),
    image: 'https://images.unsplash.com/photo-1760611656007-f767a8082758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    sensors: { temp: 21.5, co2: 420, occupancy: 0 },
    maintenanceMode: false,
    environmentalTargets: { temp: 21, co2: 800, lux: 500 },
    seatingLayout: 'boardroom',
    allowBooking: true,
    bookingStrategy: 'request',
    hourlyRate: 150,
    costCenter: 'EXEC-001',
    accessLevel: 'executive',
    minDuration: 30,
    maxDuration: 240,
    requireCheckIn: true,
    bufferTime: 15,
    services: { catering: true, cleaning: true, itSupport: true, lunch: false },
    integrations: [
      { id: 'i1', category: 'access', provider: 'HID', name: 'Executive Access Group', status: 'active', meta: 'Level 3 Clearance', coordinates: { x: 10, y: 15 }, signal: 'high', battery: 98 },
      { id: 'i2', category: 'video', provider: 'Verkada', name: 'Boardroom Camera 01', status: 'active', meta: 'Recording', coordinates: { x: 38, y: 12 }, signal: 'high' },
      { id: 'i3', category: 'app', provider: 'Outlook', name: 'Room Calendar', status: 'syncing', meta: 'Exchange 365', signal: 'medium' }
    ]
  },
  { 
    id: 's2', 
    name: 'Focus Room A', 
    type: 'Huddle', 
    capacity: 4, 
    status: 'occupied', 
    area: 12, 
    floorId: 'f3', 
    amenities: ['Whiteboard'], 
    points: rectToPoints(45, 10, 15, 15),
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
    sensors: { temp: 23.1, co2: 800, occupancy: 3 },
    allowBooking: true,
    bookingStrategy: 'instant',
    minDuration: 15,
    maxDuration: 60,
    integrations: []
  },
  { 
    id: 's3', 
    name: 'Focus Room B', 
    type: 'Huddle', 
    capacity: 4, 
    status: 'available', 
    area: 12, 
    floorId: 'f3', 
    amenities: ['Whiteboard'], 
    points: rectToPoints(45, 30, 15, 15),
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
    sensors: { temp: 21.8, co2: 410, occupancy: 0 },
    allowBooking: true,
    bookingStrategy: 'instant',
    integrations: []
  },
  { 
    id: 's4', 
    name: 'Open Work Area', 
    type: 'Desk Area', 
    capacity: 50, 
    status: 'available', 
    area: 120, 
    floorId: 'f3', 
    amenities: ['Hot Desk'], 
    points: [ 
      { x: 10, y: 40 },
      { x: 60, y: 40 },
      { x: 60, y: 60 },
      { x: 30, y: 60 },
      { x: 30, y: 80 },
      { x: 10, y: 80 }
    ],
    image: 'https://images.unsplash.com/photo-1758876202610-bae5608f5051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    sensors: { temp: 22.5, co2: 550, occupancy: 12 },
    allowBooking: false,
    integrations: [
      { id: 'i4', category: 'sensor', provider: 'Milesight', name: 'Zone Occupancy Grid', status: 'active', meta: '8 Sensors Linked', coordinates: { x: 35, y: 50 }, signal: 'high', battery: 85 }
    ]
  },
  { 
    id: 's5', 
    name: 'Coffee Lounge', 
    type: 'Social', 
    capacity: 15, 
    status: 'occupied', 
    area: 30, 
    floorId: 'f3', 
    amenities: ['Coffee Machine'], 
    points: rectToPoints(65, 55, 25, 35),
    image: 'https://images.unsplash.com/photo-1748261500463-d15e624baf8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    sensors: { temp: 24.0, co2: 600, occupancy: 8 },
    allowBooking: false,
    integrations: []
  },
];

// --- Components ---

export const SpaceManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [visMode, setVisMode] = useState<VisualizationMode>('standard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SelectionType>(null);
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>(['b1']);
  const [currentFloor, setCurrentFloor] = useState('f3');
  const [activeTool, setActiveTool] = useState<MapTool>('select');
  const [drawTarget, setDrawTarget] = useState<DrawTarget>('space');
  const [spaces, setSpaces] = useState<Space[]>(mockSpaces);
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  const [integrationTab, setIntegrationTab] = useState('all');
  const [floorPlanImage, setFloorPlanImage] = useState<string | null>('https://images.unsplash.com/photo-1588049308335-0238c6a624ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080');
  
  // View State
  const [zoom, setZoom] = useState(1);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridSize, setGridSize] = useState(2.5); // Percentage grid
  const [isToolbarMinimized, setIsToolbarMinimized] = useState(true); // Default minimized
  const [isLayersMinimized, setIsLayersMinimized] = useState(true); // Default minimized
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default minimized
  const [chartMetric, setChartMetric] = useState<ChartMetric>('temp');
  
  // Drawing State
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string; type: SelectionType } | null>(null);

  // Layers State
  const [layers, setLayers] = useState({
    floorplan: true,
    zones: true,
    spaces: true,
    devices: true, 
    grid: false
  });
  
  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Pan State
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  // Drag State
  const [dragState, setDragState] = useState<{
    type: 'vertex' | 'shape' | 'device',
    id: string,
    parentId?: string, 
    vertexIndex?: number, 
    startMouse: Point,
    startPoints?: Point[],
    startPos?: Point
  } | null>(null);
  
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedId) handleDelete(selectedId, selectedType);
          break;
        case 'Escape':
          setActiveTool('select');
          setSelectedId(null);
          setDrawingPoints([]);
          break;
        case 'ArrowUp':
          if (selectedId) handleNudge(0, -gridSize);
          break;
        case 'ArrowDown':
          if (selectedId) handleNudge(0, gridSize);
          break;
        case 'ArrowLeft':
          if (selectedId) handleNudge(-gridSize, 0);
          break;
        case 'ArrowRight':
          if (selectedId) handleNudge(gridSize, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedType, spaces, zones, gridSize]);

  // Sensor simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!dragState) { 
        setSpaces(prev => prev.map(s => ({
          ...s,
          sensors: s.sensors ? {
            temp: parseFloat((s.sensors.temp + (Math.random() * 0.2 - 0.1)).toFixed(1)),
            co2: Math.floor(s.sensors.co2 + (Math.random() * 10 - 5)),
            occupancy: s.sensors.occupancy
          } : undefined
        })));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [dragState]);

  // Close Context Menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // -- Actions --

  const handleSelect = (id: string, type: SelectionType) => {
    if (activeTool === 'select') {
      setSelectedId(id);
      setSelectedType(type);
    }
  };

  const handleDelete = (id: string, type: SelectionType) => {
    if (type === 'space') {
      setSpaces(prev => prev.filter(s => s.id !== id));
    } else if (type === 'zone') {
      setZones(prev => prev.filter(z => z.id !== id));
    } else if (type === 'device') {
       const space = spaces.find(s => s.integrations.some(i => i.id === id));
       if (space) {
         setSpaces(prev => prev.map(s => {
            if (s.id === space.id) {
               return { ...s, integrations: s.integrations.filter(i => i.id !== id) };
            }
            return s;
         }));
       }
    }
    setSelectedId(null);
    setSelectedType(null);
  };

  const handleNudge = (dx: number, dy: number) => {
     if (selectedType === 'space') {
       setSpaces(prev => prev.map(s => {
         if (s.id === selectedId) {
           return { ...s, points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
         }
         return s;
       }));
     } else if (selectedType === 'zone') {
        setZones(prev => prev.map(z => {
          if (z.id === selectedId) {
            return { ...z, points: z.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
          }
          return z;
        }));
     } else if (selectedType === 'device') {
        const space = spaces.find(s => s.integrations.some(i => i.id === selectedId));
        if (space) {
           setSpaces(prev => prev.map(s => {
             if (s.id === space.id) {
               return {
                 ...s,
                 integrations: s.integrations.map(i => {
                   if (i.id === selectedId) {
                      return { ...i, coordinates: { x: (i.coordinates?.x || 0) + dx, y: (i.coordinates?.y || 0) + dy } };
                   }
                   return i;
                 })
               };
             }
             return s;
           }));
        }
     }
  };

  // -- Helper Logic --
  const updateSelectedSpace = (updates: Partial<Space>) => {
    if (selectedType === 'space' && selectedId) {
      setSpaces(prev => prev.map(s => s.id === selectedId ? { ...s, ...updates } : s));
    }
  };

  const snapValue = (val: number) => {
    if (!snapEnabled) return val;
    return Math.round(val / gridSize) * gridSize;
  };

  const getMousePercent = (e: React.MouseEvent | MouseEvent) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, rawX)),
      y: Math.max(0, Math.min(100, rawY))
    };
  };

  // -- Interaction Handlers --

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return; 

    if (activeTool === 'pan' && scrollContainerRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setScrollStart({ 
        left: scrollContainerRef.current.scrollLeft, 
        top: scrollContainerRef.current.scrollTop 
      });
      return;
    }

    const p = getMousePercent(e);
    const snappedP = { x: snapValue(p.x), y: snapValue(p.y) };

    if (activeTool === 'draw-poly') {
      setDrawingPoints(prev => [...prev, snappedP]);
      return;
    }

    if (activeTool === 'draw-rect') {
      const id = `new-${Date.now()}`;
      const points = [snappedP, snappedP, snappedP, snappedP];

      if (drawTarget === 'space') {
        const newSpace: Space = {
          id,
          name: 'New Space',
          type: 'Meeting Room',
          capacity: 0,
          status: 'available',
          area: 10,
          floorId: currentFloor,
          amenities: [],
          points,
          sensors: { temp: 21, co2: 400, occupancy: 0 },
          integrations: [],
          bookingStrategy: 'instant',
          allowBooking: true
        };
        setSpaces([...spaces, newSpace]);
        setSelectedId(id);
        setSelectedType('space');
      } else {
        const newZone: Zone = {
          id,
          name: 'New Zone',
          color: 'fill-slate-500/20 stroke-slate-500',
          points
        };
        setZones([...zones, newZone]);
        setSelectedId(id);
        setSelectedType('zone');
      }
      
      setDragState({
        type: 'vertex',
        id,
        vertexIndex: 2,
        startMouse: { x: e.clientX, y: e.clientY },
        startPoints: points
      });
    }
  };

  const handleVertexMouseDown = (e: React.MouseEvent, id: string, index: number) => {
    if (activeTool !== 'select' || e.button !== 0) return;
    e.stopPropagation();
    const targetSpace = spaces.find(s => s.id === id);
    const targetZone = zones.find(z => z.id === id);
    const points = targetSpace ? targetSpace.points : targetZone?.points;

    if (points) {
      setDragState({
        type: 'vertex',
        id,
        vertexIndex: index,
        startMouse: { x: e.clientX, y: e.clientY },
        startPoints: [...points]
      });
    }
  };

  const handleDeviceMouseDown = (e: React.MouseEvent, integrationId: string, spaceId: string, coords: Point) => {
    if (activeTool !== 'select' || e.button !== 0) return;
    e.stopPropagation();
    handleSelect(integrationId, 'device');
    
    setDragState({
      type: 'device',
      id: integrationId,
      parentId: spaceId,
      startMouse: { x: e.clientX, y: e.clientY },
      startPos: coords
    });
  };

  const handleShapeMouseDown = (e: React.MouseEvent, id: string, type: SelectionType) => {
    if (activeTool !== 'select') return;
    
    if (e.button === 2) {
      e.stopPropagation();
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, id, type });
      handleSelect(id, type);
      return;
    }

    e.stopPropagation();
    handleSelect(id, type);

    const targetSpace = spaces.find(s => s.id === id);
    const targetZone = zones.find(z => z.id === id);
    const points = targetSpace ? targetSpace.points : targetZone?.points;

    if (points) {
       setDragState({
        type: 'shape',
        id,
        startMouse: { x: e.clientX, y: e.clientY },
        startPoints: [...points] 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && scrollContainerRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      scrollContainerRef.current.scrollLeft = scrollStart.left - dx;
      scrollContainerRef.current.scrollTop = scrollStart.top - dy;
      return;
    }

    if (dragState && mapRef.current) {
      const mapRect = mapRef.current.getBoundingClientRect();
      const dxPct = ((e.clientX - dragState.startMouse.x) / mapRect.width) * 100;
      const dyPct = ((e.clientY - dragState.startMouse.y) / mapRect.height) * 100;

      if (dragState.type === 'shape' && dragState.startPoints) {
        const newPoints = dragState.startPoints.map(p => ({
          x: snapValue(p.x + dxPct),
          y: snapValue(p.y + dyPct)
        }));
        updateEntityPoints(dragState.id, newPoints);
      } else if (dragState.type === 'vertex' && dragState.vertexIndex !== undefined && dragState.startPoints) {
        const newPoints = [...dragState.startPoints];
        const rawX = dragState.startPoints[dragState.vertexIndex].x + dxPct;
        const rawY = dragState.startPoints[dragState.vertexIndex].y + dyPct;
        newPoints[dragState.vertexIndex] = { x: snapValue(rawX), y: snapValue(rawY) };
        updateEntityPoints(dragState.id, newPoints);
      } else if (dragState.type === 'device' && dragState.startPos && dragState.parentId) {
         const rawX = dragState.startPos.x + dxPct;
         const rawY = dragState.startPos.y + dyPct;
         const newPos = { x: snapValue(rawX), y: snapValue(rawY) };
         
         setSpaces(prev => prev.map(s => {
           if (s.id === dragState.parentId) {
             return {
               ...s,
               integrations: s.integrations.map(i => i.id === dragState.id ? { ...i, coordinates: newPos } : i)
             };
           }
           return s;
         }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragState(null);
    if (activeTool === 'draw-rect') {
       setActiveTool('select');
    }
  };

  const handleContextMenuAction = (action: 'delete' | 'duplicate') => {
    if (!contextMenu) return;
    
    if (action === 'delete') {
      handleDelete(contextMenu.id, contextMenu.type);
    }

    if (action === 'duplicate') {
       if (contextMenu.type === 'space') {
         const original = spaces.find(s => s.id === contextMenu.id);
         if (original) {
           const newSpace = { 
             ...original, 
             id: `copy-${Date.now()}`,
             name: `${original.name} (Copy)`,
             points: original.points.map(p => ({ x: p.x + 5, y: p.y + 5 })),
             integrations: []
           };
           setSpaces([...spaces, newSpace]);
         }
       } else if (contextMenu.type === 'zone') {
         const original = zones.find(z => z.id === contextMenu.id);
         if (original) {
            const newZone = {
              ...original,
              id: `copy-${Date.now()}`,
              name: `${original.name} (Copy)`,
              points: original.points.map(p => ({ x: p.x + 5, y: p.y + 5 }))
            };
            setZones([...zones, newZone]);
         }
       }
    }

    setContextMenu(null);
  };

  const finishPoly = () => {
    if (drawingPoints.length < 3) {
      setDrawingPoints([]);
      return;
    }
    const id = `new-poly-${Date.now()}`;
    
    if (drawTarget === 'space') {
      const newSpace: Space = {
        id,
        name: 'New Polygon Space',
        type: 'Meeting Room',
        capacity: 10,
        status: 'available',
        area: 25,
        floorId: currentFloor,
        amenities: [],
        points: [...drawingPoints],
        sensors: { temp: 21, co2: 400, occupancy: 0 },
        integrations: []
      };
      setSpaces([...spaces, newSpace]);
      handleSelect(id, 'space');
    } else {
      const newZone: Zone = {
        id,
        name: 'New Zone',
        color: 'fill-slate-500/20 stroke-slate-500',
        points: [...drawingPoints]
      };
      setZones([...zones, newZone]);
      handleSelect(id, 'zone');
    }

    setDrawingPoints([]);
    setActiveTool('select');
  };

  const updateEntityPoints = (id: string, points: Point[]) => {
    const isSpace = spaces.some(s => s.id === id);
    if (isSpace) {
      setSpaces(prev => prev.map(s => s.id === id ? { ...s, points } : s));
    } else {
      setZones(prev => prev.map(z => z.id === id ? { ...z, points } : z));
    }
  };

  const toggleBuilding = (id: string) => {
    if (expandedBuildings.includes(id)) {
      setExpandedBuildings(expandedBuildings.filter(b => b !== id));
    } else {
      setExpandedBuildings([...expandedBuildings, id]);
    }
  };

  const addIntegration = (category: Integration['category'], provider: string, name: string, meta: string) => {
    if (selectedId) {
      setSpaces(prev => prev.map(s => {
        if (s.id === selectedId) {
          const center = getCentroid(s.points);
          return {
            ...s,
            integrations: [
              ...s.integrations, 
              { 
                id: `i-${Date.now()}`, 
                category, 
                provider, 
                name, 
                status: 'active',
                meta,
                coordinates: center,
                signal: 'high',
                battery: 100
              }
            ]
          };
        }
        return s;
      }));
      setConnectModalOpen(false);
    }
  };

  const removeIntegration = (integrationId: string) => {
    if (selectedId) {
      setSpaces(prev => prev.map(s => {
        if (s.id === selectedId) {
          return {
            ...s,
            integrations: s.integrations.filter(i => i.id !== integrationId)
          };
        }
        return s;
      }));
    }
  };

  const selectedSpaceData = spaces.find(s => s.id === selectedId);
  const selectedZoneData = zones.find(z => z.id === selectedId);
  const parentSpaceData = selectedType === 'device' ? spaces.find(s => s.integrations.some(i => i.id === selectedId)) : null;
  const selectedDeviceData = parentSpaceData ? parentSpaceData.integrations.find(i => i.id === selectedId) : null;

  // --- Rendering Helpers ---
  const pointsToString = (points: Point[]) => points.map(p => `${p.x},${p.y}`).join(' ');

  const getSpaceColor = (space: Space) => {
    if (visMode === 'heatmap') {
      const temp = space.sensors?.temp || 21;
      if (temp > 23) return 'fill-red-500/80 stroke-red-600';
      if (temp > 22) return 'fill-orange-400/80 stroke-orange-500';
      if (temp < 20) return 'fill-blue-400/80 stroke-blue-500';
      return 'fill-emerald-400/80 stroke-emerald-500'; 
    }
    if (visMode === 'occupancy') {
      const occ = space.sensors?.occupancy || 0;
      const cap = space.capacity || 1;
      const ratio = occ / cap;
      if (ratio > 0.8) return 'fill-purple-500/80 stroke-purple-600';
      if (ratio > 0.4) return 'fill-blue-500/80 stroke-blue-600';
      if (ratio > 0) return 'fill-green-400/80 stroke-green-500';
      return 'fill-slate-100/80 stroke-slate-300';
    }
    if (selectedId === space.id) return 'stroke-teal-500 fill-teal-50/90 stroke-[0.5]';
    return 'stroke-slate-300 fill-white/90 hover:fill-teal-50/50 hover:stroke-teal-300 transition-colors';
  };

  const getIntegrationIcon = (category: Integration['category']) => {
    switch (category) {
      case 'access': return <Lock size={14} />;
      case 'video': return <Eye size={14} />;
      case 'sensor': return <Radio size={14} />;
      case 'app': return <Smartphone size={14} />;
      default: return <LinkIcon size={14} />;
    }
  };

  const getIntegrationColor = (category: Integration['category']) => {
    switch (category) {
      case 'access': return 'bg-indigo-500';
      case 'video': return 'bg-rose-500';
      case 'sensor': return 'bg-orange-500';
      case 'app': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  // --- Chart Config ---
  const renderChart = () => {
    const color = chartMetric === 'temp' ? '#f97316' : chartMetric === 'co2' ? '#06b6d4' : '#8b5cf6';
    const unit = chartMetric === 'temp' ? '°C' : chartMetric === 'co2' ? 'ppm' : 'pax';
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockHistoryData}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Area 
            type="monotone" 
            dataKey={chartMetric} 
            stroke={color} 
            strokeWidth={2} 
            fill="url(#chartGradient)" 
          />
          <RechartsTooltip 
            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(val: number) => [`${val.toFixed(0)}${unit}`, chartMetric.toUpperCase()]}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex h-full bg-slate-50/50 -m-6 overflow-hidden select-none">
      
      {/* ... Sidebar ... */}
      <div className={cn("bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 h-full transition-all duration-300", isSidebarOpen ? "w-72" : "w-14 items-center")}>
        <div className={cn("border-b border-slate-100 flex items-center flex-shrink-0 h-16", isSidebarOpen ? "justify-between px-4" : "justify-center px-0 w-full")}>
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Globe size={18} className="text-teal-600" />
              <span>Portfolio</span>
            </div>
          ) : (
            <Globe size={20} className="text-teal-600 cursor-pointer" onClick={() => setSidebarOpen(true)} />
          )}
          {isSidebarOpen && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
              <PanelLeftClose size={16} />
            </Button>
          )}
        </div>

        {isSidebarOpen ? (
          <>
            <div className="p-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input placeholder="Filter hierarchy..." className="pl-8 h-8 bg-slate-50 text-xs" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-2 pb-4 space-y-1">
                {hierarchy.map(building => (
                  <div key={building.id} className="select-none">
                    <div 
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors hover:bg-slate-50",
                        selectedId === building.id ? "bg-teal-50 text-teal-900" : "text-slate-700"
                      )}
                      onClick={() => {
                        toggleBuilding(building.id);
                        handleSelect(building.id, 'building');
                      }}
                    >
                      {expandedBuildings.includes(building.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <Building size={16} className="text-slate-400" />
                      <span className="text-sm font-medium truncate">{building.name}</span>
                    </div>

                    <AnimatePresence>
                      {expandedBuildings.includes(building.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden ml-4 pl-2 border-l border-slate-200 space-y-0.5 mt-1"
                        >
                          {building.floors.map(floor => (
                            <div 
                              key={floor.id}
                              className={cn(
                                "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors hover:bg-slate-50",
                                currentFloor === floor.id ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600"
                              )}
                              onClick={() => {
                                setCurrentFloor(floor.id);
                                handleSelect(floor.id, 'floor');
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Layers size={14} />
                                <span className="truncate">{floor.name}</span>
                              </div>
                              <Badge variant="secondary" className="h-5 px-1 text-[10px] bg-white border-slate-200 text-slate-500">
                                {floor.spacesCount}
                              </Badge>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
               <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2" size="sm">
                 <Plus size={14} /> Add Building
               </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 gap-4 flex-1">
             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg bg-slate-100 text-slate-500" onClick={() => setSidebarOpen(true)}>
               <Building size={20} />
             </Button>
             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-slate-400 hover:text-teal-600" onClick={() => setSidebarOpen(true)}>
               <Plus size={20} />
             </Button>
             <div className="flex-1" />
             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-slate-400 hover:text-slate-900" onClick={() => setSidebarOpen(true)}>
               <PanelLeftOpen size={20} />
             </Button>
          </div>
        )}
      </div>

      {/* ... Main Content ... */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* ... (Toolbar) ... */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 relative z-10">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  {hierarchy.flatMap(b => b.floors).find(f => f.id === currentFloor)?.name || 'Floor Plan'}
                </h1>
                <Badge variant="outline" className="text-teal-600 bg-teal-50 border-teal-200 gap-1.5 pl-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  Live Twin
                </Badge>
             </div>
             <div className="h-6 w-px bg-slate-200 mx-2" />
             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all", 
                    viewMode === 'map' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <MapIcon size={14} /> Map Builder
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all", 
                    viewMode === 'list' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <List size={14} /> List View
                </button>
             </div>
           </div>

           <div className="flex items-center gap-3">
              {/* Vis Mode Toggle */}
              {viewMode === 'map' && (
                <Select value={visMode} onValueChange={(v) => setVisMode(v as VisualizationMode)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-50 border-slate-200">
                    <div className="flex items-center gap-2">
                      {visMode === 'standard' && <Grid size={14} />}
                      {visMode === 'heatmap' && <ThermometerSun size={14} className="text-orange-500" />}
                      {visMode === 'occupancy' && <Activity size={14} className="text-purple-500" />}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard View</SelectItem>
                    <SelectItem value="heatmap">Heatmap (Temp)</SelectItem>
                    <SelectItem value="occupancy">Occupancy</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button variant="outline" size="sm" className="gap-2 text-slate-600">
                <Upload size={14} /> Update CAD
              </Button>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                <Save size={14} /> Save Changes
              </Button>
           </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 bg-slate-100 overflow-hidden relative flex">
           {/* ... (Floating Toolbar & Layers Control) ... */}
           {viewMode === 'map' && isToolbarMinimized && (
             <div className="absolute left-1/2 top-4 -translate-x-1/2 z-30 bg-white/90 backdrop-blur shadow-lg border border-slate-200 rounded-full p-1.5 flex gap-2 transform transition-all hover:scale-105 items-center cursor-pointer" onClick={() => setIsToolbarMinimized(false)}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500">
                  <ChevronDown size={18} />
                </Button>
                <span className="text-xs font-medium text-slate-600 pr-3">Tools</span>
             </div>
           )}

           {viewMode === 'map' && !isToolbarMinimized && (
             <div className="absolute left-1/2 top-4 -translate-x-1/2 z-30 bg-white/90 backdrop-blur shadow-lg border border-slate-200 rounded-full p-1.5 flex gap-2 transform transition-all items-center animate-in fade-in zoom-in-95 duration-200">
               <Button 
                 variant={activeTool === 'select' ? 'default' : 'ghost'} 
                 size="icon" 
                 className={cn("h-9 w-9 rounded-full transition-colors", activeTool === 'select' ? "bg-slate-900 hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
                 onClick={() => setActiveTool('select')}
                 title="Select & Edit (V)"
               >
                 <MousePointer2 size={18} />
               </Button>
               <Button 
                 variant={activeTool === 'pan' ? 'default' : 'ghost'} 
                 size="icon" 
                 className={cn("h-9 w-9 rounded-full transition-colors", activeTool === 'pan' ? "bg-slate-900 hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
                 onClick={() => setActiveTool('pan')}
                 title="Pan View (H)"
               >
                 <Hand size={18} />
               </Button>
               
               <div className="w-px h-6 bg-slate-300 mx-1" />
               
               {/* Zoom Controls */}
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-slate-600 hover:text-slate-900" 
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                >
                 <ZoomOut size={18} />
               </Button>
               <span className="text-xs font-medium w-8 text-center text-slate-600">{Math.round(zoom * 100)}%</span>
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-slate-600 hover:text-slate-900" 
                  onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                >
                 <ZoomIn size={18} />
               </Button>

               <div className="w-px h-6 bg-slate-300 mx-1" />
               
               {/* Snap Toggle */}
               <Button 
                 variant={snapEnabled ? 'secondary' : 'ghost'}
                 size="icon"
                 className={cn("h-9 w-9", snapEnabled && "bg-slate-200 text-teal-700")}
                 onClick={() => setSnapEnabled(!snapEnabled)}
                 title="Snap to Grid"
               >
                 <Magnet size={18} />
               </Button>

               <div className="w-px h-6 bg-slate-300 mx-1" />

               {/* Draw Target Toggle */}
               <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200 mx-1">
                  <button
                    onClick={() => setDrawTarget('space')}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1",
                      drawTarget === 'space' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Square size={12} /> Spaces
                  </button>
                  <button
                    onClick={() => setDrawTarget('zone')}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1",
                      drawTarget === 'zone' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Box size={12} /> Zones
                  </button>
               </div>

               <div className="w-px h-6 bg-slate-300 mx-1" />

               <Button 
                 variant={activeTool === 'draw-rect' ? 'default' : 'ghost'} 
                 size="icon" 
                 className={cn("h-9 w-9 rounded-full transition-colors", activeTool === 'draw-rect' ? "bg-slate-900 hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
                 onClick={() => setActiveTool('draw-rect')}
                 title={`Draw ${drawTarget === 'space' ? 'Space' : 'Zone'} Rectangle`}
               >
                 <Square size={18} />
               </Button>
               <Button 
                 variant={activeTool === 'draw-poly' ? 'default' : 'ghost'} 
                 size="icon" 
                 className={cn("h-9 w-9 rounded-full transition-colors", activeTool === 'draw-poly' ? "bg-slate-900 hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
                 onClick={() => setActiveTool('draw-poly')}
                 title={`Draw ${drawTarget === 'space' ? 'Space' : 'Zone'} Polygon`}
               >
                 <PenTool size={18} />
               </Button>
               {activeTool === 'draw-poly' && drawingPoints.length > 0 && (
                 <Button 
                    size="sm"
                    variant="default"
                    className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                    onClick={(e) => { e.stopPropagation(); finishPoly(); }}
                 >
                   Finish
                 </Button>
               )}

               <div className="w-px h-6 bg-slate-300 mx-1" />

               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-900" onClick={() => setIsToolbarMinimized(true)}>
                  <ChevronUp size={18} />
               </Button>
             </div>
           )}

           {/* Layers Control */}
           {viewMode === 'map' && (
             <div className={cn(
               "absolute right-4 bottom-4 z-30 bg-white/90 backdrop-blur shadow-lg border border-slate-200 rounded-lg transition-all duration-300 ease-in-out overflow-hidden",
               isLayersMinimized ? "w-auto h-auto p-1" : "w-48 p-3"
             )}>
               {isLayersMinimized ? (
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsLayersMinimized(false)}>
                   <Layers size={16} />
                 </Button>
               ) : (
                 <>
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                        <Layers size={14} /> Map Layers
                      </div>
                      <Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 text-slate-400 hover:text-slate-600" onClick={() => setIsLayersMinimized(true)}>
                        <Minus size={14} />
                      </Button>
                   </div>
                   
                   <div className="space-y-2 animate-in fade-in duration-200">
                     <div className="flex items-center justify-between">
                       <Label className="text-xs font-medium text-slate-700 flex items-center gap-2"><FileImage size={12} /> Floor Plan</Label>
                       <Switch className="scale-75 origin-right" checked={layers.floorplan} onCheckedChange={c => setLayers({...layers, floorplan: c})} />
                     </div>
                     <div className="flex items-center justify-between">
                       <Label className="text-xs font-medium text-slate-700 flex items-center gap-2"><Grid size={12} /> Grid</Label>
                       <Switch className="scale-75 origin-right" checked={layers.grid} onCheckedChange={c => setLayers({...layers, grid: c})} />
                     </div>
                     <div className="flex items-center justify-between">
                       <Label className="text-xs font-medium text-slate-700 flex items-center gap-2"><Box size={12} /> Zones</Label>
                       <Switch className="scale-75 origin-right" checked={layers.zones} onCheckedChange={c => setLayers({...layers, zones: c})} />
                     </div>
                     <div className="flex items-center justify-between">
                       <Label className="text-xs font-medium text-slate-700 flex items-center gap-2"><Square size={12} /> Spaces</Label>
                       <Switch className="scale-75 origin-right" checked={layers.spaces} onCheckedChange={c => setLayers({...layers, spaces: c})} />
                     </div>
                     <div className="flex items-center justify-between">
                       <Label className="text-xs font-medium text-slate-700 flex items-center gap-2"><Cpu size={12} /> Devices</Label>
                       <Switch className="scale-75 origin-right" checked={layers.devices} onCheckedChange={c => setLayers({...layers, devices: c})} />
                     </div>
                   </div>
                 </>
               )}
             </div>
           )}
           
           {/* Context Menu */}
           {contextMenu && (
             <div 
               className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-lg py-1 w-48 text-sm"
               style={{ left: contextMenu.x, top: contextMenu.y }}
               onClick={(e) => e.stopPropagation()}
             >
               <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                 <p className="font-bold text-slate-800">
                    {contextMenu.type === 'space' ? spaces.find(s => s.id === contextMenu.id)?.name : zones.find(z => z.id === contextMenu.id)?.name}
                 </p>
                 <p className="text-[10px] text-slate-500 uppercase">{contextMenu.type}</p>
               </div>
               <button 
                 onClick={() => handleContextMenuAction('duplicate')}
                 className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
               >
                 <Copy size={14} /> Duplicate
               </button>
               <button 
                 onClick={() => handleContextMenuAction('delete')}
                 className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
               >
                 <Trash2 size={14} /> Delete
               </button>
             </div>
           )}

           {viewMode === 'map' && (
             <div 
              ref={scrollContainerRef}
              className={cn(
                "w-full h-full overflow-auto p-8 relative transition-colors select-none", 
                (activeTool === 'draw-rect' || activeTool === 'draw-poly') && "cursor-crosshair", 
                activeTool === 'pan' && (isPanning ? "cursor-grabbing" : "cursor-grab"),
                activeTool === 'select' && "cursor-default"
              )}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={(e) => e.preventDefault()}
              tabIndex={0} // Allow keyboard focus for delete
             >
               {/* Canvas Area */}
               <div 
                 ref={mapRef}
                 className="bg-white rounded-lg shadow-sm border border-slate-200 relative mx-auto transition-all overflow-hidden origin-top-left" 
                 style={{ 
                   width: `${1000 * zoom}px`, 
                   height: `${700 * zoom}px` 
                 }}
               >
                  {/* 1. Background Floorplan */}
                  {layers.floorplan && floorPlanImage && (
                    <img src={floorPlanImage} alt="Floorplan" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none" />
                  )}

                  {/* 2. Grid Pattern */}
                  {(layers.grid || snapEnabled) && (
                    <div className="absolute inset-0 pointer-events-none opacity-[0.1]" 
                      style={{ 
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                        backgroundSize: `${gridSize}% ${gridSize}%`
                      }} 
                    />
                  )}
                  
                  {/* 3. SVG Layer for Shapes */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    {/* Zones Layer */}
                    {layers.zones && zones.map(zone => (
                      <polygon
                        key={zone.id}
                        points={pointsToString(zone.points)}
                        className={cn(
                          "stroke-2 transition-all pointer-events-auto cursor-pointer",
                          zone.color,
                          selectedId === zone.id ? "stroke-black opacity-60" : "hover:opacity-40 opacity-20"
                        )}
                        onMouseDown={(e) => handleShapeMouseDown(e, zone.id, 'zone')}
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}

                    {/* Spaces Layer */}
                    {layers.spaces && spaces.filter(s => s.floorId === currentFloor).map(space => (
                      <g key={space.id}>
                        <polygon
                          points={pointsToString(space.points)}
                          className={cn(
                             "stroke-[0.5] transition-all pointer-events-auto cursor-pointer vector-effect-non-scaling-stroke",
                             getSpaceColor(space)
                          )}
                          onMouseDown={(e) => handleShapeMouseDown(e, space.id, 'space')}
                          vectorEffect="non-scaling-stroke"
                        />
                        
                        {/* Connecting Lines for Devices if Selected */}
                        {layers.devices && selectedId === space.id && space.integrations.map(i => {
                           const center = getCentroid(space.points);
                           const devPos = i.coordinates || center;
                           return (
                             <line 
                               key={`link-${i.id}`}
                               x1={`${center.x}%`} y1={`${center.y}%`}
                               x2={`${devPos.x}%`} y2={`${devPos.y}%`}
                               className="stroke-slate-400 stroke-1 opacity-50 stroke-dashed vector-effect-non-scaling-stroke"
                               vectorEffect="non-scaling-stroke"
                             />
                           )
                        })}
                      </g>
                    ))}

                    {/* Drawing Preview */}
                    {activeTool === 'draw-poly' && drawingPoints.length > 0 && (
                      <polyline
                        points={pointsToString(drawingPoints)}
                        className={cn(
                          "fill-none stroke-1 vector-effect-non-scaling-stroke dashed",
                          drawTarget === 'space' ? "stroke-teal-500" : "stroke-indigo-500"
                        )}
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray="1 1"
                      />
                    )}
                  </svg>

                  {/* 4. HTML Overlay Layer (Labels, Gizmos, Handles, Devices) */}
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Space Labels */}
                    {layers.spaces && spaces.filter(s => s.floorId === currentFloor).map(space => {
                      const center = getCentroid(space.points);
                      return (
                        <div 
                          key={space.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-10"
                          style={{ left: `${center.x}%`, top: `${center.y}%` }}
                        >
                           <div className="text-center mix-blend-darken px-1">
                             <p 
                                className="font-bold text-slate-900 leading-none mb-0.5 truncate shadow-white text-shadow-sm"
                                style={{ fontSize: `${12 / zoom}px` }}
                              >
                                {space.name}
                             </p>
                             {visMode === 'standard' ? (
                               <p 
                                  className="text-slate-600 uppercase tracking-wide bg-white/30 rounded px-1 backdrop-blur-sm inline-block"
                                  style={{ fontSize: `${10 / zoom}px` }}
                                >
                                  {space.type}
                                </p>
                             ) : visMode === 'heatmap' ? (
                               <p className="font-bold text-slate-800 bg-white/50 rounded px-1" style={{ fontSize: `${10 / zoom}px` }}>{space.sensors?.temp}°C</p>
                             ) : (
                               <p className="font-bold text-slate-800 bg-white/50 rounded px-1" style={{ fontSize: `${10 / zoom}px` }}>{space.sensors?.occupancy} / {space.capacity}</p>
                             )}
                           </div>
                        </div>
                      );
                    })}
                    
                    {/* Device Icons (Draggable) */}
                    {layers.devices && spaces.filter(s => s.floorId === currentFloor).flatMap(space => 
                      space.integrations.map(device => {
                        const pos = device.coordinates || getCentroid(space.points);
                        const isSelected = selectedId === device.id;
                        
                        return (
                          <div
                            key={device.id}
                            className={cn(
                              "absolute w-6 h-6 rounded-full shadow-sm flex items-center justify-center text-white cursor-move pointer-events-auto hover:scale-110 transition-transform z-20",
                              getIntegrationColor(device.category),
                              isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : ""
                            )}
                            style={{ 
                              left: `calc(${pos.x}% - 12px)`, 
                              top: `calc(${pos.y}% - 12px)`,
                              transform: `scale(${1/Math.max(0.5, zoom)})` 
                            }}
                            onMouseDown={(e) => handleDeviceMouseDown(e, device.id, space.id, pos)}
                            title={`${device.name} (${device.provider})`}
                          >
                             {getIntegrationIcon(device.category)}
                          </div>
                        );
                      })
                    )}
                    
                    {/* 5. Edit Handles (Vertices) */}
                    {activeTool === 'select' && selectedId && selectedType !== 'device' && (
                       (() => {
                         const space = spaces.find(s => s.id === selectedId);
                         const zone = zones.find(z => z.id === selectedId);
                         const entity = space || zone;
                         
                         if (!entity) return null;
                         const isZone = !!zone;
                         
                         return entity.points.map((p, idx) => (
                           <div
                             key={idx}
                             className={cn(
                               "absolute border-2 rounded-full shadow-md cursor-move pointer-events-auto hover:scale-125 transition-transform z-50",
                               isZone ? "bg-white border-indigo-500" : "bg-white border-teal-600"
                             )}
                             style={{ 
                               left: `calc(${p.x}% - ${6 / zoom}px)`, 
                               top: `calc(${p.y}% - ${6 / zoom}px)`,
                               width: `${12 / zoom}px`,
                               height: `${12 / zoom}px`
                             }}
                             onMouseDown={(e) => handleVertexMouseDown(e, entity.id, idx)}
                           />
                         ));
                       })()
                    )}

                    {/* Drawing Points Preview */}
                    {activeTool === 'draw-poly' && drawingPoints.map((p, idx) => (
                       <div
                         key={idx}
                         className={cn(
                           "absolute rounded-full pointer-events-none",
                           drawTarget === 'space' ? "bg-teal-500" : "bg-indigo-500"
                         )}
                         style={{ 
                           left: `calc(${p.x}% - ${4 / zoom}px)`, 
                           top: `calc(${p.y}% - ${4 / zoom}px)`,
                           width: `${8 / zoom}px`,
                           height: `${8 / zoom}px`
                         }}
                       />
                    ))}
                  </div>

               </div>
             </div>
           )}

           {viewMode === 'list' && (
             <div className="flex-1 overflow-auto p-6 animate-in fade-in duration-300">
               <Card className="border-slate-200 shadow-sm">
                 <CardHeader className="px-6 py-4 border-b border-slate-100">
                   <div className="flex items-center justify-between">
                     <div>
                       <CardTitle>Space Inventory</CardTitle>
                       <CardDescription>Manage all physical assets and their configurations</CardDescription>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <Input placeholder="Search spaces..." className="pl-8 h-9 w-64 bg-slate-50 border-slate-200" />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 h-9 border-slate-200 text-slate-600">
                          <Filter size={14} /> Filter
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2 h-9 border-slate-200 text-slate-600">
                          <Download size={14} /> Export
                        </Button>
                     </div>
                   </div>
                 </CardHeader>
                 <div className="p-0">
                   <Table>
                     <TableHeader>
                       <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b-slate-100">
                         <TableHead className="w-[300px]">Name</TableHead>
                         <TableHead>Type</TableHead>
                         <TableHead>Floor</TableHead>
                         <TableHead>Capacity</TableHead>
                         <TableHead>Area</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead className="text-right">Actions</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {spaces.map((space) => (
                         <TableRow 
                           key={space.id} 
                           className="cursor-pointer hover:bg-slate-50 border-b-slate-100 transition-colors"
                           onClick={() => { setSelectedId(space.id); setSelectedType('space'); }}
                         >
                           <TableCell className="font-medium">
                             <div className="flex items-center gap-3">
                               <div className="h-10 w-16 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                                  {space.image ? (
                                    <img src={space.image} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                      <ImageIcon size={16} />
                                    </div>
                                  )}
                               </div>
                               <div>
                                 <div className="font-semibold text-slate-900">{space.name}</div>
                                 <div className="text-xs text-slate-500 font-mono">ID: {space.id}</div>
                               </div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <Badge variant="outline" className="font-normal bg-white text-slate-600 border-slate-200">
                               {space.type}
                             </Badge>
                           </TableCell>
                           <TableCell>
                             <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                               <Layers size={14} className="text-slate-400" />
                               {hierarchy.flatMap(b => b.floors).find(f => f.id === space.floorId)?.name || space.floorId}
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                               <Users size={14} className="text-slate-400" />
                               {space.capacity} pax
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                               <Maximize2 size={14} className="text-slate-400" />
                               {space.area} m²
                             </div>
                           </TableCell>
                           <TableCell>
                             <Badge 
                               className={cn(
                                 "font-medium border-0 px-2 py-0.5",
                                 space.status === 'available' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                                 space.status === 'occupied' ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                                 "bg-slate-100 text-slate-700 hover:bg-slate-200"
                               )}
                             >
                               {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                             </Badge>
                           </TableCell>
                           <TableCell className="text-right">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                               <MoreHorizontal size={16} />
                             </Button>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
                 <CardFooter className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                   <div className="text-xs text-slate-500">
                     Showing <strong>{spaces.length}</strong> spaces
                   </div>
                   <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" disabled className="h-8 text-xs">Previous</Button>
                     <Button variant="outline" size="sm" disabled className="h-8 text-xs">Next</Button>
                   </div>
                 </CardFooter>
               </Card>
             </div>
           )}

      {/* 3. Right Sidebar: Configuration & Properties */}
      <AnimatePresence>
        {(selectedType === 'space' && selectedSpaceData) || (selectedType === 'zone' && selectedZoneData) || (selectedType === 'device' && selectedDeviceData) ? (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-slate-200 bg-white flex flex-col flex-shrink-0 shadow-xl z-20 h-full"
          >
            {selectedType === 'space' && selectedSpaceData ? (
              <>
                {/* Space Panel Header */}
                <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50/50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-slate-400" />
                    <span className="font-semibold text-slate-900">Space Config</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedId(null); setSelectedType(null); }}>
                    <X size={18} />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    {/* ... Space Header ... */}
                    <div className="mb-6">
                      <div className="h-40 w-full rounded-lg overflow-hidden mb-4 relative group bg-slate-100">
                        {selectedSpaceData.image ? (
                          <ImageWithFallback 
                            src={selectedSpaceData.image} 
                            alt={selectedSpaceData.name} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/50 rounded text-white px-2 py-0.5 text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
                          <ImageIcon size={12} /> 5
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedSpaceData.name}</h2>
                    </div>
                    
                    {/* ... Tabs ... */}
                    <Tabs defaultValue="config" className="w-full">
                       <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="config">Config</TabsTrigger>
                        <TabsTrigger value="booking">Booking</TabsTrigger>
                        <TabsTrigger value="connect">Connect</TabsTrigger>
                      </TabsList>
                      
                      {/* --- CONFIG TAB --- */}
                      <TabsContent value="config" className="space-y-6">
                         <div className="space-y-4">
                          {/* Identity */}
                          <div className="space-y-2">
                            <Label>Space Name</Label>
                            <Input 
                              value={selectedSpaceData.name} 
                              onChange={(e) => updateSelectedSpace({ name: e.target.value })}
                            />
                          </div>
                          
                          {/* Type & Cap */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label>Type</Label>
                               <Select 
                                 value={selectedSpaceData.type}
                                 onValueChange={(v: any) => updateSelectedSpace({ type: v })}
                               >
                                 <SelectTrigger><SelectValue /></SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                                   <SelectItem value="Huddle">Huddle</SelectItem>
                                   <SelectItem value="Desk Area">Desk Area</SelectItem>
                                   <SelectItem value="Social">Social Area</SelectItem>
                                 </SelectContent>
                               </Select>
                            </div>
                            <div className="space-y-2">
                               <Label>Capacity</Label>
                               <div className="relative">
                                 <Input 
                                   type="number" 
                                   value={selectedSpaceData.capacity} 
                                   onChange={(e) => updateSelectedSpace({ capacity: parseInt(e.target.value) })}
                                   className="pl-8" 
                                 />
                                 <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                               </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Media & Files */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Documentation</Label>
                              <Button variant="ghost" size="sm" className="h-6 gap-1 text-slate-500"><Plus size={12}/> Add</Button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <div className="w-8 h-8 bg-red-50 text-red-500 flex items-center justify-center rounded">
                                  <FileText size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-900 truncate">Fire Safety Protocol.pdf</p>
                                  <p className="text-[10px] text-slate-500">1.2 MB • Updated 2d ago</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><Download size={14}/></Button>
                              </div>
                              <div className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <div className="w-8 h-8 bg-blue-50 text-blue-500 flex items-center justify-center rounded">
                                  <Monitor size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-900 truncate">AV System Manual.pdf</p>
                                  <p className="text-[10px] text-slate-500">4.5 MB • Updated 1mo ago</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><Download size={14}/></Button>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Attributes */}
                          <div className="space-y-3">
                             <Label>Environmental Targets</Label>
                             <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                  <span className="text-xs text-slate-500">Temp</span>
                                  <div className="relative">
                                    <Input 
                                      value={selectedSpaceData.environmentalTargets?.temp} 
                                      onChange={(e) => updateSelectedSpace({ environmentalTargets: { ...selectedSpaceData.environmentalTargets!, temp: parseInt(e.target.value) }})}
                                      className="pl-6 h-8 text-xs" 
                                    />
                                    <span className="absolute left-1.5 top-2 text-[10px] text-slate-400">°C</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-xs text-slate-500">Max CO2</span>
                                  <div className="relative">
                                    <Input 
                                      value={selectedSpaceData.environmentalTargets?.co2}
                                      onChange={(e) => updateSelectedSpace({ environmentalTargets: { ...selectedSpaceData.environmentalTargets!, co2: parseInt(e.target.value) }})}
                                      className="pl-1 h-8 text-xs" 
                                    />
                                    <span className="absolute right-1.5 top-2 text-[10px] text-slate-400">ppm</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-xs text-slate-500">Lux</span>
                                  <div className="relative">
                                    <Input 
                                      value={selectedSpaceData.environmentalTargets?.lux}
                                      onChange={(e) => updateSelectedSpace({ environmentalTargets: { ...selectedSpaceData.environmentalTargets!, lux: parseInt(e.target.value) }})}
                                      className="pl-1 h-8 text-xs" 
                                    />
                                    <span className="absolute right-1.5 top-2 text-[10px] text-slate-400">lx</span>
                                  </div>
                                </div>
                             </div>
                          </div>

                          {/* Layout Configurations */}
                          <div className="space-y-3">
                            <Label>Seating Layouts</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div 
                                className={cn("p-2 border rounded-md flex items-center justify-between cursor-pointer", selectedSpaceData.seatingLayout === 'boardroom' ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500" : "bg-slate-50 hover:bg-slate-100")}
                                onClick={() => updateSelectedSpace({ seatingLayout: 'boardroom' })}
                              >
                                 <div className="flex items-center gap-2">
                                   <Layout size={14} className="text-slate-500"/>
                                   <span className="text-xs font-medium">Boardroom</span>
                                 </div>
                                 <Badge variant={selectedSpaceData.seatingLayout === 'boardroom' ? 'default' : 'secondary'}>20</Badge>
                              </div>
                              <div 
                                className={cn("p-2 border rounded-md flex items-center justify-between cursor-pointer", selectedSpaceData.seatingLayout === 'classroom' ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500" : "bg-slate-50 hover:bg-slate-100")}
                                onClick={() => updateSelectedSpace({ seatingLayout: 'classroom' })}
                              >
                                 <div className="flex items-center gap-2">
                                   <Grid size={14} className="text-slate-500"/>
                                   <span className="text-xs font-medium">Classroom</span>
                                 </div>
                                 <Badge variant={selectedSpaceData.seatingLayout === 'classroom' ? 'default' : 'secondary'}>12</Badge>
                              </div>
                            </div>
                          </div>

                          <Separator />
                          
                          {/* Digital Signage */}
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className="h-12 w-12 bg-white border rounded-md flex items-center justify-center">
                                 <QrCode size={24} className="text-slate-900" />
                               </div>
                               <div>
                                 <p className="text-sm font-medium">Room QR Code</p>
                                 <p className="text-[10px] text-slate-500">For digital signage & app check-in</p>
                               </div>
                             </div>
                             <Button variant="ghost" size="icon"><Download size={16}/></Button>
                          </div>
                          
                          <Separator />

                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <Wrench size={16} className="text-slate-500" />
                               <Label>Maintenance Mode</Label>
                             </div>
                             <Switch 
                               checked={selectedSpaceData.maintenanceMode} 
                               onCheckedChange={(c) => updateSelectedSpace({ maintenanceMode: c })}
                             />
                          </div>
                         </div>
                      </TabsContent>

                      {/* --- BOOKING TAB --- */}
                      <TabsContent value="booking" className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-500" />
                                <span className="font-medium text-sm">Allow Booking</span>
                              </div>
                              <Switch 
                                checked={selectedSpaceData.allowBooking} 
                                onCheckedChange={(c) => updateSelectedSpace({ allowBooking: c })}
                              />
                           </div>
                           <Separator />
                           <div className="space-y-3">
                              <Label className="text-xs">Booking Strategy</Label>
                              <Select 
                                value={selectedSpaceData.bookingStrategy}
                                onValueChange={(v: any) => updateSelectedSpace({ bookingStrategy: v })}
                                disabled={!selectedSpaceData.allowBooking}
                              >
                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="instant">Instant Book</SelectItem>
                                  <SelectItem value="request">Request Approval</SelectItem>
                                  <SelectItem value="restricted">Restricted Access</SelectItem>
                                </SelectContent>
                              </Select>
                           </div>
                        </div>
                        
                        {/* Schedule Preview */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between mb-2">
                             <Label>Today's Utilization</Label>
                             <span className="text-xs font-bold text-emerald-600">65%</span>
                          </div>
                          {/* Utilization Bar */}
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-slate-300 w-[20%]" title="Past" />
                            <div className="h-full bg-emerald-500 w-[45%]" title="Booked" />
                            <div className="h-full bg-transparent w-[35%]" title="Available" />
                          </div>

                          <div className="space-y-2 mt-4">
                            {[
                              { time: '09:00 - 10:00', title: 'Weekly Sync', user: 'Sarah J.' },
                              { time: '10:30 - 11:30', title: 'Client Review', user: 'Mike T.' },
                              { time: '14:00 - 15:00', title: 'Design Huddle', user: 'Alex R.' }
                            ].map((mtg, i) => (
                              <div key={i} className="flex items-center gap-3 p-2 border rounded-md text-xs hover:bg-slate-50 cursor-pointer transition-colors">
                                <div className="w-1 h-8 bg-teal-500 rounded-full" />
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{mtg.title}</p>
                                  <p className="text-slate-500">{mtg.time} • {mtg.user}</p>
                                </div>
                                <ChevronRight size={14} className="text-slate-300" />
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 mt-2">View Full Calendar</Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                           {/* Financials */}
                           <div className="space-y-2">
                              <Label>Cost & Policy</Label>
                              <div className="flex gap-3">
                                 <div className="relative flex-1">
                                   <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                   <Input 
                                     value={selectedSpaceData.hourlyRate} 
                                     onChange={(e) => updateSelectedSpace({ hourlyRate: parseInt(e.target.value) })}
                                     className="pl-8" 
                                   />
                                   <span className="absolute right-3 top-2.5 text-xs text-slate-400">/hr</span>
                                 </div>
                                 <div className="relative flex-1">
                                   <Input 
                                     value={selectedSpaceData.costCenter} 
                                     onChange={(e) => updateSelectedSpace({ costCenter: e.target.value })}
                                     placeholder="Cost Center" 
                                   />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <Label>Access Control</Label>
                              <Select 
                                value={selectedSpaceData.accessLevel}
                                onValueChange={(v: any) => updateSelectedSpace({ accessLevel: v })}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Employees</SelectItem>
                                  <SelectItem value="engineering">Engineering Dept</SelectItem>
                                  <SelectItem value="executive">Executive Only</SelectItem>
                                </SelectContent>
                              </Select>
                           </div>

                           {/* Services */}
                           <div className="space-y-3">
                              <Label>Hospitality & Services</Label>
                              <div className="grid grid-cols-2 gap-2">
                                 <div 
                                   className={cn("flex items-center gap-2 p-2 border rounded-md cursor-pointer", selectedSpaceData.services?.catering ? "bg-amber-50 border-amber-500" : "hover:bg-slate-50")}
                                   onClick={() => updateSelectedSpace({ services: { ...selectedSpaceData.services!, catering: !selectedSpaceData.services?.catering } })}
                                 >
                                    <Coffee size={14} className={selectedSpaceData.services?.catering ? "text-amber-600" : "text-slate-500"} />
                                    <span className="text-xs font-medium">Catering</span>
                                 </div>
                                 <div 
                                   className={cn("flex items-center gap-2 p-2 border rounded-md cursor-pointer", selectedSpaceData.services?.cleaning ? "bg-blue-50 border-blue-500" : "hover:bg-slate-50")}
                                   onClick={() => updateSelectedSpace({ services: { ...selectedSpaceData.services!, cleaning: !selectedSpaceData.services?.cleaning } })}
                                 >
                                    <Sparkles size={14} className={selectedSpaceData.services?.cleaning ? "text-blue-600" : "text-slate-500"} />
                                    <span className="text-xs font-medium">Cleaning</span>
                                 </div>
                                 <div 
                                   className={cn("flex items-center gap-2 p-2 border rounded-md cursor-pointer", selectedSpaceData.services?.itSupport ? "bg-indigo-50 border-indigo-500" : "hover:bg-slate-50")}
                                   onClick={() => updateSelectedSpace({ services: { ...selectedSpaceData.services!, itSupport: !selectedSpaceData.services?.itSupport } })}
                                 >
                                    <Headphones size={14} className={selectedSpaceData.services?.itSupport ? "text-indigo-600" : "text-slate-500"} />
                                    <span className="text-xs font-medium">IT Support</span>
                                 </div>
                                 <div 
                                   className={cn("flex items-center gap-2 p-2 border rounded-md cursor-pointer", selectedSpaceData.services?.lunch ? "bg-emerald-50 border-emerald-500" : "hover:bg-slate-50")}
                                   onClick={() => updateSelectedSpace({ services: { ...selectedSpaceData.services!, lunch: !selectedSpaceData.services?.lunch } })}
                                 >
                                    <Utensils size={14} className={selectedSpaceData.services?.lunch ? "text-emerald-600" : "text-slate-500"} />
                                    <span className="text-xs font-medium">Lunch</span>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <Label>Booking Constraints</Label>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <span className="text-xs text-slate-500">Min Duration</span>
                                    <div className="relative">
                                      <Input 
                                        value={selectedSpaceData.minDuration} 
                                        onChange={(e) => updateSelectedSpace({ minDuration: parseInt(e.target.value) })}
                                        className="pr-8" 
                                      />
                                      <span className="absolute right-2 top-2.5 text-xs text-slate-400">m</span>
                                    </div>
                                 </div>
                                 <div className="space-y-1">
                                    <span className="text-xs text-slate-500">Max Duration</span>
                                    <div className="relative">
                                      <Input 
                                        value={selectedSpaceData.maxDuration} 
                                        onChange={(e) => updateSelectedSpace({ maxDuration: parseInt(e.target.value) })}
                                        className="pr-8" 
                                      />
                                      <span className="absolute right-2 top-2.5 text-xs text-slate-400">m</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <Label>Rules</Label>
                              <div className="space-y-2">
                                 <div className="flex items-center justify-between p-2 border rounded-md">
                                    <span className="text-sm text-slate-600">Require Check-in</span>
                                    <Switch 
                                      checked={selectedSpaceData.requireCheckIn} 
                                      onCheckedChange={(c) => updateSelectedSpace({ requireCheckIn: c })}
                                    />
                                 </div>
                                 <div className="flex items-center justify-between p-2 border rounded-md">
                                    <span className="text-sm text-slate-600">Buffer Time</span>
                                    <span className="text-xs text-slate-400">{selectedSpaceData.bufferTime}m</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </TabsContent>

                      {/* --- CONNECT TAB --- */}
                      <TabsContent value="connect">
                         <div className="space-y-4">
                           {/* Live Telemetry Chart */}
                           {selectedSpaceData.integrations.some(i => i.category === 'sensor') && (
                             <Card className="shadow-none border-slate-200">
                               <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
                                 <CardTitle className="text-xs font-bold text-slate-500 uppercase">Live Telemetry</CardTitle>
                                 <div className="flex bg-slate-100 p-0.5 rounded-md">
                                   <button onClick={() => setChartMetric('temp')} className={cn("p-1 rounded text-[10px] font-medium transition-all", chartMetric === 'temp' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}>Temp</button>
                                   <button onClick={() => setChartMetric('co2')} className={cn("p-1 rounded text-[10px] font-medium transition-all", chartMetric === 'co2' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}>CO2</button>
                                   <button onClick={() => setChartMetric('occupancy')} className={cn("p-1 rounded text-[10px] font-medium transition-all", chartMetric === 'occupancy' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}>Occ</button>
                                 </div>
                               </CardHeader>
                               <CardContent className="p-3 h-40">
                                 {renderChart()}
                               </CardContent>
                             </Card>
                           )}

                           {/* Integration List */}
                           <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Connected Devices</h4>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConnectModalOpen(true)}>+ Add</Button>
                              </div>
                              
                              {selectedSpaceData.integrations?.length === 0 && (
                                <div className="text-center py-8 text-sm text-slate-400 border border-dashed rounded-lg">
                                  No devices linked
                                </div>
                              )}
                              {selectedSpaceData.integrations?.map(i => (
                                <div key={i.id} className="p-2 border rounded-md flex justify-between items-center bg-slate-50 cursor-pointer hover:border-teal-300 group" onClick={() => { setSelectedId(i.id); setSelectedType('device'); }}>
                                  <div className="flex items-center gap-2">
                                     <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]", getIntegrationColor(i.category))}>
                                        {getIntegrationIcon(i.category)}
                                     </div>
                                     <div>
                                       <p className="text-sm font-medium">{i.name}</p>
                                       <div className="flex items-center gap-2">
                                          <p className="text-[10px] text-slate-500">{i.provider}</p>
                                          {i.signal && (
                                            <span className="flex items-center text-[10px] text-slate-400 gap-0.5">
                                              <Signal size={10} className={cn(
                                                i.signal === 'high' ? 'text-emerald-500' : 
                                                i.signal === 'medium' ? 'text-amber-500' : 'text-red-500'
                                              )} />
                                            </span>
                                          )}
                                          {i.battery && (
                                             <span className="flex items-center text-[10px] text-slate-400 gap-0.5">
                                              <Battery size={10} className={cn(
                                                i.battery > 20 ? 'text-slate-400' : 'text-red-500'
                                              )} /> {i.battery}%
                                            </span>
                                          )}
                                       </div>
                                     </div>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeIntegration(i.id); }}><Trash2 size={14} /></Button>
                                </div>
                              ))}
                           </div>

                           <Separator />

                           {/* Experience Automations (Rules Engine) */}
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                  <Zap size={12} className="text-amber-500" /> Automations
                                </h4>
                                <Button variant="ghost" size="sm" className="h-6 gap-1 text-slate-500"><Plus size={12}/></Button>
                              </div>
                              
                              <div className="space-y-2">
                                 {/* Rule 1 */}
                                 <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 relative group">
                                    <div className="flex items-center gap-2 mb-2">
                                       <div className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">IF</div>
                                       <span className="text-xs text-slate-700 font-medium">Occupancy = 0</span>
                                       <span className="text-xs text-slate-400">for 15m</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <div className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">THEN</div>
                                       <span className="text-xs text-slate-700 font-medium">Release Booking</span>
                                    </div>
                                    <Switch className="absolute right-3 top-3 scale-75" disabled={!selectedSpaceData.integrations.some(i => i.category === 'sensor')} />
                                 </div>

                                 {/* Rule 2 */}
                                 <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 relative group">
                                    <div className="flex items-center gap-2 mb-2">
                                       <div className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">IF</div>
                                       <span className="text-xs text-slate-700 font-medium">Meeting Ends</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <div className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">THEN</div>
                                       <span className="text-xs text-slate-700 font-medium">Set AC to Eco Mode</span>
                                    </div>
                                    <Switch className="absolute right-3 top-3 scale-75" disabled={!selectedSpaceData.integrations.some(i => i.category === 'sensor')} />
                                 </div>
                              </div>
                           </div>

                           {/* Event Stream */}
                           <div className="space-y-3 pt-2">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <History size={12} className="text-slate-500" /> Recent Events
                              </h4>
                              <div className="relative pl-4 border-l border-slate-200 space-y-4">
                                {mockEvents.map(event => (
                                  <div key={event.id} className="relative">
                                    <div className={cn("absolute -left-[21px] bg-white border border-slate-200 rounded-full p-0.5", event.color)}>
                                      <event.icon size={10} />
                                    </div>
                                    <div className="text-xs">
                                      <p className="font-medium text-slate-700">{event.message}</p>
                                      <p className="text-[10px] text-slate-400">{event.time}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                           </div>

                         </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </>
            ) : selectedType === 'zone' && selectedZoneData ? (
              <>
                 {/* Zone Panel Header */}
                 <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-indigo-50/50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Box size={18} className="text-indigo-600" />
                    <span className="font-semibold text-slate-900">Zone Config</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedId(null); setSelectedType(null); }}>
                    <X size={18} />
                  </Button>
                </div>
                
                <div className="p-6 space-y-6">
                   <div className="space-y-2">
                      <Label>Zone Name</Label>
                      <Input defaultValue={selectedZoneData.name} />
                   </div>
                   
                   <div className="space-y-2">
                      <Label>Color Theme</Label>
                      <div className="grid grid-cols-4 gap-2">
                         {['indigo', 'orange', 'emerald', 'rose'].map(c => (
                           <div key={c} className={cn("h-8 rounded cursor-pointer border-2 border-transparent hover:border-slate-400", `bg-${c}-500`)} />
                         ))}
                      </div>
                   </div>
                   
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="text-sm font-semibold mb-2">Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-xs text-slate-500">Spaces</p>
                            <p className="text-lg font-bold text-slate-900">
                               {spaces.filter(s => true /* logic to check if inside zone */).length}
                            </p>
                         </div>
                         <div>
                            <p className="text-xs text-slate-500">Area</p>
                            <p className="text-lg font-bold text-slate-900">120m²</p>
                         </div>
                      </div>
                   </div>
                </div>
              </>
            ) : selectedType === 'device' && selectedDeviceData && parentSpaceData ? (
              <>
                 {/* Device Panel Header */}
                 <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white", getIntegrationColor(selectedDeviceData.category))}>
                       {getIntegrationIcon(selectedDeviceData.category)}
                    </div>
                    <span className="font-semibold text-slate-900">Device Config</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedId(null); setSelectedType(null); }}>
                    <X size={18} />
                  </Button>
                </div>
                
                <div className="p-6 space-y-6">
                   <div className="space-y-2">
                      <Label>Located In</Label>
                      <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md text-sm">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-900">{parentSpaceData.name}</span>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label>Device Name</Label>
                      <Input defaultValue={selectedDeviceData.name} />
                   </div>
                   <div className="space-y-2">
                      <Label>Provider / System</Label>
                      <Input defaultValue={selectedDeviceData.provider} disabled />
                   </div>
                   <div className="space-y-2">
                      <Label>Network Status</Label>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center gap-2">
                            <Signal size={14} className="text-emerald-500" />
                            <div className="text-xs">
                              <p className="font-medium">Signal</p>
                              <p className="text-slate-500">Excellent</p>
                            </div>
                         </div>
                         <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center gap-2">
                            <Battery size={14} className="text-slate-700" />
                            <div className="text-xs">
                              <p className="font-medium">Battery</p>
                              <p className="text-slate-500">98%</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label>Coordinates</Label>
                      <div className="grid grid-cols-2 gap-2">
                         <Input value={selectedDeviceData.coordinates?.x.toFixed(1)} disabled />
                         <Input value={selectedDeviceData.coordinates?.y.toFixed(1)} disabled />
                      </div>
                      <p className="text-xs text-slate-400">Drag device on map to reposition</p>
                   </div>
                   
                   {/* Device Actions */}
                   <div className="space-y-3 pt-4 border-t border-slate-200">
                      <Label>Device Actions</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="flex flex-col h-16 gap-1 items-center justify-center hover:bg-slate-50 hover:text-teal-600">
                          <Activity size={16} />
                          <span className="text-[10px]">Ping</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex flex-col h-16 gap-1 items-center justify-center hover:bg-slate-50 hover:text-orange-600">
                          <RotateCcw size={16} />
                          <span className="text-[10px]">Reboot</span>
                        </Button>
                         <Button variant="outline" size="sm" className="flex flex-col h-16 gap-1 items-center justify-center hover:bg-slate-50 hover:text-blue-600">
                          <RefreshCcw size={16} />
                          <span className="text-[10px]">Update</span>
                        </Button>
                      </div>
                   </div>

                   <Button variant="destructive" className="w-full gap-2 mt-4" onClick={() => handleDelete(selectedDeviceData.id, 'device')}>
                      <Trash2 size={14} /> Unlink Device
                   </Button>
                </div>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
      </div>
      </div>

      {/* ... (Add Integration Modal) ... */}
      <Dialog open={isConnectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Link Integration</DialogTitle>
            <DialogDescription>
              Connect external systems to <strong>{selectedSpaceData?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex h-[400px] border border-slate-200 rounded-lg overflow-hidden mt-2">
            {/* Categories */}
            <div className="w-48 bg-slate-50 border-r border-slate-200 p-2 space-y-1">
               <button 
                onClick={() => setIntegrationTab('all')} 
                className={cn("w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2", integrationTab === 'all' ? "bg-white shadow-sm text-teal-700" : "text-slate-600 hover:bg-slate-100")}
              >
                 <Grid size={14} /> All Systems
               </button>
               <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase">Security</div>
               <button 
                onClick={() => setIntegrationTab('access')} 
                className={cn("w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2", integrationTab === 'access' ? "bg-white shadow-sm text-teal-700" : "text-slate-600 hover:bg-slate-100")}
              >
                 <Lock size={14} /> Access Control
               </button>
               <button 
                onClick={() => setIntegrationTab('video')} 
                className={cn("w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2", integrationTab === 'video' ? "bg-white shadow-sm text-teal-700" : "text-slate-600 hover:bg-slate-100")}
              >
                 <Eye size={14} /> CCTV & Video
               </button>
               <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase">Smart Building</div>
               <button 
                onClick={() => setIntegrationTab('sensor')} 
                className={cn("w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2", integrationTab === 'sensor' ? "bg-white shadow-sm text-teal-700" : "text-slate-600 hover:bg-slate-100")}
              >
                 <Radio size={14} /> IoT Sensors
               </button>
               <button 
                onClick={() => setIntegrationTab('app')} 
                className={cn("w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2", integrationTab === 'app' ? "bg-white shadow-sm text-teal-700" : "text-slate-600 hover:bg-slate-100")}
              >
                 <Smartphone size={14} /> Apps & Calendar
               </button>
            </div>

            {/* List */}
            <div className="flex-1 flex flex-col">
               <div className="p-3 border-b border-slate-100 bg-white">
                 <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <Input placeholder="Search for groups, devices, or feeds..." className="pl-8 h-8 text-xs bg-slate-50" />
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {/* Mock Items based on Tab */}
                  {(integrationTab === 'all' || integrationTab === 'access') && (
                    <div className="p-2 hover:bg-slate-50 rounded-md cursor-pointer border border-transparent hover:border-slate-200 group" onClick={() => addIntegration('access', 'HID', 'Engineering Access Group', 'Level 3 Clearance')}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Shield size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Engineering Access Group</p>
                            <p className="text-xs text-slate-500">HID Global • 24 Members</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Connect</Button>
                      </div>
                    </div>
                  )}
                  
                  {(integrationTab === 'all' || integrationTab === 'video') && (
                    <div className="p-2 hover:bg-slate-50 rounded-md cursor-pointer border border-transparent hover:border-slate-200 group" onClick={() => addIntegration('video', 'Verkada', 'East Corridor Cam 04', 'Live Feed')}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Eye size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">East Corridor Cam 04</p>
                            <p className="text-xs text-slate-500">Verkada Command • Recording</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Connect</Button>
                      </div>
                    </div>
                  )}

                  {(integrationTab === 'all' || integrationTab === 'sensor') && (
                     <div className="p-2 hover:bg-slate-50 rounded-md cursor-pointer border border-transparent hover:border-slate-200 group" onClick={() => addIntegration('sensor', 'Milesight', 'Zone Occupancy Grid', '8 Sensors Linked')}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Radio size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Zone Occupancy Grid</p>
                            <p className="text-xs text-slate-500">Milesight • 8 Devices</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Connect</Button>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
