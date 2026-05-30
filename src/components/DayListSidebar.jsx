export function DayListSidebar({ days, selectedDay, onSelectDay }) {
  return (
    <div className="day-list-sidebar">
      {days.map(day => (
        <button
          key={day.day}
          className={[
            'day-chip',
            day.festivalId ? 'day-chip--festival' : '',
            selectedDay === day.day ? 'day-chip--active' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => onSelectDay(day.day)}
        >
          <span className="day-chip__num">{day.festivalId ? '★' : day.day}</span>
          <span className="day-chip__title">{day.title}</span>
        </button>
      ))}
    </div>
  )
}
