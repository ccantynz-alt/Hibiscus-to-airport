export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.status(200).json({ ok: true, service: "hibiscus-frontend", utc: new Date().toISOString() });
}
^Z
