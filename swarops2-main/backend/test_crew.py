import asyncio
from crewai import Agent, Task, Crew, Process

def test_crew():
    strategist = Agent(
        role='Content Strategist',
        goal='Say hi.',
        backstory='You are friendly.',
        verbose=True,
        allow_delegation=False
    )
    
    task = Task(
        description='Say Hello World.',
        expected_output="Just 'Hello World'",
        agent=strategist
    )
    
    crew = Crew(
        agents=[strategist],
        tasks=[task],
        process=Process.sequential,
    )
    result = crew.kickoff()
    print(result.raw)

test_crew()
