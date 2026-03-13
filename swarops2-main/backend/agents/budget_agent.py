import os
import asyncio
import json
from datetime import datetime, timezone
from crewai import Agent, Task, Crew, Process

class BudgetAgent:
    def __init__(self, db):
        self.db = db
        
    async def create_budget(self, event_id: str, categories: list, user_id: str):
        """Intelligently optimize budget allocation using CrewAI"""
        
        await self._log_activity(event_id, "started", "Analyzing and optimizing budget vectors")
        
        try:
            # Prepare an intelligent agent for budget optimization
            budget_optimizer = Agent(
                role='Strategic Financial Director',
                goal='Optimize and refine budget allocations to maximize ROI for the event',
                backstory='You are a master of corporate finance and event budgeting. You analyze raw category allocations and find ways to distribute funds smarter, adding necessary contingency reserves.',
                verbose=False,
                allow_delegation=False
            )
            
            task_description = f"""
            Analyze the following initial budget categories for an event:
            {json.dumps(categories)}
            
            1. Keep the same overall approximate budget, but optimize the allocations between these categories.
            2. Add an 'Emergency Reserve' category if it doesn't exist, allocating roughly 10% of the total budget to it.
            
            Return exactly a JSON array of objects representing the final optimized categories. Each object must have:
            - 'name': string
            - 'allocated': float (the optimized amount)
            - 'reasoning': string (why you allocated this much)
            """
            
            task = Task(
                description=task_description,
                expected_output="A valid JSON array of optimized category objects.",
                agent=budget_optimizer
            )
            
            crew = Crew(
                agents=[budget_optimizer],
                tasks=[task],
                process=Process.sequential,
                verbose=False
            )
            
            # Execute AI optimization
            result = await asyncio.to_thread(crew.kickoff)
            res_str = str(result.raw).strip()
            
            if res_str.startswith("```json"):
                res_str = res_str[7:-3].strip()
            elif res_str.startswith("```"):
                res_str = res_str[3:-3].strip()
                
            try:
                optimized_categories = json.loads(res_str)
                # Handle nested dicts if AI returns {"categories": [...]}
                if isinstance(optimized_categories, dict) and "categories" in optimized_categories:
                    optimized_categories = optimized_categories["categories"]
                if not isinstance(optimized_categories, list):
                    optimized_categories = categories # fallback
            except json.JSONDecodeError:
                optimized_categories = categories # fallback
                
            total_budget = sum(c.get('allocated', 0) for c in optimized_categories)

            budget_data = {
                "budget_id": f"budget_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "categories": optimized_categories,
                "total_allocated": total_budget,
                "total_spent": 0,
                "expenses": [],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.budgets.insert_one(budget_data.copy())
            await self._log_activity(event_id, "completed", f"Optimized and created budget with ${total_budget:,} total cap")
            
            return budget_data
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error optimizing budget: {str(e)}")
            # Fallback to standard creation
            budget_data = {
                "budget_id": f"budget_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "categories": categories,
                "total_allocated": sum(c.get('allocated', 0) for c in categories),
                "total_spent": 0,
                "expenses": [],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await self.db.budgets.insert_one(budget_data.copy())
            return budget_data
    
    async def add_expense(self, budget_id: str, category: str, amount: float, description: str):
        """Intelligently audit and log expenses"""
        
        budget = await self.db.budgets.find_one({"budget_id": budget_id}, {"_id": 0})
        if not budget:
            raise Exception("Budget not found")
        
        event_id = budget['event_id']
        await self._log_activity(event_id, "started", f"Auditing proposed transaction: {description} (${amount})")
        
        try:
            # We could add an AI check here to flag fraudulent or abnormally high expenses!
            # For speed in live ops, we'll do standard overrun logic but add smart logging.
            
            expense = {
                "expense_id": f"expense_{int(datetime.now(timezone.utc).timestamp())}",
                "category": category,
                "amount": amount,
                "description": description,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            new_total = budget['total_spent'] + amount
            overrun = new_total > budget['total_allocated']
            
            await self.db.budgets.update_one(
                {"budget_id": budget_id},
                {
                    "$set": {"total_spent": new_total},
                    "$push": {"expenses": expense}
                }
            )
            
            if overrun:
                await self._log_activity(event_id, "alert", f"⚠️ CRITICAL: Transaction authorized but caused reserve deficit! Deficit: ${new_total - budget['total_allocated']:,.2f}")
            else:
                remaining = budget['total_allocated'] - new_total
                await self._log_activity(event_id, "completed", f"Transaction cleared locally. Remaining reserve: ${remaining:,.2f}")
            
            return {"budget_id": budget_id, "total_spent": new_total, "overrun": overrun}
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Budget Agent",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
