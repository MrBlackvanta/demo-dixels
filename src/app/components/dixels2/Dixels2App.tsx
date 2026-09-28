import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap,
  LayoutGrid, 
  MessageSquare, 
  Map, 
  Users, 
  Settings, 
  Bell, 
  Search,
  Menu,
  Calendar,
  Utensils,
  LifeBuoy,
  Compass,
  BarChart3,
  Puzzle,
  Workflow,
  LogOut,
  Monitor,
  Image,
  FileText,
  Sliders,
  Shield,
  BookOpen,
  UserCheck,
  Lock,
  Coffee,
  Sparkles,
  Building
} from 'lucide-react';
import { Dashboard2 } from './Dashboard2';
import { SpaceManagement } from './SpaceManagement';
import { CoreSpaceBooking } from './CoreSpaceBooking';
import { CoreCalendar } from './CoreCalendar';
import { CoreVisitors } from './CoreVisitors';
import { CoreDrinks } from './CoreDrinks';
import { ServicesSupportDixel } from './ServicesSupportDixel';
import { SupportCenterDixel } from './SupportCenterDixel';
import { CampusGuideView } from './CampusGuideView';
import { VmsHost } from './VmsHost';
import { VmsSecurity } from './VmsSecurity';
import { VmsKiosk } from './VmsKiosk';
import { VmsGuestPortalV2 } from './VmsGuestPortalV2';
import { VmsAdmin } from './VmsAdmin';
import { CommunitiesView } from './CommunitiesView';
import { ContentManagerView } from './ContentManagerView';
import { DigitalAssetsView } from './DigitalAssetsView';
import { EventsView } from './EventsView';
import { SmartControlView } from './SmartControlView';
import { NeuralInterface } from './NeuralInterface';
import { SignageManager } from './SignageManager';
import { FacilitySmartControl } from './FacilitySmartControl';
import { WorkloadManagement } from './WorkloadManagement';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { VmsProvider } from './VmsContext';
import { EnterpriseProvider } from './EnterpriseContext';
import dixelsLogo from 'figma:asset/247d65801bbc3aad30cb75db0c08362c2b40b62f.png';

type Persona = 'Employee' | 'Reception' | 'Security' | 'Admin' | 'FacilityManager' | 'Visitor' | 'VisitorPortal' | 'CafeteriaStaff' | 'DeliveryRunner';

// --- NAVIGATION CONFIGURATION (UX IMPROVEMENT) ---

const NAV_ITEMS = {
  // Core
  dashboard: { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', desc: 'Executive Overview' },
  workload: { id: 'workload', icon: Zap, label: 'Workload AI', desc: 'Auto-Scheduling' },
  calendar: { id: 'calendar', icon: Calendar, label: 'My Calendar', desc: 'Day Manager' },
  control: { id: 'control', icon: Sliders, label: 'My Space', desc: 'Smart Room Control' },
  drinks: { id: 'drinks', icon: Coffee, label: 'Smart Café', desc: 'Order & Delivery' },
  
  // Collaboration
  visitors: { id: 'visitors', icon: Users, label: 'Visitor Access', desc: 'Invites & Check-in' },
  events: { id: 'events', icon: Calendar, label: 'Events', desc: 'Workshops & Town Halls' },
  communities: { id: 'communities', icon: MessageSquare, label: 'Communities', desc: 'Groups & Clubs' },
  
  // Services & Campus
  services: { id: 'services', icon: LifeBuoy, label: 'Service Hub', desc: 'Catalog & Requests' },
  support: { id: 'support', icon: Sparkles, label: 'Support Center', desc: 'AI Help & Status' },
  campus: { id: 'campus', icon: Compass, label: 'Campus Guide', desc: 'Wayfinding' },
  
  // Operations & Admin
  spaces: { id: 'spaces', icon: Map, label: 'Space Admin', desc: 'Digital Twin' },
  booking: { id: 'booking', icon: BookOpen, label: 'Space Mgmt', desc: 'Reservations' },
  building_control: { id: 'building_control', icon: Building, label: 'Building Control', desc: 'Facility Automation' },
  security: { id: 'security', icon: Shield, label: 'Security Ops', desc: 'Monitoring' },
  vms_admin: { id: 'vms_admin', icon: UserCheck, label: 'Visitor Settings', desc: 'VMS Config' },
  analytics: { id: 'analytics', icon: BarChart3, label: 'Analytics', desc: 'Insights' },
  
  // Platform
  cms: { id: 'cms', icon: FileText, label: 'Content', desc: 'CMS' },
  dam: { id: 'dam', icon: Image, label: 'Assets', desc: 'DAM' },
  signage: { id: 'signage', icon: Monitor, label: 'Signage', desc: 'Screens' },
  workflow: { id: 'workflow', icon: Workflow, label: 'Workflows', desc: 'Automation' },
  integrations: { id: 'integrations', icon: Puzzle, label: 'Integrations', desc: 'API' },
  iam: { id: 'iam', icon: Lock, label: 'Access Control', desc: 'IAM' },
  settings: { id: 'settings', icon: Settings, label: 'Settings', desc: 'System Config' },
};

const getNavStructure = (persona: Persona) => {
  switch (persona) {
    case 'Employee':
      return [
        {
          title: "My Workspace",
          items: [NAV_ITEMS.dashboard, NAV_ITEMS.workload, NAV_ITEMS.calendar, NAV_ITEMS.control, NAV_ITEMS.drinks]
        },
        {
          title: "Connect",
          items: [NAV_ITEMS.visitors, NAV_ITEMS.events, NAV_ITEMS.communities]
        },
        {
          title: "Campus",
          items: [NAV_ITEMS.services, NAV_ITEMS.support, NAV_ITEMS.campus]
        }
      ];

    case 'Admin':
      return [
        {
          title: "Platform Overview",
          items: [NAV_ITEMS.dashboard, NAV_ITEMS.analytics, NAV_ITEMS.settings]
        },
        {
          title: "Core Operations",
          items: [NAV_ITEMS.building_control, NAV_ITEMS.spaces, NAV_ITEMS.security, NAV_ITEMS.vms_admin]
        },
        {
          title: "Content & Experience",
          items: [NAV_ITEMS.cms, NAV_ITEMS.dam, NAV_ITEMS.signage]
        },
        {
          title: "System",
          items: [NAV_ITEMS.iam, NAV_ITEMS.workflow, NAV_ITEMS.integrations]
        }
      ];

    case 'FacilityManager':
      return [
        {
          title: "Operations",
          items: [NAV_ITEMS.dashboard, NAV_ITEMS.building_control, NAV_ITEMS.booking, NAV_ITEMS.spaces]
        },
        {
          title: "Experience",
          items: [NAV_ITEMS.signage, NAV_ITEMS.events]
        },
        {
          title: "Services",
          items: [
            { ...NAV_ITEMS.drinks, label: 'Café Mgmt' },
            NAV_ITEMS.services,
            NAV_ITEMS.support
          ]
        },
        {
            title: "Security",
            items: [NAV_ITEMS.security, NAV_ITEMS.visitors]
        }
      ];

    case 'Reception':
      return [
        {
          title: "Front Desk",
          items: [
              { ...NAV_ITEMS.visitors, label: 'Check-In Console' }, 
              NAV_ITEMS.campus, 
              NAV_ITEMS.events
          ]
        }
      ];

    case 'Security':
      return [
        {
          title: "Command Center",
          items: [NAV_ITEMS.security, NAV_ITEMS.visitors, NAV_ITEMS.spaces]
        }
      ];

    case 'CafeteriaStaff':
    case 'DeliveryRunner':
      return [
        {
          title: "Orders",
          items: [
              { ...NAV_ITEMS.drinks, label: persona === 'CafeteriaStaff' ? 'Kitchen Display' : 'Delivery Tasks' }
          ]
        }
      ];

    default: // Fallback for Visitors or others
      return [
        {
          title: "Guest Services",
          items: [NAV_ITEMS.campus, NAV_ITEMS.drinks]
        }
      ];
  }
};

// Helper for pages that need scrolling
const ScrollWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("h-full overflow-y-auto", className)}>{children}</div>
);

