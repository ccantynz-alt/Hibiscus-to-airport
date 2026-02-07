const { URL } = require('url');

function getBackendOrigin() {
  // Prefer explicit env var; fallback to REACT_APP_BACKEND_URL if you already use it.
  return (
    process.env.HIBI_BACKEND_ORIGIN ||
    process.env.BACKEND_ORIGIN ||
    process.env.REACT_APP_BACKEND_URL ||
    "https://api.hibiscustoairport.co.nz"
  ).replace(/\/+$/, "");
}

module.exports = async (req, res) => {
  try {
    const origin = getBackendOrigin();

    // This function is mounted at /api/admin/[...path]
    // We proxy to backend /admin/[...path]
    const rawUrl = req.url || "";
    const pathAfter = rawUrl.replace(/^\/api\/admin\/?/, ""); // strip /api/admin/
    const target = new URL(origin + "/admin/" + pathAfter);

    const headers = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      // Drop hop-by-hop headers
      if (!k) continue;
      const lk = String(k).toLowerCase();
      if (lk === "host" || lk === "connection" || lk === "content-length") continue;
      headers[k] = v;
    }

    const method = (req.method || "GET").toUpperCase();
    const body = (method === "GET" || method === "HEAD") ? undefined : req;

    const fetchImpl = global.fetch || require('node-fetch');

    const resp = await fetchImpl(target.toString(), {
      method,
      headers,
      body,
      redirect: "manual",
    });

    // Pass through status + headers (careful with set-cookie: Vercel supports multiple)
    res.status(resp.status);

    resp.headers.forEach((value, key) => {
      const lk = key.toLowerCase();
      if (lk === "transfer-encoding") return;
      if (lk === "content-encoding") return;

      if (lk === "set-cookie") {
        // node-fetch may combine; Vercel wants array
        const cookies = resp.headers.raw && resp.headers.raw()['set-cookie'];
        if (cookies && Array.isArray(cookies)) res.setHeader('set-cookie', cookies);
        else res.setHeader('set-cookie', value);
        return;
      }

      res.setHeader(key, value);
    });

    // Stream back
    if (resp.body && resp.body.pipe) {
      resp.body.pipe(res);
    } else {
      const buf = Buffer.from(await resp.arrayBuffer());
      res.end(buf);
    }
  } catch (e) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({ ok: false, error: String(e && e.message ? e.message : e) });
  }
};