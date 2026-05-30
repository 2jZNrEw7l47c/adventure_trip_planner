import { distanceKm } from './geo.js'

// Returns destinations in nearest-neighbour order starting from fromCoords (no cycling)
function nearestNeighbour(fromCoords, destinations) {
  const remaining = [...destinations]
  const result = []
  let current = fromCoords
  while (remaining.length > 0) {
    let bestIdx = 0
    let bestDist = distanceKm(current, remaining[0].coords)
    for (let i = 1; i < remaining.length; i++) {
      const d = distanceKm(current, remaining[i].coords)
      if (d < bestDist) { bestDist = d; bestIdx = i }
    }
    result.push(remaining[bestIdx])
    current = remaining[bestIdx].coords
    remaining.splice(bestIdx, 1)
  }
  return result
}

// Repeats arr cyclically to produce exactly count items
function fill(arr, count) {
  if (arr.length === 0 || count <= 0) return []
  return Array.from({ length: count }, (_, i) => arr[i % arr.length])
}

function makeDestDay(day, dest) {
  return { day, destinationId: dest.id, festivalId: null, title: dest.name, notes: dest.description, coords: dest.coords, links: dest.externalLinks }
}

function makeFestDay(day, f, n, totalFestDays) {
  return {
    day,
    destinationId: f.id,
    festivalId: f.id,
    title: totalFestDays > 1 ? `${f.name} — Day ${n}` : f.name,
    notes: f.description,
    coords: f.location.coords,
    links: f.externalLinks,
  }
}

export function generateItinerary(country, countryMeta, month, duration) {
  const entry = countryMeta.entryCity
  const days = []

  // Day 1: arrival at international airport / entry city
  days.push({
    day: 1, destinationId: 'entry', festivalId: null,
    title: `${entry.name} — Arrival`,
    notes: `Arrive at ${entry.name}. Settle in and prepare for your adventure.`,
    coords: entry.coords, links: [],
  })

  const innerDays = duration - 2  // days between arrival and departure
  const activeFestivals = country.festivals.filter(f => f.dates.month === month)
  const primaryFestival = activeFestivals.find(f => f.importance === 'primary') ?? activeFestivals[0] ?? null

  if (innerDays > 0) {
    if (primaryFestival) {
      const f = primaryFestival
      const festDays = Math.min(f.dates.endDay - f.dates.startDay + 1, 2)  // cap at 2 days
      const explorationDays = innerDays - festDays
      const preCount = Math.max(0, Math.floor(explorationDays / 2))
      const postCount = Math.max(0, explorationDays - preCount)

      // Pre-festival: nearest-neighbour route from entry city
      const preOrdered = nearestNeighbour(entry.coords, country.destinations)
      const preDests = fill(preOrdered, preCount)

      // Post-festival: nearest-neighbour from festival location back toward entry
      const postOrdered = nearestNeighbour(f.location.coords, country.destinations)
      const postDests = fill(postOrdered, postCount)

      let dayNum = 2
      for (const dest of preDests) days.push(makeDestDay(dayNum++, dest))
      for (let i = 0; i < festDays; i++) days.push(makeFestDay(dayNum++, f, i + 1, festDays))
      for (const dest of postDests) days.push(makeDestDay(dayNum++, dest))
    } else {
      // No festival — nearest-neighbour from entry, cycling if needed
      const ordered = nearestNeighbour(entry.coords, country.destinations)
      const dests = fill(ordered, innerDays)
      let dayNum = 2
      for (const dest of dests) days.push(makeDestDay(dayNum++, dest))
    }
  }

  // Last day: return to entry city for departure flight
  days.push({
    day: duration, destinationId: 'entry-return', festivalId: null,
    title: `${entry.name} — Departure`,
    notes: `Return to ${entry.name} for your departure flight. Safe travels!`,
    coords: entry.coords, links: [],
  })

  return days
}
