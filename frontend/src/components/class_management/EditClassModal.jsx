import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditClassModal = ({ classData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    level: '',
    program: '',
    band: '',
    teacherId: '',
    roomId: '',
    maxStudents: 25,
    startDate: '',
    endDate: '',
    schedule: {
      days: [],
      startTime: '08:00',
      endTime: '10:00'
    },
    tuitionFee: 0,
    status: 'pending'
  });

  useEffect(() => {
    if (classData) {
      // Parse schedule string to extract days and time
      const scheduleMatch = classData.schedule?.match(/T([2-7]|CN)-?([2-7]|CN)?-?([2-7]|CN)?, (\d{2}:\d{2})-(\d{2}:\d{2})/);
      let days = [];
      let startTime = '08:00';
      let endTime = '10:00';

      if (scheduleMatch) {
        days = scheduleMatch.slice(1, 4).filter(Boolean);
        startTime = scheduleMatch[4];
        endTime = scheduleMatch[5];
      }

      setFormData({
        ...classData,
        schedule: {
          days,
          startTime,
          endTime
        }
      });
    }
  }, [classData]);

  const teachers = [
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' },
    { id: 3, name: 'Lê Văn C' }
  ];

  const rooms = [
    { id: 1, name: 'Room 101', capacity: 30 },
    { id: 2, name: 'Room 102', capacity: 25 },
    { id: 3, name: 'Room 201', capacity: 20 }
  ];

  const daysOfWeek = [
    { value: '2', label: 'Thứ 2' },
    { value: '3', label: 'Thứ 3' },
    { value: '4', label: 'Thứ 4' },
    { value: '5', label: 'Thứ 5' },
    { value: '6', label: 'Thứ 6' },
    { value: '7', label: 'Thứ 7' },
    { value: 'CN', label: 'Chủ nhật' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [name]: value }
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.level || !formData.program) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (formData.schedule.days.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ngày học!');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal show={true} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton className="bg-warning-600 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-edit me-2"></i>
          Chỉnh sửa thông tin lớp học
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24">
          {/* Basic Information */}
          <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Thông tin cơ bản
            </h5>
            
            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Tên lớp <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: A1-Morning-01"
                    required
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Chờ khai giảng</option>
                    <option value="active">Đang học</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Chương trình <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Cấp độ <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn cấp độ --</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Band</Form.Label>
                  <Form.Control
                    type="text"
                    name="band"
                    value={formData.band}
                    onChange={handleInputChange}
                    placeholder="VD: Band 1"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Sĩ số tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                  />
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-4">
            <h5 className="mb-3 pb-2 border-bottom">Lịch học</h5>
            
            <Form.Group className="mb-3">
              <Form.Label>Chọn ngày học <span className="text-danger">*</span></Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                {daysOfWeek.map(day => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={formData.schedule.days.includes(day.value) ? 'primary' : 'outline-primary'}
                    onClick={() => handleDayToggle(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Giờ bắt đầu</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.schedule.startTime}
                    onChange={handleScheduleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Giờ kết thúc</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.schedule.endTime}
                    onChange={handleScheduleChange}
                  />
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="mb-4">
            <h5 className="mb-3 pb-2 border-bottom">Tài nguyên</h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Giáo viên</Form.Label>
                  <Form.Select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn giáo viên --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Phòng học</Form.Label>
                  <Form.Select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn phòng học --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Sức chứa: {r.capacity})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-3">
            <h5 className="mb-3 pb-2 border-bottom">Thời gian</h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Ngày khai giảng</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Ngày kết thúc</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
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
            className="btn-warning text-white text-15 fw-semibold px-24 py-10 radius-8"
            type="submit"
          >
            <i className="fas fa-save me-2"></i>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditClassModal;
