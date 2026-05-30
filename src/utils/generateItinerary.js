import { distanceKm } from './geo.js'

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

// Spreads totalDays across ordered destinations with consecutive extended stays.
// Extra nights go to the first destinations (closest to start of leg) to avoid back-tracking.
// e.g. distributeExtraDays([A,B,C], 5) → [A,A,B,B,C]  (no A,B,C,A,B wasted trips)
function distributeExtraDays(ordered, totalDays) {
  if (ordered.length === 0 || totalDays <= 0) return []
  const result = []
  const base = Math.floor(totalDays / ordered.length)
  const extra = totalDays % ordered.length
  ordered.forEach((dest, i) => {
    const nights = base + (i < extra ? 1 : 0)
    for (let n = 0; n < nights; n++) result.push(dest)
  })
  return result
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

  days.push({
    day: 1, destinationId: 'entry', festivalId: null,
    title: `${entry.name} — Arrival`,
    notes: `Arrive at ${entry.name}. Settle in and prepare for your adventure.`,
    coords: entry.coords, links: [],
  })

  const innerDays = duration - 2
  const activeFestivals = country.festivals.filter(f => f.dates.month === month)
  const primaryFestival = activeFestivals.find(f => f.importance === 'primary') ?? activeFestivals[0] ?? null

  if (innerDays > 0) {
    if (primaryFestival) {
      const f = primaryFestival
      const festDays = Math.min(f.dates.endDay - f.dates.startDay + 1, 2)
      const explorationDays = innerDays - festDays
      const preCount = Math.max(0, Math.floor(explorationDays / 2))
      const postCount = Math.max(0, explorationDays - preCount)

      // Pre-festival: NN from entry, extend stays consecutively rather than back-tracking
      const preOrdered = nearestNeighbour(entry.coords, country.destinations)
      const uniquePreDests = preOrdered.slice(0, Math.min(preCount, preOrdered.length))
      const preDests = distributeExtraDays(uniquePreDests, preCount)

      // Post-festival: use destinations not in pre first, extend consecutive stays
      const preUsedIds = new Set(uniquePreDests.map(d => d.id))
      const unused = country.destinations.filter(d => !preUsedIds.has(d.id))
      const postPool = unused.length > 0 ? unused : country.destinations
      const postOrdered = nearestNeighbour(f.location.coords, postPool)
      const postDests = distributeExtraDays(postOrdered, postCount)

      let dayNum = 2
      for (const dest of preDests) days.push(makeDestDay(dayNum++, dest))
      for (let i = 0; i < festDays; i++) days.push(makeFestDay(dayNum++, f, i + 1, festDays))
      for (const dest of postDests) days.push(makeDestDay(dayNum++, dest))
    } else {
      // No festival: NN from entry with consecutive extended stays
      const ordered = nearestNeighbour(entry.coords, country.destinations)
      const dests = distributeExtraDays(ordered, innerDays)
      let dayNum = 2
      for (const dest of dests) days.push(makeDestDay(dayNum++, dest))
    }
  }

  days.push({
    day: duration, destinationId: 'entry-return', festivalId: null,
    title: `${entry.name} — Departure`,
    notes: `Return to ${entry.name} for your departure flight. Safe travels!`,
    coords: entry.coords, links: [],
  })

  return days
}
