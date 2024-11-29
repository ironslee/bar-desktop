import axios from 'axios';
import { apiUrl } from './renderer-constants';

const api = axios;

api.interceptors.request.use((config: any) => {
  const tokens = window.localStorage.getItem('tokens');
  const tokensParse = tokens ? JSON.parse(tokens) : '';

  const { token } = tokensParse;

  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }

  config.url = new URL(config.url, apiUrl).toString();

  return config;
});

export default api;
