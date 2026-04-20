import { useState, useEffect, useRef } from "react";
import { 
  Users, Store, ShoppingBag, TrendingUp, AlertCircle, 
  CheckCircle2, XCircle, Search, Filter, Mail, Phone, 
  MapPin, Clock, ArrowUpRight, MoreVertical, LayoutDashboard,
  HardDrive, Database, Settings, RefreshCcw, Download,
  ChevronLeft, ChevronRight, Inbox, MessageSquare, Zap, FileText, Send,
  Plus, Tag, Layers, Package, Image as ImageIcon, UserPlus
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  fetchDashboardStats, fetchAllSellers, fetchPendingSellers, updateSellerStatus, 
  rejectSellerAccount, fetchAllUsers, updateUserAccount, deleteUserAccount, 
  fetchAllProductsAdmin, deleteProductAdmin, fetchAllOrdersAdmin, fetchInquiriesAdmin, 
  fetchSellersWithOrdersAdmin, fetchSellerProductsAdmin, fetchSellerOrdersAdmin, 
  toggleHotDealAdmin, addProductForSeller, uploadProductImage, addSellerAdmin, 
  fetchCategories, fetchSubCategories, fetchTags, fetchApplications, 
  fetchProductGroups, createProductGroup, fetchLeadRecommendations
} from "../services/adminServices";
import Pagination from "../components/ui/Pagination";
import { useNotification } from "../context/NotificationContext";
import { API_BASE_URL } from "../services/api";

