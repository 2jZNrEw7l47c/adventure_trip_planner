# Adventure Trip Planner — Design Spec
**Date:** 2026-05-28  
**Updated:** 2026-05-29  
**Status:** Approved

---

## Overview

A client-side React web app that generates optimized adventure travel itineraries for 25 curated countries. The user selects a country, travel month, and trip duration (7–28 days). Routes are built around major festivals and cultural events. Users can save itineraries to localStorage and print them.

Country data is split into a tiny metadata file (loaded upfront for the selector UI) and per-country JSON files lazy-loaded on demand — keeping the initial bundle small regardless of how many countries are added.

---

## Architecture

**Stack:** React + Vite (SPA), Leaflet.js (maps via OpenStreetMap tiles — no API key required), localStorage for persistence.

No backend. No server. The app runs entirely in the browser.

**Build tooling:** Vite with standard React template. Output is a static bundle deployable to any static host (GitHub Pages, Netlify, etc.).

**Directory structure:**
```
src/
  data/
    countries/
      metadata.json        ← id, name, flag, entryCity, festivalMonths for all 25 (always loaded)
      mongolia.json        ← full festival + destination data, lazy-loaded on selection
      nepal.json
      japan.json
      ... (one JSON file per country, 25 total)
  components/
    LandingView.jsx
    CountrySelector.jsx
    MonthGrid.jsx
    TripLengthSelector.jsx
    FestivalPreview.jsx
    SavedTripsList.jsx
    ItineraryView.jsx
    TopBar.jsx
    DayListSidebar.jsx
    MapPanel.jsx
    DayDetailPanel.jsx
  hooks/
    useLocalStorage.js
    useCountryData.js      ← lazy-loads full country JSON by id
  utils/
    generateItinerary.js
    geo.js
  App.jsx
  main.jsx
```

---

## Data Model

### `src/data/countries/metadata.json` (always loaded, tiny)

```json
[
  {
    "id": "mongolia",
    "name": "Mongolia",
    "flag": "🇲🇳",
    "entryCity": { "name": "Ulaanbaatar", "coords": { "lat": 47.9, "lng": 106.9 } },
    "festivalMonths": [7]
  }
]
```

`festivalMonths` is the list of months that have at least one festival — used to highlight buttons in MonthGrid without loading the full country file.

### Per-country JSON schema (`src/data/countries/<id>.json`, lazy-loaded)

```json
{
  "id": "mongolia",
  "festivals": [
    {
      "id": "naadam",
      "name": "Naadam Festival",
      "dates": { "month": 7, "startDay": 11, "endDay": 13 },
      "location": { "name": "Ulaanbaatar", "coords": { "lat": 47.9, "lng": 106.9 } },
      "description": "Mongolia's greatest festival: horse racing, archery, and wrestling.",
      "importance": "primary",
      "externalLinks": [
        { "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Naadam" }
      ]
    }
  ],
  "destinations": [
    {
      "id": "gorkhi-terelj",
      "name": "Gorkhi-Terelj National Park",
      "region": "Central",
      "coords": { "lat": 47.97, "lng": 107.45 },
      "tags": ["adventure", "horse", "ger", "hiking"],
      "description": "Rocky outcrops and ger camps 60km from Ulaanbaatar.",
      "travelTimeFromEntry": 1.5,
      "priority": 1,
      "bestMonths": [6, 7, 8, 9],
      "externalLinks": [
        { "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Gorkhi-Terelj_National_Park" }
      ]
    }
  ]
}
```

**Description length:** max 1–2 sentences (~120 chars). External links handle deeper content.

**Priority field:** 1 = must-see, 5 = nice-to-have. Used to rank destinations when no festival anchor exists.

### `useCountryData` hook

```js
// src/hooks/useCountryData.js
export function useCountryData(countryId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!countryId) { setData(null); return }
    setLoading(true)
    import(`../data/countries/${countryId}.json`)
      .then(m => { setData(m.default); setLoading(false) })
  }, [countryId])
  return { data, loading }
}
```

### Generated itinerary (stored in localStorage)

```json
{
  "id": "<uuid>",
  "createdAt": "<ISO date>",
  "country": "mongolia",
  "countryName": "Mongolia",
  "month": 7,
  "duration": 14,
  "days": [
    {
      "day": 1,
      "destinationId": "gorkhi-terelj",
      "festivalId": null,
      "title": "Gorkhi-Terelj National Park",
      "notes": "Rocky outcrops and ger camps 60km from Ulaanbaatar.",
      "coords": { "lat": 47.97, "lng": 107.45 },
      "links": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Gorkhi-Terelj_National_Park" }]
    }
  ]
}
```

**localStorage key:** `adventure-planner-saved-trips` → JSON array of itineraries (max 10, oldest removed when exceeded).

---

## UI / UX

### Screen 1 — Landing View

- **App title:** "ADVENTURE PLANNER" + tagline "Custom routes optimized around festivals"
- **Country selector:** Dropdown of 25 curated countries with flag emoji; loaded from `metadata.json`
- **Month grid:** 12-button grid; months in `festivalMonths` for the selected country highlighted in amber (no lazy load needed)
- **Trip length selector:** Row of preset buttons — 7, 10, 14, 21, 28 days; default is 14
- **Festival preview:** Lazy-loads the full country JSON, then shows matching festivals for selected month; shows loading state briefly; shows warning if no festivals ("No major festivals — route will optimize for top adventure spots")
- **Generate button:** Disabled until country, month, and trip length are all selected AND country data has loaded
- **Saved trips list:** Up to 10 saved itineraries; click to reload

