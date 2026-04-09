import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { fetchAddresses } from "../services/userServices";
import { checkoutAPI } from "../services/orderServices";
import { MapPin, CreditCard, ChevronRight, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";
import { useNotification } from "../context/NotificationContext";

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      notifyError("Your cart is empty");
      navigate("/");
      return;
    }
    if (!orderPlaced) loadData();
  }, [cart, navigate, orderPlaced]);

  const loadData = async () => {
    try {
      const res = await fetchAddresses();
      if (res.success) {
        setAddresses(res.data);
        // Select default address if exists
        const def = res.data.find(a => a.is_default);
        if (def) setSelectedAddress(def);
        else if (res.data.length > 0) setSelectedAddress(res.data[0]);
      }
    } catch (err) {
      notifyError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      notifyError("Please select a shipping address");
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        addressId: selectedAddress.id,
        paymentMethod: "COD",
        totalPrice: total,
        items: cart.map(i => ({ 
          product_id: i.id, 
          quantity: i.qty, 
          price: i.price,
          thickness: i.selected_thickness,
          width: i.selected_width,
          brand: i.selected_brand
        }))
      };

      const res = await checkoutAPI(orderData);
      if (res.success) {
        setOrderPlaced(true);
        notifySuccess("Order placed successfully!");
        clearCart();
        navigate("/"); 
      }
    } catch (err) {
      notifyError(err.response?.data?.message || "Checkout failed");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Checkout...</div>;

  return (
    <div className="bg-surface/50 min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <button 
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-ink3 hover:text-ink transition-colors mb-6 group text-sm font-bold"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO CART
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-black/[0.03] shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-accent">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-syne font-black text-xl text-gray-900 leading-tight">Shipping Address</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Where should we send your order?</p>
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                   <p className="text-sm text-gray-500 mb-4 font-medium">No saved addresses found</p>
                   <button 
                    onClick={() => navigate("/profile")}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:shadow-xl transition-all"
                   >
                     Add New Address in Profile
                   </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${selectedAddress?.id === addr.id ? "border-accent bg-orange-50/20" : "border-gray-50 bg-white hover:border-gray-200"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-gray-900 uppercase">{addr.tag}</span>
                          {addr.is_default && <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-black uppercase">Default</span>}
                        </div>
                        {selectedAddress?.id === addr.id && <CheckCircle2 size={18} className="text-accent" />}
                      </div>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                  <button 
                    onClick={() => navigate("/profile")}
                    className="text-xs font-bold text-gray-400 hover:text-accent transition-colors flex items-center gap-1.5 mt-2 ml-1"
                  >
                    Manage addresses in your profile
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method (Locked to COD for now) */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-black/[0.03] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 font-bold italic">₹</div>
                <div>
                  <h3 className="font-syne font-black text-xl text-gray-900 leading-tight">Payment Method</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Currently supporting Cash on Delivery</p>
                </div>
              </div>
              
              <div className="p-5 rounded-2xl border-2 border-accent bg-orange-50/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-orange-100">
                      <CreditCard size={24} className="text-accent" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</h4>
                      <p className="text-xs text-gray-400">Pay when you receive your package</p>
                   </div>
                </div>
                <CheckCircle2 size={20} className="text-accent" />
              </div>
            </div>

          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl sticky top-24 overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl -mr-16 -mt-16 rounded-full" />
              
              <h3 className="font-syne font-black text-2xl text-white mb-6 relative">Order Summary</h3>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide relative">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{item.name}</p>
                      <div className="flex flex-wrap gap-2 mt-0.5">
                        <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Qty: {item.qty} × ₹{item.price}</p>
                        {item.selected_thickness && <p className="text-[9px] text-orange-400/80 font-black uppercase tracking-widest">{item.selected_thickness}</p>}
                        {item.selected_width && <p className="text-[9px] text-orange-400/80 font-black uppercase tracking-widest">{item.selected_width}mm</p>}
                        {item.selected_brand && <p className="text-[9px] text-orange-400/80 font-black uppercase tracking-widest">{item.selected_brand}</p>}
                      </div>
                    </div>
                    <p className="text-white text-sm font-bold">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10 relative">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-bold">Subtotal</span>
                  <span className="text-white font-bold">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-bold">Shipping</span>
                  <span className="text-green-400 font-bold uppercase text-[10px] mt-1 tracking-widest">Free</span>
                </div>
                <div className="flex justify-between text-xl font-syne font-black pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-accent">₹{total}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={placing || cart.length === 0}
                className="w-full bg-accent text-white py-5 rounded-[1.5rem] font-bold text-sm mt-8 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 group shadow-xl shadow-orange-500/10"
              >
                {placing ? (
                  "PLACING ORDER..."
                ) : (
                  <>
                    PLACE ORDER
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-white/30">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
