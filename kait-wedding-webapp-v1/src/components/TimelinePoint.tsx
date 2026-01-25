interface TimelinePointProps {
  title: string;
  text: string;
  image: string;
}

export default function TimelinePoint({ title, text, image }: TimelinePointProps) {
  return (
    <div className="flex flex-col md:flex-row items-center mb-12">
      <img src={image} alt={title} className="w-full md:w-1/3 rounded-xl mb-4 md:mb-0 md:mr-6" />
      <div className="md:w-2/3">
        <h3 className="text-2xl font-serif text-purple-700 mb-2">{title}</h3>
        <p className="text-purple-800">{text}</p>
      </div>
    </div>
  );
}