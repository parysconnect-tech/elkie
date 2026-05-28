/**
 * Admin data layer.
 *
 * Each function returns realistic mock data when Supabase isn't configured
 * (stub mode), and queries the real database when keys are set. The shape
 * is identical either way so admin components don't branch on mode.
 */

import { hasSupabase, supabase } from './supabase'
import { findPlan } from './plans'
import { PROJECTS } from './projects'

/* ============================== stats ============================== */

export type AdminStats = {
  leads30d: number
  activeClients: number
  mrrUsd: number
  pageViews7d: number
}

const STUB_STATS: AdminStats = {
  leads30d: 42,
  activeClients: 18,
  mrrUsd: 614,
  pageViews7d: 1284,
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!hasSupabase() || !supabase) return STUB_STATS

  const now = Date.now()
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [leadsRes, clientsRes, viewsRes] = await Promise.all([
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .is('client_id', null)
      .eq('lead_type', 'client')
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('profiles')
      .select('id, plan')
      .eq('role', 'client')
      .not('plan', 'is', null),
    supabase
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .is('site_id', null)
      .gte('created_at', sevenDaysAgo),
  ])

  const mrr = (clientsRes.data ?? []).reduce((sum, row) => {
    const plan = findPlan(row.plan ?? undefined)
    return sum + (plan?.monthlyUsd ?? 0)
  }, 0)

  return {
    leads30d: leadsRes.count ?? 0,
    activeClients: clientsRes.data?.length ?? 0,
    mrrUsd: mrr,
    pageViews7d: viewsRes.count ?? 0,
  }
}

/* ============================== activity ============================== */

export type ActivityEvent = {
  id: string
  type: 'new_lead' | 'new_partner' | 'new_signup' | 'plan_upgrade'
  createdAt: string
  /** Business name or person's name */
  who: string
  /** Email if available */
  email?: string
  /** Plan slug if relevant */
  plan?: string
  /** Optional link target inside admin */
  href?: string
}

const STUB_ACTIVITY: ActivityEvent[] = [
  {
    id: '1',
    type: 'new_lead',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    who: 'Cape Bistro',
    email: 'maria@capebistro.com',
    plan: 'pro',
    href: '/admin/messages',
  },
  {
    id: '2',
    type: 'new_partner',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    who: 'Alex Rivera',
    email: 'alex@yourside.com',
    href: '/admin/messages',
  },
  {
    id: '3',
    type: 'new_signup',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    who: 'Iron & Oak Builders',
    email: 'tom@ironoakbuilders.com',
    plan: 'custom',
    href: '/admin/clients',
  },
  {
    id: '4',
    type: 'new_lead',
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    who: 'Lumina Spa',
    email: 'hello@luminaspa.co',
    plan: 'starter',
    href: '/admin/messages',
  },
  {
    id: '5',
    type: 'plan_upgrade',
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    who: 'Tessera Goods',
    email: 'orders@tesseragoods.com',
    plan: 'pro',
    href: '/admin/clients',
  },
  {
    id: '6',
    type: 'new_lead',
    createdAt: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    who: 'North Light Studio',
    email: 'studio@northlight.de',
    plan: 'pro',
    href: '/admin/messages',
  },
  {
    id: '7',
    type: 'new_signup',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    who: 'Reps & Reps Coaching',
    email: 'james@repsandreps.com',
    plan: 'starter',
    href: '/admin/clients',
  },
  {
    id: '8',
    type: 'new_lead',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    who: 'Jordan Reyes',
    email: 'studio@jordanreyes.com',
    plan: 'pro',
    href: '/admin/messages',
  },
]

