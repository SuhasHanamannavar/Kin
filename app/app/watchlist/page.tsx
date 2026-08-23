'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badges';
import { 
  Plus, Trash2, Pause, Play, RefreshCw, 
  Database, Eye, ExternalLink, Clock, Globe
} from 'lucide-react';
import type { MonitoredUrl, ScanFrequency } from '@/types';
import { formatDate, getSiteName, ensureHttp } from '@/lib/utils';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<MonitoredUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewItem, setViewItem] = useState<MonitoredUrl | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  // Form states
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');
  const [newFrequency, setNewFrequency] = useState<ScanFrequency>('daily');
  const [adding, setAdding] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);

  async function fetchWatchlist() {
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      if (data.success) {
        setWatchlist(data.watchlist || []);
        if (data.fallback) setIsFallback(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl) return;
    setAdding(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          url: ensureHttp(newUrl),
          category: newCategory,
          scan_frequency: newFrequency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewUrl('');
        setNewName('');
        setShowAddModal(false);
        fetchWatchlist();
      } else {
        alert(data.error || 'Failed to add URL');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleStatus(item: MonitoredUrl) {
    try {
      const newStatus = item.status === 'paused' ? 'watching' : 'paused';
      const res = await fetch('/api/watchlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Remove this URL from your watchlist?')) return;
    try {
      const res = await fetch(`/api/watchlist?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
        if (viewItem?.id === id) setViewItem(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleScanSingle(id: string) {
    setScanningId(id);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningId(null);
    }
  }

  const categories = ['Technology', 'Pricing', 'Education', 'Policy', 'Research', 'News', 'Jobs', 'Other'];
  const frequencyLabels: Record<ScanFrequency, string> = {
    '1min': 'Every minute',
    '5min': 'Every 5 minutes',
    '15min': 'Every 15 minutes',
    'hourly': 'Every hour',
    '12h': 'Every 12 hours',
    'daily': 'Daily',
    'weekly': 'Weekly',
  };

  return (
    <>
      <TopBar 
        title="Watchlist" 
        subtitle="Manage URLs Kin is currently monitoring."
        unreadSignals={0}
      />
      
      <div className="p-7">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="eyebrow">Monitored sites</div>
            <h1 className="section-title">Your Watchlist</h1>
            <p className="section-sub">
              Kin monitors these websites on your schedule, checking for meaningful changes.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5">
            <Plus size={16} /> Add URL
          </Button>
        </div>

        {/* Fallback notice */}
        {isFallback && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 text-[13.5px]">
            <Database className="text-amber-600 mt-[2px] flex-shrink-0" size={18} />
            <div className="flex-1">
              <span className="font-bold">Demo mode:</span> Connect your Supabase database for persistent storage and proper user isolation.
            </div>
          </div>
        )}

        {/* Watchlist grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {watchlist.map(url => {
            const isScanning = scanningId === url.id;
            return (
              <Card key={url.id} className="p-5 flex flex-col justify-between min-h-[240px]">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                      {url.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1A1A1E] truncate">{url.name}</div>
                      <div className="text-[12px] text-[#8A8D9A] truncate mt-[2px]">
                        {getSiteName(url.url)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A] flex items-center gap-1.5">
                        <Globe size={12} /> Category
                      </span>
                      <span className="font-medium text-[#1A1A1E]">{url.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A] flex items-center gap-1.5">
                        <Clock size={12} /> Frequency
                      </span>
                      <span className="font-medium capitalize text-[#1A1A1E]">
                        {frequencyLabels[url.scan_frequency as ScanFrequency] || url.scan_frequency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A]">Last scan</span>
                      <span className="font-medium text-[#1A1A1E]">
                        {formatDate(url.last_scan)}
                      </span>
                    </div>
                    {url.signal_count > 0 && (
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-[#8A8D9A]">Signals found</span>
                        <span className="font-semibold text-[#DC2626]">{url.signal_count}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(0,0,0,0.06)]">
                  <StatusBadge status={url.status} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewItem(url)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] hover:text-[#1A1A1E] transition-colors"
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleScanSingle(url.id)}
                      disabled={isScanning}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
                      title="Scan now"
                    >
                      <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(url)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
                      title={url.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                      {url.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                    </button>
                    <button
                      onClick={() => handleRemove(url.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A8D9A] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Add new card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="min-h-[240px] p-5 rounded-[14px] border-2 border-dashed border-[rgba(0,0,0,0.1)] hover:border-[rgba(26,26,30,0.3)] hover:bg-white transition-all flex flex-col items-center justify-center gap-3 text-[#8A8D9A] hover:text-[#1A1A1E]"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(0,0,0,0.04)] flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div className="font-medium text-[13px]">Add new URL</div>
          </button>
        </div>
      </div>

      {/* ============================================================
           ADD URL MODAL
           ============================================================ */}
      {showAddModal && (
        <div className="modal-overlay animate-overlay-in" onClick={() => setShowAddModal(false)}>
          <div className="modal animate-modal-in" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleAddUrl}>
              <div className="px-6 py-6 border-b border-[rgba(0,0,0,0.06)]">
                <div className="text-[18px] font-bold">Add a URL to watch</div>
                <div className="text-[13px] text-[#8A8D9A] mt-[3px]">
                  Kin will scrape and monitor this site for changes automatically.
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <Input
                  label="Website URL"
                  type="text"
                  placeholder="https://example.com"
                  required
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                />
                <Input
                  label="Label / Name"
                  type="text"
                  placeholder="e.g. OpenAI Pricing"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    options={categories.map(c => ({ value: c, label: c }))}
                  />
                  <Select
                    label="Check frequency"
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value as ScanFrequency)}
                    options={[
                      { value: '1min', label: 'Every minute' },
                      { value: '5min', label: 'Every 5 minutes' },
                      { value: '15min', label: 'Every 15 minutes' },
                      { value: 'hourly', label: 'Every hour' },
                      { value: '12h', label: 'Every 12 hours' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                    ]}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[rgba(0,0,0,0.06)] flex gap-[10px] justify-end">
                <Button variant="ghost" onClick={() => setShowAddModal(false)} type="button">Cancel</Button>
                <Button type="submit" loading={adding}>Add to watchlist</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
           VIEW DETAILS MODAL
           ============================================================ */}
      {viewItem && (
        <div className="modal-overlay animate-overlay-in" onClick={() => setViewItem(null)}>
          <div className="modal animate-modal-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-6 border-b border-[rgba(0,0,0,0.06)] flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                {viewItem.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[18px] font-bold">{viewItem.name}</div>
                <a 
                  href={viewItem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[12.5px] text-[#2D5F8A] hover:underline inline-flex items-center gap-1 mt-[2px]"
                >
                  {getSiteName(viewItem.url)} <ExternalLink size={12} />
                </a>
              </div>
              <StatusBadge status={viewItem.status} />
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#FAFAF7]">
                  <div className="text-[11px] text-[#8A8D9A] font-semibold uppercase tracking-wider mb-1">Category</div>
                  <div className="text-[14px] font-medium text-[#1A1A1E]">{viewItem.category}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAF7]">
                  <div className="text-[11px] text-[#8A8D9A] font-semibold uppercase tracking-wider mb-1">Frequency</div>
                  <div className="text-[14px] font-medium text-[#1A1A1E] capitalize">
                    {frequencyLabels[viewItem.scan_frequency as ScanFrequency] || viewItem.scan_frequency}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAF7]">
                  <div className="text-[11px] text-[#8A8D9A] font-semibold uppercase tracking-wider mb-1">Signals found</div>
                  <div className="text-[14px] font-medium text-[#1A1A1E]">{viewItem.signal_count}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAF7]">
                  <div className="text-[11px] text-[#8A8D9A] font-semibold uppercase tracking-wider mb-1">Last scan</div>
                  <div className="text-[14px] font-medium text-[#1A1A1E]">{formatDate(viewItem.last_scan)}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[rgba(45,95,138,0.04)] border border-[rgba(45,95,138,0.1)]">
                <div className="text-[11px] text-[#1E40AF] font-semibold uppercase tracking-wider mb-1">Collector ID</div>
                <div className="text-[12.5px] font-mono text-[#1E40AF]">
                  {viewItem.collector_id || 'Auto-generated on first scan'}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[rgba(0,0,0,0.06)] flex gap-[10px] justify-end">
              <Button variant="ghost" onClick={() => setViewItem(null)} type="button">Close</Button>
              <Button 
                onClick={() => { 
                  handleScanSingle(viewItem.id); 
                  setViewItem(null); 
                }}
              >
                <RefreshCw size={14} /> Scan now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
