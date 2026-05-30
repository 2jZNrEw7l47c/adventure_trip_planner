import countryMeta from '../data/countries/metadata.json'

const CONTINENT_ORDER = ['Africa', 'Asia', 'Europe', 'Middle East', 'North America', 'South America']

export function CountrySelector({ selectedId, onChange }) {
  const byContinent = {}
  countryMeta.forEach(c => {
    if (!byContinent[c.continent]) byContinent[c.continent] = []
    byContinent[c.continent].push(c)
  })
  Object.values(byContinent).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
  const continents = CONTINENT_ORDER.filter(k => byContinent[k])

  return (
    <select
      className="country-select"
      value={selectedId ?? ''}
      onChange={e => onChange(e.target.value || null)}
    >
      <option value="">Select a destination...</option>
      {continents.map(continent => (
        <optgroup key={continent} label={continent}>
          {byContinent[continent].map(c => (
            <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
