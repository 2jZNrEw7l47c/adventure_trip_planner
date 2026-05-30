import { render, screen, fireEvent } from '@testing-library/react'
import { CountrySelector } from './CountrySelector.jsx'

const mockMeta = vi.hoisted(() => [
  { id: 'mongolia', name: 'Mongolia', flag: '🇲🇳', continent: 'Asia' },
  { id: 'nepal', name: 'Nepal', flag: '🇳🇵', continent: 'Asia' },
])
vi.mock('../data/countries/metadata.json', () => ({ default: mockMeta }))

describe('CountrySelector', () => {
  it('renders placeholder and all country options', () => {
    render(<CountrySelector selectedId={null} onChange={() => {}} />)
    expect(screen.getByRole('option', { name: /select a destination/i })).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })
  it('calls onChange with id when option selected', () => {
    const onChange = vi.fn()
    render(<CountrySelector selectedId={null} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mongolia' } })
    expect(onChange).toHaveBeenCalledWith('mongolia')
  })
  it('calls onChange with null when placeholder selected', () => {
    const onChange = vi.fn()
    render(<CountrySelector selectedId="mongolia" onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
