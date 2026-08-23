import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-helper';
import { 
  getUserCollectors, 
  createCollector, 
  updateCollector, 
  deleteCollector 
} from '@/lib/db';
import { ensureHttp } from '@/lib/utils';
import { 
  createBrightDataCollector, 
  deleteBrightDataCollector,
  isBrightDataEnabled 
} from '@/lib/brightdata';

// ============================================================
// GET /api/collectors — Get user's collectors (USER ISOLATED)
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
    const collectors = await getUserCollectors(auth.internalUserId);
    return NextResponse.json({ 
      success: true, 
      collectors,
      brightdata_enabled: isBrightDataEnabled(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/collectors — Create new collector (USER ISOLATED)
// 
// Flow:
// 1. User types plain English in "Build with Kin"
// 2. AI generates config
// 3. User confirms → this endpoint is called
// 4. We create a REAL collector in Bright Data (if key configured)
// 5. We store the Bright Data collector ID alongside Kin's internal ID
// 6. Collector appears in BOTH Kin AND Bright Data dashboards
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
    const { 
      name, 
      website_url, 
      selector_config = {}, 
      built_with_kin = false,
      natural_language_prompt = null,
      url_id = null,
      frequency = 'daily',
      key_elements = [],
    } = body;

    if (!name || !website_url) {
      return NextResponse.json(
        { success: false, error: 'Name and website URL are required' },
        { status: 400 }
      );
    }

    const cleanUrl = ensureHttp(website_url);

    // Step 1: Create collector in Bright Data (if configured)
    // This makes it appear in the Bright Data dashboard too
    let brightdataCollectorId: string | undefined;
    let brightdataWarning: string | undefined;

    if (isBrightDataEnabled()) {
      const bdResult = await createBrightDataCollector({
        name: `Kin — ${name}`,
        url: cleanUrl,
        frequency,
        selectors: selector_config?.selectors || [],
        key_elements,
      });

      if (bdResult.success && bdResult.collector_id) {
        brightdataCollectorId = bdResult.collector_id;
      }
      if (bdResult.error) {
        brightdataWarning = bdResult.error;
      }
    }

    // Step 2: Create collector in Kin's database (with Bright Data ID reference)
    const collector = await createCollector(auth.internalUserId, {
      url_id,
      brightdata_collector_id: brightdataCollectorId,
      name,
      website_url: cleanUrl,
      selector_config,
      built_with_kin,
      natural_language_prompt,
    });

    return NextResponse.json({ 
      success: true, 
      collector,
      brightdata_enabled: isBrightDataEnabled(),
      brightdata_collector_id: brightdataCollectorId,
      warning: brightdataWarning,
    });
  } catch (err: any) {
    console.error('Create collector error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/collectors — Update collector (USER ISOLATED)
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

    const collector = await updateCollector(auth.internalUserId, id, updates);
    return NextResponse.json({ success: true, collector });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/collectors — Delete collector (USER ISOLATED)
// Also deletes from Bright Data if it has a brightdata_collector_id
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

    // Get collector first to find brightdata_collector_id
    const collectors = await getUserCollectors(auth.internalUserId);
    const collector = collectors.find(c => c.id === id);

    // Delete from Bright Data if it has a reference
    if (collector?.brightdata_collector_id && isBrightDataEnabled()) {
      try {
        await deleteBrightDataCollector(collector.brightdata_collector_id);
      } catch (bdErr: any) {
        console.warn('[BrightData] Failed to delete from Bright Data, continuing with Kin delete:', bdErr.message);
      }
    }

    // Delete from Kin's database
    await deleteCollector(auth.internalUserId, id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
