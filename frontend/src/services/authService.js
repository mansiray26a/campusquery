import { request } from './api';

export const login = async (email, password) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const register = async (username, email, password) => {
  const data = await request('/auth/register', {
    method: 'POST',
    body: { username, email, password },
  });
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getMe = async () => {
  return await request('/auth/me');
};

export const updateProfile = async (bio, profilePicture) => {
  return await request('/users/profile', {
    method: 'PUT',
    body: { bio, profilePicture },
  });
};

export const getUserProfile = async (id) => {
  return await request(`/users/profile/${id}`);
};

export const getUserDashboardData = async () => {
  return await request('/users/dashboard/summary');
};

export const toggleSaveQuestion = async (questionId) => {
  return await request(`/users/save/${questionId}`, {
    method: 'POST',
  });
};
