# AI Capabilities & Integration Plan

The **Neural Interface** acts as an OS-level copilot, bridging the gap between natural language intent and deep module functionality. Below is the breakdown of capabilities per module, their current status, and future implementation plans.

---

## 1. Calendar & Space Management
**Context:** `calendar` | **Persona:** Employee

| Capability | Status | Description | Module Integration |
| :--- | :---: | :--- | :--- |
| **"Schedule meeting"** | ✅ Live | Parses "Meeting with Sarah tomorrow at 2pm", opens wizard pre-filled. | `CoreCalendar`: Adds event to global context. |
| **"Find free room"** | ✅ Live | Lists available rooms based on current time. Clicking "Book" reserves it. | `CoreCalendar`: Updates room schedule. |
| **"Block focus time"** | ✅ Live | Instantly books 1h slot for "Focus Time". | `CoreCalendar`: Adds personal event. |
| **"Reschedule event"** | 🚧 Future | "Move my 3pm to 4pm". | `CoreCalendar`: Needs NLP update logic. |

---

## 2. Support Center
**Context:** `support` | **Persona:** Employee

| Capability | Status | Description | Module Integration |
| :--- | :---: | :--- | :--- |
| **"Webex is not working"** | ✅ Live | Runs diagnostic workflow -> Shows metrics -> Offers "Raise Ticket". | `SupportCenterView`: Adds ticket to list. |
| **"Report IT issue"** | ✅ Live | Opens ticket form. | `SupportCenterView`: Creates ticket in context. |
| **"Knowledge Base"** | 🚧 Future | "How do I reset my VPN?". Should show article card. | `SupportCenterView`: Link to KB tab. |

---

## 3. Visitor Access
**Context:** `visitors` | **Persona:** Employee / Reception

| Capability | Status | Description | Module Integration |
| :--- | :---: | :--- | :--- |
| **"Register VIP guest"** | ✅ Live | Shows quick form (Name, Company). Submits registration. | `VmsHost`: Adds visitor to list. |
| **"Visitor Analytics"** | ✅ Live | Shows bar chart of weekly visitors. | `VmsAdmin`: Links to analytics dashboard. |
| **"Print Badge"** | 🚧 Future | "Print badge for John Doe". Triggers print job. | `VmsKiosk`: Trigger print API. |

---

## 4. Smart Café
**Context:** `cafe` | **Persona:** Employee

| Capability | Status | Description | Module Integration |
| :--- | :---: | :--- | :--- |
| **"What's on the menu?"** | ✅ Live | Shows "Today's Specials" card with image. | `CoreDrinks`: Links to full menu. |
| **"Pre-order lunch"** | 🚧 Future | "Order a flat white". Should add to cart/checkout. | `CoreDrinks`: Add cart context. |
| **"Report spill"** | 🚧 Future | "Spill in the cafe". Triggers facility ticket. | `ServicesSupportDixel`: Create ticket. |

---

## 5. People & Directory
**Context:** `home` | **Persona:** Employee

| Capability | Status | Description | Module Integration |
| :--- | :---: | :--- | :--- |
| **"Find Sarah Connor"** | ✅ Live | Lists matching users with status (Online/Busy). | `Dashboard`: Navigate to Profile. |
| **"Who is the CEO?"** | 🚧 Future | Returns specific role-based card. | `Dashboard`: Show org chart. |

---

## 6. Service Hub
**Context:** `services` | **Persona:** Employee

| Capability | Status | Description | Module Integration |
| :--- | :---: | :--- | :--- |
| **"Request software"** | 🚧 Future | "I need a Figma license". Opens request form. | `ServicesSupportDixel`: Create request. |
| **"Book cleaning"** | 🚧 Future | "Clean Meeting Room A". Dispatches task. | `SpaceManagement`: Create task. |

---

## 7. Campus Guide
**Context:** `campus` | **Persona:** Visitor / Employee

| Capability | Status | Description | Module Integration |
| :--- | :---: | :--- | :--- |
| **"Where is the prayer room?"** | 🚧 Future | Shows map card with wayfinding. | `CampusGuideView`: Open map to loc. |
| **"Find parking"** | 🚧 Future | Shows available parking spots. | `CampusGuideView`: Live parking feed. |

---

## 8. Communities & Events
**Context:** `communities` / `events` | **Persona:** Employee

| Capability | Status | Description | Module Integration |
| :--- | :---: | :--- | :--- |
| **"Find running club"** | 🚧 Future | Lists clubs matching query. | `CommunitiesView`: Filter list. |
| **"What events are today?"** | 🚧 Future | Lists town halls/workshops. | `EventsView`: Filter calendar. |

---

### Implementation Priority
1. **Deep Link Integrations:** Ensure "Future Features" link correctly to their respective modules even if the full action isn't automated yet.
2. **Context Awareness:** Enhance `CoreDrinks` and `ServicesSupportDixel` to accept `initialIntent` props from the AI (similar to how `CoreCalendar` accepts `initialData`).
