from pydantic import BaseModel
from typing import List

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
    role_filter: str | None = None

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
