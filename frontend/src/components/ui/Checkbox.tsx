import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const checkboxId = React.useId();
    
    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id={checkboxId}
              type="checkbox"
              className={cn(
                'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                'disabled:bg-gray-50 disabled:text-gray-500',
                error && 'border-red-300 focus:ring-red-500',
                className
              )}
              ref={ref}
              {...props}
            />
          </div>
          
          {label && (
            <div className="ml-3 text-sm">
              <label htmlFor={checkboxId} className="font-medium text-gray-700">
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
