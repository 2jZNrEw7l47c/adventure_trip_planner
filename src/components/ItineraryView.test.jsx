import { render, screen, fireEvent, within } from '@testing-library/react'
import { ItineraryView } from './ItineraryView.jsx'

vi.mock('./MapPanel.jsx', () => ({
  MapPanel: ({ onSelectDay, days }) => (
    <div data-testid="mock-map">
      {days.map(d => <button key={d.day} onClick={() => onSelectDay(d.day)}>day-{d.day}</button>)}
    </div>
  )
}))

const mockMeta = { name: 'Mongolia', id: 'mongolia', entryCity: { coords: { lat: 47.9, lng: 106.9 } } }
const mockItinerary = {
  id: '1', createdAt: '', country: 'mongolia', countryName: 'Mongolia', month: 7, duration: 3,
  days: [
    { day: 1, title: 'Day One', notes: 'Notes 1', festivalId: null, destinationId: 'd1', coords: { lat: 47.9, lng: 106.9 }, links: [] },
    { day: 2, title: 'Naadam', notes: 'Notes 2', festivalId: 'naadam', destinationId: 'naadam', coords: { lat: 47.9, lng: 106.9 }, links: [{ label: 'Info', url: 'https://example.com' }] },
    { day: 3, title: 'Day Three', notes: 'Notes 3', festivalId: null, destinationId: 'd2', coords: { lat: 48.0, lng: 107.0 }, links: [] },
  ]
}

describe('ItineraryView', () => {
  it('shows title in top bar', () => {
    render(<ItineraryView itinerary={mockItinerary} countryMeta={mockMeta} onBack={() => {}} onSave={() => {}} />)
    const topBar = document.querySelector('.top-bar')
    expect(within(topBar).getByText('Mongolia · July · 3d')).toBeInTheDocument()
  })
  it('shows day 1 detail by default', () => {
    render(<ItineraryView itinerary={mockItinerary} countryMeta={mockMeta} onBack={() => {}} onSave={() => {}} />)
    // Check the h2 in DayDetailPanel (not the print section which uses h3)
    expect(screen.getByRole('heading', { level: 2, name: 'Day One' })).toBeInTheDocument()
  })
  it('clicking sidebar chip updates detail panel', () => {
    render(<ItineraryView itinerary={mockItinerary} countryMeta={mockMeta} onBack={() => {}} onSave={() => {}} />)
    const chips = screen.getAllByRole('button')
    fireEvent.click(chips.find(b => b.textContent.includes('Naadam')))
    // Check the h2 in DayDetailPanel updates (not the print section h3)
    expect(screen.getByRole('heading', { level: 2, name: 'Naadam' })).toBeInTheDocument()
  })
})
