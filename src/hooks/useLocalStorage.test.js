import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage.js'

beforeEach(() => localStorage.clear())

describe('useLocalStorage', () => {
  it('returns initialValue when key absent', () => {
    const { result } = renderHook(() => useLocalStorage('k', []))
    expect(result.current[0]).toEqual([])
  })
  it('returns stored value when key present', () => {
    localStorage.setItem('k', JSON.stringify([1]))
    const { result } = renderHook(() => useLocalStorage('k', []))
    expect(result.current[0]).toEqual([1])
  })
  it('updates localStorage when setValue called', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    act(() => result.current[1](42))
    expect(JSON.parse(localStorage.getItem('k'))).toBe(42)
  })
  it('accepts updater function', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    act(() => result.current[1](prev => prev + 1))
    expect(result.current[0]).toBe(1)
  })
  it('silently handles JSON parse error', () => {
    localStorage.setItem('k', '{bad}')
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })
})
