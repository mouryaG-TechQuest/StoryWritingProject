import { memo } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
  className?: string;
}

/**
 * Reusable Alert Component
 * Optimized with React.memo
 */
const Alert = memo(({ type, message, onClose, className = '' }: AlertProps) => {
  const config = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: Info,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: AlertCircle,
    },
  };

  const { bg, border, text, icon: Icon } = config[type];

  return (
    <div className={`${bg} border ${border} ${text} px-4 py-3 rounded-xl flex items-start ${className}`} role="alert">
      <Icon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span className="text-sm flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className={`${text} hover:opacity-70 transition-opacity ml-2`}
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

Alert.displayName = 'Alert';

export default Alert;
