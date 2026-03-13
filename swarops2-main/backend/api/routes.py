from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import List
import os
import logging
from .dependencies import get_db, get_swarm_memory, get_orchestrator
from memory.swarm_memory import SwarmMemory
from orchestrator.swarm_controller import SwarmOrchestrator
from models.event import Event, SwarmRunRequest
from models.task import (
    ContentRequest, ContentApproval, EmailCampaignRequest, 
    ScheduleRequest, ConflictResolution, BudgetRequest, ExpenseRequest
)
from models.volunteers import TaskAssignmentRequest

api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

@api_router.get("/")
async def root():
    return {"message": "SwarmOps API v2.0 - Perfect Architecture", "status": "operational"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "architecture": "swarm-v2", "agents": ["content", "email", "scheduler", "budget", "volunteer", "logistics", "risk"]}

# ------------------------------------------------------------------------
# NEW: Swarm Activity and Observable Logs
# ------------------------------------------------------------------------
@api_router.get("/swarm/logs")
async def get_swarm_logs(event_id: str, limit: int = 50, db = Depends(get_db)):
    """Fetch live agent activity logs for the dashboard"""
    logs = await db.logs.find({"event_id": event_id}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return logs

@api_router.get("/swarm/status")
async def get_swarm_status(event_id: str, memory: SwarmMemory = Depends(get_swarm_memory)):
    """Fetch the centralized state of the swarm"""
    state = await memory.get_memory(event_id)
    if not state:
        raise HTTPException(status_code=404, detail="Swarm memory not initialized for this event")
    return state

@api_router.post("/swarm/run")
async def run_full_swarm(request: SwarmRunRequest, orchestrator: SwarmOrchestrator = Depends(get_orchestrator)):
    """Trigger the entire autonomous AI swarm with one click"""
    try:
        logger.info(f"Initiating autonomous swarm for event: {request.event_name} (ID: {request.event_id})")
        result = await orchestrator.execute(request)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Swarm execution failed for event {request.event_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Swarm execution error: {str(e)}")

# ------------------------------------------------------------------------
# Events 
# ------------------------------------------------------------------------
@api_router.post("/events")
async def create_event(event: Event, db = Depends(get_db)):
    event_dict = event.model_dump()
    await db.events.insert_one(event_dict.copy())
    return event_dict

@api_router.get("/events/{user_id}")
async def get_events(user_id: str, db = Depends(get_db)):
    events = await db.events.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return events

# ------------------------------------------------------------------------
# Individual Agent Endpoints (For UI Control panels)
# ------------------------------------------------------------------------

# --- Content Agent ---
from agents.content_agent import ContentStrategistAgent

@api_router.post("/agent/content/generate")
async def generate_content(req: ContentRequest, db = Depends(get_db)):
    agent = ContentStrategistAgent(db)
    result = await agent.generate_content(req.event_id, req.prompt, req.user_id)
    return {"success": True, "data": result}

@api_router.get("/agent/content/{event_id}")
async def get_content(event_id: str, db = Depends(get_db)):
    content = await db.content.find({"event_id": event_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return content

@api_router.post("/agent/content/approve")
async def approve_content(req: ContentApproval, db = Depends(get_db)):
    agent = ContentStrategistAgent(db)
    success = await agent.approve_content(req.content_id)
    return {"success": success}

# --- Budget Agent ---
from agents.budget_agent import BudgetAgent

@api_router.post("/agent/budget/create")
async def create_budget(req: BudgetRequest, db = Depends(get_db)):
    agent = BudgetAgent(db)
    result = await agent.create_budget(req.event_id, req.categories, req.user_id)
    return {"success": True, "data": result}

@api_router.post("/agent/budget/expense")
async def add_expense(req: ExpenseRequest, db = Depends(get_db)):
    agent = BudgetAgent(db)
    result = await agent.add_expense(req.budget_id, req.category, req.amount, req.description)
    return {"success": True, "data": result}

@api_router.get("/agent/budget/{event_id}")
async def get_budgets(event_id: str, db = Depends(get_db)):
    budgets = await db.budgets.find({"event_id": event_id}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return budgets

# --- Scheduler Agent ---
from agents.scheduler_agent import SchedulerAgent

@api_router.post("/agent/schedule/create")
async def create_schedule(req: ScheduleRequest, db = Depends(get_db)):
    agent = SchedulerAgent(db)
    result = await agent.create_schedule(req.event_id, req.sessions, req.user_id)
    return {"success": True, "data": result}

@api_router.get("/agent/schedule/{event_id}")
async def get_schedules(event_id: str, db = Depends(get_db)):
    schedules = await db.schedules.find({"event_id": event_id}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return schedules

@api_router.post("/agent/schedule/resolve")
async def resolve_conflicts(req: ConflictResolution, db = Depends(get_db)):
    agent = SchedulerAgent(db)
    result = await agent.resolve_conflicts(req.event_id, req.schedule_id, req.new_constraint)
    return {"success": True, "data": result}

# --- Email Agent ---
from agents.email_agent import EmailMarketingAgent

@api_router.post("/agent/email/campaign")
async def launch_campaign(req: EmailCampaignRequest, db = Depends(get_db)):
    agent = EmailMarketingAgent(db)
    result = await agent.draft_and_send_campaign(req.event_id, req.registration_id, req.subject, req.template, req.role_filter)
    return {"success": True, "data": result}

@api_router.get("/agent/email/{event_id}")
async def get_campaigns(event_id: str, db = Depends(get_db)):
    campaigns = await db.email_campaigns.find({"event_id": event_id}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return campaigns

# --- Volunteer Agent ---
from agents.volunteer_agent import VolunteerAgent

@api_router.post("/agent/volunteer/assign")
async def assign_volunteers(req: TaskAssignmentRequest, db = Depends(get_db)):
    agent = VolunteerAgent(db)
    result = await agent.assign_tasks(req.event_id, req.volunteer_pool_id, req.tasks)
    return {"success": True, "data": result}

@api_router.get("/agent/volunteer/{event_id}")
async def get_volunteer_pools(event_id: str, db = Depends(get_db)):
    # Legacy handler - return the latest assignments
    pools = await db.volunteer_assignments.find({"event_id": event_id}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return pools

# ------------------------------------------------------------------------
# Legacy Individual Agent Triggers (Kept for frontend compatibility)
# ------------------------------------------------------------------------
@api_router.get("/activities/latest")
async def get_latest_activities(limit: int = 20, db = Depends(get_db)):
    activities = await db.activities.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return activities

@api_router.get("/activities/{event_id}")
async def get_activities(event_id: str, limit: int = 50, db = Depends(get_db)):
    activities = await db.activities.find({"event_id": event_id}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return activities
