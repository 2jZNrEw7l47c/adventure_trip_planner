import { render, screen } from '@testing-library/react'
import { FestivalPreview } from './FestivalPreview.jsx'

const mockCountryData = {
  festivals: [
    { id: 'f1', name: 'Naadam', dates: { month: 7, startDay: 11, endDay: 13 } },
    { id: 'f2', name: 'Other Fest', dates: { month: 8, startDay: 1, endDay: 3 } },
  ]
}

describe('FestivalPreview', () => {
  it('returns null when countryData is null', () => {
    const { container } = render(<FestivalPreview countryData={null} loading={false} countryName="X" month={7} />)
    expect(container.firstChild).toBeNull()
  })
  it('returns null when month is null', () => {
    const { container } = render(<FestivalPreview countryData={mockCountryData} loading={false} countryName="X" month={null} />)
    expect(container.firstChild).toBeNull()
  })
  it('shows loading state', () => {
    render(<FestivalPreview countryData={null} loading={true} countryName="X" month={7} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
  it('shows festival names for matching month', () => {
    render(<FestivalPreview countryData={mockCountryData} loading={false} countryName="Mongolia" month={7} />)
    expect(screen.getByText(/Naadam/)).toBeInTheDocument()
  })
  it('shows warning when no festivals in month', () => {
    render(<FestivalPreview countryData={mockCountryData} loading={false} countryName="Mongolia" month={1} />)
    expect(screen.getByText(/No major festivals/)).toBeInTheDocument()
  })
})
