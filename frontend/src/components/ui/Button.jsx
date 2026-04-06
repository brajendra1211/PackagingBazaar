export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 text-sm px-5 py-2.5 cursor-pointer";
  const variants = {
    primary:   "bg-accent text-white hover:bg-orange-700 active:scale-95",
    secondary: "bg-transparent text-ink border border-ink/20 hover:border-ink/40 hover:bg-ink/5",
    ghost:     "bg-transparent text-accent hover:bg-accent/10",
    dark:      "bg-ink text-white hover:bg-ink2",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
