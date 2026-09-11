from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    # TODO: Implement Supabase Auth
    return TokenResponse(
        access_token="dev-token-123",
        user_id="dev-user-000",
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    # TODO: Implement Supabase Auth
    return TokenResponse(
        access_token="dev-token-123",
        user_id="dev-user-000",
    )


@router.get("/me")
async def get_me():
    # TODO: Implement JWT validation
    return {"id": "dev-user-000", "email": "dev@tonebreath.local"}
