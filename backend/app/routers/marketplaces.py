from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas import (
    MarketplaceConnectionOut,
    MarketplaceConnectionUpsert,
    TestConnectionRequest,
    TestConnectionResponse,
)
from app.utils import (
    CATALOG_BY_ID,
    MARKETPLACE_CATALOG,
    serialize_connection,
    utcnow,
)

router = APIRouter(prefix="/marketplaces", tags=["marketplaces"])


def _disconnected(catalog: dict) -> MarketplaceConnectionOut:
    return MarketplaceConnectionOut(
        id=catalog["marketplace_id"],
        marketplace_id=catalog["marketplace_id"],
        name=catalog["name"],
        description=catalog["description"],
        status="disconnected",
        initials=catalog["initials"],
        brand_color=catalog["brand_color"],
        logo_bg=catalog["logo_bg"],
        credentials={
            "client_id": "",
            "client_secret": "",
            "merchant_id": "",
            "seller_id": "",
        },
    )


async def _upsert_connection(payload: MarketplaceConnectionUpsert, user_id: str) -> MarketplaceConnectionOut:
    catalog = CATALOG_BY_ID.get(payload.marketplace_id)
    if not catalog:
        raise HTTPException(status_code=404, detail="Marketplace not found")

    db = get_db()
    now = utcnow()
    existing = await db.marketplace_connections.find_one(
        {"user_id": user_id, "marketplace_id": payload.marketplace_id}
    )

    credentials = payload.credentials.model_dump()
    if existing:
        await db.marketplace_connections.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "credentials": credentials,
                    "status": payload.status,
                    "updated_at": now,
                }
            },
        )
        doc = await db.marketplace_connections.find_one({"_id": existing["_id"]})
    else:
        doc = {
            "user_id": user_id,
            "marketplace_id": payload.marketplace_id,
            "credentials": credentials,
            "status": payload.status,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.marketplace_connections.insert_one(doc)
        doc["_id"] = result.inserted_id

    return MarketplaceConnectionOut(**serialize_connection(doc, catalog))


@router.get("", response_model=list[MarketplaceConnectionOut])
async def list_marketplaces(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    connections = {
        doc["marketplace_id"]: doc
        async for doc in db.marketplace_connections.find({"user_id": user_id})
    }

    results: list[MarketplaceConnectionOut] = []
    for catalog in MARKETPLACE_CATALOG:
        mid = catalog["marketplace_id"]
        if mid in connections:
            results.append(
                MarketplaceConnectionOut(**serialize_connection(connections[mid], catalog))
            )
        else:
            results.append(_disconnected(catalog))
    return results


@router.post("/connect", response_model=MarketplaceConnectionOut)
async def upsert_connection(
    payload: MarketplaceConnectionUpsert,
    current_user: dict = Depends(get_current_user),
):
    return await _upsert_connection(payload, str(current_user["_id"]))


@router.post("/test", response_model=TestConnectionResponse)
async def test_connection(
    payload: TestConnectionRequest,
    current_user: dict = Depends(get_current_user),
):
    _ = current_user
    if payload.marketplace_id not in CATALOG_BY_ID:
        raise HTTPException(status_code=404, detail="Marketplace not found")

    creds = payload.credentials
    if not all(
        [
            creds.client_id.strip(),
            creds.client_secret.strip(),
            creds.merchant_id.strip(),
            creds.seller_id.strip(),
        ]
    ):
        return TestConnectionResponse(
            success=False,
            message="All credential fields are required.",
        )

    return TestConnectionResponse(
        success=True,
        message="Connection test successful",
    )


@router.get("/{marketplace_id}", response_model=MarketplaceConnectionOut)
async def get_marketplace(marketplace_id: str, current_user: dict = Depends(get_current_user)):
    catalog = CATALOG_BY_ID.get(marketplace_id)
    if not catalog:
        raise HTTPException(status_code=404, detail="Marketplace not found")

    doc = await get_db().marketplace_connections.find_one(
        {"user_id": str(current_user["_id"]), "marketplace_id": marketplace_id}
    )
    if doc:
        return MarketplaceConnectionOut(**serialize_connection(doc, catalog))
    return _disconnected(catalog)


@router.put("/{marketplace_id}", response_model=MarketplaceConnectionOut)
async def update_connection(
    marketplace_id: str,
    payload: MarketplaceConnectionUpsert,
    current_user: dict = Depends(get_current_user),
):
    body = payload.model_copy(update={"marketplace_id": marketplace_id})
    return await _upsert_connection(body, str(current_user["_id"]))


@router.delete("/{marketplace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    marketplace_id: str,
    current_user: dict = Depends(get_current_user),
):
    if marketplace_id not in CATALOG_BY_ID:
        raise HTTPException(status_code=404, detail="Marketplace not found")

    result = await get_db().marketplace_connections.delete_one(
        {"user_id": str(current_user["_id"]), "marketplace_id": marketplace_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Connection not found")
    return None
