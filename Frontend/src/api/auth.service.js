import httpClient from './httpClient';

const AUTH_PREFIX = '/auth';

export const authService = {
  register: async (username, password) => {
    return httpClient.post(`${AUTH_PREFIX}/register`, { username, password });
  },
  login: async (username, password) => {
    const res = await httpClient.post(`${AUTH_PREFIX}/login`, { username, password });
    // res expected to contain { token: '...' }
    if (res && res.token) {
      localStorage.setItem('story_token', res.token);
    }
    return res;
  },
  logout: () => {
    localStorage.removeItem('story_token');
  },
  getToken: () => localStorage.getItem('story_token'),
};

export default authService;
