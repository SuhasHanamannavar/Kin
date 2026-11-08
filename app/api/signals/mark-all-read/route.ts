import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { markAllSignalsRead } from '@/lib/db';

// ============================================================
// POST /api/signals/mark-all-read — Mark all user's signals as read
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
    await markAllSignalsRead(auth.internalUserId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
