from pydantic import BaseModel
from typing import List

class TaskAssignmentRequest(BaseModel):
    event_id: str
    volunteer_pool_id: str
    tasks: List[dict]
