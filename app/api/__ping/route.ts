export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response('OK ADMIN_FORCE_RENDER_20260208', {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}