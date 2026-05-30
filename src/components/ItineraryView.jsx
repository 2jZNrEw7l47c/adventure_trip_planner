import { useState } from 'react'
import { TopBar } from './TopBar.jsx'
import { DayListSidebar } from './DayListSidebar.jsx'
import { MapPanel } from './MapPanel.jsx'
import { DayDetailPanel } from './DayDetailPanel.jsx'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function ItineraryView({ itinerary, countryMeta, onBack, onSave }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const currentDay = itinerary.days.find(d => d.day === selectedDay) ?? null
  const title = `${countryMeta.name} · ${MONTH_NAMES[itinerary.month - 1]} · ${itinerary.duration}d`
  return (
    <div className="itinerary-view">
      <TopBar title={title} onBack={onBack} onSave={onSave} onPrint={() => window.print()} />
      <div className="itinerary-view__body">
        <DayListSidebar days={itinerary.days} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        <MapPanel
          days={itinerary.days}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          center={[countryMeta.entryCity.coords.lat, countryMeta.entryCity.coords.lng]}
          zoom={5}
        />
        <DayDetailPanel day={currentDay} />
      </div>
    </div>
  )
}
