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
