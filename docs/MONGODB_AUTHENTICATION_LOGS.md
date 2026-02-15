# MongoDB Authentication Logs — Analysis & Reference

This document explains how to interpret MongoDB Atlas authentication logs and summarizes findings from recent logs.

## Log Format

| Column | Description |
|--------|-------------|
| **Timestamp** | When the authentication occurred |
| **Username** | The authenticated identity (MongoDB user or external principal) |
| **IP Address** | Source IP of the connection |
| **Host** | MongoDB Atlas host that received the connection |
| **Authentication Source** | Database used for auth (`admin`, `$external`, etc.) |
| **Authentication Result** | Success or failure |

---

## Sample Log Analysis (hibiscustoairport cluster)

### Two Authentication Sources

#### 1. Application / Backend (`MONGO_URL` → `admin`)

| Username | Auth Source | Typical Use |
|----------|-------------|-------------|
| `MONGO_URL` | `admin` | Backend server (Render) using connection string from `MONGO_URL` env var |

- **Source IP:** `74.220.49.253` (likely Render deployment)
- **Connection string format:** `mongodb+srv://MONGO_URL:<password>@hibiscustoairport-shard-00-02.vte8b8.mongodb.net/...`

> **Note:** The username `MONGO_URL` in Atlas logs means the MongoDB user in your connection string is literally named `MONGO_URL`. This is an unusual choice. Consider creating a dedicated user (e.g. `hibiscus_app` or `bookaride_backend`) for clearer audit trails and easier credential rotation.

#### 2. Human / Atlas UI (`CN=ccantynz@gmail.com` → `$external`)

| Username | Auth Source | Typical Use |
|----------|-------------|-------------|
| `CN=ccantynz@gmail.com` | `$external` | MongoDB Atlas UI, Compass, or CLI using Google/LDAP/X.509 |

- **Source IPs:** `13.238.145.51`, `54.252.174.158` (AWS ap-southeast-2 — Australia)
- **Auth method:** External (e.g. Google OAuth, X.509, or LDAP)

---

## Recent Log Summary (2026-02-15)

All 25 authentication events recorded on 2026-02-15 between 8:58 PM and 11:03 PM were **successful**. No failed logins were observed.

### Timeline

| Time (UTC+13) | Username | IP Address | Auth Source |
|----------------|----------|------------|-------------|
| 8:58:17 PM | `CN=ccantynz@gmail.com` | 13.238.145.51 | `$external` |
| 8:59:42–8:59:43 PM | `MONGO_URL` | 74.220.49.253 | `admin` |
| 9:00:37–9:00:39 PM | `CN=ccantynz@gmail.com` | 54.252.174.158 / 13.238.145.51 | `$external` |
| 9:06:42–9:06:43 PM | `MONGO_URL` | 74.220.49.253 | `admin` |
| 9:10:51 PM | `MONGO_URL` | 74.220.49.253 | `admin` |
| 9:16:35 PM | `MONGO_URL` | 74.220.49.253 | `admin` |
| 10:26:35–10:26:37 PM | `CN=ccantynz@gmail.com` | 13.238.145.51 / 54.252.174.158 | `$external` |
| 10:27:42–10:27:44 PM | `CN=ccantynz@gmail.com` | 13.238.145.51 / 54.252.174.158 | `$external` |
| 11:03:35 PM | `MONGO_URL` | 74.220.49.253 | `admin` |

### Connection Breakdown

| Username | Auth Source | Connection Count | IP(s) |
|----------|-------------|-----------------|-------|
| `MONGO_URL` | `admin` | 10 | 74.220.49.253 |
| `CN=ccantynz@gmail.com` | `$external` | 15 | 13.238.145.51, 54.252.174.158 |

---

## IP Address Summary

| IP | Likely Origin | Used By |
|----|---------------|---------|
| `74.220.49.253` | Render / hosting provider | Backend (`MONGO_URL`) |
| `13.238.145.51` | AWS ap-southeast-2 | Atlas UI / Compass (`CN=ccantynz@gmail.com`) |
| `54.252.174.158` | AWS ap-southeast-2 | Atlas UI / Compass (`CN=ccantynz@gmail.com`) |

---

## Security Recommendations

1. **Use descriptive usernames** — Prefer `hibiscus_app` or `bookaride_backend` over `MONGO_URL` for application connections. This improves audit clarity and avoids confusion with env var names.

2. **Rotate credentials** — If `MONGO_URL` or any credential may have been exposed, rotate the MongoDB user password and update `MONGO_URL` in Render.

3. **Restrict IP access** — In MongoDB Atlas → Network Access, consider limiting allowed IPs to known deployment and admin IPs (e.g. Render outbound IPs, your office/VPN).

4. **Monitor failed logins** — Watch for `Authentication Result: Failed` entries; repeated failures from unknown IPs may indicate brute-force attempts.

5. **Separate admin and app users** — Use different MongoDB users for:
   - Application (read/write to app DB only)
   - Admin/bootstrap (e.g. for `/admin/bootstrap`)
   - Atlas UI access (your personal `$external` identity)

---

## Where to Find These Logs

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your project and cluster (`hibiscustoairport`)
3. Go to **Security** → **Authentication** or **Monitoring** → **Logs**
4. Filter by authentication events

---

## Related Configuration

- **Backend:** `MONGO_URL` env var (Render, local `.env`)
- **Code:** `backend/database.py`, `backend/booking_routes.py`, `backend/admin_routes.py`
- **Security agent:** `backend/agents/08_security.md`
