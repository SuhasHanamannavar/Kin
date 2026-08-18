import { createServiceClient } from '@/supabase/server';
import type { 
  MonitoredUrl, 
  Signal, 
  UserSettings, 
  Collector, 
  ChatMessage,
  ScanFrequency 
} from '@/types';
import { normalizeUrl } from './utils';

// ============================================================
// User Profiles
// ============================================================

export async function ensureUserProfile(clerkUserId: string, email: string, name?: string) {
  const supabase = createServiceClient();
  
  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (existing) return existing;

  // Create new profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      clerk_user_id: clerkUserId,
      email,
      full_name: name || email.split('@')[0],
    })
    .select()
    .single();

  if (error) throw error;

  // Create default settings
  await supabase.from('user_settings').insert({ user_id: profile.id });

  return profile;
}

export async function getInternalUserId(clerkUserId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  return data?.id || null;
}

// ============================================================
// Monitored URLs (Watchlist) — USER ISOLATED
// ============================================================

export async function getUserWatchlist(internalUserId: string): Promise<MonitoredUrl[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('monitored_urls')
    .select('*')
    .eq('user_id', internalUserId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addToWatchlist(
  internalUserId: string,
  params: {
    name: string;
    url: string;
    category?: string;
    scan_frequency?: ScanFrequency;
    noise_sensitivity?: string;
  }
): Promise<MonitoredUrl> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('monitored_urls')
    .insert({
      user_id: internalUserId,
      name: params.name,
      url: params.url,
      normalized_url: normalizeUrl(params.url),
      category: params.category || 'General',
      scan_frequency: params.scan_frequency || 'daily',
      noise_sensitivity: params.noise_sensitivity || 'balanced',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWatchlistItem(
  internalUserId: string,
  id: string,
  updates: Partial<MonitoredUrl>
): Promise<MonitoredUrl> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('monitored_urls')
    .update(updates)
    .eq('id', id)
    .eq('user_id', internalUserId) // USER ISOLATION
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFromWatchlist(internalUserId: string, id: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('monitored_urls')
    .delete()
    .eq('id', id)
    .eq('user_id', internalUserId); // USER ISOLATION

  if (error) throw error;
}

// ============================================================
// Signals — USER ISOLATED
// ============================================================

export async function getUserSignals(
  internalUserId: string,
  filters?: {
    category?: string;
    importance?: string;
    search?: string;
    limit?: number;
  }
): Promise<Signal[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from('signals')
    .select('*')
    .eq('user_id', internalUserId) // CRITICAL: USER ISOLATION
    .order('detected_at', { ascending: false });

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  if (filters?.importance && filters.importance !== 'all') {
    query = query.eq('importance', filters.importance);
  }
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createSignal(
  internalUserId: string,
  signal: Omit<Signal, 'id' | 'user_id' | 'detected_at' | 'read' | 'notified'>
): Promise<Signal> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('signals')
    .insert({
      ...signal,
      user_id: internalUserId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markSignalRead(
  internalUserId: string,
  signalId: string,
  read: boolean = true
): Promise<Signal> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('signals')
    .update({ read })
    .eq('id', signalId)
    .eq('user_id', internalUserId) // USER ISOLATION
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSignal(internalUserId: string, signalId: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('signals')
    .delete()
    .eq('id', signalId)
    .eq('user_id', internalUserId); // USER ISOLATION

  if (error) throw error;
}

// ============================================================
// Collectors — USER ISOLATED (Separate per user + per website)
// ============================================================

export async function getUserCollectors(internalUserId: string): Promise<Collector[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('collectors')
    .select('*')
    .eq('user_id', internalUserId) // USER ISOLATION
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCollector(
  internalUserId: string,
  params: {
    url_id?: string;
    brightdata_collector_id?: string;
    name: string;
    website_url: string;
    selector_config?: any;
    built_with_kin?: boolean;
    natural_language_prompt?: string;
  }
): Promise<Collector> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('collectors')
    .insert({
      user_id: internalUserId,
      url_id: params.url_id || null,
      brightdata_collector_id: params.brightdata_collector_id || null,
      name: params.name,
      website_url: params.website_url,
      selector_config: params.selector_config || {},
      status: 'active',
      built_with_kin: params.built_with_kin || false,
      natural_language_prompt: params.natural_language_prompt || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCollector(
  internalUserId: string,
  id: string,
  updates: Partial<Collector>
): Promise<Collector> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('collectors')
    .update(updates)
    .eq('id', id)
    .eq('user_id', internalUserId) // USER ISOLATION
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCollector(internalUserId: string, id: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('collectors')
    .delete()
    .eq('id', id)
    .eq('user_id', internalUserId); // USER ISOLATION

  if (error) throw error;
}

// ============================================================
// User Settings — USER ISOLATED
// ============================================================

export async function getUserSettings(internalUserId: string): Promise<UserSettings | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', internalUserId) // USER ISOLATION
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertUserSettings(
  internalUserId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const supabase = createServiceClient();
  
  // First check if exists
  const existing = await getUserSettings(internalUserId);
  
  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', internalUserId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: internalUserId,
        ...settings,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// ============================================================
// Chat Messages — USER ISOLATED
// ============================================================

export async function getUserChatMessages(internalUserId: string): Promise<ChatMessage[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', internalUserId) // USER ISOLATION
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function addChatMessage(
  internalUserId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: internalUserId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// Snapshots
// ============================================================

export async function saveSnapshot(params: {
  url_id: string;
  user_id: string;
  content_hash: string;
  raw_html?: string;
  text_content?: string;
  status?: 'success' | 'error';
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('snapshots')
    .insert({
      url_id: params.url_id,
      user_id: params.user_id,
      content_hash: params.content_hash,
      raw_html: params.raw_html?.substring(0, 500000),
      text_content: params.text_content?.substring(0, 100000),
      status: params.status || 'success',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLatestSnapshot(urlId: string, internalUserId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('url_id', urlId)
    .eq('user_id', internalUserId)
    .eq('status', 'success')
    .order('scraped_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
