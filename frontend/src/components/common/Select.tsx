import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  sizeVariant?: 'sm' | 'md';
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  value,
  onChange,
  sizeVariant = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs py-1.5 pl-3 pr-8',
    md: 'text-sm py-2 pl-3.5 pr-9',
  };

  return (
    <div className={`relative inline-flex flex-col ${className}`}>
      {label && (
        <label className="text-xs font-medium text-slate-600 mb-1">{label}</label>
      )}
      <div className="relative flex items-center">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`appearance-none bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${sizeClasses[sizeVariant]} w-full`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
      </div>
    </div>
  );
};
