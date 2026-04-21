import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  Zap,
  RefreshCcw 
} from "lucide-react";
import { fetchInquiriesAdmin } from "../../services/adminServices";
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
  const { notifyError } = useNotification();

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
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
                          {new Date(inquiry.created_at).toLocaleDateString()} at {new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
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
                            pincode: inquiry.pincode
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
                          <div className="flex-1">
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1">Detailed Message / Requirement:</span>
                            <p className="text-xs text-gray-500 italic leading-relaxed">"{inquiry.message}"</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1">Buyer Email:</span>
                            <span className="text-xs text-gray-500">{inquiry.buyer_display_email}</span>
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
