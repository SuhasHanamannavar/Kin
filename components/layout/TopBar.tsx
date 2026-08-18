'use client';

import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { Bell, Search, Command } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  unreadSignals?: number;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  unreadSignals = 0,
  onSearch,
  showSearch = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF7]/85 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)]">
      <div className="px-7 py-4 flex items-center gap-4">
        {/* Title */}
        <div className="flex-shrink-0 min-w-0">
          <h1 className="text-[18px] font-bold tracking-tight text-[#1A1A1E] leading-none truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12.5px] text-[#5A5D6B] mt-[4px] truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="search-box">
              <Search size={15} className="text-[#8A8D9A] flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search signals, sites…"
                onChange={(e) => onSearch?.(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10.5px] text-[#8A8D9A] font-mono px-1.5 py-0.5 rounded border border-[rgba(0,0,0,0.08)]">
                <Command size={11} /> K
              </div>
            </div>
          </div>
        )}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <button 
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] hover:text-[#1A1A1E] transition-colors"
            title="Notifications"
          >
            <Bell size={18} strokeWidth={2} />
            {unreadSignals > 0 && (
              <span 
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ background: '#DC2626' }}
              >
                {unreadSignals > 9 ? '9+' : unreadSignals}
              </span>
            )}
          </button>

          {/* User avatar via Clerk */}
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
