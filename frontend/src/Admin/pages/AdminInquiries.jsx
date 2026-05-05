import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  Zap,
  RefreshCcw,
  MessageCircle,
  Save,
  Filter,
  Share2,
  Send
} from "lucide-react";
import { fetchInquiriesAdmin, updateInquiryAdmin, shareLeadWithSellerAdmin } from "../../services/adminServices";
import { useNotification } from "../../context/NotificationContext";
import Pagination from "../../components/ui/Pagination";
import SubViewOverlay from "../components/SubViewOverlay";

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    product: "",
    seller: ""
  });
  const { notifyError, notifySuccess } = useNotification();

  // Get unique lists for filters
  const productNames = [...new Set(inquiries.map(i => i.product_name))].filter(Boolean);
  const sellerNames = [...new Set(inquiries.map(i => i.seller_name))].filter(Boolean);

  useEffect(() => {
    loadInquiries(1);
  }, []);

  const loadInquiries = async (page) => {
    setLoading(true);
    try {
      const res = await fetchInquiriesAdmin(page);
      if (res.success) {
        setInquiries(res.inquiries);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || 1);
      }
    } catch (err) {
      notifyError("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    const s = search.toLowerCase();
    const matchesSearch = (
      item.buyer_display_name?.toLowerCase().includes(s) ||
      item.product_name?.toLowerCase().includes(s) ||
      item.seller_name?.toLowerCase().includes(s)
    );

    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesProduct = !filters.product || item.product_name === filters.product;
    const matchesSeller = !filters.seller || item.seller_name === filters.seller;

    return matchesSearch && matchesStatus && matchesProduct && matchesSeller;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateInquiryAdmin(id, { status: newStatus });
      if (res.success) {
        notifySuccess("Status updated!");
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      }
    } catch (err) {
      notifyError("Failed to update status");
    }
  };

  const handleNotesChange = async (id, notes) => {
    try {
      const res = await updateInquiryAdmin(id, { admin_notes: notes });
      if (res.success) {
        notifySuccess("Notes saved!");
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, admin_notes: notes } : i));
      }
    } catch (err) {
      notifyError("Failed to save notes");
    }
  };

  const handleShareWithSeller = async (inquiry) => {
    if (window.confirm(`Share this lead with ${inquiry.seller_name}? It will appear in their dashboard.`)) {
      try {
        const res = await shareLeadWithSellerAdmin(inquiry.id);
        if (res.success) {
          notifySuccess("Lead shared with seller!");
          setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, is_assigned: 1 } : i));
        }
      } catch (err) {
        notifyError("Failed to share lead");
      }
    }
  };

  const handleWhatsAppForward = (inquiry) => {
    const lines = [
      `🔔 *New Lead Alert from PackagingBazaar!*`,
      ``,
      `📦 *Product:* ${inquiry.product_name}`,
      inquiry.quantity_required ? `📊 *Quantity:* ${inquiry.quantity_required}` : null,
      inquiry.thickness         ? `📏 *Thickness (Micron):* ${inquiry.thickness}` : null,
      inquiry.width             ? `📐 *Width:* ${inquiry.width}` : null,
      ``,
      // `👤 *Buyer:* ${inquiry.buyer_display_name}`,
      // `📞 *Mobile:* ${inquiry.buyer_display_mobile}`,
      ``,
      `📍 *Buyer Location:*`,
      inquiry.city    ? `   • City: ${inquiry.city}` : null,
      inquiry.state   ? `   • State: ${inquiry.state}` : null,
      inquiry.pincode ? `   • Pincode: ${inquiry.pincode}` : null,
      inquiry.address ? `   • Address: ${inquiry.address}` : null,
      inquiry.message ? `\n💬 *Requirement:* ${inquiry.message}` : null,
      ``,
      `— PackagingBazaar Admin`
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
  };

  if (loading && inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 min-h-[400px]">
        <RefreshCcw className="animate-spin text-accent mb-4" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <h1 className="font-syne font-black text-3xl text-gray-900 uppercase tracking-tight">
              Business Leads
            </h1>
          </div>
          <p className="text-gray-500 text-sm font-medium">Tracking all buyer inquiries and procurement requests.</p>
        </div>
      </div>

      {/* Filter & Search Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full mb-8">
        {/* Filters on Left */}
        <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm">
          <div className="pl-3 pr-1 text-gray-400">
            <Filter size={16} />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-transparent border-none text-[11px] font-bold text-gray-600 outline-none py-2 pr-4 cursor-pointer"
          >
            <option value="">Any Status</option>
            <option value="pending">New/Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Negotiating">Negotiating</option>
            <option value="Closed">Closed</option>
            <option value="Lost">Lost</option>
          </select>
          <div className="w-px h-4 bg-gray-100" />
          <select
            value={filters.product}
            onChange={(e) => setFilters({ ...filters, product: e.target.value })}
            className="bg-transparent border-none text-[11px] font-bold text-gray-600 outline-none py-2 pr-4 cursor-pointer"
          >
            <option value="">All Products</option>
            {productNames.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="w-px h-4 bg-gray-100" />
          <select
            value={filters.seller}
            onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
            className="bg-transparent border-none text-[11px] font-bold text-gray-600 outline-none py-2 pr-4 cursor-pointer"
          >
            <option value="">All Sellers</option>
            {sellerNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {(filters.status || filters.product || filters.seller) && (
            <button 
              onClick={() => setFilters({ status: "", product: "", seller: "" })}
              className="text-[10px] font-black uppercase text-accent hover:underline px-3 border-l border-gray-100"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search on Right */}
        <div className="relative group w-full xl:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm w-full outline-none focus:border-accent shadow-sm"
          />
        </div>
      </div>

      {/* Content: Card Grid */}
      <div className="space-y-6">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-gray-100 py-32 text-center shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-gray-200">
                <TrendingUp size={40} />
              </div>
              <div>
                <h3 className="font-syne font-black text-xl text-gray-300 uppercase tracking-wide">No Inquiries Found</h3>
                <p className="text-gray-400 text-xs font-medium">Try adjusting your filters or search terms.</p>
              </div>
            </div>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div 
              key={inquiry.id} 
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group"
            >
              {/* Lead ID Badge */}
              <div className="absolute top-0 right-0 bg-slate-50/80 backdrop-blur-sm px-6 py-2.5 rounded-bl-[2rem] border-b border-l border-gray-100/50 flex items-center gap-3 group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Lead ID</span>
                <span className="text-sm font-syne font-black tracking-tight">#LID-{inquiry.id}</span>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  {/* Left Section: Buyer & Status */}
                  <div className="xl:col-span-3 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <h3 className="font-syne font-black text-xl text-gray-900 leading-tight uppercase tracking-tight">
                          {inquiry.buyer_display_name}
                        </h3>
                      </div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-4">
                        {new Date(inquiry.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="pl-4">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Process Status</label>
                      <select 
                        value={inquiry.status || 'pending'}
                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                        className={`w-full text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-2xl border outline-none transition-all cursor-pointer ${
                          inquiry.status === 'Closed' ? 'bg-green-50 border-green-100 text-green-600' :
                          inquiry.status === 'Lost' ? 'bg-red-50 border-red-100 text-red-600' :
                          inquiry.status === 'pending' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                          'bg-blue-50 border-blue-100 text-blue-600'
                        }`}
                      >
                        <option value="pending">New/Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Negotiating">Negotiating</option>
                        <option value="Closed">Deal Closed</option>
                        <option value="Lost">Deal Lost</option>
                      </select>
                    </div>
                  </div>

                  {/* Middle Section: Requirements */}
                  <div className="xl:col-span-3 border-l border-gray-50 pl-10 space-y-5">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Requirement</span>
                      <h4 className="text-base font-bold text-gray-800 leading-snug line-clamp-2">
                        {inquiry.product_name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {inquiry.quantity_required && inquiry.quantity_required !== 'Not specified' && (
                        <div className="bg-black text-white px-3 py-1.5 rounded-xl flex flex-col items-center">
                          <span className="text-[7px] font-black uppercase opacity-60">Quantity</span>
                          <span className="text-[11px] font-black">{inquiry.quantity_required}</span>
                        </div>
                      )}
                      {inquiry.thickness && (
                        <div className="bg-slate-50 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-100 flex flex-col items-center">
                          <span className="text-[7px] font-black uppercase opacity-60">Thickness</span>
                          <span className="text-[11px] font-black">{inquiry.thickness}</span>
                        </div>
                      )}
                      {inquiry.width && (
                        <div className="bg-slate-50 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-100 flex flex-col items-center">
                          <span className="text-[7px] font-black uppercase opacity-60">Width</span>
                          <span className="text-[11px] font-black">{inquiry.width}</span>
                        </div>
                      )}
                    </div>

                    {inquiry.message && (
                      <div className="bg-slate-50/50 p-4 rounded-[1.5rem] border border-gray-50 italic text-gray-500 text-xs leading-relaxed relative">
                        <MessageCircle size={14} className="absolute -top-1.5 -left-1.5 text-accent/20" />
                        "{inquiry.message}"
                      </div>
                    )}
                  </div>

                  {/* Right Section: Contact & Location */}
                  <div className="xl:col-span-3 border-l border-gray-50 pl-10 space-y-6">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contact Info</span>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-700">{inquiry.buyer_display_mobile}</p>
                        <p className="text-[11px] font-medium text-gray-400 lowercase">{inquiry.buyer_display_email}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Location</span>
                      <p className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">
                        {inquiry.city}, {inquiry.state}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">Pincode: {inquiry.pincode || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="xl:col-span-3 flex flex-col items-center xl:items-end justify-center gap-2 pl-0 xl:pl-10 xl:border-l border-gray-50">
                    <button 
                      onClick={() => setSelectedLead({ 
                        type: "lead", 
                        id: inquiry.id, 
                        name: `MATCHING FOR: ${inquiry.product_name}`, 
                        mode: "lead-matching",
                        pincode: inquiry.pincode,
                        inquiryData: inquiry
                      })}
                      className="w-full min-w-[160px] flex items-center justify-center gap-2 py-2.5 bg-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-md group/zap"
                    >
                      <Zap size={14} className="group-hover/zap:animate-bounce" />
                      <span className="whitespace-nowrap">Smart Match</span>
                    </button>

                    <button 
                      onClick={() => handleWhatsAppForward(inquiry)}
                      className="w-full min-w-[160px] flex items-center justify-center gap-2 py-2.5 bg-white text-green-600 border-2 border-green-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-50 transition-all shadow-sm"
                    >
                      <Send size={14} />
                      <span className="whitespace-nowrap">WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Footer Section: Admin Notes (Condensed) */}
                <div className="mt-5 pt-4 border-t border-gray-50 flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 w-full flex items-center gap-3">
                    <div className="bg-slate-50 px-3 py-1 rounded-lg border border-gray-100 shrink-0">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Note</span>
                    </div>
                    <textarea 
                      defaultValue={inquiry.admin_notes || ""}
                      onBlur={(e) => handleNotesChange(inquiry.id, e.target.value)}
                      placeholder="Add private note..."
                      className="flex-1 text-[11px] font-medium text-gray-600 px-4 py-1.5 rounded-xl border border-gray-100 bg-slate-50/20 outline-none focus:border-accent focus:bg-white transition-all h-8 resize-none flex items-center"
                    />
                  </div>
                  
                  <div className="w-full md:w-auto flex items-center gap-3 px-4 py-1.5 bg-slate-50/30 rounded-xl border border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Seller</span>
                      <p className="text-[10px] font-black text-gray-800 line-clamp-1">{inquiry.seller_name}</p>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{inquiry.seller_city}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => loadInquiries(page)}
          />
        </div>
      )}

      {selectedLead && (
        <SubViewOverlay
          entity={selectedLead}
          onClose={() => setSelectedLead(null)}
          notifyError={notifyError}
        />
      )}
    </div>
  );
}
