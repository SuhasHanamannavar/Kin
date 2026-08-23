'use client';

import React, { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import KinCharacter from '@/components/ui/KinCharacter';
import { 
  Globe2, Play, Loader2, CheckCircle2, 
  Shield, Zap, Eye, Code, MousePointerClick
} from 'lucide-react';

export default function ScrapingBrowserPage() {
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    textPreview: string;
    links: number;
    images: number;
    wordCount: number;
    status: 'success' | 'error';
    error?: string;
  } | null>(null);

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setScraping(true);
    setResult(null);

    try {
      const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      const res = await fetch('/api/scrape-browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      
      if (data.success) {
        setResult({
          title: data.title || 'Page loaded',
          textPreview: data.textPreview || '',
          links: data.links || 0,
          images: data.images || 0,
          wordCount: data.wordCount || 0,
          status: 'success',
        });
      } else {
        setResult({
          title: 'Failed to load',
          textPreview: '',
          links: 0,
          images: 0,
          wordCount: 0,
          status: 'error',
          error: data.error || 'Could not reach the page',
        });
      }
    } catch (e) {
      setResult({
        title: 'Connection error',
        textPreview: '',
        links: 0,
        images: 0,
        wordCount: 0,
        status: 'error',
        error: 'Network error. Please try again.',
      });
    } finally {
      setScraping(false);
    }
  }

  return (
    <>
      <TopBar 
        title="AI Scraping Browser" 
        subtitle="A real browser guided by AI. Handles JavaScript, dynamic content, and blocks."
        unreadSignals={0}
      />
      
      <div className="p-7 max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="eyebrow inline-flex items-center gap-1.5">
            <Globe2 size={12} /> Browser automation
          </div>
          <h1 className="section-title mt-2">AI Scraping Browser</h1>
          <p className="section-sub max-w-xl">
            Spin up a real browser to render JavaScript, navigate pages, and extract content. 
            Kin handles the complexity so you get clean data.
          </p>
        </div>

        {/* Try it now */}
        <Card className="mb-8 overflow-hidden">
          <div className="p-6 border-b border-[rgba(0,0,0,0.06)]">
            <div className="text-[14px] font-semibold text-[#1A1A1E] mb-3">Try it now</div>
            <form onSubmit={handleScrape} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button type="submit" loading={scraping} className="h-[42px]">
                {scraping ? (
                  <><Loader2 size={16} className="animate-spin" /> Loading…</>
                ) : (
                  <><Play size={15} /> Fetch Page</>
                )}
              </Button>
            </form>
          </div>

          {/* Browser mock */}
          <div 
            className="border-b border-[rgba(0,0,0,0.06)]"
            style={{ background: '#FAFAF7' }}
          >
            <div className="flex items-center px-4 py-[10px] gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
              <div className="ml-3 flex-1 px-3 py-1.5 bg-white rounded-md text-[11.5px] text-[#5A5D6B] font-mono border border-[rgba(0,0,0,0.08)] truncate">
                {url || 'about:blank'}
              </div>
            </div>

            <div className="px-6 pb-6 min-h-[200px] flex items-center justify-center">
              {scraping ? (
                <div className="text-center">
                  <KinCharacter size={64} state="scanning" animate={false} showShadow={false} />
                  <div className="mt-3 text-[13px] text-[#0E7490] font-medium">
                    Kin is navigating and rendering the page…
                  </div>
                  <div className="mt-1 text-[11.5px] text-[#8A8D9A]">
                    Executing JavaScript · Waiting for content · Extracting data
                  </div>
                </div>
              ) : result ? (
                result.status === 'success' ? (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 size={16} className="text-[#059669]" />
                      <span className="text-[13px] font-semibold text-[#065F46]">Page loaded successfully</span>
                    </div>
                    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-4">
                      <div className="text-[14px] font-semibold text-[#1A1A1E] mb-2">{result.title}</div>
                      <div className="text-[12.5px] text-[#5A5D6B] leading-relaxed line-clamp-4">
                        {result.textPreview.substring(0, 400)}
                        {result.textPreview.length > 400 && '…'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="p-3 rounded-lg bg-white border border-[rgba(0,0,0,0.06)] text-center">
                        <div className="text-[18px] font-bold text-[#1A1A1E]">{result.links}</div>
                        <div className="text-[11px] text-[#8A8D9A] mt-0.5">Links found</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-[rgba(0,0,0,0.06)] text-center">
                        <div className="text-[18px] font-bold text-[#1A1A1E]">{result.images}</div>
                        <div className="text-[11px] text-[#8A8D9A] mt-0.5">Images</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-[rgba(0,0,0,0.06)] text-center">
                        <div className="text-[18px] font-bold text-[#1A1A1E]">{result.wordCount.toLocaleString()}</div>
                        <div className="text-[11px] text-[#8A8D9A] mt-0.5">Words</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <KinCharacter size={64} state="error" animate={false} showShadow={false} />
                    <div className="mt-3 text-[13px] font-semibold text-[#DC2626]">{result.title}</div>
                    <div className="mt-1 text-[11.5px] text-[#8A8D9A]">{result.error}</div>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <KinCharacter size={56} state="idle" animate={false} showShadow={false} />
                  <div className="mt-3 text-[13px] text-[#8A8D9A]">
                    Enter a URL above to see Kin's browser in action
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap size={20} />,
              color: '#D97706',
              title: 'JavaScript Rendering',
              desc: 'Full browser execution. SPAs, React, Vue — all render correctly.',
            },
            {
              icon: <MousePointerClick size={20} />,
              color: '#2D5F8A',
              title: 'Smart Navigation',
              desc: 'Clicks, scrolls, and waits for loads just like a real user.',
            },
            {
              icon: <Shield size={20} />,
              color: '#059669',
              title: 'Anti-Block Protection',
              desc: 'Fingerprint rotation, cookie handling, and CAPTCHA awareness.',
            },
            {
              icon: <Eye size={20} />,
              color: '#7C3AED',
              title: 'Visual Selectors',
              desc: 'Kin identifies what matters visually, not just by CSS selectors.',
            },
            {
              icon: <Code size={20} />,
              color: '#0891B2',
              title: 'Clean Output',
              desc: 'Structured data extracted and ready for analysis or monitoring.',
            },
            {
              icon: <Globe2 size={20} />,
              color: '#DC2626',
              title: 'Global Proxies',
              desc: 'Access geo-restricted content from anywhere in the world.',
            },
          ].map((feature, i) => (
            <Card key={i} className="p-5">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${feature.color}14`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <div className="text-[14px] font-semibold text-[#1A1A1E] mb-1.5">{feature.title}</div>
              <div className="text-[12.5px] text-[#5A5D6B] leading-relaxed">{feature.desc}</div>
            </Card>
          ))}
        </div>

        {/* How it integrates */}
        <Card className="mt-8 p-6">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(45, 95, 138, 0.1)', color: '#2D5F8A' }}
            >
              <KinCharacter size={32} animate={false} showShadow={false} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#1A1A1E] mb-1">
                Integrated with your watchlist
              </div>
              <p className="text-[13.5px] text-[#5A5D6B] leading-relaxed">
                When you add a URL to your watchlist, Kin automatically uses the AI Scraping Browser 
                for sites that need it. JavaScript-heavy pages, login walls, and dynamic content 
                are handled transparently — you just get the signals.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
