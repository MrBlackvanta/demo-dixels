# Dixels Product Guidelines

A comprehensive framework for defining, designing, and delivering the next generation of digital-physical experiences.

---

## 1. Industry Verticals
Tailored ecosystems for specific environments.

*   **Destination** (Tourism & Hospitality)
*   **Education** (Smart Campuses)
*   **Workplace** (Next-Gen Offices)
*   **Sport** (Stadiums & Venues)
*   **Living** (Residential Communities)
*   **Healthcare** (Patient-Centric Care)

---

## 2. The Ecosystem
Modular "Dixels" (Digital Pixels) and Core Capabilities.

### Experience Modules
*   **SpaceOS** (Space Booking): Intelligent resource scheduling and utilization management.
    *   Features: Desk & Room Booking, Utilization Analytics, Team Scheduling, Policy Enforcement.
*   **Portal** (Visitor Management): Secure, seamless entry experiences for guests.
    *   Features: Self-service Kiosks, Badge Printing, Security Integration, Pre-registration Workflows.
*   **Atmosphere** (Smart Controls): IoT-driven environmental control.
    *   Features: Lighting Automation, HVAC Optimization, Occupancy Sensors, Energy Dashboard.
*   **Nourish** (Smart Cafe): Digitized corporate dining experiences.
    *   Features: Mobile Ordering, Menu Management, POS Integration, Nutritional Tracking.
*   **Gather** (Events): End-to-end management for workshops and events.
    *   Features: Attendee Registration, Agenda Building, Feedback Surveys, Hybrid Event Support.
*   **Tribes** (Communities): Foster culture and connection.
    *   Features: Discussion Forums, Interest Groups, Activity Feeds, Member Directories.
*   **Cortex** (Neural Interface): Central intelligence layer connecting everything.
    *   Features: Context Orchestration, Agentic Dispatch, Predictive Modeling, Self-Healing.
*   **OmniServe** (Service Hub): Unified request portal for services.
    *   Features: Service Catalog, Request Tracking, SLA Management, Vendor Integration.
*   **Resolve** (Support Center): AI-powered helpdesk.
    *   Features: Ticket Management, Knowledge Base, Chatbot Support, Issue Escalation.
*   **Pathfinder** (Wayfinding): Digital maps and directories.
    *   Features: Interactive Maps, POI Search, Directory Listings, Route Preview.
*   **Flux** (Indoor Navigation): Blue-dot turn-by-turn navigation.
    *   Features: Real-time Positioning, Turn-by-turn Directions, Geofencing, Accessibility Routes.
*   **LiveCanvas** (Smart Signage): Centralized content distribution.
    *   Features: Content Scheduling, Emergency Alerts, Room Displays, Video Walls.
*   **Ticksense** (Attendance): Automated time and attendance tracking.
    *   Features: Biometric Check-in, Shift Management, Overtime Calculation, Payroll Integration.
*   **ParkFlow** (Parking): Smart parking management.
    *   Features: License Plate Rec, Space Reservation, Valet Tracking, EV Charging.

### Core Capabilities
*   **TwinSpace** (Space Twinning): High-fidelity digital twins.
    *   Features: BIM Integration, 3D Visualization, Asset Mapping, Spatial Data.
*   **Content** (CMS): Headless content management.
    *   Features: Versioning, Localization, Workflow, API-first Delivery.
*   **Vault** (DAM): Secure digital asset management.
    *   Features: Media Library, Transcoding, CDN Delivery, Rights Management.
*   **Universe** (Marketplace): App store for integrations.
    *   Features: Partner Ecosystem, One-click Install, Billing Integration, Version Control.
*   **Nexus** (Integration Hub): Enterprise-grade connectivity.
    *   Features: API Gateway, Webhooks, ESB, Connector Library.
*   **Gavel** (Approval Hub): Centralized governance engine.
    *   Features: Multi-level Workflows, Audit Logs, Delegation, Rules Engine.
*   **Flow** (Workflow Engine): Visual process automation.
    *   Features: BPMN 2.0, Event Triggers, Custom Scripts, Process Monitoring.
*   **Identity** (User Management): Unified identity and access management.
    *   Features: SSO/SAML, RBAC, User Profiles, Group Sync.

---

## 3. Stakeholder Personas
Mapping Dixels and Touchpoints to specific human outcomes.

### The Occupant (Daily Driver)
*   **North Star:** "Frictionless flow & productivity."
*   **Solve for:** Bad Wi-Fi, finding rooms, cold coffee.
*   **Core Dixels:** SpaceOS, Nourish, Tribes.
*   **Key Touchpoints:** Mobile App, Room Panels.

