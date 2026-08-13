import { createClient } from '@supabase/supabase-js';
import { env } from '../../../environments/environment';

const supabase = createClient(env.supabase_url, env.supabase_key);
export { supabase };
