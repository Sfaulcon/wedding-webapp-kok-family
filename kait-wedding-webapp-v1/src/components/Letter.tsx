import { ReactNode } from "react";

interface LetterProps {
  children: ReactNode;
}

const Letter: React.FC<LetterProps> = ({ children }) => {
  return (
    <article
      className="relative z-10 w-full max-w-2xl mx-4 md:mx-auto my-8 md:my-12 overflow-hidden animate-fade-in"
      style={{
        backgroundColor: "#CCB89D",
        boxShadow:
          "0 25px 50px -12px rgba(52, 53, 22, 0.2), 0 0 0 1px rgba(52, 53, 22, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
        borderRadius: "2px",
      }}
    >
      {/* Decorative inner frame */}
      <div
        className="absolute inset-4 md:inset-6 pointer-events-none rounded-[1px]"
        style={{ border: "1px solid rgba(52, 53, 22, 0.2)" }}
      />
      <div className="relative px-8 md:px-14 py-12 md:py-16">
        <div className="max-w-xl mx-auto">
          {children}
        </div>
      </div>
    </article>
  );
};

export default Letter;
