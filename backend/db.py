# backend/db.py
# Neon PostgreSQL connection pool — import `get_pool` and use it everywhere.

import os
import logging
import asyncpg

logger = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None

DATABASE_URL = os.environ.get("DATABASE_URL", "")

if not DATABASE_URL:
    logger.warning("DATABASE_URL not set — database operations will fail at runtime")


async def get_pool() -> asyncpg.Pool:
    """Return (and lazily create) the shared connection pool."""
    global _pool
    if _pool is None:
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is not configured")
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
        await _init_schema(_pool)
    return _pool


async def _init_schema(pool: asyncpg.Pool):
    """Create tables if they don't exist yet."""
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id TEXT PRIMARY KEY,
                booking_ref TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                pickup_address TEXT,
                dropoff_address TEXT,
                date TEXT,
                time TEXT,
                passengers TEXT DEFAULT '1',
                notes TEXT,
                service_type TEXT,
                departure_flight_number TEXT,
                departure_time TEXT,
                arrival_flight_number TEXT,
                arrival_time TEXT,
                vip_pickup BOOLEAN DEFAULT FALSE,
                oversized_luggage BOOLEAN DEFAULT FALSE,
                return_trip BOOLEAN DEFAULT FALSE,
                pricing JSONB,
                total_price NUMERIC(10,2) DEFAULT 0,
                status TEXT DEFAULT 'pending',
                payment_status TEXT DEFAULT 'unpaid',
                payment_method TEXT,
                last_email_sent TEXT,
                last_sms_sent TEXT,
                payment_link_sent TEXT,
                tracking_id TEXT,
                tracking_status TEXT,
                assigned_driver_id TEXT,
                assigned_driver_name TEXT,
                driver_payout NUMERIC(10,2),
                driver_notes TEXT,
                acceptance_token TEXT,
                driver_accepted BOOLEAN,
                driver_accepted_at TEXT,
                driver_declined_at TEXT,
                driver_decline_reason TEXT,
                driver_assigned_at TEXT,
                driver_location JSONB,
                driver_eta_minutes INTEGER,
                auto_dispatched BOOLEAN DEFAULT FALSE,
                reminder_sent BOOLEAN DEFAULT FALSE,
                reminder_sent_at TEXT,
                return_driver_id TEXT,
                return_driver_name TEXT,
                return_driver_payout NUMERIC(10,2),
                return_driver_notes TEXT,
                return_acceptance_token TEXT,
                return_driver_accepted BOOLEAN,
                return_tracking_status TEXT,
                return_driver_assigned_at TEXT,
                google_calendar_event_id TEXT,
                additional_pickups JSONB DEFAULT '[]'::jsonb,
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS deleted_bookings (
                id TEXT PRIMARY KEY,
                booking_ref TEXT,
                name TEXT,
                email TEXT,
                phone TEXT,
                pickup_address TEXT,
                dropoff_address TEXT,
                date TEXT,
                time TEXT,
                passengers TEXT,
                notes TEXT,
                service_type TEXT,
                pricing JSONB,
                total_price NUMERIC(10,2),
                status TEXT,
                payment_status TEXT,
                tracking_id TEXT,
                assigned_driver_name TEXT,
                created_at TEXT,
                updated_at TEXT,
                deleted_at TEXT,
                deleted_by TEXT,
                booking_data JSONB
            );

            CREATE TABLE IF NOT EXISTS admins (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS password_resets (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL,
                token TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS drivers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                vehicle TEXT,
                license TEXT,
                status TEXT DEFAULT 'active',
                active BOOLEAN DEFAULT TRUE,
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS promo_codes (
                id TEXT PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                discount_type TEXT DEFAULT 'percentage',
                discount_value NUMERIC(10,2) DEFAULT 0,
                min_booking_amount NUMERIC(10,2) DEFAULT 0,
                max_uses INTEGER,
                uses_count INTEGER DEFAULT 0,
                expiry_date TEXT,
                active BOOLEAN DEFAULT TRUE,
                description TEXT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS seo_pages (
                page_slug TEXT PRIMARY KEY,
                page_title TEXT,
                meta_description TEXT,
                meta_keywords TEXT,
                hero_heading TEXT,
                hero_subheading TEXT,
                cta_text TEXT,
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS google_calendar_tokens (
                type TEXT PRIMARY KEY,
                access_token TEXT,
                refresh_token TEXT,
                token_type TEXT,
                expires_in INTEGER,
                scope TEXT,
                updated_at TEXT
            );
        """)
    logger.info("Database schema initialized")


async def close_pool():
    """Close the connection pool (call on shutdown)."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
