import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
// FIX: Changed import path to productServices
import {
  fetchProductById,
  fetchProducts,
  fetchProductVariants,
  fetchSellersByGroupKey,
} from "../services/productServices";
import { getImageUrl } from "../services/api";
import { useCart } from "../context/CartContext";
import Badge from "../components/ui/Badge";
import StarRating from "../components/ui/StarRating";
import ProductCard from "../components/ui/ProductCard";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import InquiryModal from "../components/ui/InquiryModal";
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Send,
  ShieldCheck,
  MessageCircle,
  MapPin,
} from "lucide-react";

const catColors = {
  BOPP: "from-green-50 to-emerald-100",
  PET: "from-blue-50 to-sky-100",
  CPP: "from-orange-50 to-amber-100",
  LAMINATED: "from-purple-50 to-pink-100",
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get("sellerId");
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [otherSellers, setOtherSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);

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
        const res = await fetchProductById(id, sellerId);
        // Safe data handling
        const productData = res.data || res;
        setProduct(productData);

        // 2. Fetch related products (Same category, limit 4)
        if (productData && productData.category_name) {
          const relatedRes = await fetchProducts({
            category: productData.category_name,
            limit: 5, // Requesting 5 to leave 4 after filtering current product
          });

          const relatedData = relatedRes.data || relatedRes;

          if (Array.isArray(relatedData)) {
            // Remove current product from the list
            setRelated(
              relatedData.filter((p) => p.id !== Number(id)).slice(0, 4),
            );
          }
        }
        // 3. Fetch sibling variants
        const variantsRes = await fetchProductVariants(id);
        if (variantsRes.success) {
          setVariants(variantsRes.variants || []);
        }

        // 4. Fetch Other Sellers for comparison
        if (productData && productData.group_key) {
          setSellersLoading(true);
          const sellersRes = await fetchSellersByGroupKey(productData.group_key);
          if (sellersRes.success) {
            // Filter out current seller if needed, or show all
            setOtherSellers(sellersRes.data || []);
          }
          setSellersLoading(false);
        }
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };

    getDetails();
    window.scrollTo(0, 0);
  }, [id, sellerId]);

  const handleAdd = () => {
    if (product) {
      // Create a product object that includes the user's specific selections
      const productWithSpecs = {
        ...product,
        selected_thickness: selectedThickness,
        selected_width: selectedWidth,
        selected_brand: selectedBrand,
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
        <p className="text-ink3 animate-pulse font-medium">
          Fetching details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-syne font-black text-2xl text-ink mb-3">
            Product Not Found
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="text-accent underline font-medium"
          >
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
            <div
              className={`bg-gradient-to-br ${grad} rounded-3xl h-[280px] sm:h-[400px] lg:h-[520px] flex items-center justify-center relative overflow-hidden border border-black/[0.03] shadow-inner`}
            >
              <img
                src={getImageUrl(product.image_url)}
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
                  {product.category_name}{" "}
                  {product.subcategory_name && `· ${product.subcategory_name}`}
                </span>
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
                  ["Color", product.color || "N/A"],
                  [
                    "Min. Order",
                    `${product.min_order || 0} ${product.unit || "units"}`,
                  ],
                  [
                    "In Stock",
                    `${product.stock || 0} ${product.unit || "units"}`,
                  ],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="bg-surface rounded-2xl p-4 border border-black/[0.03] shadow-sm"
                  >
                    <div className="text-[9px] sm:text-[10px] text-ink3 mb-1 font-black uppercase tracking-wider">
                      {l}
                    </div>
                    <div className="font-black text-sm text-ink">{v}</div>
                  </div>
                ))}
              </div>

              {/* Applications Chips */}
              {product.applications && (
                <div className="mb-8 text-center lg:text-left">
                  <div className="text-[10px] text-ink3 mb-3 font-black uppercase tracking-widest text-gray-400">
                    Applications / Usage
                  </div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    {(() => {
                      let apps = [];
                      if (Array.isArray(product.applications)) {
                        apps = product.applications;
                      } else if (typeof product.applications === "string") {
                        try {
                          apps = JSON.parse(product.applications);
                        } catch {
                          apps = product.applications.split(",");
                        }
                      }
                      return Array.isArray(apps) ? apps : [];
                    })().map((a) => (
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                      Select Thickness (Micron)
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {[12, 15, 18, 20, 23, 25, 30, 35, 40, 50, 60].map((m) => (
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                      Preferred Manufacturer Brand
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {[
                        "Uflex",
                        "Cosmo",
                        "Jindal",
                        "Polyplex",
                        "Garware",
                        "Any Brand",
                      ].map((b) => (
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                      Specific Width (mm / inch)
                    </label>
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
                <div className="flex flex-col mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-syne font-black text-3xl text-accent">
                      ₹{product.min_price}
                    </span>
                    <span className="text-gray-400 font-bold">-</span>
                    <span className="font-syne font-black text-3xl text-accent">
                      ₹{product.max_price}
                    </span>
                  </div>
                  <span className="text-ink3 text-[11px] font-medium mt-1">
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
                    disabled={
                      !selectedThickness || !selectedWidth || !selectedBrand
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-xs transition-all border-2 ${
                      added
                        ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-100"
                        : !selectedThickness || !selectedWidth || !selectedBrand
                          ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                          : "bg-white border-black/5 text-ink hover:bg-gray-50 active:scale-[0.98]"
                    }`}
                  >
                    {added ? (
                      <>
                        {" "}
                        <CheckCircle size={18} /> Added{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        <ShoppingCart size={18} /> Add to Cart{" "}
                      </>
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

        {/* Other Sellers Comparison Section (Phase 3) */}
        {otherSellers.length > 1 && (
          <div className="mt-12 md:mt-16 bg-white rounded-[2.5rem] p-6 md:p-10 border border-black/[0.05] shadow-xl shadow-black/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-syne font-black text-2xl text-gray-900 uppercase tracking-tight">Compare Other Sellers</h2>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest mt-1">Get the best rates from verified manufacturers</p>
              </div>
              <div className="bg-accent/5 px-4 py-2 rounded-full border border-accent/10">
                <span className="text-[11px] font-black text-accent uppercase tracking-widest">{otherSellers.length} Sellers Available</span>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="min-w-[800px] inline-block w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manufacturer</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Range</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">MOQ / Stock</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {otherSellers.map((s) => (
                      <tr key={s.id} className={`group hover:bg-gray-50/50 transition-all ${s.id === product.id ? 'bg-orange-50/30' : ''}`}>
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                              {s.company_name[0]}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-sm leading-tight">{s.company_name}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {s.is_verified ? (
                                  <>
                                    <ShieldCheck size={10} className="text-green-500" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Verified Supplier</span>
                                  </>
                                ) : (
                                  <span className="text-[9px] font-bold text-gray-400 uppercase">Standard Supplier</span>
                                )}
                              </div>
                            </div>
                            {s.product_id === product.id && (
                                <span className="bg-accent/10 text-accent text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Current</span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                            <MapPin size={12} className="text-accent" />
                            {s.city}, {s.state}
                          </div>
                        </td>
                        <td className="py-5 pr-4">
                          <p className="font-black text-gray-900 text-sm">₹{s.price_min} - ₹{s.price_max}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Per {product.unit}</p>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block">Min Order: {s.moq} {product.unit}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded inline-block ${s.stock_qty > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                              {s.stock_qty > 0 ? `Ready Stock (${s.stock_qty})` : 'Out of Stock'}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 text-right">
                          <button 
                            onClick={() => {
                              navigate(`/products/${s.product_id}?sellerId=${s.seller_id}`);
                              window.scrollTo(0, 0);
                            }}
                            className="px-6 py-2.5 bg-white border border-black/10 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                          >
                            View Product
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Variants Reflection Section */}
        {variants?.length > 0 && (
          <div className="mt-12 bg-slate-50/50 rounded-[3rem] p-8 md:p-12 border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="space-y-1">
                <h3 className="font-syne font-black text-2xl text-gray-900 uppercase tracking-tight">
                  Available Variations
                </h3>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest">
                  Explore different specifications for this material
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-px w-24 bg-slate-200 hidden md:block"></div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm">
                  {variants.length} Variations Found
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {variants.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    navigate(`/products/${v.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white p-4 rounded-[2rem] flex items-center gap-5 hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer group border border-transparent hover:border-accent/10 active:scale-[0.99]"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 p-2 relative">
                    <img
                      src={getImageUrl(v.image_url)}
                      alt={v.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = getImageUrl(product.image_url);
                      }}
                    />
                    <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[8px] font-black bg-accent text-white px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm shadow-accent/20">
                        {v.thickness || "N/A"} Mc
                      </span>
                      <span className="text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter">
                        {v.color || "Standard"}
                      </span>
                    </div>
                    <h4 className="font-black text-base text-gray-900 truncate leading-tight mb-1">
                      {v.name}
                    </h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
                       {v.seller_name || "Verified Manufacturer"}
                    </p>
                  </div>

                  <div className="text-right border-l border-slate-50 pl-5">
                    <div className="text-accent font-black text-sm">
                      ₹{v.min_price}
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      Per {product.unit}
                    </div>
                    <div className="mt-2 text-[8px] font-black text-green-500 uppercase flex items-center justify-end gap-1">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      In Stock
                    </div>
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
              <h2 className="font-syne font-black text-2xl text-ink">
                Related Products
              </h2>
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
