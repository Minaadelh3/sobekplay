
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.0';

// Helper to check if a value is a placeholder
const isPlaceholder = (val?: string) => !val || val.includes('placeholder') || val.includes('YOUR_') || val.length < 20;

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

/**
 * Enhanced Supabase client that gracefully handles unconfigured environments.
 * If credentials are placeholders, it returns a mock object to prevent network 
 * 'Failed to fetch' errors while allowing the UI to remain functional.
 */
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: { message: "Supabase not configured" } }),
        signUp: async () => ({ error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
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
