import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import scheduleService from '../../services/scheduleService';
import roomService from '../../services/roomService';

const createEmptyScheduleEntry = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  day: '',
  startTime: '08:00',
  endTime: '10:00'
});

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
    scheduleEntries: [createEmptyScheduleEntry()],
    tuitionFee: 0
  });

  const teachers = [
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' },
    { id: 3, name: 'Lê Văn C' }
  ];

  const [rooms, setRooms] = useState([
    { id: 1, name: 'Room 101', capacity: 30 },
    { id: 2, name: 'Room 102', capacity: 25 },
    { id: 3, name: 'Room 201', capacity: 20 }
  ]);

  const [existingSchedules, setExistingSchedules] = useState(() => {
    const mockData = [
      {
        id: 'mock-1',
        roomId: 1,
        roomName: 'Room 101',
        day: '2',
        startTime: '08:00',
        endTime: '10:00'
      },
      {
        id: 'mock-2',
        roomId: 2,
        roomName: 'Room 102',
        day: '4',
        startTime: '18:00',
        endTime: '20:00'
      },
      {
        id: 'mock-3',
        roomId: 1,
        roomName: 'Room 101',
        day: '6',
        startTime: '14:00',
        endTime: '16:00'
      }
    ];
    return mockData;
  });
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);

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

  const handleScheduleEntryChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduleEntries: prev.scheduleEntries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const addScheduleEntry = () => {
    setFormData(prev => ({
      ...prev,
      scheduleEntries: [...prev.scheduleEntries, createEmptyScheduleEntry()]
    }));
  };

  const removeScheduleEntry = (id) => {
    setFormData(prev => ({
      ...prev,
      scheduleEntries:
        prev.scheduleEntries.length > 1
          ? prev.scheduleEntries.filter(entry => entry.id !== id)
          : prev.scheduleEntries
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.level || !formData.program) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (
      formData.scheduleEntries.length === 0 ||
      formData.scheduleEntries.some(entry => !entry.day)
    ) {
      alert('Vui lòng chọn ít nhất 1 ngày học và điền đủ thời gian!');
      return;
    }

    if (
      formData.scheduleEntries.some(
        entry => entry.startTime >= entry.endTime
      )
    ) {
      alert('Giờ bắt đầu phải nhỏ hơn giờ kết thúc!');
      return;
    }

    onSubmit(formData);
  };

  useEffect(() => {
    const fetchExistingSchedules = async () => {
      try {
        setRoomLoading(true);
        setRoomError(null);
        const response = await scheduleService.getAllSchedules();
        
        if (response) {
          const fetched =
            Array.isArray(response.schedules) && response.schedules.length > 0
              ? response.schedules
              : Array.isArray(response.data) && response.data.length > 0
                ? response.data
                : null;
          
          if (fetched) {
            setExistingSchedules(fetched);
          }
        }
      } catch (error) {
        setRoomError('Đang sử dụng dữ liệu mẫu để kiểm tra phòng trống.');
      } finally {
        setRoomLoading(false);
      }
    };

    fetchExistingSchedules();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getAllRooms();
        
        if (response && (response.rooms || response.data)) {
          const fetchedRooms = response.rooms || response.data || [];
          setRooms(fetchedRooms);
        }
      } catch (error) {
        // Sử dụng mock data nếu API lỗi
      }
    };

    fetchRooms();
  }, []);

  const parseDateToDayOfWeek = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;

      const dayOfWeek = date.getDay();
      const dayMap = { 0: 'CN', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7' };
      return dayMap[dayOfWeek] || null;
    } catch (error) {
      return null;
    }
  };

  const normalizeDayValue = (value) => {
    if (!value) return null;
    
    // If it's a date string, parse it first
    if (typeof value === 'string' && (value.includes('-') || value.includes('/'))) {
      const dayFromDate = parseDateToDayOfWeek(value);
      if (dayFromDate) {
        return dayFromDate;
      }
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    const normalized = 
      ['T2', 'Thứ 2', 'Monday', 'Mon'].includes(value) ? '2' :
      ['T3', 'Thứ 3', 'Tuesday', 'Tue'].includes(value) ? '3' :
      ['T4', 'Thứ 4', 'Wednesday', 'Wed'].includes(value) ? '4' :
      ['T5', 'Thứ 5', 'Thursday', 'Thu'].includes(value) ? '5' :
      ['T6', 'Thứ 6', 'Friday', 'Fri'].includes(value) ? '6' :
      ['T7', 'Thứ 7', 'Saturday', 'Sat'].includes(value) ? '7' :
      ['CN', 'Chủ nhật', 'Sunday', 'Sun'].includes(value) ? 'CN' :
      value.toString();
    return normalized;
  };

  const parseTime = (time) => {
    if (!time) return null;
    return time.length === 5 ? time : time.slice(0, 5);
  };

  const hasTimeOverlap = (startA, endA, startB, endB) => {
    if (!startA || !endA || !startB || !endB) return false;
    return startA < endB && startB < endA;
  };

  const filledScheduleEntries = useMemo(
    () =>
      formData.scheduleEntries.filter(
        (entry) => entry.day && entry.startTime && entry.endTime
      ),
    [formData.scheduleEntries]
  );

  const conflictingRoomIds = useMemo(() => {
    if (!filledScheduleEntries.length || !existingSchedules.length) {
      return new Set();
    }

    const conflicts = new Set();

    filledScheduleEntries.forEach((entry) => {
      const entryDay = normalizeDayValue(entry.day);
      const entryStart = parseTime(entry.startTime);
      const entryEnd = parseTime(entry.endTime);

      existingSchedules.forEach((schedule) => {
        const scheduleRoomId =
          schedule.roomId ||
          schedule.roomID ||
          schedule.room?.id ||
          schedule.room?._id;
        const scheduleRoomName = schedule.roomName || schedule.room?.name;

        if (!scheduleRoomId && !scheduleRoomName) {
          return;
        }

        // Try to get day from various possible fields
        let scheduleDayRaw = 
          schedule.day ||
          schedule.dayOfWeek ||
          schedule.day_of_week ||
          schedule.weekDay ||
          schedule.date ||
          schedule.scheduleDate ||
          schedule.classDate;
        
        // If we have a date, try to parse it to day of week
        if (!scheduleDayRaw && (schedule.date || schedule.scheduleDate || schedule.classDate)) {
          scheduleDayRaw = schedule.date || schedule.scheduleDate || schedule.classDate;
        }
        
        const scheduleDay = normalizeDayValue(scheduleDayRaw);

        if (!scheduleDay || scheduleDay !== entryDay) {
          return;
        }

        const scheduleStart = parseTime(
          schedule.startTime ||
            schedule.start_time ||
            schedule.time?.start ||
            schedule.startHour
        );

        const scheduleEnd = parseTime(
          schedule.endTime ||
            schedule.end_time ||
            schedule.time?.end ||
            schedule.endHour
        );

        const hasOverlap = hasTimeOverlap(entryStart, entryEnd, scheduleStart, scheduleEnd);

        if (hasOverlap) {
          if (scheduleRoomId) {
            conflicts.add(String(scheduleRoomId));
          }
          if (scheduleRoomName) {
            conflicts.add(scheduleRoomName);
          }
        }
      });
    });

    return conflicts;
  }, [filledScheduleEntries, existingSchedules]);

  const filteredRooms = useMemo(() => {
    if (!filledScheduleEntries.length || !existingSchedules.length) {
      return rooms;
    }

    return rooms.filter(
      (room) => {
        // API có thể trả về _id (MongoDB) hoặc id
        const roomId = room._id || room.id;
        const roomIdStr = String(roomId);
        
        // Lấy roomName với nhiều fallback
        const roomName = room.name || room.roomName || room.room_name || room.title || `Phòng ${roomId}`;
        
        // So sánh bằng cả id và name
        const hasIdConflict = conflictingRoomIds.has(roomIdStr) || conflictingRoomIds.has(String(room.id));
        const hasNameConflict = conflictingRoomIds.has(roomName) || 
                                conflictingRoomIds.has(room.name) || 
                                conflictingRoomIds.has(room.roomName) || 
                                conflictingRoomIds.has(room.room_name);
        
        return !hasIdConflict && !hasNameConflict;
      }
    );
  }, [filledScheduleEntries, existingSchedules, rooms, conflictingRoomIds]);

  useEffect(() => {
    if (
      formData.roomId &&
      !filteredRooms.some(room => {
        const roomId = room._id || room.id;
        return String(roomId) === String(formData.roomId) || String(room.id) === String(formData.roomId);
      })
    ) {
      setFormData(prev => ({ ...prev, roomId: '' }));
    }
  }, [filteredRooms, formData.roomId]);

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
          {/* Schedule */}
          <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Lịch học & Thời gian
            </h5>
            


            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Ngày khai giảng
                  </Form.Label>
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
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Ngày kết thúc
                  </Form.Label>
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

            <Form.Group className="mb-12">
              <Form.Label className="text-neutral-700 fw-medium mb-8">
                Thời khóa biểu <span className="text-danger-600">*</span>
              </Form.Label>
              <p className="text-neutral-500 text-13 mb-0">
                Thêm nhiều buổi học với ngày và giờ khác nhau (ví dụ: Thứ 2: 08:00-10:00, Thứ 4: 18:00-20:00).
              </p>
            </Form.Group>

            <div className="d-flex flex-column gap-12">
              {formData.scheduleEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border border-neutral-100 rounded-12 p-16"
                >
                  <div className="d-flex justify-content-between align-items-center mb-12">
                    <div className="fw-semibold text-neutral-900">
                      Buổi {index + 1}
                    </div>
                    {formData.scheduleEntries.length > 1 && (
                      <Button
                        type="button"
                        className="btn-outline-danger text-13 fw-medium px-14 py-6 radius-8"
                        onClick={() => removeScheduleEntry(entry.id)}
                      >
                        <i className="fas fa-trash-alt me-2"></i>
                        Xóa
                      </Button>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="text-neutral-700 fw-medium mb-8">
                          Ngày học
                        </Form.Label>
                        <Form.Select
                          value={entry.day}
                          onChange={(e) =>
                            handleScheduleEntryChange(entry.id, 'day', e.target.value)
                          }
                          className="border-neutral-30 radius-8 px-16 py-10"
                          required
                        >
                          <option value="">-- Chọn ngày --</option>
                          {daysOfWeek.map(day => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="text-neutral-700 fw-medium mb-8">
                          Giờ bắt đầu
                        </Form.Label>
                        <Form.Control
                          type="time"
                          value={entry.startTime}
                          onChange={(e) =>
                            handleScheduleEntryChange(entry.id, 'startTime', e.target.value)
                          }
                          className="border-neutral-30 radius-8 px-16 py-10"
                          required
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="text-neutral-700 fw-medium mb-8">
                          Giờ kết thúc
                        </Form.Label>
                        <Form.Control
                          type="time"
                          value={entry.endTime}
                          onChange={(e) =>
                            handleScheduleEntryChange(entry.id, 'endTime', e.target.value)
                          }
                          className="border-neutral-30 radius-8 px-16 py-10"
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={addScheduleEntry}
              className="btn-outline-main text-14 fw-medium px-16 py-8 radius-8 mt-16"
            >
              <i className="fas fa-plus me-2"></i>
              Thêm buổi học
            </Button>
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
                    disabled={roomLoading}
                  >
                    <option value="">
                      {roomLoading ? 'Đang kiểm tra phòng trống...' : '-- Chọn phòng học --'}
                    </option>
                    {!roomLoading && filteredRooms.length === 0 && (
                      <option value="" disabled>
                        Không còn phòng phù hợp
                      </option>
                    )}
                    {!roomLoading && filteredRooms.map(r => {
                      const roomId = r._id || r.id;
                      const roomName = r.name || r.roomName || r.room_name || r.title || `Phòng ${roomId}`;
                      const capacity = r.capacity || r.maxCapacity || r.maxStudents || 'N/A';
                      return (
                        <option key={roomId} value={roomId}>
                          {roomName} (Sức chứa: {capacity})
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Form.Text className="text-neutral-500 text-12">
                    Chỉ hiển thị phòng chưa bị trùng với lịch đã chọn.
                  </Form.Text>
                  {roomError && (
                    <Alert variant="warning" className="mt-12 mb-0">
                      {roomError}
                    </Alert>
                  )}
                </Form.Group>
              </div>
            </div>
          </div>

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
