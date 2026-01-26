
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.0';

// These environment variables should be set in your deployment environment.
// For the purpose of this cinematic demo, we provide placeholders.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
