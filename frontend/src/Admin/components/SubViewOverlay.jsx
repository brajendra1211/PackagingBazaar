import React, { useState, useEffect } from "react";
import { 
  XCircle, 
  Package, 
  ShoppingBag, 
  RefreshCcw, 
  MapPin as MapPinIcon, 
  Phone, 
  Zap, 
  CheckCircle2,
  MessageCircle
} from "lucide-react";
import { 
  fetchSellerOrdersAdmin, 
  fetchSellerProductsAdmin, 
  fetchLeadRecommendations,
  shareLeadWithSellerAdmin 
} from "../../services/adminServices";
import { useNotification } from "../../context/NotificationContext";
import { getImageUrl } from "../../services/api";

export default function SubViewOverlay({ entity, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState({ open: false, seller: null, note: "" });

  const { notifySuccess, notifyError } = useNotification();

  const handleWhatsAppForward = (seller) => {
    if (!entity.inquiryData) return;
    const inquiry = entity.inquiryData;
    const text = `*New Lead Alert!*\nHello ${seller.company_name},\n\nWe have a new requirement matching your profile:\n\n*Product:* ${inquiry.product_name}\n*Quantity:* ${inquiry.quantity_required}\n*Buyer Location:* ${inquiry.city}\n*Requirement:* ${inquiry.message}\n\nPlease let us know if you can fulfill this!`;
    const url = `https://wa.me/${seller.phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendToDashboard = async () => {
    try {
      const res = await shareLeadWithSellerAdmin(entity.id, shareModal.seller.id, shareModal.note);
      if (res.success) {
        notifySuccess(`Lead shared with ${shareModal.seller.company_name}!`);
        
        setItems(prevItems => prevItems.map(item => 
          item.id === shareModal.seller.id ? { ...item, is_assigned: 1 } : item
        ));

        setShareModal({ open: false, seller: null, note: "" });
      }
    } catch (err) {
      notifyError("Failed to share lead");
    }
  };

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
          <button onClick={onClose} className="p-3 bg-white border rounded-2xl hover:bg-gray-100 transition-all">
            <XCircle />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCcw className="animate-spin mx-auto text-accent" size={40} />
            </div>
          ) : (
            <div className="space-y-4">
              {entity.mode === "products" && items.map((prod) => (
                  <div key={prod.id} className="p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-2xl border flex items-center justify-center overflow-hidden">
                        {prod.image_url ? <img src={getImageUrl(prod.image_url)} alt="" className="object-cover w-full h-full" /> : <Package className="text-gray-300" />}
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
                        <p className={`text-xs font-black ${prod.stock_qty > 0 ? "text-green-600" : "text-red-500"}`}>{prod.stock_qty} kg</p>
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
                        <h4 className="font-syne font-black text-gray-900 uppercase tracking-tight">#{order.id.toString().padStart(5, "0")}</h4>
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
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{order.status}</span>
                      </div>
                    </div>
                  </div>
                ))}

              {entity.mode === "lead-matching" && items.map((seller, idx) => (
                  <div key={seller.id} className={`p-8 rounded-[2.5rem] border transition-all shadow-sm ${idx === 0 ? "bg-orange-50/50 border-accent/30 shadow-orange-100" : "bg-white border-gray-100"}`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-syne font-black text-gray-900 text-xl uppercase tracking-tighter">{seller.company_name}</h4>
                          {idx === 0 && <span className="bg-accent text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Best Match 🥇</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6 font-syne">
                          <MapPinIcon size={14} className="text-accent" /> {seller.city}, {seller.state}
                        </div>
                        <div className="bg-white/80 rounded-3xl p-6 border border-black/[0.03] space-y-3">
                           <p className="text-[10px] font-black text-ink uppercase tracking-widest mb-4 flex items-center justify-between">Match Breakdown <span className="text-accent">{seller.match_score} / 510 PTS</span></p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                               <MatchItem 
                                 label={seller.pincode_match ? "Pincode Match" : seller.city_match ? "City Match" : seller.state_match ? "State Match" : "Location Match"} 
                                 score={seller.pincode_match ? 200 : seller.city_match ? 100 : seller.state_match ? 50 : 0} 
                                 max={200} 
                                 status={seller.pincode_match || seller.city_match || seller.state_match} 
                               />
                               <MatchItem label="Price Efficiency" score={seller.price_match ? 40 : 0} max={40} status={seller.price_match} />
                               <MatchItem label="Stock Sufficient" score={seller.has_stock ? 70 : 0} max={70} status={seller.has_stock} />
                               <MatchItem label="MOQ Awareness" score={seller.moq_fit ? 50 : 0} max={50} status={seller.moq_fit} />
                               <MatchItem label={`Delivery (${seller.best_delivery_hours ? seller.best_delivery_hours + 'h' : 'N/A'})`} score={seller.best_delivery_hours <= 24 ? 40 : seller.best_delivery_hours <= 48 ? 30 : seller.best_delivery_hours <= 72 ? 20 : seller.best_delivery_hours <= 120 ? 10 : 0} max={40} status={seller.best_delivery_hours > 0 && seller.best_delivery_hours <= 120} />
                            </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 w-full md:w-48">
                        <a href={`tel:${seller.phone}`} className="w-full px-8 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                          <Phone size={14} /> Call
                        </a>
                        <button 
                          onClick={() => handleWhatsAppForward(seller)}
                          className="w-full px-8 py-3 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all shadow-xl shadow-[#25D366]/20"
                        >
                          <MessageCircle size={14} /> WhatsApp Lead
                        </button>
                        {seller.is_assigned ? (
                          <div className="w-full px-8 py-3 bg-orange-50 border-2 border-orange-100 text-orange-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                            <CheckCircle2 size={14} /> Already Sent
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShareModal({ open: true, seller, note: "" })}
                            className="w-full px-8 py-3 bg-white border-2 border-accent text-accent rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all shadow-lg shadow-orange-100"
                          >
                            <Zap size={14} /> Send to Dash
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {shareModal.open && (
        <div className="fixed inset-0 z-[200] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="font-syne font-black text-xl text-gray-900 uppercase mb-2">Share with {shareModal.seller?.company_name}</h3>
            <p className="text-xs text-gray-500 font-medium mb-6">Add an optional message or instruction for the seller. They will see this on their dashboard.</p>
            
            <textarea
              value={shareModal.note}
              onChange={(e) => setShareModal({ ...shareModal, note: e.target.value })}
              placeholder="e.g. Urgent requirement, please call today..."
              className="w-full text-sm text-gray-700 p-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-accent resize-none h-32 mb-6"
            />
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShareModal({ open: false, seller: null, note: "" })}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendToDashboard}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase bg-accent text-white hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                <Zap size={14} /> Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchItem({ label, score, max, status }) {
  const isZero = score === 0;
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[11px] font-bold ${isZero ? "text-gray-300" : "text-gray-600"}`}>{label}</span>
      <div className="flex items-center gap-2">
        {status !== undefined && (status ? <CheckCircle2 size={12} className="text-green-500" /> : <XCircle size={12} className="text-red-400" />)}
        <span className={`text-[10px] font-black ${isZero ? "text-gray-300 line-through" : "text-accent"}`}>+{score}</span>
      </div>
    </div>
  );
}
