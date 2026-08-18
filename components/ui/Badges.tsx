import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Category Pill
// ============================================================

const categoryColors: Record<string, { bg: string; text: string }> = {
  content: { bg: 'rgba(45, 95, 138, 0.1)', text: '#1E40AF' },
  pricing: { bg: 'rgba(217, 119, 6, 0.1)', text: '#92400E' },
  policy: { bg: 'rgba(124, 58, 237, 0.1)', text: '#5B21B6' },
  feature: { bg: 'rgba(5, 150, 105, 0.1)', text: '#065F46' },
  announce: { bg: 'rgba(8, 145, 178, 0.1)', text: '#0E7490' },
  deadline: { bg: 'rgba(220, 38, 38, 0.1)', text: '#991B1B' },
};

interface CategoryPillProps {
  category: string;
  label?: string;
  className?: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ category, label, className }) => {
  const colors = categoryColors[category] || { bg: 'rgba(0,0,0,0.06)', text: '#5A5D6B' };
  const displayLabel = label || category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-[3px] rounded-md text-[10.5px] font-bold uppercase tracking-[0.04em]',
        className
      )}
      style={{ background: colors.bg, color: colors.text }}
    >
      {displayLabel}
    </span>
  );
};

// ============================================================
// Importance Badge
// ============================================================

const importanceColors: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'rgba(220, 38, 38, 0.1)', text: '#991B1B', dot: '#DC2626' },
  med: { bg: 'rgba(217, 119, 6, 0.1)', text: '#92400E', dot: '#D97706' },
  medium: { bg: 'rgba(217, 119, 6, 0.1)', text: '#92400E', dot: '#D97706' },
  low: { bg: 'rgba(107, 114, 128, 0.1)', text: '#4B5563', dot: '#6B7280' },
};

interface ImportanceBadgeProps {
  level: string;
  label?: string;
  className?: string;
}

export const ImportanceBadge: React.FC<ImportanceBadgeProps> = ({ level, label, className }) => {
  const colors = importanceColors[level?.toLowerCase()] || importanceColors.med;
  const displayLabel = label || level?.toUpperCase() || 'MED';
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[10.5px] font-bold uppercase tracking-[0.04em]',
        className
      )}
      style={{ background: colors.bg, color: colors.text }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: colors.dot }}
      />
      {displayLabel}
    </span>
  );
};

// ============================================================
// Toggle Switch
// ============================================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled, className }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F8A]/40 focus-visible:ring-offset-2',
        checked ? 'bg-[#1A1A1E]' : 'bg-[rgba(0,0,0,0.15)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
};

// ============================================================
// Status Badge
// ============================================================

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    watching: { bg: 'rgba(5, 150, 105, 0.1)', text: '#065F46', dot: '#059669' },
    active: { bg: 'rgba(5, 150, 105, 0.1)', text: '#065F46', dot: '#059669' },
    paused: { bg: 'rgba(107, 114, 128, 0.1)', text: '#4B5563', dot: '#6B7280' },
    error: { bg: 'rgba(220, 38, 38, 0.1)', text: '#991B1B', dot: '#DC2626' },
    scanning: { bg: 'rgba(8, 145, 178, 0.1)', text: '#0E7490', dot: '#0891B2' },
    building: { bg: 'rgba(217, 119, 6, 0.1)', text: '#92400E', dot: '#D97706' },
  };
  
  const style = statusStyles[status] || statusStyles.watching;
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[10.5px] font-semibold capitalize',
        className
      )}
      style={{ background: style.bg, color: style.text }}
    >
      <span 
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          (status === 'scanning' || status === 'building') && 'animate-pulse'
        )}
        style={{ background: style.dot }}
      />
      {status}
    </span>
  );
};
