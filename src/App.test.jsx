import { render, screen, fireEvent } from '@testing-library/react'
import App from './App.jsx'

vi.mock('./components/LandingView.jsx', () => ({
  LandingView: ({ onGenerate }) => (
    <div>
      <span>ADVENTURE PLANNER</span>
      <button onClick={() => onGenerate(
        { id: 'mongolia', name: 'Mongolia', entryCity: { coords: { lat: 47.9, lng: 106.9 } }, festivalMonths: [7] },
        { festivals: [], destinations: [] },
        7, 3
      )}>Generate</button>
    </div>
  )
}))
vi.mock('./components/ItineraryView.jsx', () => ({
  ItineraryView: ({ onBack }) => (
    <div><span>ITINERARY VIEW</span><button onClick={onBack}>Back</button></div>
  )
}))
vi.mock('./utils/generateItinerary.js', () => ({
  generateItinerary: () => [
    { day: 1, title: 'UB', notes: '', festivalId: null, destinationId: 'd1', coords: { lat: 47.9, lng: 106.9 }, links: [] }
  ]
}))

describe('App', () => {
  it('renders landing view initially', () => {
    render(<App />)
    expect(screen.getByText('ADVENTURE PLANNER')).toBeInTheDocument()
  })
  it('switches to itinerary view and back', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Generate'))
    expect(screen.getByText('ITINERARY VIEW')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('ADVENTURE PLANNER')).toBeInTheDocument()
  })
})
