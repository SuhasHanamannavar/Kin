'use client';

import React, { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Badges';
import type { ScanFrequency, UserSettings } from '@/types';

export default function SettingsPage() {
  const { signOut } = useClerk();
  const { user } = useUser();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [onlyHighImportance, setOnlyHighImportance] = useState(false);
  const [scanFrequency, setScanFrequency] = useState<ScanFrequency>('daily');
  const [noiseSensitivity, setNoiseSensitivity] = useState('balanced');
  const [aiTone, setAiTone] = useState('simple');
  const [includeRawEvidence, setIncludeRawEvidence] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setEmailAlerts(s.email_alerts !== false);
        setWeeklyDigest(s.weekly_digest !== false);
        setOnlyHighImportance(!!s.only_high_importance);
        setScanFrequency(s.scan_frequency || 'daily');
        setNoiseSensitivity(s.noise_sensitivity || 'balanced');
        setAiTone(s.ai_tone || 'simple');
        setIncludeRawEvidence(s.include_raw_evidence !== false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function handleSaveSettings() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_alerts: emailAlerts,
          weekly_digest: weeklyDigest,
          only_high_importance: onlyHighImportance,
          scan_frequency: scanFrequency,
          noise_sensitivity: noiseSensitivity,
          ai_tone: aiTone,
          include_raw_evidence: includeRawEvidence,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const initials = user?.emailAddresses?.[0]?.emailAddress
    ? user.emailAddresses[0].emailAddress.split('@')[0].substring(0, 2).toUpperCase()
    : 'AK';

  const displayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Guest User';

  const displayEmail = user?.emailAddresses?.[0]?.emailAddress || 'guest@workspace.local';

  return (
    <>
      <TopBar 
        title="Settings" 
        subtitle="Configure how Kin monitors, analyzes, and notifies you."
        unreadSignals={0}
      />
      
      <div className="p-7 max-w-[680px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="eyebrow">Preferences</div>
            <h1 className="section-title">Settings</h1>
            <p className="section-sub">
              Customize change detection, alerting, and how Kin summarizes updates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-[12.5px] text-[#059669] font-semibold">✓ Saved</span>
            )}
            <Button onClick={handleSaveSettings} loading={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Notifications */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Notifications</div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Email Alerts</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Get an email when Kin detects a meaningful change
                  </div>
                </div>
                <Toggle checked={emailAlerts} onChange={setEmailAlerts} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Weekly Digest</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Sunday morning summary of all signals from the week
                  </div>
                </div>
                <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Only High Importance</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Don't notify me about low or medium importance signals
                  </div>
                </div>
                <Toggle checked={onlyHighImportance} onChange={setOnlyHighImportance} />
              </div>
            </div>
          </Card>

          {/* Monitoring */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Monitoring</div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold">Default Scan Frequency</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    How often Kin checks your watchlist by default
                  </div>
                </div>
                <Select
                  value={scanFrequency}
                  onChange={(e) => setScanFrequency(e.target.value as ScanFrequency)}
                  options={[
                    { value: '1min', label: 'Every minute' },
                    { value: '5min', label: 'Every 5 minutes' },
                    { value: '15min', label: 'Every 15 minutes' },
                    { value: 'hourly', label: 'Every hour' },
                    { value: '12h', label: 'Every 12 hours' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                  ]}
                  className="w-[180px]"
                />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold">Noise Sensitivity</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Balanced = standard; Conservative = ignore tiny updates; Aggressive = catch minor changes
                  </div>
                </div>
                <Select
                  value={noiseSensitivity}
                  onChange={(e) => setNoiseSensitivity(e.target.value)}
                  options={[
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'conservative', label: 'Conservative' },
                    { value: 'aggressive', label: 'Aggressive' },
                  ]}
                  className="w-[180px]"
                />
              </div>
            </div>
          </Card>

          {/* Kin AI */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Kin AI</div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold">Summary Style</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    How Kin phrases its explanations
                  </div>
                </div>
                <Select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  options={[
                    { value: 'simple', label: 'Simple & clear' },
                    { value: 'detailed', label: 'Detailed & thorough' },
                    { value: 'executive', label: 'Executive brief' },
                  ]}
                  className="w-[180px]"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Include Change Details</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Show specific text comparisons in signal details
                  </div>
                </div>
                <Toggle checked={includeRawEvidence} onChange={setIncludeRawEvidence} />
              </div>

              <div className="p-3 rounded-lg bg-[rgba(45,95,138,0.04)] border border-[rgba(45,95,138,0.1)]">
                <div className="text-[12px] font-semibold text-[#1E40AF] mb-1">AI Model</div>
                <div className="text-[12.5px] text-[#1E3A5F] font-mono">
                  Zen Mimo V2.5 (free tier)
                </div>
              </div>
            </div>
          </Card>

          {/* Account */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Account</div>
            
            <div className="flex items-center gap-[14px] mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[17px]"
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
              >
                {initials}
              </div>
              <div>
                <div className="font-semibold">{displayName}</div>
                <div className="text-[12.5px] text-[#8A8D9A]">{displayEmail}</div>
              </div>
            </div>
            
            <div className="flex gap-[10px] flex-wrap">
              <Button variant="danger" onClick={() => signOut()}>Sign Out</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
