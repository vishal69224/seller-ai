from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings
from app.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

GUEST_EMAIL = "guest@sellerhub.app"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def ensure_guest_user() -> dict[str, Any]:
    """Return the shared local guest user, creating it if needed."""
    db = get_db()
    user = await db.users.find_one({"email": GUEST_EMAIL})
    if user:
        return user

    now = datetime.now(timezone.utc)
    doc = {
        "name": "Demo Seller",
        "email": GUEST_EMAIL,
        "password_hash": hash_password("guest"),
        "phone": "",
        "company": "",
        "gstin": "",
        "address": "",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, Any]:
    """Auth is optional — fall back to the shared guest account when no token is present."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        return await ensure_guest_user()

    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = payload.get("sub")
        if not user_id:
            return await ensure_guest_user()
    except JWTError:
        return await ensure_guest_user()

    from bson import ObjectId

    try:
        oid = ObjectId(user_id)
    except Exception:
        return await ensure_guest_user()

    user = await get_db().users.find_one({"_id": oid})
    if not user:
        return await ensure_guest_user()
    return user
