import { render, screen, fireEvent } from '@testing-library/react'
import { SavedTripsList } from './SavedTripsList.jsx'

const trips = [
  { id: '1', countryName: 'Mongolia', month: 7, duration: 14, country: 'mongolia', days: [], createdAt: '' },
  { id: '2', countryName: 'Japan', month: 8, duration: 10, country: 'japan', days: [], createdAt: '' },
]

describe('SavedTripsList', () => {
  it('renders nothing when trips empty', () => {
    const { container } = render(<SavedTripsList trips={[]} onLoad={() => {}} onDelete={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
  it('renders each trip with name, month, duration', () => {
    render(<SavedTripsList trips={trips} onLoad={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/Mongolia · July · 14d/)).toBeInTheDocument()
    expect(screen.getByText(/Japan · August · 10d/)).toBeInTheDocument()
  })
  it('calls onLoad with trip when clicked', () => {
    const onLoad = vi.fn()
    render(<SavedTripsList trips={trips} onLoad={onLoad} onDelete={() => {}} />)
    fireEvent.click(screen.getByText(/Mongolia/))
    expect(onLoad).toHaveBeenCalledWith(trips[0])
  })
  it('calls onDelete with id when × clicked', () => {
    const onDelete = vi.fn()
    render(<SavedTripsList trips={trips} onLoad={() => {}} onDelete={onDelete} />)
    fireEvent.click(screen.getAllByText('×')[1])
    expect(onDelete).toHaveBeenCalledWith('2')
  })
})
