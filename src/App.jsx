import { useState } from 'react'
import { generateItinerary } from './utils/generateItinerary.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { LandingView } from './components/LandingView.jsx'
import { ItineraryView } from './components/ItineraryView.jsx'

const STORAGE_KEY = 'adventure-planner-saved-trips'

export default function App() {
  const [view, setView] = useState('landing')
  const [activeItinerary, setActiveItinerary] = useState(null)
  const [activeMeta, setActiveMeta] = useState(null)
  const [savedTrips, setSavedTrips] = useLocalStorage(STORAGE_KEY, [])

  function handleGenerate(countryMeta, countryData, month, duration) {
    const days = generateItinerary(countryData, month, duration)
    const itinerary = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      country: countryMeta.id,
      countryName: countryMeta.name,
      month, duration, days,
    }
    setActiveItinerary(itinerary)
    setActiveMeta(countryMeta)
    setView('itinerary')
  }

  function handleSave() {
    setSavedTrips(prev => {
      const updated = [activeItinerary, ...prev.filter(t => t.id !== activeItinerary.id)]
      return updated.slice(0, 10)
    })
  }

  function handleLoad(trip) {
    import('./data/countries/metadata.json').then(m => {
      const meta = m.default.find(c => c.id === trip.country)
      setActiveMeta(meta)
      setActiveItinerary(trip)
      setView('itinerary')
    })
  }

  if (view === 'itinerary' && activeItinerary) {
    return (
      <ItineraryView
        itinerary={activeItinerary}
        countryMeta={activeMeta}
        onBack={() => setView('landing')}
        onSave={handleSave}
      />
    )
  }

  return (
    <LandingView
      savedTrips={savedTrips}
      onGenerate={handleGenerate}
      onLoad={handleLoad}
      onDeleteTrip={id => setSavedTrips(prev => prev.filter(t => t.id !== id))}
    />
  )
}
