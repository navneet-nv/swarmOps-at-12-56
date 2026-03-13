import os
import asyncio
import json
from datetime import datetime, timezone
from crewai import Agent, Task, Crew, Process

class EventPlannerAgent:
    def __init__(self, db):
        self.db = db
        
    async def plan_event(self, event_id: str, prompt: str, user_id: str):
        """Create macro-schedule and task breakdown"""
        
        await self._log_activity(event_id, "started", "Structuring strategic event plan")
        
        try:
            planner = Agent(
                role='Master Strategic Event Planner',
                goal='Determine the macro-schedule, break down tasks, and create high-level timelines for the event.',
                backstory='You are a world-class event planner. You organize chaotic requests into pristine, chronological run-of-shows and logistical task breakdowns.',
                verbose=False,
                allow_delegation=False
            )
            
            task_description = f"""
            Analyze the following event prompt and create a robust high-level plan:
            EVENT PROMPT: "{prompt}"
            
            Return exactly a JSON object (without markdown code blocks) with the following structure:
            {{
                "event_theme": "A catchy theme or title for the event",
                "target_audience": "Who this event is for",
                "estimated_duration": "E.g. 48 hours, 1 day, etc.",
                "macro_schedule": [
                    {{"phase": "Pre-event", "description": "...", "duration": "..."}},
                    {{"phase": "Day 1 Morning", "description": "...", "duration": "..."}}
                ],
                "task_breakdown": [
                    {{"category": "Marketing", "task": "..."}},
                    {{"category": "Logistics", "task": "..."}}
                ]
            }}
            """
            
            task = Task(
                description=task_description,
                expected_output="A valid JSON object representing the strategic event plan.",
                agent=planner
            )
            
            crew = Crew(
                agents=[planner],
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
                plan_data = json.loads(res_str)
            except json.JSONDecodeError:
                plan_data = {
                    "event_theme": "Custom Event",
                    "target_audience": "General Audience",
                    "estimated_duration": "Unknown",
                    "macro_schedule": [{"phase": "Main", "description": "Execute event", "duration": "TBD"}],
                    "task_breakdown": [{"category": "General", "task": "Run the event"}]
                }
            
            # Store in database
            stored_plan = {
                "plan_id": f"plan_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "plan": plan_data,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.event_plans.insert_one(stored_plan.copy())
            await self._log_activity(event_id, "completed", "Strategic event plan generated")
            
            return stored_plan
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
            
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Event Planner",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
