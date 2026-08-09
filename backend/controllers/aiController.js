const Groq = require('groq-sdk');
const Question = require('../models/Question');

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — Anti-hallucination, grounded, academic Q&A assistant
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert academic assistant integrated into CampusQuery, 
a campus knowledge-sharing platform for students and educators.

Your ONLY job is to answer the student's question based STRICTLY on the context provided.

CRITICAL RULES — follow these without exception:
1. NEVER invent facts, statistics, references, book names, URLs, or code you are not certain about.
2. If you are uncertain about any part of your answer, explicitly say: "I'm not fully certain about this — please verify with your professor or course material."
3. If the question is too vague or lacks enough context to answer correctly, ask for clarification rather than guessing.
4. Do NOT assume what programming language, framework, or course is meant unless it is stated in the question.
5. Keep your answer focused and relevant. Do not pad with unrelated information.
6. Structure your answer clearly using:
   - A brief direct answer (1-2 sentences)
   - Explanation or steps (if applicable)
   - A "Note" section for any caveats or things the student should verify

Your tone should be helpful, encouraging, and honest — like a knowledgeable study partner, not a textbook.`;

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate an AI answer for a question using Groq LLM
// @route   POST /api/ai/answer
// @access  Private (logged-in users only)
// ─────────────────────────────────────────────────────────────────────────────
const generateAIAnswer = async (req, res, next) => {
  try {
    // Validate API key is configured before doing anything else
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(503).json({
        message: 'AI service is not configured. Please add a valid GROQ_API_KEY to the backend .env file. Get a free key at https://console.groq.com'
      });
    }

    // Lazy-initialize the Groq client so server starts regardless of key state
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { questionId } = req.body;

    if (!questionId) {
      res.status(400);
      throw new Error('questionId is required');
    }

    // Fetch the full question from the database so the AI has real context
    const question = await Question.findById(questionId)
      .populate('tags', 'name')
      .populate('author', 'username');

    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    const tagNames = question.tags.map((t) => t.name).join(', ') || 'none';

    // Build the grounded user prompt — inject ALL question context
    const userPrompt = `
A student has posted the following question on CampusQuery. Please provide a helpful, grounded answer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION TITLE:
${question.title}

BRIEF SUMMARY (by student):
${question.description}

FULL QUESTION DETAILS:
${question.body}

TAGS / TOPICS:
${tagNames}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please answer the question above. Remember: only answer based on what is stated here. 
If you need more context to give an accurate answer, say so clearly.`.trim();

    // Call Groq API with strict settings to minimize hallucinations
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama3-8b-8192',
      temperature: 0,          // Zero temperature = deterministic, no creative invention
      max_tokens: 800,         // Keep answers concise and scannable
      top_p: 1,
      stream: false,
    });

    const aiAnswer = chatCompletion.choices[0]?.message?.content;

    if (!aiAnswer) {
      res.status(500);
      throw new Error('AI returned an empty response. Please try again.');
    }

    res.json({
      answer: aiAnswer,
      model: chatCompletion.model,
      questionId,
    });
  } catch (error) {
    // Handle Groq-specific API errors gracefully
    if (error?.status === 401) {
      return res.status(500).json({ message: 'AI service authentication failed. Check GROQ_API_KEY in server config.' });
    }
    if (error?.status === 429) {
      return res.status(429).json({ message: 'AI rate limit reached. Please wait a moment and try again.' });
    }
    next(error);
  }
};

module.exports = { generateAIAnswer };
