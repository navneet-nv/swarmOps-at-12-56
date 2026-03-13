import os
import asyncio
import resend
from datetime import datetime, timezone
import pandas as pd
import io
from tools.csv_parser import CSVParser

class EmailAgent:
    def __init__(self, db):
        self.db = db
        self.api_key = os.environ.get('RESEND_API_KEY')
        self.sender_email = os.environ.get('SENDER_EMAIL')
        resend.api_key = self.api_key
        self.csv_parser = CSVParser()
        
    async def process_registration_file(self, event_id: str, file_content: bytes, file_type: str, user_id: str):
        """Process uploaded CSV/Excel file and extract emails"""
        
        await self._log_activity(event_id, "started", "Processing registration file")
        
        try:
            # Use CSVParser tool
            participants = self.csv_parser.parse_file(file_content, file_type)
            
            # Store participants
            registration_data = {
                "registration_id": f"reg_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "user_id": user_id,
                "participants": participants,
                "total_count": len(participants),
                "segments": self.csv_parser.segment_by_role(participants),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.registrations.insert_one(registration_data.copy())
            await self._log_activity(event_id, "completed", f"Processed {len(participants)} participants")
            
            return registration_data
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def send_bulk_emails(self, event_id: str, registration_id: str, template: str, subject: str, role_filter: str = None):
        """Send personalized bulk emails"""
        
        await self._log_activity(event_id, "started", "Sending bulk emails")
        
        try:
            # Get registration data
            reg_data = await self.db.registrations.find_one({"registration_id": registration_id}, {"_id": 0})
            if not reg_data:
                raise Exception("Registration not found")
            
            participants = reg_data['participants']
            if role_filter:
                participants = [p for p in participants if p['role'].lower() == role_filter.lower()]
            
            # Send emails
            sent_count = 0
            failed_count = 0
            
            for participant in participants:
                try:
                    # Use CSVParser to personalize email
                    personalized_content = self.csv_parser.personalize_email(template, participant)
                    
                    # Send email (using asyncio.to_thread for non-blocking)
                    params = {
                        "from": self.sender_email,
                        "to": [participant['email']],
                        "subject": subject,
                        "html": personalized_content
                    }
                    
                    await asyncio.to_thread(resend.Emails.send, params)
                    sent_count += 1
                    
                except Exception as e:
                    failed_count += 1
                    print(f"Failed to send to {participant['email']}: {str(e)}")
            
            # Store campaign data
            campaign_data = {
                "campaign_id": f"campaign_{event_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "event_id": event_id,
                "registration_id": registration_id,
                "subject": subject,
                "template": template,
                "role_filter": role_filter,
                "sent_count": sent_count,
                "failed_count": failed_count,
                "total_count": len(participants),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.email_campaigns.insert_one(campaign_data.copy())
            await self._log_activity(event_id, "completed", f"Sent {sent_count} emails, {failed_count} failed")
            
            return campaign_data
            
        except Exception as e:
            await self._log_activity(event_id, "failed", f"Error: {str(e)}")
            raise e
    
    async def _log_activity(self, event_id: str, status: str, message: str):
        """Log agent activity"""
        activity = {
            "activity_id": f"activity_{int(datetime.now(timezone.utc).timestamp())}_{event_id}",
            "event_id": event_id,
            "agent": "Email Agent",
            "status": status,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.activities.insert_one(activity)
