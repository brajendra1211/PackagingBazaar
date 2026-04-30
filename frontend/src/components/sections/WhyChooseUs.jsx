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
    title: "Zero Compromise on Quality",
    text: "If it’s not right, it doesn’t go out. Every product is verified for strength, clarity, and consistency—so you never deal with surprises, complaints, or returns.",
  },
  {
    icon: Truck,
    title: "We Keep Your Supply Moving",
    text: "Delays cost money. We actively coordinate with suppliers to keep your orders moving and minimize hold-ups—because downtime isn’t an option.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Cut Costs. Not Corners.",
    text: "Why overpay? We connect you directly to manufacturers/stockist so you get real factory pricing, better margins, and bulk deals that actually make a difference to your bottom line.",
  },
  {
    icon: Headphones,
    title: "Real Support. Real People. Real Results.",
    text: "No generic responses. No runaround. Our team works with you to lock in the right product, solve issues fast, and keep your orders smooth from start to finish.",
  },
  {
    icon: Leaf,
    title: "Sell Smarter with Sustainable Options",
    text: "Demand for eco-friendly packaging is rising—fast. We help you stay ahead with reliable, high-performance sustainable materials your customers will value.",
  },
  {
    icon: Award,
    title: "Built for Repeat Business",
    text: "Our clients don’t come back by chance—they come back because it works. Consistent quality, dependable coordination, and pricing that keeps you competitive.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-ink relative py-16 sm:py-20 px-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[50%] bg-accent/[0.03] rotate-12 blur-[100px] rounded-full"></div>
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[60%] bg-white/[0.02] -rotate-12 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block py-1 px-4 rounded-full bg-accent/10 text-accent text-[10px] font-bold tracking-[3px] uppercase mb-4 border border-accent/20">
            Why PackagingBazaar
          </span>
          <h2 className="font-syne font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase leading-[1.1]">
            Why Choose Us
          </h2>
          <p className="mt-4 text-white/50 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We don't just supply packaging; we partner with you to streamline your operations, cut costs, and ensure consistent quality every single time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-[1.5rem] p-6 sm:p-7 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1] hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-accent/0 to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-accent group-hover:border-accent group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent group-hover:text-ink transition-colors duration-500" strokeWidth={1.5} />
                </div>
                
                <h3 className="font-syne font-bold text-white text-lg sm:text-xl mb-3 leading-snug">
                  {title}
                </h3>
                
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
