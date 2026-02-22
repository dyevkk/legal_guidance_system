const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    docType: {
        type: String,
        enum: ['FIR', 'Contract', 'Rental Agreement', 'Court Notice', 'Affidavit', 'Legal Complaint', 'Other'],
        default: 'Other'
    },
    extractedText: { type: String, default: '' },
    summary: { type: String, default: '' },
    risks: [{ type: String }],
    obligations: [{ type: String }],
    rights: [{ type: String }],
    suggestedSteps: [{ type: String }],
    qaHistory: [{
        question: String,
        answer: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
