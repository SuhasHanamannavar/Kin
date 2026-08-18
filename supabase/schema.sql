-- ============================================================
-- Kin — Database Schema v2.1
-- Website Change Monitoring SaaS
-- Auth: Clerk + Supabase RLS via custom session variable
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Helper function for Clerk-based RLS
-- 
-- Our server uses the Supabase service role (which normally bypasses RLS).
-- Before each query, we set: SET app.current_user_id = '<uuid>'
-- This function safely reads that value for RLS policies.
-- 
-- Dual-layer security:
-- 1. PRIMARY: All our API code includes user_id in every query
-- 2. DEFENSE-IN-DEPTH: RLS policies using this function as safety net
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- Profiles table (Clerk-based auth)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  urls_used INTEGER NOT NULL DEFAULT 0,
  urls_limit INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- User Settings
-- ============================================================
CREATE TABLE public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  only_high_importance BOOLEAN NOT NULL DEFAULT false,
  scan_frequency TEXT NOT NULL DEFAULT 'daily' 
    CHECK (scan_frequency IN ('1min', '5min', '15min', 'hourly', '12h', 'daily', 'weekly')),
  noise_sensitivity TEXT NOT NULL DEFAULT 'balanced'
    CHECK (noise_sensitivity IN ('balanced', 'conservative', 'aggressive')),
  ai_tone TEXT NOT NULL DEFAULT 'simple'
    CHECK (ai_tone IN ('simple', 'detailed', 'executive')),
  include_raw_evidence BOOLEAN NOT NULL DEFAULT true,
  digest_day TEXT NOT NULL DEFAULT 'sunday'
    CHECK (digest_day IN ('sunday', 'monday', 'friday')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Monitored URLs (Watchlist)
-- ============================================================
CREATE TABLE public.monitored_urls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  scan_frequency TEXT NOT NULL DEFAULT 'daily'
    CHECK (scan_frequency IN ('1min', '5min', '15min', 'hourly', '12h', 'daily', 'weekly')),
  status TEXT NOT NULL DEFAULT 'watching'
    CHECK (status IN ('watching', 'paused', 'error', 'scanning')),
  last_scan TIMESTAMPTZ,
  last_signal_at TIMESTAMPTZ,
  signal_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  noise_sensitivity TEXT DEFAULT 'balanced'
    CHECK (noise_sensitivity IN ('balanced', 'conservative', 'aggressive')),
  last_content_hash TEXT,
  collector_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, normalized_url)
);

CREATE INDEX idx_monitored_urls_user_id ON public.monitored_urls(user_id);
CREATE INDEX idx_monitored_urls_status ON public.monitored_urls(status);
CREATE INDEX idx_monitored_urls_last_scan ON public.monitored_urls(last_scan);
ALTER TABLE public.monitored_urls ENABLE ROW LEVEL SECURITY;

-- Update urls_used count in profiles
CREATE FUNCTION public.update_urls_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET urls_used = urls_used + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET urls_used = urls_used - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_urls_count
  AFTER INSERT OR DELETE ON public.monitored_urls
  FOR EACH ROW EXECUTE FUNCTION public.update_urls_count();

-- ============================================================
-- Collectors (Separate per user + per website — Option A)
-- Each collector has a Bright Data counterpart when BRIGHTDATA_API_KEY is set.
-- Collectors appear in BOTH Kin dashboard AND Bright Data dashboard.
-- ============================================================
CREATE TABLE public.collectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  url_id UUID REFERENCES public.monitored_urls(id) ON DELETE SET NULL,
  brightdata_collector_id TEXT,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  selector_config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'building', 'error')),
  last_run TIMESTAMPTZ,
  run_count INTEGER NOT NULL DEFAULT 0,
  built_with_kin BOOLEAN NOT NULL DEFAULT false,
  natural_language_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collectors_user_id ON public.collectors(user_id);
CREATE INDEX idx_collectors_url_id ON public.collectors(url_id);
CREATE INDEX idx_collectors_status ON public.collectors(status);
CREATE INDEX idx_collectors_brightdata_id ON public.collectors(brightdata_collector_id);
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Snapshots (scraped content history)
-- ============================================================
CREATE TABLE public.snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url_id UUID REFERENCES public.monitored_urls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_hash TEXT NOT NULL,
  raw_html TEXT,
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'error')),
  error_message TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_url_id ON public.snapshots(url_id);
