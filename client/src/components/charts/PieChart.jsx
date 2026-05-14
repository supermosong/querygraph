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
