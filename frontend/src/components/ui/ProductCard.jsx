import { ShoppingCart, Eye } from "lucide-react";
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

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // SQL JOIN se humne category name nikala hai (agar 'category_name' bheja hai backend se)
  // Agar nahi bheja, toh tum fallback de sakte ho. Main maan ke chal raha hu tumhari API me category_name aa raha hai.
  const categoryName = product.category_name || "BOPP"; // Fallback just in case
  const grad = categoryColors[categoryName] || "from-gray-50 to-gray-100";

  const handleImageClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-black/[0.07] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group">
      {/* Image area */}
      <div
        className={`bg-gradient-to-br ${grad} h-44 flex items-center justify-center relative cursor-pointer overflow-hidden`}
        onClick={handleImageClick}
      >
        <div className="absolute top-3 left-3 z-10">
          {/* SQL join ne hume tag_name diya hai */}
          <Badge tag={product.tag_name} /> 
        </div>
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.id}`);
            }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-ink2 hover:text-accent"
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
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm text-ink2 border border-black/[0.07]">
            {categoryName} · {product.subcategory_name} 
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="font-syne font-bold text-sm text-ink mb-1 line-clamp-1 cursor-pointer hover:text-accent transition-colors"
          onClick={handleImageClick}
        >
          {product.name}
        </h3>
        <p className="text-xs text-ink3 mb-2 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] text-ink3 bg-surface px-2 py-0.5 rounded">
            {product.thickness}
          </span>
          <span className="text-[11px] text-ink3 bg-surface px-2 py-0.5 rounded">
            {product.width}
          </span>
        </div>
        
        {/* Star Rating (avg_rating aur review_count backend se aayega) */}
        <StarRating 
          rating={Number(product.avg_rating) || 0} 
          reviews={Number(product.review_count) || 0} 
        />
        
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-syne font-black text-lg text-accent">
              ₹{product.price}
            </span>
            <span className="text-xs text-ink3">
              /{product.unit} · Min {product.min_order}kg
            </span>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="w-9 h-9 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-orange-700 active:scale-95 transition-all"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}