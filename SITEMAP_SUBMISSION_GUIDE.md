# Sitemap Submission Guide for Hibiscus to Airport

## 📍 Sitemap Details

**Sitemap URL:** https://hibiscustoairport.co.nz/sitemap.xml  
**Robots.txt URL:** https://hibiscustoairport.co.nz/robots.txt  
**Total URLs:** 28 pages

## 📄 Pages Included in Sitemap

### Main Pages (Priority: 0.9-1.0)
- Homepage (/)
- Booking page (/booking)
- Book Now (/book-now)
- Service Areas (/service-areas)

### Service Pages (Priority: 0.7-0.8)
- Auckland Airport Transfers
- Student Airport Transfers
- Corporate Airport Transfers
- Cruise Ship Transfers

### Suburb Pages - Hibiscus Coast (Priority: 0.6-0.8)
- Orewa Airport Shuttle
- Silverdale Airport Shuttle
- Whangaparaoa Airport Shuttle
- Red Beach Airport Shuttle
- Gulf Harbour Airport Shuttle
- Stanmore Bay Airport Shuttle
- Arkles Bay Airport Shuttle
- Army Bay Airport Shuttle
- Hatfields Beach Airport Shuttle

### Suburb Pages - North Shore (Priority: 0.7)
- Manly Airport Shuttle
- Albany Airport Shuttle
- Takapuna Airport Shuttle
- Browns Bay Airport Shuttle
- Mairangi Bay Airport Shuttle
- Devonport Airport Shuttle

### School Pages (Priority: 0.7)
- Orewa College Airport Shuttle
- Whangaparaoa College Airport Shuttle
- Kingsway School Airport Shuttle
- Long Bay College Airport Shuttle
- Rangitoto College Airport Shuttle

## 🚀 How to Submit Your Sitemap

### Option 1: Google Search Console (Recommended)
1. Go to: https://search.google.com/search-console
2. Add property: `hibiscustoairport.co.nz`
3. Verify ownership (via DNS TXT record or HTML file upload)
4. Navigate to: **Sitemaps** (left sidebar)
5. Enter sitemap URL: `https://hibiscustoairport.co.nz/sitemap.xml`
6. Click **Submit**

### Option 2: Bing Webmaster Tools
1. Go to: https://www.bing.com/webmasters
2. Add your site: `hibiscustoairport.co.nz`
3. Verify ownership
4. Navigate to: **Sitemaps**
5. Submit: `https://hibiscustoairport.co.nz/sitemap.xml`

### Option 3: Direct Ping (Alternative)
You can ping search engines directly with these URLs:

**Google:**
```
https://www.google.com/ping?sitemap=https://hibiscustoairport.co.nz/sitemap.xml
```

**Bing:**
```
https://www.bing.com/ping?sitemap=https://hibiscustoairport.co.nz/sitemap.xml
```

## ✅ Verification Steps

After submitting your sitemap:

1. **Check Sitemap Status** (Google Search Console)
   - Go to Sitemaps section
   - Check "Status" column - should show "Success"
   - Check "Discovered URLs" count

2. **Monitor Indexing**
   - Wait 24-48 hours for initial crawling
   - Check "Coverage" report to see indexed pages
   - Use: `site:hibiscustoairport.co.nz` in Google to see indexed pages

3. **Verify Sitemap Accessibility**
   - Visit: https://hibiscustoairport.co.nz/sitemap.xml
   - Ensure it loads correctly in browser
   - Should display XML structure

## 📊 Expected Timeline

- **Sitemap Discovery:** 1-2 hours after submission
- **First Crawl:** 24-48 hours
- **Full Indexing:** 1-2 weeks
- **Ranking Improvements:** 2-4 weeks

## 🔄 Maintenance

**Update Frequency:** Your sitemap is set to update:
- Homepage: Weekly
- Booking pages: Monthly
- SEO pages: Monthly

**When to Resubmit:**
- After adding new pages
- After major content updates
- If sitemap errors appear in Search Console

## 🛠️ Robots.txt Configuration

Your robots.txt file is configured to:
- ✅ Allow all search engines
- ✅ Reference your sitemap
- ❌ Block admin pages (/admin/*)
- ❌ Block payment pages (/payment/*)

**Verify at:** https://hibiscustoairport.co.nz/robots.txt

## 📞 Support

If you need to add more pages to the sitemap:
1. Add new routes to `/app/frontend/src/App.js`
2. Update `/app/frontend/public/sitemap.xml`
3. Resubmit via Google Search Console

---

**Note:** Sitemap and robots.txt files are located in:
- `/app/frontend/public/sitemap.xml`
- `/app/frontend/public/robots.txt`

These files are now live and accessible at your domain once DNS is configured!
