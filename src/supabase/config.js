import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qglwsxrdnfxfdzgnggak.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_z0GaCKmabd0X0OLDqYZp5w_IROXedRY';

export const supabase = createClient(supabaseUrl, supabaseKey);
