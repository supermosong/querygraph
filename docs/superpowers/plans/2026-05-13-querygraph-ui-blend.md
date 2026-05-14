# QueryGraph UI Blend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blend the downloaded UI/UX/dashboard design prototype into the live QueryGraph client — dark/light theme, SVG charts, redesigned pages, pinnable dashboard.

**Architecture:** Lift `light` boolean state into `App.jsx`, pass as prop to all pages. Port the design's `QG_PAL`/`QG_THEME` token objects to `src/theme.js`. Replace Recharts with hand-rolled SVG charts from the design. Add `/dashboard` route backed by a `usePins` localStorage hook.

**Tech Stack:** React 18, React Router v6, Vite, Tailwind CSS v3.4, Vitest + @testing-library/react (tests), localStorage (pin persistence)

**Working directory for all commands:** `querygraph/client/`

---

## File Map

| Action | Path |
|--------|------|
| Modify | `tailwind.config.js` |
| Modify | `src/index.css` |
| Create | `src/theme.js` |
| Create | `src/components/icons/Icons.jsx` |
| Modify | `src/App.jsx` |
| Rewrite | `src/components/Navbar.jsx` |
| Create | `src/components/charts/chartUtils.jsx` |
| Create | `src/__tests__/chartUtils.test.js` |
| Create | `src/components/charts/LineChart.jsx` |
| Create | `src/components/charts/BarChart.jsx` |
| Create | `src/components/charts/PieChart.jsx` |
| Create | `src/components/charts/Sparkline.jsx` |
| Rewrite | `src/components/ChartTypeSelector.jsx` |
| Rewrite | `src/components/SearchBar.jsx` |
| Rewrite | `src/components/SuggestionChips.jsx` |
| Rewrite | `src/components/GraphDisplay.jsx` |
| Delete | `src/utils/formatData.js` |
| Rewrite | `src/pages/Home.jsx` |
| Create | `src/components/Footer.jsx` |
| Create | `src/components/FAQAccordion.jsx` |
| Rewrite | `src/components/PricingCard.jsx` |
| Rewrite | `src/pages/Pricing.jsx` |
| Create | `src/hooks/usePins.js` |
| Create | `src/__tests__/usePins.test.js` |
| Modify | `src/hooks/useGraphData.js` |
| Create | `src/pages/Dashboard.jsx` |

---

## Task 1: Configure Tailwind dark mode + CSS utilities

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Add `darkMode: 'class'` to tailwind.config.js**

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 2: Add CSS utilities to src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Ambient hero background glow */
.hero-glow {
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent);
}

/* Card shadow used on chart panels */
.shadow-card {
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4);
}

/* Tabular numbers for values */
.tnum { font-variant-numeric: tabular-nums; }

/* Spinning ring loader */
@keyframes qg-spin { to { transform: rotate(360deg); } }
.qg-ring {
  display: inline-block;
  border: 2px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: qg-spin 0.8s linear infinite;
}

/* SVG line draw-on animation — set --len via style prop on the path */
@keyframes qg-draw {
  from { stroke-dashoffset: var(--len, 2200); }
  to   { stroke-dashoffset: 0; }
}
.qg-line-anim {
  stroke-dasharray: var(--len, 2200);
  stroke-dashoffset: var(--len, 2200);
  animation: qg-draw 1s ease-out forwards;
}

/* Slide-up fade-in for the graph panel */
@keyframes qg-rise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.qg-rise { animation: qg-rise 0.3s ease-out forwards; }
```

- [ ] **Step 3: Start dev server and verify no build errors**

```bash
npm run dev
```
Expected: Vite ready, no CSS errors in terminal.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/index.css
git commit -m "feat: add Tailwind dark mode + CSS utilities (hero-glow, qg-ring, qg-rise)"
```

---

## Task 2: Theme tokens + Icon components

**Files:**
- Create: `src/theme.js`
- Create: `src/components/icons/Icons.jsx`

- [ ] **Step 1: Create src/theme.js**

```js
// src/theme.js
export const QG_PAL = {
  dark: {
    bg: 'bg-gray-950', surface: 'bg-gray-900', surfaceAlt: 'bg-gray-900/60',
    border: 'border-gray-800', borderStrong: 'border-gray-700',
    text: 'text-white', dim: 'text-gray-400', muted: 'text-gray-500',
    chip: 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700 hover:text-white',
    inputBg: 'bg-gray-900', navBg: 'bg-gray-950/70',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    neutralBtn: 'bg-gray-800 hover:bg-gray-700 text-white',
  },
  light: {
    bg: 'bg-gray-50', surface: 'bg-white', surfaceAlt: 'bg-white/80',
    border: 'border-gray-200', borderStrong: 'border-gray-300',
    text: 'text-gray-900', dim: 'text-gray-500', muted: 'text-gray-400',
    chip: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900',
    inputBg: 'bg-white', navBg: 'bg-white/70',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    neutralBtn: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  },
};

export const QG_THEME = {
  dark: {
    grid: '#1f2937', axis: '#374151', tick: '#6b7280', label: '#9ca3af',
    line: '#818cf8', lineFill: 'rgba(129,140,248,0.18)',
    bar: '#6366f1', barTop: '#818cf8', dot: '#a5b4fc',
    tooltipBg: '#1f2937', tooltipBorder: '#374151', tooltipText: '#ffffff',
    crosshair: 'rgba(129,140,248,0.5)',
  },
  light: {
    grid: '#e5e7eb', axis: '#d1d5db', tick: '#6b7280', label: '#4b5563',
    line: '#4f46e5', lineFill: 'rgba(79,70,229,0.12)',
    bar: '#6366f1', barTop: '#4f46e5', dot: '#4f46e5',
    tooltipBg: '#ffffff', tooltipBorder: '#e5e7eb', tooltipText: '#0f172a',
    crosshair: 'rgba(79,70,229,0.45)',
  },
};
```

- [ ] **Step 2: Create src/components/icons/Icons.jsx**

```jsx
// src/components/icons/Icons.jsx
import React from 'react';

const S = ({ children, size = 16, className = '', strokeWidth = 1.75 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
       fill="none" stroke="currentColor" strokeWidth={strokeWidth}
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const IconGraph = (p) => (
  <S {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 3 3 6-7" />
    <circle cx="7" cy="14" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="11" cy="10" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="20" cy="6"  r="1.3" fill="currentColor" stroke="none" />
  </S>
);

export const IconSearch = (p) => (
  <S {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></S>
);

export const IconArrowRight = (p) => (
  <S {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></S>
);

export const IconSun = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </S>
);

export const IconMoon = (p) => (
  <S {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></S>
);

export const IconCheck = (p) => (
  <S {...p} strokeWidth={2.25}><path d="M4 12l5 5L20 6" /></S>
);

export const IconExternal = (p) => (
  <S {...p}>
    <path d="M14 4h6v6" /><path d="M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </S>
);

export const IconAlert = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" /><path d="M12 16.5v.01" />
  </S>
);

export const IconChevron = (p) => (
  <S {...p}><path d="M6 9l6 6 6-6" /></S>
);

export const IconSpark = (p) => (
  <S {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </S>
);

export const IconPin = (p) => (
  <S {...p}><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" /></S>
);

export const IconUnpin = (p) => (
  <S {...p}>
    <path d="M12 17v5" /><path d="M8 4h8l-1.5 6 3 4H6.5l3-4z" />
  </S>
);

export const IconPlus = (p) => (
  <S {...p}><path d="M12 5v14M5 12h14" /></S>
);
```

- [ ] **Step 3: Commit**

```bash
git add src/theme.js src/components/icons/Icons.jsx
git commit -m "feat: add QG_PAL/QG_THEME tokens and icon library"
```

---

## Task 3: Update App.jsx — light state + dashboard route

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Rewrite App.jsx**

```jsx
// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';

function App() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !light);
    document.body.className = light
      ? 'bg-gray-50 text-gray-900 antialiased'
      : 'bg-gray-950 text-white antialiased';
  }, [light]);

  return (
    <BrowserRouter>
      <Navbar light={light} setLight={setLight} />
      <Routes>
        <Route path="/"          element={<Home      light={light} />} />
        <Route path="/dashboard" element={<Dashboard light={light} />} />
        <Route path="/pricing"   element={<Pricing   light={light} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

Note: `Dashboard` import will error until Task 17. Either create a placeholder `src/pages/Dashboard.jsx` now (`export default function Dashboard() { return null; }`) or add the route in Task 17.

- [ ] **Step 2: Create placeholder Dashboard page to avoid import error**

```jsx
// src/pages/Dashboard.jsx  (placeholder — fully implemented in Task 17)
import React from 'react';
export default function Dashboard() {
  return <div className="p-8 text-center text-gray-400">Dashboard coming soon</div>;
}
```

- [ ] **Step 3: Verify app still loads**

```bash
npm run dev
```
Open http://localhost:5173 — should render (light theme still, navbar rewired in next task).

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/pages/Dashboard.jsx
git commit -m "feat: lift light state to App, add /dashboard route"
```

