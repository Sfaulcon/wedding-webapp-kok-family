import { useState } from "react";
import { BookOpen, X } from "lucide-react";

/**
 * Edit timeline entries below. Add or modify moments in the couple's journey.
 */
const TIMELINE_ENTRIES = [
  { id: "1", date: "2020", title: "How We Met", description: "TBD - Add your story here." },
  { id: "2", date: "2021", title: "First Adventure", description: "TBD - Add your story here." },
  { id: "3", date: "2023", title: "The Proposal", description: "TBD - Add your story here." },
  { id: "4", date: "2026", title: "Our Wedding Day", description: "The beginning of forever." },
];

type TimelineEntry = (typeof TIMELINE_ENTRIES)[number];

const LIGHTBOX: React.FC<{
  entry: TimelineEntry;
  onClose: () => void;
}> = ({ entry, onClose }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="timeline-lightbox-title"
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
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
        color: "#343516",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
      >
        <X size={20} strokeWidth={2} />
      </button>
      <p className="text-sm font-semibold mb-1" style={{ color: "#8F4930" }}>
        {entry.date}
      </p>
      <h3 id="timeline-lightbox-title" className="text-xl font-serif mb-3" style={{ color: "#343516" }}>
        {entry.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "#343516" }}>
        {entry.description}
      </p>
    </div>
  </div>
);

/** Horizontal winding path with smooth curves. Points go left → right. */
const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 100;

// Smooth winding path: left to right, alternating up/down with rounded quadratic curves
const pathD =
  "M 40 50 Q 85 25 130 25 Q 220 100 310 75 Q 395 50 480 50";

// Point positions along the path (aligned with the curves)
const pointPositions = [
  { x: 40, y: 50 },
  { x: 130, y: 25 },
  { x: 310, y: 75 },
  { x: 480, y: 50 },
];

const StoryTimeline: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="pb-4">
      <h3 className="text-xl font-serif text-center mb-6 flex items-center justify-center gap-2" style={{ color: "#343516" }}>
        <BookOpen size={22} style={{ color: "#8F4930" }} strokeWidth={2} />
        Our Story
      </h3>

      <div
        className="relative w-full max-w-2xl mx-auto px-4"
        style={{ aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}` }}
      >
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="absolute inset-0 w-full h-full block"
          aria-hidden
        >
          <path
            d={pathD}
            fill="none"
            stroke="rgba(52, 53, 22, 0.35)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 8"
          />
        </svg>

        {/* Points as positioned divs - indented style, hover shows tooltip, click opens lightbox */}
        {TIMELINE_ENTRIES.map((entry, i) => {
          const pos = pointPositions[i];
          const xPct = (pos.x / VIEW_WIDTH) * 100;
          const yPct = (pos.y / VIEW_HEIGHT) * 100;
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={entry.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${xPct}%`, top: `${yPct}%` }}
            >
              <button
                type="button"
                className="timeline-point relative w-10 h-10 rounded-full cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#8F4930]/50 focus:ring-offset-2 transition-all duration-200 hover:scale-95"
                style={{
                  backgroundColor: "#E2E4D8",
                  border: "2px solid rgba(143, 73, 48, 0.5)",
                }}
                onClick={() => setSelectedEntry(entry)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={`${entry.date}: ${entry.title}. Click to read more.`}
              >
                <span
                  className="text-[10px] font-medium"
                  style={{ color: "#343516" }}
                >
                  {entry.date}
                </span>

                {/* Hover tooltip - shows on hover */}
                {isHovered && (
                  <span
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-left whitespace-nowrap pointer-events-none z-10 animate-fade-in"
                    style={{
                      backgroundColor: "#CCB89D",
                      border: "1px solid rgba(52, 53, 22, 0.2)",
                      boxShadow: "0 4px 12px rgba(52, 53, 22, 0.15)",
                      color: "#343516",
                    }}
                  >
                    <span className="text-xs font-semibold block" style={{ color: "#8F4930" }}>
                      {entry.date}
                    </span>
                    <span className="text-sm font-medium block">{entry.title}</span>
                    <span className="text-xs opacity-80 mt-1 block" style={{ color: "#343516" }}>
                      Click to read more
                    </span>
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {selectedEntry && (
        <LIGHTBOX entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </section>
  );
};

export default StoryTimeline;
