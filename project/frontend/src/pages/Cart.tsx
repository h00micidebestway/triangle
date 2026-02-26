import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";

const TIRE_IMG = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80";

export default function Cart() {
  const { items, remove, update, total, clear } = useCart();
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: "60px 20px" }}>
        <div className="empty">
          <div className="icon">🛒</div>
          <h3>Корзина пуста</h3>
          <p style={{ marginBottom: 24 }}>Добавьте товары из каталога</p>
          <button className="btn btn-primary" onClick={() => nav("/catalog")}>Перейти в каталог</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Корзина</h1>
      <div className="cart-page">
        {items.map((item) => (
          <div key={item.product.id} className="cart-item">
            <img
              className="cart-item-img"
              src={item.product.image_url || TIRE_IMG}
              alt={item.product.name}
              onError={(e) => { (e.target as HTMLImageElement).src = TIRE_IMG; }}
            />
            <div className="cart-item-info">
              <div className="brand">{item.product.brand}</div>
              <div className="name">{item.product.name}</div>
              <div className="size">{item.product.size}</div>
            </div>
            <div className="qty-control">
              <button onClick={() => update(item.product.id, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => update(item.product.id, item.quantity + 1)}>+</button>
            </div>
            <div className="cart-item-price">{(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽</div>
            <button className="btn btn-outline" style={{ padding: "8px 12px" }} onClick={() => remove(item.product.id)}>✕</button>
          </div>
        ))}

        <div className="cart-summary">
          <div className="cart-summary-row"><span>Товаров</span><span>{items.reduce((s, i) => s + i.quantity, 0)} шт.</span></div>
          <div className="cart-summary-row total"><span>Итого</span><span>{total.toLocaleString("ru-RU")} ₽</span></div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-outline" onClick={clear}>Очистить</button>
            <button className="btn btn-accent" style={{ flex: 1, justifyContent: "center" }} onClick={() => nav("/checkout")}>
              Оформить заказ →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
