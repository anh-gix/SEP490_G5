import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ButtonGroup, Badge, Alert } from 'react-bootstrap';
import ConflictChecker from './ConflictChecker';
import classService from '../../services/classService';
import axios from 'axios';

const CreateScheduleModal = ({ classes, teachers, rooms, onClose, onSubmit, existingSchedules }) => {
  const [mode, setMode] = useState('auto'); // auto or manual
  const [formData, setFormData] = useState({
    classId: '',
    teacherId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    startTime: '',
    endTime: '',
    lessonDuration: 120, // minutes
    totalLessons: 0
  });
  const [manualSchedules, setManualSchedules] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedSchedules, setGeneratedSchedules] = useState([]);

  const daysOfWeekOptions = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 0, label: 'Chủ nhật' }
  ];

  useEffect(() => {
    if (formData.classId) {
      fetchSyllabus(formData.classId);
    }
  }, [formData.classId]);

  const fetchSyllabus = async (classId) => {
    try {
      // First, get the class to find the course
      const classResponse = await classService.getClassById(classId);
      const classData = classResponse.class || classResponse;
      const courseId = classData.course?._id || classData.course;
      
      if (!courseId) {
        console.warn('Class does not have a course assigned');
        setSyllabus([]);
        setFormData(prev => ({ ...prev, totalLessons: 0 }));
        return;
      }
      
      // Get course details with sessions
      const courseResponse = await axios.get(
        `http://localhost:8080/api/courses/${courseId}/details`
      );
      const course = courseResponse.data.data || courseResponse.data;
      const sessions = course.sessions || [];
      
      // Transform sessions to syllabus format
      const syllabus = sessions.map((session, index) => ({
        lessonNumber: session.order || index + 1,
        topic: session.title || `Lesson ${index + 1}`,
        description: session.content || session.description || ''
      }));
      
      setSyllabus(syllabus);
      setFormData(prev => ({ ...prev, totalLessons: syllabus.length }));
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      // Show error instead of using mock data
      setSyllabus([]);
      setFormData(prev => ({ ...prev, totalLessons: 0 }));
      alert('Không thể tải giáo trình. Vui lòng thử lại sau.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const newDays = prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort();
      return { ...prev, daysOfWeek: newDays };
    });
  };

  const generateAutoSchedule = () => {
    if (!formData.classId || !formData.teacherId || !formData.roomId || 
        !formData.startDate || !formData.daysOfWeek.length || !formData.startTime || !formData.endTime) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const schedules = [];
    const startDate = new Date(formData.startDate);
    const endDate = formData.endDate ? new Date(formData.endDate) : null;
    let currentDate = new Date(startDate);
    let lessonIndex = 0;

    while (lessonIndex < formData.totalLessons) {
      const dayOfWeek = currentDate.getDay();
      
      if (formData.daysOfWeek.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if we've exceeded end date
        if (endDate && currentDate > endDate) break;
        
        schedules.push({
          id: `temp-${lessonIndex}`,
          classId: parseInt(formData.classId),
          className: classes.find(c => c.id === parseInt(formData.classId))?.name,
          teacherId: parseInt(formData.teacherId),
          teacherName: teachers.find(t => t.id === parseInt(formData.teacherId))?.name,
          roomId: parseInt(formData.roomId),
          roomName: rooms.find(r => r.id === parseInt(formData.roomId))?.name,
          date: dateStr,
          startTime: formData.startTime,
          endTime: formData.endTime,
          lessonNumber: lessonIndex + 1,
          lessonTopic: syllabus[lessonIndex]?.topic || `Lesson ${lessonIndex + 1}`,
          status: 'scheduled',
          type: 'regular'
        });
        
        lessonIndex++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setGeneratedSchedules(schedules);
    
    // Check for conflicts
    const allSchedules = [...existingSchedules, ...schedules];
    const newConflicts = ConflictChecker.checkConflicts(schedules, allSchedules);
    setConflicts(newConflicts);
    
    setShowPreview(true);
  };

  const addManualSchedule = () => {
    if (!formData.classId || !formData.teacherId || !formData.roomId || 
        !formData.startDate || !formData.startTime || !formData.endTime) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const lessonNumber = manualSchedules.length + 1;
    
    const newSchedule = {
      id: `temp-${Date.now()}`,
      classId: parseInt(formData.classId),
      className: classes.find(c => c.id === parseInt(formData.classId))?.name,
      teacherId: parseInt(formData.teacherId),
      teacherName: teachers.find(t => t.id === parseInt(formData.teacherId))?.name,
      roomId: parseInt(formData.roomId),
      roomName: rooms.find(r => r.id === parseInt(formData.roomId))?.name,
      date: formData.startDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      lessonNumber: lessonNumber,
      lessonTopic: syllabus[lessonNumber - 1]?.topic || `Lesson ${lessonNumber}`,
      status: 'scheduled',
      type: 'regular'
    };

    const newManualSchedules = [...manualSchedules, newSchedule];
    setManualSchedules(newManualSchedules);

    // Check for conflicts
    const allSchedules = [...existingSchedules, ...newManualSchedules];
    const newConflicts = ConflictChecker.checkConflicts([newSchedule], allSchedules);
    setConflicts(newConflicts);

    // Reset form for next entry
    setFormData(prev => ({
      ...prev,
      startDate: '',
      startTime: '',
      endTime: ''
    }));
  };

  const removeManualSchedule = (id) => {
    setManualSchedules(manualSchedules.filter(s => s.id !== id));
  };

  const handleSubmit = () => {
    const schedulesToSubmit = mode === 'auto' ? generatedSchedules : manualSchedules;
    
    if (schedulesToSubmit.length === 0) {
      alert('Chưa có lịch học nào để tạo!');
      return;
    }

    if (conflicts.length > 0) {
      if (!window.confirm(`Có ${conflicts.length} xung đột lịch học. Bạn có chắc chắn muốn tiếp tục?`)) {
        return;
      }
    }

    onSubmit(schedulesToSubmit);
  };

  return (
    <Modal 
      show={true} 
      onHide={onClose} 
      size="xl" 
      centered
      backdrop="static"
    >
      <Modal.Header closeButton className="bg-main-600 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-calendar-plus me-2"></i>
          Tạo lịch học mới
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-24" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Mode selector */}
        <div className="mb-20 d-flex gap-12">
          <Button
            className={mode === 'auto' 
              ? 'btn-main text-15 fw-medium px-20 py-12 radius-8 flex-fill' 
              : 'btn-outline-main text-15 fw-medium px-20 py-12 radius-8 flex-fill'}
            onClick={() => setMode('auto')}
          >
            <i className="fas fa-magic me-2"></i>
            Tạo tự động
          </Button>
          <Button
            className={mode === 'manual' 
              ? 'btn-main text-15 fw-medium px-20 py-12 radius-8 flex-fill' 
              : 'btn-outline-main text-15 fw-medium px-20 py-12 radius-8 flex-fill'}
            onClick={() => setMode('manual')}
          >
            <i className="fas fa-hand-pointer me-2"></i>
            Tạo thủ công
          </Button>
        </div>

        {/* Form */}
        <div>
          <div className="row g-3 mb-16">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8">
                  Lớp học <span className="text-danger-600">*</span>
                </Form.Label>
                <Form.Select 
                  name="classId" 
                  value={formData.classId} 
                  onChange={handleInputChange}
                  className="border-neutral-30 radius-8 px-16 py-10"
                >
                  <option value="">Chọn lớp học</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.level} ({cls.students} học viên)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8">
                  Giảng viên <span className="text-danger-600">*</span>
                </Form.Label>
                <Form.Select 
                  name="teacherId" 
                  value={formData.teacherId} 
                  onChange={handleInputChange}
                  className="border-neutral-30 radius-8 px-16 py-10"
                >
                  <option value="">Chọn giảng viên</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8">
                  Phòng học <span className="text-danger-600">*</span>
                </Form.Label>
                <Form.Select 
                  name="roomId" 
                  value={formData.roomId} 
                  onChange={handleInputChange}
                  className="border-neutral-30 radius-8 px-16 py-10"
                >
                  <option value="">Chọn phòng học</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} (Sức chứa: {room.capacity})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          {mode === 'auto' ? (
            <>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>Ngày bắt đầu <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>Ngày kết thúc (tùy chọn)</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>Số buổi học</Form.Label>
                    <Form.Control
                      type="number"
                      name="totalLessons"
                      value={formData.totalLessons}
                      onChange={handleInputChange}
                      min="1"
                      readOnly={syllabus.length > 0}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Chọn ngày trong tuần <span className="text-danger">*</span></Form.Label>
                <div className="d-flex gap-2 flex-wrap">
                  {daysOfWeekOptions.map(day => (
                    <Button
                      key={day.value}
                      variant={formData.daysOfWeek.includes(day.value) ? 'primary' : 'outline-primary'}
                      onClick={() => handleDayToggle(day.value)}
                      style={{ minWidth: '90px' }}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </Form.Group>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Giờ bắt đầu <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
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
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="d-grid mb-3">
                <Button variant="primary" onClick={generateAutoSchedule} size="lg">
                  <i className="fas fa-calendar-check me-2"></i> Tạo lịch tự động
                </Button>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border rounded p-3 bg-light">
                  <h5 className="mb-3">
                    Xem trước lịch học 
                    <Badge bg="primary" className="ms-2">{generatedSchedules.length} buổi</Badge>
                  </h5>
                  
                  {conflicts.length > 0 && (
                    <Alert variant="warning" className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <span>Phát hiện {conflicts.length} xung đột lịch học!</span>
                    </Alert>
                  )}

                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {generatedSchedules.slice(0, 10).map((schedule, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center p-2 bg-white rounded border">
                        <span className="fw-bold text-primary">
                          {new Date(schedule.date).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                        <span className="text-muted">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                        <span>
                          Buổi {schedule.lessonNumber}: {schedule.lessonTopic}
                        </span>
                      </div>
                    ))}
                    {generatedSchedules.length > 10 && (
                      <div className="text-center text-muted">
                        ... và {generatedSchedules.length - 10} buổi học khác
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>Ngày học <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
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
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="d-grid mb-3">
                <Button variant="secondary" onClick={addManualSchedule}>
                  <i className="fas fa-plus me-2"></i> Thêm buổi học
                </Button>
              </div>

              {/* Manual schedules list */}
              {manualSchedules.length > 0 && (
                <div className="border rounded p-3 bg-light">
                  <h5 className="mb-3">
                    Danh sách buổi học
                    <Badge bg="secondary" className="ms-2">{manualSchedules.length}</Badge>
                  </h5>
                  
                  {conflicts.length > 0 && (
                    <Alert variant="warning" className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <span>Phát hiện {conflicts.length} xung đột lịch học!</span>
                    </Alert>
                  )}

                  <div className="d-flex flex-column gap-2">
                    {manualSchedules.map(schedule => (
                      <div key={schedule.id} className="d-flex justify-content-between align-items-center p-2 bg-white rounded border">
                        <span>
                          <strong>Buổi {schedule.lessonNumber}:</strong>{' '}
                          {new Date(schedule.date).toLocaleDateString('vi-VN')} -{' '}
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeManualSchedule(schedule.id)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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
          className="btn-main text-15 fw-semibold px-24 py-10 radius-8"
          onClick={handleSubmit}
          disabled={
            (mode === 'auto' && !showPreview) || 
            (mode === 'manual' && manualSchedules.length === 0)
          }
        >
          <i className="fas fa-check me-2"></i> Tạo lịch học
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateScheduleModal;
