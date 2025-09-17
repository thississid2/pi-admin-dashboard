"use client";

import { THEME_CONFIG } from '@/lib/constants';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
  color?: string;
}

const Loading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  color = THEME_CONFIG.colors.primary 
}: LoadingProps) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <div 
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-transparent rounded-full animate-spin`}
          style={{ borderTopColor: color }}
        />
        {text && (
          <p className="text-gray-600 font-medium text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};

// Specific loading components for common use cases
export const PageLoading = ({ text = 'Loading page...' }: { text?: string }) => (
  <Loading size="large" text={text} fullScreen />
);

export const ComponentLoading = ({ text }: { text?: string }) => (
  <Loading size="medium" text={text} />
);

export const ButtonLoading = () => (
  <Loading size="small" text="" />
);

// Skeleton loading components
export const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonCard = ({ lines = 3 }: { lines?: number }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine 
          key={index}
          className={`h-4 ${index === 0 ? 'w-3/4' : index === lines - 1 ? 'w-1/2' : 'w-full'}`}
        />
      ))}
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <SkeletonLine className="h-6 w-48" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLine 
              key={colIndex}
              className={`h-4 ${colIndex === 0 ? 'w-1/4' : colIndex === 1 ? 'w-1/3' : 'w-1/6'}`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Loading;