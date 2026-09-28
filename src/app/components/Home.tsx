import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Users, Zap, Coffee, Ticket, Tent, ConciergeBell, 
  LifeBuoy, Map, Navigation, Tv, 
  Copy, FileText, Image, ShoppingBag, Network, 
  CheckSquare, GitPullRequest, UserCog, ArrowRight, Layers, Cpu, FileJson, X, Brain, Car,
  Activity, BarChart, TrendingUp, MousePointerClick, MessageSquare,
  Plane, GraduationCap, Briefcase, Trophy, Home as HomeIcon, Heart, ShieldCheck, User, Wrench, Shield,
  Smartphone, Monitor, Tablet, Watch, Mic, Wifi, CreditCard, Smile, Globe, Sliders
} from 'lucide-react';
import { cn } from './ui/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// --- DATA & TYPES ---

interface Dixel {
  id: string;
  name: string;
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  type: 'experience' | 'core';
}

const DIXELS_DATA: Dixel[] = [
  // Experience Modules
  {
    id: 'space-booking',
    name: 'SpaceOS',
    icon: Calendar,
    title: 'Space Booking',
    description: 'Intelligent resource scheduling and utilization management for the modern workplace.',
    features: ['Desk & Room Booking', 'Utilization Analytics', 'Team Scheduling', 'Policy Enforcement'],
    type: 'experience'
  },
  {
    id: 'visitor-management',
    name: 'VisitFlow',
    icon: Users,
    title: 'Visitor Management',
    description: 'Secure, seamless entry experiences for guests, contractors, and employees.',
    features: ['Self-service Kiosks', 'Badge Printing', 'Security Integration', 'Pre-registration Workflows'],
    type: 'experience'
  },
  {
    id: 'smart-controls',
    name: 'Atmosphere',
    icon: Zap,
    title: 'Smart Controls',
    description: 'IoT-driven environmental control for comfort and energy efficiency.',
    features: ['Lighting Automation', 'HVAC Optimization', 'Occupancy Sensors', 'Energy Dashboard'],
    type: 'experience'
  },
  {
    id: 'smart-cafe',
    name: 'Nourish',
    icon: Coffee,
    title: 'Smart Cafe',
    description: 'Digitized corporate dining experiences with pre-ordering and cashless checkout.',
    features: ['Mobile Ordering', 'Menu Management', 'POS Integration', 'Nutritional Tracking'],
    type: 'experience'
  },
  {
    id: 'events',
    name: 'Gather',
    icon: Ticket,
    title: 'Events',
    description: 'End-to-end management for internal workshops, town halls, and client events.',
    features: ['Attendee Registration', 'Agenda Building', 'Feedback Surveys', 'Hybrid Event Support'],
    type: 'experience'
  },
  {
    id: 'communities',
    name: 'Tribes',
    icon: Tent,
    title: 'Communities',
    description: 'Foster culture and connection through interest groups and social feeds.',
    features: ['Discussion Forums', 'Interest Groups', 'Activity Feeds', 'Member Directories'],
    type: 'experience'
  },
  {
    id: 'neural-interface',
    name: 'Cortex',
    icon: Brain,
    title: 'Neural Interface',
    description: 'The central intelligence layer acting as a brain to connect and orchestrate everything.',
    features: ['Context Orchestration', 'Agentic Dispatch', 'Predictive Modeling', 'Self-Healing'],
    type: 'experience'
  },
  {
    id: 'service-hub',
    name: 'OmniServe',
    icon: ConciergeBell,
    title: 'Service Hub',
    description: 'Unified request portal for all workplace services and amenities.',
    features: ['Service Catalog', 'Request Tracking', 'SLA Management', 'Vendor Integration'],
    type: 'experience'
  },
  {
    id: 'support-center',
    name: 'Resolve',
    icon: LifeBuoy,
    title: 'Support Center',
    description: 'AI-powered helpdesk for IT, HR, and Facility issues.',
    features: ['Ticket Management', 'Knowledge Base', 'Chatbot Support', 'Issue Escalation'],
    type: 'experience'
  },
  {
    id: 'wayfinding',
    name: 'Pathfinder',
    icon: Map,
    title: 'Wayfinding',
    description: 'Digital maps and directories to help people find what they need.',
    features: ['Interactive Maps', 'POI Search', 'Directory Listings', 'Route Preview'],
    type: 'experience'
  },
  {
    id: 'indoor-navigation',
    name: 'Flux',
    icon: Navigation,
    title: 'Indoor Navigation',
    description: 'Blue-dot turn-by-turn navigation for complex campuses.',
    features: ['Real-time Positioning', 'Turn-by-turn Directions', 'Geofencing', 'Accessibility Routes'],
    type: 'experience'
  },
  {
    id: 'smart-signage',
    name: 'LiveCanvas',
    icon: Tv,
    title: 'Smart Signage',
    description: 'Centralized content distribution for digital displays across the organization.',
    features: ['Content Scheduling', 'Emergency Alerts', 'Room Displays', 'Video Walls'],
    type: 'experience'
  },
  {
    id: 'attendance',
    name: 'Ticksense',
    icon: CheckSquare,
    title: 'Attendance',
    description: 'Automated time and attendance tracking for smarter workforce management.',
    features: ['Biometric Check-in', 'Shift Management', 'Overtime Calculation', 'Payroll Integration'],
    type: 'experience'
  },
  {
    id: 'parking',
    name: 'ParkFlow',
    icon: Car,
    title: 'Parking',
    description: 'Smart parking management to optimize vehicle flow and utilization.',
    features: ['License Plate Rec', 'Space Reservation', 'Valet Tracking', 'EV Charging'],
    type: 'experience'
  },

  // Core Capabilities
  {
    id: 'space-twinning',
    name: 'TwinSpace',
    icon: Copy,
    title: 'Space Twinning',
    description: 'High-fidelity digital twins of physical assets for simulation and management.',
    features: ['BIM Integration', '3D Visualization', 'Asset Mapping', 'Spatial Data'],
    type: 'core'
  },
  {
    id: 'cms',
    name: 'Content',
    icon: FileText,
    title: 'CMS',
    description: 'Headless content management system for all platform experiences.',
    features: ['Versioning', 'Localization', 'Workflow', 'API-first Delivery'],
    type: 'core'
  },
  {
    id: 'dam',
    name: 'Vault',
    icon: Image,
    title: 'DAM',
    description: 'Secure digital asset management for media and documents.',
    features: ['Media Library', 'Transcoding', 'CDN Delivery', 'Rights Management'],
    type: 'core'
  },
  {
    id: 'marketplace',
    name: 'Universe',
    icon: ShoppingBag,
    title: 'Marketplace',
    description: 'App store for third-party integrations and extensions.',
    features: ['Partner Ecosystem', 'One-click Install', 'Billing Integration', 'Version Control'],
    type: 'core'
  },
  {
    id: 'integration-hub',
    name: 'Nexus',
    icon: Network,
    title: 'Integration Hub',
    description: 'Enterprise-grade connectivity layer for systems and devices.',
    features: ['API Gateway', 'Webhooks', 'ESB', 'Connector Library'],
    type: 'core'
  },
  {
    id: 'approval-hub',
    name: 'Gavel',
    icon: CheckSquare,
    title: 'Approval Hub',
    description: 'Centralized governance engine for all platform requests.',
    features: ['Multi-level Workflows', 'Audit Logs', 'Delegation', 'Rules Engine'],
    type: 'core'
  },
  {
    id: 'workflow-engine',
    name: 'Flow',
    icon: GitPullRequest,
    title: 'Workflow Engine',
    description: 'Visual process automation for business logic.',
    features: ['BPMN 2.0', 'Event Triggers', 'Custom Scripts', 'Process Monitoring'],
    type: 'core'
  },
  {
    id: 'user-management',
    name: 'Identity',
    icon: UserCog,
    title: 'User Management',
    description: 'Unified identity and access management.',
    features: ['SSO/SAML', 'RBAC', 'User Profiles', 'Group Sync'],
    type: 'core'
  }
];

