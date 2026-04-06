export default function PolicyPage() {
  const sections = [
    {
      title: "Privacy Policy",
      content:
        "PackagingBazaar collects only the information necessary to process your orders and improve our services. We do not sell or share your personal data with third parties without your consent. All data is stored securely on encrypted servers.",
    },
    {
      title: "Return Policy",
      content:
        "We accept returns within 7 days of delivery if the product is defective or does not match the specifications ordered. Returns must be initiated by contacting our support team. Custom orders are non-returnable once production has started.",
    },
    {
      title: "Shipping Policy",
      content:
        "All orders are dispatched within 48 business hours of payment confirmation. We ship pan-India via trusted logistics partners. Bulk orders above 500 kg qualify for free shipping. Standard delivery takes 3-7 working days.",
    },
    {
      title: "Terms of Use",
      content:
        "By using PackagingBazaar, you agree to our terms. Products listed are for commercial use only. Minimum order quantities apply. PackagingBazaar reserves the right to modify pricing without prior notice. Disputes are subject to Mumbai jurisdiction.",
    },
    {
      title: "Quality Assurance",
      content:
        "All products undergo quality checks before dispatch. We provide test reports for bulk orders. In case of quality discrepancy, we offer free replacement or full refund at our discretion after inspection.",
    },
  ];
  return (
    <>
      <div className="bg-ink py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-accent">
            Legal
          </span>
          <h1 className="font-syne font-black text-4xl text-white mt-2">
            Policies
          </h1>
        </div>
      </div>
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl border border-black/[0.07] p-7"
            >
              <h2 className="font-syne font-black text-xl text-ink mb-3">
                {s.title}
              </h2>
              <p className="text-ink2 leading-relaxed text-sm">{s.content}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
