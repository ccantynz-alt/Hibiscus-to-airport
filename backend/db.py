# backend/db.py
# Shared MongoDB connection — import `db` from this module everywhere.
# This avoids creating multiple MongoClient instances.

import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

_mongo_url = os.environ.get("MONGO_URL", "")
_db_name = os.environ.get("DB_NAME", "hibiscus_shuttle")

if not _mongo_url:
    logger.warning("MONGO_URL not set — database operations will fail at runtime")

client: AsyncIOMotorClient = AsyncIOMotorClient(_mongo_url) if _mongo_url else None
db = client[_db_name] if client else None