const UNITS = ["kg", "meter", "roll", "sheet", "bag", "box"];
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
    "add-seller": { title: "Add New Seller", desc: "Create a verified manufacturer or trader account directly." },
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
  const [userRoleFilter, setUserRoleFilter] = useState("user");

  const [allVerifiedSellers, setAllVerifiedSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [productSubmitted, setProductSubmitted] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [form, setForm] = useState({
    name: "", display_name: "", product_group_id: "", 
    category: "", customCategory: "",
    subcategory: "", customSubcategory: "",
    tag: "", customTag: "",
    thickness: "", width: "", minPrice: "", maxPrice: "", unit: "kg",
    minOrder: "", stock: "", description: "", applications: [], 
    customApplications: "", img: "",
    delivery_days: "", payment_terms: "", color: "", type: ""
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [applications, setApplications] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [sellerForm, setSellerForm] = useState({
    ownerName: "", email: "", password: "", mobile: "", companyName: "",
    businessType: "Manufacturer", gstNumber: "", city: "", state: "", 
    pincode: "", businessAddress: ""
  });
  const setSellerVal = (k, v) => setSellerForm(f => ({ ...f, [k]: v }));

  const [statusModal, setStatusModal] = useState({ 
    isOpen: false, userId: null, newStatus: '', message: '', mobile: '' 
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSearch("");
    loadTabData(1);
  }, [activeTab, userRoleFilter]);

  useEffect(() => {
    if (form.category && form.category !== "Other") {
      const loadSubs = async () => {
        try {
          const res = await fetchSubCategories(form.category);
          if (res.success) setSubCategories(res.data);
        } catch (err) { console.error("Failed sub-cat loader"); }
      };
      loadSubs();
    } else { setSubCategories([]); }
  }, [form.category]);

  const loadDashboardStats = async () => {
    try {
      const res = await fetchDashboardStats();
      if (res.success) setStats(res.stats);
    } catch (err) { notifyError("Stats failure"); }
  };

  const loadMasterData = async () => {
    try {
       const [catRes, tagRes, appRes, groupRes] = await Promise.all([
        fetchCategories(), fetchTags(), fetchApplications(), fetchProductGroups()
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (tagRes.success) setTags(tagRes.data);
      if (appRes.success) setApplications(appRes.data);
      if (groupRes.success) setProductGroups(groupRes.data);
    } catch (err) { notifyError("Metadata error"); }
  };

  const loadTabData = async (page) => {
    setLoading(true);
    setData([]);
    try {
      let res;
      switch (activeTab) {
        case "sellers": res = await fetchAllSellers(page); setData(res.sellers); break;
        case "pending": res = await fetchPendingSellers(page); setData(res.sellers); break;
        case "users": res = await fetchAllUsers(page, 10, userRoleFilter); setData(res.users); break;
        case "products": res = await fetchAllProductsAdmin(page); setData(res.products); break;
        case "orders": res = await fetchAllOrdersAdmin(page); setData(res.orders); break;
        case "inquiries": res = await fetchInquiriesAdmin(page); setData(res.inquiries); break;
        case "seller-hub": res = await fetchSellersWithOrdersAdmin(page); setData(res.sellers); break;
        case "add-product":
          await loadMasterData();
          const sellersRes = await fetchAllSellers(1, 1000);
          if (sellersRes?.sellers) setAllVerifiedSellers(sellersRes.sellers);
          break;
      }
      if (res) {
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || 1);
      }
    } catch (err) { notifyError(`Failed to load ${activeTab}`); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async () => {
    const { userId, newStatus, message, mobile } = statusModal;
    if (!message) return notifyError("Please enter a status message");
    try {
      const res = await updateSellerStatus(userId, newStatus);
      if (res.success) {
        notifySuccess(`Seller state: ${newStatus}`);
        setStatusModal({ ...statusModal, isOpen: false });
        window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(message)}`, "_blank");
        loadTabData(currentPage);
      }
    } catch (err) { notifyError("Sync failed"); }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadTabData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setFormVal = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addApp = (app) => {
    if (app && !form.applications.includes(app)) {
      setFormVal("applications", [...form.applications, app]);
    }
  };
  const removeApp = (app) => setFormVal("applications", form.applications.filter(a => a !== app));

  const handleCreateGroup = async () => {
    if (!newGroupName) return notifyError("Group name is required");
    if (!form.category) return notifyError("Please select a category first");
    try {
      const catPrefix = categories.find(c => c.id == form.category)?.code_prefix || "CAT";
      const thick = form.thickness || "X";
      const namePart = (newGroupName || "NAME").substring(0, 3).toUpperCase();
      const generatedMasterId = `GP-${catPrefix}-${thick}-${namePart}`;
      const res = await createProductGroup({
        name: newGroupName, masterId: generatedMasterId,
        categoryId: form.category, description: `Group for ${newGroupName}`
      });
      if (res.success) {
        notifySuccess(`Group live: ${res.masterId}`);
        setProductGroups([...productGroups, { id: res.groupId, name: newGroupName, master_id: res.masterId }]);
        setFormVal("product_group_id", res.groupId);
        setShowNewGroupModal(false);
        setNewGroupName("");
      }
    } catch (err) { notifyError("Creation failed"); }
  };

  const handleCreateProductByAdmin = async () => {
    if (!selectedSeller) return notifyError("Select a seller");
    setLoading(true);
    try {
      const productData = {
        ...form,
        product_group_id: form.product_group_id,
        category: form.category === "Other" ? form.customCategory : (categories.find(c => c.id == form.category)?.name || form.category),
        subcategory: form.subcategory === "Other" ? form.customSubcategory : (subCategories.find(s => s.id == form.subcategory)?.name || form.subcategory),
        tag: form.tag === "Other" ? form.customTag : (tags.find(t => t.id == form.tag)?.tag_name || form.tag),
        minPrice: parseFloat(form.minPrice),
        maxPrice: parseFloat(form.maxPrice),
        minOrder: parseInt(form.minOrder),
        stock: parseInt(form.stock)
      };
      const res = await addProductForSeller(selectedSeller.user_id, productData);
      if (res.success) {
        notifySuccess("Product listed!");
        setProductSubmitted(true);
        loadDashboardStats();
      }
    } catch (err) { notifyError("Posting failed"); } finally { setLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return notifyError("Max 5MB");
    setUploading(true);
    try {
      const res = await uploadProductImage(file);
      if (res.success) {
        setFormVal("img", res.imageUrl);
        notifySuccess("Upload OK");
      }
    } catch (err) { notifyError("Upload Error"); } finally { setUploading(false); }
  };

  const handleCreateSellerByAdmin = async () => {
    setLoading(true);
    try {
      const res = await addSellerAdmin(sellerForm);
      if (res.success) {
        notifySuccess("Seller registered!");
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "sellers");
        window.history.pushState({}, "", url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        setSellerForm({ ownerName: "", email: "", password: "", mobile: "", companyName: "", businessType: "Manufacturer", gstNumber: "", city: "", state: "", pincode: "", businessAddress: "" });
      }
    } catch (err) { notifyError("Seller Creation failed"); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setProductSubmitted(false);
    setFormStep(0);
    setSelectedSeller(null);
    setForm({ name: "", display_name: "", product_group_id: "", category: "", customCategory: "", subcategory: "", customSubcategory: "", tag: "", customTag: "", thickness: "", width: "", minPrice: "", maxPrice: "", unit: "kg", minOrder: "", stock: "", description: "", applications: [], customApplications: "", img: "", delivery_days: "", payment_terms: "", color: "", type: "" });
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
          <img src={form.img} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <ImageIcon size={32} className="text-ink3 mx-auto mb-2" />
            <p className="text-xs text-ink3 font-medium">No Image</p>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-1.5">
          {form.category === "Other" ? form.customCategory : (categories.find(c => c.id == form.category)?.name || "CAT")}
        </div>
        <h3 className="font-syne font-black text-lg text-ink mb-1.5 uppercase leading-tight truncate">{form.name || "Name"}</h3>
        <p className="text-xs text-ink3 line-clamp-2 mb-4 font-medium">{form.description || "Drafting..."}</p>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="bg-surface rounded-xl px-3 py-2.5 border border-black/[0.03]">
              <div className="text-[9px] font-black text-ink3 uppercase mb-0.5">Thickness</div>
              <div className="text-xs font-bold text-ink">{form.thickness || "—"}</div>
          </div>
          <div className="bg-surface rounded-xl px-3 py-2.5 border border-black/[0.03]">
              <div className="text-[9px] font-black text-ink3 uppercase mb-0.5">Width</div>
              <div className="text-xs font-bold text-ink">{form.width || "—"}</div>
          </div>
        </div>
        <div className="pt-4 border-t border-black/[0.06] flex items-baseline justify-between">
            <div className="font-syne font-black text-xl text-accent">₹{form.minPrice || "—"} - ₹{form.maxPrice || "—"}</div>
        </div>
      </div>
    </div>
  );

  const handleToggleHotDeal = async (id, currentVal) => {
    try {
      const res = await toggleHotDealAdmin(id, !currentVal);
      if (res.success) { notifySuccess(res.message); loadTabData(currentPage); }
    } catch (err) { notifyError("Update error"); }
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
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                 <LayoutDashboard size={24} />
              </div>
              <h1 className="font-syne font-black text-3xl text-gray-900 uppercase tracking-tight">{currentTab.title}</h1>
           </div>
           <p className="text-gray-500 text-sm font-medium">{currentTab.desc}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder={`Search ${activeTab}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm w-full md:w-80 outline-none focus:border-accent" />
           </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: "Total Users", val: stats.totalUsers, icon: <Users size={20}/>, color: "blue", tab: "users" },
            { label: "Active Sellers", val: stats.totalSellers, icon: <Store size={20}/>, color: "orange", tab: "sellers" },
            { label: "Live Products", val: stats.totalProducts, icon: <ShoppingBag size={20}/>, color: "purple", tab: "products" },
            { label: "Leads", val: stats.totalInquiries, icon: <TrendingUp size={20}/>, color: "green", tab: "inquiries" }
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -5 }} onClick={() => { const url = new URL(window.location.href); url.searchParams.set("tab", stat.tab); window.history.pushState({}, "", url); window.dispatchEvent(new PopStateEvent('popstate')); }} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm cursor-pointer relative overflow-hidden group">
               <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4`}>{stat.icon}</div>
               <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-syne font-black text-gray-900">{stat.val}</h3>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 min-h-[400px]">
                <RefreshCcw className="animate-spin text-accent mb-4" size={40} />
             </div>
        ) : (
          <div className="space-y-6">
            
            {(activeTab === "sellers" || activeTab === "pending") && (
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">Marketplace {activeTab}</h3>
                  <button onClick={() => { const url = new URL(window.location.href); url.searchParams.set("tab", "add-seller"); window.history.pushState({}, "", url); window.dispatchEvent(new PopStateEvent('popstate')); }} className="px-6 py-3 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><UserPlus size={16} /> New Seller</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Company</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Business</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Location</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((seller) => (
                          <tr key={seller.user_id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                            <td className="px-8 py-6">
                              <div className="font-bold text-gray-900 leading-tight">{seller.company_name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">UID: {seller.seller_uid}</div>
                                {seller.gst_number && (
                                  <>
                                    <div className="w-[1px] h-2 bg-gray-200" />
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">GST: {seller.gst_number}</div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex flex-col gap-1.5">
                                  <span className="w-fit px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">{seller.business_type}</span>
                                  <span className={`w-fit px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${seller.status === 'hold' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{seller.status}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-xs text-gray-600 font-bold">{seller.city}, {seller.state}</td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  {seller.gst_certificate && (
                                    <a 
                                      href={seller.gst_certificate.startsWith('http') ? seller.gst_certificate : `${API_BASE_URL.replace('/api', '')}/${seller.gst_certificate}`} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm" 
                                      title="View GST Certificate"
                                    >
                                      <FileText size={16}/>
                                    </a>
                                  )}
                                  {activeTab === "pending" && (
                                    <>
                                      <button onClick={() => setStatusModal({ isOpen: true, userId: seller.user_id, newStatus: 'verified', message: `Hi ${seller.company_name}, your account on PackagingBazaar is now VERIFIED! Log in to list your products.`, mobile: seller.mobile })} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors shadow-sm" title="Verify Seller"><CheckCircle2 size={16}/></button>
                                      {seller.status !== "hold" && (
                                        <button onClick={() => setStatusModal({ isOpen: true, userId: seller.user_id, newStatus: 'hold', message: `Hi ${seller.company_name}, your application is currently on HOLD. Please provide [REASON].`, mobile: seller.mobile })} className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors shadow-sm" title="Put on Hold"><Clock size={16}/></button>
                                      )}
                                    </>
                                  )}
                                  <button onClick={() => rejectSellerAccount(seller.user_id).then(() => loadTabData(currentPage))} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm" title="Reject/Delete"><XCircle size={16}/></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
                <div className="px-8 py-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">User Directory</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Manage platform participants</p>
                  </div>
                  <div className="flex bg-white p-1 rounded-2xl border border-gray-100">
                    <button onClick={() => setUserRoleFilter("user")} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRoleFilter === "user" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-gray-400 hover:text-ink"}`}>All Users</button>
                    <button onClick={() => setUserRoleFilter("seller")} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRoleFilter === "seller" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-gray-400 hover:text-ink"}`}>Sellers</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">User Info</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Contact</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50 group">
                            <td className="px-8 py-6">
                              <div className="font-bold text-gray-900 group-hover:text-accent transition-colors">{user.name}</div>
                              <div className="text-[10px] text-gray-400 font-black uppercase mt-0.5">{user.role}</div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-sm font-medium flex items-center gap-2 mb-1"><Mail size={12} className="text-gray-300"/> {user.email}</div>
                              {user.mobile && <div className="text-xs text-gray-400 flex items-center gap-2"><Phone size={12} className="text-gray-300"/> {user.mobile}</div>}
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => deleteUserAccount(user.id).then(() => loadTabData(currentPage))} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><XCircle size={16}/></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </div>
            )}

            {activeTab === "products" && (
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Product</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Seller</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Pricing</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                            <td className="px-8 py-6 font-bold">{p.name}</td>
                            <td className="px-8 py-6 text-sm">{p.seller_name}</td>
                            <td className="px-8 py-6 font-black text-accent">₹{p.price}/{p.unit}</td>
                            <td className="px-8 py-6 text-right"><button className="p-2.5 bg-red-50 text-red-600 rounded-xl"><XCircle size={18}/></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
               </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
                <div className="px-8 py-6 border-b border-gray-50 bg-slate-50/50">
                  <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">Sales Activity</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Monitor marketplace transactions</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-50">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Order Details</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Customer</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Transaction</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                            <td className="px-8 py-6">
                              <div className="font-black text-accent mb-1 tracking-tight">#{order.id}</div>
                              <div className="text-xs text-gray-400 font-bold flex items-center gap-1.5"><Clock size={12}/> {new Date(order.order_date).toLocaleDateString()}</div>
                            </td>
                            <td className="px-8 py-6 font-bold text-gray-900">{order.customer_name}</td>
                            <td className="px-8 py-6">
                              <div className="font-syne font-black text-gray-900">₹{order.total_amount}</div>
                              <div className={`mt-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg inline-block ${order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{order.status}</div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button className="p-2.5 bg-accent/5 text-accent rounded-xl hover:bg-accent/10"><ArrowUpRight size={18}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </div>
            )}

            {activeTab === "inquiries" && (
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-50">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Buyer</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Requirement</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Seller</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((inquiry) => (
                        <tr key={inquiry.id} className="hover:bg-gray-50/50 border-b border-gray-50">
                          <td className="px-8 py-6 font-bold">{inquiry.buyer_display_name}</td>
                          <td className="px-8 py-6 text-xs italic">"{inquiry.message}"</td>
                          <td className="px-8 py-6 font-medium">{inquiry.seller_name}</td>
                          <td className="px-8 py-6 text-right">
                             <button onClick={() => setSelectedEntity({ type: "lead", id: inquiry.id, name: inquiry.buyer_display_name, mode: "lead-matching", location: inquiry.address })} className="p-2 bg-accent/10 text-accent rounded-xl"><Zap size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </div>
            )}

            {activeTab === "seller-hub" && (
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
                <div className="px-8 py-6 border-b border-gray-50 bg-slate-50/50">
                  <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">Seller Performance</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Deep insights into business operations</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-50">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Seller Hub</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Performance</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((seller) => (
                        <tr key={seller.id} className="hover:bg-gray-50/50 border-b border-gray-50 group">
                          <td className="px-8 py-6">
                            <div className="font-syne font-black text-gray-900 uppercase group-hover:text-accent transition-colors">{seller.company_name}</div>
                            <p className="text-[10px] text-gray-400 font-bold">BY {seller.owner_name}</p>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-6">
                                <div>
                                   <div className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Orders</div>
                                   <div className="font-syne font-black text-gray-900">{seller.sales_count || 0}</div>
                                </div>
                                <div>
                                   <div className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Revenue</div>
                                   <div className="font-syne font-black text-accent">₹{seller.total_value || 0}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-3">
                                <button onClick={() => setSelectedEntity({ type: "seller", id: seller.user_id, name: seller.company_name, mode: "orders" })} className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"><FileText size={14}/> Orders</button>
                                <button onClick={() => setSelectedEntity({ type: "seller", id: seller.user_id, name: seller.company_name, mode: "products" })} className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"><Package size={14}/> Stock</button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </div>
            )}

            {activeTab === "add-product" && (
              <div className="max-w-7xl mx-auto">
                {productSubmitted ? (
                  <div className="bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center text-center border border-gray-100">
                    <CheckCircle2 size={60} className="text-green-500 mb-6" />
                    <h2 className="font-syne font-black text-3xl mb-8 uppercase">Listed!</h2>
                    <button onClick={resetForm} className="px-10 py-4 bg-accent text-white rounded-2xl font-black uppercase text-xs">Another One</button>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                      <div className="bg-white border border-black/[0.08] rounded-[3rem] p-10 shadow-sm">
                        <StepIndicator current={formStep} />

                        {formStep === 0 && (
                          <div className="flex flex-col gap-6">
                            <h3 className="font-syne font-black text-xl uppercase">Select Seller</h3>
                            <input type="text" placeholder="Search sellers..." className={inputCls} onChange={(e) => setSearch(e.target.value)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                              {allVerifiedSellers.filter(s => !search || s.company_name.toLowerCase().includes(search.toLowerCase())).map(seller => (
                                <div key={seller.user_id} onClick={() => setSelectedSeller(seller)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedSeller?.user_id === seller.user_id ? 'border-accent bg-accent/5' : 'border-black/[0.04] bg-white'}`}>
                                    <p className="font-black text-ink truncate">{seller.company_name}</p>
                                    <p className="text-[10px] font-bold text-ink3 uppercase">{seller.city}, {seller.state}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {formStep === 1 && (
                          <div className="flex flex-col gap-6">
                            <Field label="Product Name" required><input className={inputCls + " font-bold"} placeholder="e.g. Polyester Film" value={form.name} onChange={(e) => setFormVal("name", e.target.value)} /></Field>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Field label="Category" required><select className={inputCls} value={form.category} onChange={(e) => setFormVal("category", e.target.value)}><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
                              <Field label="Subcategory" required><select className={inputCls} value={form.subcategory} onChange={(e) => setFormVal("subcategory", e.target.value)}><option value="">Select...</option>{subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
                            </div>
                            <Field label="Product Tag">
                                <div className="flex flex-wrap gap-2">
                                  {tags.map(t => (
                                    <button key={t.id} type="button" onClick={() => setFormVal("tag", t.id)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${form.tag === t.id ? 'bg-accent text-white border-accent' : 'bg-white border-black/[0.06]'}`}>{t.tag_name}</button>
                                  ))}
                                </div>
                            </Field>
                          </div>
                        )}

                        {formStep === 2 && (
                          <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Thickness" hint="e.g. 12 mic"><input className={inputCls} placeholder="12 mic" value={form.thickness} onChange={(e) => setFormVal("thickness", e.target.value)} /></Field>
                              <Field label="Width" hint="e.g. 1000 mm"><input className={inputCls} placeholder="1000 mm" value={form.width} onChange={(e) => setFormVal("width", e.target.value)} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Color"><input className={inputCls} placeholder="Silver / Transparent" value={form.color} onChange={(e) => setFormVal("color", e.target.value)} /></Field>
                              <Field label="Type"><input className={inputCls} placeholder="Metallized / Plain" value={form.type} onChange={(e) => setFormVal("type", e.target.value)} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Min Price" required><input type="number" className={inputCls} value={form.minPrice} onChange={(e) => setFormVal("minPrice", e.target.value)} /></Field>
                              <Field label="Max Price" required><input type="number" className={inputCls} value={form.maxPrice} onChange={(e) => setFormVal("maxPrice", e.target.value)} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Delivery Time (Hours)" hint="e.g. 24 or 48"><input type="number" className={inputCls} placeholder="48" value={form.delivery_days} onChange={(e) => setFormVal("delivery_days", e.target.value)} /></Field>
                              <Field label="Payment Terms"><input className={inputCls} placeholder="100% Advance" value={form.payment_terms} onChange={(e) => setFormVal("payment_terms", e.target.value)} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Stock (kg)" required><input type="number" className={inputCls} value={form.stock} onChange={(e) => setFormVal("stock", e.target.value)} /></Field>
                              <Field label="Min Order (kg)" required><input type="number" className={inputCls} value={form.minOrder} onChange={(e) => setFormVal("minOrder", e.target.value)} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4 p-5 bg-accent/5 rounded-3xl border border-accent/10">
                               <Field label="Product Group"><select className={inputCls} value={form.product_group_id} onChange={(e) => setFormVal("product_group_id", e.target.value)}><option value="">None</option>{productGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>
                               <Field label="Display Name"><input className={inputCls} value={form.display_name} onChange={(e) => setFormVal("display_name", e.target.value)} /></Field>
                            </div>
                            <Field label="Product Image"><input className={inputCls} placeholder="Image URL" value={form.img} onChange={(e) => setFormVal("img", e.target.value)} /></Field>
                          </div>
                        )}

                        {formStep === 3 && (
                          <div className="flex flex-col gap-6">
                            <Field label="Description" required><textarea className={inputCls + " h-32"} value={form.description} onChange={(e) => setFormVal("description", e.target.value)} /></Field>
                            <Field label="Applications">
                               <div className="flex flex-wrap gap-2">
                                 {applications.map(app => (
                                   <button key={app.id} onClick={() => form.applications.includes(app.app_name) ? removeApp(app.app_name) : addApp(app.app_name)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all ${form.applications.includes(app.app_name) ? 'bg-accent text-white' : 'bg-white'}`}>+ {app.app_name}</button>
                                 ))}
                               </div>
                            </Field>
                          </div>
                        )}

                        {formStep === 4 && (
                           <div className="text-center py-10">
                              <CheckCircle2 size={48} className="mx-auto text-accent mb-4" />
                              <h3 className="font-syne font-black text-2xl uppercase">Review Details</h3>
                              <p className="text-gray-400 mt-2">Linking to Master Product with Specs:</p>
                              <div className="mt-6 p-6 bg-gray-50 rounded-[2rem] border border-black/5 inline-block text-left">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Automated Group Key</p>
                                 <p className="font-syne font-black text-xl text-ink mb-4">{form.subcategory || 'CAT'}_{form.thickness || 'X'}_{(form.type || form.color || 'NA').substring(0,3).toUpperCase()}</p>
                                 
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <p className="text-[9px] font-black text-gray-400 uppercase">Seller</p>
                                       <p className="text-xs font-bold text-ink">{selectedSeller?.company_name}</p>
                                    </div>
                                    <div>
                                       <p className="text-[9px] font-black text-gray-400 uppercase">Price</p>
                                       <p className="text-xs font-bold text-accent">₹{form.minPrice}-{form.maxPrice}</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        <div className="flex items-center justify-between mt-10 pt-8 border-t border-black/5">
                            {formStep > 0 && <button onClick={() => setFormStep(s => s - 1)} className="px-6 py-3 border rounded-xl font-bold uppercase text-[10px]">Back</button>}
                            <div className="ml-auto">
                               {formStep < 4 ? (
                                 <button 
                                   onClick={() => {
                                      if(formStep === 0 && !selectedSeller) return notifyError("Please select a seller first");
                                      setFormStep(s => s + 1);
                                   }} 
                                   className={`px-10 py-4 rounded-2xl font-black uppercase text-xs transition-all ${formStep === 0 && !selectedSeller ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-ink text-white shadow-xl shadow-black/10'}`}
                                 >
                                    Continue
                                 </button>
                               ) : (
                                 <button onClick={handleCreateProductByAdmin} className="px-10 py-4 bg-accent text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-accent/20">Confirm & List</button>
                               )}
                            </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:block"><PreviewCard /></div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "add-seller" && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white border border-black/[0.1] rounded-[3rem] p-10">
                   <h3 className="font-syne font-black text-2xl uppercase mb-8">Register New Seller (Auto-Verified)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Field label="Owner Name" required><input className={inputCls} value={sellerForm.ownerName} onChange={(e) => setSellerVal("ownerName", e.target.value)} /></Field>
                      <Field label="Email (Login ID)" required><input className={inputCls} placeholder="email@example.com" value={sellerForm.email} onChange={(e) => setSellerVal("email", e.target.value)} /></Field>
                      <Field label="Create Password" required><input type="password" className={inputCls} placeholder="Set login password" value={sellerForm.password} onChange={(e) => setSellerVal("password", e.target.value)} /></Field>
                      <Field label="Mobile"><input className={inputCls} placeholder="10-digit mobile" value={sellerForm.mobile} onChange={(e) => setSellerVal("mobile", e.target.value)} /></Field>
                      
                      <div className="md:col-span-2 h-[1px] bg-black/5" />

                      <Field label="Company Name" required><input className={inputCls} placeholder="Trading Name" value={sellerForm.companyName} onChange={(e) => setSellerVal("companyName", e.target.value)} /></Field>
                      <Field label="Business Type">
                         <select className={inputCls} value={sellerForm.businessType} onChange={(e) => setSellerVal("businessType", e.target.value)}>
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Trader">Trader</option>
                            <option value="Stockist">Stockist</option>
                            <option value="Converter">Converter</option>
                         </select>
                      </Field>
                      <Field label="GST Number"><input className={inputCls} placeholder="15 Digit GST" value={sellerForm.gstNumber} onChange={(e) => setSellerVal("gstNumber", e.target.value.toUpperCase())} /></Field>
                      <Field label="Pincode"><input className={inputCls} placeholder="6 Digit" value={sellerForm.pincode} onChange={(e) => setSellerVal("pincode", e.target.value)} /></Field>
                      <Field label="City"><input className={inputCls} value={sellerForm.city} onChange={(e) => setSellerVal("city", e.target.value)} /></Field>
                      <Field label="State"><input className={inputCls} value={sellerForm.state} onChange={(e) => setSellerVal("state", e.target.value)} /></Field>
                      <div className="md:col-span-2">
                         <Field label="Business Address"><textarea className={inputCls + " h-20"} value={sellerForm.businessAddress} onChange={(e) => setSellerVal("businessAddress", e.target.value)} /></Field>
                      </div>
                   </div>
                   <div className="mt-10 flex justify-end gap-3">
                      <button onClick={handleCreateSellerByAdmin} disabled={loading} className="px-10 py-4 bg-ink text-white rounded-2xl font-black uppercase text-xs shadow-xl disabled:opacity-50">
                        {loading ? "Creating..." : "Create Verified Account"}
                      </button>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEntity && (
           <SubViewOverlay entity={selectedEntity} onClose={() => setSelectedEntity(null)} notifyError={notifyError} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statusModal.isOpen && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setStatusModal({ ...statusModal, isOpen: false })} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white rounded-[2.5rem] p-8 max-w-lg w-full">
              <h3 className="text-2xl font-black font-syne mb-6">Status Update</h3>
              <textarea value={statusModal.message} onChange={(e) => setStatusModal({ ...statusModal, message: e.target.value })} className={inputCls + " h-32"} placeholder="Enter message..." />
              <div className="flex gap-3 mt-6">
                <button onClick={handleStatusUpdate} className="flex-1 px-8 py-4 bg-ink text-white rounded-2xl font-black uppercase text-xs">Update & Notify</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewGroupModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowNewGroupModal(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white rounded-[2.5rem] p-8 max-w-md w-full">
              <h3 className="font-syne font-black text-xl mb-6">New Product Group</h3>
              <Field label="Group Name" required><input className={inputCls} value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} /></Field>
              <button onClick={handleCreateGroup} className="w-full mt-6 py-4 bg-accent text-white rounded-2xl font-black uppercase text-xs">Create</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubViewOverlay({ entity, onClose, notifyError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubData = async () => {
      setLoading(true);
      try {
        let res;
        if(entity.type === "seller" && entity.mode === "orders") { res = await fetchSellerOrdersAdmin(entity.id); setItems(res.orders || []); }
        else if(entity.type === "seller" && entity.mode === "products") { res = await fetchSellerProductsAdmin(entity.id); setItems(res.products || []); }
        else if(entity.type === "lead" && entity.mode === "lead-matching") { res = await fetchLeadRecommendations(entity.id); setItems(res.recommendations || []); }
      } catch (err) { notifyError("Failed to load details"); } finally { setLoading(false); }
    };
    loadSubData();
  }, [entity]);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0" />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{entity.name}</h2>
          <button onClick={onClose} className="p-3 bg-white border rounded-2xl"><XCircle/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {loading ? <div className="py-20 text-center"><RefreshCcw className="animate-spin mx-auto text-accent" /></div> : (
            <div className="space-y-4">
               {entity.mode === "products" && items.map((prod) => (
                <div key={prod.id} className="p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-white rounded-2xl border flex items-center justify-center overflow-hidden">
                        {prod.image_url ? <img src={prod.image_url} alt="" className="object-cover w-full h-full" /> : <Package className="text-gray-300" />}
                     </div>
                     <div>
                        <h4 className="font-syne font-black text-gray-900 uppercase tracking-tight">{prod.name}</h4>
                        <div className="flex gap-2 mt-1">
                           <span className="text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-0.5 rounded-lg border border-black/[0.03]">{prod.thickness}</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-0.5 rounded-lg border border-black/[0.03]">{prod.width}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-8 text-right">
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Price Range</p>
                        <p className="text-xs font-black text-gray-900">₹{prod.price_min}-{prod.price_max}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">In Stock</p>
                        <p className={`text-xs font-black ${prod.stock_qty > 0 ? 'text-green-600' : 'text-red-500'}`}>{prod.stock_qty} kg</p>
                     </div>
                  </div>
                </div>
              ))}

              {entity.mode === "orders" && items.map((order) => (
                <div key={order.id} className="p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-white rounded-2xl border flex items-center justify-center text-accent">
                        <ShoppingBag size={20} />
                     </div>
                     <div>
                        <h4 className="font-syne font-black text-gray-900 uppercase tracking-tight">#{order.id.toString().padStart(5, '0')}</h4>
                        <p className="text-xs font-bold text-gray-400">{new Date(order.order_date).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="flex gap-8 text-right">
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Value</p>
                        <p className="text-sm font-black text-accent">₹{order.total_price}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Status</p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{order.status}</span>
                     </div>
                  </div>
                </div>
              ))}

               {entity.mode === "lead-matching" && items.map((seller, idx) => (
                <div key={seller.id} className={`p-8 rounded-[2.5rem] border transition-all shadow-sm ${idx === 0 ? 'bg-orange-50/50 border-accent/30 shadow-orange-100' : 'bg-white border-gray-100'}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <h4 className="font-syne font-black text-gray-900 text-xl uppercase tracking-tighter">{seller.company_name}</h4>
                         {idx === 0 && <span className="bg-accent text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Best Match 🥇</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6">
                         <MapPin size={14} className="text-accent"/> {seller.city}, {seller.state}
                      </div>
                      
                      {/* Match Breakdown - Phase 3 */}
                      <div className="bg-white/80 rounded-3xl p-6 border border-black/[0.03] space-y-3">
                         <p className="text-[10px] font-black text-ink uppercase tracking-widest mb-4 flex items-center justify-between">
                            Match Breakdown
                            <span className="text-accent">{seller.match_score} / 420 PTS</span>
                         </p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            <MatchItem label="Pincode Match" score={seller.pincode === entity.pincode ? 200 : 0} max={200} />
                            <MatchItem label="Category Fit" score={30} max={30} />
                            <MatchItem label="Stock Sufficient" score={seller.has_stock ? 50 : 0} max={50} status={seller.has_stock} />
                            <MatchItem label="MOQ Awareness" score={seller.moq_fit ? 40 : 0} max={40} status={seller.moq_fit} />
                         </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <a href={`tel:${seller.phone}`} className="w-full px-8 py-4 bg-ink text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10"><Phone size={14}/> Call Seller</a>
                       <button className="w-full px-8 py-4 bg-white border border-gray-100 text-ink rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"><Zap size={14}/> Notify WhatsApp</button>
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

function MatchItem({ label, score, max, status }) {
  const isZero = score === 0;
  return (
    <div className="flex items-center justify-between">
       <span className={`text-[11px] font-bold ${isZero ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
       <div className="flex items-center gap-2">
          {status !== undefined && (
             status ? <CheckCircle2 size={12} className="text-green-500"/> : <XCircle size={12} className="text-red-400"/>
          )}
          <span className={`text-[10px] font-black ${isZero ? 'text-gray-300 line-through' : 'text-accent'}`}>+{score}</span>
       </div>
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
