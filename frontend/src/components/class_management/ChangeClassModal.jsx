import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import classService from '../../services/classService';

/**
 * ChangeClassModal Component
 * Modal đổi lớp - Simplified version
 * Note: Complex data fetching logic is handled by parent
 */
const ChangeClassModal = ({
  show,
  onHide,
  selectedClassToChange,
  senderSchedule,
  onConfirm,
  processing
}) => {
  const [selectedNewClassId, setSelectedNewClassId] = useState(null);
  const [selectedNewClassInfo, setSelectedNewClassInfo] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingAvailableClasses, setLoadingAvailableClasses] = useState(false);
  const [loadingNewClassInfo, setLoadingNewClassInfo] = useState(false);

  // Load available classes when modal opens
  useEffect(() => {
    if (show && selectedClassToChange?.courseId) {
      loadAvailableClasses();
    } else if (show && !selectedClassToChange?.courseId) {
      console.error(' ChangeClassModal: courseId is missing', { selectedClassToChange });
    }
  }, [show, selectedClassToChange?.courseId]);

  // Fetch new class info when selected
  useEffect(() => {
    if (selectedNewClassId) {
      fetchNewClassInfo();
    } else {
      setSelectedNewClassInfo(null);
    }
  }, [selectedNewClassId]);

  const loadAvailableClasses = async () => {
    if (!selectedClassToChange?.courseId) {
      console.error(' loadAvailableClasses: courseId is missing', { selectedClassToChange });
      toast.error('Không tìm thấy thông tin khóa học. Vui lòng thử lại.');
      return;
    }
    
    setLoadingAvailableClasses(true);
    try {
      const response = await classService.getAllClasses({ courseId: selectedClassToChange.courseId });
      if (response.success) {
        const classes = response.classes || [];
        // Filter out current class
        const otherClasses = classes.filter(cls => {
          const clsId = cls._id || cls;
          return clsId.toString() !== selectedClassToChange.classId?.toString();
        });
        setAvailableClasses(otherClasses);
        console.log(' Loaded available classes', { count: otherClasses.length });
      } else {
        console.error(' Failed to load available classes', response);
        toast.error('Không thể tải danh sách lớp học. Vui lòng thử lại.');
        setAvailableClasses([]);
      }
    } catch (err) {
      console.error(' Error fetching available classes:', err);
      toast.error('Có lỗi xảy ra khi tải danh sách lớp học. Vui lòng thử lại.');
      setAvailableClasses([]);
    } finally {
      setLoadingAvailableClasses(false);
    }
  };

  const fetchNewClassInfo = async () => {
    if (!selectedNewClassId) {
      setSelectedNewClassInfo(null);
      return;
    }

    try {
      setLoadingNewClassInfo(true);
      const response = await classService.getClassById(selectedNewClassId);
      
      if (response.success && response.class) {
        const classData = response.class;
        
        // Filter fixed schedules
        const schedules = classData.schedules || [];
        const fixedSchedules = schedules.filter(sch => {
          const status = sch.status || 'fixed';
          return status === 'fixed';
        });
        
        // Sort schedules
        const sortedSchedules = [...fixedSchedules].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return (a.startTime || '').localeCompare(b.startTime || '');
        });

        const fixedSchedulesList = sortedSchedules.map(sch => ({
          title: sch.session?.title || 'N/A',
          order: sch.session?.order || null,
          date: sch.date || null,
          startTime: sch.startTime || 'N/A',
          endTime: sch.endTime || 'N/A',
          roomName: sch.room?.room_name || classData.roomName || 'N/A',
          roomCapacity: sch.room?.capacity || classData.room?.capacity || null
        }));

        // Calculate current session
        const now = new Date();
        let currentSessionTitle = 'Chưa có session';
        let currentSessionOrder = null;
        
        if (fixedSchedulesList.length > 0) {
          const sortedSessions = [...fixedSchedulesList].sort((a, b) => {
            if (!a.date || !b.date) return 0;
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const dateDiff = dateA.getTime() - dateB.getTime();
            if (dateDiff !== 0) return dateDiff;
            return (a.order || 0) - (b.order || 0);
          });

          const pastSessions = sortedSessions.filter(s => {
            if (!s.date) return false;
            return new Date(s.date) <= now;
          });
          
          if (pastSessions.length > 0) {
            const currentSession = pastSessions[pastSessions.length - 1];
            currentSessionTitle = currentSession.title || 'Chưa có session';
            currentSessionOrder = currentSession.order;
          } else if (sortedSessions.length > 0) {
            const currentSession = sortedSessions[0];
            currentSessionTitle = currentSession.title || 'Chưa có session';
            currentSessionOrder = currentSession.order;
          }
        }

        setSelectedNewClassInfo({
          className: classData.name || 'N/A',
          courseName: classData.courseName || 'N/A',
          fixedSchedules: fixedSchedulesList,
          studentCount: classData.students?.length || 0,
          roomCapacity: classData.room?.capacity || null,
          currentSessionTitle: currentSessionTitle,
          currentSessionOrder: currentSessionOrder
        });
      }
    } catch (err) {
      console.error('Error fetching new class info:', err);
      setSelectedNewClassInfo(null);
    } finally {
      setLoadingNewClassInfo(false);
    }
  };

  const handleClose = () => {
    setSelectedNewClassId(null);
    setSelectedNewClassInfo(null);
    setAvailableClasses([]);
    onHide();
  };

  const handleConfirm = () => {
    if (!selectedClassToChange || !selectedNewClassId || !selectedNewClassInfo) {
      toast.error('Vui lòng chọn lớp muốn đổi');
      return;
    }
    
    // Calculate makeup sessions if new class is ahead
    const oldSessionOrder = selectedClassToChange.currentSessionOrder;
    const newSessionOrder = selectedNewClassInfo.currentSessionOrder;
    const makeupSessions = [];
    
    if (oldSessionOrder !== null && newSessionOrder !== null && newSessionOrder > oldSessionOrder) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const oldClassSchedules = senderSchedule.filter(sch => {
        const classId = sch.class?._id?.toString() || sch.class?.toString();
        return classId === selectedClassToChange.classId;
      });
      
      oldClassSchedules.forEach(schedule => {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        const sessionOrder = schedule.session?.order;
        const attendanceStatus = schedule.attendance?.status;
        
        if (sessionOrder !== null && sessionOrder !== undefined && 
            sessionOrder < newSessionOrder &&
            (scheduleDate > today || attendanceStatus === null || attendanceStatus === undefined)) {
          makeupSessions.push({
            sessionOrder: sessionOrder,
            sessionTitle: schedule.session?.title || `Session ${sessionOrder}`,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            classScheduleId: schedule._id || schedule.id
          });
        }
      });
      
      makeupSessions.sort((a, b) => a.sessionOrder - b.sessionOrder);
    }
    
    onConfirm({
      oldClassId: selectedClassToChange.classId,
      newClassId: selectedNewClassId,
      oldClassInfo: selectedClassToChange,
      newClassInfo: selectedNewClassInfo,
      makeupSessions
    });
    
    handleClose();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours] = timeStr.split(':');
    const hourNum = parseInt(hours, 10);
    return hourNum + 'h';
  };

  const renderScheduleGroups = (schedules) => {
    if (!schedules || schedules.length === 0) {
      return <div className="text-neutral-500 text-13">Chưa có lịch học cố định</div>;
    }

    const scheduleGroups = {};
    schedules.forEach(schedule => {
      if (!schedule.date || !schedule.startTime || !schedule.endTime) return;
      
      const date = new Date(schedule.date);
      const dayOfWeek = date.getDay();
      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = dayNames[dayOfWeek];
      
      const startTime = formatTime(schedule.startTime);
      const endTime = formatTime(schedule.endTime);
      
      const key = `${dayOfWeek}-${schedule.startTime}-${schedule.endTime}`;
      
      if (!scheduleGroups[key]) {
        scheduleGroups[key] = {
          dayOfWeek,
          dayName,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          startTimeFormatted: startTime,
          endTimeFormatted: endTime
        };
      }
    });
    
    const sortedGroups = Object.values(scheduleGroups).sort((a, b) => {
      const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
      const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
      if (orderA !== orderB) return orderA - orderB;
      return a.startTime.localeCompare(b.startTime);
    });
    
    return sortedGroups.map((group, index) => (
      <div key={index} className="text-13 text-neutral-700 mb-1">
        {group.dayName} | {group.startTimeFormatted}-{group.endTimeFormatted}
      </div>
    ));
  };

  if (!selectedClassToChange) return null;

  // Kiểm tra courseId
  const hasCourseId = !!selectedClassToChange?.courseId;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="pb-12">
        <Modal.Title className="text-16">Đổi lớp</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-16">
        {!hasCourseId && (
          <div className="alert alert-danger mb-16" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Lỗi:</strong> Không tìm thấy thông tin khóa học. Vui lòng đóng modal và thử lại.
          </div>
        )}
        <div className="row g-3">
          {/* Left: Current Class */}
          <div className="col-md-6">
            <div className="border border-primary rounded-8 p-12 bg-primary-25 h-100">
              <h6 className="text-primary fw-bold mb-12 text-14">Lớp đang học</h6>
              <div className="d-flex flex-column gap-2">
                <div>
                  <small className="text-muted d-block mb-1">Tên lớp:</small>
                  <div className="fw-bold">{selectedClassToChange.className || 'N/A'}</div>
                </div>
                <div>
                  <small className="text-muted d-block mb-1">Tên khóa học:</small>
                  <div className="fw-bold">{selectedClassToChange.courseName || 'N/A'}</div>
                </div>
                <div>
                  <small className="text-muted d-block mb-1">Session đang học:</small>
                  <div className="fw-semibold">
                    {selectedClassToChange.currentSessionTitle || 'Chưa có session'}
                    {selectedClassToChange.currentSessionOrder !== null && (
                      <span className="text-neutral-500 ms-2">(Số thứ tự: {selectedClassToChange.currentSessionOrder})</span>
                    )}
                  </div>
                </div>
                <div style={{ minHeight: selectedClassToChange.roomName ? 'auto' : '60px' }}>
                  {selectedClassToChange.roomName && (
                    <div>
                      <small className="text-muted d-block mb-1">Phòng học:</small>
                      <div className="fw-semibold">{selectedClassToChange.roomName || 'N/A'}</div>
                    </div>
                  )}
                </div>
                {selectedClassToChange.fixedSchedules && selectedClassToChange.fixedSchedules.length > 0 ? (
                  <div>
                    <small className="text-muted d-block mb-1">Lịch học:</small>
                    <div className="border rounded-8 p-8 bg-white">
                      {renderScheduleGroups(selectedClassToChange.fixedSchedules)}
                    </div>
                  </div>
                ) : (
                  <div className="text-neutral-500 text-13">Chưa có lịch học cố định</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: New Class */}
          <div className="col-md-6">
            <div className="border border-success rounded-8 p-12 bg-success-25 h-100">
              <h6 className="text-success fw-bold mb-12 text-14">Lớp muốn đổi</h6>
              <div className="d-flex flex-column gap-2">
                <div>
                  <small className="text-muted d-block mb-1">Tên khóa học:</small>
                  <div className="fw-bold">{selectedClassToChange.courseName || 'N/A'}</div>
                </div>
                <div>
                  <small className="text-muted d-block mb-1">Chọn lớp:</small>
                  {loadingAvailableClasses ? (
                    <div className="text-center py-8">
                      <Spinner animation="border" size="sm" />
                      <p className="text-neutral-600 mt-4 text-12">Đang tải...</p>
                    </div>
                  ) : availableClasses.length === 0 ? (
                    <div className="text-neutral-500 text-13">Không có lớp nào khác cùng khóa học</div>
                  ) : (
                    <Form.Select
                      value={selectedNewClassId || ''}
                      onChange={(e) => setSelectedNewClassId(e.target.value)}
                      className="border-neutral-200"
                      size="sm"
                    >
                      <option value="">-- Chọn lớp --</option>
                      {availableClasses.map((cls) => {
                        const clsId = cls._id || cls;
                        const clsName = cls.name || 'N/A';
                        return (
                          <option key={clsId} value={clsId}>
                            {clsName}
                          </option>
                        );
                      })}
                    </Form.Select>
                  )}
                </div>

                {selectedNewClassId && (
                  <>
                    {loadingNewClassInfo ? (
                      <div className="text-center py-8">
                        <Spinner animation="border" size="sm" />
                        <p className="text-neutral-600 mt-4 text-12">Đang tải thông tin lớp...</p>
                      </div>
                    ) : selectedNewClassInfo ? (
                      <>
                        <div>
                          <small className="text-muted d-block mb-1">Session đang học:</small>
                          <div className="fw-semibold">
                            {selectedNewClassInfo.currentSessionTitle || 'Chưa có session'}
                            {selectedNewClassInfo.currentSessionOrder !== null && (
                              <span className="text-neutral-500 ms-2">(Số thứ tự: {selectedNewClassInfo.currentSessionOrder})</span>
                            )}
                          </div>
                        </div>
                        <div style={{ minHeight: '60px' }}>
                          {((selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0) || 
                            (selectedNewClassInfo.studentCount !== null || selectedNewClassInfo.roomCapacity !== null)) && (
                            <div className="d-flex justify-content-between align-items-start gap-3">
                              {selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0 && (
                                <div className="flex-fill">
                                  <small className="text-muted d-block mb-1">Phòng học:</small>
                                  <div className="fw-semibold">
                                    {selectedNewClassInfo.fixedSchedules[0]?.roomName || 'N/A'}
                                  </div>
                                </div>
                              )}
                              {(selectedNewClassInfo.studentCount !== null || selectedNewClassInfo.roomCapacity !== null) && (
                                <div className="flex-fill">
                                  <small className="text-muted d-block mb-1">Số lượng học sinh:</small>
                                  <div className="fw-semibold">
                                    {selectedNewClassInfo.studentCount !== null ? selectedNewClassInfo.studentCount : 'N/A'}
                                    {selectedNewClassInfo.roomCapacity !== null && (
                                      <span className="text-muted ms-2">/ {selectedNewClassInfo.roomCapacity}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0 ? (
                          <div>
                            <small className="text-muted d-block mb-1">Lịch học:</small>
                            <div className="border rounded-8 p-8 bg-white">
                              {renderScheduleGroups(selectedNewClassInfo.fixedSchedules)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-neutral-500 text-13">Chưa có lịch học cố định</div>
                        )}
                      </>
                    ) : (
                      <div className="text-neutral-500 text-13">Không tìm thấy thông tin lớp</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button 
          variant="primary" 
          disabled={!selectedNewClassId || processing}
          onClick={handleConfirm}
        >
          {processing ? 'Đang xử lý...' : 'Xác nhận đổi lớp'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeClassModal;

