import { useOutletContext, useNavigate } from "react-router-dom";

export function SellerDashboard() {
  const { seller, PRODUCTS, ORDERS, icons, Icon, Badge, StatCard } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="">
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900 ">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {seller.ownerName.split(" ")[0]}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4">
        <StatCard icon="package" value={PRODUCTS.length} label="Total Products" sub={`${PRODUCTS.filter(p => p.status === "active").length} active`} color="orange" />
        <StatCard icon="eye" value="659" label="Total Views" sub="Last 30 days" color="blue" />
        <StatCard icon="orders" value="48" label="Total Orders" sub="All time" color="green" />
        <StatCard icon="star" value="4.7" label="Avg. Rating" sub="All products" color="purple" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">Recent Products</h3>
          <button className="text-xs text-[#e8511a] font-semibold" onClick={() => navigate("/seller/products")}>View All</button>
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
          <button className="text-xs text-[#e8511a] font-semibold" onClick={() => navigate("/seller/orders")}>View All</button>
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

export function SellerProducts() {
  const { PRODUCTS, icons, Icon, Badge } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">My Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">{PRODUCTS.length} products listed</p>
        </div>
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

export function SellerOrders() {
  const { ORDERS, Badge } = useOutletContext();

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

export function SellerProfile() {
  const { seller, setSeller, icons, Icon, EditableField, FilmTypesEditor } = useOutletContext();
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