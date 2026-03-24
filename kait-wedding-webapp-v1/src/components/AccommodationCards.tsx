import { useState } from "react";
import { Home, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export type AccommodationOption = {
  name: string;
  distance: string;
  url: string;
  notes?: string;
};

const CARDS_PER_PAGE = 2;

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
    <section>
      <h3 className="text-xl font-serif text-center mb-6 flex items-center justify-center gap-2" style={{ color: "#343516" }}>
        <Home size={22} style={{ color: "#8F4930" }} strokeWidth={2} />
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
          className="flex-shrink-0 w-10 h-10 rounded-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:text-[#8F4930] transition-all duration-200 selectable-3d disabled:hover:transform-none glass-subtle"
          style={{ color: "#343516" }}
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        <div key={page} className="flex-1 grid gap-4 grid-cols-1 sm:grid-cols-2">
          {visibleOptions.map((opt, i) => (
            <a
              key={start + i}
              href={opt.url}
              className="block p-4 rounded-xl border border-transparent hover:border-[#8F4930]/60 transition-all duration-200 group selectable-3d shadow-sm animate-fade-in-scale h-[140px] flex flex-col glass-subtle"
              target="_blank"
              rel="noopener noreferrer"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col mb-2">
                <Home size={20} className="flex-shrink-0 mb-1.5 self-center" style={{ color: "#8F4930" }} strokeWidth={2} />
                <h4 className="font-medium group-hover:text-[#8F4930] line-clamp-1" style={{ color: "#343516" }}>
                  {opt.name}
                </h4>
              </div>
              {opt.distance && (
                <p className="text-sm mt-1 flex-shrink-0" style={{ color: "#8F4930" }}>
                  {opt.distance} from venue
                </p>
              )}
              {opt.notes && (
                <p className="text-xs mt-2 line-clamp-2 opacity-80 flex-1 min-h-0" style={{ color: "#343516" }}>
                  {opt.notes}
                </p>
              )}
              <span className="inline-flex items-center gap-1 mt-auto pt-2 text-xs group-hover:text-[#8F4930] transition-colors flex-shrink-0" style={{ color: "#8F4930" }}>
                View details
                <ExternalLink size={12} strokeWidth={2} />
              </span>
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          aria-label="Next accommodation options"
          className="flex-shrink-0 w-10 h-10 rounded-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:text-[#8F4930] transition-all duration-200 selectable-3d disabled:hover:transform-none glass-subtle"
          style={{ color: "#343516" }}
        >
          <ChevronRight size={20} strokeWidth={2} />
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