---

## Task 4: Rewrite Navbar

**Files:**
- Rewrite: `src/components/Navbar.jsx`

- [ ] **Step 1: Rewrite Navbar.jsx**

```jsx
// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QG_PAL } from '../theme';
import { IconGraph, IconSun, IconMoon, IconArrowRight } from './icons/Icons';

function Navbar({ light, setLight }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  const { pathname } = useLocation();

  function navCls(to) {
    const active = pathname === to;
    return `text-sm px-3 py-1.5 rounded-lg transition-colors ${
      active
        ? (light ? 'text-gray-900' : 'text-white')
        : `${p.dim} hover:${light ? 'text-gray-900' : 'text-white'}`
    }`;
  }

  return (
    <header className={`sticky top-0 z-30 ${p.navBg} backdrop-blur-md border-b ${p.border}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid place-items-center w-7 h-7 rounded-lg
                           bg-gradient-to-br from-indigo-500 to-indigo-700
                           shadow-[0_6px_18px_-4px_rgba(99,102,241,0.55)]">
            <IconGraph size={15} className="text-white" />
          </span>
          <span className={`font-semibold tracking-tight ${p.text}`}>QueryGraph</span>
          <span className={`hidden sm:inline text-[10px] uppercase tracking-[0.14em]
                            ${p.muted} px-1.5 py-0.5 rounded border ${p.border} ml-1`}>
            BETA
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/"          className={navCls('/')}>Search</Link>
          <Link to="/dashboard" className={navCls('/dashboard')}>Dashboard</Link>
          <Link to="/pricing"   className={navCls('/pricing')}>Pricing</Link>

          <button onClick={() => setLight(!light)}
                  aria-label="Toggle theme"
                  className={`ml-1 grid place-items-center w-8 h-8 rounded-lg
                              border ${p.border} ${p.dim}
                              hover:${light ? 'text-gray-900' : 'text-white'} transition-colors`}>
            {light ? <IconMoon size={15} /> : <IconSun size={15} />}
          </button>

          <button className={`hidden sm:inline-flex items-center gap-1.5 ml-2
                              text-sm font-medium px-3 py-1.5 rounded-lg
                              ${p.accentBtn} transition-colors`}>
            Sign in <IconArrowRight size={13} />
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5173. Check:
- Dark background, indigo logo icon, BETA badge
- Toggle button switches sun↔moon and flips bg-gray-950 ↔ bg-gray-50
- "Dashboard" link navigates to `/dashboard`

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.jsx
git commit -m "feat: redesign Navbar with dark/light toggle, Dashboard link, Sign in button"
```

---

## Task 5: Chart utilities (TDD)

**Files:**
- Create: `src/components/charts/chartUtils.jsx`
- Create: `src/__tests__/chartUtils.test.js`
- Delete: `src/utils/formatData.js`

- [ ] **Step 1: Write failing tests**

```js
// src/__tests__/chartUtils.test.js
import { describe, it, expect } from 'vitest';
import { qgScales, qgFormatValue, qgFormatTick, qgSmoothPath, QG_WIDTH } from '../components/charts/chartUtils';

const PAD = { t: 18, r: 24, b: 36, l: 56 };

describe('qgScales', () => {
  it('maps index 0 to left padding', () => {
    const s = qgScales([0, 10, 20], PAD);
    expect(s.x(0, 3)).toBe(56);
  });

  it('maps last index to right edge', () => {
    const s = qgScales([0, 10, 20], PAD);
    expect(s.x(2, 3)).toBe(QG_WIDTH - PAD.r);
  });

  it('y value is finite for flat series', () => {
    const s = qgScales([5, 5, 5], PAD);
    expect(isFinite(s.y(5))).toBe(true);
  });

  it('exposes yMin and yMax', () => {
    const s = qgScales([0, 100], PAD);
    expect(s.yMin).toBeLessThan(0);
    expect(s.yMax).toBeGreaterThan(100);
  });
});

describe('qgFormatValue', () => {
  it('formats percent to 1dp', () => {
    expect(qgFormatValue(3.567, 'percent', '%')).toBe('3.6%');
  });
  it('formats currency thousands', () => {
    expect(qgFormatValue(331800, 'currency', 'USD')).toBe('$331.8K');
  });
  it('formats currency millions', () => {
    expect(qgFormatValue(1500000, 'currency', 'USD')).toBe('$1.50M');
  });
  it('returns dash for null', () => {
    expect(qgFormatValue(null, 'percent', '%')).toBe('—');
  });
  it('returns dash for NaN', () => {
    expect(qgFormatValue(NaN, 'percent', '%')).toBe('—');
  });
});

describe('qgFormatTick', () => {
  it('formats percent tick as integer', () => {
    expect(qgFormatTick(3.7, 'percent')).toBe('4%');
  });
  it('formats currency tick in thousands', () => {
    expect(qgFormatTick(280000, 'currency')).toBe('$280K');
  });
  it('returns empty for null', () => {
    expect(qgFormatTick(null, 'percent')).toBe('');
  });
});

describe('qgSmoothPath', () => {
  it('returns empty string for empty array', () => {
    expect(qgSmoothPath([])).toBe('');
  });
  it('returns M point for single point', () => {
    expect(qgSmoothPath([[10, 20]])).toBe('M 10 20');
  });
  it('starts with M for multiple points', () => {
    const path = qgSmoothPath([[0, 0], [100, 50], [200, 25]]);
    expect(path).toMatch(/^M /);
  });
});
```

- [ ] **Step 2: Run tests — expect failures (module not found)**

```bash
npm test
```
Expected: FAIL — "Cannot find module '../components/charts/chartUtils'"

- [ ] **Step 3: Create src/components/charts/chartUtils.jsx**

```jsx
// src/components/charts/chartUtils.jsx
import React from 'react';

export const QG_WIDTH  = 800;
export const QG_HEIGHT = 320;

export function qgScales(values, padding) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || Math.abs(max) || 1;
  const yMin = min - range * 0.12;
  const yMax = max + range * 0.12;
  const innerW = QG_WIDTH  - padding.l - padding.r;
  const innerH = QG_HEIGHT - padding.t - padding.b;
  return {
    yMin, yMax, innerW, innerH,
    x: (i, n) => padding.l + (n <= 1 ? innerW / 2 : (innerW * i) / (n - 1)),
    y: (v)    => padding.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH,
  };
}

export function qgSmoothPath(pts) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` Q ${x0} ${y0} ${mx} ${(y0 + y1) / 2}`;
    if (i === pts.length - 1) d += ` T ${x1} ${y1}`;
  }
  return d;
}

