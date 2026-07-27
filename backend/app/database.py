from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    global client, db
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]
    await db.command("ping")
    await db.users.create_index("email", unique=True)
    await db.products.create_index([("user_id", 1), ("sku", 1)])
    await db.marketplace_connections.create_index(
        [("user_id", 1), ("marketplace_id", 1)],
        unique=True,
    )


async def close_db() -> None:
    global client, db
    if client is not None:
        client.close()
    client = None
    db = None


def get_db() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database is not initialized")
    return db
