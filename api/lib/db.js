// api/lib/db.js
// Neon PostgreSQL connection for Vercel Serverless Functions
// Uses @neondatabase/serverless — designed for serverless (HTTP-based, no persistent connections)

const { neon } = require("@neondatabase/serverless");

let _sql = null;

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Schema initialization — run once on first deploy or via a setup endpoint
async function initSchema() {
  const sql = getDb();
  await sql`
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
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT
    )
  `;

  await sql`
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
    )
  `;

  await sql`
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
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS google_calendar_tokens (
      type TEXT PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT,
      token_type TEXT,
      expires_in INTEGER,
      scope TEXT,
      updated_at TEXT
    )
  `;

  // Add indexes for performance (idempotent — IF NOT EXISTS)
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings (booking_ref)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings (email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_payment ON bookings (payment_status)`;

  return { ok: true, message: "Schema initialized with indexes" };
}

module.exports = { getDb, initSchema };
