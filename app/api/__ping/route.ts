import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json(
    { ok: true, service: "hibiscus-frontend", utc: new Date().toISOString(), stamp: process.env.HIBI_FRONTEND_STAMP || "no_stamp_set" },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", "Pragma": "no-cache" } }
  );
}
