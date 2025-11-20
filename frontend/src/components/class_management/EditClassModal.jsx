import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import classService from '../../services/classService';

const createEmptyScheduleEntry = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  day: '',
  startTime: '08:00',
  endTime: '10:00'
});

const EditClassModal = ({ classData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    level: '',
    program: '',
    band: '',
    course: '',
    teacherId: '',
    roomId: '',
    maxStudents: 25,
    startDate: '',
    endDate: '',
    scheduleEntries: [createEmptyScheduleEntry()],
    tuitionFee: 0,
    status: 'pending'
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [studentsFetched, setStudentsFetched] = useState(false);

  useEffect(() => {
    // Reset studentsFetched when classData changes
    setStudentsFetched(false);
    
    if (classData) {
      console.log('🔍 [EditClassModal] Loading classData:', classData);
      console.log('🔍 [EditClassModal] All classData keys:', Object.keys(classData));
      console.log('🔍 [EditClassModal] Checking course fields:', {
        'classData.course': classData.course,
        'classData.courseId': classData.courseId,
        'classData.course_id': classData.course_id,
        'classData.Course': classData.Course,
        'classData.CourseId': classData.CourseId,
      });
      
      // Convert schedule to scheduleEntries format
      let scheduleEntries = [createEmptyScheduleEntry()];
      
      // Try to parse from schedules array first (more accurate)
      if (classData.schedules && Array.isArray(classData.schedules) && classData.schedules.length > 0) {
        // Group schedules by day and time to create scheduleEntries
        const scheduleMap = new Map();
        
        classData.schedules.forEach(schedule => {
          const date = new Date(schedule.date || schedule.scheduleDate || schedule.classDate);
          const dayOfWeek = date.getDay();
          const dayMap = { 0: 'CN', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7' };
          const day = dayMap[dayOfWeek];
          
          const startTime = schedule.startTime || schedule.start_time || '08:00';
          const endTime = schedule.endTime || schedule.end_time || '10:00';
          
          const key = `${day}-${startTime}-${endTime}`;
          if (!scheduleMap.has(key)) {
            scheduleMap.set(key, { day, startTime, endTime });
          }
        });
        
        scheduleEntries = Array.from(scheduleMap.values()).map(entry => ({
          ...createEmptyScheduleEntry(),
          ...entry
        }));
      } else if (classData.schedule) {
        // Fallback: Parse schedule string to extract days and time
        const scheduleMatch = classData.schedule?.match(/T([2-7]|CN)-?([2-7]|CN)?-?([2-7]|CN)?, (\d{2}:\d{2})-(\d{2}:\d{2})/);
        
        if (scheduleMatch) {
          const days = scheduleMatch.slice(1, 4).filter(Boolean);
          const startTime = scheduleMatch[4];
          const endTime = scheduleMatch[5];
          
          // Create one scheduleEntry for each day with the same time
          scheduleEntries = days.map(day => ({
            ...createEmptyScheduleEntry(),
            day,
            startTime,
            endTime
          }));
        }
      }
      
      // Ensure at least one entry
      if (scheduleEntries.length === 0) {
        scheduleEntries = [createEmptyScheduleEntry()];
      }

      // Handle course - check multiple possible field names
      const courseId = 
        classData.course?._id || 
        classData.course?.id || 
        classData.course ||
        classData.courseId ||
        classData.course_id ||
        classData.Course?._id ||
        classData.Course?.id ||
        classData.Course ||
        classData.CourseId ||
        '';
      // Convert to string to ensure consistent comparison
      const courseIdStr = courseId ? String(courseId) : '';

      console.log('🔍 [EditClassModal] Course extraction:', {
        'classData.course': classData.course,
        'classData.courseId': classData.courseId,
        'classData.Course': classData.Course,
        'courseId (raw)': courseId,
        'courseIdStr (final)': courseIdStr,
        'typeof courseId': typeof courseId,
        'typeof courseIdStr': typeof courseIdStr
      });

      console.log('🔍 [EditClassModal] Band from classData:', classData.band);
      console.log('🔍 [EditClassModal] ScheduleEntries:', scheduleEntries);

      // Debug students data
      console.log('🔍 [EditClassModal] ========== DEBUG STUDENTS ==========');
      console.log('🔍 [EditClassModal] classData.students:', classData.students);
      console.log('🔍 [EditClassModal] classData.students type:', typeof classData.students);
      console.log('🔍 [EditClassModal] classData.students isArray:', Array.isArray(classData.students));
      console.log('🔍 [EditClassModal] classData.students length:', classData.students?.length);
      
      // Check for alternative field names
      console.log('🔍 [EditClassModal] Checking alternative student fields:');
      console.log('  - classData.Students:', classData.Students);
      console.log('  - classData.studentList:', classData.studentList);
      console.log('  - classData.student_list:', classData.student_list);
      console.log('  - classData.members:', classData.members);
      
      // Log full classData structure for students
      if (classData.students) {
        console.log('🔍 [EditClassModal] First student sample:', classData.students[0]);
        console.log('🔍 [EditClassModal] All students:', JSON.stringify(classData.students, null, 2));
      }
      console.log('🔍 [EditClassModal] ====================================');

      setFormData({
        ...classData,
        course: courseIdStr,
        band: classData.band || '', // Ensure band is set from classData
        scheduleEntries
      });

      // Load students from classData - check multiple possible field names
      let studentsData = null;
      
      if (classData.students && Array.isArray(classData.students)) {
        studentsData = classData.students;
        console.log('✅ [EditClassModal] Found students in classData.students:', studentsData.length);
      } else if (classData.Students && Array.isArray(classData.Students)) {
        studentsData = classData.Students;
        console.log('✅ [EditClassModal] Found students in classData.Students:', studentsData.length);
      } else if (classData.studentList && Array.isArray(classData.studentList)) {
        studentsData = classData.studentList;
        console.log('✅ [EditClassModal] Found students in classData.studentList:', studentsData.length);
      } else if (classData.members && Array.isArray(classData.members)) {
        studentsData = classData.members;
        console.log('✅ [EditClassModal] Found students in classData.members:', studentsData.length);
      } else {
        console.warn('⚠️ [EditClassModal] No students found in classData, will fetch from API');
        studentsData = null; // Set to null to trigger API fetch
      }
      
      if (studentsData !== null) {
        setClassStudents(studentsData);
        setStudentsFetched(true); // Mark as fetched
        console.log('✅ [EditClassModal] Set classStudents to:', studentsData.length, 'students');
      } else {
        // Reset flag to allow API fetch
        setStudentsFetched(false);
        setClassStudents([]); // Set empty array first
        console.log('🌐 [EditClassModal] Will fetch students from API for class ID:', classData.id || classData._id);
      }
    }
  }, [classData]);

  // Fetch students from API if not found in classData
  useEffect(() => {
    const fetchStudentsFromAPI = async () => {
      if (!classData || (!classData.id && !classData._id)) {
        return;
      }

      // Skip if already fetched or if students are already in classData
      if (studentsFetched) {
        console.log('✅ [EditClassModal] Students already fetched, skipping API call');
        return;
      }

      if (classData.students && Array.isArray(classData.students) && classData.students.length > 0) {
        console.log('✅ [EditClassModal] Students already loaded from classData, skipping API fetch');
        return;
      }

      const classId = classData.id || classData._id;
      console.log('🌐 [EditClassModal] Fetching class details from API for ID:', classId);

      try {
        const response = await classService.getClassById(classId);
        console.log('✅ [EditClassModal] API Response:', response);

        if (response && response.success && response.class) {
          const fullClassData = response.class;
          console.log('✅ [EditClassModal] Full class data from API:', fullClassData);
          console.log('✅ [EditClassModal] Students from API:', fullClassData.students);

          if (fullClassData.students && Array.isArray(fullClassData.students)) {
            console.log('✅ [EditClassModal] Found', fullClassData.students.length, 'students from API');
            setClassStudents(fullClassData.students);
            setStudentsFetched(true); // Mark as fetched
          } else {
            console.warn('⚠️ [EditClassModal] No students in API response');
            setClassStudents([]);
            setStudentsFetched(true); // Mark as fetched even if empty
          }
        } else {
          console.warn('⚠️ [EditClassModal] API response does not have expected structure');
          setClassStudents([]);
          setStudentsFetched(true); // Mark as fetched even if error
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching students from API:', error);
        setClassStudents([]);
        setStudentsFetched(true); // Mark as fetched even if error
      }
    };

    fetchStudentsFromAPI();
  }, [classData?.id, classData?._id, studentsFetched]);

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

  // Program name to type mapping
  const programTypeMap = {
    'IELTS': 'ielts',
    'TOEIC': 'toeic',
    'Tiếng Anh Giao tiếp': 'cam'
  };

  // Map program name to type
  const getTypeFromProgram = (programName) => {
    return programTypeMap[programName] || null;
  };

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

  // Auto-fetch band when program and level are selected (only if band is not already set from classData)
  useEffect(() => {
    const fetchBand = async () => {
      console.log('🔍 [EditClassModal] fetchBand triggered, formData.band:', formData.band);
      
      // If band is already set from classData, don't fetch
      if (formData.band && formData.band.trim() !== '') {
        console.log('✅ [EditClassModal] Band already set from classData:', formData.band);
        return;
      }

      if (!formData.program || !formData.level) {
        console.log('⚠️ [EditClassModal] Program or level missing, not fetching band');
        // Don't clear band if it was set from classData
        return;
      }

      const type = getTypeFromProgram(formData.program);
      if (!type) {
        console.warn('⚠️ [EditClassModal] Cannot map program to type:', formData.program);
        // Don't clear band if we can't map program
        return;
      }

      console.log('🌐 [EditClassModal] Fetching band for:', { type, level: formData.level });

      try {
        const response = await axios.get('http://localhost:8080/api/v1/courses/band', {
          params: {
            type: type,
            level: formData.level
          }
        });

        console.log('✅ [EditClassModal] Band response:', response.data);

        if (response.data && response.data.success && response.data.band) {
          setFormData(prev => ({ ...prev, band: response.data.band }));
        } else {
          console.warn('⚠️ [EditClassModal] No band in response, keeping existing value');
          // Don't clear band if no mapping found, keep existing value
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching band:', error);
        // Don't clear band on error, keep existing value
      }
    };

    fetchBand();
  }, [formData.program, formData.level]);

  // No need to fetch courses list - we only display the course of this class

  // Fetch course details when course is set from classData
  useEffect(() => {
    const fetchCourseDetails = async () => {
      console.log('🔍 [EditClassModal] fetchCourseDetails triggered, formData.course:', formData.course);
      
      if (!formData.course) {
        console.log('⚠️ [EditClassModal] No course ID, setting selectedCourse to null');
        setSelectedCourse(null);
        return;
      }

      console.log('🌐 [EditClassModal] Fetching course details for ID:', formData.course);
      
      // Fetch course details to display course name
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/courses/${formData.course}/details`);
        console.log('✅ [EditClassModal] Course details response:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
          console.log('✅ [EditClassModal] Setting selectedCourse:', response.data.data);
          setSelectedCourse(response.data.data);
        } else {
          console.warn('⚠️ [EditClassModal] Response does not have expected structure:', response.data);
          setSelectedCourse(null);
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching course details:', error);
        console.error('❌ [EditClassModal] Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        });
        setSelectedCourse(null);
      }
    };

    fetchCourseDetails();
  }, [formData.course]);

  // Debug: Log when classStudents changes
  useEffect(() => {
    console.log('🔍 [EditClassModal] classStudents state changed:', classStudents);
    console.log('🔍 [EditClassModal] classStudents length:', classStudents.length);
    console.log('🔍 [EditClassModal] classStudents type:', typeof classStudents);
    console.log('🔍 [EditClassModal] classStudents isArray:', Array.isArray(classStudents));
  }, [classStudents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.level || !formData.program) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    // Validate course is selected
    if (!formData.course) {
      alert('Vui lòng chọn course!');
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

  return (
    <Modal show={true} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton className="bg-warning-600 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-edit me-2"></i>
          Chỉnh sửa thông tin lớp học
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
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Chương trình <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    disabled
                    readOnly
                    className="border-neutral-30 radius-8 px-16 py-10 bg-neutral-50"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Cấp độ <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="level"
                    value={formData.level || ''}
                    onChange={handleInputChange}
                    required
                    disabled
                    readOnly
                    className="border-neutral-30 radius-8 px-16 py-10 bg-neutral-50"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Course <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCourse ? `${selectedCourse.name}${selectedCourse.numberOfSessions ? ` (${selectedCourse.numberOfSessions} buổi)` : ''}` : (formData.course ? 'Đang tải...' : '--')}
                    readOnly
                    disabled
                    className="border-neutral-30 radius-8 px-16 py-10 bg-neutral-50"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Band</Form.Label>
                  <Form.Control
                    type="text"
                    name="band"
                    value={formData.band || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Band 1"
                    readOnly
                    className="border-neutral-30 radius-8 px-16 py-10 bg-neutral-50"
                  />
                </Form.Group>
              </div>
            </div>
          </div>

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

          {/* Students List */}
          <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Danh sách học viên
            </h5>
            
            {(() => {
              console.log('🔍 [EditClassModal] RENDER - classStudents:', classStudents);
              console.log('🔍 [EditClassModal] RENDER - classStudents.length:', classStudents.length);
              console.log('🔍 [EditClassModal] RENDER - classStudents isArray:', Array.isArray(classStudents));
              if (classStudents.length > 0) {
                console.log('🔍 [EditClassModal] RENDER - First student:', classStudents[0]);
              }
              return null;
            })()}
            
            {classStudents.length === 0 ? (
              <div className="text-center text-neutral-500 py-20">
                <i className="fas fa-users me-2"></i>
                Lớp học chưa có học viên nào
              </div>
            ) : (
              <div 
                className="border border-neutral-100 rounded-12 p-16"
                style={{ maxHeight: '300px', overflowY: 'auto' }}
              >
                <div className="d-flex flex-column gap-8">
                  {classStudents.map((student, index) => {
                    console.log(`🔍 [EditClassModal] RENDER - Mapping student ${index}:`, student);
                    const studentId = student._id || student.id;
                    const displayName = student.fullName || student.name || student.username || student.email || 'N/A';
                    const email = student.email || 'N/A';
                    const username = student.username || 'N/A';
                    const phone = student.phone || 'N/A';
                    
                    console.log(`🔍 [EditClassModal] RENDER - Student ${index} processed:`, {
                      studentId,
                      displayName,
                      email,
                      username,
                      phone
                    });
                    
                    return (
                      <div
                        key={studentId || index}
                        className="d-flex align-items-center p-12 rounded-8 border border-neutral-100 bg-white"
                      >
                        <div className="d-flex align-items-center justify-content-center bg-main-100 text-main-600 rounded-circle me-12" 
                             style={{ width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold' }}>
                          {index + 1}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium text-neutral-900 text-14">
                            {displayName}
                          </div>
                          <div className="text-neutral-500 text-12">
                            {email} {username && `• ${username}`} {phone && phone !== 'N/A' && `• ${phone}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <Form.Text className="text-neutral-500 text-12 mt-8">
              <i className="fas fa-info-circle me-1"></i>
              Tổng số học viên: {classStudents.length}
            </Form.Text>
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
