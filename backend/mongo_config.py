import logging
import os
import re
from typing import List, Optional
from urllib.parse import urlsplit, urlunsplit

logger = logging.getLogger(__name__)


def redact_mongo_uri(uri: str) -> str:
    """
    Redact password in MongoDB URIs for safe logging.

    Examples:
      mongodb+srv://user:pass@cluster/db  -> mongodb+srv://user:***@cluster/db
      mongodb://user@host/db             -> unchanged (no password present)
    """
    if not uri:
        return uri
    try:
        parts = urlsplit(uri)
        netloc = parts.netloc or ""
        if "@" not in netloc:
            return uri

        userinfo, hostinfo = netloc.rsplit("@", 1)
        if ":" in userinfo:
            user, _pwd = userinfo.split(":", 1)
            userinfo = f"{user}:***"
        # else: username-only userinfo, nothing to redact
        redacted = urlunsplit((parts.scheme, f"{userinfo}@{hostinfo}", parts.path, parts.query, parts.fragment))
        return redacted
    except Exception:
        # Best-effort regex fallback
        return re.sub(r"://([^:@/]+):([^@/]+)@", r"://\1:***@", uri)


def _mongo_uri_warnings(uri: str) -> List[str]:
    warnings: List[str] = []
    if not uri:
        warnings.append("MongoDB URI is empty")
        return warnings

    if not (uri.startswith("mongodb://") or uri.startswith("mongodb+srv://")):
        warnings.append("MongoDB URI does not start with mongodb:// or mongodb+srv://")

    # Common placeholder patterns in docs/snippets.
    if any(tok in uri for tok in ("<username>", "<password>", "username:password@", "user:pass@")):
        warnings.append("MongoDB URI appears to contain placeholder credentials (e.g. username:password@)")

    try:
        parts = urlsplit(uri)
        username = parts.username
        password = parts.password
    except Exception:
        username = None
        password = None

    bad_usernames = {"MONGO_URL", "MONGO_URI", "username", "user", "admin", "root"}
    bad_passwords = {"password", "pass", "changeme", "change-me", "123456", "admin"}

    if username and username in bad_usernames:
        warnings.append(
            f"MongoDB URI username is '{username}' (common misconfiguration / placeholder). "
            "If this matches Atlas auth logs, fix the connection string and rotate DB creds."
        )
    if password and password in bad_passwords:
        warnings.append("MongoDB URI password looks like a placeholder/weak password — rotate credentials.")

    return warnings


def get_mongo_uri(*, required: bool = True, log_warnings: bool = True) -> str:
    """
    Prefer MONGO_URI, fallback to MONGO_URL for backward compatibility.
    """
    uri = (os.getenv("MONGO_URI") or os.getenv("MONGO_URL") or "").strip()
    if not uri:
        if required:
            raise RuntimeError("MongoDB connection string missing (set MONGO_URI or MONGO_URL)")
        return ""

    warnings = _mongo_uri_warnings(uri)
    strict = (os.getenv("MONGO_URI_STRICT") or "").strip().lower() in {"1", "true", "yes", "on"}
    if warnings and strict:
        joined = "; ".join(warnings)
        raise RuntimeError(f"Invalid/suspicious MongoDB URI configuration: {joined}. URI={redact_mongo_uri(uri)}")

    if warnings and log_warnings:
        for w in warnings:
            logger.warning(f"[mongo_config] {w}. URI={redact_mongo_uri(uri)}")

    return uri


def get_db_name(default: str = "hibiscus_shuttle") -> str:
    return (os.getenv("DB_NAME") or default).strip()

