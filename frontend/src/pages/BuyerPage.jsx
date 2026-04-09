import React from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BuyerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShoppingBag size={40} />
        </div>
        <h1 className="font-syne font-black text-5xl text-gray-900 mb-6 uppercase tracking-tighter">
          Find the Best <br /> <span className="text-blue-500 underline decoration-blue-100">Packaging Solution</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          PackagingBazaar connecting you directly with thousands of verified manufacturers for the best quality at the right price.
        </p>
        
        <div className="grid sm:grid-cols-3 gap-6 mb-12 text-left">
          {[
            { icon: <ShieldCheck className="text-accent" />, title: "Trusted Partners", desc: "Buy only from verified business entities." },
            { icon: <Zap className="text-yellow-500" />, title: "Instant Quotes", desc: "Request prices and get responses quickly." },
            { icon: <ShoppingBag className="text-green-500" />, title: "Wide Catalog", desc: "Access thousands of product variations." }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100">
              <div className="mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate("/products")}
          className="bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-bold text-sm hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all flex items-center gap-2 mx-auto uppercase tracking-widest"
        >
          EXPLORE PRODUCTS
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
