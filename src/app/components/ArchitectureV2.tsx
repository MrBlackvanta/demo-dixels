import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Monitor, 
  LayoutGrid, 
  Brain, 
  Share2, 
  Server, 
  Database,
  Globe,
  Users,
  Building2,
  Zap,
  ArrowDown,
  ChevronRight,
  Box,
  Layers,
  Cpu,
  Fingerprint,
  MessageSquare,
  Map,
  Calendar,
  Coffee,
  LifeBuoy,
  CheckSquare,
  Search,
  Sliders,
  BarChart3,
  FileText,
  Image,
  Tv,
  Car,
  Lock,
  Cloud,
  Workflow,
  Sparkles,
  Watch,
  Tablet,
  Mic,
  Wifi,
  CreditCard,
  Smile,
  Tent,
  ConciergeBell,
  Ticket,
  Navigation,
  UserCog,
  GitPullRequest,
  ShoppingBag,
  Network,
  Camera,
  Speaker,
  Briefcase,
  MessageCircle,
  User,
  Shield,
  Siren
} from 'lucide-react';
import { cn } from './ui/utils';
import { Badge } from './ui/badge';
import dixelsLogo from 'figma:asset/247d65801bbc3aad30cb75db0c08362c2b40b62f.png';

// --- Types & Data ---

type LayerId = 'touchpoints' | 'dixels' | 'neural' | 'integration' | 'infra';

interface ArchLayer {
  id: LayerId;
  label: string;
  icon: any;
  description: string;
  color: string; // We will use this for dynamic classes
  items: ArchItem[];
}

interface ArchItem {
  id: string;
  label: string;
  icon: any;
  group?: string;
  description?: string;
}

