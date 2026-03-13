from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
import os
import sys
import logging
import asyncio

# Fix imports by appending backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment logic
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import the routes and dependencies
from api.routes import api_router
from api.dependencies import init_db, close_db

app = FastAPI(title="SwarmOps Backend", description="Perfect Architecture V2")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize connection to MongoDB and wire dependencies
    logger.info("Initializing SwarmOps core dependencies and database connections...")
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Closing database connections...")
    await close_db()

# Include all the factored out API routes
app.include_router(api_router)
