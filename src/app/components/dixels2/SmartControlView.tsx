import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Thermometer, 
  Sun, 
  Lightbulb, 
  Wind, 
  Zap, 
  Activity, 
  Power, 
  Maximize2,
  Tv, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Mic, 
  Menu as MenuIcon, 
  BellOff, 
  Moon, 
  Coffee, 
  Users, 
  Monitor,
  Layout,
  RefreshCw,
  MoreVertical,
  Music,
  Wifi,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Headphones,
  Sparkles,
  Wrench,
  Utensils,
  Leaf,
  ArrowUpFromLine,
  ArrowDownToLine,
  MonitorSmartphone,
  Calendar as CalendarIcon,
  Clock,
  Type,
  MessageSquare,
  Globe,
  Film,
  Trophy,
  Youtube,
  Cast,
  Grid,
  Hash,
  Delete,
  Radio,
  Snowflake,
  Flame,
  Droplets,
  Fan,
  Check,
  History,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { useEnterpriseContext } from './EnterpriseContext';
import { format } from 'date-fns';

// Mock Data for "My Space"
const MY_SPACE = {
  id: 'room-404',
  name: 'Private Office 404',
  location: 'Level 4, North Wing',
  sensors: {
    temp: 22.5,
    humidity: 45,
    co2: 410,
    aqi: 98
  }
};

