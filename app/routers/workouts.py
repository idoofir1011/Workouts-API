from ..schemas import (
    SplitOut,
    SplitBase,
    SplitUpdate,
    WorkoutBase,
    WorkoutOut,
    WorkoutUpdate,
    SplitAndWorkouts,
)
from .. import models, oauth2
from fastapi import HTTPException, status, APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from typing import List, Optional
from sqlalchemy import func

router = APIRouter(prefix="/splits/{split_id}/workouts", tags=["Workouts"])


@router.get("/", response_model=List[WorkoutOut])
def get_workouts_all(
    db: Session = Depends(get_db),
    limit: int = 10,
    skip: int = 0,
    search: Optional[str] = "",
):
    workouts = (
        db.query(models.Workout)
        .filter(models.Workout.name.contains(search))
        .order_by(models.Workout.id)
        .limit(limit)
        .offset(skip)
        .all()
    )
    return workouts


@router.get("/{workout_id}", response_model=WorkoutOut)
def get_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout with id {workout_id} not found",
        )
    return workout


@router.post("/", response_model=WorkoutOut, status_code=status.HTTP_201_CREATED)
def create_workout(
    workout: WorkoutBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    new_workout = models.Workout(owner_id=current_user.id, **workout.model_dump())
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    return new_workout


@router.put("/{workout_id   }", response_model=WorkoutOut)
def update_workout(
    workout_id: int,
    workout: WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    db_workout = db.query(models.Workout).filter(models.Workout.id == workout_id)
    existing_workout = db_workout.first()
    if not existing_workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout with id {workout_id} not found",
        )
    if existing_workout.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to preform this action!",
        )
    db_workout.update(workout.model_dump(), synchronize_session=False)
    db.commit()
    updated_workout = db_workout.first()
    return updated_workout


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    db_workout = db.query(models.Workout).filter(models.Workout.id == workout_id)
    workout = db_workout.first()
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout with id {workout_id} not found",
        )
    if workout.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to preform this action!",
        )
    db.delete(workout)
    db.commit()
    return None