const ARCHITECTURE_DATA: ArchLayer[] = [
  {
    id: 'touchpoints',
    label: 'Omnichannel Experience Layer',
    icon: Smartphone,
    color: 'emerald', // Was indigo
    description: 'Unified interfaces delivering the building persona to every user context.',
    items: [
      // Personal Devices
      { id: 'mobile', label: 'Mobile App', icon: Smartphone, group: 'Personal Devices', description: 'The pocket concierge' },
      { id: 'web', label: 'Web Portal', icon: Globe, group: 'Personal Devices', description: 'Deep work & admin' },
      { id: 'wearable', label: 'Wearables', icon: Watch, group: 'Personal Devices', description: 'Quick notifications' },
      // Shared Spaces
      { id: 'kiosk', label: 'Lobby Kiosk', icon: Monitor, group: 'Shared Spaces', description: 'Visitor check-in' },
      { id: 'panels', label: 'Room Panels', icon: Tablet, group: 'Shared Spaces', description: 'Room scheduler' },
      { id: 'signage', label: 'Digital Signage', icon: Tv, group: 'Shared Spaces', description: 'Public displays' },
      // Ambient Intelligence
      { id: 'voice', label: 'Voice Control', icon: Mic, group: 'Ambient Intelligence', description: 'Hands-free commands' },
      { id: 'sensors', label: 'IoT Sensors', icon: Wifi, group: 'Ambient Intelligence', description: 'Occupancy & comfort' },
      { id: 'desk', label: 'Smart Desks', icon: Sliders, group: 'Ambient Intelligence', description: 'Auto-height adjust' },
      // Service Points
      { id: 'kitchen', label: 'Kitchen Panel', icon: Tablet, group: 'Service Points', description: 'Barista display' },
      { id: 'pos', label: 'POS Terminal', icon: CreditCard, group: 'Service Points', description: 'Cafeteria checkout' },
      { id: 'feedback', label: 'Feedback Tab', icon: Smile, group: 'Service Points', description: 'Smiley terminals' },
    ]
  },
  {
    id: 'dixels',
    label: 'The Dixels Ecosystem',
    icon: LayoutGrid,
    color: 'emerald', // Was teal, keep as emerald/green for Primary
    description: 'Modular functional blocks (Dixels) that power specific workplace experiences and core capabilities.',
    items: [
      // Spatial Intelligence
      { id: 'spaceos', label: 'SpaceOS', icon: Calendar, group: 'Spatial Intelligence', description: 'Resource scheduling' },
      { id: 'atmosphere', label: 'Atmosphere', icon: Zap, group: 'Spatial Intelligence', description: 'Smart controls' },
      { id: 'pathfinder', label: 'Pathfinder', icon: Map, group: 'Spatial Intelligence', description: 'Wayfinding maps' },
      { id: 'flux', label: 'Flux', icon: Navigation, group: 'Spatial Intelligence', description: 'Indoor navigation' },
      { id: 'parkflow', label: 'ParkFlow', icon: Car, group: 'Spatial Intelligence', description: 'Parking management' },
      { id: 'twinspace', label: 'TwinSpace', icon: Box, group: 'Spatial Intelligence', description: 'Digital twins' },
      
      // Workplace Services
      { id: 'portal', label: 'VisitFlow', icon: Users, group: 'Workplace Services', description: 'Visitor management' },
      { id: 'nourish', label: 'Nourish', icon: Coffee, group: 'Workplace Services', description: 'Smart cafe & dining' },
      { id: 'gather', label: 'Gather', icon: Ticket, group: 'Workplace Services', description: 'Event management' },
      { id: 'omniserve', label: 'OmniServe', icon: ConciergeBell, group: 'Workplace Services', description: 'Service request hub' },
      { id: 'resolve', label: 'Resolve', icon: LifeBuoy, group: 'Workplace Services', description: 'IT & HR support' },
      { id: 'ticksense', label: 'Ticksense', icon: CheckSquare, group: 'Workplace Services', description: 'Time & attendance' },

      // Community & Content
      { id: 'tribes', label: 'Tribes', icon: Tent, group: 'Community & Content', description: 'Community groups' },
      { id: 'livecanvas', label: 'LiveCanvas', icon: Tv, group: 'Community & Content', description: 'Signage content' },
      { id: 'cms', label: 'Content', icon: FileText, group: 'Community & Content', description: 'Headless CMS' },
      { id: 'vault', label: 'Vault', icon: Image, group: 'Community & Content', description: 'Asset management' },
      { id: 'universe', label: 'Universe', icon: ShoppingBag, group: 'Community & Content', description: 'App marketplace' },

      // Intelligence & Core
      { id: 'nexus', label: 'Nexus', icon: Network, group: 'Intelligence & Core', description: 'Integration hub' },
      { id: 'gavel', label: 'Gavel', icon: CheckSquare, group: 'Intelligence & Core', description: 'Approval engine' },
      { id: 'flow', label: 'Flow', icon: GitPullRequest, group: 'Intelligence & Core', description: 'Workflow automation' },
      { id: 'identity', label: 'Identity', icon: UserCog, group: 'Intelligence & Core', description: 'User management' },
    ]
  },
  {
    id: 'neural',
    label: 'Neural Interface (AI Core)',
    icon: Brain,
    color: 'amber', // Was fuchsia, now Gold/Amber
    description: 'The cognitive engine that builds the "Building Persona", enabling context-aware interactions.',
    items: [
      { id: 'context', label: 'Context Engine', icon: Fingerprint, group: 'Cognition' },
      { id: 'predict', label: 'Predictive Models', icon: Zap, group: 'Cognition' },
      { id: 'nlp', label: 'Conversational AI', icon: MessageSquare, group: 'Interaction' },
      { id: 'personal', label: 'Personalization', icon: Users, group: 'Interaction' },
      { id: 'auto', label: 'Automation Rules', icon: Workflow, group: 'Logic' },
    ]
  },
  {
    id: 'integration',
    label: 'Integration Layer (Nexus)',
    icon: Share2,
    color: 'slate', // Was blue, keep neutral/slate to let Gold/Green pop
    description: 'Enterprise-grade connectivity layer unifying fragmented systems into a single cohesive experience.',
    items: [
      // Identity & Access
      { id: 'iam', label: 'Identity Mgmt', icon: Fingerprint, group: 'Identity & Access', description: 'Entra, Okta, Auth0' },
      { id: 'access', label: 'Access Control', icon: Lock, group: 'Identity & Access', description: 'HID, Suprema, Honeywell' },
      
      // Physical Systems (OT)
      { id: 'bms', label: 'IoT Platforms', icon: Wifi, group: 'Physical Systems', description: 'Siemens, Schneider, Lutron' },
      { id: 'cctv', label: 'Physical Security', icon: Camera, group: 'Physical Systems', description: 'Milestone, Genetec, Axis' },
      { id: 'av', label: 'AV Systems', icon: Speaker, group: 'Physical Systems', description: 'Crestron, Zoom, Webex' },

      // Enterprise Business
      { id: 'erp', label: 'ERP & CRM', icon: Briefcase, group: 'Enterprise Business', description: 'SAP, Salesforce, Dynamics' },
      { id: 'hris', label: 'HR & People', icon: User, group: 'Enterprise Business', description: 'Workday, Oracle, ADP' },
      { id: 'itsm', label: 'Service Mgmt', icon: Ticket, group: 'Enterprise Business', description: 'ServiceNow, Jira, Archibus' },

      // Workplace Experience
      { id: 'collab', label: 'Collaboration', icon: MessageCircle, group: 'Workplace Experience', description: 'Slack, Teams, M365' },
      { id: 'cal', label: 'Calendar', icon: Calendar, group: 'Workplace Experience', description: 'Exchange, Google Workspace' },

      // Infrastructure
      { id: 'net', label: 'Network & Sec', icon: Shield, group: 'Infrastructure', description: 'Cisco, Palo Alto, Aruba' },
      { id: 'cloud', label: 'Cloud & DevOps', icon: Cloud, group: 'Infrastructure', description: 'AWS, Azure, Splunk' },
    ]
  },
  {
    id: 'infra',
    label: 'Hybrid AI Infrastructure',
    icon: Cloud,
    color: 'emerald', // Was slate
    description: 'Flexible deployment models (SaaS, Private, On-Prem) powering the neural compute engine.',
    items: [
      // Deployment Models
      { id: 'saas', label: 'Multi-Tenant SaaS', icon: Cloud, group: 'Deployment Models', description: 'Global scale & updates' },
      { id: 'private', label: 'Private Cloud', icon: Lock, group: 'Deployment Models', description: 'Data sovereignty & isolation' },
      { id: 'onprem', label: 'On-Premise Edge', icon: Building2, group: 'Deployment Models', description: 'Local survivability & latency' },

      // AI Data Foundation
      { id: 'vector', label: 'Vector DB', icon: Database, group: 'AI Data Foundation', description: 'Semantic memory for RAG' },
      { id: 'graph', label: 'Knowledge Graph', icon: Network, group: 'AI Data Foundation', description: 'Context & relationship mapping' },

      // Compute & Orchestration
      { id: 'llm', label: 'LLM Ops', icon: Cpu, group: 'Compute & Orchestration', description: 'Inference & fine-tuning' },
      { id: 'mesh', label: 'Event Mesh', icon: Workflow, group: 'Compute & Orchestration', description: 'Real-time event streaming' },

      // Security
      { id: 'guard', label: 'AI Guardrails', icon: Shield, group: 'Security & Governance', description: 'Safety & hallucination checks' },
    ]
  }
];

