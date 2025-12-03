import React, { useMemo, useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import ScheduleCalendar from '../../components/class_management/ScheduleCalendar';
import { formatDateToYYYYMMDD, parseDateString } from '../../helper/helper';
import classService from '../../services/classService';
import { studentScheduleService } from '../../services/studentScheduleService';

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
  onRemoveClassChange,
  processing,
  formatDate,
  renderClassInfo
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loadingStudentScheduleIds, setLoadingStudentScheduleIds] = useState({}); // Map session index -> loading state
  const [resolvedStudentScheduleIds, setResolvedStudentScheduleIds] = useState({}); // Map session index -> studentScheduleId
  const [replaceTeacherStudentScheduleId, setReplaceTeacherStudentScheduleId] = useState(null); // studentScheduleId cho đơn replace_teacher
  const [loadingReplaceTeacherScheduleId, setLoadingReplaceTeacherScheduleId] = useState(false); // Loading state cho replace_teacher
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

  // Không lọc bỏ các buổi đã được xếp học bù, vẫn hiển thị để có thể chỉnh sửa
  // Chỉ dùng để kiểm tra xem còn buổi nào chưa xếp học bù (cho nút Chấp nhận)
  const filteredPendingMakeupSessions = useMemo(() => {
    if (!pendingMakeupSessions || pendingMakeupSessions.length === 0) {
      return [];
    }
    
    // Không lọc, hiển thị tất cả các buổi (kể cả đã xếp học bù)
    return pendingMakeupSessions;
  }, [pendingMakeupSessions]);
  
  // Tính toán số buổi chưa được xếp học bù (để disable nút Chấp nhận)
  const unscheduledMakeupSessionsCount = useMemo(() => {
    if (!pendingMakeupSessions || pendingMakeupSessions.length === 0) {
      return 0;
    }
    
    if (!pendingMakeupClasses || pendingMakeupClasses.length === 0) {
      return pendingMakeupSessions.length;
    }
    
    // Đếm số buổi chưa được xếp học bù
    return pendingMakeupSessions.filter((session, idx) => {
      // Tìm studentScheduleId từ nhiều nguồn
      let sessionStudentScheduleId = session.studentScheduleId?.toString();
      
      // Nếu không có, thử lấy từ resolvedStudentScheduleIds
      if (!sessionStudentScheduleId && resolvedStudentScheduleIds[idx]) {
        sessionStudentScheduleId = resolvedStudentScheduleIds[idx]?.toString();
      }
      
      // Nếu vẫn không có, thử tìm từ senderSchedule
      if (!sessionStudentScheduleId && senderSchedule && senderSchedule.length > 0) {
        // Tìm theo classScheduleId
        if (session.classScheduleId) {
          const found = senderSchedule.find(sch => {
            const classScheduleId = sch.classSchedule?._id?.toString() || sch.classSchedule?.id?.toString();
            return classScheduleId === session.classScheduleId?.toString();
          });
          if (found) {
            sessionStudentScheduleId = (found._id || found.id)?.toString();
          }
        }
        
        // Nếu vẫn không có, tìm theo ngày, giờ, và lớp
        if (!sessionStudentScheduleId && session.date && session.startTime && pendingClassChange?.oldClassId) {
          const sessionDate = new Date(session.date);
          sessionDate.setHours(0, 0, 0, 0);
          
          const found = senderSchedule.find(sch => {
            const schDate = new Date(sch.date);
            schDate.setHours(0, 0, 0, 0);
            
            const classId = sch.class?._id?.toString() || sch.class?.toString();
            return classId === pendingClassChange.oldClassId.toString() &&
                   schDate.getTime() === sessionDate.getTime() &&
                   sch.startTime === session.startTime &&
                   sch.endTime === session.endTime;
          });
          
          if (found) {
            sessionStudentScheduleId = (found._id || found.id)?.toString();
          }
        }
      }
      
      // Nếu không có studentScheduleId, coi như chưa xếp
      if (!sessionStudentScheduleId) {
        return true;
      }
      
      // Kiểm tra xem buổi này đã được xếp học bù chưa
      const isAlreadyScheduled = pendingMakeupClasses.some(makeup => {
        // Bỏ qua giáo viên dạy thay
        if (makeup.isSubstituteClass) return false;
        
        const absentId = makeup.absentScheduleId?.toString() || 
                        makeup.absentSchedule?.id?.toString() || 
                        makeup.absentSchedule?._id?.toString();
        return absentId && absentId === sessionStudentScheduleId;
      });
      
      return !isAlreadyScheduled;
    }).length;
  }, [pendingMakeupSessions, pendingMakeupClasses, resolvedStudentScheduleIds, senderSchedule, pendingClassChange]);

  // useEffect để gọi API lấy studentScheduleId khi không tìm thấy
  useEffect(() => {
    if (!pendingClassChange || !filteredPendingMakeupSessions || filteredPendingMakeupSessions.length === 0 || !selectedRequest?.sender) {
      return;
    }
    
    const studentId = selectedRequest.sender._id || selectedRequest.sender;
    if (!studentId) return;
    
    // Tìm các session cần gọi API (không có studentScheduleId nhưng có classScheduleId)
    const sessionsToFetch = filteredPendingMakeupSessions
      .map((session, idx) => ({ session, idx }))
      .filter(({ session, idx }) => {
        // Kiểm tra xem đã có studentScheduleId chưa
        let hasStudentScheduleId = !!session.studentScheduleId;
        
        // Kiểm tra trong resolvedStudentScheduleIds
        if (!hasStudentScheduleId && resolvedStudentScheduleIds[idx]) {
          hasStudentScheduleId = true;
        }
        
        // Kiểm tra trong senderSchedule
        if (!hasStudentScheduleId) {
          if (session.classScheduleId) {
            const found = senderSchedule.find(sch => {
              const classScheduleId = sch.classSchedule?._id?.toString() || sch.classSchedule?.id?.toString();
              return classScheduleId === session.classScheduleId?.toString();
            });
            if (found) hasStudentScheduleId = true;
          }
        }
        
        // Chỉ fetch nếu không có studentScheduleId nhưng có classScheduleId và chưa đang loading
        return !hasStudentScheduleId && 
               session.classScheduleId && 
               !loadingStudentScheduleIds[idx];
      });
    
    if (sessionsToFetch.length === 0) return;
    
    // Gọi API để lấy studentScheduleIds
    sessionsToFetch.forEach(async ({ session, idx }) => {
      if (!session.classScheduleId) return;
      
      setLoadingStudentScheduleIds(prev => ({ ...prev, [idx]: true }));
      
      try {
        const response = await studentScheduleService.getStudentSchedulesByClassSchedules([session.classScheduleId]);
        
        if (response.success && response.studentSchedules && response.studentSchedules.length > 0) {
          // Tìm studentSchedule của học sinh này
          const studentSchedule = response.studentSchedules.find(ss => {
            const ssStudentId = ss.student?._id?.toString() || ss.student?.toString();
            return ssStudentId === studentId.toString();
          });
          
          if (studentSchedule) {
            const foundStudentScheduleId = studentSchedule._id || studentSchedule.id;
            setResolvedStudentScheduleIds(prev => ({
              ...prev,
              [idx]: foundStudentScheduleId
            }));
            console.log(`✅ Tìm thấy studentScheduleId từ API cho buổi ${session.sessionOrder}:`, foundStudentScheduleId);
          } else {
            console.log(`⚠️ Không tìm thấy studentSchedule cho học sinh ${studentId} trong kết quả API`);
          }
        }
      } catch (error) {
        console.error(`❌ Lỗi khi gọi API lấy studentSchedule cho buổi ${session.sessionOrder}:`, error);
      } finally {
        setLoadingStudentScheduleIds(prev => {
          const newState = { ...prev };
          delete newState[idx];
          return newState;
        });
      }
    });
  }, [filteredPendingMakeupSessions, selectedRequest, pendingClassChange, senderSchedule, resolvedStudentScheduleIds, loadingStudentScheduleIds]);

  // useEffect để gọi API lấy studentScheduleId cho đơn replace_teacher
  useEffect(() => {
    // Chỉ chạy cho đơn replace_teacher
    if (selectedRequest?.type !== 'replace_teacher' || !selectedRequest?.classScheduleId) {
      return;
    }

    // Nếu đã có studentScheduleId, không cần gọi lại
    if (replaceTeacherStudentScheduleId) {
      return;
    }

    // Nếu đang loading, không gọi lại
    if (loadingReplaceTeacherScheduleId) {
      return;
    }

    const classSchedule = selectedRequest.classScheduleId;
    const classScheduleId = classSchedule?._id || classSchedule?.id;
    
    if (!classScheduleId) {
      return;
    }

    // Kiểm tra xem có tìm thấy trong senderSchedule không
    const matchingStudentSchedule = senderSchedule?.find(sch => {
      const schClassScheduleId = sch.classSchedule?._id?.toString() || sch.classSchedule?.id?.toString();
      return schClassScheduleId === classScheduleId?.toString();
    });

    if (matchingStudentSchedule) {
      // Đã tìm thấy trong senderSchedule, lưu vào state
      const foundId = matchingStudentSchedule._id || matchingStudentSchedule.id;
      setReplaceTeacherStudentScheduleId(foundId);
      return;
    }

    // Nếu không tìm thấy trong senderSchedule, gọi API
    const fetchStudentScheduleId = async () => {
      setLoadingReplaceTeacherScheduleId(true);
      try {
        const response = await studentScheduleService.getStudentSchedulesByClassSchedules([classScheduleId]);
        
        if (response.success && response.studentSchedules && response.studentSchedules.length > 0) {
          // Lấy studentScheduleId đầu tiên (bất kỳ học sinh nào trong lớp)
          const firstStudentSchedule = response.studentSchedules[0];
          const foundStudentScheduleId = firstStudentSchedule._id || firstStudentSchedule.id;
          setReplaceTeacherStudentScheduleId(foundStudentScheduleId);
          console.log('✅ Tìm thấy studentScheduleId từ API cho đơn replace_teacher:', foundStudentScheduleId);
        } else {
          console.log('⚠️ Không tìm thấy studentSchedule cho classScheduleId:', classScheduleId);
        }
      } catch (error) {
        console.error('❌ Lỗi khi gọi API lấy studentSchedule cho đơn replace_teacher:', error);
      } finally {
        setLoadingReplaceTeacherScheduleId(false);
      }
    };

    fetchStudentScheduleId();
  }, [selectedRequest, senderSchedule, replaceTeacherStudentScheduleId, loadingReplaceTeacherScheduleId]);

  // Tính toán calendarSchedules từ senderSchedule
  const calendarSchedules = useMemo(() => {
    // Kiểm tra xem có đổi lớp không
    const isClassChangeRequest = selectedRequest?.type === 'change_class' && pendingClassChange;
    const oldClassId = pendingClassChange?.oldClassId?.toString();
    
    const schedules = senderSchedule.map((schedule, index) => {
      const dateStr = formatDateToYYYYMMDD(schedule.date);
      
      // Lấy attendance status nếu có
      const attendanceStatus = schedule.attendance?.status || null;
      
      // Lấy scheduleStatus từ StudentSchedule (cancelled, scheduled, etc.)
      const scheduleStatus = schedule.scheduleStatus || 'scheduled';
      
      // Kiểm tra xem buổi này có phải là buổi nghỉ không (từ pendingMakeupClasses, đã bị cancelled, hoặc từ đơn)
      const scheduleId = schedule._id || schedule.id || index;
      
      // Kiểm tra xem buổi này có phải của lớp cũ không (khi có đổi lớp)
      const scheduleClassId = schedule.class?._id?.toString() || schedule.class?.toString();
      const isOldClassSchedule = isClassChangeRequest && oldClassId && scheduleClassId === oldClassId;
      
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
        makeupReason: isMakeupFromDB ? schedule.studentScheduleReason : null, // Lý do học bù
        isOldClassSchedule: isOldClassSchedule, // Đánh dấu buổi của lớp cũ (khi đổi lớp)
        isNewClassSchedule: false // Đánh dấu buổi của lớp mới (sẽ được thêm ở dưới)
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
        
        const dateStr = formatDateToYYYYMMDD(makeup.makeupSchedule.date);
        
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
    
    // Thêm các buổi của lớp mới khi có đổi lớp
    const newClassSchedules = [];
    if (isClassChangeRequest && pendingClassChange?.newClassInfo?.fixedSchedules) {
      const newClassInfo = pendingClassChange.newClassInfo;
      const newClassSchedulesList = newClassInfo.fixedSchedules || [];
      
      newClassSchedulesList.forEach((newSchedule, index) => {
        if (!newSchedule.date) return;
        
        const dateStr = formatDateToYYYYMMDD(newSchedule.date);
        
        newClassSchedules.push({
          id: `new-class-${index}-${newSchedule.date}`,
          date: dateStr,
          startTime: newSchedule.startTime || '',
          endTime: newSchedule.endTime || '',
          className: newClassInfo.className || 'N/A',
          roomName: newSchedule.roomName || 'N/A',
          topic: newSchedule.title || '',
          status: 'scheduled',
          scheduleStatus: 'scheduled',
          attendanceStatus: null,
          hasAttendance: false,
          teacherName: 'N/A',
          lessonNumber: newSchedule.order || '',
          lessonTopic: newSchedule.title || '',
          isAbsentSchedule: false,
          isCancelled: false,
          isMakeupSchedule: false,
          isSubstituteClass: false,
          isOldClassSchedule: false, // Đánh dấu buổi của lớp cũ
          isNewClassSchedule: true // Đánh dấu buổi của lớp mới
        });
      });
    }
    
    return [...schedules, ...makeupSchedules, ...newClassSchedules];
  }, [senderSchedule, pendingMakeupClasses, selectedRequest, pendingClassChange]);

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
              {(() => {
                const requestType = selectedRequest?.type;
                if (requestType === 'create_class') {
                  return 'Chi tiết đơn - Yêu cầu tạo lớp';
                } else if (requestType === 'replace_teacher') {
                  return 'Chi tiết đơn - Lịch dạy';
                } else if (requestType === 'makeup_class' || requestType === 'change_class') {
                  return isStudent ? 'Chi tiết đơn - Lịch học' : isTeacher ? 'Chi tiết đơn - Lịch dạy' : 'Chi tiết đơn - Lịch học/dạy';
                } else {
                  return isStudent ? 'Chi tiết đơn - Lịch học' : isTeacher ? 'Chi tiết đơn - Lịch dạy' : 'Chi tiết đơn - Lịch học/dạy';
                }
              })()}
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
                      const scheduleDate = parseDateString(classSchedule.date) || new Date(classSchedule.date);
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
                        ? (parseDateString(makeupSchedule.date) || new Date(makeupSchedule.date)).toLocaleDateString('vi-VN') 
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
                      
                      // Sử dụng studentScheduleId đã lấy được (từ senderSchedule hoặc API)
                      const studentScheduleId = replaceTeacherStudentScheduleId;
                      
                      // Tìm buổi giáo viên dạy thay tương ứng với buổi này
                      const correspondingSubstitute = pendingMakeupClasses?.find(makeup => {
                        if (!makeup.isSubstituteClass) return false;
                        const absentId = makeup.absentScheduleId?.toString() || 
                                        makeup.absentSchedule?.id?.toString() || 
                                        makeup.absentSchedule?._id?.toString();
                        return absentId && studentScheduleId && absentId === studentScheduleId.toString();
                      });
                      
                      // Format ngày thứ mấy
                      const scheduleDate = parseDateString(classSchedule.date) || new Date(classSchedule.date);
                      const dayOfWeek = scheduleDate.getDay();
                      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                      const dayName = dayNames[dayOfWeek];
                      const dateStr = scheduleDate.toLocaleDateString('vi-VN');
                      
                      const substituteTeacherInfo = correspondingSubstitute?.substituteTeacherInfo;
                      
                      // Tìm index của substitute trong pendingMakeupClasses để xóa
                      const substituteIndex = correspondingSubstitute 
                        ? pendingMakeupClasses.findIndex(m => {
                            if (!m.isSubstituteClass) return false;
                            const mAbsentId = m.absentScheduleId?.toString() || 
                                             m.absentSchedule?.id?.toString() || 
                                             m.absentSchedule?._id?.toString();
                            return mAbsentId === studentScheduleId?.toString();
                          })
                        : -1;
                      
                      return (
                        <div className="mb-12">
                          <h6 className="text-neutral-900 fw-bold mb-8 text-14">Buổi xin xếp người dạy thay:</h6>
                          <div className="border border-neutral-200 rounded-6 p-12 bg-white">
                            <div className="d-flex align-items-start justify-content-between gap-12">
                              <div className="flex-grow-1 d-flex flex-column gap-8">
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
                                
                                {/* Giáo viên dạy thay (nếu đã xếp) */}
                                {correspondingSubstitute && (
                                  <div className="border-top border-neutral-200 pt-8 mt-4">
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
                                  </div>
                                )}
                              </div>
                              <div className="d-flex flex-column gap-2 align-items-end">
                                {!correspondingSubstitute ? (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                      // Truyền studentScheduleId để tự động chọn giáo viên dạy thay từ đơn
                                      if (onAddMakeupClass && studentScheduleId) {
                                        onAddMakeupClass(studentScheduleId);
                                      }
                                    }}
                                    className="d-flex align-items-center gap-2"
                                    disabled={!onAddMakeupClass || !studentScheduleId || loadingReplaceTeacherScheduleId}
                                  >
                                    {loadingReplaceTeacherScheduleId ? (
                                      <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Đang tải...</span>
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-plus"></i>
                                        Xếp người dạy thay
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      if (onRemoveMakeupClass && substituteIndex >= 0) {
                                        onRemoveMakeupClass(substituteIndex);
                                      }
                                    }}
                                    className="d-flex align-items-center gap-2"
                                    title="Xóa giáo viên dạy thay này"
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
                        classId: String(classInfo?._id || classInfo),
                        className: classInfo?.name || 'N/A',
                        courseName: courseInfo?.name || 'N/A',
                        courseId: courseInfo?._id || courseInfo || null,
                        currentSessionTitle: currentSession?.title || 'Chưa có thông tin session',
                        currentSessionOrder: currentSession?.order || null,
                        fixedSchedules: fixedSchedules
                      };
                      
                      // Kiểm tra xem có pendingClassChange không
                      const isPendingChange = pendingClassChange && 
                        String(pendingClassChange.oldClassId) === String(classItemForChange.classId);
                      
                      return (
                        <div className="mb-12">
                          <h6 className="text-neutral-900 fw-bold mb-8 text-14">Lớp xin đổi:</h6>
                          <div className="border border-neutral-200 rounded-6 p-12 bg-white">
                            <div className="d-flex align-items-start justify-content-between gap-12">
                              <div className="flex-grow-1 d-flex flex-column gap-8">
                                {/* Lớp cũ (lớp xin đổi) */}
                                <div className="d-flex align-items-start gap-8">
                                  <i className="fas fa-book text-primary text-14 mt-1"></i>
                                  <div className="flex-grow-1 d-flex flex-column gap-4">
                                    <div className="text-primary fw-semibold text-13">Lớp đang học:</div>
                                    <div className="d-flex flex-column gap-2">
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
                                        <span className="text-neutral-600 text-13">Đang học session: </span>
                                        <span className="text-neutral-700 text-13 fw-medium">
                                          {currentSession?.title || 'Chưa có thông tin session'}
                                          {currentSession?.order !== null && currentSession?.order !== undefined && (
                                            <span className="text-neutral-500 ms-4">(Số thứ tự: {currentSession.order})</span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Lớp mới (lớp muốn đổi) - nếu đã chọn */}
                                {isPendingChange && pendingClassChange.newClassInfo && (
                                  <>
                                    <div className="border-top border-neutral-200 pt-8 mt-4">
                                      <div className="d-flex align-items-start gap-8">
                                        <i className="fas fa-exchange-alt text-success text-14 mt-1"></i>
                                        <div className="flex-grow-1 d-flex flex-column gap-2">
                                          <div className="text-success fw-semibold text-13">Lớp muốn đổi:</div>
                                          <div className="d-flex flex-column gap-2">
                                            <div>
                                              <span className="text-neutral-600 text-13">Lớp: </span>
                                              <span className="text-neutral-900 fw-semibold text-14">{pendingClassChange.newClassInfo.className || 'N/A'}</span>
                                            </div>
                                            {pendingClassChange.newClassInfo.fixedSchedules && pendingClassChange.newClassInfo.fixedSchedules.length > 0 && (
                                              <div>
                                                <span className="text-neutral-600 text-13">Thời khóa biểu: </span>
                                                <div className="text-neutral-700 text-13 fw-medium mt-2">
                                                  {formatSchedule(pendingClassChange.newClassInfo.fixedSchedules)}
                                                </div>
                                              </div>
                                            )}
                                            <div>
                                              <span className="text-neutral-600 text-13">Đang học session: </span>
                                              <span className="text-neutral-700 text-13 fw-medium">
                                                {pendingClassChange.newClassInfo.currentSessionTitle || 'Chưa có thông tin session'}
                                                {pendingClassChange.newClassInfo.currentSessionOrder !== null && (
                                                  <span className="text-neutral-500 ms-4">(Số thứ tự: {pendingClassChange.newClassInfo.currentSessionOrder})</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="d-flex flex-column gap-2 align-items-end">
                                {!isPendingChange ? (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => onChangeClass(classItemForChange)}
                                    className="d-flex align-items-center gap-2"
                                  >
                                    <i className="fas fa-exchange-alt"></i>
                                    Đổi lớp
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={onRemoveClassChange}
                                    className="d-flex align-items-center gap-2"
                                    title="Xóa thông tin đổi lớp"
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
                          <ul className="mb-0 mt-8 ps-0 list-unstyled">
                            {filteredPendingMakeupSessions.map((session, idx) => {
                              // Lấy studentScheduleId từ session (đã được lưu khi tính toán)
                              let studentScheduleId = session.studentScheduleId;
                              
                              // Kiểm tra trong resolvedStudentScheduleIds (từ API)
                              if (!studentScheduleId && resolvedStudentScheduleIds[idx]) {
                                studentScheduleId = resolvedStudentScheduleIds[idx];
                              }
                              
                              // Nếu không có, tìm từ senderSchedule theo thứ tự ưu tiên
                              if (!studentScheduleId) {
                                // Ưu tiên 1: Tìm theo classScheduleId (chính xác nhất)
                                if (session.classScheduleId) {
                                  // Tìm studentSchedule có classScheduleId trùng
                                  const studentSchedule = senderSchedule.find(sch => {
                                    const classScheduleId = sch.classSchedule?._id?.toString() || sch.classSchedule?.id?.toString();
                                    return classScheduleId === session.classScheduleId?.toString();
                                  });
                                  
                                  if (studentSchedule) {
                                    studentScheduleId = studentSchedule._id || studentSchedule.id;
                                  } else {
                                    // Thử tìm trực tiếp (nếu classScheduleId chính là studentScheduleId)
                                    const directMatch = senderSchedule.find(sch => {
                                      const scheduleId = sch._id?.toString() || sch.id?.toString();
                                      return scheduleId === session.classScheduleId?.toString();
                                    });
                                    
                                    if (directMatch) {
                                      studentScheduleId = directMatch._id || directMatch.id;
                                    }
                                  }
                                }
                                
                                // Ưu tiên 2: Tìm theo ngày, giờ, và lớp cũ (fallback)
                                if (!studentScheduleId && session.date && session.startTime && pendingClassChange?.oldClassId) {
                                  const sessionDate = new Date(session.date);
                                  sessionDate.setHours(0, 0, 0, 0);
                                  
                                  const matchingSchedule = senderSchedule.find(sch => {
                                    const schDate = new Date(sch.date);
                                    schDate.setHours(0, 0, 0, 0);
                                    
                                    const classId = sch.class?._id?.toString() || sch.class?.toString();
                                    return classId === pendingClassChange.oldClassId.toString() &&
                                           schDate.getTime() === sessionDate.getTime() &&
                                           sch.startTime === session.startTime &&
                                           sch.endTime === session.endTime;
                                  });
                                  
                                  if (matchingSchedule) {
                                    studentScheduleId = matchingSchedule._id || matchingSchedule.id;
                                  }
                                }
                              }
                              
                              const isLoading = loadingStudentScheduleIds[idx] || false;
                              const hasStudentScheduleId = !!studentScheduleId;
                              const hasClassScheduleId = !!session.classScheduleId;
                              
                              // Chỉ hiển thị nút khi đã có studentScheduleId hoặc đang tải (sẽ có sau)
                              const shouldShowButton = hasStudentScheduleId || isLoading || hasClassScheduleId;
                              
                              // Kiểm tra xem buổi này đã được xếp học bù chưa
                              const correspondingMakeup = pendingMakeupClasses?.find(makeup => {
                                if (makeup.isSubstituteClass) return false; // Bỏ qua giáo viên dạy thay
                                const absentId = makeup.absentScheduleId?.toString() || 
                                                makeup.absentSchedule?.id?.toString() || 
                                                makeup.absentSchedule?._id?.toString();
                                return absentId && absentId === studentScheduleId?.toString();
                              });
                              
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
                                <li key={idx} className="mb-3">
                                  <div className="border rounded-8 p-12 bg-white">
                                    <div className="d-flex align-items-center justify-content-between gap-16">
                                      {/* Bên trái: Buổi nghỉ */}
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                          <i className="fas fa-exclamation-triangle text-warning"></i>
                                          <strong className="text-warning-dark">Buổi nghỉ:</strong>
                                        </div>
                                        <div className="text-13">
                                          <div className="fw-semibold">{session.sessionTitle}</div>
                                          {session.date && (
                                            <div className="text-neutral-600">
                                              {(parseDateString(session.date) || new Date(session.date)).toLocaleDateString('vi-VN')} {session.startTime}-{session.endTime}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Bên phải: Buổi học bù hoặc nút xếp */}
                                      <div className="flex-grow-1 d-flex align-items-center justify-content-end gap-8">
                                        {correspondingMakeup ? (
                                          <>
                                            <div className="text-end">
                                              <div className="d-flex align-items-center justify-content-end gap-2 mb-2">
                                                <i className="fas fa-check-circle text-success"></i>
                                                <strong className="text-success-dark">Buổi học bù:</strong>
                                              </div>
                                              {correspondingMakeup.makeupSchedule && (
                                                <div className="text-13">
                                                  <div className="fw-semibold">
                                                    {correspondingMakeup.makeupSchedule.title || 'N/A'}
                                                  </div>
                                                  <div className="text-neutral-600">
                                                    {correspondingMakeup.makeupSchedule.date 
                                                      ? (parseDateString(correspondingMakeup.makeupSchedule.date) || new Date(correspondingMakeup.makeupSchedule.date)).toLocaleDateString('vi-VN')
                                                      : 'N/A'} {correspondingMakeup.makeupSchedule.startTime || ''}-{correspondingMakeup.makeupSchedule.endTime || ''}
                                                  </div>
                                                  {correspondingMakeup.makeupClassInfo?.className && (
                                                    <div className="text-neutral-500 text-12">
                                                      {correspondingMakeup.makeupClassInfo.className}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
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
                                          </>
                                        ) : shouldShowButton ? (
                                          <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => {
                                              if (onAddMakeupClass && studentScheduleId) {
                                                onAddMakeupClass(studentScheduleId);
                                              }
                                            }}
                                            className="d-flex align-items-center gap-2"
                                            disabled={!onAddMakeupClass || !studentScheduleId || isLoading}
                                          >
                                            {isLoading ? (
                                              <>
                                                <Spinner animation="border" size="sm" />
                                                <span>Đang tải...</span>
                                              </>
                                            ) : (
                                              <>
                                                <i className="fas fa-plus"></i>
                                                {isStudent ? 'Xếp buổi học bù' : isTeacher ? 'Xếp lịch dạy thay' : 'Xếp buổi học bù'}
                                              </>
                                            )}
                                          </Button>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </Alert>
                  )}
                </div>
              )}
              
              {/* Hiển thị file đính kèm cho đơn create_class, hoặc lịch học/dạy cho các đơn khác */}
              {selectedRequest?.type === 'create_class' ? (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-12">
                    <h6 className="text-neutral-900 fw-bold mb-0">
                      File đính kèm:
                    </h6>
                  </div>
                  
                  {selectedRequest.excelFile ? (
                    <div className="border border-neutral-100 rounded-12 p-16 bg-white mb-16">
                      <div className="d-flex align-items-center gap-12">
                        <i className="fas fa-file-excel text-success" style={{ fontSize: '24px' }}></i>
                        <div className="flex-grow-1">
                          <div className="text-neutral-900 fw-medium mb-2">
                            File Excel đính kèm
                          </div>
                          <div className="text-neutral-600 text-13 mb-8">
                            {selectedRequest.excelFile.split('/').pop() || selectedRequest.excelFile}
                          </div>
                          <a
                            href={`http://localhost:${import.meta.env.VITE_API_PORT || 8080}${selectedRequest.excelFile.startsWith('/') ? selectedRequest.excelFile : '/' + selectedRequest.excelFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            download
                          >
                            <i className="fas fa-download me-2"></i>
                            Tải xuống
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-center py-20">
                      Không có file đính kèm
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-12">
                    <h6 className="text-neutral-900 fw-bold mb-0">
                      {isStudent ? 'Lịch học:' : isTeacher ? 'Lịch dạy:' : 'Lịch học/dạy:'}
                    </h6>
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
                </>
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
              disabled={processing || unscheduledMakeupSessionsCount > 0}
              title={unscheduledMakeupSessionsCount > 0 
                ? `Vui lòng xếp học bù cho ${unscheduledMakeupSessionsCount} buổi còn thiếu trước khi chấp nhận` 
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

