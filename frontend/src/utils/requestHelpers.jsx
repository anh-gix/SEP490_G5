import { Badge } from 'react-bootstrap';

/**
 * Helper function to get status badge
 * @param {string} status - Request status
 * @param {string} requestType - Optional: Request type (e.g., 'assign_students', 'makeup_class')
 * @returns {JSX.Element} Badge component
 */
export const getStatusBadge = (status, requestType = null) => {
  // Special handling for assign_students: pending = "Chờ xử lý" instead of "Chờ duyệt"
  const isAssignStudents = requestType === 'assign_students';
  const isChangeRequest = requestType && ['makeup_class', 'request_replace_teacher', 'change_class'].includes(requestType);
  
  const statusConfig = {
    pending: { 
      variant: 'warning', 
      text: (isAssignStudents || (!isChangeRequest && requestType)) ? 'Chờ xử lý' : 'Chờ duyệt' 
    },
    approved: { variant: 'success', text: 'Đã duyệt' },
    rejected: { variant: 'danger', text: 'Từ chối' },
    need_revision: { variant: 'secondary', text: 'Yêu cầu chỉnh sửa' },
    in_progress: { variant: 'info', text: 'Đang xử lý' },
    completed: { variant: 'success', text: 'Hoàn thành' },
    pending_approval: { variant: 'primary', text: 'Chờ duyệt' },
    cancelled: { variant: 'secondary', text: 'Đã hủy' }
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
    change_class: { variant: 'primary', text: 'Đổi lớp' },
    makeup_class: { variant: 'warning', text: 'Học bù' },
    request_replace_teacher: { variant: 'secondary', text: 'Dạy thay' },
    assign_students: { variant: 'success', text: 'Sắp xếp học viên' },
    create_program: { variant: 'info', text: 'Tạo chương trình' },
    edit_course: { variant: 'warning', text: 'Chỉnh sửa khóa học' },
    create_exam: { variant: 'primary', text: 'Tạo đề thi' }
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





