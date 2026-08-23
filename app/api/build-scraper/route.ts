import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { buildScraperFromPrompt } from '@/lib/ai';

// ============================================================
// POST /api/build-scraper — Build scraper config from natural language
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
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const config = await buildScraperFromPrompt(prompt, auth.internalUserId);

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (err: any) {
    console.error('Build scraper API error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
