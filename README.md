# Adventure Trip Planner

A client-side React web app that generates optimized adventure travel itineraries built around major festivals and cultural events. Select a country, travel month, and trip duration — the app builds a day-by-day route anchored to the best festival for that time of year.

## Features

- **Festival-anchored itineraries** — routes are optimized around primary festivals for the selected country and month
- **Interactive map** — Leaflet.js map with numbered destination pins and a connecting polyline (no API key required)
- **10 launch countries** — Mongolia, Nepal, Japan, Peru, Ethiopia, Iceland, Morocco, India, Thailand, Mexico
- **Flexible trip lengths** — 7, 10, 14, 21, or 28 days
- **Save & reload** — itineraries persist to localStorage (up to 10 saved trips)
- **Print-ready** — dedicated print stylesheet renders a clean day-by-day list

## Tech Stack

- **React + Vite** (SPA, no backend)
- **Leaflet.js** via OpenStreetMap tiles
- **localStorage** for persistence
- Deployable to any static host (GitHub Pages, Netlify, etc.)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Usage

1. Select a country from the dropdown
2. Choose a travel month — months with festivals are highlighted in amber
3. Pick a trip length (7–28 days)
4. Review the festival preview panel, then click **Generate**
5. Explore the itinerary on the map; click day chips or map pins to see details
6. **Save** the trip to localStorage or **Print** a paper-friendly version

## Launch Countries

| Country | Flag | Key Festival | Month |
|---------|------|-------------|-------|
| Mongolia | 🇲🇳 | Naadam | July |
| Nepal | 🇳🇵 | Indra Jatra | Sept |
| Japan | 🇯🇵 | Gion Matsuri | July |
| Peru | 🇵🇪 | Inti Raymi | June |
| Ethiopia | 🇪🇹 | Timkat | Jan |
| Iceland | 🇮🇸 | Þorrablót / midnight sun | Feb / June |
| Morocco | 🇲🇦 | Fes Sacred Music Festival | June |
| India | 🇮🇳 | Holi / Diwali | March / Oct |
| Thailand | 🇹🇭 | Songkran | April |
| Mexico | 🇲🇽 | Día de los Muertos | Nov |

## Adding a Country

1. Create `src/data/countries/<id>.js` following the schema in [`docs/superpowers/specs/`](docs/superpowers/specs/)
2. Add one export line to `src/data/countries/index.js`:
   ```js
   export { default as kenya } from './kenya.js'
   ```
3. The selector, month grid, festival preview, and itinerary generator all read from the index — no other changes needed.

## Project Structure

```
src/
  data/countries/       ← one JS file per country (festivals + destinations)
  components/           ← React components (LandingView, ItineraryView, MapPanel, …)
  hooks/                ← useLocalStorage, useItinerary
  utils/generateItinerary.js
  App.jsx / main.jsx
```

## Out of Scope

- User accounts or cloud sync
- Real-time festival data from external APIs
- Booking integration (links only)
- Mobile app (web-responsive only)
- Free-form trip duration entry
- User-editable itineraries (read-only output)
