import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import ScrollToTop from "./components/layout/ScrollToTop";

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import SellerLayout from "./layouts/SellerLayout";

// Route Guards
import { GuestRoute, ProtectedRoute, AdminRoute, SellerRoute } from "./components/RouteGuards";

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
// import BecomeaBuyer from "./pages/BecomeaBuyer";
import LoginPage from "./pages/LoginPage";
import UserProfile from "./pages/UserProfile";
import HotDealsPage from "./pages/HotDealsPage";
import SellerPage from "./pages/SellerPage";

// Admin
import AdminDashboard from "./Admin/pages/AdminDashboard";
import AdminSellers from "./Admin/pages/AdminSellers";
import AdminPendingSellers from "./Admin/pages/AdminPendingSellers";
import AdminUsers from "./Admin/pages/AdminUsers";
import AdminProducts from "./Admin/pages/AdminProducts";
import AdminOrders from "./Admin/pages/AdminOrders";
import AdminInquiries from "./Admin/pages/AdminInquiries";
import AdminSellerHub from "./Admin/pages/AdminSellerHub";
import AdminAddProduct from "./Admin/pages/AdminAddProduct";
import AdminAddSeller from "./Admin/pages/AdminAddSeller";
import AdminEditSeller from "./Admin/pages/AdminEditSeller";
import AdminEditProduct from "./Admin/pages/AdminEditProduct";
import AdminContacts from "./Admin/pages/AdminContacts";

import { Navigate } from "react-router-dom";

// Seller
import { SellerDashboard, SellerProducts, SellerOrders, SellerLeads, SellerProfile } from "./Seller/SellerDashboard";
import AddProduct from "./Seller/AddProduct";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NotificationProvider>
        <CartProvider>
          <Routes>
            {/* Guest Routes (Redirects to dashboard if already logged in) */}
            <Route element={<GuestRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Route>

            {/* Public / Standard Routes (Accessible to everyone) */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/hot-deals" element={<HotDealsPage />} />
              <Route path="/seller" element={<SellerPage />} />
              <Route path="/become-a-seller" element={<BecomeaSeller />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Protected User Routes (Must be logged in) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                {/* <Route path="/become-a-buyer" element={<BecomeaBuyer />} /> */}
                <Route path="/profile" element={<UserProfile />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/sellers" element={<AdminSellers />} />
                <Route path="/admin/pending-sellers" element={<AdminPendingSellers />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/inquiries" element={<AdminInquiries />} />
                <Route path="/admin/contacts" element={<AdminContacts />} />
                <Route path="/admin/seller-hub" element={<AdminSellerHub />} />
                <Route path="/admin/add-product" element={<AdminAddProduct />} />
                <Route path="/admin/add-seller" element={<AdminAddSeller />} />
                <Route path="/admin/sellers/edit/:id" element={<AdminEditSeller />} />
                <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
              </Route>
            </Route>

            {/* Seller Routes */}
            <Route element={<SellerRoute />}>
              <Route element={<SellerLayout />}>
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/seller/products" element={<SellerProducts />} />
                <Route path="/seller/leads" element={<SellerLeads />} />
                <Route path="/seller/orders" element={<SellerOrders />} />
                <Route path="/seller/profile" element={<SellerProfile />} />
                <Route path="/seller/add-product" element={<AddProduct />} />
              </Route>
            </Route>
          </Routes>
        </CartProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
