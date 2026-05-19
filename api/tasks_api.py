from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from .models import User, Team, Task, TaskStatus
from .schemas import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskResponse
from .auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["tasks"])

def check_team_membership(team_id: int, current_user: User, db: Session) -> Team:
    """Verify user is a member of the team"""
    if current_user.team_id != team_id:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("/teams/{team_id}/tasks", response_model=TaskResponse)
async def create_task(team_id: int, task_data: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new task"""
    team = check_team_membership(team_id, current_user, db)

    task = Task(
        team_id=team_id,
        title=task_data.title,
        status=TaskStatus.TODO,
        creator_id=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    logger.info(f"Task {task.id} created in team {team_id} by user {current_user.id}")
    return task

@router.get("/teams/{team_id}/tasks", response_model=list[TaskResponse])
async def list_tasks(team_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all tasks for a team"""
    team = check_team_membership(team_id, current_user, db)

    tasks = db.query(Task).filter(Task.team_id == team_id).order_by(Task.created_at).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get task details"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    check_team_membership(task.team_id, current_user, db)
    return task

@router.patch("/tasks/{task_id}/status", response_model=TaskResponse)
async def update_task_status(task_id: int, status_data: TaskStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update task status (drag-drop)"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    check_team_membership(task.team_id, current_user, db)

    # Validate status
    try:
        task.status = status_data.status
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status value")

    db.commit()
    db.refresh(task)

    logger.info(f"Task {task_id} status updated to {status_data.status}")
    return task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_data: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update task title or assignee"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    check_team_membership(task.team_id, current_user, db)

    if task_data.title:
        task.title = task_data.title
    if task_data.assignee_id is not None:
        task.assignee_id = task_data.assignee_id

    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete task (creator or owner only)"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    team = check_team_membership(task.team_id, current_user, db)

    # Check permission: creator or team owner
    if current_user.id != task.creator_id and current_user.id != team.owner_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")

    db.delete(task)
    db.commit()

    logger.info(f"Task {task_id} deleted by user {current_user.id}")
    return {"message": "Task deleted"}
