import { render, screen, fireEvent } from '@testing-library/react'
import { MapPanel } from './MapPanel.jsx'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children, eventHandlers }) => (
    <button data-testid="map-marker" onClick={eventHandlers?.click}>{children}</button>
  ),
  Popup: ({ children }) => <div>{children}</div>,
  Polyline: () => null,
  useMap: () => ({ setView: vi.fn(), fitBounds: vi.fn() }),
}))
vi.mock('leaflet', () => ({ default: { divIcon: vi.fn(() => ({})) } }))

// Two days at different coordinates → two markers
const days = [
  { day: 1, title: 'UB', festivalId: null, coords: { lat: 47.9, lng: 106.9 } },
  { day: 2, title: 'Naadam', festivalId: 'naadam', coords: { lat: 48.0, lng: 107.0 } },
]

// Two days at the same coordinates → one grouped marker
const sameDays = [
  { day: 1, title: 'UB Arrival', festivalId: null, coords: { lat: 47.9, lng: 106.9 } },
  { day: 3, title: 'UB Departure', festivalId: null, coords: { lat: 47.9, lng: 106.9 } },
]

describe('MapPanel', () => {
  it('renders map container', () => {
    render(<MapPanel days={days} selectedDay={1} onSelectDay={() => {}} center={[47.9, 106.9]} zoom={5} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('renders one marker per unique location', () => {
    render(<MapPanel days={days} selectedDay={1} onSelectDay={() => {}} center={[47.9, 106.9]} zoom={5} />)
    expect(screen.getAllByTestId('map-marker')).toHaveLength(2)
  })

  it('groups co-located days into one marker', () => {
    render(<MapPanel days={sameDays} selectedDay={1} onSelectDay={() => {}} center={[47.9, 106.9]} zoom={5} />)
    expect(screen.getAllByTestId('map-marker')).toHaveLength(1)
  })

  it('clicking a marker cycles to the next day in the group', () => {
    const onSelectDay = vi.fn()
    render(<MapPanel days={sameDays} selectedDay={1} onSelectDay={onSelectDay} center={[47.9, 106.9]} zoom={5} />)
    fireEvent.click(screen.getByTestId('map-marker'))
    // selectedDay=1, next in group is day 3
    expect(onSelectDay).toHaveBeenCalledWith(3)
  })

  it('calls onSelectDay with day number when single-day marker clicked', () => {
    const onSelectDay = vi.fn()
    render(<MapPanel days={days} selectedDay={1} onSelectDay={onSelectDay} center={[47.9, 106.9]} zoom={5} />)
    fireEvent.click(screen.getAllByTestId('map-marker')[1])
    expect(onSelectDay).toHaveBeenCalledWith(2)
  })
})
