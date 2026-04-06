import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../services/api"; // API service import karo
import ProductCard from "../ui/ProductCard";
import { Loader2 } from "lucide-react";

export default function FeaturedProducts() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFeaturedData = async () => {
      try {
        // Backend ko tag='featured' aur limit=3 (ya jitne tum dikhana chaho) bhej rahe hain
        const response = await fetchProducts({ 
          tag: "featured", 
          limit: 8, 
          page: 1 
        });
        setFeaturedItems(response.data);
      } catch (error) {
        console.error("Featured products load karne mein dikkat aayi:", error);
      } finally {
        setLoading(false);
      }
    };

    getFeaturedData();
  }, []);

  return (
    <section className="py-16 px-4 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-semibold tracking-[3px] uppercase text-accent">
              Our Range
            </span>
            <h2 className="font-syne font-black text-3xl text-ink mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
          >
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="text-center py-10 text-ink3">
            No featured products at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}