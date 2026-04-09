import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag } from "lucide-react";
import { fetchMyOrdersAPI } from "../../services/orderServices";
import { toast } from "react-hot-toast";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetchMyOrdersAPI();
      if (res.success) setOrders(res.orders);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={12} />;
      case 'delivered': return <CheckCircle size={12} />;
      case 'shipped': return <Truck size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return <Package size={12} />;
    }
  };

  if (loading) return <div className="animate-pulse text-gray-400 text-xs py-10 text-center">Loading your orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Package size={18} className="text-accent" />
        <h3 className="font-syne font-black text-gray-900">Your Orders</h3>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ShoppingBag size={24} className="text-gray-300" />
           </div>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No orders found yet</p>
           <p className="text-xs text-gray-300 mt-1">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
              {/* Order Header */}
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Order ID</p>
                      <p className="text-xs font-bold text-gray-900">#PB-{order.id.toString().padStart(6, '0')}</p>
                   </div>
                   <div className="h-8 w-px bg-gray-200" />
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Placed On</p>
                      <p className="text-xs font-bold text-gray-900">{new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                   </div>
                </div>
                
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6">
                 <div className="space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center border border-gray-100">
                               <Package size={20} className="text-gray-400" />
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                               <p className="text-xs text-gray-400">Qty: {item.qty} × ₹{item.price}</p>
                            </div>
                         </div>
                         <p className="text-sm font-bold text-gray-900">₹{item.qty * item.price}</p>
                      </div>
                    ))}
                 </div>

                 <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Payment: {order.payment_method}</p>
                        <p className="text-lg font-syne font-black text-gray-900">Total: <span className="text-accent">₹{order.total_price}</span></p>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-black text-accent hover:translate-x-1 transition-transform uppercase tracking-widest">
                       View Details <ChevronRight size={14} />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
