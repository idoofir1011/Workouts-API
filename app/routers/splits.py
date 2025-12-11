from ..schemas import SplitOut, SplitBase, SplitUpdate
from .. import models, oauth2
from fastapi import FastAPI, HTTPException, status, APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from typing import List, Optional
from sqlalchemy import func

router = APIRouter(prefix="/splits", tags=["Splits"])


@router.get("/", response_model=List[SplitOut])
def get_splits_all(
    db: Session = Depends(get_db),
    limit: int = 10,
    skip: int = 0,
    search: Optional[str] = "",
):
    splits = (
        db.query(models.Split)
        .filter(models.Split.name.contains(search))
        .order_by(models.Split.id)
        .limit(limit)
        .offset(skip)
        .all()
    )
    return splits


@router.get("/{split_id}", response_model=SplitOut)
def get_split(split_id: int, db: Session = Depends(get_db)):
    split = db.query(models.Split).filter(models.Split.id == split_id).first()

    if not split:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Split with id {split_id} not found",
        )
    return split


@router.post("/", response_model=SplitOut, status_code=status.HTTP_201_CREATED)
def create_split(
    split: SplitBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    new_split = models.Split(owner_id=current_user.id, **split.model_dump())
    db.add(new_split)
    db.commit()
    db.refresh(new_split)
    return new_split


@router.put("/{split_id}", response_model=SplitOut)
def update_split(
    split_id: int,
    split: SplitUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    db_split = db.query(models.Split).filter(models.Split.id == split_id)
    existing_split = db_split.first()
    if not existing_split:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Split with id {split_id} not found",
        )
    if existing_split.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to preform this action!",
        )
    db_split.update(split.model_dump(), synchronize_session=False)
    db.commit()
    updated_split = db_split.first()
    return updated_split


@router.delete("/{split_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_split(
    split_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    db_split = db.query(models.Split).filter(models.Split.id == split_id)
    split = db_split.first()
    if not split:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Split with id {split_id} not found",
        )
    if split.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to preform this action!",
        )
    db.delete(split)
    db.commit()
    return None
