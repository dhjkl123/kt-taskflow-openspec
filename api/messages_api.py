from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Team, Message
from schemas import MessageCreate, MessageResponse
from auth import get_current_user
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["messages"])

def check_team_membership(team_id: int, current_user: User, db: Session) -> Team:
    """Verify user is a member of the team"""
    if current_user.team_id != team_id:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("/teams/{team_id}/messages", response_model=MessageResponse)
async def send_message(team_id: int, msg_data: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Send a message to team"""
    team = check_team_membership(team_id, current_user, db)

    # Validate content length (1-1000 chars)
    if not msg_data.content or len(msg_data.content) > 1000:
        raise HTTPException(status_code=400, detail="Message must be 1-1000 characters")

    message = Message(
        team_id=team_id,
        user_id=current_user.id,
        content=msg_data.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    logger.info(f"Message {message.id} sent by user {current_user.id} in team {team_id}")
    return message

@router.get("/teams/{team_id}/messages", response_model=list[MessageResponse])
async def get_messages(team_id: int, since: str = Query(None), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get team messages (optionally since timestamp)"""
    team = check_team_membership(team_id, current_user, db)

    query = db.query(Message).filter(Message.team_id == team_id)

    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
            query = query.filter(Message.created_at > since_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid timestamp format")

    messages = query.order_by(Message.created_at).all()
    return messages

@router.delete("/messages/{message_id}")
async def delete_message(message_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a message (author only)"""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    # Check if user is team member
    check_team_membership(message.team_id, current_user, db)

    # Check if user is author
    if current_user.id != message.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")

    db.delete(message)
    db.commit()

    logger.info(f"Message {message_id} deleted by user {current_user.id}")
    return {"message": "Message deleted"}
