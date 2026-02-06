from backend.server import app
paths = sorted(set([getattr(r,"path","") for r in app.router.routes if getattr(r,"path","")]))
hits = [p for p in paths if p.startswith("/admin") or ("cockpit" in p) or ("agent" in p)]
print("TOTAL_ROUTES:", len(paths))
print("MATCHING_ROUTES:", len(hits))
for p in hits: print(p)
