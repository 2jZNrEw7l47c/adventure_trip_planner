import { distanceKm } from './geo.js'

describe('distanceKm', () => {
  it('returns 0 for the same point', () => {
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0)
  })
  it('returns ~111 km per degree of latitude', () => {
    const d = distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })
    expect(d).toBeGreaterThan(110)
    expect(d).toBeLessThan(112)
  })
  it('is symmetric', () => {
    const a = { lat: 47.9, lng: 106.9 }
    const b = { lat: 51.1, lng: 100.5 }
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 5)
  })
})
