"""Seed demo catalog for portfolio / local demos when the guest DB is empty."""

from __future__ import annotations

from typing import Any

from app.auth import ensure_guest_user
from app.config import get_settings
from app.database import get_db
from app.utils import color_for_name, initials_from_name, utcnow

SEED_PRODUCTS: list[dict[str, Any]] = [
    {
        "name": "Wireless Earbuds Pro",
        "description": "True wireless earbuds with ANC, 32-hour battery, and IPX5 resistance.",
        "sku": "EL-WEB-001",
        "category": "Electronics",
        "price": 2499,
        "stock": 142,
        "marketplace": "Amazon",
        "marketplaces": ["Amazon"],
        "status": "active",
    },
    {
        "name": "Cotton Oversized Tee",
        "description": "Soft mid-weight cotton tee with a relaxed fit and reinforced stitching.",
        "sku": "FS-COT-014",
        "category": "Fashion",
        "price": 799,
        "stock": 320,
        "marketplace": "Myntra",
        "marketplaces": ["Myntra"],
        "status": "active",
    },
    {
        "name": "Ceramic Coffee Mug Set",
        "description": "Set of four stoneware mugs with a matte glaze. Microwave and dishwasher safe.",
        "sku": "HL-MUG-008",
        "category": "Home & Living",
        "price": 1299,
        "stock": 0,
        "marketplace": "Meesho",
        "marketplaces": ["Meesho"],
        "status": "out_of_stock",
    },
    {
        "name": "Vitamin C Face Serum",
        "description": "Brightening serum with 15% vitamin C and hyaluronic acid.",
        "sku": "BT-VCS-022",
        "category": "Beauty",
        "price": 899,
        "stock": 86,
        "marketplace": "Flipkart",
        "marketplaces": ["Flipkart"],
        "status": "active",
    },
    {
        "name": "Yoga Mat Extra Grip",
        "description": "6mm non-slip yoga mat with alignment markers and carrying strap.",
        "sku": "SP-YOG-003",
        "category": "Sports",
        "price": 1599,
        "stock": 54,
        "marketplace": "Shopify",
        "marketplaces": ["Shopify"],
        "status": "active",
    },
    {
        "name": "Smart LED Desk Lamp",
        "description": "Touch-control desk lamp with USB-C charging and three color modes.",
        "sku": "EL-LED-019",
        "category": "Electronics",
        "price": 1899,
        "stock": 27,
        "marketplace": "Amazon",
        "marketplaces": ["Amazon"],
        "status": "draft",
    },
    {
        "name": "Running Shoes Flex",
        "description": "Lightweight road runners with responsive foam and breathable mesh.",
        "sku": "SP-RUN-007",
        "category": "Sports",
        "price": 3499,
        "stock": 12,
        "marketplace": "Flipkart",
        "marketplaces": ["Flipkart"],
        "status": "active",
    },
    {
        "name": "Bluetooth Speaker Mini",
        "description": "Portable speaker with 12-hour playtime and IP67 rating.",
        "sku": "EL-BSP-042",
        "category": "Electronics",
        "price": 1799,
        "stock": 205,
        "marketplace": "Amazon",
        "marketplaces": ["Amazon", "Shopify"],
        "status": "active",
    },
]

SEED_CONNECTIONS: list[dict[str, Any]] = [
    {
        "marketplace_id": "amazon",
        "status": "connected",
        "credentials": {
            "client_id": "demo-amazon-client",
            "client_secret": "••••••••",
            "merchant_id": "A1DEMOSELLER",
            "seller_id": "SELLER-AMZ-001",
        },
    },
    {
        "marketplace_id": "meesho",
        "status": "connected",
        "credentials": {
            "client_id": "demo-meesho-client",
            "client_secret": "••••••••",
            "merchant_id": "MSH-DEMO-88",
            "seller_id": "SELLER-MSH-001",
        },
    },
]


async def seed_demo_data() -> None:
    settings = get_settings()
    if not settings.seed_demo_data:
        return

    guest = await ensure_guest_user()
    user_id = str(guest["_id"])
    db = get_db()
    now = utcnow()

    if guest.get("name") in ("", "Seller"):
        await db.users.update_one(
            {"_id": guest["_id"]},
            {"$set": {"name": "Demo Seller", "updated_at": now}},
        )

    product_count = await db.products.count_documents({"user_id": user_id})
    if product_count == 0:
        docs = []
        for item in SEED_PRODUCTS:
            docs.append(
                {
                    **item,
                    "user_id": user_id,
                    "discount": 0,
                    "brand": None,
                    "images": [],
                    "image_color": color_for_name(item["name"]),
                    "image_initials": initials_from_name(item["name"]),
                    "created_at": now,
                    "updated_at": now,
                }
            )
        await db.products.insert_many(docs)

    connection_count = await db.marketplace_connections.count_documents({"user_id": user_id})
    if connection_count == 0:
        docs = []
        for item in SEED_CONNECTIONS:
            docs.append(
                {
                    **item,
                    "user_id": user_id,
                    "created_at": now,
                    "updated_at": now,
                }
            )
        await db.marketplace_connections.insert_many(docs)
