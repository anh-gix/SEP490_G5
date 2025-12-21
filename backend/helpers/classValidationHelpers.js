/**
 * Helper functions for validating class data completeness
 */

/**
 * Kiểm tra xem lớp học có đủ thông tin bắt buộc để chuyển sang status 'pending' không
 *
 * @param {Object} classData - Dữ liệu lớp học cần kiểm tra
 * @param {ObjectId} classData.course - Khóa học
 * @param {Date} classData.startDate - Ngày khai giảng
 * @param {ObjectId} classData.teacher - Giáo viên
 * @param {ObjectId} classData.room - Phòng học
 * @param {Array} classData.scheduleEntries - Thời khóa biểu trong tuần
 * @param {Array} classData.students - Danh sách học viên
 * @returns {boolean} - true nếu đủ thông tin, false nếu thiếu
 */
const isClassDataComplete = (classData) => {
  // Kiểm tra thông tin cơ bản
  const hasBasicInfo = classData.course &&
                       classData.startDate &&
                       classData.teacher &&
                       classData.room;

  // Kiểm tra có thời khóa biểu
  const hasScheduleEntries = classData.scheduleEntries &&
                             Array.isArray(classData.scheduleEntries) &&
                             classData.scheduleEntries.length > 0;

  // Kiểm tra có học viên
  const hasStudents = classData.students &&
                      Array.isArray(classData.students) &&
                      classData.students.length > 0;

  return hasBasicInfo && hasScheduleEntries && hasStudents;
};

module.exports = {
  isClassDataComplete
};
