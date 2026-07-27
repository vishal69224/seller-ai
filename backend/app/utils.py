from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId

MARKETPLACE_CATALOG = [
    {
        "marketplace_id": "meesho",
        "name": "Meesho",
        "description": "Sell across India's social commerce network",
        "initials": "M",
        "brand_color": "text-[#9F2D55]",
        "logo_bg": "bg-[#FCE8F0]",
    },
    {
        "marketplace_id": "flipkart",
        "name": "Flipkart",
        "description": "Reach millions of shoppers on Flipkart",
        "initials": "Fk",
        "brand_color": "text-[#2874F0]",
        "logo_bg": "bg-[#E8F1FE]",
    },
    {
        "marketplace_id": "myntra",
        "name": "Myntra",
        "description": "List fashion & lifestyle products on Myntra",
        "initials": "My",
        "brand_color": "text-[#FF3F6C]",
        "logo_bg": "bg-[#FFE8EE]",
    },
    {
        "marketplace_id": "amazon",
        "name": "Amazon",
        "description": "Connect your Amazon Seller Central account",
        "initials": "Az",
        "brand_color": "text-[#FF9900]",
        "logo_bg": "bg-[#FFF4E0]",
    },
    {
        "marketplace_id": "shopify",
        "name": "Shopify",
        "description": "Sync catalog & inventory with your Shopify store",
        "initials": "Sh",
        "brand_color": "text-[#96BF48]",
        "logo_bg": "bg-[#F0F7E4]",
    },
]

CATALOG_BY_ID = {item["marketplace_id"]: item for item in MARKETPLACE_CATALOG}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def oid_str(value: ObjectId | str) -> str:
    return str(value)


def initials_from_name(name: str) -> str:
    parts = [p for p in name.strip().split() if p]
    if not parts:
        return "PR"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[1][0]}".upper()


COLOR_CYCLE = [
    "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    "bg-teal-500/15 text-teal-700 dark:text-teal-400",
    "bg-violet-500/15 text-violet-700 dark:text-violet-400",
]


def color_for_name(name: str) -> str:
    return COLOR_CYCLE[sum(ord(c) for c in name) % len(COLOR_CYCLE)]


def serialize_user(doc: dict) -> dict:
    return {
        "id": oid_str(doc["_id"]),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "phone": doc.get("phone"),
        "company": doc.get("company"),
        "gstin": doc.get("gstin"),
        "address": doc.get("address"),
    }


def serialize_product(doc: dict) -> dict:
    marketplaces = doc.get("marketplaces") or []
    marketplace = doc.get("marketplace") or (marketplaces[0] if marketplaces else "Amazon")
    return {
        "id": oid_str(doc["_id"]),
        "name": doc.get("name", ""),
        "description": doc.get("description", ""),
        "sku": doc.get("sku", ""),
        "category": doc.get("category", "Electronics"),
        "brand": doc.get("brand"),
        "price": float(doc.get("price", 0)),
        "discount": float(doc.get("discount", 0)),
        "stock": int(doc.get("stock", 0)),
        "marketplace": marketplace,
        "marketplaces": marketplaces,
        "status": doc.get("status", "draft"),
        "images": doc.get("images", []),
        "weight": doc.get("weight"),
        "length": doc.get("length"),
        "width": doc.get("width"),
        "height": doc.get("height"),
        "image_color": doc.get("image_color") or color_for_name(doc.get("name", "P")),
        "image_initials": doc.get("image_initials")
        or initials_from_name(doc.get("name", "Product")),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def serialize_connection(doc: dict, catalog: dict | None = None) -> dict:
    meta = catalog or CATALOG_BY_ID.get(doc["marketplace_id"], {})
    credentials = doc.get("credentials") or {}
    return {
        "id": oid_str(doc["_id"]),
        "marketplace_id": doc["marketplace_id"],
        "name": meta.get("name", doc["marketplace_id"].title()),
        "description": meta.get("description", ""),
        "status": doc.get("status", "disconnected"),
        "initials": meta.get("initials", "MP"),
        "brand_color": meta.get("brand_color", "text-primary"),
        "logo_bg": meta.get("logo_bg", "bg-muted"),
        "credentials": {
            "client_id": credentials.get("client_id", ""),
            "client_secret": credentials.get("client_secret", ""),
            "merchant_id": credentials.get("merchant_id", ""),
            "seller_id": credentials.get("seller_id", ""),
        },
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }
