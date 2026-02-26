import { useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Preorder() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [size, setSize] = useState("");
  const [season, setSeason] = useState("summer");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!size) { setError("Укажите типоразмер"); return; }
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/api/preorders", { name, email, size, season, comment });
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка отправки");
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: 600 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Предзаказ</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>
          Не нашли нужный типоразмер в каталоге? Оставьте заявку — мы найдём шины под ваш запрос и свяжемся с вами в течение 24 часов.
        </p>
      </div>

      {success ? (
        <div style={{ background: "#d1fae5", borderRadius: 12, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Заявка принята!</h3>
          <p style={{ color: "var(--muted)" }}>{success}</p>
        </div>
      ) : (
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Ваше имя *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван" required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Типоразмер *</label>
                <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="265/70 R17, 37x12.5 R17..." required />
              </div>
              <div className="form-group">
                <label>Сезон</label>
                <select value={season} onChange={(e) => setSeason(e.target.value)}>
                  <option value="summer">Летние</option>
                  <option value="winter">Зимние</option>
                  <option value="allseason">Всесезонные</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Комментарий</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Марка автомобиля, дополнительные требования..." />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-accent" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
              {loading ? "Отправляем..." : "Отправить заявку"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
