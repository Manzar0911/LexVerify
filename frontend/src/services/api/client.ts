import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error(`[API Error ${status}] ${error.config?.url}:`, data || error.message);
    const message =
      data?.message ||
      data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(' | ') : message));
  }
);
