import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import type { PerformancePoint } from '../../types';
import { api } from '../../services/api';
import { formatINR, formatCompactINR } from '../../utils/formatters';

interface PerformanceLineChartProps {
  initialRange?: string;
}

const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

export const PerformanceLineChart: React.FC<PerformanceLineChartProps> = ({ initialRange = '1M' }) => {
  const [range, setRange] = useState<string>(initialRange);
  const [data, setData] = useState<PerformancePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getPerformanceHistory(range).then(res => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [range]);

  const firstVal = data[0]?.value || 0;
  const lastVal = data[data.length - 1]?.value || 0;
  const isOverallPositive = lastVal >= firstVal;

  const strokeColor = isOverallPositive ? '#16A34A' : '#DC2626';
  const fillColor = isOverallPositive ? '#16A34A' : '#DC2626';

  return (
    <div className="bg-white dark:bg-fintech-cardDark rounded-2xl p-6 border border-fintech-border dark:border-fintech-borderDark shadow-card">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-fintech-text dark:text-white">
              Portfolio Growth
            </h3>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Simulated Data
            </span>
          </div>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Historical portfolio valuation and invested capital comparison
          </p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? 'bg-white dark:bg-slate-700 text-fintech-text dark:text-white shadow-sm'
                  : 'text-fintech-secondaryText dark:text-gray-400 hover:text-fintech-text dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Loading chart data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fillColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={val => formatCompactINR(val)}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as PerformancePoint;
                    return (
                      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl text-xs border border-slate-700/60 min-w-[170px]">
                        <p className="text-gray-400 font-medium mb-1.5">{item.date}</p>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-gray-300">Market Value:</span>
                          <span className="font-bold text-emerald-400">{formatINR(item.value)}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-gray-400">Invested:</span>
                          <span className="font-semibold text-gray-200">{formatINR(item.invested)}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-t border-slate-700/60 mt-1.5 pt-1.5">
                          <span className="text-gray-400">P/L:</span>
                          <span className={`font-bold ${item.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatINR(item.profitLoss, true)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#growthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
