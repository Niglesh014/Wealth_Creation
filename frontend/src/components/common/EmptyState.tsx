import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-fintech-cardDark rounded-2xl border border-dashed border-gray-200 dark:border-fintech-borderDark">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 mb-4">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-semibold text-fintech-text dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-sm text-fintech-secondaryText dark:text-gray-400 max-w-sm mb-5">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
