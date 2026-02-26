from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database import get_db
import models
import auth as auth_utils

router = APIRouter(prefix="/api/orders", tags=["orders"])


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int


class OrderIn(BaseModel):
    items: List[OrderItemIn]
    city: str
    street: str
    house: str
    zip: str = ""


def order_out(o: models.Order) -> dict:
    return {
        "id": o.id,
        "status": o.status.name if o.status else "—",
        "total": o.total,
        "created_at": o.created_at,
        "track_num": o.track_num,
        "delivery": {
            "city": o.delivery_city,
            "street": o.delivery_street,
            "house": o.delivery_house,
            "zip": o.delivery_zip,
        },
        "items": [
            {
                "product_id": i.product_id,
                "product_name": i.product.name if i.product else "",
                "product_brand": i.product.brand if i.product else "",
                "quantity": i.quantity,
                "price": i.price,
            }
            for i in o.items
        ],
    }


@router.post("")
def create_order(
    data: OrderIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    total = 0.0
    order_items = []
    for item in data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(404, f"Product {item.product_id} not found")
        total += product.price * item.quantity
        order_items.append(models.OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price,
        ))

    order = models.Order(
        user_id=current_user.id,
        status_id=1,
        total=total,
        created_at=datetime.utcnow().isoformat(),
        delivery_city=data.city,
        delivery_street=data.street,
        delivery_house=data.house,
        delivery_zip=data.zip,
    )
    db.add(order)
    db.flush()
    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)
    db.commit()
    db.refresh(order)
    return order_out(order)


@router.get("")
def list_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id)\
        .order_by(models.Order.id.desc()).all()
    return [order_out(o) for o in orders]


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    o = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id,
    ).first()
    if not o:
        raise HTTPException(404, "Order not found")
    return order_out(o)
