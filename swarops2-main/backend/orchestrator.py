from agents.event_planner import EventPlannerAgent
from agents.content_agent import ContentStrategistAgent
from agents.email_agent import EmailAgent
from agents.scheduler_agent import SchedulerAgent
from agents.budget_agent import BudgetAgent
from agents.volunteer_agent import VolunteerAgent
from agents.logistics_agent import LogisticsAgent
from agents.risk_agent import RiskDetectionAgent
from datetime import datetime, timezone
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SwarmOrchestrator:
    def __init__(self, db):
        self.db = db
        self.event_planner = EventPlannerAgent(db)
        self.content_agent = ContentStrategistAgent(db)
        self.email_agent = EmailAgent(db)
        self.scheduler_agent = SchedulerAgent(db)
        self.budget_agent = BudgetAgent(db)
        self.volunteer_agent = VolunteerAgent(db)
        self.logistics_agent = LogisticsAgent(db)
        self.risk_agent = RiskDetectionAgent(db)
        
    async def run_swarm(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """Run the full hackathon-optimized orchestrated swarm sequentially"""
        
        # Add initial metadata
        initial_state['timestamp'] = datetime.now(timezone.utc).isoformat()
        initial_state['swarm_status'] = 'running'
        initial_state['messages'] = []
        initial_state['activities'] = []
        
        event_id = initial_state.get('event_id')
        user_id = initial_state.get('user_id')
        raw_prompt = initial_state.get('raw_prompt')
        schedule_input = initial_state.get('schedule', [])

        # ---------------------------------------------------------
        # 1. Event Planner Agent
        # ---------------------------------------------------------
        event_plan_data = {}
        try:
            planner_result = await self.event_planner.plan_event(
                event_id, raw_prompt, user_id
            )
            event_plan_data = planner_result.get('plan', {})
            initial_state['event_plan'] = event_plan_data
            initial_state['planner_status'] = 'completed'
            initial_state['last_agent'] = 'event_planner'
            initial_state['messages'].append("Event Planner: Created strategic macro-schedule")
        except Exception as e:
            logger.error(f"Event Planner failed: {str(e)}")
            initial_state['planner_status'] = 'failed'
            initial_state['swarm_status'] = 'completed'
            initial_state['messages'].append(f"Event Planner Error: {str(e)}")
            return initial_state

        # ---------------------------------------------------------
        # 2. Content Strategist Agent 
        # ---------------------------------------------------------
        try:
            content_result = await self.content_agent.generate_content(
                event_id, raw_prompt, user_id
            )
            initial_state['generated_posts'] = content_result.get('social_posts', [])
            initial_state['promo_copy'] = content_result.get('promo_copy', '')
            initial_state['content_status'] = 'completed'
            initial_state['last_agent'] = 'content_strategist'
            initial_state['messages'].append(f"Content Strategist: Generated {len(initial_state['generated_posts'])} social posts")
        except Exception as e:
            logger.warning(f"Content Strategist failed: {str(e)}")
            initial_state['content_status'] = 'failed'
            initial_state['messages'].append(f"Content Strategist Warning: {str(e)}")

        # ---------------------------------------------------------
        # 3. Scheduler Agent
        # ---------------------------------------------------------
        conflicts_found = False
        resolved_sessions = []
        # Fallback to macro_schedule if no detailed schedule provided
        schedule_to_process = schedule_input if schedule_input else event_plan_data.get('macro_schedule', [])
        
        if schedule_to_process:
            try:
                scheduler_result = await self.scheduler_agent.create_schedule(
                    event_id, schedule_to_process, user_id
                )
                resolved_sessions = scheduler_result.get('sessions', [])
                conflicts_found = any(
                    s.get('conflicts', []) for s in resolved_sessions if isinstance(s, dict)
                )
                
                initial_state['resolved_schedule'] = resolved_sessions
                initial_state['conflicts_found'] = conflicts_found
                initial_state['scheduler_status'] = 'completed'
                initial_state['last_agent'] = 'scheduler'
                initial_state['messages'].append(f"Scheduler: Resolved {len(resolved_sessions)} sessions")
            except Exception as e:
                logger.warning(f"Scheduler failed: {str(e)}")
                initial_state['scheduler_status'] = 'failed'
                initial_state['messages'].append(f"Scheduler Warning: {str(e)}")

        # ---------------------------------------------------------
        # 4. Financial Oracle (Budget Agent)
        # ---------------------------------------------------------
        try:
            # Extract categories from task breakdown or macro schedule
            task_breakdown = event_plan_data.get('task_breakdown', [])
            budget_categories = []
            if task_breakdown:
                categories = set(t.get('category', 'General') for t in task_breakdown)
                budget_categories = [{"name": cat, "allocated": 1000.0} for cat in categories] # Demo allocation
            else:
                budget_categories = [{"name": "Operations", "allocated": 5000.0}]

            budget_result = await self.budget_agent.create_budget(
                event_id, budget_categories, user_id
            )
            initial_state['budget_allocation'] = budget_result
            initial_state['budget_status'] = 'completed'
            initial_state['last_agent'] = 'financial_oracle'
            initial_state['messages'].append(f"Financial Oracle: Allocated ${budget_result.get('total_allocated', 0)} across {len(budget_categories)} vectors")
        except Exception as e:
            logger.warning(f"Budget Agent failed: {str(e)}")
            initial_state['budget_status'] = 'failed'
            initial_state['messages'].append(f"Budget Warning: {str(e)}")

        # ---------------------------------------------------------
        # 5. Personnel Matrix (Volunteer Agent)
        # ---------------------------------------------------------
        try:
            # We don't have a file upload here, so we simulate some core tasks for the pool
            core_tasks = [{"name": t.get('task', 'Operation'), "required_skills": ["coordination"]} for t in event_plan_data.get('task_breakdown', [])[:5]]
            # Note: volunteer_agent.assign_tasks requires an existing pool, 
            # for the swarm run we just log the requirement analysis
            initial_state['personnel_requirements'] = core_tasks
            initial_state['volunteer_status'] = 'analysis_completed'
            initial_state['last_agent'] = 'personnel_matrix'
            initial_state['messages'].append(f"Personnel Matrix: Identified {len(core_tasks)} critical deployment objectives")
        except Exception as e:
            logger.warning(f"Volunteer Agent failed: {str(e)}")
            initial_state['volunteer_status'] = 'failed'

        # ---------------------------------------------------------
        # 6. Logistics Agent
        # ---------------------------------------------------------
        if resolved_sessions:
            try:
                logistics_result = await self.logistics_agent.allocate_resources(
                    event_id, resolved_sessions, user_id
                )
                initial_state['logistics_allocation'] = logistics_result.get('resources', {})
                initial_state['logistics_status'] = 'completed'
                initial_state['last_agent'] = 'logistics_agent'
                initial_state['messages'].append("Logistics Agent: Synchronized venue assets")
            except Exception as e:
                logger.warning(f"Logistics Agent failed: {str(e)}")
                initial_state['logistics_status'] = 'failed'

        # ---------------------------------------------------------
        # 7. Risk Detection Agent
        # ---------------------------------------------------------
        try:
            risk_result = await self.risk_agent.analyze_risks(
                event_id, event_plan_data, resolved_sessions, user_id
            )
            initial_state['risk_assessment'] = risk_result.get('assessment', {})
            initial_state['risk_status'] = 'completed'
            initial_state['last_agent'] = 'risk_agent'
            initial_state['messages'].append(f"Risk Detection: Threat Level {initial_state['risk_assessment'].get('overall_risk_score', 'CALCULATING')}")
        except Exception as e:
            logger.warning(f"Risk Agent failed: {str(e)}")
            initial_state['risk_status'] = 'failed'

        # ---------------------------------------------------------
        # 8. Email Communicator Agent (Conditional)
        # ---------------------------------------------------------
        if conflicts_found:
            initial_state['email_status'] = 'conflict_notifications_prepared'
            initial_state['messages'].append("Email Agent: Flagged scheduler conflicts for review")

        initial_state['swarm_status'] = 'completed'
        return initial_state