export async function getRecentActivity(limit = 8): Promise<ActivityEvent[]> {
  if (!hasSupabase() || !supabase) return STUB_ACTIVITY.slice(0, limit)

  // Fetch recent leads (messages with client_id null) + recent client signups
  const [leadsRes, signupsRes] = await Promise.all([
    supabase
      .from('messages')
      .select('id, business_name, email, plan, lead_type, created_at')
      .is('client_id', null)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('profiles')
      .select('id, business_name, plan, created_at')
      .eq('role', 'client')
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  const events: ActivityEvent[] = []

  for (const row of leadsRes.data ?? []) {
    events.push({
      id: `lead-${row.id}`,
      type: row.lead_type === 'partner' ? 'new_partner' : 'new_lead',
      createdAt: row.created_at,
      who: row.business_name || row.email,
      email: row.email,
      plan: row.plan ?? undefined,
      href: '/admin/messages',
    })
  }

  for (const row of signupsRes.data ?? []) {
    events.push({
      id: `signup-${row.id}`,
      type: 'new_signup',
      createdAt: row.created_at,
      who: row.business_name || 'New client',
      plan: row.plan ?? undefined,
      href: '/admin/clients',
    })
  }

  events.sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  )

  return events.slice(0, limit)
}

/* ============================== messages ============================== */

export type AdminMessage = {
  id: string
  createdAt: string
  leadType: 'client' | 'partner' | 'contact'
  businessName: string | null
  email: string
  category: string | null
  about: string | null
  features: string[]
  plan: string | null
  domain: string | null
  metadata: Record<string, unknown>
  status: 'new' | 'read' | 'replied' | 'archived'
  turnstileVerified: boolean
}

const NOW = Date.now()
const min = (n: number) => new Date(NOW - n * 60 * 1000).toISOString()
const hours = (n: number) => new Date(NOW - n * 60 * 60 * 1000).toISOString()
const days = (n: number) => new Date(NOW - n * 24 * 60 * 60 * 1000).toISOString()

const STUB_MESSAGES: AdminMessage[] = [
  {
    id: 'stub-1',
    createdAt: min(12),
    leadType: 'client',
    businessName: 'Cape Bistro',
    email: 'maria@capebistro.com',
    category: 'Restaurant',
    about:
      'A small neighbourhood bistro serving locally-sourced food, six days a week. Our regulars come for the lasagne.',
    features: ['About page', 'Contact form', 'Photo gallery', 'Booking widget'],
    plan: 'pro',
    domain: 'capebistro.com',
    metadata: { inspiration: 'Stripe, Linear' },
    status: 'new',
    turnstileVerified: true,
  },
  {
    id: 'stub-2',
    createdAt: hours(2),
    leadType: 'partner',
    businessName: 'Alex Rivera',
    email: 'alex@yourside.com',
    category: null,
    about:
      'I run a small Instagram agency in Madrid and my clients keep asking me for websites. Would love to add this without learning to code.',
    features: [],
    plan: null,
    domain: null,
    metadata: { country: 'Spain', experience: 'agency-owner', monthlyVolume: '3-5' },
    status: 'new',
    turnstileVerified: true,
  },
  {
    id: 'stub-3',
    createdAt: hours(4),
    leadType: 'client',
    businessName: 'Iron & Oak Builders',
    email: 'tom@ironoakbuilders.com',
    category: 'Services',
    about:
      'Family contracting business — 20 years of trade work. Need a site to look more legit to corporate clients.',
    features: ['About page', 'Photo gallery', 'Contact form'],
    plan: 'custom',
    domain: null,
    metadata: {},
    status: 'read',
    turnstileVerified: true,
  },
  {
    id: 'stub-4',
    createdAt: hours(9),
    leadType: 'client',
    businessName: 'Lumina Spa',
    email: 'hello@luminaspa.co',
    category: 'Services',
    about: 'Boutique spa, 3 therapists. Need bookings online ASAP.',
    features: ['Booking widget', 'Pricing page', 'Contact form'],
    plan: 'starter',
    domain: null,
    metadata: {},
    status: 'replied',
    turnstileVerified: true,
  },
  {
    id: 'stub-5',
    createdAt: hours(27),
    leadType: 'client',
    businessName: 'North Light Studio',
    email: 'studio@northlight.de',
    category: 'Portfolio',
    about:
      'Two-person creative studio in Berlin. Looking for a site that signals "we are not boring".',
    features: ['Photo gallery', 'About page', 'Contact form'],
    plan: 'pro',
    domain: 'northlight.de',
    metadata: { inspiration: 'Pentagram, Brutalist Websites' },
    status: 'new',
    turnstileVerified: true,
  },
  {
    id: 'stub-6',
    createdAt: days(3),
    leadType: 'client',
    businessName: 'Jordan Reyes',
    email: 'studio@jordanreyes.com',
    category: 'Portfolio',
    about: 'Commercial photographer based in Lisbon. Need a portfolio site.',
    features: ['Photo gallery', 'About page'],
    plan: 'pro',
    domain: null,
    metadata: {},
    status: 'archived',
    turnstileVerified: true,
  },
  {
    id: 'stub-7',
    createdAt: days(5),
    leadType: 'partner',
    businessName: 'Priya Singh',
    email: 'priya@hellocoffee.in',
    category: null,
    about:
      "I'm a freelance web designer in Bangalore. Tired of building from scratch — want to flip Elkie's stack instead.",
    features: [],
    plan: null,
    domain: null,
    metadata: { country: 'India', experience: 'freelancer', monthlyVolume: '6-10' },
    status: 'replied',
    turnstileVerified: true,
  },
]

export type MessageFilter = {
  status?: AdminMessage['status'] | 'all'
  leadType?: AdminMessage['leadType'] | 'all'
}

export async function getMessages(filter: MessageFilter = {}): Promise<AdminMessage[]> {
  if (!hasSupabase() || !supabase) {
    return STUB_MESSAGES.filter((m) => {
      if (filter.status && filter.status !== 'all' && m.status !== filter.status) return false
      if (filter.leadType && filter.leadType !== 'all' && m.leadType !== filter.leadType)
        return false
      return true
    })
  }

  let query = supabase
    .from('messages')
    .select('*')
    .is('client_id', null)
    .order('created_at', { ascending: false })

  if (filter.status && filter.status !== 'all') {
    query = query.eq('status', filter.status)
  }
  if (filter.leadType && filter.leadType !== 'all') {
    query = query.eq('lead_type', filter.leadType)
  }

  const { data, error } = await query
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[admin] getMessages failed:', error.message)
    return []
  }

  return (data ?? []).map(rowToMessage)
}

