import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, MapPin, Package, Clock, Zap, X } from "lucide-react";
import { fetchCategories } from "../../services/productServices";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        if (res.success) {
          // Limit to 4 for the Hero section grid
          setCategories(res.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to load hero categories:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/products");
    }
  };

  const getCategoryStyle = (name) => {
    const n = name.toLowerCase();
    if (n.includes("bopp")) return { color: "#ff3d00", bg: "#fff5f2" };
    if (n.includes("pet")) return { color: "#2196f3", bg: "#e3f2fd" };
    if (n.includes("cpp")) return { color: "#4caf50", bg: "#e8f5e9" };
    if (n.includes("laminate")) return { color: "#9c27b0", bg: "#f3e5f5" };
    return { color: "#e8511a", bg: "#fff7f5" }; // Default
  };

  return (
    <section className="bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 text-[9px] sm:text-[10px] font-semibold text-accent mb-4 sm:mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-flashing" />
            Premium Packaging Films
          </div>
          <h1 className="font-syne font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.1] mb-3 sm:mb-4 uppercase tracking-tight">
            BOPP, PET &<br />
            <span className="text-accent">CPP Laminates</span>
            <br />
            for Every Industry
          </h1>
          <p className="text-sm md:text-base text-ink3 leading-relaxed mb-6 sm:mb-8 max-w-sm sm:max-w-xl">
            High-quality flexible packaging solutions. Connect with verified 
            manufacturers and get the best quotes for your business needs.
          </p>

          {/* Flashing marketing messages */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-orange-50 text-[#e8511a] px-3 py-1.5 rounded-full border border-orange-100/50 shadow-sm animate-flashing">
              <Zap size={10} fill="#e8511a" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">24 Hrs dispatch</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100/50 shadow-sm animate-flashing" style={{ animationDelay: "0.5s" }}>
              <Clock size={10} strokeWidth={3} />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">45 Min response</span>
            </div>
          </div>

          {/* Search Bar Integration */}
          <form onSubmit={handleSearch} className="relative z-20 w-full max-w-2xl bg-white border border-black/10 rounded-2xl sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-8 focus-within:border-accent transition-all">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-2">
               <Search size={20} className="text-accent shrink-0" />
               <input 
                 type="text"
                 placeholder="Search product (e.g. BOPP Film)"
                 className="w-full bg-transparent outline-none text-sm sm:text-base font-bold text-ink placeholder:text-gray-400"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               {searchQuery && (
                 <button 
                   type="button"
                   onClick={() => setSearchQuery("")}
                   className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-accent transition-all"
                 >
                   <X size={16} />
                 </button>
               )}
            </div>
            <button 
              type="submit"
              className="bg-accent text-white font-black px-8 py-4 sm:py-3.5 rounded-xl sm:rounded-2xl hover:bg-orange-700 transition-all text-[11px] sm:text-xs uppercase tracking-widest shadow-lg shadow-orange-200"
            >
              Find Sellers
            </button>
          </form>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <Link
              to="/products"
              className="bg-ink text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black transition-all text-[10px] uppercase tracking-widest"
            >
              Explore Products <ArrowRight size={12} />
            </Link>
            <Link
              to="/contact"
              className="border border-black/10 text-ink font-black px-5 py-2.5 rounded-xl hover:bg-surface transition-all text-[10px] uppercase tracking-widest"
            >
              Become a Seller
            </Link>
          </div>
          

        </div>

        {/* Dynamic Visual - Category Grid */}
        <div className="relative flex items-center justify-center w-full mt-8 md:mt-0">
          <div className="absolute w-full sm:w-[400px] h-full sm:h-[400px] bg-accent/5 rounded-full blur-3xl animate-pulse -z-10" />
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[450px]">
            {loading ? (
               // Simple loading skeletons
               [1,2,3,4].map(i => (
                 <div key={i} className="h-20 sm:h-40 bg-gray-50 rounded-3xl animate-pulse" />
               ))
            ) : (
                categories.map((cat) => {
                  const style = getCategoryStyle(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      to={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="group rounded-3xl border border-black/[0.05] p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 bg-white"
                      style={{ borderTop: `4px solid ${style.color}` }}
                    >
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: style.bg }}
                      >
                        <Package size={16} className="sm:w-5 sm:h-5" style={{ color: style.color }} />
                      </div>
                      <div>
                        <div className="font-syne font-black text-[10px] sm:text-xs text-ink uppercase tracking-tight line-clamp-1">
                          {cat.name}
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                           {cat.variants || 0} Variants
                        </div>
                      </div>
                    </Link>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
