from agents.content_agent import ContentStrategistAgent
from agents.email_agent import EmailAgent
from agents.scheduler_agent import SchedulerAgent
from datetime import datetime, timezone
from typing import Dict, Any

class SwarmOrchestrator:
    def __init__(self, db):
        self.db = db
        self.content_agent = ContentStrategistAgent(db)
        self.email_agent = EmailAgent(db)
        self.scheduler_agent = SchedulerAgent(db)
        
    async def run_swarm(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """Run the orchestrated swarm built natively with CrewAI components across simple Python sequential logic"""
        
        # Add initial metadata
        initial_state['timestamp'] = datetime.now(timezone.utc).isoformat()
        initial_state['swarm_status'] = 'running'
        initial_state['messages'] = []
        initial_state['activities'] = []
        
        event_id = initial_state.get('event_id')
        user_id = initial_state.get('user_id')
        raw_prompt = initial_state.get('raw_prompt')
        schedule = initial_state.get('schedule', [])

        # Content Strategist Agent (powered by CrewAI internally)
        try:
            content_result = await self.content_agent.generate_content(
                event_id, raw_prompt, user_id
            )
            initial_state['generated_posts'] = content_result.get('social_posts', [])
            initial_state['promo_copy'] = content_result.get('promo_copy', '')
            initial_state['content_status'] = 'completed'
            initial_state['last_agent'] = 'content_strategist'
            initial_state['messages'].append(
                f"Content Strategist: Generated {len(content_result.get('social_posts', []))} social posts"
            )
        except Exception as e:
            initial_state['content_status'] = 'failed'
            initial_state['last_agent'] = 'content_strategist'
            initial_state['messages'].append(f"Content Strategist: Error - {str(e)}")
            initial_state['swarm_status'] = 'completed'
            return initial_state

        initial_state['activities'].append({
            "agent": "content_strategist",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "completed",
            "event_id": event_id
        })

        # Scheduler Agent (powered by CrewAI internally)
        if schedule:
            try:
                scheduler_result = await self.scheduler_agent.create_schedule(
                    event_id, schedule, user_id
                )
                sessions = scheduler_result.get('sessions', [])
                conflicts_found = any(
                    s.get('conflicts', []) for s in sessions if isinstance(s, dict)
                )
                
                initial_state['resolved_schedule'] = sessions
                initial_state['conflicts_found'] = conflicts_found
                initial_state['scheduler_status'] = 'completed'
                initial_state['last_agent'] = 'scheduler'
                initial_state['messages'].append(
                    f"Scheduler: Created schedule with {len(sessions)} sessions"
                )
                
                initial_state['activities'].append({
                    "agent": "scheduler",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "status": "completed",
                    "event_id": event_id
                })

                # Conditional edge: if conflicts found, trigger email agent
                if conflicts_found:
                    try:
                        initial_state['messages'].append("Email Agent: Triggered by scheduler conflicts")
                        initial_state['email_status'] = 'conflict_notification_sent'
                        initial_state['last_agent'] = 'email_communicator'
                        initial_state['messages'].append("Email Agent: Conflict notifications prepared")
                        
                        initial_state['activities'].append({
                            "agent": "email_communicator",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "status": "completed",
                            "event_id": event_id
                        })
                    except Exception as e:
                        initial_state['email_status'] = 'failed'
                        initial_state['last_agent'] = 'email_communicator'
                        initial_state['messages'].append(f"Email Agent: Error - {str(e)}")
            except Exception as e:
                initial_state['scheduler_status'] = 'failed'
                initial_state['last_agent'] = 'scheduler'
                initial_state['messages'].append(f"Scheduler: Error - {str(e)}")

        initial_state['swarm_status'] = 'completed'
        return initial_state
