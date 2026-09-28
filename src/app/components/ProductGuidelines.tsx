import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Users, Zap, Coffee, Ticket, Tent, ConciergeBell, 
  LifeBuoy, Map, Navigation, 
  Copy, FileText, Image, ShoppingBag, Network, 
  CheckSquare, GitPullRequest, UserCog, ArrowRight, Layers, Cpu, FileJson, X, Brain, Car,
  Activity, BarChart, TrendingUp, MousePointerClick, MessageSquare,
  Plane, GraduationCap, Briefcase, Trophy, Home, Heart, ShieldCheck, User, Wrench, Shield,
  Smartphone, Monitor, Tablet, Watch, Mic, Wifi, CreditCard, Smile, Globe, Sliders,
  Lock, Fingerprint, Camera, Server, Speaker, Database, Cloud, Siren, Key, Radio, Video,
  CloudLightning, MessageCircle, CloudRain, Tv
} from 'lucide-react';
import { cn } from './ui/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

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

export function ProductGuidelines() {
  const [activeDixel, setActiveDixel] = useState<Dixel | null>(null);

  // Manual layout for honeycomb
  const expRows = chunkArray(ExperienceDixels, [4, 5, 5]);
  const coreRows = chunkArray(CoreDixels, [4, 4]);

  return (
    <div className="min-h-screen pb-20 pt-8 font-sans">
      
      {/* Header */}
      <div className="container mx-auto px-4 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Dixels Product Guidelines
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            A comprehensive framework for defining, designing, and delivering the next generation of 
            digital-physical experiences.
          </p>
        </motion.div>
      </div>

      {/* Verticals Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Industry Verticals</h2>
          <p className="text-slate-500">Tailored ecosystems for specific environments</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Destination', icon: Plane, desc: 'Tourism & Hospitality', color: 'bg-[#5B21B6]/10 text-[#5B21B6]' },
            { name: 'Education', icon: GraduationCap, desc: 'Smart Campuses', color: 'bg-[#F59E0B]/10 text-[#B45309]' },
            { name: 'Workplace', icon: Briefcase, desc: 'Next-Gen Offices', color: 'bg-[#5B21B6]/20 text-[#5B21B6]' },
            { name: 'Sport', icon: Trophy, desc: 'Stadiums & Venues', color: 'bg-[#F59E0B]/20 text-[#B45309]' },
            { name: 'Living', icon: Home, desc: 'Residential Communities', color: 'bg-[#5B21B6] text-white' },
            { name: 'Healthcare', icon: Heart, desc: 'Patient-Centric Care', color: 'bg-[#F59E0B]/30 text-[#B45309]' },
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

      {/* Hexagon Ecosystem Section */}
      <section className="mb-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-50/50 -skew-y-3 z-0 transform origin-top-left scale-110" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">The Ecosystem</h2>
            <p className="text-slate-500">Explore our modular "Dixels" and Core Capabilities</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 min-h-[600px]">
            {/* Map Container - Meshes Left */}
            <motion.div 
              layout
              className={cn(
                "flex-1 flex flex-col items-center justify-center space-y-[-2rem] md:space-y-[-2.5rem] py-10 transition-all duration-500",
                activeDixel ? "lg:items-end lg:pr-16" : ""
              )}
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
            <AnimatePresence mode="wait">
              {activeDixel && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="w-full lg:w-[450px] shrink-0 sticky top-24 z-20"
                >
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Header with Icon background */}
                    <div className="relative h-32 bg-[#5B21B6] flex items-center justify-center overflow-hidden">
                      <activeDixel.icon className="absolute text-white/5 w-64 h-64 -right-10 -bottom-10 rotate-12" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2 border border-white/20">
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
                      
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Key Features</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {activeDixel.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5B21B6] shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                        <span className={cn(
                          "text-xs font-semibold px-2 py-1 rounded-full",
                          activeDixel.type === 'experience' 
                            ? "bg-[#5B21B6]/10 text-[#5B21B6]" 
                            : "bg-[#F59E0B]/10 text-[#B45309]"
                        )}>
                          {activeDixel.type === 'experience' ? 'Experience Module' : 'Platform Core'}
                        </span>
                        <button className="text-sm font-medium text-[#5B21B6] hover:text-[#F59E0B] flex items-center gap-1 transition-colors">
                          View Specs <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Target Personas Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="bg-[#4C1D95] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
           {/* Background decorative elements */}
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#5B21B6]/40 rounded-full blur-[80px]" />
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

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
              {[
                { 
                  name: 'The Occupant', 
                  role: 'Daily Driver', 
                  icon: Users, 
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-400/10',
                  border: 'border-emerald-400/20',
                  goal: 'Frictionless flow & productivity.',
                  pain: 'Bad Wi-Fi, finding rooms, cold coffee.',
                  dixels: ['SpaceOS', 'Nourish', 'Tribes'],
                  touchpoints: ['Mobile App', 'Room Panels']
                },
                { 
                  name: 'The Guest', 
                  role: 'VIP Experience', 
                  icon: Ticket, 
                  color: 'text-[#F59E0B]',
                  bg: 'bg-[#F59E0B]/10',
                  border: 'border-[#F59E0B]/20',
                  goal: 'Seamless arrival & clarity.',
                  pain: 'Getting lost, complex check-in, parking.',
                  dixels: ['VisitFlow', 'Pathfinder', 'LiveCanvas'],
                  touchpoints: ['Lobby Kiosk', 'Digital Signage']
                },
                { 
                  name: 'The Operator', 
                  role: 'Service Enabler', 
                  icon: Wrench, 
                  color: 'text-amber-200',
                  bg: 'bg-amber-200/10',
                  border: 'border-amber-200/20',
                  goal: 'Rapid response & efficiency.',
                  pain: 'Unreported issues, manual tasks, noise.',
                  dixels: ['Atmosphere', 'Resolve', 'Ticksense'],
                  touchpoints: ['Service Tablet', 'Desktop Portal']
                },
                { 
                  name: 'The Guardian', 
                  role: 'Governance & ESG', 
                  icon: ShieldCheck, 
                  color: 'text-emerald-200',
                  bg: 'bg-emerald-200/10',
                  border: 'border-emerald-200/20',
                  goal: 'Compliance, safety & sustainability.',
                  pain: 'Data silos, security breaches, waste.',
                  dixels: ['Identity', 'ParkFlow', 'TwinSpace'],
                  touchpoints: ['Command Center', 'Access Control']
                },
              ].map((p, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
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

      {/* Omni-Channel Touchpoints Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="text-center mb-12">
           <h2 className="text-2xl font-bold text-slate-900">Omni-Channel Touchpoints</h2>
           <p className="text-slate-500">Delivering the right experience, on the right device, at the right time.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Personal Devices */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#5B21B6]/10 text-[#5B21B6] rounded-lg"><Smartphone size={20} /></div>
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
                <div className="p-2 bg-[#F59E0B]/10 text-[#B45309] rounded-lg"><Monitor size={20} /></div>
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
                <div className="p-2 bg-[#5B21B6]/20 text-[#5B21B6] rounded-lg"><Mic size={20} /></div>
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
                <div className="p-2 bg-[#F59E0B]/30 text-[#B45309] rounded-lg"><Coffee size={20} /></div>
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

      {/* Product Framework Section (Dimensions) */}
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
              <h4 className="text-[#5B21B6] font-semibold mb-4">Functional Definition</h4>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                The traditional foundation of product management. Rigorous definition of the user problem, solution scope, and acceptance criteria.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#5B21B6]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">1</div>
                  <span>User Stories & Personas</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#5B21B6]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">2</div>
                  <span>UI/UX Mocks & Flows</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#5B21B6]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">3</div>
                  <span>Acceptance Criteria</span>
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
              <h4 className="text-[#F59E0B] font-semibold mb-4">Composability & Interop</h4>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                The architectural contract. How this Dixel interacts with the ecosystem. No Dixel is an island; define the inputs, outputs, and side effects.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs font-bold">1</div>
                  <span>Event Triggers & Listeners</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs font-bold">2</div>
                  <span>Data Contracts (DTOs)</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs font-bold">3</div>
                  <span>Workflow Hooks</span>
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
              <h4 className="text-[#fcd34d] font-semibold mb-4">Neural Intelligence</h4>
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                The "MCP First" approach. Exposing context and affordances for AI agents. Making the Dixel accessible not just to humans, but to the Neural Core.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/30 text-[#fcd34d] flex items-center justify-center text-xs font-bold border border-[#F59E0B]/50">1</div>
                  <span>Model Context Protocol (MCP)</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/30 text-[#fcd34d] flex items-center justify-center text-xs font-bold border border-[#F59E0B]/50">2</div>
                  <span>Semantic Context Embedding</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/30 text-[#fcd34d] flex items-center justify-center text-xs font-bold border border-[#F59E0B]/50">3</div>
                  <span>Agentic Action Primitives</span>
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

            <Tabs defaultValue="dims" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#5B21B6]/50 p-1">
                <TabsTrigger value="dims" className="data-[state=active]:bg-[#5B21B6] data-[state=active]:text-white text-slate-300">The 3 Dimensions</TabsTrigger>
                <TabsTrigger value="prd" className="data-[state=active]:bg-[#5B21B6] data-[state=active]:text-white text-slate-300">PRD Questions</TabsTrigger>
                <TabsTrigger value="metrics" className="data-[state=active]:bg-[#5B21B6] data-[state=active]:text-white text-slate-300">Minimal Metrics Set</TabsTrigger>
              </TabsList>

              <TabsContent value="dims" className="mt-0">
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
              </TabsContent>

              <TabsContent value="prd" className="mt-0">
                 <Card className="bg-slate-800 border-slate-700">
                   <CardContent className="p-6">
                     <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                       <MessageSquare className="text-yellow-400" size={20}/> Practical Analytics Questions for PMs
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                             <h5 className="text-blue-400 text-sm font-bold mb-2">Usage & Adoption</h5>
                             <ul className="text-slate-400 text-xs space-y-2 list-disc pl-4">
                               <li>How many unique users use this feature weekly?</li>
                               <li>What % of relevant journeys use the AI‑augmented path vs manual path?</li>
                             </ul>
                           </div>
                           <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                             <h5 className="text-green-400 text-sm font-bold mb-2">Efficiency</h5>
                             <ul className="text-slate-400 text-xs space-y-2 list-disc pl-4">
                               <li>How many steps / time does this save vs previous way?</li>
                               <li>Avg time from opening event → confirmed room (with vs without AI).</li>
                             </ul>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                             <h5 className="text-teal-400 text-sm font-bold mb-2">Reliability & Composability</h5>
                             <ul className="text-slate-400 text-xs space-y-2 list-disc pl-4">
                               <li>% of booking.created events that trigger notifications/controls/catering?</li>
                               <li>Latency from booking to each downstream module.</li>
                             </ul>
                           </div>
                           <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                             <h5 className="text-purple-400 text-sm font-bold mb-2">AI Quality</h5>
                             <ul className="text-slate-400 text-xs space-y-2 list-disc pl-4">
                               <li>Suggestion acceptance rate by scenario?</li>
                               <li>How often users override AI’s chosen room/time?</li>
                               <li>How many Tier‑3 auto actions needed correction?</li>
                             </ul>
                           </div>
                        </div>
                     </div>
                   </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="metrics" className="mt-0">
                 <Card className="bg-slate-800 border-slate-700">
                   <CardHeader>
                     <CardTitle className="text-white flex items-center gap-2">
                       <TrendingUp className="text-green-400" /> Example: "Book a Room" Dixel
                     </CardTitle>
                     <CardDescription className="text-slate-400">Minimal metrics set for a core feature</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Core */}
                        <div>
                          <Badge className="bg-blue-900 text-blue-200 mb-3 border-blue-700">Core Metrics</Badge>
                          <ul className="text-sm text-slate-300 space-y-3 font-mono">
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>bookings_created_per_day</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>bookings_per_active_user</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>booking_completion_rate</span>
                            </li>
                          </ul>
                        </div>

                        {/* AI Specific */}
                        <div>
                          <Badge className="bg-purple-900 text-purple-200 mb-3 border-purple-700">AI Specific</Badge>
                          <ul className="text-sm text-slate-300 space-y-3 font-mono">
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>ai_room_suggestion_impressions</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>ai_suggestion_accept_rate</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>ai_action_override_rate</span>
                            </li>
                          </ul>
                        </div>

                        {/* Composability */}
                        <div>
                          <Badge className="bg-teal-900 text-teal-200 mb-3 border-teal-700">Composability Health</Badge>
                          <ul className="text-sm text-slate-300 space-y-3 font-mono">
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>event_to_notification_latency</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>%bookings_with_catering</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-700 pb-1">
                              <span>%downstream_failure_rate</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                   </CardContent>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Deep Dive & Templates */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">The Dixel Spec: Toolkit & Templates</h3>
            <p className="text-slate-600">
              Reference implementations for Product Managers. Use these templates to define your Dixel.
            </p>
          </div>

          <Tabs defaultValue="dim1" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-200/50 p-1">
              <TabsTrigger value="dim1">Dim 1: Definition</TabsTrigger>
              <TabsTrigger value="dim2">Dim 2: Composability</TabsTrigger>
              <TabsTrigger value="dim3">Dim 3: Intelligence</TabsTrigger>
            </TabsList>

            {/* Dimension 1 Content */}
            <TabsContent value="dim1" className="mt-0">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Template Column */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <FileText size={18} className="text-blue-600"/> PRD Template
                     </CardTitle>
                     <CardDescription>Standard structure for functional requirements</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4 text-sm font-mono text-slate-600">
                      <div className="bg-slate-100 p-3 rounded border border-slate-200">
                        <span className="text-slate-400"># 1. Problem Space</span><br/>
                        <span className="text-blue-600">Problem Statement:</span> [What is broken?]<br/>
                        <span className="text-blue-600">Target Persona:</span> [Who cares?]<br/>
                        <span className="text-blue-600">Why Now:</span> [Urgency/Opportunity]
                      </div>
                      <div className="bg-slate-100 p-3 rounded border border-slate-200">
                        <span className="text-slate-400"># 2. User Journey</span><br/>
                        <span className="text-blue-600">Trigger:</span> [User Action/Event]<br/>
                        <span className="text-blue-600">Flow:</span> Step 1 -&gt; Step 2 -&gt; Step 3<br/>
                        <span className="text-blue-600">Outcome:</span> [Value Delivered]
                      </div>
                      <div className="bg-slate-100 p-3 rounded border border-slate-200">
                        <span className="text-slate-400"># 3. Success Metrics</span><br/>
                        <span className="text-blue-600">North Star:</span> [Primary Value Metric]<br/>
                        <span className="text-blue-600">Guardrail:</span> [Negative metric to watch]
                      </div>
                   </CardContent>
                 </Card>

                 {/* Example Column */}
                 <Card className="bg-blue-50/50 border-blue-100">
                   <CardHeader>
                     <CardTitle className="text-blue-900">Example: SpaceOS</CardTitle>
                     <CardDescription className="text-blue-700/70">Reference Implementation</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Problem Statement</h4>
                        <p className="text-slate-700">"Employees struggle to find quiet focus time, leading to 25% drop in deep work productivity."</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">User Journey (Deep Worker)</h4>
                        <ol className="list-decimal pl-4 text-slate-700 space-y-1">
                          <li>Opens Mobile App &gt; Selects "Focus Mode"</li>
                          <li>System suggests nearest available "Quiet Zone" pod</li>
                          <li>One-tap book &gt; Directions sent to watch</li>
                          <li>Auto check-in via badge tap</li>
                        </ol>
                      </div>
                      <div>
                         <h4 className="font-semibold text-blue-900 mb-1">Success Metrics</h4>
                         <div className="flex gap-2">
                           <Badge variant="secondary" className="bg-blue-100 text-blue-700">Util % of Focus Rooms</Badge>
                           <Badge variant="secondary" className="bg-red-50 text-red-700">Ghost Booking Rate</Badge>
                         </div>
                      </div>
                   </CardContent>
                 </Card>
               </div>
            </TabsContent>

            {/* Dimension 2 Content */}
            <TabsContent value="dim2" className="mt-0">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Template */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Network size={18} className="text-teal-600"/> Interop Schema
                     </CardTitle>
                     <CardDescription>Defining the Dixel's contract with the platform</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4 text-sm font-mono">
                      <div className="bg-slate-100 p-3 rounded border border-slate-200">
                        <span className="text-purple-600">Inbound Events</span> (Subscribed)<br/>
                        <span className="text-slate-500">Events from other Dixels that trigger logic here.</span>
                      </div>
                      <div className="bg-slate-100 p-3 rounded border border-slate-200">
                        <span className="text-teal-600">Outbound Events</span> (Published)<br/>
                        <span className="text-slate-500">State changes broadcasted to the ecosystem.</span>
                      </div>
                      <div className="bg-slate-100 p-3 rounded border border-slate-200">
                        <span className="text-blue-600">Data Models</span> (Shared Entities)<br/>
                        <span className="text-slate-500">Core entities exposed via GraphQL/API.</span>
                      </div>
                   </CardContent>
                 </Card>

                 {/* Example */}
                 <Card className="bg-teal-50/50 border-teal-100">
                   <CardHeader>
                     <CardTitle className="text-teal-900">Example: SpaceOS</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-teal-900 mb-1">Inbound Triggers</h4>
                        <div className="flex flex-wrap gap-2">
                           <Badge variant="outline" className="bg-white border-teal-200">identity.user_entered_building</Badge>
                           <Badge variant="outline" className="bg-white border-teal-200">gatekeeper.visitor_arrived</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">"When user enters building, pre-warm their booked room."</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-teal-900 mb-1">Outbound Signals</h4>
                         <div className="flex flex-wrap gap-2">
                           <Badge className="bg-teal-600 hover:bg-teal-700 text-white border-0">space.booking_created</Badge>
                           <Badge className="bg-teal-600 hover:bg-teal-700 text-white border-0">space.occupancy_detected</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">"Signal to Atmosphere Dixel to adjust HVAC based on occupancy."</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-teal-900 mb-1">Shared Entity</h4>
                        <pre className="bg-teal-900/10 p-2 rounded text-xs text-teal-900 overflow-x-auto">
                          {`type Room {
  id: ID!
  capacity: Int
  features: [Feature]
  currentTemp: Float
  nextMeeting: Booking
}`}
                        </pre>
                      </div>
                   </CardContent>
                 </Card>
               </div>
            </TabsContent>

            {/* Dimension 3 Content */}
            <TabsContent value="dim3" className="mt-0">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Template */}
                 <Card className="bg-slate-900 border-slate-800 text-slate-300">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-purple-400">
                       <Cpu size={18}/> MCP Manifest
                     </CardTitle>
                     <CardDescription className="text-slate-400">AI Agent affordances and context exposure</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4 text-sm font-mono">
                      <div className="bg-slate-800 p-3 rounded border border-slate-700">
                        <span className="text-purple-400">System Prompt Context</span><br/>
                        <span className="text-slate-500">What specific domain knowledge does the model need injected?</span>
                      </div>
                      <div className="bg-slate-800 p-3 rounded border border-slate-700">
                        <span className="text-purple-400">Tool Definitions</span><br/>
                        <span className="text-slate-500">Exposed functions: name, args, description.</span>
                      </div>
                      <div className="bg-slate-800 p-3 rounded border border-slate-700">
                        <span className="text-purple-400">Retrieval Memory</span><br/>
                        <span className="text-slate-500">Vectorized documents available for RAG.</span>
                      </div>
                   </CardContent>
                 </Card>

                 {/* Example */}
                 <Card className="bg-purple-50/50 border-purple-100">
                   <CardHeader>
                     <CardTitle className="text-purple-900">Example: SpaceOS Agent</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Context Injection</h4>
                        <p className="italic text-slate-600 border-l-2 border-purple-300 pl-2">
                          "You are an intelligent space concierge. You have real-time access to the floorplans of Building A and B. You know that 'The Hive' is a focus area and 'The Market' is for social gathering."
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">MCP Tools</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center justify-between bg-white p-2 rounded border border-purple-100">
                            <code className="text-xs font-bold text-purple-700">find_room(capacity, time, type)</code>
                            <span className="text-xs text-slate-500">Action</span>
                          </li>
                          <li className="flex items-center justify-between bg-white p-2 rounded border border-purple-100">
                            <code className="text-xs font-bold text-purple-700">book_desk(user_id, zone_id)</code>
                            <span className="text-xs text-slate-500">Mutation</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">RAG Documents</h4>
                         <div className="flex gap-2">
                           <Badge variant="secondary" className="bg-purple-100 text-purple-700">Room Policy PDF</Badge>
                           <Badge variant="secondary" className="bg-purple-100 text-purple-700">Floorplan Metadata</Badge>
                         </div>
                      </div>
                   </CardContent>
                 </Card>
               </div>
            </TabsContent>

          </Tabs>
        </div>
      </section>

      {/* Integration Ecosystem Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-bold text-slate-900 mb-4">Integration Ecosystem</h2>
           <p className="text-slate-500 max-w-2xl mx-auto">
             Connecting the physical and digital worlds through 100+ turnkey integrations. 
             Our platform unifies fragmented systems into a single cohesive experience.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            {
              category: "Access Control",
              desc: "Manage entry permissions & biometrics",
              icon: Lock,
              color: "blue",
              integrations: ["Suprema", "HID Global", "Honeywell", "Dahua"]
            },
            {
              category: "Identity Management",
              desc: "SSO & Digital Identity Sources",
              icon: Fingerprint,
              color: "indigo",
              integrations: ["Microsoft Entra", "Okta", "Ping Identity", "Google Workspace", "Auth0"]
            },
            {
              category: "Physical Security",
              desc: "CCTV, VMS & Computer Vision",
              icon: Camera,
              color: "slate",
              integrations: ["Milestone", "Genetec", "Hikvision", "Axis", "Avigilon"]
            },
            {
              category: "IoT Platforms",
              desc: "BMS, Sensors & Automation",
              icon: Wifi,
              color: "emerald",
              integrations: ["AWS IoT", "Siemens", "Schneider", "Honeywell", "Lutron"]
            },
            {
              category: "AV & Room Systems",
              desc: "Conferencing & Display Control",
              icon: Speaker,
              color: "rose",
              integrations: ["Crestron", "Zoom Rooms", "Microsoft Teams", "Cisco Webex"]
            },
            {
              category: "Collaboration",
              desc: "Productivity & Communication",
              icon: MessageCircle,
              color: "purple",
              integrations: ["Slack", "Microsoft 365", "Google Drive", "Box", "Dropbox"]
            },
            {
              category: "Service Management",
              desc: "Ticketing & FM Workflows",
              icon: Ticket,
              color: "amber",
              integrations: ["ServiceNow", "Jira", "Archibus", "Freshservice"]
            },
            {
              category: "HR & People",
              desc: "Payroll & Attendance Sources",
              icon: User,
              color: "cyan",
              integrations: ["Workday", "SAP SuccessFactors", "Oracle HCM", "ADP"]
            },
            {
              category: "Network & Security",
              desc: "Infrastructure & Connectivity",
              icon: Shield,
              color: "red",
              integrations: ["Cisco", "Fortinet", "Palo Alto", "Aruba", "Zscaler"]
            },
            {
              category: "Cloud & DevOps",
              desc: "Hosting & Observability",
              icon: Cloud,
              color: "sky",
              integrations: ["AWS", "Azure", "GitHub", "Splunk", "Datadog"]
            },
            {
              category: "Business Apps",
              desc: "ERP & CRM Core Systems",
              icon: Briefcase,
              color: "orange",
              integrations: ["Salesforce", "SAP S/4HANA", "HubSpot", "Dynamics 365"]
            },
            {
              category: "Security Monitoring",
              desc: "SIEM & SOAR Operations",
              icon: Siren,
              color: "violet",
              integrations: ["Microsoft Sentinel", "Splunk", "IBM QRadar"]
            }
          ].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
               <div className={cn("h-1.5 w-full", `bg-${cat.color}-500`)} />
               <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                     <div className={cn("p-2 rounded-lg", `bg-${cat.color}-50 text-${cat.color}-600`)}>
                        <cat.icon size={20} />
                     </div>
                     <Badge variant="secondary" className="text-[10px] font-normal text-slate-500 bg-slate-100">
                        {cat.integrations.length}+ Connectors
                     </Badge>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 mb-1">{cat.category}</h3>
                  <p className="text-xs text-slate-500 mb-6 min-h-[2.5em]">{cat.desc}</p>
                  
                  <div className="space-y-3">
                     {cat.integrations.map((app, idx) => (
                        <div key={idx} className="flex items-center gap-3 group/item">
                           <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                              {/* Logo Placeholder with fallback to initial */}
                              <img 
                                src={`https://logo.clearbit.com/${app.toLowerCase().replace(/\s+/g, '')}.com`} 
                                onError={(e) => {
                                   // Fallback to text if image fails
                                   e.currentTarget.style.display = 'none';
                                   e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                                alt={app}
                                className="w-full h-full object-contain p-0.5 opacity-80 group-hover/item:opacity-100 transition-opacity"
                              />
                              <span className="hidden text-[10px] font-bold text-slate-400">{app.substring(0,1)}</span>
                           </div>
                           <span className="text-sm text-slate-600 font-medium group-hover/item:text-slate-900 transition-colors">
                              {app}
                           </span>
                        </div>
                     ))}
                     {cat.integrations.length > 4 && (
                        <div className="text-[10px] text-slate-400 font-medium pl-9 pt-1">
                           + more available
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Agile Execution Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">
                <CheckSquare size={24} />
             </div>
             <div>
                <h3 className="text-2xl font-bold text-slate-900">Agile Execution: The Product Owner Role</h3>
                <p className="text-slate-600">Bridging the gap between high-level specs and Jira tickets. Standard templates for Epics and Stories.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Left Column: Guidelines */}
             <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                   <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                     <Layers size={16} className="text-blue-500"/> Hierarchy of Work
                   </h4>
                   <ul className="space-y-4 text-sm">
                      <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full">
                         <span className="font-bold text-slate-800">Initiative (Theme)</span>
                         <p className="text-slate-500">Quarterly strategic goal (e.g., "Improve Employee Productivity").</p>
                      </li>
                      <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-teal-500 before:rounded-full">
                         <span className="font-bold text-slate-800">Epic</span>
                         <p className="text-slate-500">Large feature set shippable in 1-2 months (e.g., "SpaceOS Focus Mode").</p>
                      </li>
                      <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-purple-500 before:rounded-full">
                         <span className="font-bold text-slate-800">User Story</span>
                         <p className="text-slate-500">Smallest unit of value, shippable in a sprint (e.g., "Auto-suggest quiet room").</p>
                      </li>
                   </ul>
                </div>
                
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                   <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                     <ArrowRight size={16}/> Definition of Ready (DoR)
                   </h4>
                   <p className="text-xs text-amber-800 mb-3">A ticket is ready for engineering only when:</p>
                   <ul className="list-disc pl-4 text-xs text-amber-800 space-y-1">
                      <li>User Story follows standard format</li>
                      <li>Acceptance Criteria (Gherkin) is complete</li>
                      <li>UX mocks are attached (Figma link)</li>
                      <li>Analytics events are defined</li>
                   </ul>
                </div>
             </div>

             {/* Right Column: Interactive Examples */}
             <div>
                <Accordion type="single" collapsible className="w-full" defaultValue="story">
                  
                  <AccordionItem value="epic">
                    <AccordionTrigger className="text-slate-900 font-semibold">
                       <span className="flex items-center gap-2"><Layers size={16} className="text-teal-600"/> Example Epic</span>
                    </AccordionTrigger>
                    <AccordionContent className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                       <div className="text-xs font-mono text-slate-500 mb-2">EPIC-101</div>
                       <h5 className="font-bold text-slate-800 mb-2">SpaceOS: Intelligent Focus Mode</h5>
                       <div className="space-y-3 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-900">Goal:</span> Increase "deep work" hours by reducing friction in finding quiet spaces.</p>
                          <p><span className="font-semibold text-slate-900">Scope:</span></p>
                          <ul className="list-disc pl-4 space-y-1">
                             <li>Mobile booking flow filtered by "Quiet" tag</li>
                             <li>Integration with IoT sensors for noise levels</li>
                             <li>Auto-DND status on Slack when checked in</li>
                          </ul>
                       </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="story">
                    <AccordionTrigger className="text-slate-900 font-semibold">
                       <span className="flex items-center gap-2"><FileText size={16} className="text-teal-600"/> Example User Story</span>
                    </AccordionTrigger>
                    <AccordionContent className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                       <div className="text-xs font-mono text-slate-500 mb-2">STORY-101-A</div>
                       <h5 className="font-bold text-slate-800 mb-2">Story: Auto-suggest Quiet Rooms</h5>
                       <div className="p-3 bg-white rounded border border-slate-200 mb-3 font-medium text-slate-700">
                          "As a <strong>Deep Worker</strong>, I want <strong>the app to suggest the quietest available room</strong>, so that <strong>I can start working immediately without searching manually.</strong>"
                       </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ac">
                    <AccordionTrigger className="text-slate-900 font-semibold">
                       <span className="flex items-center gap-2"><CheckSquare size={16} className="text-teal-600"/> Acceptance Criteria (AC)</span>
                    </AccordionTrigger>
                    <AccordionContent className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                       <p className="text-xs text-slate-500 mb-2">Gherkin Syntax (Given / When / Then)</p>
                       <ul className="space-y-3 text-sm font-mono text-slate-600">
                          <li className="bg-white p-2 rounded border border-slate-200">
                             <span className="text-purple-600 font-bold">Scenario 1:</span> Successful Suggestion<br/>
                             <span className="text-blue-600">Given</span> user location is "Building A"<br/>
                             <span className="text-blue-600">And</span> noise sensors show Room 302 is &lt; 40dB<br/>
                             <span className="text-teal-600">When</span> user taps "Focus Mode"<br/>
                             <span className="text-teal-600">Then</span> show Room 302 as top recommendation<br/>
                             <span className="text-teal-600">And</span> display "Quiet (&lt; 40dB)" badge
                          </li>
                          <li className="bg-white p-2 rounded border border-slate-200">
                             <span className="text-purple-600 font-bold">Scenario 2:</span> No Quiet Rooms<br/>
                             <span className="text-blue-600">Given</span> all rooms are &gt; 50dB<br/>
                             <span className="text-teal-600">When</span> user taps "Focus Mode"<br/>
                             <span className="text-teal-600">Then</span> show alert "High noise levels detected"<br/>
                             <span className="text-teal-600">And</span> suggest "Library Zone" instead
                          </li>
                       </ul>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
             </div>
          </div>
        </div>
      </section>

      {/* Consultant Quote */}
      <section className="container mx-auto px-4 mt-20">
        <div className="bg-slate-100 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto border border-slate-200">
          <p className="text-xl md:text-2xl font-serif italic text-slate-700 mb-6">
            "In the era of autonomous systems, a product requirement document that ignores the AI agent as a primary user is obsolete before it's written."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-slate-300 rounded-full overflow-hidden flex items-center justify-center text-slate-500 font-bold">
               MH
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900">Mahmoud Hasan</div>
              <div className="text-sm text-slate-500">Platform Architect</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}