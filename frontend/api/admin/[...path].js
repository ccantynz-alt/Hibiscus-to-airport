module.exports = async (req, res) => {
  try {
    const path = (req.query && req.query.path) ? req.query.path : [];
    const segs = Array.isArray(path) ? path : [path];

    const backend = process.env.REACT_APP_BACKEND_URL || process.env.BACKEND_URL;
    if (!backend) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok:false, error:"Missing BACKEND_URL/REACT_APP_BACKEND_URL", where:"frontend/api/admin/[...path].js" }));
      return;
    }

    const url = backend.replace(/\/+$/,"") + "/admin/" + segs.map(encodeURIComponent).join("/");
    const method = req.method || "GET";

    const headers = {};
    for (const [k,v] of Object.entries(req.headers || {})) {
      if (!k) continue;
      const lk = String(k).toLowerCase();
      if (lk === "host") continue;
      if (lk === "content-length") continue;
      headers[k] = v;
    }

    const hasBody = !["GET","HEAD"].includes(method.toUpperCase());
    const upstream = await fetch(url, {
      method,
      headers,
      body: hasBody ? req : undefined,
      redirect: "manual"
    });

    res.statusCode = upstream.status;

    upstream.headers.forEach((v, k) => {
      const lk = String(k).toLowerCase();
      if (lk === "transfer-encoding") return;
      if (lk === "content-encoding") return;
      res.setHeader(k, v);
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type","application/json");
    res.end(JSON.stringify({ ok:false, error:String(e && e.message ? e.message : e), where:"frontend/api/admin/[...path].js" }));
  }
};