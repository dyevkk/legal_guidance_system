require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function testLogin() {
    console.log("Testing Login...");
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'test@example.com', // Replace with a known email
            password: 'password123'    // Replace with a known password
        });
        console.log("Data:", data);
        console.log("Error:", error);
    } catch (e) {
        console.error("Caught error:", e);
    }
}

testLogin();
