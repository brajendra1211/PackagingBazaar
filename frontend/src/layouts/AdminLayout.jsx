import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Store, Calendar, Phone, Menu, X, Package, LogOut, ShieldCheck } from "lucide-react";
import { Toaster } from 'react-hot-toast';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = [
    { to: "/admin/dashboard", icon: <Phone size={18} />, label: "Seller Requests" },
    { to: "/admin/sellers", icon: <Store size={18} />, label: "Manage Sellers" },
    { to: "/admin/settings", icon: <Calendar size={18} />, label: "Settings" },
  ];

  return (
    <div className="bg-surface flex h-screen overflow-hidden">
      <Toaster position="top-right" />
      
      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/[0.07] flex flex-col 
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-black/[0.04]">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
               <ShieldCheck size={18} />
             </div>
             <h2 className="text-xl font-syne font-black text-ink">Admin Panel</h2>
           </div>
           
           <button 
             className="ml-auto lg:hidden text-ink3 hover:text-ink p-1"
             onClick={() => setMobileOpen(false)}
           >
             <X size={20} />
           </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navLinks.map((link) => (
            <NavLink 
              key={link.to}
              to={link.to}
              end={link.to === "/admin/dashboard"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' 
                  : 'text-ink2 hover:bg-surface hover:text-ink border border-transparent'
              }`}
            >
               {link.icon}
               <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-black/[0.04] space-y-1.5">
          <button 
             onClick={() => { navigate("/"); setMobileOpen(false); }}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-ink3 hover:bg-surface hover:text-ink transition-colors"
          >
             <Package size={18} /> Back to Website
          </button>
          <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
             <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Layout Wrapper ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header (Stored in Top, fixed for mobile, hidden for Desktop) */}
        <header className="h-16 bg-white border-b border-black/[0.04] flex items-center px-4 lg:hidden shrink-0 z-10 sticky top-0">
          <button 
            className="p-2 text-ink2 hover:text-ink"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="ml-3 font-syne font-black text-lg text-ink flex items-center gap-2">
             <ShieldCheck size={18} className="text-red-500" />
             Admin Panel
          </div>
        </header>

        {/* ── Page Content (Scrollable Container) ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 md:py-8 lg:px-10 max-w-6xl mx-auto pb-20">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
