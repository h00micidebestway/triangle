from sqlalchemy import Column, Integer, Text, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Category(Base):
    __tablename__ = "categories"
    id   = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    slug = Column(Text, unique=True, nullable=False)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id          = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    name        = Column(Text, nullable=False)
    brand       = Column(Text, nullable=False)
    size        = Column(Text, nullable=False)
    season      = Column(Text, nullable=False)   # summer / winter / allseason
    speed_index = Column(Text)
    load_index  = Column(Text)
    price       = Column(Float, nullable=False)
    stock       = Column(Integer, default=0)
    description = Column(Text, default="")
    image_url   = Column(Text, default="")
    category    = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True)
    name          = Column(Text, nullable=False)
    email         = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    phone         = Column(Text, default="")
    created_at    = Column(Text, default="")
    is_admin      = Column(Boolean, default=False)
    orders     = relationship("Order",    back_populates="user")
    addresses  = relationship("Address",  back_populates="user")
    preorders  = relationship("Preorder", back_populates="user")


class Address(Base):
    __tablename__ = "addresses"
    id      = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    city    = Column(Text)
    street  = Column(Text)
    house   = Column(Text)
    zip     = Column(Text)
    user    = relationship("User", back_populates="addresses")
    orders  = relationship("Order", back_populates="address")


class OrderStatus(Base):
    __tablename__ = "order_statuses"
    id     = Column(Integer, primary_key=True)
    name   = Column(Text, nullable=False)
    orders = relationship("Order", back_populates="status")


class Order(Base):
    __tablename__ = "orders"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=True)
    status_id  = Column(Integer, ForeignKey("order_statuses.id"), default=1)
    total      = Column(Float, default=0)
    payment_id = Column(Text, default="")
    track_num  = Column(Text, default="")
    created_at = Column(Text, default="")
    # delivery address snapshot (for guests)
    delivery_city   = Column(Text, default="")
    delivery_street = Column(Text, default="")
    delivery_house  = Column(Text, default="")
    delivery_zip    = Column(Text, default="")
    user    = relationship("User",        back_populates="orders")
    address = relationship("Address",     back_populates="orders")
    status  = relationship("OrderStatus", back_populates="orders")
    items   = relationship("OrderItem",   back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    id         = Column(Integer, primary_key=True)
    order_id   = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, default=1)
    price      = Column(Float, default=0)
    order   = relationship("Order",   back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Preorder(Base):
    __tablename__ = "preorders"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    name       = Column(Text, default="")
    email      = Column(Text, default="")
    size       = Column(Text)
    season     = Column(Text)
    comment    = Column(Text, default="")
    created_at = Column(Text, default="")
    user = relationship("User", back_populates="preorders")
