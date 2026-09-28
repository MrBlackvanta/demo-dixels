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
  Car
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
    title: 'USER LAYER',
    description: 'Touchpoints & Interfaces',
    color: 'slate',
    items: [
      {
        id: 'super-app',
        title: 'Super App Mobile/Web',
        icon: Smartphone
      },
      {
        id: 'room-interfaces',
        title: 'Room Interfaces iPads/Tablets',
        icon: Tablet
      },
      {
        id: 'visitor-portal',
        title: 'Visitor Portal & PWA',
        icon: Globe
      },
      {
        id: 'event-portal',
        title: 'Event & Ticketing Portal',
        icon: Ticket
      },
      {
        id: 'admin-portal',
        title: 'Admin & Mgmt Portals',
        description: 'User Mgmt, Workflows, Reporting, Config',
        icon: LayoutDashboard
      }
    ]
  },
  {
    id: 'ai_intelligence',
    title: 'AI & INTELLIGENCE',
    description: 'The Brain',
    color: 'slate',
    items: [
      {
        id: 'conv-ai',
        title: 'Conversational AI Engine',
        icon: MessageSquare
      },
      {
        id: 'orchestration',
        title: 'Intelligent Orchestration',
        icon: Sparkles
      },
      {
        id: 'predictive',
        title: 'Predictive Analytics',
        icon: Activity
      },
      {
        id: 'persona-engine',
        title: 'Adaptive Persona Engine',
        icon: UserCheck
      }
    ]
  },
  {
    id: 'core_modules',
    title: 'CORE MODULES',
    description: 'Business Logic & Services',
    color: 'slate',
    items: [
      {
        id: 'space-twin',
        title: 'Space Mgmt Digital Twin',
        icon: Box,
        highlight: true
      },
      {
        id: 'space-booking',
        title: 'Space Booking',
        icon: CalendarCheck
      },
      {
        id: 'visitor-mgmt',
        title: 'Visitor Management',
        icon: Users
      },
      {
        id: 'catering',
        title: 'Catering Services',
        icon: Utensils
      },
      {
        id: 'communities',
        title: 'Communities & Events',
        icon: Users
      },
      {
        id: 'support',
        title: 'Support Center',
        icon: Headphones
      },
      {
        id: 'task-mgmt',
        title: 'Task Management',
        icon: ListTodo
      },
      {
        id: 'wayfinding',
        title: 'Wayfinding',
        icon: Navigation
      },
      {
        id: 'directory',
        title: 'Directory',
        icon: BookOpen
      },
      {
        id: 'room-control',
        title: 'Room Control',
        icon: Sliders
      },
      {
        id: 'analytics-module',
        title: 'Analytics',
        icon: LayoutDashboard
      },
      {
        id: 'cms',
        title: 'Content Management (CMS)',
        icon: FileStack
      },
      {
        id: 'dam',
        title: 'Digital Asset Mgmt (DAM)',
        icon: Image
      },
      {
        id: 'signage',
        title: 'Digital Signage',
        icon: Monitor
      },
      {
        id: 'parking',
        title: 'Smart Parking',
        icon: Car
      }
    ]
  },
  {
    id: 'integration',
    title: 'INTEGRATION LAYER',
    description: 'Dixels Universe',
    color: 'slate',
    items: [
      {
        id: 'gateway',
        title: 'Integration Gateway',
        icon: Network
      },
      {
        id: 'marketplace',
        title: 'Marketplace',
        icon: Blocks
      },
      {
        id: 'workflow-builder',
        title: 'Visual Workflow Builder',
        icon: Paintbrush
      },
      {
        id: 'low-code',
        title: 'Low-Code Connector',
        icon: Zap
      }
    ]
  },
  {
    id: 'external',
    title: 'EXTERNAL SYSTEMS',
    description: 'Connected Ecosystem',
    color: 'slate',
    items: [
      {
        id: 'access-control',
        title: 'Access Control (Biostar)',
        icon: KeyRound
      },
      {
        id: 'identity',
        title: 'Identity (AD, UAE Pass)',
        icon: UserPlus
      },
      {
        id: 'collab',
        title: 'Collaboration (Teams)',
        icon: MessageCircle
      },
      {
        id: 'iot',
        title: 'IoT & BMS Sensors',
        icon: Cpu
      },
      {
        id: 'indoor-nav',
        title: 'Indoor Navigation',
        icon: Navigation
      },
      {
        id: 'twin-data',
        title: 'Digital Twin Data',
        icon: Database
      }
    ]
  },
  {
    id: 'infrastructure',
    title: 'INFRASTRUCTURE',
    description: 'Foundation',
    color: 'emerald',
    items: [
      {
        id: 'cloud-edge',
        title: 'Cloud-Native / Edge',
        icon: Cloud
      },
      {
        id: 'security',
        title: 'Security & Compliance',
        icon: Shield
      },
      {
        id: 'data-lake',
        title: 'Data Lake & Analytics',
        icon: Database
      }
    ]
  }
];
