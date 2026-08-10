let rawApiUrl = import.meta.env.VITE_API_URL || '/api';
rawApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_URL = rawApiUrl === '' || rawApiUrl === '/api' 
  ? '/api' 
  : (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`);

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { message: 'Server did not return JSON' };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    throw error;
  }

  return data;
};
