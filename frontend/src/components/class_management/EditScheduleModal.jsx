import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import ConflictChecker from './ConflictChecker';

const EditScheduleModal = ({ 
  schedule, 
  classes, 
  teachers, 
  rooms, 
  onClose, 
  onSubmit, 
  existingSchedules 
}) => {
  const [formData, setFormData] = useState({
    id: schedule.id,
    classId: schedule.classId,
    teacherId: schedule.teacherId,
    roomId: schedule.roomId,
    date: schedule.date,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    lessonNumber: schedule.lessonNumber,
    lessonTopic: schedule.lessonTopic,
    status: schedule.status,
    type: schedule.type
  });
  const [conflicts, setConflicts] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Check for conflicts when changing time/room/teacher
    if (['date', 'startTime', 'endTime', 'roomId', 'teacherId'].includes(name)) {
      const updatedSchedule = {
        ...schedule,
        ...newFormData,
        className: classes.find(c => c.id === parseInt(newFormData.classId))?.name,
        teacherName: teachers.find(t => t.id === parseInt(newFormData.teacherId))?.name,
        roomName: rooms.find(r => r.id === parseInt(newFormData.roomId))?.name
      };
      
      const otherSchedules = existingSchedules.filter(s => s.id !== schedule.id);
      const newConflicts = ConflictChecker.checkConflicts([updatedSchedule], otherSchedules);
      setConflicts(newConflicts);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (conflicts.length > 0) {
      if (!window.confirm(`Có ${conflicts.length} xung đột lịch học. Bạn có chắc chắn muốn tiếp tục?`)) {
        return;
      }
    }

    const updatedSchedule = {
      ...formData,
      className: classes.find(c => c.id === parseInt(formData.classId))?.name,
      teacherName: teachers.find(t => t.id === parseInt(formData.teacherId))?.name,
      roomName: rooms.find(r => r.id === parseInt(formData.roomId))?.name
    };

    onSubmit(updatedSchedule);
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-warning-600 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-edit me-2"></i>
          Chỉnh sửa lịch học
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24">
          {conflicts.length > 0 && (
            <Alert variant="warning" className="bg-warning-50 border border-warning-200 rounded-12 mb-20">
              <div className="d-flex align-items-start">
                <i className="fas fa-exclamation-triangle me-2 mt-1 text-warning-600"></i>
                <div>
                  <strong className="text-warning-700">Phát hiện {conflicts.length} xung đột lịch học!</strong>
                  <ul className="mb-0 mt-2">
                    {conflicts.map((conflict, index) => (
                      <li key={index} className="text-warning-600">{conflict.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Alert>
          )}

          <div className="row g-3 mb-16">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8">
                  Lớp học <span className="text-danger-600">*</span>
                </Form.Label>
                <Form.Select 
                  name="classId" 
                  value={formData.classId} 
                  onChange={handleInputChange}
                  required
                  className="border-neutral-30 radius-8 px-16 py-10"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.level}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

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
          </div>

          <div className="row g-3 mb-3">
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

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Ngày học <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
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

            <div className="col-md-6">
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

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Buổi học số</Form.Label>
                <Form.Control
                  type="number"
                  name="lessonNumber"
                  value={formData.lessonNumber}
                  onChange={handleInputChange}
                  min="1"
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

          <div className="row g-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                >
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Loại lịch</Form.Label>
                <Form.Select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleInputChange}
                  disabled
                >
                  <option value="regular">Học chính</option>
                  <option value="makeup">Học bù</option>
                </Form.Select>
              </Form.Group>
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
            className="btn-warning text-white text-15 fw-semibold px-24 py-10 radius-8"
          >
            <i className="fas fa-save me-2"></i> Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditScheduleModal;
