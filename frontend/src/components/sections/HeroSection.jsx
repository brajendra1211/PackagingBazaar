import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Package, Users } from "lucide-react";
export default function HeroSection() {
  return (
    <section className="bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-xs font-semibold text-accent mb-6">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            Premium Packaging Films
          </div>
          <h1 className="font-syne font-black text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.05] tracking-tight mb-6">
            BOPP, PET &<br />
            <span className="text-accent">CPP Laminates</span>
            <br />
            for Every Industry
          </h1>
          <p className="text-base text-ink3 leading-relaxed mb-8 max-w-lg">
            High-quality flexible packaging solutions. Buy direct or list your
            products on our marketplace — trusted by 500+ manufacturers across
            India.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="bg-accent text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-colors"
            >
              Explore Products <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="border border-black/15 text-ink font-medium px-6 py-3 rounded-xl hover:bg-surface transition-colors"
            >
              Become a Seller
            </Link>
          </div>
          <div className="flex gap-8 mt-10 pt-8 border-t border-black/[0.06]">
            {[
              [500, "Businesses"],
              [50, "Product Types"],
              ["12+", "Years Exp."],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-syne font-black text-2xl text-ink">
                  {n}+
                </div>
                <div className="text-xs text-ink3 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Visual */}
        <div className="relative hidden md:flex items-center justify-center">
          <div className="absolute w-80 h-80 bg-accent/5 rounded-full" />
          <div className="relative grid grid-cols-2 gap-4">
            {[
              {
                label: "BOPP Films",
                sub: "18 variants",
                color: "#4caf50",
                bg: "#e8f5e9",
              },
              {
                label: "PET Films",
                sub: "16 variants",
                color: "#2196f3",
                bg: "#e3f2fd",
              },
              {
                label: "CPP Films",
                sub: "16 variants",
                color: "#ff9800",
                bg: "#fff3e0",
              },
              {
                label: "Laminates",
                sub: "10 variants",
                color: "#9c27b0",
                bg: "#f3e5f5",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-black/[0.07] p-5 flex flex-col gap-3"
                style={{ background: c.bg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: c.color + "20" }}
                >
                  <Package size={20} style={{ color: c.color }} />
                </div>
                <div>
                  <div className="font-syne font-bold text-sm text-ink">
                    {c.label}
                  </div>
                  <div className="text-xs text-ink3">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
