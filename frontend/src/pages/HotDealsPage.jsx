import { useState, useEffect } from "react";
import { fetchHotDeals } from "../services/productServices"; 
import ProductCard from "../components/ui/ProductCard";
import TrendingProducts from "../components/sections/TrendingProducts";
import TopSelling from "../components/sections/TopSelling";
import { Search, Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCardSkeleton } from "../components/ui/SkeletonLoader";
import InquiryModal from "../components/ui/InquiryModal";

export default function HotDealsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Inquiry Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state (mostly for search)
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchHotDeals();
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load hot deals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInquiryOpen = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Header - Mirroring ProductsPage but themed for Hot Deals */}
      <div className="bg-ink py-10 md:py-14 px-4 overflow-hidden relative text-center md:text-left">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
             <Flame size={14} className="text-orange-500 animate-pulse" fill="currentColor" />
             <span className="text-[10px] md:text-xs font-semibold tracking-[3px] uppercase text-accent">
               Flash Sales
             </span>
          </div>
          <h1 className="font-syne font-black text-3xl md:text-4xl text-white mt-2 mb-1 uppercase">
            Factory <span className="text-orange-500">Hot Deals</span>
          </h1>
          <p className="text-white/50 text-[12px] md:text-sm">
            Exclusive factory-direct clearance items and bulk offer deals.
          </p>
        </div>
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-full bg-accent/5 skew-x-[-20deg] translate-x-32" />
      </div>

      {/* Main Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Search Bar - Visual Consistency with ProductsPage */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deals..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-surface focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center px-4 py-2.5 bg-orange-50 rounded-xl border border-orange-100 max-w-fit">
               <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest flex items-center gap-2">
                 <Zap size={12} fill="currentColor" /> Live Deals: {filteredProducts.length}
               </span>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-surface rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                 <Zap size={32} />
              </div>
              <h3 className="font-syne font-black text-2xl text-gray-900 uppercase">No Active Deals</h3>
              <p className="text-gray-400 text-sm mt-2">Currently, there are no hot deals available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="relative"
                >
                  {/* Reuse Standard ProductCard */}
                  <ProductCard 
                    product={p} 
                    onInquiry={handleInquiryOpen} 
                  />
                  
                  {/* Hot Deal Overlay/Indicator if needed - already has badges in Card */}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inquiry Modal */}
      <InquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />

      <TrendingProducts />
      <TopSelling />
    </>
  );
}
