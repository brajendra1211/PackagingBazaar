import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
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
import SellerDashboard from "./Seller/SellerDashboard";
import AddProduct from "./Seller/AddProduct";
import LoginPage from "./pages/LoginPage"

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/become-a-seller" element={<BecomeaSeller />} />
              <Route path="/become-a-buyer" element={<BecomeaBuyer />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/add-product" element={<AddProduct />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
