import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';

export type VisitorStatus = 'upcoming' | 'expected' | 'checked-in' | 'checked-out' | 'denied' | 'cancelled' | 'registered' | 'no-show';
export type SecurityStatus = 'pending' | 'cleared' | 'flagged' | 'denied' | 'blacklisted';

export interface Badge {
  id: string;
  number: string;
  status: 'available' | 'assigned' | 'lost';
  assignedToVisitorId?: string | number;
  createdAt: string;
  createdBy: string;
}

export interface Visitor {
  id: number | string;
  name: string;
  email: string;
  company: string;
  host: string;
  date: string; // YYYY-MM-DD or "Today"
  time: string;
  type: 'Regular' | 'VIP' | 'VVIP' | 'Vendor' | 'Interview' | 'Personal' | 'Client';
  status: VisitorStatus;
  securityStatus: SecurityStatus;
  parking: boolean;
  photo?: string | null;
  inviteCode?: string;
  location?: string;
  expectedCheckout?: string; // e.g. "05:00 PM"
  
  // VVIP Specifics
  representativeName?: string;
  representativePhone?: string;
  securityEscortRequired?: boolean;
  
  // Badge
  badgeNumber?: string;
}

export interface Package {
  id: string;
  recipient: string;
  carrier: 'FedEx' | 'UPS' | 'DHL' | 'USPS' | 'Amazon' | 'Other';
  trackingNumber?: string;
  status: 'pending' | 'picked-up';
  arrivedAt: string;
  location: string;
}

export interface SystemConfig {
  checkoutGracePeriodMinutes: number;
}

interface VmsContextType {
  visitors: Visitor[];
  packages: Package[];
  badges: Badge[];
  config: SystemConfig;
  updateConfig: (updates: Partial<SystemConfig>) => void;
  addVisitor: (v: Partial<Visitor>) => Visitor;
  addVisitors: (visitors: Partial<Visitor>[]) => Visitor[];
  updateVisitor: (id: string | number, updates: Partial<Visitor>) => void;
  addPackage: (p: Package) => void;
  updatePackage: (id: string, updates: Partial<Package>) => void;
  findVisitorByCode: (code: string) => Visitor | undefined;
  isOverdue: (visitor: Visitor) => boolean;
  stats: {
    expected: number;
    checkedIn: number;
    total: number;
  };
  emergencyMode: boolean;
  emergencyType: string | null;
  triggerEvacuation: (type: string | null) => void;
  markVisitorSafe: (id: string | number) => void;
  
  // Badge Management
  addBadge: (number: string) => void;
  deleteBadge: (id: string) => void;
  assignBadge: (visitorId: string | number, badgeNumber: string) => void;
  returnBadge: (visitorId: string | number) => void;
  markBadgeLost: (badgeNumber: string) => void;
}

const VmsContext = createContext<VmsContextType | undefined>(undefined);

const INITIAL_CONFIG: SystemConfig = {
  checkoutGracePeriodMinutes: 30
};

const INITIAL_PACKAGES: Package[] = [
   { id: 'PKG-001', recipient: 'Sarah Chen', carrier: 'FedEx', trackingNumber: '785002123456', status: 'pending', arrivedAt: '09:30 AM', location: 'Reception' },
   { id: 'PKG-002', recipient: 'Mike Ross', carrier: 'Amazon', trackingNumber: 'TBA000123456', status: 'picked-up', arrivedAt: '08:15 AM', location: 'Reception' },
];

const INITIAL_BADGES: Badge[] = [
  { id: 'b1', number: '101', status: 'available', createdAt: '2023-11-01T09:00:00Z', createdBy: 'Admin' },
  { id: 'b2', number: '102', status: 'available', createdAt: '2023-11-01T09:00:00Z', createdBy: 'Admin' },
  { id: 'b3', number: '103', status: 'assigned', assignedToVisitorId: 1, createdAt: '2023-11-01T09:00:00Z', createdBy: 'Admin' },
  { id: 'b4', number: 'VIP-01', status: 'available', createdAt: '2023-11-01T09:00:00Z', createdBy: 'Admin' },
  { id: 'b5', number: 'VIP-02', status: 'available', createdAt: '2023-11-01T09:00:00Z', createdBy: 'Admin' },
];

