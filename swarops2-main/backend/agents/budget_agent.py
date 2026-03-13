from datetime import datetime, timezone

class BudgetAgent:
    def __init__(self, db):
        self.db = db
        
    async def create_budget(self, event_id: str, categories: list, user_id: str):
        """Create budget tracker"""
        
        await self._log_activity(event_id, "started", "Creating budget tracker")
        
        try:
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
            await self._log_activity(event_id, "completed", "Budget tracker created")
            
            return budget_data
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def add_expense(self, budget_id: str, category: str, amount: float, description: str):
        """Add expense and check for overruns"""
        
        budget = await self.db.budgets.find_one({"budget_id": budget_id}, {"_id": 0})
        if not budget:
            raise Exception("Budget not found")
        
        event_id = budget['event_id']
        await self._log_activity(event_id, "started", f"Adding expense: {description}")
        
        try:
            # Add expense
            expense = {
                "expense_id": f"expense_{int(datetime.now(timezone.utc).timestamp())}",
                "category": category,
                "amount": amount,
                "description": description,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Update budget
            new_total = budget['total_spent'] + amount
            
            await self.db.budgets.update_one(
                {"budget_id": budget_id},
                {
                    "$set": {"total_spent": new_total},
                    "$push": {"expenses": expense}
                }
            )
            
            # Check for overruns
            overrun = new_total > budget['total_allocated']
            if overrun:
                await self._log_activity(event_id, "alert", f"⚠️ Budget overrun! Spent: ${new_total}, Allocated: ${budget['total_allocated']}")
            else:
                await self._log_activity(event_id, "completed", f"Expense added: ${amount}")
            
            return {"budget_id": budget_id, "total_spent": new_total, "overrun": overrun}
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Budget Tracker",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
