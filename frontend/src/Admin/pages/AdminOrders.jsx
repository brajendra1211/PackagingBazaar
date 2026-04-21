import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  ArrowUpRight,
  RefreshCcw 
} from "lucide-react";
import { fetchAllOrdersAdmin } from "../../services/adminServices";
import { useNotification } from "../../context/NotificationContext";
import Pagination from "../../components/ui/Pagination";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const { notifyError } = useNotification();

  useEffect(() => {
    loadOrders(1);
  }, []);

  const loadOrders = async (page) => {
    setLoading(true);
    try {
      const res = await fetchAllOrdersAdmin(page);
      if (res.success) {
        setOrders(res.orders);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || 1);
      }
    } catch (err) {
      notifyError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.customer_name?.toLowerCase().includes(s) ||
      item.id?.toString().includes(s)
    );
  });

  if (loading && orders.length === 0) {
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
              <ShoppingBag size={24} />
            </div>
            <h1 className="font-syne font-black text-3xl text-gray-900 uppercase tracking-tight">
              Sales Orders
            </h1>
          </div>
          <p className="text-gray-500 text-sm font-medium">Monitor all transactions and order fulfillment statuses in real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
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
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Order Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Transaction</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingBag size={48} className="text-gray-200" />
                      <p className="font-syne font-black text-lg text-gray-300 uppercase tracking-wide">No Orders Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                    <td className="px-8 py-6">
                      <div className="font-black text-accent mb-1 tracking-tight">#{order.id}</div>
                      <div className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                        <Clock size={12} /> {new Date(order.order_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-900">{order.customer_name}</td>
                    <td className="px-8 py-6">
                      <div className="font-syne font-black text-gray-900">₹{order.total_amount}</div>
                      <div className={`mt-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg inline-block ${order.status === "completed" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                        {order.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 bg-accent/5 text-accent rounded-xl hover:bg-accent/10 transition-colors">
                        <ArrowUpRight size={18} />
                      </button>
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
              onPageChange={(page) => loadOrders(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
