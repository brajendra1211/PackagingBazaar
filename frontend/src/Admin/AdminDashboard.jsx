import { useState, useEffect, useRef } from "react";
import { 
  Users, Store, ShoppingBag, TrendingUp, AlertCircle, 
  CheckCircle2, XCircle, Search, Filter, Mail, Phone, 
  MapPin, Clock, ArrowUpRight, MoreVertical, LayoutDashboard,
  HardDrive, Database, Settings, RefreshCcw, Download,
  ChevronLeft, ChevronRight, Inbox, MessageSquare, Zap, FileText, Send,
  Plus, Tag, Layers, Package, Image as ImageIcon
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  fetchDashboardStats, 
  fetchAllSellers, 
  fetchPendingSellers, 
  updateSellerStatus, 
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
  fetchLeadRecommendations,
  addProductForSeller,
  uploadProductImage
} from "../services/adminServices";
import { fetchAllSellers as fetchAllSellersStatic } from "../services/adminServices"; // Re-importing to use in picker without pagination conflicts if needed
import Pagination from "../components/ui/Pagination";
import { useNotification } from "../context/NotificationContext";
import { API_BASE_URL } from "../services/api";

const CATEGORIES = ["BOPP", "PET", "CPP", "LAMINATED"];
const SUBCATEGORIES = {
  BOPP: ["Transparent", "Pearl", "Matte", "Thermal", "Holographic", "Opaque", "Metalized", "Cold Seal", "Anti-fog", "Shrink", "Barrier", "Printable", "Soft Touch", "Woven", "Other"],
  PET: ["Clear", "Metalized", "Matte", "White", "TTO", "Shrink", "Release", "Barrier", "Antistatic", "Printable", "UV Block", "Laminate", "Retort", "Other"],
  CPP: ["Transparent", "Matte", "Metalized", "White", "Retort", "Pearl", "Low Seal", "Anti-fog", "Barrier", "Shrink", "Blister", "Soft Pack", "Printable", "Cold Chain", "Lamination", "Premium", "Other"],
  LAMINATED: ["BOPP-PET", "PET-CPP", "PET-BOPP", "PET-PE", "BOPP-CPP", "3 Layer", "High Barrier", "BOPP-PE", "Retort", "Foil Laminate", "Other"]
};
const TAGS = ["", "bestseller", "trending", "featured", "new", "premium"];
const UNITS = ["kg", "meter", "roll"];
const COMMON_APPLICATIONS = ["Food packaging", "Retail wrap", "Label stock", "Chocolate wrap", "Gift packaging", "Bakery", "Snack packaging", "Chips", "Namkeen", "Pharma", "Cosmetics", "Garments", "Textiles", "Dairy", "Beverages", "Frozen food", "Retort pouches", "Vacuum packs", "Flexible packaging"];
const STEPS = ["Seller", "Basic Info", "Specifications", "Applications", "Preview"];

