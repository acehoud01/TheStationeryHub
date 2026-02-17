/**
 * Date Formatting Utilities
 * 
 * FIXES ISSUE #6: Date parsing can show "Invalid Date"
 * 
 * Provides safe date formatting with validation and fallbacks.
 */

/**
 * Format date string to localized date
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or '-' if invalid
 */
export const formatDate = (dateString) => {
  if (!dateString) {
    return '-';
  }

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '-';
    }

    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date parsing error:', error, 'Input:', dateString);
    return '-';
  }
};

/**
 * Format date string to localized date and time
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date-time or '-' if invalid
 */
export const formatDateTime = (dateString) => {
  if (!dateString) {
    return '-';
  }

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid datetime string:', dateString);
      return '-';
    }

    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('DateTime parsing error:', error, 'Input:', dateString);
    return '-';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time or '-' if invalid
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) {
    return '-';
  }

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '-';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 7) {
      return formatDate(dateString);
    } else if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Relative time parsing error:', error);
    return '-';
  }
};

/**
 * Check if date string is valid
 * 
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Date in YYYY-MM-DD format or empty string
 */
export const formatDateForInput = (dateString) => {
  if (!dateString || !isValidDate(dateString)) {
    return '';
  }

  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};