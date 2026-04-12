import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Send, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import InquiryModal from "../components/ui/InquiryModal";
import { submitInquiryAPI } from "../services/inquiryServices";
import { useNotification } from "../context/NotificationContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, clearCart, count } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { notifySuccess, notifyError } = useNotification();

  // Multi-item Inquiry State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (cart.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
      <div className="w-24 h-24 bg-surface rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100">
        <ShoppingBag size={48} className="text-gray-300"/>
      </div>
      <h2 className="font-syne font-black text-3xl text-gray-900 mb-3 uppercase tracking-tighter">Basket is Empty</h2>
      <p className="text-gray-400 font-medium mb-8 max-w-xs uppercase text-[10px] tracking-widest">No products selected for quotation</p>
      <button 
        onClick={() => navigate("/products")} 
        className="bg-accent text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all"
      >
        BROWSE FILMS
      </button>
    </div>
  );

  const handleBulkInquirySubmit = async (formData) => {
    setLoading(true);
    try {
      const promises = cart.map(item => 
        submitInquiryAPI({
          product_id: item.id,
          message: `Bulk Inquiry: ${formData.message}`,
          quantity: `${item.qty} ${item.unit || 'kg'}`,
          thickness: formData.thickness,
          width: formData.width,
          phone: formData.phone,
          pincode: formData.pincode,
          address: formData.address,
          buyer_name: formData.buyer_name,
          buyer_email: formData.buyer_email
        })
      );

      await Promise.all(promises);
      notifySuccess("Bulk inquiry sent! Manufacturers will contact you with factory-best prices.");
      clearCart();
      setIsModalOpen(false);
      if (token) navigate("/profile"); 
    } catch (err) {
      notifyError("Failed to send some inquiries. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface/50 min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-baseline gap-2 sm:gap-4 mb-8 sm:mb-12">
          <h1 className="font-syne font-black text-2xl sm:text-4xl text-gray-900 uppercase tracking-tighter">Inquiry Basket</h1>
          <span className="text-accent font-black text-sm sm:text-lg">({count} items)</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, idx) => (
              <motion.div
                key={`${item.id}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
              >
              <div className="bg-white rounded-[2rem] border border-black/[0.03] p-4 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center shadow-sm group hover:border-accent/10 transition-all">
                <div 
                  className="w-full sm:w-24 h-48 sm:h-24 rounded-2xl flex-shrink-0 flex items-center justify-center border border-gray-50 overflow-hidden bg-gray-50/50"
                >
                  <img src={item.image || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 pr-4 text-[15px] sm:text-lg leading-tight">{item.name}</h4>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">{item.category_name || "Factory Direct"}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item)} 
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-2">
                    <div className="text-accent font-black text-lg sm:text-xl">₹{item.price}<span className="text-[10px] text-gray-400 font-bold ml-1">/{item.unit}</span></div>
                    
                    <div className="flex items-center bg-gray-50/30 rounded-xl p-1 border border-gray-100 scale-90 sm:scale-100 transform origin-right">
                      <button 
                        onClick={() => updateQty(item, item.qty - 1)} 
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:text-accent shadow-sm border border-gray-100 transition-all active:scale-90"
                      >
                        <Minus size={14}/>
                      </button>
                      <span className="w-10 text-center text-sm font-black text-gray-900">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item, item.qty + 1)} 
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:text-accent shadow-sm border border-gray-100 transition-all active:scale-90"
                      >
                        <Plus size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            ))}

            <button 
              onClick={clearCart}
              className="text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 mt-4 ml-2 transition-colors"
            >
              <Trash2 size={14} />
              Clear basket
            </button>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] border border-black/[0.03] p-8 shadow-sm h-fit sticky top-24">
              <h3 className="font-syne font-black text-2xl text-gray-900 mb-6 font-syne uppercase tracking-tighter">Basket Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Total Products</span>
                  <span className="text-gray-900 font-black">{count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Total Est. Value</span>
                  <span className="text-gray-900 font-black text-lg">₹{total.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-50" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                   Requesting quotes for these items as a single requirement.
                </p>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)} 
                className="w-full bg-accent text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-orange-500/10"
              >
                REQUEST QUOTATION FOR ALL
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 opacity-40 grayscale">
                <ShieldCheck size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified B2B Lead</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InquiryModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         product={{ 
           id: "BULK", 
           name: `${count} Items in Basket`, 
           image_url: cart[0]?.image || cart[0]?.image_url,
           category_name: "Multiple Categories",
           seller_name: "Various Manufacturers"
         }}
         customSubmit={handleBulkInquirySubmit}
      />
    </div>
  );
}
