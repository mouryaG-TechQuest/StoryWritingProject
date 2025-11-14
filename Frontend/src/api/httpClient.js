// Simple HTTP client using fetch with JSON handling and auth header support
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function authHeaders() {
  const token = localStorage.getItem('story_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const httpClient = {
  get: async (url) => {
    const res = await fetch(`${BASE_URL}${url}`, { headers: authHeaders() });
    return res.json();
  },
  post: async (url, data) => {
    const res = await fetch(`${BASE_URL}${url}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
    return res.json();
  },
  put: async (url, data) => {
    const res = await fetch(`${BASE_URL}${url}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
    return res.json();
  },
  delete: async (url) => {
    const res = await fetch(`${BASE_URL}${url}`, { method: 'DELETE', headers: authHeaders() });
    return res.ok;
  },
};

export default httpClient;
