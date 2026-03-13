from crewai import Agent, Task, Crew, Process
import os
import asyncio
import json
from datetime import datetime, timezone

class ContentStrategistAgent:
    def __init__(self, db):
        self.db = db
        # CrewAI automatically uses OPENAI_API_KEY from environment
        
    async def generate_content(self, event_id: str, prompt: str, user_id: str):
        """Generate promotional content and social media posts"""
        
        # Log activity
        await self._log_activity(event_id, "started", "Content generation initiated")
        
        try:
            strategist = Agent(
                role='Content Strategist',
                goal='Generate engaging promotional content and social media posts for tech events.',
                backstory='You are a professional content strategist for tech events. You excel at creating compelling promotional copy and engaging social media posts.',
                verbose=False,
                allow_delegation=False
            )
            
            task_description = f"""
            Generate a compelling 2-paragraph promotional description and 7 social media posts (mix of Twitter, LinkedIn, Instagram) for this event: {prompt}. 
            
            Return exactly a JSON object (without markdown code blocks) with two fields:
            - 'promo_copy': A string containing the 2-paragraph promotional description.
            - 'social_posts': A list of objects. Each object should have: platform (string), content (string), optimal_time (integer between 0 and 23), engagement_score (integer between 1 and 10).
            """
            
            task = Task(
                description=task_description,
                expected_output="A valid JSON object containing promo_copy and social_posts.",
                agent=strategist
            )
            
            crew = Crew(
                agents=[strategist],
                tasks=[task],
                process=Process.sequential,
                verbose=False
            )
            
            # Execute crew kickoff in a separate thread because it's synchronous
            result = await asyncio.to_thread(crew.kickoff)
            res_str = str(result.raw).strip()
            
            # Clean possible markdown formatting
            if res_str.startswith("```json"):
                res_str = res_str[7:-3].strip()
            elif res_str.startswith("```"):
                res_str = res_str[3:-3].strip()
                
            try:
                parsed = json.loads(res_str)
                promo_copy = parsed.get("promo_copy", "")
                social_posts = parsed.get("social_posts", [])
            except json.JSONDecodeError:
                # Fallback if json parsing fails
                promo_copy = res_str
                social_posts = [
                    {
                        "platform": "Twitter",
                        "content": "🚀 Exciting tech event coming up! Join us for innovation and collaboration. #TechEvent",
                        "optimal_time": 10,
                        "engagement_score": 8
                    }
                ]
            
            # Store in database
            content_data = {
                "content_id": f"content_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "promo_copy": promo_copy,
                "social_posts": social_posts,
                "status": "pending_approval",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Insert into DB (MongoDB mutates content_data and adds _id)
            await self.db.content.insert_one(content_data.copy())
            
            await self._log_activity(event_id, "completed", "Content generated successfully")
            
            return content_data
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def approve_content(self, content_id: str):
        """Approve generated content"""
        result = await self.db.content.update_one(
            {"content_id": content_id},
            {"$set": {"status": "approved"}}
        )
        return result.modified_count > 0
    
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Content Strategist",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
