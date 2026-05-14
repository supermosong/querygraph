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
