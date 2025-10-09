import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { BaseInput } from './BaseInput';
import { cn } from '@/lib/utils';

interface BaseTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  intervalMinutes?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  'data-testid'?: string;
}

export function BaseTimePicker({
  value = '',
  onChange,
  intervalMinutes = 30,
  placeholder = 'Select time',
  className,
  disabled = false,
  required = false,
  'data-testid': testId,
}: BaseTimePickerProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate time suggestions based on interval
  const generateTimeSuggestions = () => {
    const times: string[] = [];
    const startHour = 9; // 9 AM
    const endHour = 20; // 8 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  const timeSuggestions = generateTimeSuggestions();

  // Filter suggestions based on input
  const filteredSuggestions = timeSuggestions.filter(time =>
    time.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (time: string) => {
    setInputValue(time);
    onChange(time);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <BaseInput
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          data-testid={testId}
          className="pr-10"
        />
        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-popover border border-border rounded-md shadow-lg">
          {filteredSuggestions.map((time, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 text-foreground hover:bg-accent focus:bg-accent focus:outline-none text-sm transition-colors"
              onClick={() => handleSuggestionClick(time)}
              data-testid={`time-option-${time.replace(/[:\s]/g, '-')}`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
