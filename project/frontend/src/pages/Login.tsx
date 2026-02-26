import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(email, password);
      nav("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Неверный email или пароль");
    } finally { setLoading(false); }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Вход в аккаунт</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-accent" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 8 }}>
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
        <p className="form-link">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Пароль должен быть не менее 6 символов"); return; }
    setLoading(true); setError("");
    try {
      await register(name, email, password, phone);
      nav("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при регистрации");
    } finally { setLoading(false); }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Петров" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 6 символов" required />
          </div>
          <div className="form-group">
            <label>Телефон (необязательно)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 999 000-00-00" />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-accent" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 8 }}>
            {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
          </button>
        </form>
        <p className="form-link">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </div>
    </div>
  );
}
