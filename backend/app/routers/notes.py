from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class NoteCreate(BaseModel):
    session_id: str | None = None
    emotion_entry_id: str | None = None
    content: str | None = None
    tags: list[str] = []
    is_pinned: bool = False


class NoteUpdate(BaseModel):
    content: str | None = None
    tags: list[str] | None = None
    is_pinned: bool | None = None


class NoteResponse(BaseModel):
    id: str
    user_id: str
    session_id: str | None
    emotion_entry_id: str | None
    type: str
    content: str | None
    tags: list[str]
    is_pinned: bool
    created_at: str
    updated_at: str


@router.post("/", response_model=NoteResponse)
async def create_note(req: NoteCreate):
    # TODO: Implement Supabase insert
    note_type = "session" if req.session_id else "free"
    return NoteResponse(
        id="note-001",
        user_id="dev-user-000",
        session_id=req.session_id,
        emotion_entry_id=req.emotion_entry_id,
        type=note_type,
        content=req.content,
        tags=req.tags,
        is_pinned=req.is_pinned,
        created_at="2026-01-01T00:00:00Z",
        updated_at="2026-01-01T00:00:00Z",
    )


@router.get("/", response_model=list[NoteResponse])
async def list_notes():
    # TODO: Implement Supabase query
    return []


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str):
    # TODO: Implement Supabase query
    return NoteResponse(
        id=note_id,
        user_id="dev-user-000",
        session_id=None,
        emotion_entry_id=None,
        type="free",
        content="Test note",
        tags=[],
        is_pinned=False,
        created_at="2026-01-01T00:00:00Z",
        updated_at="2026-01-01T00:00:00Z",
    )