### Screen 2 — Itinerary View

Layout: three-column with top bar.

- **Top bar:** Trip title (e.g., "Mongolia · July · 14d"), back arrow, Save button, Print button
- **Day list sidebar (left, ~100px wide):** Scrollable day chips; festival days highlighted amber with ★; active day highlighted
- **Map panel (center):** Leaflet map centered on entry city; numbered div icons; amber polyline route; click pin to select day
- **Day detail panel (right, ~220px wide):** Selected day title, notes, external links

### Print view

`window.print()` with `@media print` CSS: hides map/sidebar/top-bar-actions, shows `.print-itinerary` full-width day list.

---

## Itinerary Generation Logic (`src/utils/generateItinerary.js`)

Input: `(country, month, duration)` — `country` is the lazy-loaded full JSON object  
Output: array of `duration` day objects

**Algorithm:**

1. Filter `country.festivals` where `f.dates.month === month` → `activeFestivals`
2. Find `primaryFestival = activeFestivals.find(f => f.importance === 'primary') ?? activeFestivals[0] ?? null`
3. If festival exists:
   - `festivalLength = festival.dates.endDay - festival.dates.startDay + 1`
   - `minBuffer = Math.max(2, Math.floor(duration * 0.2))`
   - `anchorStart = clamp(Math.floor((duration - festivalLength) / 2), minBuffer + 1, duration - minBuffer - festivalLength + 1)`
   - Pre-anchor days: destinations sorted by `travelTimeFromEntry` asc, cycling with `% length`
   - Anchor days: festival location, title includes "— Day N" if multi-day
   - Post-anchor days: destinations sorted by `distanceKm(dest.coords, festival.location.coords)` asc, cycling
4. If no festival: sort destinations by `priority` asc, cycle for all `duration` days

---

## Adding a New Country

1. Add one entry to `src/data/countries/metadata.json` (id, name, flag, entryCity, festivalMonths)
2. Create `src/data/countries/<id>.json` with festivals and destinations arrays
3. No JS changes required — the lazy-loader resolves by id at runtime

---

## Launch Countries (25)

| # | Country | Flag | Key Festival | Month |
|---|---------|------|-------------|-------|
| 1 | Mongolia | 🇲🇳 | Naadam | July |
| 2 | Nepal | 🇳🇵 | Indra Jatra | Sept |
| 3 | Japan | 🇯🇵 | Gion Matsuri | July |
| 4 | Peru | 🇵🇪 | Inti Raymi | June |
| 5 | Ethiopia | 🇪🇹 | Timkat | Jan |
| 6 | Iceland | 🇮🇸 | Midnight Sun Festival | June |
| 7 | Morocco | 🇲🇦 | Fes Sacred Music Festival | June |
| 8 | India | 🇮🇳 | Holi / Diwali / Pushkar | March / Oct / Nov |
| 9 | Thailand | 🇹🇭 | Songkran / Yi Peng | April / Nov |
| 10 | Mexico | 🇲🇽 | Día de los Muertos / Guelaguetza | Nov / July |
| 11 | Vietnam | 🇻🇳 | Tết / Mid-Autumn Festival | Jan / Sept |
| 12 | Cambodia | 🇰🇭 | Bon Om Touk / Khmer New Year | Nov / April |
| 13 | Bolivia | 🇧🇴 | Carnaval de Oruro | Feb |
| 14 | Colombia | 🇨🇴 | Carnaval de Barranquilla | Feb |
| 15 | Tanzania | 🇹🇿 | Festival of the Dhow Countries | July |
| 16 | Jordan | 🇯🇴 | Jerash Festival | July |
| 17 | Turkey | 🇹🇷 | Kirkpinar Oil Wrestling / Whirling Dervishes | June / Dec |
| 18 | Indonesia | 🇮🇩 | Waisak at Borobudur / Baliem Valley Festival | May / Aug |
| 19 | Bhutan | 🇧🇹 | Paro Tsechu / Thimphu Tshechu | March / Sept |
| 20 | Kenya | 🇰🇪 | Lamu Cultural Festival / Wildebeest Migration | Nov / July |
| 21 | Georgia | 🇬🇪 | Tbilisoba / Rtveli Wine Harvest | Oct / Sept |
| 22 | Laos | 🇱🇦 | Pi Mai Lao / Rocket Festival | April / May |
| 23 | Sri Lanka | 🇱🇰 | Esala Perahera / Sinhala New Year | July / April |
| 24 | Ecuador | 🇪🇨 | Inti Raymi / Carnival | June / Feb |
| 25 | Argentina | 🇦🇷 | Buenos Aires Tango Festival / Vendimia | Aug / March |

---

## Error Handling

- **Country data fails to load:** Show inline error "Could not load country data — try again"; Generate button stays disabled
- **No festivals for selected month:** Generator falls back to adventure-only route; UI shows warning before generating
- **Fewer destinations than trip duration:** Generator cycles through destinations (priority 1–2 repeat before others)
- **localStorage full or unavailable:** Save silently fails; session still works
- **Leaflet tiles fail:** Map shows "Map unavailable" message; detail panel still works

---

## Out of Scope

- User accounts or cloud sync
- Real-time festival data from external APIs
- Booking integration (links only)
- Mobile app (web-responsive only)
- Trip durations other than 7, 10, 14, 21, 28 days
- User-editable itineraries (read-only output)
