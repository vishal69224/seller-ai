from fastapi import APIRouter, HTTPException, status

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.schemas import TokenResponse, UserCreate, UserLogin, UserOut, UserUpdate
from app.utils import serialize_user, utcnow
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "phone": payload.phone,
        "company": None,
        "gstin": None,
        "address": None,
        "created_at": utcnow(),
        "updated_at": utcnow(),
    }
    result = await db.users.insert_one(doc)
    token = create_access_token(str(result.inserted_id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(**serialize_user(current_user))


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if updates:
        updates["updated_at"] = utcnow()
        await get_db().users.update_one({"_id": current_user["_id"]}, {"$set": updates})
        current_user = await get_db().users.find_one({"_id": current_user["_id"]})
    return UserOut(**serialize_user(current_user))
