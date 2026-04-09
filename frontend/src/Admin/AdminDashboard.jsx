import { useState, useEffect } from "react";
import { 
  fetchDashboardStats, fetchAllUsers, fetchAllSellers, fetchPendingSellers, 
  approveSellerAccount, rejectSellerAccount, fetchAllProductsAdmin, deleteProductAdmin,
  updateUserAccount, deleteUserAccount, fetchAllOrdersAdmin,
  fetchUserOrdersAdmin, fetchSellerOrdersAdmin, fetchSellerProductsAdmin,
  fetchSellersWithOrdersAdmin
} from "../services/adminServices";
import { 
  Users, Store, Package, LayoutDashboard, ShieldCheck, 
  Trash2, Edit3, CheckCircle, XCircle, Search, MoreVertical,
  BarChart3, ShoppingBag, ArrowUpRight, TrendingUp, ArrowLeft
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Pagination from "../components/ui/Pagination";
import { StatCardSkeleton, TableSkeleton } from "../components/ui/SkeletonLoader";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [stats, setStats] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'user'|'seller', id, name }
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    setSelectedEntity(null);
    setSearch("");
    setCurrentPage(1); // Reset page on tab change
    loadDashboardData(1, activeTab, null);
  }, [activeTab]);

  useEffect(() => {
    if (selectedEntity) {
      setCurrentPage(1); // Reset page on drill-down
      loadDashboardData(1, activeTab, selectedEntity);
    }
  }, [selectedEntity]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadDashboardData(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadDashboardData = async (page = currentPage, currentTab = activeTab, entity = selectedEntity) => {
    setLoading(true);
    try {
      let res;
      // Handle Drill-down (Overrides basic tab fetch if entity selected)
      if (entity) {
        if (entity.type === "user") {
          res = await fetchUserOrdersAdmin(entity.id, page, limit); 
        } else if (entity.type === "seller" && entity.mode === "orders") {
          res = await fetchSellerOrdersAdmin(entity.id, page, limit);
        } else if (entity.type === "seller" && entity.mode === "products") {
          res = await fetchSellerProductsAdmin(entity.id, page, limit);
        }
        if (res?.success) {
          setData(res.orders || res.products || []);
          setTotalPages(res.totalPages || 1);
        }
      } else {
        if (currentTab === "overview") {
          res = await fetchDashboardStats();
          if (res.success) setStats(res.stats);
        } else if (currentTab === "users") {
          res = await fetchAllUsers(page, limit);
          if (res.success) {
            setData(res.users);
            setTotalPages(res.totalPages);
          }
        } else if (currentTab === "pending") {
          res = await fetchPendingSellers(page, limit);
          if (res.success) {
            setData(res.sellers);
            setTotalPages(res.totalPages);
          }
        } else if (currentTab === "sellers") {
          res = await fetchAllSellers(page, limit);
          if (res.success) {
            setData(res.sellers);
            setTotalPages(res.totalPages);
          }
        } else if (currentTab === "products") {
          res = await fetchAllProductsAdmin(page, limit);
          if (res.success) {
            setData(res.products);
            setTotalPages(res.totalPages);
          }
        } else if (currentTab === "orders") {
          res = await fetchAllOrdersAdmin(page, limit);
          if (res.success) {
            setData(res.orders);
            setTotalPages(res.totalPages);
          }
        } else if (currentTab === "sellerorders") {
          res = await fetchSellersWithOrdersAdmin(page, limit);
          if (res.success) {
            setData(res.sellers);
            setTotalPages(res.totalPages);
          }
        }
      }
    } catch (error) {
      notifyError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure? This will permanently delete the user.")) return;
    try {
      await deleteUserAccount(id);
      notifySuccess("User deleted");
      loadDashboardData();
    } catch (e) { notifyError("Failed to delete"); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProductAdmin(id);
      notifySuccess("Product deleted");
      loadDashboardData();
    } catch (e) { notifyError("Failed to delete"); }
  };

  const handleApproveSeller = async (id) => {
    try {
      await approveSellerAccount(id);
      notifySuccess("Seller approved");
      loadDashboardData();
    } catch (e) { notifyError("Approval failed"); }
  };

  const filteredData = data.filter(item => {
    const term = search.toLowerCase();
    return (
      (item.name?.toLowerCase().includes(term)) ||
      (item.email?.toLowerCase().includes(term)) ||
      (item.company_name?.toLowerCase().includes(term)) ||
      (item.owner_name?.toLowerCase().includes(term)) ||
      (item.customer_name?.toLowerCase().includes(term))
    );
  });

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-syne text-gray-900 uppercase tracking-tighter flex items-center gap-2">
            {selectedEntity ? (
              <button 
                onClick={() => {
                  setSelectedEntity(null);
                  setCurrentPage(1);
                  loadDashboardData(1, activeTab, null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-bold mr-2"
                title="Back"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">BACK</span>
              </button>
            ) : null}
            {selectedEntity 
              ? (selectedEntity.mode === "products" 
                  ? `Products for ${selectedEntity.name}` 
                  : `Orders for ${selectedEntity.name}`) 
              : activeTab.replace("-", " ")}
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {selectedEntity 
              ? (selectedEntity.mode === "products" 
                  ? `Seller product catalog` 
                  : `Tracking ${selectedEntity.type} sales and history`) 
              : "Management Hub"}
          </p>
        </div>

        {activeTab !== "overview" && (
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm w-full md:w-72 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="animate-fadeIn">
          {activeTab === "overview" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
            </div>
          ) : (
            <TableSkeleton rows={6} cols={activeTab === "orders" || activeTab === "sellerorders" ? 5 : 4} />
          )}
        </div>
      ) : (
        <div>
            
          {/* ── Overview Stats ── */}
          {activeTab === "overview" && stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Users", val: stats.totalUsers, icon: <Users />, color: "bg-blue-500", trend: "Active Community" },
                { label: "Active Sellers", val: stats.totalSellers, icon: <Store />, color: "bg-orange-500", trend: "Businesses Sync" },
                { label: "Total Products", val: stats.totalProducts, icon: <Package />, color: "bg-purple-500", trend: "Market Catalog" },
                { label: "New Apps", val: stats.pendingSellers, icon: <LayoutDashboard />, color: "bg-red-500", trend: "Awaiting Action" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  {/* Decorative glow */}
                  <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${s.color} opacity-10 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 ${s.color} text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-${s.color.split('-')[1]}-500/30 ring-1 ring-white/20`}>{s.icon}</div>
                    <div className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[9px] font-black text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-widest shadow-sm">Live</div>
                  </div>
                  <p className="text-4xl font-black font-syne text-gray-900 mb-1">{s.val}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-green-500">
                     <TrendingUp size={12} /> {s.trend}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Users / Sellers / Products / Pending Table ── */}
          {(activeTab === "users" || activeTab === "sellers" || activeTab === "products" || activeTab === "pending") && !selectedEntity && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-gray-100 backdrop-blur-sm">
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeTab === "products" ? "Seller" : "Email"}</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeTab === "products" ? "Price" : "Status"}</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item, idx) => (
                      <motion.tr
                        key={item.id || item.user_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 flex items-center justify-center text-gray-500 text-sm font-black shadow-sm shrink-0">
                                 {activeTab === "products" ? <Package size={18} /> : item.name?.[0].toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-gray-900">{item.name || item.company_name || "N/A"}</p>
                                 <p className="text-[10px] text-gray-400 uppercase font-black">{activeTab === "users" ? item.role : activeTab === "products" ? item.category_name : item.business_type}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">{activeTab === "products" ? item.seller_name : item.email}</span>
                            {item.seller_uid && (
                              <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">ID: {item.seller_uid}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           {activeTab === "products" ? (
                             <span className="text-sm font-black text-gray-900">₹{item.price}</span>
                           ) : activeTab === "sellers" ? (
                             <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${item.is_verified ? "bg-green-50 text-green-600 border-green-100" : "bg-yellow-50 text-yellow-600 border-yellow-100"}`}>
                               {item.is_verified ? "Active" : "Pending"}
                             </span>
                           ) : activeTab === "pending" ? (
                             <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border bg-yellow-50 text-yellow-600 border-yellow-100">Pending</span>
                           ) : (
                             <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${item.is_verified ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                               {item.is_verified ? "Active" : "Unverified"}
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                               {activeTab === "pending" && (
                                 <button onClick={() => handleApproveSeller(item.user_id)} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all" title="Approve"><CheckCircle size={16} /></button>
                               )}
                               {activeTab === "sellers" && (
                                 <button 
                                    onClick={() => setSelectedEntity({ type: "seller", id: item.user_id, name: item.company_name, mode: "products" })}
                                    className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
                                    title="View Products"
                                 >
                                    <Package size={16} />
                                 </button>
                               )}
                              <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all" title="Edit"><Edit3 size={16} /></button>
                              <button 
                                onClick={() => activeTab === "products" ? handleDeleteProduct(item.id) : activeTab === "users" ? handleDeleteUser(item.id) : null}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
            </div>
            {!search && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </div>
        )}

          {/* ── Orders Table (All Orders tab OR drill-down orders) ── */}
          {(activeTab === "orders" || selectedEntity?.mode === "orders") && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-gray-100 backdrop-blur-sm">
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Info</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((order, idx) => (
                      <motion.tr key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: idx * 0.04 }} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
                           <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Order Transaction</p>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-sm font-semibold text-gray-600">{order.customer_name}</p>
                           <p className="text-[10px] text-gray-400 uppercase font-black">{order.customer_email}</p>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-sm font-black text-gray-900">₹{order.total_price}</span>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                             order.status === "Delivered" ? "bg-green-50 text-green-600 border-green-100" :
                             order.status === "Cancelled" ? "bg-red-50 text-red-600 border-red-100" :
                             "bg-blue-50 text-blue-600 border-blue-100"
                           }`}>
                             {order.status}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-500">
                           {new Date(order.order_date).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
            </div>
            {!search && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </div>
        )}

          {/* ── Seller Products Drill-down Table ── */}
          {selectedEntity?.mode === "products" && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-gray-100 backdrop-blur-sm">
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item, idx) => (
                      <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: idx * 0.04 }} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/60 flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                               <Package size={18} />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-gray-900">{item.name}</p>
                               <p className="text-[10px] text-gray-400 uppercase font-black">{item.unit || "—"}</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium text-gray-600">{item.category_name || "—"}</span>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-sm font-black text-gray-900">₹{item.price}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => handleDeleteProduct(item.id)}
                               className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
            </div>
            {!search && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </div>
        )}

          {/* ── Seller Orders Hub Table ── */}
          {activeTab === "sellerorders" && !selectedEntity && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-gray-100 backdrop-blur-sm">
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Seller</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">View Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((seller, idx) => (
                      <motion.tr key={seller.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: idx * 0.04 }} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/60 flex items-center justify-center text-orange-600 font-black text-sm shadow-sm shrink-0">
                              {seller.company_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{seller.company_name}</p>
                              {seller.seller_uid && (
                                <p className="text-[10px] font-black text-orange-400 uppercase group-hover:text-orange-600 transition-colors">ID: {seller.seller_uid}</p>
                              )}
                              <p className="text-[10px] text-gray-400 uppercase font-black">{seller.business_type || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-500">{seller.email}</td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border bg-blue-50 text-blue-600 border-blue-100">
                            {seller.total_orders} Orders
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-gray-900">₹{Number(seller.total_revenue).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => setSelectedEntity({ type: "seller", id: seller.user_id, name: seller.company_name, mode: "orders" })}
                            className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl transition-all"
                            title="View Orders"
                          >
                            <ShoppingBag size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
            </div>
            {!search && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </div>
        )}

        </div>
      )}
    </div>
  );
}