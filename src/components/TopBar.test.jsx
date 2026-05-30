import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar.jsx'

describe('TopBar', () => {
  it('displays title', () => {
    render(<TopBar title="Mongolia · July · 14d" onBack={vi.fn()} onSave={vi.fn()} onPrint={vi.fn()} />)
    expect(screen.getByText('Mongolia · July · 14d')).toBeInTheDocument()
  })
  it('calls onBack', () => {
    const onBack = vi.fn()
    render(<TopBar title="X" onBack={onBack} onSave={vi.fn()} onPrint={vi.fn()} />)
    fireEvent.click(screen.getByText('← Back'))
    expect(onBack).toHaveBeenCalled()
  })
  it('calls onSave', () => {
    const onSave = vi.fn()
    render(<TopBar title="X" onBack={vi.fn()} onSave={onSave} onPrint={vi.fn()} />)
    fireEvent.click(screen.getByText('💾 Save'))
    expect(onSave).toHaveBeenCalled()
  })
  it('calls onPrint', () => {
    const onPrint = vi.fn()
    render(<TopBar title="X" onBack={vi.fn()} onSave={vi.fn()} onPrint={onPrint} />)
    fireEvent.click(screen.getByText('🖨 Print'))
    expect(onPrint).toHaveBeenCalled()
  })
})
