import type { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
}

/**
 * Elegant card wrapper for each content section. Neat, tidy, refined.
 */
const SectionCard: React.FC<SectionCardProps> = ({ children }) => (
  <div
    className="rounded-xl px-6 py-6 md:px-8 md:py-7 mb-6 last:mb-0"
    style={{
      background: "rgba(226, 228, 216, 0.5)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(52, 53, 22, 0.08)",
      boxShadow: "0 2px 12px rgba(52, 53, 22, 0.04)",
    }}
  >
    {children}
  </div>
);

export default SectionCard;
