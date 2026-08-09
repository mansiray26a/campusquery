import { request } from './api';

export const createQuestion = async (title, description, body, tags) => {
  return await request('/questions', {
    method: 'POST',
    body: { title, description, body, tags },
  });
};

export const getAllQuestions = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      queryParams.append(key, filters[key]);
    }
  });
  const queryString = queryParams.toString();
  return await request(`/questions${queryString ? `?${queryString}` : ''}`);
};

export const getQuestionDetails = async (id) => {
  return await request(`/questions/${id}`);
};

export const updateQuestion = async (id, title, description, body, tags) => {
  return await request(`/questions/${id}`, {
    method: 'PUT',
    body: { title, description, body, tags },
  });
};

export const deleteQuestion = async (id) => {
  return await request(`/questions/${id}`, {
    method: 'DELETE',
  });
};

export const voteQuestion = async (id, voteType) => {
  return await request(`/votes/question/${id}`, {
    method: 'POST',
    body: { voteType },
  });
};
