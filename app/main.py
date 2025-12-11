from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import workouts, splits, auth

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts.router)
app.include_router(splits.router)
app.include_router(auth.router)


@app.get("/")
def get_hello_world():
    return {"message": "hello world"}
