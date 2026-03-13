from datetime import datetime, time
from typing import List, Dict, Tuple, Any

class ConflictChecker:
    """Tool for detecting schedule conflicts"""
    
    @staticmethod
    def parse_time(time_str: str) -> datetime:
        """Parse time string to datetime"""
        try:
            # Try HH:MM format
            return datetime.strptime(time_str, "%H:%M")
        except:
            try:
                # Try HH:MM:SS format
                return datetime.strptime(time_str, "%H:%M:%S")
            except:
                # Default to 00:00
                return datetime.strptime("00:00", "%H:%M")
    
    @staticmethod
    def times_overlap(start1: str, end1: str, start2: str, end2: str) -> bool:
        """Check if two time ranges overlap"""
        s1 = ConflictChecker.parse_time(start1)
        e1 = ConflictChecker.parse_time(end1)
        s2 = ConflictChecker.parse_time(start2)
        e2 = ConflictChecker.parse_time(end2)
        
        # Check overlap: start1 < end2 AND start2 < end1
        return s1 < e2 and s2 < e1
    
    @staticmethod
    def detect_conflicts(sessions: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[str]]:
        """Detect conflicts in schedule"""
        conflicts = []
        conflict_details = []
        
        for i in range(len(sessions)):
            for j in range(i + 1, len(sessions)):
                session1 = sessions[i]
                session2 = sessions[j]
                
                # Check for room conflict
                if session1.get('room') == session2.get('room'):
                    if ConflictChecker.times_overlap(
                        session1.get('start_time', '00:00'),
                        session1.get('end_time', '00:00'),
                        session2.get('start_time', '00:00'),
                        session2.get('end_time', '00:00')
                    ):
                        conflict = {
                            'type': 'room_conflict',
                            'session1': session1.get('name'),
                            'session2': session2.get('name'),
                            'room': session1.get('room'),
                            'time_range': f"{session1.get('start_time')} - {session1.get('end_time')}"
                        }
                        conflicts.append(conflict)
                        conflict_details.append(
                            f"Room conflict: {session1.get('name')} and {session2.get('name')} "
                            f"both in {session1.get('room')} during overlapping times"
                        )
                
                # Check for speaker conflict
                if session1.get('speaker') == session2.get('speaker'):
                    if ConflictChecker.times_overlap(
                        session1.get('start_time', '00:00'),
                        session1.get('end_time', '00:00'),
                        session2.get('start_time', '00:00'),
                        session2.get('end_time', '00:00')
                    ):
                        conflict = {
                            'type': 'speaker_conflict',
                            'session1': session1.get('name'),
                            'session2': session2.get('name'),
                            'speaker': session1.get('speaker'),
                            'time_range': f"{session1.get('start_time')} - {session1.get('end_time')}"
                        }
                        conflicts.append(conflict)
                        conflict_details.append(
                            f"Speaker conflict: {session1.get('speaker')} "
                            f"scheduled for {session1.get('name')} and {session2.get('name')} at overlapping times"
                        )
                
                # Check for volunteer conflict
                if session1.get('volunteer') and session1.get('volunteer') == session2.get('volunteer'):
                    if ConflictChecker.times_overlap(
                        session1.get('start_time', '00:00'),
                        session1.get('end_time', '00:00'),
                        session2.get('start_time', '00:00'),
                        session2.get('end_time', '00:00')
                    ):
                        conflict = {
                            'type': 'volunteer_conflict',
                            'session1': session1.get('name'),
                            'session2': session2.get('name'),
                            'volunteer': session1.get('volunteer'),
                            'time_range': f"{session1.get('start_time')} - {session1.get('end_time')}"
                        }
                        conflicts.append(conflict)
                        conflict_details.append(
                            f"Volunteer conflict: {session1.get('volunteer')} "
                            f"assigned to {session1.get('name')} and {session2.get('name')} at overlapping times"
                        )
        
        return conflicts, conflict_details
    
    @staticmethod
    def suggest_resolution(conflict: Dict[str, Any]) -> str:
        """Suggest resolution for a conflict"""
        if conflict['type'] == 'room_conflict':
            return f"Suggestion: Move one session to a different room or adjust timing"
        elif conflict['type'] == 'speaker_conflict':
            return f"Suggestion: Reschedule one session to a different time slot"
        elif conflict['type'] == 'volunteer_conflict':
            return f"Suggestion: Reassign one session to a different volunteer or shift the time"
        return "Suggestion: Review schedule manually"
