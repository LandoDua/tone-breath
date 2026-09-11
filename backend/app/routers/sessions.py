from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class SessionCreate(BaseModel):
    routine_type: str
    duration_seconds: int
    completion_percentage: float = 0.0
    started_at: datetime


class SessionResponse(BaseModel):
    id: str
    user_id: str
    routine_type: str
    duration_seconds: int
    completion_percentage: float
    started_at: str
    completed_at: str | None = None


@router.post("/", response_model=SessionResponse)
async def create_session(req: SessionCreate):
    # TODO: Implement Supabase insert
    return SessionResponse(
        id="session-001",
        user_id="dev-user-000",
        routine_type=req.routine_type,
        duration_seconds=req.duration_seconds,
        completion_percentage=req.completion_percentage,
        started_at=req.started_at.isoformat(),
    )


@router.get("/", response_model=list[SessionResponse])
async def list_sessions():
    # TODO: Implement Supabase query
    return []


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    # TODO: Implement Supabase query
    return SessionResponse(
        id=session_id,
        user_id="dev-user-000",
        routine_type="coherent",
        duration_seconds=300,
        completion_percentage=1.0,
        started_at="2026-01-01T00:00:00Z",
    )
