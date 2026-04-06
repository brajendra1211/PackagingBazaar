const variants = {
  bestseller: "bg-accent text-white",
  trending:   "bg-amber-500 text-white",
  featured:   "bg-blue-600 text-white",
  new:        "bg-green-600 text-white",
};
export default function Badge({ tag }) {
  if (!tag) return null;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${variants[tag] || "bg-gray-500 text-white"}`}>
      {tag}
    </span>
  );
}
