from typing import TypedDict, List, Optional, Dict, Any
from datetime import datetime

class SwarmState(TypedDict, total=False):
    """Shared state across all agents in the swarm"""
    # Event info
    event_id: str
    event_name: str
    user_id: str
    
    # Content agent
    raw_prompt: str
    target_audience: str
    generated_posts: List[Dict[str, Any]]
    promo_copy: str
    content_status: str
    
    # Email agent
    registration_file: Optional[str]
    email_template: str
    email_results: Dict[str, Any]
    participants_count: int
    email_status: str
    
    # Scheduler agent  
    schedule: List[Dict[str, Any]]
    conflicts_found: bool
    conflict_details: List[str]
    resolved_schedule: List[Dict[str, Any]]
    schedule_changed: bool
    scheduler_status: str
    
    # Orchestration
    last_agent: str
    messages: List[str]
    swarm_status: str
    timestamp: str
    
    # Activity log
    activities: List[Dict[str, Any]]
