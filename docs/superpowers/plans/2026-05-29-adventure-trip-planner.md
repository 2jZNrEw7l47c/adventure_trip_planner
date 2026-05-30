# Adventure Trip Planner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side React webapp that generates festival-optimized adventure travel itineraries for 25 countries, with a map+panel UI, localStorage saves, and print support.

**Architecture:** React + Vite SPA; `metadata.json` loaded upfront for the country selector; per-country JSON files lazy-loaded on demand via `useCountryData`; no backend.

**Tech Stack:** React 18, Vite 5, react-leaflet + Leaflet (OpenStreetMap), Vitest + @testing-library/react, localStorage

---

## File Structure

```
src/
  data/countries/
    metadata.json              ← id/name/flag/entryCity/festivalMonths for all 25 (always loaded)
    mongolia.json              ← festivals + destinations, loaded on selection
    nepal.json  ...            ← one file per country, 25 total
  components/
    CountrySelector.jsx / .test.jsx
    MonthGrid.jsx / .test.jsx
    TripLengthSelector.jsx / .test.jsx
    FestivalPreview.jsx / .test.jsx
    SavedTripsList.jsx / .test.jsx
    LandingView.jsx / .test.jsx
    TopBar.jsx / .test.jsx
    DayListSidebar.jsx / .test.jsx
    DayDetailPanel.jsx / .test.jsx
    MapPanel.jsx / .test.jsx
    ItineraryView.jsx / .test.jsx
  hooks/
    useLocalStorage.js / .test.js
    useCountryData.js / .test.js
  utils/
    geo.js / .test.js
    generateItinerary.js / .test.js
  App.jsx / .test.jsx
  main.jsx
  index.css
```

---

### Task 1: Project Setup

**Files:**
- Modify: `vite.config.js`
- Create: `src/test-setup.js`

- [ ] **Step 1: Scaffold the project**

```bash
npm create vite@latest . -- --template react
npm install
```

- [ ] **Step 2: Install dependencies**

```bash
npm install react-leaflet leaflet
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Replace `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.js'], globals: true },
})
```

- [ ] **Step 4: Create `src/test-setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to `package.json`**

```diff
  "scripts": {
    "dev": "vite",
    "build": "vite build",
-   "preview": "vite preview"
+   "preview": "vite preview",
+   "test": "vitest run"
  }
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: `Local: http://localhost:5173/`

