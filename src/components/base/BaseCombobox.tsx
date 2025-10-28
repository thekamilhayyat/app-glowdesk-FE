import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { BaseLabel } from './BaseLabel';
import { BaseInput } from './BaseInput';
import { BaseButton } from './BaseButton';
import { cn } from '@/lib/utils';

interface BaseComboboxOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface BaseComboboxProps {
  options: BaseComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  onAddNew?: () => void;
  label?: string;
  placeholder?: string;
  addNewLabel?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  'data-testid'?: string;
}

export function BaseCombobox({
  options,
  value,
  onChange,
  onAddNew,
  label,
  placeholder = 'Search or select',
  addNewLabel = 'Add New',
  className,
  disabled = false,
  required = false,
  'data-testid': testId,
}: BaseComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(option => {
    const labelMatch = option.label?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false;
    const sublabelMatch = option.sublabel?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false;
    return labelMatch || sublabelMatch;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      {label && <BaseLabel>{label} {required && <span className="text-destructive">*</span>}</BaseLabel>}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50',
            !selectedOption && 'text-muted-foreground'
          )}
          disabled={disabled}
          data-testid={testId}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn('w-4 h-4 transition-transform text-muted-foreground', isOpen && 'transform rotate-180')} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
            <div className="p-2 border-b border-border">
              <BaseInput
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="text-sm"
                data-testid={`${testId}-search`}
              />
            </div>

            <div className="max-h-60 overflow-auto">
              {onAddNew && (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2 border-b border-border text-primary font-medium"
                  data-testid={`${testId}-add-new`}
                >
                  <Plus className="h-4 w-4" />
                  {addNewLabel}
                </button>
              )}

              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-foreground hover:bg-accent transition-colors',
                      value === option.id && 'bg-accent/50 font-medium'
                    )}
                    data-testid={`${testId}-option-${option.id}`}
                  >
                    <div className="text-sm">{option.label}</div>
                    {option.sublabel && (
                      <div className="text-xs text-muted-foreground">{option.sublabel}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
