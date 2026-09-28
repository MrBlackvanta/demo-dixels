import React, { createContext, useContext, useState, ReactNode } from 'react';
import { addMinutes, addHours } from 'date-fns';

// --- Types ---

export interface TicketMessage {
    id: string;
    author: string;
    role: 'user' | 'agent' | 'system' | 'event';
    text: string;
    timestamp: Date;
}

export interface Ticket {
    id: string;
    subject: string;
    service: string;
    status: 'New' | 'In Progress' | 'Pending Approval' | 'Resolved';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    agent: string;
    eta: string;
    description: string;
    messages: TicketMessage[];
    location?: string;
    satisfaction?: number;
    type: 'incident' | 'request'; // Added to distinguish between IT Incidents and Service Requests
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    location: string;
    attendees: number;
    type: 'meeting' | 'focus' | 'social';
}

export interface Visitor {
    id: string;
    name: string;
    company: string;
    host: string;
    arrival: Date;
    status: 'expected' | 'checked-in' | 'checked-out';
}

export interface SmartControlsState {
    activeScene: string | null;
    lightingLevel: number;
    blindsLevel: number;
    temp: number;
    dnd: boolean;
    tvPower: boolean;
}

interface EnterpriseContextType {
    incidents: Ticket[]; // IT Support Incidents
    serviceRequests: Ticket[]; // HR/Finance/Facilities Requests
    calendarEvents: CalendarEvent[];
    visitors: Visitor[];
    smartControls: SmartControlsState;
    
    // Actions
    addIncident: (ticket: Omit<Ticket, 'id' | 'status' | 'eta' | 'agent' | 'messages' | 'type'>) => Ticket;
    addServiceRequest: (ticket: Omit<Ticket, 'id' | 'status' | 'eta' | 'agent' | 'messages' | 'type'>) => Ticket;
    
    // Shared Actions
    addTicketMessage: (ticketId: string, text: string, role?: TicketMessage['role'], author?: string) => void;
    resolveTicket: (id: string) => void;
    addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    registerVisitor: (visitor: Omit<Visitor, 'id' | 'status'>) => void;
    updateSmartControls: (updates: Partial<SmartControlsState>) => void;
}

// --- Mock Data ---

const INITIAL_SERVICE_REQUESTS: Ticket[] = [
  { 
      id: 'REQ-4001', 
      type: 'request',
      subject: 'Employment Verification Letter', 
      service: 'HR', 
      status: 'Resolved', 
      priority: 'Medium', 
      agent: 'HR Automated System', 
      eta: 'Completed',
      description: "Request for proof of employment letter for mortgage application.",
      messages: [
          { id: '1', author: 'Sarah Chen', role: 'user', text: "I need an employment verification letter for a mortgage application.", timestamp: new Date(Date.now() - 172800000) },
          { id: '2', author: 'System', role: 'event', text: "Request routed to HR Workday Integration", timestamp: new Date(Date.now() - 172800000) },
          { id: '3', author: 'HR Automated System', role: 'agent', text: "Your letter has been generated and emailed to your personal address on file.", timestamp: new Date(Date.now() - 172000000) },
      ]
  },
  { 
      id: 'REQ-4002', 
      type: 'request',
      subject: 'Corporate Credit Card Application', 
      service: 'Finance', 
      status: 'Pending Approval', 
      priority: 'High',
      agent: 'Finance Team', 
      eta: '3 days',
      description: "Application for corporate card for upcoming travel expenses.",
      messages: [
          { id: '1', author: 'Sarah Chen', role: 'user', text: "Applying for a corporate card. Department code: ENG-2024.", timestamp: new Date(Date.now() - 86400000) },
          { id: '2', author: 'System', role: 'system', text: "Approval request sent to Department Head (James Thompson).", timestamp: new Date(Date.now() - 86300000) },
          { id: '3', author: 'James Thompson', role: 'agent', text: "Sarah, can you confirm the estimated travel budget for Q3?", timestamp: new Date(Date.now() - 43200000) },
      ]
  },
  { 
      id: 'REQ-4003', 
      type: 'request',
      subject: 'Office Chair Replacement', 
      service: 'Facilities', 
      status: 'New', 
      priority: 'Low',
      agent: 'Facilities Desk', 
      eta: '5 days',
      description: "Current chair has a broken armrest. Requesting a replacement.",
      messages: [
          { id: '1', author: 'Sarah Chen', role: 'user', text: "My chair's left armrest is broken. It's the standard Herman Miller model.", timestamp: new Date(Date.now() - 3600000) },
          { id: '2', author: 'System', role: 'event', text: "Ticket created via Service Hub", timestamp: new Date(Date.now() - 3600000) },
      ]
  },
];

const INITIAL_INCIDENTS: Ticket[] = [
    { 
        id: 'INC-3902', 
        type: 'incident',
        subject: 'Figma Access Denied', 
        service: 'Software', 
        status: 'In Progress', 
        priority: 'High', 
        agent: 'AI Bot', 
        eta: '5 mins',
        description: "I'm trying to access the Design System project but getting a 403 error.",
        messages: [
            { id: '1', author: 'Sarah Chen', role: 'user', text: "I'm getting a 403 Forbidden error when accessing the 'Nebula' project in Figma.", timestamp: new Date(Date.now() - 3600000) },
            { id: '2', author: 'System', role: 'event', text: "Ticket created via Support Center", timestamp: new Date(Date.now() - 3600000) },
            { id: '3', author: 'Support AI', role: 'agent', text: "I've checked your permissions. It looks like your license seat expired yesterday. I've automatically submitted a renewal request.", timestamp: new Date(Date.now() - 3500000) },
        ]
    },
    { 
        id: 'INC-3903', 
        type: 'incident',
        subject: 'VPN Connection Failed', 
        service: 'Network', 
        status: 'New', 
        priority: 'Medium', 
        agent: 'Network Ops', 
        eta: '1 hour',
        description: "Unable to connect to Dubai HQ VPN gateway.",
        messages: [
            { id: '1', author: 'Sarah Chen', role: 'user', text: "VPN connects but drops after 30 seconds. Error code 711.", timestamp: new Date(Date.now() - 7200000) },
        ]
    },
];

