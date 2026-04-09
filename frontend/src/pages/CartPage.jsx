import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, clearCart, count } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (cart.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
      <div className="w-24 h-24 bg-surface rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100">
        <ShoppingBag size={48} className="text-gray-300"/>
      </div>
      <h2 className="font-syne font-black text-3xl text-gray-900 mb-3">Your cart is empty</h2>
      <p className="text-gray-400 font-medium mb-8 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
      <button 
        onClick={() => navigate("/products")} 
        className="bg-accent text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all"
      >
        START SHOPPING
      </button>
    </div>
  );

  return (
    <div className="bg-surface/50 min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end gap-4 mb-10">
          <h1 className="font-syne font-black text-4xl text-gray-900 leading-none">Your Cart</h1>
          <span className="text-accent font-black text-lg pb-1">({count} items)</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
              >
              <div className="bg-white rounded-[2rem] border border-black/[0.03] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center shadow-sm group hover:border-accent/10 transition-all">
                <div 
                  className="w-full sm:w-24 h-40 sm:h-24 rounded-2xl flex-shrink-0 flex items-center justify-center border border-gray-50 overflow-hidden bg-gray-50/50"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag size={32} className="text-gray-200" />
                  )}
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 truncate pr-4 text-base sm:text-lg">{item.name}</h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.category || "General"}</p>
                        {item.selected_thickness && <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Selected: {item.selected_thickness}</p>}
                        {item.selected_width && <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Width: {item.selected_width}</p>}
                        {item.selected_brand && <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Brand: {item.selected_brand}</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item)} 
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-accent font-black text-xl">₹{item.price}</div>
                    
                    <div className="flex items-center bg-gray-50/50 rounded-xl p-1 border border-gray-100">
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
              Clear entire cart
            </button>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] border border-black/[0.03] p-8 shadow-sm h-fit sticky top-24">
              <h3 className="font-syne font-black text-2xl text-gray-900 mb-6 font-syne">Checkout List</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Subtotal</span>
                  <span className="text-gray-900 font-bold">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Shipping</span>
                  <span className="text-green-500 font-black uppercase text-[10px] tracking-widest mt-1">Free</span>
                </div>
                <div className="h-px bg-gray-50 my-4" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-syne font-black text-xl text-gray-900">Total</span>
                  <span className="font-syne font-black text-2xl text-accent">₹{total}</span>
                </div>
              </div>

              {token ? (
                <button 
                  onClick={() => navigate("/checkout")} 
                  className="w-full bg-accent text-white py-5 rounded-[1.5rem] font-bold text-sm hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-orange-500/10"
                >
                  PROCEED TO CHECKOUT
                  <Plus size={18} className="rotate-45 group-hover:rotate-0 transition-transform" />
                </button>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => navigate("/login")} 
                    className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-bold text-sm hover:shadow-2xl transition-all"
                  >
                    LOGIN TO CHECKOUT
                  </button>
                  <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">Login required to place orders</p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 opacity-30 grayscale">
                <ShieldCheck size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">100% Secure Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
