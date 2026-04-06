import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const navigate = useNavigate();
  if (cart.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <ShoppingBag size={56} className="text-ink3/40 mb-4"/>
      <h2 className="font-syne font-black text-2xl text-ink mb-2">Your cart is empty</h2>
      <p className="text-ink3 mb-6">Add some products to get started</p>
      <button onClick={() => navigate("/products")} className="bg-accent text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors">
        Browse Products
      </button>
    </div>
  );
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-syne font-black text-3xl text-ink mb-8">Your Cart</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-black/[0.07] p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl flex-shrink-0" style={{background: item.color + "60"}}/>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-ink truncate">{item.name}</div>
                <div className="text-xs text-ink3 mt-0.5">{item.category} · {item.thickness}</div>
                <div className="text-accent font-bold mt-1">₹{item.price}/{item.unit}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center hover:bg-gray-200 transition-colors"><Minus size={13}/></button>
                <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center hover:bg-gray-200 transition-colors"><Plus size={13}/></button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 ml-2 transition-colors"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6 h-fit">
          <h3 className="font-syne font-bold text-lg text-ink mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 text-sm">
            {cart.map(i => (
              <div key={i.id} className="flex justify-between text-ink2">
                <span className="truncate mr-2">{i.name} ×{i.qty}</span>
                <span className="font-medium whitespace-nowrap">₹{i.price * i.qty}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-black/[0.07] pt-3 mb-5">
            <div className="flex justify-between font-syne font-black text-lg text-ink">
              <span>Total</span><span className="text-accent">₹{total}</span>
            </div>
          </div>
          <button onClick={() => navigate("/contact")} className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors mb-2">
            Request Quote
          </button>
          <button onClick={clearCart} className="w-full border border-black/10 text-ink3 py-2.5 rounded-xl text-sm hover:bg-surface transition-colors">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
