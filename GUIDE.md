# Workout Plan API - Complete Implementation Guide

## 🎯 What You'll Build

A REST API where users can:
- Register and login (get a JWT token)
- Create workout splits (Push, Pull, Legs, Cardio)
- Add exercises to each split
- View, update, and delete their workout plans
- **Use Alembic for database migrations** (professional approach!)

---

## 📦 Tools You'll Use

### **FastAPI** - Modern Python web framework
### **PostgreSQL** - Database (runs in Docker)
### **Alembic** - Database migrations (track schema changes)
### **Docker** - Containerization
### **Postman** - API testing
- **Download**: https://www.postman.com/downloads/
- **Alternative**: FastAPI's built-in `/docs` page (Swagger UI)

---

## 🛠️ Recommended Development Flow

Here's the **correct order** to build everything:

### **Phase 1: Project Setup** 
- Create folder structure
- Set up configuration files (requirements.txt, .env, .gitignore)

### **Phase 2: Core App Logic**
- Database connection (database.py)
- Models (models.py) 
- Schemas (schemas.py)
- Authentication (auth.py, dependencies.py)
- Routers (auth, splits, workouts)
- Main app (main.py)

### **Phase 3: Docker Setup**
- Dockerfile
- docker-compose.yml
- Start containers

### **Phase 4: Database Migrations (Alembic)**
- Initialize Alembic
- Create initial migration
- Apply migrations

### **Phase 5: Testing**
- Test with Postman or /docs

---

## 🚀 PHASE 1: Project Setup

### Step 1.1: Create Project Structure

**Commands to run**:
```bash
# You're in: c:\Users\idole\Project folder\newfastapi

# Create the app directory and subdirectories
mkdir -p app/routers

# Create all Python files
touch app/__init__.py
touch app/main.py
touch app/database.py
touch app/models.py
touch app/schemas.py
touch app/auth.py
touch app/dependencies.py
touch app/routers/__init__.py
touch app/routers/auth.py
touch app/routers/splits.py
touch app/routers/workouts.py

# Create config files
touch .env
touch .env.example
touch requirements.txt
touch Dockerfile
touch docker-compose.yml
touch README.md
touch .gitignore
```

**What each file does**:
- `database.py` - Database connection setup
- `models.py` - Database tables (User, Split, Workout)
- `schemas.py` - Data validation (Pydantic)
- `auth.py` - Password hashing & JWT tokens
- `dependencies.py` - Reusable helpers (get current user)
- `routers/` - API endpoints organized by feature
- `main.py` - Application entry point

---

### Step 1.2: Create requirements.txt

**File content**:
```txt
# Core Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.13.1

# Data Validation
pydantic[email]==2.5.0

# Authentication
PyJWT==2.8.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Environment Variables
python-dotenv==1.0.0
```

**What each package does**:
- `fastapi` - Web framework
- `uvicorn` - ASGI server to run FastAPI
- `sqlalchemy` - ORM (talk to database with Python)
- `psycopg2-binary` - PostgreSQL driver
- `alembic` - Database migration tool (NEW!)
- `pydantic` - Data validation
- `PyJWT` - JWT token handling (actively maintained!)
- `passlib` - Password hashing
- `python-multipart` - Handle form data
- `python-dotenv` - Load .env files

---

### Step 1.3: Create .env.example

**File content**:
```env
# Database Configuration
DATABASE_URL=postgresql://workout_user:workout_password@db:5432/workout_db

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Explanation**:
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database_name`
  - `db` is the Docker service name
  - **IMPORTANT**: These credentials are **made up by you**! Docker will create a new PostgreSQL database with these credentials.
- `SECRET_KEY` - Used to sign JWT tokens (keep secret!)
- `ALGORITHM` - Token encryption algorithm
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token validity duration

---

### Step 1.4: Create .env (Your Actual Secrets)

**Commands**:
```bash
cp .env.example .env
```

**Generate a secure SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Edit `.env`** and paste the generated key:
```env
DATABASE_URL=postgresql://workout_user:workout_password@db:5432/workout_db
SECRET_KEY=paste-your-generated-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**⚠️ IMPORTANT**: Never commit `.env` to git!

---

### Step 1.5: Create .gitignore

**File content**:
```
# Environment variables
.env

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
dist/
*.egg-info/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite3

