import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/admin/:path*'],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Map /api/admin/* -> https://api.hibiscustoairport.co.nz/admin/*
  const mappedPath = url.pathname.replace(/^\/api\/admin/, '/admin');
  const target = new URL('https://api.hibiscustoairport.co.nz' + mappedPath + url.search);

  const headers = new Headers(req.headers);
  headers.delete('host');

  // Tag request so backend logs can show it
  headers.set('x-hibi-proxy', 'HIBI_MW_PROXY_OK_20260206_210853');

  const body =
    req.method === 'GET' || req.method === 'HEAD'
      ? undefined
      : await req.arrayBuffer();

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  });

  const outHeaders = new Headers(upstream.headers);

  // Add proof header so curl can confirm middleware executed
  outHeaders.set('x-hibi-mw-proof', 'HIBI_MW_PROXY_OK_20260206_210853');
  outHeaders.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}