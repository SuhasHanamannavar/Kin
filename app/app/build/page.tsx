'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badges';
import KinCharacter from '@/components/ui/KinCharacter';
import { 
  Sparkles, Wrench, Send, Plus, Trash2, 
  ExternalLink, CheckCircle2, Clock, Globe
} from 'lucide-react';
import type { Collector, ScanFrequency } from '@/types';
import { formatDate } from '@/lib/utils';

interface BuildResult {
  url: string;
  name: string;
  content_type: string;
  selectors: string[];
  frequency: ScanFrequency;
  noise_sensitivity: string;
  summary: string;
  key_elements: string[];
}

const examplePrompts = [
  'Watch github.com/trending every 5 minutes and tell me when new repositories appear',
  'Monitor news.ycombinator.com for new top stories every hour',
  'Check this university scholarship page daily and alert me if deadlines change: https://example.com/scholarships',
  'Watch a product pricing page weekly and notify me about any price changes',
];

export default function BuildWithKinPage() {
  const [prompt, setPrompt] = useState('');
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loadingCollectors, setLoadingCollectors] = useState(true);
  const [creating, setCreating] = useState(false);

  // Editable fields after build
  const [editUrl, setEditUrl] = useState('');
  const [editName, setEditName] = useState('');
  const [editFrequency, setEditFrequency] = useState<ScanFrequency>('daily');

  async function fetchCollectors() {
    try {
      const res = await fetch('/api/collectors');
      const data = await res.json();
      if (data.success) {
        setCollectors(data.collectors || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCollectors(false);
    }
  }

  useEffect(() => {
    fetchCollectors();
  }, []);

  async function handleBuild(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setBuilding(true);
    setBuildResult(null);
    
    try {
      const res = await fetch('/api/build-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setBuildResult(data.config);
        setEditUrl(data.config.url || '');
        setEditName(data.config.name || '');
        setEditFrequency(data.config.frequency || 'daily');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to build scraper. Please try again.');
    } finally {
      setBuilding(false);
    }
  }

  async function handleCreateCollector() {
    if (!buildResult) return;
    if (!editUrl) {
      alert('Please enter a website URL');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/collectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName || buildResult.name,
          website_url: editUrl,
          frequency: editFrequency,
          selector_config: {
            content_type: buildResult.content_type,
            selectors: buildResult.selectors,
            key_elements: buildResult.key_elements,
            noise_sensitivity: buildResult.noise_sensitivity,
          },
          built_with_kin: true,
          natural_language_prompt: prompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBuildResult(null);
        setPrompt('');
        fetchCollectors();
      } else {
        alert(data.error || 'Failed to create collector');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteCollector(id: string) {
    if (!confirm('Delete this collector?')) return;
    try {
      await fetch(`/api/collectors?id=${id}`, { method: 'DELETE' });
      fetchCollectors();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleCollector(id: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'paused' ? 'active' : 'paused';
      await fetch('/api/collectors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchCollectors();
    } catch (e) {
      console.error(e);
    }
  }

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
        title="Build with Kin" 
        subtitle="Type plain English. Kin builds the scraper for you."
        unreadSignals={0}
      />
      
      <div className="p-7 max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="eyebrow inline-flex items-center gap-1.5">
            <Sparkles size={12} /> New feature
          </div>
          <h1 className="section-title mt-2">Build with Kin</h1>
          <p className="section-sub max-w-xl">
            Describe what you want to monitor in simple words. Kin creates a dedicated collector 
            — separate for each website, separate for each user. Your data stays private.
          </p>
        </div>

        {/* Build interface */}
        <Card className="mb-8 overflow-hidden">
          <div className="p-6 border-b border-[rgba(0,0,0,0.06)] bg-gradient-to-br from-[rgba(45,95,138,0.03)] to-transparent">
            <form onSubmit={handleBuild}>
              <div className="flex items-start gap-4">
                <KinCharacter 
                  size={44} 
                  state={building ? 'building' : 'thinking'} 
                  animate={false} 
                  showShadow={false} 
                  className="flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <label className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-2">
                    What should Kin watch for you?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Watch github.com/trending every 5 minutes and tell me when new repositories appear on the list…"
                    className="w-full px-4 py-3 border border-[rgba(0,0,0,0.12)] rounded-[12px] text-[14px] font-sans text-[#1A1A1E] bg-white outline-none resize-none h-28 transition-all focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)]"
                    disabled={building}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-[11.5px] text-[#8A8D9A]">
                      Powered by Zen Mimo V2.5 AI
                    </div>
                    <Button type="submit" loading={building} disabled={!prompt.trim()}>
                      {building ? (
                        <>Building…</>
                      ) : (
                        <><Wrench size={15} /> Build Collector</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Example prompts */}
            <div className="mt-4 pl-16">
              <div className="text-[11px] font-semibold text-[#8A8D9A] uppercase tracking-wider mb-2">
                Try an example
              </div>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="text-left px-3 py-2 rounded-lg text-[12px] text-[#5A5D6B] bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(45,95,138,0.3)] hover:text-[#2D5F8A] transition-all max-w-[280px]"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Build result */}
          {buildResult && (
            <div className="p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-[#059669]" />
                <span className="text-[13px] font-semibold text-[#065F46]">
                  Kin built a configuration
                </span>
              </div>

              <div className="p-4 rounded-[12px] bg-[#FAFAF7] border border-[rgba(0,0,0,0.06)] mb-4">
                <p className="text-[13.5px] text-[#5A5D6B] italic">
                  "{buildResult.summary}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Website URL"
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
                <Input
                  label="Collector name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Select
                  label="Check frequency"
                  value={editFrequency}
                  onChange={(e) => setEditFrequency(e.target.value as ScanFrequency)}
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
                <div className="p-3 rounded-lg bg-white border border-[rgba(0,0,0,0.08)]">
                  <div className="text-[11px] font-semibold text-[#8A8D9A] uppercase tracking-wider mb-1">Content type</div>
                  <div className="text-[13.5px] font-medium text-[#1A1A1E] capitalize">{buildResult.content_type}</div>
                </div>
              </div>

              {buildResult.key_elements?.length > 0 && (
                <div className="mb-4">
                  <div className="text-[12px] font-semibold text-[#5A5D6B] mb-2">Kin will watch for:</div>
                  <div className="flex flex-wrap gap-2">
                    {buildResult.key_elements.map((el, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 rounded-lg text-[12px] bg-[rgba(45,95,138,0.06)] text-[#1E40AF] border border-[rgba(45,95,138,0.12)]"
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setBuildResult(null)}>
                  Discard
                </Button>
                <Button onClick={handleCreateCollector} loading={creating}>
                  <Plus size={15} /> Create & Activate
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Your collectors */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">Your Collectors</h2>
              <p className="text-[12.5px] text-[#8A8D9A] mt-1">
                Each collector is separate — one per website, private to your workspace.
              </p>
            </div>
          </div>

          {loadingCollectors ? (
            <div className="text-center py-12 text-[#8A8D9A] text-[14px]">Loading collectors...</div>
          ) : collectors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collectors.map(collector => (
                <Card key={collector.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0891B2, #0E7490)' }}
                      >
                        <Globe size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1A1A1E] truncate">{collector.name}</div>
                        <a 
                          href={collector.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[11.5px] text-[#2D5F8A] hover:underline inline-flex items-center gap-1 truncate max-w-[200px]"
                        >
                          {collector.website_url.replace(/^https?:\/\//, '').substring(0, 40)}
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                    <StatusBadge status={collector.status} />
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A] flex items-center gap-1.5">
                        <Clock size={12} /> Runs
                      </span>
                      <span className="font-medium text-[#1A1A1E]">{collector.run_count} times</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A]">Last run</span>
                      <span className="font-medium text-[#1A1A1E]">{formatDate(collector.last_run)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A]">Collector ID</span>
                      <span className="font-mono text-[11px] text-[#2D5F8A]">
                        {collector.brightdata_collector_id 
                          ? (collector.brightdata_collector_id.length > 15 
                              ? `${collector.brightdata_collector_id.substring(0, 12)}…` 
                              : collector.brightdata_collector_id)
                          : `${collector.id.substring(0, 12)}…`}
                      </span>
                    </div>
                  </div>

                  {collector.brightdata_collector_id ? (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px] font-semibold"
                      style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#1E40AF' }}>
                      <Sparkles size={11} /> Bright Data
                    </div>
                  ) : collector.built_with_kin ? (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px] font-semibold"
                      style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#92400E' }}>
                      <Sparkles size={11} /> Built with Kin
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-1 pt-3 border-t border-[rgba(0,0,0,0.06)]">
                    <button
                      onClick={() => handleToggleCollector(collector.id, collector.status)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] hover:text-[#1A1A1E] transition-colors"
                    >
                      {collector.status === 'paused' ? 'Activate' : 'Pause'}
                    </button>
                    <button
                      onClick={() => handleDeleteCollector(collector.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A8D9A] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="mb-4 inline-block">
                <KinCharacter size={56} state="idle" animate={false} showShadow={false} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#1A1A1E] mb-2">No collectors yet</h3>
              <p className="text-[13px] text-[#5A5D6B] max-w-sm mx-auto">
                Describe what you want to watch above, and Kin will build a dedicated collector for you.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
