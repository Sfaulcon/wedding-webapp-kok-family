type ToggleProps = {
  label: string
  value: boolean | null
  setValue: (value: boolean) => void
  disabled?: boolean
}

export default function Toggle({
  label,
  value,
  setValue,
  disabled
}: ToggleProps) {
  return (
    <div>
      <p className="mb-2 font-medium">{label} Attendance</p>
      <div className="flex gap-4">
        <button
          disabled={disabled}
          onClick={() => setValue(true)}
          className={`px-4 py-2 rounded-lg border ${
            value === true ? "bg-black text-white" : ""
          }`}
        >
          Attending
        </button>
        <button
          disabled={disabled}
          onClick={() => setValue(false)}
          className={`px-4 py-2 rounded-lg border ${
            value === false ? "bg-black text-white" : ""
          }`}
        >
          Not Attending
        </button>
      </div>
    </div>
  )
}