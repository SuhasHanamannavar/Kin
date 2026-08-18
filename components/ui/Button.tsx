import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D5F8A]/40 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#1A1A1E] text-white hover:bg-[#2A2A3A] active:scale-[0.98] shadow-sm',
    ghost: 'bg-transparent text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.06)] hover:text-[#1A1A1E] border border-[rgba(0,0,0,0.1)]',
    danger: 'bg-[rgba(220,38,38,0.08)] text-[#DC2626] hover:bg-[rgba(220,38,38,0.14)]',
    outline: 'bg-white text-[#1A1A1E] border border-[rgba(0,0,0,0.14)] hover:border-[rgba(0,0,0,0.24)] hover:bg-[rgba(0,0,0,0.02)]',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-[12.5px]',
    md: 'px-[18px] py-[10px] text-[14px]',
    lg: 'px-[22px] py-[12px] text-[15px]',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