# Alembic
alembic/versions/__pycache__/

# Docker
.dockerignore
```

---

## 💻 PHASE 2: Core App Logic

### Step 2.1: Create database.py

**What we're doing**: Set up SQLAlchemy database connection

**File content** (`app/database.py`):
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Create database engine (the connection to PostgreSQL)
# echo=True logs all SQL statements (useful for debugging)
engine = create_engine(DATABASE_URL)

# SessionLocal: factory to create database sessions
# Each request will get its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: all your models (tables) will inherit from this
Base = declarative_base()


# Dependency function: provides a database session to each request
def get_db():
    """
    Creates a new database session for each request.
    Automatically closes the session when done.
    """
    db = SessionLocal()
    try:
        yield db  # Give the session to the endpoint
    finally:
        db.close()  # Always close when done
```

**Key concepts**:
- `engine` - The actual connection to PostgreSQL
- `SessionLocal` - Factory that creates database sessions
- `Base` - Your models inherit from this
- `get_db()` - FastAPI dependency that provides a DB session

---

### Step 2.2: Create models.py

**What we're doing**: Define database tables using SQLAlchemy ORM

**File content** (`app/models.py`):
```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """User account table"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship: one user has many splits
    splits = relationship("Split", back_populates="owner", cascade="all, delete-orphan")


class Split(Base):
    """Workout split table (Push, Pull, Legs, Cardio, etc.)"""
    __tablename__ = "splits"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Push", "Pull", "Legs"
    description = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="splits")
    workouts = relationship("Workout", back_populates="split", cascade="all, delete-orphan")


class Workout(Base):
    """Individual workout/exercise table"""
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Bench Press"
    sets = Column(Integer, nullable=True)
    reps = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    split_id = Column(Integer, ForeignKey("splits.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    split = relationship("Split", back_populates="workouts")
```

**Explanation**:

**User model**:
- Stores user accounts
- `hashed_password` - Never store plain passwords!
- `splits` relationship - One user has many splits

**Split model**:
- Workout split types (Push, Pull, Legs, Cardio)
- `user_id` - Foreign key to User
- `cascade="all, delete-orphan"` - If split deleted, delete its workouts too

**Workout model**:
- Individual exercises
- `split_id` - Foreign key to Split
- `sets`, `reps`, `weight` - Optional workout details

---

### Step 2.3: Create schemas.py

**What we're doing**: Define Pydantic models for data validation

**File content** (`app/schemas.py`):
```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# ===== USER SCHEMAS =====

class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ===== SPLIT SCHEMAS =====

class SplitBase(BaseModel):
    name: str
    description: Optional[str] = None


class SplitCreate(SplitBase):
    pass


class SplitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class SplitResponse(SplitBase):
    id: int
    user_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ===== WORKOUT SCHEMAS =====

class WorkoutBase(BaseModel):
    name: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[float] = None
    notes: Optional[str] = None


class WorkoutCreate(WorkoutBase):
    pass


class WorkoutUpdate(BaseModel):
    name: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[float] = None
    notes: Optional[str] = None


class WorkoutResponse(WorkoutBase):
    id: int
    split_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ===== SPLIT WITH WORKOUTS =====

class SplitWithWorkouts(SplitResponse):
    workouts: List[WorkoutResponse] = []


# ===== TOKEN SCHEMAS =====

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
```

**Why we need schemas**:
- **Validation**: Pydantic automatically validates incoming data
- **Documentation**: Auto-generates API docs
- **Type safety**: Catches errors before they reach the database

**Schema naming convention**:
- `*Base` - Common fields shared by create/update
- `*Create` - What user sends to create a resource
- `*Update` - What user sends to update (all fields optional)
- `*Response` - What API returns to user

---

### Step 2.4: Create auth.py

**What we're doing**: Password hashing and JWT token functions

**File content** (`app/auth.py`):
```python
from datetime import datetime, timedelta
from typing import Optional
import jwt  # PyJWT library
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()
 

# Configuration from environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check if a plain password matches the hashed password.
    Used during login.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    Used during registration.
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary to encode in token (usually {"sub": username})
        expires_delta: Optional custom expiration time
    
    Returns:
        Encoded JWT token as string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    """
    Decode and verify a JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
```

