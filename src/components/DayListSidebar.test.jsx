import { render, screen, fireEvent } from '@testing-library/react'
import { DayListSidebar } from './DayListSidebar.jsx'

const days = [
  { day: 1, title: 'UB', festivalId: null },
  { day: 2, title: 'Naadam', festivalId: 'naadam' },
  { day: 3, title: 'Steppe', festivalId: null },
]

describe('DayListSidebar', () => {
  it('renders one button per day', () => {
    render(<DayListSidebar days={days} selectedDay={1} onSelectDay={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })
  it('festival days get day-chip--festival class', () => {
    render(<DayListSidebar days={days} selectedDay={1} onSelectDay={() => {}} />)
    expect(screen.getAllByRole('button')[1]).toHaveClass('day-chip--festival')
  })
  it('active day gets day-chip--active class', () => {
    render(<DayListSidebar days={days} selectedDay={2} onSelectDay={() => {}} />)
    expect(screen.getAllByRole('button')[1]).toHaveClass('day-chip--active')
  })
  it('calls onSelectDay with correct day number', () => {
    const onSelectDay = vi.fn()
    render(<DayListSidebar days={days} selectedDay={1} onSelectDay={onSelectDay} />)
    fireEvent.click(screen.getAllByRole('button')[2])
    expect(onSelectDay).toHaveBeenCalledWith(3)
  })
})
