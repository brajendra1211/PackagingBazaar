import { useState, useEffect } from "react";
import { fetchProducts } from "../services/productServices"; 
import ProductCard from "../components/ui/ProductCard";
import TrendingProducts from "../components/sections/TrendingProducts";
import TopSelling from "../components/sections/TopSelling";
import ReviewSection from "../components/sections/ReviewSection";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Pagination from "../components/ui/Pagination";
import { motion } from "framer-motion";
import { ProductCardSkeleton } from "../components/ui/SkeletonLoader";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // API se aane wale pagination stats
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Single State Object for all filters
  const categories = ["All", "BOPP", "PET", "CPP", "LAMINATED"];

  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    category: "All",
    sort: "default",
    search: "",
  });

  // Local state for search input (debounce ke liye)
  const [searchInput, setSearchInput] = useState("");

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

  return (
    <>
      {/* Header */}
      <div className="bg-ink py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-accent">
            Our Catalogue
          </span>
          <h1 className="font-syne font-black text-4xl text-white mt-2 mb-1">
            All Products
          </h1>
          <p className="text-white/50 text-sm">
            60 premium packaging films across BOPP, PET, CPP & LAMINATED
          </p>
        </div>
      </div>

      {/* Main Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Controls: Search, Categories, Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3"
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-surface focus:outline-none focus:border-accent"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide flex-nowrap sm:flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    filters.category === c
                      ? "bg-accent text-white"
                      : "bg-surface text-ink2 hover:bg-white border border-black/[0.08]"
                  }`}
                >
                  {c}
                </button>
              ))}
              
              <div className="ml-auto sm:ml-0">
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  className="px-3 py-2 rounded-xl text-sm border border-black/[0.1] bg-surface text-ink2 focus:outline-none whitespace-nowrap min-w-[140px]"
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
                    <ProductCard product={p} />
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

      {/* Additional Sections */}
      <TrendingProducts />
      <TopSelling />
      <ReviewSection />
    </>
  );
}