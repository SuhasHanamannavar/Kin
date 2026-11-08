import crypto from 'crypto';
import { 
  ddbDocClient, 
  TABLE_NAME 
} from './aws-dynamodb';
import { 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand,
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';
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
// User Profiles — AWS DynamoDB
// ============================================================

export async function ensureUserProfile(clerkUserId: string, email: string, name?: string) {
  // Query GSI1 to check if profile exists by clerk_user_id
  const gsiRes = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
    ExpressionAttributeValues: {
      ':gsi1pk': `CLERK#${clerkUserId}`,
      ':gsi1sk': 'PROFILE',
    },
    Limit: 1,
  }));

  if (gsiRes.Items && gsiRes.Items.length > 0) {
    return gsiRes.Items[0];
  }

  // Create new profile
  const internalId = crypto.randomUUID();
  const now = new Date().toISOString();
  const profile = {
    PK: `USER#${internalId}`,
    SK: 'PROFILE',
    GSI1PK: `CLERK#${clerkUserId}`,
    GSI1SK: 'PROFILE',
    id: internalId,
    clerk_user_id: clerkUserId,
    email,
    full_name: name || email.split('@')[0],
    plan: 'free',
    urls_used: 0,
    urls_limit: 10,
    created_at: now,
    updated_at: now,
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: profile,
  }));

  // Create default settings
  const defaultSettings = {
    PK: `USER#${internalId}`,
    SK: 'SETTINGS',
    id: crypto.randomUUID(),
    user_id: internalId,
    email_alerts: true,
    weekly_digest: true,
    only_high_importance: false,
    scan_frequency: 'daily',
    noise_sensitivity: 'balanced',
    ai_tone: 'simple',
    include_raw_evidence: true,
    digest_day: 'sunday',
    created_at: now,
    updated_at: now,
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: defaultSettings,
  }));

  return profile;
}

export async function getInternalUserId(clerkUserId: string): Promise<string | null> {
  const gsiRes = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
    ExpressionAttributeValues: {
      ':gsi1pk': `CLERK#${clerkUserId}`,
      ':gsi1sk': 'PROFILE',
    },
    Limit: 1,
  }));

  if (gsiRes.Items && gsiRes.Items.length > 0) {
    return gsiRes.Items[0].id || null;
  }
  return null;
}

// ============================================================
// Monitored URLs (Watchlist) — USER ISOLATED (AWS DynamoDB)
// ============================================================

export async function getUserWatchlist(internalUserId: string): Promise<MonitoredUrl[]> {
  const res = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${internalUserId}`,
      ':skPrefix': 'URL#',
    },
  }));

  const items = (res.Items || []) as (MonitoredUrl & { is_active?: boolean })[];
  return items
    .filter(i => i.is_active !== false)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
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
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const item: MonitoredUrl & { PK: string; SK: string; GSI1PK: string; GSI1SK: string } = {
    PK: `USER#${internalUserId}`,
    SK: `URL#${id}`,
    GSI1PK: `URL#${id}`,
    GSI1SK: 'METADATA',
    id,
    user_id: internalUserId,
    name: params.name,
    url: params.url,
    normalized_url: normalizeUrl(params.url),
    category: params.category || 'General',
    scan_frequency: params.scan_frequency || 'daily',
    status: 'watching',
    last_scan: null,
    last_signal_at: null,
    signal_count: 0,
    is_active: true,
    noise_sensitivity: (params.noise_sensitivity as any) || 'balanced',
    last_content_hash: null,
    collector_id: null,
    created_at: now,
    updated_at: now,
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return item;
}

export async function updateWatchlistItem(
  internalUserId: string,
  id: string,
  updates: Partial<MonitoredUrl>
): Promise<MonitoredUrl> {
  // Get existing
  const existingRes = await ddbDocClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${internalUserId}`,
      SK: `URL#${id}`,
    },
  }));

  if (!existingRes.Item) {
    throw new Error('Watchlist item not found');
  }

  const updatedItem = {
    ...existingRes.Item,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: updatedItem,
  }));

  return updatedItem as MonitoredUrl;
}

