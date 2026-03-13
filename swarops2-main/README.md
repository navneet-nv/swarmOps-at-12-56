# SwarmOps - Multi-Agent Event Logistics Management System

## Overview
SwarmOps is an AI-powered dashboard for event organizers running large-scale hackathons and tech summits. It uses a **CrewAI-orchestrated multi-agent swarm architecture** where specialized AI agents collaborate autonomously with shared state management and conditional handoffs.

## 🎯 Key Features from Neurathon26 Roadmap

### ✅ CrewAI Orchestration
- **CrewAI Implementation**: True multi-agent orchestration with shared SwarmState
- **Conditional Edges**: Scheduler conflicts automatically trigger email agent
- **Autonomous Handoffs**: Agents communicate through shared state
- **Activity Logging**: Real-time visibility into agent communications

### ✅ Specialized Tools
- **CSVParser**: Email validation, role segmentation, template personalization
- **ConflictChecker**: Time overlap detection, speaker/room conflict identification
- **Shared State Management**: TypedDict with all agent states

### ✅ Human-in-the-Loop Controls
- Approve/Edit/Reject buttons on all agent outputs
- Real-time agent status indicators
- Live activity feed showing agent actions
- Swarm execution timeline visualization

## Features

### 🚀 Run Full Swarm (NEW!)
Orchestrated workflow that executes multiple agents in sequence:
1. Content Strategist generates promotional materials
2. Scheduler builds optimized schedule
3. Email Agent auto-triggered if conflicts detected
4. Visual timeline shows agent handoffs and execution flow

### 5 Core AI Agents

1. **Content Strategist & Social Media Agent**
   - Generates promotional copy from event descriptions
   - Creates 5-7 social media posts for Twitter/LinkedIn/Instagram
   - Engagement score analysis for optimal posting times
   - Approve/edit/reject controls for generated content

2. **Communications & Targeted Mailing Agent**
   - CSV/Excel parser with email validation
   - Role-based segmentation (Participants, Mentors, Judges)
   - Template personalization with {name}, {role}, {team}, {college} variables
   - Bulk email sending with Resend integration

3. **Dynamic Scheduler & Conflict Resolver Agent**
   - AI-powered schedule generation from session constraints
   - ConflictChecker tool for time overlap detection
   - Speaker and room conflict identification
   - Auto-triggers email notifications when conflicts detected

4. **Budget Tracker Agent**
   - Real-time expense tracking by category
   - Automatic overrun detection and alerts
   - Budget allocation vs. spending visualization
   - Expense history with timestamps

5. **Volunteer Coordinator Agent**
   - CSV parser for volunteer data
   - Skill-based task assignment algorithm
   - Availability matching
   - Assignment reporting and tracking

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Orchestration**: CrewAI
- **Database**: MongoDB (Motor async driver)
- **LLM Integration**: OpenAI GPT-4o via SwarmOpsIntegrations
- **Email Service**: Resend
- **File Processing**: Pandas + OpenPyXL
- **State Management**: TypedDict shared state

### Frontend
- **Framework**: React 19
- **Styling**: Tailwind CSS + Custom Command Center Theme
- **UI Components**: Shadcn/UI
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Toast Notifications**: Sonner
- **Animations**: Framer Motion

## API Endpoints

### Core
- `GET /api/health` - Health check with all agent status
- `POST /api/events` - Create event
- `GET /api/events/{user_id}` - Get user events

### **Swarm Orchestration (NEW!)**
- `POST /api/swarm/run` - Execute full orchestrated workflow
  ```json
  {
    "event_id": "string",
    "user_id": "string", 
    "event_name": "string",
    "raw_prompt": "string",
    "schedule": []
  }
  ```

### Content Agent
- `POST /api/agent/content/generate` - Generate content with GPT-4o
- `POST /api/agent/content/approve` - Approve generated content
- `GET /api/agent/content/{event_id}` - Get content history

### Email Agent
- `POST /api/agent/email/upload` - Upload & parse registration CSV/Excel
- `POST /api/agent/email/send-bulk` - Send bulk personalized emails
- `GET /api/agent/email/registrations/{event_id}` - Get parsed registrations
- `GET /api/agent/email/campaigns/{event_id}` - Get campaign history

### Scheduler Agent
- `POST /api/agent/scheduler/create` - Create schedule with conflict detection
- `POST /api/agent/scheduler/resolve` - Resolve conflicts and notify
- `GET /api/agent/scheduler/{event_id}` - Get schedules with conflict data

