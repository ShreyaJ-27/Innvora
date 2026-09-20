import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  sizeVariant?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  sizeVariant = 'md',
  className = '',
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'h-8 text-xs pl-3 pr-7',
    md: 'h-9 text-sm pl-3 pr-8',
    lg: 'h-10 text-sm pl-3.5 pr-9',
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none bg-sand-200 border border-sand-400 rounded-lg
          text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-charcoal-700
          focus:border-charcoal-700 transition-colors cursor-pointer disabled:opacity-50
          disabled:cursor-not-allowed ${sizeClasses[sizeVariant]}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ backgroundColor: '#F8F4EC', color: '#272522' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Chevron icon */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
