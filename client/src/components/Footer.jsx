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
