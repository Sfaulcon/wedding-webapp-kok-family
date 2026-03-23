import { COLLAGE_IMAGES } from "../config/images";

const BackgroundCollage: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden
    >
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0 overflow-hidden">
        {COLLAGE_IMAGES.map((src, i) => (
          <div
            key={i}
            className="min-h-full min-w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(52, 53, 22, 0.35)" }}
      />
    </div>
  );
};

export default BackgroundCollage;