CREATE INDEX idx_snapshots_user_id ON public.snapshots(user_id);
CREATE INDEX idx_snapshots_scraped_at ON public.snapshots(scraped_at DESC);
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Signals (detected changes) — USER ISOLATED
-- ============================================================
CREATE TABLE public.signals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url_id UUID REFERENCES public.monitored_urls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  snapshot_from_id UUID REFERENCES public.snapshots(id),
  snapshot_to_id UUID REFERENCES public.snapshots(id),
  category TEXT NOT NULL
    CHECK (category IN ('content', 'pricing', 'policy', 'feature', 'announce', 'deadline')),
  category_name TEXT NOT NULL,
  importance TEXT NOT NULL DEFAULT 'med'
    CHECK (importance IN ('high', 'med', 'low')),
  importance_label TEXT NOT NULL DEFAULT 'MED',
  site TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  why_it_matters TEXT,
  evidence JSONB DEFAULT '[]'::jsonb,
  raw_diff TEXT,
  ai_summary TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  notified BOOLEAN NOT NULL DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signals_user_id ON public.signals(user_id);
CREATE INDEX idx_signals_url_id ON public.signals(url_id);
CREATE INDEX idx_signals_detected_at ON public.signals(detected_at DESC);
CREATE INDEX idx_signals_read ON public.signals(read);
CREATE INDEX idx_signals_importance ON public.signals(importance);
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- Update signal_count in monitored_urls
CREATE FUNCTION public.update_signal_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.monitored_urls 
    SET signal_count = signal_count + 1, last_signal_at = NOW() 
    WHERE id = NEW.url_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_signal_count
  AFTER INSERT ON public.signals
  FOR EACH ROW EXECUTE FUNCTION public.update_signal_count();

-- ============================================================
-- Chat messages (Kin AI conversations) — USER ISOLATED
-- ============================================================
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at ASC);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Updated timestamps trigger
-- ============================================================
CREATE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_urls_updated_at
  BEFORE UPDATE ON public.monitored_urls
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_collectors_updated_at
  BEFORE UPDATE ON public.collectors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security Policies (Clerk-compatible)
-- 
-- How it works:
-- 1. Our API server uses Supabase SERVICE ROLE key
-- 2. Before each query, we set: SET app.current_user_id = '<user-uuid>'
-- 3. Policies check: user_id = public.get_current_user_id()
-- 
-- This gives us proper RLS even with Clerk auth.
-- Service role normally bypasses RLS, but our code sets the session
-- variable so RLS acts as an additional safety net.
-- ============================================================

-- Profiles policies
CREATE POLICY "Profiles: view own" ON public.profiles
  FOR SELECT USING (id = public.get_current_user_id());

-- User settings policies
CREATE POLICY "Settings: view own" ON public.user_settings
  FOR SELECT USING (user_id = public.get_current_user_id());
CREATE POLICY "Settings: insert own" ON public.user_settings
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());
CREATE POLICY "Settings: update own" ON public.user_settings
  FOR UPDATE USING (user_id = public.get_current_user_id());

-- Monitored URLs policies
CREATE POLICY "URLs: view own" ON public.monitored_urls
  FOR SELECT USING (user_id = public.get_current_user_id());
CREATE POLICY "URLs: insert own" ON public.monitored_urls
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());
CREATE POLICY "URLs: update own" ON public.monitored_urls
  FOR UPDATE USING (user_id = public.get_current_user_id());
CREATE POLICY "URLs: delete own" ON public.monitored_urls
  FOR DELETE USING (user_id = public.get_current_user_id());

-- Collectors policies
CREATE POLICY "Collectors: view own" ON public.collectors
  FOR SELECT USING (user_id = public.get_current_user_id());
CREATE POLICY "Collectors: insert own" ON public.collectors
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());
CREATE POLICY "Collectors: update own" ON public.collectors
  FOR UPDATE USING (user_id = public.get_current_user_id());
CREATE POLICY "Collectors: delete own" ON public.collectors
  FOR DELETE USING (user_id = public.get_current_user_id());

-- Snapshots policies
CREATE POLICY "Snapshots: view own" ON public.snapshots
  FOR SELECT USING (user_id = public.get_current_user_id());
CREATE POLICY "Snapshots: insert own" ON public.snapshots
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

-- Signals policies
CREATE POLICY "Signals: view own" ON public.signals
  FOR SELECT USING (user_id = public.get_current_user_id());
CREATE POLICY "Signals: insert own" ON public.signals
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());
CREATE POLICY "Signals: update own" ON public.signals
  FOR UPDATE USING (user_id = public.get_current_user_id());
CREATE POLICY "Signals: delete own" ON public.signals
  FOR DELETE USING (user_id = public.get_current_user_id());

-- Chat messages policies
CREATE POLICY "Chat: view own" ON public.chat_messages
  FOR SELECT USING (user_id = public.get_current_user_id());
CREATE POLICY "Chat: insert own" ON public.chat_messages
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());
