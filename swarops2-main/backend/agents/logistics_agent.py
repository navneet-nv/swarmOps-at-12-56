import os
import asyncio
import json
from datetime import datetime, timezone
from crewai import Agent, Task, Crew, Process

class LogisticsAgent:
    def __init__(self, db):
        self.db = db
        
    async def allocate_resources(self, event_id: str, schedule: list, user_id: str):
        """Analyze schedule and allocate physical resources/rooms"""
        
        await self._log_activity(event_id, "started", "Allocating venue spaces and tracking equipment needs")
        
        try:
            logistics_manager = Agent(
                role='Venue & Resource Manager',
                goal='Manage physical resources (rooms, AV equipment, catering) based on the event size and schedule.',
                backstory='You are a meticulous logistics coordinator who ensures every session has the physical space, chairs, projectors, and connectivity it needs to succeed.',
                verbose=False,
                allow_delegation=False
            )
            
            task_description = f"""
            Analyze the following event schedule and allocate logical resources for each session:
            SCHEDULE: {json.dumps(schedule)}
            
            Return exactly a JSON object (without markdown code blocks) with the following structure:
            {{
                "total_rooms_required": integer,
                "equipment_inventory": [
                    {{"item": "...", "quantity_needed": integer, "notes": "..."}}
                ],
                "allocations": [
                    {{
                        "session_id": "...", 
                        "room_assignment": "...",
                        "required_equipment": ["...", "..."],
                        "estimated_capacity": integer
                    }}
                ]
            }}
            """
            
            task = Task(
                description=task_description,
                expected_output="A valid JSON object representing the logistics allocation.",
                agent=logistics_manager
            )
            
            crew = Crew(
                agents=[logistics_manager],
                tasks=[task],
                process=Process.sequential,
                verbose=False
            )
            
            result = await asyncio.to_thread(crew.kickoff)
            res_str = str(result.raw).strip()
            
            if res_str.startswith("```json"):
                res_str = res_str[7:-3].strip()
            elif res_str.startswith("```"):
                res_str = res_str[3:-3].strip()
                
            try:
                logistics_data = json.loads(res_str)
            except json.JSONDecodeError:
                logistics_data = {
                    "total_rooms_required": 1,
                    "equipment_inventory": [{"item": "Projector", "quantity_needed": 1, "notes": "Default"}],
                    "allocations": []
                }
            
            # Store in database
            stored_logistics = {
                "logistics_id": f"logistics_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "resources": logistics_data,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.logistics.insert_one(stored_logistics.copy())
            await self._log_activity(event_id, "completed", "Physical resources and rooms allocated")
            
            return stored_logistics
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
            
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Logistics Coordinator",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
