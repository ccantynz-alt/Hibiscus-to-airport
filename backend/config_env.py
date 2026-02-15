import os
from typing import Dict, Optional, Tuple
from urllib.parse import urlparse


MONGO_URL_ENV_CANDIDATES = (
    "MONGO_URL",
    "MONGODB_URI",
    "MONGODB_URL",
    "DATABASE_URL",
)


def get_env_first(names) -> Tuple[Optional[str], Optional[str]]:
    """
    Return (value, env_name) for the first non-empty env var in `names`.
    """
    for n in names:
        v = os.environ.get(n)
        if v is None:
            continue
        v = v.strip()
        if v:
            return v, n
    return None, None


def get_mongo_url_with_source() -> Tuple[Optional[str], Optional[str]]:
    """
    Return (mongo_url, env_name). Accepts common env var names.
    Only returns a value if it looks like a MongoDB URI.
    """
    raw, src = get_env_first(MONGO_URL_ENV_CANDIDATES)
    if not raw:
        return None, None
    if raw.startswith("mongodb://") or raw.startswith("mongodb+srv://"):
        return raw, src
    # If DATABASE_URL is set to something else (e.g. postgres), ignore it.
    return None, None


def get_db_name() -> Optional[str]:
    v = (os.environ.get("DB_NAME") or "").strip()
    return v or None


def mongo_uri_has_default_db(mongo_url: str) -> bool:
    """
    Best-effort check for a default DB in the URI path.
    """
    if not mongo_url:
        return False
    try:
        parsed = urlparse(mongo_url)
        path = (parsed.path or "").lstrip("/")
        # mongodb+srv://.../dbname?...
        return bool(path and path != "/")
    except Exception:
        return False


def redact_mongo_url(mongo_url: str) -> str:
    """
    Return a safe-to-log version of a MongoDB URI.
    Never returns user/pass or full query params.
    """
    if not mongo_url:
        return ""
    try:
        parsed = urlparse(mongo_url)
        scheme = parsed.scheme or "mongodb"
        host = parsed.hostname or ""
        port = f":{parsed.port}" if parsed.port else ""
        db = (parsed.path or "").lstrip("/")
        db_part = f"/{db}" if db else ""
        return f"{scheme}://***@{host}{port}{db_part}"
    except Exception:
        return "mongodb://***"


def env_presence_report() -> Dict[str, Dict[str, object]]:
    """
    Presence-only report (no secrets).
    """
    out: Dict[str, Dict[str, object]] = {}
    for k in (
        "DB_NAME",
        "ADMIN_API_KEY",
        "ADMIN_EMAIL",
        "ADMIN_PHONE",
        "SMTP_SERVER",
        "SMTP_PORT",
        "SMTP_USERNAME",
        "SMTP_PASSWORD",
        "SENDER_EMAIL",
        "STRIPE_SECRET_KEY",
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
        "TWILIO_PHONE_NUMBER",
        "FRONTEND_URL",
        "PUBLIC_DOMAIN",
        "BACKEND_URL",
    ):
        out[k] = {"set": bool((os.environ.get(k) or "").strip())}

    mongo_url, mongo_src = get_mongo_url_with_source()
    out["MONGO_URL"] = {
        "set": bool(mongo_url),
        "source": mongo_src,
        "candidates": list(MONGO_URL_ENV_CANDIDATES),
        "has_default_db_in_uri": mongo_uri_has_default_db(mongo_url or ""),
    }
    return out

