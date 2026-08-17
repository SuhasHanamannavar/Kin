import Link from 'next/link';
import KinCharacter from '@/components/ui/KinCharacter';
import Button from '@/components/ui/Button';
import { CategoryPill, ImportanceBadge } from '@/components/ui/Badges';
import { 
  Link2, Globe, RefreshCw, Sparkles, CheckCircle2,
  X, Wrench, Globe2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1E] font-sans">
      {/* ============================================================
           NAVIGATION
           ============================================================ */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[1100px] mx-auto px-8 py-4 flex items-center">
          <div className="flex items-center gap-[10px]">
            <KinCharacter size={28} animate={false} showShadow={false} />
            <span className="font-bold text-[17px] tracking-tight">Kin</span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <Link 
              href="#how" 
              className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E] transition-colors hidden sm:block"
            >
              How it works
            </Link>
            <Link 
              href="#build" 
              className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E] transition-colors hidden sm:block"
            >
              Build with Kin
            </Link>
            <Link 
              href="#signals" 
              className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E] transition-colors hidden sm:block"
            >
              Signals
            </Link>
            <Link 
              href="/auth/sign-in" 
              className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E] font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
           HERO
           ============================================================ */}
      <section className="max-w-[1100px] mx-auto px-8 pt-16 pb-20 text-center">
        <div className="eyebrow flex justify-center">AI-Powered Website Monitoring</div>
        
        <h1 
          className="font-bold tracking-tight leading-[1.05] mt-3 mb-4"
          style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
        >
          Add a URL.<br />
          <span className="text-[#5A5D6B] font-medium">Kin tells you when it matters.</span>
        </h1>
        
        <p 
          className="text-[#5A5D6B] max-w-[520px] mx-auto mb-8 leading-relaxed"
          style={{ fontSize: 'clamp(15px, 1.6vw, 17px)' }}
        >
          Kin quietly monitors any website, detects meaningful changes, 
          and sends you plain-English alerts. No more manual checking.
        </p>

        {/* Hero input */}
        <div 
          className="flex items-center bg-white border border-[rgba(0,0,0,0.12)] rounded-[14px] p-[6px] max-w-[520px] mx-auto"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <Link2 size={18} className="text-[#8A8D9A] ml-3 mr-2 flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Paste your first URL…"
            className="flex-1 border-none outline-none bg-transparent px-2 py-3 text-[15px] text-[#1A1A1E] placeholder:text-[#8A8D9A]"
          />
          <Link href="/auth/sign-up">
            <Button>Start Tracking</Button>
          </Link>
        </div>
        
        <p className="text-[12px] text-[#8A8D9A] mt-4">
          Set up in 60 seconds · No credit card required
        </p>

        {/* Kin character */}
        <div className="mt-14 inline-block relative">
          <div 
            className="absolute"
            style={{
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: 12,
              background: 'rgba(0,0,0,0.08)',
              borderRadius: '50%',
              filter: 'blur(6px)',
            }}
          />
          <KinCharacter size={180} state="found" />
        </div>
      </section>

      {/* ============================================================
           HOW IT WORKS
           ============================================================ */}
      <section id="how" className="bg-white border-t border-[rgba(0,0,0,0.06)] py-20 px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <div className="eyebrow flex justify-center">How Kin works</div>
            <h2 className="section-title">
              Set it once.<br />
              <span className="text-[#5A5D6B] font-medium">It runs itself.</span>
            </h2>
            <p className="section-sub mx-auto max-w-md">
              A quiet pipeline that turns noisy websites into clear, actionable signals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: <Link2 size={22} strokeWidth={2} />, color: '#2D5F8A', num: '1', title: 'Add URL', desc: 'Paste any website you want to monitor.' },
              { icon: <Globe size={22} strokeWidth={2} />, color: '#0891B2', num: '2', title: 'Discover', desc: 'Kin maps the site and finds what matters.' },
              { icon: <RefreshCw size={22} strokeWidth={2} />, color: '#7C3AED', num: '3', title: 'Scrape', desc: 'Automated checks on your schedule.' },
              { icon: <Sparkles size={22} strokeWidth={2} />, color: '#D97706', num: '4', title: 'Analyze', desc: 'Kin classifies changes by type and importance.' },
              { icon: <CheckCircle2 size={22} strokeWidth={2} />, color: '#059669', num: '5', title: 'Act', desc: 'Get clear signals. Know what to do next.' },
            ].map((step, i) => (
              <div 
                key={i}
                className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[22px] text-center animate-fade-up hover:border-[rgba(0,0,0,0.14)] hover:shadow-card-hover transition-all"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div 
                  className="w-11 h-11 rounded-[12px] flex items-center justify-center mx-auto mb-[14px]"
                  style={{ background: `${step.color}14`, color: step.color }}
                >
                  {step.icon}
                </div>
                <div className="text-[13px] font-bold text-[#1A1A1E] mb-1">
                  {step.num}. {step.title}
                </div>
                <div className="text-[12.5px] text-[#5A5D6B] leading-[1.5]">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           BUILD WITH KIN — NEW SECTION
           ============================================================ */}
      <section id="build" className="py-20 px-8 bg-[#FAFAF7] border-t border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow flex justify-center">
              <span className="inline-flex items-center gap-1.5">
                <Wrench size={12} /> New · Build with Kin
              </span>
            </div>
            <h2 className="section-title">
              Type plain English.<br />
              <span className="text-[#5A5D6B] font-medium">Kin builds the scraper.</span>
            </h2>
            <p className="section-sub mx-auto max-w-lg">
              Describe what you want to watch in simple words. Kin creates a dedicated collector 
              for each website, each user — fully separate and private.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Input side */}
            <div 
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden"
            >
              <div 
                className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]"
                style={{ background: '#FAFAF7' }}
              >
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FEBC2E' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#28C840' }} />
                <span className="ml-3 text-[12px] text-[#8A8D9A] font-medium">Tell Kin what to watch</span>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <KinCharacter size={36} animate={false} showShadow={false} />
                  <div className="flex-1">
                    <textarea
                      readOnly
                      value="Watch github.com/trending every 5 minutes and tell me when new repositories appear on the list. Also notify me about major layout changes."
                      className="w-full p-3 border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[13px] text-[#1A1A1E] bg-[#FAFAF7] resize-none h-24 font-sans"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" disabled>
                    <Sparkles size={14} /> Build Collector
                  </Button>
                </div>
              </div>
            </div>

            {/* Output side */}
            <div 
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden collector-active"
            >
              <div 
                className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]"
                style={{ background: '#FAFAF7' }}
              >
                <div className="w-2.5 h-2.5 rounded-full mr-2 animate-pulse" style={{ background: '#059669' }} />
                <span className="text-[12px] font-semibold text-[#1A1A1E]">Collector #GH-TR-001</span>
                <span className="ml-auto text-[10.5px] text-[#8A8D9A] font-mono">Active</span>
              </div>
              <div className="p-5 space-y-3 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#8A8D9A]">Website</span>
                  <span className="font-medium text-[#1A1A1E]">github.com/trending</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8D9A]">Frequency</span>
                  <span className="font-medium text-[#1A1A1E]">Every 5 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8D9A]">Watching for</span>
                  <span className="font-medium text-[#1A1A1E] text-right">New repos, layout changes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8D9A]">Collector ID</span>
                  <span className="font-mono text-[11.5px] text-[#2D5F8A]">col_gh_tr_001</span>
                </div>
                <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
                  <div className="text-[12px] text-[#059669] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Separate & private to your workspace
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           AI SCRAPING BROWSER — NEW FEATURE
           ============================================================ */}
      <section className="bg-white border-t border-[rgba(0,0,0,0.06)] py-20 px-8">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
          <div>
            <div className="eyebrow">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 size={12} /> New · AI Scraping Browser
              </span>
            </div>
            <h2 className="section-title">
              A real browser.<br />
              <span className="text-[#5A5D6B] font-medium">Guided by AI.</span>
            </h2>
            <p className="text-[16px] text-[#5A5D6B] leading-[1.7] mt-4">
              Kin spins up a real browser to handle JavaScript, login walls, 
              and dynamic content. It navigates, waits for loads, and extracts 
              exactly what you care about — all automatically.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                'Renders JavaScript and SPAs correctly',
                'Handles cookies, modals, and lazy loads',
                'Clicks, scrolls, and navigates like a human',
                'Rotates fingerprints to avoid blocks',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-[10px] text-[14px] text-[#5A5D6B]">
                  <span 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}
                  >
                    <CheckCircle2 size={12} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Browser mock */}
          <div 
            className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden shadow-soft"
          >
            <div 
              className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]"
              style={{ background: '#FAFAF7' }}
            >
              <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FF5F57' }} />
              <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FEBC2E' }} />
              <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#28C840' }} />
              <div className="ml-3 flex-1 px-3 py-1 bg-white rounded-md text-[11px] text-[#5A5D6B] font-mono border border-[rgba(0,0,0,0.08)] truncate">
                https://github.com/trending
              </div>
            </div>
            <div className="p-6 relative" style={{ minHeight: 200 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(45,95,138,0.04)] to-[rgba(8,145,178,0.02)]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <KinCharacter size={28} state="scanning" animate={false} showShadow={false} />
                  <span className="text-[12px] font-semibold text-[#0E7490]">Kin is navigating…</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-[rgba(0,0,0,0.06)] rounded w-full animate-pulse" />
                  <div className="h-3 bg-[rgba(0,0,0,0.06)] rounded w-5/6 animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="h-3 bg-[rgba(0,0,0,0.06)] rounded w-4/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="h-3 bg-[rgba(0,0,0,0.06)] rounded w-3/4 animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           PROBLEM SECTION
           ============================================================ */}
      <section className="py-20 px-8 bg-[#FAFAF7] border-t border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
          <div>
            <div className="eyebrow">The problem</div>
            <h2 className="section-title">
              The web changes constantly.<br />
              <span className="text-[#5A5D6B] font-medium">You can't check it all.</span>
            </h2>
            <p className="text-[16px] text-[#5A5D6B] leading-[1.7] mt-4">
              Scholarship deadlines pass. Pricing changes silently. New features launch unnoticed. 
              Important updates hide in pages you don't have time to visit every day.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                'Manual checking is tedious and unreliable',
                'Raw diffs are technical and overwhelming',
                'You miss what matters in the noise',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-[10px] text-[14px] text-[#5A5D6B]">
                  <span 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}
                  >
                    <X size={12} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Code block */}
          <div 
            className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-7 font-mono text-[12.5px] leading-[1.7]"
          >
            <div className="text-[#8A8D9A] mb-3">// Before Kin</div>
            <div className="text-[#1A1A1E]">
              <span style={{ color: '#7C3AED' }}>const</span>{' '}
              <span style={{ color: '#2D5F8A' }}>scholarshipPage</span> ={' '}
              <span style={{ color: '#92400E' }}>"https://univ.edu/scholarships"</span>;
            </div>
            <div className="text-[#1A1A1E] mt-1">
              <span style={{ color: '#7C3AED' }}>let</span> missedDeadline ={' '}
              <span style={{ color: '#059669' }}>true</span>;{' '}
              <span style={{ color: '#8A8D9A' }}>// 😔</span>
            </div>
            
            <div 
              className="border-t border-dashed border-[rgba(0,0,0,0.1)] my-4 pt-4 text-[#8A8D9A]"
            >
              // 47 lines of raw HTML diff later…
            </div>
            
            <div className="text-[#8A8D9A] mt-1">
              <span 
                style={{ background: '#FEE2E2', color: '#991B1B', padding: '1px 4px', borderRadius: 3 }}
              >
                - deadline: "March 1"
              </span>
            </div>
            <div className="text-[#8A8D9A]">
              <span 
                style={{ background: '#D1FAE5', color: '#065F46', padding: '1px 4px', borderRadius: 3 }}
              >
                + deadline: "February 15"
              </span>
            </div>
            <div className="text-[#8A8D9A] mt-2">/* What changed? Is it important? */</div>
            <div className="text-[#8A8D9A]">/* You still don't really know. */</div>
          </div>
        </div>
      </section>

      {/* ============================================================
           INTELLIGENCE DEMO — Noise → Signal
           ============================================================ */}
      <section id="signals" className="bg-white border-t border-[rgba(0,0,0,0.06)] py-20 px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow flex justify-center">From noise to intelligence</div>
            <h2 className="section-title">
              Kin doesn't dump data.<br />
              <span className="text-[#5A5D6B] font-medium">It explains what matters.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Raw HTML */}
            <div 
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden"
            >
              <div 
                className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]"
                style={{ background: '#FAFAF7' }}
              >
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FEBC2E' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#28C840' }} />
                <span className="ml-3 text-[12px] text-[#8A8D9A] font-mono">raw_scrape.html</span>
              </div>
              <div className="p-[18px] font-mono text-[11.5px] leading-[1.8] text-[#5A5D6B] max-h-[280px] overflow-hidden">
                <div>{`<`}<span style={{ color: '#9D174D' }}>div</span>{` `}<span style={{ color: '#0E7490' }}>class</span>{`=`}<span style={{ color: '#92400E' }}>"scholarship"</span>{`>`}</div>
                <div className="pl-4">{`<`}<span style={{ color: '#9D174D' }}>h2</span>{`>`}Spring 2026 Awards{`<`}<span style={{ color: '#9D174D' }}>/h2</span>{`>`}</div>
                <div className="pl-4">
                  {`<`}<span style={{ color: '#9D174D' }}>p</span>{`>`}Application{' '}
                  <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '0 3px', borderRadius: 2 }}>March 1</span>
                  {`<`}<span style={{ color: '#9D174D' }}>/p</span>{`>`}
                </div>
                <div className="pl-4 opacity-35">{`<`}<span style={{ color: '#9D174D' }}>p</span>{`>`}Eligibility:…</div>
                <div className="pl-4 opacity-25">{`<`}<span style={{ color: '#9D174D' }}>div</span>{` `}<span style={{ color: '#0E7490' }}>class</span>{`=`}<span style={{ color: '#92400E' }}>"footer"</span>{`>`}</div>
                <div className="pl-6 opacity-15">© 2026 University</div>
                <div style={{ color: '#065F46' }}>+ &nbsp;{`<`}<span style={{ color: '#9D174D' }}>p</span>{`>`}New: AI Research Fellowship{`<`}<span style={{ color: '#9D174D' }}>/p</span>{`>`}</div>
                <div style={{ color: '#065F46' }}>+ &nbsp;{`<`}<span style={{ color: '#9D174D' }}>p</span>{`>`}Amount: $15,000{`<`}<span style={{ color: '#9D174D' }}>/p</span>{`>`}</div>
                <div style={{ color: '#DC2626' }}>- &nbsp;deadline: "March 1"</div>
                <div style={{ color: '#065F46' }}>+ &nbsp;deadline: "Feb 15"</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-center hidden lg:block">
              <div 
                className="w-12 h-12 rounded-full bg-[#1A1A1E] text-white flex items-center justify-center mx-auto mb-2"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="text-[11px] text-[#8A8D9A] font-semibold tracking-[0.05em]">
                KIN<br />ANALYZES
              </div>
            </div>

            {/* Signal card */}
            <div 
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] overflow-hidden border-l-[3px] border-l-[#DC2626]"
            >
              <div className="p-[18px]">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <CategoryPill category="deadline" label="Deadline Change" />
                  <ImportanceBadge level="high" label="HIGH" />
                  <span className="ml-auto text-[11px] text-[#8A8D9A]">Detected just now</span>
                </div>
                <div className="font-bold text-[15px] text-[#1A1A1E] mb-[6px]">
                  Deadline moved up by 14 days
                </div>
                <div className="text-[13.5px] text-[#5A5D6B] leading-[1.6] mb-3">
                  The application deadline for Spring 2026 scholarships has changed from{' '}
                  <b>March 1</b> to <b>February 15</b>.
                </div>
                <div 
                  className="p-[10px_12px] rounded-lg"
                  style={{ 
                    background: 'rgba(220,38,38,0.06)', 
                    border: '1px solid rgba(220,38,38,0.12)' 
                  }}
                >
                  <div 
                    className="text-[11px] font-bold uppercase tracking-[0.05em] mb-[3px]"
                    style={{ color: '#991B1B' }}
                  >
                    Why it matters
                  </div>
                  <div 
                    className="text-[12.5px] leading-[1.5]"
                    style={{ color: '#7F1D1D' }}
                  >
                    You have two weeks less than expected. Submit your application soon to avoid missing out.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           CTA
           ============================================================ */}
      <section className="py-20 px-8 bg-[#FAFAF7] border-t border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="mb-6 inline-block relative">
            <KinCharacter size={100} state="happy" />
          </div>
          <h2 className="section-title mb-3">
            Stop checking. <span className="text-[#5A5D6B] font-medium">Start knowing.</span>
          </h2>
          <p className="section-sub mx-auto mb-8 max-w-md">
            Join others who let Kin watch the web for them.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg">Get started with Kin</Button>
          </Link>
          <p className="text-[12px] text-[#8A8D9A] mt-4">
            Free to start · Powered by Zen Mimo V2.5 AI
          </p>
        </div>
      </section>

      {/* ============================================================
           FOOTER
           ============================================================ */}
      <footer className="bg-white border-t border-[rgba(0,0,0,0.06)] py-8 px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-[10px]">
            <KinCharacter size={22} animate={false} showShadow={false} />
            <span className="font-semibold text-[14px]">Kin</span>
            <span className="text-[12px] text-[#8A8D9A]">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-[12.5px] text-[#5A5D6B]">
            <Link href="#" className="hover:text-[#1A1A1E] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#1A1A1E] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#1A1A1E] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
