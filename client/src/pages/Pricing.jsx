// Pricing.jsx — three-tier pricing page with FAQ section
import React from 'react';
import PricingCard from '../components/PricingCard';

const TIERS = [
  {
    tierName: 'Free',
    price: '$0',
    billingPeriod: 'forever',
    features: [
      '5 queries per day',
      'Line & bar charts',
      'Watermarked PNG export',
      'Community support',
    ],
    isPopular: false,
    ctaText: 'Get Started Free',
  },
  {
    tierName: 'Pro',
    price: '$9',
    billingPeriod: 'month',
    features: [
      '100 queries per day',
      'All chart types (Line, Bar, Pie)',
      'Clean PNG export',
      'All data sources',
      '30-day query history',
      'Email support',
    ],
    isPopular: true,
    ctaText: 'Start Pro',
  },
  {
    tierName: 'Premium',
    price: '$19',
    billingPeriod: 'month',
    features: [
      'Unlimited queries',
      'All chart types',
      'CSV export',
      '1-year query history',
      'API access',
      'Custom chart themes',
      'Priority email support',
    ],
    isPopular: false,
    ctaText: 'Go Premium',
  },
];

const FAQ = [
  {
    q: 'Where does the data come from?',
    a: 'QueryGraph searches trusted sources including FRED, BLS, World Bank, Trading Economics, and more — always linking back to the original source.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel your subscription at any time with no penalty. You keep access until the end of your billing period.',
  },
  {
    q: 'What counts as a query?',
    a: 'Each search you submit counts as one query. Cached results (same query within 24 hours) do not count against your limit.',
  },
];

function Pricing() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-500 text-lg">Start free. Upgrade when you need more.</p>
        </div>

        {/* Pricing cards — stack on mobile, row on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-20">
          {TIERS.map((tier) => (
            <PricingCard key={tier.tierName} {...tier} />
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-gray-200 pb-6">
                <p className="font-semibold text-gray-900 mb-2">{q}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

export default Pricing;
