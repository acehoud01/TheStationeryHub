const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/office';

const API = {
  BASE_URL,

  // Auth
  AUTH: {
    REGISTER: `${BASE_URL}/auth/register`,
    LOGIN: `${BASE_URL}/auth/login`,
    VERIFY_OTP: `${BASE_URL}/auth/verify-otp`,
    RESEND_OTP: `${BASE_URL}/auth/resend-otp`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  },

  // Catalog (public)
  CATALOG: {
    LIST: `${BASE_URL}/catalog`,
    DETAIL: (id) => `${BASE_URL}/catalog/${id}`,
    SEARCH: `${BASE_URL}/catalog/search`,
    CATEGORIES: `${BASE_URL}/catalog/categories`,
  },

  // Orders
  ORDERS: {
    BASE: `${BASE_URL}/orders`,
    DETAIL: (id) => `${BASE_URL}/orders/${id}`,
    STATUS: (id) => `${BASE_URL}/orders/${id}/status`,
  },

  // Approvals
  APPROVALS: {
    PENDING: `${BASE_URL}/approvals/pending`,
    APPROVE: (id) => `${BASE_URL}/approvals/${id}/approve`,
    REJECT: (id) => `${BASE_URL}/approvals/${id}/reject`,
  },

  // Departments
  DEPARTMENTS: {
    BASE: `${BASE_URL}/departments`,
    DETAIL: (id) => `${BASE_URL}/departments/${id}`,
  },

  // Users
  USERS: {
    BASE: `${BASE_URL}/users`,
    ME: `${BASE_URL}/users/me`,
    DETAIL: (id) => `${BASE_URL}/users/${id}`,
    CHANGE_PASSWORD: `${BASE_URL}/users/me/change-password`,
  },

  // Budget
  BUDGET: {
    SUMMARY: `${BASE_URL}/budget/summary`,
    DEPARTMENT: (id) => `${BASE_URL}/budget/department/${id}`,
    ALLOCATE: `${BASE_URL}/budget/allocate`,
  },

  // Inventory
  INVENTORY: {
    BASE: `${BASE_URL}/inventory`,
    LOW_STOCK: `${BASE_URL}/inventory/low-stock`,
    DETAIL: (id) => `${BASE_URL}/inventory/${id}`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: `${BASE_URL}/analytics/dashboard`,
    SPEND: `${BASE_URL}/analytics/spend`,
    ORDERS: `${BASE_URL}/analytics/orders`,
  },

  // Companies
  COMPANIES: {
    BASE: `${BASE_URL}/companies`,
    DETAIL: (id) => `${BASE_URL}/companies/${id}`,
  },

  // Admin
  ADMIN: {
    COMPANIES: `${BASE_URL}/admin/companies`,
    USERS: `${BASE_URL}/admin/users`,
    ANALYTICS: `${BASE_URL}/admin/analytics`,
  },
};

export default API;