- [ ] **Step 7: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold vite react project"
```

---

### Task 2: Geo Utility

**Files:**
- Create: `src/utils/geo.js`
- Test: `src/utils/geo.test.js`

- [ ] **Step 1: Write failing tests**

```js
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
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```
Expected: FAIL — `distanceKm is not a function`

- [ ] **Step 3: Implement `src/utils/geo.js`**

```js
export function distanceKm(a, b) {
  const R = 6371
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/geo.js src/utils/geo.test.js
git commit -m "feat: add distanceKm geo utility"
```

---

### Task 3: useLocalStorage Hook

**Files:**
- Create: `src/hooks/useLocalStorage.js`
- Test: `src/hooks/useLocalStorage.test.js`

- [ ] **Step 1: Write failing tests**

```js
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage.js'

beforeEach(() => localStorage.clear())

describe('useLocalStorage', () => {
  it('returns initialValue when key absent', () => {
    const { result } = renderHook(() => useLocalStorage('k', []))
    expect(result.current[0]).toEqual([])
  })
  it('returns stored value when key present', () => {
    localStorage.setItem('k', JSON.stringify([1]))
    const { result } = renderHook(() => useLocalStorage('k', []))
    expect(result.current[0]).toEqual([1])
  })
  it('updates localStorage when setValue called', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    act(() => result.current[1](42))
    expect(JSON.parse(localStorage.getItem('k'))).toBe(42)
  })
  it('accepts updater function', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    act(() => result.current[1](prev => prev + 1))
    expect(result.current[0]).toBe(1)
  })
  it('silently handles JSON parse error', () => {
    localStorage.setItem('k', '{bad}')
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 3: Implement `src/hooks/useLocalStorage.js`**

```js
import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = value => {
    try {
      const v = typeof value === 'function' ? value(storedValue) : value
      setStoredValue(v)
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      // silently fail
    }
  }

  return [storedValue, setValue]
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useLocalStorage.js src/hooks/useLocalStorage.test.js
git commit -m "feat: add useLocalStorage hook"
```

---

### Task 4: useCountryData Hook

**Files:**
- Create: `src/hooks/useCountryData.js`
- Test: `src/hooks/useCountryData.test.js`

- [ ] **Step 1: Write failing tests**

```js
import { renderHook, act, waitFor } from '@testing-library/react'
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
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 3: Implement `src/hooks/useCountryData.js`**

```js
import { useState, useEffect } from 'react'

export function useCountryData(countryId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!countryId) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    import(`../data/countries/${countryId}.json`)
      .then(m => { setData(m.default); setLoading(false) })
      .catch(() => setLoading(false))
  }, [countryId])

  return { data, loading }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCountryData.js src/hooks/useCountryData.test.js
git commit -m "feat: add useCountryData lazy-loader hook"
```

---

### Task 5: Country Metadata + generateItinerary Utility

**Files:**
- Create: `src/data/countries/metadata.json`
- Create: `src/utils/generateItinerary.js`
- Test: `src/utils/generateItinerary.test.js`

- [ ] **Step 1: Create `src/data/countries/metadata.json`**

```json
[
  { "id": "mongolia",   "name": "Mongolia",   "flag": "🇲🇳", "entryCity": { "name": "Ulaanbaatar", "coords": { "lat": 47.9,   "lng": 106.9  }}, "festivalMonths": [7] },
  { "id": "nepal",      "name": "Nepal",       "flag": "🇳🇵", "entryCity": { "name": "Kathmandu",   "coords": { "lat": 27.7,   "lng": 85.3   }}, "festivalMonths": [9, 10] },
  { "id": "japan",      "name": "Japan",       "flag": "🇯🇵", "entryCity": { "name": "Tokyo",       "coords": { "lat": 35.7,   "lng": 139.7  }}, "festivalMonths": [7, 8] },
  { "id": "peru",       "name": "Peru",        "flag": "🇵🇪", "entryCity": { "name": "Lima",        "coords": { "lat": -12.04, "lng": -77.03 }}, "festivalMonths": [2, 6] },
  { "id": "ethiopia",   "name": "Ethiopia",    "flag": "🇪🇹", "entryCity": { "name": "Addis Ababa", "coords": { "lat": 9.0,    "lng": 38.7   }}, "festivalMonths": [1, 9] },
  { "id": "iceland",    "name": "Iceland",     "flag": "🇮🇸", "entryCity": { "name": "Reykjavik",   "coords": { "lat": 64.13,  "lng": -21.93 }}, "festivalMonths": [6] },
  { "id": "morocco",    "name": "Morocco",     "flag": "🇲🇦", "entryCity": { "name": "Casablanca",  "coords": { "lat": 33.59,  "lng": -7.62  }}, "festivalMonths": [5, 6] },
  { "id": "india",      "name": "India",       "flag": "🇮🇳", "entryCity": { "name": "Delhi",       "coords": { "lat": 28.61,  "lng": 77.2   }}, "festivalMonths": [3, 10, 11] },
  { "id": "thailand",   "name": "Thailand",    "flag": "🇹🇭", "entryCity": { "name": "Bangkok",     "coords": { "lat": 13.75,  "lng": 100.52 }}, "festivalMonths": [4, 11] },
  { "id": "mexico",     "name": "Mexico",      "flag": "🇲🇽", "entryCity": { "name": "Mexico City", "coords": { "lat": 19.43,  "lng": -99.13 }}, "festivalMonths": [7, 11] },
  { "id": "vietnam",    "name": "Vietnam",     "flag": "🇻🇳", "entryCity": { "name": "Hanoi",       "coords": { "lat": 21.03,  "lng": 105.85 }}, "festivalMonths": [1, 9] },
  { "id": "cambodia",   "name": "Cambodia",    "flag": "🇰🇭", "entryCity": { "name": "Phnom Penh",  "coords": { "lat": 11.56,  "lng": 104.92 }}, "festivalMonths": [4, 11] },
  { "id": "bolivia",    "name": "Bolivia",     "flag": "🇧🇴", "entryCity": { "name": "La Paz",      "coords": { "lat": -16.5,  "lng": -68.15 }}, "festivalMonths": [1, 2] },
  { "id": "colombia",   "name": "Colombia",    "flag": "🇨🇴", "entryCity": { "name": "Bogotá",      "coords": { "lat": 4.71,   "lng": -74.07 }}, "festivalMonths": [2, 12] },
  { "id": "tanzania",   "name": "Tanzania",    "flag": "🇹🇿", "entryCity": { "name": "Dar es Salaam","coords": { "lat": -6.8,  "lng": 39.28  }}, "festivalMonths": [2, 7] },
  { "id": "jordan",     "name": "Jordan",      "flag": "🇯🇴", "entryCity": { "name": "Amman",       "coords": { "lat": 31.96,  "lng": 35.94  }}, "festivalMonths": [4, 7] },
  { "id": "turkey",     "name": "Turkey",      "flag": "🇹🇷", "entryCity": { "name": "Istanbul",    "coords": { "lat": 41.01,  "lng": 28.96  }}, "festivalMonths": [6, 12] },
  { "id": "indonesia",  "name": "Indonesia",   "flag": "🇮🇩", "entryCity": { "name": "Jakarta",     "coords": { "lat": -6.21,  "lng": 106.85 }}, "festivalMonths": [3, 5, 8] },
  { "id": "bhutan",     "name": "Bhutan",      "flag": "🇧🇹", "entryCity": { "name": "Paro",        "coords": { "lat": 27.43,  "lng": 89.42  }}, "festivalMonths": [3, 9] },
  { "id": "kenya",      "name": "Kenya",       "flag": "🇰🇪", "entryCity": { "name": "Nairobi",     "coords": { "lat": -1.29,  "lng": 36.82  }}, "festivalMonths": [7, 11] },
  { "id": "georgia",    "name": "Georgia",     "flag": "🇬🇪", "entryCity": { "name": "Tbilisi",     "coords": { "lat": 41.69,  "lng": 44.83  }}, "festivalMonths": [9, 10] },
  { "id": "laos",       "name": "Laos",        "flag": "🇱🇦", "entryCity": { "name": "Vientiane",   "coords": { "lat": 17.97,  "lng": 102.6  }}, "festivalMonths": [4, 5] },
  { "id": "sri-lanka",  "name": "Sri Lanka",   "flag": "🇱🇰", "entryCity": { "name": "Colombo",     "coords": { "lat": 6.93,   "lng": 79.85  }}, "festivalMonths": [4, 7] },
  { "id": "ecuador",    "name": "Ecuador",     "flag": "🇪🇨", "entryCity": { "name": "Quito",       "coords": { "lat": -0.22,  "lng": -78.51 }}, "festivalMonths": [2, 6] },
  { "id": "argentina",  "name": "Argentina",   "flag": "🇦🇷", "entryCity": { "name": "Buenos Aires","coords": { "lat": -34.6,  "lng": -58.38 }}, "festivalMonths": [3, 8] }
]
```

- [ ] **Step 2: Write failing tests for `generateItinerary`**

```js
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
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 4: Implement `src/utils/generateItinerary.js`**

```js
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
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test
```
Expected: PASS (10 tests)

- [ ] **Step 6: Commit**

```bash
git add src/data/countries/metadata.json src/utils/generateItinerary.js src/utils/generateItinerary.test.js
git commit -m "feat: add country metadata, generateItinerary utility"
```

---

### Task 11: CountrySelector Component

**Files:**
- Create: `src/components/CountrySelector.jsx`
- Test: `src/components/CountrySelector.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CountrySelector } from './CountrySelector.jsx'

const mockMeta = [
  { id: 'mongolia', name: 'Mongolia', flag: '🇲🇳' },
  { id: 'nepal', name: 'Nepal', flag: '🇳🇵' },
]
vi.mock('../data/countries/metadata.json', () => ({ default: mockMeta }))

describe('CountrySelector', () => {
  it('renders placeholder and all country options', () => {
    render(<CountrySelector selectedId={null} onChange={() => {}} />)
    expect(screen.getByRole('option', { name: /select a destination/i })).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })
  it('calls onChange with id when option selected', () => {
    const onChange = vi.fn()
    render(<CountrySelector selectedId={null} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mongolia' } })
    expect(onChange).toHaveBeenCalledWith('mongolia')
  })
  it('calls onChange with null when placeholder selected', () => {
    const onChange = vi.fn()
    render(<CountrySelector selectedId="mongolia" onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- CountrySelector
```

- [ ] **Step 3: Implement**

```jsx
import countryMeta from '../data/countries/metadata.json'

export function CountrySelector({ selectedId, onChange }) {
  return (
    <select
      className="country-select"
      value={selectedId ?? ''}
      onChange={e => onChange(e.target.value || null)}
    >
      <option value="">Select a destination...</option>
      {countryMeta.map(c => (
        <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
      ))}
    </select>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- CountrySelector
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/CountrySelector.jsx src/components/CountrySelector.test.jsx
git commit -m "feat: add CountrySelector component"
```

---

### Task 12: MonthGrid Component

**Files:**
- Create: `src/components/MonthGrid.jsx`
- Test: `src/components/MonthGrid.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthGrid } from './MonthGrid.jsx'

const mockMeta = { id: 'test', festivalMonths: [3, 7] }

describe('MonthGrid', () => {
  it('renders 12 month buttons', () => {
    render(<MonthGrid countryMeta={null} selectedMonth={null} onChange={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(12)
  })
  it('adds has-festival class to festival months', () => {
    render(<MonthGrid countryMeta={mockMeta} selectedMonth={null} onChange={() => {}} />)
    const btns = screen.getAllByRole('button')
    expect(btns[2]).toHaveClass('has-festival')   // March
    expect(btns[6]).toHaveClass('has-festival')   // July
    expect(btns[0]).not.toHaveClass('has-festival')
  })
  it('adds selected class to selected month', () => {
    render(<MonthGrid countryMeta={null} selectedMonth={7} onChange={() => {}} />)
    expect(screen.getAllByRole('button')[6]).toHaveClass('selected')
  })
  it('calls onChange with 1-based month number', () => {
    const onChange = vi.fn()
    render(<MonthGrid countryMeta={null} selectedMonth={null} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Jun' }))
    expect(onChange).toHaveBeenCalledWith(6)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- MonthGrid
```

- [ ] **Step 3: Implement**

```jsx
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function MonthGrid({ countryMeta, selectedMonth, onChange }) {
  const festivalMonths = new Set(countryMeta?.festivalMonths ?? [])
  return (
    <div className="month-grid">
      {MONTHS.map((name, i) => {
        const month = i + 1
        return (
          <button
            key={month}
            className={[
              'month-btn',
              festivalMonths.has(month) ? 'has-festival' : '',
              selectedMonth === month ? 'selected' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onChange(month)}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- MonthGrid
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/MonthGrid.jsx src/components/MonthGrid.test.jsx
git commit -m "feat: add MonthGrid component"
```

---

### Task 13: TripLengthSelector Component

**Files:**
- Create: `src/components/TripLengthSelector.jsx`
- Test: `src/components/TripLengthSelector.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TripLengthSelector } from './TripLengthSelector.jsx'

describe('TripLengthSelector', () => {
  it('renders 5 duration options', () => {
    render(<TripLengthSelector selected={14} onChange={() => {}} />)
    ;['7d','10d','14d','21d','28d'].forEach(label =>
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    )
  })
  it('marks selected duration', () => {
    render(<TripLengthSelector selected={14} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '14d' })).toHaveClass('selected')
    expect(screen.getByRole('button', { name: '7d' })).not.toHaveClass('selected')
  })
  it('calls onChange with numeric value', () => {
    const onChange = vi.fn()
    render(<TripLengthSelector selected={14} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '21d' }))
    expect(onChange).toHaveBeenCalledWith(21)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- TripLengthSelector
```

- [ ] **Step 3: Implement**

```jsx
const DURATIONS = [7, 10, 14, 21, 28]

export function TripLengthSelector({ selected, onChange }) {
  return (
    <div className="duration-selector">
      {DURATIONS.map(d => (
        <button
          key={d}
          className={`duration-btn${selected === d ? ' selected' : ''}`}
          onClick={() => onChange(d)}
        >
          {d}d
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- TripLengthSelector
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/TripLengthSelector.jsx src/components/TripLengthSelector.test.jsx
git commit -m "feat: add TripLengthSelector component"
```

---

### Task 14: FestivalPreview Component

**Files:**
- Create: `src/components/FestivalPreview.jsx`
- Test: `src/components/FestivalPreview.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen } from '@testing-library/react'
import { FestivalPreview } from './FestivalPreview.jsx'

const mockCountryData = {
  festivals: [
    { id: 'f1', name: 'Naadam', dates: { month: 7, startDay: 11, endDay: 13 } },
    { id: 'f2', name: 'Other Fest', dates: { month: 8, startDay: 1, endDay: 3 } },
  ]
}

describe('FestivalPreview', () => {
  it('returns null when countryData is null', () => {
    const { container } = render(<FestivalPreview countryData={null} loading={false} countryName="X" month={7} />)
    expect(container.firstChild).toBeNull()
  })
  it('returns null when month is null', () => {
    const { container } = render(<FestivalPreview countryData={mockCountryData} loading={false} countryName="X" month={null} />)
    expect(container.firstChild).toBeNull()
  })
  it('shows loading state', () => {
    render(<FestivalPreview countryData={null} loading={true} countryName="X" month={7} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
  it('shows festival names for matching month', () => {
    render(<FestivalPreview countryData={mockCountryData} loading={false} countryName="Mongolia" month={7} />)
    expect(screen.getByText(/Naadam/)).toBeInTheDocument()
  })
  it('shows warning when no festivals in month', () => {
    render(<FestivalPreview countryData={mockCountryData} loading={false} countryName="Mongolia" month={1} />)
    expect(screen.getByText(/No major festivals/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- FestivalPreview
```

- [ ] **Step 3: Implement**

```jsx
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function FestivalPreview({ countryData, loading, countryName, month }) {
  if (!month) return null
  if (loading) return <div className="festival-preview">Loading festivals...</div>
  if (!countryData) return null

  const festivals = countryData.festivals.filter(f => f.dates.month === month)
  if (festivals.length === 0) {
    return (
      <div className="festival-preview festival-preview--warning">
        No major festivals in this month — route will optimize for top adventure spots
      </div>
    )
  }
  return (
    <div className="festival-preview">
      <div className="festival-preview__title">★ Festivals in {countryName} · {MONTHS[month - 1]}</div>
      {festivals.map(f => (
        <div key={f.id} className="festival-preview__item">
          • {f.name} — {MONTHS[f.dates.month - 1]} {f.dates.startDay}–{f.dates.endDay}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- FestivalPreview
```
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/FestivalPreview.jsx src/components/FestivalPreview.test.jsx
git commit -m "feat: add FestivalPreview component"
```

---

### Task 15: SavedTripsList Component

**Files:**
- Create: `src/components/SavedTripsList.jsx`
- Test: `src/components/SavedTripsList.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SavedTripsList } from './SavedTripsList.jsx'

