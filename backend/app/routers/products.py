from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas import ProductCreate, ProductOut, ProductUpdate
from app.utils import (
    color_for_name,
    initials_from_name,
    serialize_product,
    utcnow,
)

router = APIRouter(prefix="/products", tags=["products"])


def _parse_oid(product_id: str) -> ObjectId:
    try:
        return ObjectId(product_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Product not found") from exc


@router.get("", response_model=list[ProductOut])
async def list_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    current_user: dict = Depends(get_current_user),
):
    query: dict = {"user_id": str(current_user["_id"])}
    if category and category != "All Categories":
        query["category"] = category
    if status_filter and status_filter != "All Statuses":
        mapping = {
            "Active": "active",
            "Draft": "draft",
            "Out of Stock": "out_of_stock",
            "Archived": "archived",
            "active": "active",
            "draft": "draft",
            "out_of_stock": "out_of_stock",
            "archived": "archived",
        }
        query["status"] = mapping.get(status_filter, status_filter)

    cursor = get_db().products.find(query).sort("created_at", -1)
    products = []
    async for doc in cursor:
        if search:
            q = search.lower()
            hay = f"{doc.get('name','')} {doc.get('sku','')} {doc.get('marketplace','')}".lower()
            if q not in hay:
                continue
        products.append(ProductOut(**serialize_product(doc)))
    return products


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, current_user: dict = Depends(get_current_user)):
    doc = await get_db().products.find_one(
        {"_id": _parse_oid(product_id), "user_id": str(current_user["_id"])}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductOut(**serialize_product(doc))


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    current_user: dict = Depends(get_current_user),
):
    now = utcnow()
    status_value = payload.status
    if payload.stock == 0 and status_value == "active":
        status_value = "out_of_stock"

    doc = {
        **payload.model_dump(),
        "status": status_value,
        "user_id": str(current_user["_id"]),
        "image_initials": initials_from_name(payload.name),
        "image_color": color_for_name(payload.name),
        "created_at": now,
        "updated_at": now,
    }
    if not doc.get("marketplaces") and doc.get("marketplace"):
        doc["marketplaces"] = [doc["marketplace"]]
    if doc.get("marketplaces") and not doc.get("marketplace"):
        doc["marketplace"] = doc["marketplaces"][0]
    result = await get_db().products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return ProductOut(**serialize_product(doc))


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    payload: ProductUpdate,
    current_user: dict = Depends(get_current_user),
):
    oid = _parse_oid(product_id)
    existing = await get_db().products.find_one(
        {"_id": oid, "user_id": str(current_user["_id"])}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "name" in updates:
        updates["image_initials"] = initials_from_name(updates["name"])
        updates["image_color"] = color_for_name(updates["name"])
    if "stock" in updates and updates["stock"] == 0 and updates.get("status", existing.get("status")) == "active":
        updates["status"] = "out_of_stock"
    updates["updated_at"] = utcnow()

    await get_db().products.update_one({"_id": oid}, {"$set": updates})
    doc = await get_db().products.find_one({"_id": oid})
    return ProductOut(**serialize_product(doc))


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    result = await get_db().products.delete_one(
        {"_id": _parse_oid(product_id), "user_id": str(current_user["_id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return None