const INITIAL_VISITORS: Visitor[] = [
  { id: 1, name: 'Michael Johnson', company: 'Partner Solutions', host: 'Sarah Chen', date: 'Today', time: '10:00 AM', expectedCheckout: '11:00 AM', type: 'Client', status: 'checked-in', securityStatus: 'cleared', email: 'm.johnson@partners.com', parking: true, inviteCode: 'INV-8821', location: 'Meeting Room 4B', badgeNumber: '103' },
  { id: 2, name: 'Robert Wilson', company: 'Global Finance', host: 'Sarah Chen', date: 'Today', time: '02:00 PM', expectedCheckout: '03:00 PM', type: 'VIP', status: 'expected', securityStatus: 'pending', email: 'rwilson@gfin.com', parking: false, inviteCode: 'INV-9923' },
  { id: 3, name: 'Elena Rodriguez', company: 'Design Studio', host: 'Mike Ross', date: 'Tomorrow', time: '11:00 AM', expectedCheckout: '12:00 PM', type: 'Interview', status: 'upcoming', securityStatus: 'pending', email: 'elena.r@design.co', parking: false, inviteCode: 'INV-7741' },
  { id: 4, name: 'TechCorp Team', company: 'TechCorp', host: 'Facilities', date: '2023-11-12', time: '09:00 AM', expectedCheckout: '05:00 PM', type: 'Vendor', status: 'checked-out', securityStatus: 'cleared', email: 'support@techcorp.io', parking: true, inviteCode: 'INV-1122' },
  { id: 5, name: 'H.E. Ambassador Smith', company: 'Embassy', host: 'CEO Office', date: 'Today', time: '04:00 PM', expectedCheckout: '05:30 PM', type: 'VVIP', status: 'expected', securityStatus: 'pending', email: 'protocol@embassy.gov', parking: true, inviteCode: 'INV-0001', securityEscortRequired: true, representativeName: 'John Aide', representativePhone: '+1-555-0199' },
];

