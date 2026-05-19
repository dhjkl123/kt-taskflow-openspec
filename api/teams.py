from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Team
from schemas import TeamCreate, TeamResponse, TeamJoin, MemberResponse
from auth import get_current_user
from utils import generate_invite_code
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/teams", tags=["teams"])

def check_team_membership(team_id: int, current_user: User, db: Session) -> Team:
    """Verify user is a member of the team"""
    if current_user.team_id != team_id:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("", response_model=TeamResponse)
async def create_team(team_data: TeamCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new team"""
    # Generate unique invite code
    while True:
        invite_code = generate_invite_code()
        existing = db.query(Team).filter(Team.invite_code == invite_code).first()
        if not existing:
            break

    team = Team(
        name=team_data.name,
        invite_code=invite_code,
        owner_id=current_user.id
    )
    db.add(team)
    db.flush()  # Get team.id before commit

    # Set user's team_id
    current_user.team_id = team.id
    db.commit()
    db.refresh(team)

    logger.info(f"Team {team.id} created by user {current_user.id} with code {invite_code}")
    return team

@router.get("", response_model=list[TeamResponse])
async def list_teams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List user's teams (MVP: only 1 team per user)"""
    if not current_user.team_id:
        return []

    team = db.query(Team).filter(Team.id == current_user.team_id).first()
    if not team:
        return []

    return [team]

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get team details"""
    team = check_team_membership(team_id, current_user, db)
    return team

@router.post("/join", response_model=dict)
async def join_team(join_data: TeamJoin, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Join a team using invite code"""
    # Find team by invite code (case-insensitive)
    team = db.query(Team).filter(Team.invite_code.ilike(join_data.invite_code)).first()

    if not team:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    # Check if user is already a member
    if current_user.team_id == team.id:
        raise HTTPException(status_code=409, detail="Already a member of this team")

    # Update user's team
    current_user.team_id = team.id
    db.commit()

    logger.info(f"User {current_user.id} joined team {team.id}")
    return {"message": "Joined team successfully", "team_id": team.id}

@router.get("/{team_id}/members", response_model=list[MemberResponse])
async def get_team_members(team_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get team members"""
    team = check_team_membership(team_id, current_user, db)

    members = db.query(User).filter(User.team_id == team_id).all()
    return members
