export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <html>
      <body style={{ padding: 32, fontFamily: 'system-ui, Segoe UI, Arial' }}>
        <h1>ADMIN (STATIC SERVER RENDER)</h1>
        <p><b>STAMP:</b> ADMIN_SERVER_STATIC_20260208</p>
        <p>If you see this, the server-rendered route works even if client JS is broken.</p>
        <p>Next: we fix the global client crash, then install cockpit UI.</p>
      </body>
    </html>
  );
}