import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerSellerAPI } from "../services/authServices.js";
import { getAuthState } from "../utils/auth";
import { useNotification } from "../context/NotificationContext";
import {
  CheckCircle, Building2, User, Lock, Eye, EyeOff,
  Mail, Clock, Shield, ArrowRight, ChevronRight,
  MapPin, AlertCircle,
} from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const FILM_TYPES = ["BOPP", "PET", "CPP", "LAMINATED", "Others"];
const BUSINESS_TYPES = ["Manufacturer", "Trader", "Stockist", "Distributor", "Converter"];
const STATES = [
  "Gujarat", "Maharashtra", "Rajasthan", "Delhi", "Karnataka",
  "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Telangana", "Other",
];

const inputCls =
  "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 " +
  "focus:outline-none focus:border-[#e8511a] focus:bg-white focus:ring-2 " +
  "focus:ring-[#e8511a]/10 transition-all text-gray-800 placeholder:text-gray-400";

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label} {required && <span className="text-[#e8511a]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

// ─── PHASE INDICATOR ─────────────────────────────────────────────────────────
function PhaseIndicator({ phase }) {
  const phases = [
    { num: 1, label: "Personal Account Details" },
    { num: 2, label: "Business Profile" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 py-5 bg-white border-b border-gray-100">
      {phases.map((p, i) => (
        <div key={p.num} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                phase > p.num
                  ? "bg-green-500 border-green-500 text-white"
                  : phase === p.num
                  ? "bg-[#e8511a] border-[#e8511a] text-white"
                  : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              {phase > p.num ? <CheckCircle size={14} /> : p.num}
            </div>
            <span
              className={`text-sm font-semibold hidden md:block ${
                phase === p.num ? "text-[#e8511a]" : phase > p.num ? "text-green-600" : "text-gray-400"
              }`}
            >
              {p.label}
            </span>
          </div>
          {i < phases.length - 1 && (
            <div className={`h-0.5 w-10 sm:w-16 rounded mx-1 ${phase > 1 ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function BecomeaSeller() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1); // 1 = Personal, 2 = Business
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notifySuccess, notifyError } = useNotification();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Already logged in → redirect seller to dashboard
  const { token, role } = getAuthState();
  useEffect(() => {
    if (token && role === "seller") navigate("/seller/dashboard", { replace: true });
  }, [token, role, navigate]);

  // ── FORM STATE ──────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: [],
    gstNumber: "",
    yearEstablished: "",
    city: "",
    state: "",
    address: "",
    filmTypes: [],
    monthlyCapacity: "",
    priceRange: "",
    description: "",
  });

  const setF = (k, v) => setFormData((f) => ({ ...f, [k]: v }));
  
  const toggleBusiness = (type) =>
    setF(
      "businessType",
      formData.businessType.includes(type)
        ? formData.businessType.filter((t) => t !== type)
        : [...formData.businessType, type]
    );

  const toggleFilm = (film) =>
    setF(
      "filmTypes",
      formData.filmTypes.includes(film)
        ? formData.filmTypes.filter((f) => f !== film)
        : [...formData.filmTypes, film]
    );

  // ── PHASE 1 VALIDATION ────────────────────────────────────
  const handleNextToBusiness = () => {
    if (!formData.ownerName.trim()) return notifyError("Please enter your full name.");
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return notifyError("Please enter a valid email address.");
    if (!formData.password || formData.password.length < 6)
      return notifyError("Password must be at least 6 characters long.");
    if (formData.password !== formData.confirmPassword)
      return notifyError("Passwords do not match.");
    
    // Everything is good for phase 1
    window.scrollTo(0, 0);
    setPhase(2);
  };

  // ── PHASE 2 VALIDATION AND FULL SUBMISSION ───────────────
  const handleSubmit = async () => {
    // Basic structural checks for step 2
    if (!formData.businessName.trim()) return notifyError("Please enter your company/business name.");
    if (formData.businessType.length === 0) return notifyError("Please select at least one business type.");
    if (!formData.gstNumber.trim()) return notifyError("Please enter your GST number.");
    if (!formData.city.trim()) return notifyError("Please enter your city.");
    if (!formData.state) return notifyError("Please select your state.");

    setLoading(true);
    try {
      // Send the entire 2-step form combined payload to our API
      const res = await registerSellerAPI(formData);
      if (res.success) {
        notifySuccess("Application submitted successfully!");
        setSuccess(true);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full">
          {/* Success icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5 mx-auto">
              <CheckCircle size={50} className="text-green-600" />
            </div>
            <h2 className="font-syne font-black text-3xl text-gray-900 mb-2">
              Application Received! 🎉
            </h2>
            <p className="text-gray-500 text-sm">
              Thank you,{" "}
              <strong className="text-gray-800">{formData.ownerName}</strong>! Your seller
              application has been submitted.
            </p>
          </div>

          {/* Admin Verification Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-amber-600 shrink-0" />
              <p className="text-amber-800 font-bold text-sm">Admin Verification Pending</p>
            </div>
            <p className="text-amber-700 text-sm leading-relaxed">
              Your data has been sent to the admin.{" "}
              <strong>Admin will verify your account within 24 hours</strong>. You will be able to log in after verification.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex-1 py-3 rounded-xl bg-[#e8511a] text-white text-sm font-bold hover:bg-[#d4460f] transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-gray-900 py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-[#e8511a]">
            Seller Program
          </span>
          <h1 className="font-syne font-black text-3xl sm:text-4xl text-white mt-2 mb-1">
            Become a Seller
          </h1>
          <p className="text-white/50 text-sm">
            Join PackagingBazaar — India's trusted B2B packaging marketplace.
          </p>
        </div>
      </div>

      <PhaseIndicator phase={phase} />

      <div className="max-w-2xl mx-auto px-4 mt-8">
        {token && role === "user" && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>
              You are already logged in with a <strong>user account</strong>. Please use a
              different email for a seller account.
            </span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          
          {phase === 1 && (
            <div className="animate-fadeIn">
              {/* SECTION 1: ACCOUNT DETAILS */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-[#e8511a]/10 rounded-xl flex items-center justify-center">
                  <User size={18} className="text-[#e8511a]" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Personal Account Details</h2>
                  <p className="text-xs text-gray-400">Step 1 — Basic login information</p>
                </div>
              </div>

              <div className="space-y-5">
                <Field label="Your Full Name" required>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className={inputCls + " pl-10"}
                      placeholder="e.g. Rahul Sharma"
                      value={formData.ownerName}
                      onChange={(e) => setF("ownerName", e.target.value)}
                    />
                  </div>
                </Field>

                <Field label="Email Address" required hint="This email will be used for login">
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      className={inputCls + " pl-10"}
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => setF("email", e.target.value)}
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Create Password" required hint="Minimum 6 characters">
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPw ? "text" : "password"}
                        className={inputCls + " pl-10 pr-12"}
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={(e) => setF("password", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e8511a]"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirm Password" required>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        className={inputCls + " pl-10 pr-12"}
                        placeholder="Re-type password"
                        value={formData.confirmPassword}
                        onChange={(e) => setF("confirmPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e8511a]"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                </div>

                <button
                  onClick={handleNextToBusiness}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#e8511a] text-white text-sm font-bold hover:bg-[#d4460f] transition-all shadow-lg shadow-orange-200 mt-6"
                >
                  Next: Business Profile <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {phase === 2 && (
            <div className="animate-fadeIn">
              {/* SECTION 2: BUSINESS DETAILS */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-[#e8511a]/10 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-[#e8511a]" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Business Profile</h2>
                  <p className="text-xs text-gray-400">Step 2 — Company & operation details</p>
                </div>
              </div>

              <div className="space-y-5">
                <Field label="Business / Company Name" required>
                  <input
                    className={inputCls}
                    placeholder="e.g. Sharma Films Pvt. Ltd."
                    value={formData.businessName}
                    onChange={(e) => setF("businessName", e.target.value)}
                  />
                </Field>

                <Field label="Business Type" required hint="You can select more than one">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {BUSINESS_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleBusiness(t)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          formData.businessType.includes(t)
                            ? "bg-[#e8511a] text-white border-[#e8511a] shadow-md shadow-orange-200"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#e8511a]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="GST Number" required>
                    <input
                      className={inputCls}
                      placeholder="22AAAAA0000A1Z5"
                      value={formData.gstNumber}
                      onChange={(e) => setF("gstNumber", e.target.value.toUpperCase())}
                      maxLength={15}
                    />
                  </Field>
                  <Field label="Year Established">
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="e.g. 2010"
                      value={formData.yearEstablished}
                      onChange={(e) => setF("yearEstablished", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City" required>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className={inputCls + " pl-10"}
                        placeholder="e.g. Surat"
                        value={formData.city}
                        onChange={(e) => setF("city", e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field label="State" required>
                    <select
                      className={inputCls}
                      value={formData.state}
                      onChange={(e) => setF("state", e.target.value)}
                    >
                      <option value="">Select state...</option>
                      {STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Business Address">
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={2}
                    placeholder="Full address..."
                    value={formData.address}
                    onChange={(e) => setF("address", e.target.value)}
                  />
                </Field>

                <Field label="Film Types You Sell">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {FILM_TYPES.map((film) => (
                      <button
                        key={film}
                        type="button"
                        onClick={() => toggleFilm(film)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          formData.filmTypes.includes(film)
                            ? "bg-[#e8511a] text-white border-[#e8511a] shadow-md shadow-orange-200"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#e8511a]"
                        }`}
                      >
                        {film}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Monthly Capacity (MT)">
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="e.g. 50"
                      value={formData.monthlyCapacity}
                      onChange={(e) => setF("monthlyCapacity", e.target.value)}
                    />
                  </Field>
                  <Field label="Price Range (₹/kg)">
                    <input
                      className={inputCls}
                      placeholder="e.g. 80-120"
                      value={formData.priceRange}
                      onChange={(e) => setF("priceRange", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Brief Description">
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    placeholder="Tell us something about your business..."
                    value={formData.description}
                    onChange={(e) => setF("description", e.target.value)}
                  />
                </Field>

                {/* Info notice */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-xs">
                  <Clock size={15} className="shrink-0 mt-0.5" />
                  <span>
                    After submitting, your data will go to the admin for review. Admin{" "}
                    <strong>will verify within 24 hours</strong>. You won't be able to log in until then.
                  </span>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { window.scrollTo(0, 0); setPhase(1); }}
                    className="px-5 py-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-[#e8511a] text-white text-sm font-bold hover:bg-[#d4460f] disabled:opacity-60 transition-all shadow-lg shadow-orange-200"
                  >
                    {loading ? "Submitting Application..." : <>Submit Application <ArrowRight size={16} /></>}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}