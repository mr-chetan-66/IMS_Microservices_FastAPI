import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001",
    ).split(",")
    if origin.strip()
]

app=FastAPI()
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX", r"https://[a-zA-Z0-9-]+\.onrender\.com"),
    allow_methods=['*'],
    allow_headers=["*"],
    allow_credentials=True
)


