@echo off
echo =======================================================
echo SwarmOps Startup Script
echo =======================================================

echo Starting Backend Server (FastAPI)...
start "Backend (FastAPI)" cmd /c "cd backend && call venv\Scripts\activate && uvicorn server:app --reload --port 8001"

echo Starting Frontend Server (React)...
start "Frontend (React)" cmd /c "cd frontend && yarn start"

echo.
echo Servers are starting in separate windows.
echo - Backend: http://localhost:8001
echo - Frontend: http://localhost:3000 (usually)
echo.
echo NOTE: Ensure MongoDB is running locally on port 27017, otherwise the backend will fail to connect.
pause
