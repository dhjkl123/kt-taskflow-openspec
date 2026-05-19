from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from utils import hash_password, verify_password, create_access_token, decode_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """Extract current user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")
    try:
        payload = decode_token(token)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create new user
    password_hash = hash_password(user_data.password)
    user = User(email=user_data.email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(f"User {user.id} registered with email {user.email}")
    return user

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token, expires_in = create_access_token(user.id, user.team_id)
    logger.info(f"User {user.id} logged in")
    return TokenResponse(access_token=token, expires_in=expires_in)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout (stateless - client removes token)"""
    logger.info(f"User {current_user.id} logged out")
    return {"message": "Logged out successfully"}
