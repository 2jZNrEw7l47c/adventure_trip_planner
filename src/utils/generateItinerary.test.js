import { generateItinerary } from './generateItinerary.js'

const mockCountry = {
  id: 'test',
  festivals: [{
    id: 'fest1', name: 'Big Fest', importance: 'primary',
    dates: { month: 7, startDay: 10, endDay: 12 },
    location: { name: 'City', coords: { lat: 0, lng: 0 } },
    description: 'A great festival.', externalLinks: []
  }],
  destinations: [
    { id: 'd1', name: 'Place A', coords: { lat: 1, lng: 1 }, travelTimeFromEntry: 1, priority: 1, description: 'Desc A', externalLinks: [] },
    { id: 'd2', name: 'Place B', coords: { lat: 2, lng: 2 }, travelTimeFromEntry: 2, priority: 2, description: 'Desc B', externalLinks: [] },
    { id: 'd3', name: 'Place C', coords: { lat: 3, lng: 3 }, travelTimeFromEntry: 3, priority: 3, description: 'Desc C', externalLinks: [] },
  ]
}

describe('generateItinerary', () => {
  it.each([7, 10, 14, 21, 28])('returns exactly %i days', duration => {
    expect(generateItinerary(mockCountry, 7, duration)).toHaveLength(duration)
  })

  it('days are numbered 1 through duration', () => {
    const days = generateItinerary(mockCountry, 7, 14)
    days.forEach((d, i) => expect(d.day).toBe(i + 1))
  })

  it('festival days have non-null festivalId', () => {
    const days = generateItinerary(mockCountry, 7, 14)
    expect(days.some(d => d.festivalId !== null)).toBe(true)
  })

  it('anchor falls between day 3 and day 12 for 14-day trip', () => {
    const days = generateItinerary(mockCountry, 7, 14)
    const first = days.find(d => d.festivalId)
    expect(first.day).toBeGreaterThanOrEqual(3)
    expect(first.day).toBeLessThanOrEqual(12)
  })

  it('no festivals → all festivalId null', () => {
    const days = generateItinerary(mockCountry, 1, 7)
    days.forEach(d => expect(d.festivalId).toBeNull())
  })

  it('every day has required fields', () => {
    generateItinerary(mockCountry, 7, 7).forEach(d => {
      expect(d).toHaveProperty('day')
      expect(d).toHaveProperty('destinationId')
      expect(d).toHaveProperty('festivalId')
      expect(d).toHaveProperty('title')
      expect(d).toHaveProperty('notes')
      expect(d).toHaveProperty('coords.lat')
      expect(d).toHaveProperty('links')
    })
  })
})