export function qgFormatValue(v, format, unit) {
  if (v == null || isNaN(v)) return '—';
  if (format === 'percent') return v.toFixed(1) + '%';
  if (format === 'currency') {
    const abs = Math.abs(v);
    if (abs >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + v.toFixed(2);
  }
  return v.toString();
}

export function qgFormatTick(v, format) {
  if (v == null) return '';
  if (format === 'percent') return Math.round(v) + '%';
  if (format === 'currency') {
    const abs = Math.abs(v);
    if (abs >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return '$' + Math.round(v / 1e3) + 'K';
    return '$' + Math.round(v);
  }
  return v.toString();
}

/* Shared SVG axis primitives — used by Line and Bar charts */
export function QGAxes({ labels, scales, padding, theme, format, ticks = 5 }) {
  const yTicks = [];
  for (let i = 0; i <= ticks; i++) {
    const v = scales.yMin + ((scales.yMax - scales.yMin) * i) / ticks;
    yTicks.push(v);
  }
  const stride = Math.max(1, Math.ceil(labels.length / 10));

  return (
    <g>
      {yTicks.map((v, i) => {
        const y = scales.y(v);
        return (
          <g key={'g' + i}>
            <line x1={padding.l} x2={QG_WIDTH - padding.r} y1={y} y2={y}
                  stroke={theme.grid} strokeWidth="1" />
            <text x={padding.l - 10} y={y + 4} textAnchor="end"
                  fontSize="11" fill={theme.tick} className="tnum">
              {qgFormatTick(v, format)}
            </text>
          </g>
        );
      })}
      {labels.map((l, i) => {
        if (i % stride !== 0 && i !== labels.length - 1) return null;
        const x = scales.x(i, labels.length);
        return (
          <text key={'x' + i} x={x} y={QG_HEIGHT - padding.b + 18}
                textAnchor="middle" fontSize="11" fill={theme.tick}>
            {l}
          </text>
        );
      })}
      <line x1={padding.l} x2={QG_WIDTH - padding.r}
            y1={QG_HEIGHT - padding.b} y2={QG_HEIGHT - padding.b}
            stroke={theme.axis} strokeWidth="1" />
    </g>
  );
}

/* Tooltip rendered above the hovered data point */
export function QGTooltip({ idx, data, scales, padding, theme }) {
  if (idx == null) return null;
  const x   = scales.x(idx, data.labels.length);
  const y   = scales.y(data.values[idx]);
  const val = qgFormatValue(data.values[idx], data.format, data.unit);
  const boxW = 132, boxH = 50;
  let bx = Math.max(padding.l, Math.min(QG_WIDTH - padding.r - boxW, x - boxW / 2));
  const by = Math.max(8, y - boxH - 14);
  return (
    <g style={{ pointerEvents: 'none' }}>
      <line x1={x} x2={x} y1={padding.t} y2={QG_HEIGHT - padding.b}
            stroke={theme.crosshair} strokeWidth="1" strokeDasharray="3 3" />
      <circle cx={x} cy={y} r="5" fill={theme.line} stroke={theme.tooltipBg} strokeWidth="2" />
      <g transform={`translate(${bx},${by})`}>
        <rect width={boxW} height={boxH} rx="8" fill={theme.tooltipBg}
              stroke={theme.tooltipBorder} strokeWidth="1" />
        <text x="12" y="20" fontSize="11" fill={theme.label}>{data.labels[idx]}</text>
        <text x="12" y="38" fontSize="15" fontWeight="600"
              fill={theme.tooltipText} className="tnum">{val}</text>
      </g>
    </g>
  );
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 5: Delete the old formatData.js**

Delete `src/utils/formatData.js`. If `src/utils/` is now empty, delete the directory too.

- [ ] **Step 6: Commit**

```bash
git add src/components/charts/chartUtils.jsx src/__tests__/chartUtils.test.js
git commit -m "feat: add chart utilities (TDD) — qgScales, qgSmoothPath, qgFormatValue, QGAxes, QGTooltip"
```

---

## Task 6: LineChart

**Files:**
- Create: `src/components/charts/LineChart.jsx`

- [ ] **Step 1: Create LineChart.jsx**

```jsx
// src/components/charts/LineChart.jsx
import React, { useState } from 'react';
import { QG_WIDTH, QG_HEIGHT, qgScales, qgSmoothPath, QGAxes, QGTooltip } from './chartUtils';

export default function LineChart({ data, theme }) {
  const [focus, setFocus] = useState(null);
  const padding = { t: 18, r: 24, b: 36, l: 56 };
  const s = qgScales(data.values, padding);
  const pts = data.values.map((v, i) => [s.x(i, data.values.length), s.y(v)]);
  const linePath = qgSmoothPath(pts);
  const areaPath = pts.length
    ? `${linePath} L ${pts[pts.length - 1][0]} ${QG_HEIGHT - padding.b} L ${pts[0][0]} ${QG_HEIGHT - padding.b} Z`
    : '';

  function handleMove(e) {
    const svg = e.currentTarget.ownerSVGElement;
    const pt  = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const local = pt.matrixTransform(svg.getScreenCTM().inverse());
    let best = 0, bestDist = Infinity;
    pts.forEach(([px], i) => {
      const dx = Math.abs(local.x - px);
      if (dx < bestDist) { bestDist = dx; best = i; }
    });
    setFocus(best);
  }

  return (
    <svg viewBox={`0 0 ${QG_WIDTH} ${QG_HEIGHT}`} className="w-full h-full">
      <QGAxes labels={data.labels} scales={s} padding={padding}
              theme={theme} format={data.format} />
      <path d={areaPath} fill={theme.lineFill} />
      <path d={linePath} fill="none" stroke={theme.line}
            strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"
            className="qg-line-anim" style={{ '--len': 2200 }} />
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="2.5"
                fill={theme.dot} opacity={focus === i ? 0 : 0.7} />
      ))}
      <rect x={padding.l} y={padding.t} width={s.innerW} height={s.innerH}
            fill="transparent"
            onMouseMove={handleMove} onMouseLeave={() => setFocus(null)} />
      <QGTooltip idx={focus} data={data} scales={s} padding={padding} theme={theme} />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/LineChart.jsx
git commit -m "feat: add hand-rolled SVG LineChart"
```

---

## Task 7: BarChart

**Files:**
- Create: `src/components/charts/BarChart.jsx`

- [ ] **Step 1: Create BarChart.jsx**

```jsx
// src/components/charts/BarChart.jsx
import React, { useState } from 'react';
import { QG_WIDTH, QG_HEIGHT, qgScales, QGAxes, QGTooltip } from './chartUtils';

export default function BarChart({ data, theme }) {
  const [focus, setFocus] = useState(null);
  const padding = { t: 18, r: 24, b: 36, l: 56 };
  const s    = qgScales(data.values, padding);
  const n    = data.values.length;
  const slot = s.innerW / n;
  const barW = Math.max(4, Math.min(36, slot * 0.62));
  const y0   = QG_HEIGHT - padding.b;

  return (
    <svg viewBox={`0 0 ${QG_WIDTH} ${QG_HEIGHT}`} className="w-full h-full">
      <defs>
        <linearGradient id="qgBarFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={theme.barTop} />
          <stop offset="100%" stopColor={theme.bar} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <QGAxes labels={data.labels} scales={s} padding={padding}
              theme={theme} format={data.format} />
      {data.values.map((v, i) => {
        const cx = padding.l + slot * (i + 0.5);
        const y  = s.y(v);
        const h  = Math.max(2, y0 - y);
        return (
          <g key={i}
             onMouseEnter={() => setFocus(i)} onMouseLeave={() => setFocus(null)}>
            <rect x={cx - barW / 2} y={y} width={barW} height={h}
                  rx="3" fill="url(#qgBarFill)"
                  opacity={focus == null ? 1 : focus === i ? 1 : 0.5}
                  style={{ transition: 'opacity 200ms' }} />
            <rect x={cx - slot / 2} y={padding.t}
                  width={slot} height={s.innerH} fill="transparent" />
          </g>
        );
      })}
      <QGTooltip idx={focus} data={data} scales={s} padding={padding} theme={theme} />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/BarChart.jsx
git commit -m "feat: add hand-rolled SVG BarChart"
```

---

## Task 8: PieChart

**Files:**
- Create: `src/components/charts/PieChart.jsx`

- [ ] **Step 1: Create PieChart.jsx**

```jsx
// src/components/charts/PieChart.jsx
import React, { useState } from 'react';
import { QG_WIDTH, QG_HEIGHT, qgFormatValue } from './chartUtils';

const PIE_PALETTE = ['#818cf8','#6366f1','#4f46e5','#4338ca','#a5b4fc','#7c3aed','#06b6d4','#10b981'];

export default function PieChart({ data, theme }) {
  const [focus, setFocus] = useState(null);
  const total  = data.values.reduce((s, v) => s + Math.abs(v), 0);
  const cx     = QG_WIDTH * 0.35;
  const cy     = QG_HEIGHT / 2;
  const rO     = 120, rI = 64;
  const legX   = QG_WIDTH * 0.62;

  let angle = -Math.PI / 2;
  const arcs = data.values.map((v, i) => {
    const portion = Math.abs(v) / total;
    const start   = angle;
    const end     = angle + portion * Math.PI * 2;
    angle = end;
    const large = end - start > Math.PI ? 1 : 0;
    const arc = (r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const [xs1, ys1] = arc(rO, start); const [xe1, ye1] = arc(rO, end);
    const [xs2, ys2] = arc(rI, end);   const [xe2, ye2] = arc(rI, start);
    const d = `M ${xs1} ${ys1} A ${rO} ${rO} 0 ${large} 1 ${xe1} ${ye1} L ${xs2} ${ys2} A ${rI} ${rI} 0 ${large} 0 ${xe2} ${ye2} Z`;
    return { d, color: PIE_PALETTE[i % PIE_PALETTE.length], pct: portion, mid: (start + end) / 2 };
  });

  return (
    <svg viewBox={`0 0 ${QG_WIDTH} ${QG_HEIGHT}`} className="w-full h-full">
      {arcs.map((a, i) => {
        const active = focus === i;
        const offset = active ? 6 : 0;
        return (
          <g key={i}
             transform={`translate(${Math.cos(a.mid)*offset},${Math.sin(a.mid)*offset})`}
             onMouseEnter={() => setFocus(i)} onMouseLeave={() => setFocus(null)}
             style={{ transition: 'transform 200ms', cursor: 'pointer' }}>
            <path d={a.d} fill={a.color}
                  opacity={focus == null ? 1 : active ? 1 : 0.5}
                  style={{ transition: 'opacity 200ms' }} />
          </g>
        );
      })}
      <text x={cx} y={cy - 4}  textAnchor="middle" fontSize="12" fill={theme.label}>Total</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="18" fontWeight="600"
            fill={theme.tooltipText} className="tnum">
        {qgFormatValue(total, data.format, data.unit)}
      </text>
      {data.labels.map((label, i) => {
        const ly = 38 + i * 26;
        return (
          <g key={i} transform={`translate(${legX},${ly})`}
             onMouseEnter={() => setFocus(i)} onMouseLeave={() => setFocus(null)}
             style={{ cursor: 'pointer' }}>
            <rect width="14" height="14" rx="3" fill={PIE_PALETTE[i % PIE_PALETTE.length]}
                  opacity={focus == null ? 1 : focus === i ? 1 : 0.45} />
            <text x="22" y="11" fontSize="12" fill={theme.label}>{label}</text>
            <text x="22" y="25" fontSize="13" fontWeight="600"
                  fill={theme.tooltipText} className="tnum">
              {qgFormatValue(data.values[i], data.format, data.unit)}
              <tspan fill={theme.tick} fontWeight="400">  ·  {(arcs[i].pct*100).toFixed(1)}%</tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/PieChart.jsx
git commit -m "feat: add hand-rolled SVG PieChart (donut with legend)"
```

---

## Task 9: Sparkline

**Files:**
- Create: `src/components/charts/Sparkline.jsx`

- [ ] **Step 1: Create Sparkline.jsx**

```jsx
// src/components/charts/Sparkline.jsx
import React from 'react';
import { qgSmoothPath } from './chartUtils';

export default function Sparkline({ values, up, height = 60 }) {
  const W = 240, H = height, pad = 4;
  const min   = Math.min(...values);
  const max   = Math.max(...values);
  const range = (max - min) || 1;
  const x = (i) => pad + ((W - pad * 2) * i) / (values.length - 1);
  const y = (v)  => pad + (H - pad * 2) - ((v - min) / range) * (H - pad * 2);
  const pts = values.map((v, i) => [x(i), y(v)]);
  const linePath = qgSmoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length-1][0]} ${H-pad} L ${pts[0][0]} ${H-pad} Z`;
  const stroke = up ? '#818cf8' : '#f87171';
  const fill   = up ? 'rgba(129,140,248,0.22)' : 'rgba(248,113,113,0.18)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
         className="w-full" style={{ height: H }}>
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke}
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/Sparkline.jsx
git commit -m "feat: add Sparkline mini chart for dashboard cards"
```

---

## Task 10: Restyle ChartTypeSelector

**Files:**
- Rewrite: `src/components/ChartTypeSelector.jsx`

- [ ] **Step 1: Rewrite ChartTypeSelector.jsx**

```jsx
// src/components/ChartTypeSelector.jsx
import React from 'react';
import { QG_PAL } from '../theme';

const TYPES = ['Line', 'Bar', 'Pie'];

export default function ChartTypeSelector({ chartType, onChange, light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <div className={`inline-flex p-1 rounded-lg border ${p.border}
                     ${light ? 'bg-gray-100' : 'bg-gray-900'}`}>
      {TYPES.map((t) => {
        const v      = t.toLowerCase();
        const active = chartType === v;
        return (
          <button key={t} onClick={() => onChange(v)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors
                              ${active
                                ? 'bg-indigo-600 text-white shadow-[0_2px_8px_-2px_rgba(99,102,241,0.6)]'
                                : light ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChartTypeSelector.jsx
git commit -m "feat: restyle ChartTypeSelector with indigo active segment"
```

---

## Task 11: Rewrite SearchBar

**Files:**
- Rewrite: `src/components/SearchBar.jsx`

The new SearchBar is **controlled** — parent owns `value` and `onChange`. Old API was uncontrolled (`onSubmit` only). This changes how Home.jsx calls it (handled in Task 14).

- [ ] **Step 1: Rewrite SearchBar.jsx**

```jsx
// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { QG_PAL } from '../theme';
import { IconSearch, IconArrowRight } from './icons/Icons';

export default function SearchBar({ value, onChange, onSubmit, isLoading, light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  const [focused, setFocused] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(value); }} className="w-full">
      <div className={`relative flex items-center w-full rounded-xl border
                       ${focused
                          ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                          : light ? 'border-gray-300' : 'border-gray-700'}
                       ${p.inputBg} transition-all`}>
        <span className={`pl-5 ${p.muted}`}><IconSearch size={18} /></span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder='Try "US unemployment rate 2020-2024" or "inflation last 5 years"'
          autoFocus
          aria-label="Data query"
          className={`flex-1 bg-transparent py-4 px-4 outline-none text-[15px]
                      ${p.text} placeholder:${light ? 'text-gray-400' : 'text-gray-500'}`}
        />
        <button type="submit"
                disabled={isLoading || !value.trim()}
                className="mr-2 my-2 inline-flex items-center gap-1.5 px-4 py-2
                           rounded-lg text-sm font-medium transition-colors
                           bg-indigo-600 hover:bg-indigo-500 text-white
                           disabled:opacity-40 disabled:cursor-not-allowed">
          {isLoading
            ? <><span className="qg-ring w-3.5 h-3.5" /> Searching</>
            : <>Search <IconArrowRight size={13} /></>}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 px-1">
        <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded
                         ${light ? 'bg-gray-100 text-gray-500 border border-gray-200'
                                 : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>↵</kbd>
        <span className={`text-xs ${p.muted}`}>to search · plain-English questions work best</span>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SearchBar.jsx
git commit -m "feat: redesign SearchBar — controlled input, indigo focus ring, inline submit"
```

---

## Task 12: Restyle SuggestionChips

**Files:**
- Rewrite: `src/components/SuggestionChips.jsx`

The prop name changes from `onSelect` → `onPick`, and `activeQuery` + `light` are added.

- [ ] **Step 1: Rewrite SuggestionChips.jsx**

```jsx
// src/components/SuggestionChips.jsx
import React from 'react';
import { QG_PAL } from '../theme';

const SUGGESTIONS = [
  'US unemployment rate 2020-2024',
  'Inflation last 10 years',
  'China GDP growth',
  'AAPL stock 2023',
  'US home prices 2018-2024',
];

export default function SuggestionChips({ onPick, disabled, activeQuery, light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTIONS.map((q) => {
        const active = activeQuery === q;
        return (
          <button key={q} onClick={() => onPick(q)} disabled={disabled}
                  className={`text-sm rounded-full px-3 py-1 border transition-colors
                              disabled:opacity-50 disabled:cursor-not-allowed
                              ${active
                                ? (light
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                    : 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300')
                                : p.chip}`}>
            {q}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SuggestionChips.jsx
git commit -m "feat: restyle SuggestionChips with active-indigo state"
```

---

## Task 13: Rewrite GraphDisplay

**Files:**
- Rewrite: `src/components/GraphDisplay.jsx`

- [ ] **Step 1: Rewrite GraphDisplay.jsx**

```jsx
// src/components/GraphDisplay.jsx
import React, { useState, useEffect } from 'react';
import { QG_PAL, QG_THEME } from '../theme';
import { qgFormatValue } from './charts/chartUtils';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import ChartTypeSelector from './ChartTypeSelector';
import { IconAlert, IconPin } from './icons/Icons';

export default function GraphDisplay({ data, isLoading, error, chartType, setChartType, light, onRetry, onPin, isPinned }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  if (!data && !isLoading && !error) return null;

  return (
    <section className={`qg-rise w-full rounded-xl border ${p.border} ${p.surface} shadow-card overflow-hidden`}>
      {isLoading && <LoadingState p={p} light={light} />}
      {error && !isLoading && <ErrorState error={error} onRetry={onRetry} p={p} light={light} />}
      {data && !isLoading && !error && (
        <GraphSuccess data={data} chartType={chartType} setChartType={setChartType}
                      light={light} onPin={onPin} isPinned={isPinned} />
      )}
    </section>
  );
}

function LoadingState({ p, light }) {
  return (
    <div className="grid place-items-center px-6 py-24 text-center">
      <div className="qg-ring w-10 h-10 mx-auto mb-5" />
      <p className={`text-sm font-medium ${light ? 'text-gray-800' : 'text-white'}`}>
        Searching the web…
      </p>
      <p className={`text-xs ${p.dim} mt-1.5 max-w-sm`}>
        Reading FRED, BLS, World Bank, and other sources for your query.
      </p>
    </div>
  );
}

function ErrorState({ error, onRetry, p, light }) {
  return (
    <div className="grid place-items-center px-6 py-20 text-center">
      <div className="w-12 h-12 rounded-full grid place-items-center bg-red-500/10 text-red-400 mb-4">
        <IconAlert size={22} />
      </div>
      <p className={`text-base font-semibold ${light ? 'text-gray-900' : 'text-white'}`}>No data found</p>
      <p className={`text-sm ${p.dim} mt-1 max-w-md`}>{error}</p>
      <button onClick={onRetry}
              className={`mt-5 text-xs font-medium px-3 py-1.5 rounded-lg
                          border ${p.border} ${p.dim} hover:${p.text} transition-colors`}>
        Clear and try again
      </button>
    </div>
  );
}

function GraphSuccess({ data, chartType, setChartType, light, onPin, isPinned }) {
  const p     = QG_PAL[light ? 'light' : 'dark'];
  const theme = QG_THEME[light ? 'light' : 'dark'];
  const [focus, setFocus] = useState(null);
  useEffect(() => { setFocus(null); }, [data, chartType]);

  const first = data.values[0];
  const last  = data.values[data.values.length - 1];
  const delta = last - first;
  const pct   = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
  const up    = delta >= 0;
  const isFRED = /fred|federal reserve/i.test(data.source || '');

  return (
    <div className="p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className={`text-xl sm:text-2xl font-semibold leading-tight tracking-tight
                          ${light ? 'text-gray-900' : 'text-white'}`}>
            {data.title}
          </h2>
          {data.description && (
            <p className={`text-sm ${p.dim} mt-1.5`}>{data.description}</p>
          )}
          <div className="flex items-baseline gap-3 mt-4">
            <span className={`text-3xl sm:text-4xl font-semibold tracking-tight tnum
                              ${light ? 'text-gray-900' : 'text-white'}`}>
              {qgFormatValue(last, data.format, data.unit)}
            </span>
            <span className={`text-xs ${p.muted}`}>latest</span>
            <span className={`tnum text-sm font-medium px-2 py-0.5 rounded
                              ${up ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
              <span className={`${p.muted} font-normal ml-1.5`}>vs. start</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ChartTypeSelector chartType={chartType} onChange={setChartType} light={light} />
          {onPin && (
            <button onClick={() => onPin(data)}
                    aria-label={isPinned ? 'Unpin chart' : 'Pin chart'}
                    className={`p-2 rounded-lg border transition-colors
                                ${isPinned
                                  ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10'
                                  : `${p.border} ${p.dim} hover:text-indigo-400 hover:border-indigo-500/40`}`}>
              <IconPin size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 w-full" style={{ height: 320 }}>
        {chartType === 'line' && <LineChart data={data} theme={theme} />}
        {chartType === 'bar'  && <BarChart  data={data} theme={theme} />}
        {chartType === 'pie'  && <PieChart  data={data} theme={theme} />}
      </div>

      <div className={`mt-6 pt-4 border-t ${p.border} flex flex-col gap-1.5`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer"
             className={`text-sm ${p.dim} hover:${light ? 'text-gray-900' : 'text-white'} transition-colors`}>
            Source: <span className="underline underline-offset-4 decoration-dotted">{data.source}</span>
          </a>
          <span className={`text-xs ${p.muted}`}>Updated just now</span>
        </div>
        {isFRED && (
          <p className={`text-xs italic ${p.muted}`}>
            This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GraphDisplay.jsx
git commit -m "feat: redesign GraphDisplay — new loading/error/success states, SVG charts, pin button"
```

---

## Task 14: Rewrite Home page

**Files:**
- Rewrite: `src/pages/Home.jsx`

- [ ] **Step 1: Rewrite Home.jsx**

```jsx
// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QG_PAL } from '../theme';
import SearchBar from '../components/SearchBar';
import GraphDisplay from '../components/GraphDisplay';
import SuggestionChips from '../components/SuggestionChips';
import Footer from '../components/Footer';
import useGraphData from '../hooks/useGraphData';
import { usePins } from '../hooks/usePins';

const CATEGORIES = [
  { k: 'Economics',    items: ['GDP', 'CPI inflation', 'Unemployment'] },
  { k: 'Markets',      items: ['Stocks & ETFs', 'Treasury yields', 'FX rates'] },
  { k: 'Demographics', items: ['Population', 'Housing', 'Migration'] },
];

export default function Home({ light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  const { data, isLoading, error, fetchGraph } = useGraphData();
  const [chartType, setChartType]  = useState('line');
  const [query, setQuery]          = useState('');
  const [submitted, setSubmitted]  = useState(null);
  const { pins, addPin, removePin } = usePins();
  const location  = useLocation();
  const navigate  = useNavigate();

  // Auto-run query when navigated from Dashboard with state.autoQuery
  useEffect(() => {
    const auto = location.state?.autoQuery;
    if (auto) {
      window.history.replaceState({}, '');
      runSearch(auto);
    }
  }, []);

  function runSearch(q) {
    const trimmed = (q || '').trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setSubmitted(trimmed);
    setChartType('line');
    fetchGraph(trimmed);
  }

  function clearAll() {
    setQuery('');
    setSubmitted(null);
  }

  function handlePin(d) {
    const tag = d.source?.split(' — ')[0]?.trim() || 'Other';
    if (isPinned) removePin(submitted);
    else           addPin(submitted, tag, d);
  }

  const isPinned  = Boolean(submitted && pins.some((p) => p.query === submitted));
  const showGraph = isLoading || error || data;

  return (
    <main className={`${p.bg} min-h-screen relative`}>
      <div className="hero-glow absolute inset-x-0 top-0 h-[480px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-1.5 text-[11px] uppercase
                            tracking-[0.14em] ${p.dim} px-2.5 py-1 rounded-full
                            border ${p.border} ${p.surfaceAlt}`}>
            Beta · 5 free queries / day
          </div>
          <h1 className={`mt-5 text-4xl sm:text-5xl font-semibold tracking-tight
                          ${light ? 'text-gray-900' : 'text-white'}`}
              style={{ letterSpacing: '-0.025em' }}>
            Search anything.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
              See it as a graph.
            </span>
          </h1>
          <p className={`mt-4 text-base sm:text-lg ${p.dim} max-w-xl mx-auto`}>
            Type any question about economics, markets, or global data.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <SearchBar value={query} onChange={setQuery}
                     onSubmit={runSearch} isLoading={isLoading} light={light} />
        </div>

        {/* Suggestion chips */}
        <div className="mt-6 max-w-3xl mx-auto">
          <SuggestionChips onPick={runSearch} disabled={isLoading}
                           activeQuery={submitted} light={light} />
        </div>

        {/* Graph */}
        {showGraph && (
          <div className="mt-10">
            <GraphDisplay data={data} isLoading={isLoading} error={error}
                          chartType={chartType} setChartType={setChartType}
                          light={light} onRetry={clearAll}
                          onPin={handlePin} isPinned={isPinned} />
          </div>
        )}

        {/* Idle category cards */}
        {!showGraph && (
          <div className="mt-12 grid sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.k} className={`rounded-xl border ${p.border} ${p.surface} p-4`}>
                <p className={`text-[11px] uppercase tracking-[0.14em] ${p.muted}`}>{cat.k}</p>
                <ul className="mt-3 space-y-1.5">
                  {cat.items.map((it) => (
                    <li key={it} className={`text-sm ${p.dim} flex items-center gap-2`}>
                      <span className="w-1 h-1 rounded-full bg-indigo-500/70" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer light={light} />
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5173:
- Dark bg with ambient glow, gradient headline
- Search bar with indigo focus ring
- Chips below; idle category cards visible
- Submit a query → loading spinner → SVG line chart with value/delta/pin button
- Toggle light mode → everything switches correctly

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: redesign Home page — gradient headline, category cards, graph with pin button"
```

---

## Task 15: Footer + FAQAccordion + Pricing page

**Files:**
- Create: `src/components/Footer.jsx`
- Create: `src/components/FAQAccordion.jsx`
- Rewrite: `src/components/PricingCard.jsx`
- Rewrite: `src/pages/Pricing.jsx`

- [ ] **Step 1: Create Footer.jsx**

```jsx
// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { QG_PAL } from '../theme';
import { IconGraph } from './icons/Icons';

export default function Footer({ light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <footer className={`border-t ${p.border} ${p.surfaceAlt}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col
                       sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-6 h-6 rounded-md
                           bg-gradient-to-br from-indigo-500 to-indigo-700">
            <IconGraph size={12} className="text-white" />
          </span>
          <span className={`text-sm font-medium ${p.text}`}>QueryGraph</span>
          <span className={`text-xs ${p.muted}`}>© 2026</span>
        </div>
        <nav className="flex items-center gap-5 text-xs">
          {['Privacy', 'Terms', 'Status', 'API docs'].map((l) => (
            <a key={l} href="#"
               className={`${p.dim} hover:${light ? 'text-gray-900' : 'text-white'} transition-colors`}>
              {l}
            </a>
          ))}
          <Link to="/pricing" className={`${p.dim} hover:${light ? 'text-gray-900' : 'text-white'} transition-colors`}>
            Pricing
          </Link>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Create FAQAccordion.jsx**

```jsx
// src/components/FAQAccordion.jsx
import React, { useState } from 'react';
import { QG_PAL } from '../theme';
import { IconChevron } from './icons/Icons';

export default function FAQAccordion({ items, light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  const [open, setOpen] = useState(0);
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className={`border-b ${p.border}`}>
            <button onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between py-5 text-left gap-4">
              <span className={`text-base font-medium ${light ? 'text-gray-900' : 'text-white'}`}>
                {it.q}
              </span>
              <span className={`${p.dim} transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                <IconChevron size={18} />
              </span>
            </button>
            <div className={`overflow-hidden transition-[max-height,opacity] duration-300
                             ${isOpen ? 'max-h-40 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
              <p className={`text-sm leading-relaxed ${p.dim}`}>{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Rewrite PricingCard.jsx**

```jsx
// src/components/PricingCard.jsx
import React from 'react';
import { QG_PAL } from '../theme';
import { IconCheck } from './icons/Icons';

export default function PricingCard({ tier, light }) {
  const p       = QG_PAL[light ? 'light' : 'dark'];
  const popular = tier.isPopular;
  return (
    <div className={`relative flex flex-col rounded-xl p-7 sm:p-8 ${p.surface}
                     ${popular
                        ? 'border-2 border-indigo-500 lg:scale-[1.04] shadow-[0_30px_60px_-30px_rgba(99,102,241,0.5)]'
                        : `border ${p.border} shadow-card`}`}>
      {popular && (
        <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-xs
                         font-medium rounded-full px-3 py-1
                         shadow-[0_8px_20px_-8px_rgba(99,102,241,0.7)]">
          Most Popular
        </span>
      )}
      <div className="flex items-center gap-2">
        <h3 className={`text-lg font-semibold ${light ? 'text-gray-900' : 'text-white'}`}>
          {tier.name}
        </h3>
        {tier.tagline && (
          <span className={`text-[10px] uppercase tracking-[0.14em] ${p.muted}`}>
            {tier.tagline}
          </span>
        )}
      </div>
      <p className={`text-sm ${p.dim} mt-1`}>{tier.summary}</p>
      <div className="mt-5 flex items-baseline gap-1">
        <span className={`text-5xl font-semibold tracking-tight tnum
                          ${light ? 'text-gray-900' : 'text-white'}`}>
          {tier.price}
        </span>
        <span className={`text-sm ${p.dim}`}>/{tier.period}</span>
      </div>
      <button className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${popular ? p.accentBtn : p.neutralBtn}`}>
        {tier.cta}
      </button>
      <div className={`mt-7 pt-5 border-t ${p.border}`}>
        <p className={`text-xs uppercase tracking-[0.14em] ${p.muted} mb-3`}>Includes</p>
        <ul className="space-y-2.5">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid place-items-center w-4 h-4 rounded-full
                               bg-green-500/15 text-green-400 shrink-0">
                <IconCheck size={11} strokeWidth={3} />
              </span>
              <span className={`text-sm ${light ? 'text-gray-700' : 'text-gray-300'}`}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite Pricing.jsx**

```jsx
// src/pages/Pricing.jsx
import React from 'react';
import { QG_PAL } from '../theme';
import PricingCard from '../components/PricingCard';
import FAQAccordion from '../components/FAQAccordion';
import Footer from '../components/Footer';

const TIERS = [
  {
    name: 'Free', summary: 'Try it out and explore the basics.',
    price: '$0', period: 'month', cta: 'Get started free',
    features: ['5 queries per day','Line & bar charts','Watermarked PNG export','Community support'],
  },
  {
    name: 'Pro', tagline: 'Recommended', isPopular: true,
    summary: 'For analysts and curious researchers.',
    price: '$9', period: 'month', cta: 'Start 14-day trial',
    features: ['100 queries per day','All chart types (Line, Bar, Pie)','Clean PNG export',
               'All data sources','30-day query history','Email support'],
  },
  {
    name: 'Premium', summary: 'Unlimited usage with API access.',
    price: '$19', period: 'month', cta: 'Go Premium',
    features: ['Unlimited queries','All chart types','CSV & SVG export',
               '1-year query history','API access','Custom chart themes','Priority email support'],
  },
];

const FAQS = [
  { q: 'Where does the data come from?',
    a: 'QueryGraph searches trusted sources including FRED, BLS, World Bank, Trading Economics, and more — always linking back to the original source so you can verify.' },
  { q: 'Can I cancel anytime?',
    a: 'Yes. Cancel your subscription at any time with no penalty. You keep access until the end of your billing period.' },
  { q: 'What counts as a query?',
    a: 'Each search you submit counts as one query. Cached results (the same question within 24 hours) do not count against your daily limit.' },
];

export default function Pricing({ light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <main className={`${p.bg} min-h-screen relative`}>
      <div className="hero-glow absolute inset-x-0 top-0 h-[420px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center text-[11px] uppercase tracking-[0.14em]
                            ${p.dim} px-2.5 py-1 rounded-full border ${p.border} ${p.surfaceAlt}`}>
            Pricing
          </div>
          <h1 className={`mt-5 text-4xl sm:text-5xl font-semibold tracking-tight
                          ${light ? 'text-gray-900' : 'text-white'}`}
              style={{ letterSpacing: '-0.025em' }}>
            Simple, transparent pricing
          </h1>
          <p className={`mt-4 text-base sm:text-lg ${p.dim}`}>Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {TIERS.map((t) => <PricingCard key={t.name} tier={t} light={light} />)}
        </div>

        <div className={`mt-10 rounded-xl border ${p.border} ${p.surface}
                         px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
          <p className={`text-sm ${p.dim}`}>
            All plans include access to{' '}
            {['FRED', 'BLS', 'World Bank', '20+ other sources'].map((s, i, a) => (
              <span key={s}>
                <span className={light ? 'text-gray-900' : 'text-white'}>{s}</span>
                {i < a.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
          <p className={`text-xs ${p.muted}`}>Cancel anytime · No credit card for Free</p>
        </div>

        <div className="mt-20 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight
                            ${light ? 'text-gray-900' : 'text-white'}`}>
              Frequently asked questions
            </h2>
            <p className={`mt-2 text-sm ${p.dim}`}>
              Don't see your question?{' '}
              <a href="mailto:support@querygraph.io"
                 className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                Email support
              </a>.
            </p>
          </div>
          <FAQAccordion items={FAQS} light={light} />
        </div>
      </div>
      <Footer light={light} />
    </main>
  );
}
```

- [ ] **Step 5: Verify Pricing page in browser**

Navigate to http://localhost:5173/pricing:
- 3-tier cards, Pro card larger with "Most Popular" badge
- Trust strip below cards
- FAQ accordion expands/collapses
- Light/dark toggle works

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer.jsx src/components/FAQAccordion.jsx src/components/PricingCard.jsx src/pages/Pricing.jsx
git commit -m "feat: redesign Pricing page — 3-tier cards, FAQ accordion, shared Footer"
```

---

## Task 16: usePins hook (TDD) + useGraphData history tracking

**Files:**
- Create: `src/hooks/usePins.js`
- Create: `src/__tests__/usePins.test.js`
- Modify: `src/hooks/useGraphData.js`

- [ ] **Step 1: Write failing tests**

```js
// src/__tests__/usePins.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePins, addToHistory, readHistory } from '../hooks/usePins';

const MOCK_DATA = {
  title: 'US Unemployment', labels: ['Jan'], values: [3.6],
  format: 'percent', unit: '%', source: 'FRED — Federal Reserve', sourceUrl: '',
};

beforeEach(() => localStorage.clear());

describe('usePins', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => usePins());
    expect(result.current.pins).toEqual([]);
  });

  it('addPin prepends a pin', () => {
    const { result } = renderHook(() => usePins());
    act(() => result.current.addPin('query a', 'FRED', MOCK_DATA));
    expect(result.current.pins).toHaveLength(1);
    expect(result.current.pins[0].query).toBe('query a');
  });

  it('addPin deduplicates — re-adding moves to front with new tag', () => {
    const { result } = renderHook(() => usePins());
    act(() => result.current.addPin('q', 'FRED',  MOCK_DATA));
    act(() => result.current.addPin('q', 'BLS',   MOCK_DATA));
    expect(result.current.pins).toHaveLength(1);
    expect(result.current.pins[0].tag).toBe('BLS');
  });

  it('removePin removes by query', () => {
    const { result } = renderHook(() => usePins());
    act(() => result.current.addPin('q', 'FRED', MOCK_DATA));
    act(() => result.current.removePin('q'));
    expect(result.current.pins).toHaveLength(0);
  });

  it('persists pins to localStorage', () => {
    const { result } = renderHook(() => usePins());
    act(() => result.current.addPin('q', 'FRED', MOCK_DATA));
    const stored = JSON.parse(localStorage.getItem('qg_pins'));
    expect(stored).toHaveLength(1);
    expect(stored[0].query).toBe('q');
  });

  it('loads existing pins from localStorage on mount', () => {
    localStorage.setItem('qg_pins', JSON.stringify([{ query: 'q', tag: 'FRED', data: MOCK_DATA }]));
    const { result } = renderHook(() => usePins());
    expect(result.current.pins).toHaveLength(1);
  });
});

describe('addToHistory / readHistory', () => {
  it('adds a query', () => {
    addToHistory('test query');
    expect(readHistory()[0].q).toBe('test query');
  });

  it('keeps only last 5', () => {
    for (let i = 0; i < 7; i++) addToHistory(`q${i}`);
    expect(readHistory()).toHaveLength(5);
  });

  it('deduplicates — same query refreshes timestamp', () => {
    addToHistory('same');
    addToHistory('same');
    expect(readHistory()).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npm test
```
Expected: FAIL — "Cannot find module '../hooks/usePins'"

- [ ] **Step 3: Create src/hooks/usePins.js**

```js
// src/hooks/usePins.js
import { useState } from 'react';

const PINS_KEY    = 'qg_pins';
const HISTORY_KEY = 'qg_history';

function readStored(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

export function usePins() {
  const [pins, setPins] = useState(() => readStored(PINS_KEY));

  function addPin(query, tag, data) {
    setPins((prev) => {
      const filtered = prev.filter((p) => p.query !== query);
      const next = [{ query, tag, data }, ...filtered];
      localStorage.setItem(PINS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removePin(query) {
    setPins((prev) => {
      const next = prev.filter((p) => p.query !== query);
      localStorage.setItem(PINS_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { pins, addPin, removePin };
}

export function addToHistory(query) {
  const history = readStored(HISTORY_KEY);
  const filtered = history.filter((h) => h.q !== query);
  const next = [{ q: query, when: Date.now() }, ...filtered].slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function readHistory() {
  return readStored(HISTORY_KEY);
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 5: Add history tracking to useGraphData.js**

```js
// src/hooks/useGraphData.js
import { useState } from 'react';
import { addToHistory } from './usePins';

function useGraphData() {
  const [data, setData]         = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);

  async function fetchGraph(query) {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      let json;
      try { json = await response.json(); }
      catch { throw new Error('Could not reach the server. Make sure the backend is running on port 3001.'); }

      if (!response.ok) {
        throw new Error(json.error || 'Something went wrong. Please try a different query.');
      }

      addToHistory(query);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { data, isLoading, error, fetchGraph };
}

export default useGraphData;
```

- [ ] **Step 6: Verify pin roundtrip in browser**

1. Run a query on Home (e.g., click a suggestion chip)
2. Click the pin (bookmark) button in the chart header → button turns indigo
3. Navigate to `/dashboard` → pinned card appears
4. Navigate back to Home → run same query → pin button already highlighted

- [ ] **Step 7: Commit**

```bash
git add src/hooks/usePins.js src/__tests__/usePins.test.js src/hooks/useGraphData.js
git commit -m "feat: add usePins hook (TDD) + history tracking in useGraphData"
```

---

## Task 17: Dashboard page

**Files:**
- Rewrite: `src/pages/Dashboard.jsx` (replacing the placeholder from Task 3)

- [ ] **Step 1: Write Dashboard.jsx**

```jsx
// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QG_PAL } from '../theme';
import { usePins, readHistory } from '../hooks/usePins';
import Sparkline from '../components/charts/Sparkline';
import Footer from '../components/Footer';
import { IconSearch, IconPlus, IconUnpin, IconArrowRight } from './icons/Icons';

/* ── helper: relative time from a Date.now() timestamp ── */
function relTime(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return 'yesterday';
}

/* ── Pinned chart card ── */
function PinnedChartCard({ entry, light, onOpen, onUnpin }) {
  const p     = QG_PAL[light ? 'light' : 'dark'];
  const { data } = entry;
  if (!data?.values?.length) return null;
  const first = data.values[0];
  const last  = data.values[data.values.length - 1];
  const delta = last - first;
  const pct   = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
  const up    = delta >= 0;

  return (
    <div className={`group relative rounded-xl border ${p.border} ${p.surface}
                     overflow-hidden shadow-card hover:border-indigo-500/40
                     transition-colors cursor-pointer`}
         onClick={() => onOpen(entry.query)}>
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={`text-[10px] uppercase tracking-[0.14em] ${p.muted} mb-1`}>
            {entry.tag}
          </div>
          <h3 className={`text-sm font-medium leading-snug truncate
                          ${light ? 'text-gray-900' : 'text-white'}`}>
            {data.title}
          </h3>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onUnpin(entry.query); }}
                aria-label="Unpin"
                className={`opacity-0 group-hover:opacity-100 transition-opacity
                            ${p.muted} hover:text-white rounded-md p-1
                            hover:bg-gray-800/50`}>
          <IconUnpin size={14} />
        </button>
      </div>

      <div className="px-4 flex items-baseline gap-2">
        <span className={`text-2xl font-semibold tracking-tight tnum
                          ${light ? 'text-gray-900' : 'text-white'}`}>
          {last}{data.unit ? ' ' + data.unit : ''}
        </span>
        <span className={`tnum text-xs font-medium px-1.5 py-0.5 rounded
                          ${up ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
        </span>
      </div>

      <div className="mt-1">
        <Sparkline values={data.values} up={up} height={68} />
      </div>

      <div className={`px-4 py-2.5 border-t ${p.border} flex items-center
                       justify-between text-[11px]`}>
        <span className={p.muted}>
          {data.labels?.[0]} → {data.labels?.[data.labels.length - 1]}
        </span>
        <span className={`${p.muted} truncate ml-2 max-w-[140px]`}>
          {(data.source || '').split('—')[0].trim()}
        </span>
      </div>
    </div>
  );
}

/* ── "+ Pin a new chart" tile ── */
function AddChartTile({ light, onAdd }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <button onClick={onAdd}
            className={`rounded-xl border border-dashed ${p.border}
                        ${light ? 'bg-white/40 hover:bg-white' : 'bg-gray-900/40 hover:bg-gray-900'}
                        min-h-[212px] grid place-items-center transition-colors group`}>
      <div className="text-center">
        <div className={`mx-auto w-9 h-9 rounded-lg grid place-items-center
                         ${light ? 'bg-gray-100 group-hover:bg-indigo-50' : 'bg-gray-800 group-hover:bg-indigo-500/15'}
                         ${p.dim} group-hover:text-indigo-400 transition-colors`}>
          <IconPlus size={18} />
        </div>
        <p className={`mt-2 text-sm font-medium ${light ? 'text-gray-700' : 'text-gray-300'}`}>
          Pin a new chart
        </p>
        <p className={`text-xs ${p.muted} mt-0.5`}>Search to add one</p>
      </div>
    </button>
  );
}

/* ── KPI stat card ── */
function KPI({ label, value, sub, tone, light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  const toneColor =
    tone === 'up'     ? 'text-green-400'  :
    tone === 'down'   ? 'text-red-400'    :
    tone === 'accent' ? 'text-indigo-400' : p.dim;
  return (
    <div className={`rounded-xl border ${p.border} ${p.surface} px-5 py-4`}>
      <p className={`text-[11px] uppercase tracking-[0.14em] ${p.muted}`}>{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight tnum
                     ${light ? 'text-gray-900' : 'text-white'}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs ${toneColor}`}>{sub}</p>}
    </div>
  );
}

/* ── Dashboard page ── */
export default function Dashboard({ light }) {
  const p        = QG_PAL[light ? 'light' : 'dark'];
  const navigate = useNavigate();
  const { pins, removePin } = usePins();
  const history  = readHistory();
  const [collection, setCollection] = useState('All');

  function openQuery(query) {
    navigate('/', { state: { autoQuery: query } });
  }

  const tags = [...new Set(pins.map((p) => p.tag).filter(Boolean))];
  const collections = [
    { name: 'All', count: pins.length },
    ...tags.map((t) => ({ name: t, count: pins.filter((p) => p.tag === t).length })),
  ];
  const filtered = collection === 'All' ? pins : pins.filter((p) => p.tag === collection);

  const queriesToday = history.filter((h) => {
    const d = new Date(h.when);
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth();
  }).length;

  const SUGGESTED = [
    'Germany inflation 2019-2024',
    'S&P 500 last 5 years',
    'Japan population 2000-2024',
    '10-year treasury yield',
  ];

  return (
    <main className={`${p.bg} min-h-screen relative`}>
      <div className="hero-glow absolute inset-x-0 top-0 h-[300px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <h1 className={`mt-1 text-3xl sm:text-4xl font-semibold tracking-tight
                            ${light ? 'text-gray-900' : 'text-white'}`}
                style={{ letterSpacing: '-0.02em' }}>
              Your dashboard
            </h1>
            <p className={`mt-1.5 text-sm ${p.dim}`}>
              Pinned charts update automatically as new data is released.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                                text-sm border ${p.border} ${p.dim}
                                hover:${light ? 'text-gray-900' : 'text-white'} transition-colors`}>
              <IconSearch size={14} /> Search
            </button>
            <button onClick={() => navigate('/')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                               text-sm font-medium bg-indigo-600 hover:bg-indigo-500
                               text-white transition-colors">
              <IconPlus size={14} /> New chart
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <KPI label="Queries today" value={`${queriesToday}`}
               sub="tracked in session" tone="accent" light={light} />
          <KPI label="Pinned charts" value={`${pins.length}`}
               sub={`across ${Math.max(1, tags.length)} collection${tags.length !== 1 ? 's' : ''}`}
               light={light} />
          <KPI label="Data freshness" value="Live" sub="via public APIs" light={light} />
          <KPI label="Chart types"    value="3"    sub="Line · Bar · Pie" light={light} />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">

          {/* Main column */}
          <div>
            {/* Collection tabs + view toggle */}
            <div className="flex items-end justify-between gap-3 mb-4">
              <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
                {collections.map((c) => {
                  const active = collection === c.name;
                  return (
                    <button key={c.name} onClick={() => setCollection(c.name)}
                            className={`shrink-0 inline-flex items-center gap-1.5
                                        text-sm px-3 py-1.5 rounded-lg transition-colors
                                        ${active
                                          ? (light
                                              ? 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                                              : 'bg-gray-900 text-white border border-gray-800')
                                          : `${p.dim} hover:${light ? 'text-gray-900' : 'text-white'}`}`}>
                      {c.name}
                      <span className={`tnum text-[11px] px-1.5 py-0.5 rounded
                                        ${active
                                          ? (light ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-400')
                                          : (light ? 'bg-gray-100 text-gray-500' : 'bg-gray-900 text-gray-500')}`}>
                        {c.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pinned chart grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((entry) => (
                <PinnedChartCard key={entry.query} entry={entry} light={light}
                                 onOpen={openQuery} onUnpin={removePin} />
              ))}
              <AddChartTile light={light} onAdd={() => navigate('/')} />
            </div>

            {pins.length === 0 && (
              <div className={`mt-4 rounded-xl border border-dashed ${p.border}
                               ${p.surface} px-8 py-14 text-center`}>
                <p className={`text-sm font-medium ${light ? 'text-gray-700' : 'text-gray-300'}`}>
                  No pinned charts yet
                </p>
                <p className={`text-xs ${p.muted} mt-1`}>
                  Search a query then click the pin icon to save it here.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            {/* Recent activity */}
            <div className={`rounded-xl border ${p.border} ${p.surface} p-5`}>
              <p className={`text-[11px] uppercase tracking-[0.14em] ${p.muted} mb-3`}>
                Recent searches
              </p>
              {history.length === 0 ? (
                <p className={`text-sm ${p.dim}`}>No searches yet.</p>
              ) : (
                <ul className="space-y-3">
                  {history.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${light ? 'text-gray-800' : 'text-gray-200'}`}>
                          {h.q}
                        </p>
                        <p className={`text-[11px] ${p.muted}`}>{relTime(h.when)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Suggested queries */}
            <div className={`rounded-xl border ${p.border} ${p.surface} p-5`}>
              <p className={`text-[11px] uppercase tracking-[0.14em] ${p.muted} mb-3`}>
                Suggested for you
              </p>
              <ul className="space-y-2">
                {SUGGESTED.map((q) => (
                  <li key={q}>
                    <button onClick={() => openQuery(q)}
                            className={`w-full flex items-center justify-between gap-2
                                        text-left text-sm ${p.dim}
                                        hover:${light ? 'text-gray-900' : 'text-white'}
                                        py-1 transition-colors group`}>
                      <span className="truncate">{q}</span>
                      <IconArrowRight size={13}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <Footer light={light} />
    </main>
  );
}
```

- [ ] **Step 2: Fix the Icons import path in Dashboard.jsx**

Dashboard imports icons from `./icons/Icons` but it's in `src/pages/`. Fix the import:

```jsx
// Change line at top of Dashboard.jsx
import { IconSearch, IconPlus, IconUnpin, IconArrowRight } from '../components/icons/Icons';
```

- [ ] **Step 3: Verify Dashboard in browser**

Navigate to http://localhost:5173/dashboard:
- "Your dashboard" heading with Search / New chart buttons
- KPI row (4 cards)
- Collection tabs: "All (0)"
- "No pinned charts yet" empty state + AddChartTile
- Sidebar: "No searches yet."

Go to Home → run a query → pin it → back to Dashboard → pinned card appears with sparkline.
Click pinned card → navigates to Home and auto-runs that query.
Hover pinned card → unpin button (X) appears top-right.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: implement Dashboard page — pinned chart grid, KPIs, activity sidebar"
```

---

## Task 18: Remove Recharts + final cleanup

**Files:**
- Modify: `client/package.json` (via npm uninstall)

- [ ] **Step 1: Uninstall recharts**

```bash
npm uninstall recharts
```
Expected: recharts removed from `node_modules` and `package.json`.

- [ ] **Step 2: Run full test suite**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 3: Verify Vite build passes**

```bash
npm run build
```
Expected: Build completes, no errors, dist/ output generated.

- [ ] **Step 4: Manual smoke test in dev**

Open http://localhost:5173 and verify:
- [ ] Home dark mode: glow, gradient heading, search, chips, idle cards
- [ ] Submit a query: SVG loading spinner → SVG line chart with value + delta
- [ ] Switch to Bar and Pie chart types
- [ ] Pin a chart → button turns indigo filled
- [ ] Navigate to Dashboard → pinned card with sparkline appears
- [ ] Click collection tab to filter by tag
- [ ] Click "Pin a new chart" → navigates to Home
- [ ] Click a suggested query in sidebar → auto-runs on Home
- [ ] Navigate to Pricing → 3 tier cards, FAQ accordion, Footer
- [ ] Toggle light/dark everywhere — no broken layouts

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: remove recharts — SVG chart implementation complete"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| QG_PAL + QG_THEME tokens | Task 2 |
| hero-glow, shadow-card, qg-ring, qg-line-anim, tnum | Task 1 |
| Icons | Task 2 |
| darkMode: 'class' in Tailwind | Task 1 |
| light state lifted to App | Task 3 |
| /dashboard route | Task 3 |
| Navbar redesign | Task 4 |
| chartUtils (qgScales, qgSmoothPath, qgFormatValue, qgFormatTick, QGAxes, QGTooltip) | Task 5 |
| LineChart, BarChart, PieChart, Sparkline | Tasks 6–9 |
| ChartTypeSelector restyle | Task 10 |
| SearchBar controlled + indigo ring | Task 11 |
| SuggestionChips restyle | Task 12 |
| GraphDisplay rewrite (loading/error/success + pin button) | Task 13 |
| Home page redesign (glow, gradient, idle cards, auto-query from nav state) | Task 14 |
| Footer + FAQAccordion + PricingCard + Pricing page | Task 15 |
| usePins hook (addPin, removePin, dedup, localStorage) | Task 16 |
| addToHistory + readHistory | Task 16 |
| useGraphData history tracking | Task 16 |
| Dashboard page (KPIs, pinned grid, collection tabs, sidebar) | Task 17 |
| PinnedChartCard with Sparkline + unpin | Task 17 |
| AddChartTile | Task 17 |
| Click pinned card → navigate to Home + auto-run | Task 17 |
| Remove Recharts | Task 18 |
| formatData.js deleted | Task 5 |

All spec requirements covered. ✓

**Placeholder scan:** No TBDs or "implement later" — all steps have code. ✓

**Type/name consistency:**
- `onPick` prop used in SuggestionChips (Task 12) and called as `onPick` in Home (Task 14) ✓
- `usePins()` returns `{ pins, addPin, removePin }` — same names used in Home and Dashboard ✓
- `readHistory()` exported from `usePins.js` — imported correctly in Dashboard ✓
- `QG_PAL` and `QG_THEME` imported from `../theme` throughout ✓
- Chart components receive `{ data, theme }` — matches all usages in GraphDisplay ✓
