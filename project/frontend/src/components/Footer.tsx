import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">🔴 Wheel<span>Stock</span></div>
            <p className="footer-desc">
              Маркетплейс специализированных шин.<br />
              Редкие типоразмеры, офф-роуд, спорт и премиум-резина.
            </p>
          </div>
          <div className="footer-col">
            <h4>Навигация</h4>
            <Link to="/">Главная</Link>
            <Link to="/catalog">Каталог</Link>
            <Link to="/preorder">Предзаказ</Link>
          </div>
          <div className="footer-col">
            <h4>Аккаунт</h4>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
            <Link to="/orders">Мои заказы</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 WheelStock — учебный проект ВВГУ
        </div>
      </div>
    </footer>
  );
}
