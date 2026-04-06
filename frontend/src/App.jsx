import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import SellerLayout from "./layouts/SellerLayout";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import PolicyPage from "./pages/PolicyPage";
import NotFound from "./pages/NotFound";
import BecomeaSeller from "./pages/BecomeaSeller";
import BecomeaBuyer from "./pages/BecomeaBuyer";
import LoginPage from "./pages/LoginPage";

// Admin
import AdminDashboard from "./Admin/AdminDashboard";

// Seller
import { SellerDashboard, SellerProducts, SellerOrders, SellerProfile } from "./Seller/SellerDashboard";
import AddProduct from "./Seller/AddProduct";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Public / Standard Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/become-a-seller" element={<BecomeaSeller />} />
            <Route path="/become-a-buyer" element={<BecomeaBuyer />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Seller Routes */}
          <Route element={<SellerLayout />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/profile" element={<SellerProfile />} />
            <Route path="/seller/add-product" element={<AddProduct />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
