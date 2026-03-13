from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    event_id: str = Field(default_factory=lambda: f"event_{uuid.uuid4().hex[:8]}")
    name: str
    description: str
    user_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SwarmRunRequest(BaseModel):
    event_id: str
    user_id: str
    event_name: str
    raw_prompt: str
    schedule: List[dict] = []
    target_audience: Optional[str] = None
    extended_options: Optional[dict] = Field(default_factory=dict)
