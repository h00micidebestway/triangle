import { useNavigate } from "react-router-dom";
import { Product } from "../api";
import { useCart } from "../CartContext";

const SEASON_LABEL: Record<string, string> = { summer: "Лето", winter: "Зима", allseason: "Всесезон" };
const TIRE_IMG = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80";

export default function ProductCard({ p }: { p: Product }) {
  const nav = useNavigate();
  const { add } = useCart();

  const season = p.season as string;
  const badgeClass = `badge badge-${season}`;

  return (
    <div className="product-card">
      <div className="product-card-img" onClick={() => nav(`/catalog/${p.id}`)} style={{ cursor: "pointer" }}>
        <img src={p.image_url || TIRE_IMG} alt={p.name} onError={(e) => { (e.target as HTMLImageElement).src = TIRE_IMG; }} />
        <span className={badgeClass + " season-badge"}>{SEASON_LABEL[season] || season}</span>
      </div>
      <div className="product-card-body">
        <div className="product-brand">{p.brand}</div>
        <div className="product-name" onClick={() => nav(`/catalog/${p.id}`)} style={{ cursor: "pointer" }}>{p.name}</div>
        <div className="product-size">{p.size} · {p.speed_index}/{p.load_index}</div>
        {p.stock === 0 && <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>Нет в наличии</div>}
        <div className="product-price">{p.price.toLocaleString("ru-RU")} ₽</div>
      </div>
      <div className="product-card-actions">
        <button className="btn btn-outline" onClick={() => nav(`/catalog/${p.id}`)}>Подробнее</button>
        <button
          className="btn btn-accent"
          disabled={p.stock === 0}
          onClick={() => add(p)}
        >
          В корзину
        </button>
      </div>
    </div>
  );
}
