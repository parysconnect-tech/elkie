import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { hasSupabase, supabase } from '@/lib/supabase'

/**
 * Inserts a row into `page_views` on every route change.
 * Silently no-ops when Supabase isn't configured (stub mode).
 *
 * NOTE on `country`: we can't reliably geolocate from the browser.
 * For now we leave it null; a Cloudflare Worker (or Supabase Edge
 * Function) can backfill it from request headers later.
 */
export function usePageViewTracking() {
  const location = useLocation()

  useEffect(() => {
    if (!hasSupabase() || !supabase) return

    const sessionId = getSessionId()

    void supabase
      .from('page_views')
      .insert({
        site_id: null, // null = elkie.com
        path: location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: sessionId,
      })
      .then((res) => {
        if (res.error) {
          // Tracking must never break the UX — just warn.
          // eslint-disable-next-line no-console
          console.warn('[page-view] insert failed:', res.error.message)
        }
      })
  }, [location.pathname])
}

const STORAGE_KEY = 'elkie-session'

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(STORAGE_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
      sessionStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return `anon-${Date.now().toString(36)}`
  }
}
