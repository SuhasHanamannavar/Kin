import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { getUserSignals, getUserSettings } from '@/lib/db';
import { sendWeeklyDigest } from '@/lib/emails';

// ============================================================
// POST /api/digest — Send weekly digest email
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
    // Check if user has weekly digest enabled
    const settings = await getUserSettings(auth.internalUserId);
    if (settings?.weekly_digest === false) {
      return NextResponse.json({ 
        success: true, 
        skipped: true,
        reason: 'Weekly digest disabled in settings'
      });
    }

    // Get this user's signals only — from past 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const allSignals = await getUserSignals(auth.internalUserId);
    const thisWeekSignals = allSignals.filter(s => new Date(s.detected_at) >= weekAgo);

    // Apply "only high importance" filter if set
    const filteredSignals = settings?.only_high_importance
      ? thisWeekSignals.filter(s => s.importance === 'high')
      : thisWeekSignals;

    if (!auth.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'No email address available for user'
      }, { status: 400 });
    }

    // Send via Resend
    const result = await sendWeeklyDigest({
      toEmail: auth.email,
      userName: auth.name,
      signals: filteredSignals.map(s => ({
        title: s.title,
        site: s.site,
        summary: s.summary,
        importance: s.importance,
        category_name: s.category_name,
        detected_at: s.detected_at,
        why_it_matters: s.why_it_matters,
      })),
    });

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to send digest email'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      signalsCount: filteredSignals.length,
      email: auth.email,
      emailId: result.id,
    });
  } catch (err: any) {
    console.error('Digest API error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// GET /api/digest — Get digest preview data
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
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const allSignals = await getUserSignals(auth.internalUserId);
    const thisWeekSignals = allSignals.filter(s => new Date(s.detected_at) >= weekAgo);

    return NextResponse.json({
      success: true,
      signals: thisWeekSignals,
      count: thisWeekSignals.length,
      high: thisWeekSignals.filter(s => s.importance === 'high').length,
      medium: thisWeekSignals.filter(s => s.importance === 'med').length,
      low: thisWeekSignals.filter(s => s.importance === 'low').length,
      sites: new Set(thisWeekSignals.map(s => s.site)).size,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
