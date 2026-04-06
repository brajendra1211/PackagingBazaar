import { useState, useEffect } from "react";
import { fetchPendingSellers, approveSellerAccount, rejectSellerAccount } from "../services/adminServices";
import { CheckCircle, XCircle, Store, Mail, Phone, Calendar, Banknote, AlertCircle, MapPin } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingSellers();
      if (data.success) {
        setPendingSellers(data.sellers);
      }
    } catch (error) {
      console.error("Error loading pending sellers", error);
      toast.error("Failed to load seller applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleApprove = async (userId, companyName) => {
    try {
      const response = await approveSellerAccount(userId);
      if (response.success) {
        toast.success(`${companyName} has been approved.`);
        setPendingSellers(prev => prev.filter(seller => seller.user_id !== userId));
      }
    } catch (error) {
      console.error("Error approving seller:", error);
      toast.error(error.response?.data?.message || "Failed to approve seller.");
    }
  };

  const handleReject = async (userId, companyName) => {
    if (!window.confirm(`Are you sure you want to reject and delete the application for ${companyName}?`)) return;

    try {
      const response = await rejectSellerAccount(userId);
      if (response.success) {
        toast.success(`Application for ${companyName} has been rejected.`);
        setPendingSellers(prev => prev.filter(seller => seller.user_id !== userId));
      }
    } catch (error) {
      console.error("Error rejecting seller:", error);
      toast.error(error.response?.data?.message || "Failed to reject seller.");
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-black font-syne text-ink mb-1">Seller Applications</h1>
        <p className="text-sm font-medium text-ink2">Review and manage pending seller registrations</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : pendingSellers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.08] p-12 text-center shadow-sm">
           <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
           </div>
           <h3 className="text-xl font-bold text-ink mb-1">All Caught Up!</h3>
           <p className="text-sm text-ink2">There are no pending seller applications waiting for approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingSellers.map((seller) => (
            <div key={seller.user_id} className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="p-5 border-b border-black/[0.05] flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-50 text-accent rounded-xl flex items-center justify-center shrink-0">
                   <Store size={22} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-lg text-ink truncate">{seller.company_name}</h3>
                   <p className="text-xs font-semibold text-ink2 uppercase tracking-wide">{seller.business_type}</p>
                 </div>
              </div>

              <div className="p-5 space-y-4 flex-1">
                <div className="bg-surface rounded-xl p-3 flex flex-col gap-2 relative h-full">
                  <div className="absolute top-2 right-3 text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full uppercase">Pending</div>
                  
                  <div className="flex items-center gap-2 text-sm text-ink font-medium mt-1">
                    <span className="text-ink2 w-5 flex justify-center"><Phone size={14} /></span>
                    <span className="truncate">{seller.owner_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-ink font-medium">
                    <span className="text-ink2 w-5 flex justify-center"><Mail size={14} /></span>
                    <span className="truncate">{seller.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-ink font-medium">
                    <span className="text-ink2 w-5 flex justify-center"><Banknote size={14} /></span>
                    <span><strong>GST:</strong> {seller.gst_number}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-ink font-medium">
                     <span className="text-ink2 w-5 flex justify-center"><MapPin size={14} /></span>
                     <span className="truncate">{seller.city}, {seller.state}</span>
                  </div>

                  <div className="mt-auto pt-3 pb-1 border-t border-black/[0.05] flex">
                     <div className="flex flex-col">
                       <span className="text-[10px] text-ink2 uppercase">Established</span>
                       <span className="text-sm font-semibold">{seller.year_established || "N/A"}</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-black/[0.05] grid grid-cols-2 gap-3 shrink-0">
                <button 
                  onClick={() => handleReject(seller.user_id, seller.company_name)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button 
                  onClick={() => handleApprove(seller.user_id, seller.company_name)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm shadow-green-600/30"
                >
                  <CheckCircle size={16} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
