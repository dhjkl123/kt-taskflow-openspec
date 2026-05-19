from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from .models import TaskStatus

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class UserResponse(BaseModel):
    id: int
    email: str
    team_id: Optional[int]

    class Config:
        from_attributes = True

# Team Schemas
class TeamCreate(BaseModel):
    name: str

class TeamResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TeamJoin(BaseModel):
    invite_code: str

class MemberResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    assignee_id: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

class TaskResponse(BaseModel):
    id: int
    team_id: int
    title: str
    status: TaskStatus
    creator_id: int
    assignee_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# Message Schemas
class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    team_id: int
    user_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
