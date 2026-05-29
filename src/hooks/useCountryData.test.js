import { renderHook, waitFor } from '@testing-library/react'
import { useCountryData } from './useCountryData.js'

vi.mock('../data/countries/mongolia.json', () => ({
  default: { id: 'mongolia', festivals: [], destinations: [] }
}))

describe('useCountryData', () => {
  it('returns null data when countryId is null', () => {
    const { result } = renderHook(() => useCountryData(null))
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('loads country data by id', async () => {
    const { result } = renderHook(() => useCountryData('mongolia'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ id: 'mongolia', festivals: [], destinations: [] })
  })

  it('resets data when countryId changes to null', async () => {
    const { result, rerender } = renderHook(({ id }) => useCountryData(id), {
      initialProps: { id: 'mongolia' }
    })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    rerender({ id: null })
    expect(result.current.data).toBeNull()
  })
})
