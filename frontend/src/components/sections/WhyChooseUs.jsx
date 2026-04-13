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
    <section className="bg-ink py-16 sm:py-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 sm:mb-16 text-center lg:text-left">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[3px] uppercase text-accent block mb-2 sm:mb-3">
            Why PackagingBazaar
          </span>
          <h2 className="font-syne font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase leading-tight">
            Why Choose Us
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group border border-white/[0.08] rounded-3xl p-6 sm:p-8 hover:border-accent/40 transition-all hover:bg-white/[0.02]"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/15 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <Icon size={24} className="sm:w-7 sm:h-7 text-accent" />
              </div>
              <h3 className="font-syne font-bold text-white text-lg sm:text-xl mb-3">
                {title}
              </h3>
              <p className="text-sm sm:text-base text-white/50 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
