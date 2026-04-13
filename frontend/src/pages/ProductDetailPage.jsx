import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// FIX: Changed import path to productServices
import { fetchProductById, fetchProducts, fetchProductVariants } from "../services/productServices"; 
import { useCart } from "../context/CartContext";
import Badge from "../components/ui/Badge";
import StarRating from "../components/ui/StarRating";
import ProductCard from "../components/ui/ProductCard";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import InquiryModal from "../components/ui/InquiryModal";
import { ShoppingCart, ArrowLeft, CheckCircle, Loader2, Send, ShieldCheck, MessageCircle } from "lucide-react";

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
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState(null);

  const handleOpenInquiry = (p) => {
    setInquiryProduct(p || product);
    setIsModalOpen(true);
  };

  // Specifications Selection State
  const [selectedThickness, setSelectedThickness] = useState("");
  const [selectedWidth, setSelectedWidth] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

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
            limit: 5 // Requesting 5 to leave 4 after filtering current product
          });
          
          const relatedData = relatedRes.data || relatedRes;
          
          if (Array.isArray(relatedData)) {
            // Remove current product from the list
            setRelated(relatedData.filter(p => p.id !== Number(id)).slice(0, 4));
          }
        }
        // 3. Fetch sibling variants
        const variantsRes = await fetchProductVariants(id);
        if (variantsRes.success) {
          setVariants(variantsRes.variants || []);
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
      // Create a product object that includes the user's specific selections
      const productWithSpecs = {
        ...product,
        selected_thickness: selectedThickness,
        selected_width: selectedWidth,
        selected_brand: selectedBrand
      };
      
      addToCart(productWithSpecs);
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
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-ink3 hover:text-accent mb-4 transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 lg:mb-20 items-start">
          {/* Image Section */}
          <div className="lg:sticky lg:top-24">
            <div className={`bg-gradient-to-br ${grad} rounded-3xl h-[280px] sm:h-[400px] lg:h-[520px] flex items-center justify-center relative overflow-hidden border border-black/[0.03] shadow-inner`}>
              <img
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-contain p-6 sm:p-10 lg:p-12 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <Badge tag={product.tag_name} />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <div className="text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="text-[10px] sm:text-xs font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full border border-accent/10">
                  {product.category_name} {product.subcategory_name && `· ${product.subcategory_name}`}
                </span>
                <div className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                  <span className="text-[10px] sm:text-[11px] font-bold">Sold by: {product.seller_name || "PackagingBazaar Hub"}</span>
                  {product.is_verified ? <ShieldCheck size={12} className="text-green-500 shrink-0" /> : null}
                </div>
              </div>
              <h1 className="font-syne font-black text-3xl sm:text-4xl lg:text-5xl text-ink mb-3 leading-tight uppercase tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex justify-center lg:justify-start">
                <StarRating 
                  rating={Number(product.avg_rating) || 0} 
                  reviews={Number(product.review_count) || 0} 
                />
              </div>

              <p className="text-ink2 text-sm sm:text-base leading-relaxed my-6 sm:my-8 text-center lg:text-left">
                {product.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
                {[
                  ["Thickness", product.thickness || "N/A"],
                  ["Width", product.width || "N/A"],
                  ["Min. Order", `${product.min_order || 0} ${product.unit || 'units'}`],
                  ["In Stock", `${product.stock || 0} ${product.unit || 'units'}`],
                ].map(([l, v]) => (
                  <div key={l} className="bg-surface rounded-2xl p-4 border border-black/[0.03] shadow-sm">
                    <div className="text-[9px] sm:text-[10px] text-ink3 mb-1 font-black uppercase tracking-wider">{l}</div>
                    <div className="font-black text-sm text-ink">{v}</div>
                  </div>
                ))}
              </div>

              {/* Applications Chips */}
              {product.applications && (
                <div className="mb-8 text-center lg:text-left">
                  <div className="text-[10px] text-ink3 mb-3 font-black uppercase tracking-widest text-gray-400">Applications / Usage</div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    {(Array.isArray(product.applications) ? product.applications : product.applications.split(',')).map((a) => (
                      <span
                        key={a}
                        className="text-[10px] sm:text-[11px] bg-white text-ink2 px-4 py-1.5 rounded-full border border-black/[0.06] font-bold shadow-sm"
                      >
                        {String(a).trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 mt-6">
               {/* Selection Options */}
               <div className="bg-white rounded-3xl p-6 border border-black/[0.05] shadow-sm">
                  <div className="space-y-6">
                     {/* Thickness Selection - Visual Chips */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Select Thickness (Micron)</label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                           {[12, 15, 18, 20, 23, 25, 30, 35, 40, 50, 60].map(m => (
                              <button
                                 key={m}
                                 onClick={() => setSelectedThickness(`${m} Micron`)}
                                 className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all ${
                                    selectedThickness === `${m} Micron`
                                    ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                                    : "bg-gray-50 border-gray-100 text-gray-600 hover:border-accent/30"
                                 }`}
                              >
                                 {m}µ
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Manufacturer/Brand Selection - Visual Chips */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Preferred Manufacturer Brand</label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                           {["Uflex", "Cosmo", "Jindal", "Polyplex", "Garware", "Any Brand"].map(b => (
                              <button
                                 key={b}
                                 onClick={() => setSelectedBrand(b)}
                                 className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold border transition-all ${
                                    selectedBrand === b
                                    ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                                    : "bg-gray-50 border-gray-100 text-gray-600 hover:border-accent/30"
                                 }`}
                              >
                                 {b}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Width Selection */}
                     <div className="space-y-2 pt-2 border-t border-gray-50">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Specific Width (mm / inch)</label>
                        <input 
                           type="text"
                           placeholder="Enter specific width (e.g. 500mm)"
                           value={selectedWidth}
                           onChange={(e) => setSelectedWidth(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                        />
                     </div>
                  </div>
               </div>

               <div className="border-t border-black/[0.07] pt-5">
                  <div className="flex items-baseline gap-2 mb-3">
                     <span className="font-syne font-black text-3xl text-accent">
                        ₹{product.price}
                     </span>
                     <span className="text-ink3 text-[11px] font-medium">
                        / {product.unit} (Min {product.min_order} {product.unit})
                     </span>
                  </div>
                   <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => handleOpenInquiry(product)}
                        className="w-full sm:flex-[2] flex items-center justify-center gap-3 bg-accent text-white py-4.5 sm:py-5 rounded-2xl font-black text-sm uppercase tracking-[3px] shadow-2xl shadow-orange-200 hover:bg-orange-600 active:scale-[0.98] transition-all"
                      >
                         <Send size={20} className="shrink-0" /> Get Best Price
                      </button>
                     
                     <button
                        onClick={handleAdd}
                        disabled={!selectedThickness || !selectedWidth || !selectedBrand}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-xs transition-all border-2 ${
                           added 
                           ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-100" 
                           : (!selectedThickness || !selectedWidth || !selectedBrand)
                               ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                               : "bg-white border-black/5 text-ink hover:bg-gray-50 active:scale-[0.98]"
                        }`}
                     >
                        {added ? (
                           <> <CheckCircle size={18} /> Added </>
                        ) : (
                           <> <ShoppingCart size={18} /> Add to Cart </>
                        )}
                     </button>
                  </div>
                  {(!selectedThickness || !selectedWidth || !selectedBrand) && (
                     <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-3 animate-pulse">
                        * Please select all specifications to add to cart
                     </p>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* All Variants Reflection Section */}
        {variants?.length > 0 && (
          <div className="mt-10 bg-gray-50 rounded-[2.5rem] p-6 md:p-8 border border-black/[0.03]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
               <div>
                  <h3 className="font-syne font-black text-xl text-gray-900">Available Variations</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Explore different specifications and sizes for this material</p>
               </div>
               <div className="h-px flex-1 bg-gray-200/50 mx-6 hidden md:block"></div>
               <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-xs">
                  {variants.length} Variations Available
               </span>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-3">
               {variants.map(v => (
                  <div 
                    key={v.id}
                    onClick={() => {
                        navigate(`/product/${v.id}`);
                        window.scrollTo(0, 0);
                    }}
                    className="bg-white p-3 rounded-2xl flex items-center gap-3 hover:shadow-lg hover:shadow-black/5 transition-all cursor-pointer group border border-transparent hover:border-accent/10"
                  >
                     <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-1.5">
                        <img 
                            src={v.image_url} 
                            alt={v.name} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                            onError={(e) => {
                                // Real path fallback
                                e.target.src = product.image_url;
                            }}
                        />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[13px] text-gray-900 truncate pr-4">{v.name}</h4>
                        <div className="flex gap-2 mt-0.5">
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Micron: {v.thickness || 'N/A'}</span>
                           <span className="text-[8px] font-black text-gray-400 border-l border-gray-200 pl-2 uppercase tracking-tighter">Width: {v.width || 'N/A'}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-accent font-black text-xs">₹{v.price}</p>
                        <p className="text-[8px] text-gray-400 font-bold">In Stock</p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
               <h2 className="font-syne font-black text-2xl text-ink">Related Products</h2>
               <div className="h-[2px] flex-1 bg-black/[0.05]"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onInquiry={handleOpenInquiry} 
                />
              ))}
            </div>
          </div>
        )}
        {/* Inquiry Modal Integration */}
        <InquiryModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setInquiryProduct(null);
          }} 
          product={inquiryProduct} 
        />
      </div>
      <WhyChooseUs />
    </>
  );
}