import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const TOKEN_KEY = 'e2e_token';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request as Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, drop the token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Normalizes API errors into a readable message.
 * Backend errors are `{ "error": "message" }`, except validation errors
 * which use the field name as the key: `{ "fieldName": "message" }`.
 */
export function apiErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, string>;
    if (typeof data === 'object') {
      if (data.error) return data.error;
      const firstKey = Object.keys(data)[0];
      if (firstKey) return `${firstKey}: ${data[firstKey]}`;
    }
  }
  return fallback;
}
