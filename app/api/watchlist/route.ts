import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { 
  getUserWatchlist, 
  addToWatchlist, 
  updateWatchlistItem, 
  deleteFromWatchlist 
} from '@/lib/db';
import { fetchPageContent } from '@/lib/scraper';
import { normalizeUrl, ensureHttp } from '@/lib/utils';

// ============================================================
// GET /api/watchlist — Get user's watchlist (USER ISOLATED)
// ============================================================
export async function GET(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const watchlist = await getUserWatchlist(auth.internalUserId);
    return NextResponse.json({ success: true, watchlist });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/watchlist — Add URL to watchlist (USER ISOLATED)
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
    const { name, url, category = 'General', scan_frequency = 'daily', noise_sensitivity = 'balanced' } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const cleanUrl = ensureHttp(url);
    const displayName = name?.trim() || new URL(cleanUrl).hostname.replace(/^www\./, '');

    const item = await addToWatchlist(auth.internalUserId, {
      name: displayName,
      url: cleanUrl,
      category,
      scan_frequency,
      noise_sensitivity,
    });

    // Baseline scrape in background (don't await)
    (async () => {
      try {
        const { html, text, hash, success } = await fetchPageContent(cleanUrl);
        if (success) {
          await updateWatchlistItem(auth.internalUserId, item.id, {
            last_content_hash: hash,
            last_scan: new Date().toISOString(),
            status: 'watching',
          });
        }
      } catch (scrapeErr) {
        console.warn('Initial scrape failed:', scrapeErr);
      }
    })();

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    console.error('Error adding URL:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/watchlist — Update watchlist item (USER ISOLATED)
// ============================================================
export async function PATCH(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const item = await updateWatchlistItem(auth.internalUserId, id, updates);
    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/watchlist — Remove from watchlist (USER ISOLATED)
// ============================================================
export async function DELETE(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await deleteFromWatchlist(auth.internalUserId, id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
