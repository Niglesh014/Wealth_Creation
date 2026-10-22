import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { AllocationItem } from '../../types';
import { formatINR } from '../../utils/formatters';

interface AllocationDonutChartProps {
  allocation: AllocationItem[];
}

export const AllocationDonutChart: React.FC<AllocationDonutChartProps> = ({ allocation }) => {
  const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-fintech-cardDark rounded-2xl p-6 border border-fintech-border dark:border-fintech-borderDark shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-fintech-text dark:text-white">
            Asset Allocation
          </h3>
          <span className="text-xs font-semibold text-fintech-secondary dark:text-blue-400">
            {formatINR(totalValue)}
          </span>
        </div>
        <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mb-4">
          Dynamic capital distribution across asset classes
        </p>
      </div>

      {/* Donut Chart */}
      <div className="h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocation}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
            >
              {allocation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as AllocationItem;
                  return (
                    <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700/60">
                      <p className="font-semibold">{data.category}</p>
                      <p className="text-emerald-400 font-bold">{formatINR(data.value)}</p>
                      <p className="text-gray-300">{data.percentage}% of portfolio</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-medium text-fintech-secondaryText dark:text-gray-400 uppercase tracking-wider">
            Holdings
          </span>
          <span className="text-base font-bold text-fintech-text dark:text-white">
            {allocation.length} Classes
          </span>
        </div>
      </div>

      {/* Breakdown Legend List */}
      <div className="space-y-2 mt-4 pt-3 border-t border-gray-100 dark:border-fintech-borderDark">
        {allocation.map(item => (
          <div key={item.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-fintech-text dark:text-gray-200">
                {item.category}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-fintech-text dark:text-white">
                {formatINR(item.value)}
              </span>
              <span className="text-fintech-secondaryText dark:text-gray-400 font-medium w-10 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
