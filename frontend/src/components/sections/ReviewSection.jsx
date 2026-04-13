import { useRef, useEffect } from "react";
import StarRating from "../ui/StarRating";

export default function ReviewSection() {
  const scrollRef = useRef(null);

  const reviews = [
    {
      id: 1,
      rating: 5,
      text: "PackagingBazaar completely transformed how we source BOPP films. The prices are unbeatable and the quality is highly consistent. We saved massive time and costs.",
      avatar: "RV",
      color: "#e8511a", // Accent
      name: "Rahul Verma",
      company: "Verma Foods Pvt. Ltd.",
    },
    {
      id: 2,
      rating: 5,
      text: "We were struggling to find reliable CPP film suppliers until we joined this platform. The verified seller tag makes everything so much safer for bulk deals.",
      avatar: "AP",
      color: "#2563eb", // Blue
      name: "Amit Patel",
      company: "Patel Packaging Solutions",
    },
    {
      id: 3,
      rating: 5,
      text: "As a seller, the dashboard is incredibly intuitive. I received my first bulk order within 48 hours of approval. Exceptional B2B platform for real business!",
      avatar: "SR",
      color: "#16a34a", // Green
      name: "Sneha Reddy",
      company: "Reddy Plastics",
    },
    {
      id: 4,
      rating: 4,
      text: "Great variety of Laminated films. The quotation system is super fast and we saved around 15% on our quarterly procurement compared to traditional markets.",
      avatar: "KS",
      color: "#9333ea", // Purple
      name: "Karan Singh",
      company: "KS Enterprises",
    },
    {
      id: 5,
      rating: 5,
      text: "The delivery tracking and customer support are top-notch. PackagingBazaar has become our primary source for all PET film needs across our factories.",
      avatar: "MG",
      color: "#db2777", // Pink
      name: "Meera Gupta",
      company: "Gupta Industries",
    }
  ];

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && scrollRef.current.children.length > 0) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const cardWidth = scrollRef.current.children[0].offsetWidth + 24; // Approx Card width + gap
        
        // If we reach the end, scroll back to the beginning fluidly
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
           scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
           scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' }); // Move one card forward
        }
      }
    }, 4000); // Scrolls every 4 seconds automatically
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 sm:py-24 px-4 bg-white overflow-hidden border-t border-black/[0.04]">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Section Heading */}
        <div className="text-center mb-10 sm:mb-16">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[3px] sm:tracking-[4px] uppercase text-accent bg-accent/5 px-4 py-1.5 rounded-full inline-block mb-3 sm:mb-4 border border-accent/10">Real Experiences</span>
            <h2 className="font-syne font-black text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight">What Our Clients Say</h2>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-12 pt-2 px-4 md:px-0"
        >
          {reviews.map((r) => (
             <div 
                key={r.id} 
                className="bg-[#fcfcfc] rounded-3xl p-6 shrink-0 w-[270px] md:w-[320px] snap-center border border-black/[0.04] shadow-sm hover:-translate-y-1 hover:shadow-[0_12px_40px_-5px_rgba(232,81,26,0.12)] hover:border-accent/20 transition-all duration-300 relative group flex flex-col"
             >
                <div className="absolute top-5 right-6 text-5xl font-serif text-black/[0.02] group-hover:text-accent/10 transition-colors leading-none">"</div>
                
                <StarRating rating={r.rating} reviews={null} />
                
                <p className="text-[13px] text-ink2 leading-relaxed my-5 flex-1 italic font-medium relative z-10">"{r.text}"</p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-black/[0.04]">
                   <div 
                     className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white text-[13px] font-medium shrink-0 shadow-inner" 
                     style={{background: `linear-gradient(135deg, ${r.color}cc, ${r.color})`}}
                   >
                     {r.avatar}
                   </div>
                   <div className="min-w-0">
                     <div className="text-[13px] font-bold text-ink truncate">{r.name}</div>
                     <div className="text-[10px] font-bold tracking-wider text-ink3 uppercase truncate mt-0.5">{r.company}</div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Global Style for hiding scrollbar specifically for this container */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
