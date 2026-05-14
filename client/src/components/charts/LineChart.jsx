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
