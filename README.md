# Adventure Trip Planner

A client-side React webapp that generates festival-optimized adventure travel itineraries for 25 countries, with an interactive map, day-by-day sidebar, localStorage saves, and print support.

## Features

- **25 countries** across 6 continents, each with curated festivals and destinations
- **Festival-aware routing** — itineraries anchor around the country's primary festival for your chosen month, with up to 2 festival days
- **Priority-based scheduling** — must-see destinations always get their full recommended time before lesser ones are considered
- **Nearest-neighbour routing** — geographically efficient paths with no back-tracking
- **Round-trip structure** — day 1 is arrival at the international gateway, last day is departure
- **Interactive map** — OpenStreetMap with grouped markers (co-located days shown together, click to cycle through), route polyline, auto-fit bounds
- **Day sidebar** — festival days marked ★, click any chip to jump to that day
- **Save & reload** — up to 10 itineraries stored in localStorage
- **Print layout** — text-only print view, map hidden

## Tech Stack

- React 18, Vite 5
- react-leaflet + Leaflet (OpenStreetMap)
- Vitest + @testing-library/react
- localStorage (no backend)

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # run all tests
npm run build     # production build
```

## Trip Lengths

7, 10, 14, 21, or 28 days. Day 1 is arrival, day N is departure. Festival days are capped at 2 and placed in the middle of the trip. Remaining days are split between pre- and post-festival legs, each routed by nearest-neighbour from the entry city / festival location respectively.

## Countries

| Continent | Countries |
|---|---|
| Africa | Ethiopia, Kenya, Morocco, Tanzania |
| Asia | Bhutan, Cambodia, India, Indonesia, Japan, Laos, Mongolia, Nepal, Sri Lanka, Thailand, Vietnam |
| Europe | Georgia, Iceland |
| Middle East | Jordan, Turkey |
| North America | Mexico |
| South America | Argentina, Bolivia, Colombia, Ecuador, Peru |

## Data

Each country JSON file (`src/data/countries/<id>.json`) contains:
- `festivals[]` — name, dates, location, importance (`primary`/`secondary`)
- `destinations[]` — name, coords, priority (1–3), description, tags, external links

`src/data/countries/metadata.json` is always loaded upfront for the country selector. Individual country files are lazy-loaded on selection.
