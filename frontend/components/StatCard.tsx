import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  valueColor = 'text-emerald-600',
}) => {
  return (
    <div className="text-center">
      <div className={`text-2xl sm:text-3xl font-bold ${valueColor} mb-2`}>
        {value}
      </div>
      <div className="text-gray-600 text-sm sm:text-base">{label}</div>
    </div>
  );
};
