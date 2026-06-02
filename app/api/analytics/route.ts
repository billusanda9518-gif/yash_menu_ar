import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ALLOWED_EVENT_TYPES = new Set([
  'menu_view',
  'dish_view',
  'ar_view',
  'qr_scan',
]);

const MAX_EVENTS_PER_REQUEST = 50;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface IncomingEvent {
  restaurant_id: string;
  event_type: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

/* ------------------------------------------------------------------ */
/*  POST /api/analytics                                                */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Request body must include an "events" array.' },
        { status: 400 },
      );
    }

    const events: IncomingEvent[] = body.events;

    // Rate limiting: reject if more than 50 events in a single request
    if (events.length > MAX_EVENTS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Too many events. Maximum ${MAX_EVENTS_PER_REQUEST} per request.` },
        { status: 429 },
      );
    }

    if (events.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    // Extract IP and user-agent from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') ?? '0.0.0.0';

    const headerUserAgent = request.headers.get('user-agent') ?? '';

    // Validate and build rows
    const rows: Array<{
      restaurant_id: string;
      event_type: string;
      session_id: string | null;
      user_agent: string;
      ip_address: string;
      metadata: Record<string, unknown> | null;
      created_at: string;
    }> = [];

    const validationErrors: string[] = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (!event.restaurant_id || typeof event.restaurant_id !== 'string') {
        validationErrors.push(`events[${i}]: missing or invalid restaurant_id`);
        continue;
      }

      if (!event.event_type || !ALLOWED_EVENT_TYPES.has(event.event_type)) {
        validationErrors.push(
          `events[${i}]: invalid event_type "${event.event_type}". Must be one of: ${[...ALLOWED_EVENT_TYPES].join(', ')}`,
        );
        continue;
      }

      rows.push({
        restaurant_id: event.restaurant_id,
        event_type: event.event_type,
        session_id: event.session_id ?? null,
        user_agent: headerUserAgent,
        ip_address: ipAddress,
        metadata: event.metadata ?? null,
        created_at: event.timestamp ?? new Date().toISOString(),
      });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid events to insert.', details: validationErrors },
        { status: 400 },
      );
    }

    // Insert into analytics_events table
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert(rows);

    if (error) {
      console.error('[analytics] Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to insert analytics events.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      inserted: rows.length,
      ...(validationErrors.length > 0 && { warnings: validationErrors }),
    });
  } catch (err) {
    console.error('[analytics] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    );
  }
}
