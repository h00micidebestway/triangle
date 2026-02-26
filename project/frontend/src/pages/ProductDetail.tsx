import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { Product } from "../api";
import { useCart } from "../CartContext";

const TIRE_IMG = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80";
const SEASON_LABEL: Record<string, string> = { summer: "Летняя ☀️", winter: "Зимняя ❄️", allseason: "Всесезонная 🍃" };

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    api.get(`/api/products/${id}`).then((r) => setProduct(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    add(product, qty);
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  if (loading) return <div className="spinner">Загрузка...</div>;
  if (!product) return <div className="spinner">Товар не найден</div>;

  const p = product;

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <button className="btn btn-outline" onClick={() => nav(-1)} style={{ marginBottom: 24 }}>← Назад</button>

      <div className="product-detail">
        <div className="product-detail-img">
          <img src={p.image_url || TIRE_IMG} alt={p.name} onError={(e) => { (e.target as HTMLImageElement).src = TIRE_IMG; }} />
        </div>

        <div className="product-detail-info">
          <div>
            <span className={`badge badge-${p.season}`}>{SEASON_LABEL[p.season] || p.season}</span>
            {p.category && <span style={{ marginLeft: 8, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{p.category.name}</span>}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>{p.brand}</div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{p.name}</h1>
          <div className="product-detail-price">{p.price.toLocaleString("ru-RU")} ₽</div>

          <div className="spec-grid">
            <div className="spec-item">
              <div className="spec-label">Типоразмер</div>
              <div className="spec-value">{p.size}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Сезон</div>
              <div className="spec-value">{SEASON_LABEL[p.season] || p.season}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Индекс скорости</div>
              <div className="spec-value">{p.speed_index || "—"}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Индекс нагрузки</div>
              <div className="spec-value">{p.load_index || "—"}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Бренд</div>
              <div className="spec-value">{p.brand}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Наличие</div>
              <div className="spec-value" style={{ color: p.stock > 0 ? "#16a34a" : "#dc2626" }}>
                {p.stock > 0 ? `${p.stock} шт.` : "Нет в наличии"}
              </div>
            </div>
          </div>

          {p.description && (
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>{p.description}</p>
          )}

          {p.stock > 0 && (
            <div className="qty-row">
              <div className="qty-control">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
              </div>
              <button className="btn btn-accent" style={{ flex: 1, justifyContent: "center" }} onClick={handleAdd}>
                🛒 В корзину
              </button>
            </div>
          )}

          {p.stock === 0 && (
            <button className="btn btn-primary" onClick={() => nav("/preorder")}>
              Оставить заявку на предзаказ
            </button>
          )}
        </div>
      </div>

      {toast && <div className="toast">✅ Добавлено в корзину</div>}
    </div>
  );
}
