from crewai import Agent, Task, Crew, Process
import os
import asyncio
import json
from datetime import datetime, timezone
from tools.conflict_checker import ConflictChecker

class SchedulerAgent:
    def __init__(self, db):
        self.db = db
        self.conflict_checker = ConflictChecker()
        
    async def create_schedule(self, event_id: str, sessions: list, user_id: str):
        """Create schedule from session constraints"""
        
        await self._log_activity(event_id, "started", "Building schedule")
        
        try:
            scheduler = Agent(
                role='Event Scheduler',
                goal='Optimize session scheduling to avoid conflicts.',
                backstory='You are an expert event scheduler. You optimize session scheduling to ensure no speaker conflicts and room availability.',
                verbose=False,
                allow_delegation=False
            )
            
            task_description = f"""
            Create an optimized schedule for these sessions: {json.dumps(sessions)}
            
            Return exactly a JSON array (without markdown code blocks) where each item has: 
            session_id, name, speaker, start_time (HH:MM), end_time (HH:MM), room, conflicts (empty array by default). 
            
            Ensure no speaker conflicts and ensure realistic room availability.
            """
            
            task = Task(
                description=task_description,
                expected_output="A valid JSON array of session objects.",
                agent=scheduler
            )
            
            crew = Crew(
                agents=[scheduler],
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
                scheduled_sessions = json.loads(res_str)
                # Ensure it's a list
                if isinstance(scheduled_sessions, dict) and "sessions" in scheduled_sessions:
                    scheduled_sessions = scheduled_sessions["sessions"]
                if not isinstance(scheduled_sessions, list):
                    scheduled_sessions = []
            except json.JSONDecodeError:
                # Fallback schedule
                scheduled_sessions = []
                start_hour = 9
                for i, session in enumerate(sessions):
                    scheduled_sessions.append({
                        "session_id": session.get('session_id', f"session_{i}"),
                        "name": session.get('name', f"Session {i+1}"),
                        "speaker": session.get('speaker', 'TBD'),
                        "start_time": f"{start_hour + i}:00",
                        "end_time": f"{start_hour + i + 1}:00",
                        "room": session.get('room', f"Room {(i % 3) + 1}"),
                        "conflicts": []
                    })
            
            # Use ConflictChecker to detect conflicts
            conflicts, conflict_details = self.conflict_checker.detect_conflicts(scheduled_sessions)
            
            # Add conflict info to sessions
            for conflict in conflicts:
                for session in scheduled_sessions:
                    if session['name'] in [conflict.get('session1'), conflict.get('session2')]:
                        if 'conflicts' not in session:
                            session['conflicts'] = []
                        session['conflicts'].append(conflict)
            
            # Store schedule
            schedule_data = {
                "schedule_id": f"schedule_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "sessions": scheduled_sessions,
                "conflicts": conflicts,
                "conflict_details": conflict_details,
                "status": "active" if not conflicts else "has_conflicts",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.schedules.insert_one(schedule_data.copy())
            await self._log_activity(event_id, "completed", f"Schedule created with {len(scheduled_sessions)} sessions")
            
            return schedule_data
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def resolve_conflicts(self, event_id: str, schedule_id: str, new_constraint: dict):
        """Recalculate schedule based on new constraints"""
        
        await self._log_activity(event_id, "started", "Resolving schedule conflicts")
        
        try:
            # Get current schedule
            schedule = await self.db.schedules.find_one({"schedule_id": schedule_id}, {"_id": 0})
            if not schedule:
                raise Exception("Schedule not found")
            
            resolver = Agent(
                role='Conflict Resolver',
                goal='Expertly resolve scheduling conflicts.',
                backstory='You are an expert at resolving complex scheduling conflicts.',
                verbose=False,
                allow_delegation=False
            )
            
            task_description = f"""
            Current schedule: {json.dumps(schedule['sessions'])}
            
            New constraint: {json.dumps(new_constraint)}
            
            Recalculate the schedule to accommodate this constraint. 
            Return exactly the updated JSON array of sessions (without markdown formatting) with the same schema.
            """
            
            task = Task(
                description=task_description,
                expected_output="A valid JSON array of updated session objects.",
                agent=resolver
            )
            
            crew = Crew(
                agents=[resolver],
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
                updated_sessions = json.loads(res_str)
                if isinstance(updated_sessions, dict) and "sessions" in updated_sessions:
                    updated_sessions = updated_sessions["sessions"]
            except json.JSONDecodeError:
                updated_sessions = schedule['sessions']
            
            # Update schedule
            await self.db.schedules.update_one(
                {"schedule_id": schedule_id},
                {"$set": {
                    "sessions": updated_sessions,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            await self._log_activity(event_id, "completed", "Conflicts resolved")
            
            # Trigger email agent to notify participants
            await self._log_activity(event_id, "handoff", "Scheduler → Email Agent: Sending conflict notifications")
            
            return {"schedule_id": schedule_id, "sessions": updated_sessions}
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Scheduler Agent",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
