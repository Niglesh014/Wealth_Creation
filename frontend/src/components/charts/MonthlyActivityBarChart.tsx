import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { formatCompactINR, formatINR } from '../../utils/formatters';

interface MonthlyActivity {
  month: string;
  investedAmount: number;
  realizedGains: number;
  dividendIncome: number;
  interestIncome: number;
}

interface MonthlyActivityBarChartProps {
  data: MonthlyActivity[];
}

export const MonthlyActivityBarChart: React.FC<MonthlyActivityBarChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-fintech-cardDark rounded-2xl p-6 border border-fintech-border dark:border-fintech-borderDark shadow-card">
      <div className="mb-6">
        <h3 className="text-base font-bold text-fintech-text dark:text-white">
          Monthly Investment & Cash Inflow
        </h3>
        <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
          Breakdown of capital deployed vs dividend and bond coupon earnings
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={val => formatCompactINR(val)} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900/95 text-white p-3 rounded-xl text-xs border border-slate-700/60 shadow-xl space-y-1">
                      <p className="font-bold text-gray-300 border-b border-slate-700/60 pb-1 mb-1.5">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex justify-between items-center space-x-4">
                          <span className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-300">{entry.name}:</span>
                          </span>
                          <span className="font-semibold text-white">{formatINR(Number(entry.value))}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }} />
            <Bar dataKey="investedAmount" name="Capital Invested" fill="#2563EB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="dividendIncome" name="Dividends" fill="#16A34A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="interestIncome" name="Bond Interest" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
