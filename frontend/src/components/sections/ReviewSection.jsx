import { reviews } from "../../data/reviews";
import StarRating from "../ui/StarRating";
export default function ReviewSection() {
  return (
    <section className="py-20 px-4 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="text-[11px] font-semibold tracking-[3px] uppercase text-accent">Testimonials</span>
          <h2 className="font-syne font-black text-3xl md:text-4xl text-ink mt-2">Customer Reviews</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-black/[0.07] p-6">
              <StarRating rating={r.rating} reviews={r.rating * 20}/>
              <p className="text-sm text-ink2 leading-relaxed my-4">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold font-syne" style={{background: r.color}}>{r.avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-ink">{r.name}</div>
                  <div className="text-xs text-ink3">{r.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
