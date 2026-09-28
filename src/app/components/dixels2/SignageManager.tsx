import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  LayoutGrid, 
  Workflow, 
  Zap, 
  BarChart3, 
  Settings, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Calendar,
  Car,
  Users,
  Utensils,
  Megaphone,
  ArrowRight,
  ArrowLeft,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  Layers,
  Smartphone,
  MapPin,
  List as ListIcon,
  Search,
  Filter,
  Trash2,
  Clock,
  Monitor,
  LayoutTemplate,
  PieChart,
  Power,
  Type,
  Camera,
  RotateCw,
  FileText,
  Edit,
  Folder,
  Image as ImageIcon,
  Video,
  FileCode,
  Globe,
  Database,
  Link,
  Save,
  Eye,
  ChevronRight,
  ChevronDown,
  GripVertical,
  QrCode as QrCodeIcon,
  Square as SquareIcon,
  Minus,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';

// --- Types ---

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'html' | 'data';
  url: string;
  size?: string;
  updated: string;
}

interface Channel {
  id: string;
  name: string;
  items: ChannelItem[];
  assignedDisplays: number;
  status: 'active' | 'draft' | 'scheduled';
}

interface ChannelItem {
  id: string;
  assetId: string;
  title?: string;
  type?: string;
  duration: string;
  transition?: string;
  schedule?: {
    always: boolean;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    days: string[];
  };
}

interface Display {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  channelId: string;
  lastSync: string;
  ip: string;
  type: string;
}

interface DataFeed {
  id: string;
  name: string;
  provider: 'Salesforce' | 'Google Calendar' | 'RSS' | 'Internal API';
  status: 'connected' | 'error';
  lastRefreshed: string;
}

// --- Mock Data ---

