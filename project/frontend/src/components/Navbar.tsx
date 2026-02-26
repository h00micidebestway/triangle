import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">🔴 Wheel<span>Stock</span></Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/catalog" className="nav-link">Каталог</Link>
          <Link to="/preorder" className="nav-link">Предзаказ</Link>
        </div>
        <div className="nav-right">
          <button className="cart-btn" onClick={() => nav("/cart")}>
            🛒 Корзина
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          {user ? (
            <>
              <Link to="/orders" className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)", fontSize: 13, padding: "7px 14px" }}>
                Мои заказы
              </Link>
              <button className="btn btn-outline" onClick={logout} style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)", fontSize: 13, padding: "7px 14px" }}>
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-accent" style={{ fontSize: 13, padding: "7px 16px" }}>
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
