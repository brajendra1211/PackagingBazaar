import { useState, useEffect } from "react";
import { 
  fetchAllReviews, 
  addManualReview, 
  deleteReview, 
  updateReviewStatus 
} from "../../services/reviewServices";
import { fetchUniqueProductNames, fetchProducts } from "../../services/productServices";
import { 
  Star, Trash2, CheckCircle, Clock, Plus, 
  Search, MessageSquare, User, Package, X,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    product_id: "",
    reviewer_name: "",
    rating: 5,
    comment: "",
    status: "approved"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsData, productsData] = await Promise.all([
        fetchAllReviews(),
        fetchProducts({ limit: 1000 })
      ]);
      setReviews(reviewsData);
      setProducts(productsData.data || productsData);
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.reviewer_name || !formData.comment) {
      return toast.error("Please fill all fields");
    }

    try {
      const res = await addManualReview(formData);
      if (res.success) {
        toast.success("Review added successfully!");
        setShowAddModal(false);
        setFormData({ product_id: "", reviewer_name: "", rating: 5, comment: "", status: "approved" });
        loadData();
      }
    } catch (err) {
      toast.error("Error adding review");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await deleteReview(id);
      if (res.success) {
        toast.success("Review deleted");
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (err) {
      toast.error("Error deleting review");
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    try {
      const res = await updateReviewStatus(id, newStatus);
      if (res.success) {
        toast.success(`Review ${newStatus}`);
        setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.reviewer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-black text-ink uppercase tracking-tight">Product Reviews</h1>
          <p className="text-sm text-ink3 font-medium">Manage and add customer feedback</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10"
        >
          <Plus size={18} /> Add Manual Review
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-black/[0.05] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Reviews</p>
              <h3 className="text-2xl font-syne font-black text-ink">{reviews.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-black/[0.05] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved</p>
              <h3 className="text-2xl font-syne font-black text-ink">{reviews.filter(r => r.status === 'approved').length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-black/[0.05] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</p>
              <h3 className="text-2xl font-syne font-black text-ink">{reviews.filter(r => r.status === 'pending').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2.5rem] border border-black/[0.05] shadow-xl shadow-black/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search reviews, products or names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reviewer</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Comment</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading reviews...</p>
                     </div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="text-gray-200" size={48} />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No reviews found</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="group hover:bg-gray-50/30 transition-all">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                          <Package size={20} className="text-gray-400" />
                        </div>
                        <p className="font-black text-gray-900 text-sm truncate max-w-[150px]">{review.product_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         <User size={14} className="text-gray-400" />
                         <p className="font-bold text-gray-700 text-sm">{review.reviewer_name || review.user_name || "Anonymous"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < review.rating ? "fill-orange-400 text-orange-400" : "text-gray-200"} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-gray-600 text-xs line-clamp-2 italic max-w-[250px]">"{review.comment}"</p>
                    </td>
                    <td className="px-6 py-5">
                       <button 
                        onClick={() => handleStatusToggle(review.id, review.status)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                          review.status === 'approved' 
                          ? "bg-green-50 text-green-600 border border-green-100" 
                          : "bg-orange-50 text-orange-600 border border-orange-100"
                        }`}
                       >
                         {review.status}
                       </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="bg-white w-full max-w-md rounded-[2rem] relative z-10 shadow-2xl overflow-hidden animate-slideUp border border-white/20">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-syne font-black text-ink uppercase tracking-tight">New Review</h2>
                <p className="text-[10px] text-ink3 font-medium uppercase tracking-widest">Manual Customer Entry</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddReview} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-hide">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Product</label>
                <select 
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black/5"
                >
                  <option value="">Choose product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reviewer Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={formData.reviewer_name}
                  onChange={(e) => setFormData({...formData, reviewer_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rating</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-fit">
                   {[1,2,3,4,5].map(num => (
                      <button 
                        type="button"
                        key={num}
                        onClick={() => setFormData({...formData, rating: num})}
                        className={`transition-all ${formData.rating >= num ? "text-orange-400 scale-110" : "text-gray-200"}`}
                      >
                        <Star size={20} fill={formData.rating >= num ? "currentColor" : "none"} />
                      </button>
                   ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Review Message</label>
                <textarea 
                  placeholder="Type customer's feedback here..."
                  rows="3"
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 mt-2"
              >
                Post Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