const ASSETS: Asset[] = [
  { id: 'a1', name: 'Company Logo.png', type: 'image', url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=300&fit=crop', size: '1.2 MB', updated: '2 days ago' },
  { id: 'a2', name: 'Q3 Town Hall.mp4', type: 'video', url: '', size: '450 MB', updated: '1 week ago' },
  { id: 'a3', name: 'Cafeteria Menu', type: 'data', url: '', updated: 'Daily' },
  { id: 'a4', name: 'Emergency Evac Map', type: 'image', url: 'https://images.unsplash.com/photo-1555529902-526e142951f0?w=400&h=300&fit=crop', size: '2.4 MB', updated: '1 month ago' },
  { id: 'a5', name: 'Welcome Background', type: 'image', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop', size: '3.1 MB', updated: '3 days ago' },
  { id: 'a6', name: 'Sales Dashboard', type: 'html', url: '', updated: 'Live' },
];

const CHANNELS: Channel[] = [
  { id: 'c1', name: 'Corporate Lobby Loop', items: [], assignedDisplays: 12, status: 'active' },
  { id: 'c2', name: 'Cafeteria Digital Menu', items: [], assignedDisplays: 4, status: 'scheduled' },
  { id: 'c3', name: 'Emergency Override', items: [], assignedDisplays: 45, status: 'draft' },
  { id: 'c4', name: 'Employee Communications', items: [], assignedDisplays: 28, status: 'active' },
];

const DISPLAYS: Display[] = [
  { id: 'd1', name: 'Lobby Video Wall', location: 'HQ - Ground Floor', status: 'online', channelId: 'c1', lastSync: 'Just now', ip: '192.168.1.101', type: 'Samsung QLED' },
  { id: 'd2', name: 'Cafeteria Menu 1', location: 'HQ - Level 2', status: 'online', channelId: 'c2', lastSync: '10 min ago', ip: '192.168.1.104', type: 'LG WebOS' },
  { id: 'd3', name: 'Parking L1 Entrance', location: 'Garage - B1', status: 'warning', channelId: 'c3', lastSync: '1 hour ago', ip: '192.168.1.205', type: 'BrightSign' },
  { id: 'd4', name: 'Exec Boardroom', location: 'HQ - Level 10', status: 'online', channelId: 'c1', lastSync: '5 min ago', ip: '192.168.1.110', type: 'Sony Pro' },
  { id: 'd5', name: 'Innovation Hub', location: 'R&D - Building B', status: 'offline', channelId: 'c4', lastSync: '2 days ago', ip: '192.168.2.050', type: 'Samsung QLED' },
];

const DATA_FEEDS: DataFeed[] = [
  { id: 'df1', name: 'Employee Directory', provider: 'Internal API', status: 'connected', lastRefreshed: '1 min ago' },
  { id: 'df2', name: 'Room Bookings', provider: 'Google Calendar', status: 'connected', lastRefreshed: '30 sec ago' },
  { id: 'df3', name: 'Tech News', provider: 'RSS', status: 'connected', lastRefreshed: '1 hour ago' },
  { id: 'df4', name: 'Salesforce KPI', provider: 'Salesforce', status: 'error', lastRefreshed: 'Failed' },
];

// --- Drag & Drop Types ---
const ITEM_TYPES = {
  ASSET: 'asset',
  WIDGET: 'widget',
};

// --- Sub-components ---

const AssetCard = ({ asset }: { asset: Asset }) => (
  <div className="group relative border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-teal-200 transition-all cursor-grab active:cursor-grabbing">
    <div className="aspect-video bg-slate-50 relative flex items-center justify-center border-b border-slate-100">
        {asset.type === 'image' && <ImageWithFallback src={asset.url} alt={asset.name} className="w-full h-full object-cover" />}
        {asset.type === 'video' && <div className="text-slate-300 group-hover:text-blue-400 transition-colors"><Play size={32} strokeWidth={1.5} /></div>}
        {asset.type === 'data' && <div className="text-slate-300 group-hover:text-emerald-400 transition-colors"><Database size={32} strokeWidth={1.5} /></div>}
        {asset.type === 'html' && <div className="text-slate-300 group-hover:text-orange-400 transition-colors"><Globe size={32} strokeWidth={1.5} /></div>}
        
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
            <Button size="icon" className="h-8 w-8 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:text-teal-600 shadow-sm border-0" onClick={(e) => { e.stopPropagation(); toast.info(`Previewing ${asset.name}`); }}><Eye size={14} /></Button>
            <Button size="icon" className="h-8 w-8 rounded-full bg-teal-600 text-white hover:bg-teal-700 shadow-sm border-0" onClick={(e) => { e.stopPropagation(); toast.success(`Added ${asset.name} to active playlist`); }}><Plus size={14} /></Button>
        </div>
    </div>
    <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="secondary" className={cn("text-[10px] h-4 px-1 rounded font-medium", 
                asset.type === 'image' ? "bg-purple-50 text-purple-700 border-purple-100" :
                asset.type === 'video' ? "bg-blue-50 text-blue-700 border-blue-100" :
                asset.type === 'data' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                "bg-orange-50 text-orange-700 border-orange-100"
            )}>
                {asset.type}
            </Badge>
            <span className="text-[10px] text-slate-400 ml-auto">{asset.size || asset.updated}</span>
        </div>
        <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-teal-700 transition-colors" title={asset.name}>{asset.name}</h4>
    </div>
  </div>
);

const CodeIcon = ({ size, className }: { size: number, className?: string }) => <FileCode size={size} className={className} />;

const ChannelRow = ({ channel, isSelected, onClick }: { channel: Channel, isSelected: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
        "flex items-center p-3 rounded-lg cursor-pointer transition-all border group",
        isSelected 
            ? "bg-teal-50 border-teal-200 shadow-sm" 
            : "bg-white border-slate-100 hover:border-teal-200 hover:shadow-sm"
    )}
  >
    <div className={cn("w-10 h-10 rounded-md flex items-center justify-center mr-3 transition-colors border", 
        isSelected 
            ? "bg-white text-teal-600 border-teal-100" 
            : "bg-slate-50 text-slate-500 border-slate-100 group-hover:border-teal-100 group-hover:bg-teal-50/50 group-hover:text-teal-600"
    )}>
        <Tv size={18} />
    </div>
    <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold text-sm truncate transition-colors", isSelected ? "text-teal-900" : "text-slate-900 group-hover:text-teal-900")}>{channel.name}</h4>
        <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Monitor size={10} /> {channel.assignedDisplays} Displays</span>
            <Badge variant="secondary" className={cn("text-[9px] font-medium h-4 px-1.5", 
                channel.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                channel.status === 'scheduled' ? "bg-blue-50 text-blue-700 border-blue-100" : 
                "bg-amber-50 text-amber-700 border-amber-100"
            )}>
                {channel.status}
            </Badge>
        </div>
    </div>
    <ChevronRight size={16} className={cn("text-slate-300 transition-colors", isSelected ? "text-teal-500" : "group-hover:text-teal-400")} />
  </div>
);

const DisplayCard = ({ display }: { display: Display }) => (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full ring-2 ring-white shadow-sm", 
                        display.status === 'online' ? "bg-emerald-500" : 
                        display.status === 'warning' ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm">{display.name}</h4>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{display.location}</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-slate-50 text-[10px] font-medium text-slate-600 border-slate-200">{display.type}</Badge>
            </div>
            
            <div className="bg-slate-50 rounded-md p-2 mb-3 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Current Channel</span>
                    <span className="text-[10px] text-teal-600 font-medium">Playing</span>
                </div>
                <div className="flex items-center gap-2">
                    <Tv size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-700 truncate">
                        {CHANNELS.find(c => c.id === display.channelId)?.name || 'Unknown Channel'}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>IP: {display.ip}</span>
                <span>Synced: {display.lastSync}</span>
            </div>
        </CardContent>
        <CardFooter className="p-0 bg-slate-50 border-t border-slate-100 grid grid-cols-2">
            <Button variant="ghost" className="h-9 rounded-none text-xs text-slate-500 hover:text-teal-600 border-r border-slate-100" onClick={() => toast.info(`Configuring ${display.name}`)}>
                <Settings size={12} className="mr-2" /> Configure
            </Button>
            <Button variant="ghost" className="h-9 rounded-none text-xs text-slate-500 hover:text-teal-600" onClick={() => toast.success(`Reboot command sent to ${display.name}`)}>
                <RefreshCw size={12} className="mr-2" /> Reboot
            </Button>
        </CardFooter>
    </Card>
);

// --- Draggable Element Component ---
const DraggableElement = ({ element, isSelected, onSelect, onMove, onResize }: { element: any, isSelected: boolean, onSelect: () => void, onMove: (id: string, x: number, y: number) => void, onResize: (id: string, w: any, h: any) => void }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'card-element',
        item: { id: element.id, x: element.x, y: element.y },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            if (delta && item) {
                const left = Math.round(item.x + delta.x);
                const top = Math.round(item.y + delta.y);
                onMove(item.id, left, top);
            }
        }
    });

    const Content = (
        <div 
            className={cn(
                "w-full h-full relative group hover:ring-1 hover:ring-teal-300 transition-shadow",
                isSelected ? "ring-2 ring-teal-500 z-10" : "z-0",
                isDragging ? "opacity-50" : "opacity-100"
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
            {element.type === 'text' && <div style={{...element.style, width: '100%', height: '100%'}}>{element.content}</div>}
            {element.type === 'image' && (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden rounded border border-slate-200">
                    {element.content.startsWith('figma:') ? (
                        <ImageWithFallback src={element.content} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="text-slate-300" size={32} />
                    )}
                </div>
            )}
            {element.type === 'data' && (
                <div style={element.style} className="w-full h-full flex items-center gap-2 border border-dashed border-teal-300 bg-teal-50/50">
                    <Database size={16} />
                    {element.content}
                </div>
            )}
        </div>
    );

    if (isSelected) {
        return (
            <div style={{ position: 'absolute', left: element.x, top: element.y, zIndex: 10 }}>
                <Resizable
                    size={{ width: element.w, height: element.h }}
                    onResizeStop={(e, direction, ref, d) => {
                        onResize(element.id, element.w + d.width, element.h + d.height);
                    }}
                    minWidth={20}
                    minHeight={20}
                    enable={{ top:true, right:true, bottom:true, left:true, topRight:true, bottomRight:true, bottomLeft:true, topLeft:true }}
                    handleClasses={{
                        bottomRight: "w-2 h-2 bg-teal-500 rounded-full absolute -bottom-1 -right-1 cursor-se-resize z-50",
                        bottomLeft: "w-2 h-2 bg-teal-500 rounded-full absolute -bottom-1 -left-1 cursor-sw-resize z-50",
                        topRight: "w-2 h-2 bg-teal-500 rounded-full absolute -top-1 -right-1 cursor-ne-resize z-50",
                        topLeft: "w-2 h-2 bg-teal-500 rounded-full absolute -top-1 -left-1 cursor-nw-resize z-50",
                    }}
                >
                    <div ref={drag as any} className="w-full h-full cursor-move">
                        {Content}
                    </div>
                </Resizable>
            </div>
        );
    }

    return (
        <div 
            ref={drag as any}
            className="absolute cursor-move"
            style={{ 
                left: element.x, 
                top: element.y,
                width: element.w,
                height: element.h
            }}
        >
            {Content}
        </div>
    );
};

const DeviceRegistrationDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Register New Display</DialogTitle>
                    <DialogDescription>
                        Enter the 6-digit pairing code shown on the display screen.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-6 flex justify-center">
                    <div className="flex gap-2">
                         {code.map((c, i) => (
                             <Input 
                                key={i} 
                                className="w-10 h-12 text-center text-xl font-mono uppercase" 
                                maxLength={1}
                                value={c}
                                onChange={(e) => {
                                    const newCode = [...code];
                                    newCode[i] = e.target.value;
                                    setCode(newCode);
                                }}
                             />
                         ))}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                    <div className="flex items-start gap-3">
                        <Monitor size={20} className="text-slate-400 mt-1" />
                        <div>
                            <h4 className="font-medium text-sm text-slate-900">Detected Device</h4>
                            <p className="text-xs text-slate-500">Samsung QLED 55" (Tizen 6.0)</p>
                            <p className="text-xs text-slate-400 mt-1">IP: 192.168.1.142</p>
                        </div>
                        <Badge className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-200">Ready</Badge>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => {
                        const promise = MockSignageService.registerDevice(code.join(''));
                        toast.promise(promise, {
                            loading: 'Registering device...',
                            success: (data) => {
                                onOpenChange(false);
                                return `Device "${data.device.name}" registered successfully`;
                            },
                            error: 'Failed to register device'
                        });
                    }}>
                        Register Device
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const PreviewModal = ({ open, onOpenChange, elements }: { open: boolean, onOpenChange: (open: boolean) => void, elements: any[] }) => {
    const [mockContext, setMockContext] = useState({
        Visitor_Name: 'Sarah Conner',
        Visitor_Company: 'SkyNet Systems',
        Weather_Temp: '72°F',
        Room_Status: 'Occupied'
    });

    // Replace placeholders in content with mock data
    const resolveContent = (content: string) => {
        if (!content) return '';
        let text = content;
        Object.entries(mockContext).forEach(([key, value]) => {
            text = text.replace(new RegExp(`{${key}}`, 'g'), value);
        });
        return text;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden bg-slate-900 text-white border-slate-700">
                <div className="h-14 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-950">
                    <DialogTitle className="sr-only">Live Preview</DialogTitle>
                    <DialogDescription className="sr-only">Real-time preview of the digital signage content.</DialogDescription>
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                         <span className="font-mono text-sm font-bold text-slate-200">LIVE PREVIEW</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => onOpenChange(false)}><X size={20} /></Button>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    {/* The Player Canvas */}
                    <div className="flex-1 flex items-center justify-center bg-black relative">
                        <div className="bg-white relative overflow-hidden shadow-2xl" style={{ width: '960px', height: '540px' }}>
                             {elements.map(el => (
                                <div 
                                    key={el.id}
                                    style={{ 
                                        position: 'absolute',
                                        left: el.x, 
                                        top: el.y,
                                        width: el.w,
                                        height: el.h,
                                        ...el.style
                                    }}
                                    className="overflow-hidden"
                                >
                                    {el.type === 'text' && <div style={{width:'100%', height:'100%', ...el.style}}>{resolveContent(el.content)}</div>}
                                    {el.type === 'image' && (
                                        <div className="w-full h-full relative">
                                            {el.content.startsWith('figma:') ? (
                                                <ImageWithFallback src={el.content} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {el.type === 'data' && (
                                         <div className="w-full h-full flex items-center justify-center bg-teal-50/10 text-teal-800 font-bold" style={el.style}>
                                             {resolveContent(el.content)}
                                         </div>
                                    )}
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* Simulation Controls */}
                    <div className="w-80 border-l border-slate-700 bg-slate-900 p-6 overflow-y-auto">
                        <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2"><Settings size={16} /> Simulation Context</h3>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase">Visitor Name</Label>
                                <Input 
                                    className="bg-slate-800 border-slate-700 text-slate-200" 
                                    value={mockContext.Visitor_Name}
                                    onChange={e => setMockContext({...mockContext, Visitor_Name: e.target.value})} 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase">Trigger Event</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900 justify-start gap-2" onClick={() => setMockContext({...mockContext, Room_Status: 'Emergency'})}>
                                        <AlertTriangle size={14} /> Fire Alarm
                                    </Button>
                                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-emerald-900/20 hover:text-emerald-400 hover:border-emerald-900 justify-start gap-2" onClick={() => setMockContext({...mockContext, Visitor_Name: 'VIP Guest'})}>
                                        <Zap size={14} /> VIP Arrival
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const SortablePlaylistItem = ({ item, index, moveItem, children }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const [, drop] = useDrop({
        accept: 'playlist-item',
        hover(item: { index: number, id: string, type: string }) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            moveItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: 'playlist-item',
        item: { type: 'playlist-item', id: item.id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    drag(drop(ref));
    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
            {children}
        </div>
    );
};

// --- Mock Backend Service ---
const MockSignageService = {
  saveTemplate: async (templateName: string, elements: any[]) => {
    return new Promise<{ success: boolean; id: string }>((resolve) => {
      setTimeout(() => {
        console.log(`[MockAPI] Saved Template "${templateName}" with ${elements.length} elements.`);
        resolve({ success: true, id: `tpl_${Date.now()}` });
      }, 800);
    });
  },
  saveRule: async (rule: any) => {
    return new Promise<{ success: boolean; id: string }>((resolve) => {
      setTimeout(() => {
        console.log('[MockAPI] Saved Automation Rule:', rule);
        resolve({ success: true, id: `rule_${Date.now()}` });
      }, 800);
    });
  },
  publishChannel: async (channelId: string, items: any[]) => {
    return new Promise<{ success: boolean; version: string }>((resolve) => {
      setTimeout(() => {
        console.log(`[MockAPI] Published Channel ${channelId} with ${items.length} items.`);
        resolve({ success: true, version: `v${Date.now()}` });
      }, 1000);
    });
  },
  registerDevice: async (code: string) => {
    return new Promise<{ success: boolean; device: any }>((resolve) => {
      setTimeout(() => {
        console.log(`[MockAPI] Registered Device with code: ${code}`);
        resolve({ 
            success: true, 
            device: { id: `dev_${Date.now()}`, name: "New Samsung Display", location: "Unassigned" } 
        });
      }, 1500);
    });
  }
};

// --- Main Component ---

export const SignageManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cms');
  const [cmsSection, setCmsSection] = useState<'overview' | 'channels' | 'library' | 'cards' | 'networks'>('cards');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>('c1');
  const [isSaving, setIsSaving] = useState(false);
  
  // Cards / Template Designer State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [cardElements, setCardElements] = useState([
    { id: 'el1', type: 'text', x: 40, y: 40, w: 400, h: 60, content: 'Welcome to The Executive Council', style: { fontSize: '48px', fontWeight: 'bold', color: '#1e293b' } },
    { id: 'el2', type: 'image', x: 40, y: 120, w: 400, h: 250, content: 'figma:asset/76faf8f617b56e6f079c5a7ead8f927f5a5fee32.png', style: {} }, // Using placeholder
    { id: 'el3', type: 'data', x: 500, y: 120, w: 250, h: 80, content: '{Visitor_Name}', style: { fontSize: '32px', color: '#0d9488', backgroundColor: '#f0fdfa', padding: '8px', borderRadius: '4px' } }
  ]);
  const [isRegisterDeviceOpen, setIsRegisterDeviceOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Dialog States
  const [isChannelSettingsOpen, setIsChannelSettingsOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Search State
  const [channelSearch, setChannelSearch] = useState('');

  const handleElementDrag = (id: string, x: number, y: number) => {
    setCardElements(prev => prev.map(el => el.id === id ? { ...el, x, y } : el));
  };

  const handleElementResize = (id: string, w: any, h: any) => {
    setCardElements(prev => prev.map(el => el.id === id ? { ...el, w, h } : el));
  };
  
  // CMS State
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [assets, setAssets] = useState<Asset[]>(ASSETS);
  const [channelTab, setChannelTab] = useState<'content' | 'schedule'>('content');

  // Channel Editor Mock State
  const [editingItem, setEditingItem] = useState<ChannelItem | null>(null);
  const [channelItems, setChannelItems] = useState<ChannelItem[]>([
    { id: '1', title: 'Welcome Video', duration: '30s', type: 'video', assetId: 'a1' },
    { id: '2', title: 'Q3 Results', duration: '15s', type: 'image', assetId: 'a2', schedule: { always: false, days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '12:00' } },
    { id: '3', title: 'Weather Widget', duration: '10s', type: 'widget', assetId: 'a3' },
  ]);

  const moveChannelItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = channelItems[dragIndex];
    const newItems = [...channelItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    setChannelItems(newItems);
  };

  // Orchestrator State
  const [orchestratorView, setOrchestratorView] = useState<'list' | 'editor'>('list');
  const [rules, setRules] = useState([
    { id: 'r1', name: 'Emergency Evacuation', trigger: 'Fire Alarm System', condition: 'status == "active"', action: 'Override: Emergency Map', status: 'active' },
    { id: 'r2', name: 'VIP Welcome', trigger: 'Visitor Check-in', condition: 'type == "VIP"', action: 'Playlist: Lobby Welcome', status: 'active' },
    { id: 'r3', name: 'Cafeteria Lunch Menu', trigger: 'Time of Day', condition: 'time >= 11:30 && time <= 14:00', action: 'Playlist: Lunch Menu', status: 'active' },
  ]);

  const renderOrchestrator = () => (
    <div className="flex h-full bg-slate-50">
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10">
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Workflow size={20} /></div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-none">Automation</h2>
                        <span className="text-xs text-slate-500 font-medium">Orchestration Engine</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">Configure logic to dynamically override display content based on data triggers.</p>
                
                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => setOrchestratorView('editor')}>
                    <Plus size={16} /> New Rule
                </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Rules ({rules.length})</span>
                     <Button variant="ghost" size="icon" className="h-6 w-6"><Filter size={12} /></Button>
                </div>
                {rules.map(rule => (
                    <div key={rule.id} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all group" onClick={() => setOrchestratorView('editor')}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm text-slate-800">{rule.name}</span>
                            <div className={`w-2 h-2 rounded-full ${rule.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Zap size={12} className="text-amber-500" />
                                <span className="truncate">{rule.trigger}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <ArrowRight size={12} className="text-slate-400" />
                                <span className="truncate font-medium text-indigo-600">{rule.action}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
            {orchestratorView === 'list' ? (
                <div className="flex-1 flex items-center justify-center p-12">
                     <div className="text-center max-w-lg">
                        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Workflow size={40} className="text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Select a Rule to Configure</h2>
                        <p className="text-slate-500 mb-8">Orchestration rules allow you to bind physical events (like fire alarms, sensors, or check-ins) to digital responses on your signage network.</p>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => toast.info("Configure Triggers")}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-1.5 bg-amber-100 text-amber-700 rounded"><Zap size={16} /></div>
                                    <span className="font-bold text-sm text-slate-900">Triggers</span>
                                </div>
                                <p className="text-xs text-slate-500">Connect to external APIs, Webhooks, or Hardware sensors.</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => toast.info("Configure Actions")}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-1.5 bg-teal-100 text-teal-700 rounded"><Tv size={16} /></div>
                                    <span className="font-bold text-sm text-slate-900">Actions</span>
                                </div>
                                <p className="text-xs text-slate-500">Override content, change volume, or turn displays on/off.</p>
                            </div>
                        </div>
                     </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full">
                     <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <Button variant="ghost" size="icon" onClick={() => setOrchestratorView('list')}><ArrowLeft size={18} /></Button>
                             <div>
                                 <h3 className="font-bold text-slate-900">New Automation Rule</h3>
                                 <p className="text-xs text-slate-500">Draft Mode</p>
                             </div>
                         </div>
                         <Button 
                            className="bg-indigo-600 text-white gap-2" 
                            disabled={isSaving}
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    await MockSignageService.saveRule({ 
                                        trigger: 'Visitor Check-in', 
                                        action: 'Override Playlist', 
                                        conditions: [] 
                                    });
                                    toast.success("Automation Rule Saved", { description: "The logic has been deployed to the edge nodes." });
                                    setOrchestratorView('list');
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                         >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
                            {isSaving ? 'Saving...' : 'Save Rule'}
                         </Button>
                     </div>
                     <div className="flex-1 p-8 overflow-y-auto">
                         <div className="max-w-3xl mx-auto space-y-8">
                             {/* Visual Logic Flow */}
                             <div className="relative">
                                 <div className="absolute left-8 top-10 bottom-0 w-0.5 bg-slate-200" />
                                 
                                 <div className="relative z-10 space-y-8">
                                     {/* Trigger Step */}
                                     <div className="flex gap-4">
                                         <div className="w-16 h-16 rounded-2xl bg-white border-2 border-amber-200 flex items-center justify-center shadow-sm shrink-0 z-10">
                                             <Zap size={24} className="text-amber-500" />
                                         </div>
                                         <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                             <div className="flex justify-between mb-4">
                                                 <h4 className="font-bold text-slate-900">1. Trigger Event</h4>
                                                 <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Required</Badge>
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                 <div className="space-y-2">
                                                     <Label>Source System</Label>
                                                     <Select defaultValue="vms">
                                                         <SelectTrigger><SelectValue /></SelectTrigger>
                                                         <SelectContent>
                                                             <SelectItem value="vms">Visitor Management (VMS)</SelectItem>
                                                             <SelectItem value="bms">Building Management (BMS)</SelectItem>
                                                             <SelectItem value="api">External API</SelectItem>
                                                         </SelectContent>
                                                     </Select>
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label>Event Type</Label>
                                                     <Select defaultValue="checkin">
                                                         <SelectTrigger><SelectValue /></SelectTrigger>
                                                         <SelectContent>
                                                             <SelectItem value="checkin">Visitor Check-in</SelectItem>
                                                             <SelectItem value="block">Visitor Blocked</SelectItem>
                                                             <SelectItem value="vip">VIP Arrival</SelectItem>
                                                         </SelectContent>
                                                     </Select>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>

                                     {/* Condition Step */}
                                     <div className="flex gap-4">
                                         <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm shrink-0 z-10 text-slate-400">
                                             <Filter size={24} />
                                         </div>
                                         <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                             <div className="flex justify-between mb-4">
                                                 <h4 className="font-bold text-slate-900">2. Conditions (Optional)</h4>
                                                 <Button variant="ghost" size="sm" className="text-xs h-6">Add Condition</Button>
                                             </div>
                                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                                                 <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded">visitor.type</span>
                                                 <span className="text-xs font-bold text-slate-500">EQUALS</span>
                                                 <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded">"VIP"</span>
                                             </div>
                                         </div>
                                     </div>

                                     {/* Action Step */}
                                     <div className="flex gap-4">
                                         <div className="w-16 h-16 rounded-2xl bg-white border-2 border-teal-200 flex items-center justify-center shadow-sm shrink-0 z-10">
                                             <Monitor size={24} className="text-teal-600" />
                                         </div>
                                         <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                             <div className="flex justify-between mb-4">
                                                 <h4 className="font-bold text-slate-900">3. Action</h4>
                                                 <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">Required</Badge>
                                             </div>
                                             <div className="space-y-4">
                                                 <div className="space-y-2">
                                                     <Label>Response Type</Label>
                                                     <Select defaultValue="playlist">
                                                         <SelectTrigger><SelectValue /></SelectTrigger>
                                                         <SelectContent>
                                                             <SelectItem value="playlist">Override Playlist</SelectItem>
                                                             <SelectItem value="overlay">Show Overlay Message</SelectItem>
                                                             <SelectItem value="power">Power Control</SelectItem>
                                                         </SelectContent>
                                                     </Select>
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label>Target Channel / Template</Label>
                                                     <Select defaultValue="tpl_vip">
                                                         <SelectTrigger className="bg-slate-50">
                                                             <div className="flex items-center gap-2">
                                                                 <LayoutTemplate size={16} className="text-indigo-500" />
                                                                 <SelectValue />
                                                             </div>
                                                         </SelectTrigger>
                                                         <SelectContent>
                                                             <SelectItem value="tpl_vip">Lobby Welcome - VIP Edition</SelectItem>
                                                             <SelectItem value="tpl_fire">Emergency Evacuation Map</SelectItem>
                                                             <SelectItem value="tpl_lunch">Daily Lunch Menu</SelectItem>
                                                             <SelectItem value="tpl_corp">Corporate General Loop</SelectItem>
                                                         </SelectContent>
                                                     </Select>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
            )}
        </div>
    </div>
  );

  const renderCMSContent = () => {
    switch(cmsSection) {
        case 'cards_deprecated':
            return (
                <div className="flex h-full">
                    {/* Widget Library Sidebar */}
                    <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
                        <div className="p-4 border-b border-slate-200">
                             <h3 className="font-bold text-slate-900 mb-4">Template Designer</h3>
                             <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Basic Elements</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700" onClick={() => setCardElements([...cardElements, { id: `new_${Date.now()}`, type: 'text', x: 50, y: 50, w: 200, h: 50, content: 'New Text Block', style: { fontSize: '24px', color: '#000' } }])}>
                                            <Type size={20} />
                                            <span className="text-xs">Text</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700" onClick={() => setCardElements([...cardElements, { id: `new_${Date.now()}`, type: 'image', x: 100, y: 100, w: 300, h: 200, content: '', style: {} }])}>
                                            <ImageIcon size={20} />
                                            <span className="text-xs">Image</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700">
                                            <SquareIcon size={20} />
                                            <span className="text-xs">Shape</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700">
                                            <QrCodeIcon size={20} />
                                            <span className="text-xs">QR Code</span>
                                        </Button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Data Widgets</h4>
                                    <div className="space-y-2">
                                        {['Visitor Name', 'Room Status', 'Weather', 'News Feed', 'Stock Ticker'].map(widget => (
                                            <div key={widget} className="flex items-center gap-2 p-2 border border-slate-200 rounded-md bg-slate-50 cursor-grab hover:border-teal-300 hover:shadow-sm"
                                                 onClick={() => setCardElements([...cardElements, { id: `data_${Date.now()}`, type: 'data', x: 150, y: 150, w: 250, h: 60, content: `{${widget}}`, style: { fontSize: '18px', color: '#0f766e', backgroundColor: '#f0fdfa', padding: '10px', borderRadius: '4px' } }])}>
                                                <Database size={14} className="text-teal-600" />
                                                <span className="text-sm font-medium text-slate-700">{widget}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-8">
                        {/* Canvas Board */}
                        <div 
                            className="bg-white shadow-lg relative"
                            style={{ width: '960px', height: '540px' }} // 16:9 1080p scaled down
                            onClick={() => setSelectedElementId(null)}
                        >
                            <DndProvider backend={HTML5Backend}>
                                {cardElements.map(el => (
                                    <DraggableElement 
                                        key={el.id} 
                                        element={el} 
                                        isSelected={selectedElementId === el.id}
                                        onSelect={() => setSelectedElementId(el.id)}
                                        onMove={handleElementDrag}
                                    />
                                ))}
                            </DndProvider>

                            {/* Safe Zone Indicators */}
                            <div className="absolute top-4 left-4 right-4 bottom-4 border border-dashed border-slate-200 pointer-events-none" />
                        </div>
                        
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-lg text-xs font-mono text-slate-500">
                            1920 x 1080 (Scaled 50%)
                        </div>
                    </div>

                    {/* Properties Panel */}
                    <div className="w-72 border-l border-slate-200 bg-white flex flex-col">
                        <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm">Properties</h3>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            {selectedElementId ? (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs text-slate-500 uppercase font-bold">Content</Label>
                                            <Input 
                                                className="mt-1.5" 
                                                value={cardElements.find(e => e.id === selectedElementId)?.content}
                                                onChange={(e) => setCardElements(cardElements.map(el => el.id === selectedElementId ? { ...el, content: e.target.value } : el))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs text-slate-500 uppercase font-bold">X Position</Label>
                                                <Input 
                                                    className="mt-1.5" type="number"
                                                    value={cardElements.find(e => e.id === selectedElementId)?.x}
                                                    onChange={(e) => setCardElements(cardElements.map(el => el.id === selectedElementId ? { ...el, x: parseInt(e.target.value) } : el))}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-500 uppercase font-bold">Y Position</Label>
                                                <Input 
                                                    className="mt-1.5" type="number"
                                                    value={cardElements.find(e => e.id === selectedElementId)?.y}
                                                    onChange={(e) => setCardElements(cardElements.map(el => el.id === selectedElementId ? { ...el, y: parseInt(e.target.value) } : el))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-sm text-slate-900">Appearance</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" size="sm" className="h-8"><Type size={14} className="mr-2"/> Font</Button>
                                            <Button variant="outline" size="sm" className="h-8"><SquareIcon size={14} className="mr-2"/> Color</Button>
                                        </div>
                                    </div>

                                    <Button variant="destructive" className="w-full mt-4" onClick={() => {
                                        setCardElements(cardElements.filter(e => e.id !== selectedElementId));
                                        setSelectedElementId(null);
                                    }}>
                                        <Trash2 size={14} className="mr-2" /> Remove Element
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 py-8">
                                    <p className="text-sm">Select an element on the canvas to edit its properties.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );

        case 'overview':
            return (
                <div className="p-6 space-y-6 overflow-y-auto h-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Signage Dashboard</h2>
                            <p className="text-slate-500">Overview of your digital signage network.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), {
                                loading: 'Refreshing network status...',
                                success: 'System status updated',
                                error: 'Failed to refresh'
                            })}><RefreshCw size={16} /> Refresh Status</Button>
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => {
                                toast.info("Navigating to Template Designer");
                                setCmsSection('cards');
                            }}><Plus size={16} /> Create Content</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <Card className="border-slate-200 shadow-sm bg-white">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><Monitor size={24} /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Online Displays</p>
                                    <h3 className="text-2xl font-bold text-slate-900">42/47</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm bg-white">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Tv size={24} /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Active Channels</p>
                                    <h3 className="text-2xl font-bold text-slate-900">12</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm bg-white">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Layers size={24} /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Assets</p>
                                    <h3 className="text-2xl font-bold text-slate-900">1,284</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm bg-white">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><AlertTriangle size={24} /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Alerts</p>
                                    <h3 className="text-2xl font-bold text-slate-900">3</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <Card className="col-span-2 border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { action: 'Published Channel', target: 'Corporate Lobby Loop', user: 'Sarah Chen', time: '10 mins ago', icon: Tv },
                                        { action: 'Uploaded Asset', target: 'Q4_Marketing_Promo.mp4', user: 'Mike Ross', time: '1 hour ago', icon: ImageIcon },
                                        { action: 'Updated Playlist', target: 'Cafeteria Menu', user: 'System Auto', time: '2 hours ago', icon: ListIcon },
                                        { action: 'Device Offline', target: 'Innovation Hub Display', user: 'Alert', time: '4 hours ago', icon: WifiOff },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                                <item.icon size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">{item.action}: <span className="font-normal text-slate-600">{item.target}</span></p>
                                                <p className="text-xs text-slate-400">{item.user} • {item.time}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><ChevronRight size={14} /></Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                             <CardHeader>
                                <CardTitle className="text-base">Storage Usage</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="flex items-center justify-center py-4">
                                    <div className="w-32 h-32 rounded-full border-8 border-slate-200 border-t-teal-500 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-slate-900">45%</span>
                                        <span className="text-xs text-slate-500">Used</span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Video</span>
                                        <span className="font-medium">240 GB</span>
                                    </div>
                                    <Progress value={75} className="h-1.5 bg-slate-200" indicatorClassName="bg-blue-500" />
                                    
                                    <div className="flex justify-between text-slate-600 mt-2">
                                        <span>Images</span>
                                        <span className="font-medium">45 GB</span>
                                    </div>
                                    <Progress value={25} className="h-1.5 bg-slate-200" indicatorClassName="bg-purple-500" />
                                </div>
                             </CardContent>
                        </Card>
                    </div>
                </div>
            );
            
        case 'channels':
            return (
                <div className="flex h-full">
                    {/* Channel List */}
                    <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
                        <div className="p-4 border-b border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900">Channels</h3>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast.success("Channel Created", { description: "New draft channel has been added." })}><Plus size={16} /></Button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search channels..." 
                                    className="pl-9 h-9 bg-slate-50" 
                                    value={channelSearch}
                                    onChange={(e) => setChannelSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-3 space-y-2">
                                {CHANNELS.filter(c => c.name.toLowerCase().includes(channelSearch.toLowerCase())).map(channel => (
                                    <ChannelRow 
                                        key={channel.id} 
                                        channel={channel} 
                                        isSelected={selectedChannelId === channel.id}
                                        onClick={() => setSelectedChannelId(channel.id)}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Channel Editor */}
                    <div className="flex-1 flex flex-col bg-slate-50">
                        {selectedChannelId ? (
                            <>
                                {/* Editor Header */}
                                <div className="bg-white border-b border-slate-200">
                                    <div className="h-16 px-6 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                {CHANNELS.find(c => c.id === selectedChannelId)?.name}
                                                <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">Live</Badge>
                                            </h2>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <Clock size={12} /> Total Duration: 12m 30s • Updated by Sarah Chen
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsChannelSettingsOpen(true)}><Settings size={14} /> Settings</Button>
                                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsPreviewOpen(true)}><Eye size={14} /> Preview</Button>
                                            <Button 
                                                size="sm" 
                                                className="bg-teal-600 hover:bg-teal-700 text-white gap-2" 
                                                disabled={isSaving}
                                                onClick={async () => {
                                                    if (!selectedChannelId) return;
                                                    setIsSaving(true);
                                                    try {
                                                        await MockSignageService.publishChannel(selectedChannelId, channelItems);
                                                        toast.success("Channel Published Successfully", { description: "Content is now live on 12 displays." });
                                                    } finally {
                                                        setIsSaving(false);
                                                    }
                                                }}
                                            >
                                                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 
                                                {isSaving ? 'Publishing...' : 'Publish'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="px-6 flex gap-6">
                                        <button 
                                            className={cn("pb-3 text-sm font-medium border-b-2 transition-colors", channelTab === 'content' ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700")}
                                            onClick={() => setChannelTab('content')}
                                        >
                                            Content & Playlist
                                        </button>
                                        <button 
                                            className={cn("pb-3 text-sm font-medium border-b-2 transition-colors", channelTab === 'schedule' ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700")}
                                            onClick={() => setChannelTab('schedule')}
                                        >
                                            Scheduling
                                        </button>
                                    </div>
                                </div>

                                {/* Editor Canvas */}
                                <div className="flex-1 overflow-hidden flex flex-col p-6">
                                    {channelTab === 'content' ? (
                                        <>
                                    {/* Visual Playlist Timeline */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                            <h3 className="font-semibold text-sm text-slate-700">Playlist Content</h3>
                                            <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50" onClick={() => setIsLibraryModalOpen(true)}><Plus size={14} className="mr-1" /> Add Content</Button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                            {channelItems.map((item, index) => (
                                                <SortablePlaylistItem 
                                                    key={item.id} 
                                                    index={index} 
                                                    item={item} 
                                                    moveItem={moveChannelItem}
                                                >
                                                    <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-300 hover:shadow-sm transition-all group cursor-move">
                                                        <div className="text-slate-300 group-hover:text-slate-400 cursor-grab"><GripVertical size={16} /></div>
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-mono text-xs text-slate-500 font-bold border border-slate-200">
                                                            {index + 1}
                                                        </div>
                                                        <div className="w-16 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400">
                                                            {item.type === 'video' ? <Play size={16} /> : item.type === 'image' ? <ImageIcon size={16} /> : <Zap size={16} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                                                                {item.schedule && !item.schedule.always && (
                                                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded border border-amber-200">
                                                                        <Calendar size={10} />
                                                                        Scheduled
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1 bg-slate-50 px-1.5 rounded border border-slate-100"><Clock size={10} /> {item.duration}</span>
                                                                <span className="uppercase tracking-wider text-[10px]">{item.type}</span>
                                                                {item.schedule && !item.schedule.always && (
                                                                     <span className="text-slate-400">• {item.schedule.days.length} days active</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={() => setEditingItem(item)}><Settings size={14} /></Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => {
                                                                setChannelItems(channelItems.filter(i => i.id !== item.id));
                                                                toast.success("Item Removed");
                                                            }}><Trash2 size={14} /></Button>
                                                        </div>
                                                    </div>
                                                </SortablePlaylistItem>
                                            ))}
                                            
                                            <div 
                                                className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50/30 hover:border-teal-200 transition-all cursor-pointer"
                                                onClick={() => setIsLibraryModalOpen(true)}
                                            >
                                                <Plus size={24} className="mb-2" />
                                                <p className="font-medium text-sm">Drag content here or click to browse library</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deployment Context */}
                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Monitor size={16} /> Deployed to {CHANNELS.find(c => c.id === selectedChannelId)?.assignedDisplays} Displays
                                            </h3>
                                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                                                {DISPLAYS.filter(d => d.channelId === selectedChannelId).map(display => (
                                                    <div key={display.id} className="flex-shrink-0 w-64 bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center gap-3">
                                                        <div className={cn("w-2 h-2 rounded-full", display.status === 'online' ? "bg-emerald-500" : "bg-red-500")} />
                                                        <div>
                                                            <p className="font-semibold text-xs text-slate-900">{display.name}</p>
                                                            <p className="text-[10px] text-slate-500">{display.location}</p>
                                                        </div>
                                                        <div className="ml-auto text-[10px] text-slate-400 font-mono">{display.ip}</div>
                                                    </div>
                                                ))}
                                                <Button variant="outline" className="h-auto w-32 border-dashed text-xs text-slate-500 flex flex-col gap-1 items-center justify-center hover:text-teal-600 hover:border-teal-200" onClick={() => toast.info("Opening display assignment dialog...")}>
                                                    <Plus size={16} /> Assign Display
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Workflow size={16} /> Active Overrides & Triggers
                                            </h3>
                                            <Card className="bg-slate-50 border-dashed border-slate-300 shadow-none">
                                                <CardContent className="p-3 text-xs text-slate-500 flex items-center justify-center min-h-[80px]">
                                                    <div className="text-center">
                                                        <Zap size={20} className="mx-auto mb-1 text-slate-400" />
                                                        <p>No active data triggers for this channel.</p>
                                                        <Button variant="link" className="h-auto p-0 text-teal-600 text-[10px]" onClick={() => setActiveTab('orchestrator')}>Configure Automation Rules</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                    </>
                                    ) : (
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 p-6 overflow-y-auto">
                                           <div className="max-w-4xl">
                                               <h3 className="text-lg font-bold text-slate-900 mb-4">Channel Schedule</h3>
                                               
                                               <div className="space-y-6">
                                                   <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                                                        <div className="p-2 bg-white rounded border border-slate-200 shadow-sm">
                                                            <Clock size={20} className="text-teal-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-sm">Default Schedule</h4>
                                                            <p className="text-xs text-slate-500 mt-1">This channel plays 24/7 by default unless overridden by a specific rule.</p>
                                                        </div>
                                                        <Switch defaultChecked className="ml-auto" />
                                                   </div>
                                
                                                   <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                             <h4 className="font-bold text-slate-900 text-sm">Weekly Timer</h4>
                                                             <Button size="sm" variant="outline" className="h-8 gap-2"><Plus size={14} /> Add Time Block</Button>
                                                        </div>
                                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                                                <div key={day} className="flex items-center border-b border-slate-100 last:border-0 p-3 hover:bg-slate-50">
                                                                    <div className="w-24 font-medium text-slate-700 text-sm">{day}</div>
                                                                    <div className="flex-1 flex gap-2">
                                                                        <div className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded border border-teal-200 flex items-center gap-2">
                                                                            08:00 - 20:00
                                                                            <Button size="icon" variant="ghost" className="h-4 w-4 hover:bg-teal-200 rounded-full"><X size={10} /></Button>
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400"><Plus size={14} /></Button>
                                                                </div>
                                                            ))}
                                                            {['Saturday', 'Sunday'].map(day => (
                                                                <div key={day} className="flex items-center border-b border-slate-100 last:border-0 p-3 hover:bg-slate-50 bg-slate-50/50">
                                                                    <div className="w-24 font-medium text-slate-500 text-sm">{day}</div>
                                                                    <div className="flex-1 flex gap-2">
                                                                        <span className="text-xs text-slate-400 italic">No active schedule (Screen Off)</span>
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400"><Plus size={14} /></Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                   </div>
                                               </div>
                                           </div>
                                       </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <Tv size={48} className="mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-1">Select a Channel</h3>
                                <p className="text-sm">Choose a channel from the sidebar to manage its content.</p>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'library':
            return (
                <div className="flex h-full">
                    {/* Sidebar Filters */}
                    <div className="w-64 border-r border-slate-200 bg-white p-4">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white mb-6 gap-2" onClick={() => setIsUploadModalOpen(true)}>
                            <Plus size={16} /> Upload Asset
                        </Button>
                        
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">My Library</h4>
                                <div className="space-y-0.5">
                                    {[
                                        { id: 'all', label: 'All Assets' },
                                        { id: 'image', label: 'Images' },
                                        { id: 'video', label: 'Videos' },
                                        { id: 'data', label: 'Data Feeds' },
                                        { id: 'html', label: 'HTML Packages' }
                                    ].map(item => (
                                        <Button 
                                            key={item.id} 
                                            variant="ghost" 
                                            className={cn(
                                                "w-full justify-start text-sm h-8 font-medium px-2",
                                                libraryFilter === item.id ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                                            )}
                                            onClick={() => setLibraryFilter(item.id)}
                                        >
                                            {item.id === 'all' ? <LayoutGrid size={14} className="mr-2 text-slate-400" /> : <Folder size={14} className="mr-2 text-slate-400" />}
                                            {item.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Integrations</h4>
                                <div className="space-y-0.5">
                                    <Button variant="ghost" className="w-full justify-start text-sm h-8 font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 px-2" onClick={() => toast.success("Connected to OneDrive")}>
                                        <div className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-[10px] font-bold">D</div>
                                        OneDrive
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start text-sm h-8 font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 px-2" onClick={() => toast.success("Connected to Adobe CC")}>
                                        <div className="w-4 h-4 rounded bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-[10px] font-bold">A</div>
                                        Adobe CC
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start text-sm h-8 font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 px-2" onClick={() => toast.success("Connected to Canva")}>
                                        <div className="w-4 h-4 rounded bg-orange-100 text-orange-600 flex items-center justify-center mr-2 text-[10px] font-bold">C</div>
                                        Canva
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Grid */}
                    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {assets.filter(a => libraryFilter === 'all' || a.type === libraryFilter).map(asset => (
                                <AssetCard key={asset.id} asset={asset} />
                            ))}
                            {/* Upload Placeholder */}
                            <div 
                                className="border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer min-h-[200px]"
                                onClick={() => setIsUploadModalOpen(true)}
                            >
                                <Plus size={32} className="mb-2" />
                                <span className="font-medium text-sm">Drop files to upload</span>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'cards':
            return (
                <div className="flex h-full">
                    {/* Elements Sidebar */}
                    <div className="w-64 border-r border-slate-200 bg-white flex flex-col z-10">
                        <div className="p-4 border-b border-slate-200">
                             <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-slate-900">Smart Cards</h3>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast.success("New Template Created")}><Plus size={16} /></Button>
                            </div>
                             <Input placeholder="Search templates..." className="h-8 bg-slate-50" />
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Toolbox</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'text', label: 'Text', icon: Type },
                                        { id: 'image', label: 'Image', icon: ImageIcon },
                                        { id: 'video', label: 'Video', icon: Play },
                                        { id: 'shape', label: 'Shape', icon: SquareIcon }, 
                                        { id: 'data', label: 'Data', icon: Database },
                                        { id: 'qr', label: 'QR Code', icon: QrCodeIcon },
                                    ].map(tool => (
                                        <div key={tool.id} 
                                            className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 cursor-grab active:cursor-grabbing transition-colors bg-slate-50"
                                            onClick={() => {
                                                const newId = `el_${Date.now()}`;
                                                setCardElements([...cardElements, { 
                                                    id: newId, 
                                                    type: tool.id, 
                                                    x: 100, 
                                                    y: 100, 
                                                    w: tool.id === 'text' ? 200 : 100, 
                                                    h: tool.id === 'text' ? 50 : 100, 
                                                    content: tool.id === 'text' ? 'New Text' : tool.id === 'data' ? '{Data}' : '', 
                                                    style: tool.id === 'text' ? { fontSize: '24px', color: '#000' } : {} 
                                                }]);
                                                setSelectedElementId(newId);
                                                toast.success(`Added ${tool.label} to canvas`);
                                            }}
                                        >
                                            <tool.icon size={20} className="mb-2 text-slate-600" />
                                            <span className="text-xs font-medium text-slate-700">{tool.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Templates</h4>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="group border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-teal-400 hover:shadow-md transition-all" onClick={() => toast.success(`Loaded Template ${i}`)}>
                                            <div className="bg-slate-100 aspect-video flex items-center justify-center text-slate-300">
                                                <LayoutTemplate size={24} />
                                            </div>
                                            <div className="p-2 bg-white">
                                                <p className="text-xs font-semibold text-slate-900">Corporate Announcement {i}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-slate-100 flex flex-col relative overflow-hidden">
                        {/* Toolbar */}
                        <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 justify-between shadow-sm z-10">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => {
                                    setCardElements([]);
                                    toast.info("Canvas Cleared");
                                }}><ArrowLeft size={16} className="mr-2" /> Back</Button>
                                <div className="h-4 w-px bg-slate-200 mx-2" />
                                <span className="font-bold text-slate-900 text-sm">Welcome Signage V2</span>
                                <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">Draft</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 mr-4">
                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("Switched to Monitor View")}><Monitor size={14} /></Button>
                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("Switched to Mobile View")}><Smartphone size={14} /></Button>
                                     <Button variant="ghost" size="icon" className="h-7 w-7 text-teal-600 bg-white shadow-sm"><LayoutTemplate size={14} /></Button>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsPreviewOpen(true)}><Eye size={14} /> Preview</Button>
                                <Button 
                                    size="sm" 
                                    className="bg-teal-600 hover:bg-teal-700 text-white gap-2" 
                                    disabled={isSaving}
                                    onClick={async () => {
                                        setIsSaving(true);
                                        try {
                                            await MockSignageService.saveTemplate("Welcome Signage V2", cardElements);
                                            toast.success("Template Saved Successfully", { description: "Changes synced to content library." });
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}
                                >
                                    {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 
                                    {isSaving ? 'Saving...' : 'Save Card'}
                                </Button>
                            </div>
                        </div>

                        {/* Canvas Scroll Area */}
                        <div className="flex-1 overflow-auto flex items-center justify-center p-12 relative" onClick={() => setSelectedElementId(null)}>
                            {/* The Canvas */}
                            <div 
                                className="bg-white shadow-2xl relative transition-all origin-center"
                                style={{ 
                                    width: '800px', 
                                    height: '450px', // 16:9 Aspect Ratio
                                    transform: 'scale(1)' 
                                }}
                            >
                                {/* Grid Lines (CSS only) */}
                                <div className="absolute inset-0 pointer-events-none" 
                                    style={{ 
                                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                                        backgroundSize: '20px 20px', 
                                        opacity: 0.5 
                                    }} 
                                />
                                
                                {cardElements.map(el => (
                                    <DraggableElement 
                                        key={el.id} 
                                        element={el} 
                                        isSelected={selectedElementId === el.id}
                                        onSelect={() => setSelectedElementId(el.id)}
                                        onMove={handleElementDrag}
                                        onResize={handleElementResize}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 right-4 flex bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Minus size={14} /></Button>
                            <span className="w-12 flex items-center justify-center text-xs font-mono text-slate-500">100%</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Plus size={14} /></Button>
                        </div>
                    </div>

                    {/* Properties Panel */}
                    <div className="w-72 border-l border-slate-200 bg-white flex flex-col z-10">
                        {selectedElementId ? (
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-900 text-sm">Properties</h3>
                                    <p className="text-xs text-slate-500">Edit selected element</p>
                                </div>
                                <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Content Source</Label>
                                        <div className="flex gap-2">
                                            <Input defaultValue={cardElements.find(e => e.id === selectedElementId)?.content} className="h-8 text-xs" />
                                            <Button size="icon" variant="outline" className="h-8 w-8 shrink-0"><Database size={14} /></Button>
                                        </div>
                                        <p className="text-[10px] text-slate-400">Bind to data field by clicking the icon.</p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900">Appearance</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">X Position</Label>
                                                <Input className="h-7 text-xs" defaultValue={cardElements.find(e => e.id === selectedElementId)?.x} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">Y Position</Label>
                                                <Input className="h-7 text-xs" defaultValue={cardElements.find(e => e.id === selectedElementId)?.y} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">Width</Label>
                                                <Input className="h-7 text-xs" defaultValue={cardElements.find(e => e.id === selectedElementId)?.w || 'Auto'} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">Height</Label>
                                                <Input className="h-7 text-xs" defaultValue={cardElements.find(e => e.id === selectedElementId)?.h || 'Auto'} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-100">
                                        <Button variant="destructive" className="w-full h-8 text-xs gap-2">
                                            <Trash2 size={14} /> Delete Element
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                                <LayoutTemplate size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium text-slate-600">No Element Selected</p>
                                <p className="text-xs mt-2">Click on an element in the canvas to edit its properties, or drag new items from the toolbox.</p>
                            </div>
                        )}
                        
                        {/* Data Binding Context (Always Visible in Pro Mode) */}
                        <div className="mt-auto border-t border-slate-200 p-4 bg-slate-50">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-amber-500" />
                                <h4 className="text-xs font-bold text-slate-900">Data Context</h4>
                            </div>
                            <div className="text-xs text-slate-500 mb-2">
                                Previewing with: <span className="font-mono bg-slate-200 px-1 rounded text-slate-700">Visitor_Checked_In</span>
                            </div>
                            <Select defaultValue="visitor">
                                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="visitor">Visitor Check-In Event</SelectItem>
                                    <SelectItem value="emergency">Emergency Alert</SelectItem>
                                    <SelectItem value="room">Room Schedule</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            );

        case 'networks':
            return (
                <div className="p-6 h-full overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                         <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Device Networks</h2>
                                <p className="text-slate-500">Manage {DISPLAYS.length} screens across {new Set(DISPLAYS.map(d => d.location.split('-')[0])).size} locations.</p>
                            </div>
                            <Button className="bg-teal-600 text-white gap-2" onClick={() => setIsRegisterDeviceOpen(true)}><Plus size={16} /> Register Device</Button>
                         </div>

                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             {/* Network Hierarchy */}
                             <Card className="border-slate-200 shadow-sm h-fit">
                                 <CardHeader>
                                     <CardTitle className="text-sm">Locations</CardTitle>
                                 </CardHeader>
                                 <CardContent className="p-0">
                                     <div className="divide-y divide-slate-100">
                                         {['Headquarters (HQ)', 'R&D Center', 'Logistics Hub', 'Sales Office NY'].map((loc, i) => (
                                             <div key={i} className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group">
                                                 <div className="flex items-center gap-3">
                                                     <Folder size={16} className="text-slate-400 group-hover:text-teal-500" />
                                                     <span className="text-sm font-medium text-slate-700">{loc}</span>
                                                 </div>
                                                 <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px]">{Math.floor(Math.random() * 20) + 5}</Badge>
                                             </div>
                                         ))}
                                     </div>
                                 </CardContent>
                             </Card>

                             {/* Device Grid */}
                             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {DISPLAYS.map(display => (
                                     <DisplayCard key={display.id} display={display} />
                                 ))}
                             </div>
                         </div>
                    </div>
                </div>
            );

        case 'networks':
            return (
                <div className="flex h-full flex-col">
                    <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
                         <div>
                             <h2 className="text-2xl font-bold text-slate-900">Device Management</h2>
                             <p className="text-slate-500">Monitor and control your display endpoints.</p>
                         </div>
                         <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => setIsRegisterDeviceOpen(true)}>
                             <Plus size={16} /> Register Device
                         </Button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                        <div className="flex gap-4 mb-6">
                            <Card className="flex-1 border-slate-200 shadow-sm bg-white p-4 flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><Wifi size={24} /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Online</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{DISPLAYS.filter(d => d.status === 'online').length}</h3>
                                </div>
                            </Card>
                            <Card className="flex-1 border-slate-200 shadow-sm bg-white p-4 flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><AlertTriangle size={24} /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Warnings</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{DISPLAYS.filter(d => d.status === 'warning').length}</h3>
                                </div>
                            </Card>
                            <Card className="flex-1 border-slate-200 shadow-sm bg-white p-4 flex items-center gap-4">
                                <div className="p-3 bg-red-100 text-red-600 rounded-lg"><WifiOff size={24} /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Offline</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{DISPLAYS.filter(d => d.status === 'offline').length}</h3>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {DISPLAYS.map(display => (
                                <DisplayCard key={display.id} display={display} />
                            ))}
                        </div>
                    </div>
                </div>
            );

        default: 
            return <div className="p-12 text-center text-slate-400">Coming Soon</div>;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden text-sm">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="bg-teal-50 text-teal-600 p-1.5 rounded-md border border-teal-100">
                <Monitor size={18} />
            </div>
            <h1 className="font-bold text-slate-900 text-lg tracking-tight">Signage</h1>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <span className="text-slate-500 font-medium">Content Manager</span>
         </div>

         <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-slate-100 p-1 border border-slate-200 h-9">
                    <TabsTrigger value="cms" className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">CMS</TabsTrigger>
                    <TabsTrigger value="orchestrator" className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">Orchestration</TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">Config</TabsTrigger>
                </TabsList>
            </Tabs>
            <Separator orientation="vertical" className="h-6" />

         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
         {/* CMS Sidebar (Only visible in CMS tab) */}
         {activeTab === 'cms' && (
             <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 flex-shrink-0 z-10"
             >
                {[
                    { id: 'overview', icon: LayoutGrid, label: 'Overview' },
                    { id: 'library', icon: Folder, label: 'Library' },
                    { id: 'channels', icon: ListIcon, label: 'Channels' },
                    { id: 'cards', icon: LayoutTemplate, label: 'Cards' },
                    { id: 'networks', icon: Wifi, label: 'Networks' },
                ].map((item) => (
                    <div key={item.id} className="relative group">
                         <button
                            onClick={() => setCmsSection(item.id as any)}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                                cmsSection === item.id 
                                    ? "bg-teal-50 text-teal-600 ring-1 ring-teal-200" 
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                         >
                            <item.icon size={20} />
                         </button>
                         {/* Tooltip */}
                         <div className="absolute left-14 top-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
                            {item.label}
                         </div>
                    </div>
                ))}
                
                <div className="mt-auto mb-4">
                     <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <Settings size={20} />
                     </button>
                </div>
             </motion.div>
         )}

         {/* Main Content Area */}
         <div className="flex-1 bg-slate-50 overflow-hidden relative">
            {activeTab === 'cms' ? renderCMSContent() : activeTab === 'orchestrator' ? renderOrchestrator() : (
                <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                        <Settings size={48} className="mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-semibold text-slate-600">Configuration</h2>
                        <p className="max-w-md mx-auto mt-2">Global system settings and API configuration.</p>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
    <DeviceRegistrationDialog open={isRegisterDeviceOpen} onOpenChange={setIsRegisterDeviceOpen} />
    <PreviewModal open={isPreviewOpen} onOpenChange={setIsPreviewOpen} elements={cardElements} />
    
    <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Content Configuration</DialogTitle>
                <DialogDescription>Manage playback rules and scheduling for "{editingItem?.title}"</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Tabs defaultValue="schedule">
                    <TabsList className="w-full justify-start border-b border-slate-200 rounded-none h-auto p-0 bg-transparent gap-6">
                        <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-teal-700 pb-3 px-0">Properties</TabsTrigger>
                        <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-teal-700 pb-3 px-0">Scheduling</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="settings" className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Display Duration</Label>
                                <div className="relative">
                                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input defaultValue={editingItem?.duration} className="pl-9" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Transition Effect</Label>
                                <Select defaultValue="fade">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fade">Cross Fade</SelectItem>
                                        <SelectItem value="slide">Slide Left</SelectItem>
                                        <SelectItem value="zoom">Zoom In</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="pt-6 space-y-6">
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white border border-slate-200 rounded text-slate-500">
                                    <RotateCw size={16} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">Always Play</h4>
                                    <p className="text-xs text-slate-500">Item will play in every loop rotation</p>
                                </div>
                            </div>
                            <Switch checked={editingItem?.schedule?.always ?? true} />
                        </div>

                        {!(editingItem?.schedule?.always ?? true) && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="space-y-3">
                                    <Label>Active Date Range</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase text-slate-500 font-bold">Start Date</span>
                                            <div className="relative">
                                                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input type="date" className="pl-9" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase text-slate-500 font-bold">End Date</span>
                                            <div className="relative">
                                                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input type="date" className="pl-9" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <Label>Weekly Schedule</Label>
                                    <div className="flex gap-2">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                            <button 
                                                key={i}
                                                className={cn(
                                                    "w-8 h-8 rounded-full text-xs font-bold transition-all border",
                                                    (editingItem?.schedule?.days?.includes(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]) ?? true)
                                                        ? "bg-teal-600 text-white border-teal-600" 
                                                        : "bg-white text-slate-400 border-slate-200 hover:border-teal-300 hover:text-teal-500"
                                                )}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase text-slate-500 font-bold">Start Time</span>
                                            <Input type="time" defaultValue="09:00" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase text-slate-500 font-bold">End Time</span>
                                            <Input type="time" defaultValue="17:00" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => {
                    toast.success("Schedule Updated");
                    setEditingItem(null);
                }}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* Channel Settings Dialog */}
    <Dialog open={isChannelSettingsOpen} onOpenChange={setIsChannelSettingsOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Channel Settings</DialogTitle>
                <DialogDescription>Configure global settings for this channel.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Channel Name</Label>
                    <Input defaultValue="Corporate Lobby Loop" />
                </div>
                <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select defaultValue="1080p">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="4k">4K Ultra HD (3840x2160)</SelectItem>
                            <SelectItem value="1080p">Full HD (1920x1080)</SelectItem>
                            <SelectItem value="720p">HD (1280x720)</SelectItem>
                            <SelectItem value="portrait">Portrait HD (1080x1920)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsChannelSettingsOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => {
                    toast.success("Channel Settings Saved");
                    setIsChannelSettingsOpen(false);
                }}>Save Settings</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* Library / Add Content Modal */}
    <Dialog open={isLibraryModalOpen} onOpenChange={setIsLibraryModalOpen}>
        <DialogContent className="max-w-3xl h-[600px] flex flex-col p-0">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <DialogTitle>Add Content to Playlist</DialogTitle>
                    <DialogDescription className="mt-1">Select assets to add to your channel loop.</DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search assets..." className="pl-9 h-9 w-64 bg-slate-50" />
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                 <div className="grid grid-cols-3 gap-4">
                     {assets.map(asset => (
                         <div key={asset.id} className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-teal-500 hover:shadow-md cursor-pointer transition-all" onClick={() => {
                             setChannelItems([...channelItems, {
                                 id: `item_${Date.now()}`,
                                 title: asset.name,
                                 duration: asset.type === 'video' ? '1m 20s' : '15s',
                                 type: asset.type,
                                 assetId: asset.id
                             }]);
                             toast.success(`Added "${asset.name}" to playlist`);
                             setIsLibraryModalOpen(false);
                         }}>
                             <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                                 {asset.type === 'image' && <ImageWithFallback src={asset.url} className="w-full h-full object-cover" />}
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <Plus className="text-white" size={32} />
                                 </div>
                             </div>
                             <div className="p-3">
                                 <p className="font-semibold text-sm truncate">{asset.name}</p>
                                 <p className="text-xs text-slate-500">{asset.type}</p>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </DialogContent>
    </Dialog>

    {/* Upload Modal */}
    <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Upload Asset</DialogTitle>
                <DialogDescription>Drag and drop files here or click to browse.</DialogDescription>
            </DialogHeader>
            <div className="py-8">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-teal-400 transition-all cursor-pointer">
                     <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
                         <Plus size={24} />
                     </div>
                     <h3 className="font-bold text-slate-900">Click to Upload</h3>
                     <p className="text-sm text-slate-500 mt-1 max-w-xs">Support for JPG, PNG, MP4, and PDF (Max 50MB)</p>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </DndProvider>
  );
};
