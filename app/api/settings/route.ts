import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { getUserSettings, upsertUserSettings } from '@/lib/db';

// ============================================================
// GET /api/settings — Get user's settings (USER ISOLATED)
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
    let settings = await getUserSettings(auth.internalUserId);
    
    // Create default settings if none exist
    if (!settings) {
      settings = await upsertUserSettings(auth.internalUserId, {});
    }

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/settings — Update user's settings (USER ISOLATED)
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
    const settings = await upsertUserSettings(auth.internalUserId, body);
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
