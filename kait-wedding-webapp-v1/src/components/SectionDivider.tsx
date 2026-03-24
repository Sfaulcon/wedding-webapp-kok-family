import { Heart } from "lucide-react";

/**
 * Decorative divider between sections - centred flourish instead of a full-width line.
 */
const SectionDivider: React.FC = () => (
  <div className="flex items-center justify-center gap-3 my-10 md:my-12" aria-hidden>
    <span
      className="flex-1 max-w-16 h-px"
      style={{ backgroundColor: "rgba(52, 53, 22, 0.15)" }}
    />
    <Heart
      size={12}
      style={{ color: "#8F4930", fill: "#8F4930", opacity: 0.6 }}
      strokeWidth={1.5}
    />
    <span
      className="flex-1 max-w-16 h-px"
      style={{ backgroundColor: "rgba(52, 53, 22, 0.15)" }}
    />
  </div>
);

export default SectionDivider;
