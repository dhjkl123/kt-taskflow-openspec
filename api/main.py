import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import User, Team, Task, Message
from .auth import router as auth_router
from .teams import router as teams_router
from .tasks_api import router as tasks_router
from .messages_api import router as messages_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="TaskFlow API", version="1.0.0")

# Add CORS middleware (must be before routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost", "http://127.0.0.1", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(teams_router)
app.include_router(tasks_router)
app.include_router(messages_router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

logger.info("TaskFlow API started")
