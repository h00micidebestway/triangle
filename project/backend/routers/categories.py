from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(models.Category).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug} for c in cats]
