import { Badge } from 'react-bootstrap';

/**
 * Helper function to get status badge
 * @param {string} status - Request status
 * @returns {JSX.Element} Badge component
 */
export const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { variant: 'warning', text: 'Chờ duyệt' },
    approved: { variant: 'success', text: 'Đã duyệt' },
    rejected: { variant: 'danger', text: 'Từ chối' }
  };
  const config = statusConfig[status] || { variant: 'secondary', text: status };
  return <Badge bg={config.variant}>{config.text}</Badge>;
};

/**
 * Helper function to get type badge
 * @param {string} type - Request type
 * @returns {JSX.Element} Badge component
 */
export const getTypeBadge = (type) => {
  const typeConfig = {
    create_class: { variant: 'info', text: 'Tạo lớp' },
    change_class: { variant: 'primary', text: 'Đổi lớp' },
    makeup_class: { variant: 'warning', text: 'Học bù' },
    replace_teacher: { variant: 'secondary', text: 'Thay giáo viên' }
  };
  const config = typeConfig[type] || { variant: 'secondary', text: type || 'N/A' };
  return <Badge bg={config.variant}>{config.text}</Badge>;
};

/**
 * Helper function to format date
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Helper function to compare names with numbers intelligently (natural sort)
 * @param {string} nameA - First name to compare
 * @param {string} nameB - Second name to compare
 * @returns {number} Comparison result (-1, 0, or 1)
 */
export const naturalCompare = (nameA, nameB) => {
  const a = nameA.toLowerCase();
  const b = nameB.toLowerCase();
  
  // Tách phần text và số
  const regex = /(\d+)/g;
  const partsA = a.split(regex);
  const partsB = b.split(regex);
  
  const minLength = Math.min(partsA.length, partsB.length);
  
  for (let i = 0; i < minLength; i++) {
    const partA = partsA[i];
    const partB = partsB[i];
    
    // Nếu cả hai đều là số, so sánh như số
    if (/^\d+$/.test(partA) && /^\d+$/.test(partB)) {
      const numA = parseInt(partA, 10);
      const numB = parseInt(partB, 10);
      if (numA !== numB) {
        return numA - numB;
      }
    } else {
      // So sánh như string
      const compare = partA.localeCompare(partB, 'vi');
      if (compare !== 0) {
        return compare;
      }
    }
  }
  
  // Nếu các phần đầu giống nhau, phần nào dài hơn thì lớn hơn
  return partsA.length - partsB.length;
};

