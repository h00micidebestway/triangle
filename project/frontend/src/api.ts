import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export interface Product {
  id: number; name: string; brand: string; size: string;
  season: string; speed_index: string; load_index: string;
  price: number; stock: number; description: string; image_url: string;
  category: { id: number; name: string } | null;
}
export interface CartItem { product: Product; quantity: number; }
export interface Order {
  id: number; status: string; total: number; created_at: string;
  track_num: string; delivery: { city: string; street: string; house: string; zip: string };
  items: { product_id: number; product_name: string; product_brand: string; quantity: number; price: number }[];
}
