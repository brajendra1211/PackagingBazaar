import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  Zap,
  RefreshCcw,
  MessageCircle,
  Save
} from "lucide-react";
import { fetchInquiriesAdmin, updateInquiryAdmin } from "../../services/adminServices";
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
  const { notifyError, notifySuccess } = useNotification();

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
    return (
      item.buyer_display_name?.toLowerCase().includes(s) ||
      item.product_name?.toLowerCase().includes(s)
    );
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

  const handleWhatsAppForward = (inquiry) => {
    const text = `*New Lead Alert!*\nBuyer: ${inquiry.buyer_display_name}\nMobile: ${inquiry.buyer_display_mobile}\nProduct: ${inquiry.product_name}\nQty: ${inquiry.quantity_required}\nCity: ${inquiry.city}\nMessage: ${inquiry.message}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
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

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm w-full md:w-80 outline-none focus:border-accent"
            />
          </div>
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
                      <td className="px-8 py-6">
                        <div className="text-xs font-bold text-gray-800">{inquiry.product_name}</div>
                        <div className="text-[10px] text-accent font-bold uppercase tracking-widest mt-1">
                          QTY: {inquiry.quantity_required || 'N/A'} 
                          {inquiry.thickness && ` • ${inquiry.thickness}`}
                          {inquiry.width && ` • ${inquiry.width}`}
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
                            <div>
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1">Detailed Requirement:</span>
                              <p className="text-xs text-gray-700 italic leading-relaxed bg-white p-3 rounded-xl border border-gray-100">"{inquiry.message}"</p>
                            </div>
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
