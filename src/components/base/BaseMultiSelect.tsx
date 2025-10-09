import { useState } from 'react';
import { Check } from 'lucide-react';
import { BaseLabel } from './BaseLabel';
import { cn } from '@/lib/utils';

interface BaseMultiSelectOption {
  id: string;
  label: string;
  sublabel?: string;
  value?: any;
}

interface BaseMultiSelectProps {
  options: BaseMultiSelectOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  'data-testid'?: string;
}

export function BaseMultiSelect({
  options,
  selectedIds,
  onChange,
  label,
  placeholder = 'Select options',
  className,
  disabled = false,
  required = false,
  'data-testid': testId,
}: BaseMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (id: string) => {
    if (disabled) return;
    
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    
    onChange(newSelectedIds);
  };

  const selectedLabels = options
    .filter(opt => selectedIds.includes(opt.id))
    .map(opt => opt.label)
    .join(', ');

  return (
    <div className={cn('space-y-2', className)}>
      {label && <BaseLabel>{label} {required && <span className="text-destructive">*</span>}</BaseLabel>}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-ring',
            selectedIds.length === 0 && 'text-muted-foreground'
          )}
          disabled={disabled}
          data-testid={testId}
        >
          <span className="truncate">
            {selectedIds.length > 0 ? selectedLabels : placeholder}
          </span>
          <svg
            className={cn('w-4 h-4 transition-transform text-muted-foreground', isOpen && 'transform rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-popover border border-border rounded-md shadow-lg">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">No options available</div>
            ) : (
              options.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-foreground hover:bg-accent transition-colors flex items-start gap-2',
                      isSelected && 'bg-accent/50'
                    )}
                    data-testid={`option-${option.id}`}
                  >
                    <div className={cn(
                      'mt-0.5 w-4 h-4 border rounded flex items-center justify-center',
                      isSelected ? 'bg-primary border-primary' : 'border-input'
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{option.label}</div>
                      {option.sublabel && (
                        <div className="text-xs text-muted-foreground">{option.sublabel}</div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
