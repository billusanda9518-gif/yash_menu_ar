'use client';

import { useEffect, useRef, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type EventType = 'menu_view' | 'dish_view' | 'ar_view' | 'qr_scan';

interface AnalyticsEvent {
  restaurant_id: string;
  event_type: EventType;
  session_id: string;
  user_agent: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Session ID                                                         */
/* ------------------------------------------------------------------ */

let cachedSessionId: string | null = null;

/**
 * Generate or retrieve a UUID-like session ID stored in sessionStorage.
 * Falls back to an in-memory ID when sessionStorage is unavailable.
 */
export function generateSessionId(): string {
  if (cachedSessionId) return cachedSessionId;

  const STORAGE_KEY = 'ar_menu_session_id';

  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) {
      cachedSessionId = existing;
      return existing;
    }
  } catch {
    // sessionStorage unavailable (SSR, privacy mode, etc.)
  }

  // crypto.randomUUID is available in all modern browsers
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Ignore storage errors
  }

  cachedSessionId = id;
  return id;
}

/* ------------------------------------------------------------------ */
/*  Event batching & flushing                                          */
/* ------------------------------------------------------------------ */

let eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY_MS = 2_000;
const MAX_BATCH_SIZE = 50;

async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, MAX_BATCH_SIZE);

  try {
    const res = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      // Use keepalive so the request survives page unloads
      keepalive: true,
    });

    if (!res.ok) {
      console.error('[analytics] Flush failed:', res.status);
    }
  } catch (err) {
    console.error('[analytics] Flush error:', err);
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents();
  }, FLUSH_DELAY_MS);
}

/* Flush remaining events when the user navigates away */
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });

  window.addEventListener('pagehide', () => {
    flushEvents();
  });
}

/* ------------------------------------------------------------------ */
/*  trackEvent                                                         */
/* ------------------------------------------------------------------ */

/**
 * Queue an analytics event. Events are batched and flushed every 2 seconds.
 */
export function trackEvent(
  restaurantId: string,
  eventType: EventType,
  metadata?: Record<string, unknown>,
): void {
  const event: AnalyticsEvent = {
    restaurant_id: restaurantId,
    event_type: eventType,
    session_id: generateSessionId(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    metadata,
    timestamp: new Date().toISOString(),
  };

  eventQueue.push(event);

  // Flush immediately if the queue is full
  if (eventQueue.length >= MAX_BATCH_SIZE) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    flushEvents();
  } else {
    scheduleFlush();
  }
}

/* ------------------------------------------------------------------ */
/*  useTrackPageView hook                                              */
/* ------------------------------------------------------------------ */

/**
 * Fires a `menu_view` event once when the component mounts.
 */
export function useTrackPageView(restaurantId: string): void {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !restaurantId) return;
    tracked.current = true;
    trackEvent(restaurantId, 'menu_view');
  }, [restaurantId]);
}

/* ------------------------------------------------------------------ */
/*  useTrackQRScan hook                                                */
/* ------------------------------------------------------------------ */

/**
 * Fires a `qr_scan` event once when the component mounts and a table param is present.
 */
export function useTrackQRScan(restaurantId: string, tableNumber?: string | null): void {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !restaurantId || !tableNumber) return;
    tracked.current = true;
    trackEvent(restaurantId, 'qr_scan', { table: tableNumber });
  }, [restaurantId, tableNumber]);
}

/* ------------------------------------------------------------------ */
/*  useTrackDishView hook                                              */
/* ------------------------------------------------------------------ */

/**
 * Returns a memoized callback to track dish views.
 */
export function useTrackDishView(restaurantId: string) {
  return useCallback(
    (dishId: string, dishName: string) => {
      trackEvent(restaurantId, 'dish_view', { dish_id: dishId, dish_name: dishName });
    },
    [restaurantId],
  );
}

/* ------------------------------------------------------------------ */
/*  useTrackARView hook                                                */
/* ------------------------------------------------------------------ */

/**
 * Fires an `ar_view` event once when the component mounts.
 */
export function useTrackARView(restaurantId: string, dishId: string, dishName: string): void {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !restaurantId || !dishId) return;
    tracked.current = true;
    trackEvent(restaurantId, 'ar_view', { dish_id: dishId, dish_name: dishName });
  }, [restaurantId, dishId, dishName]);
}

