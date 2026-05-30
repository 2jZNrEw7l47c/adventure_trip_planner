import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [32, 32] })
    }
  }, [positions, map])
  return null
}

function dayIcon(dayNum, isFestival, isSelected) {
  const classes = ['day-marker']
  if (isFestival) classes.push('day-marker--festival')
  if (isSelected) classes.push('day-marker--selected')
  return L.divIcon({
    className: classes.join(' '),
    html: `<span>${dayNum}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  })
}

export function MapPanel({ days, selectedDay, onSelectDay, center, zoom }) {
  const positions = days.map(d => [d.coords.lat, d.coords.lng])
  return (
    <div className="map-panel" data-testid="map-panel">
      <MapContainer center={center} zoom={zoom} className="leaflet-map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        />
        <FitBounds positions={positions} />
        <Polyline positions={positions} color="#f0a500" weight={2} opacity={0.7} />
        {days.map(day => (
          <Marker
            key={day.day}
            position={[day.coords.lat, day.coords.lng]}
            icon={dayIcon(day.day, !!day.festivalId, day.day === selectedDay)}
            eventHandlers={{ click: () => onSelectDay(day.day) }}
          >
            <Popup>{day.day}. {day.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
