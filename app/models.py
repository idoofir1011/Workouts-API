from sqlalchemy import String, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    splits: Mapped[list["Split"]] = relationship(back_populates="owner")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class Split(Base):
    __tablename__ = "split"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    split_kind: Mapped[str] = mapped_column(String, nullable=False)  # Push, Pull, Legs
    description: Mapped[str] = mapped_column(String, nullable=False)
    owner_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    owner: Mapped["User"] = relationship(back_populates="splits")
    workouts: Mapped[list["Workout"]] = relationship(back_populates="split")


class Workout(Base):
    __tablename__ = "workout"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    sets: Mapped[int] = mapped_column(Integer, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    weight: Mapped[int] = mapped_column(Integer, nullable=False)
    split_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("split.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    split: Mapped["Split"] = relationship(back_populates="workouts")
