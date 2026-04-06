import { useState, useEffect } from "react";
import { fetchProducts } from "../services/api"; // Tumhari API service
import ProductCard from "../components/ui/ProductCard";
import TrendingProducts from "../components/sections/TrendingProducts";
import TopSelling from "../components/sections/TopSelling";
import ReviewSection from "../components/sections/ReviewSection";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";



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
        setProducts(res.data);
        setTotalProducts(res.totalProducts);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // 2. Debounce Search Effect (Jab user type karna band karega tab API call hogi)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500); // 500ms delay

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
    window.scrollTo({ top: 0, behavior: "smooth" }); // Page badalne pe upar scroll karo
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
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filters.category === c
                      ? "bg-accent text-white"
                      : "bg-surface text-ink2 hover:bg-surface border border-black/[0.08]"
                  }`}
                >
                  {c}
                </button>
              ))}
              
              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="px-3 py-2 rounded-xl text-sm border border-black/[0.1] bg-surface text-ink2 focus:outline-none"
              >
                <option value="default">Sort: Default</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="highest_rated">Highest Rated</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-ink3 mb-5">
            Showing {products.length} of {totalProducts} products
          </p>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-ink3">
              No products found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(Math.max(filters.page - 1, 1))}
                    disabled={filters.page === 1}
                    className="p-2 rounded-xl border border-black/[0.1] hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        filters.page === index + 1
                          ? "bg-accent text-white"
                          : "bg-surface text-ink2 border border-black/[0.08] hover:border-accent"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(Math.min(filters.page + 1, totalPages))}
                    disabled={filters.page === totalPages}
                    className="p-2 rounded-xl border border-black/[0.1] hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <TrendingProducts />
      <TopSelling />
      <ReviewSection />
    </>
  );
}