from datetime import datetime, timezone
import pandas as pd
import io

class VolunteerAgent:
    def __init__(self, db):
        self.db = db
        
    async def process_volunteers(self, event_id: str, file_content: bytes, file_type: str, user_id: str):
        """Process volunteer CSV/Excel file"""
        
        await self._log_activity(event_id, "started", "Processing volunteer data")
        
        try:
            # Parse file
            if file_type == 'csv':
                df = pd.read_csv(io.BytesIO(file_content))
            else:  # xlsx
                df = pd.read_excel(io.BytesIO(file_content))
            
            # Extract volunteers
            volunteers = []
            for _, row in df.iterrows():
                volunteer = {
                    "volunteer_id": f"volunteer_{len(volunteers)}_{event_id}",
                    "name": row.get('Name', row.get('name', 'Volunteer')),
                    "email": row.get('Email', row.get('email', '')),
                    "skills": row.get('Skills', row.get('skills', '')).split(',') if row.get('Skills', row.get('skills', '')) else [],
                    "availability": row.get('Availability', row.get('availability', '')),
                    "assigned_task": None
                }
                volunteers.append(volunteer)
            
            # Store volunteers
            volunteer_data = {
                "volunteer_pool_id": f"volunteers_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "volunteers": volunteers,
                "total_count": len(volunteers),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.volunteers.insert_one(volunteer_data.copy())
            await self._log_activity(event_id, "completed", f"Processed {len(volunteers)} volunteers")
            
            return volunteer_data
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def assign_tasks(self, event_id: str, volunteer_pool_id: str, tasks: list):
        """Assign volunteers to tasks based on skills"""
        
        await self._log_activity(event_id, "started", "Assigning volunteers to tasks")
        
        try:
            # Get volunteers
            volunteer_data = await self.db.volunteers.find_one({"volunteer_pool_id": volunteer_pool_id}, {"_id": 0})
            if not volunteer_data:
                raise Exception("Volunteer pool not found")
            
            volunteers = volunteer_data['volunteers']
            assignments = []
            
            # Simple assignment algorithm: match skills
            for task in tasks:
                required_skills = task.get('required_skills', [])
                best_match = None
                best_score = 0
                
                for volunteer in volunteers:
                    if volunteer['assigned_task']:
                        continue
                    
                    # Calculate match score
                    match_score = len(set(volunteer['skills']) & set(required_skills))
                    if match_score > best_score:
                        best_score = match_score
                        best_match = volunteer
                
                if best_match:
                    best_match['assigned_task'] = task['name']
                    assignments.append({
                        "task": task['name'],
                        "volunteer": best_match['name'],
                        "volunteer_id": best_match['volunteer_id']
                    })
            
            # Update volunteer pool
            await self.db.volunteers.update_one(
                {"volunteer_pool_id": volunteer_pool_id},
                {"$set": {"volunteers": volunteers}}
            )
            
            await self._log_activity(event_id, "completed", f"Assigned {len(assignments)} volunteers to tasks")
            
            return {"volunteer_pool_id": volunteer_pool_id, "assignments": assignments}
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Volunteer Coordinator",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
