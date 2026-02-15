"""
MongoDB connection for synchronous (pymongo) usage.

Note: If you see "list_collection_names failed for db config/local" errors,
these come from tools (Compass, IDE extensions) probing system databases.
The application only uses DB_NAME and is unaffected. See
MONGODB_CONFIG_LOCAL_AUTHORIZATION.md for details.
"""
import os
from pymongo import MongoClient

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "hibiscustoairport")
if not MONGO_URL:
    raise RuntimeError("MONGO_URL env var not set")

client = MongoClient(MONGO_URL)
# Use explicit DB_NAME to avoid any config/local probing; app never needs system dbs
db = client[DB_NAME]
