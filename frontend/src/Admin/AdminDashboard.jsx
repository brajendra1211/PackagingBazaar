import { useState, useEffect, useRef } from "react";
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight,
  MoreVertical,
  LayoutDashboard,
  HardDrive,
  Database,
  Settings,
  RefreshCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Inbox,
  MessageSquare,
  Zap,
  FileText,
  Send,
  Plus,
  Tag,
  Layers,
  Package,
  Image as ImageIcon,
  UserPlus,
  User,
  Lock,
  Building2,
  Eye,
  EyeOff,
  UploadCloud,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
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
  addProductForSeller,
  uploadProductImage,
  addSellerAdmin,
  updateSellerAdmin,
  fetchCategories,
  fetchSubCategories,
  fetchTags,
  fetchApplications,
  fetchProductGroups,
  createProductGroup,
  fetchLeadRecommendations,
} from "../services/adminServices";
import Pagination from "../components/ui/Pagination";
import { useNotification } from "../context/NotificationContext";
import { API_BASE_URL } from "../services/api";

const UNITS = ["kg", "meter", "roll", "sheet", "bag", "box"];
const STEPS = [
  "Seller",
  "Basic Info",
  "Specifications",
  "Applications",
  "Preview",
];

const inputCls =
  "w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-slate-50 focus:outline-none focus:bg-white focus:border-accent transition-colors text-ink placeholder:text-slate-400 font-medium";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const TAB_INFO = {
    overview: {
      title: "Admin Control",
      desc: "Manage marketplace operations, users, and business leads.",
    },
    sellers: {
      title: "Approved Sellers",
      desc: "View and manage all verified manufacturers and traders on the platform.",
    },
    pending: {
      title: "Pending Approvals",
      desc: "Review and verify new seller applications before they go live.",
    },
    users: {
      title: "User Directory",
      desc: "Manage buyer accounts and monitor user activity across the system.",
    },
    products: {
      title: "Product Catalog",
      desc: "Inspect and manage all packaging film variants listed by sellers.",
    },
    orders: {
      title: "Sales Orders",
      desc: "Monitor all transactions and order fulfillment statuses in real-time.",
    },
    inquiries: {
      title: "Business Leads",
      desc: "Tracking all buyer inquiries and procurement requests.",
    },
    "seller-hub": {
      title: "Seller Hub",
      desc: "Performance analytics and deep-dive into individual seller operations.",
    },
    "add-product": {
      title: "Add Seller Product",
      desc: "List new products on behalf of verified marketplace sellers.",
    },
    "add-seller": {
      title: "Add New Seller",
      desc: "Create a verified manufacturer or trader account directly.",
    },
  };

  const currentTab = TAB_INFO[activeTab] || TAB_INFO.overview;

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    pendingSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalInquiries: 0,
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
    name: "",
    display_name: "",
    product_group_id: "",
    category: "",
    customCategory: "",
    subcategory: "",
    customSubcategory: "",
    tag: "",
    customTag: "",
    thickness: "",
    width: "",
    minPrice: "",
    maxPrice: "",
    unit: "kg",
    minOrder: "",
    stock: "",
    description: "",
    applications: [],
    customApplications: "",
    img: "",
    delivery_days: "",
    payment_terms: "",
    customPaymentTerms: "",
    color: "",
    type: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [applications, setApplications] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [sellerForm, setSellerForm] = useState({
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    companyName: "",
    businessType: "Manufacturer",
    gstNumber: "",
    gstCertificate: null,
    city: "",
    state: "",
    pincode: "",
    businessAddress: "",
    yearEstablished: "",
    description: "",
  });
  const setSellerVal = (k, v) => setSellerForm((f) => ({ ...f, [k]: v }));

  const [pincodeStatus, setPincodeStatus] = useState("idle"); // 'idle' | 'loading' | 'valid' | 'invalid'

  const handleSellerPincodeChange = async (val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setSellerVal("pincode", cleaned);

    if (cleaned.length < 6) {
      setPincodeStatus("idle");
      setSellerVal("city", "");
      setSellerVal("state", "");
      setSellerVal("businessAddress", "");
      return;
    }

    setPincodeStatus("loading");
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${cleaned}`,
      );
      const data = await res.json();

      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setSellerVal("city", po.District);
        setSellerVal("state", po.State);
        setSellerVal(
          "businessAddress",
          `${po.Name}, ${po.District}, ${po.State} - ${cleaned}`,
        );
        setPincodeStatus("valid");
      } else {
        setSellerVal("city", "");
        setSellerVal("state", "");
        setSellerVal("businessAddress", "");
        setPincodeStatus("invalid");
      }
    } catch {
      setPincodeStatus("invalid");
    }
  };

  const handleSellerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024)
        return notifyError("File exceeds 5MB limit.");
      const allowed = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowed.includes(file.type))
        return notifyError("Invalid file type (PDF/JPG/PNG only).");
      setSellerVal("gstCertificate", file);
    }
  };

  const [sellerPhase, setSellerPhase] = useState(1); // 1 = Personal, 2 = Business
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    userId: null,
    newStatus: "",
    message: "",
    mobile: "",
  });

  const [editSellerModal, setEditSellerModal] = useState({
    isOpen: false,
    sellerId: null,
    form: {
      ownerName: "",
      email: "",
      mobile: "",
      companyName: "",
      businessType: "Manufacturer",
      gstNumber: "",
      gstCertificate: null,
      existingGstCertificate: "",
      city: "",
      state: "",
      pincode: "",
      businessAddress: "",
      yearEstablished: "",
      description: "",
    },
  });

  const [editPincodeStatus, setEditPincodeStatus] = useState("idle");

  const setEditVal = (k, v) =>
    setEditSellerModal((m) => ({
      ...m,
      form: { ...m.form, [k]: v },
    }));

  const openEditModal = (seller) => {
    setEditSellerModal({
      isOpen: true,
      sellerId: seller.user_id,
      form: {
        ownerName: seller.owner_name,
        email: seller.email,
        mobile: seller.mobile,
        companyName: seller.company_name,
        businessType: seller.business_type || "Manufacturer",
        gstNumber: seller.gst_number || "",
        gstCertificate: null,
        existingGstCertificate: seller.gst_certificate || "",
        city: seller.city || "",
        state: seller.state || "",
        pincode: seller.pincode || "",
        businessAddress: seller.business_address || seller.address || "",
        yearEstablished: seller.year_established || "",
        description: seller.description || "",
      },
    });
    setEditPincodeStatus("valid"); // Initial state for existing data
  };

  const handleEditPincodeChange = async (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setEditVal("pincode", cleaned);

    if (cleaned.length < 6) {
      setEditPincodeStatus("idle");
      return;
    }

    setEditPincodeStatus("loading");
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${cleaned}`,
      );
      const data = await res.json();

      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setEditVal("city", po.District);
        setEditVal("state", po.State);
        setEditVal(
          "businessAddress",
          `${po.Name}, ${po.District}, ${po.State} - ${cleaned}`,
        );
        setEditPincodeStatus("valid");
      } else {
        setEditPincodeStatus("invalid");
      }
    } catch {
      setEditPincodeStatus("invalid");
    }
  };

  const handleUpdateSeller = async () => {
    if (!editSellerModal.form.ownerName) return notifyError("Name required");
    setLoading(true);
    try {
      const res = await updateSellerAdmin(
        editSellerModal.sellerId,
        editSellerModal.form,
      );
      if (res.success) {
        notifySuccess("Seller updated!");
        setEditSellerModal({ ...editSellerModal, isOpen: false });
        loadTabData(currentPage);
      }
    } catch (err) {
      notifyError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
    loadMasterData(); // Fetch categories, tags, etc. on mount
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
        } catch (err) {
          console.error("Failed sub-cat loader");
        }
      };
      loadSubs();
    } else {
      setSubCategories([]);
    }
  }, [form.category]);

  const loadDashboardStats = async () => {
    try {
      const res = await fetchDashboardStats();
      if (res.success) setStats(res.stats);
    } catch (err) {
      notifyError("Stats failure");
    }
  };

  const loadMasterData = async () => {
    // We fetch each item individually so one failure doesn't block others
    try {
      const catRes = await fetchCategories();
      if (catRes?.success) setCategories(catRes.data);
    } catch (e) {
      console.error("Cat fetch failed", e);
    }

    try {
      const tagRes = await fetchTags();
      if (tagRes?.success) setTags(tagRes.data);
    } catch (e) {
      console.error("Tag fetch failed", e);
    }

    try {
      const appRes = await fetchApplications();
      if (appRes?.success) setApplications(appRes.data);
    } catch (e) {
      console.error("App fetch failed", e);
    }

    try {
      const groupRes = await fetchProductGroups();
      if (groupRes?.success) setProductGroups(groupRes.data);
    } catch (e) {
      console.error("Group fetch failed", e);
    }
  };

  const loadTabData = async (page) => {
    setLoading(true);
    setData([]);
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
          res = await fetchAllUsers(page, 10, userRoleFilter);
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
          await loadMasterData();
          const sellersRes = await fetchAllSellers(1, 1000);
          if (sellersRes?.sellers) setAllVerifiedSellers(sellersRes.sellers);
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
    if (!message) return notifyError("Please enter a status message");
    try {
      const res = await updateSellerStatus(userId, newStatus);
      if (res.success) {
        notifySuccess(`Seller state: ${newStatus}`);
        setStatusModal({ ...statusModal, isOpen: false });
        window.open(
          `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`,
          "_blank",
        );
        loadTabData(currentPage);
      }
    } catch (err) {
      notifyError("Sync failed");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadTabData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setFormVal = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addApp = (app) => {
    if (app && !form.applications.includes(app)) {
      setFormVal("applications", [...form.applications, app]);
    }
  };
  const removeApp = (app) =>
    setFormVal(
      "applications",
      form.applications.filter((a) => a !== app),
    );

  const handleCreateGroup = async () => {
    if (!newGroupName) return notifyError("Group name is required");
    if (!form.category) return notifyError("Please select a category first");
    try {
      const catPrefix =
        categories.find((c) => c.id == form.category)?.code_prefix || "CAT";
      const thick = form.thickness || "X";
      const namePart = (newGroupName || "NAME").substring(0, 3).toUpperCase();
      const generatedMasterId = `GP-${catPrefix}-${thick}-${namePart}`;
      const res = await createProductGroup({
        name: newGroupName,
        masterId: generatedMasterId,
        categoryId: form.category,
        description: `Group for ${newGroupName}`,
      });
      if (res.success) {
        notifySuccess(`Group live: ${res.masterId}`);
        setProductGroups([
          ...productGroups,
          { id: res.groupId, name: newGroupName, master_id: res.masterId },
        ]);
        setFormVal("product_group_id", res.groupId);
        setShowNewGroupModal(false);
        setNewGroupName("");
      }
    } catch (err) {
      notifyError("Creation failed");
    }
  };

  const handleCreateProductByAdmin = async () => {
    if (!selectedSeller) return notifyError("Select a seller");
    setLoading(true);
    try {
      const productData = {
        ...form,
        product_group_id: form.product_group_id,
        category:
          form.category === "Other"
            ? form.customCategory
            : categories.find((c) => c.id == form.category)?.name ||
              form.category,
        subcategory:
          form.subcategory === "Other"
            ? form.customSubcategory
            : subCategories.find((s) => s.id == form.subcategory)?.name ||
              form.subcategory,
        tag:
          form.tag === "Other"
            ? form.customTag
            : tags.find((t) => t.id == form.tag)?.tag_name || form.tag,
        payment_terms:
          form.payment_terms === "Other"
            ? form.customPaymentTerms
            : form.payment_terms,
        minPrice: parseFloat(form.minPrice),
        maxPrice: parseFloat(form.maxPrice),
        minOrder: parseInt(form.minOrder),
        stock: parseInt(form.stock),
      };
      const res = await addProductForSeller(
        selectedSeller.user_id,
        productData,
      );
      if (res.success) {
        notifySuccess("Product listed!");
        setProductSubmitted(true);
        loadDashboardStats();
      }
    } catch (err) {
      notifyError("Posting failed");
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      notifyError("Upload Error");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSellerByAdmin = async () => {
    if (!sellerForm.companyName.trim())
      return notifyError("Company Name is required");
    if (!sellerForm.pincode || pincodeStatus !== "valid")
      return notifyError("Valid Pincode required");
    if (!sellerForm.businessAddress.trim())
      return notifyError("Address is required");

    setLoading(true);
    try {
      // Admin creation skips certificate upload for speed, but uses all other data
      const res = await addSellerAdmin(sellerForm);
      if (res.success) {
        notifySuccess("Seller registered & verified!");
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "sellers");
        window.history.pushState({}, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
        setSellerForm({
          ownerName: "",
          email: "",
          password: "",
          confirmPassword: "",
          mobile: "",
          companyName: "",
          businessType: "Manufacturer",
          gstNumber: "",
          gstCertificate: null,
          city: "",
          state: "",
          pincode: "",
          businessAddress: "",
        });
        setPincodeStatus("idle");
        setSellerPhase(1);
      }
    } catch (err) {
      notifyError("Seller Creation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductSubmitted(false);
    setFormStep(0);
    setSelectedSeller(null);
    setForm({
      name: "",
      display_name: "",
      product_group_id: "",
      category: "",
      customCategory: "",
      subcategory: "",
      customSubcategory: "",
      tag: "",
      customTag: "",
      thickness: "",
      width: "",
      minPrice: "",
      maxPrice: "",
      unit: "kg",
      minOrder: "",
      stock: "",
      description: "",
      applications: [],
      customApplications: "",
      img: "",
      delivery_days: "",
      payment_terms: "",
      color: "",
      type: "",
    });
  };

  const StepIndicator = ({ current }) => (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < current
                  ? "bg-accent border-accent text-white"
                  : i === current
                    ? "bg-white border-accent text-accent"
                    : "bg-white border-black/10 text-slate-400"
              }`}
            >
              {i < current ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-medium hidden sm:block ${i === current ? "text-accent" : "text-slate-400"}`}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-8 sm:w-14 mx-1 mb-4 rounded ${i < current ? "bg-accent" : "bg-black/10"}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const Field = ({ label, required, hint, children }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold text-ink uppercase tracking-wider">
          {label} {required && <span className="text-accent">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );

  const PreviewCard = () => (
    <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden shadow-sm">
      {selectedSeller && (
        <div className="bg-slate-50 p-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
              {selectedSeller.company_name?.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">
                {selectedSeller.company_name}
              </p>
              <p className="text-xs text-slate-400">Manufacturer</p>
            </div>
          </div>
        </div>
      )}
      <div className="bg-slate-50 h-48 flex items-center justify-center relative">
        {form.img ? (
          <img
            src={form.img}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="text-center">
            <ImageIcon size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No image</p>
          </div>
        )}
        {form.tag && form.tag !== "Other" && (
          <span className="absolute top-3 left-3 text-[10px] bg-accent text-white px-2.5 py-0.5 rounded-full font-semibold capitalize">
            {tags.find((t) => t.id == form.tag)?.tag_name || form.tag}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs text-accent font-semibold mb-1">
            {form.category === "Other"
              ? form.customCategory
              : categories.find((c) => c.id == form.category)?.name ||
                "Category"}{" "}
            ·{" "}
            {form.subcategory === "Other"
              ? form.customSubcategory
              : subCategories.find((s) => s.id == form.subcategory)?.name ||
                "Sub"}
          </div>
          <h3 className="font-syne font-black text-base text-ink">
            {form.name || "Product Name"}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["Thickness", form.thickness ? `${form.thickness} mic` : "—"],
            ["Width", form.width ? `${form.width} mm` : "—"],
            ["Min Order", form.minOrder ? `${form.minOrder} kg` : "—"],
            ["Stock", form.stock ? `${form.stock} kg` : "—"],
          ].map(([l, v]) => (
            <div key={l} className="bg-slate-50 rounded-lg px-3 py-2">
              <div className="text-[10px] text-slate-400">{l}</div>
              <div className="font-semibold text-ink">{v}</div>
            </div>
          ))}
        </div>

        {form.applications && form.applications.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/[0.06]">
            {form.applications.map((a) => (
              <span
                key={a}
                className="text-[10px] bg-accent/10 text-accent px-2.5 py-0.5 rounded-full border border-accent/20"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-black/[0.06] flex items-baseline gap-1.5">
          <span className="font-syne font-black text-2xl text-accent">
            ₹{form.minPrice || "—"}
          </span>
          <span className="text-xs text-slate-400">
            to ₹{form.maxPrice || "—"}
          </span>
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
      notifyError("Update error");
    }
  };

  const filteredData = Array.isArray(data)
    ? data.filter((item) => {
        const s = search.toLowerCase();
        if (activeTab === "users")
          return (
            item.name?.toLowerCase().includes(s) ||
            item.email?.toLowerCase().includes(s)
          );
        if (activeTab === "products")
          return (
            item.name?.toLowerCase().includes(s) ||
            item.seller_name?.toLowerCase().includes(s)
          );
        if (
          activeTab === "sellers" ||
          activeTab === "pending" ||
          activeTab === "seller-hub"
        )
          return (
            item.company_name?.toLowerCase().includes(s) ||
            item.owner_name?.toLowerCase().includes(s)
          );
        if (activeTab === "inquiries")
          return (
            item.buyer_display_name?.toLowerCase().includes(s) ||
            item.product_name?.toLowerCase().includes(s)
          );
        if (activeTab === "orders")
          return (
            item.customer_name?.toLowerCase().includes(s) ||
            item.id?.toString().includes(s)
          );
        return true;
      })
    : [];

  return (
    <div className="p-4 md:p-8">
      {/* ── Header ── */}
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
          <p className="text-gray-500 text-sm font-medium">{currentTab.desc}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm w-full md:w-80 outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            {
              label: "Total Users",
              val: stats.totalUsers,
              icon: <Users size={20} />,
              color: "blue",
              tab: "users",
            },
            {
              label: "Pending Sellers",
              val: stats.pendingSellers,
              icon: <Clock size={20} />,
              color: "orange",
              tab: "pending",
            },
            {
              label: "Active Sellers",
              val: stats.totalSellers,
              icon: <Store size={20} />,
              color: "green",
              tab: "sellers",
            },
            {
              label: "Leads",
              val: stats.totalInquiries,
              icon: <TrendingUp size={20} />,
              color: "purple",
              tab: "inquiries",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set("tab", stat.tab);
                window.history.pushState({}, "", url);
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm cursor-pointer relative overflow-hidden group hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4`}
              >
                {stat.icon}
              </div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-syne font-black text-gray-900">
                {stat.val}
              </h3>
            </div>
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
                  <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">
                    Marketplace {activeTab}
                  </h3>
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set("tab", "add-seller");
                      window.history.pushState({}, "", url);
                      window.dispatchEvent(new PopStateEvent("popstate"));
                    }}
                    className="px-6 py-3 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <UserPlus size={16} /> New Seller
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-50">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Company
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Business
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Location
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <Store size={48} className="text-gray-200" />
                              <p className="font-syne font-black text-lg text-gray-300 uppercase tracking-wide">
                                {activeTab === "sellers"
                                  ? "No Active Sellers"
                                  : "No Pending Applications"}
                              </p>
                              <p className="text-[11px] text-gray-300 font-medium">
                                {activeTab === "sellers"
                                  ? "Verified sellers will appear here once approved."
                                  : "All pending seller applications will appear here."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((seller) => (
                          <tr
                            key={seller.user_id}
                            className="hover:bg-gray-50/50 transition-all border-b border-gray-50"
                          >
                            <td className="px-8 py-6">
                              <div className="font-bold text-gray-900 leading-tight">
                                {seller.company_name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">
                                  UID: {seller.seller_uid}
                                </div>
                                {seller.gst_number && (
                                  <>
                                    <div className="w-[1px] h-2 bg-gray-200" />
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">
                                      GST: {seller.gst_number}
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1.5">
                                <span className="w-fit px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                                  {seller.business_type}
                                </span>
                                <span
                                  className={`w-fit px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${seller.status === "hold" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-slate-50 text-slate-500 border-slate-100"}`}
                                >
                                  {seller.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-xs text-gray-600 font-bold">
                              {seller.city}, {seller.state}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {seller.gst_certificate && (
                                  <a
                                    href={
                                      seller.gst_certificate.startsWith("http")
                                        ? seller.gst_certificate
                                        : `${API_BASE_URL.replace("/api", "")}/${seller.gst_certificate}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                                    title="View GST Certificate"
                                  >
                                    <FileText size={16} />
                                  </a>
                                )}
                                {activeTab === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        setStatusModal({
                                          isOpen: true,
                                          userId: seller.user_id,
                                          newStatus: "verified",
                                          message: `Hi ${seller.company_name}, your account on PackagingBazaar is now VERIFIED! Log in to list your products.`,
                                          mobile: seller.mobile,
                                        })
                                      }
                                      className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors shadow-sm"
                                      title="Verify Seller"
                                    >
                                      <CheckCircle2 size={16} />
                                    </button>
                                    {seller.status !== "hold" && (
                                      <button
                                        onClick={() =>
                                          setStatusModal({
                                            isOpen: true,
                                            userId: seller.user_id,
                                            newStatus: "hold",
                                            message: `Hi ${seller.company_name}, your application is currently on HOLD. Please provide [REASON].`,
                                            mobile: seller.mobile,
                                          })
                                        }
                                        className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors shadow-sm"
                                        title="Put on Hold"
                                      >
                                        <Clock size={16} />
                                      </button>
                                    )}
                                  </>
                                )}
                                {activeTab !== "pending" && (
                                  <button
                                    onClick={() => openEditModal(seller)}
                                    className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                                    title="Edit Seller"
                                  >
                                    <Settings size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    rejectSellerAccount(seller.user_id).then(
                                      () => loadTabData(currentPage),
                                    )
                                  }
                                  className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                                  title="Reject/Delete"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">
                      User Directory
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                      Manage platform participants
                    </p>
                  </div>
                  <div className="flex bg-white p-1 rounded-2xl border border-gray-100">
                    <button
                      onClick={() => setUserRoleFilter("user")}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRoleFilter === "user" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-gray-400 hover:text-ink"}`}
                    >
                      All Users
                    </button>
                    <button
                      onClick={() => setUserRoleFilter("seller")}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRoleFilter === "seller" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-gray-400 hover:text-ink"}`}
                    >
                      Sellers
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-50">
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[10px] font-black text-gray-400 uppercase">
                          User Info
                        </th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[10px] font-black text-gray-400 uppercase">
                          Contact
                        </th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[10px] font-black text-gray-400 uppercase text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50/50 transition-all border-b border-gray-50 group"
                        >
                          <td className="px-4 sm:px-8 py-4 sm:py-6">
                            <div className="font-bold text-gray-900 group-hover:text-accent transition-colors text-sm">
                              {user.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-black uppercase mt-0.5">
                              {user.role}
                            </div>
                          </td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6">
                            <div className="text-xs font-medium flex items-center gap-2 mb-1">
                              <Mail size={12} className="text-gray-300" />{" "}
                              {user.email}
                            </div>
                            {user.mobile && (
                              <div className="text-xs text-gray-400 flex items-center gap-2">
                                <Phone size={12} className="text-gray-300" />{" "}
                                {user.mobile}
                              </div>
                            )}
                          </td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  deleteUserAccount(user.id).then(() =>
                                    loadTabData(currentPage),
                                  )
                                }
                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
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
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Product
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Seller
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Pricing
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-gray-50/50 transition-all border-b border-gray-50"
                        >
                          <td className="px-8 py-6">
                            <div className="font-bold text-gray-900">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-black uppercase mt-0.5">
                              {p.category_name}
                              {p.thickness ? ` • ${p.thickness}` : ""}
                              {p.color ? ` • ${p.color}` : ""}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-medium">
                            {p.seller_name}
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-black text-accent">
                              ₹{p.price_min} – ₹{p.price_max}
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                              per {p.unit || "kg"}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                              <XCircle size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
                <div className="px-8 py-6 border-b border-gray-50 bg-slate-50/50">
                  <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">
                    Sales Activity
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                    Monitor marketplace transactions
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-50">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Order Details
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Customer
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Transaction
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50/50 transition-all border-b border-gray-50"
                        >
                          <td className="px-8 py-6">
                            <div className="font-black text-accent mb-1 tracking-tight">
                              #{order.id}
                            </div>
                            <div className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                              <Clock size={12} />{" "}
                              {new Date(order.order_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-8 py-6 font-bold text-gray-900">
                            {order.customer_name}
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-syne font-black text-gray-900">
                              ₹{order.total_amount}
                            </div>
                            <div
                              className={`mt-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg inline-block ${order.status === "completed" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}
                            >
                              {order.status}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="p-2.5 bg-accent/5 text-accent rounded-xl hover:bg-accent/10">
                              <ArrowUpRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
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
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Buyer
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Requirement
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Seller
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((inquiry) => (
                        <tr
                          key={inquiry.id}
                          className="hover:bg-gray-50/50 border-b border-gray-50"
                        >
                          <td className="px-8 py-6 font-bold">
                            {inquiry.buyer_display_name}
                          </td>
                          <td className="px-8 py-6 text-xs italic">
                            "{inquiry.message}"
                          </td>
                          <td className="px-8 py-6 font-medium">
                            {inquiry.seller_name}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() =>
                                setSelectedEntity({
                                  type: "lead",
                                  id: inquiry.id,
                                  name: inquiry.buyer_display_name,
                                  mode: "lead-matching",
                                  location: inquiry.address,
                                })
                              }
                              className="p-2 bg-accent/10 text-accent rounded-xl"
                            >
                              <Zap size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "seller-hub" && (
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
                <div className="px-8 py-6 border-b border-gray-50 bg-slate-50/50">
                  <h3 className="font-syne font-black text-xl text-ink uppercase tracking-tight">
                    Seller Performance
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                    Deep insights into business operations
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-50">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Seller Hub
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">
                          Performance
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">
                          Operations
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((seller) => (
                        <tr
                          key={seller.id}
                          className="hover:bg-gray-50/50 border-b border-gray-50 group"
                        >
                          <td className="px-8 py-6">
                            <div className="font-syne font-black text-gray-900 uppercase group-hover:text-accent transition-colors">
                              {seller.company_name}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold">
                              BY {seller.owner_name}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-6">
                              <div>
                                <div className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                                  Orders
                                </div>
                                <div className="font-syne font-black text-gray-900">
                                  {seller.sales_count || 0}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                                  Revenue
                                </div>
                                <div className="font-syne font-black text-accent">
                                  ₹{seller.total_value || 0}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() =>
                                  setSelectedEntity({
                                    type: "seller",
                                    id: seller.user_id,
                                    name: seller.company_name,
                                    mode: "orders",
                                  })
                                }
                                className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                              >
                                <FileText size={14} /> Orders
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedEntity({
                                    type: "seller",
                                    id: seller.user_id,
                                    name: seller.company_name,
                                    mode: "products",
                                  })
                                }
                                className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                              >
                                <Package size={14} /> Stock
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-8 bg-slate-50/30 border-t border-gray-50">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "add-product" && (
              <section className="py-8 sm:py-12 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                  {productSubmitted ? (
                    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                        <CheckCircle2 size={40} className="text-green-600" />
                      </div>
                      <h2 className="font-syne font-black text-3xl text-ink text-center mb-2">
                        Product Listed!
                      </h2>
                      <p className="text-slate-600 text-center max-w-md mb-2">
                        <strong>{form.name}</strong> has been successfully added
                        for {selectedSeller?.company_name}
                      </p>
                      <p className="text-slate-400 text-sm text-center mb-8">
                        It will go live immediately on the marketplace.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setProductSubmitted(false);
                            setFormStep(0);
                            setSelectedSeller(null);
                            setSearch("");
                            setForm({
                              name: "",
                              display_name: "",
                              product_group_id: "",
                              category: "",
                              customCategory: "",
                              subcategory: "",
                              customSubcategory: "",
                              tag: "",
                              customTag: "",
                              thickness: "",
                              width: "",
                              minPrice: "",
                              maxPrice: "",
                              unit: "kg",
                              minOrder: "",
                              stock: "",
                              description: "",
                              applications: [],
                              customApplications: "",
                              img: "",
                              delivery_days: "",
                              payment_terms: "",
                              customPaymentTerms: "",
                              color: "",
                              type: "",
                            });
                          }}
                          className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
                        >
                          Add Another
                        </button>
                        <button
                          onClick={() => {
                            const url = new URL(window.location.href);
                            url.searchParams.set("tab", "products");
                            window.history.pushState({}, "", url);
                            window.dispatchEvent(new PopStateEvent("popstate"));
                          }}
                          className="px-6 py-3 rounded-xl border border-black/15 text-sm font-medium text-ink hover:bg-slate-50 transition-colors"
                        >
                          View Products
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Form */}
                      <div className="lg:col-span-2">
                        <div className="bg-white border border-black/[0.08] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm">
                          <StepIndicator current={formStep} />

                          {/* Step 0: Select Seller */}
                          {formStep === 0 && (
                            <div className="flex flex-col gap-5">
                              <div className="flex items-center gap-2 mb-1">
                                <Store size={18} className="text-accent" />
                                <h3 className="font-syne font-bold text-lg text-ink">
                                  Select Seller
                                </h3>
                              </div>

                              <div className="relative mb-6">
                                <Search
                                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                  size={18}
                                />
                                <input
                                  type="text"
                                  placeholder="Search by brand, city..."
                                  className={inputCls + " pl-12"}
                                  onChange={(e) => setSearch(e.target.value)}
                                />
                              </div>

                              {allVerifiedSellers.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                  <Store
                                    size={32}
                                    className="mx-auto text-slate-300 mb-2"
                                  />
                                  <p className="text-sm text-slate-400 font-medium">
                                    No verified sellers available
                                  </p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                                  {allVerifiedSellers
                                    .filter(
                                      (s) =>
                                        !search ||
                                        s.company_name
                                          .toLowerCase()
                                          .includes(search.toLowerCase()) ||
                                        s.city
                                          ?.toLowerCase()
                                          .includes(search.toLowerCase()),
                                    )
                                    .map((seller) => (
                                      <button
                                        key={seller.user_id}
                                        onClick={() =>
                                          setSelectedSeller(seller)
                                        }
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                          selectedSeller?.user_id ===
                                          seller.user_id
                                            ? "border-accent bg-accent/5"
                                            : "border-black/[0.08] bg-white hover:border-accent/40"
                                        }`}
                                      >
                                        <div className="font-semibold text-ink uppercase text-sm">
                                          {seller.company_name}
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                          <MapPin size={12} /> {seller.city},{" "}
                                          {seller.state?.substring(0, 2)}
                                        </div>
                                        <div className="text-[10px] text-green-600 font-bold mt-2">
                                          ✓ Verified
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Step 1: Basic Info */}
                          {formStep === 1 && (
                            <div className="flex flex-col gap-5">
                              <div className="flex items-center gap-2 mb-1">
                                <Package size={18} className="text-accent" />
                                <h3 className="font-syne font-bold text-lg text-ink">
                                  Basic Information
                                </h3>
                              </div>

                              <Field label="Product Name" required>
                                <input
                                  key="product-name"
                                  className={inputCls}
                                  placeholder="e.g. BOPP Transparent Film"
                                  value={form.name}
                                  onChange={(e) =>
                                    setFormVal("name", e.target.value)
                                  }
                                />
                              </Field>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Category" required>
                                  <select
                                    className={inputCls}
                                    value={form.category}
                                    onChange={(e) =>
                                      setFormVal("category", e.target.value)
                                    }
                                  >
                                    <option value="">Select...</option>
                                    {categories.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name}
                                      </option>
                                    ))}
                                    <option value="Other">Add New...</option>
                                  </select>
                                </Field>
                                <Field label="Subcategory" required>
                                  <select
                                    className={
                                      inputCls +
                                      (form.category
                                        ? ""
                                        : " opacity-50 cursor-not-allowed")
                                    }
                                    disabled={!form.category}
                                    value={form.subcategory}
                                    onChange={(e) =>
                                      setFormVal("subcategory", e.target.value)
                                    }
                                  >
                                    <option value="">Select...</option>
                                    {subCategories.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.name}
                                      </option>
                                    ))}
                                    <option value="Other">Add New...</option>
                                  </select>
                                </Field>
                              </div>

                              {form.category === "Other" && (
                                <Field label="New Category Name" required>
                                  <input
                                    className={inputCls}
                                    placeholder="Category name"
                                    value={form.customCategory}
                                    onChange={(e) =>
                                      setFormVal(
                                        "customCategory",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </Field>
                              )}

                              {form.subcategory === "Other" && (
                                <Field label="New Subcategory Name" required>
                                  <input
                                    className={inputCls}
                                    placeholder="Subcategory name"
                                    value={form.customSubcategory}
                                    onChange={(e) =>
                                      setFormVal(
                                        "customSubcategory",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </Field>
                              )}

                              <Field label="Marketing Tag">
                                <div className="flex flex-wrap gap-2">
                                  {tags.map((t) => (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() => setFormVal("tag", t.id)}
                                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                        form.tag === t.id
                                          ? "bg-accent text-white border-accent"
                                          : "bg-slate-50 text-slate-600 border-black/[0.08] hover:border-accent/40"
                                      }`}
                                    >
                                      {t.tag_name}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setFormVal("tag", "Other")}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                      form.tag === "Other"
                                        ? "bg-accent text-white border-accent"
                                        : "bg-slate-50 text-slate-600 border-black/[0.08]"
                                    }`}
                                  >
                                    + Custom
                                  </button>
                                </div>
                                {form.tag === "Other" && (
                                  <input
                                    className={inputCls + " mt-2"}
                                    placeholder="Custom tag name"
                                    value={form.customTag}
                                    onChange={(e) =>
                                      setFormVal("customTag", e.target.value)
                                    }
                                  />
                                )}
                              </Field>
                            </div>
                          )}

                          {/* Step 2: Specifications */}
                          {formStep === 2 && (
                            <div className="flex flex-col gap-5">
                              <div className="flex items-center gap-2 mb-1">
                                <Layers size={18} className="text-accent" />
                                <h3 className="font-syne font-bold text-lg text-ink">
                                  Specifications
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Thickness" hint="e.g. 20 micron">
                                  <input
                                    className={inputCls}
                                    placeholder="20 micron"
                                    value={form.thickness}
                                    onChange={(e) =>
                                      setFormVal("thickness", e.target.value)
                                    }
                                  />
                                </Field>
                                <Field label="Width" hint="e.g. 1000 mm">
                                  <input
                                    className={inputCls}
                                    placeholder="1000 mm"
                                    value={form.width}
                                    onChange={(e) =>
                                      setFormVal("width", e.target.value)
                                    }
                                  />
                                </Field>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Color">
                                  <input
                                    className={inputCls}
                                    placeholder="Silver, White, etc"
                                    value={form.color}
                                    onChange={(e) =>
                                      setFormVal("color", e.target.value)
                                    }
                                  />
                                </Field>
                                <Field label="Type">
                                  <input
                                    className={inputCls}
                                    placeholder="Metallized, Transparent, etc"
                                    value={form.type}
                                    onChange={(e) =>
                                      setFormVal("type", e.target.value)
                                    }
                                  />
                                </Field>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="Min Price (₹)" required>
                                  <input
                                    className={inputCls}
                                    type="number"
                                    placeholder="180"
                                    value={form.minPrice}
                                    onChange={(e) =>
                                      setFormVal("minPrice", e.target.value)
                                    }
                                  />
                                </Field>
                                <Field label="Max Price (₹)" required>
                                  <input
                                    className={inputCls}
                                    type="number"
                                    placeholder="250"
                                    value={form.maxPrice}
                                    onChange={(e) =>
                                      setFormVal("maxPrice", e.target.value)
                                    }
                                  />
                                </Field>
                                <Field label="Min Order (kg)" required>
                                  <input
                                    className={inputCls}
                                    type="number"
                                    placeholder="50"
                                    value={form.minOrder}
                                    onChange={(e) =>
                                      setFormVal("minOrder", e.target.value)
                                    }
                                  />
                                </Field>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Available Stock (kg)" required>
                                  <input
                                    className={inputCls}
                                    type="number"
                                    placeholder="2400"
                                    value={form.stock}
                                    onChange={(e) =>
                                      setFormVal("stock", e.target.value)
                                    }
                                  />
                                </Field>
                                <Field label="Delivery Time (hours)" required>
                                  <input
                                    className={inputCls}
                                    type="number"
                                    placeholder="48"
                                    value={form.delivery_days}
                                    onChange={(e) =>
                                      setFormVal(
                                        "delivery_days",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </Field>
                              </div>

                              <Field label="Payment Terms" required>
                                <select
                                  className={inputCls}
                                  value={form.payment_terms}
                                  onChange={(e) =>
                                    setFormVal("payment_terms", e.target.value)
                                  }
                                >
                                  <option value="">Select...</option>
                                  <option value="Advance Payment">
                                    Advance Payment
                                  </option>
                                  <option value="COD">COD</option>
                                  <option value="Net 30">Net 30</option>
                                </select>
                              </Field>

                              <Field
                                label="Product Image URL"
                                hint="Direct image link"
                              >
                                <input
                                  className={inputCls}
                                  placeholder="https://example.com/image.jpg"
                                  value={form.img}
                                  onChange={(e) =>
                                    setFormVal("img", e.target.value)
                                  }
                                />
                              </Field>
                            </div>
                          )}

                          {/* Step 3: Applications & Description */}
                          {formStep === 3 && (
                            <div className="flex flex-col gap-5">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText size={18} className="text-accent" />
                                <h3 className="font-syne font-bold text-lg text-ink">
                                  Description & Applications
                                </h3>
                              </div>

                              <Field label="Product Description" required>
                                <textarea
                                  className={inputCls + " resize-none"}
                                  rows={4}
                                  placeholder="Describe key properties, certifications, use cases..."
                                  value={form.description}
                                  onChange={(e) =>
                                    setFormVal("description", e.target.value)
                                  }
                                />
                              </Field>

                              <Field
                                label="Applications"
                                required
                                hint="Add one by one"
                              >
                                <div className="flex gap-2 mb-2">
                                  <input
                                    className={inputCls}
                                    placeholder="Type application name..."
                                    value={form.customApplications}
                                    onChange={(e) =>
                                      setFormVal(
                                        "customApplications",
                                        e.target.value,
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        addApp(form.customApplications);
                                        setFormVal("customApplications", "");
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addApp(form.customApplications);
                                      setFormVal("customApplications", "");
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>

                                {form.applications.length > 0 && (
                                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl">
                                    {form.applications.map((a) => (
                                      <span
                                        key={a}
                                        className="inline-flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20 font-medium"
                                      >
                                        {a}
                                        <button
                                          onClick={() => removeApp(a)}
                                          className="hover:text-red-500"
                                        >
                                          <X size={12} />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </Field>
                            </div>
                          )}

                          {/* Step 4: Preview */}
                          {formStep === 4 && (
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <Tag size={18} className="text-accent" />
                                <h3 className="font-syne font-bold text-lg text-ink">
                                  Preview Listing
                                </h3>
                              </div>
                              <p className="text-xs text-slate-400 mb-5">
                                This is how the product will appear to buyers.
                                Review and submit.
                              </p>

                              <div className="bg-slate-50 rounded-2xl p-5 mb-5">
                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                  {[
                                    ["Name", form.name],
                                    [
                                      "Category",
                                      `${form.category === "Other" ? form.customCategory : categories.find((c) => c.id == form.category)?.name || "—"} / ${form.subcategory === "Other" ? form.customSubcategory : subCategories.find((s) => s.id == form.subcategory)?.name || "—"}`,
                                    ],
                                    ["Thickness", form.thickness || "—"],
                                    ["Width", form.width || "—"],
                                    ["Color", form.color || "—"],
                                    ["Type", form.type || "—"],
                                    [
                                      "Price Range",
                                      `₹${form.minPrice || "—"} to ₹${form.maxPrice || "—"}`,
                                    ],
                                    [
                                      "Min Order",
                                      form.minOrder
                                        ? `${form.minOrder} kg`
                                        : "—",
                                    ],
                                    [
                                      "Stock",
                                      form.stock ? `${form.stock} kg` : "—",
                                    ],
                                    [
                                      "Delivery",
                                      form.delivery_days
                                        ? `${form.delivery_days} hours`
                                        : "—",
                                    ],
                                  ].map(([l, v]) => (
                                    <div key={l}>
                                      <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">
                                        {l}
                                      </div>
                                      <div className="font-semibold text-ink text-sm">
                                        {v}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Navigation */}
                          <div className="flex justify-between mt-8 pt-6 border-t border-black/[0.06]">
                            {formStep > 0 ? (
                              <button
                                onClick={() => setFormStep((s) => s - 1)}
                                className="px-5 py-3 rounded-xl border border-black/15 text-sm font-medium text-ink hover:bg-slate-50 transition-colors flex items-center gap-2"
                              >
                                <ChevronLeft size={14} /> Back
                              </button>
                            ) : (
                              <div />
                            )}
                            {formStep < 4 ? (
                              <button
                                onClick={() => {
                                  if (formStep === 0 && !selectedSeller)
                                    return notifyError(
                                      "Please select a seller",
                                    );
                                  if (formStep === 1) {
                                    if (!form.name)
                                      return notifyError(
                                        "Product name is required",
                                      );
                                    if (!form.category)
                                      return notifyError(
                                        "Category is required",
                                      );
                                    if (!form.subcategory)
                                      return notifyError(
                                        "Subcategory is required",
                                      );
                                  }
                                  if (formStep === 2) {
                                    if (
                                      !form.thickness ||
                                      !form.width ||
                                      !form.minPrice ||
                                      !form.maxPrice ||
                                      !form.stock ||
                                      !form.minOrder ||
                                      !form.img ||
                                      !form.payment_terms ||
                                      !form.delivery_days
                                    ) {
                                      return notifyError(
                                        "All spec fields are required",
                                      );
                                    }
                                  }
                                  if (formStep === 3) {
                                    if (!form.description)
                                      return notifyError(
                                        "Description is required",
                                      );
                                    if (form.applications.length === 0)
                                      return notifyError(
                                        "Add at least one application",
                                      );
                                  }
                                  setFormStep((s) => s + 1);
                                }}
                                className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                              >
                                Next <ChevronRight size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={handleCreateProductByAdmin}
                                className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                              >
                                <CheckCircle2 size={16} /> Submit Listing
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Live Preview */}
                      <div className="lg:col-span-1 mt-8 lg:mt-0">
                        <div className="sticky top-6">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Live Preview
                          </p>
                          <PreviewCard />
                          <p className="text-[11px] text-slate-400 text-center mt-3">
                            Updates as you fill the form
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "add-seller" && (
              <div className="max-w-3xl mx-auto pb-20">
                <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden animate-fadeIn">
                  {/* Phase Indicator */}
                  <div className="relative px-20 pt-12 pb-6">
                    <div className="absolute top-[4.2rem] left-28 right-28 h-[2px] bg-slate-100 -z-10" />
                    <div
                      className="absolute top-[4.2rem] left-28 h-[2px] bg-accent transition-all duration-500 ease-in-out -z-10"
                      style={{
                        width: `${((sellerPhase - 1) / (2 - 1)) * (100 - 45)}%`,
                      }}
                    />

                    <div className="flex justify-between items-start">
                      {[
                        {
                          num: 1,
                          label: "Personal Info",
                          icon: <User size={14} />,
                        },
                        {
                          num: 2,
                          label: "Business Profile",
                          icon: <Building2 size={14} />,
                        },
                      ].map((p, i) => {
                        const isActive = p.num === sellerPhase;
                        const isCompleted = sellerPhase > p.num;

                        return (
                          <div
                            key={p.num}
                            className="flex flex-col items-center group"
                          >
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 ${
                                isActive
                                  ? "bg-accent border-white shadow-xl shadow-accent/20 scale-110"
                                  : isCompleted
                                    ? "bg-green-500 border-white shadow-lg shadow-green-100"
                                    : "bg-white border-slate-50 shadow-sm"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-white"
                                />
                              ) : (
                                <div
                                  className={
                                    isActive ? "text-white" : "text-slate-300"
                                  }
                                >
                                  {p.icon}
                                </div>
                              )}
                            </div>
                            <span
                              className={`mt-3 text-[9px] font-black uppercase tracking-[2px] transition-all duration-300 ${
                                isActive ? "text-ink" : "text-slate-300"
                              }`}
                            >
                              {p.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-8 sm:p-12 overflow-hidden">
                    {sellerPhase === 1 && (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-syne font-black text-2xl text-ink uppercase">
                              Identity Details
                            </h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                              Setup administrative access for the seller
                            </p>
                          </div>
                          <LockKeyhole className="text-accent/20" size={40} />
                        </div>

                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 grid grid-cols-1 gap-6 relative overflow-hidden">
                          <div className="absolute bottom-0 right-0 p-4 opacity-[0.03] rotate-12">
                            <User size={120} />
                          </div>
                          <Field label="Owner Name" required>
                            <div className="relative">
                              <User
                                size={16}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                              />
                              <input
                                className={
                                  inputCls + " pl-14 bg-white shadow-sm"
                                }
                                placeholder="Full Legal Name"
                                value={sellerForm.ownerName}
                                onChange={(e) =>
                                  setSellerVal("ownerName", e.target.value)
                                }
                              />
                            </div>
                          </Field>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                            <Field label="Email (Login ID)" required>
                              <div className="relative">
                                <Mail
                                  size={16}
                                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                                />
                                <input
                                  className={
                                    inputCls + " pl-14 bg-white shadow-sm"
                                  }
                                  placeholder="email@example.com"
                                  value={sellerForm.email}
                                  onChange={(e) =>
                                    setSellerVal("email", e.target.value)
                                  }
                                />
                              </div>
                            </Field>
                            <Field label="Mobile Number" required>
                              <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm">
                                  +91
                                </span>
                                <input
                                  className={
                                    inputCls + " pl-14 bg-white shadow-sm"
                                  }
                                  placeholder="Mobile Number"
                                  maxLength={10}
                                  value={sellerForm.mobile}
                                  onChange={(e) =>
                                    setSellerVal(
                                      "mobile",
                                      e.target.value.replace(/\D/g, ""),
                                    )
                                  }
                                />
                              </div>
                            </Field>
                          </div>
                        </div>

                        <div className="p-8 bg-ink rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={18} className="text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Portal Access Credentials
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="System Password" required>
                              <div className="relative overflow-hidden group">
                                <Lock
                                  size={16}
                                  className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
                                />
                                <input
                                  type={showPw ? "text" : "password"}
                                  className={
                                    inputCls +
                                    " pl-14 pr-12 bg-white/5 border-white/10 text-white focus:bg-white/10"
                                  }
                                  placeholder="Set password"
                                  value={sellerForm.password}
                                  onChange={(e) =>
                                    setSellerVal("password", e.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPw(!showPw)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-accent transition-colors"
                                >
                                  {showPw ? (
                                    <EyeOff size={16} />
                                  ) : (
                                    <Eye size={16} />
                                  )}
                                </button>
                              </div>
                            </Field>
                            <Field label="Verify Password" required>
                              <div className="relative overflow-hidden group">
                                <Lock
                                  size={16}
                                  className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
                                />
                                <input
                                  type={showConfirm ? "text" : "password"}
                                  className={
                                    inputCls +
                                    " pl-14 pr-12 bg-white/5 border-white/10 text-white focus:bg-white/10"
                                  }
                                  placeholder="Repeat password"
                                  value={sellerForm.confirmPassword}
                                  onChange={(e) =>
                                    setSellerVal(
                                      "confirmPassword",
                                      e.target.value,
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirm(!showConfirm)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-accent transition-colors"
                                >
                                  {showConfirm ? (
                                    <EyeOff size={16} />
                                  ) : (
                                    <Eye size={16} />
                                  )}
                                </button>
                              </div>
                            </Field>
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                            onClick={() => {
                              if (!sellerForm.ownerName)
                                return notifyError("Name required");
                              if (!sellerForm.email)
                                return notifyError("Email required");
                              if (
                                !sellerForm.mobile ||
                                sellerForm.mobile.length < 10
                              )
                                return notifyError("Valid Mobile required");
                              if (
                                !sellerForm.password ||
                                sellerForm.password.length < 6
                              )
                                return notifyError("Password min 6 chars");
                              if (
                                sellerForm.password !==
                                sellerForm.confirmPassword
                              )
                                return notifyError("Passwords mismatch");
                              setSellerPhase(2);
                            }}
                            className="w-full py-5 bg-accent text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[2px] shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 transition-all"
                          >
                            Proceed to Business Assets{" "}
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    )}

                    {sellerPhase === 2 && (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-syne font-black text-2xl text-ink uppercase">
                              Business Assets
                            </h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                              Official registered profile details
                            </p>
                          </div>
                          <Building2 className="text-accent/20" size={40} />
                        </div>

                        {/* Basic Business Info */}
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                            <Store size={100} />
                          </div>
                          <Field label="Company / Business Name" required>
                            <input
                              className={
                                inputCls +
                                " bg-white shadow-sm font-black uppercase text-xs tracking-tight"
                              }
                              placeholder="e.g. Packaging Bazaar PVT LTD"
                              value={sellerForm.companyName}
                              onChange={(e) =>
                                setSellerVal("companyName", e.target.value)
                              }
                            />
                          </Field>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Business Type">
                              <select
                                className={inputCls + " shadow-sm bg-white"}
                                value={sellerForm.businessType}
                                onChange={(e) =>
                                  setSellerVal("businessType", e.target.value)
                                }
                              >
                                <option value="Manufacturer">
                                  Manufacturer
                                </option>
                                <option value="Trader">Trader</option>
                                <option value="Stockist">Stockist</option>
                                <option value="Converter">Converter</option>
                              </select>
                            </Field>
                            <Field label="Year Established">
                              <input
                                className={inputCls + " shadow-sm bg-white"}
                                type="number"
                                placeholder="e.g. 2010"
                                value={sellerForm.yearEstablished}
                                onChange={(e) =>
                                  setSellerVal(
                                    "yearEstablished",
                                    e.target.value,
                                  )
                                }
                              />
                            </Field>
                          </div>
                        </div>

                        {/* Documentation & Taxation */}
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-100/50 flex flex-col gap-6">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                              <FileText size={14} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              Documentation
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="GST Number">
                              <input
                                className={
                                  inputCls +
                                  " bg-slate-50 border-slate-100 font-black tracking-[2px]"
                                }
                                maxLength={15}
                                placeholder="15-DIGIT GST"
                                value={sellerForm.gstNumber}
                                onChange={(e) =>
                                  setSellerVal(
                                    "gstNumber",
                                    e.target.value.toUpperCase(),
                                  )
                                }
                              />
                            </Field>
                            <Field label="Business Bio">
                              <textarea
                                className={
                                  inputCls +
                                  " bg-slate-50 border-slate-100 h-14 resize-none py-4 pt-4"
                                }
                                placeholder="Brief specialty..."
                                value={sellerForm.description}
                                onChange={(e) =>
                                  setSellerVal("description", e.target.value)
                                }
                              />
                            </Field>
                          </div>
                          <div className="relative group/file">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleSellerFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                              className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all ${sellerForm.gstCertificate ? "border-green-300 bg-green-50/20" : "border-slate-100 bg-slate-50/50 group-hover/file:border-accent/40"}`}
                            >
                              {sellerForm.gstCertificate ? (
                                <>
                                  <div className="w-14 h-14 bg-green-100 rounded-[1.25rem] flex items-center justify-center text-green-600 shadow-sm">
                                    <FileText size={28} />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest truncate max-w-[250px] mb-1">
                                      {sellerForm.gstCertificate.name}
                                    </p>
                                    <span className="text-[8px] font-bold text-green-600 bg-white px-2 py-0.5 rounded-md shadow-sm border border-green-100">
                                      Click to replace document
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center text-slate-200 group-hover/file:text-accent group-hover/file:bg-accent/5 transition-all shadow-sm">
                                    <UploadCloud size={28} />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 group-hover/file:text-slate-600 uppercase tracking-[2px] mb-1">
                                      Secure Upload: GST Certificate
                                    </p>
                                    <p className="text-[9px] text-slate-300 font-medium tracking-tight">
                                      PDF, JPG, or PNG preferred (Max 5MB)
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Logistics & HQ Location */}
                        <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden">
                          <div className="absolute -bottom-10 -left-10 p-8 opacity-[0.03]">
                            <MapPin size={180} />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-accent">
                              <Globe size={14} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              Base Operations
                            </span>
                          </div>

                          <Field
                            label="Postal Pincode"
                            required
                            hint="Verification Required"
                          >
                            <div className="relative">
                              <Search
                                size={16}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                              />
                              <input
                                className={
                                  inputCls +
                                  " pl-14 pr-12 bg-white " +
                                  (pincodeStatus === "valid"
                                    ? "border-green-400 ring-2 ring-green-400/10"
                                    : pincodeStatus === "invalid"
                                      ? "border-red-400 ring-2 ring-red-400/10"
                                      : "border-slate-100 shadow-sm")
                                }
                                maxLength={6}
                                placeholder="e.g. 395006"
                                value={sellerForm.pincode}
                                onChange={(e) =>
                                  handleSellerPincodeChange(e.target.value)
                                }
                              />
                              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {pincodeStatus === "loading" && (
                                  <RefreshCcw
                                    className="animate-spin text-accent"
                                    size={18}
                                  />
                                )}
                                {pincodeStatus === "valid" && (
                                  <CheckCircle2
                                    className="text-green-500"
                                    size={18}
                                  />
                                )}
                                {pincodeStatus === "invalid" && (
                                  <AlertCircle
                                    className="text-red-500"
                                    size={18}
                                  />
                                )}
                              </div>
                            </div>
                          </Field>

                          <div className="grid grid-cols-2 gap-4">
                            <Field label="City">
                              <input
                                className={
                                  inputCls +
                                  " bg-slate-100/50 cursor-not-allowed border-0 text-slate-400 font-bold"
                                }
                                value={sellerForm.city}
                                readOnly
                                disabled
                                placeholder="Auto-fill city"
                              />
                            </Field>
                            <Field label="State">
                              <input
                                className={
                                  inputCls +
                                  " bg-slate-100/50 cursor-not-allowed border-0 text-slate-400 font-bold"
                                }
                                value={sellerForm.state}
                                readOnly
                                disabled
                                placeholder="Auto-fill state"
                              />
                            </Field>
                          </div>

                          <Field label="HQ Street Address" required>
                            <textarea
                              className={
                                pincodeStatus === "valid"
                                  ? inputCls +
                                    " h-24 resize-none border-slate-100 bg-white shadow-sm py-4"
                                  : inputCls +
                                    " h-24 resize-none bg-slate-100/50 cursor-not-allowed border-0 py-4 opacity-50"
                              }
                              value={sellerForm.businessAddress}
                              disabled={pincodeStatus !== "valid"}
                              onChange={(e) =>
                                setSellerVal("businessAddress", e.target.value)
                              }
                              placeholder={
                                pincodeStatus !== "valid"
                                  ? "Verify Pincode to Unlock..."
                                  : "Complete street, block, and landmark details"
                              }
                            />
                          </Field>
                        </div>

                        <div className="flex gap-4 pt-8">
                          <button
                            onClick={() => setSellerPhase(1)}
                            className="px-10 py-5 rounded-[1.5rem] border border-slate-100 bg-white font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-ink hover:border-slate-300 transition-all shadow-sm flex items-center gap-3"
                          >
                            <ChevronLeft size={16} /> Identity
                          </button>
                          <button
                            onClick={handleCreateSellerByAdmin}
                            disabled={loading}
                            className="flex-1 py-5 bg-ink text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[2px] shadow-2xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <RefreshCcw size={16} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                            {loading
                              ? "Registering Assets..."
                              : "Complete Business Onboarding"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedEntity && (
        <SubViewOverlay
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          notifyError={notifyError}
        />
      )}

      {statusModal.isOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div
            onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-lg w-full">
            <h3 className="text-2xl font-black font-syne mb-6">
              Status Update
            </h3>
            <textarea
              value={statusModal.message}
              onChange={(e) =>
                setStatusModal({ ...statusModal, message: e.target.value })
              }
              className={inputCls + " h-32"}
              placeholder="Enter message..."
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleStatusUpdate}
                className="flex-1 px-8 py-4 bg-ink text-white rounded-2xl font-black uppercase text-xs"
              >
                Update & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewGroupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            onClick={() => setShowNewGroupModal(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-md w-full">
            <h3 className="font-syne font-black text-xl mb-6">
              New Product Group
            </h3>
            <Field label="Group Name" required>
              <input
                className={inputCls}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </Field>
            <button
              onClick={handleCreateGroup}
              className="w-full mt-6 py-4 bg-accent text-white rounded-2xl font-black uppercase text-xs"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {editSellerModal.isOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div
            onClick={() =>
              setEditSellerModal({ ...editSellerModal, isOpen: false })
            }
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <Settings size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black font-syne uppercase tracking-tighter text-ink">
                    Edit Seller Profile
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Modify owner and business information
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setEditSellerModal({ ...editSellerModal, isOpen: false })
                }
                className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-10">
              <div className="space-y-6">
                <p className="text-xs font-black text-accent uppercase tracking-[2px] flex items-center gap-2 mb-4">
                  <User size={14} /> Personal Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Owner Name" required>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        className={inputCls + " pl-11"}
                        value={editSellerModal.form.ownerName}
                        onChange={(e) =>
                          setEditVal("ownerName", e.target.value)
                        }
                      />
                    </div>
                  </Field>
                  <Field label="Email (Login ID)" required>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        className={inputCls + " pl-11"}
                        value={editSellerModal.form.email}
                        onChange={(e) => setEditVal("email", e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field label="Mobile Number" required>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">
                        +91
                      </span>
                      <input
                        className={inputCls + " pl-12"}
                        maxLength={10}
                        value={editSellerModal.form.mobile}
                        onChange={(e) =>
                          setEditVal(
                            "mobile",
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <div className="h-[1px] bg-gray-100" />

              <div className="space-y-6">
                <p className="text-xs font-black text-accent uppercase tracking-[2px] flex items-center gap-2 mb-4">
                  <Building2 size={14} /> Business Profile
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Company Name" required>
                    <input
                      className={inputCls}
                      value={editSellerModal.form.companyName}
                      onChange={(e) =>
                        setEditVal("companyName", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Business Type">
                    <select
                      className={inputCls}
                      value={editSellerModal.form.businessType}
                      onChange={(e) =>
                        setEditVal("businessType", e.target.value)
                      }
                    >
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Trader">Trader</option>
                      <option value="Stockist">Stockist</option>
                      <option value="Converter">Converter</option>
                    </select>
                  </Field>
                  <Field label="GST Number">
                    <input
                      className={inputCls}
                      maxLength={15}
                      value={editSellerModal.form.gstNumber}
                      onChange={(e) =>
                        setEditVal("gstNumber", e.target.value.toUpperCase())
                      }
                    />
                  </Field>
                  <Field label="Year Established">
                    <input
                      className={inputCls}
                      type="number"
                      value={editSellerModal.form.yearEstablished}
                      onChange={(e) =>
                        setEditVal("yearEstablished", e.target.value)
                      }
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Business Description">
                      <textarea
                        className={inputCls + " h-24 resize-none"}
                        value={editSellerModal.form.description}
                        onChange={(e) =>
                          setEditVal("description", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                  <Field
                    label="GST Certificate"
                    hint={
                      editSellerModal.form.existingGstCertificate
                        ? "Current file exists. Upload to replace."
                        : "No certificate uploaded"
                    }
                  >
                    <div className="relative group/file">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setEditVal("gstCertificate", file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className={`p-4 border-2 border-dashed rounded-xl flex items-center gap-3 transition-all ${editSellerModal.form.gstCertificate ? "border-green-300 bg-green-50/50" : "border-gray-200 bg-slate-50/50"}`}
                      >
                        {editSellerModal.form.gstCertificate ? (
                          <CheckCircle2 className="text-green-500" size={20} />
                        ) : (
                          <FileText className="text-gray-400" size={20} />
                        )}
                        <div>
                          <p className="text-[10px] font-black text-gray-600 truncate max-w-[200px]">
                            {editSellerModal.form.gstCertificate
                              ? editSellerModal.form.gstCertificate.name
                              : "Choose new file..."}
                          </p>
                          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                            PDF, JPG, PNG (Max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </Field>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border border-gray-100 rounded-[2.5rem] space-y-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] flex items-center gap-2">
                  <MapPin size={14} /> Location Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Pincode" required hint="6-digit Indian pincode">
                    <div className="relative">
                      <Search
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        className={
                          inputCls +
                          " pl-11 pr-12 " +
                          (editPincodeStatus === "valid"
                            ? "border-green-400 bg-green-50/30 focus:border-green-400"
                            : editPincodeStatus === "invalid"
                              ? "border-red-400 bg-red-50/30 focus:border-red-400"
                              : "")
                        }
                        maxLength={6}
                        placeholder="e.g. 395006"
                        value={editSellerModal.form.pincode}
                        onChange={(e) =>
                          handleEditPincodeChange(e.target.value)
                        }
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {editPincodeStatus === "loading" && (
                          <RefreshCcw
                            className="animate-spin text-accent"
                            size={16}
                          />
                        )}
                        {editPincodeStatus === "valid" && (
                          <CheckCircle2 className="text-green-500" size={16} />
                        )}
                        {editPincodeStatus === "invalid" && (
                          <AlertCircle className="text-red-500" size={16} />
                        )}
                      </div>
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City">
                      <input
                        className={inputCls + " bg-gray-100/50"}
                        readOnly
                        disabled
                        value={editSellerModal.form.city}
                      />
                    </Field>
                    <Field label="State">
                      <input
                        className={inputCls + " bg-gray-100/50"}
                        readOnly
                        disabled
                        value={editSellerModal.form.state}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Full Address" required>
                      <textarea
                        className={
                          editPincodeStatus === "valid"
                            ? inputCls + " h-24 resize-none border-green-200"
                            : inputCls +
                              " h-24 resize-none bg-gray-100/50 cursor-not-allowed"
                        }
                        value={editSellerModal.form.businessAddress}
                        disabled={editPincodeStatus !== "valid"}
                        onChange={(e) =>
                          setEditVal("businessAddress", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50 flex gap-4">
              <button
                onClick={() =>
                  setEditSellerModal({ ...editSellerModal, isOpen: false })
                }
                className="flex-1 py-4 border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-500 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSeller}
                disabled={loading}
                className="flex-[2] py-4 bg-ink text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-black/10 hover:translate-y-[-2px] transition-all disabled:opacity-50"
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
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
        if (entity.type === "seller" && entity.mode === "orders") {
          res = await fetchSellerOrdersAdmin(entity.id);
          setItems(res.orders || []);
        } else if (entity.type === "seller" && entity.mode === "products") {
          res = await fetchSellerProductsAdmin(entity.id);
          setItems(res.products || []);
        } else if (entity.type === "lead" && entity.mode === "lead-matching") {
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
      <div onClick={onClose} className="absolute inset-0" />
      <div className="relative bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {entity.name}
          </h2>
          <button onClick={onClose} className="p-3 bg-white border rounded-2xl">
            <XCircle />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCcw className="animate-spin mx-auto text-accent" />
            </div>
          ) : (
            <div className="space-y-4">
              {entity.mode === "products" &&
                items.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-2xl border flex items-center justify-center overflow-hidden">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-syne font-black text-gray-900 uppercase tracking-tight">
                          {prod.name}
                        </h4>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-0.5 rounded-lg border border-black/[0.03]">
                            {prod.thickness}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-0.5 rounded-lg border border-black/[0.03]">
                            {prod.width}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-8 text-right">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                          Price Range
                        </p>
                        <p className="text-xs font-black text-gray-900">
                          ₹{prod.price_min}-{prod.price_max}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                          In Stock
                        </p>
                        <p
                          className={`text-xs font-black ${prod.stock_qty > 0 ? "text-green-600" : "text-red-500"}`}
                        >
                          {prod.stock_qty} kg
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              {entity.mode === "orders" &&
                items.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl border flex items-center justify-center text-accent">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <h4 className="font-syne font-black text-gray-900 uppercase tracking-tight">
                          #{order.id.toString().padStart(5, "0")}
                        </h4>
                        <p className="text-xs font-bold text-gray-400">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-8 text-right">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                          Value
                        </p>
                        <p className="text-sm font-black text-accent">
                          ₹{order.total_price}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                          Status
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {entity.mode === "lead-matching" &&
                items.map((seller, idx) => (
                  <div
                    key={seller.id}
                    className={`p-8 rounded-[2.5rem] border transition-all shadow-sm ${idx === 0 ? "bg-orange-50/50 border-accent/30 shadow-orange-100" : "bg-white border-gray-100"}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-syne font-black text-gray-900 text-xl uppercase tracking-tighter">
                            {seller.company_name}
                          </h4>
                          {idx === 0 && (
                            <span className="bg-accent text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                              Best Match 🥇
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6">
                          <MapPin size={14} className="text-accent" />{" "}
                          {seller.city}, {seller.state}
                        </div>

                        {/* Match Breakdown - Phase 3 */}
                        <div className="bg-white/80 rounded-3xl p-6 border border-black/[0.03] space-y-3">
                          <p className="text-[10px] font-black text-ink uppercase tracking-widest mb-4 flex items-center justify-between">
                            Match Breakdown
                            <span className="text-accent">
                              {seller.match_score} / 420 PTS
                            </span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            <MatchItem
                              label="Pincode Match"
                              score={
                                seller.pincode === entity.pincode ? 200 : 0
                              }
                              max={200}
                            />
                            <MatchItem
                              label="Category Fit"
                              score={30}
                              max={30}
                            />
                            <MatchItem
                              label="Stock Sufficient"
                              score={seller.has_stock ? 50 : 0}
                              max={50}
                              status={seller.has_stock}
                            />
                            <MatchItem
                              label="MOQ Awareness"
                              score={seller.moq_fit ? 40 : 0}
                              max={40}
                              status={seller.moq_fit}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <a
                          href={`tel:${seller.phone}`}
                          className="w-full px-8 py-4 bg-ink text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10"
                        >
                          <Phone size={14} /> Call Seller
                        </a>
                        <button className="w-full px-8 py-4 bg-white border border-gray-100 text-ink rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                          <Zap size={14} /> Notify WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchItem({ label, score, max, status }) {
  const isZero = score === 0;
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-[11px] font-bold ${isZero ? "text-gray-300" : "text-gray-600"}`}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        {status !== undefined &&
          (status ? (
            <CheckCircle2 size={12} className="text-green-500" />
          ) : (
            <XCircle size={12} className="text-red-400" />
          ))}
        <span
          className={`text-[10px] font-black ${isZero ? "text-gray-300 line-through" : "text-accent"}`}
        >
          +{score}
        </span>
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
