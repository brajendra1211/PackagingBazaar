import {
  ShieldCheck,
  Truck,
  BadgeIndianRupee,
  Headphones,
  Leaf,
  Award,
} from "lucide-react";
const items = [
  {
    icon: ShieldCheck,
    title: "Certified Quality",
    text: "ISO certified manufacturing. Every roll tested for thickness, clarity & tensile strength.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Pan-India logistics. Orders dispatched within 48 hours. Bulk orders get priority.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Best Pricing",
    text: "Direct from manufacturer. No middlemen. Bulk discounts & custom quotes in 2 hours.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    text: "Dedicated account managers for B2B clients. Technical guidance on film selection.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Options",
    text: "Recyclable and biodegradable film variants available for sustainable packaging.",
  },
  {
    icon: Award,
    title: "12+ Years Experience",
    text: "Trusted by 500+ businesses across India with a proven track record in quality supply.",
  },
];
export default function WhyChooseUs() {
  return (
    <section className="bg-ink py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="text-[11px] font-semibold tracking-[3px] uppercase text-accent2">
            Why PackagingBazaar
          </span>
          <h2 className="font-syne font-black text-3xl md:text-4xl text-white mt-2">
            Why Choose Us
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="border border-white/[0.08] rounded-2xl p-6 hover:border-accent/40 transition-colors"
            >
              <div className="w-11 h-11 bg-accent/15 rounded-xl flex items-center justify-center mb-4">
                <Icon size={22} className="text-accent" />
              </div>
              <h3 className="font-syne font-bold text-white text-base mb-2">
                {title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
