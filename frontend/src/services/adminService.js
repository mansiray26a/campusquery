import { request } from './api';

export const getAdminStats = async () => {
  return await request('/admin/stats');
};

export const getUsers = async () => {
  return await request('/admin/users');
};

export const deleteUser = async (id) => {
  return await request(`/admin/users/${id}`, {
    method: 'DELETE',
  });
};

export const updateUserRole = async (id, role) => {
  return await request(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: { role },
  });
};

export const getReports = async () => {
  return await request('/admin/reports');
};

export const submitReport = async (type, targetId, reason) => {
  return await request('/admin/reports', {
    method: 'POST',
    body: { type, targetId, reason },
  });
};

export const updateReportStatus = async (id, status) => {
  return await request(`/admin/reports/${id}`, {
    method: 'PUT',
    body: { status },
  });
};

export const getTags = async () => {
  return await request('/admin/tags');
};

export const createTag = async (name, description) => {
  return await request('/admin/tags', {
    method: 'POST',
    body: { name, description },
  });
};

export const deleteTag = async (id) => {
  return await request(`/admin/tags/${id}`, {
    method: 'DELETE',
  });
};

export const getAnswers = async () => {
  return await request('/admin/answers');
};