// --- Components ---

// Helper to map layer color to specific classes
const getTheme = (color: string, isHover: boolean = false) => {
    if (color === 'emerald') return isHover ? 'bg-[#5B21B6]/10 text-[#5B21B6] border-[#5B21B6]/20' : 'bg-[#5B21B6]/5 text-[#5B21B6] border-[#5B21B6]/10';
    if (color === 'amber') return isHover ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30' : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
    if (color === 'slate') return isHover ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-50 text-slate-600 border-slate-200';
    return isHover ? 'bg-slate-100' : 'bg-slate-50';
}

const DixelCard = ({ item, color }: { item: ArchItem, color: string }) => {
  const themeClass = color === 'emerald' ? 'bg-[#5B21B6]/10 text-[#5B21B6]' : 
                     color === 'amber' ? 'bg-[#F59E0B]/10 text-[#B45309]' : 
                     'bg-slate-100 text-slate-600';
                     
  const groupHoverTheme = color === 'emerald' ? 'group-hover:bg-[#5B21B6]/20 group-hover:text-[#5B21B6]' : 
                          color === 'amber' ? 'group-hover:bg-[#F59E0B]/20 group-hover:text-[#B45309]' : 
                          'group-hover:bg-slate-200 group-hover:text-slate-800';

  const bgOverlay = color === 'emerald' ? 'bg-[#5B21B6]' : color === 'amber' ? 'bg-[#F59E0B]' : 'bg-slate-400';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-100 rounded-lg p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group relative overflow-hidden h-full min-h-[90px]"
    >
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity",
        bgOverlay
      )} />
      <div className={cn(
        "p-2 rounded-full mb-2 transition-colors",
        themeClass,
        groupHoverTheme
      )}>
        <item.icon size={18} />
      </div>
      <span className="text-xs font-bold text-slate-700 leading-tight">{item.label}</span>
      {item.description && (
        <span className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">{item.description}</span>
      )}
    </motion.div>
  );
};

