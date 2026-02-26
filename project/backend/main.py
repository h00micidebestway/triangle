from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import products, categories, auth, orders, preorders

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="WheelStock API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(categories.router)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(preorders.router)


@app.get("/")
def root():
    return {"message": "WheelStock API is running", "docs": "/docs"}
