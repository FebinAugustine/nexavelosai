import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="bg-white backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-2 group">
      <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-emerald-200 transition-shadow duration-300">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
        {title}
      </h3>
      <p className="text-gray-600 text-center leading-relaxed text-sm sm:text-base">
        {description}
      </p>
    </div>
  );
};
