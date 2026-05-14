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
