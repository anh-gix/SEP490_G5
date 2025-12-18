import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Tabs, Tab, Button } from 'react-bootstrap';
import classService from '../../services/classService';

// Import tab components
import ClassOverview from '../student_components/class_detail/ClassOverview';
import ClassStudents from '../teacher_components/class_detail/ClassStudents';
import AcademicClassLessons from './AcademicClassLessons';
import AcademicLessonDetail from './AcademicLessonDetail';

/**
 * Class Detail Component
 * Layout cho chi tiết lớp học của Academic Staff với 3 tabs:
 * - Tổng quan (từ student)
 * - Học viên (từ teacher)
 * - Lịch trình (từ teacher)
 * @param {string} classId - ID của lớp học (từ props thay vì route params)
 * @param {function} onBack - Callback để quay lại danh sách
 */
const ClassDetail = ({ classId, onBack }) => {
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLessonDetail, setShowLessonDetail] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await classService.getClassById(classId);
      
      if (response.success && response.class) {
        const classData = response.class;
        
        // Transform class info for ClassOverview (student format)
        const transformedClassInfo = {
          _id: classData._id,
          name: classData.name,
          course: {
            name: classData.courseName || classData.course?.name,
            description: classData.course?.description || 'Chưa có mô tả khóa học'
          },
          teacher: {
            username: classData.teacherName || classData.teacher?.username,
            email: classData.teacher?.email
          },
          room: {
            room_name: classData.roomName || classData.room?.room_name
          },
          startDate: classData.startDate,
          endDate: classData.endDate,
          schedulePattern: classData.schedule || 'Đang cập nhật',
          totalLessons: classData.totalSchedules || 0,
          completedLessons: classData.completedSchedules || 0
        };
        
        setClassInfo(transformedClassInfo);
        
        // Transform students for ClassStudents (teacher format)
        const transformedStudents = (classData.students || []).map((student, index) => {
          // Get mocktest scores if available
          const mocktestScores = student.mocktestScores || {};
          const mocktestSessionOrders = student.mocktestSessionOrders || [];
          
          return {
            id: student._id,
            _id: student._id,
            name: student.username || student.name || 'N/A',
            email: student.email || 'N/A',
            attendanceRate: student.attendance || 0,
            attendanceCount: student.attendanceCount || 0,
            totalLessons: classData.totalSchedules || 0,
            homeworkCompletionRate: student.homeworkCompletionRate || 0,
            submittedAssignments: student.submittedAssignments || 0,
            totalAssignments: student.totalAssignments || 0,
            mocktestScores: mocktestScores,
            mocktestSessionOrders: mocktestSessionOrders
          };
        });
        
        setStudents(transformedStudents);
        
        // Transform schedules to lessons format for ClassLessons (teacher format)
        const now = new Date();
        const transformedLessons = (classData.schedules || []).map((schedule, index) => {
          const scheduleDate = new Date(schedule.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const scheduleDateOnly = new Date(scheduleDate);
          scheduleDateOnly.setHours(0, 0, 0, 0);
          
          const isPast = scheduleDateOnly < today;
          const isToday = scheduleDateOnly.getTime() === today.getTime();
          
          // Determine status
          let status = 'scheduled';
          if (schedule.status === 'completed' || isPast) {
            status = 'completed';
          } else if (isToday || (scheduleDateOnly > today && scheduleDateOnly <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000))) {
            status = 'upcoming';
          }
          
          // Get attendance count - check if schedule has attendance data
          // If not available in schedule, we'll need to calculate from student schedules
          let attendanceCount = 0;
          let hasAttendance = false;
          
          if (schedule.attendanceCount !== undefined) {
            attendanceCount = schedule.attendanceCount;
            hasAttendance = attendanceCount > 0;
          } else if (schedule.hasAttendance !== undefined) {
            hasAttendance = schedule.hasAttendance;
            // If hasAttendance is true but no count, estimate from status
            if (hasAttendance && status === 'completed') {
              attendanceCount = Math.floor(transformedStudents.length * 0.8); // Estimate
            }
          }
          
          const totalStudents = transformedStudents.length;
          
          return {
            _id: schedule._id,
            lessonNumber: index + 1,
            date: schedule.date,
            time: schedule.startTime ? `${schedule.startTime} - ${schedule.endTime || ''}` : 'N/A',
            topic: schedule.session?.title || schedule.topic || 'Chưa có chủ đề',
            status: status,
            hasAttendance: hasAttendance,
            attendanceCount: attendanceCount,
            totalStudents: totalStudents
          };
        });
        
        setLessons(transformedLessons);
      } else {
        setError('Không tìm thấy thông tin lớp học');
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      setError(error.message || 'Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  const getLessonStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-success-600', text: 'Đã học' },
      upcoming: { bg: 'bg-warning-600', text: 'Sắp diễn ra' },
      scheduled: { bg: 'bg-neutral-400', text: 'Đã lên lịch' }
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    return <Badge className={`${config.bg} text-white px-10 py-4 text-11`}>{config.text}</Badge>;
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  const handleLessonClick = (lessonId) => {
    setSelectedLessonId(lessonId);
    setShowLessonDetail(true);
  };

  // Loading state
  if (loading) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-neutral-600 mt-3">Đang tải chi tiết lớp học...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
        <Alert variant="danger">
          <Alert.Heading>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Có lỗi xảy ra
          </Alert.Heading>
          <p>{error}</p>
          <hr />
          <Button variant="outline-secondary" onClick={onBack || (() => {})}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại danh sách
          </Button>
        </Alert>
      </Container>
    );
  }

  // Empty state
  if (!classInfo) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="text-center py-5">
            <i className="fas fa-inbox text-neutral-300" style={{ fontSize: '48px' }}></i>
            <h5 className="text-neutral-700 mt-3 mb-2">Không tìm thấy lớp học</h5>
            <p className="text-neutral-500 mb-3">Lớp học này không tồn tại hoặc bạn không có quyền truy cập</p>
            <Button variant="primary" onClick={onBack || (() => {})}>
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại danh sách
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Get next lesson info
  const nextLesson = lessons.find(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate > new Date() && lesson.status !== 'completed';
  });

  // Conditional rendering: nếu đang hiển thị lesson detail, render AcademicLessonDetail
  if (showLessonDetail && selectedLessonId) {
    return (
      <AcademicLessonDetail
        lessonId={selectedLessonId}
        onBack={() => {
          setShowLessonDetail(false);
          setSelectedLessonId(null);
        }}
      />
    );
  }

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Class Header */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24"
            style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)' }}>
        <Card.Body className="p-24">
          <Row className="align-items-center">
            <Col lg={8}>
              {/* Breadcrumb back to class list */}
              <div className="mb-16">
                <Button 
                  variant="link" 
                  onClick={onBack || (() => {})}
                  className="text-white text-13 text-decoration-none p-0"
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Quay lại danh sách lớp
                </Button>
              </div>
              <div className="d-flex align-items-center gap-12 mb-12">
                <h4 className="text-white fw-bold mb-0">{classInfo.name}</h4>
                <Badge className="bg-white text-main-600 px-12 py-6">
                  {classInfo.course?.name || 'Chưa có khóa học'}
                </Badge>
              </div>
              <div className="text-white d-flex gap-20" style={{ opacity: 0.9 }}>
                <span>
                  <i className="fas fa-calendar me-2"></i>
                  {classInfo.schedulePattern || 'Chưa có lịch'}
                </span>
                <span>
                  <i className="fas fa-door-open me-2"></i>
                  {classInfo.room?.room_name || 'Chưa có phòng'}
                </span>
                <span>
                  <i className="fas fa-users me-2"></i>
                  {students.length} học viên
                </span>
              </div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="text-white mb-8" style={{ opacity: 0.8 }}>Buổi tiếp theo</div>
              {nextLesson ? (
                <>
                  <div className="text-white fw-bold text-18 mb-4">
                    {new Date(nextLesson.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-white" style={{ opacity: 0.9 }}>
                    {nextLesson.time} - {nextLesson.topic}
                  </div>
                </>
              ) : (
                <div className="text-white" style={{ opacity: 0.7 }}>
                  <i className="fas fa-info-circle me-2"></i>
                  Chưa có lịch
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Navigation Tabs */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabSelect}
            className="border-bottom px-20"
          >
            <Tab 
              eventKey="overview" 
              title={
                <span className="px-8">
                  <i className="fas fa-home me-2"></i>
                  Tổng quan
                </span>
              }
            >
              <div className="p-24">
                <ClassOverview classInfo={classInfo} />
              </div>
            </Tab>

            <Tab 
              eventKey="students" 
              title={
                <span className="px-8">
                  <i className="fas fa-users me-2"></i>
                  Học viên ({students.length})
                </span>
              }
            >
              <div className="p-24">
                <ClassStudents 
                  students={students}
                  onViewStudentDetail={() => {}} // Disable modal for academic staff
                  hideActions={true} // Hide actions column for academic staff
                  hideImportMocktest={true} // Hide Import Mocktest button for academic staff
                />
              </div>
            </Tab>

            <Tab 
              eventKey="lessons" 
              title={
                <span className="px-8">
                  <i className="fas fa-calendar-week me-2"></i>
                  Lịch trình ({lessons.length} buổi)
                </span>
              }
            >
              <div className="p-24">
                <AcademicClassLessons 
                  lessons={lessons} 
                  getLessonStatusBadge={getLessonStatusBadge}
                  onLessonClick={handleLessonClick}
                />
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClassDetail;

