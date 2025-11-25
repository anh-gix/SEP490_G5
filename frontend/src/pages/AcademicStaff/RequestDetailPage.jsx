import React, { useMemo } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
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
  loadingSchedule,
  pendingClassChange,
  pendingMakeupClasses,
  onBack,
  onApprove,
  onReject,
  onChangeClass,
  onAddMakeupClass,
  processing,
  formatDate,
  renderClassInfo
}) => {
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

  // Tính toán calendarSchedules từ senderSchedule
  const calendarSchedules = useMemo(() => {
    const schedules = senderSchedule.map((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = formatDateToYYYYMMDD(scheduleDate);
      
      // Lấy attendance status nếu có
      const attendanceStatus = schedule.attendance?.status || null;
      
      // Kiểm tra xem buổi này có phải là buổi nghỉ không
      const scheduleId = schedule._id || schedule.id || index;
      const isAbsentSchedule = pendingMakeupClasses && pendingMakeupClasses.some(makeup => {
        const absentId = makeup.absentScheduleId || makeup.absentSchedule?.id || makeup.absentSchedule?._id;
        return absentId && (absentId.toString() === scheduleId.toString() || absentId.toString() === schedule._id?.toString());
      });
      
      return {
        id: scheduleId,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: schedule.class?.name || 'N/A',
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.topic || '',
        status: isAbsentSchedule ? 'absent' : (schedule.status === 'fixed' ? 'scheduled' : schedule.status === 'temporary' ? 'makeup' : 'scheduled'),
        attendanceStatus: attendanceStatus, // 'present', 'absent', 'late', 'excused', or null
        hasAttendance: !!attendanceStatus,
        teacherName: schedule.teacher?.username || 'N/A',
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.topic || '',
        isAbsentSchedule: isAbsentSchedule
      };
    });
    
    // Thêm các buổi học bù vào calendar
    const makeupSchedules = (pendingMakeupClasses || []).map((makeup, index) => {
      if (!makeup.makeupSchedule || !makeup.makeupSchedule.date) return null;
      
      const scheduleDate = new Date(makeup.makeupSchedule.date);
      const dateStr = formatDateToYYYYMMDD(scheduleDate);
      
      return {
        id: `makeup-${index}-${makeup.makeupScheduleId}`,
        date: dateStr,
        startTime: makeup.makeupSchedule.startTime || '',
        endTime: makeup.makeupSchedule.endTime || '',
        className: makeup.makeupClassInfo?.className || 'N/A',
        roomName: makeup.makeupSchedule.roomName || 'N/A',
        topic: makeup.makeupSchedule.title || '',
        status: 'makeup',
        attendanceStatus: null,
        hasAttendance: false,
        teacherName: 'N/A',
        lessonNumber: makeup.makeupSchedule.order || '',
        lessonTopic: makeup.makeupSchedule.title || '',
        isMakeupSchedule: true
      };
    }).filter(Boolean);
    
    return [...schedules, ...makeupSchedules];
  }, [senderSchedule, pendingMakeupClasses]);

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
            <h4 className="text-neutral-900 fw-bold mb-8">Chi tiết đơn - Lịch học/dạy</h4>
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
                  
                  {/* Danh sách lớp học viên đang học */}
                  {studentClasses.length > 0 && (
                    <div className="mb-16">
                      <h6 className="text-neutral-900 fw-bold mb-12">Các lớp học viên đang học:</h6>
                      <div className="border border-neutral-200 rounded-8 p-12 bg-neutral-25">
                        <div className="d-flex flex-column gap-8">
                          {studentClasses.map((classItem, index) => {
                            // Kiểm tra xem lớp này có đang pending đổi không
                            const isPendingChange = pendingClassChange && 
                              pendingClassChange.oldClassId === classItem.classId;
                            
                            if (isPendingChange) {
                              // Hiển thị layout 2 cột cho lớp đang pending đổi
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
                              // Hiển thị bình thường cho các lớp khác
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
                                      <span className="text-neutral-600 text-13">Session đang học: </span>
                                      <span className="text-neutral-700 text-13 fw-medium">
                                        {classItem.currentSessionTitle}
                                        {classItem.currentSessionOrder !== null && (
                                          <span className="text-neutral-500 ms-4">(Số thứ tự: {classItem.currentSessionOrder})</span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
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
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="d-flex align-items-center justify-content-between mb-12">
                <h6 className="text-neutral-900 fw-bold mb-0">Lịch học/dạy:</h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={onAddMakeupClass}
                  className="d-flex align-items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Thêm buổi học bù
                </Button>
              </div>
              
              {loadingSchedule ? (
                <div className="text-center py-20">
                  <Spinner animation="border" size="sm" />
                  <p className="text-neutral-600 mt-8">Đang tải lịch...</p>
                </div>
              ) : calendarSchedules.length === 0 ? (
                <p className="text-neutral-500 text-center py-20">Không có lịch học/dạy</p>
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
              onClick={onReject}
              disabled={processing}
            >
              {processing ? 'Đang xử lý...' : 'Từ chối'}
            </Button>
            <Button 
              variant="success" 
              onClick={onApprove} 
              disabled={processing}
            >
              {processing ? 'Đang xử lý...' : 'Xác nhận chấp nhận'}
            </Button>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default RequestDetailPage;

