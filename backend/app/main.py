from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import close_db, connect_db
from app.routers import auth, marketplaces, products, video
from app.seed import seed_demo_data


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_db()
    await seed_demo_data()
    yield
    await close_db()


settings = get_settings()
app = FastAPI(title="Seller Hub API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(marketplaces.router, prefix="/api")
app.include_router(video.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
