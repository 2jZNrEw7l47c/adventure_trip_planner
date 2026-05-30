import { render, screen, fireEvent } from '@testing-library/react'
import { LandingView } from './LandingView.jsx'

vi.mock('../data/countries/metadata.json', () => ({
  default: [{ id: 'mongolia', name: 'Mongolia', flag: '🇲🇳', continent: 'Asia', entryCity: { name: 'UB', coords: { lat: 47.9, lng: 106.9 } }, festivalMonths: [7] }]
}))
vi.mock('../hooks/useCountryData.js', () => ({
  useCountryData: () => ({ data: null, loading: false })
}))

describe('LandingView', () => {
  it('generate button disabled when no country selected', () => {
    render(<LandingView savedTrips={[]} onGenerate={() => {}} onLoad={() => {}} onDeleteTrip={() => {}} />)
    expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled()
  })
  it('generate button enabled after country and month selected', () => {
    render(<LandingView savedTrips={[]} onGenerate={() => {}} onLoad={() => {}} onDeleteTrip={() => {}} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mongolia' } })
    fireEvent.click(screen.getByRole('button', { name: 'Jul' }))
    expect(screen.getByRole('button', { name: /generate/i })).not.toBeDisabled()
  })
  it('calls onGenerate with (countryMeta, countryData, month, duration)', () => {
    const onGenerate = vi.fn()
    render(<LandingView savedTrips={[]} onGenerate={onGenerate} onLoad={() => {}} onDeleteTrip={() => {}} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mongolia' } })
    fireEvent.click(screen.getByRole('button', { name: 'Jul' }))
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'mongolia' }),
      null,
      7,
      14
    )
  })
  it('duration defaults to 14', () => {
    render(<LandingView savedTrips={[]} onGenerate={() => {}} onLoad={() => {}} onDeleteTrip={() => {}} />)
    expect(screen.getByRole('button', { name: '14d' })).toHaveClass('selected')
  })
})
