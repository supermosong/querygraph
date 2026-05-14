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
