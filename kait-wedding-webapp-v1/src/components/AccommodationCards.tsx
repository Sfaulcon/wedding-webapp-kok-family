import { useState } from "react";

export type AccommodationOption = {
  name: string;
  distance: string;
  url: string;
  notes?: string;
};

const CARDS_PER_PAGE = 3;

interface AccommodationCardsProps {
  options: AccommodationOption[];
}

const AccommodationCards: React.FC<AccommodationCardsProps> = ({ options }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(options.length / CARDS_PER_PAGE);
  const start = page * CARDS_PER_PAGE;
  const visibleOptions = options.slice(start, start + CARDS_PER_PAGE);

  if (!options?.length) return null;

  return (
    <section
      className="mt-12 pt-8"
      style={{ borderTop: "1px solid rgba(52, 53, 22, 0.25)" }}
    >
      <h3 className="text-xl font-serif text-center mb-6" style={{ color: "#343516" }}>
        Accommodation Options
      </h3>
      <p className="text-sm text-center mb-6 max-w-md mx-auto" style={{ color: "#8F4930" }}>
        For those needing a place to stay, here are some nearby options. Click to learn more.
      </p>

      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          aria-label="Previous accommodation options"
          className="flex-shrink-0 w-10 h-10 rounded-full border disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:text-[#8F4930] transition-all duration-200 selectable-3d disabled:hover:transform-none shadow-sm"
          style={{ backgroundColor: "#E2E4D8", borderColor: "rgba(52, 53, 22, 0.25)", color: "#343516" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div key={page} className="flex-1 grid gap-4 grid-cols-1 sm:grid-cols-3 min-h-[140px]">
          {visibleOptions.map((opt, i) => (
            <a
              key={start + i}
              href={opt.url}
              className="block p-4 rounded-lg border hover:border-[#8F4930]/60 transition-all duration-200 group selectable-3d shadow-sm animate-fade-in-scale"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#E2E4D8",
                borderColor: "rgba(52, 53, 22, 0.25)",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <h4 className="font-medium group-hover:text-[#8F4930]" style={{ color: "#343516" }}>
                {opt.name}
              </h4>
              {opt.distance && (
                <p className="text-sm mt-1" style={{ color: "#8F4930" }}>
                  {opt.distance} from venue
                </p>
              )}
              {opt.notes && (
                <p className="text-xs mt-2 line-clamp-2 opacity-80" style={{ color: "#343516" }}>
                  {opt.notes}
                </p>
              )}
              <span className="inline-block mt-2 text-xs group-hover:text-[#8F4930] transition-colors" style={{ color: "#8F4930" }}>
                View details →
              </span>
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          aria-label="Next accommodation options"
          className="flex-shrink-0 w-10 h-10 rounded-full border disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:text-[#8F4930] transition-all duration-200 selectable-3d disabled:hover:transform-none shadow-sm"
          style={{ backgroundColor: "#E2E4D8", borderColor: "rgba(52, 53, 22, 0.25)", color: "#343516" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {totalPages > 1 && (
        <p className="text-center text-sm mt-4" style={{ color: "#8F4930" }}>
          {page + 1} of {totalPages}
        </p>
      )}
    </section>
  );
};

export default AccommodationCards;
