/**
 * Safe Access Utilities
 * 
 * FIXES ISSUE #4: Frontend access of nested objects without null checks
 * 
 * Provides safe accessors for potentially null nested objects,
 * particularly for school and stationery data.
 */

/**
 * Get school name safely from order/donation
 * Handles both approved schools and requested schools
 * 
 * @param {Object} item - Order or donation object
 * @returns {string} School name or fallback
 */
export const getSchoolName = (item) => {
  return item?.school?.name || item?.requestedSchoolName || 'Unknown School';
};

/**
 * Get school province safely
 * 
 * @param {Object} item - Order or donation object
 * @returns {string} Province or '-'
 */
export const getSchoolProvince = (item) => {
  return item?.school?.province || '-';
};

/**
 * Get school district safely
 * 
 * @param {Object} item - Order or donation object
 * @returns {string} District or '-'
 */
export const getSchoolDistrict = (item) => {
  return item?.school?.district || '-';
};

/**
 * Get school ID safely
 * 
 * @param {Object} item - Order or donation object
 * @returns {number|null} School ID or null
 */
export const getSchoolId = (item) => {
  return item?.school?.id || null;
};

/**
 * Check if school is requested (pending approval)
 * 
 * @param {Object} item - Order or donation object
 * @returns {boolean} True if requested school
 */
export const isRequestedSchool = (item) => {
  return !item?.school && !!item?.requestedSchoolName;
};

/**
 * Get full school info object safely
 * Returns consistent structure regardless of school state
 * 
 * @param {Object} item - Order or donation object
 * @returns {Object} School info object
 */
export const getSchoolInfo = (item) => {
  if (item?.school) {
    return {
      id: item.school.id,
      name: item.school.name,
      province: item.school.province || '-',
      district: item.school.district || '-',
      grades: item.school.grades || [],
      isRequested: false
    };
  } else if (item?.requestedSchoolName) {
    return {
      id: null,
      name: item.requestedSchoolName,
      province: '-',
      district: '-',
      grades: [],
      isRequested: true
    };
  }
  
  return {
    id: null,
    name: 'Unknown School',
    province: '-',
    district: '-',
    grades: [],
    isRequested: false
  };
};

/**
 * Safe access to stationery name
 * 
 * @param {Object} item - Order item or stationery object
 * @returns {string} Stationery name or fallback
 */
export const getStationeryName = (item) => {
  return item?.stationery?.name || item?.name || 'Unknown Item';
};

/**
 * Safe access to stationery brand
 * 
 * @param {Object} item - Order item or stationery object
 * @returns {string} Brand or '-'
 */
export const getStationeryBrand = (item) => {
  return item?.stationery?.brand || item?.brand || '-';
};

/**
 * Safe access to stationery category
 * 
 * @param {Object} item - Order item or stationery object
 * @returns {string} Category
 */
export const getStationeryCategory = (item) => {
  return item?.stationery?.category || item?.category || 'GENERAL';
};

/**
 * Safe access to stationery ID
 * 
 * @param {Object} item - Order item or stationery object
 * @returns {number|null} Stationery ID or null
 */
export const getStationeryId = (item) => {
  return item?.stationery?.id || item?.id || null;
};

/**
 * Safe access to child name
 * 
 * @param {Object} item - Order or child object
 * @returns {string} Child name or fallback
 */
export const getChildName = (item) => {
  return item?.child?.name || item?.studentName || '-';
};

/**
 * Safe access to child grade
 * 
 * @param {Object} item - Order or child object
 * @returns {string} Grade or '-'
 */
export const getChildGrade = (item) => {
  return item?.child?.grade || item?.studentGrade || '-';
};

/**
 * Safe access to user full name
 * 
 * @param {Object} user - User object
 * @returns {string} Full name or fallback
 */
export const getUserFullName = (user) => {
  return user?.fullName || user?.name || 'User';
};

/**
 * Safe access to user email
 * 
 * @param {Object} user - User object
 * @returns {string} Email or fallback
 */
export const getUserEmail = (user) => {
  return user?.email || '-';
};

/**
 * Format currency safely
 * 
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'R 0.00';
  }
  
  return `R ${Number(amount).toFixed(2)}`;
};

/**
 * Get order status label
 * 
 * @param {string} status - Order status
 * @returns {string} Human-readable status
 */
export const getOrderStatusLabel = (status) => {
  const labels = {
    'PENDING': 'Pending',
    'PROCESSING': 'Processing',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
    'PAID': 'Paid'
  };
  
  return labels[status] || status || 'Unknown';
};

/**
 * Get order type label
 * 
 * @param {string} type - Order type
 * @returns {string} Human-readable type
 */
export const getOrderTypeLabel = (type) => {
  const labels = {
    'PURCHASE': 'Purchase',
    'DONATION': 'Donation'
  };
  
  return labels[type] || type || 'Unknown';
};