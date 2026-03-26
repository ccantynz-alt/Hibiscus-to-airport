// /api/seo
// GET /api/seo?slug=xxx — public, get SEO data for a page
// PUT /api/seo — admin, update SEO data

const { getDb } = require("./lib/db");
const { authenticateRequest } = require("./lib/auth");
const { ok, badRequest, unauthorized, notFound, serverError, methodNotAllowed } = require("./lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method === "GET") return getSeo(req, res);
  if (req.method === "PUT") return updateSeo(req, res);
  return methodNotAllowed(res, ["GET", "PUT"]);
};

async function getSeo(req, res) {
  const { slug } = req.query;
  if (!slug) return badRequest(res, "slug query parameter is required");

  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM seo_pages WHERE page_slug = ${slug}`;
    if (rows.length === 0) return notFound(res, "No SEO data for this page");
    return ok(res, { seo: rows[0] });
  } catch (err) {
    return serverError(res, err.message);
  }
}

async function updateSeo(req, res) {
  const user = authenticateRequest(req);
  if (!user) return unauthorized(res);

  const { page_slug, page_title, meta_description, meta_keywords, hero_heading, hero_subheading, cta_text } = req.body || {};
  if (!page_slug) return badRequest(res, "page_slug is required");

  try {
    const sql = getDb();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO seo_pages (page_slug, page_title, meta_description, meta_keywords, hero_heading, hero_subheading, cta_text, created_at, updated_at)
      VALUES (${page_slug}, ${page_title || ""}, ${meta_description || ""}, ${meta_keywords || ""}, ${hero_heading || ""}, ${hero_subheading || ""}, ${cta_text || "Book Now"}, ${now}, ${now})
      ON CONFLICT (page_slug) DO UPDATE SET
        page_title = EXCLUDED.page_title,
        meta_description = EXCLUDED.meta_description,
        meta_keywords = EXCLUDED.meta_keywords,
        hero_heading = EXCLUDED.hero_heading,
        hero_subheading = EXCLUDED.hero_subheading,
        cta_text = EXCLUDED.cta_text,
        updated_at = EXCLUDED.updated_at
    `;

    return ok(res, { message: "SEO data saved" });
  } catch (err) {
    return serverError(res, err.message);
  }
}
