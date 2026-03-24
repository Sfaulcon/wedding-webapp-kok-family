import { Heart, Calendar } from "lucide-react";
import Countdown from "./Countdown";

const Header: React.FC = () => {
  return (
    <header className="text-center pb-6">
      <Heart
        className="mx-auto mb-3"
        size={28}
        style={{ color: "#8F4930", fill: "#8F4930", opacity: 0.8 }}
        strokeWidth={1.5}
      />
      <h1
        className="text-4xl md:text-5xl font-serif tracking-wide"
        style={{ color: "#343516" }}
      >
        Francois & Kaitlyn
      </h1>
      <p className="text-lg md:text-xl mt-3 font-light flex items-center justify-center gap-2" style={{ color: "#8F4930" }}>
        <Calendar size={20} strokeWidth={2} />
        12 December 2026
      </p>
      <Countdown targetDate="2026-12-12T00:00:00" />
    </header>
  );
};

export default Header;
