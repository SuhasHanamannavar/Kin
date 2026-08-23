import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { fetchPageContent, extractText } from '@/lib/scraper';

// ============================================================
// POST /api/scrape-browser — AI Scraping Browser demo
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
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch page content (simulates browser rendering)
    const { html, text, success, error } = await fetchPageContent(url);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: error || 'Failed to fetch page',
      });
    }

    // Extract basic stats
    const linkMatches = html.match(/<a[^>]*href=/gi) || [];
    const imgMatches = html.match(/<img[^>]*src=/gi) || [];
    const words = text.split(/\s+/).filter(w => w.length > 0).length;

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled page';

    return NextResponse.json({
      success: true,
      title,
      textPreview: text.substring(0, 1000),
      links: linkMatches.length,
      images: imgMatches.length,
      wordCount: words,
    });
  } catch (err: any) {
    console.error('Scrape browser API error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
