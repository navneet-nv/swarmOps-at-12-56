import requests
import sys
import json
import io
import time
from datetime import datetime

class SwarmOpsAPITester:
    def __init__(self, base_url="https://ops-command-42.preview.swarmopsagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.event_id = "event_test_001"
        self.user_id = "user_test_001"

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)

            print(f"   Status: {response.status_code}")
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {"message": "Non-JSON response"}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_details = response.json()
                    print(f"   Error details: {error_details}")
                except:
                    print(f"   Response text: {response.text[:200]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_and_basic_endpoints(self):
        """Test basic health endpoints"""
        print("\n=== Testing Basic Health Endpoints ===")
        
        # Test root endpoint
        self.run_test("Root endpoint", "GET", "", 200)
        
        # Test health endpoint
        success, response = self.run_test("Health check", "GET", "health", 200)
        if success:
            agents = response.get('agents', [])
            expected_agents = ["content", "email", "scheduler", "budget", "volunteer"]
            if set(agents) == set(expected_agents):
                print(f"✅ All 5 agents found in health response: {agents}")
            else:
                print(f"❌ Expected agents {expected_agents}, got {agents}")
        
        return success

    def test_event_operations(self):
        """Test event creation and retrieval"""
        print("\n=== Testing Event Operations ===")
        
        # Create event
        event_data = {
            "name": "Test Tech Summit",
            "description": "A test event for API testing",
            "user_id": self.user_id
        }
        success, response = self.run_test("Create Event", "POST", "events", 200, event_data)
        
        if success:
            self.event_id = response.get('event_id', self.event_id)
            print(f"   Created event with ID: {self.event_id}")
        
        # Get events for user
        self.run_test("Get User Events", "GET", f"events/{self.user_id}", 200)
        
        return success

    def test_content_agent(self):
        """Test Content Strategist Agent"""
        print("\n=== Testing Content Strategist Agent ===")
        
        # Generate content
        content_request = {
            "event_id": self.event_id,
            "prompt": "We are hosting a 3-day AI hackathon with 300 participants, featuring workshops on machine learning, blockchain, and IoT. Prize pool of $50,000.",
            "user_id": self.user_id
        }
        success, response = self.run_test("Generate Content", "POST", "agent/content/generate", 200, content_request)
        
        content_id = None
        if success:
            content_id = response.get('data', {}).get('content_id')
            print(f"   Generated content with ID: {content_id}")
            
            # Check if promo_copy and social_posts exist
            data = response.get('data', {})
            if 'promo_copy' in data and 'social_posts' in data:
                print(f"✅ Content contains promo_copy and social_posts")
            else:
                print(f"❌ Missing promo_copy or social_posts in response")
        
        # Get content for event
        self.run_test("Get Content History", "GET", f"agent/content/{self.event_id}", 200)
        
        # Approve content if generated successfully
        if content_id:
            approval_data = {"content_id": content_id}
            self.run_test("Approve Content", "POST", "agent/content/approve", 200, approval_data)
        
        return success

    def test_email_agent(self):
        """Test Email Agent with file upload"""
        print("\n=== Testing Email Agent ===")
        
        # Create test CSV content
        csv_content = """Name,Email,Role,Team
John Doe,john@example.com,Participant,Team Alpha
Jane Smith,jane@example.com,Mentor,Team Beta
Bob Johnson,bob@example.com,Judge,Team Gamma"""
        
        # Test file upload
        files = {
            'file': ('test_participants.csv', io.StringIO(csv_content), 'text/csv')
        }
        data = {
            'event_id': self.event_id,
            'user_id': self.user_id
        }
        
        success, response = self.run_test("Upload Registration File", "POST", "agent/email/upload", 200, data, files)
        
        registration_id = None
        if success:
            registration_id = response.get('data', {}).get('registration_id')
            print(f"   Created registration with ID: {registration_id}")
            
            # Check participant count
            participant_count = response.get('data', {}).get('total_count', 0)
            if participant_count > 0:
                print(f"✅ Processed {participant_count} participants")
            else:
                print(f"❌ No participants processed")
        
        # Get registrations
        self.run_test("Get Registrations", "GET", f"agent/email/registrations/{self.event_id}", 200)
        
        # Test bulk email sending if registration was successful
        if registration_id:
            email_data = {
                "event_id": self.event_id,
                "registration_id": registration_id,
                "subject": "Welcome to our AI Hackathon!",
                "template": "Hello {name}, welcome to our event! You're registered as a {role} in {team}.",
                "role_filter": None
            }
            self.run_test("Send Bulk Emails", "POST", "agent/email/send-bulk", 200, email_data)
        
        # Get campaigns
        self.run_test("Get Email Campaigns", "GET", f"agent/email/campaigns/{self.event_id}", 200)
        
        return success

    def test_scheduler_agent(self):
        """Test Scheduler Agent"""
        print("\n=== Testing Scheduler Agent ===")
        
        # Create schedule
        schedule_data = {
            "event_id": self.event_id,
            "sessions": [
                {
                    "session_id": "session_1",
                    "name": "Opening Keynote",
                    "speaker": "Dr. AI Expert",
                    "room": "Main Hall",
                    "duration": 60
                },
                {
                    "session_id": "session_2", 
                    "name": "ML Workshop",
                    "speaker": "Prof. Machine Learning",
                    "room": "Lab 1",
                    "duration": 120
                },
                {
                    "session_id": "session_3",
                    "name": "Blockchain Panel",
                    "speaker": "Blockchain Guru",
                    "room": "Conference Room A",
                    "duration": 90
                }
            ],
            "user_id": self.user_id
        }
        
        success, response = self.run_test("Create Schedule", "POST", "agent/scheduler/create", 200, schedule_data)
        
        schedule_id = None
        if success:
            schedule_id = response.get('data', {}).get('schedule_id')
            print(f"   Created schedule with ID: {schedule_id}")
            
            # Check if sessions were scheduled
            sessions = response.get('data', {}).get('sessions', [])
            if len(sessions) > 0:
                print(f"✅ Scheduled {len(sessions)} sessions")
            else:
                print(f"❌ No sessions in schedule response")
        
        # Get schedules
        self.run_test("Get Schedules", "GET", f"agent/scheduler/{self.event_id}", 200)
        
        # Test conflict resolution if schedule was created
        if schedule_id:
            conflict_data = {
                "event_id": self.event_id,
                "schedule_id": schedule_id,
                "new_constraint": {
                    "type": "room_conflict",
                    "room": "Main Hall",
                    "blocked_time": "10:00-11:00"
                }
            }
            self.run_test("Resolve Conflicts", "POST", "agent/scheduler/resolve", 200, conflict_data)
        
        return success

    def test_budget_agent(self):
        """Test Budget Agent"""
        print("\n=== Testing Budget Agent ===")
        
        # Create budget
        budget_data = {
            "event_id": self.event_id,
            "categories": [
                {"name": "Venue", "allocated": 5000},
                {"name": "Catering", "allocated": 3000},
                {"name": "Prizes", "allocated": 2000},
                {"name": "Marketing", "allocated": 1000}
            ],
            "user_id": self.user_id
        }
        
        success, response = self.run_test("Create Budget", "POST", "agent/budget/create", 200, budget_data)
        
        budget_id = None
        if success:
            budget_id = response.get('data', {}).get('budget_id')
            total_allocated = response.get('data', {}).get('total_allocated', 0)
            print(f"   Created budget with ID: {budget_id}, Total: ${total_allocated}")
            
            if total_allocated == 11000:  # 5000+3000+2000+1000
                print(f"✅ Budget calculation correct: ${total_allocated}")
            else:
                print(f"❌ Budget calculation incorrect, expected $11000, got ${total_allocated}")
        
        # Get budgets
        self.run_test("Get Budgets", "GET", f"agent/budget/{self.event_id}", 200)
        
        # Add expenses if budget was created
        if budget_id:
            expenses = [
                {"budget_id": budget_id, "category": "Venue", "amount": 4500, "description": "Convention center rental"},
                {"budget_id": budget_id, "category": "Catering", "amount": 2800, "description": "Lunch and snacks"},
                {"budget_id": budget_id, "category": "Prizes", "amount": 2200, "description": "Winner prizes - overrun!"}
            ]
            
            for expense in expenses:
                success_exp, response_exp = self.run_test(f"Add Expense - {expense['description']}", "POST", "agent/budget/expense", 200, expense)
                if success_exp:
                    overrun = response_exp.get('overrun', False)
                    if overrun:
                        print(f"   ⚠️  Budget overrun detected for {expense['category']}")
        
        return success

    def test_volunteer_agent(self):
        """Test Volunteer Agent"""
        print("\n=== Testing Volunteer Agent ===")
        
        # Create test CSV content for volunteers
        csv_content = """Name,Email,Skills,Availability
Alice Wonder,alice@example.com,"Python,JavaScript,AI",Weekends
Bob Builder,bob@builder.com,"Java,Docker,DevOps",Full-time
Charlie Coder,charlie@code.com,"React,Node.js,Database",Evenings
Diana Dev,diana@dev.com,"Machine Learning,Python,Statistics",Weekends"""
        
        # Test volunteer file upload
        files = {
            'file': ('test_volunteers.csv', io.StringIO(csv_content), 'text/csv')
        }
        data = {
            'event_id': self.event_id,
            'user_id': self.user_id
        }
        
        success, response = self.run_test("Upload Volunteers", "POST", "agent/volunteer/upload", 200, data, files)
        
        volunteer_pool_id = None
        if success:
            volunteer_pool_id = response.get('data', {}).get('volunteer_pool_id')
            volunteer_count = response.get('data', {}).get('total_count', 0)
            print(f"   Created volunteer pool with ID: {volunteer_pool_id}")
            
            if volunteer_count > 0:
                print(f"✅ Processed {volunteer_count} volunteers")
            else:
                print(f"❌ No volunteers processed")
        
        # Get volunteers
        self.run_test("Get Volunteers", "GET", f"agent/volunteer/{self.event_id}", 200)
        
        # Test task assignment if volunteers were uploaded
        if volunteer_pool_id:
            assignment_data = {
                "event_id": self.event_id,
                "volunteer_pool_id": volunteer_pool_id,
                "tasks": [
                    {"name": "Setup Registration Desk", "required_skills": ["Customer Service"]},
                    {"name": "Technical Support", "required_skills": ["Python", "JavaScript"]},
                    {"name": "AI Workshop Assistant", "required_skills": ["AI", "Machine Learning"]},
                    {"name": "Infrastructure Setup", "required_skills": ["Docker", "DevOps"]}
                ]
            }
            success_assign, response_assign = self.run_test("Assign Volunteers", "POST", "agent/volunteer/assign", 200, assignment_data)
            
            if success_assign:
                assignments = response_assign.get('assignments', [])
                print(f"   ✅ Made {len(assignments)} task assignments")
        
        return success

    def test_activity_feed(self):
        """Test Activity Feed"""
        print("\n=== Testing Activity Feed ===")
        
        # Get latest activities
        success, response = self.run_test("Get Latest Activities", "GET", "activities/latest?limit=10", 200)
        
        if success:
            activities = response if isinstance(response, list) else []
            print(f"   Found {len(activities)} activities in feed")
            
            # Check if we have activities from our tests
            agents_found = set()
            for activity in activities:
                if activity.get('event_id') == self.event_id:
                    agent_name = activity.get('agent', '')
                    agents_found.add(agent_name)
            
            if len(agents_found) > 0:
                print(f"   ✅ Found activities from agents: {list(agents_found)}")
            else:
                print(f"   ⚠️  No activities found for test event {self.event_id}")
        
        # Get event-specific activities
        self.run_test("Get Event Activities", "GET", f"activities/{self.event_id}", 200)
        
        return success

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting SwarmOps API Test Suite")
        print(f"Testing against: {self.base_url}")
        print("="*60)
        
        # Test in logical order
        health_ok = self.test_health_and_basic_endpoints()
        
        if not health_ok:
            print("\n❌ Health check failed - stopping tests")
            return False
        
        event_ok = self.test_event_operations()
        content_ok = self.test_content_agent()
        email_ok = self.test_email_agent()  
        scheduler_ok = self.test_scheduler_agent()
        budget_ok = self.test_budget_agent()
        volunteer_ok = self.test_volunteer_agent()
        activity_ok = self.test_activity_feed()
        
        # Print final results
        print("\n" + "="*60)
        print(f"📊 TEST RESULTS")
        print(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        critical_tests = [health_ok, event_ok, content_ok, email_ok, scheduler_ok, budget_ok, volunteer_ok]
        critical_passed = sum(critical_tests)
        
        print(f"\n🎯 AGENT STATUS:")
        print(f"✅ Health & Events: {'PASS' if health_ok and event_ok else 'FAIL'}")
        print(f"✅ Content Agent: {'PASS' if content_ok else 'FAIL'}")
        print(f"✅ Email Agent: {'PASS' if email_ok else 'FAIL'}")
        print(f"✅ Scheduler Agent: {'PASS' if scheduler_ok else 'FAIL'}")
        print(f"✅ Budget Agent: {'PASS' if budget_ok else 'FAIL'}")
        print(f"✅ Volunteer Agent: {'PASS' if volunteer_ok else 'FAIL'}")
        print(f"✅ Activity Feed: {'PASS' if activity_ok else 'FAIL'}")
        
        overall_success = critical_passed >= 5  # At least 5 out of 7 critical areas working
        
        if overall_success:
            print(f"\n🎉 OVERALL: SUCCESS - {critical_passed}/7 critical areas working")
        else:
            print(f"\n❌ OVERALL: FAILED - Only {critical_passed}/7 critical areas working")
        
        return overall_success

def main():
    tester = SwarmOpsAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test suite crashed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())