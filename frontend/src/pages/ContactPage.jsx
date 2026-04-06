import { Mail, Phone, MapPin, Send } from "lucide-react";
import WhyChooseUs from "../components/sections/WhyChooseUs";
export default function ContactPage() {
  return (
    <>
      <div className="bg-ink py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-accent">
            Get In Touch
          </span>
          <h1 className="font-syne font-black text-4xl text-white mt-2">
            Contact Us
          </h1>
        </div>
      </div>
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-syne font-black text-2xl text-ink mb-4">
              Send us a message
            </h2>
            <p className="text-ink3 text-sm mb-6 leading-relaxed">
              Fill out the form and our team will get back to you within 2 hours
              with a custom quote.
            </p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Your Name"
                  className="border border-black/10 rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-accent w-full"
                />
                <input
                  placeholder="Company Name"
                  className="border border-black/10 rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-accent w-full"
                />
              </div>
              <input
                placeholder="Email Address"
                type="email"
                className="border border-black/10 rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-accent w-full"
              />
              <input
                placeholder="Phone Number"
                className="border border-black/10 rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-accent w-full"
              />
              <select className="border border-black/10 rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-accent w-full text-ink2">
                <option>Select Product Type</option>
                <option>BOPP Films</option>
                <option>PET Films</option>
                <option>CPP Films</option>
                <option>Become a Seller</option>
              </select>
              <textarea
                placeholder="Your message or requirements..."
                rows={4}
                className="border border-black/10 rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-accent w-full resize-none"
              />
              <button
                type="submit"
                className="bg-accent text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-orange-700 transition-colors"
              >
                <Send size={15} /> Send Message
              </button>
            </form>
          </div>
          <div className="space-y-5">
            <h2 className="font-syne font-black text-2xl text-ink">
              Contact Info
            </h2>
            {[
              [Mail, "Email", "Admin@packagingbazaar.co.in"],
              [Phone, "Phone", "+91 96674 35374"],
              [MapPin, "Address", "Noida, Uttar Pradesh"],
            ].map(([Icon, label, l1, l2]) => (
              <div
                key={label}
                className="flex gap-4 bg-white rounded-2xl border border-black/[0.07] p-5"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-ink mb-1">
                    {label}
                  </div>
                  <div className="text-sm text-ink3">{l1}</div>
                  <div className="text-sm text-ink3">{l2}</div>
                </div>
              </div>
            ))}
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5">
              <h3 className="font-syne font-bold text-ink mb-2">
                Become a Seller
              </h3>
              <p className="text-sm text-ink2 leading-relaxed">
                Want to list your packaging films on PackagingBazaar? Fill the
                form above and select "Become a Seller". Our team will contact
                you within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>
      <WhyChooseUs />
    </>
  );
}
