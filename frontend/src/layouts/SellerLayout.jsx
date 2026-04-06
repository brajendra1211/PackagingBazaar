import { useState } from "react";
import { useNavigate, Outlet, NavLink, useLocation } from "react-router-dom";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INITIAL_SELLER = {
  businessName: "Kumar Packaging Pvt. Ltd.",
  businessType: "Manufacturer",
  gstNumber: "24AABCK1234A1Z5",
  yearEstablished: "2010",
  ownerName: "Rajesh Kumar",
  email: "rajesh@kumarpackaging.com",
  phone: "+91 98765 43210",
  city: "Ahmedabad",
  state: "Gujarat",
  address: "Plot 45, GIDC Estate, Vatva, Ahmedabad - 382445",
  filmTypes: ["BOPP", "CPP"],
  monthlyCapacity: "50",
  priceRange: "180 – 350",
  description:
    "We manufacture high-quality BOPP and CPP films for food packaging, pharma, and FMCG industries. ISO 9001 certified with 12+ years of experience.",
  status: "active",
  joinedDate: "2024-03-15",
  avatar: "RK",
};

const PRODUCTS = [
  { id: 1, name: "BOPP Transparent Film", type: "BOPP", variant: "Transparent", micron: "20 micron", width: "1000 mm", price: 180, moq: "50 kg", stock: "2400 kg", status: "active", badge: "bestseller", views: 342, orders: 28, rating: 4.8 },
  { id: 2, name: "BOPP Pearl Film", type: "BOPP", variant: "Pearl", micron: "25 micron", width: "1000 mm", price: 210, moq: "50 kg", stock: "1800 kg", status: "active", badge: "trending", views: 219, orders: 14, rating: 4.7 },
  { id: 3, name: "CPP Heat Sealable Film", type: "CPP", variant: "Heat Sealable", micron: "30 micron", width: "800 mm", price: 195, moq: "100 kg", stock: "900 kg", status: "inactive", badge: null, views: 98, orders: 6, rating: 4.2 },
];

const ORDERS = [
  { id: "ORD-001", buyer: "Amul Foods Ltd.", product: "BOPP Transparent Film", qty: "200 kg", amount: "₹36,000", date: "2024-06-10", status: "delivered" },
  { id: "ORD-002", buyer: "Patanjali Ayurved", product: "BOPP Pearl Film", qty: "150 kg", amount: "₹31,500", date: "2024-06-08", status: "processing" },
  { id: "ORD-003", buyer: "ITC Limited", product: "CPP Heat Sealable Film", qty: "300 kg", amount: "₹58,500", date: "2024-06-05", status: "shipped" },
];

