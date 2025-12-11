from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# -----------------
# Models
# -----------------


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class SplitBase(BaseModel):
    name: str
    description: Optional[str] = None
    model_config = {"from_attributes": True}


class SplitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class SplitOut(SplitBase):
    id: int
    owner_id: int
    created_at: datetime
    owner: UserOut
    model_config = {"from_attributes": True}


class WorkoutBase(BaseModel):
    name: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[int] = None
    model_config = {"from_attributes": True}


class WorkoutUpdate(WorkoutBase):
    name: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[int] = None


class WorkoutOut(WorkoutBase):
    id: int
    owner_id: int
    split_id: int
    created_at: datetime
    owner: UserOut
    model_config = {"from_attributes": True}


class SplitAndWorkouts(SplitOut):
    workouts: list[WorkoutOut] = []


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
