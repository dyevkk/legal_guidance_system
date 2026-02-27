const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'Name, email and password are required.' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });

        // Register with Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: { name },
            email_confirm: true // auto-confirm for simplicity
        });

        if (error) {
            if (error.message.includes('already')) return res.status(400).json({ error: 'Email already registered.' });
            return res.status(400).json({ error: error.message });
        }

        const userId = data.user.id;

        // Store additional profile in profiles table
        await supabase.from('profiles').upsert({ id: userId, name, email });

        const token = jwt.sign({ userId, email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: userId, name, email } });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required.' });

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.error('Supabase login error:', error);
            if (error.status === 0 || (error.message && error.message.includes('fetch'))) {
                return res.status(503).json({ error: 'Unable to connect to the authentication database. The Supabase project might be paused or blocked by your network.' });
            }
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const userId = data.user.id;
        const name = data.user.user_metadata?.name || email.split('@')[0];

        const token = jwt.sign({ userId, email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: userId, name, email } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed.' });
    }
});

module.exports = router;
