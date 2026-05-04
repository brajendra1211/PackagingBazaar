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
      `👤 *Buyer:* ${inquiry.buyer_display_name}`,
      `📞 *Mobile:* ${inquiry.buyer_display_mobile}`,
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

      {/* Content */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Inquiry Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Requirement</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Contact & Location</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Target Seller</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Match</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <TrendingUp size={48} className="text-gray-200" />
                      <p className="font-syne font-black text-lg text-gray-300 uppercase tracking-wide">No Inquiries Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <React.Fragment key={inquiry.id}>
                    <tr className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-900">{inquiry.buyer_display_name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5 mb-2">
                          {new Date(inquiry.created_at).toLocaleDateString()} at {new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <select 
                          value={inquiry.status || 'pending'}
                          onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 outline-none focus:border-accent"
                        >
                          <option value="pending">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Negotiating">Negotiating</option>
                          <option value="Closed">Closed</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 min-w-[280px]">
                        <div className="text-sm font-black text-gray-800 mb-2">{inquiry.product_name}</div>
                        
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {inquiry.quantity_required && inquiry.quantity_required !== 'Not specified' && (
                              <span className="text-[10px] bg-accent text-white font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm shadow-accent/20">
                                QTY: {inquiry.quantity_required}
                              </span>
                            )}
                            {inquiry.thickness && (
                              <span className="text-[10px] bg-white text-gray-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-gray-200 shadow-sm flex items-center gap-1">
                                <span className="text-[8px] text-gray-400">THICK:</span> {inquiry.thickness}
                              </span>
                            )}
                            {inquiry.width && (
                              <span className="text-[10px] bg-white text-gray-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-gray-200 shadow-sm flex items-center gap-1">
                                <span className="text-[8px] text-gray-400">WIDTH:</span> {inquiry.width}
                              </span>
                            )}
                          </div>

                          {inquiry.message && (
                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100/80 w-full relative group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 rounded-l-xl group-hover:bg-accent transition-colors" />
                              <p className="text-xs text-gray-600 font-medium italic leading-relaxed line-clamp-2 pl-2">
                                "{inquiry.message}"
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs font-medium text-gray-600">{inquiry.buyer_display_mobile}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                          {inquiry.city}, {inquiry.state} {inquiry.pincode && `(${inquiry.pincode})`}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs font-semibold text-gray-700">{inquiry.seller_name}</div>
                        <div className="text-[10px] text-gray-400 italic mt-0.5">
                          {inquiry.seller_city}, {inquiry.seller_state}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setSelectedLead({ 
                            type: "lead", 
                            id: inquiry.id, 
                            name: `MATCHING FOR: ${inquiry.product_name}`, 
                            mode: "lead-matching",
                            pincode: inquiry.pincode,
                            inquiryData: inquiry
                          })}
                          className="p-2.5 bg-accent/10 text-accent rounded-xl hover:bg-accent/20 transition-colors shadow-sm"
                          title="Smart Match Sellers"
                        >
                          <Zap size={16} />
                        </button>
                      </td>
                    </tr>
                    {/* Detail Row */}
                    <tr>
                      <td colSpan={5} className="px-8 py-4 bg-slate-50/30 border-b border-gray-50">
                        <div className="flex gap-4 items-start">
                          <div className="w-1 h-full bg-accent/20 rounded-full shrink-0" />
                          <div className="flex-1 space-y-4">
                            {/* Message moved to main row for better visibility */}
                            <div>
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1">Admin Notes:</span>
                              <textarea 
                                defaultValue={inquiry.admin_notes || ""}
                                onBlur={(e) => handleNotesChange(inquiry.id, e.target.value)}
                                placeholder="Add private notes here... (Saves automatically on click away)"
                                className="w-full text-xs text-gray-700 p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-accent resize-none h-16"
                              />
                            </div>
                          </div>
                          <div className="w-48 text-right shrink-0 flex flex-col items-end gap-3">
                            <div>
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1">Buyer Email:</span>
                              <span className="text-xs font-medium text-gray-700">{inquiry.buyer_display_email}</span>
                            </div>

                            <div className="flex flex-col gap-2 w-full mt-4">
                                {/* Buttons removed as per user request */}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-8 bg-slate-50/30 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => loadInquiries(page)}
            />
          </div>
        )}
      </div>

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
