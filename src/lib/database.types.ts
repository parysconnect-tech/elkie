/**
 * Typed schema for the Supabase database. Kept in lockstep with
 * supabase/migrations/0001_initial_schema.sql.
 *
 * Each table includes a `Relationships: []` field — supabase-js v2 requires
 * it, and omitting it makes every query resolve to `never`.
 *
 * Once the schema gets bigger, swap this for auto-generated types via
 *   `supabase gen types typescript --linked > src/lib/database.types.ts`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'client'
          business_name: string | null
          plan: string | null
          domain: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'client'
          business_name?: string | null
          plan?: string | null
          domain?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'client'
          business_name?: string | null
          plan?: string | null
          domain?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      messages: {
        Row: {
          id: string
          client_id: string | null
          lead_type: 'client' | 'partner' | 'contact'
          business_name: string | null
          email: string
          category: string | null
          about: string | null
          features: Json
          plan: string | null
          domain: string | null
          metadata: Json
          status: 'new' | 'read' | 'replied' | 'archived'
          turnstile_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          lead_type?: 'client' | 'partner' | 'contact'
          business_name?: string | null
          email: string
          category?: string | null
          about?: string | null
          features?: Json
          plan?: string | null
          domain?: string | null
          metadata?: Json
          status?: 'new' | 'read' | 'replied' | 'archived'
          turnstile_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          lead_type?: 'client' | 'partner' | 'contact'
          business_name?: string | null
          email?: string
          category?: string | null
          about?: string | null
          features?: Json
          plan?: string | null
          domain?: string | null
          metadata?: Json
          status?: 'new' | 'read' | 'replied' | 'archived'
          turnstile_verified?: boolean
          created_at?: string
        }
        Relationships: []
      }

      page_views: {
        Row: {
          id: string
          site_id: string | null
          path: string
          referrer: string | null
          user_agent: string | null
          country: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          site_id?: string | null
          path: string
          referrer?: string | null
          user_agent?: string | null
          country?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string | null
          path?: string
          referrer?: string | null
          user_agent?: string | null
          country?: string | null
          session_id?: string | null
          created_at?: string
        }
        Relationships: []
      }

      projects: {
        Row: {
          slug: string
          client: string
          category: string | null
          industry: string | null
          description: string | null
          thumbnail_url: string | null
          launched_at: string | null
          live_url: string | null
          is_live: boolean
          swatch: string | null
          vibe: string | null
          featured: boolean
          active: boolean
          created_at: string
        }
        Insert: {
          slug: string
          client: string
          category?: string | null
          industry?: string | null
          description?: string | null
          thumbnail_url?: string | null
          launched_at?: string | null
          live_url?: string | null
          is_live?: boolean
          swatch?: string | null
          vibe?: string | null
          featured?: boolean
          active?: boolean
          created_at?: string
        }
        Update: {
          slug?: string
          client?: string
          category?: string | null
          industry?: string | null
          description?: string | null
          thumbnail_url?: string | null
          launched_at?: string | null
          live_url?: string | null
          is_live?: boolean
          swatch?: string | null
          vibe?: string | null
          featured?: boolean
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }

      settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value?: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
