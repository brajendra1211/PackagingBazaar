import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Menu, X, Package, User, LogOut,
  LayoutDashboard, ShieldCheck, Store, ChevronDown,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
// ✅ Axios ki jagah modular service import ki
import { fetchUserData } from "../../services/authServices"; 

const roleConfig = {
  admin: { label: "Admin", color: "bg-red-100 text-red-700", icon: <ShieldCheck size={12} /> },
  seller: { label: "Seller", color: "bg-orange-100 text-orange-700", icon: <Store size={12} /> },
  user: { label: "Customer", color: "bg-blue-100 text-blue-700", icon: <User size={12} /> },
};

// ProfileMenu component remains the same...
function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const role = roleConfig[user.role] || roleConfig.user;
  const initials = user.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "U";

  const dashboardLink = user.role === "admin" ? "/admin/dashboard" : user.role === "seller" ? "/seller/dashboard" : "/account";
  const profileLink = user.role === "admin" ? "/admin/profile" : user.role === "seller" ? "/seller/profile" : "/profile";

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 h-10 px-2 rounded-xl border border-black/[0.08] hover:bg-surface transition-colors cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <div 
          onClick={(e) => { e.stopPropagation(); navigate(profileLink); setOpen(false); }}
          className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform"
        >
          {initials}
        </div>
        <div className="flex items-center gap-1">
          <span className={`hidden md:flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>
            {role.icon} {role.label}
          </span>
          <ChevronDown size={14} className={`text-ink2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-black/[0.07] overflow-hidden z-50 animate-fadeIn">
          <div className="px-4 py-3 border-b border-black/[0.06]">
            <p className="text-sm font-semibold text-ink truncate">{user.name || "User"}</p>
            <p className="text-xs text-ink2 truncate">{user.email || "No email"}</p>
          </div>
          <div className="py-1.5">
            {user.role !== "user" && (
              <button onClick={() => { navigate(dashboardLink); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink2 hover:bg-surface hover:text-accent transition-colors">
                <LayoutDashboard size={15} /> Dashboard
              </button>
            )}
            {user.role === "seller" && (
              <button onClick={() => { navigate("/seller/products"); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink2 hover:bg-surface hover:text-accent transition-colors">
                <Store size={15} /> My Products
              </button>
            )}
            {user.role === "admin" && (
              <>
                <button onClick={() => { navigate("/admin/users"); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink2 hover:bg-surface hover:text-accent transition-colors">
                  <User size={15} /> Manage Users
                </button>
                <button onClick={() => { navigate("/admin/sellers"); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink2 hover:bg-surface hover:text-accent transition-colors">
                  <Store size={15} /> Manage Sellers
                </button>
              </>
            )}
          </div>
          <div className="border-t border-black/[0.06] py-1.5">
            <button onClick={() => { onLogout(); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // ✅ API instance aur service use kar rahe hain (Interceptor token handle kar lega)
        const response = await fetchUserData();
        setUser(response.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-black/[0.07] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Package size={18} className="text-white" />
          </div>
          <span className="font-syne font-black text-lg sm:text-xl text-ink">
            Packaging<span className="text-accent">Bazaar</span>
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="text-sm font-medium text-ink2 hover:text-accent transition-colors">{l.label}</Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/cart")} className="relative w-10 h-10 border border-black/[0.08] rounded-xl flex items-center justify-center hover:bg-surface transition-colors">
            <ShoppingCart size={18} className="text-ink2" />
            {count > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>}
          </button>

          {!loading && (
            <>
              {user ? (
                <div className="hidden md:block">
                  <ProfileMenu user={user} onLogout={handleLogout} />
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/become-a-seller" className="hidden md:block bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Become a Seller</Link>
                  <Link to="/login" className="hidden md:flex items-center gap-1.5 border border-accent text-accent text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">
                    <User size={15} /> Login
                  </Link>
                </div>
              )}
            </>
          )}

          <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>

      {/* Mobile Menu remains as it is... */}
      {open && (
        <div className="md:hidden bg-white border-t border-black/[0.07] animate-fadeIn">
          <div className="px-4 py-4 space-y-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium text-ink2 hover:text-accent py-2 transition-colors">{l.label}</Link>
            ))}
            <div className="border-t border-black/[0.06] pt-3 space-y-2">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <div 
                        onClick={() => { navigate(user.role === "admin" ? "/admin/profile" : user.role === "seller" ? "/seller/profile" : "/profile"); setOpen(false); }}
                        className="pb-2 border-b border-black/[0.06] cursor-pointer hover:bg-surface rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <p className="text-sm font-semibold text-ink">{user.name}</p>
                        <p className="text-xs text-ink2">{user.email}</p>
                      </div>
                      {user.role !== "user" && (
                        <button onClick={() => { navigate(user.role === "admin" ? "/admin/dashboard" : user.role === "seller" ? "/seller/dashboard" : "/account"); setOpen(false); }} className="w-full flex items-center gap-2 text-sm text-ink2 hover:text-accent py-2 transition-colors">
                          <LayoutDashboard size={16} /> Dashboard
                        </button>
                      )}
                      <button onClick={() => { handleLogout(); setOpen(false); }} className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-700 py-2 transition-colors border-t border-black/[0.06] pt-3 mt-2">
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center border border-accent text-accent text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">Login</Link>
                      <Link to="/become-a-seller" onClick={() => setOpen(false)} className="block w-full text-center bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">Become a Seller</Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}