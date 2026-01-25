import Countdown from "./Countdown";

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-white py-12 text-center">
      <h1 className="text-5xl font-bold mb-2">Francois & Kaitlyn</h1>
      <p className="text-xl mb-6">16 December 2026</p>
      <Countdown targetDate="2026-12-16T00:00:00" />
    </header>
  );
};

export default Header;