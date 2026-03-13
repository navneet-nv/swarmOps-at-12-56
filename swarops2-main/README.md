# SwarmOps

**SwarmOps** is a next-generation autonomous event management platform powered by collaborative AI swarms. Designed to streamline the planning and execution of events (like hackathons or conferences), SwarmOps utilizes a multi-agent system where independent specialized AI agents coordinate to handle distinct aspects of event coordination.

## 🚀 Features

The system relies on a swarm of autonomous AI agents working in sequence:

1. **Event Planner Agent**: Generates the strategic macro-schedule and breaks down the event into manageable tasks based on the user's prompt.
2. **Content Strategist**: Autonomously produces promotional copy and social media micro-content to drive engagement.
3. **Scheduler Agent (Temporal Engine)**: Synthesizes the initial event timeline, allocates time blocks, and flags scheduling conflicts.
4. **Financial Oracle (Budget Agent)**: Allocates financial resources across various categories and monitors for potential budget overruns.
5. **Personnel Matrix (Volunteer Agent)**: Scans personnel databases to match volunteers with tasks based on their skills and required expertise.
6. **Logistics Agent**: Synchronizes venue space and resources based on the generated schedule.
7. **Risk Detection Agent**: Evaluates the event plan for potential risks and assigns an overall threat level.
8. **Communications Hub (Email Agent)**: Integrates with registration tools to handle mass participant engagement, composing and sending customized emails.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19
- **Routing**: React Router
- **Styling**: Tailwind CSS, Class Variance Authority (CVA), Radix UI primitives
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Craco

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (motor for async operations)
- **AI Integration**: CrewAI, LangChain, OpenAI, Groq, LiteLLM
- **Server**: Uvicorn

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+) and Yarn
- Python 3.10+
- MongoDB instance (local or Atlas)

### 1. Environment variables
Create a `.env` file in the `backend/` directory with the following API keys:
```env
MONGO_URL=mongodb_connection_string
DB_NAME=swarmOps2
CORS_ORIGINS="*"
SWARMOPS_LLM_KEY=your_key
RESEND_API_KEY=your_key
SENDER_EMAIL=your_email
GROQ_API_KEY=your_key
OPENAI_API_KEY=your_key
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
# Windows: venv\\Scripts\\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### 3. Setup Frontend
```bash
cd frontend
yarn install
yarn start
```

*Alternatively, run `start_servers.bat` on Windows from the project root to launch both simultaneously.*

## 💻 Usage

Navigate to the frontend at `http://localhost:3000`. From the main dashboard, you can monitor the pulse of the swarm or launch a full coordinated execution by providing a text prompt detailing your event requirements. The Orchestrator will seamlessly direct the specialized agents to fulfill the request.
