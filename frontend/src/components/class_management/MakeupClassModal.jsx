import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Card, ListGroup, Badge } from 'react-bootstrap';
import ConflictChecker from './ConflictChecker';
import axios from 'axios';

const MakeupClassModal = ({ 
  originalSchedule, 
  classes, 
  teachers, 
  rooms, 
  onClose, 
  onSubmit, 
  existingSchedules 
}) => {
  const [formData, setFormData] = useState({
    classId: originalSchedule?.classId || '',
    teacherId: originalSchedule?.teacherId || '',
    roomId: originalSchedule?.roomId || '',
    date: '',
    startTime: originalSchedule?.startTime || '',
    endTime: originalSchedule?.endTime || '',
    lessonNumber: originalSchedule?.lessonNumber || '',
    lessonTopic: originalSchedule?.lessonTopic || '',
    originalScheduleId: originalSchedule?.id,
    reason: ''
  });
  const [conflicts, setConflicts] = useState([]);
  const [absenceRequests, setAbsenceRequests] = useState([]);

  useEffect(() => {
    if (originalSchedule) {
      fetchAbsenceRequests(originalSchedule.id);
    }
  }, [originalSchedule]);

  const fetchAbsenceRequests = async (scheduleId) => {
    try {
      // Get attendance for this class schedule
      const response = await axios.get(
        `http://localhost:8080/api/class-schedules/${scheduleId}/attendance`
      );
      
      const attendances = response.data.list || response.data.attendances || [];
      
      // Filter for absent/excused students and transform to absence requests format
      const absenceRequests = attendances
        .filter(att => 
          att.attendance?.status === 'absent' || 
          att.attendance?.status === 'excused'
        )
        .map(att => ({
          id: att._id || att.student?._id,
          studentName: att.student?.username || 'N/A',
          reason: att.attendance?.reason || (att.attendance?.status === 'excused' ? 'Có phép' : 'Vắng'),
          status: att.attendance?.status === 'excused' ? 'approved' : 'pending'
        }));
      
      setAbsenceRequests(absenceRequests);
    } catch (error) {
      console.error('Error fetching absence requests:', error);
      // Set empty array instead of mock data
      setAbsenceRequests([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Check for conflicts
    if (['date', 'startTime', 'endTime', 'roomId', 'teacherId'].includes(name)) {
      if (newFormData.date && newFormData.startTime && newFormData.endTime) {
        const makeupSchedule = {
          id: `makeup-temp-${Date.now()}`,
          classId: parseInt(newFormData.classId),
          className: classes.find(c => c.id === parseInt(newFormData.classId))?.name,
          teacherId: parseInt(newFormData.teacherId),
          teacherName: teachers.find(t => t.id === parseInt(newFormData.teacherId))?.name,
          roomId: parseInt(newFormData.roomId),
          roomName: rooms.find(r => r.id === parseInt(newFormData.roomId))?.name,
          date: newFormData.date,
          startTime: newFormData.startTime,
          endTime: newFormData.endTime,
          lessonNumber: newFormData.lessonNumber,
          lessonTopic: newFormData.lessonTopic,
          status: 'scheduled',
          type: 'makeup'
        };

        const newConflicts = ConflictChecker.checkConflicts([makeupSchedule], existingSchedules);
        setConflicts(newConflicts);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.date) {
      alert('Vui lòng chọn ngày học bù!');
      return;
    }

    if (!formData.reason) {
      alert('Vui lòng nhập lý do học bù!');
      return;
    }

    if (conflicts.length > 0) {
      if (!window.confirm(`Có ${conflicts.length} xung đột lịch học. Bạn có chắc chắn muốn tiếp tục?`)) {
        return;
      }
    }

    const makeupSchedule = {
      classId: parseInt(formData.classId),
      className: classes.find(c => c.id === parseInt(formData.classId))?.name,
      teacherId: parseInt(formData.teacherId),
      teacherName: teachers.find(t => t.id === parseInt(formData.teacherId))?.name,
      roomId: parseInt(formData.roomId),
      roomName: rooms.find(r => r.id === parseInt(formData.roomId))?.name,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      lessonNumber: formData.lessonNumber,
      lessonTopic: formData.lessonTopic,
      status: 'scheduled',
      type: 'makeup',
      originalScheduleId: formData.originalScheduleId,
      reason: formData.reason
    };

    onSubmit(makeupSchedule);
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-info-500 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-calendar-plus me-2"></i>
          Tạo lịch học bù
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Original schedule info */}
          {originalSchedule && (
            <Card className="mb-20 bg-info-25 border border-info-200 rounded-12" style={{ borderLeft: '4px solid var(--info-500)' }}>
              <Card.Header className="bg-info-50 border-0 rounded-top-12 p-16">
                <h5 className="mb-0 text-neutral-900 fw-semibold">Thông tin buổi học gốc</h5>
              </Card.Header>
              <Card.Body className="p-20">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="text-14"><strong className="text-neutral-900">Lớp:</strong> <span className="text-neutral-700">{originalSchedule.className}</span></div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14"><strong className="text-neutral-900">Ngày học:</strong> <span className="text-neutral-700">{new Date(originalSchedule.date).toLocaleDateString('vi-VN')}</span></div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14"><strong className="text-neutral-900">Thời gian:</strong> <span className="text-neutral-700">{originalSchedule.startTime} - {originalSchedule.endTime}</span></div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14"><strong className="text-neutral-900">Buổi học:</strong> <span className="text-neutral-700">Buổi {originalSchedule.lessonNumber} - {originalSchedule.lessonTopic}</span></div>
                  </div>
                </div>

                {absenceRequests.length > 0 && (
                  <div className="mt-16">
                    <h6 className="mb-12 text-neutral-900">
                      Học viên xin nghỉ 
                      <Badge className="bg-warning-600 text-white px-10 py-4 ms-8">{absenceRequests.length}</Badge>
                    </h6>
                    <ListGroup>
                      {absenceRequests.map(request => (
                        <ListGroup.Item key={request.id} className="py-2">
                          <strong>{request.studentName}</strong> - {request.reason}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Makeup schedule form */}
          <div>
            <h5 className="mb-3">Thông tin lịch học bù</h5>

            {conflicts.length > 0 && (
              <Alert variant="warning">
                <div className="d-flex align-items-start">
                  <i className="fas fa-exclamation-triangle me-2 mt-1"></i>
                  <div>
                    <strong>Phát hiện {conflicts.length} xung đột lịch học!</strong>
                    <ul className="mb-0 mt-2">
                      {conflicts.map((conflict, index) => (
                        <li key={index}>{conflict.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Alert>
            )}

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Giảng viên <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="teacherId" 
                    value={formData.teacherId} 
                    onChange={handleInputChange}
                    required
                  >
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Phòng học <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="roomId" 
                    value={formData.roomId} 
                    onChange={handleInputChange}
                    required
                  >
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} (Sức chứa: {room.capacity})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Ngày học bù <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Giờ bắt đầu <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Giờ kết thúc <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Lý do học bù <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={3}
                placeholder="Nhập lý do cần học bù..."
                required
              />
            </Form.Group>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Buổi học số</Form.Label>
                  <Form.Control
                    type="number"
                    name="lessonNumber"
                    value={formData.lessonNumber}
                    readOnly
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Chủ đề buổi học</Form.Label>
                  <Form.Control
                    type="text"
                    name="lessonTopic"
                    value={formData.lessonTopic}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-neutral-25 border-0 p-20">
          <Button 
            className="btn-outline-neutral text-15 fw-medium px-20 py-10 radius-8"
            onClick={onClose}
          >
            <i className="fas fa-times me-2"></i>
            Hủy
          </Button>
          <Button 
            type="submit" 
            className="btn-info text-white text-15 fw-semibold px-24 py-10 radius-8"
          >
            <i className="fas fa-calendar-plus me-2"></i> Tạo lịch học bù
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MakeupClassModal;
