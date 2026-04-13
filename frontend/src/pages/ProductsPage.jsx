import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchProducts } from "../services/productServices"; 
import ProductCard from "../components/ui/ProductCard";
import TrendingProducts from "../components/sections/TrendingProducts";
import TopSelling from "../components/sections/TopSelling";
import ReviewSection from "../components/sections/ReviewSection";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Pagination from "../components/ui/Pagination";
import { motion } from "framer-motion";
import { ProductCardSkeleton } from "../components/ui/SkeletonLoader";
import InquiryModal from "../components/ui/InquiryModal";

export default function ProductsPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // API se aane wale pagination stats
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Inquiry Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Single State Object for all filters
  const categories = ["All", "BOPP", "PET", "CPP", "LAMINATED"];

  // URL setup
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");
    const searchFromUrl = params.get("search");
    const cityFromUrl = params.get("city");
    
    return {
      page: 1,
      limit: 8,
      category: categoryFromUrl && categories.includes(categoryFromUrl) ? categoryFromUrl : "All",
      sort: "default",
      search: searchFromUrl || "",
      city: cityFromUrl || "",
    };
  });

  // Local state for search input (debounce ke liye)
  const [searchInput, setSearchInput] = useState("");

  // Sync url category changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");
    const searchFromUrl = params.get("search");
    const cityFromUrl = params.get("city");

    setFilters(prev => ({ 
      ...prev, 
      category: categoryFromUrl && categories.includes(categoryFromUrl) ? categoryFromUrl : "All",
      search: searchFromUrl || prev.search,
      city: cityFromUrl || prev.city
    }));
    
    if (searchFromUrl) setSearchInput(searchFromUrl);
  }, [location.search]);

  // 1. API Call Effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchProducts(filters);
        // Backend response structure ke hisaab se data set karein
        setProducts(res.data || []);
        setTotalProducts(res.totalProducts || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // 2. Debounce Search Effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // 3. Handlers
  const handleCategoryChange = (cat) => {
    setFilters((prev) => ({ ...prev, category: cat, page: 1 }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInquiryOpen = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-ink py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center sm:text-left">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[3px] uppercase text-accent block mb-2">
            Our Catalogue
          </span>
          <h1 className="font-syne font-black text-3xl sm:text-4xl lg:text-5xl text-white mt-1 mb-2 uppercase tracking-tight">
            All Products
          </h1>
          <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto sm:mx-0">
            Premium packaging films across BOPP, PET, CPP & LAMINATED
          </p>
        </div>
      </div>

      {/* Main Section */}
      <section className="py-10 md:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Controls: Search, Categories, Sort */}
          <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 mb-10 sm:mb-12">
            <div className="relative w-full xl:max-w-sm">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3"
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 text-sm font-medium border border-black/[0.1] rounded-2xl bg-surface focus:outline-none focus:border-accent transition-all shadow-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide flex-nowrap items-center flex-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCategoryChange(c)}
                    className={`px-5 py-2.5 rounded-xl text-[12px] font-black transition-all whitespace-nowrap border uppercase tracking-widest ${
                      filters.category === c
                        ? "bg-accent border-accent text-white shadow-lg shadow-orange-100"
                        : "bg-surface text-ink2 border-black/[0.05] hover:border-accent/20"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              
              <div className="sm:min-w-[180px]">
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  className="w-full px-5 py-3 rounded-2xl text-[12px] font-black border border-black/[0.05] bg-surface text-ink2 focus:outline-none shadow-sm uppercase tracking-widest cursor-pointer hover:border-accent/20 transition-all"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="highest_rated">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          <p className="text-sm text-ink3 mb-5">
            Showing {products.length > 0 ? `${(filters.page - 1) * filters.limit + 1}-${(filters.page - 1) * filters.limit + products.length}` : '0'} of {totalProducts} products
          </p>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-ink3">
              No products found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {products.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <ProductCard 
                      product={p} 
                      onInquiry={handleInquiryOpen} 
                    />
                  </motion.div>
                ))}
              </div>

              {/* Reusable Pagination Component */}
              <Pagination 
                currentPage={filters.page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </>
          )}
        </div>
      </section>

      {/* Shared Inquiry Modal */}
      <InquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />

      {/* Additional Sections */}
      <TrendingProducts />
      <TopSelling />
      <ReviewSection />
    </>
  );
}