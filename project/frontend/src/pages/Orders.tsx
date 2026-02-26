import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { Order } from "../api";
import { useAuth } from "../AuthContext";

function StatusBadge({ status }: { status: string }) {
  return <span className={`order-status status-${status}`}>{status}</span>;
}

export function OrdersList() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { nav("/login"); return; }
    api.get("/api/orders").then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="spinner">Загрузка...</div>;

  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: 860 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Мои заказы</h1>
      {orders.length === 0 ? (
        <div className="empty">
          <div className="icon">📦</div>
          <h3>Заказов пока нет</h3>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => nav("/catalog")}>Перейти в каталог</button>
        </div>
      ) : orders.map((o) => (
        <div key={o.id} className="order-card" onClick={() => nav(`/orders/${o.id}`)} style={{ cursor: "pointer" }}>
          <div className="order-card-header">
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Заказ #{o.id}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(o.created_at).toLocaleDateString("ru-RU")}</div>
            </div>
            <StatusBadge status={o.status} />
            <div style={{ fontWeight: 800, fontSize: 18 }}>{o.total.toLocaleString("ru-RU")} ₽</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            {o.items.map((i) => `${i.product_brand} ${i.product_name} × ${i.quantity}`).join(", ")}
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { nav("/login"); return; }
    api.get(`/api/orders/${id}`).then((r) => setOrder(r.data)).finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <div className="spinner">Загрузка...</div>;
  if (!order) return <div className="spinner">Заказ не найден</div>;

  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: 720 }}>
      <button className="btn btn-outline" onClick={() => nav("/orders")} style={{ marginBottom: 24 }}>← Все заказы</button>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Заказ #{order.id}</h1>
        <span className={`order-status status-${order.status}`}>{order.status}</span>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Состав заказа</h3>
        {order.items.map((i, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{i.product_brand} {i.product_name}</div>
              <div style={{ color: "var(--muted)" }}>× {i.quantity} шт.</div>
            </div>
            <div style={{ fontWeight: 700 }}>{(i.price * i.quantity).toLocaleString("ru-RU")} ₽</div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, fontWeight: 800, fontSize: 18 }}>
          <span>Итого</span><span>{order.total.toLocaleString("ru-RU")} ₽</span>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Доставка</h3>
        <div style={{ fontSize: 14, lineHeight: 2, color: "var(--muted)" }}>
          <div>📍 {order.delivery.city}, {order.delivery.street}, д. {order.delivery.house} {order.delivery.zip && `(${order.delivery.zip})`}</div>
          {order.track_num && <div>📦 Трек-номер: <strong style={{ color: "var(--text)" }}>{order.track_num}</strong></div>}
          <div>🗓 {new Date(order.created_at).toLocaleString("ru-RU")}</div>
        </div>
      </div>
    </div>
  );
}
