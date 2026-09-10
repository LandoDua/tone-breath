from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class EmotionDimensions(BaseModel):
    calma: int = 0
    ansiedad: int = 0
    energia: int = 0
    tristeza: int = 0
    estres: int = 0
    apertura: int = 0


class EmotionCreate(BaseModel):
    session_id: str | None = None
    type: str  # 'before', 'after', 'free'
    dimensions: EmotionDimensions


class EmotionResponse(BaseModel):
    id: str
    user_id: str
    session_id: str | None
    type: str
    dimensions: EmotionDimensions
    dominant_emotion: str
    recorded_at: str


@router.post("/", response_model=EmotionResponse)
async def create_emotion(req: EmotionCreate):
    # TODO: Implement Supabase insert
    dominant = max(req.dimensions.model_dump(), key=lambda k: getattr(req.dimensions, k))
    return EmotionResponse(
        id="emotion-001",
        user_id="dev-user-000",
        session_id=req.session_id,
        type=req.type,
        dimensions=req.dimensions,
        dominant_emotion=dominant,
        recorded_at="2026-01-01T00:00:00Z",
    )


@router.get("/", response_model=list[EmotionResponse])
async def list_emotions():
    # TODO: Implement Supabase query
    return []


@router.get("/calendar")
async def get_calendar(year: int, month: int):
    # TODO: Implement Supabase query
    return {"days": [], "streak": 0, "total_entries": 0}
