import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Users, 
  Globe, 
  FileText, 
  Image, 
  Shield, 
  Code, 
  GitBranch, 
  BarChart, 
  Mail, 
  Languages, 
  Activity, 
  Terminal, 
  ToggleLeft 
} from 'lucide-react';
import { cn } from './ui/utils';

const platformFeatures = [
  {
    title: "1. User & Identity Management",
    icon: Users,
    items: [
      "User Provisioning: Bulk import, SSO integration, automated onboarding/offboarding.",
      "Role & Permission Management: Granular RBAC per module, space, and persona type.",
      "Multi-Tenancy Support: Manage users across multiple organizations/subsidiaries.",
      "Session & Token Management: JWT/OAuth2, session timeouts, device trust policies."
    ]
  },
  {
    title: "2. Tenant & Organization Configuration",
    icon: Settings,
    items: [
      "Organization Setup: Create and manage multiple tenant instances with isolated data.",
      "Branding & Theming: White-label customization (logos, colors, themes).",
      "Regional & Compliance Settings: Data residency, language preferences, local regulations."
    ]
  },
  {
    title: "3. Content Management System (CMS)",
    icon: FileText,
    items: [
      "Announcements & Communications: Company-wide messages and alerts.",
      "Learning Content: Curate guides, videos, FAQs for employees.",
      "Digital Signage: Manage content for room displays and lobby screens.",
      "Rich Content Editor: WYSIWYG editor with media library and version control."
    ]
  },
  {
    title: "4. Digital Asset Management (DAM)",
    icon: Image,
    items: [
      "Media Library: Store and organize images, videos, floor plans, 3D models.",
      "Version Control: Track versions and approval workflows.",
      "Access Control: Granular permissions for asset viewing/modification.",
      "Integrations: Sync with OneDrive, Google Drive, etc."
    ]
  },
  {
    title: "5. Security, Compliance & Governance",
    icon: Shield,
    items: [
      "Data Privacy & Encryption: PII masking, encryption at rest/transit.",
      "Audit Logs: Full traceability of user actions and system changes.",
      "Access Control Policies: Define data access rules per role.",
      "Compliance Certifications: ISO 27001, GDPR, SOC 2 tracking.",
      "Data Retention: Automated purging and right-to-be-forgotten workflows."
    ]
  },
  {
    title: "6. API & Integration Management",
    icon: Code,
    items: [
      "API Key Management: Generate and revoke keys for 3rd parties.",
      "Rate Limiting: Usage quotas and throttling.",
      "Webhook Management: Outbound webhooks and retry policies.",
      "Integration Marketplace: Publish/unpublish integrations."
    ]
  },
  {
    title: "7. Workflow & Automation Engine",
    icon: GitBranch,
    items: [
      "Workflow Builder: Define processes, logic, approvals.",
      "Trigger & Action Library: Extensive pre-built triggers and actions.",
      "Scheduled Tasks: Cron jobs for cleanup and reports.",
      "Error Handling: Automatic retries and dead-letter queues."
    ]
  },
  {
    title: "8. Analytics & Reporting Engine",
    icon: BarChart,
    items: [
      "Dashboard Builder: Drag-and-drop custom dashboards.",
      "Report Scheduling: Auto-email daily/weekly reports.",
      "Data Export: CSV/Excel export capabilities.",
      "BI Integration: Connect to Power BI, Tableau, Looker."
    ]
  },
  {
    title: "9. Email & Notification Management",
    icon: Mail,
    items: [
      "Email Templates: Centralized, versioned templates.",
      "Multi-Channel Delivery: Email, SMS, Push.",
      "Notification Rules: Preference-based delivery logic.",
      "Delivery Tracking: Monitor bounces and engagement."
    ]
  },
  {
    title: "10. Localization & Multi-Language",
    icon: Languages,
    items: [
      "Language Management: Multi-language UI and content.",
      "Locale Settings: Time zones, date formats, currency.",
      "RTL Support: Full support for Arabic, Hebrew, etc."
    ]
  },
  {
    title: "11. Audit & Change Management",
    icon: Activity,
    items: [
      "Change Tracking: Log configuration changes.",
      "Approval Workflows: Require approval for sensitive changes.",
      "Rollback Capabilities: Revert to previous states."
    ]
  },
  {
    title: "12. Performance & System Health",
    icon: Activity,
    items: [
      "Monitoring & Alerting: Real-time health dashboards.",
      "Capacity Planning: Predict resource usage.",
      "Maintenance Windows: Schedule and communicate downtime."
    ]
  },
  {
    title: "13. Developer Portal",
    icon: Terminal,
    items: [
      "API Documentation: Auto-generated OpenAPI docs.",
      "SDK & Libraries: Python, Node.js, C# SDKs.",
      "Sandbox Environment: Safe testing ground.",
      "Developer Community: Forums and support."
    ]
  },
  {
    title: "14. Feature Flags & A/B Testing",
    icon: ToggleLeft,
    items: [
      "Feature Flags: Toggle features per tenant/user.",
      "A/B Testing: Optimize UI/workflows.",
      "Canary Deployments: Gradual feature rollouts."
    ]
  }
];

export const PlatformCore: React.FC = () => {
  return (
    <div className="container mx-auto px-4 max-w-7xl py-16">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[#5B21B6]/10 text-[#5B21B6] text-xs font-bold tracking-wide uppercase">
          Core Administration
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-6">
          Platform Settings & Administration
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          A comprehensive suite of tools that transforms Dixels from a feature-rich app into a scalable, enterprise-grade platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {platformFeatures.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-[#F59E0B]/50"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 h-10 w-10 rounded-lg bg-[#5B21B6]/5 flex items-center justify-center text-[#5B21B6] flex-shrink-0">
                <feature.icon size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Why This Matters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
          <div className="flex gap-3">
             <div className="h-6 w-6 rounded-full bg-[#F59E0B]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">✓</div>
             <span className="text-slate-700 text-sm font-medium">Scales across multiple organizations and geographies</span>
          </div>
          <div className="flex gap-3">
             <div className="h-6 w-6 rounded-full bg-[#F59E0B]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">✓</div>
             <span className="text-slate-700 text-sm font-medium">Adapts to diverse compliance and regulatory environments</span>
          </div>
          <div className="flex gap-3">
             <div className="h-6 w-6 rounded-full bg-[#F59E0B]/20 text-[#5B21B6] flex items-center justify-center text-xs font-bold">✓</div>
             <span className="text-slate-700 text-sm font-medium">Empowers non-technical admins to configure functionality</span>
          </div>
        </div>
      </div>
    </div>
  );
};