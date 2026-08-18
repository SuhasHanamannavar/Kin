import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
