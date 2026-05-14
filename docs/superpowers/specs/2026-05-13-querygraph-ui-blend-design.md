# QueryGraph UI Blend — Design Spec

**Date:** 2026-05-13  
**Status:** Approved  
**Scope:** Blend the downloaded UI/UX/dashboard design prototype into the live QueryGraph client

---

## 1. Goal

The downloaded `Downloads/querygraph/src` contains a polished UI prototype (dark/light theme, dashboard page, SVG charts, redesigned pages). The current live project has a working backend and real API integration but plain styling. This spec covers blending the two: porting the visual design into the existing React + Vite + React Router codebase while keeping the real API connected.

---

## 2. Source Material

| Source | Role |
|--------|------|
| `Downloads/querygraph/src/components.jsx` | QG_PAL theme tokens, Navbar, SearchBar, SuggestionChips, ChartTypeSelector, GraphDisplay, PricingCard, FAQAccordion |
| `Downloads/querygraph/src/charts.jsx` | Hand-rolled SVG Line, Bar, Pie, Sparkline charts + QG_THEME color tokens |
| `Downloads/querygraph/src/pages.jsx` | HomePage, PricingPage, Footer |
| `Downloads/querygraph/src/pages-dashboard.jsx` | DashboardPage, PinnedChartCard, AddChartTile, KPI, ActivityDot |
| `Downloads/querygraph/src/data.jsx` | qgFormatValue, qgFormatTick helpers |
| `Downloads/querygraph/src/icons.jsx` | IconGraph, IconSearch, IconArrowRight, IconSun, IconMoon, IconCheck, IconExternal, IconAlert, IconChevron, IconSpark |

---

## 3. Architecture

### 3.1 Routing
Keep React Router v6. Add `/dashboard` route alongside existing `/` and `/pricing`.

```
App.jsx
  <BrowserRouter>
    <Navbar light={light} setLight={setLight} />
    <Routes>
      <Route path="/"          element={<Home light={light} />} />
      <Route path="/dashboard" element={<Dashboard light={light} />} />
      <Route path="/pricing"   element={<Pricing light={light} />} />
    </Routes>
  </BrowserRouter>
```

### 3.2 Theme State
`light` boolean lives in `App.jsx` via `useState(false)` (dark by default, matching the design spec). A `useEffect` toggles `document.documentElement.classList` and `document.body.className` when `light` changes. Passed as prop to all pages and components.

### 3.3 New Files

```
src/
  theme.js                        ← QG_PAL + QG_THEME color token objects
  components/
    icons/Icons.jsx               ← all icon components
    charts/
      LineChart.jsx               ← hand-rolled SVG line chart
      BarChart.jsx                ← hand-rolled SVG bar chart
      PieChart.jsx                ← hand-rolled SVG pie/donut chart
      Sparkline.jsx               ← mini sparkline (used in PinnedChartCard)
      chartUtils.js               ← qgScales, qgSmoothPath, QGAxes, QGTooltip
  hooks/
    usePins.js                    ← localStorage pin manager
  pages/
    Dashboard.jsx                 ← new dashboard page
```

### 3.4 Removed Dependencies
- `recharts` — removed and replaced by hand-rolled SVG charts

---

## 4. Layer-by-Layer Implementation Plan

### Layer 1 — Theme + Navbar

**`src/theme.js`**
Export `QG_PAL` (dark/light surface/border/text/muted tokens) and `QG_THEME` (chart color tokens: grid, axis, line, bar, dot, tooltip). Exact values from the design.

**`src/index.css`**
Add:
- `.hero-glow` — radial gradient pseudo-element for ambient background glow
- `.shadow-card` — subtle box shadow utility
- `.qg-ring` — spinner keyframe animation
- `.qg-line-anim` — SVG stroke-dashoffset draw animation
- `.tnum` — `font-variant-numeric: tabular-nums`

**`src/components/Navbar.jsx`** (rewrite)
- Indigo-gradient logo icon (7×7, rounded-lg, `from-indigo-500 to-indigo-700`)
- Logo text "QueryGraph" + BETA badge
- Nav links: Search | Dashboard | Pricing — active link uses full text color, inactive uses `p.dim`
- Dark/light toggle button (IconSun / IconMoon)
- "Sign in" button (hidden on mobile, `p.accentBtn`)
- Sticky, `backdrop-blur-md`, `border-b`
- Uses `useLocation()` from React Router for active state

**`src/App.jsx`** (update)
- Add `light` state and `useEffect` for body class
- Pass `light` / `setLight` to Navbar
- Pass `light` to all page routes
- Add `/dashboard` route

### Layer 2 — Home Page + SVG Charts

**`src/pages/Home.jsx`** (rewrite)
- `dark bg` (`p.bg`) with `hero-glow` ambient div
- Hero: BETA badge chip → gradient h1 ("Search anything. See it as a graph.") → subtitle
- SearchBar (max-w-2xl, centered)
- SuggestionChips below search
- GraphDisplay when query submitted
- Idle state: 3-column category cards (Economics / Markets / Demographics) listing topics

**`src/components/SearchBar.jsx`** (rewrite)
- Indigo border + `ring-2 ring-indigo-500/40` on focus
- IconSearch prefix
- Inline submit button: "Search →" or spinner when loading
- `↵ to search` hint below

**`src/components/SuggestionChips.jsx`** (restyle)
- Rounded-full chips using `p.chip` tokens
- Active chip uses indigo highlight

