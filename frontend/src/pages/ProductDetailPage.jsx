import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// ✅ FIX: Import path badal kar productservices kiya gaya hai
import { fetchProductById, fetchProducts } from "../services/productServices"; 
import { useCart } from "../context/CartContext";
import Badge from "../components/ui/Badge";
import StarRating from "../components/ui/StarRating";
import ProductCard from "../components/ui/ProductCard";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import { ShoppingCart, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

const catColors = {
  BOPP: "from-green-50 to-emerald-100",
  PET: "from-blue-50 to-sky-100",
  CPP: "from-orange-50 to-amber-100",
  LAMINATED: "from-purple-50 to-pink-100",
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const getDetails = async () => {
      setLoading(true);
      try {
        // 1. Fetch main product details
        const res = await fetchProductById(id);
        // Safe data handling
        const productData = res.data || res; 
        setProduct(productData);

        // 2. Fetch related products (Same category, limit 4)
        if (productData && productData.category_name) {
          const relatedRes = await fetchProducts({ 
            category: productData.category_name, 
            limit: 5 // 5 mangwa rahe hain taaki current filter karke 4 bachein
          });
          
          const relatedData = relatedRes.data || relatedRes;
          
          if (Array.isArray(relatedData)) {
            // Current product ko list se hatao
            setRelated(relatedData.filter(p => p.id !== Number(id)).slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };

    getDetails();
    window.scrollTo(0, 0); 
  }, [id]);

  const handleAdd = () => {
    if (product) {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent" size={40} />
        <p className="text-ink3 animate-pulse font-medium">Fetching details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-syne font-black text-2xl text-ink mb-3">Product Not Found</h2>
          <button onClick={() => navigate("/products")} className="text-accent underline font-medium">
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  const grad = catColors[product.category_name] || "from-gray-50 to-gray-100";

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-ink3 hover:text-accent mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Image Section */}
          <div className={`bg-gradient-to-br ${grad} rounded-3xl h-80 md:h-full min-h-[400px] flex items-center justify-center relative overflow-hidden border border-black/[0.03]`}>
            <img
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <Badge tag={product.tag_name} />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  {product.category_name} {product.subcategory_name && `· ${product.subcategory_name}`}
                </span>
              </div>
              <h1 className="font-syne font-black text-3xl md:text-4xl text-ink mb-3">
                {product.name}
              </h1>
              
              <StarRating 
                rating={Number(product.avg_rating) || 0} 
                reviews={Number(product.review_count) || 0} 
              />

              <p className="text-ink2 leading-relaxed my-5">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  ["Thickness", product.thickness || "N/A"],
                  ["Width", product.width || "N/A"],
                  ["Min. Order", `${product.min_order || 0} ${product.unit || 'units'}`],
                  ["In Stock", `${product.stock || 0} ${product.unit || 'units'}`],
                ].map(([l, v]) => (
                  <div key={l} className="bg-surface rounded-xl px-4 py-3 border border-black/[0.03]">
                    <div className="text-xs text-ink3 mb-0.5 font-medium">{l}</div>
                    <div className="font-bold text-sm text-ink">{v}</div>
                  </div>
                ))}
              </div>

              {/* Applications Chips */}
              {product.applications && (
                <div className="mb-5">
                  <div className="text-xs text-ink3 mb-2 font-bold uppercase tracking-tighter">Applications</div>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(product.applications) ? product.applications : product.applications.split(',')).map((a) => (
                      <span
                        key={a}
                        className="text-[10px] bg-accent/5 text-accent px-3 py-1 rounded-full border border-accent/10 font-bold uppercase"
                      >
                        {String(a).trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-black/[0.07] pt-5">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-syne font-black text-4xl text-accent">
                  ₹{product.price}
                </span>
                <span className="text-ink3 text-sm font-medium">
                  / {product.unit} (Min {product.min_order} {product.unit})
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    added 
                    ? "bg-green-600 text-white shadow-green-200" 
                    : "bg-accent text-white hover:bg-orange-700 active:scale-[0.98] shadow-accent/20"
                  }`}
                >
                  {added ? (
                    <> <CheckCircle size={18} /> Added to Cart </>
                  ) : (
                    <> <ShoppingCart size={18} /> Add to Cart </>
                  )}
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="px-6 py-4 rounded-xl border-2 border-black/5 text-sm font-bold text-ink hover:bg-surface transition-colors"
                >
                  Get Quote
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
               <h2 className="font-syne font-black text-2xl text-ink">Related Products</h2>
               <div className="h-[2px] flex-1 bg-black/[0.05]"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
      <WhyChooseUs />
    </>
  );
}