export async function updateMessageStatus(
  id: string,
  status: AdminMessage['status'],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabase() || !supabase) {
    // eslint-disable-next-line no-console
    console.log('[admin] stub update message status', id, status)
    return { ok: true }
  }
  const { error } = await supabase
    .from('messages')
    .update({ status })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/**
 * Subscribe to realtime INSERTs on the messages table (admin-facing).
 * Returns an unsubscribe function. No-op in stub mode.
 */
export function subscribeToNewMessages(onInsert: (row: AdminMessage) => void): () => void {
  if (!hasSupabase() || !supabase) return () => {}

  const channel = supabase
    .channel('admin-messages-feed')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = payload.new as any
        // Only surface elkie.com leads (not per-client contact messages)
        if (row.client_id != null) return
        onInsert(rowToMessage(row))
      },
    )
    .subscribe()

  return () => {
    if (supabase) supabase.removeChannel(channel)
  }
}

/* ----------------------------- internals ----------------------------- */

/* ============================== clients ============================== */

export type AdminClient = {
  id: string
  businessName: string | null
  email: string | null
  plan: string | null
  domain: string | null
  status: 'active' | 'paused' | 'cancelled'
  mrrUsd: number
  createdAt: string
}

const STUB_CLIENTS: AdminClient[] = [
  {
    id: 'c1',
    businessName: 'Cape Bistro',
    email: 'maria@capebistro.com',
    plan: 'pro',
    domain: 'capebistro.com',
    status: 'active',
    mrrUsd: 19,
    createdAt: days(3),
  },
  {
    id: 'c2',
    businessName: 'Iron & Oak Builders',
    email: 'tom@ironoakbuilders.com',
    plan: 'custom',
    domain: 'ironoakbuilders.com',
    status: 'active',
    mrrUsd: 9,
    createdAt: days(14),
  },
  {
    id: 'c3',
    businessName: 'Lumina Spa',
    email: 'hello@luminaspa.co',
    plan: 'starter',
    domain: null,
    status: 'active',
    mrrUsd: 5,
    createdAt: days(28),
  },
  {
    id: 'c4',
    businessName: 'North Light Studio',
    email: 'studio@northlight.de',
    plan: 'pro',
    domain: 'northlight.de',
    status: 'active',
    mrrUsd: 19,
    createdAt: days(45),
  },
  {
    id: 'c5',
    businessName: 'Reps & Reps Coaching',
    email: 'james@repsandreps.com',
    plan: 'starter',
    domain: null,
    status: 'paused',
    mrrUsd: 0,
    createdAt: days(70),
  },
  {
    id: 'c6',
    businessName: 'Tessera Goods',
    email: 'orders@tesseragoods.com',
    plan: 'pro',
    domain: 'tesseragoods.com',
    status: 'active',
    mrrUsd: 19,
    createdAt: days(91),
  },
  {
    id: 'c7',
    businessName: 'Jordan Reyes',
    email: 'studio@jordanreyes.com',
    plan: 'custom',
    domain: 'jordanreyes.com',
    status: 'cancelled',
    mrrUsd: 0,
    createdAt: days(120),
  },
]

