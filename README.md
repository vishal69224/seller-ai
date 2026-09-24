# Seller Hub

Portfolio demo of a **multi-marketplace seller admin**: manage a product catalog, connect marketplace accounts, and generate AI product showcase videos with [kie.ai](https://kie.ai).

**Stack:** React 19 · Vite · Tailwind CSS · FastAPI · MongoDB · kie.ai Video API

> Guest mode — open the app and explore. No login screen.

---

## Highlights

- **Products** — full CRUD against a real FastAPI + MongoDB backend
- **Marketplace** — connect / test / disconnect Amazon, Flipkart, Meesho, Myntra, Shopify (demo credentials API)
- **Video Generator** — upload product images and generate short AI videos (requires `KIE_API_KEY`)
- **Settings** — update the shared guest profile
- **Dashboard** — live catalog stats (product count, stock, connected stores)
- Honest **Sample data** labels on Orders, Analytics, and Upload History (UI demos)

## Feature matrix

| Area | Status |
|------|--------|
| Products CRUD | Live API |
| Marketplace connections | Live API (demo credentials) |
| Video Generator | Live kie.ai API (optional key) |
| Settings / guest profile | Live API |
| Dashboard stats | Live aggregates |
| Orders / Analytics / Upload History | Sample UI data |

---

## Quick start

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB on `mongodb://localhost:27017`  
  or: `cd backend && docker compose up -d`

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Optional: set KIE_API_KEY in .env for Video Generator
./run.sh
```

- API: http://127.0.0.1:8000  
- Docs: http://127.0.0.1:8000/docs  

On first boot (when the guest catalog is empty), the API seeds **8 demo products** and **2 marketplace connections**.

### Frontend

```bash
npm install
npm run dev
```

App: http://localhost:5173  

Vite proxies `/api` → the Seller Hub API on port 8000.

Or run both from the repo root:

```bash
npm run dev:all
```

---

## Environment

Copy `backend/.env.example` → `backend/.env`:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` / `MONGODB_DB` | Mongo connection |
| `CORS_ORIGINS` | Allowed front-end origins (comma-separated) |
| `SEED_DEMO_DATA` | `true` (default) seeds demo catalog when empty |
| `KIE_API_KEY` | Optional — from https://kie.ai/api-key |
| `JWT_SECRET` | Change for any public deploy |

**Never commit real API keys.** `.env` is gitignored; `.env.example` uses placeholders only.

---

## Main API routes

- `GET` / `PATCH` `/api/auth/me` — guest profile
- `GET` / `POST` `/api/products`, `GET` / `PUT` / `DELETE` `/api/products/{id}`
- `GET` `/api/marketplaces`, `POST` `/api/marketplaces/connect`, `POST` `/api/marketplaces/test`
- `GET` `/api/video/health`, `POST` `/api/video/generate`, `GET` `/api/video/tasks/{task_id}`
- `GET` `/api/health`

---

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for MongoDB Atlas, Render/Railway (API), and Vercel/Netlify (frontend) notes.

---

## Project structure

```
├── src/                 # React app (pages, layout, UI)
├── backend/app/         # FastAPI routers, auth, seed, kie_video
├── backend/docker-compose.yml
├── README.md
└── DEPLOY.md
```

---

## Portfolio notes

This project is designed to show end-to-end full-stack work: typed React UI, REST API design, Mongo persistence, third-party AI integration, and clear separation between **production-shaped** features and **illustrative** UI modules. Deploy a live URL (see DEPLOY.md) and link it from your portfolio site / GitHub README for the strongest first impression.
