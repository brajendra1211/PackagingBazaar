import WhyChooseUs from "../components/sections/WhyChooseUs";
import ReviewSection from "../components/sections/ReviewSection";
export default function AboutPage() {
  return (
    <>
      <div className="bg-ink py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-accent">
            Our Story
          </span>
          <h1 className="font-syne font-black text-4xl text-white mt-2">
            About PackagingBazaar
          </h1>
        </div>
      </div>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 mb-14">
            <div>
              <h2 className="font-syne font-black text-3xl text-ink mb-4">
                India's Trusted Packaging Film Platform
              </h2>
              <p className="text-ink2 leading-relaxed mb-4">
                PackagingBazaar was founded in 2026 with a simple mission — make
                premium BOPP, PET, and CPP films accessible to manufacturers
                across India at fair prices.
              </p>
              <p className="text-ink2 leading-relaxed">
                What started as a small trading company in Mumbai has grown into
                a full-fledged marketplace connecting buyers and sellers across
                the flexible packaging industry.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["500+", "Happy Clients"],
                ["50+", "Product Variants"],
                ["12+", "Years Experience"],
                ["48 hrs", "Delivery Time"],
              ].map(([n, l]) => (
                <div
                  key={l}
                  className="bg-surface rounded-2xl p-5 border border-black/[0.07]"
                >
                  <div className="font-syne font-black text-3xl text-accent">
                    {n}
                  </div>
                  <div className="text-sm text-ink3 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-ink rounded-3xl p-8 text-white mb-14">
            <h3 className="font-syne font-black text-2xl mb-3">Our Mission</h3>
            <p className="text-white/60 leading-relaxed">
              To democratize access to premium flexible packaging films by
              building a transparent, fair, and efficient marketplace that
              empowers both buyers and sellers across India's manufacturing
              sector.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              [
                "Buyers",
                "We source directly from certified manufacturers and pass on the savings to you — no middlemen, no markup.",
                "#e8f5e9",
                "#2e7d32",
              ],
              [
                "Sellers",
                "List your products, reach 500+ active buyers, and grow your business with our built-in tools and marketing.",
                "#e3f2fd",
                "#1565c0",
              ],
              [
                "Quality",
                "Every product on our platform meets ISI/ISO quality norms. We audit our sellers regularly.",
                "#fff3e0",
                "#e65100",
              ],
            ].map(([t, d, bg, color]) => (
              <div
                key={t}
                className="rounded-2xl p-6 border border-black/[0.07]"
                style={{ background: bg }}
              >
                <h4
                  className="font-syne font-bold text-base mb-2"
                  style={{ color }}
                >
                  {t}
                </h4>
                <p className="text-sm text-ink2 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WhyChooseUs />
      <ReviewSection />
    </>
  );
}
