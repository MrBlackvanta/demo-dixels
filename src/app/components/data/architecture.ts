import { 
  Smartphone, 
  Server, 
  Database, 
  Shield, 
  Cloud, 
  Globe, 
  MessageSquare, 
  LayoutDashboard, 
  Lock, 
  Eye, 
  Zap, 
  Activity, 
  HardDrive, 
  Network,
  Bot,
  Tablet,
  Sparkles,
  ScanFace,
  CalendarCheck,
  Ticket,
  Map,
  Blocks,
  Paintbrush,
  UserCheck,
  Users,
  Utensils,
  Headphones,
  ListTodo,
  BookOpen,
  Sliders,
  KeyRound,
  UserPlus,
  MessageCircle,
  Cpu,
  Navigation,
  Box,
  FileStack,
  Image,
  Monitor,
  Car,
  Fingerprint,
  Workflow,
  Share2,
  Briefcase,
  Building2,
  Coffee,
  Tent
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  icon: any;
  highlight?: boolean;
}

export interface ArchitectureLayer {
  id: string;
  title: string;
  description: string;
  items: ServiceItem[];
  color: string;
}

export const architectureData: ArchitectureLayer[] = [
  {
    id: 'user_layer',
    title: 'OMNICHANNEL EXPERIENCE',
    description: 'Touchpoints & Interfaces',
    color: 'indigo',
    items: [
      {
        id: 'mobile',
        title: 'Mobile App',
        description: 'Pocket Concierge',
        icon: Smartphone
      },
      {
        id: 'web',
        title: 'Web Portal',
        description: 'Deep Work & Admin',
        icon: Globe
      },
      {
        id: 'kiosk',
        title: 'Lobby Kiosk',
        description: 'Visitor Check-in',
        icon: Monitor
      },
      {
        id: 'panels',
        title: 'Room Panels',
        description: 'Room Scheduler',
        icon: Tablet
      },
      {
        id: 'voice',
        title: 'Voice Control',
        description: 'Ambient Commands',
        icon: MessageSquare
      }
    ]
  },
  {
    id: 'ai_intelligence',
    title: 'CORTEX (NEURAL INTERFACE)',
    description: 'Agentic Core & Context',
    color: 'fuchsia',
    items: [
      {
        id: 'mcp',
        title: 'MCP Router',
        description: 'Tool Discovery',
        icon: Network
      },
      {
        id: 'context',
        title: 'Semantic Context',
        description: 'Vector Memory & RAG',
        icon: Database
      },
      {
        id: 'agents',
        title: 'Agentic Dispatch',
        description: 'Autonomous Action',
        icon: Bot
      },
      {
        id: 'predict',
        title: 'Predictive Models',
        description: 'Intent Forecasting',
        icon: Sparkles
      },
      {
        id: 'heal',
        title: 'Self-Healing',
        description: 'Auto-remediation',
        icon: Activity
      }
    ]
  },
  {
    id: 'core_modules',
    title: 'THE DIXELS ECOSYSTEM',
    description: 'Spatial & Workplace Services',
    color: 'teal',
    items: [
      {
        id: 'spaceos',
        title: 'SpaceOS',
        description: 'Scheduling',
        icon: CalendarCheck,
        highlight: true
      },
      {
        id: 'atmosphere',
        title: 'Atmosphere',
        description: 'Smart Controls',
        icon: Zap
      },
      {
        id: 'portal',
        title: 'VisitFlow',
        description: 'Visitor Mgmt',
        icon: Users
      },
      {
        id: 'nourish',
        title: 'Nourish',
        description: 'Smart Dining',
        icon: Coffee
      },
      {
        id: 'tribes',
        title: 'Tribes',
        description: 'Community',
        icon: Tent
      },
      {
        id: 'nexus',
        title: 'Nexus',
        description: 'Integration',
        icon: Share2
      },
      {
        id: 'identity',
        title: 'Identity',
        description: 'User Mgmt',
        icon: Fingerprint
      }
    ]
  },
  {
    id: 'integration',
    title: 'NEXUS HUB',
    description: 'Connectivity Middleware',
    color: 'blue',
    items: [
      {
        id: 'gateway',
        title: 'API Gateway',
        icon: Server
      },
      {
        id: 'mesh',
        title: 'Event Mesh',
        icon: Network
      },
      {
        id: 'marketplace',
        title: 'Marketplace',
        icon: Blocks
      },
      {
        id: 'workflow',
        title: 'Workflow Engine',
        icon: Workflow
      }
    ]
  },
  {
    id: 'external',
    title: 'CONNECTED ECOSYSTEM',
    description: 'Integrated Systems',
    color: 'blue',
    items: [
      {
        id: 'access',
        title: 'Access Control',
        description: 'HID, Suprema',
        icon: Lock
      },
      {
        id: 'iot',
        title: 'IoT Platforms',
        description: 'Siemens, Lutron',
        icon: Cpu
      },
      {
        id: 'erp',
        title: 'Enterprise Business',
        description: 'SAP, Workday',
        icon: Briefcase
      },
      {
        id: 'collab',
        title: 'Collaboration',
        description: 'Teams, Slack',
        icon: MessageCircle
      }
    ]
  },
  {
    id: 'infrastructure',
    title: 'HYBRID AI INFRASTRUCTURE',
    description: 'SaaS / Private / Edge',
    color: 'slate',
    items: [
      {
        id: 'deploy',
        title: 'Hybrid Deployment',
        description: 'SaaS/On-Prem',
        icon: Cloud
      },
      {
        id: 'vector',
        title: 'Vector DB',
        description: 'RAG Memory',
        icon: Database
      },
      {
        id: 'llm',
        title: 'LLM Ops',
        description: 'Inference',
        icon: Cpu
      },
      {
        id: 'guard',
        title: 'AI Guardrails',
        description: 'Safety',
        icon: Shield
      }
    ]
  }
];
