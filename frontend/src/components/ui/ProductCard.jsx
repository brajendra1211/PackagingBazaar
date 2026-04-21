import { ShoppingCart, Eye, Send, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Badge from "./Badge";
import StarRating from "./StarRating";

const categoryColors = {
  BOPP: "from-green-50 to-emerald-100",
  PET: "from-blue-50 to-sky-100",
  CPP: "from-orange-50 to-amber-100",
  LAMINATED: "from-purple-50 to-pink-100",
};

export default function ProductCard({ product, onInquiry }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const categoryName = product.category_name || "BOPP"; 
  const grad = categoryColors[categoryName] || "from-gray-50 to-gray-100";

  const handleImageClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      ...product,
      selected_thickness: product.thickness,
      selected_width: product.width,
      selected_brand: product.brand || "Default"
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-black/[0.07] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group flex flex-col h-full">
      {/* Image area */}
      <div
        className={`bg-gradient-to-br ${grad} h-36 sm:h-48 md:h-52 flex items-center justify-center relative cursor-pointer overflow-hidden shrink-0`}
        onClick={handleImageClick}
      >
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
          <Badge tag={product.tag_name} /> 
        </div>
        
        {/* Hover Actions */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.id}`);
            }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-ink2 hover:text-accent border border-black/[0.05]"
            title="View Details"
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Database Image */}
        <img
          src={product.image_url} 
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
        />

        {/* Category chip */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10">
          <span className="text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm text-ink2 border border-black/[0.07]">
            {categoryName} · {product.subcategory_name} 
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 lg:p-5 flex flex-col flex-1">
        <h3
          className="font-syne font-black text-xs sm:text-sm md:text-base text-ink mb-1.5 line-clamp-1 cursor-pointer hover:text-accent transition-colors uppercase tracking-tight"
          onClick={handleImageClick}
        >
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-[11px] md:text-[13px] text-ink3 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed h-8 sm:h-9 md:h-12 overflow-hidden">
          {product.description}
        </p>
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[10px] text-ink3 bg-surface px-2 py-0.5 rounded">
            {product.thickness}
          </span>
          <span className="text-[10px] text-ink3 bg-surface px-2 py-0.5 rounded">
            {product.width}
          </span>
          {product.color && product.color !== 'N/A' && (
            <span className="text-[10px] text-ink3 bg-surface px-2 py-0.5 rounded uppercase font-bold">
              {product.color}
            </span>
          )}
        </div>
        
        <StarRating 
          rating={Number(product.avg_rating) || 0} 
          reviews={Number(product.review_count) || 0} 
        />
        
        <div className="flex items-center gap-1.5 mt-2 mb-1">
          <span className="text-[9px] text-ink3 uppercase font-black tracking-[1px]">Manufacturer:</span>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11px] font-bold text-gray-900 truncate">
              {product.seller_name}
            </span>
            {product.is_verified ? <ShieldCheck size={10} className="text-green-500 flex-shrink-0" /> : null}
          </div>
        </div>
        
        <div className="mt-auto pt-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="font-syne font-black text-sm lg:text-base text-ink">
                  ₹{product.min_price}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">-</span>
                <span className="font-syne font-black text-sm lg:text-base text-ink">
                  ₹{product.max_price}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">
                /{product.unit}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold whitespace-nowrap bg-surface px-1.5 py-0.5 rounded">Min. {product.min_order}kg</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile: icon only | Desktop: icon + text */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onInquiry) onInquiry(product);
              }}
              className="flex-1 bg-accent text-white rounded-xl flex items-center justify-center gap-1.5 hover:bg-orange-600 active:scale-[0.98] transition-all font-black uppercase shadow-lg shadow-orange-100 py-3 md:py-4"
            >
              <Send size={14} className="shrink-0" />
              <span className="hidden sm:inline text-[10px] md:text-[11px] tracking-widest">Get Best Price</span>
              <span className="sm:hidden text-[9px] tracking-wider">Quote</span>
            </button>

            <button
              onClick={handleAddToCart}
              className="p-3 md:p-4 bg-gray-900 text-white rounded-xl hover:bg-black active:scale-[0.95] transition-all shadow-lg shadow-gray-200 shrink-0"
              title="Add to Basket"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}