interface AccommodationSelectorProps {
  type: string;
  options?: { name: string; distance: string }[];
  selected?: string;
  onChange?: (value: string) => void;
}

export default function AccommodationSelector({
  type,
  options = [],
  selected = "",
  onChange,
}: AccommodationSelectorProps) {
  if (type === "Venue") {
    return <p className="text-purple-800">Staying at venue</p>;
  }

  return (
    <select
      className="w-full p-2 border rounded mb-2"
      value={selected}
      onChange={(e) => onChange && onChange(e.target.value)}
    >
      <option value="">Select accommodation</option>
      {options.map((hotel) => (
        <option key={hotel.name} value={hotel.name}>
          {hotel.name} ({hotel.distance} away)
        </option>
      ))}
    </select>
  );
}
