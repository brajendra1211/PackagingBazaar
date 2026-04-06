import { Link } from "react-router-dom";
import { Package, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/60">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                <Package size={16} className="text-white" />
              </div>
              <span className="font-syne font-black text-lg text-white">
                Pack<span className="text-accent">Vista</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              India's trusted marketplace for BOPP, PET & CPP laminate films.
              Buy direct or sell on our platform.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-2">
                <Mail size={13} /> Admin@packagingbazaar.co.in
              </span>
              <span className="flex items-center gap-2">
                <Phone size={13} /> +91 96674 35374
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={13} /> Noida, Uttar Pradesh
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-syne font-bold text-sm text-white mb-4">
              Products
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "BOPP Films",
                "PET Films",
                "CPP Films",
                "Laminates",
                "Specialty Films",
              ].map((i) => (
                <li key={i}>
                  <Link
                    to="/products"
                    className="hover:text-accent transition-colors"
                  >
                    {i}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-syne font-bold text-sm text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                ["About Us", "/about"],
                ["Contact Us", "/contact"],
                ["Become a Seller", "/contact"],
                ["Blog", "#"],
              ].map(([l, h]) => (
                <li key={l}>
                  <Link to={h} className="hover:text-accent transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-syne font-bold text-sm text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                ["Privacy Policy", "/policy"],
                ["Return Policy", "/policy"],
                ["Terms of Use", "/policy"],
                ["Shipping Policy", "/policy"],
              ].map(([l, h]) => (
                <li key={l}>
                  <Link to={h} className="hover:text-accent transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.08] pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
          <span>© 2025 PackagingBazaar. All rights reserved.</span>
          <span>Made with ♥ in India</span>
        </div>
      </div>
    </footer>
  );
}