**Functions explained**:
- `verify_password()` - Check if login password is correct
- `get_password_hash()` - Encrypt password before saving to DB
- `create_access_token()` - Generate JWT token after login
- `decode_access_token()` - Verify and read JWT token

---

### Step 2.5: Create dependencies.py

**What we're doing**: Reusable dependency to get current user from JWT

**File content** (`app/dependencies.py`):
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, auth

# OAuth2 scheme: looks for "Authorization: Bearer <token>" header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Get the current authenticated user from JWT token.
    
    This is used as a dependency in protected endpoints.
    Raises 401 if token is invalid or user not found.
    """
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    payload = auth.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    # Extract username from token
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    # Get user from database
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user
```

**How it works**:
1. Extracts token from `Authorization: Bearer <token>` header
2. Decodes and verifies the token
3. Gets username from token payload
4. Looks up user in database
5. Returns user object (or raises 401 error)

---

### Step 2.6: Create routers/auth.py

**What we're doing**: Authentication endpoints (register, login, get current user)

**File content** (`app/routers/auth.py`):
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app import models, schemas, auth
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    - Checks if username/email already exists
    - Hashes the password
    - Creates user in database
    """
    
    # Check if username already exists
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user with hashed password
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login and get JWT access token.
    
    - Verifies username and password
    - Returns JWT token if valid
    """
    
    # Find user by username
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    # Verify password
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Get current user information.
    
    Requires authentication (JWT token).
    """
    return current_user
```

**Endpoints**:
- `POST /auth/register` - Create new account
- `POST /auth/login` - Get JWT token
- `GET /auth/me` - Get your user info (requires token)

---

### Step 2.7: Create routers/splits.py

**What we're doing**: CRUD endpoints for workout splits

**File content** (`app/routers/splits.py`):
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/splits", tags=["Splits"])


@router.post("/", response_model=schemas.SplitResponse, status_code=status.HTTP_201_CREATED)
def create_split(
    split: schemas.SplitCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new workout split"""
    new_split = models.Split(**split.dict(), user_id=current_user.id)
    db.add(new_split)
    db.commit()
    db.refresh(new_split)
    return new_split


@router.get("/", response_model=List[schemas.SplitResponse])
def get_splits(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all your splits"""
    splits = db.query(models.Split).filter(models.Split.user_id == current_user.id).all()
    return splits


@router.get("/{split_id}", response_model=schemas.SplitWithWorkouts)
def get_split(
    split_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific split with its workouts"""
    split = db.query(models.Split).filter(
        models.Split.id == split_id,
        models.Split.user_id == current_user.id
    ).first()
    
    if not split:
        raise HTTPException(status_code=404, detail="Split not found")
    
    return split


@router.put("/{split_id}", response_model=schemas.SplitResponse)
def update_split(
    split_id: int,
    split_update: schemas.SplitUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update a split"""
    split = db.query(models.Split).filter(
        models.Split.id == split_id,
        models.Split.user_id == current_user.id
    ).first()
    
    if not split:
        raise HTTPException(status_code=404, detail="Split not found")
    
    # Update only provided fields
    for key, value in split_update.dict(exclude_unset=True).items():
        setattr(split, key, value)
    
    db.commit()
    db.refresh(split)
    return split


@router.delete("/{split_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_split(
    split_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a split (and all its workouts)"""
    split = db.query(models.Split).filter(
        models.Split.id == split_id,
        models.Split.user_id == current_user.id
    ).first()
    
    if not split:
        raise HTTPException(status_code=404, detail="Split not found")
    
    db.delete(split)
    db.commit()
    return None
```

**Endpoints**:
- `POST /splits` - Create split
- `GET /splits` - List all your splits
- `GET /splits/{id}` - Get one split with workouts
- `PUT /splits/{id}` - Update split
- `DELETE /splits/{id}` - Delete split

---

### Step 2.8: Create routers/workouts.py

**What we're doing**: CRUD endpoints for workouts within splits

**File content** (`app/routers/workouts.py`):
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/splits/{split_id}/workouts", tags=["Workouts"])


