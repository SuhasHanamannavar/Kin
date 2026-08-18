'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import KinCharacter from '@/components/ui/KinCharacter';
import { 
  LayoutDashboard, 
  Activity, 
  Link2, 
  MessageSquare, 
  Newspaper, 
  Settings,
  Sparkles,
  Globe,
  Wrench
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  isNew?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, badge, active, isNew }) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-[10px] px-[14px] py-[10px] rounded-[10px] text-[13.5px] transition-all duration-150 font-medium',
        active 
          ? 'bg-[rgba(26,26,30,0.08)] text-[#1A1A1E] font-semibold' 
          : 'text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1A1A1E]'
      )}
    >
      <span className="w-[18px] h-[18px] flex-shrink-0">{icon}</span>
      <span>{label}</span>
      {isNew && (
        <span 
          className="text-[9px] font-bold px-1.5 py-[2px] rounded"
          style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#D97706' }}
        >
          NEW
        </span>
      )}
      {badge && (
        <span 
          className="ml-auto text-[10.5px] font-bold px-[7px] py-[2px] rounded-full"
          style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

interface SidebarProps {
  unreadSignals?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ unreadSignals = 0 }) => {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { 
      href: '/app/dashboard', 
      icon: <LayoutDashboard size={18} strokeWidth={2} />, 
      label: 'Dashboard',
      active: pathname === '/app/dashboard' || pathname === '/app'
    },
    { 
      href: '/app/signals', 
      icon: <Activity size={18} strokeWidth={2} />, 
      label: 'Signals',
      badge: unreadSignals > 0 ? String(unreadSignals) : undefined,
      active: pathname === '/app/signals'
    },
    { 
      href: '/app/watchlist', 
      icon: <Link2 size={18} strokeWidth={2} />, 
      label: 'Watchlist',
      active: pathname === '/app/watchlist'
    },
    { 
      href: '/app/build', 
      icon: <Wrench size={18} strokeWidth={2} />, 
      label: 'Build with Kin',
      isNew: true,
      active: pathname === '/app/build'
    },
    { 
      href: '/app/scraping-browser', 
      icon: <Globe size={18} strokeWidth={2} />, 
      label: 'AI Scraping Browser',
      isNew: true,
      active: pathname === '/app/scraping-browser'
    },
    { 
      href: '/app/kin', 
      icon: <MessageSquare size={18} strokeWidth={2} />, 
      label: 'Kin AI',
      active: pathname === '/app/kin'
    },
    { 
      href: '/app/digest', 
      icon: <Newspaper size={18} strokeWidth={2} />, 
      label: 'Digest',
      active: pathname === '/app/digest'
    },
  ];

  const initials = user?.emailAddresses?.[0]?.emailAddress
    ? user.emailAddresses[0].emailAddress.split('@')[0].substring(0, 2).toUpperCase()
    : 'AK';

  return (
    <aside 
      className="w-[240px] bg-white border-r border-[rgba(0,0,0,0.06)] flex flex-col flex-shrink-0 h-screen sticky top-0"
    >
      {/* Brand */}
      <div 
        className="px-4 py-[18px] border-b border-[rgba(0,0,0,0.06)] flex items-center gap-[10px]"
      >
        <KinCharacter size={28} animate={false} showShadow={false} />
        <div>
          <div className="font-bold text-[16px] tracking-tight leading-none">Kin</div>
          <div className="text-[10.5px] text-[#8A8D9A] mt-[2px]">Personal workspace</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-[10px] py-3 flex-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-[#8A8D9A] uppercase tracking-[0.08em] px-2 py-2">
          Workspace
        </div>
        
        <div className="flex flex-col gap-[2px]">
          {navItems.map(item => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="text-[10px] font-semibold text-[#8A8D9A] uppercase tracking-[0.08em] px-2 py-2 mt-4">
          Settings
        </div>
        
        <NavItem 
          href="/app/settings"
          icon={<Settings size={18} strokeWidth={2} />}
          label="Settings"
          active={pathname === '/app/settings'}
        />
      </nav>

      {/* Bottom: Kin mini CTA */}
      <div className="p-[14px] border-t border-[rgba(0,0,0,0.06)]">
        <Link 
          href="/app/kin"
          className="block p-3 rounded-[14px] bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.14)] hover:shadow-card-hover transition-all duration-200"
        >
          <div className="flex items-center gap-[10px]">
            <div className="animate-kin-bob flex-shrink-0">
              <KinCharacter size={32} animate={false} showShadow={false} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-[#1A1A1E]">Ask Kin anything</div>
              <div className="text-[11px] text-[#8A8D9A] mt-[1px]">About your signals…</div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
