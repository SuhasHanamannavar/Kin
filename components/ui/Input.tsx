import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, id, ...props }) => {
  const inputId = id || props.name;
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] font-sans text-[#1A1A1E] bg-white outline-none transition-all',
          'focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)]',
          error && 'border-[rgba(220,38,38,0.4)] focus:border-[rgba(220,38,38,0.5)] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-[12px] text-[#DC2626]">{error}</p>
      )}
    </div>
  );
};

export default Input;
