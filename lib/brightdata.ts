// ============================================================
// Bright Data Collector Management API
// 
// This module creates REAL collectors in Bright Data that appear
// in BOTH the Kin dashboard AND the Bright Data dashboard.
// 
// SaaS model: The platform owner sets BRIGHTDATA_API_KEY once.
// End-users never need credentials — they just type plain English.
// ============================================================

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const BRIGHTDATA_ZONE = process.env.BRIGHTDATA_ZONE || '';
const BRIGHTDATA_API_BASE = process.env.BRIGHTDATA_API_BASE || 'https://api.brightdata.com';

export function isBrightDataEnabled(): boolean {
  return !!BRIGHTDATA_API_KEY && !!BRIGHTDATA_ZONE;
}

export interface BrightDataCollectorConfig {
  name: string;
  url: string;
  frequency?: string;
  selectors?: string[];
  key_elements?: string[];
}

export interface BrightDataCollector {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'building' | 'error';
  url: string;
  created_at: string;
  last_run?: string;
  run_count?: number;
}

// ============================================================
// Create a real collector in Bright Data
// ============================================================
export async function createBrightDataCollector(
  config: BrightDataCollectorConfig
): Promise<{ success: boolean; collector_id?: string; error?: string }> {
  if (!isBrightDataEnabled()) {
    // Simulate creation for local dev without Bright Data key
    return {
      success: true,
      collector_id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };
  }

  try {
    // Build collector configuration for Bright Data
    const collectorPayload = {
      name: config.name,
      type: 'unblocker',
      configuration: {
        url: config.url,
        format: 'json',
        extract: {
          title: 'h1',
          content: 'body',
          ...(config.selectors?.length && {
            custom_elements: config.selectors.reduce((acc: any, sel, i) => {
              acc[`element_${i}`] = sel;
              return acc;
            }, {}),
          }),
        },
        schedule: {
          frequency: mapFrequencyToBrightData(config.frequency || 'daily'),
        },
      },
    };

    const response = await fetch(`${BRIGHTDATA_API_BASE}/collectors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collectorPayload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.warn('[BrightData] Create collector failed:', response.status, errorText);
      
      // Fallback: return a local collector ID so Kin still works
      return {
        success: true,
        collector_id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        error: `Bright Data API: ${response.status} — using local mode`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      collector_id: data.id || data.collector_id,
    };
  } catch (err: any) {
    console.warn('[BrightData] Network error:', err.message);
    // Graceful fallback
    return {
      success: true,
      collector_id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      error: 'Network error — using local mode',
    };
  }
}

// ============================================================
// Trigger a collector run in Bright Data
// ============================================================
export async function runBrightDataCollector(
  collectorId: string
): Promise<{ success: boolean; html?: string; text?: string; error?: string }> {
  if (!isBrightDataEnabled() || collectorId.startsWith('local_')) {
    return { success: false, error: 'Bright Data not enabled or local collector' };
  }

  try {
    const response = await fetch(`${BRIGHTDATA_API_BASE}/collectors/${collectorId}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wait_for_results: true, timeout: 60 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Extract HTML/text from Bright Data result format
    const html = data.html || data.result?.html || '';
    const text = data.text || data.result?.text || extractTextFromHtml(html);
    
    return { success: true, html, text };
  } catch (err: any) {
    console.warn('[BrightData] Run failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ============================================================
// Get collector status from Bright Data
// ============================================================
export async function getBrightDataCollectorStatus(
  collectorId: string
): Promise<{ status?: string; last_run?: string; run_count?: number; error?: string }> {
  if (!isBrightDataEnabled() || collectorId.startsWith('local_')) {
    return {};
  }

  try {
    const response = await fetch(`${BRIGHTDATA_API_BASE}/collectors/${collectorId}`, {
      headers: { 'Authorization': `Bearer ${BRIGHTDATA_API_KEY}` },
    });

    if (!response.ok) return { error: `HTTP ${response.status}` };
    
    const data = await response.json();
    return {
      status: data.status,
      last_run: data.last_run,
      run_count: data.run_count,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ============================================================
// Delete a collector from Bright Data
// ============================================================
export async function deleteBrightDataCollector(
  collectorId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isBrightDataEnabled() || collectorId.startsWith('local_')) {
    return { success: true };
  }

  try {
    const response = await fetch(`${BRIGHTDATA_API_BASE}/collectors/${collectorId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${BRIGHTDATA_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[BrightData] Delete failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ============================================================
// Simple URL fetch via Bright Data Web Unlocker (for watchlist)
// ============================================================
export async function fetchViaBrightData(
  url: string
): Promise<{ success: boolean; html?: string; error?: string }> {
  if (!isBrightDataEnabled()) {
    return { success: false, error: 'Bright Data not enabled (need API key + zone)' };
  }

  try {
    const response = await fetch(`${BRIGHTDATA_API_BASE}/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        format: 'raw',
        zone: BRIGHTDATA_ZONE,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errText.substring(0, 100)}`);
    }

    const html = await response.text();
    return { success: true, html };
  } catch (err: any) {
    console.warn('[BrightData] Fetch failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ============================================================
// Helpers
// ============================================================

function mapFrequencyToBrightData(frequency: string): string {
  const map: Record<string, string> = {
    '1min': 'every_1_minute',
    '5min': 'every_5_minutes',
    '15min': 'every_15_minutes',
    'hourly': 'every_hour',
    '12h': 'every_12_hours',
    'daily': 'daily',
    'weekly': 'weekly',
  };
  return map[frequency] || 'daily';
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
