import { useNavigate } from "react-router-dom";
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="font-syne font-black text-8xl text-accent/20 mb-4">404</div>
      <h1 className="font-syne font-black text-3xl text-ink mb-2">Page Not Found</h1>
      <p className="text-ink3 mb-6">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/")} className="bg-accent text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors">
        Go Home
      </button>
    </div>
  );
}
