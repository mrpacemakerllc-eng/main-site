'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Generate or retrieve session ID
function getSessionId() {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

// Track a page view
async function trackPageView(path: string, referrer?: string, duration?: number) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    await fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, path, referrer, duration }),
    });
  } catch (e) {
    // Silent fail
  }
}

// Track an event
export async function trackEvent(event: string, data?: Record<string, any>) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        event,
        data,
        path: typeof window !== 'undefined' ? window.location.pathname : null,
      }),
    });
  } catch (e) {
    // Silent fail
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    // Track page view on path change
    if (pathname !== lastPathRef.current) {
      // Track duration for previous page
      if (lastPathRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackPageView(lastPathRef.current, undefined, duration);
      }

      // Track new page view
      trackPageView(pathname, document.referrer);
      startTimeRef.current = Date.now();
      lastPathRef.current = pathname;
    }

    // Track duration on page unload
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      // Use sendBeacon for reliable tracking on page exit
      navigator.sendBeacon('/api/analytics/pageview', JSON.stringify({
        sessionId: getSessionId(),
        path: pathname,
        duration,
      }));
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname]);

  return null; // This component doesn't render anything
}
