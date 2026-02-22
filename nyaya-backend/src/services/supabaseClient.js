const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role for backend

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — running in limited mode');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
    auth: { autoRefreshToken: false, persistSession: false }
});

module.exports = supabase;
