import logging
from datetime import datetime, timezone
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class SwarmMemory:
    """
    Centralized memory allowing agents to read and write to the same shared state.
    """
    def __init__(self, db):
        self.db = db
        self.collection = db.swarm_memory

    async def initialize_event_memory(self, event_id: str, initial_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Creates a fresh memory block for a new swarm event execution."""
        base_memory = {
            "event_id": event_id,
            "status": "initializing",
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "schedule": [],
            "budget": {},
            "volunteers": [],
            "logistics": {},
            "risks": [],
            "communications": [],
            "shared_context": initial_data or {}
        }
        
        # Upsert memory block
        await self.collection.update_one(
            {"event_id": event_id},
            {"$set": base_memory},
            upsert=True
        )
        return base_memory

    async def get_memory(self, event_id: str) -> Dict[str, Any]:
        """Fetch the entire memory block for an event."""
        doc = await self.collection.find_one({"event_id": event_id}, {"_id": 0})
        return doc or {}

    async def update_domain_memory(self, event_id: str, domain: str, data: Any) -> bool:
        """
        Updates a specific domain of the memory (e.g. 'schedule', 'budget')
        """
        try:
            await self.collection.update_one(
                {"event_id": event_id},
                {
                    "$set": {
                        domain: data,
                        "last_updated": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logger.debug(f"Updated memory domain '{domain}' for event {event_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update memory domain '{domain}' for event {event_id}: {str(e)}")
            return False

    async def log_activity(self, event_id: str, agent: str, message: str):
        """Log agent activity to a central timeline collection."""
        log_entry = {
            "event_id": event_id,
            "agent": agent,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.logs.insert_one(log_entry)
        
        # Also append to the recent activities for quick dashboard fetch
        await self.db.activities.insert_one({
            "event_id": event_id,
            "title": f"{agent} Activity",
            "description": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": "agent_action",
            "agent": agent
        })
