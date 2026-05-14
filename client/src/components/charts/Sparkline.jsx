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
