const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function MonthGrid({ countryMeta, selectedMonth, onChange }) {
  const festivalMonths = new Set(countryMeta?.festivalMonths ?? [])
  return (
    <div className="month-grid">
      {MONTHS.map((name, i) => {
        const month = i + 1
        return (
          <button
            key={month}
            className={[
              'month-btn',
              festivalMonths.has(month) ? 'has-festival' : '',
              selectedMonth === month ? 'selected' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onChange(month)}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
