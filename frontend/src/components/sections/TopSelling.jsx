import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchTopSelling } from "../../services/api"; // API method import karo
import { TrendingUp, Loader2 } from "lucide-react";

const catColors = {
  BOPP: "bg-green-100 text-green-800",
  PET: "bg-blue-100 text-blue-800",
  CPP: "bg-orange-100 text-orange-800",
  LAMINATED: "bg-purple-100 text-purple-800",
};

export default function TopSelling() {
  const navigate = useNavigate();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopSellingData = async () => {
      try {
        const res = await fetchTopSelling();
        setTopItems(res.data); // Backend array yahan set hoga
      } catch (err) {
        console.error("Top selling data load nahi hua:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTopSellingData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-semibold tracking-[3px] uppercase text-accent">
              Most Popular
            </span>
            <h2 className="font-syne font-black text-3xl text-ink mt-1">
              Top Selling Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topItems.map((p, i) => (
            <div
              key={p.id}
              onClick={() => navigate(`/products/${p.id}`)}
              className="bg-surface rounded-2xl border border-black/[0.07] p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <span className="font-syne font-black text-3xl text-accent/20 min-w-[2rem]">
                0{i + 1}
              </span>
              <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-white border border-black/[0.05]">
                <img
                  src={p.image_url} // Backend se image_url aa raha hai
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-ink truncate">
                  {p.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      catColors[p.category_name] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.category_name}
                  </span>
                  <span className="text-[11px] text-ink3 flex items-center gap-0.5 font-medium">
                    <TrendingUp size={10} className="text-green-500" />
                    {p.review_count} reviews
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}