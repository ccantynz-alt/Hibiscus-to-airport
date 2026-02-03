# Hibiscus-to-airport (Render Docker)
# Runs FastAPI app defined in backend/server.py as: app = FastAPI(...)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (keep minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Install python deps first for layer caching
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy application code
COPY backend /app/backend

# Render provides $PORT. Default to 10000 for local runs.
ENV PORT=10000

# Optional: container-level healthcheck (does not block Render, but helps locally/other platforms)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/debug/stamp" || exit 1

# IMPORTANT: run the REAL module path (no Root Directory ambiguity)
CMD ["sh","-lc","python -c \"import backend.server as s; assert hasattr(s,'app'); print('IMPORT_OK')\" && uvicorn backend.server:app --host 0.0.0.0 --port ${PORT}"]
