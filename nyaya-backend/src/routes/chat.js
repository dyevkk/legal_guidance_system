const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const supabase = require('../services/supabaseClient');
const { getLegalGuidance } = require('../services/geminiService');

// In-memory fallback (used when Supabase tables don't exist yet)
const inMemorySessions = {};

async function getOrCreateSession(userId, sessionId) {
    // Try Supabase first
    try {
        if (sessionId) {
            const { data } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('id', sessionId)
                .eq('user_id', userId)
                .single();
            if (data) return { session: data, useSupabase: true };
        }

        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({ user_id: userId, title: 'New Legal Query', category: 'Other', messages: [] })
            .select()
            .single();

        if (error) throw error;
        return { session: data, useSupabase: true };
    } catch (err) {
        console.warn('Supabase unavailable, using in-memory session:', err.message);
        // Fallback: in-memory
        const sid = sessionId || `mem_${userId}_${Date.now()}`;
        if (!inMemorySessions[sid]) {
            inMemorySessions[sid] = { id: sid, user_id: userId, title: 'New Legal Query', category: 'Other', messages: [] };
        }
        return { session: inMemorySessions[sid], useSupabase: false };
    }
}

async function saveSession(session, messages, title, category, useSupabase) {
    if (useSupabase) {
        await supabase
            .from('chat_sessions')
            .update({ messages, title, category, updated_at: new Date().toISOString() })
            .eq('id', session.id);
    } else {
        inMemorySessions[session.id] = { ...session, messages, title, category };
    }
}

// POST /api/chat/message
router.post('/message', authMiddleware, async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.userId;
        if (!message) return res.status(400).json({ error: 'Message is required.' });

        const { session, useSupabase } = await getOrCreateSession(userId, sessionId);
        const messages = session.messages || [];

        // Add user message
        const userMsg = { role: 'user', content: message, timestamp: new Date().toISOString() };
        messages.push(userMsg);

        // Get AI response
        let aiText, category;
        try {
            const result = await getLegalGuidance(message, messages.slice(0, -1));
            aiText = result.text;
            category = result.category;
        } catch (geminiErr) {
            console.error('Gemini error:', geminiErr.message || geminiErr);
            return res.status(500).json({ error: `AI service error: ${geminiErr.message || 'Check GEMINI_API_KEY in .env'}` });
        }

        const aiMsg = { role: 'ai', content: aiText, timestamp: new Date().toISOString() };
        messages.push(aiMsg);

        const title = session.title === 'New Legal Query'
            ? message.substring(0, 60) + (message.length > 60 ? '...' : '')
            : session.title;

        const cleanCategory = (category || 'Other').replace(/\s*\(.*?\)/, '').trim() || 'Other';

        await saveSession(session, messages, title, cleanCategory, useSupabase);

        res.json({ sessionId: session.id, message: aiMsg, category: cleanCategory, title });
    } catch (err) {
        console.error('Chat error:', err.message || err);
        res.status(500).json({ error: `Server error: ${err.message || 'Unknown error'}` });
    }
});

// GET /api/chat/sessions
router.get('/sessions', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('id, title, category, updated_at, created_at, messages')
            .eq('user_id', req.userId)
            .order('updated_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        // Fallback: return in-memory sessions for this user
        const userSessions = Object.values(inMemorySessions)
            .filter(s => s.user_id === req.userId)
            .map(s => ({ id: s.id, title: s.title, category: s.category, messages: s.messages }));
        res.json(userSessions);
    }
});

// GET /api/chat/session/:id
router.get('/session/:id', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();
        if (error || !data) throw new Error('Not found');
        res.json(data);
    } catch (err) {
        // Fallback: in-memory
        const s = inMemorySessions[req.params.id];
        if (s && s.user_id === req.userId) return res.json(s);
        res.status(404).json({ error: 'Session not found.' });
    }
});

// DELETE /api/chat/session/:id
router.delete('/session/:id', authMiddleware, async (req, res) => {
    try {
        await supabase
            .from('chat_sessions')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);
        delete inMemorySessions[req.params.id];
        res.json({ message: 'Session deleted.' });
    } catch (err) {
        delete inMemorySessions[req.params.id];
        res.json({ message: 'Session deleted.' });
    }
});

module.exports = router;