**`src/components/charts/chartUtils.js`**
Port `qgScales`, `qgSmoothPath`, `QGAxes`, `QGTooltip` from the design's `charts.jsx`. Also export `qgFormatValue` and `qgFormatTick` here. The existing `src/utils/formatData.js` is deleted and all imports replaced with `chartUtils.js`.

**`src/components/charts/LineChart.jsx`**
Port `QGLineChart`. Uses `qgScales`, smooth path, area fill, hover overlay rect, crosshair tooltip.

**`src/components/charts/BarChart.jsx`**
Port `QGBarChart`. Gradient fill via `linearGradient` def, per-bar hover.

**`src/components/charts/PieChart.jsx`**
Port `QGPieChart`. Donut shape, legend on the right, arc hover offset.

**`src/components/charts/Sparkline.jsx`**
Port `QGSparkline`. Mini chart, no axes, up/down color-coded stroke.

**`src/components/GraphDisplay.jsx`** (rewrite)
Three states:
- Loading: spinner (`qg-ring`) + "Searching the web…" text
- Error: red icon circle + message + "Clear and try again" button
- Success (`GraphSuccess`):
  - Header: title, description, latest value, delta % badge (green/red), ChartTypeSelector
  - Chart area (320px height): switches between LineChart / BarChart / PieChart
  - Footer: source link + FRED disclaimer if applicable
  - Pin button in header row (calls `addPin` from `usePins`)

**`src/components/ChartTypeSelector.jsx`** (restyle)
Segmented control: Line / Bar / Pie. Active segment uses `bg-indigo-600 text-white`.

### Layer 3 — Dashboard Page

**`src/pages/Dashboard.jsx`**
Full port of `DashboardPage` from the design, adapted for React Router and real data.

Structure:
```
<main p.bg>
  <hero-glow>
  <div max-w-6xl>
    Header row: "Welcome back" + plan badge + "Your dashboard" h1 + Search/New buttons
    KPI row (4 cards): Queries today | Pinned charts | Data freshness | Avg response
    Two-column layout:
      Main col:
        Collection tabs (All + tag groups derived from pin tags)
        Pinned chart grid (PinnedChartCard × n + AddChartTile)
        Empty state if no pins
      Sidebar:
        Plan usage card (usage bar, API requests, Upgrade link)
        Recent activity feed (last 5 queries from localStorage history)
        Suggested queries list
  </div>
  <Footer>
</main>
```

**`PinnedChartCard`** (in Dashboard.jsx)
- Renders title, tag, latest value, delta % badge, Sparkline, date range footer
- Click → navigate to Home and run that query
- Hover reveals unpin button (top-right)

**`AddChartTile`**
Dashed border tile: "+ Pin a new chart" → navigates to Home

**`KPI`** component (inline in Dashboard.jsx)
Simple stat card: label / large value / sub-text with tone color.

**`Footer`** (shared, inline in Dashboard.jsx or extracted to `components/Footer.jsx`)
Logo + copyright + nav links (Privacy, Terms, Status, API docs, Twitter).

### Layer 4 — Pin System

**`src/hooks/usePins.js`**

```js
// localStorage key: "qg_pins"
// Pin shape: { query, tag, data: { title, labels, values, format, unit, source, sourceUrl } }
// Returns: { pins, addPin(query, tag, data), removePin(query) }
```

- `addPin`: prepend to array, deduplicate by query, persist to localStorage
- `removePin`: filter out by query, persist
- Reads on mount from localStorage (handles parse errors gracefully)

**Pin button in GraphDisplay**
- Appears in the success header row (next to ChartTypeSelector)
- Icon: pin/bookmark SVG
- If already pinned: shows "Pinned ✓" state
- Tag is the first segment of `data.source` before `" — "` (e.g., `"FRED"` from `"FRED — Federal Reserve Bank of St. Louis"`); falls back to `"Other"` if no separator found

**Query history for activity feed**
Separately track last 5 queries in localStorage key `"qg_history"` — updated in `useGraphData.js` on successful fetch.

---

## 5. What Does NOT Change

| Item | Reason |
|------|---------|
| `useGraphData.js` hook | Real API integration stays intact (add history tracking only) |
| `/api/graph` backend | No backend changes |
| `server/` directory | Untouched |
| React Router v6 | Kept; state-based routing from design is not ported |
| `ExportButton.jsx` | Kept as-is (can be restyled later) |
| `HelpPanel.jsx` | Kept as-is |

---

## 6. Pricing Page

Rewrite `src/pages/Pricing.jsx` using the design's `PricingPage` structure:
- 3-tier `PricingCard` components (Free / Pro / Premium)
- Pro card: `border-2 border-indigo-500`, scale-up, "Most Popular" badge
- Trust strip below cards
- `FAQAccordion` (3 items, expand/collapse)
- Shared `Footer`

`PricingCard` and `FAQAccordion` extracted to `src/components/PricingCard.jsx` and `src/components/FAQAccordion.jsx` (replace existing PricingCard).

---

## 7. Success Criteria

- Dark mode by default; light toggle works globally
- Home page matches design: glow, gradient headline, category cards when idle, full graph success state with pin button
- Dashboard shows pinned charts from localStorage; pin/unpin roundtrip works
- Clicking a pinned card navigates to Home and runs the query
- Pricing page matches 3-tier design with accordion
- Recharts is removed from `package.json`
- No TypeScript errors; Vite builds cleanly
