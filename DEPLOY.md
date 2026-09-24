# Deploy Seller Hub

Checklist for hosting a **public portfolio demo**: MongoDB Atlas + API host + static frontend.

Replace every `YOUR_*` placeholder with your real values. Do **not** commit secrets.

---

## 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. Database Access → create a user with a strong password.
3. Network Access → allow your API host IPs (or `0.0.0.0/0` for a short-lived demo).
4. Connect → Drivers → copy the URI, e.g.  
   `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Use database name `seller_hub` (or set `MONGODB_DB` to match).

---

## 2. Backend API (Render / Railway / Fly.io)

Recommended env vars on the API service:

```bash
MONGODB_URI=mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net
MONGODB_DB=seller_hub
JWT_SECRET=generate-a-long-random-string
CORS_ORIGINS=https://YOUR_FRONTEND_DOMAIN
SEED_DEMO_DATA=true
KIE_API_KEY=               # optional; leave empty if not demoing video
KIE_API_BASE_URL=https://api.kie.ai
KIE_UPLOAD_BASE_URL=https://kieai.redpandaai.co
PORT=8000
```

### Start command

From the `backend` folder (adjust for your host’s root directory):

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Health check path: `/api/health`

### Notes

- Set `PYTHONPATH` / working directory so `app` is importable (`backend` as root).
- First request after deploy seeds demo products if the DB is empty.
- Hot-reload (`./run.sh`) is for local only — use plain `uvicorn` in production.
- Rotate any key that was ever committed to git history.

---

## 3. Frontend (Vercel / Netlify)

1. Build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Node:** 20+
2. Point the API proxy / base URL at your deployed API.

### Option A — Vite env + absolute API (simplest for demos)

Add a production API base if you later introduce `VITE_API_URL`. Today the app calls `/api/...` and relies on a reverse proxy.

### Option B — Platform rewrite (keep `/api` relative)

**Vercel** (`vercel.json` example):

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR_API_HOST/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify** (`public/_redirects` or `netlify.toml`):

```toml
[[redirects]]
  from = "/api/*"
  to = "https://YOUR_API_HOST/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Update `CORS_ORIGINS` on the API to include `https://YOUR_FRONTEND_DOMAIN`.

---

## 4. Smoke test after deploy

1. Open the frontend URL — demo banner should appear.
2. Dashboard shows non-zero product / connected-store stats (seed ran).
3. Products → edit / add works.
4. Marketplace → Amazon / Meesho show Connected.
5. `/api/health` returns `{"status":"ok"}`.
6. Video Generator: without `KIE_API_KEY`, health should report key not configured (UI still loads).

---

## 5. Portfolio presentation tips

- Put the **live demo URL** at the top of your GitHub README.
- Add 3–4 screenshots: Dashboard, Products, Marketplace, Video Generator.
- In your portfolio write-up, mention: React + FastAPI, MongoDB, guest demo mode, and which panels are sample data.
- Prefer a short Loom / GIF of generating a video if you have a kie.ai key on the hosted API.

---

## Local vs production

| Concern | Local | Production |
|---------|-------|------------|
| Mongo | `localhost:27017` or Docker | Atlas |
| CORS | `localhost:5173` | Your frontend origin |
| Secrets | `backend/.env` (gitignored) | Host env dashboard |
| Process | `./run.sh` + `npm run dev` | `uvicorn` + static CDN |
