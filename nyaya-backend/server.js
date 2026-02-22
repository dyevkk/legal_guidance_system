require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/documents', require('./src/routes/documents'));
app.use('/api/location', require('./src/routes/location'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'NyayaAI Backend',
        database: 'Supabase (PostgreSQL)',
        timestamp: new Date()
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 NyayaAI Server running on http://localhost:${PORT}`);
    console.log(`📦 Database: Supabase (${process.env.SUPABASE_URL ? '✅ Connected' : '❌ URL missing'})`);
    console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Key set' : '❌ Key missing'}`);
});

module.exports = app;
