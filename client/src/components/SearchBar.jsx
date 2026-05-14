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
