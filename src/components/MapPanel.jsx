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

function groupIcon(dayLabels, isFestival, isSelected) {
  const text = dayLabels.join(',')
  const width = Math.max(24, text.length * 7 + 10)
  const classes = ['day-marker']
  if (isFestival) classes.push('day-marker--festival')
  if (isSelected) classes.push('day-marker--selected')
  return L.divIcon({
    className: classes.join(' '),
    html: `<span>${text}</span>`,
    iconSize: [width, 24],
    iconAnchor: [width / 2, 12],
    popupAnchor: [0, -14],
  })
}

export function MapPanel({ days, selectedDay, onSelectDay, center, zoom }) {
  const positions = days.map(d => [d.coords.lat, d.coords.lng])

  // Group days that share the same coordinates into one marker
  const groups = {}
  days.forEach(day => {
    const key = `${day.coords.lat},${day.coords.lng}`
    if (!groups[key]) groups[key] = []
    groups[key].push(day)
  })

  return (
    <div className="map-panel" data-testid="map-panel">
      <MapContainer center={center} zoom={zoom} className="leaflet-map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        />
        <FitBounds positions={positions} />
        <Polyline positions={positions} color="#f0a500" weight={2} opacity={0.7} />
        {Object.entries(groups).map(([coordKey, group]) => {
          const isFestival = group.some(d => d.festivalId)
          const isSelected = group.some(d => d.day === selectedDay)
          const labels = group.map(d => d.festivalId ? '★' : String(d.day))
          // Clicking cycles through the days in this group
          const handleClick = () => {
            const idx = group.findIndex(d => d.day === selectedDay)
            const next = group[(idx + 1) % group.length]
            onSelectDay(next.day)
          }
          return (
            <Marker
              key={coordKey}
              position={[group[0].coords.lat, group[0].coords.lng]}
              icon={groupIcon(labels, isFestival, isSelected)}
              eventHandlers={{ click: handleClick }}
            >
              <Popup>{group.map(d => `Day ${d.day}: ${d.title}`).join('\n')}</Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
