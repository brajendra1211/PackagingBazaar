import React from 'react';
import { Store, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SellerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-orange-100 text-accent rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Store size={40} />
        </div>
        <h1 className="font-syne font-black text-5xl text-gray-900 mb-6 uppercase tracking-tighter">
          Grow Your Business <br /> <span className="text-accent underline decoration-orange-200">As A Seller</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          PackagingBazaar provides the perfect platform for manufacturers and suppliers to reach thousands of bulk buyers across India.
        </p>
        
        <div className="grid sm:grid-cols-3 gap-6 mb-12 text-left">
          {[
            { icon: <ShieldCheck className="text-green-500" />, title: "Verified Leads", desc: "Get access to authentic business inquiries." },
            { icon: <TrendingUp className="text-blue-500" />, title: "Quick Growth", desc: "Expand your market reach instantly." },
            { icon: <Store className="text-purple-500" />, title: "Digital Store", desc: "Manage your products with ease." }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100">
              <div className="mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate("/become-a-seller")}
          className="bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-bold text-sm hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all flex items-center gap-2 mx-auto uppercase tracking-widest"
        >
          JOIN AS SELLER NOW
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
