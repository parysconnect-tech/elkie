import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Session, User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import { hasSupabase, supabase } from './supabase'
import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export type SignInResult = { ok: true } | { ok: false; error: string }
export type SignUpResult =
  | { ok: true; requiresEmailConfirmation: boolean }
  | { ok: false; error: string }

type AuthContextValue = {
  /** Loaded session from Supabase Auth (null until we hear back) */
  session: Session | null
  /** The user record on the session (null = logged out) */
  user: User | null
  /** The matching row from the `profiles` table (includes role + plan) */
  profile: Profile | null
  /** True while we're still figuring out whether the user is signed in */
  loading: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (
    email: string,
    password: string,
    businessName: string,
  ) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthContextValue | null>(null)

/* ============================== stub mode ============================== */
//
// When Supabase isn't configured we pretend the developer is signed in as
// admin so the dashboard and /admin routes are still reachable in local
// development. The dev can toggle this off via the sign-out button — the
// flag is held in localStorage so it survives reloads.
//
// To force "logged out" in stub mode:
//   localStorage.setItem('elkie-stub-auth', 'off')
//
// To restore "logged in admin":
//   localStorage.removeItem('elkie-stub-auth')   // or set to 'on'
//
const STUB_AUTH_FLAG = 'elkie-stub-auth'

function readStubLoggedIn(): boolean {
  try {
    return window.localStorage.getItem(STUB_AUTH_FLAG) !== 'off'
  } catch {
    return true
  }
}

function setStubLoggedIn(value: boolean) {
  try {
    window.localStorage.setItem(STUB_AUTH_FLAG, value ? 'on' : 'off')
  } catch {
    /* private mode, ignore */
  }
}

const STUB_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'dev@elkie.com',
  user_metadata: { business_name: 'Elkie (dev)' },
} as unknown as User

const STUB_PROFILE: Profile = {
  id: STUB_USER.id,
  role: 'admin',
  business_name: 'Elkie (dev)',
  plan: 'pro',
  domain: null,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/* ============================== provider ============================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  /** Only used in stub mode — flips when the user fakes a sign-out */
  const [stubLoggedIn, setStubLoggedInState] = useState(() =>
    typeof window === 'undefined' ? true : readStubLoggedIn(),
  )

  // -------------------------------------------------------------------
  // Stub mode — synthesize a session locally
  // -------------------------------------------------------------------
  useEffect(() => {
    if (hasSupabase()) return
    if (stubLoggedIn) {
      setSession({ user: STUB_USER } as unknown as Session)
      setProfile(STUB_PROFILE)
    } else {
      setSession(null)
      setProfile(null)
    }
    setLoading(false)
  }, [stubLoggedIn])

  // -------------------------------------------------------------------
  // Real mode — listen to Supabase auth state
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!hasSupabase() || !supabase) return

    let cancelled = false

    const fetchProfile = async (userId: string) => {
      if (!supabase) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (cancelled) return
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('[auth] profile fetch failed:', error.message)
        setProfile(null)
      } else {
        setProfile(data)
      }
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return
        setSession(data.session)
        if (data.session?.user) {
          void fetchProfile(data.session.user.id)
        }
        setLoading(false)
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('[auth] getSession failed:', e)
        setLoading(false)
      })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        if (newSession?.user) {
          void fetchProfile(newSession.user.id)
        } else {
          setProfile(null)
        }
      },
    )

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  // -------------------------------------------------------------------
  // Operations
  // -------------------------------------------------------------------
  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      if (!hasSupabase() || !supabase) {
        // Stub mode — pretend the sign-in worked and flip the flag back on
        setStubLoggedIn(true)
        setStubLoggedInState(true)
        return { ok: true }
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, error: error.message }
      return { ok: true }
    },
    [],
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      businessName: string,
    ): Promise<SignUpResult> => {
      if (!hasSupabase() || !supabase) {
        setStubLoggedIn(true)
        setStubLoggedInState(true)
        return { ok: true, requiresEmailConfirmation: false }
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { business_name: businessName },
        },
      })
      if (error) return { ok: false, error: error.message }

      // If the Supabase project has email-confirmation enabled, the user is
      // created but no session is returned until they click the verify link.
      const requiresEmailConfirmation = data.session == null

      return { ok: true, requiresEmailConfirmation }
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (!hasSupabase() || !supabase) {
      setStubLoggedIn(false)
      setStubLoggedInState(false)
      return
    }
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [session, profile, loading, signIn, signUp, signOut],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

/* ============================== guards ============================== */

/**
 * Wraps a route group that requires an authenticated user. Sends visitors
 * to /login if they aren't signed in, preserving the path they were trying
 * to reach so login can bounce them back after success.
 */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

/**
 * Wraps a route group that requires the `admin` role. Logged-in non-admins
 * land on /dashboard instead.
 */
export function RequireAdmin() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function AuthLoadingScreen() {
  return (
    <div className="bg-bg text-text-muted flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm">
        <Loader2 className="text-accent animate-spin" size={18} />
        <span>Loading your session…</span>
      </div>
    </div>
  )
}