export async function getClients(): Promise<AdminClient[]> {
  if (!hasSupabase() || !supabase) return STUB_CLIENTS

  const { data, error } = await supabase
    .from('profiles')
    .select('id, business_name, plan, domain, created_at, stripe_subscription_id')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[admin] getClients failed:', error.message)
    return []
  }

  return (data ?? []).map((row): AdminClient => {
    const plan = findPlan(row.plan ?? undefined)
    return {
      id: row.id,
      businessName: row.business_name,
      email: null, // TODO: join with auth.users via service-role view
      plan: row.plan,
      domain: row.domain,
      status: row.stripe_subscription_id ? 'active' : 'paused',
      mrrUsd: plan?.monthlyUsd ?? 0,
      createdAt: row.created_at,
    }
  })
}

/* ============================== projects ============================== */

export type AdminProject = {
  slug: string
  client: string
  category: string | null
  industry: string | null
  description: string | null
  launchedAt: string | null
  liveUrl: string | null
  isLive: boolean
  swatch: string | null
  vibe: string | null
  featured: boolean
  active: boolean
  createdAt: string
}

export async function getProjects(): Promise<AdminProject[]> {
  if (!hasSupabase() || !supabase) {
    // Pull from the static catalogue + add admin-flavored metadata
    return PROJECTS.map((p, i) => ({
      slug: p.slug,
      client: p.client,
      category: p.category,
      industry: p.industry,
      description: p.description,
      launchedAt: p.launchedAt,
      liveUrl: p.liveUrl,
      isLive: p.liveUrl != null,
      swatch: p.swatch,
      vibe: p.vibe,
      featured: i < 3, // first three are "featured" in stub
      active: true,
      createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[admin] getProjects failed:', error.message)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    slug: row.slug,
    client: row.client,
    category: row.category,
    industry: row.industry,
    description: row.description,
    launchedAt: row.launched_at,
    liveUrl: row.live_url,
    isLive: !!row.is_live,
    swatch: row.swatch,
    vibe: row.vibe,
    featured: !!row.featured,
    active: row.active !== false,
    createdAt: row.created_at,
  }))
}

export async function updateProject(
  slug: string,
  updates: Partial<Pick<AdminProject, 'featured' | 'active'>>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabase() || !supabase) {
    // eslint-disable-next-line no-console
    console.log('[admin] stub updateProject', slug, updates)
    return { ok: true }
  }
  const { error } = await supabase.from('projects').update(updates).eq('slug', slug)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/* ============================== analytics ============================== */

export type AnalyticsSummary = {
  rangeDays: number
  totalViews: number
  uniqueSessions: number
  topPages: { path: string; views: number }[]
  topReferrers: { referrer: string; visits: number }[]
  dailyViews: { date: string; views: number }[]
}

export async function getAnalytics(rangeDays: 7 | 30 | 90): Promise<AnalyticsSummary> {
  if (!hasSupabase() || !supabase) return stubAnalytics(rangeDays)

  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('page_views')
    .select('path, referrer, session_id, created_at')
    .is('site_id', null)
    .gte('created_at', since)

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[admin] getAnalytics failed:', error.message)
    return stubAnalytics(rangeDays)
  }

  const rows = data ?? []
  const totalViews = rows.length
  const uniqueSessions = new Set(rows.map((r) => r.session_id).filter(Boolean)).size

  // Top pages
  const pageMap = new Map<string, number>()
  for (const r of rows) {
    pageMap.set(r.path, (pageMap.get(r.path) ?? 0) + 1)
  }
  const topPages = [...pageMap.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([path, views]) => ({ path, views }))

  // Top referrers
  const refMap = new Map<string, number>()
  for (const r of rows) {
    const ref = r.referrer ? cleanReferrer(r.referrer) : '(direct)'
    refMap.set(ref, (refMap.get(ref) ?? 0) + 1)
  }
  const topReferrers = [...refMap.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([referrer, visits]) => ({ referrer, visits }))

  // Daily views
  const byDay = new Map<string, number>()
  for (const r of rows) {
    const day = r.created_at.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }
  const dailyViews = buildDailySeries(rangeDays, byDay)

  return { rangeDays, totalViews, uniqueSessions, topPages, topReferrers, dailyViews }
}

