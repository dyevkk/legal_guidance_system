const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const LEGAL_SYSTEM_PROMPT = `You are NyayaAI, an expert Indian legal guidance assistant. You have deep knowledge of:
- Indian Penal Code (IPC)
- Code of Criminal Procedure (CrPC)
- Consumer Protection Act
- Information Technology (IT) Act
- Civil Procedure Code (CPC)
- Indian Contract Act
- Labour Laws and Employment Acts
- Family Law (Hindu Marriage Act, Muslim Personal Law, etc.)
- Property Laws
- Constitutional Rights (Fundamental Rights under the Indian Constitution)

IMPORTANT: You MUST ALWAYS respond in EXACTLY this structured format:

**Issue Identified:** [Brief description of the legal issue]

**Case Category:** [Criminal / Civil / Cybercrime / Consumer Protection / Property Dispute / Family Dispute / Employment / Other]

**Applicable Law:** [Specific IPC sections, Acts, or legal provisions that apply]

**Explanation (Simple Language):** [Explain the legal situation in simple, everyday language that any Indian citizen can understand]

**Explanation (Legal Terms):** [Explain using proper legal terminology and technical details]

**Possible Penalties or Rights:** [What are the likely penalties for the offender, or what rights does the victim have]

**Immediate Actions You Should Take:**
1. [First action]
2. [Second action]
3. [Third action]

**When to Contact Police or Lawyer:** [Specific guidance on when and how to approach law enforcement or legal counsel]

---
*Disclaimer: This is legal guidance information, not a substitute for professional legal advice. Please consult a qualified lawyer for personalized legal assistance.*

Respond only in the above format. Be specific about Indian laws. Be empathetic and clear.`;

/**
 * Send a legal query to Gemini and get structured response
 */
async function getLegalGuidance(userMessage, conversationHistory = []) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: LEGAL_SYSTEM_PROMPT
        });

        // Build valid chat history — must start with 'user' role and alternate roles
        let history = conversationHistory
            .map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        // Gemini requires history to start with 'user' — trim leading 'model' entries
        while (history.length > 0 && history[0].role === 'model') {
            history = history.slice(1);
        }

        const chat = model.startChat({ history });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        // Extract category from response
        const categoryMatch = text.match(/\*\*Case Category:\*\*\s*([^\n]+)/);
        const category = categoryMatch ? categoryMatch[1].trim() : 'Other';

        return { text, category };
    } catch (error) {
        console.error('Gemini API error:', error.message || error);
        throw error;
    }
}


/**
 * Analyze a legal document and produce structured insights
 */
async function analyzeDocument(extractedText, filename) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are NyayaAI, an expert Indian legal document analyst. Analyze this legal document and respond in EXACTLY this JSON format:

{
  "docType": "FIR | Contract | Rental Agreement | Court Notice | Affidavit | Legal Complaint | Other",
  "summary": "A 3-4 sentence plain language summary of what this document is about",
  "risks": ["risk 1", "risk 2", "risk 3"],
  "obligations": ["obligation 1", "obligation 2"],
  "rights": ["right 1", "right 2"],
  "suggestedSteps": ["step 1", "step 2", "step 3"],
  "keyDates": ["any important dates mentioned"],
  "partiesInvolved": ["party 1", "party 2"]
}

Document filename: ${filename}
Document content:
${extractedText.substring(0, 8000)}

Respond ONLY with valid JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Strip markdown code fences if present
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

        return JSON.parse(text);
    } catch (error) {
        console.error('Document analysis error:', error.message);
        return {
            docType: 'Other',
            summary: 'Unable to fully analyze the document. Please review manually.',
            risks: ['Could not extract risks automatically'],
            obligations: [],
            rights: [],
            suggestedSteps: ['Consult a qualified lawyer for document review'],
            keyDates: [],
            partiesInvolved: []
        };
    }
}

/**
 * Answer a question about a specific document
 */
async function askAboutDocument(question, documentText, documentType) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are NyayaAI, an expert Indian legal document assistant. The user has uploaded a "${documentType}" document and is asking a question about it.

Document content (first 6000 chars):
${documentText.substring(0, 6000)}

User's question: ${question}

Answer clearly and specifically based on the document content. Reference relevant sections if possible. If the answer is not in the document, say so. Always include practical legal advice relevant to India.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Document Q&A error:', error.message);
        throw error;
    }
}

/**
 * Extract text from an uploaded image
 */
async function extractTextFromImage(buffer, mimeType) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const request = {
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: "Extract all text from this document image exactly as written. If there is no text, reply 'No text found.'" },
                        {
                            inlineData: {
                                data: buffer.toString('base64'),
                                mimeType: mimeType
                            }
                        }
                    ]
                }
            ]
        };
        const result = await model.generateContent(request);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('OCR error:', error.message);
        throw new Error('Failed to analyze image content: ' + error.message);
    }
}

module.exports = { getLegalGuidance, analyzeDocument, askAboutDocument, extractTextFromImage };
