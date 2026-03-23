type ToggleProps = {
  label: string;
  value: boolean | null;
  setValue: (value: boolean) => void;
  disabled?: boolean;
};

export default function Toggle({
  label,
  value,
  setValue,
  disabled,
}: ToggleProps) {
  return (
    <div>
      <p className="mb-3 font-medium" style={{ color: "#343516" }}>
        {label} Attendance
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setValue(true)}
          className={`flex-1 py-2.5 rounded-lg border transition-all duration-200 selectable-3d shadow-sm ${
            value === true ? "text-white selected" : "hover:border-[#8F4930]/50 disabled:opacity-60"
          }`}
          style={
            value === true
              ? { backgroundColor: "#343516", borderColor: "#343516" }
              : { backgroundColor: "#E2E4D8", borderColor: "rgba(52, 53, 22, 0.25)", color: "#343516" }
          }
        >
          Attending
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setValue(false)}
          className={`flex-1 py-2.5 rounded-lg border transition-all duration-200 selectable-3d shadow-sm ${
            value === false ? "text-white selected" : "hover:border-[#8F4930]/50 disabled:opacity-60"
          }`}
          style={
            value === false
              ? { backgroundColor: "#343516", borderColor: "#343516" }
              : { backgroundColor: "#E2E4D8", borderColor: "rgba(52, 53, 22, 0.25)", color: "#343516" }
          }
        >
          Not Attending
        </button>
      </div>
    </div>
  );
}
