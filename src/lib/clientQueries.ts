/**
 * Client-facing data layer for the /dashboard/* pages.
 *
 * Mirrors adminQueries.ts: realistic mock data in stub mode, real
 * Supabase queries (scoped to the signed-in client) in real mode.
 */

import { hasSupabase, supabase } from './supabase'
import type { AdminMessage, AnalyticsSummary } from './adminQueries'

/* ============================== site content ============================== */

export type SiteContent = {
  businessName: string
  tagline: string
  about: string
  contactEmail: string
  contactPhone: string
  address: string
  hours: string
}

const EMPTY_CONTENT: SiteContent = {
  businessName: '',
  tagline: '',
  about: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  hours: '',
}

const CONTENT_STUB_KEY = 'elkie-stub-site-content'

export async function getSiteContent(clientId: string): Promise<SiteContent> {
  if (!hasSupabase() || !supabase) {
    try {
      const raw = localStorage.getItem(CONTENT_STUB_KEY)
      if (raw) return { ...EMPTY_CONTENT, ...JSON.parse(raw) }
    } catch {
      /* ignore */
    }
    // Seed with something so the form isn't blank in dev
    return {
      businessName: 'Cape Bistro',
      tagline: 'Slow-cooked. Locally sourced.',
      about:
        'A small neighbourhood kitchen serving honest food, six days a week. Our regulars come for the lasagne.',
      contactEmail: 'hello@capebistro.com',
      contactPhone: '+27 21 000 0000',
      address: '12 Kloof Street, Cape Town',
      hours: 'Tue–Sun · 11:00–22:00\nClosed Mondays',
    }
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()

  if (error || !data) return EMPTY_CONTENT

  return {
    businessName: data.business_name ?? '',
    tagline: data.tagline ?? '',
    about: data.about ?? '',
    contactEmail: data.contact_email ?? '',
    contactPhone: data.contact_phone ?? '',
    address: data.address ?? '',
    hours: data.hours ?? '',
  }
}

export async function saveSiteContent(
  clientId: string,
  content: SiteContent,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabase() || !supabase) {
    try {
      localStorage.setItem(CONTENT_STUB_KEY, JSON.stringify(content))
    } catch {
      /* ignore */
    }
    return { ok: true }
  }

  const { error } = await supabase.from('site_content').upsert({
    client_id: clientId,
    business_name: content.businessName,
    tagline: content.tagline,
    about: content.about,
    contact_email: content.contactEmail,
    contact_phone: content.contactPhone,
    address: content.address,
    hours: content.hours,
    updated_at: new Date().toISOString(),
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/* ============================== client messages ============================== */

const NOW = Date.now()
const hrs = (n: number) => new Date(NOW - n * 60 * 60 * 1000).toISOString()
const dys = (n: number) => new Date(NOW - n * 24 * 60 * 60 * 1000).toISOString()

const STUB_CLIENT_MESSAGES: AdminMessage[] = [
  {
    id: 'cm-1',
    createdAt: hrs(3),
    leadType: 'contact',
    businessName: null,
    email: 'janehotmail@example.com',
    category: null,
    about: 'Hi! Do you cater for private events on Sundays? Party of 12.',
    features: [],
    plan: null,
    domain: null,
    metadata: {},
    status: 'new',
    turnstileVerified: true,
  },
  {
    id: 'cm-2',
    createdAt: hrs(20),
    leadType: 'contact',
    businessName: null,
    email: 'marco@example.com',
    category: null,
    about: 'Are you open on the public holiday next week?',
    features: [],
    plan: null,
    domain: null,
    metadata: {},
    status: 'read',
    turnstileVerified: true,
  },
  {
    id: 'cm-3',
    createdAt: dys(2),
    leadType: 'contact',
    businessName: null,
    email: 'suzie@example.com',
    category: null,
    about: 'Do you have vegan options on the menu? Looking to book for 4.',
    features: [],
    plan: null,
    domain: null,
    metadata: {},
    status: 'replied',
    turnstileVerified: true,
  },
]

export async function getClientMessages(clientId: string): Promise<AdminMessage[]> {
  if (!hasSupabase() || !supabase) return STUB_CLIENT_MESSAGES

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[client] getClientMessages failed:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    leadType: (row.lead_type ?? 'contact') as AdminMessage['leadType'],
    businessName: row.business_name,
    email: row.email,
    category: row.category,
    about: row.about,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    plan: row.plan,
    domain: row.domain,
    metadata:
      typeof row.metadata === 'object' && row.metadata != null
        ? (row.metadata as Record<string, unknown>)
        : {},
    status: row.status as AdminMessage['status'],
    turnstileVerified: !!row.turnstile_verified,
  }))
}

