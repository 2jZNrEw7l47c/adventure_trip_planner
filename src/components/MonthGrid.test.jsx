import { render, screen, fireEvent } from '@testing-library/react'
import { MonthGrid } from './MonthGrid.jsx'

const mockMeta = { id: 'test', festivalMonths: [3, 7] }

describe('MonthGrid', () => {
  it('renders 12 month buttons', () => {
    render(<MonthGrid countryMeta={null} selectedMonth={null} onChange={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(12)
  })
  it('adds has-festival class to festival months', () => {
    render(<MonthGrid countryMeta={mockMeta} selectedMonth={null} onChange={() => {}} />)
    const btns = screen.getAllByRole('button')
    expect(btns[2]).toHaveClass('has-festival')   // March (index 2)
    expect(btns[6]).toHaveClass('has-festival')   // July (index 6)
    expect(btns[0]).not.toHaveClass('has-festival')
  })
  it('adds selected class to selected month', () => {
    render(<MonthGrid countryMeta={null} selectedMonth={7} onChange={() => {}} />)
    expect(screen.getAllByRole('button')[6]).toHaveClass('selected')
  })
  it('calls onChange with 1-based month number', () => {
    const onChange = vi.fn()
    render(<MonthGrid countryMeta={null} selectedMonth={null} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Jun' }))
    expect(onChange).toHaveBeenCalledWith(6)
  })
})
