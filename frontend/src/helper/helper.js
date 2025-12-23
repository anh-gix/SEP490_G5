/**
 * Format date to Vietnamese format
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format datetime to Vietnamese format
 * @param {string|Date} datetime 
 * @returns {string}
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  const d = new Date(datetime);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

/**
 * Format time only
 * @param {string|Date} datetime 
 * @returns {string}
 */
export const formatTime = (datetime) => {
  if (!datetime) return '';
  const d = new Date(datetime);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Get status label in Vietnamese
 * @param {string} status 
 * @returns {string}
 */
export const getStatusLabel = (status) => {
  const statusMap = {
    pending_approval: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    needs_revision: 'Cần chỉnh sửa',
    temporary: 'Buổi tạm',
    fixed: 'Buổi cố định',
  };
  return statusMap[status] || status;
};

/**
 * Get status badge variant
 * @param {string} status 
 * @returns {string}
 */
export const getStatusVariant = (status) => {
  const variantMap = {
    pending_approval: 'warning',
    approved: 'success',
    rejected: 'danger',
    needs_revision: 'info',
    temporary: 'warning',
    fixed: 'success',
  };
  return variantMap[status] || 'secondary';
};

/**
 * Truncate text
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format date to YYYY-MM-DD string
 * CRITICAL: ALWAYS extracts the date part from ISO strings, ignoring time component completely
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';

  // If already a string in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // If string in ISO format with time component
  if (typeof date === 'string' && date.includes('T')) {
    // ALWAYS extract date part directly, ignore time completely
    // "2025-12-23T17:00:00.000Z" → "2025-12-23"
    // "2025-12-23T00:00:00.000Z" → "2025-12-23"
    const datePart = date.split('T')[0];
    const dateMatch = datePart.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return dateMatch[1]; // Return date part only, ignore time
    }
  }
  
  // Parse date string or use Date object
  let dateObj;
  if (typeof date === 'string') {
    // Try to extract YYYY-MM-DD directly first
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      // Direct parse from YYYY-MM-DD - return immediately to avoid timezone issues
      return dateMatch[0];
    }
    // Only use new Date() as last resort
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) return '';

  // For Date objects, use LOCAL methods (calendar creates dates in local timezone)
  // This ensures calendar dates like new Date(2025, 11, 23) display as Dec 23, not Dec 22
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Parse date string to Date object using UTC timezone
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object in UTC timezone at midnight
 */
export const parseDateString = (dateString) => {
  if (!dateString) return null;

  // If already YYYY-MM-DD format, parse directly in UTC
  const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1; // Month is 0-indexed
    const day = parseInt(dateMatch[3], 10);
    // Use Date.UTC() to create date at UTC midnight
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }

  // Fallback to regular Date parsing
  return new Date(dateString);
};