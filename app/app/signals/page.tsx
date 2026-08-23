'use client';

import React, { useEffect, useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import SignalCard from '@/components/ui/SignalCard';
import Select from '@/components/ui/Select';
import KinCharacter from '@/components/ui/KinCharacter';
import type { Signal } from '@/types';
import { Search, Filter, CheckCheck, Trash2 } from 'lucide-react';

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [importance, setImportance] = useState('all');
  const [search, setSearch] = useState('');

  async function fetchSignals() {
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (importance !== 'all') params.set('importance', importance);
      if (search) params.set('search', search);
      
      const res = await fetch(`/api/signals?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSignals(data.signals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSignals();
  }, [category, importance]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSignals();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleToggleRead(id: string, read: boolean) {
    try {
      await fetch('/api/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read }),
      });
      setSignals(prev => prev.map(s => s.id === id ? { ...s, read } : s));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this signal?')) return;
    try {
      await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
      setSignals(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMarkAllRead() {
    try {
      await fetch('/api/signals/mark-all-read', { method: 'POST' });
      setSignals(prev => prev.map(s => ({ ...s, read: true })));
    } catch (e) {
      console.error(e);
    }
  }

  const unreadCount = signals.filter(s => !s.read).length;
  const highCount = signals.filter(s => s.importance === 'high').length;

  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <TopBar 
        title="Signals" 
        subtitle={`Key updates from your watchlist (as of ${today})`}
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        {/* Quick summary */}
        <Card className="mb-6 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-up">
          <KinCharacter size={48} state={unreadCount > 0 ? 'important' : 'happy'} animate={false} showShadow={false} />
          <div className="flex-1">
            <div className="text-[15px] font-bold text-[#1A1A1E] mb-1">
              {signals.length === 0 
                ? 'No signals yet' 
                : unreadCount > 0 
                  ? `${unreadCount} new update${unreadCount > 1 ? 's' : ''}` 
                  : 'All caught up'}
            </div>
            <div className="text-[13px] text-[#5A5D6B]">
              {signals.length === 0 
                ? 'Add URLs to your watchlist and Kin will start watching for changes.'
                : highCount > 0 
                  ? `${highCount} high-importance item${highCount > 1 ? 's' : ''} need attention.`
                  : 'Everything looks normal. No urgent changes detected.'}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] hover:text-[#1A1A1E] transition-colors border border-[rgba(0,0,0,0.1)]"
            >
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="search-box flex-1 max-w-md">
            <Search size={15} className="text-[#8A8D9A] flex-shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search signals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All categories' },
                { value: 'content', label: 'Content' },
                { value: 'pricing', label: 'Pricing' },
                { value: 'policy', label: 'Policy' },
                { value: 'feature', label: 'Features' },
                { value: 'announce', label: 'Announcements' },
                { value: 'deadline', label: 'Deadlines' },
              ]}
              className="w-[160px]"
            />
            <Select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              options={[
                { value: 'all', label: 'All importance' },
                { value: 'high', label: 'High only' },
                { value: 'med', label: 'Medium only' },
                { value: 'low', label: 'Low only' },
              ]}
              className="w-[160px]"
            />
          </div>
        </div>

        {/* Signals list */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-16 text-[#8A8D9A] text-[14px]">Loading signals...</div>
          ) : signals.length > 0 ? (
            signals.map(signal => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onToggleRead={handleToggleRead}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="mb-4 inline-block">
                <KinCharacter size={64} state="idle" animate={false} showShadow={false} />
              </div>
              <h3 className="text-[16px] font-semibold text-[#1A1A1E] mb-2">No signals match</h3>
              <p className="text-[13.5px] text-[#5A5D6B] max-w-sm mx-auto">
                Try changing your filters or add more websites to your watchlist.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