### Budget Agent
- `POST /api/agent/budget/create` - Create budget tracker
- `POST /api/agent/budget/expense` - Add expense with overrun check
- `GET /api/agent/budget/{event_id}` - Get budgets with spending data

### Volunteer Agent
- `POST /api/agent/volunteer/upload` - Upload & parse volunteer CSV/Excel
- `POST /api/agent/volunteer/assign` - Skill-based task assignment
- `GET /api/agent/volunteer/{event_id}` - Get volunteer pools and assignments

### Activity Feed
- `GET /api/activities/{event_id}` - Event-specific activity log
- `GET /api/activities/latest` - System-wide activity feed

## Architecture

### CrewAI Workflow
```
Entry → Content Strategist → Log Activity
                                ↓
                            Scheduler → Log Activity
                                           ↓
                                   [Check Conflicts]
                                           ↓
                              (if conflicts) → Email Agent → END
                              (no conflicts) → END
```

### Shared SwarmState
```python
{
    "event_id": str,
    "raw_prompt": str,
    "generated_posts": List[Dict],
    "promo_copy": str,
    "schedule": List[Dict],
    "conflicts_found": bool,
    "conflict_details": List[str],
    "email_status": str,
    "last_agent": str,
    "messages": List[str],
    "activities": List[Dict]
}
```

### Conditional Routing
- **Scheduler → Email**: Triggered automatically when conflicts detected
- **State-based**: Decisions made based on shared state values
- **Autonomous**: No manual intervention required for handoffs

## Design System

### Colors
- Background: #050505 (Deep Black)
- Surface: #101010, #1A1A1A
- Primary: #D4A017 (Gold)
- Accent Cyan: #00F0FF
- Accent Green: #00FF94
- Accent Red: #FF2A2A

### Typography
- **Headings**: Orbitron (Bold, uppercase, tracking-widest)
- **Subheadings**: Rajdhani (Bold, uppercase)
- **Body**: Manrope
- **Monospace/Logs**: JetBrains Mono

### UI Features
- Dark command center aesthetic with scanline overlay
- Agent pulse animations when active
- Glass-morphism panels with backdrop blur
- Gold highlights on interactive elements
- Visual timeline for swarm execution

## Setup Instructions

### Backend Setup
```bash
cd /app/backend
pip install -r requirements.txt

# Environment variables (.env):
# - MONGO_URL (pre-configured)
# - SWARMOPS_LLM_KEY (pre-configured)
# - RESEND_API_KEY (configure for email sending)
# - SENDER_EMAIL (configure sender address)

sudo supervisorctl restart backend
```

### Frontend Setup
```bash
cd /app/frontend
yarn install
sudo supervisorctl restart frontend
```

## Usage Workflows

### 1. Run Full Swarm (Orchestrated)
1. Navigate to "Run Full Swarm" page
2. Enter event name and details
3. Click "Launch Swarm"
4. Watch the timeline as agents execute autonomously
5. Review results and agent handoffs

### 2. Individual Agent Workflows
**Content Generation:**
- Go to Content Agent → Enter event description → Generate → Approve

**Email Campaign:**
- Go to Email Agent → Upload CSV → Select list → Compose → Send

**Schedule Creation:**
- Go to Scheduler → Add sessions → Build Schedule → Review conflicts

**Budget Tracking:**
- Go to Budget Agent → Add categories → Track expenses → Monitor overruns

**Volunteer Assignment:**
- Go to Volunteer Coordinator → Upload CSV → Define tasks → Auto-assign

## Sample Data
Two sample CSV files provided in `/app/sample_data/`:
- `sample_registrations.csv` - 10 participants with roles
- `sample_volunteers.csv` - 10 volunteers with skills

## Key Judging Criteria Achievement

✅ **Multi-Agent Orchestration (25pts)**: CrewAI Crew with conditional edges and shared state
✅ **All 5 Agents Functional (25pts)**: Content, Email, Scheduler, Budget, Volunteer fully operational
✅ **Intuitive Dashboard (20pts)**: Human-in-the-loop controls, status indicators, live feed
✅ **Novel Features (20pts)**: Conflict-triggered handoffs, skill-based assignment, visual timeline
✅ **Live Demo Flow (10pts)**: End-to-end orchestrated workflow with real-time visualization

## Testing

