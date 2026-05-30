export function DayDetailPanel({ day }) {
  if (!day) return <div className="day-detail-panel day-detail-panel--empty">Select a day</div>
  return (
    <div className="day-detail-panel">
      <div className="day-detail__number">{day.festivalId ? '★ ' : ''}Day {day.day}</div>
      <h2 className="day-detail__title">{day.title}</h2>
      <p className="day-detail__notes">{day.notes}</p>
      <div className="day-detail__links">
        {(day.links ?? []).map((link, i) => (
          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="day-detail__link">
            → {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
