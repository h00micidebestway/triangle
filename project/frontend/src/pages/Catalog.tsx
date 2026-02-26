import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api, { Product } from "../api";
import ProductCard from "../components/ProductCard";

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);

  const season  = params.get("season")   || "";
  const search  = params.get("search")   || "";
  const brand   = params.get("brand")    || "";
  const sort    = params.get("sort")     || "price_asc";
  const minP    = params.get("min_price")|| "";
  const maxP    = params.get("max_price")|| "";

  const set = (key: string, val: string) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    setParams(p);
  };

  useEffect(() => {
    api.get("/api/products/brands").then((r) => setBrands(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (season)  q.set("season",    season);
    if (search)  q.set("search",    search);
    if (brand)   q.set("brand",     brand);
    if (sort)    q.set("sort",      sort);
    if (minP)    q.set("min_price", minP);
    if (maxP)    q.set("max_price", maxP);
    q.set("limit", "40");

    api.get(`/api/products?${q}`).then((r) => {
      setProducts(r.data.items);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  }, [season, search, brand, sort, minP, maxP]);

  const SEASONS = [
    { value: "",          label: "Все сезоны" },
    { value: "summer",    label: "☀️ Летние" },
    { value: "winter",    label: "❄️ Зимние" },
    { value: "allseason", label: "🍃 Всесезонные" },
  ];

  return (
    <div className="container" style={{ padding: "32px 20px" }}>
      <div className="catalog-layout">
        {/* Filters */}
        <aside className="filters-panel">
          <h3>Фильтры</h3>

          <div className="filter-group">
            <label>Сезон</label>
            <div className="season-btns">
              {SEASONS.map((s) => (
                <button key={s.value} className={`season-btn${season === s.value ? " active" : ""}`} onClick={() => set("season", s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Бренд</label>
            <select value={brand} onChange={(e) => set("brand", e.target.value)}>
              <option value="">Все бренды</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Цена, ₽</label>
            <div className="price-row">
              <input placeholder="От" value={minP} onChange={(e) => set("min_price", e.target.value)} type="number" min="0" />
              <input placeholder="До" value={maxP} onChange={(e) => set("max_price", e.target.value)} type="number" min="0" />
            </div>
          </div>

          <div className="filter-group">
            <label>Поиск</label>
            <input placeholder="Размер, название..." value={search} onChange={(e) => set("search", e.target.value)} />
          </div>

          <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            onClick={() => setParams(new URLSearchParams())}>
            Сбросить
          </button>
        </aside>

        {/* Products */}
        <div className="catalog-content">
          <div className="catalog-header">
            <h2>Каталог <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 16 }}>({total})</span></h2>
            <select className="sort-select" value={sort} onChange={(e) => set("sort", e.target.value)}>
              <option value="price_asc">Цена: по возрастанию</option>
              <option value="price_desc">Цена: по убыванию</option>
              <option value="id">По умолчанию</option>
            </select>
          </div>

          {loading ? (
            <div className="spinner">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="empty">
              <div className="icon">🔍</div>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить фильтры или оставьте <a href="/preorder" style={{ color: "var(--primary)" }}>заявку на предзаказ</a></p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
