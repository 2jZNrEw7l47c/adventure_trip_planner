# Destination Nights & Coverage Design

**Date:** 2026-05-30
**Status:** Approved

## Problem

With 8 destinations per country and even night distribution, 28-day trips either cycle back to already-visited places inefficiently, or important destinations get the same time as minor ones.

Two root causes:
1. **Not enough destinations** — 8 is too few to fill 26 exploration days without repeating
2. **No per-destination weighting** — an iconic site gets the same nights as a transit city

---

## Goals

- Zero cycling at any trip length (7–28 days) for any country
- Priority-1 destinations always get their full recommended time
- Lower-priority destinations fill remaining days without wasting them
- No UI changes required

---

## Data Schema

### New fields on every destination

```json
{
  "id": "angkor-wat",
  "name": "Angkor Wat & Siem Reap",
  "priority": 1,
  "minNights": 2,
  "maxNights": 3,
  "coords": { "lat": 13.41, "lng": 103.87 },
  "...": "existing fields unchanged"
}
```

`priority` already exists. `minNights` and `maxNights` are the only additions.

### Authoring guidelines

| Priority | Character | minNights | maxNights |
|---|---|---|---|
| 1 | Must-see, iconic, irreplaceable | 1–2 | 2–3 |
| 2 | Worthwhile, rewarding, distinct | 1 | 1–2 |
| 3 | Bonus if time allows, day-trip grade | 1 | 1 |

### Target count: 15 destinations per country

Up from 8. With the guidelines above, `sum(maxNights)` across 15 destinations is ~28–32, which covers any trip length without cycling.

Composition target per country:
- 4–5 priority-1 entries
- 5–6 priority-2 entries
- 4–5 priority-3 entries

Every new destination follows the existing schema exactly (id, name, region, coords, tags, description, travelTimeFromEntry, priority, bestMonths, externalLinks, minNights, maxNights).

---

## Algorithm: `allocateLeg`

Replaces `distributeExtraDays` in `generateItinerary.js`.

### Signature

```js
allocateLeg(destinations, budgetDays, startCoords)
// returns: array of day objects (same shape as today), length === budgetDays
```

### Phase 1 — Selection by priority

Walk priority groups 1 → 2 → 3. Within each group, sort by distance from `startCoords` (nearest first — if budget runs out mid-group, the farthest destinations are dropped, not the closest).

```
for priority in [1, 2, 3]:
  group = destinations.filter(p == priority)
             .sortBy(distanceKm(startCoords, dest.coords))
  for dest in group:
    if budget <= 0: break
    if priority <= 2:
      nights = min(dest.maxNights, budget)   // full allocation
    else:
      nights = dest.minNights                // minimum only
    if nights >= dest.minNights:
      selected.push({ dest, nights })
      budget -= nights
```

Any destination where `minNights > remaining budget` is skipped entirely — never visited for less than its minimum.

### Phase 2 — Route selected set

Take the selected set (regardless of selection order) and order it by nearest-neighbour from `startCoords`. This decouples geographic efficiency from the priority selection.

### Integration with pre/post festival structure

No change to the surrounding structure in `generateItinerary`:

```
preCount  = floor(explorationDays / 2)
postCount = explorationDays - preCount

preLeg  = allocateLeg(all destinations,      preCount,  entry.coords)
postLeg = allocateLeg(unused destinations,   postCount, festival.coords)
```

"Unused" means destinations whose IDs did not appear in the pre leg selection.

If `postPool` is empty (all destinations consumed in pre leg), fall back to all destinations for post.

---

## Files Changed

| File | Change |
|---|---|
| `src/data/countries/*.json` (all 25) | Add `minNights`/`maxNights` to existing 8; add 7 new destinations each |
| `src/utils/generateItinerary.js` | Replace `distributeExtraDays` with `allocateLeg` |
| `src/utils/generateItinerary.test.js` | Update tests for new fields and behaviour |

**No changes** to components, metadata.json, or any UI files.

---

## Test Coverage

Update `generateItinerary.test.js` to verify:
- Priority-1 destinations receive `maxNights` when budget allows
- Priority-3 destinations receive only `minNights`
- A destination is skipped entirely if `minNights > remaining budget`
- Total days returned always equals `duration` exactly
- Arrival day 1 and departure day N are still correct
- Festival still capped at 2 days and placed in the middle
