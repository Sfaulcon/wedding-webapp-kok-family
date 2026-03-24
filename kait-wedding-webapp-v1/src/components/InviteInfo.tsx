import { useState } from "react";
import { createPortal } from "react-dom";
import { Shirt, UtensilsCrossed, Gift, X } from "lucide-react";
import type { WebsiteInfo } from "../App";

type InviteInfoProps = {
  websiteInfo: WebsiteInfo;
};

const Lightbox: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}> = ({ title, icon, children, onClose }) =>
  createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full rounded-2xl p-6 shadow-xl animate-fade-in-scale"
        style={{
          background: "rgba(204, 184, 157, 0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: "0 25px 50px -12px rgba(52, 53, 22, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
        >
          <X size={20} strokeWidth={2} style={{ color: "#343516" }} />
        </button>
        <div className="flex flex-col items-center text-center gap-5 mb-8">
          <div style={{ color: "#8F4930" }}>{icon}</div>
          <h3 className="text-xl font-serif" style={{ color: "#343516" }}>
            {title}
          </h3>
        </div>
        <div className="text-sm leading-relaxed text-center" style={{ color: "#343516" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );

const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay?: number;
}> = ({ title, icon, onClick, delay = 0 }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-5 px-4 rounded-xl animate-fade-in-up glass-subtle text-left flex flex-col items-center gap-3 transition-all hover:border-[#8F4930]/50"
    style={{ animationDelay: `${delay}ms`, border: "1px solid transparent" }}
  >
    <div style={{ color: "#8F4930" }}>{icon}</div>
    <span className="font-medium" style={{ color: "#343516" }}>
      {title}
    </span>
    <span className="text-xs" style={{ color: "#8F4930" }}>
      Click to read more
    </span>
  </button>
);

const InviteInfo: React.FC<InviteInfoProps> = ({ websiteInfo }) => {
  const [openLightbox, setOpenLightbox] = useState<"dress" | "food" | "gifts" | null>(null);

  return (
    <section className="pt-2 pb-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <InfoCard
          title="Dress code"
          icon={<Shirt size={24} style={{ color: "#8F4930" }} strokeWidth={2} />}
          onClick={() => setOpenLightbox("dress")}
          delay={0}
        />
        <InfoCard
          title="Food"
          icon={<UtensilsCrossed size={24} style={{ color: "#8F4930" }} strokeWidth={2} />}
          onClick={() => setOpenLightbox("food")}
          delay={100}
        />
        <InfoCard
          title="Gifts"
          icon={<Gift size={24} style={{ color: "#8F4930" }} strokeWidth={2} />}
          onClick={() => setOpenLightbox("gifts")}
          delay={200}
        />
      </div>

      {openLightbox === "dress" && (
        <Lightbox
          title="Dress Code"
          icon={<Shirt size={28} style={{ color: "#8F4930" }} strokeWidth={2} />}
          onClose={() => setOpenLightbox(null)}
        >
          <p className="text-center">{websiteInfo.dress_code}</p>
        </Lightbox>
      )}

      {openLightbox === "gifts" && (
        <Lightbox
          title="Gifts"
          icon={<Gift size={28} style={{ color: "#8F4930" }} strokeWidth={2} />}
          onClose={() => setOpenLightbox(null)}
        >
          <p className="text-center">{websiteInfo.gifts}</p>
        </Lightbox>
      )}

      {openLightbox === "food" && (
        <Lightbox
          title="Food"
          icon={<UtensilsCrossed size={28} style={{ color: "#8F4930" }} strokeWidth={2} />}
          onClose={() => setOpenLightbox(null)}
        >
          <div className="space-y-4 text-center">
            {websiteInfo.food_options.starters.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8F4930" }}>
                  Starters
                </h4>
                <ul className="list-none space-y-1">
                  {websiteInfo.food_options.starters.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              </div>
            )}
            {websiteInfo.food_options.mains.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8F4930" }}>
                  Main course
                </h4>
                <ul className="list-none space-y-1">
                  {websiteInfo.food_options.mains.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              </div>
            )}
            {websiteInfo.food_options.desserts.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8F4930" }}>
                  Desserts
                </h4>
                <ul className="list-none space-y-1">
                  {websiteInfo.food_options.desserts.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              </div>
            )}
            {websiteInfo.food_options.starters.length === 0 &&
              websiteInfo.food_options.mains.length === 0 &&
              websiteInfo.food_options.desserts.length === 0 && (
                <p className="opacity-80">Food options to be confirmed.</p>
              )}
          </div>
        </Lightbox>
      )}
    </section>
  );
};

export default InviteInfo;
