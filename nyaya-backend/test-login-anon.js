require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function testLogin() {
    console.log("Testing Login with Anon Key...");
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'dyevikbraj2143@gmail.com', // User's email from screenshot
            password: 'Dyevik2143.'    // User's password from screenshot
        });
        console.log("Data:", data);
        console.log("Error:", error);
    } catch (e) {
        console.error("Caught error:", e);
        if (e.cause) console.error("Cause:", e.cause);
    }
}

testLogin();
