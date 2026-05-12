// PricingCard.jsx — displays one pricing tier with features list and CTA button
import React from 'react';

// Renders a single pricing tier card
function PricingCard({ tierName, price, billingPeriod, features, isPopular, ctaText }) {
  return (
    <div className={`relative flex flex-col rounded-2xl border p-8 shadow-sm
      ${isPopular ? 'border-blue-500 ring-2 ring-blue-500 scale-105' : 'border-gray-200'}`}>

      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white
                         text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{tierName}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-500 text-sm">/{billingPeriod}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-green-500 font-bold mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => alert('Payment coming soon!')}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors
          ${isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
      >
        {ctaText}
      </button>
    </div>
  );
}

export default PricingCard;
