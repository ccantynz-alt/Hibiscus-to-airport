# backend/auth_logs.py
# MongoDB Authentication Logs Management

import os
import logging
from datetime import datetime
from typing import List, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

def parse_timestamp(ts_str: str) -> Optional[datetime]:
    """Parse timestamp from format '2/15/2026 - 11:03:35 PM'"""
    try:
        return datetime.strptime(ts_str.strip(), "%m/%d/%Y - %I:%M:%S %p")
    except Exception as e:
        logger.error(f"Failed to parse timestamp '{ts_str}': {e}")
        return None

def parse_auth_log_entry(timestamp: str, username: str, ip_address: str, 
                         host: str, auth_source: str, auth_result: str) -> Dict:
    """Create a structured auth log entry."""
    parsed_time = parse_timestamp(timestamp)
    return {
        "timestamp": timestamp,
        "parsed_datetime": parsed_time.isoformat() if parsed_time else None,
        "username": username.strip(),
        "ip_address": ip_address.strip(),
        "host": host.strip(),
        "authentication_source": auth_source.strip(),
        "authentication_result": auth_result.strip(),
        "is_successful": auth_result.strip().lower() == "successful",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

# Sample authentication logs data from MongoDB Atlas
SAMPLE_AUTH_LOGS = [
    {
        "timestamp": "2/15/2026 - 11:03:35 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:27:44 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:27:43 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "54.252.174.158",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:27:43 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:27:42 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:26:37 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "54.252.174.158",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:26:37 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:26:36 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:26:36 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 10:26:35 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:16:35 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:10:51 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:06:43 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:06:42 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:06:42 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:00:40 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "54.252.174.158",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:00:39 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "54.252.174.158",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:00:38 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "54.252.174.158",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:00:38 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 9:00:37 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "54.252.174.158",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 8:59:43 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 8:59:42 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 8:59:42 PM",
        "username": "MONGO_URL",
        "ip_address": "74.220.49.253",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "admin",
        "authentication_result": "Successful"
    },
    {
        "timestamp": "2/15/2026 - 8:58:17 PM",
        "username": "CN=ccantynz@gmail.com",
        "ip_address": "13.238.145.51",
        "host": "hibiscustoairport-shard-00-02.vte8b8.mongodb.net",
        "authentication_source": "$external",
        "authentication_result": "Successful"
    }
]

async def initialize_auth_logs():
    """Initialize auth_logs collection with sample data if empty."""
    try:
        mongo_url = os.environ.get("MONGO_URL", "")
        db_name = os.environ.get("DB_NAME", "hibiscus_shuttle")
        if not mongo_url:
            logger.warning("MONGO_URL not set, cannot initialize auth logs")
            return
        
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Check if collection has data
        count = await db.auth_logs.count_documents({})
        if count == 0:
            logger.info("Initializing auth_logs collection with sample data")
            parsed_logs = []
            for log in SAMPLE_AUTH_LOGS:
                parsed_logs.append(parse_auth_log_entry(
                    log["timestamp"],
                    log["username"],
                    log["ip_address"],
                    log["host"],
                    log["authentication_source"],
                    log["authentication_result"]
                ))
            
            if parsed_logs:
                await db.auth_logs.insert_many(parsed_logs)
                logger.info(f"Inserted {len(parsed_logs)} auth log entries")
        
        client.close()
    except Exception as e:
        logger.error(f"Failed to initialize auth logs: {e}")

async def get_auth_logs(limit: int = 500) -> List[Dict]:
    """Fetch authentication logs from MongoDB."""
    try:
        mongo_url = os.environ.get("MONGO_URL", "")
        db_name = os.environ.get("DB_NAME", "hibiscus_shuttle")
        if not mongo_url:
            return []
        
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Sort by timestamp descending (newest first)
        docs = await db.auth_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
        client.close()
        
        return docs
    except Exception as e:
        logger.error(f"Failed to fetch auth logs: {e}")
        return []
