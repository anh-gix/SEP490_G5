import React, { useState } from 'react';
import { Modal, Button, Form, ButtonGroup } from 'react-bootstrap';

const CreateClassModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
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
    tuitionFee: 0
  });

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

  const programs = [
    { id: 1, name: 'Tiếng Anh Giao tiếp', levels: ['A1', 'A2', 'B1', 'B2', 'C1'] },
    { id: 2, name: 'TOEIC', levels: ['TOEIC 450', 'TOEIC 600', 'TOEIC 750+'] },
    { id: 3, name: 'IELTS', levels: ['IELTS 4.0', 'IELTS 5.5', 'IELTS 6.5+'] }
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
    
    // Validation
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
    <Modal show={true} onHide={onClose} size="xl" centered backdrop="static">
      <Modal.Header closeButton className="bg-main-600 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-plus-circle me-2"></i>
          Tạo lớp học mới
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Chương trình <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    className="border-neutral-30 radius-8 px-16 py-10"
                  >
                    <option value="">-- Chọn chương trình --</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Cấp độ <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    className="border-neutral-30 radius-8 px-16 py-10"
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

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Band</Form.Label>
                  <Form.Control
                    type="text"
                    name="band"
                    value={formData.band}
                    onChange={handleInputChange}
                    placeholder="VD: Band 1"
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Học phí (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    name="tuitionFee"
                    value={formData.tuitionFee}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Sĩ số tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Lịch học
            </h5>
            
            <Form.Group className="mb-16">
              <Form.Label className="text-neutral-700 fw-medium mb-8">
                Chọn ngày học <span className="text-danger-600">*</span>
              </Form.Label>
              <div className="d-flex gap-8 flex-wrap">
                {daysOfWeek.map(day => (
                  <Button
                    key={day.value}
                    className={formData.schedule.days.includes(day.value) 
                      ? 'btn-main text-14 fw-medium px-16 py-8 radius-8' 
                      : 'btn-outline-main text-14 fw-medium px-16 py-8 radius-8'}
                    onClick={() => handleDayToggle(day.value)}
                    style={{ minWidth: '90px' }}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Giờ bắt đầu</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.schedule.startTime}
                    onChange={handleScheduleChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Giờ kết thúc</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.schedule.endTime}
                    onChange={handleScheduleChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Tài nguyên
            </h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Giáo viên</Form.Label>
                  <Form.Select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
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
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Phòng học</Form.Label>
                  <Form.Select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
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
          <div>
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Thời gian
            </h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Ngày khai giảng</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Ngày kết thúc</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
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
            <i className="fas fa-times me-2"></i> Hủy
          </Button>
          <Button 
            type="submit" 
            className="btn-main text-15 fw-semibold px-24 py-10 radius-8"
          >
            <i className="fas fa-check me-2"></i> Tạo lớp học
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateClassModal;
