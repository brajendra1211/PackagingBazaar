import { useNavigate } from "react-router-dom";
import { getAuthState } from "../utils/auth";

export default function NotFound() {
  const navigate = useNavigate();
  const { token, role } = getAuthState();

  const handleGoBack = () => {
    if (!token) {
      navigate("/");
    } else if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "seller") {
      navigate("/seller/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="font-syne font-black text-8xl text-accent/20 mb-4">404</div>
      <h1 className="font-syne font-black text-3xl text-ink mb-2">Page Not Found</h1>
      <p className="text-ink3 mb-6">The page you're looking for doesn't exist.</p>
      <button 
        onClick={handleGoBack} 
        className="bg-accent text-white px-8 py-3.5 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
      >
        {token ? "Back to Dashboard" : "Back to Home"}
      </button>
    </div>
  );
}

