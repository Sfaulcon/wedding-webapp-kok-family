import { Check, X } from "lucide-react";

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
          className={`flex-1 py-2.5 rounded-xl border transition-all duration-200 selectable-3d shadow-sm ${
            value === true ? "text-white selected" : "hover:border-[#8F4930]/50 disabled:opacity-60"
          }`}
          style={
            value === true
              ? { backgroundColor: "#343516", borderColor: "#343516" }
              : { background: "rgba(226, 228, 216, 0.6)", backdropFilter: "blur(8px)", borderColor: "rgba(52, 53, 22, 0.2)", color: "#343516" }
          }
        >
          <span className="flex items-center justify-center gap-2">
            <Check size={16} strokeWidth={2.5} />
            Attending
          </span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setValue(false)}
          className={`flex-1 py-2.5 rounded-xl border transition-all duration-200 selectable-3d shadow-sm ${
            value === false ? "text-white selected" : "hover:border-[#8F4930]/50 disabled:opacity-60"
          }`}
          style={
            value === false
              ? { backgroundColor: "#343516", borderColor: "#343516" }
              : { background: "rgba(226, 228, 216, 0.6)", backdropFilter: "blur(8px)", borderColor: "rgba(52, 53, 22, 0.2)", color: "#343516" }
          }
        >
          <span className="flex items-center justify-center gap-2">
            <X size={16} strokeWidth={2.5} />
            Not Attending
          </span>
        </button>
      </div>
    </div>
  );
}
