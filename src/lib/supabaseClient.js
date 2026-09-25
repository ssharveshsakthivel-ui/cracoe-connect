import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktuqyyjodabzcwyabbls.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Uw0opZ9C6UoSwAF8HMI-wg_N5HYjUTi';

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase credentials are missing.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
