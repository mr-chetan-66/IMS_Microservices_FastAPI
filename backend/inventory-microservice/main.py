import os
from contextlib import asynccontextmanager
from threading import Event, Thread

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from consumer import consume_orders
from routes import router

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001",
    ).split(",")
    if origin.strip()
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    stop_event = Event()
    consumer_thread = Thread(
        target=consume_orders,
        args=(stop_event,),
        name="inventory-order-consumer",
        daemon=True,
    )
    consumer_thread.start()
    try:
        yield
    finally:
        stop_event.set()
        consumer_thread.join(timeout=2)


app = FastAPI(lifespan=lifespan)
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX", r"https://[a-zA-Z0-9-]+\.onrender\.com"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

