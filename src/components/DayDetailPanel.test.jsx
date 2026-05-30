import { render, screen } from '@testing-library/react'
import { DayDetailPanel } from './DayDetailPanel.jsx'

const day = { day: 2, title: 'Naadam', notes: 'Horse racing and wrestling.', festivalId: 'naadam', links: [{ label: 'Info', url: 'https://example.com' }] }

describe('DayDetailPanel', () => {
  it('shows "Select a day" when day is null', () => {
    render(<DayDetailPanel day={null} />)
    expect(screen.getByText('Select a day')).toBeInTheDocument()
  })
  it('shows title and notes', () => {
    render(<DayDetailPanel day={day} />)
    expect(screen.getByText('Naadam')).toBeInTheDocument()
    expect(screen.getByText(/Horse racing/)).toBeInTheDocument()
  })
  it('renders external links with correct href', () => {
    render(<DayDetailPanel day={day} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })
  it('festival days show ★ in day number', () => {
    render(<DayDetailPanel day={day} />)
    expect(screen.getByText('★ Day 2')).toBeInTheDocument()
  })
})
