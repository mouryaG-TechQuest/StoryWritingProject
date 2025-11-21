import { memo } from 'react';

interface FormInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable Form Input Component
 * Optimized with React.memo for performance
 */
const FormInput = memo(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  disabled = false,
  className = '',
}: FormInputProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 border ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-purple-200 focus:ring-purple-500'
        } rounded-xl focus:ring-2 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed`}
        aria-invalid={!!error}
        aria-describedby={error ? `${placeholder}-error` : undefined}
      />
      {error && (
        <p id={`${placeholder}-error`} className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
