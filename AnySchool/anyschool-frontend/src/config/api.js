/**
 * API Configuration
 * 
 * Centralized API configuration for the AnySchool frontend.
 * All API calls should use API_BASE_URL from this file.
 * 
 * CRITICAL: Never hardcode API URLs in components!
 */

// Get API URL from environment variable
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication (Phase 3)
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
    RESEND_OTP: `${API_BASE_URL}/api/auth/resend-otp`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  },
  
  // Users (Phase 2)
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,
    PROFILE: `${API_BASE_URL}/api/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/users/profile/password`,
    LINK_SCHOOL: `${API_BASE_URL}/api/users/school`,
  },

  // Children (Phase 7C)
  CHILDREN: {
    LIST: `${API_BASE_URL}/api/children`,
    ADD: `${API_BASE_URL}/api/children`,
    BY_ID: (id) => `${API_BASE_URL}/api/children/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/children/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/children/${id}`,
  },

  // School Requests (Phase 7C Enhancement)
  SCHOOL_REQUESTS: {
    SUBMIT: `${API_BASE_URL}/api/school-requests`,
    LIST: `${API_BASE_URL}/api/school-requests`,
  },
  
  // Stationery (Phase 4)
  STATIONERY: {
    LIST: `${API_BASE_URL}/api/stationery`,
    BY_ID: (id) => `${API_BASE_URL}/api/stationery/${id}`,
    BY_CATEGORY: (category) => `${API_BASE_URL}/api/stationery/category/${category}`,
  },
  
  // Schools (Phase 4)
  SCHOOLS: {
    LIST: `${API_BASE_URL}/api/schools`,
    BY_ID: (id) => `${API_BASE_URL}/api/schools/${id}`,
    BY_PROVINCE: (province) => `${API_BASE_URL}/api/schools/province/${province}`,
    STATS: (id) => `${API_BASE_URL}/api/schools/${id}/stats`,
    ORDERS: (id) => `${API_BASE_URL}/api/orders/school/${id}`,
  },
  
  // Orders (Phase 4)
  ORDERS: {
    CREATE: `${API_BASE_URL}/api/orders`,
    LIST: `${API_BASE_URL}/api/orders`,
    BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/api/orders/${id}/status`,
    DONATIONS: `${API_BASE_URL}/api/orders/donations`,
    STATS: `${API_BASE_URL}/api/orders/stats`,
  },

  // Communications (Phase 7D)
  COMMUNICATIONS: {
    CREATE: `${API_BASE_URL}/api/communications`,
    PARENT: `${API_BASE_URL}/api/communications/parent`,
    SCHOOL: `${API_BASE_URL}/api/communications/school`,
    BY_ID: (id) => `${API_BASE_URL}/api/communications/${id}`,
    UNREAD: `${API_BASE_URL}/api/communications/unread`,
    MARK_READ: (id) => `${API_BASE_URL}/api/communications/${id}/mark-read`,
  },

    // School Requests (Phase 7D - School Admin Onboarding)
  SCHOOL_REQUESTS: {
    NEW_SCHOOL: `${API_BASE_URL}/api/school-requests/new-school`,
    LINK_SCHOOL: `${API_BASE_URL}/api/school-requests/link-school`,
    AVAILABLE_SCHOOLS: `${API_BASE_URL}/api/school-requests/available-schools`,
    LIST: `${API_BASE_URL}/api/school-requests`,
    ADMIN_PENDING: `${API_BASE_URL}/api/school-requests/admin/pending`,
    APPROVE: (id) => `${API_BASE_URL}/api/school-requests/${id}/approve`,
    REJECT: (id) => `${API_BASE_URL}/api/school-requests/${id}/reject`,
  },

  // Messages (Phase 7D)
  MESSAGES: {
    SEND: `${API_BASE_URL}/api/messages`,
    THREADS: `${API_BASE_URL}/api/messages/threads`,
    THREAD: (id) => `${API_BASE_URL}/api/messages/thread/${id}`,
    UNREAD_COUNT: `${API_BASE_URL}/api/messages/unread/count`,
  },

  // System Monitoring (Phase 8 - Admin Dashboard)
  SYSTEM_MONITORING: {
    HEALTH: `${API_BASE_URL}/api/admin/system/health`,
    HISTORY: `${API_BASE_URL}/api/admin/system/history`,
    PERFORMANCE: `${API_BASE_URL}/api/admin/system/performance`,
  },

  // Admin (Super Admin Dashboard)
  ADMIN: {
    USERS: `${API_BASE_URL}/api/admin/users`,
    USER_BY_ID: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    TOGGLE_USER: (id) => `${API_BASE_URL}/api/admin/users/${id}/toggle`,
    CHANGE_USER_ROLE: (id) => `${API_BASE_URL}/api/admin/users/${id}/role`,
    DELETE_USER: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    ORDERS: `${API_BASE_URL}/api/admin/orders`,
    ORDER_BY_ID: (id) => `${API_BASE_URL}/api/admin/orders/${id}`,
    ORDERS_BY_SCHOOL: (schoolId) => `${API_BASE_URL}/api/admin/orders/school/${schoolId}`,
    APPROVE_ORDER: (id) => `${API_BASE_URL}/api/admin/orders/${id}/approve`,
    DECLINE_ORDER: (id) => `${API_BASE_URL}/api/admin/orders/${id}/decline`,
  },

  // Purchasing Admin (Order Processing & Delivery Tracking)
  PURCHASING: {
    ORDERS: `${API_BASE_URL}/api/purchasing/orders`,
    NEW_ORDERS: `${API_BASE_URL}/api/purchasing/orders/new`,
    ORDER_BY_ID: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}`,
    ORDER_STATS: `${API_BASE_URL}/api/purchasing/orders/stats`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/status`,
    ACKNOWLEDGE: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/acknowledge`,
    START_PROCESSING: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/start-processing`,
    VERIFY_PAYMENT: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/verify-payment`,
    SEND_FOR_DELIVERY: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/send-for-delivery`,
    MARK_DELIVERED: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/mark-delivered`,
    CLOSE_ORDER: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/close`,
    SUBMIT_FOR_APPROVAL: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/submit-for-approval`,
    DELIVERY_NOTES: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/delivery-notes`,
    RETURN_ORDER: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/return`,
    MARK_PAYMENT: (id) => `${API_BASE_URL}/api/purchasing/orders/${id}/mark-payment`,
  },

  // Stationery Bundles (Grade-specific bundles for schools)
  BUNDLES: {
    BASE: `${API_BASE_URL}/api/bundles`,
    BY_ID: (id) => `${API_BASE_URL}/api/bundles/${id}`,
    BY_SCHOOL: (schoolId) => `${API_BASE_URL}/api/bundles/school/${schoolId}`,
    MARK_FINAL: (id) => `${API_BASE_URL}/api/bundles/${id}/mark-final`,
    ADD_ITEMS: (id) => `${API_BASE_URL}/api/bundles/${id}/items`,
    REMOVE_ITEM: (bundleId, stationeryId) => `${API_BASE_URL}/api/bundles/${bundleId}/items/${stationeryId}`,
  },
  
  // School Events (School calendar and events)
  SCHOOL_EVENTS: {
    BASE: `${API_BASE_URL}/api/school-events`,
    BY_ID: (id) => `${API_BASE_URL}/api/school-events/${id}`,
    BY_SCHOOL: (schoolId) => `${API_BASE_URL}/api/school-events/school/${schoolId}`,
    UPCOMING: (schoolId) => `${API_BASE_URL}/api/school-events/school/${schoolId}/upcoming`,
    DATE_RANGE: (schoolId) => `${API_BASE_URL}/api/school-events/school/${schoolId}/range`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/actuator/health`,
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log('[API Config] Base URL:', API_BASE_URL);
};







export default API_BASE_URL;