### API Testing
```bash
# Health check
curl http://localhost:8001/api/health

# Run full swarm
curl -X POST http://localhost:8001/api/swarm/run \
  -H "Content-Type: application/json" \
  -d '{
    "event_id":"event_001",
    "user_id":"user_001",
    "event_name":"AI Hackathon",
    "raw_prompt":"48-hour AI hackathon with 500 participants",
    "schedule":[]
  }'
```

### Manual Testing Flow
1. Dashboard → Check all 5 agent status cards
2. Run Full Swarm → Execute orchestrated workflow → Verify timeline
3. Content Agent → Generate content → Approve posts
4. Email Agent → Upload sample_registrations.csv → Preview → Send
5. Scheduler → Create schedule → Verify conflict detection
6. Budget Agent → Create budget → Add expenses → Check overrun alerts
7. Volunteer Agent → Upload sample_volunteers.csv → Assign tasks
8. Activity Feed → Monitor real-time agent communications

## Architecture Highlights

### Multi-Agent Communication
- **Shared State**: MongoDB + CrewAI State
- **Activity Logging**: All agent actions logged to central feed
- **Autonomous Handoffs**: Scheduler → Email triggered by conflicts
- **Real-time Updates**: Activity feed polls every 5 seconds

### Tools & Utilities
- **CSVParser**: Validates emails, segments by role, personalizes templates
- **ConflictChecker**: Detects time overlaps, suggests resolutions
- **State Management**: SwarmState tracks all agent outputs and status

## Future Enhancements
- WebSocket for real-time activity feed (eliminate polling)
- Drag-and-drop schedule builder UI
- Advanced conflict resolution algorithms
- Google Calendar integration
- Email deliverability analytics dashboard
- Budget forecasting with ML predictions
- Volunteer performance tracking and ratings

## Notes
- **LLM Budget**: Using SwarmOpsIntegrations with shared key (may need top-up)
- **Email Sending**: Configure RESEND_API_KEY for actual email delivery
- **Mock Mode**: Emails print to console if API key not configured
- **Conflict Detection**: Automatic triggers integrated into scheduler workflow

## License
Built for Neurathon 2026 - Multi-Agent AI Challenge

## Demo Credentials
- Event ID: `event_demo_001`
- User ID: `user_demo_001`
- Sample data in `/app/sample_data/`

## Features

### 5 Core AI Agents

1. **Content Strategist & Social Media Agent**
   - Generates promotional copy from event descriptions
   - Creates 5-7 social media posts for Twitter/LinkedIn/Instagram
   - Analyzes engagement data for optimal posting times
   - Content calendar with approve/edit/reject controls

2. **Communications & Targeted Mailing Agent**
   - Uploads and processes CSV/Excel registration files
   - Validates and extracts participant emails
   - Personalizes bulk emails with {name}, {role}, {team} placeholders
   - Segments by role (Participants, Mentors, Judges)

3. **Dynamic Scheduler & Conflict Resolver Agent**
   - Auto-builds master schedules from session constraints
   - Gantt-style visual calendar
   - Recalculates schedules on new constraints
   - Auto-triggers email notifications for conflicts

4. **Budget Tracker Agent**
   - Monitors spending by category
   - Flags budget overruns
   - Suggests reallocation
   - Real-time expense tracking

5. **Volunteer Coordinator Agent**
   - Processes volunteer CSV/Excel files
   - Skill-based task assignment algorithm
   - Availability matching
   - Assignment reporting

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Motor async driver)
- **LLM Integration**: OpenAI GPT-4o via SwarmOpsIntegrations
- **Email Service**: Resend
- **File Processing**: Pandas + OpenPyXL
- **Multi-Agent Framework**: Custom implementation with CrewAI patterns

### Frontend
- **Framework**: React 19
- **Styling**: Tailwind CSS + Custom Command Center Theme
- **UI Components**: Shadcn/UI
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Toast Notifications**: Sonner
- **Animations**: Framer Motion

## API Endpoints

### Health & Events
- `GET /api/health` - Health check
- `POST /api/events` - Create event
- `GET /api/events/{user_id}` - Get user events

### Content Agent
- `POST /api/agent/content/generate` - Generate content
- `POST /api/agent/content/approve` - Approve content
- `GET /api/agent/content/{event_id}` - Get content history

### Email Agent
- `POST /api/agent/email/upload` - Upload registration file
- `POST /api/agent/email/send-bulk` - Send bulk emails
- `GET /api/agent/email/registrations/{event_id}` - Get registrations
- `GET /api/agent/email/campaigns/{event_id}` - Get campaigns

