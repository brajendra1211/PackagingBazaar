import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerSellerAPI } from "../services/api";
import {
  CheckCircle, Package, TrendingUp, Users, ShieldCheck, ArrowRight,
  Building2, Phone, Lock, Eye, EyeOff, ChevronRight, Layers, FileText
} from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
// 🔥 Yahan humne IDs add kar di hain taaki DB mein numbers save hon
const FILM_TYPES = [
  { id: 1, name: "BOPP" },
  { id: 2, name: "PET" },
  { id: 3, name: "CPP" },
  { id: 4, name: "LAMINATED" },
  { id: 5, name: "Others" }
];

const BENEFITS = [
  { icon: TrendingUp, title: "Grow Your Sales", desc: "Reach 10,000+ verified buyers across India looking for packaging films." },
  { icon: Users, title: "Verified Buyer Network", desc: "Connect with pre-vetted manufacturers, FMCG brands, and distributors." },
  { icon: ShieldCheck, title: "Secure Transactions", desc: "Payment protection and trade assurance on every order." },
  { icon: Package, title: "Easy Catalog Management", desc: "List unlimited SKUs with specs, pricing, and MOQ in minutes." },
];

const BUSINESS_TYPES = ["Manufacturer", "Distributor", "Trader", "Converter"];
const STATES = ["Gujarat", "Maharashtra", "Rajasthan", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Telangana", "Other"];
const STEPS = ["Business Info", "Contact Details", "Products & Capacity", "Review & Submit"];

const inputCls = "w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-surface focus:outline-none focus:border-accent transition-colors text-ink placeholder:text-ink3";

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              i < current ? "bg-accent border-accent text-white" : i === current ? "bg-white border-accent text-accent" : "bg-white border-black/10 text-ink3"
            }`}>
              {i < current ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium hidden sm:block whitespace-nowrap ${i === current ? "text-accent" : "text-ink3"}`}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-10 sm:w-16 mx-1 mb-4 rounded transition-all ${i < current ? "bg-accent" : "bg-black/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-ink uppercase tracking-wider">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function BecomeaSeller() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    gstNumber: "",
    yearEstablished: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    state: "",
    address: "",
    filmTypes: [], // Yahan ab IDs save hongi [1, 2]
    monthlyCapacity: "",
    priceRange: "",
    description: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // 🔥 Updated Toggle: Ab ye film.id check karega
  const toggleFilm = (filmId) =>
    set("filmTypes", form.filmTypes.includes(filmId) 
      ? form.filmTypes.filter((id) => id !== filmId) 
      : [...form.filmTypes, filmId]
    );

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Backend ko seedha array bhej rahe hain, controller join(", ") kar lega
      const response = await registerSellerAPI(form);
      if (response.success) {
        setSubmitted(true);
      }
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Check your GST or Email.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-white">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="font-syne font-black text-3xl text-ink text-center mb-3">Application Submitted!</h2>
        <p className="text-ink2 text-center max-w-md mb-2">Thank you, <strong>{form.ownerName}</strong>! Your application for <strong>{form.businessName}</strong> has been received.</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate("/")} className="px-6 py-3 rounded-xl border border-black/15 text-sm font-medium text-ink hover:bg-surface transition-colors">Back to Home</button>
          <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 transition-colors">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      <div className="bg-ink py-14 px-4 text-center sm:text-left">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-accent">Seller Program</span>
          <h1 className="font-syne font-black text-4xl text-white mt-2 mb-1">Become a Seller</h1>
          <p className="text-white/50 text-sm max-w-lg">Join PackagingBazaar and grow your B2B sales across India.</p>
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-10 shadow-sm">
          <StepIndicator current={step} />

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {/* STEP 0: Business Info */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={18} className="text-accent" /><h3 className="font-syne font-bold text-lg text-ink">Business Information</h3>
              </div>
              <Field label="Business / Company Name" required>
                <input className={inputCls} placeholder="e.g. Sharma Films Pvt. Ltd." value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
              </Field>
              <Field label="Business Type" required>
                <select className={inputCls} value={form.businessType} onChange={(e) => set("businessType", e.target.value)}>
                  <option value="">Select type...</option>
                  {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="GST Number" required>
                  <input className={inputCls} placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value.toUpperCase())} maxLength={15} />
                </Field>
                <Field label="Year Established">
                  <input className={inputCls} placeholder="e.g. 2010" type="number" value={form.yearEstablished} onChange={(e) => set("yearEstablished", e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 1: Contact Details */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-1">
                <Phone size={18} className="text-accent" /><h3 className="font-syne font-bold text-lg text-ink">Contact Details</h3>
              </div>
              <Field label="Owner Name" required>
                <input className={inputCls} placeholder="Full name" value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email Address" required>
                  <input className={inputCls} type="email" placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="Phone / WhatsApp" required>
                  <input className={inputCls} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
              </div>
              <Field label="Create Password" required>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3"><Lock size={16} /></span>
                  <input className={`${inputCls} pl-10 pr-12`} type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={(e) => set("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink3 hover:text-accent">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
                <Field label="State" required>
                  <select className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)}>
                    <option value="">Select...</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* STEP 2: Products & Capacity */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-1">
                <Layers size={18} className="text-accent" /><h3 className="font-syne font-bold text-lg text-ink">Products & Capacity</h3>
              </div>
              <Field label="Film Types You Sell" required>
                <div className="flex flex-wrap gap-2 mt-1">
                  {FILM_TYPES.map(film => (
                    <button 
                      key={film.id} 
                      type="button" 
                      onClick={() => toggleFilm(film.id)} 
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${form.filmTypes.includes(film.id) ? "bg-accent text-white border-accent" : "bg-surface text-ink2 border-black/[0.08]"}`}
                    >
                      {film.name}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Monthly Capacity (MT)" required><input className={inputCls} type="number" value={form.monthlyCapacity} onChange={(e) => set("monthlyCapacity", e.target.value)} /></Field>
                <Field label="Price Range (₹/kg)"><input className={inputCls} value={form.priceRange} onChange={(e) => set("priceRange", e.target.value)} /></Field>
              </div>
              <Field label="Brief Description"><textarea className={inputCls + " resize-none"} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={18} className="text-accent" /><h3 className="font-syne font-bold text-lg text-ink">Review Application</h3>
              </div>
              <div className="bg-surface rounded-2xl p-5 space-y-2 text-sm">
                <p><strong>Company:</strong> {form.businessName}</p>
                <p><strong>GST:</strong> {form.gstNumber}</p>
                <p><strong>Owner:</strong> {form.ownerName}</p>
                {/* 🔥 Yahan hum IDs ko name mein convert karke dikha rahe hain */}
                <p><strong>Films:</strong> {FILM_TYPES.filter(f => form.filmTypes.includes(f.id)).map(f => f.name).join(", ")}</p>
                <p><strong>Location:</strong> {form.city}, {form.state}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-black/[0.06]">
            {step > 0 ? (
              <button disabled={loading} onClick={() => setStep(s => s - 1)} className="px-5 py-3 rounded-xl border border-black/15 text-sm font-medium text-ink hover:bg-surface">← Back</button>
            ) : <div />}
            
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700">Next <ChevronRight size={16} /></button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 disabled:bg-orange-300">
                {loading ? "Registering..." : "Submit Application"} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}