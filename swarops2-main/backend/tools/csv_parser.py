import pandas as pd
import re
from typing import List, Dict, Any
import io

class CSVParser:
    """Tool for parsing and validating CSV/Excel files"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Basic email validation"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def parse_file(file_content: bytes, file_type: str) -> List[Dict[str, Any]]:
        """Parse CSV or Excel file"""
        try:
            if file_type == 'csv':
                df = pd.read_csv(io.BytesIO(file_content))
            else:  # xlsx
                df = pd.read_excel(io.BytesIO(file_content))
            
            # Normalize column names (case-insensitive)
            df.columns = df.columns.str.lower().str.strip()
            
            # Expected columns with fallbacks
            name_col = next((c for c in df.columns if 'name' in c), None)
            email_col = next((c for c in df.columns if 'email' in c), None)
            role_col = next((c for c in df.columns if 'role' in c), None)
            team_col = next((c for c in df.columns if 'team' in c), None)
            college_col = next((c for c in df.columns if 'college' in c), None)
            
            participants = []
            for _, row in df.iterrows():
                participant = {
                    'name': row.get(name_col, 'Participant') if name_col else 'Participant',
                    'email': row.get(email_col, '') if email_col else '',
                    'role': row.get(role_col, 'Participant') if role_col else 'Participant',
                    'team': row.get(team_col, '') if team_col else '',
                    'college': row.get(college_col, '') if college_col else ''
                }
                
                # Validate email
                if participant['email'] and CSVParser.validate_email(participant['email']):
                    participants.append(participant)
            
            return participants
            
        except Exception as e:
            raise Exception(f"Failed to parse file: {str(e)}")
    
    @staticmethod
    def segment_by_role(participants: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Segment participants by role"""
        segments = {}
        for p in participants:
            role = p.get('role', 'Participant')
            if role not in segments:
                segments[role] = []
            segments[role].append(p)
        return segments
    
    @staticmethod
    def personalize_email(template: str, participant: Dict[str, Any]) -> str:
        """Personalize email template for a participant"""
        personalized = template
        for key, value in participant.items():
            placeholder = '{' + key + '}'
            personalized = personalized.replace(placeholder, str(value))
        return personalized
