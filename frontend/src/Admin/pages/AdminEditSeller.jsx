import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  RefreshCcw, 
  ChevronLeft 
} from "lucide-react";
import { updateSellerAdmin } from "../../services/adminServices";
import { useNotification } from "../../context/NotificationContext";

const inputCls = "w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-slate-50 focus:outline-none focus:bg-white focus:border-accent transition-colors text-ink placeholder:text-slate-400 font-medium";

const Field = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between">
      <label className="text-xs font-semibold text-ink uppercase tracking-wider">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

export default function AdminEditSeller() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    owner_name: "",
    business_type: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    business_address: "",
    description: "",
    status: ""
  });

  useEffect(() => {
    if (location.state?.seller) {
      setForm(location.state.seller);
    } else {
      // In a real app, fetch seller details by ID here
      notifyError("Seller data not found");
      navigate("/admin/sellers");
    }
  }, [id, location.state]);

  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await updateSellerAdmin(id, form);
      if (res.success) {
        notifySuccess("Seller updated successfully");
        navigate("/admin/sellers");
      }
    } catch (err) {
      notifyError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <button 
        onClick={() => navigate("/admin/sellers")}
        className="flex items-center gap-2 text-gray-500 hover:text-ink mb-6 font-bold text-sm"
      >
        <ChevronLeft size={18} /> Back to Sellers
      </button>

      <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden p-8 sm:p-12">
        <h3 className="font-syne font-black text-2xl uppercase mb-8 flex items-center gap-3">
          <Building2 className="text-accent" /> Edit Business Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <Field label="Company Name" required>
                <input className={inputCls} value={form.company_name} onChange={(e) => setVal("company_name", e.target.value)} />
              </Field>
              <Field label="Owner Name" required>
                <input className={inputCls} value={form.owner_name} onChange={(e) => setVal("owner_name", e.target.value)} />
              </Field>
              <Field label="Mobile Number" required>
                <input className={inputCls} value={form.mobile} onChange={(e) => setVal("mobile", e.target.value)} />
              </Field>
               <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => setVal("status", e.target.value)}>
                   <option value="verified">Verified</option>
                   <option value="hold">Hold</option>
                </select>
              </Field>
           </div>

           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <Field label="City">
                    <input className={inputCls} value={form.city} onChange={(e) => setVal("city", e.target.value)} />
                 </Field>
                 <Field label="Pincode">
                    <input className={inputCls} value={form.pincode} onChange={(e) => setVal("pincode", e.target.value)} />
                 </Field>
              </div>
              <Field label="State">
                <input className={inputCls} value={form.state} onChange={(e) => setVal("state", e.target.value)} />
              </Field>
              <Field label="Address">
                <textarea className={inputCls + " h-24"} value={form.business_address} onChange={(e) => setVal("business_address", e.target.value)} />
              </Field>
           </div>
        </div>

        <div className="mt-12 pt-8 border-t flex justify-end">
           <button 
             onClick={handleUpdate}
             disabled={loading}
             className="px-10 py-4 bg-accent text-white rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
           >
             {loading ? <RefreshCcw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
             Save Changes
           </button>
        </div>
      </div>
    </div>
  );
}
