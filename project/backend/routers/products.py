from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models

router = APIRouter(prefix="/api/products", tags=["products"])


def product_out(p: models.Product) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "brand": p.brand,
        "size": p.size,
        "season": p.season,
        "speed_index": p.speed_index,
        "load_index": p.load_index,
        "price": p.price,
        "stock": p.stock,
        "description": p.description,
        "image_url": p.image_url,
        "category": {"id": p.category.id, "name": p.category.name} if p.category else None,
    }


@router.get("")
def list_products(
    search:   Optional[str] = None,
    season:   Optional[str] = None,
    brand:    Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    category_id: Optional[int] = None,
    sort:     str = "price_asc",
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(models.Product)
    if search:
        q = q.filter(
            models.Product.name.ilike(f"%{search}%") |
            models.Product.brand.ilike(f"%{search}%") |
            models.Product.size.ilike(f"%{search}%")
        )
    if season:
        q = q.filter(models.Product.season == season)
    if brand:
        q = q.filter(models.Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        q = q.filter(models.Product.price >= min_price)
    if max_price is not None:
        q = q.filter(models.Product.price <= max_price)
    if category_id:
        q = q.filter(models.Product.category_id == category_id)

    if sort == "price_asc":
        q = q.order_by(models.Product.price.asc())
    elif sort == "price_desc":
        q = q.order_by(models.Product.price.desc())
    else:
        q = q.order_by(models.Product.id.asc())

    total = q.count()
    items = q.offset(skip).limit(limit).all()
    return {"total": total, "items": [product_out(p) for p in items]}


@router.get("/brands")
def list_brands(db: Session = Depends(get_db)):
    rows = db.query(models.Product.brand).distinct().all()
    return sorted([r[0] for r in rows])


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        from fastapi import HTTPException
        raise HTTPException(404, "Product not found")
    return product_out(p)