function stubAnalytics(rangeDays: number): AnalyticsSummary {
  // Generate a noisy upward trend
  const dailyViews: { date: string; views: number }[] = []
  let value = 80 + Math.random() * 40
  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    value = Math.max(20, value + (Math.random() - 0.4) * 40)
    dailyViews.push({ date, views: Math.round(value) })
  }
  const totalViews = dailyViews.reduce((sum, d) => sum + d.views, 0)
  return {
    rangeDays,
    totalViews,
    uniqueSessions: Math.round(totalViews * 0.62),
    topPages: [
      { path: '/', views: Math.round(totalViews * 0.4) },
      { path: '/pricing', views: Math.round(totalViews * 0.18) },
      { path: '/work', views: Math.round(totalViews * 0.12) },
      { path: '/start', views: Math.round(totalViews * 0.1) },
      { path: '/partners', views: Math.round(totalViews * 0.08) },
      { path: '/success', views: Math.round(totalViews * 0.04) },
    ],
    topReferrers: [
      { referrer: '(direct)', visits: Math.round(totalViews * 0.55) },
      { referrer: 'google.com', visits: Math.round(totalViews * 0.22) },
      { referrer: 'twitter.com', visits: Math.round(totalViews * 0.08) },
      { referrer: 'linkedin.com', visits: Math.round(totalViews * 0.06) },
      { referrer: 'reddit.com', visits: Math.round(totalViews * 0.04) },
      { referrer: 'producthunt.com', visits: Math.round(totalViews * 0.03) },
    ],
    dailyViews,
  }
}

function buildDailySeries(
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

function cleanReferrer(ref: string): string {
  try {
    const url = new URL(ref)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return ref
  }
}

/* ============================== settings ============================== */

export type AppSettings = {
  whatsapp_number?: string
  resend_from_email?: string
  resend_from_name?: string
  admin_notification_email?: string
  default_language?: string
  ga_measurement_id?: string
  admin_notify_new_lead?: boolean
  admin_notify_new_signup?: boolean
  admin_notify_new_payment?: boolean
}

const STUB_SETTINGS: AppSettings = {
  whatsapp_number: '',
  resend_from_email: 'hello@elkie.com',
  resend_from_name: 'Elkie Web Studio',
  admin_notification_email: '',
  default_language: 'en',
  ga_measurement_id: 'G-1CG236C3N9',
  admin_notify_new_lead: true,
  admin_notify_new_signup: true,
  admin_notify_new_payment: true,
}

export async function getSettings(): Promise<AppSettings> {
  if (!hasSupabase() || !supabase) {
    try {
      const raw = localStorage.getItem('elkie-stub-settings')
      if (raw) return { ...STUB_SETTINGS, ...JSON.parse(raw) }
    } catch {
      /* ignore */
    }
    return STUB_SETTINGS
  }

  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[admin] getSettings failed:', error.message)
    return STUB_SETTINGS
  }

  const out: AppSettings = {}
  for (const row of data ?? []) {
    // settings.value is jsonb — could be string, boolean, etc.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(out as Record<string, unknown>)[row.key] = row.value as any
  }
  return { ...STUB_SETTINGS, ...out }
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabase() || !supabase) {
    try {
      const raw = localStorage.getItem('elkie-stub-settings')
      const prev = raw ? JSON.parse(raw) : {}
      localStorage.setItem('elkie-stub-settings', JSON.stringify({ ...prev, ...patch }))
    } catch {
      /* ignore */
    }
    return { ok: true }
  }

  // Upsert each key/value
  const rows = Object.entries(patch).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('settings').upsert(rows)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/* ============================== internals ============================== */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMessage(row: any): AdminMessage {
  return {
    id: row.id,
    createdAt: row.created_at,
    leadType: row.lead_type ?? 'client',
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
    status: row.status ?? 'new',
    turnstileVerified: !!row.turnstile_verified,
  }
}
