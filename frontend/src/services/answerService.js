import { request } from './api';

export const createAnswer = async (body, questionId) => {
  return await request('/answers', {
    method: 'POST',
    body: { body, questionId },
  });
};

export const updateAnswer = async (id, body) => {
  return await request(`/answers/${id}`, {
    method: 'PUT',
    body: { body },
  });
};

export const deleteAnswer = async (id) => {
  return await request(`/answers/${id}`, {
    method: 'DELETE',
  });
};

export const acceptAnswer = async (id) => {
  return await request(`/answers/${id}/accept`, {
    method: 'POST',
  });
};

export const voteAnswer = async (id, voteType) => {
  return await request(`/votes/answer/${id}`, {
    method: 'POST',
    body: { voteType },
  });
};
