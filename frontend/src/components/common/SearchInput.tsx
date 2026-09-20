import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  sizeVariant?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search…',
  sizeVariant = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 text-xs pl-8 pr-3',
    md: 'h-9 text-sm pl-9 pr-3',
    lg: 'h-10 text-sm pl-10 pr-4',
  };
  const iconClasses = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3',
    lg: 'w-4 h-4 left-3.5',
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        className={`absolute top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none ${iconClasses[sizeVariant]}`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-sand-200 border border-sand-400 rounded-lg text-charcoal-800
          placeholder-charcoal-400 focus:outline-none focus:ring-1 focus:ring-charcoal-700
          focus:border-charcoal-700 transition-colors ${sizeClasses[sizeVariant]}`}
      />
    </div>
  );
};