const SCENES = [
  { id: 'focus', name: 'Focus Mode', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: 'DND On, Lights 40%, Lo-Fi' },
  { id: 'meet', name: 'Meeting', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', desc: 'Bright Lights, TV On' },
  { id: 'relax', name: 'Relax', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Warm Lights, Blinds Open' },
  { id: 'present', name: 'Presentation', icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'Lights Dim, TV Input 1' },
];

const PLAYLISTS = [
  { id: 'focus', name: 'Deep Focus', artist: 'Brain.fm' },
  { id: 'lofi', name: 'Lo-Fi Beats', artist: 'Spotify' },
  { id: 'nature', name: 'Forest Sounds', artist: 'Ambient' },
  { id: 'jazz', name: 'Coffee Shop Jazz', artist: 'Smooth' },
];

const DOOR_STATUSES = [
  { id: 'avail', label: 'Available', color: 'bg-emerald-500' },
  { id: 'busy', label: 'Busy', color: 'bg-red-500' },
  { id: 'focus', label: 'Focus Time', color: 'bg-purple-500' },
  { id: 'out', label: 'Out of Office', color: 'bg-slate-500' },
];

const DOOR_PRESETS = [
    "Back in 5 mins",
    "In a Zoom call",
    "Out for lunch",
    "Deep work session"
];

// IPTV Data
const SOURCES = [
    { id: 'live', label: 'Live TV', icon: Radio },
    { id: 'apps', label: 'Smart Apps', icon: Grid },
    { id: 'hdmi1', label: 'HDMI 1', icon: Monitor },
    { id: 'hdmi2', label: 'HDMI 2', icon: Monitor },
    { id: 'cast', label: 'AirPlay', icon: Cast },
];

const APPS = [
    { id: 'netflix', name: 'Netflix', color: 'bg-red-600', icon: Film },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-500', icon: Youtube },
    { id: 'news', name: 'BBC News', color: 'bg-red-700', icon: Globe },
    { id: 'sports', name: 'ESPN', color: 'bg-red-800', icon: Trophy },
];

const CHANNELS = [
    { id: 'mbc1', name: 'MBC 1', number: 1, color: 'bg-blue-600' },
    { id: 'aljazeera', name: 'Al Jazeera', number: 2, color: 'bg-orange-500' },
    { id: 'alarabiya', name: 'Al Arabiya', number: 3, color: 'bg-purple-600' },
    { id: 'skynews', name: 'Sky News', number: 4, color: 'bg-red-600' },
    { id: 'cnbc', name: 'CNBC', number: 5, color: 'bg-blue-500' },
    { id: 'bloomberg', name: 'Bloomberg', number: 6, color: 'bg-black' },
];

// HVAC Modes
const HVAC_MODES = [
    { id: 'auto', label: 'Auto', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'cool', label: 'Cool', icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'heat', label: 'Heat', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'fan', label: 'Fan Only', icon: Fan, color: 'text-slate-500', bg: 'bg-slate-50' },
];

export const SmartControlView: React.FC = () => {
  const { updateSmartControls, calendarEvents } = useEnterpriseContext();
  
  // State
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [lights, setLights] = useState(80);
  const [colorTemp, setColorTemp] = useState(4500); // Kelvin
  const [blinds, setBlinds] = useState(60);
  const [dnd, setDnd] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Climate State
  const [temp, setTemp] = useState(22.5);
  const [hvacMode, setHvacMode] = useState('auto');
  const [fanSpeed, setFanSpeed] = useState([1]); // 0=Low, 1=Med, 2=High
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(PLAYLISTS[0]);
  
  // TV State
  const [tvPower, setTvPower] = useState(false);
  const [volume, setVolume] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [tvSource, setTvSource] = useState('live');
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<typeof CHANNELS[0]>(CHANNELS[0]);
  const [showKeypad, setShowKeypad] = useState(false);

  // Desk State
  const [deskHeight, setDeskHeight] = useState(72); // cm

  // Door Status
  const [doorMessage, setDoorMessage] = useState('');
  const [tempDoorMessage, setTempDoorMessage] = useState('');
  const [doorStatus, setDoorStatus] = useState('avail');
  const [recentMessages, setRecentMessages] = useState<string[]>([]);

  // Services State
  const [requestingService, setRequestingService] = useState<string | null>(null);

  const nextMeeting = calendarEvents.find(e => e.start > new Date());

  const handleSync = () => {
      setIsSyncing(true);
      toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
          loading: 'Syncing with room sensors...',
          success: () => {
              setIsSyncing(false);
              return 'Environment synced successfully';
          },
          error: 'Sync failed'
      });
  };

  const handleServiceRequest = (service: string) => {
    setRequestingService(service);
    setTimeout(() => {
        setRequestingService(null);
        toast.success(`${service} request sent to facilities team (Ticket #${Math.floor(Math.random() * 9000) + 1000})`);
    }, 2000);
  };

  const handleSceneActivate = (sceneId: string) => {
    setActiveScene(sceneId);
    toast.success(`${SCENES.find(s => s.id === sceneId)?.name} Activated`);
    
    // Simulate Scene Logic
    switch(sceneId) {
      case 'focus':
        setLights(30);
        setColorTemp(3000);
        setBlinds(20);
        setDnd(true);
        setTvPower(false);
        setIsPlaying(true);
        setCurrentPlaylist(PLAYLISTS[0]);
        setDeskHeight(72); // Sit
        setDoorStatus('focus');
        setDoorMessage('Deep Work Session');
        setTempDoorMessage('Deep Work Session');
        setHvacMode('auto');
        break;
      case 'meet':
        setLights(100);
        setColorTemp(5000);
        setBlinds(100);
        setDnd(false);
        setTvPower(true);
        setTvSource('hdmi1');
        setIsPlaying(false);
        setDeskHeight(72); // Sit
        setDoorStatus('busy');
        setDoorMessage('Meeting in Progress');
        setTempDoorMessage('Meeting in Progress');
        setHvacMode('cool');
        setTemp(21.5);
        break;
      case 'relax':
        setLights(50);
        setColorTemp(2700);
        setBlinds(100);
        setTemp(23.5);
        setIsPlaying(true);
        setCurrentPlaylist(PLAYLISTS[2]);
        setDeskHeight(110); // Stand/Stretch
        setDoorStatus('avail');
        setDoorMessage('');
        setTempDoorMessage('');
        setHvacMode('fan');
        break;
      case 'present':
        setLights(15);
        setBlinds(0);
        setTvPower(true);
        setTvSource('cast');
        setDnd(true);
        setIsPlaying(false);
        setDoorStatus('busy');
        setDoorMessage('Do Not Disturb');
        setTempDoorMessage('Do Not Disturb');
        break;
    }

    // Update global context (for Neural Interface integration)
    updateSmartControls({ activeScene: sceneId });
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    toast.info(isPlaying ? "Music Paused" : `Playing: ${currentPlaylist.name}`);
  };

  const handleDeskPreset = (mode: 'sit' | 'stand') => {
      const target = mode === 'sit' ? 72 : 110;
      setDeskHeight(target);
      toast.info(`Desk moving to ${mode} position (${target}cm)`);
  };

  const handleAppLaunch = (app: typeof APPS[0]) => {
      if (!tvPower) setTvPower(true);
      setTvSource('apps');
      setActiveApp(app.name);
      toast.success(`Launching ${app.name}`);
  };

  const handleChannelSelect = (channel: typeof CHANNELS[0]) => {
      if (!tvPower) setTvPower(true);
      setTvSource('live');
      setActiveChannel(channel);
      toast.success(`Tuning to ${channel.name}`);
  };

  const updateDoorMessage = (msg: string) => {
      setDoorMessage(msg);
      setTempDoorMessage(msg);
      if (msg && !recentMessages.includes(msg)) {
          setRecentMessages(prev => [msg, ...prev].slice(0, 5));
      }
      toast.success('Door status message updated');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden text-sm">
      
      {/* Header Section */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">My Space</h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-2.5 py-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Connected
              </Badge>
           </div>
           <p className="text-slate-500 text-sm flex items-center gap-2">
              <span className="font-medium text-slate-700">{MY_SPACE.name}</span>
              <span className="text-slate-300">•</span>
              <span>{MY_SPACE.location}</span>
           </p>
        </div>

        <div className="flex items-center gap-6">
           {/* Environmental Status Pills */}
           <div className="flex gap-3 text-xs font-medium text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded shadow-sm">
                 <Thermometer size={14} className="text-orange-500" />
                 <span>{MY_SPACE.sensors.temp}°C</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded shadow-sm">
                 <Wind size={14} className="text-blue-500" />
                 <span>{MY_SPACE.sensors.humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded shadow-sm">
                 <Activity size={14} className="text-emerald-500" />
                 <span>AQI Good</span>
              </div>
           </div>
           
           <Button variant="outline" size="sm" className="gap-2 text-slate-600" onClick={handleSync} disabled={isSyncing}>
              <RefreshCw size={14} className={cn(isSyncing && "animate-spin")} /> 
              {isSyncing ? 'Syncing...' : 'Sync'}
           </Button>
        </div>
      </header>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* DND & Status Banner */}
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
             
             <div className="flex items-center gap-6 relative z-10">
                <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center transition-colors duration-500", dnd ? "bg-red-500 text-white" : "bg-white/10 text-slate-300")}>
                   <BellOff size={28} />
                </div>
                <div>
                   <h2 className="text-xl font-bold mb-1">{dnd ? 'Do Not Disturb Enabled' : 'Available for Collaboration'}</h2>
                   <p className="text-slate-400 text-sm">{dnd ? 'Notifications muted. Room display shows "Busy".' : 'Notifications active. Room display shows "Available".'}</p>
                </div>
             </div>

             <div className="flex items-center gap-4 relative z-10">
                <span className="text-sm font-medium text-slate-300">DND Mode</span>
                <Switch 
                   checked={dnd} 
                   onCheckedChange={setDnd} 
                   className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-slate-600 border-2 border-transparent" 
                />
             </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
             
             {/* LEFT COLUMN: SCENES & ENVIRONMENT (8 cols) */}
             <div className="col-span-12 lg:col-span-8 space-y-6">
                
                {/* Scenes */}
                <section>
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap size={16} /> Quick Scenes
                   </h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {SCENES.map(scene => {
                         const isActive = activeScene === scene.id;
                         return (
                            <button
                               key={scene.id}
                               onClick={() => handleSceneActivate(scene.id)}
                               className={cn(
                                  "relative p-4 rounded-xl border text-left transition-all duration-300 hover:shadow-md group",
                                  isActive ? `bg-white ring-2 ring-offset-2 ring-teal-500 border-transparent shadow-md` : "bg-white border-slate-200 hover:border-teal-200"
                               )}
                            >
                               <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors", isActive ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-500 group-hover:text-teal-600")}>
                                  <scene.icon size={20} />
                               </div>
                               <div className="font-bold text-slate-900 mb-1">{scene.name}</div>
                               <div className="text-[10px] text-slate-500 leading-tight">{scene.desc}</div>
                               
                               {isActive && (
                                  <motion.div layoutId="active-scene" className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full" />
                               )}
                            </button>
                         )
                      })}
                   </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lighting & Blinds */}
                   <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="pb-3">
                         <CardTitle className="flex items-center gap-2 text-base">
                            <Sun size={18} className="text-amber-500" /> Lighting & Shade
                         </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-2">
                         <div className="space-y-3">
                            <div className="flex justify-between items-center">
                               <Label className="text-sm font-medium text-slate-600">Intensity</Label>
                               <span className="text-sm font-bold text-slate-900">{lights}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <Lightbulb size={16} className="text-slate-400" />
                               <Slider value={[lights]} max={100} step={1} onValueChange={([v]) => setLights(v)} className="flex-1" />
                               <Sun size={20} className="text-amber-500" />
                            </div>
                         </div>

                         <div className="space-y-3">
                            <div className="flex justify-between items-center">
                               <Label className="text-sm font-medium text-slate-600">Color Temp</Label>
                               <span className="text-sm font-bold text-slate-900">{colorTemp}K</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-bold text-orange-400">WARM</span>
                               <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-orange-300 via-yellow-100 to-blue-200">
                                  <Slider 
                                    value={[colorTemp]} 
                                    min={2700} 
                                    max={6500} 
                                    step={100} 
                                    onValueChange={([v]) => setColorTemp(v)} 
                                    className="cursor-pointer"
                                  />
                               </div>
                               <span className="text-[10px] font-bold text-blue-400">COOL</span>
                            </div>
                         </div>
                         
                         <Separator />
                         
                         <div className="space-y-3">
                            <div className="flex justify-between items-center">
                               <Label className="text-sm font-medium text-slate-600">Window Blinds</Label>
                               <span className="text-sm font-bold text-slate-900">{blinds === 0 ? 'Closed' : blinds === 100 ? 'Open' : `${blinds}%`}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <Layout size={16} className="text-slate-400" />
                               <Slider value={[blinds]} max={100} step={10} onValueChange={([v]) => setBlinds(v)} className="flex-1" />
                               <Maximize2 size={20} className="text-blue-500" />
                            </div>
                         </div>
                      </CardContent>
                   </Card>

                   {/* HVAC - UPDATED */}
                   <Card className="border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                         <Wind size={100} />
                      </div>
                      <CardHeader className="pb-3 relative z-10">
                         <CardTitle className="flex items-center gap-2 text-base">
                            <Thermometer size={18} className={cn("transition-colors", hvacMode === 'cool' ? "text-blue-500" : hvacMode === 'heat' ? "text-orange-500" : "text-emerald-500")} /> 
                            Climate Control
                         </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-2 relative z-10">
                         <div className="flex flex-col items-center py-2">
                             <div className="relative w-48 h-24 mb-6">
                                {/* Semi-circle gauge visualization */}
                                <div className="w-full h-full border-t-[12px] border-r-[12px] border-l-[12px] border-slate-100 rounded-t-full absolute top-0 left-0" />
                                <div 
                                    className={cn("w-full h-full border-t-[12px] border-r-[12px] border-l-[12px] rounded-t-full absolute top-0 left-0 transition-all duration-500", hvacMode === 'cool' ? "border-blue-500" : hvacMode === 'heat' ? "border-orange-500" : "border-emerald-500")}
                                    style={{ clipPath: `inset(0 0 0 ${100 - ((temp - 16) / 14) * 100}%)` }} 
                                />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                                   <span className="text-4xl font-bold text-slate-900 tracking-tighter">{temp}°</span>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-6 w-full px-4 mb-4">
                                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={() => setTemp(t => Math.max(16, t - 0.5))}>
                                   <ChevronDown size={20} />
                                </Button>
                                <div className="flex-1 text-center">
                                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target</div>
                                </div>
                                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={() => setTemp(t => Math.min(30, t + 0.5))}>
                                   <ChevronUp size={20} />
                                </Button>
                             </div>

                             {/* HVAC Mode Selector */}
                             <div className="grid grid-cols-4 gap-2 w-full mb-4">
                                {HVAC_MODES.map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setHvacMode(mode.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-2 rounded-lg border transition-all",
                                            hvacMode === mode.id 
                                                ? cn("border-transparent shadow-sm", mode.bg, mode.color) 
                                                : "bg-transparent border-transparent text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        <mode.icon size={16} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase">{mode.label}</span>
                                    </button>
                                ))}
                             </div>

                             {/* Fan Speed */}
                             <div className="w-full flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <Fan size={14} className={cn("text-slate-400", fanSpeed[0] > 0 && "animate-spin-slow")} />
                                <Slider 
                                    value={fanSpeed} 
                                    min={0} 
                                    max={2} 
                                    step={1} 
                                    onValueChange={setFanSpeed} 
                                    className="flex-1"
                                />
                                <span className="text-[10px] font-bold text-slate-500 w-8 text-right">
                                    {fanSpeed[0] === 0 ? 'LOW' : fanSpeed[0] === 1 ? 'MED' : 'HI'}
                                </span>
                             </div>

                         </div>
                      </CardContent>
                   </Card>

                    {/* Smart Desk Control */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-100">
                           <CardTitle className="flex items-center gap-2 text-base">
                              <MonitorSmartphone size={18} className="text-indigo-500" /> Smart Desk
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                           <div className="flex items-center justify-between mb-6">
                               <div className="text-center">
                                  <div className="text-3xl font-bold text-slate-900 mb-1">{deskHeight}<span className="text-base font-normal text-slate-500">cm</span></div>
                                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Height</div>
                               </div>
                               <div className="flex flex-col gap-2">
                                  <Button size="icon" variant="outline" onClick={() => setDeskHeight(h => Math.min(120, h + 1))}>
                                     <ChevronUp size={20} />
                                  </Button>
                                  <Button size="icon" variant="outline" onClick={() => setDeskHeight(h => Math.max(65, h - 1))}>
                                     <ChevronDown size={20} />
                                  </Button>
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                               <Button variant={deskHeight < 80 ? "default" : "outline"} className={cn("gap-2", deskHeight < 80 && "bg-indigo-600 hover:bg-indigo-700")} onClick={() => handleDeskPreset('sit')}>
                                  <ArrowDownToLine size={16} /> Sit (72cm)
                               </Button>
                               <Button variant={deskHeight > 100 ? "default" : "outline"} className={cn("gap-2", deskHeight > 100 && "bg-indigo-600 hover:bg-indigo-700")} onClick={() => handleDeskPreset('stand')}>
                                  <ArrowUpFromLine size={16} /> Stand (110cm)
                               </Button>
                           </div>
                        </CardContent>
                    </Card>

                    {/* Sonic Environment (Audio) */}
                   <Card className="border-slate-200 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
                         <CardTitle className="flex items-center gap-2 text-base">
                            <Headphones size={18} className="text-purple-500" /> Sonic Environment
                         </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                         <div className="p-4 flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors", isPlaying ? "bg-purple-100 text-purple-600 animate-pulse" : "bg-slate-100 text-slate-400")}>
                               <Music size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="text-sm font-bold text-slate-900 truncate">{currentPlaylist.name}</div>
                               <div className="text-xs text-slate-500 truncate">{currentPlaylist.artist} • Room Speakers</div>
                            </div>
                         </div>
                         
                         {/* Controls */}
                         <div className="px-4 pb-4">
                            <div className="flex items-center justify-center gap-4 mb-4">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => setCurrentPlaylist(PLAYLISTS[(PLAYLISTS.indexOf(currentPlaylist) - 1 + PLAYLISTS.length) % PLAYLISTS.length])}>
                                  <SkipBack size={18} />
                               </Button>
                               <Button 
                                  size="icon" 
                                  className={cn("h-10 w-10 rounded-full shadow-md transition-all", isPlaying ? "bg-purple-600 hover:bg-purple-700" : "bg-slate-900 hover:bg-slate-800")}
                                  onClick={togglePlayback}
                               >
                                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => setCurrentPlaylist(PLAYLISTS[(PLAYLISTS.indexOf(currentPlaylist) + 1) % PLAYLISTS.length])}>
                                  <SkipForward size={18} />
                               </Button>
                            </div>
                            
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                               {PLAYLISTS.map(list => (
                                  <button
                                     key={list.id}
                                     onClick={() => { setCurrentPlaylist(list); setIsPlaying(true); }}
                                     className={cn(
                                        "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                        currentPlaylist.id === list.id 
                                          ? "bg-purple-50 text-purple-700 border-purple-200" 
                                          : "bg-white text-slate-600 border-slate-200 hover:border-purple-200"
                                     )}
                                  >
                                     {list.name}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </div>
                
                {/* Door Display Control - UPDATED */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                         <CardTitle className="flex items-center gap-2 text-base">
                            <Type size={18} className="text-slate-500" /> Door Status Display
                         </CardTitle>
                         <div className="flex items-center gap-2">
                            {DOOR_STATUSES.map(s => (
                                <button 
                                    key={s.id} 
                                    onClick={() => setDoorStatus(s.id)}
                                    className={cn(
                                        "w-3 h-3 rounded-full transition-all ring-2 ring-offset-2",
                                        s.color,
                                        doorStatus === s.id ? "ring-slate-300 scale-125" : "ring-transparent hover:scale-110"
                                    )} 
                                    title={s.label}
                                />
                            ))}
                         </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex gap-6 flex-col md:flex-row">
                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500">CUSTOM MESSAGE</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Enter message..." 
                                            value={tempDoorMessage} 
                                            onChange={(e) => setTempDoorMessage(e.target.value)}
                                            className="bg-slate-50 border-slate-200"
                                            onKeyDown={(e) => e.key === 'Enter' && updateDoorMessage(tempDoorMessage)}
                                        />
                                        <Button onClick={() => updateDoorMessage(tempDoorMessage)} className="bg-slate-900 text-white hover:bg-slate-800">
                                            <Check size={16} />
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Quick Replies / Recents */}
                                <div>
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <History size={10} /> Quick Messages
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Shows Recent Messages + Defaults */}
                                        {[...new Set([...recentMessages, ...DOOR_PRESETS])].slice(0, 6).map((msg, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setTempDoorMessage(msg);
                                                    updateDoorMessage(msg);
                                                }}
                                                className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200"
                                            >
                                                {msg}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Preview */}
                            <div className="md:w-48 w-full bg-slate-900 rounded-lg p-4 text-center flex flex-col items-center justify-center border-4 border-slate-300 shadow-inner h-32 md:h-auto">
                                <div className={cn("w-2 h-2 rounded-full mb-3 animate-pulse", DOOR_STATUSES.find(s => s.id === doorStatus)?.color)} />
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-1">
                                    {DOOR_STATUSES.find(s => s.id === doorStatus)?.label}
                                </div>
                                <div className="text-white text-sm font-serif italic line-clamp-3">
                                    {doorMessage || "Welcome"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

             </div>

             {/* RIGHT COLUMN: Context & Tools (4 cols) */}
             <div className="col-span-12 lg:col-span-4 space-y-6">
                
                {/* Next Meeting */}
                {nextMeeting && (
                    <Card className="border-teal-100 bg-gradient-to-br from-teal-50 to-white shadow-sm">
                        <CardHeader className="pb-2">
                             <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Up Next</div>
                                    <CardTitle className="text-lg">{nextMeeting.title}</CardTitle>
                                </div>
                                <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600">
                                    <CalendarIcon size={20} />
                                </div>
                             </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                             <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                 <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    <span>{format(nextMeeting.start, 'h:mm a')}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                    <Users size={14} />
                                    <span>{nextMeeting.attendees} People</span>
                                 </div>
                             </div>
                             <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm" onClick={() => handleSceneActivate('meet')}>
                                Prep Room for Meeting
                             </Button>
                        </CardContent>
                    </Card>
                )}

                {/* IPTV Remote */}
                <Card className="border-slate-200 shadow-lg bg-slate-900 text-white relative overflow-hidden">
                   {/* Glass effect bg */}
                   <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950 opacity-90" />
                   
                   <CardHeader className="relative z-10 border-b border-white/10 pb-4">
                      <div className="flex items-center justify-between">
                         <CardTitle className="flex items-center gap-2 text-base">
                            <Tv size={18} className="text-teal-400" /> IPTV Remote
                         </CardTitle>
                         <div className="flex items-center gap-2">
                             <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded", tvPower ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                                {tvPower ? 'Online' : 'Standby'}
                             </span>
                             <Switch 
                                checked={tvPower} 
                                onCheckedChange={setTvPower} 
                                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700"
                             />
                         </div>
                      </div>
                   </CardHeader>
                   
                   <CardContent className="relative z-10 p-6 space-y-6">
                      {/* Screen Preview */}
                      <div className="aspect-video bg-black/50 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden group">
                         {tvPower ? (
                            <>
                               <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-purple-900/40 animate-pulse" />
                               <div className="text-center z-10">
                                  {tvSource === 'apps' && activeApp ? (
                                      <>
                                        {/* Dynamic Icon based on app */}
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                                            {APPS.find(a => a.name === activeApp)?.icon && React.createElement(APPS.find(a => a.name === activeApp)!.icon, { size: 24, className: 'text-white' })}
                                        </div>
                                        <div className="text-xs font-medium text-white/70">App • {activeApp}</div>
                                      </>
                                  ) : tvSource === 'live' && activeChannel ? (
                                      <>
                                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg shadow-lg", activeChannel.color)}>
                                            {activeChannel.number}
                                        </div>
                                        <div className="text-xs font-medium text-white/70">Live • {activeChannel.name}</div>
                                      </>
                                  ) : (
                                      <>
                                        <Monitor size={32} className="mx-auto mb-2 text-white/50" />
                                        <div className="text-xs font-medium text-white/70">
                                            {SOURCES.find(s => s.id === tvSource)?.label || 'HDMI 1'} • Signal Active
                                        </div>
                                      </>
                                  )}
                               </div>
                            </>
                         ) : (
                            <div className="text-xs text-slate-600 font-medium">Power Off</div>
                         )}
                      </div>
                      
                      {/* Source Selection */}
                      <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10 overflow-x-auto scrollbar-hide">
                         {SOURCES.map(source => (
                             <button
                                key={source.id}
                                onClick={() => { setTvSource(source.id); if(!tvPower) setTvPower(true); }}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
                                    tvSource === source.id && tvPower
                                        ? "bg-teal-500 text-white shadow-sm"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                             >
                                <source.icon size={12} />
                                {source.label}
                             </button>
                         ))}
                      </div>

                      {/* Main Controls Area */}
                      <div className={cn("space-y-6 transition-all duration-300", !tvPower && "opacity-30 pointer-events-none blur-[1px]")}>
                         
                         {tvSource === 'apps' ? (
                             // App Grid View
                             <div className="grid grid-cols-2 gap-3">
                                 {APPS.map(app => (
                                     <button 
                                        key={app.id}
                                        onClick={() => handleAppLaunch(app)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-all text-left group",
                                            activeApp === app.name 
                                                ? "bg-white/10 border-white/20" 
                                                : "bg-white/5 border-transparent hover:bg-white/10"
                                        )}
                                     >
                                        <div className={cn("w-8 h-8 rounded-md flex items-center justify-center text-white shadow-sm", app.color)}>
                                            <app.icon size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold">{app.name}</div>
                                            <div className="text-[10px] text-slate-400 group-hover:text-slate-300">Launch</div>
                                        </div>
                                     </button>
                                 ))}
                             </div>
                         ) : tvSource === 'live' ? (
                             // Live TV Channel List
                             <div className="grid grid-cols-2 gap-3">
                                 {CHANNELS.map(channel => (
                                     <button 
                                        key={channel.id}
                                        onClick={() => handleChannelSelect(channel)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-all text-left group",
                                            activeChannel.id === channel.id 
                                                ? "bg-white/10 border-white/20" 
                                                : "bg-white/5 border-transparent hover:bg-white/10"
                                        )}
                                     >
                                        <div className={cn("w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-sm", channel.color)}>
                                            {channel.number}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold">{channel.name}</div>
                                            <div className="text-[10px] text-slate-400 group-hover:text-slate-300">Tune In</div>
                                        </div>
                                     </button>
                                 ))}
                             </div>
                         ) : (
                             // Standard Remote Controls
                             <>
                                {/* D-PAD */}
                                <div className="flex flex-col items-center gap-3">
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-white/20 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300">
                                        <ChevronUp size={20} />
                                    </Button>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-white/20 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300">
                                        <ChevronLeft size={20} />
                                        </Button>
                                        <Button className="h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 border-none font-bold">
                                        OK
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-white/20 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300">
                                        <ChevronRight size={20} />
                                        </Button>
                                    </div>
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-white/20 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300">
                                        <ChevronDown size={20} />
                                    </Button>
                                </div>

                                {/* Keypad Toggle */}
                                <div className="flex justify-center">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setShowKeypad(!showKeypad)}
                                        className={cn("text-xs gap-2", showKeypad ? "text-teal-400" : "text-slate-400")}
                                    >
                                        <Hash size={14} /> {showKeypad ? 'Hide Keypad' : 'Show Keypad'}
                                    </Button>
                                </div>

                                {/* Numeric Keypad */}
                                <AnimatePresence>
                                    {showKeypad && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="grid grid-cols-3 gap-2 overflow-hidden"
                                        >
                                            {[1,2,3,4,5,6,7,8,9].map(n => (
                                                <Button key={n} variant="outline" className="h-10 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/30">
                                                    {n}
                                                </Button>
                                            ))}
                                            <Button variant="outline" className="h-10 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/30">.</Button>
                                            <Button variant="outline" className="h-10 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/30">0</Button>
                                            <Button variant="outline" className="h-10 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/30">
                                                <Delete size={14} />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                             </>
                         )}

                         {/* Volume */}
                         <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-3">
                               <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white transition-colors">
                                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                               </button>
                               <Slider 
                                  value={[volume]} 
                                  max={100} 
                                  step={1} 
                                  onValueChange={([v]) => setVolume(v)} 
                                  className="flex-1 [&>.relative>.absolute]:bg-teal-500"
                               />
                            </div>
                         </div>

                      </div>
                   </CardContent>
                </Card>

                 {/* Concierge / Services - UPDATED */}
                 <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="pb-3">
                         <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles size={18} className="text-teal-500" /> Room Services
                         </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-2">
                         <Button 
                            variant="outline" 
                            disabled={requestingService === 'Cleaning'}
                            className="w-full justify-start gap-3 h-auto py-3 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 group relative" 
                            onClick={() => handleServiceRequest('Cleaning')}
                         >
                            {requestingService === 'Cleaning' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>}
                            <div className="p-2 rounded-full bg-slate-100 group-hover:bg-teal-100 transition-colors">
                               <Sparkles size={16} />
                            </div>
                            <div className="text-left">
                               <div className="text-sm font-semibold">Request Cleaning</div>
                               <div className="text-[10px] text-slate-500">Trash pickup & spot clean</div>
                            </div>
                         </Button>

                         <Button 
                            variant="outline" 
                            disabled={requestingService === 'Catering'}
                            className="w-full justify-start gap-3 h-auto py-3 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 group relative" 
                            onClick={() => handleServiceRequest('Catering')}
                         >
                            {requestingService === 'Catering' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-amber-600" /></div>}
                            <div className="p-2 rounded-full bg-slate-100 group-hover:bg-amber-100 transition-colors">
                               <Utensils size={16} />
                            </div>
                            <div className="text-left">
                               <div className="text-sm font-semibold">Catering</div>
                               <div className="text-[10px] text-slate-500">Coffee, water & snacks</div>
                            </div>
                         </Button>

                         <Button 
                            variant="outline" 
                            disabled={requestingService === 'Tech Support'}
                            className="w-full justify-start gap-3 h-auto py-3 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 group relative" 
                            onClick={() => handleServiceRequest('Tech Support')}
                         >
                            {requestingService === 'Tech Support' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                            <div className="p-2 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
                               <Wrench size={16} />
                            </div>
                            <div className="text-left">
                               <div className="text-sm font-semibold">Tech Support</div>
                               <div className="text-[10px] text-slate-500">AV & Connectivity help</div>
                            </div>
                         </Button>
                      </CardContent>
                   </Card>

             </div>

          </div>
        </div>
      </div>
    </div>
  );
};
