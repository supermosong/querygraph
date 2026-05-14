// src/components/icons/Icons.jsx
import React from 'react';

const S = ({ children, size = 16, className = '', strokeWidth = 1.75 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
       fill="none" stroke="currentColor" strokeWidth={strokeWidth}
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const IconGraph = (p) => (
  <S {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 3 3 6-7" />
    <circle cx="7" cy="14" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="11" cy="10" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="20" cy="6"  r="1.3" fill="currentColor" stroke="none" />
  </S>
);

export const IconSearch = (p) => (
  <S {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></S>
);

export const IconArrowRight = (p) => (
  <S {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></S>
);

export const IconSun = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </S>
);

export const IconMoon = (p) => (
  <S {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></S>
);

export const IconCheck = (p) => (
  <S {...p} strokeWidth={2.25}><path d="M4 12l5 5L20 6" /></S>
);

export const IconExternal = (p) => (
  <S {...p}>
    <path d="M14 4h6v6" /><path d="M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </S>
);

export const IconAlert = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" /><path d="M12 16.5v.01" />
  </S>
);

export const IconChevron = (p) => (
  <S {...p}><path d="M6 9l6 6 6-6" /></S>
);

export const IconSpark = (p) => (
  <S {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </S>
);

export const IconPin = (p) => (
  <S {...p}><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" /></S>
);

export const IconUnpin = (p) => (
  <S {...p}>
    <path d="M12 17v5" /><path d="M8 4h8l-1.5 6 3 4H6.5l3-4z" />
  </S>
);

export const IconPlus = (p) => (
  <S {...p}><path d="M12 5v14M5 12h14" /></S>
);
