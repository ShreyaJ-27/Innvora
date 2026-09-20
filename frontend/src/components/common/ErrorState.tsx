import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'There was an issue loading this data. Please try again.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-terracotta-50 border border-terracotta-200 flex items-center justify-center">
      <AlertTriangle className="w-5 h-5 text-terracotta-600" />
    </div>
    <div>
      <p className="text-sm font-semibold text-charcoal-800">{title}</p>
      <p className="text-xs text-charcoal-500 mt-1 max-w-sm">{message}</p>
    </div>
    {onRetry && (
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
      >
        Try Again
      </Button>
    )}
  </div>
);
