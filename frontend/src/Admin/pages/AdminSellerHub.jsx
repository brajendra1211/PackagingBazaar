import React, { useState, useEffect } from "react";
import { 
  Store, 
  Search, 
  FileText, 
  Package,
  RefreshCcw 
} from "lucide-react";
import { fetchSellersWithOrdersAdmin } from "../../services/adminServices";
import { useNotification } from "../../context/NotificationContext";
import Pagination from "../../components/ui/Pagination";
import SubViewOverlay from "../components/SubViewOverlay";

export default function AdminSellerHub() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const { notifyError } = useNotification();

  useEffect(() => {
    loadSellers(1);
  }, []);

  const loadSellers = async (page) => {
    setLoading(true);
    try {
      const res = await fetchSellersWithOrdersAdmin(page);
      if (res.success) {
        setSellers(res.sellers);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || 1);
      }
    } catch (err) {
      notifyError("Failed to load seller hub data");
    } finally {
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.company_name?.toLowerCase().includes(s) ||
      item.owner_name?.toLowerCase().includes(s)
    );
  });

  if (loading && sellers.length === 0) {
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
              <Store size={24} />
            </div>
            <h1 className="font-syne font-black text-3xl text-gray-900 uppercase tracking-tight">
              Seller Hub
            </h1>
          </div>
          <p className="text-gray-500 text-sm font-medium">Performance analytics and deep-dive into individual seller operations.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search sellers in hub..."
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
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Seller Hub</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Performance</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Store size={48} className="text-gray-200" />
                      <p className="font-syne font-black text-lg text-gray-300 uppercase tracking-wide">No Sellers Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50 group">
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
                        <button 
                          onClick={() => setSelectedEntity({ type: "seller", id: seller.user_id, name: seller.company_name, mode: "orders" })}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <FileText size={14} /> Orders
                        </button>
                        <button 
                          onClick={() => setSelectedEntity({ type: "seller", id: seller.user_id, name: seller.company_name, mode: "products" })}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <Package size={14} /> Stock
                        </button>
                      </div>
                    </td>
                  </tr>
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
              onPageChange={(page) => loadSellers(page)}
            />
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
    </div>
  );
}
