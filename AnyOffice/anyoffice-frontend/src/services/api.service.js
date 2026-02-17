import axios from 'axios';

const TOKEN_KEY = 'office_token';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api/office',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('office_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
