import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  subtext,
  icon,
  badge
}) => {
  return (
    <div className="bg-white dark:bg-fintech-cardDark rounded-2xl p-5 border border-fintech-border dark:border-fintech-borderDark shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-fintech-secondaryText dark:text-gray-400">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-fintech-secondary dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <div className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
          {value}
        </div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {badge}
          </span>
        )}
      </div>

      {(change || subtext) && (
        <div className="mt-2.5 flex items-center space-x-1.5 text-xs">
          {change && (
            <span
              className={`flex items-center font-semibold px-1.5 py-0.5 rounded-md ${
                isPositive === undefined
                  ? 'text-fintech-secondaryText dark:text-gray-400 bg-gray-100 dark:bg-slate-800'
                  : isPositive
                  ? 'text-fintech-positive dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-fintech-negative dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
              }`}
            >
              {isPositive === true && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
              {isPositive === false && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {change}
            </span>
          )}
          {subtext && (
            <span className="text-fintech-secondaryText dark:text-gray-400">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