const inputCls = "w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-surface focus:outline-none focus:border-accent transition-colors text-ink placeholder:text-ink3";

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
    "add-product": { title: "Add Seller Product", desc: "List new products on behalf of verified marketplace sellers." },
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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const { notifySuccess, notifyError } = useNotification();

  // Add Product State
  const [allVerifiedSellers, setAllVerifiedSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [productSubmitted, setProductSubmitted] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [form, setForm] = useState({
    name: "", category: "BOPP", subcategory: "", tag: "",
    thickness: "", width: "", minPrice: "", maxPrice: "", unit: "kg",
    minOrder: "", stock: "", description: "", applications: [], img: ""
  });

  // Status Update Modal State
  const [statusModal, setStatusModal] = useState({ 
    isOpen: false, 
    userId: null, 
    newStatus: '', 
    message: '', 
    mobile: '' 
  });

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
        case "add-product":
          // Fetch all verified sellers for the picker
          const sellersRes = await fetchAllSellersStatic(1, 1000); // Get many at once for simple picking
          setAllVerifiedSellers(sellersRes.sellers || []);
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

  const handleStatusUpdate = async () => {
    const { userId, newStatus, message, mobile } = statusModal;
    if (!message) return notifyError("Please enter a status message for the seller");

    try {
      const res = await updateSellerStatus(userId, newStatus);
      if (res.success) {
        notifySuccess(`Seller updated to ${newStatus}`);
        setStatusModal({ ...statusModal, isOpen: false });
        
        // Notification Logic - Abstracted for future API integration
        // Currently uses WhatsApp redirect
        const encodedMsg = encodeURIComponent(message);
        const waLink = `https://wa.me/${mobile}?text=${encodedMsg}`;
        window.open(waLink, "_blank");
        
        loadTabData(currentPage);
      }
    } catch (err) {
      notifyError("Failed to update status");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadTabData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add Product Handlers
  const setFormVal = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addApp = (app) => {
    if (app && !form.applications.includes(app)) {
      setFormVal("applications", [...form.applications, app]);
    }
  };
  const removeApp = (app) => setFormVal("applications", form.applications.filter(a => a !== app));

  const handleCreateProductByAdmin = async () => {
    if (!selectedSeller) return notifyError("Please select a seller first");
    
    setLoading(true);
    try {
      const productData = {
        ...form,
        price: parseFloat(form.price),
        minOrder: parseInt(form.minOrder),
        stock: parseInt(form.stock)
      };
      
      const res = await addProductForSeller(selectedSeller.user_id, productData);
      if (res.success) {
        notifySuccess("Product listed successfully for " + selectedSeller.company_name);
        setProductSubmitted(true);
        loadDashboardStats();
      }
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) return notifyError("File too large (max 5MB)");

    setUploading(true);
    try {
      const res = await uploadProductImage(file);
      if (res.success) {
        setFormVal("img", res.imageUrl);
        notifySuccess("Image uploaded successfully");
      }
    } catch (err) {
      notifyError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setProductSubmitted(false);
    setFormStep(0);
    setSelectedSeller(null);
    setForm({
      name: "", category: "BOPP", subcategory: "", tag: "",
      thickness: "", width: "", price: "", unit: "kg",
      minOrder: "", stock: "", description: "", applications: [], img: ""
    });
  };

  const StepIndicator = ({ current }) => (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < current ? "bg-accent border-accent text-white" : i === current ? "bg-white border-accent text-accent" : "bg-white border-black/10 text-ink3"}`}>
              {i < current ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-widest hidden sm:block ${i === current ? "text-accent" : "text-ink3"}`}>{step}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-0.5 w-8 sm:w-14 mx-1 mb-4 rounded ${i < current ? "bg-accent" : "bg-black/10"}`} />}
        </div>
      ))}
    </div>
  );

  const PreviewCard = () => (
    <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden shadow-sm sticky top-4">
      <div className="bg-surface h-48 flex items-center justify-center relative">
        {form.img ? (
          <img src={form.img} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div className="text-center">
            <ImageIcon size={32} className="text-ink3 mx-auto mb-2" />
            <p className="text-xs text-ink3 font-medium">No image URL</p>
          </div>
        )}
        {form.tag && (
          <span className="absolute top-3 left-3 text-[10px] bg-accent text-white px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
            {form.tag}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-1.5">
          {form.category} · {form.subcategory || "Subcategory"}
        </div>
        <h3 className="font-syne font-black text-lg text-ink mb-1.5 uppercase leading-tight">
          {form.name || "Product Name"}
        </h3>
        <p className="text-xs text-ink3 line-clamp-2 mb-4 font-medium">
          {form.description || "No description provided yet."}
        </p>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            ["Thickness", form.thickness],
            ["Width", form.width],
            ["Min Order", form.minOrder ? `${form.minOrder} kg` : "—"],
            ["Stock", form.stock ? `${form.stock} kg` : "—"],
          ].map(([l, v]) => (
            <div key={l} className="bg-surface rounded-xl px-3 py-2.5 border border-black/[0.03]">
              <div className="text-[9px] font-black text-ink3 uppercase tracking-widest mb-0.5">{l}</div>
              <div className="text-xs font-bold text-ink">{v || "—"}</div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-black/[0.06] flex items-baseline justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-syne font-black text-2xl text-accent">
                {form.minPrice ? `₹${form.minPrice}` : "₹—"}
              </span>
              <span className="text-ink3 text-[10px] font-bold">-</span>
              <span className="font-syne font-black text-2xl text-accent">
                {form.maxPrice ? `₹${form.maxPrice}` : "₹—"}
              </span>
            </div>
            <span className="text-[10px] font-bold text-ink3 mt-0.5">/ {form.unit}</span>
          </div>
          {selectedSeller && (
            <div className="text-right">
                <p className="text-[9px] font-black text-ink3 uppercase tracking-tighter">Seller</p>
                <p className="text-[10px] font-bold text-ink truncate max-w-[80px]">{selectedSeller.company_name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
                               <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                     <Clock size={14} />
                                     {new Date(seller.created_at).toLocaleDateString()}
                                  </div>
                                  <span className={`text-[10px] font-black uppercase inline-flex self-start px-2 py-0.5 rounded-full border ${
                                    seller.status === 'verified' ? 'bg-green-50 text-green-600 border-green-100' :
                                    seller.status === 'hold' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-slate-50 text-slate-500 border-slate-100'
                                  }`}>
                                    {seller.status || 'Pending'}
                                  </span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
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
                                        onClick={() => setStatusModal({ isOpen: true, userId: seller.user_id, newStatus: 'hold', message: `Hello ${seller.owner_name}, your application is on hold because...`, mobile: seller.mobile })}
                                        className="p-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl transition-all"
                                        title="Hold Application"
                                      >
                                        <Clock size={18} />
                                      </button>
                                      <button 
                                        onClick={() => setStatusModal({ isOpen: true, userId: seller.user_id, newStatus: 'verified', message: `Congratulations ${seller.owner_name}, your account is now verified!`, mobile: seller.mobile })}
                                        className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all"
                                        title="Approve & Verify"
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

          {/* ── Add Seller Product Section ── */}
          {activeTab === "add-product" && (
            <div className="max-w-7xl mx-auto">
              {productSubmitted ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 sm:p-20 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-green-600" />
                  </div>
                  <h2 className="font-syne font-black text-3xl text-ink mb-2 uppercase tracking-tight">Product Listed Successfully!</h2>
                  <p className="text-ink2 max-w-md mb-8 font-medium">
                      The product <strong>{form.name}</strong> has been listed on behalf of <strong>{selectedSeller?.company_name}</strong>.
                  </p>
                  <button onClick={resetForm} className="px-10 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-orange-100">
                      Add Another Product
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                  {/* Form Container */}
                  <div className="lg:col-span-2">
                    <div className="bg-white border border-black/[0.08] rounded-[2rem] sm:rounded-3xl p-6 sm:p-10 shadow-sm">
                      <StepIndicator current={formStep} />

                      {/* Step 0: Seller Selection */}
                      {formStep === 0 && (
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-2 mb-2">
                              <Store size={20} className="text-accent" />
                              <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">Select Verified Seller</h3>
                          </div>
                          <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" size={18} />
                            <input 
                              type="text" 
                              placeholder="Search manufacturer or trader..." 
                              className={inputCls + " pl-12 py-4 bg-surface/50 font-bold"}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                            {allVerifiedSellers.filter(s => !search || s.company_name.toLowerCase().includes(search.toLowerCase()) || s.owner_name.toLowerCase().includes(search.toLowerCase())).map(seller => (
                              <div 
                                key={seller.user_id}
                                onClick={() => setSelectedSeller(seller)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedSeller?.user_id === seller.user_id ? 'border-accent bg-accent/5' : 'border-black/[0.04] hover:border-black/[0.1] bg-white'}`}
                              >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${selectedSeller?.user_id === seller.user_id ? 'bg-accent text-white' : 'bg-ink text-white'}`}>
                                    {seller.company_name[0]}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-black text-ink leading-tight truncate">{seller.company_name}</p>
                                    <p className="text-[10px] font-bold text-ink3 uppercase truncate">{seller.city}, {seller.state}</p>
                                  </div>
                                  {selectedSeller?.user_id === seller.user_id && <CheckCircle2 className="ml-auto text-accent" size={20} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 1: Basic Information */}
                      {formStep === 1 && (
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-2 mb-2">
                              <Package size={20} className="text-accent" />
                              <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">Basic Information</h3>
                          </div>
                          
                          <Field label="Product Name" required>
                            <input 
                              className={inputCls + " font-bold"}
                              placeholder="e.g. BOPP Transparent Film"
                              value={form.name} 
                              onChange={(e) => setFormVal("name", e.target.value)}
                            />
                          </Field>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Category" required>
                              <select className={inputCls + " font-bold cursor-pointer"} value={form.category} onChange={(e) => { setFormVal("category", e.target.value); setFormVal("subcategory", ""); }}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                              </select>
                            </Field>
                            <Field label="Subcategory" required>
                              <select className={inputCls + " font-bold cursor-pointer"} value={form.subcategory} onChange={(e) => setFormVal("subcategory", e.target.value)}>
                                <option value="">Select subcategory...</option>
                                {(SUBCATEGORIES[form.category] || []).map(s => <option key={s}>{s}</option>)}
                              </select>
                            </Field>
                          </div>

                          <Field label="Product Tag">
                            <div className="flex flex-wrap gap-2">
                              {TAGS.map(t => (
                                <button key={t} onClick={() => setFormVal("tag", t)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.tag === t ? 'bg-accent text-white border-accent' : 'bg-surface text-ink3 border-black/[0.08] hover:border-accent/40'}`}>
                                  {t || "None"}
                                </button>
                              ))}
                            </div>
                          </Field>
                        </div>
                      )}

                      {/* Step 2: Specifications */}
                      {formStep === 2 && (
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-2 mb-2">
                              <Layers size={20} className="text-accent" />
                              <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">Specifications & Pricing</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Thickness" hint="e.g. 20 micron">
                              <input className={inputCls + " font-bold"} placeholder="20 micron" value={form.thickness} onChange={(e) => setFormVal("thickness", e.target.value)} />
                            </Field>
                            <Field label="Width" hint="e.g. 1000 mm">
                              <input className={inputCls + " font-bold"} placeholder="1000 mm" value={form.width} onChange={(e) => setFormVal("width", e.target.value)} />
                            </Field>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Min Price" required hint="starting range">
                              <input className={inputCls + " font-bold"} type="number" placeholder="150" value={form.minPrice} onChange={(e) => setFormVal("minPrice", e.target.value)} />
                            </Field>
                            <Field label="Max Price" required hint="ending range">
                              <input className={inputCls + " font-bold"} type="number" placeholder="200" value={form.maxPrice} onChange={(e) => setFormVal("maxPrice", e.target.value)} />
                            </Field>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Unit" required>
                              <select className={inputCls + " font-bold cursor-pointer"} value={form.unit} onChange={(e) => setFormVal("unit", e.target.value)}>
                                {UNITS.map(u => <option key={u}>{u}</option>)}
                              </select>
                            </Field>
                            <Field label="Min. Order (kg)" required>
                              <input className={inputCls + " font-bold"} type="number" placeholder="50" value={form.minOrder} onChange={(e) => setFormVal("minOrder", e.target.value)} />
                            </Field>
                          </div>

                          <Field label="Available Stock (kg)" required>
                            <input className={inputCls + " font-bold"} type="number" placeholder="e.g. 2500" value={form.stock} onChange={(e) => setFormVal("stock", e.target.value)} />
                          </Field>

                          <Field label="Product Image" hint="Upload file or paste URL">
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <input className={inputCls + " font-bold flex-1"} placeholder="https://example.com/image.jpg" value={form.img} onChange={(e) => setFormVal("img", e.target.value)} />
                                    <button 
                                      type="button"
                                      onClick={() => fileInputRef.current?.click()}
                                      disabled={uploading}
                                      className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {uploading ? <RefreshCcw className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                                        {uploading ? "Uploading..." : "Upload"}
                                    </button>
                                </div>
                                <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  onChange={handleFileUpload} 
                                  accept="image/*" 
                                  className="hidden" 
                                />
                                {form.img && (
                                  <div className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                      <CheckCircle2 size={12} /> Image Ready to List
                                  </div>
                                )}
                            </div>
                          </Field>
                        </div>
                      )}

                      {/* Step 3: Applications & Description */}
                      {formStep === 3 && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText size={20} className="text-accent" />
                                <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">Applications & Description</h3>
                            </div>

                            <Field label="Product Description" required>
                                <textarea className={inputCls + " font-bold min-h-[120px] resize-none"} placeholder="Describe key properties and use cases..." value={form.description} onChange={(e) => setFormVal("description", e.target.value)} />
                            </Field>

                            <Field label="Applications" required hint="Add multiple">
                                <div className="flex flex-wrap gap-2 mb-4 bg-surface p-4 rounded-2xl border border-black/[0.04]">
                                  {COMMON_APPLICATIONS.map(app => (
                                    <button 
                                      key={app}
                                      onClick={() => form.applications.includes(app) ? removeApp(app) : addApp(app)}
                                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${form.applications.includes(app) ? 'bg-accent text-white border-accent' : 'bg-white text-ink3 border-black/[0.08] hover:border-accent/40'}`}
                                    >
                                      {form.applications.includes(app) ? '✓ ' : '+ '} {app}
                                    </button>
                                  ))}
                                </div>
                                {form.applications.length > 0 && (
                                  <div className="flex flex-wrap gap-2 p-3 bg-accent/5 rounded-xl border border-accent/10">
                                      <p className="w-full text-[9px] font-black text-accent uppercase tracking-widest mb-1">Selected:</p>
                                      {form.applications.map(a => (
                                        <span key={a} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-accent/20 text-accent rounded-full text-[10px] font-black tracking-wide">
                                          {a} <XCircle className="cursor-pointer hover:text-red-500" size={12} onClick={() => removeApp(a)} />
                                        </span>
                                      ))}
                                  </div>
                                )}
                            </Field>
                        </div>
                      )}

                      {/* Step 4: Preview (Administrative Final Check) */}
                      {formStep === 4 && (
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={24} className="text-accent" />
                                <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">Administrative Review</h3>
                            </div>
                            
                            <div className="bg-surface rounded-[2rem] p-8 space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {[
                                      ["Target Seller", selectedSeller?.company_name],
                                      ["Category", `${form.category} / ${form.subcategory}`],
                                      ["Specs", `${form.thickness || '—'} / ${form.width || '—'}`],
                                      ["Stock Level", `${form.stock} kg`],
                                      ["Commercials", `₹${form.minPrice} - ₹${form.maxPrice} / ${form.unit}`],
                                      ["MOQ", `${form.minOrder} kg`]
                                    ].map(([l, v]) => (
                                      <div key={l}>
                                          <p className="text-[10px] font-black text-ink3 uppercase tracking-widest mb-1">{l}</p>
                                          <p className="font-bold text-ink text-sm truncate">{v}</p>
                                      </div>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-black/[0.06]">
                                    <p className="text-[10px] font-black text-ink3 uppercase tracking-widest mb-2 text-center underline">Backend Verification Required</p>
                                    <ul className="text-[10px] font-medium text-ink2 space-y-2 max-w-sm mx-auto">
                                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Confirming seller {selectedSeller?.user_id} association</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Validating stock and pricing parameters</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Generating system unique identifiers</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="flex items-center justify-between mt-10 pt-8 border-t border-black/[0.05]">
                          {formStep > 0 && (
                            <button onClick={() => setFormStep(s => s - 1)} className="px-6 py-3 rounded-xl border border-black/15 text-xs font-black uppercase tracking-widest text-ink hover:bg-surface transition-all flex items-center gap-2">
                              <ChevronLeft size={16} /> Back
                            </button>
                          )}
                          <div className="ml-auto flex items-center gap-3">
                            {formStep < 4 ? (
                              <button 
                                onClick={() => {
                                  if (formStep === 0 && !selectedSeller) return notifyError("Select a seller first");
                                  if (formStep === 1 && (!form.name || !form.subcategory)) return notifyError("Fill required platform fields");
                                  if (formStep === 2 && (!form.minPrice || !form.maxPrice || !form.stock || !form.minOrder)) return notifyError("Pricing specs are mandatory");
                                  if (formStep === 3 && (!form.description || form.applications.length === 0)) return notifyError("Add description and apps");
                                  setFormStep(s => s + 1);
                                }} 
                                className="px-10 py-4 bg-ink text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-black/10"
                              >
                                  Continue <ChevronRight size={16} />
                              </button>
                            ) : (
                              <button 
                                onClick={handleCreateProductByAdmin}
                                disabled={loading}
                                className="px-10 py-4 bg-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3 shadow-xl shadow-orange-100 disabled:opacity-50"
                              >
                                  {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Zap size={16} />}
                                  Confirm & List on Platform
                              </button>
                            )}
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Preview (Right 1/3) */}
                  <div className="hidden lg:block">
                     <PreviewCard />
                  </div>
                </div>
              )}
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

      {/* ── Status Update Modal ── */}
      <AnimatePresence>
        {statusModal.isOpen && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-syne font-black text-gray-900 mb-2 uppercase tracking-tight">Status Notification</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Updating status to <span className="text-accent font-bold uppercase">{statusModal.newStatus}</span>. 
                  Enter a message to notify the seller.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Update Message</label>
                  <textarea 
                    value={statusModal.message}
                    onChange={(e) => setStatusModal({ ...statusModal, message: e.target.value })}
                    className={inputCls + " h-32 resize-none py-3"}
                    placeholder="Enter message for the seller..."
                  />
                  <p className="text-[10px] text-gray-400 italic">This message will be sent to +{statusModal.mobile} via WhatsApp.</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setStatusModal({ ...statusModal, isOpen: false })} className="flex-1 px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">Cancel</button>
                  <button onClick={handleStatusUpdate} className="flex-[2] px-8 py-4 bg-ink text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"><Send size={16} /> Update & Notify</button>
                </div>
              </div>
            </motion.div>
          </div>
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
    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white rounded-2xl sm:rounded-[3rem] w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
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
          <button onClick={onClose} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-sm transition-all focus:outline-none">
              <XCircle size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-white scrollbar-hide">
          {loading ? (
            <div className="py-20 text-center"><RefreshCcw className="animate-spin mx-auto text-accent mb-4" /></div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No records found.</div>
          ) : (
            <div className="space-y-4">
              {entity.type === "seller" && items.map(subItem => (
                <div key={subItem.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-accent/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <img src={subItem.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{subItem.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-accent uppercase">₹{subItem.price}/{subItem.unit}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Stock: {subItem.stock}</span>
                      </div>
                    </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold text-ink uppercase tracking-wider">
          {label} {required && <span className="text-accent">*</span>}
        </label>
        {hint && <span className="text-[10px] text-ink3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
