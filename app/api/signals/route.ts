import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { 
  getUserSignals, 
  markSignalRead, 
  deleteSignal
} from '@/lib/db';

// ============================================================
// GET /api/signals — Get user's signals (USER ISOLATED)
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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const importance = searchParams.get('importance') || undefined;
    const search = searchParams.get('search') || undefined;

    const signals = await getUserSignals(auth.internalUserId, {
      category,
      importance,
      search,
    });

    const unreadCount = signals.filter(s => !s.read).length;

    return NextResponse.json({
      success: true,
      signals,
      unreadCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/signals — Mark signal as read/unread (USER ISOLATED)
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
    const { id, read = true } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const signal = await markSignalRead(auth.internalUserId, id, read);
    return NextResponse.json({ success: true, signal });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/signals — Delete signal (USER ISOLATED)
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

    await deleteSignal(auth.internalUserId, id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
