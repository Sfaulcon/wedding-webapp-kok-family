interface ShuttleOptionProps {
  selected?: string;
  onChange?: (value: string) => void;
}

export default function ShuttleOption({ selected = "", onChange }: ShuttleOptionProps) {
  return (
    <div className="mt-2">
      <label className="text-purple-700 font-semibold mr-2">Need Shuttle?</label>
      <select
        className="p-2 border rounded"
        value={selected}
        onChange={(e) => onChange && onChange(e.target.value)}
      >
        <option value="">Select</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </div>
  );
}
