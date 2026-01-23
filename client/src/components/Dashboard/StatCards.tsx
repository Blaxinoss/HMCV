// src/components/Dashboard/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-400 shadow-blue-500/20',
    green: 'from-green-600 to-emerald-400 shadow-green-500/20',
    red: 'from-red-600 to-pink-500 shadow-red-500/20',
    purple: 'from-purple-600 to-indigo-400 shadow-purple-500/20',
    orange: 'from-orange-600 to-amber-400 shadow-orange-500/20',
  };

  return (
    <div className="relative overflow-hidden bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:-translate-y-1 transition-transform duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-opacity group-hover:opacity-20`}></div>

      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
          {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;