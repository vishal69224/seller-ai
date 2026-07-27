# Multi Marketplace Seller Hub

React + FastAPI + MongoDB admin dashboard.

## Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB running on `mongodb://localhost:27017`

Start MongoDB with Docker:

```bash
cd backend
docker compose up -d
```

Or point `backend/.env` `MONGODB_URI` at your MongoDB Atlas / local instance.

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./run.sh
```

API: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/docs

### Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET|PATCH /api/auth/me`
- `GET|POST /api/products`
- `GET|PUT|DELETE /api/products/{id}`
- `GET /api/marketplaces`
- `POST /api/marketplaces/connect`
- `PUT|DELETE /api/marketplaces/{marketplace_id}`
- `POST /api/marketplaces/test`

## Frontend

```bash
npm install
npm run dev
```

App: http://localhost:5173  
Vite proxies `/api` → `http://127.0.0.1:8000`.

Register/login at `/login`, then use Products and Marketplace forms against the API.
