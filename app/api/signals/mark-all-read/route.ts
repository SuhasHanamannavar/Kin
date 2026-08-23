import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { createServiceClient } from '@/supabase/server';

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
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('signals')
      .update({ read: true })
      .eq('user_id', auth.internalUserId) // CRITICAL: USER ISOLATION
      .eq('read', false);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
