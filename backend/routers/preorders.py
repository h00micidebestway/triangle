from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from database import get_db
import models
import auth as auth_utils

router = APIRouter(prefix="/api/preorders", tags=["preorders"])


class PreorderIn(BaseModel):
    name: str
    email: str
    size: str
    season: str
    comment: str = ""


@router.post("")
def create_preorder(
    data: PreorderIn,
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(auth_utils.get_current_user_optional),
):
    po = models.Preorder(
        user_id=current_user.id if current_user else None,
        name=data.name,
        email=data.email,
        size=data.size,
        season=data.season,
        comment=data.comment,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(po)
    db.commit()
    return {"message": "Заявка принята. Мы свяжемся с вами в ближайшее время."}
