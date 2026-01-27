import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.0';

// Helper to check if a value is a placeholder or invalid
const isPlaceholder = (val?: string) => 
  !val || 
  val.trim() === '' ||
  val.trim() === 'undefined' ||
  val.includes('placeholder') || 
  val.includes('YOUR_') || 
  val.includes('PLACEHOLDER') ||
  val.length < 10;

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const rawKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = !isPlaceholder(rawUrl) && !isPlaceholder(rawKey);

/**
 * Enhanced Supabase client that gracefully handles unconfigured environments.
 * If credentials are placeholders, it returns a mock object to prevent network 
 * 'Failed to fetch' errors while allowing the UI to remain functional.
 */
export const supabase = isConfigured 
  ? createClient(rawUrl, rawKey)
  : {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: { message: "Supabase not configured" } }),
        signInWithOtp: async () => ({ error: { message: "Supabase not configured" } }),
        signUp: async () => ({ error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
            order: () => Promise.resolve({ data: [], error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => Promise.resolve({ error: null }),
        delete: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        }),
      })
    } as any;