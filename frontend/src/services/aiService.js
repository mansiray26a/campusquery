import { request } from './api';

/**
 * Send a question ID to the backend AI endpoint.
 * The backend fetches the full question from DB, builds the grounded prompt,
 * calls Groq, and returns the AI answer text.
 *
 * @param {string} questionId - MongoDB ObjectId of the question
 * @returns {Promise<{ answer: string, model: string, questionId: string }>}
 */
export const getAIAnswer = async (questionId) => {
  return await request('/ai/answer', {
    method: 'POST',
    body: { questionId },
  });
};
