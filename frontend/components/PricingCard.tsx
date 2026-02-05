import React from 'react';
import { Button } from './Button';

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  featured?: boolean;
  customPrice?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period = '/month',
  description,
  features,
  ctaText,
  ctaHref,
  featured = false,
  customPrice = false,
}) => {
  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
        featured ? 'border-2 border-emerald-600 relative' : 'border border-emerald-200/50'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-center mb-4">
          {customPrice ? (
            <span className="text-3xl font-bold text-gray-900">{price}</span>
          ) : (
            <>
              <span className="text-4xl font-bold text-gray-900">{price}</span>
              <span className="text-lg text-gray-600 ml-2">{period}</span>
            </>
          )}
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        href={ctaHref}
        variant="primary"
        size="lg"
        className="w-full"
      >
        {ctaText}
      </Button>
    </div>
  );
};
