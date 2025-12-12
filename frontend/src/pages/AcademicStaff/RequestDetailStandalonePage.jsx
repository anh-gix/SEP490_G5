import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AcademicLayout from '../../components/class_management/AcademicLayout';
import RequestDetailPage from './RequestDetailPage';
import WorkRequestDetail from '../../components/AcademicStaff/WorkRequestDetail';
import ChangeClassModal from '../../components/class_management/ChangeClassModal';
import MakeupClassModalForAcademicStaff from '../../components/class_management/MakeupClassModalForAcademicStaff';
import RejectRequestModal from '../../components/class_management/RejectRequestModal';
import changeRequestService from '../../services/changeRequestService';
import academicStaffService from '../../services/academicStaffService';
import academicWorkRequestService from '../../services/academicWorkRequestService';
import classService from '../../services/classService';
import { formatDate, naturalCompare } from '../../utils/requestHelpers';

/**
 * Request Detail Standalone Page
 * Page component để hiển thị request detail độc lập, không cần load RequestManagement
 */
const RequestDetailStandalonePage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [requestSource, setRequestSource] = useState(null); // 'workRequest' or 'changeRequest'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for ChangeRequest detail
  const [senderSchedule, setSenderSchedule] = useState([]);
  const [senderRole, setSenderRole] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [pendingClassChange, setPendingClassChange] = useState(null);
  const [pendingMakeupClasses, setPendingMakeupClasses] = useState([]);
  const [pendingMakeupSessions, setPendingMakeupSessions] = useState([]);
  const [showChangeClassModal, setShowChangeClassModal] = useState(false);
  const [selectedClassToChange, setSelectedClassToChange] = useState(null);
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [selectedStudentScheduleId, setSelectedStudentScheduleId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Normalize request data structure
  const normalizeRequest = (req, source) => ({
    ...req,
    _source: source,
    _id: req._id,
    type: source === 'changeRequest' ? req.type : req.requestType,
    createdAt: source === 'changeRequest' ? req.createdAt : req.requestedAt,
    sender: source === 'changeRequest' ? req.sender : req.requestedBy,
    content: source === 'changeRequest' ? req.content : req.requestNote,
    status: req.status,
    approver: source === 'changeRequest' ? req.approver : req.processedBy,
    approvedDate: source === 'changeRequest' ? req.approvedDate : req.processedAt
  });

  // Fetch request by ID
  useEffect(() => {
    if (requestId) {
      fetchRequestById(requestId);
    }
  }, [requestId]);

  const fetchRequestById = async (id) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Step 1: Try to fetch as WorkRequest first (has fast getById endpoint)
      try {
        const workResponse = await academicWorkRequestService.getRequestById(id);
        if (workResponse.success && workResponse.data) {
          const workReq = normalizeRequest(workResponse.data, 'workRequest');
          setRequest(workReq);
          setRequestSource('workRequest');
          setLoading(false);
          return;
        }
      } catch (err) {
        // Not a WorkRequest or not found, continue to try ChangeRequest
        console.log('Not a WorkRequest, trying ChangeRequest...');
      }

      // Step 2: Try to fetch as ChangeRequest
      try {
        const changeResponse = await changeRequestService.getAllChangeRequests({ 
          limit: 100,
          page: 1
        });
        if (changeResponse.success) {
          const changeReqs = (changeResponse.changeRequests || []).map(req => 
            normalizeRequest(req, 'changeRequest')
          );
          const foundRequest = changeReqs.find(req => req._id === id);
          
          if (foundRequest) {
            setRequest(foundRequest);
            setRequestSource('changeRequest');
            
            // Fetch sender schedule for ChangeRequest
            setLoadingSchedule(true);
            try {
              const scheduleResponse = await changeRequestService.getSenderSchedule(id);
              if (scheduleResponse.success) {
                setSenderSchedule(scheduleResponse.schedules || []);
                setSenderRole(scheduleResponse.sender?.role || null);
              }
            } catch (err) {
              console.error('Error fetching schedule:', err);
              setSenderSchedule([]);
              setSenderRole(null);
            } finally {
              setLoadingSchedule(false);
            }
            
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching change request:', err);
      }

      // If not found
      setError('Không tìm thấy đơn với ID này');
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching request:', error);
      setError('Có lỗi xảy ra khi tải đơn');
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    // Navigate back to request management
    navigate('/academic/request-management');
  };

  // Helper function to format date for display
  const formatDateForResponse = (dateString) => {
    if (!dateString) return '';
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1;
      const day = parseInt(dateMatch[3], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Generate response content automatically
  const generateResponseContent = () => {
    const parts = [];
    
    // Handle makeup classes
    if (pendingMakeupClasses && pendingMakeupClasses.length > 0) {
      pendingMakeupClasses.forEach((makeup) => {
        let absentDate = '';
        let absentTime = '';
        
        const absentSchedule = senderSchedule.find(sch => {
          const schId = sch.studentScheduleId || sch._id || sch.id;
          const absentId = makeup.absentScheduleId?.toString();
          if (!schId || !absentId) return false;
          return schId.toString() === absentId;
        });
        
        if (absentSchedule) {
          absentDate = formatDateForResponse(absentSchedule.date);
          absentTime = absentSchedule.startTime && absentSchedule.endTime
            ? `${absentSchedule.startTime} - ${absentSchedule.endTime}`
            : '';
        } else if (makeup.absentSchedule?.date) {
          absentDate = formatDateForResponse(makeup.absentSchedule.date);
          absentTime = makeup.absentSchedule.startTime && makeup.absentSchedule.endTime
            ? `${makeup.absentSchedule.startTime} - ${makeup.absentSchedule.endTime}`
            : '';
        }
        
        if (makeup.isSubstituteClass && makeup.substituteTeacherInfo) {
          const teacherName = makeup.substituteTeacherInfo.username || 
                             makeup.substituteTeacherInfo.fullName || 
                             makeup.substituteTeacherInfo.name || 
                             'giáo viên';
          parts.push(`Đã xếp ${teacherName} dạy thay cho buổi học ngày ${absentDate || 'N/A'}${absentTime ? ` (${absentTime})` : ''}`);
        } else if (makeup.isNewMakeup) {
          const makeupDate = formatDateForResponse(makeup.newMakeupDate);
          const makeupTime = makeup.newMakeupStartTime && makeup.newMakeupEndTime
            ? `${makeup.newMakeupStartTime} - ${makeup.newMakeupEndTime}`
            : '';
          if (absentDate && makeupDate) {
            parts.push(`Đã chuyển buổi học ngày ${absentDate}${absentTime ? ` (${absentTime})` : ''} sang buổi học bù ngày ${makeupDate}${makeupTime ? ` (${makeupTime})` : ''}`);
          }
        } else if (makeup.makeupSchedule) {
          const makeupDate = formatDateForResponse(makeup.makeupSchedule.date);
          const makeupTime = makeup.makeupSchedule.startTime && makeup.makeupSchedule.endTime
            ? `${makeup.makeupSchedule.startTime} - ${makeup.makeupSchedule.endTime}`
            : '';
          if (absentDate && makeupDate) {
            parts.push(`Đã chuyển buổi học ngày ${absentDate}${absentTime ? ` (${absentTime})` : ''} sang buổi học bù ngày ${makeupDate}${makeupTime ? ` (${makeupTime})` : ''}`);
          }
        }
      });
    }
    
    // Handle class change
    if (pendingClassChange) {
      const oldClassName = pendingClassChange.oldClassInfo?.className || pendingClassChange.oldClassInfo?.name || 'N/A';
      const newClassName = pendingClassChange.newClassInfo?.className || pendingClassChange.newClassInfo?.name || 'N/A';
      parts.push(`Đã chuyển từ lớp ${oldClassName} sang lớp ${newClassName}`);
    }
    
    return parts.length > 0 ? parts.join('. ') : 'Đã chấp nhận đơn';
  };

  // Handle approve
  const handleApprove = async () => {
    if (!request) return;
    
    try {
      setProcessing(true);
      
      const responseContent = generateResponseContent();
      
      const approvalData = {
        pendingMakeupClasses: pendingMakeupClasses.map(makeup => ({
          absentScheduleId: makeup.absentScheduleId,
          makeupScheduleId: makeup.makeupScheduleId,
          makeupClassId: makeup.makeupClassId,
          isSubstituteClass: makeup.isSubstituteClass || false,
          substituteTeacherId: makeup.substituteTeacherId || null,
          isNewMakeup: makeup.isNewMakeup || false,
          newMakeupDate: makeup.newMakeupDate || null,
          newMakeupStartTime: makeup.newMakeupStartTime || null,
          newMakeupEndTime: makeup.newMakeupEndTime || null,
          newMakeupRoomId: makeup.newMakeupRoomId || null,
          newMakeupTeacherId: makeup.newMakeupTeacherId || null,
          newMakeupSessionId: makeup.newMakeupSessionId || null
        })),
        pendingClassChange: pendingClassChange ? {
          oldClassId: pendingClassChange.oldClassId,
          newClassId: pendingClassChange.newClassId
        } : null,
        responseContent: responseContent
      };
      
      await academicStaffService.approveChangeRequest(request._id, approvalData);
      toast.success('Chấp nhận đơn thành công!');
      handleBack();
    } catch (err) {
      console.error('Error approving request:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi chấp nhận đơn');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async (rejectReasonParam = null) => {
    if (!request) return;
    
    try {
      setProcessing(true);
      await academicStaffService.rejectChangeRequest(request._id, rejectReasonParam || rejectReason || null);
      toast.success('Từ chối đơn thành công!');
      setShowRejectModal(false);
      setRejectReason('');
      handleBack();
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi từ chối đơn');
    } finally {
      setProcessing(false);
    }
  };

  // Handle change class click
  const handleChangeClassClick = async (classItem) => {
    try {
      if (!classItem) {
        toast.error('Không tìm thấy thông tin lớp học');
        return;
      }

      const classSchedules = senderSchedule.filter(sch => {
        const classId = sch.class?._id?.toString() || sch.class?.toString();
        const targetClassId = (classItem.classId?._id?.toString() || classItem.classId?.toString() || String(classItem.classId));
        return classId === targetClassId;
      });

      let fixedSchedulesList = [];
      let courseId = null;

      if (classSchedules.length > 0) {
        const fixedSchedules = classSchedules.filter(sch => {
          const status = sch.status || 'fixed';
          return status === 'fixed';
        });
        
        const sortedSchedules = [...fixedSchedules].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return (a.startTime || '').localeCompare(b.startTime || '');
        });

        fixedSchedulesList = sortedSchedules.map(sch => ({
          title: sch.session?.title || 'N/A',
          order: sch.session?.order || null,
          date: sch.date || null,
          startTime: sch.startTime || 'N/A',
          endTime: sch.endTime || 'N/A',
          roomName: sch.room?.room_name || 'N/A'
        }));

        const courseInfo = classSchedules[0]?.class?.course;
        if (courseInfo) {
          if (typeof courseInfo === 'object' && courseInfo._id) {
            courseId = courseInfo._id.toString();
          } else if (typeof courseInfo === 'string') {
            courseId = courseInfo;
          } else if (courseInfo && typeof courseInfo === 'object' && courseInfo.toString) {
            courseId = courseInfo.toString();
          }
        }
      } else if (classItem.fixedSchedules && Array.isArray(classItem.fixedSchedules) && classItem.fixedSchedules.length > 0) {
        const sortedSchedules = [...classItem.fixedSchedules].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return (a.startTime || '').localeCompare(b.startTime || '');
        });

        fixedSchedulesList = sortedSchedules.map(sch => ({
          title: sch.session?.title || sch.title || 'N/A',
          order: sch.session?.order || sch.order || null,
          date: sch.date || null,
          startTime: sch.startTime || 'N/A',
          endTime: sch.endTime || 'N/A',
          roomName: sch.roomName || sch.room?.room_name || 'N/A'
        }));

        if (classItem.courseId) {
          if (typeof classItem.courseId === 'object' && classItem.courseId._id) {
            courseId = classItem.courseId._id.toString();
          } else if (typeof classItem.courseId === 'string') {
            courseId = classItem.courseId;
          } else if (classItem.courseId && typeof classItem.courseId === 'object' && classItem.courseId.toString) {
            courseId = classItem.courseId.toString();
          }
        }
      }

      if (!courseId) {
        toast.error('Không tìm thấy thông tin khóa học. Vui lòng thử lại sau.');
        return;
      }

      const currentClassInfo = {
        classId: classItem.classId,
        className: classItem.className,
        courseName: classItem.courseName,
        courseId: courseId,
        fixedSchedules: fixedSchedulesList,
        roomName: fixedSchedulesList.length > 0 ? fixedSchedulesList[0].roomName : null,
        currentSessionTitle: classItem.currentSessionTitle || 'Chưa có session',
        currentSessionOrder: classItem.currentSessionOrder || null
      };

      setSelectedClassToChange(currentClassInfo);
      setShowChangeClassModal(true);
    } catch (error) {
      console.error('Error in handleChangeClassClick:', error);
      toast.error('Có lỗi xảy ra khi mở form đổi lớp. Vui lòng thử lại.');
    }
  };

  const handleChangeClassConfirm = (data) => {
    setPendingClassChange({
      oldClassId: data.oldClassId,
      newClassId: data.newClassId,
      oldClassInfo: data.oldClassInfo,
      newClassInfo: data.newClassInfo
    });
    setPendingMakeupSessions(data.makeupSessions || []);
    setShowChangeClassModal(false);
  };

  const handleRemoveMakeupClass = (index) => {
    if (index < 0 || index >= pendingMakeupClasses.length) return;
    setPendingMakeupClasses(prev => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleRemoveClassChange = () => {
    setPendingClassChange(null);
  };

  const handleMakeupClassSubmit = (makeupData) => {
    setPendingMakeupClasses(prev => {
      const existingIndex = prev.findIndex(m => {
        const existingAbsentId = m.absentScheduleId?.toString();
        const newAbsentId = makeupData.absentScheduleId?.toString();
        return existingAbsentId === newAbsentId;
      });

      if (existingIndex >= 0) {
        const newList = [...prev];
        newList[existingIndex] = makeupData;
        return newList;
      } else {
        return [...prev, makeupData];
      }
    });
    
    setShowMakeupModal(false);
    setSelectedStudentScheduleId(null);
    toast.success('Đã thêm buổi học bù thành công!');
  };

  const renderClassInfo = (classInfo, isOldClass = true) => {
    const borderColor = isOldClass ? 'border-primary' : 'border-success';
    const bgColor = isOldClass ? 'bg-primary-25' : 'bg-success-25';
    const textColor = isOldClass ? 'text-primary' : 'text-success';
    const title = isOldClass ? 'Lớp đang học' : 'Lớp muốn đổi';

    return (
      <div className={`border ${borderColor} rounded-4 p-6 ${bgColor}`}>
        <h6 className={`${textColor} fw-bold mb-4 text-12`} style={{ lineHeight: '1.2' }}>{title}</h6>
        <div className="d-flex flex-column" style={{ gap: '2px' }}>
          <div className="d-flex align-items-center" style={{ gap: '6px' }}>
            <small className="text-muted text-11" style={{ minWidth: '65px', lineHeight: '1.3' }}>Tên lớp:</small>
            <div className="fw-semibold text-12" style={{ lineHeight: '1.3' }}>{classInfo.className || 'N/A'}</div>
          </div>
          <div className="d-flex align-items-center" style={{ gap: '6px' }}>
            <small className="text-muted text-11" style={{ minWidth: '65px', lineHeight: '1.3' }}>Khóa học:</small>
            <div className="fw-semibold text-12" style={{ lineHeight: '1.3' }}>{classInfo.courseName || 'N/A'}</div>
          </div>
          <div className="d-flex align-items-center" style={{ gap: '6px' }}>
            <small className="text-muted text-11" style={{ minWidth: '65px', lineHeight: '1.3' }}>Session:</small>
            <div className="fw-semibold text-12" style={{ lineHeight: '1.3' }}>
              {classInfo.currentSessionTitle || 'Chưa có session'}
              {classInfo.currentSessionOrder !== null && (
                <span className="text-neutral-500 ms-1">(STT: {classInfo.currentSessionOrder})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <AcademicLayout>
        <Container fluid className="p-24">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-neutral-500">Đang tải chi tiết đơn...</p>
          </div>
        </Container>
      </AcademicLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AcademicLayout>
        <Container fluid className="p-24">
          <Alert variant="danger">
            <Alert.Heading>Lỗi!</Alert.Heading>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={handleBack}>
              Quay lại
            </button>
          </Alert>
        </Container>
      </AcademicLayout>
    );
  }

  // Render WorkRequest detail
  if (requestSource === 'workRequest' && request) {
    return (
      <AcademicLayout>
        <WorkRequestDetail 
          requestId={request._id}
          onBack={handleBack}
        />
      </AcademicLayout>
    );
  }

  // Render ChangeRequest detail
  if (requestSource === 'changeRequest' && request) {
    return (
      <AcademicLayout>
        <RequestDetailPage
          selectedRequest={request}
          senderSchedule={senderSchedule}
          senderRole={senderRole}
          loadingSchedule={loadingSchedule}
          pendingClassChange={pendingClassChange}
          pendingMakeupClasses={pendingMakeupClasses}
          pendingMakeupSessions={pendingMakeupSessions}
          onBack={handleBack}
          onApprove={handleApprove}
          onReject={() => setShowRejectModal(true)}
          onChangeClass={handleChangeClassClick}
          onChangeClassConfirm={handleChangeClassConfirm}
          onAddMakeupClass={(studentScheduleId) => {
            setSelectedStudentScheduleId(studentScheduleId);
            setShowMakeupModal(true);
          }}
          onRemoveMakeupClass={handleRemoveMakeupClass}
          onRemoveClassChange={handleRemoveClassChange}
          processing={processing}
          formatDate={formatDate}
          renderClassInfo={renderClassInfo}
        />
        
        {/* Modals */}
        <RejectRequestModal
          show={showRejectModal}
          onHide={() => {
            setShowRejectModal(false);
            setRejectReason('');
          }}
          request={request}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
          onConfirm={() => handleReject()}
          processing={processing}
        />
        
        <ChangeClassModal
          show={showChangeClassModal}
          onHide={() => {
            setShowChangeClassModal(false);
            setSelectedClassToChange(null);
          }}
          selectedClassToChange={selectedClassToChange}
          senderSchedule={senderSchedule}
          onConfirm={handleChangeClassConfirm}
          processing={processing}
        />
        
        <MakeupClassModalForAcademicStaff
          show={showMakeupModal}
          studentScheduleId={selectedStudentScheduleId}
          requestType={request?.type || 'makeup_class'}
          senderSchedule={senderSchedule}
          onClose={() => {
            setShowMakeupModal(false);
            setSelectedStudentScheduleId(null);
          }}
          onSubmit={handleMakeupClassSubmit}
          loading={processing}
        />
      </AcademicLayout>
    );
  }

  return null;
};

export default RequestDetailStandalonePage;

