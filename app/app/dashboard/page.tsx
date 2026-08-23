'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import KinCharacter from '@/components/ui/KinCharacter';
import SignalCard from '@/components/ui/SignalCard';
import Link from 'next/link';
import { 
  ChevronRight, 
  Plus,
  Database,
  RefreshCw,
  Activity
} from 'lucide-react';
import type { Signal, MonitoredUrl } from '@/types';
import { formatDate, getSiteName } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useUser();
  const [watchlist, setWatchlist] = useState<MonitoredUrl[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [scanning, setScanning] = useState(false);

  async function fetchDashboardData() {
    try {
      const wlRes = await fetch('/api/watchlist');
      const wlData = await wlRes.json();
      if (wlData.success) {
        setWatchlist(wlData.watchlist || []);
        if (wlData.fallback) setIsFallback(true);
      }

      const sigRes = await fetch('/api/signals');
      const sigData = await sigRes.json();
      if (sigData.success) {
        setSignals(sigData.signals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function handleScanAll() {
    setScanning(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_all: true }),
      });
      await res.json();
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  }

  const unreadCount = signals.filter(s => !s.read).length;
  const recentSignals = signals.slice(0, 4);
  const recentWatchlist = watchlist.slice(0, 5);
  const activeCount = watchlist.filter(w => w.status === 'watching').length;

  return (
    <>
      <TopBar 
        title="Dashboard" 
        subtitle={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}. Here's what Kin found.`}
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        {/* Fallback storage notice */}
        {isFallback && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 text-[13.5px]">
            <Database className="text-amber-600 mt-[2px] flex-shrink-0" size={18} />
            <div className="flex-1">
              <span className="font-bold">Database not connected:</span> Kin is running in demo mode. Connect your Supabase database for full functionality with proper user isolation.
            </div>
          </div>
        )}

        {/* ============================================================
             KIN STATUS — ON TOP (as requested)
             ============================================================ */}
        <Card 
          className="mb-6 p-[22px] flex flex-col sm:flex-row items-center gap-6 animate-fade-up"
        >
          <div className="relative flex-shrink-0">
            <KinCharacter size={72} state={scanning ? 'scanning' : signals.length > 0 ? 'found' : 'idle'} />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="eyebrow">Kin status</div>
            <div className="text-[18px] font-bold mb-1">
              {scanning 
                ? 'Kin is scanning your watchlist...' 
                : unreadCount > 0 
                  ? `${unreadCount} new update${unreadCount > 1 ? 's' : ''} waiting for you`
                  : 'All systems running smoothly'}
            </div>
            <div className="text-[13.5px] text-[#5A5D6B] leading-[1.6]">
              Kin is monitoring <b>{activeCount}</b> of {watchlist.length} sites, 
              filters out web noise, and uses AI to summarize meaningful changes in plain English.
            </div>
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={handleScanAll} loading={scanning}>
              <RefreshCw size={16} className={scanning ? 'animate-spin' : ''} />
              {scanning ? 'Scanning...' : 'Scan Now'}
            </Button>
          </div>
        </Card>

        {/* Two column: Recent signals + Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
          {/* Recent signals */}
          <Card className="overflow-hidden animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="px-5 py-[18px] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold flex items-center gap-2">
                  <Activity size={16} className="text-[#DC2626]" />
                  Recent Signals
                </div>
                <div className="text-[12px] text-[#8A8D9A] mt-[2px]">Latest changes detected by Kin</div>
              </div>
              <Link href="/app/signals">
                <button className="btn-ghost px-4 py-2 text-[12px] font-medium rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[#5A5D6B] hover:border-[rgba(0,0,0,0.22)] hover:text-[#1A1A1E] transition-all flex items-center gap-1">
                  View all <ChevronRight size={14} />
                </button>
              </Link>
            </div>
            <div className="p-[6px] flex flex-col gap-[10px] min-h-[150px]">
              {loading ? (
                <div className="flex justify-center items-center py-10 text-[#8A8D9A] text-[13.5px]">Loading signals...</div>
              ) : recentSignals.length > 0 ? (
                recentSignals.map(signal => (
                  <SignalCard key={signal.id} signal={signal} compact />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-[#8A8D9A] text-center px-4">
                  <div className="mb-3">
                    <KinCharacter size={48} state="idle" animate={false} showShadow={false} />
                  </div>
                  <div className="font-semibold text-[13.5px] text-[#1A1A1E]">No signals yet</div>
                  <p className="text-[12px] mt-1 max-w-[280px]">
                    Add URLs to your watchlist and Kin will alert you when something meaningful changes.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Watchlist summary */}
          <Card className="overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="px-5 py-[18px] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold">Your Watchlist</div>
                <div className="text-[12px] text-[#8A8D9A] mt-[2px]">Sites Kin is monitoring</div>
              </div>
              <Link href="/app/watchlist">
                <button className="btn-ghost px-3 py-2 text-[12px] font-medium rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[#5A5D6B] hover:border-[rgba(0,0,0,0.22)] hover:text-[#1A1A1E] transition-all flex items-center gap-1">
                  <Plus size={14} /> Manage
                </button>
              </Link>
            </div>
            <div className="p-[6px] min-h-[150px]">
              {loading ? (
                <div className="flex justify-center items-center py-10 text-[#8A8D9A] text-[13.5px]">Loading sites...</div>
              ) : recentWatchlist.length > 0 ? (
                recentWatchlist.map(url => (
                  <div 
                    key={url.id}
                    className="px-4 py-3 flex items-center gap-3 rounded-lg hover:bg-[rgba(0,0,0,0.02)] transition-colors cursor-pointer group"
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                      {url.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#1A1A1E] truncate">{url.name}</div>
                      <div className="text-[11.5px] text-[#8A8D9A] truncate">{getSiteName(url.url)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {url.signal_count > 0 ? (
                        <div className="text-[12px] font-semibold text-[#DC2626]">{url.signal_count} signals</div>
                      ) : (
                        <div className="text-[11px] text-[#8A8D9A] capitalize">{url.status}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-[#8A8D9A] text-center px-4">
                  <div className="text-3xl mb-2">🌐</div>
                  <div className="font-semibold text-[13.5px] text-[#1A1A1E]">Watchlist is empty</div>
                  <p className="text-[12px] mt-1 max-w-[200px]">Add your first URL to begin monitoring.</p>
                  <Link href="/app/watchlist" className="mt-4">
                    <Button size="sm"><Plus size={14} /> Add URL</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
