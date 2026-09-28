import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Thermometer, 
  Sun, 
  Lightbulb, 
  Wind, 
  Zap, 
  Activity, 
  Power, 
  TrendingUp,
  TrendingDown,
  Users,
  Monitor,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Globe,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Snowflake,
  Flame,
  Droplets,
  Fan,
  Tv,
  Volume2,
  Radio,
  MessageSquare,
  Bell,
  Target,
  ArrowRight,
  BarChart3,
  Layers,
  Save,
  Play,
  Pause,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Cpu,
  Database,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Timer,
  Repeat,
  Maximize2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from '../ui/scroll-area';

// Mock Data Structures
interface BuildingData {
  id: string;
  name: string;
  location: string;
  floors: number;
  zones: number;
  occupancy: number;
  capacity: number;
  status: 'optimal' | 'warning' | 'critical';
  stats: {
    avgTemp: number;
    avgHumidity: number;
    co2Level: number;
    aqi: number;
    energyUsage: number; // kWh
    lightingLoad: number; // %
    hvacLoad: number; // %
  };
}

interface ZoneData {
  id: string;
  name: string;
  buildingId: string;
  floor: number;
  type: 'office' | 'common' | 'conference' | 'lobby' | 'lab';
  occupancy: number;
  capacity: number;
  temp: number;
  targetTemp: number;
  humidity: number;
  co2: number;
  lighting: number; // %
  colorTemp: number; // Kelvin
  blinds: number; // %
  hvacMode: 'auto' | 'cool' | 'heat' | 'fan' | 'off';
  fanSpeed: number; // 0-2
  audioEnabled: boolean;
  audioVolume: number;
  currentPlaylist?: string;
  signageContent?: string;
  doorMessage?: string;
  status: 'optimal' | 'warning' | 'alert';
  devices: {
    lights: number;
    sensors: number;
    displays: number;
    hvac: number;
    speakers: number;
    doorDisplays: number;
  };
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: 'schedule' | 'sensor' | 'occupancy' | 'event';
    condition: string;
    value?: string | number;
  };
  actions: {
    type: 'hvac' | 'lighting' | 'signage' | 'notification';
    target: string;
    value: string | number;
  }[];
  zones: string[];
  lastRun?: Date;
  runCount: number;
}

interface SignageContent {
  id: string;
  name: string;
  type: 'template' | 'media' | 'playlist';
  thumbnail?: string;
}

// Mock Buildings
const MOCK_BUILDINGS: BuildingData[] = [
  {
    id: 'b1',
    name: 'Global HQ',
    location: 'New York, NY',
    floors: 12,
    zones: 48,
    occupancy: 847,
    capacity: 1200,
    status: 'optimal',
    stats: {
      avgTemp: 22.3,
      avgHumidity: 42,
      co2Level: 425,
      aqi: 95,
      energyUsage: 3847,
      lightingLoad: 68,
      hvacLoad: 72
    }
  },
  {
    id: 'b2',
    name: 'Innovation Center',
    location: 'San Francisco, CA',
    floors: 8,
    zones: 32,
    occupancy: 412,
    capacity: 600,
    status: 'warning',
    stats: {
      avgTemp: 23.8,
      avgHumidity: 38,
      co2Level: 685,
      aqi: 78,
      energyUsage: 2134,
      lightingLoad: 55,
      hvacLoad: 84
    }
  },
  {
    id: 'b3',
    name: 'Research Lab',
    location: 'Boston, MA',
    floors: 6,
    zones: 24,
    occupancy: 203,
    capacity: 400,
    status: 'optimal',
    stats: {
      avgTemp: 21.5,
      avgHumidity: 45,
      co2Level: 390,
      aqi: 98,
      energyUsage: 1876,
      lightingLoad: 72,
      hvacLoad: 65
    }
  }
];