export async function updateClientMessageStatus(
  id: string,
  status: AdminMessage['status'],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabase() || !supabase) return { ok: true }
  const { error } = await supabase.from('messages').update({ status }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/* ============================== client analytics ============================== */

export async function getClientAnalytics(
  clientId: string,
  rangeDays: 7 | 30 | 90,
): Promise<AnalyticsSummary> {
  if (!hasSupabase() || !supabase) return stubClientAnalytics(rangeDays)

  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('page_views')
    .select('path, referrer, session_id, created_at')
    .eq('site_id', clientId)
    .gte('created_at', since)

  if (error || !data) return stubClientAnalytics(rangeDays)

  const totalViews = data.length
  const uniqueSessions = new Set(data.map((r) => r.session_id).filter(Boolean)).size

  const pageMap = new Map<string, number>()
  const refMap = new Map<string, number>()
  const byDay = new Map<string, number>()
  for (const r of data) {
    pageMap.set(r.path, (pageMap.get(r.path) ?? 0) + 1)
    const ref = r.referrer ? cleanRef(r.referrer) : '(direct)'
    refMap.set(ref, (refMap.get(ref) ?? 0) + 1)
    const day = r.created_at.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  return {
    rangeDays,
    totalViews,
    uniqueSessions,
    topPages: topN(pageMap).map(([path, views]) => ({ path, views })),
    topReferrers: topN(refMap).map(([referrer, visits]) => ({ referrer, visits })),
    dailyViews: dailySeries(rangeDays, byDay),
  }
}

function stubClientAnalytics(rangeDays: number): AnalyticsSummary {
  const dailyViews: { date: string; views: number }[] = []
  let value = 12 + Math.random() * 10
  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    value = Math.max(2, value + (Math.random() - 0.4) * 10)
    dailyViews.push({ date, views: Math.round(value) })
  }
  const totalViews = dailyViews.reduce((s, d) => s + d.views, 0)
  return {
    rangeDays,
    totalViews,
    uniqueSessions: Math.round(totalViews * 0.7),
    topPages: [
      { path: '/', views: Math.round(totalViews * 0.6) },
      { path: '/menu', views: Math.round(totalViews * 0.22) },
      { path: '/contact', views: Math.round(totalViews * 0.12) },
      { path: '/about', views: Math.round(totalViews * 0.06) },
    ],
    topReferrers: [
      { referrer: '(direct)', visits: Math.round(totalViews * 0.5) },
      { referrer: 'google.com', visits: Math.round(totalViews * 0.3) },
      { referrer: 'instagram.com', visits: Math.round(totalViews * 0.14) },
      { referrer: 'facebook.com', visits: Math.round(totalViews * 0.06) },
    ],
    dailyViews,
  }
}

/* ------------------------------- helpers ------------------------------- */

function topN<T>(map: Map<T, number>, n = 6): [T, number][] {
  return [...map.entries()].sort(([, a], [, b]) => b - a).slice(0, n)
}

function dailySeries(
  rangeDays: number,
  byDay: Map<string, number>,
): { date: string; views: number }[] {
  const out: { date: string; views: number }[] = []
  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    out.push({ date, views: byDay.get(date) ?? 0 })
  }
  return out
}

function cleanRef(ref: string): string {
  try {
    return new URL(ref).hostname.replace(/^www\./, '')
  } catch {
    return ref
  }
}
