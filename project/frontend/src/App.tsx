import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./CartContext";
import { AuthProvider } from "./AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { Login, Register } from "./pages/Login";
import { OrdersList, OrderDetail } from "./pages/Orders";
import Preorder from "./pages/Preorder";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 60px)" }}>
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/catalog"       element={<Catalog />} />
              <Route path="/catalog/:id"   element={<ProductDetail />} />
              <Route path="/cart"          element={<Cart />} />
              <Route path="/checkout"      element={<Checkout />} />
              <Route path="/login"         element={<Login />} />
              <Route path="/register"      element={<Register />} />
              <Route path="/orders"        element={<OrdersList />} />
              <Route path="/orders/:id"    element={<OrderDetail />} />
              <Route path="/preorder"      element={<Preorder />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