const ExperienceDixels = DIXELS_DATA.filter(d => d.type === 'experience');
const CoreDixels = DIXELS_DATA.filter(d => d.type === 'core');

// Helper to chunk array for hex grid
const chunkArray = <T,>(arr: T[], sizes: number[]) => {
  let index = 0;
  return sizes.map(size => {
    const chunk = arr.slice(index, index + size);
    index += size;
    return chunk;
  });
};

const Hexagon = ({ 
  dixel, 
  onClick, 
  isActive 
}: { 
  dixel: Dixel; 
  onClick: () => void; 
  isActive: boolean 
}) => {
  return (
    <motion.div
      layoutId={`hex-${dixel.id}`}
      className="relative w-28 h-32 md:w-32 md:h-36 cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
    >
      <div 
        className={cn(
          "absolute inset-0 transition-colors duration-300 clip-hex",
          isActive 
            ? "bg-[#5B21B6] shadow-lg shadow-[#5B21B6]/30" 
            : dixel.id === 'neural-interface'
              ? "bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 shadow-md border-[#F59E0B]/30"
              : dixel.type === 'experience' 
                ? "bg-white hover:bg-[#5B21B6]/5 shadow-sm hover:shadow-md border-slate-200" 
                : "bg-slate-100 hover:bg-slate-200 shadow-sm hover:shadow-md border-slate-300"
        )}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full p-2 text-center">
          <dixel.icon 
            size={24} 
            className={cn(
              "mb-2 transition-colors",
              isActive ? "text-white" : dixel.id === 'neural-interface' ? "text-[#F59E0B]" : dixel.type === 'experience' ? "text-[#5B21B6]" : "text-slate-600"
            )} 
          />
          <span className={cn(
            "text-xs font-bold leading-tight",
            isActive ? "text-white" : "text-slate-700"
          )}>
            {dixel.name}
          </span>
          <span className={cn(
            "text-[9px] mt-1 opacity-70",
            isActive ? "text-emerald-100" : "text-slate-500"
          )}>
            {dixel.title}
          </span>
        </div>
      </div>
      
      {/* Border outline helper - SVG overlay since clip-path clips border */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 115.47">
        <polygon 
          points="50 0.5, 99.5 29.1, 99.5 86.4, 50 114.9, 0.5 86.4, 0.5 29.1" 
          fill="none" 
          stroke={isActive ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)"} 
          strokeWidth="1"
        />
      </svg>
    </motion.div>
  );
};

interface HomeProps {
  onGetStarted?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onGetStarted }) => {
  const [activeDixel, setActiveDixel] = useState<Dixel | null>(null);

  // Manual layout for honeycomb
  const expRows = chunkArray(ExperienceDixels, [4, 5, 5]);
  const coreRows = chunkArray(CoreDixels, [4, 4]);

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* 1. Hero Section - What Dixels Is */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-24 bg-gradient-to-b from-white via-slate-50 to-white">
        {/* Immersive background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#5B21B6]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F59E0B]/10 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-[#5B21B6]/10 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2, duration: 0.5 }}
               className="inline-flex items-center rounded-full border border-[#5B21B6]/20 bg-white/60 backdrop-blur-md px-4 py-1.5 text-sm font-bold text-[#5B21B6] mb-8 uppercase tracking-widest shadow-sm"
            >
              Orchestrating Experiences
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B21B6] via-purple-600 to-[#F59E0B]">Mosaic</span> of <br />
              <span className="inline-flex relative" style={{ perspective: "1000px" }}>
                <span className="w-[0.75em] h-[1em] relative block">
                   {/* P */}
                   <motion.span 
                     className="absolute inset-0 text-slate-900 origin-bottom"
                     animate={{ 
                       opacity: [1, 1, 0, 0, 1],
                       rotateX: [0, 0, -90, -90, 0]
                     }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.55, 0.90, 1] }}
                   >
                     P
                   </motion.span>
                   {/* D */}
                   <motion.span 
                      className="absolute inset-0 text-[#F59E0B] origin-bottom"
                      animate={{ 
                        opacity: [0, 0, 1, 1, 0],
                        rotateX: [90, 90, 0, 0, 90]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.55, 0.90, 1] }}
                   >
                     D
                   </motion.span>
                </span>
                <span>ixels</span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              <span className="font-semibold text-[#5B21B6]">Dixels</span> is a Digital Experience Platform where every <span className="italic">"dixel"</span> is a modular digital experience. 
              Combined, they create a seamless, intelligent, and customizable workplace ecosystem <span className="text-slate-900 font-medium border-b-2 border-[#F59E0B]/30">merging into yours</span>.
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex justify-center"
            >
               <button 
                 onClick={onGetStarted}
                 className="group px-10 py-5 bg-[#5B21B6] text-white font-bold text-lg rounded-full hover:bg-purple-800 transition-all shadow-2xl shadow-[#5B21B6]/30 hover:shadow-purple-900/50 flex items-center gap-3"
               >
                 Explore the Platform
                 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Hexagon Ecosystem Section */}
      <section className="mb-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-50/50 -skew-y-3 z-0 transform origin-top-left scale-110" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">The Ecosystem</h2>
            <p className="text-slate-500">Explore our modular "Dixels" and Core Capabilities</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 min-h-[600px] bg-[rgba(0,0,0,0)]">
            {/* Map Container - Meshes Left */}
            <motion.div 
              layout
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="flex-1 flex flex-col items-center justify-center space-y-[-2rem] md:space-y-[-2.5rem] py-10"
            >
              {/* Experience Layers */}
              {expRows.map((row, i) => (
                <div 
                  key={`exp-row-${i}`} 
                  className={cn(
                    "flex justify-center",
                    // Shift 3rd row (index 2) to nest with the 2nd row (index 1) since they have same length (5)
                    i === 2 && "translate-x-14 md:translate-x-16"
                  )}
                >
                  {row.map(dixel => (
                    <Hexagon 
                      key={dixel.id} 
                      dixel={dixel} 
                      isActive={activeDixel?.id === dixel.id}
                      onClick={() => setActiveDixel(dixel)}
                    />
                  ))}
                </div>
              ))}
              
              {/* Divider / Connector */}
              <div className="h-12 w-full flex justify-center items-center my-4">
                <div className="h-full w-px bg-slate-200 dashed" />
              </div>

              {/* Core Layers */}
              {coreRows.map((row, i) => (
                <div 
                  key={`core-row-${i}`} 
                  className={cn(
                    "flex justify-center",
                    // Stagger rows: Shift even left, odd right by 1/4 hex width to create 1/2 hex offset relative
                    i % 2 === 0 ? "-translate-x-7 md:-translate-x-8" : "translate-x-7 md:translate-x-8"
                  )}
                >
                  {row.map(dixel => (
                    <Hexagon 
                      key={dixel.id} 
                      dixel={dixel} 
                      isActive={activeDixel?.id === dixel.id}
                      onClick={() => setActiveDixel(dixel)}
                    />
                  ))}
                </div>
              ))}
            </motion.div>

            {/* Info Panel - Shows on Right */}
            <AnimatePresence mode="popLayout">
              {activeDixel && (
                <motion.div
                  initial={{ width: 0, opacity: 0, x: 20 }}
                  animate={{ width: "auto", opacity: 1, x: 0 }}
                  exit={{ width: 0, opacity: 0, x: 20 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  className="w-full lg:w-[450px] shrink-0 sticky top-24 z-20"
                >
                  <motion.div
                    key={activeDixel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                  >
                    {/* Header with Icon background */}
                    <div className="relative h-32 bg-[#5B21B6] flex items-center justify-center overflow-hidden">
                      <activeDixel.icon className="absolute text-white/5 w-64 h-64 -right-10 -bottom-10 rotate-12" />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#4C1D95] to-[#F59E0B]/40" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2 border border-white/20 shadow-inner">
                          <activeDixel.icon className="text-[#F59E0B] w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{activeDixel.name}</h3>
                        <p className="text-white/70 text-sm">{activeDixel.title}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveDixel(null); }}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {activeDixel.description}
                      </p>
                      
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Capabilities</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {activeDixel.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="mt-1 w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                        <span className={cn(
                          "text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider",
                          activeDixel.type === 'experience' 
                            ? "bg-[#5B21B6]/10 text-[#5B21B6] border border-[#5B21B6]/20" 
                            : "bg-[#F59E0B]/10 text-[#B45309] border border-[#F59E0B]/20"
                        )}>
                          {activeDixel.type === 'experience' ? 'Experience Module' : 'Platform Core'}
                        </span>
                        <button className="text-sm font-bold text-[#5B21B6] hover:text-[#F59E0B] transition-colors flex items-center gap-2 group">
                          View Specs <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 3. Industry Verticals */}
      <section className="container mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Industry Verticals</h2>
          <p className="text-slate-500">Tailored ecosystems for specific environments</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Destination', icon: Plane, desc: 'Tourism & Hospitality', color: 'bg-sky-50 text-sky-600' },
            { name: 'Education', icon: GraduationCap, desc: 'Smart Campuses', color: 'bg-indigo-50 text-indigo-600' },
            { name: 'Workplace', icon: Briefcase, desc: 'Next-Gen Offices', color: 'bg-blue-50 text-blue-600' },
            { name: 'Sport', icon: Trophy, desc: 'Stadiums & Venues', color: 'bg-amber-50 text-amber-600' },
            { name: 'Living', icon: HomeIcon, desc: 'Residential Communities', color: 'bg-emerald-50 text-emerald-600' },
            { name: 'Healthcare', icon: Heart, desc: 'Patient-Centric Care', color: 'bg-rose-50 text-rose-600' },
          ].map((v, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all text-center group cursor-default"
            >
              <div className={cn("w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110", v.color)}>
                <v.icon size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{v.name}</h3>
              <p className="text-xs text-slate-500 leading-tight">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Target Personas Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="bg-[#4C1D95] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
           {/* Background decorative elements */}
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#5B21B6]/30 rounded-full blur-[80px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F59E0B]/10 rounded-full blur-[80px]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
           </div>

           <div className="relative z-10 text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Stakeholder Personas</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                A successful ecosystem must balance the conflicting needs of its users. 
                We map every Dixel and Touchpoint to specific human outcomes.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {[
                { 
                  name: 'The Occupant', 
                  role: 'Daily Driver', 
                  icon: Users, 
                  color: 'text-blue-400',
                  bg: 'bg-blue-400/10',
                  border: 'border-blue-400/20',
                  goal: 'Frictionless flow & productivity.',
                  pain: 'Bad Wi-Fi, finding rooms, cold coffee.',
                  dixels: ['SpaceOS', 'Nourish', 'Tribes'],
                  touchpoints: ['Mobile App', 'Room Panels']
                },
                { 
                  name: 'The Guest', 
                  role: 'VIP Experience', 
                  icon: Ticket, 
                  color: 'text-teal-400',
                  bg: 'bg-teal-400/10',
                  border: 'border-teal-400/20',
                  goal: 'Seamless arrival & clarity.',
                  pain: 'Getting lost, complex check-in, parking.',
                  dixels: ['VisitFlow', 'Pathfinder', 'LiveCanvas'],
                  touchpoints: ['Lobby Kiosk', 'Digital Signage']
                },
                { 
                  name: 'The Operator', 
                  role: 'Service Enabler', 
                  icon: Wrench, 
                  color: 'text-amber-400',
                  bg: 'bg-amber-400/10',
                  border: 'border-amber-400/20',
                  goal: 'Rapid response & efficiency.',
                  pain: 'Unreported issues, manual tasks, noise.',
                  dixels: ['Atmosphere', 'Resolve', 'Ticksense'],
                  touchpoints: ['Service Tablet', 'Desktop Portal']
                },
                { 
                  name: 'The Guardian', 
                  role: 'Governance & ESG', 
                  icon: ShieldCheck, 
                  color: 'text-purple-400',
                  bg: 'bg-purple-400/10',
                  border: 'border-purple-400/20',
                  goal: 'Compliance, safety & sustainability.',
                  pain: 'Data silos, security breaches, waste.',
                  dixels: ['Identity', 'ParkFlow', 'TwinSpace'],
                  touchpoints: ['Command Center', 'Access Control']
                },
                { 
                  name: 'The Owner', 
                  role: 'Asset Value', 
                  icon: TrendingUp, 
                  color: 'text-pink-400',
                  bg: 'bg-pink-400/10',
                  border: 'border-pink-400/20',
                  goal: 'Maximize ROI & Asset Value.',
                  pain: 'Vacancy, OpEx leakage, depreciation.',
                  dixels: ['TwinSpace', 'Marketplace', 'Analytics'],
                  touchpoints: ['Executive Dashboard', 'Portfolio View']
                },
              ].map((p, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
                    "bg-white/5 hover:bg-white/10 backdrop-blur-md border",
                    p.border
                  )}
                >
                   {/* Header */}
                   <div className="flex items-center gap-4 mb-6">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", p.bg, p.color)}>
                        <p.icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-none mb-1">{p.name}</h3>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", p.color)}>{p.role}</span>
                      </div>
                   </div>

                   {/* Goal Statement */}
                   <div className="mb-6">
                      <p className="text-slate-300 text-sm leading-relaxed mb-2">
                        <span className="text-slate-500 font-semibold text-xs uppercase block mb-1">North Star</span>
                        "{p.goal}"
                      </p>
                      <p className="text-slate-400 text-xs italic">
                         Solve for: {p.pain}
                      </p>
                   </div>

                   {/* Separator */}
                   <div className="h-px w-full bg-white/10 mb-6" />

                   {/* Mapping */}
                   <div className="space-y-4">
                      <div>
                        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest block mb-2">Core Dixels</span>
                        <div className="flex flex-wrap gap-2">
                          {p.dixels.map(d => (
                            <span key={d} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-300 group-hover:bg-white/10 transition-colors">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest block mb-2">Key Touchpoints</span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                           {p.touchpoints.join(' • ')}
                        </div>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. Omni-Channel Integrations */}
      <section className="container mx-auto px-4 mb-24">
        <div className="text-center mb-12">
           <h2 className="text-2xl font-bold text-slate-900">Omni-Channel Touchpoints</h2>
           <p className="text-slate-500">Delivering the right experience, on the right device, at the right time.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Personal Devices */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Smartphone size={20} /></div>
                <h3 className="font-bold text-slate-900">Personal Devices</h3>
             </div>
             <p className="text-xs text-slate-500 mb-4 leading-relaxed">
               Interfaces that move with the user, maintaining their individual context, preferences, and identity across the journey.
             </p>
             <ul className="space-y-3 mt-auto">
                {[
                  { label: 'Mobile App', sub: 'The pocket concierge', icon: Smartphone },
                  { label: 'Web Portal', sub: 'Deep work & admin', icon: Globe },
                  { label: 'Wearables', sub: 'Quick notifications', icon: Watch },
                ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <item.icon size={16} className="mt-1 text-slate-400 shrink-0" />
                      <div>
                         <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                         <div className="text-xs text-slate-400">{item.sub}</div>
                      </div>
                   </li>
                ))}
             </ul>
          </div>

          {/* Shared Spaces */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Monitor size={20} /></div>
                <h3 className="font-bold text-slate-900">Shared Spaces</h3>
             </div>
             <p className="text-xs text-slate-500 mb-4 leading-relaxed">
               Fixed "Building OS" infrastructure. Publicly accessible devices used to navigate, book, or query the physical environment itself.
             </p>
             <ul className="space-y-3 mt-auto">
                {[
                  { label: 'Lobby Kiosk', sub: 'Visitor check-in', icon: Monitor },
                  { label: 'Room Panels', sub: 'iPad/Tablet scheduler', icon: Tablet },
                  { label: 'Digital Signage', sub: 'TVs & Video Walls', icon: Tv },
                ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <item.icon size={16} className="mt-1 text-slate-400 shrink-0" />
                      <div>
                         <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                         <div className="text-xs text-slate-400">{item.sub}</div>
                      </div>
                   </li>
                ))}
             </ul>
          </div>

          {/* Contextual & Ambient */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Mic size={20} /></div>
                <h3 className="font-bold text-slate-900">Ambient Intelligence</h3>
             </div>
             <p className="text-xs text-slate-500 mb-4 leading-relaxed">
               Invisible or hands-free layers. These touchpoints sense context and intent, removing the need for explicit screen interaction.
             </p>
             <ul className="space-y-3 mt-auto">
                {[
                  { label: 'Voice Control', sub: 'Smart speakers', icon: Mic },
                  { label: 'IoT Sensors', sub: 'Occupancy & comfort', icon: Wifi },
                  { label: 'Smart Desks', sub: 'Auto-height adjust', icon: Sliders },
                ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <item.icon size={16} className="mt-1 text-slate-400 shrink-0" />
                      <div>
                         <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                         <div className="text-xs text-slate-400">{item.sub}</div>
                      </div>
                   </li>
                ))}
             </ul>
          </div>

          {/* Service Points */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Coffee size={20} /></div>
                <h3 className="font-bold text-slate-900">Service Points</h3>
             </div>
             <p className="text-xs text-slate-500 mb-4 leading-relaxed">
               Specialized, transactional stations. Devices dedicated to specific hospitality, amenity, or operational workflows.
             </p>
             <ul className="space-y-3 mt-auto">
                {[
                  { label: 'Kitchen Panel', sub: 'Barista display', icon: Tablet },
                  { label: 'POS Terminal', sub: 'Cafeteria checkout', icon: CreditCard },
                  { label: 'Feedback Tab', sub: 'Smiley terminals', icon: Smile },
                ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <item.icon size={16} className="mt-1 text-slate-400 shrink-0" />
                      <div>
                         <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                         <div className="text-xs text-slate-400">{item.sub}</div>
                      </div>
                   </li>
                ))}
             </ul>
          </div>
        </div>
      </section>

      {/* 6. Product Dimensions */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Dixels Product Framework</h2>
          <p className="text-lg text-slate-600">
            A three-dimensional approach to product definition that ensures scalability, 
            interoperability, and AI-readiness from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Dimension 1 */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileJson size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#5B21B6]/5 text-[#5B21B6] rounded-lg flex items-center justify-center mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Dimension 1</h3>
              <h4 className="text-[#5B21B6] font-semibold mb-4">Core Experience</h4>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                The foundation of your daily tasks. We build intuitive, reliable tools that help you get things done quickly and without friction.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#5B21B6]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">1</div>
                  <span>User-Centric Design</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#5B21B6]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">2</div>
                  <span>Simplified Workflows</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#5B21B6]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">3</div>
                  <span>Reliable Performance</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Dimension 2 */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg flex items-center justify-center mb-6">
                <Network size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Dimension 2</h3>
              <h4 className="text-[#F59E0B] font-semibold mb-4">Connected Ecosystem</h4>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Breaking down silos. Your services communicate with each other, so you don't have to enter the same information twice.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs font-bold">1</div>
                  <span>Integrated Services</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs font-bold">2</div>
                  <span>Real-time Updates</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs font-bold">3</div>
                  <span>Unified Profile</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Dimension 3 */}
          <div className="bg-[#4C1D95] rounded-xl p-8 border border-[#5B21B6] shadow-xl relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-[#F59E0B]">
              <Cpu size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#F59E0B]/20 text-[#F59E0B] rounded-lg flex items-center justify-center mb-6 border border-[#F59E0B]/30">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Dimension 3</h3>
              <h4 className="text-[#fcd34d] font-semibold mb-4">Intelligent Assistance</h4>
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                A system that learns and adapts. We use advanced AI to anticipate your needs and offer help proactively.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/30 text-[#fcd34d] flex items-center justify-center text-xs font-bold border border-[#F59E0B]/50">1</div>
                  <span>Proactive Recommendations</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/30 text-[#fcd34d] flex items-center justify-center text-xs font-bold border border-[#F59E0B]/50">2</div>
                  <span>Context-Aware Help</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/30 text-[#fcd34d] flex items-center justify-center text-xs font-bold border border-[#F59E0B]/50">3</div>
                  <span>Automated Actions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Framework Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-[#4C1D95] text-white rounded-2xl p-6 md:p-8 border border-[#5B21B6] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
             <BarChart size={240} className="text-[#F59E0B]" />
          </div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="text-[#F59E0B]" /> Analytics Framework
              </h3>
              <p className="text-slate-400 max-w-2xl">
                Analytics is the fourth layer that sits on top of all three dimensions, turning every functional action, 
                composability event, and neural decision into measurable signals for product, ops, and AI teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#5B21B6] border-[#7C3AED] text-white">
                <CardHeader>
                  <CardTitle className="text-[#A78BFA] text-lg flex items-center gap-2">
                    <MousePointerClick size={18}/> Functional
                  </CardTitle>
                  <CardDescription className="text-slate-500">Dimension 1</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-3 text-slate-300">
                  <p>Track how users actually use the feature.</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li>Clicks on “Find free room”</li>
                    <li>Completion rate of bookings</li>
                    <li>Time to complete booking & drop‑off steps</li>
                    <li>Errors seen by users vs silent failures</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#5B21B6] border-[#7C3AED] text-white">
                <CardHeader>
                  <CardTitle className="text-[#F59E0B] text-lg flex items-center gap-2">
                    <Network size={18}/> Composability
                  </CardTitle>
                  <CardDescription className="text-slate-500">Dimension 2</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-3 text-slate-300">
                  <p>Treat events as analytics primitives.</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li>Count/latency of booking.created/modified</li>
                    <li>Success of downstream reactions (catering/controls)</li>
                    <li>Cross‑module funnels (e.g. Booking → Catering → Controls)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#5B21B6] border-[#7C3AED] text-white">
                <CardHeader>
                  <CardTitle className="text-[#fcd34d] text-lg flex items-center gap-2">
                    <Brain size={18}/> Neural
                  </CardTitle>
                  <CardDescription className="text-slate-500">Dimension 3</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-3 text-slate-300">
                  <p>Measure how well the neural interface is doing.</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li>AI suggestions shown vs accepted vs ignored</li>
                    <li>Autonomy usage (Tier 1-3)</li>
                    <li>“Regret”/Override rate (user changes AI action)</li>
                    <li>Safety: blocked actions, rollbacks</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};