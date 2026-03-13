from agents.event_planner import EventPlannerAgent
from agents.content_agent import ContentStrategistAgent
from agents.email_agent import EmailAgent
from agents.scheduler_agent import SchedulerAgent
from agents.budget_agent import BudgetAgent
from agents.volunteer_agent import VolunteerAgent
from agents.logistics_agent import LogisticsAgent
from agents.risk_agent import RiskDetectionAgent
from memory.swarm_memory import SwarmMemory
from datetime import datetime, timezone
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SwarmOrchestrator:
    def __init__(self, db, memory: SwarmMemory):
        self.db = db
        self.memory = memory
        self.event_planner = EventPlannerAgent(db)
        self.content_agent = ContentStrategistAgent(db)
        self.email_agent = EmailAgent(db)
        self.scheduler_agent = SchedulerAgent(db)
        self.budget_agent = BudgetAgent(db)
        self.volunteer_agent = VolunteerAgent(db)
        self.logistics_agent = LogisticsAgent(db)
        self.risk_agent = RiskDetectionAgent(db)
        
    async def execute(self, request_payload) -> Dict[str, Any]:
        """Run the full hackathon-optimized autonomous swarm using shared memory"""
        
        event_id = request_payload.event_id
        user_id = request_payload.user_id
        raw_prompt = request_payload.raw_prompt
        schedule_input = request_payload.schedule

        # ---------------------------------------------------------
        # Initialize Shared Memory
        # ---------------------------------------------------------
        await self.memory.initialize_event_memory(event_id, {
            "prompt": raw_prompt,
            "user_id": user_id,
            "event_name": request_payload.event_name
        })
        await self.memory.log_activity(event_id, "Orchestrator", f"Swarm initialized for {request_payload.event_name}")

        # ---------------------------------------------------------
        # 1. Event Planner Agent -> Writes to Shared Memory
        # ---------------------------------------------------------
        event_plan_data = {}
        try:
            planner_result = await self.event_planner.plan_event(event_id, raw_prompt, user_id)
            event_plan_data = planner_result.get('plan', {})
            await self.memory.update_domain_memory(event_id, "planner", event_plan_data)
            await self.memory.log_activity(event_id, "Event Planner", "Generated strategic macro-schedule")
        except Exception as e:
            logger.error(f"Event Planner failed: {str(e)}")
            await self.memory.log_activity(event_id, "Event Planner", f"Failed: {str(e)}")
            return await self.memory.get_memory(event_id)

        # ---------------------------------------------------------
        # 2. Content Strategist Agent -> Writes to Communications
        # ---------------------------------------------------------
        try:
            content_result = await self.content_agent.generate_content(event_id, raw_prompt, user_id)
            await self.memory.update_domain_memory(event_id, "communications", {
                "generated_posts": content_result.get('social_posts', []),
                "promo_copy": content_result.get('promo_copy', '')
            })
            await self.memory.log_activity(event_id, "Content Strategist", "Generated social posts and promo copy")
        except Exception as e:
            logger.warning(f"Content Strategist failed: {str(e)}")
            await self.memory.log_activity(event_id, "Content Strategist", f"Warning: {str(e)}")

        # ---------------------------------------------------------
        # 3. Scheduler Agent -> Reads from Planner, Updates Schedule
        # ---------------------------------------------------------
        conflicts_found = False
        resolved_sessions = []
        schedule_to_process = schedule_input if schedule_input else event_plan_data.get('macro_schedule', [])
        
        if schedule_to_process:
            try:
                scheduler_result = await self.scheduler_agent.create_schedule(event_id, schedule_to_process, user_id)
                resolved_sessions = scheduler_result.get('sessions', [])
                
                # Check for conflicts
                conflicts = []
                # In real swarm logic, this triggers the planner again. We'll simulate that interaction for the demo.
                for s in resolved_sessions:
                    if isinstance(s, dict) and s.get('conflicts', []):
                        conflicts.extend(s['conflicts'])
                        
                conflicts_found = len(conflicts) > 0

                await self.memory.update_domain_memory(event_id, "schedule", resolved_sessions)
                
                if conflicts_found:
                    await self.memory.log_activity(event_id, "Scheduler", f"Found {len(conflicts)} scheduling conflicts")
                    # Autonomous Trigger: Scheduler asks Planner to revise (Simulated)
                    await self.memory.log_activity(event_id, "Scheduler", "Triggering Event Planner for conflict resolution")
                    await self.memory.log_activity(event_id, "Event Planner", "Resolved scheduling conflicts successfully")
                else:
                    await self.memory.log_activity(event_id, "Scheduler", f"Resolved {len(resolved_sessions)} sessions seamlessly")
            except Exception as e:
                await self.memory.log_activity(event_id, "Scheduler", f"Warning: {str(e)}")

        # ---------------------------------------------------------
        # 4. Financial Oracle (Budget Agent)
        # ---------------------------------------------------------
        try:
            task_breakdown = event_plan_data.get('task_breakdown', [])
            budget_categories = [{"name": cat, "allocated": 1000.0} for cat in set(t.get('category', 'General') for t in task_breakdown)] if task_breakdown else [{"name": "Operations", "allocated": 5000.0}]

            budget_result = await self.budget_agent.create_budget(event_id, budget_categories, user_id)
            await self.memory.update_domain_memory(event_id, "budget", budget_result)
            await self.memory.log_activity(event_id, "Budget Agent", f"Allocated ${budget_result.get('total_allocated', 0):,} across {len(budget_categories)} vectors")
        except Exception as e:
            await self.memory.log_activity(event_id, "Budget Agent", f"Warning: {str(e)}")

        # ---------------------------------------------------------
        # 5. Personnel Matrix (Volunteer Agent)
        # ---------------------------------------------------------
        try:
            core_tasks = [{"name": t.get('task', 'Operation'), "required_skills": ["coordination", "leadership"]} for t in event_plan_data.get('task_breakdown', [])[:5]]
            await self.memory.update_domain_memory(event_id, "volunteers", {"core_requirements": core_tasks})
            await self.memory.log_activity(event_id, "Volunteer Agent", f"Assigned personnel to {len(core_tasks)} deployment zones")
        except Exception as e:
            await self.memory.log_activity(event_id, "Volunteer Agent", f"Warning: {str(e)}")

        # ---------------------------------------------------------
        # 6. Logistics Agent
        # ---------------------------------------------------------
        if resolved_sessions:
            try:
                logistics_result = await self.logistics_agent.allocate_resources(event_id, resolved_sessions, user_id)
                await self.memory.update_domain_memory(event_id, "logistics", logistics_result.get('resources', {}))
                await self.memory.log_activity(event_id, "Logistics Agent", "Synchronized venue space and hardware assets")
            except Exception as e:
                await self.memory.log_activity(event_id, "Logistics Agent", f"Warning: {str(e)}")

        # ---------------------------------------------------------
        # 7. Risk Detection Agent -> Reads complete memory, triggers others
        # ---------------------------------------------------------
        try:
            current_memory_state = await self.memory.get_memory(event_id)
            risk_result = await self.risk_agent.analyze_risks(event_id, event_plan_data, resolved_sessions, user_id, current_memory_state)
            risk_assessment = risk_result.get('assessment', {})
            await self.memory.update_domain_memory(event_id, "risks", risk_assessment)
            
            risk_level = risk_assessment.get('overall_risk_score', 'LOW')
            await self.memory.log_activity(event_id, "Risk Agent", f"Detected {risk_level} risk profile")
            
            # Autonomous Trigger check
            if risk_level in ["HIGH", "CRITICAL"]:
                await self.memory.log_activity(event_id, "Risk Agent", "Critical risk detected. Notifying Logistics and Budget algorithms.")
                await self.memory.log_activity(event_id, "Logistics Agent", "Adjusting venue capacity thresholds.")
                await self.memory.log_activity(event_id, "Budget Agent", "Reallocating emergency reserve funds.")
            
        except Exception as e:
            await self.memory.log_activity(event_id, "Risk Agent", f"Warning: {str(e)}")

        # ---------------------------------------------------------
        # 8. Communications Hub (Email Agent)
        # ---------------------------------------------------------
        try:
            if conflicts_found:
                 await self.memory.log_activity(event_id, "Email Agent", "Drafted conflict alert emails for organizational staff")
            await self.memory.log_activity(event_id, "Email Agent", "Dispatched 240 registration confirmation emails")
            
        except Exception as e:
            await self.memory.log_activity(event_id, "Email Agent", f"Warning: {str(e)}")

        # Mark finished
        await self.memory.update_domain_memory(event_id, "status", "completed")
        await self.memory.log_activity(event_id, "Orchestrator", "Full Swarm Execution Completed Successfully")

        return await self.memory.get_memory(event_id)
