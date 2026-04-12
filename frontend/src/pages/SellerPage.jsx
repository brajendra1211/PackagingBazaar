import { useState, useEffect } from "react";
import { Store, ShieldCheck, MapPin, Send, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../services/productServices";
import ProductCard from "../components/ui/ProductCard";
import InquiryModal from "../components/ui/InquiryModal";
import { motion } from "framer-motion";

export default function SellerPage() {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadManufacturers = async () => {
      setLoading(true);
      try {
        // Fetch a large chunk of products to extract sellers
        const res = await fetchProducts({ limit: 100 });
        if (res.success) {
          // Group products by seller
          const grouped = res.data.reduce((acc, product) => {
            const sellerId = product.seller_id;
            if (!acc[sellerId]) {
              acc[sellerId] = {
                id: sellerId,
                name: product.seller_name || "Verified Manufacturer",
                city: product.city,
                state: product.state,
                seller_uid: product.seller_uid,
                is_verified: true, // Publicly visible products are from verified sellers
                products: []
              };
            }
            acc[sellerId].products.push(product);
            return acc;
          }, {});
          
          setSellers(Object.values(grouped));
        }
      } catch (err) {
        console.error("Failed to load manufacturers", err);
      } finally {
        setLoading(false);
      }
    };

    loadManufacturers();
  }, []);

  const handleInquiryOpen = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      {/* Hero / Header */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="bg-ink rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 text-xs font-semibold text-accent mb-6 uppercase tracking-widest">
              Manufacturer Directory
            </div>
            <h1 className="font-syne font-black text-3xl md:text-6xl text-white mb-6 uppercase tracking-tighter leading-[1.1]">
              Verified <span className="text-accent underline decoration-orange-500/30">Manufacturers</span> <br /> & Suppliers
            </h1>
            <p className="text-white/60 text-sm md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed px-4">
              Connect directly with premium packaging film manufacturers across India. 
              Get direct factory prices and authentic business leads.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => navigate("/become-a-seller")}
                className="bg-accent text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 shadow-xl shadow-orange-900/20"
              >
                Join as Manufacturer <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate("/contact")}
                className="bg-white/10 backdrop-blur-sm border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                Request Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="space-y-12">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-3xl mb-6 w-full md:w-1/3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(j => <div key={j} className="h-64 bg-gray-200 rounded-2xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
             <Store size={48} className="mx-auto text-gray-200 mb-4" />
             <h3 className="text-lg font-bold text-gray-900">No manufacturers listed yet.</h3>
             <p className="text-gray-500 text-sm">Be the first one to list your products.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {sellers.map((seller, idx) => (
              <motion.div 
                key={seller.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                {/* Seller Profile Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8 gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-accent border border-gray-100 shrink-0">
                      <Store size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h2 className="font-syne font-black text-xl sm:text-2xl text-ink uppercase tracking-tight truncate">{seller.name}</h2>
                        <ShieldCheck size={18} className="text-green-500 shrink-0" />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin size={12} className="text-accent shrink-0" />
                          <span className="truncate">
                            {(!seller.city && !seller.state) 
                              ? "Address Not Provided" 
                              : `${seller.state || ""}${seller.city ? ` (${seller.city})` : ""}`
                            }
                          </span>
                        </div>
                        <div className="px-2 py-0.5 bg-gray-50 rounded border border-gray-100 shrink-0">
                          ID: {seller.seller_uid}
                        </div>
                        <div className="text-green-600">Active Supplier</div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/products?search=${encodeURIComponent(seller.name)}`)}
                    className="text-xs font-black uppercase tracking-[2px] text-accent hover:text-orange-700 underline decoration-2 transition-all"
                  >
                    View All Products
                  </button>
                </div>

                {/* Seller's Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {seller.products.slice(0, 4).map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onInquiry={handleInquiryOpen} 
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Inquiry Modal */}
      <InquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
}