// ─── ICON HELPER ──────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  dashboard: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  products: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  orders: ["M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  profile: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  edit: ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  save: ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z", "M17 21v-8H7v8", "M7 3v5h8"],
  add: "M12 5v14M5 12h14",
  trash: ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"],
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  layers: ["M12 2L2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"],
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  building: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  package: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0"],
  chevronL: "M15 18l-6-6 6-6",
  chevronR: "M9 18l6-6-6-6",
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "gray" }) => {
  const cls = {
    green: "bg-green-100 text-green-700 border-green-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    red: "bg-red-100 text-red-600 border-red-200",
  };
  return <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${cls[color]}`}>{children}</span>;
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, sub, color }) => {
  const bg = { orange: "bg-[#e8511a]", blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500" };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-11 h-11 ${bg[color]} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon d={icons[icon]} size={20} stroke="white" />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-black text-gray-900 leading-none">{value}</div>
        <div className="text-xs font-medium text-gray-500 mt-0.5 truncate">{label}</div>
        {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
      </div>
    </div>
  );
};

// ─── EDITABLE FIELD ───────────────────────────────────────────────────────────
function EditableField({ label, value, onSave, type = "text", options = null, multiline = false }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const save = () => { onSave(val); setEditing(false); };
  const cancel = () => { setVal(value); setEditing(false); };

  return (
    <div className="group flex items-start justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0 mr-3">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
        {editing ? (
          <div className="flex flex-col gap-2">
            {multiline ? (
              <textarea className="w-full text-sm border border-[#e8511a] rounded-xl px-3 py-2 outline-none resize-none bg-orange-50/30" rows={3} value={val} onChange={e => setVal(e.target.value)} />
            ) : options ? (
              <select className="text-sm border border-[#e8511a] rounded-xl px-3 py-2 outline-none bg-orange-50/30 w-full" value={val} onChange={e => setVal(e.target.value)}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input type={type} className="w-full text-sm border border-[#e8511a] rounded-xl px-3 py-2 outline-none bg-orange-50/30" value={val} onChange={e => setVal(e.target.value)} autoFocus />
            )}
            <div className="flex gap-2">
              <button onClick={save} className="flex items-center gap-1.5 text-xs bg-[#e8511a] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d4460f]">
                <Icon d={icons.save} size={11} stroke="white" /> Save
              </button>
              <button onClick={cancel} className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-800">{value || <span className="text-gray-400 italic text-xs">Not provided — click Edit to add</span>}</div>
        )}
      </div>
      {!editing && (
        <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-[#e8511a] font-semibold shrink-0 mt-1 hover:text-[#d4460f]">
          <Icon d={icons.edit} size={12} /> Edit
        </button>
      )}
    </div>
  );
}

// ─── FILM TAGS EDITOR ─────────────────────────────────────────────────────────
const ALL_FILMS = ["BOPP", "PET", "CPP", "LAMINATED", "Others"];
function FilmTypesEditor({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(value);

  const toggle = (f) => setSelected(s => s.includes(f) ? s.filter(x => x !== f) : [...s, f]);
  const save = () => { onSave(selected); setEditing(false); };

  return (
    <div className="group flex items-start justify-between py-3.5 border-b border-gray-100">
      <div className="flex-1 mr-3">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Film Types</div>
        {editing ? (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {ALL_FILMS.map(f => (
                <button key={f} onClick={() => toggle(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selected.includes(f) ? "bg-[#e8511a] text-white border-[#e8511a]" : "bg-gray-100 text-gray-600 border-gray-200 hover:border-[#e8511a]"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="flex items-center gap-1.5 text-xs bg-[#e8511a] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d4460f]">
                <Icon d={icons.save} size={11} stroke="white" /> Save
              </button>
              <button onClick={() => { setSelected(value); setEditing(false); }} className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.length > 0 ? value.map(f => (
              <span key={f} className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200 font-semibold">{f}</span>
            )) : <span className="text-gray-400 italic text-xs">Not provided — click Edit to add</span>}
          </div>
        )}
      </div>
      {!editing && (
        <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-[#e8511a] font-semibold shrink-0 mt-1">
          <Icon d={icons.edit} size={12} /> Edit
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════════════════════

// Views are extracted to individual routes

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/seller/dashboard" },
  { id: "products", label: "My Products", icon: "products", href: "/seller/products" },
  { id: "orders", label: "Orders", icon: "orders", href: "/seller/orders" },
  { id: "profile", label: "Seller Profile", icon: "profile", href: "/seller/profile" },
];

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ seller, collapsed, setCollapsed, mobileOpen, setMobileOpen, navigate }) {
  const handleNav = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        flex flex-col bg-gray-900 text-white
        transition-all duration-300 ease-in-out
        h-full
        ${collapsed ? "lg:w-16" : "lg:w-60"}
        ${mobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Seller card */}
        <div className={`mx-3 mt-3 mb-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 shrink-0 ${collapsed ? "lg:hidden" : ""}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#e8511a] rounded-xl flex items-center justify-center font-black text-xs shrink-0">{seller.avatar}</div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{seller.businessName}</div>
              <div className="text-[10px] text-green-400 font-semibold mt-0.5">✓ Verified Seller</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.id}
              to={item.href}
              end={item.id === "dashboard"}
              onClick={handleNav}
              className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${isActive ? "bg-[#e8511a] text-white" : "text-white/60 hover:text-white hover:bg-white/5"}
                ${collapsed ? "lg:justify-center" : ""}
              `}
            >
              <Icon d={icons[item.icon]} size={17} />
              <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-2 shrink-0 space-y-0.5">
          <button
            onClick={() => navigate("/")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? "lg:justify-center" : ""}`}
          >
            <Icon d={icons.logout} size={17} />
            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </button>
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/25 hover:text-white/50 hover:bg-white/5 transition-all ${collapsed ? "justify-center" : ""}`}
          >
            <Icon d={collapsed ? icons.chevronR : icons.chevronL} size={14} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────
export default function SellerLayout() {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(INITIAL_SELLER);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

// renderContent extracted to React Router Outlet

  return (
    // ✅ FIX: `overflow-hidden` on root — sirf andar scroll hoga, bahar nahi
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar */}
      <Sidebar
        seller={seller}
        collapsed={collapsed} setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        navigate={navigate}
      />

      {/* Right column — fills remaining width */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — fixed height, no scroll */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-1"
            >
              <Icon d={icons.menu} size={22} />
            </button>
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest hidden sm:block">Seller Panel</div>
              <div className="text-base sm:text-lg font-black text-gray-900 leading-tight truncate max-w-[200px] sm:max-w-none">{seller.businessName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
              <Icon d={icons.shield} size={11} stroke="#16a34a" /> Verified Seller
            </div>
            {/* ✅ Add Product navigates to /seller/add-product */}
            <button
              onClick={() => navigate("/seller/add-product")}
              className="flex items-center gap-1.5 bg-[#e8511a] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-[#d4460f] transition-colors shadow-sm"
            >
              <Icon d={icons.add} size={15} stroke="white" />
              <span className="hidden sm:block">Add Product</span>
            </button>
          </div>
        </header>

        {/* ✅ Main content routes rendering here */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto">
            <Outlet context={{ seller, setSeller, PRODUCTS, ORDERS, icons, Icon, Badge, StatCard, EditableField, FilmTypesEditor, ALL_FILMS }} />
            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}