const INITIAL_EVENTS: CalendarEvent[] = [
    { id: '1', title: 'Town Hall', start: new Date(new Date().setHours(9, 0, 0, 0)), end: new Date(new Date().setHours(10, 30, 0, 0)), location: 'Auditorium', attendees: 240, type: 'meeting' },
    { id: '2', title: 'Design Crit', start: new Date(new Date().setHours(13, 0, 0, 0)), end: new Date(new Date().setHours(14, 0, 0, 0)), location: 'Room 404', attendees: 6, type: 'meeting' },
    { id: '3', title: 'Q4 Planning', start: new Date(new Date().setHours(15, 30, 0, 0)), end: new Date(new Date().setHours(16, 30, 0, 0)), location: 'Boardroom', attendees: 12, type: 'meeting' },
];

const INITIAL_VISITORS: Visitor[] = [
    { id: 'v1', name: 'Elon Musk', company: 'SpaceX', host: 'Sarah Chen', arrival: new Date(new Date().setHours(14, 0)), status: 'expected' },
];

// --- Context & Provider ---

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [incidents, setIncidents] = useState<Ticket[]>(INITIAL_INCIDENTS);
    const [serviceRequests, setServiceRequests] = useState<Ticket[]>(INITIAL_SERVICE_REQUESTS);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
    const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
    
    // Default Smart Control State
    const [smartControls, setSmartControls] = useState<SmartControlsState>({
        activeScene: null,
        lightingLevel: 80,
        blindsLevel: 50,
        temp: 22,
        dnd: false,
        tvPower: false
    });

    const updateSmartControls = (updates: Partial<SmartControlsState>) => {
        setSmartControls(prev => ({ ...prev, ...updates }));
    };

    const addIncident = (newTicketData: Omit<Ticket, 'id' | 'status' | 'eta' | 'agent' | 'messages' | 'type'>) => {
        const newTicket: Ticket = {
            id: `INC-${Math.floor(Math.random() * 10000)}`,
            type: 'incident',
            status: 'New',
            eta: '4h',
            agent: 'AI Bot',
            messages: [
                { id: Date.now().toString(), author: 'System', role: 'event', text: 'Incident created via Support Center', timestamp: new Date() }
            ],
            ...newTicketData
        };
        setIncidents(prev => [newTicket, ...prev]);
        return newTicket;
    };

    const addServiceRequest = (newTicketData: Omit<Ticket, 'id' | 'status' | 'eta' | 'agent' | 'messages' | 'type'>) => {
        const newTicket: Ticket = {
            id: `REQ-${Math.floor(Math.random() * 10000)}`,
            type: 'request',
            status: 'New',
            eta: '2d',
            agent: 'Service Desk',
            messages: [
                { id: Date.now().toString(), author: 'System', role: 'event', text: 'Request created via Service Hub', timestamp: new Date() }
            ],
            ...newTicketData
        };
        setServiceRequests(prev => [newTicket, ...prev]);
        return newTicket;
    };

    const addTicketMessage = (ticketId: string, text: string, role: TicketMessage['role'] = 'user', author: string = 'Sarah Chen') => {
        const newMessage: TicketMessage = {
            id: Date.now().toString(),
            text,
            role,
            author,
            timestamp: new Date()
        };

        const updateTicketList = (list: Ticket[]) => list.map(t => {
            if (t.id !== ticketId) return t;
            return {
                ...t,
                messages: [...t.messages, newMessage]
            };
        });

        // Try to update in both lists (inefficient but safe since IDs are unique)
        setIncidents(prev => updateTicketList(prev));
        setServiceRequests(prev => updateTicketList(prev));
    };

    const resolveTicket = (id: string) => {
        const resolve = (t: Ticket) => t.id === id ? { ...t, status: 'Resolved' as const, eta: 'Completed' } : t;
        setIncidents(prev => prev.map(resolve));
        setServiceRequests(prev => prev.map(resolve));
    };

    const addCalendarEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
        const event: CalendarEvent = {
            id: Date.now().toString(),
            ...newEvent
        };
        setCalendarEvents(prev => [...prev, event].sort((a, b) => a.start.getTime() - b.start.getTime()));
    };

    const registerVisitor = (newVisitor: Omit<Visitor, 'id' | 'status'>) => {
        const visitor: Visitor = {
            id: `v-${Math.floor(Math.random() * 10000)}`,
            status: 'expected',
            ...newVisitor
        };
        setVisitors(prev => [...prev, visitor]);
    };

    return (
        <EnterpriseContext.Provider value={{
            incidents,
            serviceRequests,
            calendarEvents,
            visitors,
            smartControls,
            addIncident,
            addServiceRequest,
            addTicketMessage,
            resolveTicket,
            addCalendarEvent,
            registerVisitor,
            updateSmartControls
        }}>
            {children}
        </EnterpriseContext.Provider>
    );
};

export const useEnterpriseContext = () => {
    const context = useContext(EnterpriseContext);
    if (!context) {
        throw new Error("useEnterpriseContext must be used within an EnterpriseProvider");
    }
    return context;
};
