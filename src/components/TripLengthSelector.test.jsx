import { render, screen, fireEvent } from '@testing-library/react'
import { TripLengthSelector } from './TripLengthSelector.jsx'

describe('TripLengthSelector', () => {
  it('renders 5 duration options', () => {
    render(<TripLengthSelector selected={14} onChange={() => {}} />)
    ;['7d','10d','14d','21d','28d'].forEach(label =>
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    )
  })
  it('marks selected duration', () => {
    render(<TripLengthSelector selected={14} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '14d' })).toHaveClass('selected')
    expect(screen.getByRole('button', { name: '7d' })).not.toHaveClass('selected')
  })
  it('calls onChange with numeric value', () => {
    const onChange = vi.fn()
    render(<TripLengthSelector selected={14} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '21d' }))
    expect(onChange).toHaveBeenCalledWith(21)
  })
})
