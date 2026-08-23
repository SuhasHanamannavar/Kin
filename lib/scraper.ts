import crypto from 'crypto';
import { fetchViaBrightData, isBrightDataEnabled } from './brightdata';

export interface ScrapeResult {
  html: string;
  text: string;
  hash: string;
  success: boolean;
  error?: string;
  source?: 'brightdata' | 'direct';
}

/**
 * Fetch page content from a URL.
 *
 * PRIORITY:
 * 1. Bright Data Web Unlocker (if BRIGHTDATA_API_KEY is set)
 *    — Handles proxies, CAPTCHAs, JS rendering, anti-blocking
 * 2. Direct HTTP fetch (fallback for local dev)
 */
export async function fetchPageContent(url: string): Promise<ScrapeResult> {
  // Try Bright Data first if configured
  if (isBrightDataEnabled()) {
    try {
      const result = await fetchViaBrightData(url);
      if (result.success && result.html) {
        const text = extractText(result.html);
        const hash = crypto.createHash('sha256').update(text).digest('hex');
        return {
          html: result.html,
          text,
          hash,
          success: true,
          source: 'brightdata',
        };
      }
    } catch (bdErr: any) {
      console.warn('[Scraper] Bright Data failed, falling back to direct fetch:', bdErr.message);
    }
  }

  // Fallback: direct HTTP fetch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Kin/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const text = extractText(html);
    const hash = crypto.createHash('sha256').update(text).digest('hex');

    return { html, text, hash, success: true, source: 'direct' };
  } catch (err: any) {
    return {
      html: '',
      text: '',
      hash: '',
      success: false,
      error: err.message || 'Failed to fetch page',
    };
  }
}

/**
 * Extract meaningful text from HTML.
 * Strips tags, scripts, styles, and excessive whitespace.
 */
export function extractText(html: string): string {
  if (!html) return '';

  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Compute a simple text diff between old and new content.
 * Returns a human-readable summary of changes.
 */
export function computeTextDiff(oldText: string, newText: string): string {
  const oldLines = new Set(oldText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean));
  const newLines = new Set(newText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean));

  const added: string[] = [];
  const removed: string[] = [];

  for (const line of newLines) {
    if (!oldLines.has(line) && line.length > 20) {
      added.push(line);
    }
  }

  for (const line of oldLines) {
    if (!newLines.has(line) && line.length > 20) {
      removed.push(line);
    }
  }

  const parts: string[] = [];
  if (added.length > 0) {
    parts.push(`Added (${added.length}):\n${added.slice(0, 5).map(a => `+ ${a.substring(0, 200)}`).join('\n')}`);
  }
  if (removed.length > 0) {
    parts.push(`Removed (${removed.length}):\n${removed.slice(0, 5).map(r => `- ${r.substring(0, 200)}`).join('\n')}`);
  }

  return parts.join('\n\n') || 'Minor text variations detected.';
}

/**
 * Calculate the change ratio between two texts.
 * Returns a number between 0 (no change) and 1 (completely different).
 */
export function calculateChangeRatio(oldText: string, newText: string): number {
  if (!oldText && !newText) return 0;
  if (!oldText || !newText) return 1;

  const oldWords = new Set(oldText.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const newWords = new Set(newText.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  if (oldWords.size === 0 && newWords.size === 0) return 0;

  let common = 0;
  for (const word of oldWords) {
    if (newWords.has(word)) common++;
  }

  const total = Math.max(oldWords.size, newWords.size);
  return total === 0 ? 0 : 1 - (common / total);
}
