const DURATIONS = [7, 10, 14, 21, 28]

export function TripLengthSelector({ selected, onChange }) {
  return (
    <div className="duration-selector">
      {DURATIONS.map(d => (
        <button
          key={d}
          className={`duration-btn${selected === d ? ' selected' : ''}`}
          onClick={() => onChange(d)}
        >
          {d}d
        </button>
      ))}
    </div>
  )
}
