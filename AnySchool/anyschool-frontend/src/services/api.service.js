/**
 * API Service
 * 
 * Centralized Axios instance configuration.
 * All HTTP requests should use this instance.
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token (Phase 3)
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add JWT token from context/localStorage in Phase 3
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to login (Phase 3)
        // window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden
        // Handle forbidden access
      } else if (status === 500) {
        // Server error
        // Show error notification
      }
      
      return Promise.reject(data || error.message);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject('Network error - please check your connection');
    } else {
      // Something else happened
      return Promise.reject(error.message);
    }
  }
);

export default apiClient;

/**
 * API Service Methods
 * Organized by feature
 */

// ====================
// Supplier API
// ====================
export const apiService = {
  // Suppliers
  getAllSuppliers: async () => {
    const response = await apiClient.get('/api/suppliers');
    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await apiClient.get(`/api/suppliers/${id}`);
    return response.data;
  },

  getSuppliersByType: async (type) => {
    const response = await apiClient.get(`/api/suppliers/type/${type}`);
    return response.data;
  },

  searchSuppliers: async (searchTerm) => {
    const response = await apiClient.get(`/api/suppliers/search?q=${searchTerm}`);
    return response.data;
  },

  createSupplier: async (supplierData) => {
    const response = await apiClient.post('/api/suppliers', supplierData);
    return response.data;
  },

  updateSupplier: async (id, supplierData) => {
    const response = await apiClient.put(`/api/suppliers/${id}`, supplierData);
    return response.data;
  },

  deactivateSupplier: async (id) => {
    const response = await apiClient.delete(`/api/suppliers/${id}/deactivate`);
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await apiClient.delete(`/api/suppliers/${id}`);
    return response.data;
  },

  // Business Analytics
  getBusinessAnalytics: async () => {
    const response = await apiClient.get('/api/analytics/business-report');
    return response.data;
  },

  getAnalyticsSummary: async () => {
    const response = await apiClient.get('/api/analytics/summary');
    return response.data;
  },

  // Existing methods can be added here as needed
  // Example: auth, orders, stationery, etc.
};
