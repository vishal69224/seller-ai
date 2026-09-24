from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.database import get_db
from app.schemas import UserOut, UserUpdate
from app.utils import serialize_user, utcnow

router = APIRouter(prefix="/auth", tags=["auth"])


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
