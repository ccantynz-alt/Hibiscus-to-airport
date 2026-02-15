from pymongo import MongoClient

try:
    from mongo_config import get_mongo_uri
except ImportError:  # pragma: no cover
    from backend.mongo_config import get_mongo_uri  # type: ignore

client = MongoClient(get_mongo_uri())
db = client.get_default_database()