// Mock Zones
const MOCK_ZONES: ZoneData[] = [
  {
    id: 'z1',
    name: 'Executive Wing - L12',
    buildingId: 'b1',
    floor: 12,
    type: 'office',
    occupancy: 24,
    capacity: 30,
    temp: 22.1,
    targetTemp: 22.0,
    humidity: 43,
    co2: 410,
    lighting: 75,
    colorTemp: 4000,
    blinds: 60,
    hvacMode: 'auto',
    fanSpeed: 1,
    audioEnabled: false,
    audioVolume: 0,
    currentPlaylist: 'Deep Focus',
    signageContent: 'Welcome Executive',
    doorMessage: '',
    status: 'optimal',
    devices: { lights: 45, sensors: 12, displays: 8, hvac: 4, speakers: 8, doorDisplays: 6 }
  },
  {
    id: 'z2',
    name: 'Open Workspace - L8',
    buildingId: 'b1',
    floor: 8,
    type: 'office',
    occupancy: 156,
    capacity: 180,
    temp: 22.8,
    targetTemp: 22.5,
    humidity: 41,
    co2: 520,
    lighting: 68,
    colorTemp: 4500,
    blinds: 80,
    hvacMode: 'cool',
    fanSpeed: 2,
    audioEnabled: true,
    audioVolume: 35,
    currentPlaylist: 'Lo-Fi Beats',
    signageContent: 'Daily Announcements',
    status: 'optimal',
    devices: { lights: 120, sensors: 24, displays: 16, hvac: 8, speakers: 24, doorDisplays: 0 }
  },
  {
    id: 'z3',
    name: 'Conference Center - L3',
    buildingId: 'b1',
    floor: 3,
    type: 'conference',
    occupancy: 48,
    capacity: 120,
    temp: 23.2,
    targetTemp: 22.5,
    humidity: 39,
    co2: 650,
    lighting: 85,
    colorTemp: 5000,
    blinds: 20,
    hvacMode: 'cool',
    fanSpeed: 2,
    audioEnabled: false,
    audioVolume: 0,
    signageContent: 'Meeting Schedule',
    doorMessage: 'Meeting in Progress',
    status: 'warning',
    devices: { lights: 68, sensors: 16, displays: 24, hvac: 6, speakers: 12, doorDisplays: 8 }
  },
  {
    id: 'z4',
    name: 'Main Lobby',
    buildingId: 'b1',
    floor: 1,
    type: 'lobby',
    occupancy: 82,
    capacity: 200,
    temp: 22.5,
    targetTemp: 22.5,
    humidity: 44,
    co2: 445,
    lighting: 100,
    colorTemp: 5500,
    blinds: 100,
    hvacMode: 'auto',
    fanSpeed: 1,
    audioEnabled: true,
    audioVolume: 25,
    currentPlaylist: 'Ambient Background',
    signageContent: 'Welcome Visitors',
    status: 'optimal',
    devices: { lights: 96, sensors: 18, displays: 32, hvac: 12, speakers: 16, doorDisplays: 4 }
  }
];

// Mock Automation Rules
const MOCK_RULES: AutomationRule[] = [
  {
    id: 'r1',
    name: 'After Hours Energy Savings',
    enabled: true,
    trigger: { type: 'schedule', condition: 'time >= 19:00' },
    actions: [
      { type: 'lighting', target: 'all-zones', value: 30 },
      { type: 'hvac', target: 'all-zones', value: 'eco' },
      { type: 'signage', target: 'lobby-displays', value: 'after-hours-template' }
    ],
    zones: ['all'],
    lastRun: new Date(Date.now() - 3600000),
    runCount: 247
  },
  {
    id: 'r2',
    name: 'High CO2 Alert & Ventilation',
    enabled: true,
    trigger: { type: 'sensor', condition: 'co2 > 800', value: 800 },
    actions: [
      { type: 'hvac', target: 'affected-zone', value: 'ventilate' },
      { type: 'notification', target: 'facilities-team', value: 'High CO2 detected' },
      { type: 'signage', target: 'zone-displays', value: 'ventilation-notice' }
    ],
    zones: ['z2', 'z3'],
    lastRun: new Date(Date.now() - 86400000),
    runCount: 12
  },
  {
    id: 'r3',
    name: 'Morning Arrival Prep',
    enabled: true,
    trigger: { type: 'schedule', condition: 'time = 07:00' },
    actions: [
      { type: 'lighting', target: 'all-zones', value: 80 },
      { type: 'hvac', target: 'all-zones', value: 22.5 },
      { type: 'signage', target: 'lobby-displays', value: 'welcome-morning' }
    ],
    zones: ['all'],
    lastRun: new Date(Date.now() - 7200000),
    runCount: 314
  },
  {
    id: 'r4',
    name: 'Conference Room Auto-Setup',
    enabled: true,
    trigger: { type: 'event', condition: 'booking-start', value: '15min-before' },
    actions: [
      { type: 'lighting', target: 'conference-zones', value: 100 },
      { type: 'hvac', target: 'conference-zones', value: 21.5 },
      { type: 'signage', target: 'room-displays', value: 'meeting-welcome' }
    ],
    zones: ['z3'],
    lastRun: new Date(Date.now() - 5400000),
    runCount: 89
  },
  {
    id: 'r5',
    name: 'Occupancy-Based Lighting',
    enabled: false,
    trigger: { type: 'occupancy', condition: 'occupancy = 0', value: '30min' },
    actions: [
      { type: 'lighting', target: 'zone', value: 15 },
      { type: 'hvac', target: 'zone', value: 'eco' }
    ],
    zones: ['z1', 'z2', 'z3'],
    runCount: 0
  }
];

