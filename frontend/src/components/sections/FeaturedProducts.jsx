import { useState, useEffect } from "react"; 
import { fetchProducts } from "../../services/productServices"; 
import ProductCard from "../ui/ProductCard";
import InquiryModal from "../ui/InquiryModal";
import { Loader2 } from "lucide-react";

export default function FeaturedProducts() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inquiry Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInquiry = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const getFeaturedData = async () => {
      try {
        const response = await fetchProducts({ 
          limit: 8, 
          page: 1 
        });
        // Response handle karna (agar backend direct array bhej raha hai toh 'response' use karein)
        setFeaturedItems(response.data || response); 
      } catch (error) {
        console.error("Featured products failed to load:", error);
      } finally {
        setLoading(false);
      }
    };

    getFeaturedData();
  }, []);

  return (
    <section className="py-10 sm:py-16 px-4 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[3px] uppercase text-accent">Our Range</span>
            <h2 className="font-syne font-black text-2xl sm:text-3xl md:text-4xl text-ink mt-1 uppercase">Featured Products</h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="text-center py-10 text-ink3">No featured products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredItems.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onInquiry={handleInquiry}
              />
            ))}
          </div>
        )}
      </div>

      <InquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </section>
  );
}