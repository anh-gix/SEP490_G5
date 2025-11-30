import React, { useMemo, useState } from 'react';
import { Container, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import ScheduleCalendar from '../../components/class_management/ScheduleCalendar';
import { formatDateToYYYYMMDD } from '../../helper/helper';
import classService from '../../services/classService';

/**
 * Request Detail Page Component
 * Hiển thị chi tiết đơn - Lịch học/dạy như một trang riêng
 */
const RequestDetailPage = ({
  selectedRequest,
  senderSchedule,
  senderRole,
  loadingSchedule,
  pendingClassChange,
  pendingMakeupClasses,
  pendingMakeupSessions,
  onBack,
  onApprove,
  onReject,
  onChangeClass,
  onAddMakeupClass,
  onRemoveMakeupClass,
  processing,
  formatDate,
  renderClassInfo
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  // Xác định role của người gửi đơn
  const isStudent = senderRole === 'Student';
  const isTeacher = senderRole === 'Teacher';
  
  // Tính toán studentClasses từ senderSchedule
  const studentClasses = useMemo(() => {
    if (!senderSchedule || senderSchedule.length === 0) {
      return [];
    }

    // Nhóm schedules theo class
    const classMap = new Map();
    
    senderSchedule.forEach(schedule => {
      const classId = schedule.class?._id?.toString() || schedule.class?.toString();
      if (!classId) return;

      if (!classMap.has(classId)) {
        classMap.set(classId, {
          classId: classId,
          className: schedule.class?.name || 'N/A',
          courseName: schedule.class?.course?.name || 'N/A',
          schedules: []
        });
      }

      const classData = classMap.get(classId);
      if (schedule.session) {
        classData.schedules.push({
          date: new Date(schedule.date),
          sessionTitle: schedule.session?.title || 'N/A',
          sessionOrder: schedule.session?.order || null
        });
      }
    });

    // Tìm session đang học (session gần nhất) cho mỗi lớp
    const now = new Date();
    const result = Array.from(classMap.values()).map(classData => {
      // Sắp xếp schedules theo date và sessionOrder
      const sortedSchedules = classData.schedules.sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return (a.sessionOrder || 0) - (b.sessionOrder || 0);
      });

      // Tìm session gần nhất (đã học hoặc sắp học)
      let currentSession = null;
      
      // Tìm session đã học gần nhất
      const pastSessions = sortedSchedules.filter(s => s.date <= now);
      if (pastSessions.length > 0) {
        currentSession = pastSessions[pastSessions.length - 1];
      } else if (sortedSchedules.length > 0) {
        // Nếu chưa có session nào đã học, lấy session đầu tiên (sắp học)
        currentSession = sortedSchedules[0];
      }

      return {
        classId: classData.classId,
        className: classData.className,
        courseName: classData.courseName,
        currentSessionTitle: currentSession?.sessionTitle || 'Chưa có session',
        currentSessionOrder: currentSession?.sessionOrder || null
      };
    });

    return result;
  }, [senderSchedule]);

  // Lọc các buổi học bù đã được xếp trong calendar
  const filteredPendingMakeupSessions = useMemo(() => {
    if (!pendingMakeupSessions || pendingMakeupSessions.length === 0) {
      return [];
    }
    
    if (!pendingMakeupClasses || pendingMakeupClasses.length === 0) {
      return pendingMakeupSessions;
    }
    
    // Lọc bỏ các buổi đã được xếp học bù
    return pendingMakeupSessions.filter(session => {
      const sessionScheduleId = session.classScheduleId?.toString();
      
      // Nếu không có classScheduleId, giữ lại buổi này (không thể xác định)
      if (!sessionScheduleId) {
        return true;
      }
      
      // Kiểm tra xem buổi này đã được xếp học bù chưa
      const isAlreadyScheduled = pendingMakeupClasses.some(makeup => {
        const absentId = makeup.absentScheduleId?.toString() || 
                        makeup.absentSchedule?.id?.toString() || 
                        makeup.absentSchedule?._id?.toString();
        return absentId && absentId === sessionScheduleId;
      });
      
      return !isAlreadyScheduled;
    });
  }, [pendingMakeupSessions, pendingMakeupClasses]);

  // Tính toán calendarSchedules từ senderSchedule
  const calendarSchedules = useMemo(() => {
    const schedules = senderSchedule.map((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = formatDateToYYYYMMDD(scheduleDate);
      
      // Lấy attendance status nếu có
      const attendanceStatus = schedule.attendance?.status || null;
      
      // Lấy scheduleStatus từ StudentSchedule (cancelled, scheduled, etc.)
      const scheduleStatus = schedule.scheduleStatus || 'scheduled';
      
      // Kiểm tra xem buổi này có phải là buổi nghỉ không (từ pendingMakeupClasses, đã bị cancelled, hoặc từ đơn)
      const scheduleId = schedule._id || schedule.id || index;
      
      // Kiểm tra xem có phải buổi nghỉ từ đơn không (cho đơn makeup_class)
      let isAbsentFromRequest = false;
      if (selectedRequest?.type === 'makeup_class' && selectedRequest?.studentScheduleId) {
        const requestStudentSchedule = selectedRequest.studentScheduleId;
        const requestStudentScheduleId = requestStudentSchedule._id || requestStudentSchedule.id;
        const requestClassSchedule = requestStudentSchedule.classSchedule;
        const requestClassScheduleId = requestClassSchedule?._id || requestClassSchedule?.id;
        
        // So khớp theo StudentSchedule ID (ưu tiên)
        if (requestStudentScheduleId) {
          isAbsentFromRequest = requestStudentScheduleId.toString() === scheduleId.toString() || 
                               requestStudentScheduleId.toString() === schedule._id?.toString() ||
                               requestStudentScheduleId.toString() === schedule.id?.toString();
        }
        
        // Nếu không khớp theo StudentSchedule ID, thử so khớp theo ClassSchedule ID
        if (!isAbsentFromRequest && requestClassScheduleId) {
          const scheduleClassScheduleId = schedule.classSchedule?._id || schedule.classSchedule?.id;
          if (scheduleClassScheduleId && scheduleClassScheduleId.toString() === requestClassScheduleId.toString()) {
            isAbsentFromRequest = true;
          }
        }
        
        // Nếu vẫn không khớp, thử so khớp theo date, time và class
        if (!isAbsentFromRequest && requestClassSchedule) {
          const requestDate = requestClassSchedule.date || requestStudentSchedule.date;
          const requestStartTime = requestClassSchedule.startTime || requestStudentSchedule.startTime;
          const requestClassId = requestClassSchedule.class?._id || requestClassSchedule.class?.id || requestClassSchedule.class;
          
          if (requestDate && requestStartTime) {
            const scheduleDateStr = schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : '';
            const requestDateStr = requestDate ? new Date(requestDate).toISOString().split('T')[0] : '';
            const scheduleClassId = schedule.class?._id || schedule.class?.id || schedule.class;
            
            if (scheduleDateStr === requestDateStr && 
                schedule.startTime === requestStartTime &&
                scheduleClassId && requestClassId &&
                scheduleClassId.toString() === requestClassId.toString()) {
              isAbsentFromRequest = true;
            }
          }
        }
      }
      
      const isAbsentSchedule = isAbsentFromRequest || (pendingMakeupClasses && pendingMakeupClasses.some(makeup => {
        // Bỏ qua nếu là giáo viên dạy thay (buổi học vẫn diễn ra, chỉ đổi giáo viên)
        if (makeup.isSubstituteClass) return false;
        const absentId = makeup.absentScheduleId || makeup.absentSchedule?.id || makeup.absentSchedule?._id;
        return absentId && (absentId.toString() === scheduleId.toString() || absentId.toString() === schedule._id?.toString());
      }));
      
      // Kiểm tra xem buổi này có giáo viên dạy thay không
      const hasSubstituteTeacher = pendingMakeupClasses && pendingMakeupClasses.some(makeup => {
        if (!makeup.isSubstituteClass) return false;
        const absentId = makeup.absentScheduleId || makeup.absentSchedule?.id || makeup.absentSchedule?._id;
        return absentId && (absentId.toString() === scheduleId.toString() || absentId.toString() === schedule._id?.toString());
      });
      
      // Lấy thông tin giáo viên dạy thay nếu có
      const substituteTeacherInfo = hasSubstituteTeacher 
        ? pendingMakeupClasses.find(makeup => {
            if (!makeup.isSubstituteClass) return false;
            const absentId = makeup.absentScheduleId || makeup.absentSchedule?.id || makeup.absentSchedule?._id;
            return absentId && (absentId.toString() === scheduleId.toString() || absentId.toString() === schedule._id?.toString());
          })?.substituteTeacherInfo
        : null;
      
      // Buổi đã bị cancelled (từ StudentSchedule)
      const isCancelled = scheduleStatus === 'cancelled';
      
      // Xác định status hiển thị
      let displayStatus = 'scheduled';
      if ((isCancelled || isAbsentSchedule) && !hasSubstituteTeacher) {
        displayStatus = 'cancelled';
      } else if (scheduleStatus === 'rescheduled' || schedule.status === 'temporary') {
        displayStatus = 'makeup';
      } else if (schedule.status === 'fixed') {
        displayStatus = 'scheduled';
      }
      
      // Kiểm tra xem có phải buổi học bù không (từ database với scheduleStatus: 'rescheduled')
      const isMakeupFromDB = scheduleStatus === 'rescheduled';
      
      return {
        id: scheduleId,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: schedule.class?.name || 'N/A',
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.topic || '',
        status: displayStatus,
        scheduleStatus: scheduleStatus, // 'scheduled', 'cancelled', 'rescheduled', 'completed', 'pending'
        attendanceStatus: attendanceStatus, // 'present', 'absent', 'late', 'excused', or null
        hasAttendance: !!attendanceStatus,
        teacherName: hasSubstituteTeacher 
          ? (substituteTeacherInfo?.username || substituteTeacherInfo?.fullName || substituteTeacherInfo?.name || 'N/A')
          : (schedule.teacher?.username || 'N/A'),
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.topic || '',
        isAbsentSchedule: isAbsentSchedule || (isCancelled && !hasSubstituteTeacher),
        isCancelled: isCancelled && !hasSubstituteTeacher,
        isMakeupSchedule: isMakeupFromDB, // Đánh dấu buổi học bù từ database
        isSubstituteClass: hasSubstituteTeacher, // Đánh dấu có giáo viên dạy thay
        cancellationReason: schedule.studentScheduleReason || null,
        makeupReason: isMakeupFromDB ? schedule.studentScheduleReason : null // Lý do học bù
      };
    });
    
    // Lấy danh sách ID của các buổi học bù đã có trong schedules (từ database)
    const existingMakeupScheduleIds = schedules
      .filter(s => s.isMakeupSchedule || s.scheduleStatus === 'rescheduled')
      .map(s => s.id?.toString() || s._id?.toString());
    
    // Thêm các buổi học bù từ pendingMakeupClasses (chưa được approve)
    // Chỉ thêm những buổi chưa có trong database
    // Bỏ qua các buổi giáo viên dạy thay vì buổi học vẫn diễn ra vào đúng thời gian (chỉ đổi giáo viên)
    const makeupSchedules = (pendingMakeupClasses || [])
      .map((makeup, index) => {
        // Bỏ qua nếu là giáo viên dạy thay (buổi học vẫn diễn ra vào đúng thời gian)
        if (makeup.isSubstituteClass) return null;
        
        if (!makeup.makeupSchedule || !makeup.makeupSchedule.date) return null;
        
        const makeupScheduleId = makeup.makeupScheduleId?.toString() || 
                                 makeup.makeupSchedule?.id?.toString() || 
                                 makeup.makeupSchedule?._id?.toString();
        
        // Bỏ qua nếu buổi học bù này đã có trong database
        if (makeupScheduleId && existingMakeupScheduleIds.includes(makeupScheduleId)) {
          return null;
        }
        
        const scheduleDate = new Date(makeup.makeupSchedule.date);
        const dateStr = formatDateToYYYYMMDD(scheduleDate);
        
        return {
          id: `makeup-pending-${index}-${makeupScheduleId}`,
          date: dateStr,
          startTime: makeup.makeupSchedule.startTime || '',
          endTime: makeup.makeupSchedule.endTime || '',
          className: makeup.makeupClassInfo?.className || 'N/A',
          roomName: makeup.makeupSchedule.roomName || 'N/A',
          topic: makeup.makeupSchedule.title || '',
          status: 'makeup',
          scheduleStatus: 'rescheduled', // Đánh dấu là rescheduled
          attendanceStatus: null,
          hasAttendance: false,
          teacherName: 'N/A',
          lessonNumber: makeup.makeupSchedule.order || '',
          lessonTopic: makeup.makeupSchedule.title || '',
          isMakeupSchedule: true
        };
      })
      .filter(Boolean);
    
    return [...schedules, ...makeupSchedules];
  }, [senderSchedule, pendingMakeupClasses, selectedRequest]);

  if (!selectedRequest) {
    return null;
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AcademicNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <Container fluid className="p-24">
          {/* Header với nút quay lại */}
          <div className="mb-24">
            <div className="d-flex align-items-center gap-12 mb-16">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onBack}
                className="d-flex align-items-center gap-2"
              >
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </Button>
            </div>
            <h4 className="text-neutral-900 fw-bold mb-8">
              {isStudent ? 'Chi tiết đơn - Lịch học' : isTeacher ? 'Chi tiết đơn - Lịch dạy' : 'Chi tiết đơn - Lịch học/dạy'}
            </h4>
          </div>

          {/* Card chứa thông tin đơn */}
          <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-20">
              {selectedRequest && (
                <div className="mb-16">
                  <p className="text-neutral-700 mb-8">
                    <strong>Người gửi:</strong> {selectedRequest.sender?.username} ({selectedRequest.sender?.email})
                  </p>
                  <p className="text-neutral-700 mb-8">
                    <strong>Ngày gửi:</strong> {formatDate(selectedRequest.createdAt)}
                  </p>
                  <p className="text-neutral-700 mb-16">
                    <strong>Nội dung đơn:</strong> {selectedRequest.content}
                  </p>
                  
                  {/* Hiển thị thông tin request dựa trên type */}
                  {(() => {
                    const requestType = selectedRequest?.type;
                    // Chỉ hiển thị phần này cho 3 loại đơn: makeup_class, replace_teacher, change_class
                    const shouldShowSection = requestType === 'makeup_class' || 
                                            requestType === 'replace_teacher' || 
                                            requestType === 'change_class';
                    
                    if (!shouldShowSection) return null;
                    
                    // ============================================
                    // 1. MAKEUP_CLASS: Hiển thị từ studentScheduleId
                    // ============================================
                    if (requestType === 'makeup_class' && selectedRequest?.studentScheduleId) {
                      const studentSchedule = selectedRequest.studentScheduleId;
                      const classSchedule = studentSchedule?.classSchedule;
                      const session = classSchedule?.session;
                      const classInfo = classSchedule?.class;
                      const courseInfo = classInfo?.course;
                      
                      if (!classSchedule) return null;
                      
                      // Tìm buổi học bù tương ứng với buổi nghỉ này
                      const studentScheduleId = studentSchedule?._id || studentSchedule?.id;
                      const correspondingMakeup = pendingMakeupClasses?.find(makeup => {
                        const absentId = makeup.absentScheduleId?.toString() || 
                                        makeup.absentSchedule?.id?.toString() || 
                                        makeup.absentSchedule?._id?.toString();
                        return absentId && absentId === studentScheduleId?.toString();
                      });
                      
                      // Format ngày thứ mấy
                      const scheduleDate = new Date(classSchedule.date);
                      const dayOfWeek = scheduleDate.getDay();
                      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                      const dayName = dayNames[dayOfWeek];
                      const dateStr = scheduleDate.toLocaleDateString('vi-VN');
                      
                      // Format thông tin buổi học bù (nếu có)
                      const makeupSchedule = correspondingMakeup?.makeupSchedule;
                      const makeupClassInfo = correspondingMakeup?.makeupClassInfo;
                      const isSubstituteClass = correspondingMakeup?.isSubstituteClass || false;
                      const substituteTeacherInfo = correspondingMakeup?.substituteTeacherInfo;
                      
                      const makeupDateStr = makeupSchedule?.date 
                        ? new Date(makeupSchedule.date).toLocaleDateString('vi-VN') 
                        : '';
                      const makeupTimeStr = makeupSchedule?.startTime && makeupSchedule?.endTime
                        ? `${makeupSchedule.startTime} - ${makeupSchedule.endTime}`
                        : '';
                      
                      // Tìm index của makeup trong pendingMakeupClasses để xóa
                      const makeupIndex = correspondingMakeup 
                        ? pendingMakeupClasses.findIndex(m => {
                            const mAbsentId = m.absentScheduleId?.toString() || 
                                             m.absentSchedule?.id?.toString() || 
                                             m.absentSchedule?._id?.toString();
                            return mAbsentId === studentScheduleId?.toString();
                          })
                        : -1;
                      
                      return (
                        <div className="mb-12">
                          <h6 className="text-neutral-900 fw-bold mb-8 text-14">Buổi xin học bù:</h6>
                          <div className="border border-neutral-200 rounded-6 p-12 bg-white">
                            <div className="d-flex align-items-start justify-content-between gap-12">
                              <div className="flex-grow-1 d-flex flex-column gap-8">
                                {/* Buổi nghỉ */}
                                <div className="d-flex align-items-start gap-8">
                                  <i className="fas fa-calendar-times text-primary text-14 mt-1"></i>
                                  <div className="flex-grow-1 d-flex flex-column gap-4">
                                    <div className="text-primary fw-semibold text-13">Buổi nghỉ:</div>
                                    <div className="d-flex flex-column gap-2">
                                      <div>
                                        <span className="text-neutral-600 text-13">Lớp: </span>
                                        <span className="text-neutral-900 fw-semibold text-14">{classInfo?.name || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-neutral-600 text-13">Ngày: </span>
                                        <span className="text-neutral-700 text-13 fw-medium">{dayName} ({dateStr})</span>
                                      </div>
                                      <div>
                                        <span className="text-neutral-600 text-13">Giờ: </span>
                                        <span className="text-neutral-700 text-13 fw-medium">
                                          {classSchedule.startTime || 'N/A'} - {classSchedule.endTime || 'N/A'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-neutral-600 text-13">Đang học session: </span>
                                        <span className="text-neutral-700 text-13 fw-medium">
                                          {session?.title || 'N/A'}
                                          {session?.order !== null && session?.order !== undefined && (
                                            <span className="text-neutral-500 ms-4">(Số thứ tự: {session.order})</span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Buổi bù hoặc giáo viên dạy thay (nếu đã xếp) */}
                                {correspondingMakeup && (
                                  <>
                                    <div className="border-top border-neutral-200 pt-8 mt-4">
                                      {isSubstituteClass ? (
                                        // Hiển thị giáo viên dạy thay
                                        <div className="d-flex align-items-start gap-8">
                                          <i className="fas fa-user-tie text-success text-14 mt-1"></i>
                                          <div className="flex-grow-1 d-flex flex-column gap-2">
                                            <div className="text-success fw-semibold text-13">Giáo viên dạy thay:</div>
                                            <div className="text-neutral-700 text-13">
                                              <span className="fw-medium">
                                                {substituteTeacherInfo?.username || substituteTeacherInfo?.fullName || substituteTeacherInfo?.name || 'N/A'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        // Hiển thị buổi bù
                                        <div className="d-flex align-items-start gap-8">
                                          <i className="fas fa-calendar-check text-success text-14 mt-1"></i>
                                          <div className="flex-grow-1 d-flex flex-column gap-2">
                                            <div className="text-success fw-semibold text-13">Buổi bù:</div>
                                            <div className="d-flex flex-column gap-2">
                                              <div>
                                                <span className="text-neutral-600 text-13">Lớp: </span>
                                                <span className="text-neutral-900 fw-semibold text-14">{makeupClassInfo?.className || 'N/A'}</span>
                                              </div>
                                              {makeupSchedule?.title && (
                                                <div>
                                                  <span className="text-neutral-600 text-13">Buổi học: </span>
                                                  <span className="text-neutral-700 text-13 fw-medium">
                                                    {makeupSchedule.title}
                                                    {makeupSchedule.order && (
                                                      <span className="text-neutral-500 ms-4">(STT: {makeupSchedule.order})</span>
                                                    )}
                                                  </span>
                                                </div>
                                              )}
                                              {makeupDateStr && (
                                                <div>
                                                  <span className="text-neutral-600 text-13">Ngày: </span>
                                                  <span className="text-neutral-700 text-13 fw-medium">{makeupDateStr}</span>
                                                </div>
                                              )}
                                              {makeupTimeStr && (
                                                <div>
                                                  <span className="text-neutral-600 text-13">Giờ: </span>
                                                  <span className="text-neutral-700 text-13 fw-medium">{makeupTimeStr}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="d-flex flex-column gap-2 align-items-end">
                                {!correspondingMakeup ? (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                      // Truyền studentScheduleId để tự động chọn buổi học bù từ đơn
                                      const studentScheduleId = studentSchedule?._id || studentSchedule?.id;
                                      onAddMakeupClass(studentScheduleId);
                                    }}
                                    className="d-flex align-items-center gap-2"
                                  >
                                    <i className="fas fa-plus"></i>
                                    {isStudent ? 'Xếp buổi học bù' : isTeacher ? 'Xếp lịch dạy thay' : 'Xếp buổi học bù'}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      if (onRemoveMakeupClass && makeupIndex >= 0) {
                                        onRemoveMakeupClass(makeupIndex);
                                      }
                                    }}
                                    className="d-flex align-items-center gap-2"
                                    title="Xóa buổi học bù này"
                                  >
                                    <i className="fas fa-trash"></i>
                                    Xóa
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // ============================================
                    // 2. REPLACE_TEACHER: Hiển thị từ classScheduleId
                    // ============================================
                    if (requestType === 'replace_teacher' && selectedRequest?.classScheduleId) {
                      const classSchedule = selectedRequest.classScheduleId;
                      const session = classSchedule?.session;
                      const classInfo = classSchedule?.class;
                      const courseInfo = classInfo?.course;
                      
                      if (!classSchedule) return null;
                      
                      // Format ngày thứ mấy
                      const scheduleDate = new Date(classSchedule.date);
                      const dayOfWeek = scheduleDate.getDay();
                      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                      const dayName = dayNames[dayOfWeek];
                      const dateStr = scheduleDate.toLocaleDateString('vi-VN');
                      
                      return (
                        <div className="mb-12">
                          <h6 className="text-neutral-900 fw-bold mb-8 text-14">Buổi xin xếp người dạy thay:</h6>
                          <div className="border border-neutral-200 rounded-6 p-12 bg-white">
                            <div className="d-flex flex-column gap-8">
                              <div>
                                <span className="text-neutral-600 text-13">Lớp: </span>
                                <span className="text-neutral-900 fw-semibold text-14">{classInfo?.name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-neutral-600 text-13">Thứ mấy: </span>
                                <span className="text-neutral-700 text-13 fw-medium">{dayName} ({dateStr})</span>
                              </div>
                              <div>
                                <span className="text-neutral-600 text-13">Giờ nào: </span>
                                <span className="text-neutral-700 text-13 fw-medium">
                                  {classSchedule.startTime || 'N/A'} - {classSchedule.endTime || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-600 text-13">Đang học session nào: </span>
                                <span className="text-neutral-700 text-13 fw-medium">
                                  {session?.title || 'N/A'}
                                  {session?.order !== null && session?.order !== undefined && (
                                    <span className="text-neutral-500 ms-4">(Số thứ tự: {session.order})</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // ============================================
                    // 3. CHANGE_CLASS: Hiển thị từ classId
                    // ============================================
                    if (requestType === 'change_class' && selectedRequest?.classId) {
                      const classInfo = selectedRequest.classId;
                      const courseInfo = classInfo?.course;
                      // Chỉ lấy các buổi cố định (status='fixed'), không lấy buổi tạm
                      const allSchedules = classInfo?.fixedSchedules || [];
                      const fixedSchedules = allSchedules.filter(schedule => 
                        schedule.status === 'fixed' || !schedule.status // Nếu không có status thì coi như fixed
                      );
                      const currentSession = classInfo?.currentSession;
                      
                      // Format thời khóa biểu
                      const formatSchedule = (schedules) => {
                        if (!schedules || schedules.length === 0) return 'Chưa có lịch học';
                        
                        // Nhóm theo thứ trong tuần
                        const scheduleGroups = {};
                        schedules.forEach(schedule => {
                          const date = new Date(schedule.date);
                          const dayOfWeek = date.getDay();
                          const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                          const dayName = dayNames[dayOfWeek];
                          const key = `${dayOfWeek}-${schedule.startTime}-${schedule.endTime}`;
                          
                          if (!scheduleGroups[key]) {
                            scheduleGroups[key] = {
                              dayName,
                              startTime: schedule.startTime,
                              endTime: schedule.endTime
                            };
                          }
                        });
                        
                        return Object.values(scheduleGroups).map(group => 
                          `${group.dayName} | ${group.startTime}-${group.endTime}`
                        ).join(', ');
                      };
                      
                      // Tạo classItem để truyền vào onChangeClass
                      const classItemForChange = {
                        classId: classInfo?._id || classInfo,
                        className: classInfo?.name || 'N/A',
                        courseName: courseInfo?.name || 'N/A',
                        currentSessionTitle: currentSession?.title || 'Chưa có thông tin session',
                        currentSessionOrder: currentSession?.order || null,
                        fixedSchedules: fixedSchedules
                      };
                      
                      return (
                        <div className="mb-12">
                          <h6 className="text-neutral-900 fw-bold mb-8 text-14">Lớp xin đổi:</h6>
                          <div className="border border-neutral-200 rounded-6 p-12 bg-white">
                            <div className="d-flex align-items-start justify-content-between gap-12">
                              <div className="flex-grow-1 d-flex flex-column gap-8">
                                <div>
                                  <span className="text-neutral-600 text-13">Lớp: </span>
                                  <span className="text-neutral-900 fw-semibold text-14">{classInfo?.name || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-neutral-600 text-13">Thời khóa biểu hiện tại: </span>
                                  <div className="text-neutral-700 text-13 fw-medium mt-2">
                                    {formatSchedule(fixedSchedules)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-neutral-600 text-13">Đang học session nào: </span>
                                  <span className="text-neutral-700 text-13 fw-medium">
                                    {currentSession?.title || 'Chưa có thông tin session'}
                                    {currentSession?.order !== null && currentSession?.order !== undefined && (
                                      <span className="text-neutral-500 ms-4">(Số thứ tự: {currentSession.order})</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              {isStudent && (
                                <div className="d-flex align-items-center">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => onChangeClass(classItemForChange)}
                                    className="d-flex align-items-center gap-2"
                                  >
                                    <i className="fas fa-exchange-alt"></i>
                                    Đổi lớp
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // Fallback: Hiển thị từ studentClasses (cho các trường hợp khác)
                    return shouldShowSection && studentClasses.length > 0 && (
                      <div className="mb-12">
                        <h6 className="text-neutral-900 fw-bold mb-8 text-14">
                          {requestType === 'makeup_class' 
                            ? 'Buổi xin học bù:' 
                            : requestType === 'replace_teacher' 
                            ? 'Buổi xin xếp buổi dạy thay:' 
                            : requestType === 'change_class' 
                            ? 'Lớp yêu cầu đổi:' 
                            : ''}
                        </h6>
                        <div className="border border-neutral-200 rounded-6 p-8 bg-neutral-25">
                          <div className="d-flex flex-column" style={{ gap: '12px' }}>
                            {studentClasses.map((classItem, index) => {
                              const isPendingChange = pendingClassChange && 
                                pendingClassChange.oldClassId === classItem.classId;
                              
                              if (isPendingChange) {
                                return (
                                  <div key={index} className="row g-3">
                                    <div className="col-md-6">
                                      {renderClassInfo(pendingClassChange.oldClassInfo, true)}
                                    </div>
                                    <div className="col-md-6">
                                      {renderClassInfo(pendingClassChange.newClassInfo, false)}
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div 
                                    key={index}
                                    className="d-flex align-items-start justify-content-between gap-12 p-12 bg-white rounded-8 border border-neutral-100"
                                  >
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center gap-8 mb-4">
                                        <i className="fas fa-book text-main-600"></i>
                                        <span className="text-neutral-900 fw-semibold text-14">{classItem.className}</span>
                                      </div>
                                      <div className="ps-20 mb-4">
                                        <span className="text-neutral-600 text-13">Khóa học: </span>
                                        <span className="text-neutral-700 text-13">{classItem.courseName}</span>
                                      </div>
                                      <div className="ps-20">
                                        <span className="text-neutral-600 text-13">
                                          {isStudent ? 'Session đang học: ' : isTeacher ? 'Session đang dạy: ' : 'Session đang học: '}
                                        </span>
                                        <span className="text-neutral-700 text-13 fw-medium">
                                          {classItem.currentSessionTitle}
                                          {classItem.currentSessionOrder !== null && (
                                            <span className="text-neutral-500 ms-4">(Số thứ tự: {classItem.currentSessionOrder})</span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    {isStudent && (
                                      <div className="d-flex align-items-center">
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          onClick={() => onChangeClass(classItem)}
                                          className="d-flex align-items-center gap-2"
                                        >
                                          <i className="fas fa-exchange-alt"></i>
                                          Đổi lớp
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Cảnh báo các buổi cần học bù (trường hợp 2) */}
                  {pendingClassChange && filteredPendingMakeupSessions && filteredPendingMakeupSessions.length > 0 && (
                    <Alert variant="warning" className="mt-12 mb-0">
                      <div className="d-flex align-items-start gap-8">
                        <i className="fas fa-exclamation-triangle text-warning mt-1"></i>
                        <div className="flex-grow-1">
                          <strong className="text-warning-dark">Cảnh báo: Học sinh cần học bù các buổi sau:</strong>
                          <ul className="mb-0 mt-8 ps-20">
                            {filteredPendingMakeupSessions.map((session, idx) => (
                              <li key={idx} className="mb-4">
                                <strong>Buổi {session.sessionOrder}:</strong> {session.sessionTitle}
                                {session.date && (
                                  <span className="text-neutral-600 ms-8">
                                    ({new Date(session.date).toLocaleDateString('vi-VN')} {session.startTime}-{session.endTime})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Alert>
                  )}
                </div>
              )}
              
              <div className="d-flex align-items-center justify-content-between mb-12">
                <h6 className="text-neutral-900 fw-bold mb-0">
                  {isStudent ? 'Lịch học:' : isTeacher ? 'Lịch dạy:' : 'Lịch học/dạy:'}
                </h6>
                {/* Chỉ hiển thị nút khi không phải đơn makeup_class và không phải đơn create_class */}
                {selectedRequest?.type !== 'makeup_class' && selectedRequest?.type !== 'create_class' && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={onAddMakeupClass}
                    className="d-flex align-items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    {isStudent ? 'Thêm buổi học bù' : isTeacher ? 'Xếp lịch dạy thay' : 'Thêm buổi học bù'}
                  </Button>
                )}
              </div>
              
              {loadingSchedule ? (
                <div className="text-center py-20">
                  <Spinner animation="border" size="sm" />
                  <p className="text-neutral-600 mt-8">Đang tải lịch...</p>
                </div>
              ) : calendarSchedules.length === 0 ? (
                <p className="text-neutral-500 text-center py-20">
                  {isStudent ? 'Không có lịch học' : isTeacher ? 'Không có lịch dạy' : 'Không có lịch học/dạy'}
                </p>
              ) : (
                <div className="border border-neutral-100 rounded-12 p-16 bg-white mb-16">
                  <ScheduleCalendar
                    schedules={calendarSchedules}
                    onEditSchedule={() => {}} // Read-only
                    onDeleteSchedule={() => {}} // Read-only
                    onCreateMakeup={() => {}} // Read-only
                    classService={classService}
                    studentSchedule={senderSchedule.map(sch => {
                      const scheduleDate = new Date(sch.date);
                      const dateStr = formatDateToYYYYMMDD(scheduleDate);
                      return {
                        date: dateStr,
                        startTime: sch.startTime || '',
                        endTime: sch.endTime || ''
                      };
                    })}
                  />
                </div>
              )}

            </Card.Body>
          </Card>

          {/* Footer với các nút hành động */}
          <div className="d-flex justify-content-end gap-12">
            <Button 
              variant="secondary" 
              onClick={onBack}
            >
              Đóng
            </Button>
            <Button 
              variant="danger" 
              onClick={() => {
                setShowRejectModal(true);
                setRejectReason('');
              }}
              disabled={processing}
            >
              {processing ? 'Đang xử lý...' : 'Từ chối'}
            </Button>
            <Button 
              variant="success" 
              onClick={onApprove} 
              disabled={processing || (filteredPendingMakeupSessions && filteredPendingMakeupSessions.length > 0)}
              title={filteredPendingMakeupSessions && filteredPendingMakeupSessions.length > 0 
                ? 'Vui lòng xếp học bù cho tất cả các buổi còn thiếu trước khi chấp nhận' 
                : ''}
            >
              {processing ? 'Đang xử lý...' : 'Chấp nhận'}
            </Button>
          </div>
        </Container>
      </div>

      {/* Modal từ chối */}
      <Modal show={showRejectModal} onHide={() => {
        setShowRejectModal(false);
        setRejectReason('');
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Từ chối đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div className="mb-16">
              <p className="text-neutral-700 mb-8">
                <strong>Người gửi:</strong> {selectedRequest.sender?.username} ({selectedRequest.sender?.email})
              </p>
              <p className="text-neutral-700 mb-8">
                <strong>Ngày gửi:</strong> {formatDate(selectedRequest.createdAt)}
              </p>
              <p className="text-neutral-700 mb-16">
                <strong>Nội dung đơn:</strong> {selectedRequest.content}
              </p>
            </div>
          )}
          <Form.Group>
            <Form.Label>Lý do từ chối (không bắt buộc)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (nếu có)..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
            }}
            disabled={processing}
          >
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={async () => {
              if (onReject) {
                await onReject(rejectReason || null);
                setShowRejectModal(false);
                setRejectReason('');
              }
            }}
            disabled={processing}
          >
            {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RequestDetailPage;

