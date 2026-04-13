import { useState, useEffect } from "react";
import { 
  Users, Store, ShoppingBag, TrendingUp, AlertCircle, 
  CheckCircle2, XCircle, Search, Filter, Mail, Phone, 
  MapPin, Clock, ArrowUpRight, MoreVertical, LayoutDashboard,
  HardDrive, Database, Settings, RefreshCcw, Download,
  ChevronLeft, ChevronRight, Inbox, MessageSquare, Zap, FileText, Send
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  fetchDashboardStats, 
  fetchAllSellers, 
  fetchPendingSellers, 
  approveSellerAccount, 
  rejectSellerAccount,
  fetchAllUsers,
  updateUserAccount,
  deleteUserAccount,
  fetchAllProductsAdmin,
  deleteProductAdmin,
  fetchAllOrdersAdmin,
  fetchInquiriesAdmin,
  fetchSellersWithOrdersAdmin,
  fetchSellerProductsAdmin,
  fetchSellerOrdersAdmin,
  toggleHotDealAdmin,
  fetchLeadRecommendations
} from "../services/adminServices";
import Pagination from "../components/ui/Pagination";
import { useNotification } from "../context/NotificationContext";
import { API_BASE_URL } from "../services/api";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  
  const TAB_INFO = {
    overview: { title: "Admin Control", desc: "Manage marketplace operations, users, and business leads." },
    sellers: { title: "Approved Sellers", desc: "View and manage all verified manufacturers and traders on the platform." },
    pending: { title: "Pending Approvals", desc: "Review and verify new seller applications before they go live." },
    users: { title: "User Directory", desc: "Manage buyer accounts and monitor user activity across the system." },
    products: { title: "Product Catalog", desc: "Inspect and manage all packaging film variants listed by sellers." },
    orders: { title: "Sales Orders", desc: "Monitor all transactions and order fulfillment statuses in real-time." },
    inquiries: { title: "Business Leads", desc: "Tracking all buyer inquiries and procurement requests." },
    "seller-hub": { title: "Seller Hub", desc: "Performance analytics and deep-dive into individual seller operations." },
  };

  const currentTab = TAB_INFO[activeTab] || TAB_INFO.overview;
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    pendingSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalInquiries: 0
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { notifySuccess, notifyError } = useNotification();

  // Secondary views (e.g., viewing a specific seller's products)
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset page on tab change
    setSearch(""); // Clear search on tab change
    loadTabData(1);
  }, [activeTab]);

  const loadDashboardStats = async () => {
    try {
      const res = await fetchDashboardStats();
      if (res.success) setStats(res.stats);
    } catch (err) {
      notifyError("Failed to load dashboard stats");
    }
  };

  const loadTabData = async (page) => {
    setLoading(true);
    setData([]); // Clear old data before loading new
    try {
      let res;
      switch (activeTab) {
        case "sellers":
          res = await fetchAllSellers(page);
          setData(res.sellers);
          break;
        case "pending":
          res = await fetchPendingSellers(page);
          setData(res.sellers);
          break;
        case "users":
          res = await fetchAllUsers(page);
          setData(res.users);
          break;
        case "products":
          res = await fetchAllProductsAdmin(page);
          setData(res.products);
          break;
        case "orders":
          res = await fetchAllOrdersAdmin(page);
          setData(res.orders);
          break;
        case "inquiries":
          res = await fetchInquiriesAdmin(page);
          setData(res.inquiries);
          break;
        case "seller-hub":
          res = await fetchSellersWithOrdersAdmin(page);
          setData(res.sellers);
          break;
      }
      if (res) {
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || 1);
      }
    } catch (err) {
      notifyError(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id) => {
    try {
      const res = await approveSellerAccount(id);
      if (res.success) {
        notifySuccess("Seller approved successfully");
        loadTabData(currentPage);
        loadDashboardStats();
      }
    } catch (err) {
      notifyError("Approval failed");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadTabData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleHotDeal = async (id, currentVal) => {
    try {
      const res = await toggleHotDealAdmin(id, !currentVal);
      if (res.success) {
        notifySuccess(res.message);
        loadTabData(currentPage);
      }
    } catch (err) {
      notifyError("Failed to update status");
    }
  };

  const filteredData = Array.isArray(data) ? data.filter((item) => {
    const s = search.toLowerCase();
    if (activeTab === "users") return item.name?.toLowerCase().includes(s) || item.email?.toLowerCase().includes(s);
    if (activeTab === "products") return item.name?.toLowerCase().includes(s) || item.seller_name?.toLowerCase().includes(s);
    if (activeTab === "sellers" || activeTab === "pending" || activeTab === "seller-hub") return item.company_name?.toLowerCase().includes(s) || item.owner_name?.toLowerCase().includes(s);
    if (activeTab === "inquiries") return item.buyer_display_name?.toLowerCase().includes(s) || item.product_name?.toLowerCase().includes(s);
    if (activeTab === "orders") return item.customer_name?.toLowerCase().includes(s) || item.id?.toString().includes(s);
    return true;
  }) : [];

  return (
    <div className="p-4 md:p-8">
      {/* ── Header Section ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                 <LayoutDashboard size={24} />
              </div>
              <h1 className="font-syne font-black text-3xl text-gray-900 uppercase tracking-tight">
                {currentTab.title}
              </h1>
           </div>
           <p className="text-gray-500 text-sm font-medium">
             {currentTab.desc}
           </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium w-full md:w-80 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-sm"
              />
           </div>
           <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <Download size={20} />
           </button>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: "Total Users", val: stats.totalUsers, icon: <Users size={20}/>, color: "blue", trend: "+12%", tab: "users" },
            { label: "Active Sellers", val: stats.totalSellers, icon: <Store size={20}/>, color: "orange", trend: "+5%", tab: "sellers" },
            { label: "Live Products", val: stats.totalProducts, icon: <ShoppingBag size={20}/>, color: "purple", trend: "+18%", tab: "products" },
            { label: "Business Leads", val: stats.totalInquiries, icon: <TrendingUp size={20}/>, color: "green", trend: "+24%", tab: "inquiries" }
          ].map((stat) => (
            <motion.div 
              key={stat.label}
              whileHover={{ y: -5 }}
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set("tab", stat.tab);
                window.history.pushState({}, "", url);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="bg-white p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125`} />
              <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4 relative`}>
                {stat.icon}
              </div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-syne font-black text-gray-900">{stat.val}</h3>
                <span className="text-[10px] font-black text-green-500 mb-1.5">{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}


      {/* ── Content Area ── */}
      <div className="relative">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 min-h-[400px]">
                <RefreshCcw className="animate-spin text-accent mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing real-time data...</p>
             </div>
        ) : (
          <div className="space-y-6">
            
            {/* ── Sellers Management Table ── */}
            {(activeTab === "sellers" || activeTab === "pending") && (
              <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[900px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company & Owner</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Detail</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Joined</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredData.map((seller, idx) => (
                          <motion.tr 
                            key={seller.user_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className="hover:bg-gray-50/50 transition-all group"
                          >
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-syne font-black shrink-0">
                                     {seller.company_name[0]}
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-gray-900 leading-tight">{seller.company_name}</h4>
                                     <p className="text-xs text-gray-500 font-medium">By {seller.owner_name}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="space-y-1.5">
                                  <span className="inline-flex px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase border border-blue-100">
                                     {seller.business_type}
                                  </span>
                                  <p className="text-xs font-bold text-gray-400">GST: {seller.gst_number}</p>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                  <MapPin size={14} className="text-accent" />
                                  {seller.city}, {seller.state}
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                  <Clock size={14} />
                                  {new Date(seller.created_at).toLocaleDateString()}
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2 ">
                                  {activeTab === "pending" && (
                                    <>
                                      {seller.gst_certificate && (
                                        <button 
                                          onClick={() => window.open(`${API_BASE_URL}/${seller.gst_certificate}`, '_blank')}
                                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                                          title="View GST Certificate"
                                        >
                                          <FileText size={18} />
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => handleApproveSeller(seller.user_id)}
                                        className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all"
                                        title="Approve Seller"
                                      >
                                        <CheckCircle2 size={18} />
                                      </button>
                                    </>
                                  )}
                                  <button className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all" title="Reject/Remove">
                                     <XCircle size={18} />
                                  </button>
                                  <button className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-200 rounded-xl transition-all">
                                     <MoreVertical size={18} />
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

            {/* ── Products Management Table ── */}
            {activeTab === "products" && (
               <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[850px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Info</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manufacturer</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price & Details</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredData.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition-all group">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                     <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-gray-900 leading-tight mb-1">{p.name}</h4>
                                     <span className="text-[10px] font-black uppercase text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/10">{p.category_name}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <h4 className="text-sm font-bold text-gray-900">{p.seller_name}</h4>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.seller_uid}</p>
                            </td>
                            <td className="px-8 py-6">
                               <div className="space-y-1">
                                  <p className="font-syne font-black text-gray-900">₹{p.price}/{p.unit}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">Min: {p.min_order}kg · Stock: {p.stock}kg</p>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2 ">
                                   <button 
                                     onClick={() => handleToggleHotDeal(p.id, p.is_hot_deal)}
                                     className={`p-2.5 rounded-xl transition-all ${
                                       p.is_hot_deal 
                                         ? "bg-orange-100 text-orange-600 hover:bg-orange-200" 
                                         : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                     }`}
                                     title={p.is_hot_deal ? "Remove from Hot Deas" : "Add to Hot Deals"}
                                   >
                                      <Zap size={18} fill={p.is_hot_deal ? "currentColor" : "none"} />
                                   </button>
                                   <button className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-200 rounded-xl transition-all" title="View Details">
                                      <ArrowUpRight size={18} />
                                   </button>
                                   <button className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all" title="Delete Product">
                                      <XCircle size={18} />
                                   </button>
                                </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                {!search && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
               </div>
            )}

            {/* ── Business Sales Hub ── */}
            {activeTab === "seller-hub" && (
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manufacturer</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sales Performance</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">View Hub</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredData.map((seller, idx) => (
                          <motion.tr 
                            key={seller.user_id} 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center font-black">
                                     {seller.company_name[0]}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-gray-900">{seller.company_name}</p>
                                     <p className="text-[10px] font-black text-accent uppercase">{seller.business_type}</p>
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
                              <div className="flex items-center justify-end gap-2">
                                {seller.gst_certificate && (
                                  <button 
                                    onClick={() => window.open(`${API_BASE_URL}/${seller.gst_certificate}`, '_blank')}
                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                                    title="View GST Certificate"
                                  >
                                    <FileText size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedEntity({ type: "seller", id: seller.user_id, name: seller.company_name, mode: "orders" })}
                                  className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl transition-all"
                                  title="View Orders"
                                >
                                  <ShoppingBag size={16} />
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
            {/* ── Orders Management Table ── */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[850px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredData.map((order, idx) => (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                             <td className="px-8 py-6">
                                <span className="font-bold text-gray-900">#{order.id}</span>
                             </td>
                             <td className="px-8 py-6">
                                <p className="font-bold text-gray-900">{order.customer_name}</p>
                                <p className="text-xs text-gray-500">{order.customer_email}</p>
                             </td>
                             <td className="px-8 py-6">
                                <p className="font-syne font-black text-gray-900">₹{order.total_price}</p>
                             </td>
                             <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  order.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                                  order.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 
                                  'bg-blue-50 text-blue-600'
                                }`}>
                                  {order.status}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-xs font-bold text-gray-500">
                                {new Date(order.order_date).toLocaleDateString()}
                             </td>
                             <td className="px-8 py-6 text-right">
                                <button className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-200 rounded-xl transition-all">
                                   <MoreVertical size={18} />
                                </button>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                {!search && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
              </div>
            )}
          {/* ── Inquiries (Leads) Table ── */}
          {activeTab === "inquiries" && (
             <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
               <div className="overflow-x-auto scrollbar-hide">
                 <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-gray-100 backdrop-blur-sm">
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Buyer Details</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requirement & Specs</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manufacturer Details</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((inquiry, idx) => (
                      <motion.tr key={inquiry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: idx * 0.04 }} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                                 {inquiry.buyer_display_name[0]}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-gray-900">{inquiry.buyer_display_name}</p>
                                 <div className="flex flex-col gap-1 mt-1">
                                    <a href={`tel:${inquiry.buyer_display_mobile}`} className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:underline">
                                       <Phone size={10} /> +91 {inquiry.buyer_display_mobile}
                                    </a>
                                    <div className="flex flex-col gap-1 mt-0.5">
                                       <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black uppercase tracking-wider">
                                          <MapPin size={10} /> {inquiry.pincode ? `PIN: ${inquiry.pincode}` : "PIN N/A"}
                                       </div>
                                       {inquiry.address && (
                                         <p className="text-[10px] text-accent font-bold leading-tight mt-0.5">
                                           {inquiry.address}
                                         </p>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gray-50 rounded-lg p-1 border border-gray-100 flex-shrink-0">
                                 <img src={inquiry.image_url} alt="" className="w-full h-full object-cover rounded-md" />
                              </div>
                              <p className="text-xs font-bold text-gray-600 line-clamp-1">{inquiry.product_name}</p>
                           </div>
                           <p className="text-xs font-medium text-gray-900 leading-relaxed max-w-xs line-clamp-2 italic mb-2">
                              "{inquiry.message}"
                           </p>
                           <div className="flex flex-wrap gap-2">
                               <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                 Qty: {inquiry.quantity_required}
                               </span>
                               {(inquiry.thickness || inquiry.width) && (
                                 <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                   {inquiry.thickness || "-"} x {inquiry.width || "-"}
                                 </span>
                               )}
                            </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-sm font-bold text-gray-900">{inquiry.seller_name}</p>
                           <div className="flex items-center gap-1.5 mt-1 text-gray-400 uppercase font-black text-[9px]">
                              <MapPin size={10} /> {inquiry.seller_city}, {inquiry.seller_state}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-[11px] font-bold text-gray-500">
                           {new Date(inquiry.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                             <button 
                               onClick={() => setSelectedEntity({ type: "lead", id: inquiry.id, name: inquiry.buyer_display_name, mode: "lead-matching", location: inquiry.address })}
                               className="p-2 bg-accent/10 text-accent hover:bg-accent/20 rounded-xl transition-all flex items-center gap-1.5"
                               title="Find Nearby Sellers"
                             >
                               <Zap size={16} />
                               <span className="text-[10px] font-black uppercase tracking-wider pr-1">Match Sellers</span>
                             </button>
                             {inquiry.buyer_display_email && (
                               <a 
                                 href={`mailto:${inquiry.buyer_display_email}`} 
                                 className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                                 title="Email Buyer"
                               >
                                 <Mail size={16} />
                               </a>
                             )}
                             <button className="p-2 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-xl transition-all" title="More Options">
                               <MoreVertical size={16} />
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

          {/* ── Users Management Table ── */}
          {activeTab === "users" && (
             <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name & Email</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified</th>
                          <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredData.map((u, idx) => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition-all group">
                             <td className="px-8 py-6">
                                <p className="font-bold text-gray-900">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                             </td>
                             <td className="px-8 py-6">
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-600">{u.role}</span>
                             </td>
                             <td className="px-8 py-6">
                                {u.is_verified ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-gray-300" />}
                             </td>
                             <td className="px-8 py-6 text-right">
                                <button className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all">
                                   <XCircle size={18} />
                                </button>
                             </td>
                          </tr>
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

      {/* ── Sub-level Views (Overlays) ── */}
      <AnimatePresence>
        {selectedEntity && (
           <SubViewOverlay 
              entity={selectedEntity} 
              onClose={() => setSelectedEntity(null)} 
              notifyError={notifyError}
           />
        )}
      </AnimatePresence>
    </div>
  );
}

// SubView Component (e.g., View Orders for a Seller)
function SubViewOverlay({ entity, onClose, notifyError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubData = async () => {
      setLoading(true);
      try {
        let res;
        if(entity.type === "seller" && entity.mode === "orders") {
           res = await fetchSellerOrdersAdmin(entity.id);
           setItems(res.orders || []);
        } else if(entity.type === "seller" && entity.mode === "products") {
           res = await fetchSellerProductsAdmin(entity.id);
           setItems(res.products || []);
        } else if(entity.type === "lead" && entity.mode === "lead-matching") {
           res = await fetchLeadRecommendations(entity.id);
           setItems(res.recommendations || []);
        }
      } catch (err) {
        notifyError("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    loadSubData();
  }, [entity]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl sm:rounded-[3rem] w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-5 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                 <Zap className="text-accent" size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-0.5">
                    {entity.mode === "lead-matching" ? "Smart Recommendation" : entity.type + " Details"}
                 </p>
                 <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter leading-tight">{entity.name}</h2>
                 {entity.location && (
                   <p className="text-[10px] md:text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                      <MapPin size={10} /> {entity.location}
                   </p>
                 )}
              </div>
           </div>
           <button onClick={onClose} className="self-end sm:self-auto p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-sm transition-all">
              <XCircle size={24} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-white">
           {loading ? (
             <div className="py-20 text-center"><RefreshCcw className="animate-spin mx-auto text-accent mb-4" /></div>
           ) : items.length === 0 ? (
             <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No records found.</div>
           ) : (
             <div className="space-y-4">
                {entity.mode === "orders" && items.map(order => (
                  <div key={order.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Ref: #{order.id}</p>
                          <p className="text-sm font-bold text-gray-900">Buyer: {order.customer_name}</p>
                       </div>
                       <div className="text-right">
                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">{order.status}</span>
                          <p className="text-xs font-bold text-gray-900 mt-1">₹{order.total_price}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {order.items?.map((item, i) => (
                         <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                               <ShoppingBag size={20} className="text-accent" />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-gray-900 leading-tight">{item.name}</p>
                               <p className="text-[9px] font-black text-gray-400 uppercase mt-1">{item.qty}kg · {item.thickness} · {item.width}mm</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}

                {entity.mode === "lead-matching" && items.map((seller, idx) => (
                   <div key={seller.id} className={`p-6 rounded-[2rem] border transition-all ${idx === 0 ? 'bg-accent/5 border-accent/20 shadow-lg shadow-accent/5' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${idx === 0 ? 'bg-accent text-white' : 'bg-gray-900 text-white'}`}>
                               {seller.company_name[0]}
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-syne font-black text-gray-900 text-lg uppercase tracking-tight">{seller.company_name}</h4>
                                  {idx === 0 && (
                                    <span className="bg-accent text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1 animate-pulse">
                                      <Zap size={8} fill="currentColor" /> Best Match
                                    </span>
                                  )}
                               </div>
                               <div className="flex flex-wrap gap-3">
                                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                     <MapPin size={12} className="text-accent" />
                                     {seller.city}, {seller.state}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                     Match Score: <span className="text-accent">{seller.match_score}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <a href={`tel:${seller.phone}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all">
                               <Phone size={16} /> Call
                            </a>
                            <a href={`mailto:${seller.email}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
                               <Send size={16} /> Share Lead
                            </a>
                         </div>
                      </div>
                      
                      {/* Seller Badges */}
                      <div className="mt-4 flex flex-wrap gap-2">
                         <span className="text-[9px] font-black uppercase tracking-widest bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-400">
                            {seller.business_type}
                         </span>
                         <span className="text-[9px] font-black uppercase tracking-widest bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-400">
                            GST: {seller.gst_number}
                         </span>
                      </div>
                   </div>
                 ))}
             </div>
           )}
        </div>
      </motion.div>
    </motion.div>
  );
}
