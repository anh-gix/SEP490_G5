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