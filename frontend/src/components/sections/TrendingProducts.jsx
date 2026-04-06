import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../services/productServices"; 
import ProductCard from "../ui/ProductCard";

export default function TrendingProducts() {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTrendingData = async () => {
      try {
        // Backend ko tag='trending' bhej rahe hain
        const response = await fetchProducts({ 
          tag: "trending", 
          limit: 8,
          page: 1 
        });

        // ✅ Safe Data Setting: agar response.data hai toh wo, warna direct response
        // Aksar axios mein response.data array hota hai, ya fir pura response hi array hota hai
        const data = response.data || response;
        setTrendingItems(Array.isArray(data) ? data : []);

      } catch (error) {
        console.error("Trending products load nahi ho paye:", error);
      } finally {
        setLoading(false);
      }
    };

    getTrendingData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-ink3 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Trends...</span>
      </div>
    );
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
            View all →
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