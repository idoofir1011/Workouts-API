from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from .. import database, schemas, models, oauth2, utils

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register", response_model=schemas.UserCreate, status_code=status.HTTP_201_CREATED
)
def register(
    user_data: schemas.UserCreate,
    db: Session = Depends(database.get_db),
):
    existing_email = (
        db.query(models.User).filter(models.User.email == user_data.email).first()
    )
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Email already exists"
        )

    existing_username = (
        db.query(models.User).filter(models.User.username == user_data.username).first()
    )
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Username already exists"
        )

    hashed_password = utils.hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        created_at=datetime.utcnow(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == user_credentials.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="invalid credentials"
        )
    if not utils.verify(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="invalid credentials"
        )
    access_token = oauth2.create_access_token(data={"user_id": user.id})

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(oauth2.get_current_user)):
    return current_user
