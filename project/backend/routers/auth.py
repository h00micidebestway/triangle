from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from database import get_db
import models
import auth as auth_utils

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterIn(BaseModel):
    name: str
    email: str
    password: str
    phone: str = ""


class LoginIn(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = models.User(
        name=data.name,
        email=data.email,
        password_hash=auth_utils.hash_password(data.password),
        phone=data.phone,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth_utils.create_token(user.id)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}


@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth_utils.verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    token = auth_utils.create_token(user.id)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}


@router.get("/me")
def me(current_user: models.User = Depends(auth_utils.get_current_user)):
    u = current_user
    return {"id": u.id, "name": u.name, "email": u.email, "phone": u.phone}
