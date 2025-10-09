import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { BaseLabel } from './BaseLabel';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BaseDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  'data-testid'?: string;
}

export function BaseDatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  className,
  disabled = false,
  required = false,
  'data-testid': testId,
}: BaseDatePickerProps) {
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      onChange(date);
    }
  };

  // Format value for input type="date" (yyyy-MM-dd)
  const dateValue = value ? format(value, 'yyyy-MM-dd') : '';

  return (
    <div className={cn('space-y-2', className)}>
      {label && <BaseLabel>{label} {required && <span className="text-destructive">*</span>}</BaseLabel>}
      
      <div className="relative">
        <input
          type="date"
          value={dateValue}
          onChange={handleNativeChange}
          className={cn(
            'w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
          required={required}
          data-testid={testId}
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
