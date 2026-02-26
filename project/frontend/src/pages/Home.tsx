import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { Product } from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { icon: "☀️", name: "Летние",     slug: "summer",    season: "summer" },
  { icon: "❄️", name: "Зимние",     slug: "winter",    season: "winter" },
  { icon: "🍃", name: "Всесезонные",slug: "allseason", season: "allseason" },
  { icon: "🏔️", name: "Внедорожные",slug: "offroad",   season: "" },
  { icon: "🏁", name: "Спортивные", slug: "sport",     season: "" },
];

export default function Home() {
  const nav = useNavigate();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/products?limit=8&sort=price_desc").then((r) => setFeatured(r.data.items));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/catalog?search=${encodeURIComponent(search)}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Шины для <span>любых задач</span></h1>
          <p>Редкие типоразмеры, офф-роуд, спорт и премиум-резина — всё в одном месте</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <span>🔍</span>
            <input
              placeholder="Поиск по названию, бренду или размеру..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Найти</button>
          </form>
          <div className="hero-btns">
            <button className="btn btn-accent" onClick={() => nav("/catalog")}>Смотреть каталог</button>
            <button className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,.4)" }} onClick={() => nav("/preorder")}>
              Нет нужного размера? →
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="container">
        <section className="section">
          <h2 className="section-title">Категории</h2>
          <p className="section-sub">Выберите тип шин для вашего автомобиля</p>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <div
                key={c.slug}
                className="cat-card"
                onClick={() => nav(c.season ? `/catalog?season=${c.season}` : `/catalog?search=${c.name}`)}
              >
                <div className="icon">{c.icon}</div>
                <div className="name">{c.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">Популярные модели</h2>
          <p className="section-sub">Премиальные и редкие шины в наличии</p>
          <div className="products-grid">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn btn-primary" style={{ padding: "12px 32px" }} onClick={() => nav("/catalog")}>
              Весь каталог →
            </button>
          </div>
        </section>

        {/* Preorder banner */}
        <section style={{ background: "linear-gradient(135deg, #1a3a5c, #2d5986)", borderRadius: 16, padding: "40px 32px", color: "#fff", marginBottom: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Не нашли нужный размер?</h3>
            <p style={{ opacity: .8, maxWidth: 420 }}>Оставьте заявку на предзаказ — мы найдём шины под ваш запрос и свяжемся с вами.</p>
          </div>
          <button className="btn btn-accent" style={{ padding: "14px 28px", fontSize: 15, flexShrink: 0 }} onClick={() => nav("/preorder")}>
            Оставить заявку
          </button>
        </section>
      </div>
    </>
  );
}
