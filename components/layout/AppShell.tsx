'use client';

import React from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  unreadSignals?: number;
}

export const AppShell: React.FC<AppShellProps> = ({ children, unreadSignals = 0 }) => {
  return (
    <div className="flex min-h-screen bg-[#FAFAF7]">
      <Sidebar unreadSignals={unreadSignals} />
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
