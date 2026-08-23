import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { 
  getUserWatchlist, 
  updateWatchlistItem,
  getLatestSnapshot,
  saveSnapshot,
  createSignal,
  getUserSettings,
} from '@/lib/db';
import { fetchPageContent, computeTextDiff, calculateChangeRatio } from '@/lib/scraper';
import { analyzeChangeWithAI } from '@/lib/ai';
import { getSiteName } from '@/lib/utils';
import { sendSignalAlert } from '@/lib/emails';

// ============================================================
// POST /api/scrape — Trigger scraping (USER ISOLATED)
// ============================================================
export async function POST(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const { url_id, scan_all = false } = body;

    let itemsToScan: any[] = [];

    if (scan_all) {
      itemsToScan = await getUserWatchlist(auth.internalUserId);
      itemsToScan = itemsToScan.filter(i => i.status === 'watching' && i.is_active);
    } else if (url_id) {
      const watchlist = await getUserWatchlist(auth.internalUserId);
      const item = watchlist.find(i => i.id === url_id);
      if (!item) {
        return NextResponse.json(
          { success: false, error: 'URL not found in your watchlist' },
          { status: 404 }
        );
      }
      itemsToScan = [item];
    } else {
      return NextResponse.json(
        { success: false, error: 'Either url_id or scan_all is required' },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const item of itemsToScan) {
      try {
        // Mark as scanning
        await updateWatchlistItem(auth.internalUserId, item.id, { status: 'scanning' });

        // Fetch current content
        const { html, text, hash, success, error } = await fetchPageContent(item.url);

        if (!success) {
          await updateWatchlistItem(auth.internalUserId, item.id, { status: 'error' });
          results.push({ id: item.id, success: false, error });
          continue;
        }

        // Get previous snapshot (USER ISOLATED)
        const prevSnapshot = await getLatestSnapshot(item.id, auth.internalUserId);

        // Save new snapshot
        await saveSnapshot({
          url_id: item.id,
          user_id: auth.internalUserId,
          content_hash: hash,
          raw_html: html,
          text_content: text,
          status: 'success',
        });

        // Compare with previous
        if (prevSnapshot && prevSnapshot.content_hash !== hash) {
          const changeRatio = calculateChangeRatio(prevSnapshot.text_content || '', text);
          
          // Only process meaningful changes (>1% change)
          if (changeRatio > 0.01) {
            const rawDiff = computeTextDiff(prevSnapshot.text_content || '', text);
            
            // Analyze with AI
            const analysis = await analyzeChangeWithAI({
              url: item.url,
              oldText: prevSnapshot.text_content || '',
              newText: text,
              rawDiff,
              changeRatio,
            });

            // Create signal for THIS USER ONLY
            const signal = await createSignal(auth.internalUserId, {
              url_id: item.id,
              category: analysis.category,
              category_name: analysis.category_name,
              importance: analysis.importance,
              importance_label: analysis.importance.toUpperCase(),
              site: getSiteName(item.url),
              title: analysis.title,
              summary: analysis.summary,
              why_it_matters: analysis.why_it_matters,
              evidence: analysis.evidence,
            });

            // Send email alert if enabled in settings
            try {
              const settings = await getUserSettings(auth.internalUserId);
              const shouldEmail = settings?.email_alerts !== false;
              const passesFilter = !settings?.only_high_importance || analysis.importance === 'high';
              
              if (shouldEmail && passesFilter && auth.email) {
                // Don't await — send in background
                sendSignalAlert({
                  toEmail: auth.email,
                  signal: {
                    title: analysis.title,
                    site: getSiteName(item.url),
                    summary: analysis.summary,
                    why_it_matters: analysis.why_it_matters,
                    importance: analysis.importance,
                    category_name: analysis.category_name,
                    detected_at: signal.detected_at,
                  },
                }).catch(emailErr => console.warn('[EMAIL] Alert send failed:', emailErr.message));
              }
            } catch (emailErr: any) {
              console.warn('[EMAIL] Could not send alert:', emailErr.message);
            }
          }
        }

        // Update URL status
        await updateWatchlistItem(auth.internalUserId, item.id, {
          status: 'watching',
          last_content_hash: hash,
          last_scan: new Date().toISOString(),
        });

        results.push({ id: item.id, success: true });
      } catch (itemErr: any) {
        console.error(`Error scanning ${item.url}:`, itemErr);
        results.push({ id: item.id, success: false, error: itemErr.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      scanned: results.length,
      results 
    });
  } catch (err: any) {
    console.error('Scrape API error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
