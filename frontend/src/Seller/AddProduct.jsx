import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Tag,
  Layers,
  FileText,
  Image,
  Plus,
  X,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["BOPP", "PET", "CPP", "LAMINATED"];

const SUBCATEGORIES = {
  BOPP: [
    "Transparent",
    "Pearl",
    "Matte",
    "Thermal",
    "Holographic",
    "Opaque",
    "Metalized",
    "Cold Seal",
    "Anti-fog",
    "Shrink",
    "Barrier",
    "Printable",
    "Soft Touch",
    "Woven",
    "Other",
  ],
  PET: [
    "Clear",
    "Metalized",
    "Matte",
    "White",
    "TTO",
    "Shrink",
    "Release",
    "Barrier",
    "Antistatic",
    "Printable",
    "UV Block",
    "Laminate",
    "Retort",
    "Other",
  ],
  CPP: [
    "Transparent",
    "Matte",
    "Metalized",
    "White",
    "Retort",
    "Pearl",
    "Low Seal",
    "Anti-fog",
    "Barrier",
    "Shrink",
    "Blister",
    "Soft Pack",
    "Printable",
    "Cold Chain",
    "Lamination",
    "Premium",
    "Other",
  ],
  LAMINATED: [
    "BOPP-PET",
    "PET-CPP",
    "PET-BOPP",
    "PET-PE",
    "BOPP-CPP",
    "3 Layer",
    "High Barrier",
    "BOPP-PE",
    "Retort",
    "Foil Laminate",
    "Other",
  ],
};

const TAGS = ["", "bestseller", "trending", "featured", "new", "premium"];
const UNITS = ["kg", "meter", "roll"];

const COMMON_APPLICATIONS = [
  "Food packaging",
  "Retail wrap",
  "Label stock",
  "Chocolate wrap",
  "Gift packaging",
  "Bakery",
  "Snack packaging",
  "Chips",
  "Namkeen",
  "Pharma",
  "Cosmetics",
  "Garments",
  "Textiles",
  "Dairy",
  "Beverages",
  "Frozen food",
  "Retort pouches",
  "Vacuum packs",
  "Flexible packaging",
];

