import React from 'react';
import { cn } from '@/lib/utils';
import { CategoryPill, ImportanceBadge } from './Badges';
import { formatRelativeTime } from '@/lib/utils';
import type { Signal } from '@/types';
import { ChevronRight, Eye, EyeOff, Trash2 } from 'lucide-react';

interface SignalCardProps {
  signal: Signal;
  compact?: boolean;
  onToggleRead?: (id: string, read: boolean) => void;
  onDelete?: (id: string) => void;
  onClick?: (signal: Signal) => void;
  className?: string;
}

const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  compact = false,
  onToggleRead,
  onDelete,
  onClick,
  className,
}) => {
  const borderColor = 
    signal.importance === 'high' ? '#DC2626' :
    signal.importance === 'med' ? '#D97706' :
    'rgba(0,0,0,0.08)';

  return (
    <div
      className={cn(
        'bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] overflow-hidden transition-all duration-150',
        'hover:border-[rgba(0,0,0,0.16)] hover:shadow-card-hover cursor-pointer',
        !signal.read && 'border-l-[3px]',
        className
      )}
      style={!signal.read ? { borderLeftColor: borderColor } : undefined}
      onClick={() => onClick?.(signal)}
    >
      <div className={cn('p-4', compact ? 'py-3' : '')}>
        {/* Header: pills + meta */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <CategoryPill category={signal.category} label={signal.category_name} />
          <ImportanceBadge level={signal.importance} />
          <span className="ml-auto text-[11px] text-[#8A8D9A] flex-shrink-0">
            {formatRelativeTime(signal.detected_at)}
          </span>
        </div>

        {/* Title */}
        <div className={cn(
          'font-semibold text-[#1A1A1E] mb-1 leading-snug',
          compact ? 'text-[13.5px]' : 'text-[15px]',
          signal.read && 'text-[#5A5D6B] font-medium'
        )}>
          {signal.title}
        </div>

        {/* Site */}
        <div className="text-[11.5px] text-[#8A8D9A] mb-2">
          {signal.site}
        </div>

        {/* Summary */}
        {!compact && (
          <div className="text-[13px] text-[#5A5D6B] leading-[1.6] mb-3">
            {signal.summary}
          </div>
        )}

        {/* Why it matters */}
        {!compact && signal.why_it_matters && (
          <div 
            className="p-[10px_12px] rounded-lg mb-3"
            style={{ 
              background: signal.importance === 'high' 
                ? 'rgba(220,38,38,0.06)' 
                : 'rgba(45,95,138,0.06)', 
              border: signal.importance === 'high'
                ? '1px solid rgba(220,38,38,0.12)'
                : '1px solid rgba(45,95,138,0.12)'
            }}
          >
            <div 
              className="text-[10.5px] font-bold uppercase tracking-[0.05em] mb-[3px]"
              style={{ color: signal.importance === 'high' ? '#991B1B' : '#1E40AF' }}
            >
              Why it matters
            </div>
            <div 
              className="text-[12.5px] leading-[1.5]"
              style={{ color: signal.importance === 'high' ? '#7F1D1D' : '#1E3A5F' }}
            >
              {signal.why_it_matters}
            </div>
          </div>
        )}

        {/* Actions */}
        {(onToggleRead || onDelete) && (
          <div className="flex items-center gap-1 pt-2 border-t border-[rgba(0,0,0,0.06)]">
            {onToggleRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRead(signal.id, !signal.read);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] hover:text-[#1A1A1E] transition-colors"
                title={signal.read ? 'Mark as unread' : 'Mark as read'}
              >
                {signal.read ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="text-[12px] font-medium">
                  {signal.read ? 'Unread' : 'Read'}
                </span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(signal.id);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-[#8A8D9A] hover:bg-[rgba(220,38,38,0.06)] hover:text-[#DC2626] transition-colors ml-auto"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalCard;
