'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import KinCharacter from '@/components/ui/KinCharacter';
import Button from '@/components/ui/Button';
import { CategoryPill, ImportanceBadge } from '@/components/ui/Badges';
import {
  Link2, Globe, RefreshCw, Sparkles, CheckCircle2,
  X, Wrench, Globe2, ArrowRight, ChevronDown,
  Eye, Zap, MessageSquare, Calendar, Shield, Radio
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// HACKATHON SUBTITLES for Spider-Man video
// ============================================================
const hackathonSubtitles = [
  { start: 0, end: 3, text: "Swinging into action..." },
  { start: 3, end: 7, text: "With great webs comes great awareness." },
  { start: 7, end: 11, text: "The pressure was intense..." },
  { start: 11, end: 15, text: "...but the vision was clear." },
  { start: 15, end: 19, text: "Tame the chaos of the web." },
  { start: 19, end: 23, text: "Turn noise into signal." },
  { start: 23, end: 28, text: "This is Kin. Your friendly neighborhood web watcher." },
];

export default function CinematicLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ============================================================
      // HERO ANIMATIONS
      // ============================================================
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        }
      });

      heroTl
        .to('.hero-title', { y: -150, opacity: 0.3, scale: 0.95 }, 0)
        .to('.hero-subtitle', { y: -100, opacity: 0 }, 0)
        .to('.hero-cta', { y: -80, opacity: 0 }, 0.1)
        .to('.hero-kin', { scale: 1.3, y: 50, rotateY: 10 }, 0)
        .to('.hero-noise', { opacity: 0.8, scale: 1.2 }, 0);

      // Hero entrance animation
      gsap.from('.hero-title .char', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.03,
        ease: 'power4.out',
        delay: 0.2
      });

      gsap.from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.8
      });

      gsap.from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 1.1
      });

      gsap.from('.hero-kin', {
        scale: 0,
        opacity: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.5
      });

      // ============================================================
      // PROBLEM SECTION - CHAOS VISUALIZATION
      // ============================================================
      gsap.utils.toArray<HTMLElement>('.chaos-item').forEach((item, i) => {
        gsap.from(item, {
          x: () => (i % 2 === 0 ? -200 : 200),
          y: () => Math.random() * 100 - 50,
          opacity: 0,
          rotation: () => Math.random() * 30 - 15,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.problem-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        });
      });

      // Floating chaos animation
      gsap.utils.toArray<HTMLElement>('.chaos-item').forEach((item, i) => {
        gsap.to(item, {
          y: `+=${Math.random() * 40 - 20}`,
          x: `+=${Math.random() * 30 - 15}`,
          rotation: `+=${Math.random() * 10 - 5}`,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // ============================================================
      // SOLUTION TRANSITION
      // ============================================================
      const solutionTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.solution-section',
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1
        }
      });

      solutionTl
        .to('.chaos-overlay', { opacity: 0, scale: 1.5, duration: 2 }, 0)
        .from('.solution-kin', { scale: 0, rotation: -180, duration: 1.5 }, 0.3)
        .from('.solution-title', { x: -100, opacity: 0, duration: 1 }, 0.5)
        .from('.solution-desc', { x: -80, opacity: 0, duration: 1 }, 0.7);

      // ============================================================
      // HOW IT WORKS - STAGGERED CARDS
      // ============================================================
      gsap.utils.toArray<HTMLElement>('.step-card').forEach((card, i) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          delay: i * 0.1
        });
      });

      // ============================================================
      // PRODUCT REVEAL - SCROLL ZOOM
      // ============================================================
      const productTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.product-reveal-section',
          start: 'top top',
          end: '+=200%',
          scrub: 1,
          pin: true
        }
      });

      productTl
        .from('.product-ui-wrapper', { scale: 0.3, opacity: 0, rotationX: 20 }, 0)
        .to('.product-ui-wrapper', { scale: 1, opacity: 1, rotationX: 0 }, 0.3)
        .to('.product-ui-overlay-1', { opacity: 1, scale: 1 }, 0.6)
        .to('.product-ui-overlay-2', { opacity: 1, scale: 1 }, 0.9)
        .to('.product-ui-highlight', { opacity: 1, scale: 1.1 }, 1.2);

      // ============================================================
      // BUILD WITH KIN - INPUT TO OUTPUT TRANSITION
      // ============================================================
      const buildTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.build-section',
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: 1
        }
      });

      buildTl
        .from('.build-input', { x: -50, opacity: 0 }, 0)
        .to('.build-arrow', { scaleX: 1, opacity: 1 }, 0.3)
        .from('.build-output', { x: 50, opacity: 0 }, 0.5);

      // ============================================================
      // SIGNALS - NOISE TO SIGNAL
      // ============================================================
      gsap.from('.noise-panel', {
        x: -100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: '.signals-section',
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      });

      gsap.from('.signal-panel', {
        x: 100,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
          trigger: '.signals-section',
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      });

      // ============================================================
      // BROWSER SECTION
      // ============================================================
      gsap.from('.browser-mock', {
        scale: 0.8,
        opacity: 0,
        rotationY: -15,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.browser-section',
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      });

      // ============================================================
      // FEATURE GRID
      // ============================================================
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, i) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          delay: i * 0.08
        });
      });

      // ============================================================
      // CTA SECTION
      // ============================================================
      gsap.from('.cta-kin', {
        scale: 0.5,
        opacity: 0,
        rotation: 20,
        duration: 1,
        ease: 'elastic.out(1, 0.6)',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      });

      gsap.from('.cta-title', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      });

      // ============================================================
      // NAV SCROLL EFFECT - HIDE WHEN SCROLLING DOWN
      // ============================================================
      let lastScroll = 0;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const nav = document.querySelector('.main-nav');
          if (nav) {
            const currentScroll = self.scroll();
            if (currentScroll > lastScroll && currentScroll > 80) {
              // Scrolling down - hide nav
              nav.classList.add('nav-hidden');
              nav.classList.remove('nav-scrolled');
            } else {
              // Scrolling up or at top - show nav
              nav.classList.remove('nav-hidden');
              if (currentScroll > 50) {
                nav.classList.add('nav-scrolled');
              } else {
                nav.classList.remove('nav-scrolled');
              }
            }
            lastScroll = currentScroll;
          }
        }
      });

      // ============================================================
      // PARALLAX BACKGROUND ELEMENTS
      // ============================================================
      gsap.utils.toArray<HTMLElement>('.parallax-bg').forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0.5');
        gsap.to(el, {
          yPercent: -30 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ============================================================
  // VIDEO SUBTITLE HANDLER
  // ============================================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const activeIndex = hackathonSubtitles.findIndex(
        sub => currentTime >= sub.start && currentTime < sub.end
      );
      if (activeIndex !== -1 && activeIndex !== currentSubtitle) {
        setCurrentSubtitle(activeIndex);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentSubtitle]);

  // Split title into characters for animation
  const splitTitle = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="char inline-block" style={{ transformOrigin: 'bottom' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div ref={containerRef} className="relative overflow-x-hidden">
      {/* ============================================================
           NAVIGATION
           ============================================================ */}
      <nav className="main-nav fixed top-0 left-0 right-0 z-50 transition-all duration-500">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center">
          <div className="flex items-center gap-[10px]">
            <KinCharacter size={28} animate={false} showShadow={false} />
            <span className="font-bold text-[17px] tracking-tight text-[#1A1A1E]">Kin</span>
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
              href="#story" 
              className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E] transition-colors hidden sm:block"
            >
              Our Story
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
           HERO SECTION
           ============================================================ */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-24 pb-32 overflow-hidden"
        style={{ background: '#FAFAF7' }}
      >
        {/* Background noise/grid */}
        <div className="hero-noise absolute inset-0 opacity-0 pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Floating parallax elements */}
        <div className="parallax-bg absolute top-32 left-10 text-[#2D5F8A]/10" data-speed="0.3">
          <Globe size={120} strokeWidth={1} />
        </div>
        <div className="parallax-bg absolute bottom-40 right-16 text-[#0891B2]/10" data-speed="0.6">
          <RefreshCw size={80} strokeWidth={1} />
        </div>
        <div className="parallax-bg absolute top-1/2 left-1/4 text-[#7C3AED]/8" data-speed="0.4">
          <Sparkles size={60} strokeWidth={1} />
        </div>

        <div className="relative z-10 text-center max-w-[1000px] mx-auto px-6">
          {/* Spider web strings decoration */}
          <div className="absolute left-0 top-1/4 w-[120px] h-[200px] pointer-events-none hidden lg:block opacity-40">
            <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M120 0 Q60 50 10 100 Q60 120 120 200" stroke="#2D5F8A" strokeWidth="1.5" fill="none"/>
              <path d="M120 20 Q55 60 15 100 Q55 130 120 180" stroke="#2D5F8A" strokeWidth="1" fill="none" opacity="0.6"/>
              <path d="M120 40 Q50 70 20 100 Q50 140 120 160" stroke="#2D5F8A" strokeWidth="0.8" fill="none" opacity="0.4"/>
              <line x1="10" y1="100" x2="120" y2="100" stroke="#2D5F8A" strokeWidth="0.8" opacity="0.5"/>
              <line x1="30" y1="70" x2="100" y2="130" stroke="#2D5F8A" strokeWidth="0.6" opacity="0.3"/>
            </svg>
          </div>
          <div className="absolute right-0 top-1/4 w-[120px] h-[200px] pointer-events-none hidden lg:block opacity-40">
            <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0 Q60 50 110 100 Q60 120 0 200" stroke="#2D5F8A" strokeWidth="1.5" fill="none"/>
              <path d="M0 20 Q65 60 105 100 Q65 130 0 180" stroke="#2D5F8A" strokeWidth="1" fill="none" opacity="0.6"/>
              <path d="M0 40 Q70 70 100 100 Q70 140 0 160" stroke="#2D5F8A" strokeWidth="0.8" fill="none" opacity="0.4"/>
              <line x1="10" y1="100" x2="110" y2="100" stroke="#2D5F8A" strokeWidth="0.8" opacity="0.5"/>
              <line x1="20" y1="130" x2="90" y2="70" stroke="#2D5F8A" strokeWidth="0.6" opacity="0.3"/>
            </svg>
          </div>
          
          <h1 className="hero-title font-bold tracking-tight leading-[0.95] mb-8 relative"
            style={{ fontSize: 'clamp(48px, 8vw, 100px)', color: '#1A1A1E' }}>
            <div>{splitTitle('With great webs,')}</div>
            <div style={{ color: '#2D5F8A' }}>{splitTitle('comes great')}</div>
            <div>{splitTitle('awareness.')}</div>
          </h1>
          
          <p className="hero-subtitle text-[#5A5D6B] max-w-[560px] mx-auto mb-10 leading-relaxed"
            style={{ fontSize: 'clamp(16px, 1.8vw, 20px)' }}>
            Your friendly neighborhood web watcher. Kin monitors any site, 
            catches every change, and only alerts you when it matters.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth/sign-up">
              <Button size="lg">
                Start tracking free
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="#how" className="flex items-center gap-2 text-[14px] text-[#5A5D6B] hover:text-[#1A1A1E] transition-colors">
              See how it works
              <ChevronDown size={16} />
            </Link>
          </div>

          {/* Hero Kin character */}
          <div className="hero-kin relative inline-block">
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(45,95,138,0.15) 0%, transparent 70%)',
                transform: 'scale(2)',
                filter: 'blur(20px)'
              }}
            />
            <KinCharacter size={200} state="found" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#8A8D9A]">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-[#8A8D9A]/40 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-[#8A8D9A]/60" />
          </div>
        </div>
      </section>

      {/* ============================================================
           PROBLEM SECTION - CHAOS
           ============================================================ */}
      <section className="problem-section relative py-32 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FAFAF7 0%, #F0EDE6 100%)' }}>
        
        {/* Chaos items - positioned at edges to avoid text overlap */}
        <div className="chaos-container absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { icon: <Link2 size={24} />, label: 'scholarship.edu/apply', color: '#DC2626', top: '10%', left: '3%' },
            { icon: <Globe size={20} />, label: 'github.com/trending', color: '#7C3AED', top: '20%', right: '5%' },
            { icon: <RefreshCw size={22} />, label: 'pricing-updated', color: '#D97706', top: '70%', left: '2%' },
            { icon: <Eye size={18} />, label: 'new-feature-spotted', color: '#0891B2', top: '5%', right: '20%' },
            { icon: <Zap size={20} />, label: 'deadline-changed', color: '#DC2626', top: '75%', right: '3%' },
            { icon: <Radio size={16} />, label: 'signal-lost-in-noise', color: '#5A5D6B', top: '45%', left: '1%' },
            { icon: <MessageSquare size={22} />, label: '404-error-detected', color: '#DC2626', top: '35%', right: '1%' },
            { icon: <Calendar size={18} />, label: 'event-postponed', color: '#D97706', top: '85%', left: '15%' },
          ].map((item, i) => (
            <div
              key={i}
              className="chaos-item absolute flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-lg"
              style={{
                top: item.top,
                left: item.left,
                right: item.right,
                border: `1px solid ${item.color}20`,
                color: item.color
              }}
            >
              {item.icon}
              <span className="text-[11px] font-mono whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <div className="eyebrow flex justify-center mb-4">The Problem</div>
          <h2 className="font-bold tracking-tight mb-6"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#1A1A1E' }}>
            The web changes<br />
            <span style={{ color: '#DC2626' }}>constantly.</span>
          </h2>
          <p className="text-[#5A5D6B] max-w-[500px] mx-auto leading-relaxed"
            style={{ fontSize: 'clamp(15px, 1.6vw, 18px)' }}>
            Scholarship deadlines pass. Pricing changes silently. 
            New features launch unnoticed. You can't check it all manually.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[600px] mx-auto">
            {[
              { icon: <X size={16} />, text: 'Manual checking is tedious' },
              { icon: <X size={16} />, text: 'Raw diffs are overwhelming' },
              { icon: <X size={16} />, text: 'You miss what matters' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px] text-[#DC2626] justify-center">
                <span className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(220,38,38,0.1)' }}>
                  {item.icon}
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           SOLUTION TRANSITION
           ============================================================ */}
      <section className="solution-section relative py-24 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #F0EDE6 0%, #FAFAF7 100%)' }}>
        
        <div className="chaos-overlay absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(240,237,230,0.9) 60%)'
          }}
        />

        <div className="max-w-[900px] mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 items-center relative z-10">
          <div className="solution-kin flex justify-center">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 70%)',
                  transform: 'scale(2.5)',
                  filter: 'blur(30px)'
                }}
              />
              <KinCharacter size={180} state="happy" />
            </div>
          </div>
          <div>
            <div className="eyebrow mb-4">The Solution</div>
            <h2 className="solution-title font-bold tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: '#1A1A1E' }}>
              Kin turns chaos<br />
              <span style={{ color: '#059669' }}>into clarity.</span>
            </h2>
            <p className="solution-desc text-[#5A5D6B] leading-relaxed max-w-[480px]"
              style={{ fontSize: 'clamp(15px, 1.6vw, 18px)' }}>
              Instead of flooding you with raw HTML differences, Kin uses language models 
              to translate changes into plain English. You only hear about what matters.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
           HOW IT WORKS
           ============================================================ */}
      <section id="how" className="relative py-32 px-6" style={{ background: '#FAFAF7' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="eyebrow flex justify-center">How Kin works</div>
            <h2 className="font-bold tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#1A1A1E' }}>
              Set it once.<br />
              <span className="text-[#5A5D6B] font-medium">It runs itself.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: <Link2 size={24} strokeWidth={2} />, color: '#2D5F8A', num: '01', title: 'Add URL', desc: 'Paste any website you want to monitor.' },
              { icon: <Globe size={24} strokeWidth={2} />, color: '#0891B2', num: '02', title: 'Discover', desc: 'Kin maps the site and finds what matters.' },
              { icon: <RefreshCw size={24} strokeWidth={2} />, color: '#7C3AED', num: '03', title: 'Scrape', desc: 'Automated checks on your schedule.' },
              { icon: <Sparkles size={24} strokeWidth={2} />, color: '#D97706', num: '04', title: 'Analyze', desc: 'Kin classifies changes by importance.' },
              { icon: <CheckCircle2 size={24} strokeWidth={2} />, color: '#059669', num: '05', title: 'Act', desc: 'Get clear signals. Know what to do.' },
            ].map((step, i) => (
              <div 
                key={i}
                className="step-card bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] p-6 relative overflow-hidden group hover:shadow-card-hover transition-all duration-300"
              >
                <div 
                  className="absolute top-0 right-0 text-[80px] font-bold leading-none opacity-[0.04] pointer-events-none"
                  style={{ color: step.color }}
                >
                  {step.num}
                </div>
                <div 
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-4"
                  style={{ background: `${step.color}14`, color: step.color }}
                >
                  {step.icon}
                </div>
                <div className="text-[14px] font-bold text-[#1A1A1E] mb-2">
                  {step.title}
                </div>
                <div className="text-[13px] text-[#5A5D6B] leading-[1.5]">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           PRODUCT REVEAL - PINNED ZOOM
           ============================================================ */}
      <section className="product-reveal-section relative h-[300vh]" style={{ background: '#1A1A1E' }}>
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {/* Background glow */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(45,95,138,0.3) 0%, transparent 60%)'
            }}
          />
          
          <div className="product-ui-wrapper relative" style={{ perspective: '1200px' }}>
            {/* Dashboard mockup */}
            <div 
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                width: 'min(800px, 85vw)',
                background: '#FAFAF7',
                border: '1px solid rgba(255,255,255,0.1)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center px-4 py-3 border-b border-[rgba(0,0,0,0.06)]" style={{ background: '#F0EDE6' }}>
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FEBC2E' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#28C840' }} />
                <div className="ml-4 px-3 py-1 bg-white rounded-md text-[11px] text-[#5A5D6B] font-mono border border-[rgba(0,0,0,0.08)]">
                  app.kin.so/dashboard
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-3">
                  <div className="p-3 rounded-xl bg-white border border-[rgba(0,0,0,0.06)]">
                    <div className="text-[10px] font-semibold text-[#8A8D9A] uppercase tracking-wider mb-1">Watchlist</div>
                    <div className="text-[24px] font-bold text-[#1A1A1E]">12</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[rgba(0,0,0,0.06)]">
                    <div className="text-[10px] font-semibold text-[#8A8D9A] uppercase tracking-wider mb-1">Active Signals</div>
                    <div className="text-[24px] font-bold" style={{ color: '#DC2626' }}>3</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[rgba(0,0,0,0.06)]">
                    <div className="text-[10px] font-semibold text-[#8A8D9A] uppercase tracking-wider mb-1">Collectors</div>
                    <div className="text-[24px] font-bold" style={{ color: '#2D5F8A' }}>8</div>
                  </div>
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="p-3 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] border-l-[3px]" style={{ borderLeftColor: '#DC2626' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}>HIGH</span>
                      <span className="text-[12px] font-semibold text-[#1A1A1E]">Deadline moved up</span>
                    </div>
                    <div className="text-[11px] text-[#5A5D6B]">Scholarship deadline changed from March 1 to Feb 15</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] border-l-[3px]" style={{ borderLeftColor: '#D97706' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(217,119,6,0.1)', color: '#D97706' }}>MEDIUM</span>
                      <span className="text-[12px] font-semibold text-[#1A1A1E]">New pricing tier</span>
                    </div>
                    <div className="text-[11px] text-[#5A5D6B]">Competitor launched Enterprise plan at $99/mo</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] border-l-[3px]" style={{ borderLeftColor: '#059669' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>LOW</span>
                      <span className="text-[12px] font-semibold text-[#1A1A1E]">UI update detected</span>
                    </div>
                    <div className="text-[11px] text-[#5A5D6B]">Minor navigation changes on documentation site</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating overlay elements */}
            <div className="product-ui-overlay-1 absolute -top-6 -right-6 p-4 rounded-xl bg-white shadow-xl opacity-0 scale-75"
              style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <div className="flex items-center gap-2">
                <KinCharacter size={32} animate={false} showShadow={false} />
                <div>
                  <div className="text-[11px] font-semibold text-[#1A1A1E]">Kin AI</div>
                  <div className="text-[10px] text-[#059669]">3 new signals found</div>
                </div>
              </div>
            </div>

            <div className="product-ui-overlay-2 absolute -bottom-4 -left-8 p-3 rounded-xl shadow-xl opacity-0 scale-75"
              style={{ background: '#1A1A1E', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-[10px] text-white/60 mb-1">Weekly Digest</div>
              <div className="text-[14px] font-bold text-white">12 changes detected</div>
              <div className="text-[10px] text-[#059669]">4 important · 8 minor</div>
            </div>

            <div className="product-ui-highlight absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(45,95,138,0.3) 0%, transparent 70%)',
                boxShadow: '0 0 60px rgba(45,95,138,0.4)'
              }}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
           BUILD WITH KIN
           ============================================================ */}
      <section id="build" className="build-section relative py-32 px-6" style={{ background: '#FAFAF7' }}>
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow flex justify-center">
              <span className="inline-flex items-center gap-1.5">
                <Wrench size={12} /> Build with Kin
              </span>
            </div>
            <h2 className="font-bold tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#1A1A1E' }}>
              Type plain English.<br />
              <span className="text-[#5A5D6B] font-medium">Kin builds the scraper.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Input */}
            <div className="build-input bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] overflow-hidden shadow-soft">
              <div className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]" style={{ background: '#FAFAF7' }}>
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FEBC2E' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#28C840' }} />
                <span className="ml-3 text-[12px] text-[#8A8D9A] font-medium">Tell Kin what to watch</span>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <KinCharacter size={36} animate={false} showShadow={false} />
                  <div className="flex-1">
                    <div className="p-3 border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[13px] text-[#1A1A1E] bg-[#FAFAF7] font-sans">
                      "Watch github.com/trending every 5 minutes and tell me when new repositories appear on the list."
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="build-arrow flex justify-center scale-x-0 opacity-0 origin-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#1A1A1E' }}>
                <ArrowRight size={20} color="white" />
              </div>
            </div>

            {/* Output */}
            <div className="build-output bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] overflow-hidden shadow-soft collector-active">
              <div className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]" style={{ background: '#FAFAF7' }}>
                <div className="w-2.5 h-2.5 rounded-full mr-2 animate-pulse" style={{ background: '#059669' }} />
                <span className="text-[12px] font-semibold text-[#1A1A1E]">Collector Active</span>
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
                  <span className="font-medium text-[#1A1A1E] text-right">New repos</span>
                </div>
                <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
                  <div className="text-[12px] text-[#059669] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Collector created in Bright Data
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           SIGNALS INTELLIGENCE
           ============================================================ */}
      <section className="signals-section relative py-32 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FAFAF7 0%, #F5F3EE 100%)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow flex justify-center">From noise to intelligence</div>
            <h2 className="font-bold tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#1A1A1E' }}>
              Kin doesn't dump data.<br />
              <span className="text-[#5A5D6B] font-medium">It explains what matters.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Noise */}
            <div className="noise-panel bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] overflow-hidden">
              <div className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]" style={{ background: '#FAFAF7' }}>
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FEBC2E' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#28C840' }} />
                <span className="ml-3 text-[12px] text-[#8A8D9A] font-mono">raw_scrape.html</span>
              </div>
              <div className="p-[18px] font-mono text-[11.5px] leading-[1.8] text-[#5A5D6B]">
                <div>{`<div class="scholarship">`}</div>
                <div className="pl-4">{`<h2>`}Spring 2026 Awards{`</h2>`}</div>
                <div className="pl-4">
                  {`<p>`}Application{' '}
                  <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '0 3px', borderRadius: 2 }}>March 1</span>
                  {`</p>`}
                </div>
                <div className="pl-4 opacity-35">{`<p>`}Eligibility:…</div>
                <div style={{ color: '#065F46' }}>+ {`<p>`}New: AI Research Fellowship{`</p>`}</div>
                <div style={{ color: '#DC2626' }}>- deadline: "March 1"</div>
                <div style={{ color: '#065F46' }}>+ deadline: "Feb 15"</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-center hidden lg:block">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: '#1A1A1E' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="text-[11px] text-[#8A8D9A] font-semibold tracking-[0.05em]">
                KIN<br />ANALYZES
              </div>
            </div>

            {/* Signal */}
            <div className="signal-panel bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] overflow-hidden border-l-[3px]" style={{ borderLeftColor: '#DC2626' }}>
              <div className="p-[18px]">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <CategoryPill category="deadline" label="Deadline Change" />
                  <ImportanceBadge level="high" label="HIGH" />
                </div>
                <div className="font-bold text-[15px] text-[#1A1A1E] mb-[6px]">
                  Deadline moved up by 14 days
                </div>
                <div className="text-[13.5px] text-[#5A5D6B] leading-[1.6] mb-3">
                  Application deadline changed from <b>March 1</b> to <b>February 15</b>.
                </div>
                <div className="p-[10px_12px] rounded-lg"
                  style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)' }}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.05em] mb-[3px]" style={{ color: '#991B1B' }}>
                    Why it matters
                  </div>
                  <div className="text-[12.5px] leading-[1.5]" style={{ color: '#7F1D1D' }}>
                    You have two weeks less than expected. Submit soon.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           AI SCRAPING BROWSER
           ============================================================ */}
      <section className="browser-section relative py-32 px-6" style={{ background: '#FAFAF7' }}>
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
          <div>
            <div className="eyebrow">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 size={12} /> AI Scraping Browser
              </span>
            </div>
            <h2 className="font-bold tracking-tight mt-2 mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#1A1A1E' }}>
              A real browser.<br />
              <span className="text-[#5A5D6B] font-medium">Guided by AI.</span>
            </h2>
            <p className="text-[16px] text-[#5A5D6B] leading-[1.7]">
              Kin spins up a real browser to handle JavaScript, login walls, 
              and dynamic content. It navigates, waits for loads, and extracts 
              exactly what you care about.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                'Renders JavaScript and SPAs correctly',
                'Handles cookies, modals, and lazy loads',
                'Clicks, scrolls, and navigates like a human',
                'Protected by Bright Data anti-blocking',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-[10px] text-[14px] text-[#5A5D6B]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                    <CheckCircle2 size={12} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="browser-mock bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] overflow-hidden shadow-soft"
            style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]" style={{ background: '#FAFAF7' }}>
              <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FF5F57' }} />
              <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FEBC2E' }} />
              <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#28C840' }} />
              <div className="ml-3 flex-1 px-3 py-1 bg-white rounded-md text-[11px] text-[#5A5D6B] font-mono border border-[rgba(0,0,0,0.08)] truncate">
                https://github.com/trending
              </div>
            </div>
            <div className="p-6 relative" style={{ minHeight: 220 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(45,95,138,0.04)] to-[rgba(8,145,178,0.02)]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <KinCharacter size={32} state="scanning" animate={false} showShadow={false} />
                  <span className="text-[12px] font-semibold text-[#0E7490]">Kin is navigating the page…</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-[rgba(0,0,0,0.06)] rounded w-full animate-pulse" />
                  <div className="h-3 bg-[rgba(0,0,0,0.06)] rounded w-5/6 animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="h-3 bg-[rgba(0,0,0,0.06)] rounded w-4/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="h-3 bg-[rgba(0,0,0,0.06)] rounded w-3/4 animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
                {/* Scanning line */}
                <div className="absolute inset-x-0 h-0.5 top-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(8,145,178,0.6), transparent)',
                    animation: 'scanLine 2s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           FEATURE GRID
           ============================================================ */}
      <section className="relative py-32 px-6" style={{ background: '#F5F3EE' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="eyebrow flex justify-center">Everything you need</div>
            <h2 className="font-bold tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#1A1A1E' }}>
              A complete monitoring<br />
              <span className="text-[#5A5D6B] font-medium">platform, built right.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <MessageSquare size={22} />, color: '#2D5F8A', title: 'Kin AI Chat', desc: 'Ask questions about your monitored data in natural language.' },
              { icon: <Calendar size={22} />, color: '#7C3AED', title: 'Weekly Digest', desc: 'Automated summary every Sunday morning, grouped by importance.' },
              { icon: <Shield size={22} />, color: '#059669', title: 'User Isolation', desc: 'Each collector belongs to exactly one user. Row-level security.' },
              { icon: <Globe size={22} />, color: '#0891B2', title: 'Global Network', desc: 'Residential and data center proxies across 195+ countries.' },
              { icon: <Zap size={22} />, color: '#D97706', title: 'Self-Healing', desc: 'Bright Data infrastructure automatically repairs selectors when sites change.' },
              { icon: <Radio size={22} />, color: '#DC2626', title: 'Real Signals', desc: 'Changes classified by importance: High, Medium, Low.' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="feature-card bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] p-6 hover:shadow-card-hover hover:border-[rgba(0,0,0,0.14)] transition-all duration-300 group"
              >
                <div 
                  className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${feature.color}14`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <div className="text-[15px] font-bold text-[#1A1A1E] mb-2">{feature.title}</div>
                <div className="text-[13.5px] text-[#5A5D6B] leading-[1.6]">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           HACKATHON STORY - SPIDER-MAN VIDEO
           ============================================================ */}
      <section id="story" className="relative py-32 px-6 overflow-hidden"
        style={{ background: '#0A0A0F' }}>
        
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, rgba(220,38,38,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(45,95,138,0.15) 0%, transparent 50%)'
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="max-w-[900px] mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold tracking-[0.1em] uppercase mb-4"
              style={{ background: 'rgba(220,38,38,0.15)', color: '#EF4444' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
              Scrape-Verse Hackathon 2026
            </div>
            <h2 className="font-bold tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: 'white' }}>
              Born from madness.<br />
              <span style={{ color: '#EF4444' }}>Forged in chaos.</span>
            </h2>
            <p className="text-white/60 max-w-[500px] mx-auto"
              style={{ fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
              WeMakeDevs × Bright Data. This is the story of how Kin came to life.
            </p>
          </div>

          {/* Video container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ 
              border: '1px solid rgba(255,255,255,0.1)',
              aspectRatio: '16/9',
              background: '#000'
            }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect fill='%230A0A0F' width='16' height='9'/%3E%3C/svg%3E"
            >
              <source src="/videos/spiderman-hackathon.mp4" type="video/mp4" />
            </video>

            {/* Subtitle overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
              <div 
                className="text-center transition-all duration-500"
                key={currentSubtitle}
              >
                <span 
                  className="inline-block px-5 py-2 rounded-lg text-white font-medium"
                  style={{ 
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(10px)',
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {hackathonSubtitles[currentSubtitle]?.text || hackathonSubtitles[0].text}
                </span>
              </div>
            </div>

            {/* Video border glow */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                boxShadow: 'inset 0 0 60px rgba(220,38,38,0.1)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            />
          </div>

          {/* Tech stack badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {['Next.js 14', 'TypeScript', 'Bright Data', 'Clerk', 'Supabase', 'Zen Mimo AI', 'Groq', 'Resend'].map((tech, i) => (
              <span 
                key={i}
                className="px-4 py-2 rounded-full text-[12px] font-medium"
                style={{ 
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           CTA SECTION
           ============================================================ */}
      <section className="cta-section relative py-32 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FAFAF7 0%, #F0EDE6 100%)' }}>
        
        <div className="parallax-bg absolute top-10 right-20 text-[#2D5F8A]/8" data-speed="0.3">
          <Globe size={160} strokeWidth={1} />
        </div>

        <div className="max-w-[600px] mx-auto text-center relative z-10">
          <div className="cta-kin mb-8 inline-block relative">
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 70%)',
                transform: 'scale(2)',
                filter: 'blur(20px)'
              }}
            />
            <KinCharacter size={120} state="happy" />
          </div>
          <h2 className="cta-title font-bold tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: '#1A1A1E' }}>
            Stop checking.<br />
            <span className="text-[#5A5D6B] font-medium">Start knowing.</span>
          </h2>
          <p className="text-[#5A5D6B] max-w-md mx-auto mb-8"
            style={{ fontSize: 'clamp(15px, 1.6vw, 17px)' }}>
            Join others who let Kin watch the web for them.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg">
              Get started with Kin
              <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="text-[12px] text-[#8A8D9A] mt-4">
            Free to start · No credit card required
          </p>
        </div>
      </section>

      {/* ============================================================
           FOOTER
           ============================================================ */}
      <footer className="bg-white border-t border-[rgba(0,0,0,0.06)] py-10 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-[10px]">
            <KinCharacter size={24} animate={false} showShadow={false} />
            <span className="font-bold text-[15px] tracking-tight text-[#1A1A1E]">Kin</span>
            <span className="text-[12px] text-[#8A8D9A] ml-2">Know what changes on the web.</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[#8A8D9A]">
            <span>Built for Scrape-Verse Hackathon 2026</span>
            <span>WeMakeDevs × Bright Data</span>
          </div>
        </div>
      </footer>

      {/* Scan line animation keyframes */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        
        .main-nav {
          background: transparent;
          backdrop-filter: blur(0px);
          border-bottom: 1px solid transparent;
        }
        
        .main-nav.nav-scrolled {
          background: rgba(250, 250, 247, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
