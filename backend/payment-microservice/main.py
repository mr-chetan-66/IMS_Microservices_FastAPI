import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router
# import requests

app=FastAPI()
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=['*'],
    allow_headers=["*"],
    allow_credentials=True
)