export async function deleteFromWatchlist(internalUserId: string, id: string): Promise<void> {
  await ddbDocClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${internalUserId}`,
      SK: `URL#${id}`,
    },
  }));
}

// ============================================================
// Signals — USER ISOLATED (AWS DynamoDB)
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
  const res = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${internalUserId}`,
      ':skPrefix': 'SIGNAL#',
    },
  }));

  let signals = (res.Items || []) as Signal[];

  // Sort descending by detected_at
  signals.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

  if (filters?.category && filters.category !== 'all') {
    signals = signals.filter(s => s.category === filters.category);
  }
  if (filters?.importance && filters.importance !== 'all') {
    signals = signals.filter(s => s.importance === filters.importance);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    signals = signals.filter(s => s.title?.toLowerCase().includes(q) || s.summary?.toLowerCase().includes(q));
  }
  if (filters?.limit) {
    signals = signals.slice(0, filters.limit);
  }

  return signals;
}

export async function createSignal(
  internalUserId: string,
  signal: Omit<Signal, 'id' | 'user_id' | 'detected_at' | 'read' | 'notified'>
): Promise<Signal> {
  const id = crypto.randomUUID();
  const detected_at = new Date().toISOString();
  const item: Signal & { PK: string; SK: string } = {
    PK: `USER#${internalUserId}`,
    SK: `SIGNAL#${detected_at}#${id}`,
    id,
    user_id: internalUserId,
    detected_at,
    read: false,
    notified: false,
    ...signal,
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return item;
}

export async function markSignalRead(
  internalUserId: string,
  signalId: string,
  read: boolean = true
): Promise<Signal> {
  // Find signal in user's partition
  const res = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${internalUserId}`,
      ':skPrefix': 'SIGNAL#',
    },
  }));

  const item = (res.Items || []).find(i => i.id === signalId);
  if (!item) {
    throw new Error('Signal not found');
  }

  item.read = read;
  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return item as Signal;
}

export async function markAllSignalsRead(internalUserId: string): Promise<void> {
  const res = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${internalUserId}`,
      ':skPrefix': 'SIGNAL#',
    },
  }));

  const unreadItems = (res.Items || []).filter(i => !i.read);
  for (const item of unreadItems) {
    item.read = true;
    await ddbDocClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));
  }
}

export async function deleteSignal(internalUserId: string, signalId: string): Promise<void> {
  const res = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${internalUserId}`,
      ':skPrefix': 'SIGNAL#',
    },
  }));

  const item = (res.Items || []).find(i => i.id === signalId);
  if (item) {
    await ddbDocClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: item.PK,
        SK: item.SK,
      },
    }));
  }
}

// ============================================================
// Collectors — USER ISOLATED (AWS DynamoDB)
// ============================================================

export async function getUserCollectors(internalUserId: string): Promise<Collector[]> {
  const res = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${internalUserId}`,
      ':skPrefix': 'COLLECTOR#',
    },
  }));

  const items = (res.Items || []) as Collector[];
  return items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
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
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const item: Collector & { PK: string; SK: string } = {
    PK: `USER#${internalUserId}`,
    SK: `COLLECTOR#${id}`,
    id,
    user_id: internalUserId,
    url_id: params.url_id || null,
    brightdata_collector_id: params.brightdata_collector_id || null,
    name: params.name,
    website_url: params.website_url,
    selector_config: params.selector_config || {},
    status: 'active',
    last_run: null,
    run_count: 0,
    built_with_kin: params.built_with_kin || false,
    natural_language_prompt: params.natural_language_prompt || null,
    created_at: now,
    updated_at: now,
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return item;
}

