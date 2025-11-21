import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

/**
 * Reusable Loading Spinner Component
 * Optimized with React.memo
 */
const LoadingSpinner = memo(({ 
  size = 'md', 
  message,
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-16 w-16 border-4',
    lg: 'h-24 w-24 border-4'
  };

  const content = (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-purple-600 border-t-transparent ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
