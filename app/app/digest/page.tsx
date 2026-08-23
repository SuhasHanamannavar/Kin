'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import KinCharacter from '@/components/ui/KinCharacter';
import { CategoryPill, ImportanceBadge } from '@/components/ui/Badges';
import { 
  Newspaper, Mail, Calendar, Download, 
  CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import type { Signal } from '@/types';

export default function DigestPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function fetchSignals() {
    try {
      const res = await fetch('/api/signals');
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
  }, []);

  async function handleSendDigest() {
    setSending(true);
    try {
      const res = await fetch('/api/digest', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const thisWeekSignals = signals.filter(s => new Date(s.detected_at) >= weekAgo);
  const highSignals = thisWeekSignals.filter(s => s.importance === 'high');
  const mediumSignals = thisWeekSignals.filter(s => s.importance === 'med');
  const lowSignals = thisWeekSignals.filter(s => s.importance === 'low');

  const sitesCovered = new Set(thisWeekSignals.map(s => s.site)).size;

  return (
    <>
      <TopBar 
        title="Digest" 
        subtitle="Your weekly summary of meaningful website changes."
        unreadSignals={0}
        showSearch={false}
      />
      
      <div className="p-7 max-w-[780px] mx-auto">
        {/* Header card */}
        <Card className="mb-6 p-6 flex flex-col sm:flex-row items-center gap-6 animate-fade-up">
          <KinCharacter size={72} state="found" />
          <div className="flex-1 text-center sm:text-left">
            <div className="eyebrow flex justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={11} /> Weekly Digest
              </span>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#1A1A1E] mt-1 mb-1">
              {today}
            </h1>
            <p className="text-[13.5px] text-[#5A5D6B]">
              {thisWeekSignals.length === 0 
                ? 'No changes detected this week. Everything is quiet.'
                : `${thisWeekSignals.length} change${thisWeekSignals.length > 1 ? 's' : ''} across ${sitesCovered} site${sitesCovered > 1 ? 's' : ''}.`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSendDigest} loading={sending}>
              <Mail size={15} /> {sent ? 'Sent!' : 'Email to me'}
            </Button>
          </div>
        </Card>

        {/* Stats */}
        {thisWeekSignals.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="stat-card text-center">
              <div className="stat-num" style={{ color: '#DC2626' }}>{highSignals.length}</div>
              <div className="stat-label mt-2">High importance</div>
            </div>
            <div className="stat-card text-center">
              <div className="stat-num" style={{ color: '#D97706' }}>{mediumSignals.length}</div>
              <div className="stat-label mt-2">Medium</div>
            </div>
            <div className="stat-card text-center">
              <div className="stat-num" style={{ color: '#6B7280' }}>{lowSignals.length}</div>
              <div className="stat-label mt-2">Low</div>
            </div>
          </div>
        )}

        {/* Digest content */}
        <div className="space-y-6">
          {/* High importance */}
          {highSignals.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-[#DC2626]" />
                <h2 className="text-[15px] font-bold text-[#1A1A1E]">
                  Important updates
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}>
                  {highSignals.length}
                </span>
              </div>
              <div className="space-y-3">
                {highSignals.map(signal => (
                  <Card key={signal.id} className="p-4 border-l-[3px]" style={{ borderLeftColor: '#DC2626' }}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CategoryPill category={signal.category} label={signal.category_name} />
                      <ImportanceBadge level="high" />
                      <span className="ml-auto text-[11px] text-[#8A8D9A]">{signal.site}</span>
                    </div>
                    <div className="font-semibold text-[14px] text-[#1A1A1E] mb-1">{signal.title}</div>
                    <div className="text-[13px] text-[#5A5D6B] leading-relaxed">{signal.summary}</div>
                    {signal.why_it_matters && (
                      <div className="mt-2 text-[12.5px] font-medium" style={{ color: '#991B1B' }}>
                        → {signal.why_it_matters}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Medium importance */}
          {mediumSignals.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-[#D97706]" />
                <h2 className="text-[15px] font-bold text-[#1A1A1E]">
                  Notable changes
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(217,119,6,0.1)', color: '#D97706' }}>
                  {mediumSignals.length}
                </span>
              </div>
              <div className="space-y-2">
                {mediumSignals.map(signal => (
                  <Card key={signal.id} className="p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryPill category={signal.category} label={signal.category_name} />
                      <span className="text-[11px] text-[#8A8D9A] ml-auto">{signal.site}</span>
                    </div>
                    <div className="font-medium text-[13.5px] text-[#1A1A1E]">{signal.title}</div>
                    <div className="text-[12.5px] text-[#5A5D6B] mt-0.5">{signal.summary}</div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Low importance */}
          {lowSignals.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-[#6B7280]" />
                <h2 className="text-[15px] font-bold text-[#1A1A1E]">
                  Minor updates
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.06)] text-[#6B7280]">
                  {lowSignals.length}
                </span>
              </div>
              <Card className="p-4">
                <ul className="space-y-2">
                  {lowSignals.map(signal => (
                    <li key={signal.id} className="flex items-start gap-2 text-[13px]">
                      <span className="text-[#8A8D9A] mt-0.5">•</span>
                      <span className="text-[#5A5D6B]">
                        <span className="font-medium text-[#1A1A1E]">{signal.title}</span>
                        <span className="text-[#8A8D9A]"> — {signal.site}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {/* Empty state */}
          {thisWeekSignals.length === 0 && !loading && (
            <Card className="p-12 text-center animate-fade-up">
              <div className="mb-4 inline-block">
                <KinCharacter size={64} state="happy" animate={false} showShadow={false} />
              </div>
              <h3 className="text-[16px] font-semibold text-[#1A1A1E] mb-2">All quiet this week</h3>
              <p className="text-[13.5px] text-[#5A5D6B] max-w-sm mx-auto">
                Kin hasn't detected any meaningful changes on your watchlist. 
                Everything is stable and running smoothly.
              </p>
            </Card>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-8 p-4 rounded-xl text-center text-[12px] text-[#8A8D9A]"
          style={{ background: 'rgba(0,0,0,0.02)' }}>
          <Newspaper size={14} className="inline mr-1.5 -mt-0.5" />
          Weekly digests are sent automatically every Sunday morning. 
          Configure this in your settings.
        </div>
      </div>
    </>
  );
}