// Mock Signage Content
const MOCK_SIGNAGE: SignageContent[] = [
  { id: 's1', name: 'Welcome Morning', type: 'template' },
  { id: 's2', name: 'After Hours Notice', type: 'template' },
  { id: 's3', name: 'High CO2 Alert', type: 'template' },
  { id: 's4', name: 'Meeting Welcome', type: 'template' },
  { id: 's5', name: 'Emergency Evacuation', type: 'template' },
  { id: 's6', name: 'Building Maintenance', type: 'template' }
];

export const FacilitySmartControl: React.FC = () => {
  // State
  const [selectedBuilding, setSelectedBuilding] = useState<string>('b1');
  const [buildings, setBuildings] = useState<BuildingData[]>(MOCK_BUILDINGS);
  const [zones, setZones] = useState<ZoneData[]>(MOCK_ZONES);
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_RULES);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'zones' | 'automation'>('overview');
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [expandedZones, setExpandedZones] = useState<string[]>([]);

  // Computed
  const selectedBuildingData = buildings.find(b => b.id === selectedBuilding);
  const buildingZones = zones.filter(z => z.buildingId === selectedBuilding);
  const totalEnergy = buildings.reduce((sum, b) => sum + b.stats.energyUsage, 0);
  const totalOccupancy = buildings.reduce((sum, b) => sum + b.occupancy, 0);
  const totalCapacity = buildings.reduce((sum, b) => sum + b.capacity, 0);
  const activeRules = rules.filter(r => r.enabled).length;

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Syncing with building systems...',
      success: () => {
        setIsRefreshing(false);
        // Simulate data updates
        setBuildings(prev => prev.map(b => ({
          ...b,
          stats: {
            ...b.stats,
            avgTemp: parseFloat((b.stats.avgTemp + (Math.random() * 0.4 - 0.2)).toFixed(1)),
            co2Level: Math.floor(b.stats.co2Level + (Math.random() * 20 - 10)),
            energyUsage: Math.floor(b.stats.energyUsage + (Math.random() * 100 - 50))
          }
        })));
        return 'Systems synchronized';
      },
      error: 'Sync failed'
    });
  };

  const handleZoneControl = (zoneId: string, control: string, value: any) => {
    setZones(prev => prev.map(z => {
      if (z.id === zoneId) {
        switch(control) {
          case 'temp':
            return { ...z, targetTemp: value };
          case 'lighting':
            return { ...z, lighting: value };
          case 'colorTemp':
            return { ...z, colorTemp: value };
          case 'blinds':
            return { ...z, blinds: value };
          case 'hvacMode':
            return { ...z, hvacMode: value };
          case 'fanSpeed':
            return { ...z, fanSpeed: value };
          case 'audioEnabled':
            return { ...z, audioEnabled: value };
          case 'audioVolume':
            return { ...z, audioVolume: value };
          case 'signageContent':
            return { ...z, signageContent: value };
          case 'doorMessage':
            return { ...z, doorMessage: value };
          default:
            return z;
        }
      }
      return z;
    }));
    toast.success(`Zone ${control} updated`);
  };

  const handleBulkZoneControl = (control: string, value: any) => {
    if (selectedZones.length === 0) {
      toast.error('No zones selected');
      return;
    }
    setZones(prev => prev.map(z => {
      if (selectedZones.includes(z.id)) {
        switch(control) {
          case 'temp':
            return { ...z, targetTemp: value };
          case 'lighting':
            return { ...z, lighting: value };
          case 'colorTemp':
            return { ...z, colorTemp: value };
          case 'blinds':
            return { ...z, blinds: value };
          case 'hvacMode':
            return { ...z, hvacMode: value };
          case 'fanSpeed':
            return { ...z, fanSpeed: value };
          case 'audioEnabled':
            return { ...z, audioEnabled: value };
          case 'signageContent':
            return { ...z, signageContent: value };
          default:
            return z;
        }
      }
      return z;
    }));
    toast.success(`${selectedZones.length} zones updated`);
    setSelectedZones([]);
  };

  const toggleZoneSelection = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const toggleRuleEnabled = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
    const rule = rules.find(r => r.id === ruleId);
    toast.success(`Rule "${rule?.name}" ${rule?.enabled ? 'disabled' : 'enabled'}`);
  };

  const handleRunRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: `Executing rule: ${rule.name}...`,
      success: () => {
        setRules(prev => prev.map(r => 
          r.id === ruleId 
            ? { ...r, lastRun: new Date(), runCount: r.runCount + 1 }
            : r
        ));
        return 'Rule executed successfully';
      },
      error: 'Rule execution failed'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'optimal': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'alert': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch(status) {
      case 'optimal': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      case 'alert': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden text-sm">
      
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">Facility Smart Control</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5 px-2.5 py-0.5">
                <Building size={12} />
                {buildings.length} Buildings
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-2.5 py-0.5">
                <Zap size={12} />
                {activeRules} Active Rules
              </Badge>
            </div>
            <p className="text-slate-500 text-sm">
              Building-wide automation, environmental control, and energy management
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Stats Pills */}
            <div className="flex gap-3 text-xs font-medium text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded shadow-sm">
                <Users size={14} className="text-blue-500" />
                <span>{totalOccupancy}/{totalCapacity}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded shadow-sm">
                <Zap size={14} className="text-amber-500" />
                <span>{totalEnergy.toLocaleString()} kWh</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded shadow-sm">
                <Activity size={14} className="text-emerald-500" />
                <span>All Systems</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Syncing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </header>

      {/* Building Selector */}
      <div className="flex-shrink-0 bg-slate-100 border-b border-slate-200 px-8 py-4">
        <div className="flex items-center gap-4">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Building:</Label>
          <div className="flex gap-2">
            {buildings.map(building => (
              <button
                key={building.id}
                onClick={() => setSelectedBuilding(building.id)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                  selectedBuilding === building.id
                    ? "bg-white border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-200"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", getStatusDot(building.status))} />
                  <span className="font-semibold">{building.name}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{building.location}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="space-y-6">
          
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="zones" className="gap-2">
              <Layers size={16} />
              Zone Control
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Repeat size={16} />
              Automation Rules
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            
            {/* Building Stats Grid */}
            {selectedBuildingData && (
              <div className="grid grid-cols-4 gap-6">
                
                {/* Temperature */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Thermometer size={20} className="text-orange-500" />
                      <Badge variant="outline" className={getStatusColor(selectedBuildingData.status)}>
                        {selectedBuildingData.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {selectedBuildingData.stats.avgTemp}°C
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Average Temperature</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Droplets size={12} />
                      {selectedBuildingData.stats.avgHumidity}% Humidity
                    </div>
                  </CardContent>
                </Card>

                {/* Air Quality */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Wind size={20} className="text-blue-500" />
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Good
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {selectedBuildingData.stats.aqi}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Air Quality Index</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Activity size={12} />
                      CO₂: {selectedBuildingData.stats.co2Level} ppm
                    </div>
                  </CardContent>
                </Card>

                {/* Energy Usage */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Zap size={20} className="text-amber-500" />
                      <TrendingDown size={16} className="text-emerald-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {selectedBuildingData.stats.energyUsage.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">kWh (Today)</div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                      <TrendingDown size={12} />
                      -8% vs yesterday
                    </div>
                  </CardContent>
                </Card>

                {/* Occupancy */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Users size={20} className="text-purple-500" />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {Math.round((selectedBuildingData.occupancy / selectedBuildingData.capacity) * 100)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {selectedBuildingData.occupancy}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Current Occupancy</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Target size={12} />
                      {selectedBuildingData.capacity} capacity
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            {/* System Load */}
            <div className="grid grid-cols-2 gap-6">
              
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb size={18} className="text-amber-500" />
                    Lighting System Load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Current Load</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {selectedBuildingData?.stats.lightingLoad}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                        style={{ width: `${selectedBuildingData?.stats.lightingLoad}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Active Zones</span>
                    <span className="text-xs font-bold text-slate-700">{buildingZones.length} / {selectedBuildingData?.zones}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wind size={18} className="text-blue-500" />
                    HVAC System Load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Current Load</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {selectedBuildingData?.stats.hvacLoad}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                        style={{ width: `${selectedBuildingData?.stats.hvacLoad}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Average Temp</span>
                    <span className="text-xs font-bold text-slate-700">{selectedBuildingData?.stats.avgTemp}°C</span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Zone Status Overview */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers size={18} className="text-blue-500" />
                    Zone Status Overview
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setViewMode('zones')}
                  >
                    View All Zones
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {buildingZones.slice(0, 4).map(zone => (
                    <div key={zone.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-2 h-2 rounded-full", getStatusDot(zone.status))} />
                          <div>
                            <div className="font-semibold text-slate-900">{zone.name}</div>
                            <div className="text-xs text-slate-500">
                              Floor {zone.floor} • {zone.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Occupancy</div>
                            <div className="font-bold text-slate-900">{zone.occupancy}/{zone.capacity}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Temp</div>
                            <div className="font-bold text-slate-900">{zone.temp}°C</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">CO₂</div>
                            <div className="font-bold text-slate-900">{zone.co2} ppm</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Lighting</div>
                            <div className="font-bold text-slate-900">{zone.lighting}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ZONE CONTROL TAB */}
          <TabsContent value="zones" className="space-y-6">
            
            {/* Bulk Control Panel */}
            {selectedZones.length > 0 && (
              <Card className="border-blue-200 bg-blue-50 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target size={18} className="text-blue-600" />
                      Bulk Zone Control
                      <Badge className="bg-blue-600 text-white">
                        {selectedZones.length} Selected
                      </Badge>
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedZones([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    
                    {/* Bulk Temperature */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600">Set Temperature</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="22.5" 
                          className="bg-white"
                          id="bulk-temp"
                        />
                        <Button 
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('bulk-temp') as HTMLInputElement;
                            handleBulkZoneControl('temp', parseFloat(input.value));
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>

                    {/* Bulk Lighting */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600">Set Lighting</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="75" 
                          className="bg-white"
                          id="bulk-lighting"
                        />
                        <Button 
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('bulk-lighting') as HTMLInputElement;
                            handleBulkZoneControl('lighting', parseInt(input.value));
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>

                    {/* Bulk HVAC Mode */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600">Set HVAC Mode</Label>
                      <Select onValueChange={(v) => handleBulkZoneControl('hvacMode', v)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="cool">Cool</SelectItem>
                          <SelectItem value="heat">Heat</SelectItem>
                          <SelectItem value="fan">Fan Only</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                </CardContent>
              </Card>
            )}

            {/* Zone List with Controls */}
            <div className="space-y-4">
              {buildingZones.map(zone => (
                <Card 
                  key={zone.id} 
                  className={cn(
                    "border-slate-200 shadow-sm transition-all",
                    selectedZones.includes(zone.id) && "ring-2 ring-blue-500 border-blue-200"
                  )}
                >
                  <CardHeader className="pb-4 cursor-pointer" onClick={() => {
                    setExpandedZones(prev => 
                      prev.includes(zone.id) 
                        ? prev.filter(id => id !== zone.id)
                        : [...prev, zone.id]
                    );
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedZones.includes(zone.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleZoneSelection(zone.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <div className={cn("w-2 h-2 rounded-full", getStatusDot(zone.status))} />
                        <div>
                          <CardTitle className="text-base">{zone.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Floor {zone.floor} • {zone.type} • {zone.occupancy}/{zone.capacity} occupancy
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Quick Stats */}
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-slate-500">Temp</div>
                            <div className="font-bold text-slate-900">{zone.temp}°C</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500">Light</div>
                            <div className="font-bold text-slate-900">{zone.lighting}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500">Mode</div>
                            <div className="font-bold text-slate-900 uppercase text-xs">{zone.hvacMode}</div>
                          </div>
                        </div>
                        {expandedZones.includes(zone.id) ? (
                          <ChevronDown size={20} className="text-slate-400" />
                        ) : (
                          <ChevronRight size={20} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {expandedZones.includes(zone.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="border-t border-slate-100 pt-6 space-y-6">
                          
                          {/* Detailed Sensors */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Thermometer size={14} className="text-orange-500" />
                                <span className="text-xs font-bold text-slate-500">Temperature</span>
                              </div>
                              <div className="text-2xl font-bold text-slate-900">{zone.temp}°C</div>
                              <div className="text-xs text-slate-500">Target: {zone.targetTemp}°C</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplets size={14} className="text-blue-500" />
                                <span className="text-xs font-bold text-slate-500">Humidity</span>
                              </div>
                              <div className="text-2xl font-bold text-slate-900">{zone.humidity}%</div>
                              <div className="text-xs text-slate-500">Optimal range</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Wind size={14} className="text-teal-500" />
                                <span className="text-xs font-bold text-slate-500">CO₂ Level</span>
                              </div>
                              <div className="text-2xl font-bold text-slate-900">{zone.co2}</div>
                              <div className="text-xs text-slate-500">ppm</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Users size={14} className="text-purple-500" />
                                <span className="text-xs font-bold text-slate-500">Occupancy</span>
                              </div>
                              <div className="text-2xl font-bold text-slate-900">{zone.occupancy}</div>
                              <div className="text-xs text-slate-500">of {zone.capacity}</div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="grid grid-cols-3 gap-6">
                            
                            {/* Temperature Control */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Thermometer size={16} />
                                Temperature
                              </Label>
                              <div className="flex items-center gap-3">
                                <Slider 
                                  value={[zone.targetTemp]} 
                                  min={18} 
                                  max={26} 
                                  step={0.5}
                                  onValueChange={([v]) => handleZoneControl(zone.id, 'temp', v)}
                                  className="flex-1"
                                />
                                <span className="text-sm font-bold text-slate-900 w-12">
                                  {zone.targetTemp}°C
                                </span>
                              </div>
                            </div>

                            {/* Lighting Control */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Lightbulb size={16} />
                                Lighting
                              </Label>
                              <div className="flex items-center gap-3">
                                <Slider 
                                  value={[zone.lighting]} 
                                  min={0} 
                                  max={100} 
                                  step={5}
                                  onValueChange={([v]) => handleZoneControl(zone.id, 'lighting', v)}
                                  className="flex-1"
                                />
                                <span className="text-sm font-bold text-slate-900 w-12">
                                  {zone.lighting}%
                                </span>
                              </div>
                            </div>

                            {/* HVAC Mode */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Fan size={16} />
                                HVAC Mode
                              </Label>
                              <Select 
                                value={zone.hvacMode} 
                                onValueChange={(v) => handleZoneControl(zone.id, 'hvacMode', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">
                                    <div className="flex items-center gap-2">
                                      <Zap size={14} />
                                      Auto
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cool">
                                    <div className="flex items-center gap-2">
                                      <Snowflake size={14} />
                                      Cool
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="heat">
                                    <div className="flex items-center gap-2">
                                      <Flame size={14} />
                                      Heat
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="fan">
                                    <div className="flex items-center gap-2">
                                      <Fan size={14} />
                                      Fan Only
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="off">
                                    <div className="flex items-center gap-2">
                                      <Power size={14} />
                                      Off
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                          </div>

                          {/* Advanced Controls - Row 2 */}
                          <div className="grid grid-cols-3 gap-6">
                            
                            {/* Color Temperature */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Sun size={16} />
                                Color Temp
                              </Label>
                              <div className="flex items-center gap-3">
                                <Slider 
                                  value={[zone.colorTemp]} 
                                  min={2700} 
                                  max={6500} 
                                  step={100}
                                  onValueChange={([v]) => handleZoneControl(zone.id, 'colorTemp', v)}
                                  className="flex-1"
                                />
                                <span className="text-sm font-bold text-slate-900 w-16">
                                  {zone.colorTemp}K
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>Warm</span>
                                <span>Cool</span>
                              </div>
                            </div>

                            {/* Blinds Control */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Maximize2 size={16} />
                                Blinds
                              </Label>
                              <div className="flex items-center gap-3">
                                <Slider 
                                  value={[zone.blinds]} 
                                  min={0} 
                                  max={100} 
                                  step={10}
                                  onValueChange={([v]) => handleZoneControl(zone.id, 'blinds', v)}
                                  className="flex-1"
                                />
                                <span className="text-sm font-bold text-slate-900 w-12">
                                  {zone.blinds}%
                                </span>
                              </div>
                            </div>

                            {/* Fan Speed */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Fan size={16} />
                                Fan Speed
                              </Label>
                              <div className="flex items-center gap-3">
                                <Slider 
                                  value={[zone.fanSpeed]} 
                                  min={0} 
                                  max={2} 
                                  step={1}
                                  onValueChange={([v]) => handleZoneControl(zone.id, 'fanSpeed', v)}
                                  className="flex-1"
                                />
                                <span className="text-sm font-bold text-slate-900 w-12">
                                  {zone.fanSpeed === 0 ? 'Low' : zone.fanSpeed === 1 ? 'Med' : 'High'}
                                </span>
                              </div>
                            </div>

                          </div>

                          {/* Media & Experience Controls - Row 3 */}
                          <div className="grid grid-cols-3 gap-6">
                            
                            {/* Audio Control */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Volume2 size={16} />
                                Audio System
                              </Label>
                              <div className="flex items-center gap-2 mb-2">
                                <Switch 
                                  checked={zone.audioEnabled}
                                  onCheckedChange={(v) => handleZoneControl(zone.id, 'audioEnabled', v)}
                                />
                                <span className="text-xs text-slate-500">
                                  {zone.audioEnabled ? 'Playing' : 'Muted'}
                                </span>
                              </div>
                              {zone.audioEnabled && (
                                <div className="flex items-center gap-3">
                                  <Volume2 size={14} className="text-slate-400" />
                                  <Slider 
                                    value={[zone.audioVolume]} 
                                    min={0} 
                                    max={100} 
                                    step={5}
                                    onValueChange={([v]) => handleZoneControl(zone.id, 'audioVolume', v)}
                                    className="flex-1"
                                  />
                                  <span className="text-xs font-bold text-slate-900 w-8">
                                    {zone.audioVolume}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Signage Content */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Monitor size={16} />
                                Signage Content
                              </Label>
                              <Select 
                                value={zone.signageContent || 'none'} 
                                onValueChange={(v) => handleZoneControl(zone.id, 'signageContent', v)}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No Content</SelectItem>
                                  <SelectItem value="Welcome Executive">Welcome Executive</SelectItem>
                                  <SelectItem value="Daily Announcements">Daily Announcements</SelectItem>
                                  <SelectItem value="Meeting Schedule">Meeting Schedule</SelectItem>
                                  <SelectItem value="Welcome Visitors">Welcome Visitors</SelectItem>
                                  <SelectItem value="Emergency Alert">Emergency Alert</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Door Display Message */}
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <MessageSquare size={16} />
                                Door Message
                              </Label>
                              <Input 
                                placeholder="Enter door message..."
                                value={zone.doorMessage || ''}
                                onChange={(e) => handleZoneControl(zone.id, 'doorMessage', e.target.value)}
                                className="text-sm"
                              />
                            </div>

                          </div>

                          {/* Connected Devices */}
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                              Connected Devices
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <Lightbulb size={14} className="text-amber-500" />
                                <span className="text-sm text-slate-600">{zone.devices.lights} Lights</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Activity size={14} className="text-emerald-500" />
                                <span className="text-sm text-slate-600">{zone.devices.sensors} Sensors</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Monitor size={14} className="text-blue-500" />
                                <span className="text-sm text-slate-600">{zone.devices.displays} Displays</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Wind size={14} className="text-teal-500" />
                                <span className="text-sm text-slate-600">{zone.devices.hvac} HVAC Units</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Volume2 size={14} className="text-purple-500" />
                                <span className="text-sm text-slate-600">{zone.devices.speakers} Speakers</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Radio size={14} className="text-indigo-500" />
                                <span className="text-sm text-slate-600">{zone.devices.doorDisplays} Door Displays</span>
                              </div>
                            </div>
                          </div>

                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>

          </TabsContent>

          {/* AUTOMATION RULES TAB */}
          <TabsContent value="automation" className="space-y-6">
            
            {/* Header Actions */}
            <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Building Automation Rules
                    </h3>
                    <p className="text-sm text-slate-600">
                      Create IF-THEN rules to automate HVAC, lighting, and signage based on triggers
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingRule(null);
                      setIsRuleDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Create Rule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rules List */}
            <div className="space-y-4">
              {rules.map(rule => (
                <Card key={rule.id} className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch 
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRuleEnabled(rule.id)}
                        />
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {rule.name}
                            {rule.enabled && (
                              <Badge className="bg-emerald-500 text-white">Active</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {rule.lastRun ? (
                              <>Last run: {new Date(rule.lastRun).toLocaleString()} • {rule.runCount} executions</>
                            ) : (
                              <>Never executed</>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRunRule(rule.id)}
                          disabled={!rule.enabled}
                        >
                          <Play size={14} className="mr-2" />
                          Run Now
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingRule(rule);
                            setIsRuleDialogOpen(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                        >
                          <Copy size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Trigger */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-blue-600 uppercase">IF (Trigger)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white border-blue-200">
                          {rule.trigger.type}
                        </Badge>
                        <ArrowRight size={14} className="text-blue-400" />
                        <span className="text-sm text-slate-700 font-medium">{rule.trigger.condition}</span>
                        {rule.trigger.value && (
                          <>
                            <ArrowRight size={14} className="text-blue-400" />
                            <Badge className="bg-blue-600 text-white">{rule.trigger.value}</Badge>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-600 uppercase">THEN (Actions)</span>
                      </div>
                      <div className="space-y-2">
                        {rule.actions.map((action, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <Badge variant="outline" className="bg-white border-emerald-200">
                              {action.type}
                            </Badge>
                            <ArrowRight size={14} className="text-emerald-400" />
                            <span className="text-sm text-slate-700">{action.target}</span>
                            <ArrowRight size={14} className="text-emerald-400" />
                            <Badge className="bg-emerald-600 text-white font-mono text-xs">
                              {action.value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Applied Zones */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Layers size={14} />
                      <span>Applied to:</span>
                      {rule.zones.includes('all') ? (
                        <Badge variant="outline" className="bg-slate-50">All Zones</Badge>
                      ) : (
                        rule.zones.map(zoneId => {
                          const zone = zones.find(z => z.id === zoneId);
                          return zone ? (
                            <Badge key={zoneId} variant="outline" className="bg-slate-50">
                              {zone.name}
                            </Badge>
                          ) : null;
                        })
                      )}
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>

          </TabsContent>

        </Tabs>
      </div>

      {/* Rule Creation/Edit Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
            </DialogTitle>
            <DialogDescription>
              Define triggers and actions to automate building systems and signage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            
            {/* Rule Name */}
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input 
                placeholder="e.g., After Hours Energy Savings"
                defaultValue={editingRule?.name}
              />
            </div>

            <Separator />

            {/* Trigger Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-blue-600" />
                <h4 className="font-bold text-slate-900">IF (Trigger Condition)</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select defaultValue={editingRule?.trigger.type || 'schedule'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schedule">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          Schedule (Time-based)
                        </div>
                      </SelectItem>
                      <SelectItem value="sensor">
                        <div className="flex items-center gap-2">
                          <Activity size={14} />
                          Sensor Reading
                        </div>
                      </SelectItem>
                      <SelectItem value="occupancy">
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          Occupancy Level
                        </div>
                      </SelectItem>
                      <SelectItem value="event">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          Calendar Event
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Input 
                    placeholder="e.g., time >= 19:00"
                    defaultValue={editingRule?.trigger.condition}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-emerald-600" />
                  <h4 className="font-bold text-slate-900">THEN (Actions)</h4>
                </div>
                <Button variant="outline" size="sm">
                  <Plus size={14} className="mr-2" />
                  Add Action
                </Button>
              </div>

              {/* Action 1 - HVAC */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Action 1</Label>
                  <Button variant="ghost" size="sm">
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Action Type</Label>
                    <Select defaultValue="hvac">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hvac">
                          <div className="flex items-center gap-2">
                            <Wind size={14} />
                            HVAC Control
                          </div>
                        </SelectItem>
                        <SelectItem value="lighting">
                          <div className="flex items-center gap-2">
                            <Lightbulb size={14} />
                            Lighting Control
                          </div>
                        </SelectItem>
                        <SelectItem value="signage">
                          <div className="flex items-center gap-2">
                            <Monitor size={14} />
                            Signage Content
                          </div>
                        </SelectItem>
                        <SelectItem value="notification">
                          <div className="flex items-center gap-2">
                            <Bell size={14} />
                            Send Notification
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Target</Label>
                    <Select defaultValue="all-zones">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-zones">All Zones</SelectItem>
                        <SelectItem value="selected-zones">Selected Zones</SelectItem>
                        <SelectItem value="building">Entire Building</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Value</Label>
                    <Input placeholder="e.g., 22.5 or eco" />
                  </div>
                </div>
              </div>

              {/* Action 2 - Lighting */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Action 2</Label>
                  <Button variant="ghost" size="sm">
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Action Type</Label>
                    <Select defaultValue="lighting">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hvac">HVAC Control</SelectItem>
                        <SelectItem value="lighting">Lighting Control</SelectItem>
                        <SelectItem value="signage">Signage Content</SelectItem>
                        <SelectItem value="notification">Send Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Target</Label>
                    <Select defaultValue="all-zones">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-zones">All Zones</SelectItem>
                        <SelectItem value="selected-zones">Selected Zones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Value (% brightness)</Label>
                    <Input placeholder="30" />
                  </div>
                </div>
              </div>

              {/* Action 3 - Signage */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Action 3</Label>
                  <Button variant="ghost" size="sm">
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Action Type</Label>
                    <Select defaultValue="signage">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hvac">HVAC Control</SelectItem>
                        <SelectItem value="lighting">Lighting Control</SelectItem>
                        <SelectItem value="signage">Signage Content</SelectItem>
                        <SelectItem value="notification">Send Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Target Displays</Label>
                    <Select defaultValue="lobby-displays">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lobby-displays">Lobby Displays</SelectItem>
                        <SelectItem value="all-displays">All Displays</SelectItem>
                        <SelectItem value="zone-displays">Zone Displays</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Content Template</Label>
                    <Select defaultValue="s2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_SIGNAGE.map(content => (
                          <SelectItem key={content.id} value={content.id}>
                            {content.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

            </div>

            <Separator />

            {/* Zone Selection */}
            <div className="space-y-3">
              <Label>Apply to Zones</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  All Zones
                </Button>
                {buildingZones.map(zone => (
                  <Button key={zone.id} variant="outline" className="justify-start">
                    <input type="checkbox" className="mr-2" />
                    {zone.name}
                  </Button>
                ))}
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(editingRule ? 'Rule updated' : 'Rule created successfully');
              setIsRuleDialogOpen(false);
            }}>
              <Save size={14} className="mr-2" />
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
