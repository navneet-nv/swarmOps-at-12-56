from motor.motor_asyncio import AsyncIOMotorClient
import os
from fastapi import Request
from memory.swarm_memory import SwarmMemory
from orchestrator.swarm_controller import SwarmOrchestrator

# Global variables to hold instances so they can be reused
_db_client = None
_db = None
_memory = None
_orchestrator = None

async def init_db():
    global _db_client, _db, _memory, _orchestrator
    if _db_client is None:
        mongo_url = os.environ['MONGO_URL']
        _db_client = AsyncIOMotorClient(mongo_url)
        _db = _db_client[os.environ['DB_NAME']]
        _memory = SwarmMemory(_db)
        _orchestrator = SwarmOrchestrator(_db, _memory)
    
async def close_db():
    global _db_client
    if _db_client is not None:
        _db_client.close()

def get_db():
    if _db is None:
        raise RuntimeError("Database not initialized")
    return _db

def get_swarm_memory() -> SwarmMemory:
    if _memory is None:
        raise RuntimeError("Memory module not initialized")
    return _memory

def get_orchestrator() -> SwarmOrchestrator:
    if _orchestrator is None:
        raise RuntimeError("Orchestrator not initialized")
    return _orchestrator