const STEPS = ["Basic Info", "Specifications", "Applications", "Preview"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-surface focus:outline-none focus:border-accent transition-colors text-ink placeholder:text-ink3";

function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold text-ink uppercase tracking-wider">
          {label} {required && <span className="text-accent">*</span>}
        </label>
        {hint && <span className="text-[10px] text-ink3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < current
                  ? "bg-accent border-accent text-white"
                  : i === current
                    ? "bg-white border-accent text-accent"
                    : "bg-white border-black/10 text-ink3"
              }`}
            >
              {i < current ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-medium hidden sm:block ${i === current ? "text-accent" : "text-ink3"}`}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-8 sm:w-14 mx-1 mb-4 rounded ${i < current ? "bg-accent" : "bg-black/10"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const editProduct = location.state?.product || null;
  const isEdit = !!editProduct;

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [appInput, setAppInput] = useState("");

  const [form, setForm] = useState({
    name: editProduct?.name || "",
    category: editProduct?.category || "BOPP",
    subcategory: editProduct?.subcategory || "",
    tag: editProduct?.tag || "",
    // Step 2 - Specs
    thickness: editProduct?.thickness || "",
    width: editProduct?.width || "",
    price: editProduct?.price || "",
    unit: editProduct?.unit || "kg",
    minOrder: editProduct?.minOrder || "",
    stock: editProduct?.stock || "",
    // Step 3 - Applications + Description
    description: editProduct?.description || "",
    applications: editProduct?.applications || [],
    img: editProduct?.img || "",
    color: editProduct?.color || "#e8f5e9",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addApp = (app) => {
    if (app && !form.applications.includes(app)) {
      set("applications", [...form.applications, app]);
    }
    setAppInput("");
  };

  const removeApp = (app) =>
    set(
      "applications",
      form.applications.filter((a) => a !== app),
    );

  const handleSubmit = () => {
    // Dummy submit — replace with API call
    setSubmitted(true);
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-white">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="font-syne font-black text-3xl text-ink text-center mb-2">
          {isEdit ? "Product Updated!" : "Product Listed!"}
        </h2>
        <p className="text-ink2 text-center max-w-md mb-2">
          <strong>{form.name}</strong> has been{" "}
          {isEdit ? "updated" : "submitted for review"}.
        </p>
        <p className="text-ink3 text-sm text-center mb-8">
          {isEdit
            ? "Changes are live on your dashboard."
            : "It will go live within 24 hours after approval."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/seller/dashboard")}
            className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              setForm({
                name: "",
                category: "BOPP",
                subcategory: "",
                tag: "",
                thickness: "",
                width: "",
                price: "",
                unit: "kg",
                minOrder: "",
                stock: "",
                description: "",
                applications: [],
                img: "",
                color: "#e8f5e9",
              });
            }}
            className="px-6 py-3 rounded-xl border border-black/15 text-sm font-medium text-ink hover:bg-surface transition-colors"
          >
            Add Another
          </button>
        </div>
      </div>
    );
  }

  // ── Preview Card ───────────────────────────────────────────────────────────
  const PreviewCard = () => (
    <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden">
      <div className="bg-surface h-48 flex items-center justify-center relative">
        {form.img ? (
          <img
            src={form.img}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="text-center">
            <Image size={32} className="text-ink3 mx-auto mb-2" />
            <p className="text-xs text-ink3">No image URL</p>
          </div>
        )}
        {form.tag && (
          <span className="absolute top-3 left-3 text-[10px] bg-accent text-white px-2.5 py-0.5 rounded-full font-semibold capitalize">
            {form.tag}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-accent font-semibold mb-1">
          {form.category} · {form.subcategory}
        </div>
        <h3 className="font-syne font-black text-base text-ink mb-1">
          {form.name || "Product Name"}
        </h3>
        <p className="text-xs text-ink3 line-clamp-2 mb-3">
          {form.description || "No description"}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            ["Thickness", form.thickness],
            ["Width", form.width],
            ["Min Order", form.minOrder ? `${form.minOrder} kg` : "—"],
            ["Stock", form.stock ? `${form.stock} kg` : "—"],
          ].map(([l, v]) => (
            <div key={l} className="bg-surface rounded-lg px-3 py-2">
              <div className="text-[10px] text-ink3">{l}</div>
              <div className="text-xs font-semibold text-ink">{v || "—"}</div>
            </div>
          ))}
        </div>
        {form.applications.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.applications.map((a) => (
              <span
                key={a}
                className="text-[10px] bg-accent/10 text-accent px-2.5 py-0.5 rounded-full border border-accent/20"
              >
                {a}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-baseline gap-1.5">
          <span className="font-syne font-black text-2xl text-accent">
            {form.price ? `₹${form.price}` : "₹—"}
          </span>
          <span className="text-xs text-ink3">/ {form.unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-ink py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/seller/dashboard")}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <span className="text-xs font-semibold tracking-[3px] uppercase text-accent">
            Seller Panel
          </span>
          <h1 className="font-syne font-black text-3xl text-white mt-1">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {isEdit
              ? "Update your product listing details"
              : "List your packaging film on PackagingBazaar"}
          </p>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Form (left 2/3) ───────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-10 shadow-sm">
                <StepIndicator current={step} />

                {/* ── Step 0: Basic Info ──────────────────────────────────── */}
                {step === 0 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={18} className="text-accent" />
                      <h3 className="font-syne font-bold text-lg text-ink">
                        Basic Information
                      </h3>
                    </div>

                    <Field label="Product Name" required>
                      <input
                        className={inputCls}
                        placeholder="e.g. BOPP Transparent Film"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Category" required>
                        <select
                          className={inputCls}
                          value={form.category}
                          onChange={(e) => {
                            set("category", e.target.value);
                            set("subcategory", "");
                          }}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Subcategory" required>
                        <select
                          className={inputCls}
                          value={form.subcategory}
                          onChange={(e) => set("subcategory", e.target.value)}
                        >
                          <option value="">Select...</option>
                          {(SUBCATEGORIES[form.category] || []).map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="Product Tag">
                      <div className="flex flex-wrap gap-2">
                        {TAGS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => set("tag", t)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                              form.tag === t
                                ? "bg-accent text-white border-accent"
                                : "bg-surface text-ink2 border-black/[0.08] hover:border-accent/40"
                            }`}
                          >
                            {t || "None"}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── Step 1: Specifications ──────────────────────────────── */}
                {step === 1 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers size={18} className="text-accent" />
                      <h3 className="font-syne font-bold text-lg text-ink">
                        Film Specifications
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Thickness" required hint="e.g. 20 micron">
                        <input
                          className={inputCls}
                          placeholder="20 micron"
                          value={form.thickness}
                          onChange={(e) => set("thickness", e.target.value)}
                        />
                      </Field>
                      <Field label="Width" required hint="e.g. 1000 mm">
                        <input
                          className={inputCls}
                          placeholder="1000 mm"
                          value={form.width}
                          onChange={(e) => set("width", e.target.value)}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Field label="Price" required hint="per unit">
                        <input
                          className={inputCls}
                          type="number"
                          placeholder="180"
                          value={form.price}
                          onChange={(e) => set("price", e.target.value)}
                        />
                      </Field>
                      <Field label="Unit" required>
                        <select
                          className={inputCls}
                          value={form.unit}
                          onChange={(e) => set("unit", e.target.value)}
                        >
                          {UNITS.map((u) => (
                            <option key={u}>{u}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Min. Order (kg)" required>
                        <input
                          className={inputCls}
                          type="number"
                          placeholder="50"
                          value={form.minOrder}
                          onChange={(e) => set("minOrder", e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Available Stock (kg)" required>
                      <input
                        className={inputCls}
                        type="number"
                        placeholder="e.g. 2400"
                        value={form.stock}
                        onChange={(e) => set("stock", e.target.value)}
                      />
                    </Field>

                    <Field
                      label="Product Image URL"
                      hint="Paste direct image link"
                    >
                      <input
                        className={inputCls}
                        placeholder="https://example.com/image.jpg"
                        value={form.img}
                        onChange={(e) => set("img", e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {/* ── Step 2: Applications ────────────────────────────────── */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={18} className="text-accent" />
                      <h3 className="font-syne font-bold text-lg text-ink">
                        Description & Applications
                      </h3>
                    </div>

                    <Field label="Product Description" required>
                      <textarea
                        className={inputCls + " resize-none"}
                        rows={4}
                        placeholder="Describe your film's key properties, certifications, and use cases..."
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                      />
                    </Field>

                    <Field label="Applications" required hint="Add one by one">
                      <div className="flex gap-2">
                        <input
                          className={inputCls}
                          placeholder="Type or select below..."
                          value={appInput}
                          onChange={(e) => setAppInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addApp(appInput.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addApp(appInput.trim())}
                          className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 transition-colors shrink-0"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Quick pick chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {COMMON_APPLICATIONS.filter(
                          (a) => !form.applications.includes(a),
                        ).map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => addApp(a)}
                            className="text-[11px] px-2.5 py-1 rounded-full border border-black/[0.08] bg-surface text-ink3 hover:border-accent/40 hover:text-accent transition-colors"
                          >
                            + {a}
                          </button>
                        ))}
                      </div>

                      {/* Added apps */}
                      {form.applications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 p-3 bg-surface rounded-xl">
                          {form.applications.map((a) => (
                            <span
                              key={a}
                              className="inline-flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20 font-medium"
                            >
                              {a}
                              <button
                                onClick={() => removeApp(a)}
                                className="hover:text-red-500 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </Field>
                  </div>
                )}

                {/* ── Step 3: Preview ─────────────────────────────────────── */}
                {step === 3 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Tag size={18} className="text-accent" />
                      <h3 className="font-syne font-bold text-lg text-ink">
                        Preview Your Listing
                      </h3>
                    </div>
                    <p className="text-xs text-ink3 mb-5">
                      This is how your product will appear to buyers. Review and
                      submit.
                    </p>

                    {/* Summary table */}
                    <div className="bg-surface rounded-2xl p-5 mb-5">
                      <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        {[
                          ["Name", form.name],
                          [
                            "Category",
                            `${form.category} / ${form.subcategory}`,
                          ],
                          ["Thickness", form.thickness],
                          ["Width", form.width],
                          ["Price", `₹${form.price} / ${form.unit}`],
                          ["Min Order", `${form.minOrder} kg`],
                          ["Stock", `${form.stock} kg`],
                          ["Tag", form.tag || "None"],
                        ].map(([l, v]) => (
                          <div key={l}>
                            <div className="text-[10px] text-ink3 uppercase tracking-wide">
                              {l}
                            </div>
                            <div className="font-semibold text-ink">
                              {v || "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-black/[0.06]">
                        <div className="text-[10px] text-ink3 uppercase tracking-wide mb-1">
                          Applications
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {form.applications.length > 0 ? (
                            form.applications.map((a) => (
                              <span
                                key={a}
                                className="text-xs bg-accent/10 text-accent px-2.5 py-0.5 rounded-full border border-accent/20"
                              >
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-ink3">
                              None added
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Navigation ─────────────────────────────────────────── */}
                <div className="flex justify-between mt-8 pt-6 border-t border-black/[0.06]">
                  {step > 0 ? (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="px-5 py-3 rounded-xl border border-black/15 text-sm font-medium text-ink hover:bg-surface transition-colors"
                    >
                      ← Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < 3 ? (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
                    >
                      <CheckCircle size={16} />
                      {isEdit ? "Save Changes" : "Submit Listing"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Live Preview (right 1/3) ───────────────────────────────── */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <p className="text-xs font-semibold text-ink3 uppercase tracking-wider mb-3">
                  Live Preview
                </p>
                <PreviewCard />
                <p className="text-[11px] text-ink3 text-center mt-3">
                  Updates as you fill the form
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
