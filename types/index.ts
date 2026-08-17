export type KinState = 
  | 'idle' 
  | 'thinking' 
  | 'scanning' 
  | 'analyzing' 
  | 'found' 
  | 'important' 
  | 'building'
  | 'happy'
  | 'error';

export type SignalCategory = 
  | 'content' 
  | 'pricing' 
  | 'policy' 
  | 'feature' 
  | 'announce' 
  | 'deadline';

export type ImportanceLevel = 'high' | 'med' | 'low';

export type ScanFrequency = 
  | '1min' 
  | '5min' 
  | '15min' 
  | 'hourly' 
  | '12h' 
  | 'daily' 
  | 'weekly';

export interface MonitoredUrl {
  id: string;
  user_id: string;
  name: string;
  url: string;
  normalized_url: string;
  category: string;
  scan_frequency: ScanFrequency;
  status: 'watching' | 'paused' | 'error' | 'scanning';
  last_scan: string | null;
  last_signal_at: string | null;
  signal_count: number;
  is_active: boolean;
  noise_sensitivity: 'balanced' | 'conservative' | 'aggressive';
  last_content_hash: string | null;
  collector_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collector {
  id: string;
  user_id: string;
  url_id: string | null;
  brightdata_collector_id?: string | null;
  name: string;
  website_url: string;
  selector_config: any;
  status: 'active' | 'paused' | 'building' | 'error';
  last_run: string | null;
  run_count: number;
  built_with_kin: boolean;
  natural_language_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Signal {
  id: string;
  url_id: string;
  user_id: string;
  category: SignalCategory;
  category_name: string;
  importance: ImportanceLevel;
  importance_label: string;
  site: string;
  title: string;
  summary: string;
  why_it_matters: string;
  evidence: { label: string; value: string }[];
  read: boolean;
  notified: boolean;
  detected_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_alerts: boolean;
  weekly_digest: boolean;
  only_high_importance: boolean;
  scan_frequency: ScanFrequency;
  noise_sensitivity: 'balanced' | 'conservative' | 'aggressive';
  ai_tone: 'simple' | 'detailed' | 'executive';
  include_raw_evidence: boolean;
  digest_day: 'sunday' | 'monday' | 'friday';
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AIClassificationResult {
  category: SignalCategory;
  category_name: string;
  importance: ImportanceLevel;
  title: string;
  summary: string;
  why_it_matters: string;
  evidence: { label: string; value: string }[];
}

export interface ScraperConfig {
  url: string;
  selectors: string[];
  content_type: string;
  frequency: ScanFrequency;
  noise_sensitivity: string;
}
