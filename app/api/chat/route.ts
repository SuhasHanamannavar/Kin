import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { 
  getUserChatMessages, 
  addChatMessage,
  getUserWatchlist,
  getUserSignals
} from '@/lib/db';
import { chatWithKinAI } from '@/lib/ai';

// ============================================================
// GET /api/chat — Get user's chat history (USER ISOLATED)
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
    const messages = await getUserChatMessages(auth.internalUserId);
    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/chat — Send message to Kin AI (USER ISOLATED)
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
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get USER-ISOLATED context
    const watchlist = await getUserWatchlist(auth.internalUserId);
    const signals = await getUserSignals(auth.internalUserId, { limit: 15 });

    // Call AI with ONLY this user's data
    const aiResponse = await chatWithKinAI({
      message,
      watchlistContext: watchlist,
      signalsContext: signals,
      conversationHistory,
      userId: auth.internalUserId,
    });

    // Save to this user's chat history only
    await addChatMessage(auth.internalUserId, 'user', message);
    await addChatMessage(auth.internalUserId, 'assistant', aiResponse);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      quickReplies: [
        'What are the most important updates?',
        'Any deadlines or pricing changes?',
        'Scan my watchlist now',
      ],
    });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
