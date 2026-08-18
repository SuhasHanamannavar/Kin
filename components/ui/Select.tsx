import React from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
}

const Select: React.FC<SelectProps> = ({ options, label, className, id, ...props }) => {
  const selectId = id || props.name;
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none px-[14px] py-[10px] pr-10 border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[13.5px] font-sans text-[#1A1A1E] bg-white outline-none cursor-pointer transition-all',
            'focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)]',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg 
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A8D9A]"
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
};

export default Select;
