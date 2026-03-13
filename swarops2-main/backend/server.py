from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# Import agents
from agents.content_agent import ContentStrategistAgent
from agents.email_agent import EmailAgent
from agents.scheduler_agent import SchedulerAgent
from agents.budget_agent import BudgetAgent
from agents.volunteer_agent import VolunteerAgent

# Import orchestrator
from orchestrator import SwarmOrchestrator

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize agents
content_agent = ContentStrategistAgent(db)
email_agent = EmailAgent(db)
scheduler_agent = SchedulerAgent(db)
budget_agent = BudgetAgent(db)
volunteer_agent = VolunteerAgent(db)

# Initialize orchestrator
swarm_orchestrator = SwarmOrchestrator(db)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    event_id: str = Field(default_factory=lambda: f"event_{uuid.uuid4().hex[:8]}")
    name: str
    description: str
    user_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContentRequest(BaseModel):
    event_id: str
    prompt: str
    user_id: str

class ContentApproval(BaseModel):
    content_id: str

class EmailCampaignRequest(BaseModel):
    event_id: str
    registration_id: str
    subject: str
    template: str
    role_filter: Optional[str] = None

class ScheduleRequest(BaseModel):
    event_id: str
    sessions: List[dict]
    user_id: str

class ConflictResolution(BaseModel):
    event_id: str
    schedule_id: str
    new_constraint: dict

class BudgetRequest(BaseModel):
    event_id: str
    categories: List[dict]
    user_id: str

class ExpenseRequest(BaseModel):
    budget_id: str
    category: str
    amount: float
    description: str

class TaskAssignmentRequest(BaseModel):
    event_id: str
    volunteer_pool_id: str
    tasks: List[dict]

# Routes
@api_router.get("/")
async def root():
    return {"message": "SwarmOps API v1.0", "status": "operational"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "agents": ["content", "email", "scheduler", "budget", "volunteer"]}

# Event routes
@api_router.post("/events")
async def create_event(event: Event):
    event_dict = event.model_dump()
    # MongoDB mutates the dict and adds _id, so insert a copy
    await db.events.insert_one(event_dict.copy())
    # Return the original dict without _id
    return event_dict

@api_router.get("/events/{user_id}")
async def get_events(user_id: str):
    events = await db.events.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return events

# Content Agent routes
@api_router.post("/agent/content/generate")
async def generate_content(request: ContentRequest):
    try:
        result = await content_agent.generate_content(
            request.event_id, 
            request.prompt, 
            request.user_id
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/agent/content/approve")
async def approve_content(request: ContentApproval):
    try:
        success = await content_agent.approve_content(request.content_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/agent/content/{event_id}")
async def get_content(event_id: str):
    content = await db.content.find({"event_id": event_id}, {"_id": 0}).to_list(100)
    return content

# Email Agent routes
@api_router.post("/agent/email/upload")
async def upload_registration(
    event_id: str = Form(...),
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_content = await file.read()
        file_type = 'csv' if file.filename.endswith('.csv') else 'xlsx'
        
        result = await email_agent.process_registration_file(
            event_id, 
            file_content, 
            file_type, 
            user_id
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/agent/email/send-bulk")
async def send_bulk_emails(request: EmailCampaignRequest):
    try:
        result = await email_agent.send_bulk_emails(
            request.event_id,
            request.registration_id,
            request.template,
            request.subject,
            request.role_filter
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/agent/email/registrations/{event_id}")
async def get_registrations(event_id: str):
    registrations = await db.registrations.find({"event_id": event_id}, {"_id": 0}).to_list(100)
    return registrations

@api_router.get("/agent/email/campaigns/{event_id}")
async def get_campaigns(event_id: str):
    campaigns = await db.email_campaigns.find({"event_id": event_id}, {"_id": 0}).to_list(100)
    return campaigns

# Scheduler Agent routes
@api_router.post("/agent/scheduler/create")
async def create_schedule(request: ScheduleRequest):
    try:
        result = await scheduler_agent.create_schedule(
            request.event_id,
            request.sessions,
            request.user_id
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/agent/scheduler/resolve")
async def resolve_conflicts(request: ConflictResolution):
    try:
        result = await scheduler_agent.resolve_conflicts(
            request.event_id,
            request.schedule_id,
            request.new_constraint
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/agent/scheduler/{event_id}")
async def get_schedules(event_id: str):
    schedules = await db.schedules.find({"event_id": event_id}, {"_id": 0}).to_list(100)
    return schedules

# Budget Agent routes
@api_router.post("/agent/budget/create")
async def create_budget(request: BudgetRequest):
    try:
        result = await budget_agent.create_budget(
            request.event_id,
            request.categories,
            request.user_id
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/agent/budget/expense")
async def add_expense(request: ExpenseRequest):
    try:
        result = await budget_agent.add_expense(
            request.budget_id,
            request.category,
            request.amount,
            request.description
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/agent/budget/{event_id}")
async def get_budgets(event_id: str):
    budgets = await db.budgets.find({"event_id": event_id}, {"_id": 0}).to_list(100)
    return budgets

# Volunteer Agent routes
@api_router.post("/agent/volunteer/upload")
async def upload_volunteers(
    event_id: str = Form(...),
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_content = await file.read()
        file_type = 'csv' if file.filename.endswith('.csv') else 'xlsx'
        
        result = await volunteer_agent.process_volunteers(
            event_id,
            file_content,
            file_type,
            user_id
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/agent/volunteer/assign")
async def assign_volunteers(request: TaskAssignmentRequest):
    try:
        result = await volunteer_agent.assign_tasks(
            request.event_id,
            request.volunteer_pool_id,
            request.tasks
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/agent/volunteer/{event_id}")
async def get_volunteers(event_id: str):
    volunteers = await db.volunteers.find({"event_id": event_id}, {"_id": 0}).to_list(100)
    return volunteers

# Activity Feed
@api_router.get("/activities/{event_id}")
async def get_activities(event_id: str, limit: int = 50):
    activities = await db.activities.find(
        {"event_id": event_id}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return activities

@api_router.get("/activities/latest")
async def get_latest_activities(limit: int = 20):
    activities = await db.activities.find(
        {}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return activities

# Swarm Orchestration
class SwarmRunRequest(BaseModel):
    event_id: str
    user_id: str
    event_name: str
    raw_prompt: str
    schedule: List[dict] = []

@api_router.post("/swarm/run")
async def run_full_swarm(request: SwarmRunRequest):
    """Run the full orchestrated swarm workflow"""
    try:
        initial_state = {
            "event_id": request.event_id,
            "user_id": request.user_id,
            "event_name": request.event_name,
            "raw_prompt": request.raw_prompt,
            "schedule": request.schedule,
            "target_audience": "tech event attendees"
        }
        
        result = await swarm_orchestrator.run_swarm(initial_state)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
