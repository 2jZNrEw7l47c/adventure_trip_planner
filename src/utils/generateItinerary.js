import { distanceKm } from './geo.js'

export function generateItinerary(country, month, duration) {
  const activeFestivals = country.festivals.filter(f => f.dates.month === month)
  const primaryFestival =
    activeFestivals.find(f => f.importance === 'primary') ??
    activeFestivals[0] ??
    null

  const days = []

  if (primaryFestival) {
    const f = primaryFestival
    const festLen = f.dates.endDay - f.dates.startDay + 1
    const minBuffer = Math.max(2, Math.floor(duration * 0.2))
    const anchorStart = Math.min(
      Math.max(minBuffer + 1, Math.floor((duration - festLen) / 2)),
      duration - minBuffer - festLen + 1
    )
    const anchorEnd = Math.min(anchorStart + festLen - 1, duration)

    const preDestinations = [...country.destinations].sort(
      (a, b) => a.travelTimeFromEntry - b.travelTimeFromEntry
    )
    const postDestinations = [...country.destinations].sort(
      (a, b) => distanceKm(a.coords, f.location.coords) - distanceKm(b.coords, f.location.coords)
    )

    for (let day = 1; day < anchorStart; day++) {
      const dest = preDestinations[(day - 1) % preDestinations.length]
      days.push({ day, destinationId: dest.id, festivalId: null, title: dest.name, notes: dest.description, coords: dest.coords, links: dest.externalLinks })
    }

    for (let day = anchorStart; day <= anchorEnd; day++) {
      const n = day - anchorStart + 1
      days.push({ day, destinationId: f.id, festivalId: f.id, title: festLen > 1 ? `${f.name} — Day ${n}` : f.name, notes: f.description, coords: f.location.coords, links: f.externalLinks })
    }

    let postIdx = 0
    for (let day = anchorEnd + 1; day <= duration; day++) {
      const dest = postDestinations[postIdx++ % postDestinations.length]
      days.push({ day, destinationId: dest.id, festivalId: null, title: dest.name, notes: dest.description, coords: dest.coords, links: dest.externalLinks })
    }
  } else {
    const sorted = [...country.destinations].sort((a, b) => a.priority - b.priority)
    for (let day = 1; day <= duration; day++) {
      const dest = sorted[(day - 1) % sorted.length]
      days.push({ day, destinationId: dest.id, festivalId: null, title: dest.name, notes: dest.description, coords: dest.coords, links: dest.externalLinks })
    }
  }

  return days
}
