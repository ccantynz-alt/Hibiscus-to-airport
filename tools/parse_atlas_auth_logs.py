#!/usr/bin/env python3
"""
Parse MongoDB Atlas "Authentication Logs" pasted from the UI (or exported text),
and print a quick security-oriented summary.

It handles the common paste format where each cell appears on its own line with
blank lines between fields.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, List, Optional, Tuple


HEADER_HINTS = (
    "Timestamp",
    "Username",
    "IP Address",
    "Host",
    "Authentication Source",
    "Authentication Result",
)


@dataclass(frozen=True)
class AuthEvent:
    timestamp_raw: str
    username: str
    ip: str
    host: str
    auth_source: str
    result: str
    timestamp_iso: Optional[str] = None


def _parse_timestamp(ts: str) -> Optional[str]:
    ts = ts.strip()
    if not ts:
        return None
    # Example: "2/15/2026 - 11:03:35 PM"
    for fmt in ("%m/%d/%Y - %I:%M:%S %p", "%m/%d/%Y %I:%M:%S %p"):
        try:
            dt = datetime.strptime(ts, fmt)
            return dt.isoformat()
        except ValueError:
            continue
    return None


def _redact_ip(ip: str) -> str:
    ip = ip.strip()
    if not ip:
        return ip
    if ":" in ip:  # IPv6-ish
        # Keep only first 3 hextets
        parts = ip.split(":")
        return ":".join(parts[:3]) + ":…"
    m = re.match(r"^(\d+)\.(\d+)\.(\d+)\.(\d+)$", ip)
    if not m:
        return ip
    return f"{m.group(1)}.{m.group(2)}.{m.group(3)}.x"


def _redact_username(u: str) -> str:
    u = u.strip()
    if not u:
        return u
    # X.509 subjects often look like "CN=email@domain"
    if u.startswith("CN=") and "@" in u:
        left, right = u.split("CN=", 1)
        # right may include other subject parts, but for our common case it's email.
        email = right.strip()
        # Minimal email redaction: keep domain, shorten local part.
        if "@" in email:
            local, domain = email.split("@", 1)
            if local:
                local = local[0] + "…"
            return f"CN={local}@{domain}"
    return u


def _clean_nonempty_lines(text: str) -> List[str]:
    return [ln.strip() for ln in text.splitlines() if ln.strip()]


def _drop_header(lines: List[str]) -> List[str]:
    if not lines:
        return lines
    head = lines[0]
    if all(h in head for h in ("Timestamp", "Username", "IP")):
        return lines[1:]
    return lines


def _chunk(lines: List[str], size: int) -> List[List[str]]:
    return [lines[i : i + size] for i in range(0, len(lines), size)]


def parse_events(text: str) -> Tuple[List[AuthEvent], List[str]]:
    lines = _drop_header(_clean_nonempty_lines(text))
    errors: List[str] = []
    if not lines:
        return [], ["No rows found (input was empty after stripping whitespace)"]

    chunks = _chunk(lines, 6)
    events: List[AuthEvent] = []
    for idx, c in enumerate(chunks):
        if len(c) != 6:
            errors.append(
                f"Row {idx+1}: expected 6 fields (timestamp, username, ip, host, auth_source, result) "
                f"but got {len(c)} fields. Remaining lines may be malformed."
            )
            continue
        ts, user, ip, host, src, res = c
        events.append(
            AuthEvent(
                timestamp_raw=ts,
                username=user,
                ip=ip,
                host=host,
                auth_source=src,
                result=res,
                timestamp_iso=_parse_timestamp(ts),
            )
        )
    return events, errors


def summarize(events: List[AuthEvent]) -> str:
    if not events:
        return "No events."

    def k(e: AuthEvent) -> Tuple[str, str, str, str, str, str]:
        return (e.timestamp_raw, e.username, e.ip, e.host, e.auth_source, e.result)

    total = len(events)
    uniq = len({k(e) for e in events})
    dupes = total - uniq

    by_user = Counter(e.username for e in events)
    by_ip = Counter(e.ip for e in events)
    by_source = Counter(e.auth_source for e in events)
    by_result = Counter(e.result for e in events)

    ts_known = [e.timestamp_iso for e in events if e.timestamp_iso]
    ts_range = ""
    if ts_known:
        ts_range = f"{min(ts_known)} .. {max(ts_known)}"

    suspicious_users = [u for u in by_user if u in {"MONGO_URL", "MONGO_URI", "username", "user"}]
    warnings: List[str] = []
    if suspicious_users:
        warnings.append(
            "Found suspicious/placeholder usernames in auth logs: "
            + ", ".join(sorted(set(suspicious_users)))
            + " (this often means the connection string username was set incorrectly)."
        )
    if any(e.auth_source == "admin" and e.username == "MONGO_URL" for e in events):
        warnings.append("User 'MONGO_URL' authenticated against 'admin' — strongly check DB users/creds and rotate.")

    lines: List[str] = []
    lines.append(f"Total events: {total} (unique: {uniq}, duplicates: {dupes})")
    if ts_range:
        lines.append(f"Time range: {ts_range}")
    lines.append(f"Results: {dict(by_result)}")
    lines.append(f"Auth sources: {dict(by_source)}")
    lines.append("Top usernames:")
    for u, c in by_user.most_common(10):
        lines.append(f"  - {u}: {c}")
    lines.append("Top IPs:")
    for ip, c in by_ip.most_common(10):
        lines.append(f"  - {ip}: {c}")
    if warnings:
        lines.append("Warnings:")
        for w in warnings:
            lines.append(f"  - {w}")
    return "\n".join(lines)


def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Parse MongoDB Atlas Authentication Logs paste/export.")
    p.add_argument("-i", "--input", help="Input text file (defaults to stdin)")
    p.add_argument("--out-json", help="Write parsed events as JSON to this path")
    p.add_argument("--out-csv", help="Write parsed events as CSV to this path")
    p.add_argument("--no-redact", action="store_true", help="Do not redact usernames/IPs in outputs")
    args = p.parse_args(argv)

    if args.input:
        text = Path(args.input).read_text(encoding="utf-8", errors="replace")
    else:
        text = sys.stdin.read()

    events, errors = parse_events(text)

    redact = not args.no_redact
    out_events = events
    if redact:
        out_events = [
            AuthEvent(
                timestamp_raw=e.timestamp_raw,
                username=_redact_username(e.username),
                ip=_redact_ip(e.ip),
                host=e.host,
                auth_source=e.auth_source,
                result=e.result,
                timestamp_iso=e.timestamp_iso,
            )
            for e in events
        ]

    if args.out_json:
        Path(args.out_json).write_text(
            json.dumps([asdict(e) for e in out_events], indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    if args.out_csv:
        with Path(args.out_csv).open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(
                f,
                fieldnames=[
                    "timestamp_raw",
                    "timestamp_iso",
                    "username",
                    "ip",
                    "host",
                    "auth_source",
                    "result",
                ],
            )
            w.writeheader()
            for e in out_events:
                w.writerow(asdict(e))

    print(summarize(out_events))
    if errors:
        print("\nParse notes:", file=sys.stderr)
        for e in errors:
            print(f"- {e}", file=sys.stderr)

    # Non-zero if we couldn't parse cleanly.
    return 0 if not errors else 2


if __name__ == "__main__":
    raise SystemExit(main())

