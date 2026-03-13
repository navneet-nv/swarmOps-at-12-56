import re

with open('README.md', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "LangGraph-orchestrated": "CrewAI-orchestrated",
    "LangGraph Orchestration": "CrewAI Orchestration",
    "StateGraph Implementation": "CrewAI Implementation",
    "LangGraph + LangChain": "CrewAI",
    "LangGraph State Flow": "CrewAI Workflow",
    "LangGraph TypedDict": "CrewAI State",
    "LangGraph StateGraph": "CrewAI Crew",
    "LangGraph": "CrewAI"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced successfully")