export const VmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [emergencyType, setEmergencyType] = useState<string | null>(null);

  const updateConfig = (updates: Partial<SystemConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addPackage = (p: Package) => {
    setPackages(prev => [p, ...prev]);
  };

  const updatePackage = (id: string, updates: Partial<Package>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const triggerEvacuation = (type: string | null) => {
    if (type) {
      setEmergencyMode(true);
      setEmergencyType(type);
      toast.error(`EMERGENCY: ${type} PROTOCOL ACTIVATED`, { duration: Infinity });
    } else {
      setEmergencyMode(false);
      setEmergencyType(null);
      toast.success("Emergency cleared. Returning to normal operations.");
    }
  };

  const markVisitorSafe = (id: string | number) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, securityStatus: 'cleared', location: 'Safe Assembly Point' } : v));
    toast.success("Visitor marked as safe");
  };

  const isOverdue = (visitor: Visitor) => {
    if (visitor.status !== 'checked-in' || !visitor.expectedCheckout) return false;
    if (visitor.date !== 'Today') return false; 

    try {
      const [time, period] = visitor.expectedCheckout.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const checkoutDate = new Date();
      checkoutDate.setHours(hours, minutes, 0, 0);
      checkoutDate.setMinutes(checkoutDate.getMinutes() + config.checkoutGracePeriodMinutes);

      return new Date() > checkoutDate;
    } catch (e) {
      return false;
    }
  };

  const addVisitor = (newVisitor: Partial<Visitor>) => {
    const visitor: Visitor = {
      id: Date.now(),
      name: newVisitor.name || (newVisitor.email ? newVisitor.email.split('@')[0] : 'Guest'),
      email: newVisitor.email || '',
      company: newVisitor.company || 'Guest',
      host: newVisitor.host || 'Sarah Chen', 
      date: newVisitor.date || 'Today',
      time: newVisitor.time || '09:00 AM',
      expectedCheckout: newVisitor.expectedCheckout || '05:00 PM',
      type: (newVisitor.type as any) || 'Regular',
      status: 'upcoming',
      securityStatus: 'pending',
      parking: newVisitor.parking || false,
      inviteCode: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newVisitor
    };
    
    setVisitors(prev => [visitor, ...prev]);
    return visitor;
  };

  const addVisitors = (newVisitors: Partial<Visitor>[]) => {
    const added = newVisitors.map((v, idx) => ({
      id: Date.now() + idx,
      name: v.name || (v.email ? v.email.split('@')[0] : 'Guest'),
      email: v.email || '',
      company: v.company || 'Guest',
      host: v.host || 'Sarah Chen',
      date: v.date || 'Today',
      time: v.time || '09:00 AM',
      type: (v.type as any) || 'Regular',
      status: 'upcoming',
      securityStatus: 'pending',
      parking: v.parking || false,
      inviteCode: `INV-${Math.floor(1000 + Math.random() * 9000) + idx}`,
      ...v
    } as Visitor));
    
    setVisitors(prev => [...added, ...prev]);
    return added;
  };

  const updateVisitor = (id: string | number, updates: Partial<Visitor>) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  // Badge Management
  const addBadge = (number: string) => {
    if (badges.some(b => b.number === number)) {
      toast.error(`Badge #${number} already exists`);
      return;
    }
    const newBadge: Badge = {
      id: `b-${Date.now()}`,
      number,
      status: 'available',
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    };
    setBadges(prev => [...prev, newBadge]);
    toast.success(`Badge #${number} added to inventory`);
  };

  const deleteBadge = (id: string) => {
    setBadges(prev => prev.filter(b => b.id !== id));
    toast.success("Badge removed from inventory");
  };

  const assignBadge = (visitorId: string | number, badgeNumber: string) => {
    // 1. Mark badge as assigned
    setBadges(prev => prev.map(b => b.number === badgeNumber ? { ...b, status: 'assigned', assignedToVisitorId: visitorId } : b));
    
    // 2. Update visitor record
    setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, badgeNumber: badgeNumber, status: 'checked-in' } : v));
    
    toast.success(`Badge #${badgeNumber} assigned`);
  };

  const returnBadge = (visitorId: string | number) => {
    // Find visitor to get badge number
    const visitor = visitors.find(v => v.id === visitorId);
    if (visitor && visitor.badgeNumber) {
       // Mark badge available
       setBadges(prev => prev.map(b => b.number === visitor.badgeNumber ? { ...b, status: 'available', assignedToVisitorId: undefined } : b));
       
       // Clear from visitor
       setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, badgeNumber: undefined, status: 'checked-out' } : v));
       
       toast.success(`Badge #${visitor.badgeNumber} returned`);
    } else {
       // Just check out without badge logic if none assigned
       setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, status: 'checked-out' } : v));
       toast.success("Checked out successfully");
    }
  };
  
  const markBadgeLost = (badgeNumber: string) => {
     setBadges(prev => prev.map(b => b.number === badgeNumber ? { ...b, status: 'lost', assignedToVisitorId: undefined } : b));
     toast.error(`Badge #${badgeNumber} marked as lost`);
  };

  const findVisitorByCode = (code: string) => {
    return visitors.find(v => v.inviteCode === code || v.email === code); 
  };

  const stats = {
    expected: visitors.filter(v => v.status === 'expected' || v.status === 'upcoming').length,
    checkedIn: visitors.filter(v => v.status === 'checked-in').length,
    total: visitors.length
  };

  return (
    <VmsContext.Provider value={{ 
      visitors, packages, badges, config, 
      updateConfig, addVisitor, addVisitors, updateVisitor, 
      addPackage, updatePackage, findVisitorByCode, isOverdue, 
      stats, emergencyMode, emergencyType, triggerEvacuation, markVisitorSafe,
      addBadge, deleteBadge, assignBadge, returnBadge, markBadgeLost
    }}>
      {children}
    </VmsContext.Provider>
  );
};

export const useVms = () => {
  const context = useContext(VmsContext);
  if (!context) {
    throw new Error('useVms must be used within a VmsProvider');
  }
  return context;
};
