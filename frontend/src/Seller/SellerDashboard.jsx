import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

function DashboardView({ seller, navigate }) {
  return (
    <div className=" display-none">
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900 ">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {seller.ownerName.split(" ")[0]}!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 mb-6 gap-4">
        <StatCard icon="package" value={PRODUCTS.length} label="Total Products" sub={`${PRODUCTS.filter(p => p.status === "active").length} active`} color="orange" />
        <StatCard icon="eye" value="659" label="Total Views" sub="Last 30 days" color="blue" />
        <StatCard icon="orders" value="48" label="Total Orders" sub="All time" color="green" />
        <StatCard icon="star" value="4.7" label="Avg. Rating" sub="All products" color="purple" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">Recent Products</h3>
          <button className="text-xs text-[#e8511a] font-semibold">View All</button>
        </div>
        {PRODUCTS.slice(0, 2).map(p => (
          <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon d={icons.package} size={16} stroke="#e8511a" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-800 truncate">{p.name}</div>
              <div className="text-xs text-gray-400">{p.type} · {p.micron}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-gray-800">₹{p.price}/kg</div>
              <Badge color={p.status === "active" ? "green" : "gray"}>{p.status}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">Recent Orders</h3>
          <button className="text-xs text-[#e8511a] font-semibold">View All</button>
        </div>
        {ORDERS.slice(0, 2).map(o => (
          <div key={o.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-800 truncate">{o.buyer}</div>
              <div className="text-xs text-gray-400 truncate">{o.product} · {o.qty}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-gray-800">{o.amount}</div>
              <Badge color={o.status === "delivered" ? "green" : o.status === "shipped" ? "blue" : "orange"}>{o.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsView({ navigate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">My Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">{PRODUCTS.length} products listed</p>
        </div>
        <button
          onClick={() => navigate("/seller/add-product")}
          className="flex items-center gap-2 bg-[#e8511a] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#d4460f] transition-colors shadow-sm"
        >
          <Icon d={icons.add} size={15} stroke="white" />
          <span className="hidden sm:block">Add Product</span>
        </button>
      </div>

      <div className="space-y-3">
        {PRODUCTS.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-orange-200 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon d={icons.layers} size={22} stroke="#e8511a" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-sm text-gray-900">{p.name}</span>
                  <Badge color={p.status === "active" ? "green" : "gray"}>{p.status}</Badge>
                  {p.badge && <Badge color={p.badge === "bestseller" ? "orange" : "blue"}>{p.badge}</Badge>}
                </div>
                <div className="text-xs text-gray-400 mb-1.5">{p.type} · {p.variant} · {p.micron} · {p.width}</div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-gray-900">₹{p.price}/kg</span>
                  <span className="text-gray-500">MOQ: {p.moq}</span>
                  <span className="text-gray-500 hidden sm:block">Stock: {p.stock}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden md:flex items-center gap-4 text-center">
                  <div><div className="text-sm font-bold text-gray-800">{p.views}</div><div className="text-[10px] text-gray-400">Views</div></div>
                  <div><div className="text-sm font-bold text-gray-800">{p.orders}</div><div className="text-[10px] text-gray-400">Orders</div></div>
                  <div>
                    <div className="text-sm font-bold text-gray-800 flex items-center gap-0.5">
                      <Icon d={icons.star} size={11} stroke="#f59e0b" fill="#f59e0b" />{p.rating}
                    </div>
                    <div className="text-[10px] text-gray-400">Rating</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => navigate("/seller/add-product", { state: { product: p } })}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#e8511a] hover:text-[#e8511a] transition-colors"
                  >
                    <Icon d={icons.edit} size={13} />
                  </button>
                  <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors">
                    <Icon d={icons.trash} size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-gray-900">Recent Orders</h2>
        <p className="text-sm text-gray-500 mt-0.5">{ORDERS.length} orders</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Mobile: cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {ORDERS.map(o => (
            <div key={o.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-sm text-gray-900">{o.buyer}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{o.product}</div>
                </div>
                <Badge color={o.status === "delivered" ? "green" : o.status === "shipped" ? "blue" : "orange"}>{o.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{o.qty} · {o.date}</span>
                <span className="font-bold text-gray-900">{o.amount}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Order ID", "Buyer", "Product", "Qty", "Amount", "Date", "Status"].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERS.map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{o.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{o.buyer}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{o.product}</td>
                  <td className="px-5 py-3.5 text-gray-500">{o.qty}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{o.amount}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{o.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge color={o.status === "delivered" ? "green" : o.status === "shipped" ? "blue" : "orange"}>{o.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ seller, setSeller }) {
  const update = (key) => (val) => setSeller(s => ({ ...s, [key]: val }));
  const STATES = ["Gujarat", "Maharashtra", "Rajasthan", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Telangana", "Other"];
  const BUSINESS_TYPES = ["Manufacturer", "Distributor", "Trader", "Converter"];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Seller Profile</h2>
        <p className="text-sm text-gray-500 mt-0.5">Hover any field → click <strong>Edit</strong> to update</p>
      </div>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 flex items-center gap-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #e8511a 0%, transparent 60%)" }} />
        <div className="w-14 h-14 bg-[#e8511a] rounded-2xl flex items-center justify-center text-xl font-black shrink-0 z-10">{seller.avatar}</div>
        <div className="z-10 min-w-0">
          <div className="text-lg font-black truncate">{seller.businessName}</div>
          <div className="text-white/60 text-sm mt-0.5">{seller.city}, {seller.state}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-full font-semibold">
              <Icon d={icons.shield} size={10} stroke="#4ade80" /> Verified Seller
            </span>
            <span className="text-xs text-white/40">Since {seller.joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <Icon d={icons.building} size={15} stroke="#e8511a" />
          <h3 className="font-bold text-gray-800 text-sm">Business Information</h3>
          <span className="text-[10px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 ml-auto">Hover to edit</span>
        </div>
        <div className="px-5">
          <EditableField label="Business / Company Name" value={seller.businessName} onSave={update("businessName")} />
          <EditableField label="Business Type" value={seller.businessType} onSave={update("businessType")} options={BUSINESS_TYPES} />
          <EditableField label="GST Number" value={seller.gstNumber} onSave={update("gstNumber")} />
          <EditableField label="Year Established" value={seller.yearEstablished} onSave={update("yearEstablished")} type="number" />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <Icon d={icons.phone} size={15} stroke="#e8511a" />
          <h3 className="font-bold text-gray-800 text-sm">Contact Details</h3>
        </div>
        <div className="px-5">
          <EditableField label="Owner / Contact Name" value={seller.ownerName} onSave={update("ownerName")} />
          <EditableField label="Email Address" value={seller.email} onSave={update("email")} type="email" />
          <EditableField label="Phone / WhatsApp" value={seller.phone} onSave={update("phone")} type="tel" />
          <EditableField label="City" value={seller.city} onSave={update("city")} />
          <EditableField label="State" value={seller.state} onSave={update("state")} options={STATES} />
          <EditableField label="Business Address" value={seller.address} onSave={update("address")} multiline />
        </div>
      </div>

      {/* Products & Capacity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <Icon d={icons.layers} size={15} stroke="#e8511a" />
          <h3 className="font-bold text-gray-800 text-sm">Products & Capacity</h3>
        </div>
        <div className="px-5">
          <FilmTypesEditor value={seller.filmTypes} onSave={update("filmTypes")} />
          <EditableField label="Monthly Capacity (MT/month)" value={seller.monthlyCapacity} onSave={update("monthlyCapacity")} type="number" />
          <EditableField label="Price Range (₹/kg)" value={seller.priceRange} onSave={update("priceRange")} />
          <EditableField label="Business Description" value={seller.description} onSave={update("description")} multiline />
        </div>
      </div>

      <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
        <Icon d={icons.check} size={16} stroke="#e8511a" />
        <p className="text-sm text-orange-700">Changes are saved instantly when you click <strong>Save</strong> on each field.</p>
      </div>
    </div>
  );
}

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "products", label: "My Products", icon: "products" },
  { id: "orders", label: "Orders", icon: "orders" },
  { id: "profile", label: "Seller Profile", icon: "profile" },
];

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, seller, collapsed, setCollapsed, mobileOpen, setMobileOpen, navigate }) {
  const handleNav = (id) => {
    setActive(id);
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
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${active === item.id ? "bg-[#e8511a] text-white" : "text-white/60 hover:text-white hover:bg-white/5"}
                ${collapsed ? "lg:justify-center" : ""}
              `}
            >
              <Icon d={icons[item.icon]} size={17} />
              <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
            </button>
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
export default function SellerDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [seller, setSeller] = useState(INITIAL_SELLER);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const goAddProduct = () => navigate("/seller/add-product");

  const renderContent = () => {
    switch (active) {
      case "dashboard": return <DashboardView seller={seller} navigate={navigate} />;
      case "products": return <ProductsView navigate={navigate} />;
      case "orders": return <OrdersView />;
      case "profile": return <ProfileView seller={seller} setSeller={setSeller} />;
      default: return <DashboardView seller={seller} navigate={navigate} />;
    }
  };

  return (
    // ✅ FIX: `overflow-hidden` on root — sirf andar scroll hoga, bahar nahi
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar */}
      <Sidebar
        active={active} setActive={setActive}
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
              onClick={goAddProduct}
              className="flex items-center gap-1.5 bg-[#e8511a] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-[#d4460f] transition-colors shadow-sm"
            >
              <Icon d={icons.add} size={15} stroke="white" />
              <span className="hidden sm:block">Add Product</span>
            </button>
          </div>
        </header>

        {/* ✅ Main content — ONLY this scrolls, no body scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto">
            {renderContent()}
            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}