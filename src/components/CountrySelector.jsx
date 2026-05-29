import countryMeta from '../data/countries/metadata.json'

export function CountrySelector({ selectedId, onChange }) {
  return (
    <select
      className="country-select"
      value={selectedId ?? ''}
      onChange={e => onChange(e.target.value || null)}
    >
      <option value="">Select a destination...</option>
      {countryMeta.map(c => (
        <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
      ))}
    </select>
  )
}
