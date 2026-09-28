import os
from pathlib import Path

from dotenv import load_dotenv
from redis_om import get_redis_connection

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

redis = get_redis_connection(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    username=os.getenv("REDIS_USERNAME"),
    password=os.getenv("REDIS_PASSWORD"),
    decode_responses=True,
)