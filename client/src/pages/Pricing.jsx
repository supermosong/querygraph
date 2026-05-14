// src/pages/Pricing.jsx
import React from 'react';
import { QG_PAL } from '../theme';
import PricingCard from '../components/PricingCard';
import FAQAccordion from '../components/FAQAccordion';
import Footer from '../components/Footer';

const TIERS = [
  {
    name: 'Free', summary: 'Try it out and explore the basics.',
    price: '$0', period: 'month', cta: 'Get started free',
    features: ['5 queries per day','Line & bar charts','Watermarked PNG export','Community support'],
  },
  {
    name: 'Pro', tagline: 'Recommended', isPopular: true,
    summary: 'For analysts and curious researchers.',
    price: '$9', period: 'month', cta: 'Start 14-day trial',
    features: ['100 queries per day','All chart types (Line, Bar, Pie)','Clean PNG export',
               'All data sources','30-day query history','Email support'],
  },
  {
    name: 'Premium', summary: 'Unlimited usage with API access.',
    price: '$19', period: 'month', cta: 'Go Premium',
    features: ['Unlimited queries','All chart types','CSV & SVG export',
               '1-year query history','API access','Custom chart themes','Priority email support'],
  },
];

const FAQS = [
  { q: 'Where does the data come from?',
    a: 'QueryGraph searches trusted sources including FRED, BLS, World Bank, Trading Economics, and more — always linking back to the original source so you can verify.' },
  { q: 'Can I cancel anytime?',
    a: 'Yes. Cancel your subscription at any time with no penalty. You keep access until the end of your billing period.' },
  { q: 'What counts as a query?',
    a: 'Each search you submit counts as one query. Cached results (the same question within 24 hours) do not count against your daily limit.' },
];

export default function Pricing({ light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <main className={`${p.bg} min-h-screen relative`}>
      <div className="hero-glow absolute inset-x-0 top-0 h-[420px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center text-[11px] uppercase tracking-[0.14em]
                            ${p.dim} px-2.5 py-1 rounded-full border ${p.border} ${p.surfaceAlt}`}>
            Pricing
          </div>
          <h1 className={`mt-5 text-4xl sm:text-5xl font-semibold tracking-tight
                          ${light ? 'text-gray-900' : 'text-white'}`}
              style={{ letterSpacing: '-0.025em' }}>
            Simple, transparent pricing
          </h1>
          <p className={`mt-4 text-base sm:text-lg ${p.dim}`}>Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {TIERS.map((t) => <PricingCard key={t.name} tier={t} light={light} />)}
        </div>

        <div className={`mt-10 rounded-xl border ${p.border} ${p.surface}
                         px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
          <p className={`text-sm ${p.dim}`}>
            All plans include access to{' '}
            {['FRED', 'BLS', 'World Bank', '20+ other sources'].map((s, i, a) => (
              <span key={s}>
                <span className={light ? 'text-gray-900' : 'text-white'}>{s}</span>
                {i < a.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
          <p className={`text-xs ${p.muted}`}>Cancel anytime · No credit card for Free</p>
        </div>

        <div className="mt-20 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight
                            ${light ? 'text-gray-900' : 'text-white'}`}>
              Frequently asked questions
            </h2>
            <p className={`mt-2 text-sm ${p.dim}`}>
              Don't see your question?{' '}
              <a href="mailto:support@querygraph.io"
                 className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                Email support
              </a>.
            </p>
          </div>
          <FAQAccordion items={FAQS} light={light} />
        </div>
      </div>
      <Footer light={light} />
    </main>
  );
}
