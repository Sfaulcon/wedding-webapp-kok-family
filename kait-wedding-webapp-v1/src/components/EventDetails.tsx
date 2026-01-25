interface EventInfo {
    venue: string;
    dressCode: string;
    colorsToAvoid: string[];
    menu: string;
    giftNote: string;
    date: string;
}

interface EventDetailsProps { info: EventInfo; }

export default function EventDetails({ info }: EventDetailsProps) {
  return (
    <div className="bg-sand p-8 rounded-2xl max-w-3xl mx-auto my-12">
      <h2 className="text-3xl font-serif text-purple-800 mb-4">Event Details</h2>
      <p><strong>Date & Time:</strong> {new Date(info.date).toLocaleString()}</p>
      <p><strong>Venue:</strong> {info.venue}</p>
      <p><strong>Dress Code:</strong> {info.dressCode}</p>
      <p><strong>Colors to Avoid:</strong> {info.colorsToAvoid.join(", ")}</p>
      <p><strong>Menu:</strong> {info.menu}</p>
      <p><strong>Gifts:</strong> {info.giftNote}</p>
    </div>
  );
}