@router.post("/", response_model=schemas.WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(
    split_id: int,
    workout: schemas.WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Add a workout to a split"""
    
    # Verify split exists and belongs to user
    split = db.query(models.Split).filter(
        models.Split.id == split_id,
        models.Split.user_id == current_user.id
    ).first()
    
    if not split:
        raise HTTPException(status_code=404, detail="Split not found")
    
    new_workout = models.Workout(**workout.dict(), split_id=split_id)
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    return new_workout


@router.get("/", response_model=List[schemas.WorkoutResponse])
def get_workouts(
    split_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all workouts in a split"""
    
    # Verify split belongs to user
    split = db.query(models.Split).filter(
        models.Split.id == split_id,
        models.Split.user_id == current_user.id
    ).first()
    
    if not split:
        raise HTTPException(status_code=404, detail="Split not found")
    
    return split.workouts


@router.get("/{workout_id}", response_model=schemas.WorkoutResponse)
def get_workout(
    split_id: int,
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific workout"""
    
    workout = db.query(models.Workout).join(models.Split).filter(
        models.Workout.id == workout_id,
        models.Workout.split_id == split_id,
        models.Split.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return workout


@router.put("/{workout_id}", response_model=schemas.WorkoutResponse)
def update_workout(
    split_id: int,
    workout_id: int,
    workout_update: schemas.WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update a workout"""
    
    workout = db.query(models.Workout).join(models.Split).filter(
        models.Workout.id == workout_id,
        models.Workout.split_id == split_id,
        models.Split.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    for key, value in workout_update.dict(exclude_unset=True).items():
        setattr(workout, key, value)
    
    db.commit()
    db.refresh(workout)
    return workout


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    split_id: int,
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a workout"""
    
    workout = db.query(models.Workout).join(models.Split).filter(
        models.Workout.id == workout_id,
        models.Workout.split_id == split_id,
        models.Split.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    db.delete(workout)
    db.commit()
    return None
```

**Endpoints**:
- `POST /splits/{id}/workouts` - Add workout to split
- `GET /splits/{id}/workouts` - List workouts in split
- `GET /splits/{id}/workouts/{workout_id}` - Get one workout
- `PUT /splits/{id}/workouts/{workout_id}` - Update workout
- `DELETE /splits/{id}/workouts/{workout_id}` - Delete workout

---

### Step 2.9: Create main.py

**What we're doing**: Wire everything together and create the FastAPI app

**File content** (`app/main.py`):
```python
from fastapi import FastAPI
from app.routers import auth, splits, workouts

# Create FastAPI application
app = FastAPI(
    title="Workout Plan API",
    description="Manage your workout splits and exercises",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router)
app.include_router(splits.router)
app.include_router(workouts.router)


@app.get("/")
def root():
    """Root endpoint - API information"""
    return {
        "message": "Welcome to Workout Plan API",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
```

**Note**: We're NOT creating tables here anymore! Alembic will handle that.

---

## 🐳 PHASE 3: Docker Setup

### Step 3.1: Create Dockerfile

**File content**:
```dockerfile
# Use official Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app

# Copy alembic files
COPY ./alembic ./alembic
COPY ./alembic.ini ./alembic.ini

# Expose port 8000
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**Why slim instead of alpine?**
- `psycopg2-binary` needs build tools that alpine doesn't have
- `slim` is lightweight but has necessary libraries

---

### Step 3.2: Create docker-compose.yml

**File content**:
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: workout_db
    environment:
      POSTGRES_USER: workout_user
      POSTGRES_PASSWORD: workout_password
      POSTGRES_DB: workout_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U workout_user"]
      interval: 5s
      timeout: 5s
      retries: 5

  # FastAPI Application
  app:
    build: .
    container_name: workout_api
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://workout_user:workout_password@db:5432/workout_db
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./app:/app/app
      - ./alembic:/app/alembic
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
```

**Explanation**:

**db service**:
- Uses PostgreSQL 15 (alpine for small size)
- Creates database with credentials you specify
- Persists data in `postgres_data` volume
- Health check ensures DB is ready before starting app

**app service**:
- Builds from your Dockerfile
- Waits for database to be healthy
- Mounts code as volume (auto-reload on changes)
- Exposes port 8000

---

### Step 3.3: Start Docker

**Commands**:
```bash
# Build and start containers
docker compose up --build

# Or run in background
docker compose up -d --build
```

**What happens**:
1. Docker builds your app image
2. Starts PostgreSQL container
3. Waits for PostgreSQL to be ready
4. Starts your FastAPI app
5. App is available at http://localhost:8000

**Check if it's working**:
```bash
# View logs
docker compose logs -f app

# Check health
curl http://localhost:8000/health

# Open API docs
# http://localhost:8000/docs
```

---

## 🔄 PHASE 4: Database Migrations with Alembic

### Step 4.1: Initialize Alembic

**What is Alembic?**
- Database migration tool
- Tracks changes to your database schema
- Lets you version control your database structure
- Professional way to manage databases

**Commands**:
```bash
# Initialize Alembic (creates alembic/ folder and alembic.ini)
docker compose exec app alembic init alembic
```

This creates:
- `alembic/` folder with migration scripts
- `alembic.ini` configuration file

---

### Step 4.2: Configure Alembic

**Edit `alembic.ini`** - Change the sqlalchemy.url line:
```ini
# BEFORE (line ~63):
sqlalchemy.url = driver://user:pass@localhost/dbname

# AFTER (comment it out, we'll use env.py instead):
# sqlalchemy.url = driver://user:pass@localhost/dbname
```

**Edit `alembic/env.py`** - Update to use your models and DATABASE_URL:

Find the line `target_metadata = None` (around line 21) and replace the section with:
```python
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Load environment variables
load_dotenv()

# Import your models
from app.database import Base
from app import models

# Set target metadata to your models
target_metadata = Base.metadata
```

Find the `run_migrations_offline()` function and update the `url` line:
```python
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = os.getenv("DATABASE_URL")  # Add this line
    context.configure(
        url=url,  # Change from config.get_main_option("sqlalchemy.url")
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    # ... rest of function
```

Find the `run_migrations_online()` function and update the `connectable` creation:
```python
def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    from sqlalchemy import engine_from_config, pool
    
    # Get configuration
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = os.getenv("DATABASE_URL")  # Add this line
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    # ... rest of function
```

---

### Step 4.3: Create Initial Migration

**Commands**:
```bash
# Create migration (auto-detects changes from models.py)
docker compose exec app alembic revision --autogenerate -m "Initial migration"
```

This creates a file in `alembic/versions/` like `xxxx_initial_migration.py`

**What it does**:
- Compares your models.py to current database
- Generates migration script to create tables
- You can review the migration file before applying

---

### Step 4.4: Apply Migration

**Commands**:
```bash
# Apply migration (creates tables in database)
docker compose exec app alembic upgrade head
```

**Verify tables were created**:
```bash
# Access PostgreSQL
docker compose exec db psql -U workout_user -d workout_db

# In psql:
\dt                    # List tables (should see users, splits, workouts)
\d users               # Describe users table
\q                     # Quit
```

---

### Step 4.5: Future Migrations

**When you change models.py**:
```bash
# 1. Update your models.py (add/remove/modify columns)

# 2. Create new migration
docker compose exec app alembic revision --autogenerate -m "Description of change"

# 3. Review the generated migration file

# 4. Apply migration
docker compose exec app alembic upgrade head
```

**Common Alembic commands**:
```bash
# Show current migration version
docker compose exec app alembic current

# Show migration history
docker compose exec app alembic history

# Rollback one migration
docker compose exec app alembic downgrade -1

# Rollback to specific version
docker compose exec app alembic downgrade <revision_id>

# Upgrade to latest
docker compose exec app alembic upgrade head
```

---

## 🧪 PHASE 5: Testing

### Step 5.1: Test with FastAPI Docs

**Open in browser**: http://localhost:8000/docs

This gives you an interactive API documentation where you can test all endpoints.

**Test flow**:
1. Click on `POST /auth/register`
2. Click "Try it out"
3. Enter test data
4. Click "Execute"
5. Check response

---

### Step 5.2: Test with Postman

**1. Register a User**
- Method: `POST`
- URL: `http://localhost:8000/auth/register`
- Body (JSON):
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**2. Login**
- Method: `POST`
- URL: `http://localhost:8000/auth/login`
- Body: `x-www-form-urlencoded`
  - `username`: john_doe
  - `password`: securepassword123
- **Copy the `access_token` from response!**

**3. Set Authorization for All Requests**
- In Postman Collection settings
- Auth Type: `Bearer Token`
- Token: Paste your access_token

**4. Create a Split**
- Method: `POST`
- URL: `http://localhost:8000/splits`
- Body (JSON):
```json
{
  "name": "Push Day",
  "description": "Chest, shoulders, triceps"
}
```

**5. Get All Splits**
- Method: `GET`
- URL: `http://localhost:8000/splits`

**6. Add Workout to Split**
- Method: `POST`
- URL: `http://localhost:8000/splits/1/workouts`
- Body (JSON):
```json
{
  "name": "Bench Press",
  "sets": 4,
  "reps": 8,
  "weight": 80.5,
  "notes": "Increase weight next week"
}
```

**7. Get Split with Workouts**
- Method: `GET`
- URL: `http://localhost:8000/splits/1`

---

## 📚 Quick Reference

### Docker Commands
```bash
# Start everything
docker compose up --build

# Start in background
docker compose up -d --build

# Stop everything
docker compose down

# View logs
docker compose logs -f app

# Restart app only
docker compose restart app

# Access database
docker compose exec db psql -U workout_user -d workout_db

# Reset everything (deletes data!)
docker compose down -v && docker compose up --build
```

### Alembic Commands
```bash
# Create migration
docker compose exec app alembic revision --autogenerate -m "message"

# Apply migrations
docker compose exec app alembic upgrade head

# Rollback one migration
docker compose exec app alembic downgrade -1

# Show current version
docker compose exec app alembic current

# Show history
docker compose exec app alembic history
```

---

## 🐛 Troubleshooting

### "Port 8000 already in use"
```bash
# Find process using port
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### "Database connection failed"
- Wait 10 seconds for database to start
- Check: `docker compose logs db`
- Verify DATABASE_URL in .env matches docker-compose.yml

### "Module not found"
```bash
# Rebuild containers
docker compose down
docker compose up --build
```

### "Alembic can't find models"
- Check `alembic/env.py` has correct imports
- Verify `sys.path.insert(0, ...)` is correct
- Make sure you're running alembic inside Docker: `docker compose exec app alembic ...`

### "Migration conflicts"
```bash
# Reset migrations (development only!)
docker compose down -v
rm -rf alembic/versions/*
docker compose up -d --build
docker compose exec app alembic revision --autogenerate -m "Initial"
docker compose exec app alembic upgrade head
```

---

## ✅ Success Checklist

- [ ] Docker and Docker Compose installed
- [ ] Postman installed (optional)
- [ ] All files created with correct content
- [ ] `.env` file has generated SECRET_KEY
- [ ] `docker compose up --build` works without errors
- [ ] Can access http://localhost:8000/docs
- [ ] Alembic initialized and configured
- [ ] Initial migration created and applied
- [ ] Tables visible in database (`\dt` in psql)
- [ ] Can register a user
- [ ] Can login and get JWT token
- [ ] Can create splits
- [ ] Can add workouts
- [ ] Can view/update/delete data

---

## 🎓 Next Steps

### **Add More Features**
- Exercise categories/tags
- Progress tracking over time
- Workout history/calendar
- Rest timer
- Personal records (PRs)

### **Improve Security**
- Add refresh tokens
- Rate limiting
- Input sanitization
- CORS configuration

### **Deploy to Production**
- Use managed PostgreSQL (not Docker)
- Set up proper environment variables
- Use production ASGI server (gunicorn + uvicorn)
- Set up HTTPS
- Deploy to cloud (AWS, DigitalOcean, Render, Railway)

### **Build a Frontend**
- React/Vue.js web app
- Mobile app with React Native
- Use the API you just built!

---

## 🎯 Summary: Correct Build Order

1. ✅ **Setup** - Create files, requirements.txt, .env
2. ✅ **App Logic** - database.py → models.py → schemas.py → auth.py → dependencies.py → routers → main.py
3. ✅ **Docker** - Dockerfile → docker-compose.yml → start containers
4. ✅ **Migrations** - Initialize Alembic → configure → create migration → apply
5. ✅ **Test** - Use /docs or Postman

**Key principle**: Build the logic first, containerize later, then manage database with migrations!

Good luck! 🚀
