const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function FestivalPreview({ countryData, loading, countryName, month }) {
  if (!month) return null
  if (loading) return <div className="festival-preview">Loading festivals...</div>
  if (!countryData) return null

  const festivals = countryData.festivals.filter(f => f.dates.month === month)
  if (festivals.length === 0) {
    return (
      <div className="festival-preview festival-preview--warning">
        No major festivals in this month — route will optimize for top adventure spots
      </div>
    )
  }
  return (
    <div className="festival-preview">
      <div className="festival-preview__title">★ Festivals in {countryName} · {MONTHS[month - 1]}</div>
      {festivals.map(f => (
        <div key={f.id} className="festival-preview__item">
          • {f.name} — {MONTHS[f.dates.month - 1]} {f.dates.startDay}–{f.dates.endDay}
        </div>
      ))}
    </div>
  )
}
