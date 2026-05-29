import { useState } from 'react'
import countryMeta from '../data/countries/metadata.json'
import { useCountryData } from '../hooks/useCountryData.js'
import { CountrySelector } from './CountrySelector.jsx'
import { MonthGrid } from './MonthGrid.jsx'
import { TripLengthSelector } from './TripLengthSelector.jsx'
import { FestivalPreview } from './FestivalPreview.jsx'
import { SavedTripsList } from './SavedTripsList.jsx'

export function LandingView({ savedTrips, onGenerate, onLoad, onDeleteTrip }) {
  const [countryId, setCountryId] = useState(null)
  const [month, setMonth] = useState(null)
  const [duration, setDuration] = useState(14)
  const { data: countryData, loading } = useCountryData(countryId)
  const selectedMeta = countryMeta.find(c => c.id === countryId) ?? null
  const canGenerate = countryId !== null && month !== null && !loading

  return (
    <div className="landing">
      <header className="landing__header">
        <h1>ADVENTURE PLANNER</h1>
        <p>Custom routes optimized around festivals</p>
      </header>
      <main className="landing__form">
        <label>Destination</label>
        <CountrySelector selectedId={countryId} onChange={setCountryId} />
        <label>Travel Month</label>
        <MonthGrid countryMeta={selectedMeta} selectedMonth={month} onChange={setMonth} />
        <label>Trip Length</label>
        <TripLengthSelector selected={duration} onChange={setDuration} />
        <FestivalPreview countryData={countryData} loading={loading} countryName={selectedMeta?.name} month={month} />
        <button
          className="generate-btn"
          disabled={!canGenerate}
          onClick={() => onGenerate(selectedMeta, countryData, month, duration)}
        >
          GENERATE MY ITINERARY →
        </button>
        <SavedTripsList trips={savedTrips} onLoad={onLoad} onDelete={onDeleteTrip} />
      </main>
    </div>
  )
}