const trips = [
  { id: '1', countryName: 'Mongolia', month: 7, duration: 14, country: 'mongolia', days: [], createdAt: '' },
  { id: '2', countryName: 'Japan', month: 8, duration: 10, country: 'japan', days: [], createdAt: '' },
]

describe('SavedTripsList', () => {
  it('renders nothing when trips empty', () => {
    const { container } = render(<SavedTripsList trips={[]} onLoad={() => {}} onDelete={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
  it('renders each trip with name, month, duration', () => {
    render(<SavedTripsList trips={trips} onLoad={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/Mongolia · July · 14d/)).toBeInTheDocument()
    expect(screen.getByText(/Japan · August · 10d/)).toBeInTheDocument()
  })
  it('calls onLoad with trip when clicked', () => {
    const onLoad = vi.fn()
    render(<SavedTripsList trips={trips} onLoad={onLoad} onDelete={() => {}} />)
    fireEvent.click(screen.getByText(/Mongolia/))
    expect(onLoad).toHaveBeenCalledWith(trips[0])
  })
  it('calls onDelete with id when × clicked', () => {
    const onDelete = vi.fn()
    render(<SavedTripsList trips={trips} onLoad={() => {}} onDelete={onDelete} />)
    fireEvent.click(screen.getAllByText('×')[1])
    expect(onDelete).toHaveBeenCalledWith('2')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- SavedTripsList
```

- [ ] **Step 3: Implement**

```jsx
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function SavedTripsList({ trips, onLoad, onDelete }) {
  if (trips.length === 0) return null
  return (
    <div className="saved-trips">
      <div className="saved-trips__title">Saved itineraries</div>
      {trips.map(trip => (
        <div key={trip.id} className="saved-trips__item">
          <button className="saved-trips__load" onClick={() => onLoad(trip)}>
            {trip.countryName} · {MONTH_NAMES[trip.month - 1]} · {trip.duration}d
          </button>
          <button className="saved-trips__delete" onClick={() => onDelete(trip.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- SavedTripsList
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/SavedTripsList.jsx src/components/SavedTripsList.test.jsx
git commit -m "feat: add SavedTripsList component"
```

---

### Task 16: LandingView Component

**Files:**
- Create: `src/components/LandingView.jsx`
- Test: `src/components/LandingView.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LandingView } from './LandingView.jsx'

vi.mock('../data/countries/metadata.json', () => ({
  default: [{ id: 'mongolia', name: 'Mongolia', flag: '🇲🇳', entryCity: { name: 'UB', coords: { lat: 47.9, lng: 106.9 } }, festivalMonths: [7] }]
}))
vi.mock('../hooks/useCountryData.js', () => ({
  useCountryData: () => ({ data: null, loading: false })
}))

describe('LandingView', () => {
  it('generate button disabled when no country selected', () => {
    render(<LandingView savedTrips={[]} onGenerate={() => {}} onLoad={() => {}} onDeleteTrip={() => {}} />)
    expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled()
  })
  it('generate button enabled after country and month selected', () => {
    render(<LandingView savedTrips={[]} onGenerate={() => {}} onLoad={() => {}} onDeleteTrip={() => {}} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mongolia' } })
    fireEvent.click(screen.getByRole('button', { name: 'Jul' }))
    expect(screen.getByRole('button', { name: /generate/i })).not.toBeDisabled()
  })
  it('calls onGenerate with (countryMeta, countryData, month, duration)', () => {
    const onGenerate = vi.fn()
    render(<LandingView savedTrips={[]} onGenerate={onGenerate} onLoad={() => {}} onDeleteTrip={() => {}} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mongolia' } })
    fireEvent.click(screen.getByRole('button', { name: 'Jul' }))
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'mongolia' }),
      null,
      7,
      14
    )
  })
  it('duration defaults to 14', () => {
    render(<LandingView savedTrips={[]} onGenerate={() => {}} onLoad={() => {}} onDeleteTrip={() => {}} />)
    expect(screen.getByRole('button', { name: '14d' })).toHaveClass('selected')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- LandingView
```

- [ ] **Step 3: Implement**

```jsx
import { useState } from 'react'
import countryMeta from '../data/countries/metadata.json'
import { useCountryData } from '../hooks/useCountryData.js'
import { CountrySelector } from './CountrySelector.jsx'
import { MonthGrid } from './MonthGrid.jsx'
import { TripLengthSelector } from './TripLengthSelector.jsx'
import { FestivalPreview } from './FestivalPreview.jsx'
import { SavedTripsList } from './SavedTripsList.jsx'

export function LandingView({ savedTrips, onGenerate, onLoad, onDeleteTrip }) {
  const [countryId, setCountryId] = useState(null)
  const [month, setMonth] = useState(null)
  const [duration, setDuration] = useState(14)
  const { data: countryData, loading } = useCountryData(countryId)
  const selectedMeta = countryMeta.find(c => c.id === countryId) ?? null
  const canGenerate = countryId !== null && month !== null && !loading

  return (
    <div className="landing">
      <header className="landing__header">
        <h1>ADVENTURE PLANNER</h1>
        <p>Custom routes optimized around festivals</p>
      </header>
      <main className="landing__form">
        <label>Destination</label>
        <CountrySelector selectedId={countryId} onChange={setCountryId} />
        <label>Travel Month</label>
        <MonthGrid countryMeta={selectedMeta} selectedMonth={month} onChange={setMonth} />
        <label>Trip Length</label>
        <TripLengthSelector selected={duration} onChange={setDuration} />
        <FestivalPreview countryData={countryData} loading={loading} countryName={selectedMeta?.name} month={month} />
        <button
          className="generate-btn"
          disabled={!canGenerate}
          onClick={() => onGenerate(selectedMeta, countryData, month, duration)}
        >
          GENERATE MY ITINERARY →
        </button>
        <SavedTripsList trips={savedTrips} onLoad={onLoad} onDelete={onDeleteTrip} />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- LandingView
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/LandingView.jsx src/components/LandingView.test.jsx
git commit -m "feat: add LandingView component"
```

---

### Task 17: TopBar Component

**Files:**
- Create: `src/components/TopBar.jsx`
- Test: `src/components/TopBar.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar.jsx'

describe('TopBar', () => {
  it('displays title', () => {
    render(<TopBar title="Mongolia · July · 14d" onBack={vi.fn()} onSave={vi.fn()} onPrint={vi.fn()} />)
    expect(screen.getByText('Mongolia · July · 14d')).toBeInTheDocument()
  })
  it('calls onBack', () => {
    const onBack = vi.fn()
    render(<TopBar title="X" onBack={onBack} onSave={vi.fn()} onPrint={vi.fn()} />)
    fireEvent.click(screen.getByText('← Back'))
    expect(onBack).toHaveBeenCalled()
  })
  it('calls onSave', () => {
    const onSave = vi.fn()
    render(<TopBar title="X" onBack={vi.fn()} onSave={onSave} onPrint={vi.fn()} />)
    fireEvent.click(screen.getByText('💾 Save'))
    expect(onSave).toHaveBeenCalled()
  })
  it('calls onPrint', () => {
    const onPrint = vi.fn()
    render(<TopBar title="X" onBack={vi.fn()} onSave={vi.fn()} onPrint={onPrint} />)
    fireEvent.click(screen.getByText('🖨 Print'))
    expect(onPrint).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- TopBar
```

- [ ] **Step 3: Implement**

```jsx
export function TopBar({ title, onBack, onSave, onPrint }) {
  return (
    <div className="top-bar">
      <button className="top-bar__back" onClick={onBack}>← Back</button>
      <span className="top-bar__title">{title}</span>
      <div className="top-bar__actions">
        <button className="top-bar__save" onClick={onSave}>💾 Save</button>
        <button className="top-bar__print" onClick={onPrint}>🖨 Print</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- TopBar
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/TopBar.jsx src/components/TopBar.test.jsx
git commit -m "feat: add TopBar component"
```

---

### Task 18: DayListSidebar Component

**Files:**
- Create: `src/components/DayListSidebar.jsx`
- Test: `src/components/DayListSidebar.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DayListSidebar } from './DayListSidebar.jsx'

const days = [
  { day: 1, title: 'UB', festivalId: null },
  { day: 2, title: 'Naadam', festivalId: 'naadam' },
  { day: 3, title: 'Steppe', festivalId: null },
]

describe('DayListSidebar', () => {
  it('renders one button per day', () => {
    render(<DayListSidebar days={days} selectedDay={1} onSelectDay={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })
  it('festival days get day-chip--festival class', () => {
    render(<DayListSidebar days={days} selectedDay={1} onSelectDay={() => {}} />)
    expect(screen.getAllByRole('button')[1]).toHaveClass('day-chip--festival')
  })
  it('active day gets day-chip--active class', () => {
    render(<DayListSidebar days={days} selectedDay={2} onSelectDay={() => {}} />)
    expect(screen.getAllByRole('button')[1]).toHaveClass('day-chip--active')
  })
  it('calls onSelectDay with correct day number', () => {
    const onSelectDay = vi.fn()
    render(<DayListSidebar days={days} selectedDay={1} onSelectDay={onSelectDay} />)
    fireEvent.click(screen.getAllByRole('button')[2])
    expect(onSelectDay).toHaveBeenCalledWith(3)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- DayListSidebar
```

- [ ] **Step 3: Implement**

```jsx
export function DayListSidebar({ days, selectedDay, onSelectDay }) {
  return (
    <div className="day-list-sidebar">
      {days.map(day => (
        <button
          key={day.day}
          className={[
            'day-chip',
            day.festivalId ? 'day-chip--festival' : '',
            selectedDay === day.day ? 'day-chip--active' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => onSelectDay(day.day)}
        >
          <span className="day-chip__num">{day.festivalId ? '★' : day.day}</span>
          <span className="day-chip__title">{day.title}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- DayListSidebar
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/DayListSidebar.jsx src/components/DayListSidebar.test.jsx
git commit -m "feat: add DayListSidebar component"
```

---

### Task 19: DayDetailPanel Component

**Files:**
- Create: `src/components/DayDetailPanel.jsx`
- Test: `src/components/DayDetailPanel.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen } from '@testing-library/react'
import { DayDetailPanel } from './DayDetailPanel.jsx'

const day = { day: 2, title: 'Naadam', notes: 'Horse racing and wrestling.', festivalId: 'naadam', links: [{ label: 'Info', url: 'https://example.com' }] }

describe('DayDetailPanel', () => {
  it('shows "Select a day" when day is null', () => {
    render(<DayDetailPanel day={null} />)
    expect(screen.getByText('Select a day')).toBeInTheDocument()
  })
  it('shows title and notes', () => {
    render(<DayDetailPanel day={day} />)
    expect(screen.getByText('Naadam')).toBeInTheDocument()
    expect(screen.getByText(/Horse racing/)).toBeInTheDocument()
  })
  it('renders external links with correct href', () => {
    render(<DayDetailPanel day={day} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })
  it('festival days show ★ in day number', () => {
    render(<DayDetailPanel day={day} />)
    expect(screen.getByText('★ Day 2')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- DayDetailPanel
```

- [ ] **Step 3: Implement**

```jsx
export function DayDetailPanel({ day }) {
  if (!day) return <div className="day-detail-panel day-detail-panel--empty">Select a day</div>
  return (
    <div className="day-detail-panel">
      <div className="day-detail__number">{day.festivalId ? '★ ' : ''}Day {day.day}</div>
      <h2 className="day-detail__title">{day.title}</h2>
      <p className="day-detail__notes">{day.notes}</p>
      <div className="day-detail__links">
        {day.links.map((link, i) => (
          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="day-detail__link">
            → {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- DayDetailPanel
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/DayDetailPanel.jsx src/components/DayDetailPanel.test.jsx
git commit -m "feat: add DayDetailPanel component"
```

---

### Task 20: MapPanel Component

**Files:**
- Create: `src/components/MapPanel.jsx`
- Test: `src/components/MapPanel.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MapPanel } from './MapPanel.jsx'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children, eventHandlers }) => (
    <button data-testid="map-marker" onClick={eventHandlers?.click}>{children}</button>
  ),
  Popup: ({ children }) => <div>{children}</div>,
  Polyline: () => null,
  useMap: () => ({ setView: vi.fn() }),
}))
vi.mock('leaflet', () => ({ default: { divIcon: vi.fn(() => ({})) } }))

const days = [
  { day: 1, title: 'UB', festivalId: null, coords: { lat: 47.9, lng: 106.9 } },
  { day: 2, title: 'Naadam', festivalId: 'naadam', coords: { lat: 47.9, lng: 106.9 } },
]

describe('MapPanel', () => {
  it('renders map container', () => {
    render(<MapPanel days={days} selectedDay={1} onSelectDay={() => {}} center={[47.9, 106.9]} zoom={5} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })
  it('renders a marker per day', () => {
    render(<MapPanel days={days} selectedDay={1} onSelectDay={() => {}} center={[47.9, 106.9]} zoom={5} />)
    expect(screen.getAllByTestId('map-marker')).toHaveLength(2)
  })
  it('calls onSelectDay with day number when marker clicked', () => {
    const onSelectDay = vi.fn()
    render(<MapPanel days={days} selectedDay={1} onSelectDay={onSelectDay} center={[47.9, 106.9]} zoom={5} />)
    fireEvent.click(screen.getAllByTestId('map-marker')[1])
    expect(onSelectDay).toHaveBeenCalledWith(2)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- MapPanel
```

- [ ] **Step 3: Implement `src/components/MapPanel.jsx`**

```jsx
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [center, zoom, map])
  return null
}

function dayIcon(dayNum, isFestival) {
  return L.divIcon({
    className: `day-marker${isFestival ? ' day-marker--festival' : ''}`,
    html: `<span>${dayNum}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  })
}

export function MapPanel({ days, selectedDay, onSelectDay, center, zoom }) {
  const positions = days.map(d => [d.coords.lat, d.coords.lng])
  return (
    <div className="map-panel" data-testid="map-panel">
      <MapContainer center={center} zoom={zoom} className="leaflet-map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        />
        <MapUpdater center={center} zoom={zoom} />
        <Polyline positions={positions} color="#f0a500" weight={2} opacity={0.7} />
        {days.map(day => (
          <Marker
            key={day.day}
            position={[day.coords.lat, day.coords.lng]}
            icon={dayIcon(day.day, !!day.festivalId)}
            eventHandlers={{ click: () => onSelectDay(day.day) }}
          >
            <Popup>{day.day}. {day.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- MapPanel
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/MapPanel.jsx src/components/MapPanel.test.jsx
git commit -m "feat: add MapPanel component with Leaflet"
```

---

### Task 21: ItineraryView Component

**Files:**
- Create: `src/components/ItineraryView.jsx`
- Test: `src/components/ItineraryView.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ItineraryView } from './ItineraryView.jsx'

vi.mock('./MapPanel.jsx', () => ({
  MapPanel: ({ onSelectDay, days }) => (
    <div data-testid="mock-map">
      {days.map(d => <button key={d.day} onClick={() => onSelectDay(d.day)}>day-{d.day}</button>)}
    </div>
  )
}))

const mockMeta = { name: 'Mongolia', id: 'mongolia', entryCity: { coords: { lat: 47.9, lng: 106.9 } } }
const mockItinerary = {
  id: '1', createdAt: '', country: 'mongolia', countryName: 'Mongolia', month: 7, duration: 3,
  days: [
    { day: 1, title: 'Day One', notes: 'Notes 1', festivalId: null, destinationId: 'd1', coords: { lat: 47.9, lng: 106.9 }, links: [] },
    { day: 2, title: 'Naadam', notes: 'Notes 2', festivalId: 'naadam', destinationId: 'naadam', coords: { lat: 47.9, lng: 106.9 }, links: [{ label: 'Info', url: 'https://example.com' }] },
    { day: 3, title: 'Day Three', notes: 'Notes 3', festivalId: null, destinationId: 'd2', coords: { lat: 48.0, lng: 107.0 }, links: [] },
  ]
}

describe('ItineraryView', () => {
  it('shows title in top bar', () => {
    render(<ItineraryView itinerary={mockItinerary} countryMeta={mockMeta} onBack={() => {}} onSave={() => {}} />)
    expect(screen.getByText('Mongolia · July · 3d')).toBeInTheDocument()
  })
  it('shows day 1 detail by default', () => {
    render(<ItineraryView itinerary={mockItinerary} countryMeta={mockMeta} onBack={() => {}} onSave={() => {}} />)
    expect(screen.getByText('Day One')).toBeInTheDocument()
  })
  it('clicking sidebar chip updates detail panel', () => {
    render(<ItineraryView itinerary={mockItinerary} countryMeta={mockMeta} onBack={() => {}} onSave={() => {}} />)
    const chips = screen.getAllByRole('button')
    fireEvent.click(chips.find(b => b.textContent.includes('Naadam')))
    expect(screen.getByText('Notes 2')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- ItineraryView
```

- [ ] **Step 3: Implement**

```jsx
import { useState } from 'react'
import { TopBar } from './TopBar.jsx'
import { DayListSidebar } from './DayListSidebar.jsx'
import { MapPanel } from './MapPanel.jsx'
import { DayDetailPanel } from './DayDetailPanel.jsx'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function ItineraryView({ itinerary, countryMeta, onBack, onSave }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const currentDay = itinerary.days.find(d => d.day === selectedDay) ?? null
  const title = `${countryMeta.name} · ${MONTH_NAMES[itinerary.month - 1]} · ${itinerary.duration}d`
  return (
    <div className="itinerary-view">
      <TopBar title={title} onBack={onBack} onSave={onSave} onPrint={() => window.print()} />
      <div className="itinerary-view__body">
        <DayListSidebar days={itinerary.days} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        <MapPanel
          days={itinerary.days}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          center={[countryMeta.entryCity.coords.lat, countryMeta.entryCity.coords.lng]}
          zoom={5}
        />
        <DayDetailPanel day={currentDay} />
      </div>
      <div className="print-itinerary">
        <h2>{title}</h2>
        {itinerary.days.map(day => (
          <div key={day.day} className="print-day">
            <h3>Day {day.day}{day.festivalId ? ' ★' : ''} — {day.title}</h3>
            <p>{day.notes}</p>
            {day.links.map((l, i) => <div key={i}>{l.label}: {l.url}</div>)}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- ItineraryView
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ItineraryView.jsx src/components/ItineraryView.test.jsx
git commit -m "feat: add ItineraryView component"
```

---

### Task 22: App Root + CSS

**Files:**
- Create: `src/App.jsx`
- Create: `src/main.jsx`
- Create: `src/index.css`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App.jsx'

vi.mock('./components/LandingView.jsx', () => ({
  LandingView: ({ onGenerate }) => (
    <div>
      <span>ADVENTURE PLANNER</span>
      <button onClick={() => onGenerate(
        { id: 'mongolia', name: 'Mongolia', entryCity: { coords: { lat: 47.9, lng: 106.9 } }, festivalMonths: [7] },
        { festivals: [], destinations: [] },
        7, 3
      )}>Generate</button>
    </div>
  )
}))
vi.mock('./components/ItineraryView.jsx', () => ({
  ItineraryView: ({ onBack }) => (
    <div><span>ITINERARY VIEW</span><button onClick={onBack}>Back</button></div>
  )
}))
vi.mock('./utils/generateItinerary.js', () => ({
  generateItinerary: () => [
    { day: 1, title: 'UB', notes: '', festivalId: null, destinationId: 'd1', coords: { lat: 47.9, lng: 106.9 }, links: [] }
  ]
}))

describe('App', () => {
  it('renders landing view initially', () => {
    render(<App />)
    expect(screen.getByText('ADVENTURE PLANNER')).toBeInTheDocument()
  })
  it('switches to itinerary view and back', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Generate'))
    expect(screen.getByText('ITINERARY VIEW')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('ADVENTURE PLANNER')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- App
```

- [ ] **Step 3: Implement `src/App.jsx`**

```jsx
import { useState } from 'react'
import { generateItinerary } from './utils/generateItinerary.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { LandingView } from './components/LandingView.jsx'
import { ItineraryView } from './components/ItineraryView.jsx'

const STORAGE_KEY = 'adventure-planner-saved-trips'

export default function App() {
  const [view, setView] = useState('landing')
  const [activeItinerary, setActiveItinerary] = useState(null)
  const [activeMeta, setActiveMeta] = useState(null)
  const [savedTrips, setSavedTrips] = useLocalStorage(STORAGE_KEY, [])

  function handleGenerate(countryMeta, countryData, month, duration) {
    const days = generateItinerary(countryData, month, duration)
    const itinerary = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      country: countryMeta.id,
      countryName: countryMeta.name,
      month, duration, days,
    }
    setActiveItinerary(itinerary)
    setActiveMeta(countryMeta)
    setView('itinerary')
  }

  function handleSave() {
    setSavedTrips(prev => {
      const updated = [activeItinerary, ...prev.filter(t => t.id !== activeItinerary.id)]
      return updated.slice(0, 10)
    })
  }

  function handleLoad(trip) {
    import(`./data/countries/metadata.json`).then(m => {
      const meta = m.default.find(c => c.id === trip.country)
      setActiveMeta(meta)
      setActiveItinerary(trip)
      setView('itinerary')
    })
  }

  if (view === 'itinerary' && activeItinerary) {
    return (
      <ItineraryView
        itinerary={activeItinerary}
        countryMeta={activeMeta}
        onBack={() => setView('landing')}
        onSave={handleSave}
      />
    )
  }

  return (
    <LandingView
      savedTrips={savedTrips}
      onGenerate={handleGenerate}
      onLoad={handleLoad}
      onDeleteTrip={id => setSavedTrips(prev => prev.filter(t => t.id !== id))}
    />
  )
}
```

- [ ] **Step 4: Implement `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
```

- [ ] **Step 5: Create `src/index.css`**

```css
:root {
  --bg-primary: #0d1b2a; --bg-secondary: #0a1628; --bg-card: #1e3a5f;
  --accent: #f0a500; --accent-dim: #2d1b00;
  --text-primary: #fff; --text-secondary: #aaa; --text-dim: #555;
  --festival-green: #4caf50; --festival-bg: #1e2a1e; --festival-border: #2d4a2d;
  --danger: #f44336;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg-primary); color: var(--text-primary); font-family: system-ui, sans-serif; }

.landing { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 24px; }
.landing__header { text-align: center; margin-bottom: 32px; }
.landing__header h1 { color: var(--accent); font-size: 24px; letter-spacing: 3px; }
.landing__header p { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.landing__form { max-width: 360px; width: 100%; display: flex; flex-direction: column; gap: 12px; }
.landing__form label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); }

.country-select { width: 100%; background: var(--bg-primary); border: 1px solid var(--bg-card); border-radius: 4px; padding: 9px 12px; color: var(--text-primary); font-size: 13px; }

.month-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.month-btn { background: var(--bg-card); border: none; border-radius: 4px; padding: 8px 4px; color: var(--text-secondary); font-size: 11px; cursor: pointer; }
.month-btn.has-festival { color: var(--accent); }
.month-btn.selected { background: var(--accent); color: #000; font-weight: bold; }

.duration-selector { display: flex; gap: 6px; }
.duration-btn { flex: 1; background: var(--bg-card); border: none; border-radius: 4px; padding: 8px 4px; color: var(--text-secondary); font-size: 12px; cursor: pointer; }
.duration-btn.selected { background: var(--accent); color: #000; font-weight: bold; }

.festival-preview { background: var(--festival-bg); border: 1px solid var(--festival-border); border-radius: 4px; padding: 10px 12px; font-size: 11px; }
.festival-preview__title { color: var(--festival-green); font-weight: bold; margin-bottom: 4px; }
.festival-preview__item { color: #ccc; line-height: 1.6; }
.festival-preview--warning { background: #2a1a1a; border-color: #4a2d2d; color: var(--danger); }

.generate-btn { width: 100%; background: var(--accent); border: none; border-radius: 4px; padding: 12px; color: #000; font-weight: bold; font-size: 14px; cursor: pointer; letter-spacing: 1px; }
.generate-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.saved-trips__title { font-size: 11px; color: var(--text-dim); margin-bottom: 6px; }
.saved-trips__item { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.saved-trips__load { flex: 1; background: none; border: 1px solid var(--bg-card); border-radius: 4px; padding: 6px 10px; color: var(--text-secondary); font-size: 11px; text-align: left; cursor: pointer; }
.saved-trips__delete { background: none; border: none; color: var(--text-dim); font-size: 16px; cursor: pointer; padding: 4px 8px; }

.itinerary-view { height: 100vh; display: flex; flex-direction: column; }
.itinerary-view__body { flex: 1; display: flex; overflow: hidden; }

.top-bar { background: var(--bg-secondary); padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--bg-card); flex-shrink: 0; }
.top-bar__title { color: var(--accent); font-weight: bold; font-size: 13px; letter-spacing: 1px; }
.top-bar__back { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 13px; padding: 4px 8px; }
.top-bar__actions { display: flex; gap: 8px; }
.top-bar__save, .top-bar__print { background: var(--bg-card); border: none; border-radius: 3px; padding: 5px 10px; color: var(--text-secondary); font-size: 11px; cursor: pointer; }

.day-list-sidebar { width: 100px; background: var(--bg-secondary); border-right: 1px solid var(--bg-card); overflow-y: auto; padding: 6px; flex-shrink: 0; }
.day-chip { display: flex; flex-direction: column; align-items: center; width: 100%; background: var(--bg-card); border: none; border-radius: 3px; padding: 6px 4px; margin-bottom: 4px; cursor: pointer; color: #64b5f6; font-size: 9px; text-align: center; }
.day-chip--festival { background: var(--accent-dim); border: 1px solid var(--accent); color: var(--accent); }
.day-chip--active { outline: 2px solid var(--accent); }
.day-chip__num { font-weight: bold; font-size: 11px; margin-bottom: 2px; }
.day-chip__title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }

.map-panel { flex: 1; position: relative; }
.leaflet-map { width: 100%; height: 100%; }

.day-detail-panel { width: 220px; background: var(--bg-secondary); border-left: 1px solid var(--bg-card); padding: 16px; overflow-y: auto; flex-shrink: 0; }
.day-detail-panel--empty { display: flex; align-items: center; justify-content: center; color: var(--text-dim); font-size: 12px; }
.day-detail__number { color: var(--accent); font-size: 11px; font-weight: bold; margin-bottom: 4px; }
.day-detail__title { font-size: 15px; margin-bottom: 8px; }
.day-detail__notes { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px; }
.day-detail__links { display: flex; flex-direction: column; gap: 4px; }
.day-detail__link { background: var(--bg-card); border-radius: 3px; padding: 6px 10px; color: #64b5f6; font-size: 11px; text-decoration: none; display: block; }

.day-marker { background: #1e3a5f; border: 2px solid #64b5f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: bold; }
.day-marker--festival { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

.print-itinerary { display: none; }
@media print {
  .map-panel, .day-list-sidebar, .top-bar__actions, .top-bar__back, .day-detail-panel { display: none !important; }
  .itinerary-view { height: auto; }
  .itinerary-view__body { display: block; }
  .print-itinerary { display: block; padding: 24px; color: #000; background: #fff; }
  .print-day { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 12px; }
  .print-day h3 { margin-bottom: 6px; }
}
```

- [ ] **Step 6: Run — expect PASS**

```bash
npm test -- App
```
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/main.jsx src/index.css src/App.test.jsx
git commit -m "feat: add App root, main entry, and global CSS"
```

---

### Task 23: All 25 Country JSON Files

**Files:**
- Create: `src/data/countries/mongolia.json` through `argentina.json` (25 files)

Create each JSON file following this schema exactly. Descriptions must be 1–2 sentences max.

- [ ] **Step 1: Create mongolia.json**

```json
{
  "id": "mongolia",
  "festivals": [
    { "id": "naadam", "name": "Naadam Festival", "dates": { "month": 7, "startDay": 11, "endDay": 13 }, "location": { "name": "Ulaanbaatar", "coords": { "lat": 47.9, "lng": 106.9 } }, "description": "Mongolia's greatest festival: horse racing, archery, and wrestling.", "importance": "primary", "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Naadam" }] },
    { "id": "regional-naadam", "name": "Regional Naadam", "dates": { "month": 7, "startDay": 10, "endDay": 15 }, "location": { "name": "Ulaanbaatar", "coords": { "lat": 47.9, "lng": 106.9 } }, "description": "Smaller regional celebrations across the country with local competitions in a more intimate setting.", "importance": "secondary", "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Naadam" }] }
  ],
  "destinations": [
    { "id": "gorkhi-terelj", "name": "Gorkhi-Terelj National Park", "region": "Töv Province", "coords": { "lat": 47.97, "lng": 107.45 }, "tags": ["adventure", "horse", "ger", "hiking"], "description": "Rocky outcrops and ger camps 60 km from Ulaanbaatar, ideal for horse trekking.", "travelTimeFromEntry": 1.5, "priority": 1, "bestMonths": [6, 7, 8, 9], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Gorkhi-Terelj_National_Park" }] },
    { "id": "khustai-np", "name": "Khustai National Park", "region": "Töv Province", "coords": { "lat": 47.5, "lng": 105.2 }, "tags": ["wildlife", "horse", "steppe"], "description": "Home to the reintroduced Przewalski's horse — the world's last truly wild horse species.", "travelTimeFromEntry": 2, "priority": 1, "bestMonths": [5, 6, 7, 8, 9], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Khustain_Nuruu_National_Park" }] },
    { "id": "orkhon-valley", "name": "Orkhon Valley", "region": "Övörkhangai Province", "coords": { "lat": 47.1, "lng": 102.8 }, "tags": ["UNESCO", "nomadic", "waterfall", "history"], "description": "A UNESCO World Heritage valley with a stunning waterfall, ancient ruins, and lush nomadic landscapes.", "travelTimeFromEntry": 8, "priority": 1, "bestMonths": [6, 7, 8], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Orkhon_Valley" }] },
    { "id": "karakorum", "name": "Karakorum", "region": "Övörkhangai Province", "coords": { "lat": 47.2, "lng": 102.8 }, "tags": ["history", "mongol-empire", "monastery"], "description": "The ancient capital of the Mongol Empire; visit the Erdene Zuu Monastery and Inca-age ruins.", "travelTimeFromEntry": 8, "priority": 2, "bestMonths": [5, 6, 7, 8, 9], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Karakorum" }] },
    { "id": "khovsgol-lake", "name": "Khövsgöl Lake", "region": "Khövsgöl Province", "coords": { "lat": 51.1, "lng": 100.5 }, "tags": ["lake", "trekking", "reindeer"], "description": "One of Asia's largest freshwater lakes, the 'Blue Pearl of Mongolia', ringed by taiga and reindeer herders.", "travelTimeFromEntry": 14, "priority": 1, "bestMonths": [6, 7, 8], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Lake_Kh%C3%B6vsg%C3%B6l" }] },
    { "id": "gun-galuut", "name": "Gun-Galuut Nature Reserve", "region": "Töv Province", "coords": { "lat": 48.0, "lng": 109.8 }, "tags": ["wildlife", "birdwatching", "steppe"], "description": "A pristine reserve combining steppe, wetlands, and mountains — less visited and more authentic than closer parks.", "travelTimeFromEntry": 3, "priority": 2, "bestMonths": [5, 6, 7, 8, 9], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Gun-Galuut_Nature_Reserve" }] },
    { "id": "gobi-desert", "name": "Gobi Desert", "region": "Ömnögovi Province", "coords": { "lat": 43.7, "lng": 104.0 }, "tags": ["desert", "sand-dunes", "camel", "fossils"], "description": "Singing sand dunes, dinosaur fossil cliffs, and camel trekking across one of the world's great deserts.", "travelTimeFromEntry": 10, "priority": 1, "bestMonths": [5, 6, 9, 10], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Gobi_Desert" }] },
    { "id": "bayan-olgii", "name": "Bayan-Olgii", "region": "Bayan-Ölgii Province", "coords": { "lat": 48.9, "lng": 89.5 }, "tags": ["eagle-hunting", "kazakh", "altai"], "description": "Kazakh eagle hunter territory in the Altai Mountains, home to the Golden Eagle Festival each October.", "travelTimeFromEntry": 18, "priority": 2, "bestMonths": [7, 8, 9, 10], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Bayan-%C3%96lgii_Province" }] }
  ]
}
```

- [ ] **Step 2: Create nepal.json**

```json
{
  "id": "nepal",
  "festivals": [
    { "id": "indra-jatra", "name": "Indra Jatra", "dates": { "month": 9, "startDay": 10, "endDay": 18 }, "location": { "name": "Kathmandu", "coords": { "lat": 27.7, "lng": 85.3 } }, "description": "Kathmandu's greatest festival celebrates the rain god Indra with the living goddess Kumari's chariot procession.", "importance": "primary", "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Indra_Jatra" }] },
    { "id": "tihar", "name": "Tihar (Festival of Lights)", "dates": { "month": 10, "startDay": 20, "endDay": 24 }, "location": { "name": "Kathmandu", "coords": { "lat": 27.7, "lng": 85.3 } }, "description": "Five days of lights, colours, and animal worship culminating in Lakshmi Puja with oil lamps and fireworks.", "importance": "primary", "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Tihar_(festival)" }] }
  ],
  "destinations": [
    { "id": "kathmandu-valley", "name": "Kathmandu Valley", "region": "Bagmati Province", "coords": { "lat": 27.7, "lng": 85.3 }, "tags": ["UNESCO", "temples", "culture"], "description": "Seven UNESCO monument zones including Pashupatinath, Boudhanath, and three Durbar Squares.", "travelTimeFromEntry": 0, "priority": 1, "bestMonths": [10, 11, 3, 4], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Kathmandu_Valley" }] },
    { "id": "pokhara", "name": "Pokhara", "region": "Gandaki Province", "coords": { "lat": 28.2, "lng": 83.98 }, "tags": ["lakeside", "mountains", "paragliding"], "description": "Nepal's adventure capital beside Phewa Lake, with Annapurna views and world-class paragliding.", "travelTimeFromEntry": 7, "priority": 1, "bestMonths": [10, 11, 3, 4], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Pokhara" }] },
    { "id": "chitwan-np", "name": "Chitwan National Park", "region": "Bagmati Province", "coords": { "lat": 27.5, "lng": 84.4 }, "tags": ["UNESCO", "rhino", "tiger", "safari"], "description": "UNESCO Terai park with one-horned rhino, Bengal tigers, and over 500 bird species.", "travelTimeFromEntry": 6, "priority": 1, "bestMonths": [10, 11, 2, 3, 4], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Chitwan_National_Park" }] },
    { "id": "annapurna-base-camp", "name": "Annapurna Base Camp", "region": "Gandaki Province", "coords": { "lat": 28.5, "lng": 83.9 }, "tags": ["trekking", "himalaya", "high-altitude"], "description": "The classic trek to a natural amphitheater at 4,130m surrounded by ten peaks over 7,000m.", "travelTimeFromEntry": 12, "priority": 1, "bestMonths": [10, 11, 3, 4], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Annapurna_Base_Camp" }] },
    { "id": "langtang-valley", "name": "Langtang Valley", "region": "Bagmati Province", "coords": { "lat": 28.2, "lng": 85.5 }, "tags": ["trekking", "glaciers", "tibetan-culture"], "description": "Nepal's closest major trekking destination to Kathmandu with stunning glacial landscapes and Tamang villages.", "travelTimeFromEntry": 5, "priority": 2, "bestMonths": [10, 11, 3, 4, 5], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Langtang_valley_trek" }] },
    { "id": "upper-mustang", "name": "Upper Mustang", "region": "Gandaki Province", "coords": { "lat": 28.97, "lng": 83.86 }, "tags": ["restricted-area", "tibet", "desert", "caves"], "description": "A remote rain-shadow kingdom of cave cities and monasteries carved into cliffs; requires special permit.", "travelTimeFromEntry": 14, "priority": 2, "bestMonths": [5, 6, 7, 8, 9, 10], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Mustang_District" }] },
    { "id": "gosaikunda", "name": "Gosaikunda Lake", "region": "Bagmati Province", "coords": { "lat": 28.08, "lng": 85.42 }, "tags": ["sacred-lake", "pilgrimage", "trekking"], "description": "A sacred high-altitude lake at 4,380m created by Shiva's trident, revered Hindu pilgrimage site.", "travelTimeFromEntry": 6, "priority": 3, "bestMonths": [3, 4, 5, 6, 10, 11], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Gosainkunda" }] },
    { "id": "bardiya-np", "name": "Bardiya National Park", "region": "Lumbini Province", "coords": { "lat": 28.37, "lng": 81.46 }, "tags": ["tiger", "rhino", "remote", "safari"], "description": "Nepal's largest park in the western Terai, less visited than Chitwan but with excellent tiger sightings.", "travelTimeFromEntry": 14, "priority": 3, "bestMonths": [10, 11, 2, 3, 4], "externalLinks": [{ "label": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Bardia_National_Park" }] }
  ]
}
```

- [ ] **Step 3: Create the remaining 23 country JSON files**

Follow the same schema for japan, peru, ethiopia, iceland, morocco, india, thailand, mexico, vietnam, cambodia, bolivia, colombia, tanzania, jordan, turkey, indonesia, bhutan, kenya, georgia, laos, sri-lanka, ecuador, argentina.

Each file must have: `id`, `festivals[]` (1–3 entries), `destinations[]` (8 minimum entries). Use the coordinates and key festivals listed in `metadata.json`'s `festivalMonths` as the guide for which months to include festivals for.

Key data for each country:
- **japan.json**: Gion Matsuri (month:7, Kyoto 35.0,135.75, primary), Awa Odori (month:8, Tokushima 34.07,134.56, primary). Destinations: Tokyo, Kyoto, Osaka, Hiroshima, Nara, Hakone, Nikko, Hokkaido.
- **peru.json**: Inti Raymi (month:6, day:24, Cusco -13.53,-71.97, primary), Virgen de la Candelaria (month:2, Puno -15.84,-70.02, primary). Destinations: Lima, Cusco, Machu Picchu, Sacred Valley, Lake Titicaca, Arequipa, Colca Canyon, Huacachina.
- **ethiopia.json**: Timkat (month:1, 19-20, Addis Ababa, primary), Meskel (month:9, day:27, primary). Destinations: Addis Ababa, Lalibela, Gondar, Simien Mountains, Danakil Depression, Omo Valley, Harar, Bale Mountains.
- **iceland.json**: Midnight Sun Festival (month:6, 21-24, Akureyri 65.68,-18.1, primary). Destinations: Reykjavik, Golden Circle, South Coast, Jökulsárlón, Snæfellsnes, Akureyri+Mývatn, Westfjords, Highlands.
- **morocco.json**: Fes Sacred Music (month:6, 5-14, Fes 34.03,-5.0, primary), Tan-Tan Moussem (month:5, secondary). Destinations: Marrakech, Fes, Sahara/Merzouga, Chefchaouen, Atlas Mountains, Essaouira, Todra Gorge, Rabat.
- **india.json**: Holi (month:3, Delhi, primary), Diwali (month:10, primary), Pushkar Camel Fair (month:11, Pushkar 26.49,74.55, primary). Destinations: Delhi, Agra, Jaipur, Varanasi, Rishikesh, Pushkar, Jodhpur, Udaipur.
- **thailand.json**: Songkran (month:4, Bangkok, primary), Yi Peng (month:11, Chiang Mai 18.79,98.98, primary). Destinations: Bangkok, Chiang Mai, Ayutthaya, Chiang Rai, Sukhothai, Pai, Doi Inthanon, Kanchanaburi.
- **mexico.json**: Día de los Muertos (month:11, Oaxaca 17.06,-96.72, primary), Guelaguetza (month:7, primary). Destinations: Mexico City, Oaxaca, Chichen Itza, Palenque, Copper Canyon, Guanajuato, Teotihuacan, San Cristóbal.
- **vietnam.json**: Tết (month:1, 25-31, Hanoi, primary), Mid-Autumn Festival (month:9, 14-15, Hoi An 15.88,108.33, primary). Destinations: Hanoi, Ha Long Bay, Hoi An, Ho Chi Minh City, Sapa, Phong Nha, Hue, Ninh Binh.
- **cambodia.json**: Bon Om Touk (month:11, 8-10, Phnom Penh, primary), Khmer New Year (month:4, 14-16, Siem Reap 13.36,103.86, primary). Destinations: Siem Reap/Angkor, Phnom Penh, Koh Rong, Kampot, Battambang, Kep, Mondulkiri, Kratie.
- **bolivia.json**: Carnaval de Oruro (month:2, 14-21, Oruro -17.97,-67.11, primary), Alasitas (month:1, secondary). Destinations: La Paz, Salar de Uyuni, Oruro, Tiwanaku, Death Road, Lake Titicaca/Copacabana, Sucre, Potosi.
- **colombia.json**: Carnaval de Barranquilla (month:2, 18-21, Barranquilla 10.96,-74.79, primary), Feria de Cali (month:12, primary). Destinations: Bogotá, Cartagena, Medellín, Coffee Region/Salento, Tayrona NP, Ciudad Perdida, Cali, San Agustín.
- **tanzania.json**: Zanzibar Festival of Dhow Countries (month:7, 6-15, Zanzibar -6.17,39.19, primary), Sauti za Busara (month:2, secondary). Destinations: Serengeti, Zanzibar, Ngorongoro, Kilimanjaro, Selous/Nyerere NP, Lake Manyara, Pemba Island, Ruaha NP.
- **jordan.json through argentina.json**: Use the data defined above in the plan prompt.

- [ ] **Step 4: Commit**

```bash
git add src/data/countries/
git commit -m "feat: add all 25 country JSON data files"
```

---

### Task 24: Final Verification

**Files:** None

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```
Expected: PASS — all 45+ tests pass

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: No errors; `dist/` created

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```

Open http://localhost:5173 and verify:

- [ ] Select **Mongolia** → Jul highlighted in amber on MonthGrid; festival preview shows Naadam
- [ ] Select **July**, **14d** → Generate button enables
- [ ] Click Generate → itinerary view loads with map, 14-day sidebar, and day 1 detail
- [ ] Click day chips → detail panel updates
- [ ] Click festival day chip (★) → detail shows festival info
- [ ] Click Save → click Back → saved trip appears in list
- [ ] Click saved trip → itinerary reloads
- [ ] Click Print → browser print dialog shows text-only layout

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete adventure trip planner webapp — 25 countries, festival-optimized routing"
```
