import TimelinePoint from "./TimelinePoint";

interface TimelinePointType {
  title: string;
  text: string;
  image: string;
}

interface TimelineProps {
  points: TimelinePointType[];
}

export default function Timeline({ points }: TimelineProps) {
  return (
    <div className="my-12 max-w-4xl mx-auto">
      <h2 className="text-3xl font-serif text-purple-800 text-center mb-8">Our Story</h2>
      {points.map((p, idx) => (
        <TimelinePoint key={idx} {...p} />
      ))}
    </div>
  );
}
