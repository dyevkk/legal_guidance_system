const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const supabase = require('../services/supabaseClient');
const { analyzeDocument, askAboutDocument, extractTextFromImage } = require('../services/geminiService');
const { storeHashOnChain } = require('../services/blockchain');
const pdfParse = require('pdf-parse');

// Use memory storage — we'll upload buffer directly to Supabase Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only PDF and image files are allowed'));
    }
});

// POST /api/documents/upload
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
    try {
        const userId = req.userId;
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        // 1. Extract text from PDF or Image
        let extractedText = '';
        try {
            if (req.file.mimetype === 'application/pdf') {
                const pdfData = await pdfParse(req.file.buffer);
                extractedText = pdfData.text;
            } else if (req.file.mimetype.startsWith('image/')) {
                extractedText = await extractTextFromImage(req.file.buffer, req.file.mimetype);
            }
        } catch (extractErr) {
            console.error('Extraction error:', extractErr.message);
            extractedText = 'Could not extract text from this file.';
        }

        // 2. Upload PDF to Supabase Storage
        const storageKey = `${userId}/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error: storageErr } = await supabase.storage
            .from('legal-documents')
            .upload(storageKey, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (storageErr) {
            console.warn('Storage upload warning:', storageErr.message);
            // Continue even if storage fails — we still have the text
        }

        // 3. Analyze with Gemini AI
        const analysis = await analyzeDocument(extractedText, req.file.originalname);

        // 3.5. Store Hash on Blockchain
        let blockchainTx = null;
        try {
            console.log("Storing document hash on local blockchain...");
            const txData = await storeHashOnChain(extractedText);
            blockchainTx = txData.txHash;
            console.log("Blockchain TX:", blockchainTx);
        } catch (chainErr) {
            console.warn("Blockchain error (ignored):", chainErr.message);
        }

        // 4. Save metadata to Supabase DB
        const { data: doc, error: dbErr } = await supabase
            .from('documents')
            .insert({
                user_id: userId,
                original_name: req.file.originalname,
                storage_key: storageKey,
                doc_type: analysis.docType || 'Other',
                extracted_text: extractedText.substring(0, 50000), // cap at 50k chars
                summary: analysis.summary || '',
                risks: analysis.risks || [],
                obligations: analysis.obligations || [],
                rights: analysis.rights || [],
                suggested_steps: analysis.suggestedSteps || [],
                key_dates: analysis.keyDates || [],
                parties_involved: analysis.partiesInvolved || []
            })
            .select()
            .single();

        if (dbErr) throw dbErr;

        res.status(201).json({
            id: doc.id,
            originalName: doc.original_name,
            docType: doc.doc_type,
            summary: doc.summary,
            risks: doc.risks,
            obligations: doc.obligations,
            rights: doc.rights,
            suggestedSteps: doc.suggested_steps,
            createdAt: doc.created_at,
            blockchainTx: blockchainTx
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message || 'Document upload failed.' });
    }
});

// GET /api/documents
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('id, original_name, doc_type, summary, created_at')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json((data || []).map(d => ({ id: d.id, originalName: d.original_name, docType: d.doc_type, summary: d.summary, createdAt: d.created_at })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch documents.' });
    }
});

// GET /api/documents/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();
        if (error || !data) return res.status(404).json({ error: 'Document not found.' });
        res.json({
            id: data.id,
            originalName: data.original_name,
            docType: data.doc_type,
            summary: data.summary,
            risks: data.risks,
            obligations: data.obligations,
            rights: data.rights,
            suggestedSteps: data.suggested_steps,
            extractedText: data.extracted_text,
            createdAt: data.created_at
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch document.' });
    }
});

// POST /api/documents/:id/ask
router.post('/:id/ask', authMiddleware, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ error: 'Question is required.' });

        const { data: doc, error } = await supabase
            .from('documents')
            .select('extracted_text, doc_type')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (error || !doc) return res.status(404).json({ error: 'Document not found.' });

        const answer = await askAboutDocument(question, doc.extracted_text, doc.doc_type);

        // Append Q&A to qa_history column
        const { data: existing } = await supabase
            .from('documents')
            .select('qa_history')
            .eq('id', req.params.id)
            .single();

        const qaHistory = existing?.qa_history || [];
        qaHistory.push({ question, answer, timestamp: new Date().toISOString() });

        await supabase
            .from('documents')
            .update({ qa_history: qaHistory })
            .eq('id', req.params.id);

        res.json({ question, answer });
    } catch (err) {
        console.error('QA error:', err);
        res.status(500).json({ error: 'Failed to answer question.' });
    }
});

// DELETE /api/documents/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Get storage_key first to delete from Storage
        const { data: doc } = await supabase
            .from('documents')
            .select('storage_key')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (doc?.storage_key) {
            await supabase.storage.from('legal-documents').remove([doc.storage_key]);
        }

        await supabase.from('documents').delete().eq('id', req.params.id).eq('user_id', req.userId);
        res.json({ message: 'Document deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete document.' });
    }
});

module.exports = router;