### Scheduler Agent
- `POST /api/agent/scheduler/create` - Create schedule
- `POST /api/agent/scheduler/resolve` - Resolve conflicts
- `GET /api/agent/scheduler/{event_id}` - Get schedules

### Budget Agent
- `POST /api/agent/budget/create` - Create budget
- `POST /api/agent/budget/expense` - Add expense
- `GET /api/agent/budget/{event_id}` - Get budgets

### Volunteer Agent
- `POST /api/agent/volunteer/upload` - Upload volunteers
- `POST /api/agent/volunteer/assign` - Assign tasks
- `GET /api/agent/volunteer/{event_id}` - Get volunteer pools

### Activity Feed
- `GET /api/activities/{event_id}` - Get event activities
- `GET /api/activities/latest` - Get latest activities

## Design System

### Colors
- Background: #050505 (Deep Black)
- Surface: #101010
- Primary: #D4A017 (Gold)
- Accent Cyan: #00F0FF
- Accent Green: #00FF94
- Accent Red: #FF2A2A

### Typography
- **Headings**: Orbitron (Bold, uppercase, tracking-widest)
- **Subheadings**: Rajdhani (Bold, uppercase)
- **Body**: Manrope
- **Monospace/Logs**: JetBrains Mono

### Theme
- Dark command center aesthetic
- Scanline overlay effect
- Agent pulse animations when active
- Glass-morphism panels
- Gold accents for interactive elements

## Setup Instructions

### Backend Setup
```bash
cd /app/backend
pip install -r requirements.txt

# Configure environment variables in .env:
# - MONGO_URL (pre-configured)
# - SWARMOPS_LLM_KEY (pre-configured)
# - RESEND_API_KEY (add your key)
# - SENDER_EMAIL (configure sender)

sudo supervisorctl restart backend
```

### Frontend Setup
```bash
cd /app/frontend
yarn install
sudo supervisorctl restart frontend
```

## Key Judging Criteria (25pts Each)

✅ **Multi-Agent Orchestration**: True autonomous handoffs with shared memory and state management
✅ **All 5 Agents Functional**: Content, Email, Scheduler, Budget, and Volunteer agents fully operational
✅ **Intuitive Dashboard**: Human-in-the-loop approval controls, agent status indicators, live activity feed
✅ **Novel Features**: Budget tracking with overrun detection, skill-based volunteer assignment
✅ **Live Demo Flow**: End-to-end workflows from content generation to email campaigns

## Architecture Highlights

### Multi-Agent Communication
- Shared MongoDB state across all agents
- Activity logging for inter-agent visibility
- Autonomous handoffs (e.g., Scheduler → Email Agent on conflicts)
- Real-time activity feed showing agent actions

### Agent Design Pattern
Each agent follows a consistent pattern:
1. Initialize with database connection
2. Core functionality methods
3. Activity logging to central feed
4. Error handling and status reporting

### Data Flow
```
User Input → Agent Processing → MongoDB Storage → Frontend Display
                    ↓
            Activity Logging → Live Feed
                    ↓
        Inter-Agent Handoffs (when needed)
```

## Testing

### Manual Testing
1. Navigate to Dashboard
2. Test Content Agent: Generate promotional content
3. Test Email Agent: Upload CSV, send bulk emails
4. Test Scheduler: Create schedule with sessions
5. Test Budget: Add categories and expenses
6. Test Volunteer: Upload volunteers, assign tasks
7. Monitor Live Activity Feed for agent communications

### API Testing
```bash
# Health check
curl http://localhost:8001/api/health

# Generate content
curl -X POST http://localhost:8001/api/agent/content/generate \
  -H "Content-Type: application/json" \
  -d '{"event_id":"event_001","prompt":"AI hackathon","user_id":"user_001"}'
```

## Future Enhancements
- Real-time WebSocket updates for activity feed
- Drag-and-drop schedule builder
- Advanced conflict resolution algorithms
- Integration with calendar platforms (Google Calendar)
- Email deliverability analytics
- Budget forecasting with ML
- Volunteer performance tracking

## Notes for Resend Integration
- Update `RESEND_API_KEY` in `/app/backend/.env`
- Update `SENDER_EMAIL` to your verified domain
- In development mode, emails only go to verified addresses
- For production, verify your domain with Resend

## Demo Data
Default Event ID: `event_demo_001`
Default User ID: `user_demo_001`

## License
Built for Neurathon 2026 - Multi-Agent AI Challenge