const ArchitectureLayerBlock = ({ layer, isActive, onClick, index }: { layer: ArchLayer, isActive: boolean, onClick: () => void, index: number }) => {
  const isDixels = layer.id === 'dixels';
  const isNeural = layer.id === 'neural';

  // Group items if needed
  const groups = Array.from(new Set(layer.items.map(i => i.group || 'General')));

  const activeBorder = layer.color === 'emerald' ? 'border-[#5B21B6]/20' : layer.color === 'amber' ? 'border-[#F59E0B]/30' : 'border-slate-300';
  const activeConnector = layer.color === 'emerald' ? 'bg-[#5B21B6]' : layer.color === 'amber' ? 'bg-[#F59E0B]' : 'bg-slate-400';
  
  const iconTheme = layer.color === 'emerald' ? 'bg-[#5B21B6]/5 text-[#5B21B6] border-[#5B21B6]/10' : 
                   layer.color === 'amber' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 
                   'bg-slate-50 text-slate-400 border-slate-100';

  return (
    <motion.div 
      layout
      onClick={onClick}
      className={cn(
        "relative w-full rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer",
        isActive 
          ? `bg-white shadow-2xl ring-1 my-4 z-10 ${activeBorder}` 
          : "bg-white/80 border-slate-200 hover:bg-white hover:shadow-lg opacity-90 hover:opacity-100 my-2 z-0 scale-[0.99]"
      )}
    >
      {/* Connector Line (Left) */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500",
        isActive ? activeConnector : "bg-slate-200"
      )} />

      {/* Header Section */}
      <div className="p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5 pl-2">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors border",
            isActive ? iconTheme : "bg-slate-50 text-slate-400 border-slate-100"
          )}>
            <layer.icon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">0{index + 1}</span>
                 <h3 className={cn(
                    "text-xl font-bold transition-colors",
                    isActive ? "text-slate-900" : "text-slate-700"
                    )}>
                    {layer.label}
                 </h3>
            </div>
            <motion.p 
                className={cn(
                    "text-sm mt-1 max-w-2xl transition-all",
                    isActive ? "text-slate-500 opacity-100" : "text-slate-400 opacity-0 h-0 overflow-hidden"
                )}
            >
                {layer.description}
            </motion.p>
          </div>
        </div>
        
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300",
          isActive ? "rotate-90 bg-slate-100 text-slate-600" : "text-slate-300"
        )}>
          <ChevronRight size={20} />
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 pl-8 border-t border-slate-100 bg-slate-50/50">
              
              {/* Special Visualization for Neural Layer */}
              {isNeural && (
                 <div className="mb-8 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Ingest */}
                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5"><LayoutGrid size={40} /></div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Data Ingestion</h5>
                            <p className="text-sm text-slate-600">Aggregates real-time streams from IoT, Apps, and Enterprise Systems.</p>
                        </div>
                        {/* 2. Process */}
                        <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5"><Brain size={40} /></div>
                            <h5 className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-2">2. Persona Logic</h5>
                            <p className="text-sm text-slate-900 font-medium">Synthesizes context to form the "Building Persona" and predict intent.</p>
                        </div>
                        {/* 3. Act */}
                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5"><Zap size={40} /></div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">3. Adaptive Action</h5>
                            <p className="text-sm text-slate-600">Triggers personalization, automation rules, and proactive alerts.</p>
                        </div>
                    </div>
                    {/* Flow Arrow Animation */}
                    <div className="flex justify-center mt-2 gap-32 text-slate-300">
                        <ArrowDown size={16} className="animate-bounce" />
                        <ArrowDown size={16} className="animate-bounce delay-100" />
                        <ArrowDown size={16} className="animate-bounce delay-200" />
                    </div>
                 </div>
              )}

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                  {groups.map(group => (
                      <div key={group} className="space-y-3">
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 border-b border-slate-200 pb-1 mb-2">{group}</h4>
                           <div className="grid grid-cols-1 gap-2">
                              {layer.items.filter(i => i.group === group).map(item => (
                                  <DixelCard key={item.id} item={item} color={layer.color} />
                              ))}
                           </div>
                      </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ConnectionStream = () => (
    <div className="h-6 w-full flex justify-center items-center relative overflow-hidden my-1">
        <div className="h-full w-px bg-slate-200" />
        <motion.div 
            className="absolute h-3 w-3 rounded-full bg-[#F59E0B]/50 blur-sm"
            animate={{ y: [0, 24], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
    </div>
);

export const ArchitectureV2: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<LayerId>('dixels');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden pb-20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] z-0 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#5B21B6]/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-20 pt-16 pb-12 px-4 text-center max-w-4xl mx-auto flex flex-col items-center">
         <motion.img 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            src={dixelsLogo} 
            alt="Dixels Logo" 
            className="h-16 md:h-20 object-contain mb-8"
         />

         <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-bold uppercase tracking-widest mb-6"
         >
            <Sparkles size={12} className="text-[#F59E0B]" /> System Architecture V2.0
         </motion.div>
         
         <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6"
         >
            The Connected Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B21B6] to-[#F59E0B]">Persona</span>
         </motion.h1>
         
         <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
         >
            A scalable, modular platform where physical infrastructure meets digital intelligence—powered by the Neural Interface.
         </motion.p>
      </div>

      {/* Main Architecture Stack */}
      <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col items-center pb-20">
         
         {ARCHITECTURE_DATA.map((layer, index) => (
             <React.Fragment key={layer.id}>
                 <ArchitectureLayerBlock 
                    layer={layer} 
                    isActive={activeLayer === layer.id} 
                    onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                    index={index}
                 />
                 {index < ARCHITECTURE_DATA.length - 1 && <ConnectionStream />}
             </React.Fragment>
         ))}

      </div>

    </div>
  );
};