### The Guest (VIP Experience)
*   **North Star:** "Seamless arrival & clarity."
*   **Solve for:** Getting lost, complex check-in, parking.
*   **Core Dixels:** Portal, Pathfinder, LiveCanvas.
*   **Key Touchpoints:** Lobby Kiosk, Digital Signage.

### The Operator (Service Enabler)
*   **North Star:** "Rapid response & efficiency."
*   **Solve for:** Unreported issues, manual tasks, noise.
*   **Core Dixels:** Atmosphere, Resolve, Ticksense.
*   **Key Touchpoints:** Service Tablet, Desktop Portal.

### The Guardian (Governance & ESG)
*   **North Star:** "Compliance, safety & sustainability."
*   **Solve for:** Data silos, security breaches, waste.
*   **Core Dixels:** Identity, ParkFlow, TwinSpace.
*   **Key Touchpoints:** Command Center, Access Control.

---

## 4. Omni-Channel Touchpoints
Delivering the right experience, on the right device, at the right time.

*   **Personal Devices**: Interfaces that move with the user (Mobile App, Web Portal, Wearables).
*   **Shared Spaces**: Fixed "Building OS" infrastructure (Lobby Kiosk, Room Panels, Digital Signage).
*   **Ambient Intelligence**: Invisible/hands-free layers (Voice Control, IoT Sensors, Smart Desks).
*   **Service Points**: Specialized, transactional stations (Kitchen Panel, POS Terminal, Feedback Tab).

---

## 5. Dixels Product Framework
A three-dimensional approach to product definition.

### Dimension 1: Functional Definition
The traditional foundation.
1.  User Stories & Personas
2.  UI/UX Mocks & Flows
3.  Acceptance Criteria

### Dimension 2: Composability & Interop
The architectural contract. No Dixel is an island.
1.  Event Triggers & Listeners
2.  Data Contracts (DTOs)
3.  Workflow Hooks

### Dimension 3: Neural Intelligence
The "MCP First" approach for AI agents.
1.  Model Context Protocol (MCP)
2.  Semantic Context Embedding
3.  Agentic Action Primitives

---

## 6. Analytics Framework

### The 3 Dimensions
*   **Functional:** Usage, Completion rates, Time-to-complete.
*   **Composability:** Latency of events, Success of downstream reactions, Funnels.
*   **Neural:** Suggestion acceptance rate, Autonomy usage, Override rate, Safety rollbacks.

### Practical PM Questions
*   **Usage:** How many unique users? What % use AI path?
*   **Efficiency:** How many steps saved? Time saved?
*   **Reliability:** % of events triggering downstream actions?
*   **AI Quality:** How often do users override suggestions?

### Minimal Metrics Set (Example: "Book a Room")
*   **Core:** bookings_created_per_day, bookings_per_active_user, booking_completion_rate.
*   **AI:** ai_room_suggestion_impressions, ai_suggestion_accept_rate, ai_action_override_rate.
*   **Composability:** event_to_notification_latency, %bookings_with_catering, %downstream_failure_rate.

---

## 7. The Dixel Spec: Toolkit & Templates

### Dimension 1: Definition
*   **PRD Template:** Problem Space, User Journey, Success Metrics.
*   **Example (SpaceOS):** "Employees struggle to find quiet focus time..." -> Mobile App Focus Mode -> Util % of Focus Rooms.

### Dimension 2: Composability
*   **Interop Schema:** Inbound Events (Subscribed), Outbound Events (Published), Data Models.
*   **Example (SpaceOS):**
    *   In: `identity.user_entered_building`
    *   Out: `space.booking_created`
    *   Shared Entity: `Room { id, capacity, currentTemp ... }`

### Dimension 3: Intelligence
*   **MCP Manifest:** System Prompt Context, Tool Definitions, Retrieval Memory.
*   **Example (SpaceOS Agent):**
    *   Context: "You are an intelligent space concierge..."
    *   Tools: `find_room(capacity)`, `book_desk(user, zone)`
    *   RAG: Room Policy PDF, Floorplan Metadata.

---

## 8. Agile Execution
The Product Owner Role.

### Hierarchy of Work
*   **Initiative:** Quarterly strategic goal.
*   **Epic:** Large feature set (1-2 months).
*   **User Story:** Smallest unit of value (Sprint).

### Definition of Ready (DoR)
*   User Story follows format.
*   Acceptance Criteria (Gherkin) is complete.
*   UX mocks attached.
*   Analytics events defined.

### Examples
*   **Epic:** SpaceOS: Intelligent Focus Mode.
*   **Story:** "As a Deep Worker, I want the app to suggest the quietest available room..."
*   **AC (Gherkin):** Given user location X, When user taps Mode, Then show Room Y.

---

> "In the era of autonomous systems, a product requirement document that ignores the AI agent as a primary user is obsolete before it's written."
> — Mahmoud Hasan, Platform Architect
