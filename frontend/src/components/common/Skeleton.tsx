import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-slate-700/60 rounded-lg ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-fintech-cardDark rounded-2xl p-5 border border-fintech-border dark:border-fintech-borderDark shadow-card">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-36 mb-3" />
      <Skeleton className="h-3.5 w-48" />
    </div>
  );
};
