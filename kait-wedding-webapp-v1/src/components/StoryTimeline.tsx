import { useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, X } from "lucide-react";

type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  description: string;
};

type StoryTimelineProps = {
  story: TimelineEntry[];
};

const LIGHTBOX: React.FC<{
  entry: TimelineEntry;
  onClose: () => void;
}> = ({ entry, onClose }) =>
  createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-lightbox-title"
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
        <div className="text-center">
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
    </div>,
    document.body
  );

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 100;

/** Generate point positions along a winding path based on entry count */
function getPointPositions(count: number): Array<{ x: number; y: number }> {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 260, y: 50 }];
  const points: Array<{ x: number; y: number }> = [];
  const stepX = 440 / (count - 1);
  for (let i = 0; i < count; i++) {
    const x = 40 + i * stepX;
    const y = i % 2 === 0 ? 30 : 70;
    points.push({ x, y });
  }
  return points;
}

/** Build path through points */
function getPathD(positions: Array<{ x: number; y: number }>): string {
  if (positions.length === 0) return "";
  return positions.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
}

const StoryTimeline: React.FC<StoryTimelineProps> = ({ story }) => {
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const entries = story.length > 0 ? story : [];
  const pointPositions = getPointPositions(entries.length);
  const pathD = getPathD(pointPositions);

  if (entries.length === 0) return null;

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
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            {entries.map((entry, i) => {
              const pos = pointPositions[i];
              if (!pos) return null;
              const xPct = (pos.x / VIEW_WIDTH) * 100;
              const yPct = (pos.y / VIEW_HEIGHT) * 100;
              const isHovered = hoveredIndex === i;

              return (
                <div
                  key={entry.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
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
                    <span className="text-[10px] font-medium" style={{ color: "#343516" }}>
                      {entry.date}
                    </span>
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
        </div>
      </div>

      {selectedEntry && (
        <LIGHTBOX entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </section>
  );
};

export default StoryTimeline;
