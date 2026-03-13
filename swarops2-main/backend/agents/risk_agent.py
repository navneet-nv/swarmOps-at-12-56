import os
import asyncio
import json
from datetime import datetime, timezone
from crewai import Agent, Task, Crew, Process

class RiskDetectionAgent:
    def __init__(self, db):
        self.db = db
        
    async def analyze_risks(self, event_id: str, event_plan: dict, schedule: list, user_id: str, memory_state: dict = None):
        """Analyze plan, schedule, and full memory state for potential risks"""
        
        await self._log_activity(event_id, "started", "Analyzing event plan for potential logistical and macro risks")
        
        try:
            risk_analyst = Agent(
                role='Pre-emptive Risk Analyst',
                goal='Analyze the event plan to predict possible failures (weather, low attendance, bottlenecked registration).',
                backstory='You are a hyper-vigilant risk analyst. You look at event plans and schedules, immediately identifying where things could go wrong, and you provide actionable mitigation strategies.',
                verbose=False,
                allow_delegation=False
            )
            
            task_description = f"""
            Analyze the following event plan, schedule, and current global swarm state to identify potential risks:
            EVENT PLAN: {json.dumps(event_plan)}
            SCHEDULE: {json.dumps(schedule)}
            CURRENT GLOBAL SWARM STATE (includes budget, volunteer assignments, logistics): {json.dumps(memory_state or {})}
            
            Pay special attention to:
            1. Volunteer shortages (check if volunteers array is sufficient for the task breakdown).
            2. Budget overruns (check if operations budget matches or exceeds allocated categories).
            3. Venue capacity issues in logistics against expected registrations.
            4. Schedule density (too many overlapping sessions).
            
            Return exactly a JSON object (without markdown code blocks) with the following structure:
            {{
                "overall_risk_score": "Low, Medium, or High",
                "identified_risks": [
                    {{
                        "severity": "High/Medium/Low",
                        "category": "Logistics/Timing/Attendance/etc.",
                        "description": "...",
                        "mitigation_strategy": "..."
                    }}
                ],
                "summary": "A 1-sentence summary of the risk profile."
            }}
            """
            
            task = Task(
                description=task_description,
                expected_output="A valid JSON object representing the risk assessment report.",
                agent=risk_analyst
            )
            
            crew = Crew(
                agents=[risk_analyst],
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
                risk_data = json.loads(res_str)
            except json.JSONDecodeError:
                risk_data = {
                    "overall_risk_score": "Unknown",
                    "identified_risks": [{"severity": "Medium", "category": "General", "description": "Unable to parse risks", "mitigation_strategy": "Manual review required"}],
                    "summary": "Risk analysis failed to parse correctly."
                }
            
            # Store in database
            stored_risk = {
                "risk_id": f"risk_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "assessment": risk_data,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.risks.insert_one(stored_risk.copy())
            await self._log_activity(event_id, "completed", f"Risk assessment complete. Overall score: {risk_data.get('overall_risk_score')}")
            
            return stored_risk
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
            
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Risk Analyst",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
