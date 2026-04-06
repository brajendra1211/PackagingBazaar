import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../services/api"; // Tumhari Axios service
import ProductCard from "../ui/ProductCard";

export default function TrendingProducts() {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTrendingData = async () => {
      try {
        // Hum backend ko bhej rahe hain: tag='trending' aur limit=3 (Section ke liye)
        const response = await fetchProducts({ 
          tag: "trending", 
          limit: 8,
          page: 1 
        });
        setTrendingItems(response.data);
      } catch (error) {
        console.error("Trending products load nahi ho paye:", error);
      } finally {
        setLoading(false);
      }
    };

    getTrendingData();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-ink3">Loading Trends...</div>;
  }

  return (
    <section className="py-16 px-4 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-semibold tracking-[3px] uppercase text-accent">
              Hot Right Now
            </span>
            <h2 className="font-syne font-black text-3xl text-ink mt-1">
              Trending Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
          >
          </Link>
        </div>

        {trendingItems.length === 0 ? (
          <div className="text-center py-10 text-ink3">No trending products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}