import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useAuth } from "../AuthContext";
import api from "../api";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) { nav("/cart"); return null; }
  if (!user) { nav("/login"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !street || !house) { setError("Заполните адрес доставки"); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        city, street, house, zip,
      };
      const { data } = await api.post("/api/orders", payload);
      clear();
      nav(`/orders/${data.id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Оформление заказа</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Адрес доставки</h3>
            <div className="form-group">
              <label>Город *</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Владивосток" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Улица *</label>
                <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="ул. Пушкина" />
              </div>
              <div className="form-group">
                <label>Дом *</label>
                <input value={house} onChange={(e) => setHouse(e.target.value)} placeholder="10" />
              </div>
            </div>
            <div className="form-group">
              <label>Индекс</label>
              <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="690000" />
            </div>
          </div>

          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-accent" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
            {loading ? "Оформляем..." : `Оформить заказ на ${total.toLocaleString("ru-RU")} ₽`}
          </button>
        </form>

        {/* Summary */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Ваш заказ</h3>
          {items.map((i) => (
            <div key={i.product.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{i.product.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>{i.product.size} × {i.quantity}</div>
              </div>
              <div style={{ fontWeight: 700 }}>{(i.product.price * i.quantity).toLocaleString("ru-RU")} ₽</div>
            </div>
          ))}
          <div style={{ borderTop: "1.5px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
            <span>Итого</span><span>{total.toLocaleString("ru-RU")} ₽</span>
          </div>
        </div>
      </div>
    </div>
  );
}