const Dixels2Content: React.FC<{ onExit: () => void; onReadAboutDixels: () => void }> = ({ onExit, onReadAboutDixels }) => {
  const [currentPersona, setCurrentPersona] = useState<Persona>('Employee');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Get structure based on persona (UX Improvement)
  const navGroups = getNavStructure(currentPersona);

  // Set default tab when persona changes
  useEffect(() => {
    // Pick the first item of the first group as default
    const firstGroup = navGroups[0];
    if (firstGroup && firstGroup.items.length > 0) {
        setActiveTab(firstGroup.items[0].id);
    }
  }, [currentPersona]);

  // Flatten items for easy lookup
  const allItems = navGroups.flatMap(g => g.items);
  const activeItem = allItems.find(i => i.id === activeTab) || NAV_ITEMS.dashboard;

  // Visitor Kiosk View
  if (currentPersona === 'Visitor') {
     return (
        <div className="h-screen w-screen relative">
           <VmsKiosk />
           <div className="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" onClick={() => setCurrentPersona('Employee')}>Exit Kiosk</Button>
           </div>
        </div>
     );
  }

  // Visitor Portal View (Mobile Web Simulation)
  if (currentPersona === 'VisitorPortal') {
    return (
       <div className="h-screen w-screen relative bg-slate-100 flex items-center justify-center">
          <div className="w-full max-w-md h-full max-h-[800px] bg-white shadow-2xl overflow-hidden relative">
             <VmsGuestPortalV2 />
          </div>
          <div className="absolute top-4 right-4 z-50">
             <Button variant="secondary" size="sm" onClick={() => setCurrentPersona('Employee')}>Close Portal</Button>
          </div>
       </div>
    );
 }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden relative">
      <NeuralInterface currentContext={activeTab} onNavigate={setActiveTab} />
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 z-20 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out"
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
           {isSidebarOpen ? (
            <div className="flex items-center gap-3 overflow-hidden px-2">
              <img src={dixelsLogo} alt="Dixels" className="h-10 w-auto object-contain" />
            </div>
          ) : (
             <div className="h-8 w-8 mx-auto overflow-hidden flex items-center justify-center">
                <img src={dixelsLogo} alt="Dixels" className="h-8 max-w-none object-cover object-center w-8" />
              </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
           <div className="px-3 space-y-6">
             {/* Groups */}
             {navGroups.map((group, idx) => (
               <div key={idx} className="space-y-1">
                 {isSidebarOpen ? (
                   <div className="px-3 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{group.title}</div>
                 ) : (
                   <Separator className="my-2" />
                 )}
                 {group.items.map((item) => (
                   <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
                      activeTab === item.id 
                        ? 'bg-[#5B21B6]/10 text-[#5B21B6]' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#5B21B6]',
                      !isSidebarOpen && 'justify-center'
                    )}
                  >
                    <item.icon size={18} className={cn("transition-colors", activeTab === item.id ? "text-[#5B21B6]" : "text-slate-500 group-hover:text-[#5B21B6]")} />
                    {isSidebarOpen && (
                      <div className="flex flex-col items-start text-left">
                        <span>{item.label}</span>
                      </div>
                    )}
                  </button>
                 ))}
               </div>
             ))}
           </div>
        </ScrollArea>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={cn("flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 -mx-2 rounded-lg transition-colors", !isSidebarOpen && "justify-center")}>
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                {isSidebarOpen && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">Sarah Chen</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Badge variant="outline" className="h-4 px-1 text-[10px] font-normal border-slate-300 bg-white">{currentPersona}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onReadAboutDixels} className="cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Read about Dixels</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExit} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
           <div className="flex items-center gap-4 flex-1">
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500">
               <Menu size={20} />
             </Button>
             <div>
               <h2 className="text-lg font-bold text-slate-900 leading-tight">
                 {activeTab === 'dashboard' ? 'Dashboard' : activeItem?.label || 'Module'}
               </h2>
               <div className="flex items-center gap-2 text-xs text-slate-500">
                 <span>{activeTab === 'dashboard' ? 'Overview' : activeItem?.desc || 'System Module'}</span>
                 {activeTab !== 'dashboard' && (
                   <>
                     <span className="w-1 h-1 rounded-full bg-slate-300" />
                     <span className="text-[#5B21B6] font-medium flex items-center gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#5B21B6] animate-pulse" />
                       Live
                     </span>
                   </>
                 )}
               </div>
             </div>
           </div>

           <div className="flex items-center gap-4">
             {/* Persona Switcher */}
             <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 px-2">View As:</span>
                <Select value={currentPersona} onValueChange={(v: Persona) => setCurrentPersona(v)}>
                   <SelectTrigger className="h-8 w-[160px] bg-white border-slate-200 text-xs font-medium shadow-sm">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Reception">Reception</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="FacilityManager">Facility Manager</SelectItem>
                      <SelectItem value="CafeteriaStaff">Cafeteria Staff (Barista)</SelectItem>
                      <SelectItem value="DeliveryRunner">Delivery Runner</SelectItem>
                      <SelectItem value="Visitor">Visitor (Kiosk)</SelectItem>
                      <SelectItem value="VisitorPortal">Visitor (Web Portal)</SelectItem>
                   </SelectContent>
                </Select>
             </div>

             <Separator orientation="vertical" className="h-6" />

             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative text-slate-500">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </Button>
             </div>
           </div>
        </header>

        {/* Content Area - FIXED: overflow-hidden to allow children to manage scroll */}
        <div className="flex-1 overflow-hidden p-0 relative">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="h-full"
             >
               {activeTab === 'dashboard' ? (
                 <ScrollWrapper className="p-6"><Dashboard2 onNavigate={setActiveTab} /></ScrollWrapper>
               ) : activeTab === 'workload' ? (
                 <WorkloadManagement />
               ) : activeTab === 'spaces' ? (
                 <div className="p-6 h-full"><SpaceManagement /></div>
               ) : activeTab === 'booking' ? (
                 <CoreSpaceBooking />
               ) : activeTab === 'calendar' ? (
                 <CoreCalendar />
               ) : activeTab === 'building_control' ? (
                 <FacilitySmartControl />
               ) : activeTab === 'visitors' ? (
                 currentPersona === 'Employee' ? <VmsHost /> : <ScrollWrapper><CoreVisitors /></ScrollWrapper>
               ) : activeTab === 'drinks' ? (
                 <CoreDrinks persona={currentPersona} />
               ) : activeTab === 'services' ? (
                 <ServicesSupportDixel persona={currentPersona} />
               ) : activeTab === 'support' ? (
                 <SupportCenterDixel />
               ) : activeTab === 'campus' ? (
                 <CampusGuideView />
               ) : activeTab === 'security' ? (
                 <ScrollWrapper><VmsSecurity /></ScrollWrapper>
               ) : activeTab === 'vms_admin' ? (
                 <VmsAdmin />
               ) : activeTab === 'communities' ? (
                 <CommunitiesView />
               ) : activeTab === 'events' ? (
                 <EventsView />
               ) : activeTab === 'cms' ? (
                 <ContentManagerView />
               ) : activeTab === 'dam' ? (
                 <DigitalAssetsView />
               ) : activeTab === 'signage' ? (
                 <SignageManager />
               ) : activeTab === 'control' ? (
                 <SmartControlView />
               ) : (
                 <ScrollWrapper>
                    <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-md mx-auto p-6">
                      <div className="bg-slate-100 p-6 rounded-full mb-6 relative group">
                        {activeItem?.icon && <activeItem.icon className="text-slate-400 group-hover:text-[#5B21B6] transition-colors" size={48} />}
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 animate-[spin_10s_linear_infinite]" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{activeItem?.label}</h2>
                      <p className="text-slate-500 mb-8">
                        This module is currently being initialized from the <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">Core Modules</span> layer. 
                        Full implementation pending in this demo.
                      </p>
                      <div className="w-full max-w-xs bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#5B21B6]"
                          initial={{ width: "0%" }}
                          animate={{ width: "60%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-4 font-mono">
                        STATUS: PROVISIONING_DIGITAL_TWIN
                      </p>
                    </div>
                 </ScrollWrapper>
               )}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export const Dixels2App: React.FC<{ onExit: () => void; onReadAboutDixels: () => void }> = ({ onExit, onReadAboutDixels }) => (
  <VmsProvider>
    <EnterpriseProvider>
      <Dixels2Content onExit={onExit} onReadAboutDixels={onReadAboutDixels} />
    </EnterpriseProvider>
  </VmsProvider>
);