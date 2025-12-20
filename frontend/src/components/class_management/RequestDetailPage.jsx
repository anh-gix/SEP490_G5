import React, { useMemo, useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ScheduleCalendar from './ScheduleCalendar';
import { formatDateToYYYYMMDD, parseDateString } from '../../helper/helper';
import classService from '../../services/classService';
import { studentScheduleService } from '../../services/studentScheduleService';
import academicStaffService from '../../services/academicStaffService';

const RequestDetailPage = ({
  selectedRequest,
  senderSchedule,
  senderRole,
  loadingSchedule,
  pendingMakeupClasses,
  pendingMakeupSessions,
  onBack,
  onApprove,
  onReject,
  onAddMakeupClass,
  onRemoveMakeupClass,
  processing,
  formatDate
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loadingStudentScheduleIds, setLoadingStudentScheduleIds] = useState({}); // Map session index -> loading state
  const [resolvedStudentScheduleIds, setResolvedStudentScheduleIds] = useState({}); // Map session index -> studentScheduleId
  const [replaceTeacherStudentScheduleId, setReplaceTeacherStudentScheduleId] = useState(null); // studentScheduleId cho đơn request_replace_teacher
  const [loadingReplaceTeacherScheduleId, setLoadingReplaceTeacherScheduleId] = useState(false); // Loading state cho request_replace_teacher

  const isStudent = senderRole === 'Student';
  const isTeacher = senderRole === 'Teacher';

  const studentClasses = useMemo(() => {
    if (!senderSchedule || senderSchedule.length === 0) {
      return [];
    }

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

    const now = new Date();
    const result = Array.from(classMap.values()).map(classData => {
      const sortedSchedules = classData.schedules.sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return (a.sessionOrder || 0) - (b.sessionOrder || 0);
      });

      let currentSession = null;

      const upcomingSessions = sortedSchedules.filter(s => {
        const scheduleDate = new Date(s.date);
        scheduleDate.setHours(0, 0, 0, 0);
        const nowDate = new Date(now);
        nowDate.setHours(0, 0, 0, 0);
        return scheduleDate >= nowDate; 
      });
      
      if (upcomingSessions.length > 0) {
        currentSession = upcomingSessions[0];
      } else if (sortedSchedules.length > 0) {
        // Nếu không có buổi sắp tới → lấy buổi CUỐI CÙNG (đã học hết)
        currentSession = sortedSchedules[sortedSchedules.length - 1];
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
  }, [pendingMakeupSessions, pendingMakeupClasses, resolvedStudentScheduleIds, senderSchedule]);

  // useEffect để gọi API lấy studentScheduleId khi không tìm thấy
  useEffect(() => {
    if (!filteredPendingMakeupSessions || filteredPendingMakeupSessions.length === 0 || !selectedRequest?.sender) {
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
          } else {
            console.log(` Không tìm thấy studentSchedule cho học sinh ${studentId} trong kết quả API`);
          }
        }
      } catch (error) {
        console.error(` Lỗi khi gọi API lấy studentSchedule cho buổi ${session.sessionOrder}:`, error);
      } finally {
        setLoadingStudentScheduleIds(prev => {
          const newState = { ...prev };
          delete newState[idx];
          return newState;
        });
      }
    });
  }, [filteredPendingMakeupSessions, selectedRequest, senderSchedule, resolvedStudentScheduleIds, loadingStudentScheduleIds]);

  // useEffect để gọi API lấy studentScheduleId cho đơn request_replace_teacher
  useEffect(() => {
    // Chỉ chạy cho đơn request_replace_teacher
    if (selectedRequest?.type !== 'request_replace_teacher' || !selectedRequest?.classScheduleId) {
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
        } else {
          console.log(' Không tìm thấy studentSchedule cho classScheduleId:', classScheduleId);
        }
      } catch (error) {
        console.error(' Lỗi khi gọi API lấy studentSchedule cho đơn request_replace_teacher:', error);
      } finally {
        setLoadingReplaceTeacherScheduleId(false);
      }
    };

    fetchStudentScheduleId();
  }, [selectedRequest, senderSchedule, replaceTeacherStudentScheduleId, loadingReplaceTeacherScheduleId]);

  // Tính toán calendarSchedules từ senderSchedule
  const calendarSchedules = useMemo(() => {
    // Debug: Kiểm tra dữ liệu programType từ backend
    if (senderSchedule && senderSchedule.length > 0) {
      const firstSchedule = senderSchedule[0];
      if (firstSchedule.class?.course?.program) {
      } else {
        console.warn(' Program type not found in schedule:', {
          hasClass: !!firstSchedule.class,
          hasCourse: !!firstSchedule.class?.course,
          hasProgram: !!firstSchedule.class?.course?.program,
          schedule: firstSchedule
        });
      }
    }
    
    // 🆕 Lấy ID của buổi nghỉ và buổi học bù từ đơn (nếu đơn đã được duyệt)
    const requestAbsentStudentScheduleId = selectedRequest?.studentScheduleId?._id || 
                                           selectedRequest?.studentScheduleId?.id ||
                                           selectedRequest?.studentScheduleId;
    const requestMakeupStudentScheduleId = selectedRequest?.makeupStudentScheduleId?._id || 
                                          selectedRequest?.makeupStudentScheduleId?.id ||
                                          selectedRequest?.makeupStudentScheduleId;
    
    const schedules = senderSchedule
      .map((schedule, index) => {
        const dateStr = formatDateToYYYYMMDD(schedule.date);
        
        // Lấy attendance status nếu có
        const attendanceStatus = schedule.attendance?.status || null;
        
        // Lấy scheduleStatus từ StudentSchedule (cancelled, scheduled, etc.)
        const scheduleStatus = schedule.scheduleStatus || 'scheduled';
        
        // 🆕 Lấy StudentSchedule ID của buổi này (từ _id, id, hoặc studentScheduleId)
        const currentStudentScheduleId = schedule.studentScheduleId || schedule._id || schedule.id;
        const currentStudentScheduleIdStr = currentStudentScheduleId?.toString();
        
        // 🆕 Kiểm tra xem buổi cancelled này có thuộc đơn này không
        const isCancelledFromThisRequest = scheduleStatus === 'cancelled' && 
                                           requestAbsentStudentScheduleId &&
                                           currentStudentScheduleIdStr &&
                                           currentStudentScheduleIdStr === requestAbsentStudentScheduleId.toString();
        
        // 🆕 Ẩn các buổi cancelled không thuộc đơn này
        if (scheduleStatus === 'cancelled' && !isCancelledFromThisRequest) {
          return null; // Filter ra
        }
        
        // 🆕 Kiểm tra xem buổi rescheduled này có thuộc đơn này không
        const isMakeupFromThisRequest = scheduleStatus === 'rescheduled' && 
                                       requestMakeupStudentScheduleId &&
                                       currentStudentScheduleIdStr &&
                                       currentStudentScheduleIdStr === requestMakeupStudentScheduleId.toString();
        
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
      
      const isAbsentSchedule = isAbsentFromRequest || isCancelledFromThisRequest || (pendingMakeupClasses && pendingMakeupClasses.some(makeup => {
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
      } else if (isMakeupFromThisRequest || schedule.status === 'temporary') {
        // 🆕 Chỉ buổi rescheduled của đơn này hoặc temporary mới là makeup
        displayStatus = 'makeup';
      } else if (schedule.status === 'fixed') {
        displayStatus = 'scheduled';
      } else if (scheduleStatus === 'rescheduled' && !isMakeupFromThisRequest) {
        // 🆕 Buổi rescheduled không phải của đơn này → hiển thị như buổi bình thường
        displayStatus = 'scheduled';
      }
      
      // 🆕 Kiểm tra xem có phải buổi học bù không - chỉ buổi rescheduled của đơn này
      const isMakeupFromDB = isMakeupFromThisRequest; // Chỉ buổi rescheduled của đơn này mới là học bù
      
      // Xác định className: nếu không có class và là makeup/temporary thì hiển thị "Lớp học bù"
      let className = schedule.class?.name;
      if (!className && (isMakeupFromDB || schedule.status === 'temporary' || displayStatus === 'makeup')) {
        className = 'Lớp học bù';
      } else if (!className) {
        className = 'N/A';
      }
      
      return {
        id: scheduleId,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: className,
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.topic || '',
        status: displayStatus,
        scheduleStatus: isMakeupFromThisRequest ? scheduleStatus : (scheduleStatus === 'rescheduled' ? 'scheduled' : scheduleStatus), // 🆕 Đổi rescheduled thành scheduled nếu không phải của đơn
        attendanceStatus: attendanceStatus,
        hasAttendance: !!attendanceStatus,
        teacherName: hasSubstituteTeacher 
          ? (substituteTeacherInfo?.username || substituteTeacherInfo?.fullName || substituteTeacherInfo?.name || 'N/A')
          : (schedule.teacher?.username || 'N/A'),
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.topic || '',
        isAbsentSchedule: isAbsentSchedule || (isCancelled && !hasSubstituteTeacher),
        isCancelled: isCancelled && !hasSubstituteTeacher,
        isMakeupSchedule: isMakeupFromDB, // 🆕 Chỉ buổi rescheduled của đơn này mới là học bù
        isSubstituteClass: hasSubstituteTeacher,
        cancellationReason: schedule.studentScheduleReason || null,
        makeupReason: isMakeupFromDB ? schedule.studentScheduleReason : null,
        isOldClassSchedule: false,
        isNewClassSchedule: false,
        programType: schedule.class?.course?.program?.type || schedule.programType || schedule.sessionCourse?.program?.type || null
      };
      })
      .filter(Boolean); // 🆕 Filter ra các null (buổi cancelled không thuộc đơn)
    
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
          className: makeup.makeupClassInfo?.className || 'Lớp học bù',
          roomName: makeup.makeupSchedule.roomName || 'N/A',
          topic: makeup.makeupSchedule.title || '',
          status: 'makeup',
          scheduleStatus: 'rescheduled', // Đánh dấu là rescheduled
          attendanceStatus: null,
          hasAttendance: false,
          teacherName: 'N/A',
          lessonNumber: makeup.makeupSchedule.order || '',
          lessonTopic: makeup.makeupSchedule.title || '',
          isMakeupSchedule: true,
          programType: makeup.makeupClassInfo?.programType || makeup.makeupSchedule?.class?.course?.program?.type || makeup.makeupSchedule?.programType || makeup.makeupSchedule?.sessionCourse?.program?.type || null
        };
      })
      .filter(Boolean);
    
    return [...schedules, ...makeupSchedules];
  }, [senderSchedule, pendingMakeupClasses, selectedRequest]);

  // Handler để hoàn tác đơn
  const handleRevert = async () => {
    if (!selectedRequest) return;
    
    try {
      setReverting(true);
      const response = await academicStaffService.revertChangeRequest(selectedRequest._id);
      
      if (response.success) {
        toast.success('Hoàn tác đơn thành công!');
        setShowRevertModal(false);
        if (onBack) {
          onBack(); // Quay lại danh sách và refresh
        }
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi hoàn tác đơn');
      }
    } catch (error) {
      console.error('Error reverting request:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi hoàn tác đơn');
    } finally {
      setReverting(false);
    }
  };

  // Kiểm tra xem đơn có cả buổi nghỉ và buổi gốc không
  const hasOriginalAbsentSchedule = useMemo(() => {
    if (selectedRequest?.type !== 'makeup_class' || !selectedRequest?.studentScheduleId) {
      return false;
    }
    const studentSchedule = selectedRequest.studentScheduleId;
    return !!(studentSchedule?.originalAbsentSchedule?.classSchedule);
  }, [selectedRequest]);

  // Kiểm tra xem đơn có bị revert không
  const isRevertedRequest = useMemo(() => {
    if (selectedRequest?.status !== 'rejected' || selectedRequest?.type !== 'makeup_class') {
      return false;
    }
    // Đơn bị revert sẽ có responseContent = "Đơn đã được hoàn tác"
    // (được set từ revertChangeRequestInternal trong backend)
    return selectedRequest?.responseContent === 'Đơn đã được hoàn tác';
  }, [selectedRequest]);

  if (!selectedRequest) {
    return null;
  }

  return (
    <>
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
                if (requestType === 'request_replace_teacher') {
                  return 'Chi tiết đơn - Lịch dạy';
                } else if (requestType === 'makeup_class') {
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
                    // Chỉ hiển thị phần này cho 2 loại đơn: makeup_class, request_replace_teacher
                    const shouldShowSection = requestType === 'makeup_class' || 
                                            requestType === 'request_replace_teacher';
                    
                    if (!shouldShowSection) return null;
                    
                    // MAKEUP_CLASS: Hiển thị từ studentScheduleId
                    if (requestType === 'makeup_class') {
                      const studentSchedule = selectedRequest?.studentScheduleId;
                      const classSchedule = studentSchedule?.classSchedule;
                      const session = classSchedule?.session;
                      const classInfo = classSchedule?.class;
                      const courseInfo = classInfo?.course;

                      // Kiểm tra xem buổi nghỉ có bị xóa không
                      // Chỉ cần StudentSchedule hoặc ClassSchedule bị xóa (null) là hiển thị cảnh báo
                      if (!studentSchedule || !classSchedule) {
                        return (
                          <div className="mb-12">
                            <h6 className="text-neutral-900 fw-bold mb-8 text-14">Buổi xin học bù:</h6>
                            <div className="border border-danger rounded-6 p-12 bg-danger-subtle">
                              <Alert variant="danger" className="mb-0 py-8 px-12">
                                <div className="d-flex align-items-start gap-8">
                                  <i className="fas fa-exclamation-circle text-danger mt-1"></i>
                                  <div>
                                    <strong className="text-13">Buổi nghỉ đã bị xóa</strong>
                                    <p className="mb-0 text-12 mt-4 text-neutral-700">
                                      Buổi nghỉ (là buổi học bù từ đơn trước) đã bị xóa khỏi hệ thống do đơn gốc bị từ chối và hoàn tác.
                                    </p>
                                  </div>
                                </div>
                              </Alert>
                            </div>
                          </div>
                        );
                      }

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
                            <div className="flex-grow-1">
                              <div className="d-flex gap-12">
                                {/* Buổi nghỉ */}
                                <div className="d-flex align-items-start gap-8 flex-grow-1">
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
                                        <span className="text-neutral-600 text-13">Buổi học: </span>
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

                                {/* Buổi gốc (nếu buổi nghỉ hiện tại là buổi học bù của buổi gốc khác) */}
                                {studentSchedule?.originalAbsentSchedule?.classSchedule && (
                                  <div className="border-start border-neutral-200 ps-12 flex-grow-1">
                                    <div className="d-flex align-items-start gap-8">
                                      <i className="fas fa-history text-danger text-14 mt-1"></i>
                                      <div className="flex-grow-1 d-flex flex-column gap-2">
                                        <div className="text-danger fw-semibold text-13">Buổi gốc:</div>
                                        <div className="d-flex flex-column gap-2">
                                          {(() => {
                                            const originalSchedule = studentSchedule.originalAbsentSchedule.classSchedule;
                                            const originalSession = originalSchedule.session;
                                            const originalClass = originalSchedule.class;
                                            const originalDate = parseDateString(originalSchedule.date) || new Date(originalSchedule.date);
                                            const originalDayOfWeek = originalDate.getDay();
                                            const originalDayName = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][originalDayOfWeek];
                                            const originalDateStr = originalDate.toLocaleDateString('vi-VN');

                                            return (
                                              <>
                                                <div>
                                                  <span className="text-neutral-600 text-13">Lớp: </span>
                                                  <span className="text-neutral-900 fw-semibold text-14">{originalClass?.name || 'N/A'}</span>
                                                </div>
                                                <div>
                                                  <span className="text-neutral-600 text-13">Ngày: </span>
                                                  <span className="text-neutral-700 text-13 fw-medium">{originalDayName} ({originalDateStr})</span>
                                                </div>
                                                <div>
                                                  <span className="text-neutral-600 text-13">Giờ: </span>
                                                  <span className="text-neutral-700 text-13 fw-medium">
                                                    {originalSchedule.startTime || 'N/A'} - {originalSchedule.endTime || 'N/A'}
                                                  </span>
                                                </div>
                                                <div>
                                                  <span className="text-neutral-600 text-13">Buổi học: </span>
                                                  <span className="text-neutral-700 text-13 fw-medium">
                                                    {originalSession?.title || 'N/A'}
                                                    {originalSession?.order !== null && originalSession?.order !== undefined && (
                                                      <span className="text-neutral-500 ms-4">(Số thứ tự: {originalSession.order})</span>
                                                    )}
                                                  </span>
                                                </div>
                                              </>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                </div>  {/* Đóng div d-flex gap-12 */}

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

                                {/* Thông báo buổi bù đã bị xóa do đơn bị hoàn tác */}
                                {isRevertedRequest && !correspondingMakeup && (
                                  <div className="border-top border-neutral-200 pt-8 mt-4">
                                    <Alert variant="warning" className="mb-0 py-8 px-12">
                                      <div className="d-flex align-items-start gap-8">
                                        <i className="fas fa-exclamation-triangle text-warning mt-1"></i>
                                        <div>
                                          <strong className="text-13">Buổi học bù đã bị xóa</strong>
                                          <p className="mb-0 text-12 mt-4 text-neutral-700">
                                            Đơn này đã được chấp nhận trước đó nhưng sau đó bị hoàn tác.
                                            Buổi học bù đã được xếp đã bị xóa khỏi hệ thống.
                                          </p>
                                        </div>
                                      </div>
                                    </Alert>
                                  </div>
                                )}
                              </div>
                              <div className="d-flex flex-column gap-2 align-items-end">
                                {correspondingMakeup ? (
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
                                ) : selectedRequest?.status === 'pending' && !studentSchedule?.originalAbsentSchedule?.classSchedule ? (
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
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // ============================================
                    // 2. REPLACE_TEACHER: Hiển thị từ classScheduleId
                    // ============================================
                    if (requestType === 'request_replace_teacher' && selectedRequest?.classScheduleId) {
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
                                  <span className="text-neutral-900 fw-semibold text-14">
                                    {classInfo?.name || (classInfo === null || classInfo === undefined ? 'Lớp học bù' : 'N/A')}
                                  </span>
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
                                {correspondingSubstitute ? (
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
                                ) : selectedRequest?.status === 'pending' ? (
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
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // ❌ Đã loại bỏ fallback - để kiểm tra xem studentScheduleId có được populate không
                    return null;
                  })()}

                </div>
              )}
              
              {/* Hiển thị lịch học/dạy cho các đơn */}
              {false ? (
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
                        readOnly={true} // Read-only mode
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
          
          <div className="d-flex justify-content-end gap-12">
            {/* Nút Hoàn tác đã bị ẩn - hệ thống tự động revert khi từ chối đơn pending liên quan */}

            <Button 
              variant="secondary" 
              onClick={onBack}
            >
              Đóng
            </Button>

            {/* Chỉ hiện từ chối hoặc chấp nhận cho đơn pending */}
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowRejectModal(true);
                    setRejectReason('');
                  }}
                  disabled={processing}
                >
                  {processing ? 'Đang xử lý...' : (hasOriginalAbsentSchedule ? 'Từ chối và hoàn tác buổi gốc' : 'Từ chối')}
                </Button>
                {!hasOriginalAbsentSchedule && (
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
                )}
              </>
            )}
          </div>
      </Container>

      {/* Modal từ chối */}
      <Modal show={showRejectModal} onHide={() => {
        setShowRejectModal(false);
        setRejectReason('');
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{hasOriginalAbsentSchedule ? 'Từ chối và hoàn tác buổi gốc' : 'Từ chối đơn'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {hasOriginalAbsentSchedule && (
            <Alert variant="warning" className="mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Cảnh báo:</strong> Đơn này xin học bù cho một buổi học bù. Từ chối đơn này sẽ đồng thời hoàn tác đơn gốc.
            </Alert>
          )}
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
            {processing ? 'Đang xử lý...' : (hasOriginalAbsentSchedule ? 'Xác nhận từ chối và hoàn tác' : 'Xác nhận từ chối')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal hoàn tác đã bị xóa - hệ thống tự động revert khi từ chối đơn pending liên quan */}
    </>
  );
};

export default RequestDetailPage;

