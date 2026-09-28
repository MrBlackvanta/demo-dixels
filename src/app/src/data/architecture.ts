import { 
  Smartphone, 
  Server, 
  Database, 
  Shield, 
  Cloud, 
  Cpu, 
  Layers, 
  Globe, 
  MessageSquare, 
  LayoutDashboard, 
  Lock, 
  Eye, 
  Zap, 
  Activity, 
  HardDrive, 
  Network 
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: any;
}

export interface ArchitectureLayer {
  id: string;
  title: string;
  description: string;
  items: ServiceItem[];
  color: string; // Tailwind color class prefix e.g. 'blue'
}

export const architectureData: ArchitectureLayer[] = [
  {
    id: 'ux',
    title: '2. User Experience Layer',
    description: 'Unified interfaces for all personas',
    color: 'indigo',
    items: [
      {
        id: 'super-app',
        title: 'Super App (Mobile/Web)',
        description: 'Unified interface for employees and other personas, accessing all integrated services with personalized AI assistance.',
        icon: Smartphone
      },
      {
        id: 'room-control',
        title: 'Room Control Interfaces',
        description: 'Room iPads/tablets and web dashboards to manage room environments and services.',
        icon: LayoutDashboard
      },
      {
        id: 'conversational-ai',
        title: 'Conversational AI Engine',
        description: 'Conversational interface available across apps for voice and text interaction to perform tasks like booking, ordering, visitor invites.',
        icon: MessageSquare
      },
      {
        id: 'admin-portals',
        title: 'Admin & Management Portals',
        description: 'Web portals for facility managers, security teams, admins, and executives to monitor, configure, and report.',
        icon: Globe
      }
    ]
  },
  {
    id: 'core',
    title: '1. Core Platform Layer',
    description: 'Central logic and integration hub',
    color: 'blue',
    items: [
      {
        id: 'api-gateway',
        title: 'API Gateway',
        description: 'Central entry point managing authentication, request routing, rate limiting, and API versioning.',
        icon: Network
      },
      {
        id: 'microservices',
        title: 'Microservices Architecture',
        description: 'Modular services handling key functionalities such as room booking, visitor management, event/ticketing, facility monitoring, security, and AI.',
        icon: Server
      },
      {
        id: 'integration',
        title: 'Integration Layer',
        description: 'Connectors and adapters for existing customer systems (physical access control, Active Directory, IoT sensors, digital twins, calendar services).',
        icon: Layers
      }
    ]
  },
  {
    id: 'data',
    title: '3. Data & Intelligence Layer',
    description: 'Processing, storage, and insights',
    color: 'violet',
    items: [
      {
        id: 'real-time',
        title: 'Real-Time Data Processing',
        description: 'Stream processing for sensor data, occupancy, and event triggers to enable prompt reactions and analytics.',
        icon: Zap
      },
      {
        id: 'data-lake',
        title: 'Data Lake & Warehouse',
        description: 'Storage for structured and unstructured data including logs, sensor data, bookings, security events, and AI training datasets.',
        icon: Database
      },
      {
        id: 'ai-engine',
        title: 'AI & Analytics Engine',
        description: 'Machine learning models for habit detection, space optimization, predictive maintenance, anomaly detection, and personalized recommendations.',
        icon: Cpu
      },
      {
        id: 'digital-twin',
        title: 'Digital Twin Services',
        description: 'Maintain accurate virtual representations of physical spaces for navigation, management, and simulation.',
        icon: Activity
      }
    ]
  },
  {
    id: 'security',
    title: '4. Security & Compliance Layer',
    description: 'Cross-cutting protection and governance',
    color: 'emerald',
    items: [
      {
        id: 'iam',
        title: 'Identity & Access Mgmt',
        description: 'Integration with Active Directory, Single Sign-On (SSO), multi-factor authentication.',
        icon: Lock
      },
      {
        id: 'privacy',
        title: 'Data Privacy & Governance',
        description: 'Compliance with regional standards (e.g., GDPR, local data laws), encryption at rest/in transit.',
        icon: Shield
      },
      {
        id: 'audit',
        title: 'Audit & Monitoring',
        description: 'Logging of user actions, security events, and access for compliance and risk management.',
        icon: Eye
      }
    ]
  },
  {
    id: 'infra',
    title: '5. Scalability & Infrastructure',
    description: 'Foundation and deployment',
    color: 'slate',
    items: [
      {
        id: 'cloud',
        title: 'Cloud-Native Deployment',
        description: 'Containerized microservices orchestrated via Kubernetes for elasticity and high availability.',
        icon: Cloud
      },
      {
        id: 'edge',
        title: 'Edge Computing Options',
        description: 'For onsite IoT processing and low-latency room control where needed.',
        icon: HardDrive
      },
      {
        id: 'sdk',
        title: 'Extensible Plugin/SDK',
        description: 'Allow customers or partners to develop/customize modules without disrupting core services.',
        icon: Layers
      }
    ]
  }
];
