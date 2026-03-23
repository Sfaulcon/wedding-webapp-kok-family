import Countdown from "./Countdown";

const Header: React.FC = () => {
  return (
    <header
      className="text-center pb-8"
      style={{ borderBottom: "1px solid rgba(52, 53, 22, 0.25)" }}
    >
      <h1
        className="text-4xl md:text-5xl font-serif tracking-wide"
        style={{ color: "#343516" }}
      >
        Francois & Kaitlyn
      </h1>
      <p className="text-lg md:text-xl mt-3 font-light" style={{ color: "#8F4930" }}>
        12 December 2026
      </p>
      <Countdown targetDate="2026-12-12T00:00:00" />
    </header>
  );
};

export default Header;