export async function updateCollector(
  internalUserId: string,
  id: string,
  updates: Partial<Collector>
): Promise<Collector> {
  const existingRes = await ddbDocClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${internalUserId}`,
      SK: `COLLECTOR#${id}`,
    },
  }));

  if (!existingRes.Item) {
    throw new Error('Collector not found');
  }

  const updatedItem = {
    ...existingRes.Item,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: updatedItem,
  }));

  return updatedItem as Collector;
}

export async function deleteCollector(internalUserId: string, id: string): Promise<void> {
  await ddbDocClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${internalUserId}`,
      SK: `COLLECTOR#${id}`,
    },
  }));
}

// ============================================================
// User Settings — USER ISOLATED (AWS DynamoDB)
// ============================================================

export async function getUserSettings(internalUserId: string): Promise<UserSettings | null> {
  const res = await ddbDocClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${internalUserId}`,
      SK: 'SETTINGS',
    },
  }));

  return (res.Item as UserSettings) || null;
}

export async function upsertUserSettings(
  internalUserId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const existing = await getUserSettings(internalUserId);
  const now = new Date().toISOString();

  const item: UserSettings & { PK: string; SK: string } = {
    PK: `USER#${internalUserId}`,
    SK: 'SETTINGS',
    id: existing?.id || crypto.randomUUID(),
    user_id: internalUserId,
    email_alerts: settings.email_alerts ?? existing?.email_alerts ?? true,
    weekly_digest: settings.weekly_digest ?? existing?.weekly_digest ?? true,
    only_high_importance: settings.only_high_importance ?? existing?.only_high_importance ?? false,
    scan_frequency: settings.scan_frequency ?? existing?.scan_frequency ?? 'daily',
    noise_sensitivity: settings.noise_sensitivity ?? existing?.noise_sensitivity ?? 'balanced',
    ai_tone: settings.ai_tone ?? existing?.ai_tone ?? 'simple',
    include_raw_evidence: settings.include_raw_evidence ?? existing?.include_raw_evidence ?? true,
    digest_day: settings.digest_day ?? existing?.digest_day ?? 'sunday',
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return item;
}

// ============================================================
// Chat Messages — USER ISOLATED (AWS DynamoDB)
// ============================================================

export async function getUserChatMessages(internalUserId: string): Promise<ChatMessage[]> {
  const res = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${internalUserId}`,
      ':skPrefix': 'CHAT#',
    },
    Limit: 50,
  }));

  const items = (res.Items || []) as ChatMessage[];
  return items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function addChatMessage(
  internalUserId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage> {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const item: ChatMessage & { PK: string; SK: string } = {
    PK: `USER#${internalUserId}`,
    SK: `CHAT#${created_at}#${id}`,
    id,
    user_id: internalUserId,
    role,
    content,
    created_at,
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return item;
}

// ============================================================
// Snapshots (AWS DynamoDB)
// ============================================================

export async function saveSnapshot(params: {
  url_id: string;
  user_id: string;
  content_hash: string;
  raw_html?: string;
  text_content?: string;
  status?: 'success' | 'error';
}) {
  const id = crypto.randomUUID();
  const scraped_at = new Date().toISOString();
  const item = {
    PK: `SNAPSHOT#${params.url_id}`,
    SK: `${scraped_at}#${id}`,
    id,
    url_id: params.url_id,
    user_id: params.user_id,
    content_hash: params.content_hash,
    raw_html: params.raw_html?.substring(0, 300000),
    text_content: params.text_content?.substring(0, 100000),
    status: params.status || 'success',
    scraped_at,
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return item;
}

export async function getLatestSnapshot(urlId: string, internalUserId: string) {
  const res = await ddbDocClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `SNAPSHOT#${urlId}`,
    },
    ScanIndexForward: false, // Descending by SK (scraped_at)
    Limit: 5,
  }));

  const items = res.Items || [];
  const latestSuccess = items.find(i => i.status === 'success' && i.user_id === internalUserId);
  return latestSuccess || null;
}
