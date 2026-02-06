const BACKEND = 'https://api.hibiscustoairport.co.nz';
const PROOF = 'HIBI_VERCEL_FN_PROXY_OK_20260206_211933';

// NOTE: This is a Vercel Serverless Function.
// It will override SPA index.html for /api/admin/* automatically.

module.exports = async (req, res) => {
  try {
    // Build backend target URL:
    // /api/admin/<x>  ->  https://api.hibiscustoairport.co.nz/admin/<x>
    const parts = (req.url || '').split('?');
    const pathOnly = parts[0] || '';
    const qs = parts.length > 1 ? ('?' + parts.slice(1).join('?')) : '';

    // strip leading /api/admin
    const subPath = pathOnly.replace(/^\/api\/admin/, '');
    const target = BACKEND + '/admin' + subPath + qs;

    // Copy headers (drop host)
    const headers = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (!k) continue;
      if (k.toLowerCase() === 'host') continue;
      headers[k] = v;
    }

    // Add proof headers
    headers['x-hibi-proxy'] = PROOF;

    // Read body (if any)
    const chunks = [];
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      for await (const c of req) chunks.push(c);
    }
    const body = chunks.length ? Buffer.concat(chunks) : undefined;

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: 'manual'
    });

    // Copy upstream headers back
    upstream.headers.forEach((value, key) => {
      // avoid invalid hop-by-hop headers
      if (key.toLowerCase() === 'transfer-encoding') return;
      if (key.toLowerCase() === 'content-encoding') {
        // let Vercel handle encoding; still pass through in most cases
      }
      res.setHeader(key, value);
    });

    // Force no-cache so you can see changes instantly while debugging
    res.setHeader('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('pragma', 'no-cache');
    res.setHeader('x-hibi-fn-proof', PROOF);

    res.statusCode = upstream.status;

    // Stream body
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('x-hibi-fn-proof', PROOF);
    res.end('Proxy error: ' + (e && e.message ? e.message : String(e)));
  }
};