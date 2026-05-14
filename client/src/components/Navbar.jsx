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
