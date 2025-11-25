import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useParams, Link, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import teacherService from '../../../services/teacherService';

// Import tab components
import ClassOverview from './ClassOverview';
import ClassStudents from './ClassStudents';
import ClassLessons from './ClassLessons';
import ClassMaterials from './ClassMaterials';
import ClassAssignments from './ClassAssignments';

// Import modals
import MaterialModal from './modals/MaterialModal';
import AssignmentDetailModal from './modals/AssignmentDetailModal';
import GradingModal from './modals/GradingModal';
import AddHomeworkModal from './modals/AddHomeworkModal';
import StudentDetailModal from './modals/StudentDetailModal';

/**
 * Teacher Class Detail Layout Component
 * Chứa navigation và routing cho các tab chi tiết lớp học
 */
const TeacherClassDetailLayout = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeComment, setGradeComment] = useState('');
  const [showAddHomeworkModal, setShowAddHomeworkModal] = useState(false);
  const [homeworkFormData, setHomeworkFormData] = useState({
    lessonId: '',
    title: '',
    deadline: '',
    assignmentFiles: [],
    answerFiles: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({ assignment: false, answer: false });
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/students')) return 'students';
    if (path.includes('/lessons')) return 'lessons';
    if (path.includes('/materials')) return 'materials';
    if (path.includes('/assignments')) return 'assignments';
    return 'overview';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    fetchClassDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherService.getMyClassDetail(classId);
      
      if (response.success) {
        setClassInfo(response.data.classInfo);
        setStudents(response.data.students || []);
        setMaterials(response.data.materials || []);
        setAssignments(response.data.assignments || []);
        setLessons(response.data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      setError(error.message || 'Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  // Fetch only assignments - for refreshing after CRUD operations
  const fetchAssignments = async () => {
    try {
      const response = await teacherService.getMyClassDetail(classId);
      if (response.success) {
        setAssignments(response.data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  // Fetch only students - for refreshing after updating mocktest scores
  const fetchStudents = async () => {
    try {
      const response = await teacherService.getMyClassDetail(classId);
      if (response.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      document: 'fa-file-pdf',
      audio: 'fa-file-audio',
      video: 'fa-file-video',
      presentation: 'fa-file-powerpoint'
    };
    return icons[type] || 'fa-file';
  };

  const getFileIconColor = (type) => {
    const colors = {
      document: 'text-danger-600',
      audio: 'text-success-600',
      video: 'text-warning-600',
      presentation: 'text-main-600'
    };
    return colors[type] || 'text-neutral-600';
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

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setEditingAssignment(assignment);
    setShowAssignmentDetail(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeScore(submission.score || '');
    setGradeComment('');
    setShowGradingModal(true);
  };

  const handleSaveGrade = async () => {
    try {
      console.log('Saving grade:', {
        submissionId: selectedSubmission.studentId,
        score: gradeScore,
        comment: gradeComment
      });
      setShowGradingModal(false);
      setGradeScore('');
      setGradeComment('');
      // Refresh assignments to update grading statistics
      await fetchAssignments();
    } catch (error) {
      console.error('Error saving grade:', error);
    }
  };

  const handleDownloadSubmission = (submission) => {
    console.log('Downloading submission for:', submission.studentName);
  };

  const handleDownloadAllSubmissions = () => {
    console.log('Downloading all submissions for assignment:', selectedAssignment.title);
  };

  const handleAddHomeworkClick = () => {
    const availableLesson = lessons.length > 0 ? lessons[0] : null;
    setHomeworkFormData({
      lessonId: availableLesson?._id || '',
      lessonTitle: '',
      title: '',
      deadline: '',
      assignmentFiles: [],
      answerFiles: []
    });
    setEditingAssignment(null);
    setShowAddHomeworkModal(true);
  };

  const handleUpdateAssignmentFile = async (field) => {
    if (!editingAssignment) return;
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
    fileInput.multiple = true;
    
    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      try {
        setUploadingFiles(prev => ({ ...prev, [field]: true }));
        
        const formData = new FormData();
        files.forEach(file => {
          formData.append(field === 'assignment' ? 'assignmentFile' : 'answerFile', file);
        });
        
        await teacherService.updateHomework(
          editingAssignment.classScheduleId,
          editingAssignment._id,
          formData
        );
        
        alert(`Thêm ${files.length} file thành công!`);
        fetchAssignments();
        
      } catch (error) {
        console.error('Error uploading files:', error);
        alert(error.message || 'Có lỗi xảy ra khi tải file');
      } finally {
        setUploadingFiles(prev => ({ ...prev, [field]: false }));
      }
    };
    
    fileInput.click();
  };

  const handleDeleteAssignmentFile = async (field, fileToDelete) => {
    if (!editingAssignment) return;
    
    const fileName = fileToDelete.split('/').pop();
    if (!confirm(`Bạn có chắc muốn xóa file "${fileName}"?`)) {
      return;
    }
    
    try {
      setUploadingFiles(prev => ({ ...prev, [field]: true }));
      
      const formData = new FormData();
      formData.append(field === 'assignment' ? 'deleteAssignmentFile' : 'deleteAnswerFile', fileToDelete);
      
      await teacherService.updateHomework(
        editingAssignment.classScheduleId,
        editingAssignment._id,
        formData
      );
      
      alert('Xóa file thành công!');
      fetchAssignments();
      
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleHomeworkFormChange = (field, value) => {
    setHomeworkFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHomeworkFileChange = (field, files) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setHomeworkFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), ...fileArray]
      }));
    }
  };

  const handleRemoveFileFromForm = (field, index) => {
    setHomeworkFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmitHomework = async () => {
    try {
      setSubmitting(true);
      
      if (!homeworkFormData.lessonId) {
        alert('Vui lòng chọn buổi học');
        return;
      }
      if (!homeworkFormData.title || !homeworkFormData.deadline) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
      }

      const formData = new FormData();
      formData.append('title', homeworkFormData.title);
      formData.append('deadline', homeworkFormData.deadline);
      
      if (homeworkFormData.assignmentFiles && homeworkFormData.assignmentFiles.length > 0) {
        homeworkFormData.assignmentFiles.forEach(file => {
          formData.append('assignmentFile', file);
        });
      }
      
      if (homeworkFormData.answerFiles && homeworkFormData.answerFiles.length > 0) {
        homeworkFormData.answerFiles.forEach(file => {
          formData.append('answerFile', file);
        });
      }

      const result = await teacherService.addHomework(homeworkFormData.lessonId, formData);
      
      if (result.success) {
        alert('Thêm bài tập thành công!');
        setShowAddHomeworkModal(false);
        setHomeworkFormData({
          lessonId: '',
          title: '',
          deadline: '',
          assignmentFiles: [],
          answerFiles: []
        });
        await fetchAssignments();
      }
    } catch (error) {
      console.error('Error adding homework:', error);
      const errorMsg = error.message || error.error || 'Có lỗi xảy ra khi thêm bài tập';
      if (errorMsg.includes('insertMany') || errorMsg.includes('students')) {
        alert('Bài tập đã được tạo thành công!');
        setShowAddHomeworkModal(false);
        setHomeworkFormData({
          lessonId: '',
          title: '',
          deadline: '',
          assignmentFiles: [],
          answerFiles: []
        });
        await fetchAssignments();
      } else {
        alert(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHomework = async (assignment) => {
    if (!confirm(`Bạn có chắc muốn xóa bài tập "${assignment.title}"?\n\nLưu ý: Tất cả bài nộp của học viên cũng sẽ bị xóa.`)) {
      return;
    }

    try {
      const scheduleId = assignment.classScheduleId || assignment.scheduleId;
      if (!scheduleId) {
        throw new Error('Không tìm thấy ID buổi học');
      }
      
      await teacherService.deleteHomework(scheduleId, assignment._id);
      alert('Xóa bài tập thành công!');
      
      if (showAssignmentDetail) {
        setShowAssignmentDetail(false);
        setSelectedAssignment(null);
      }
      
      await fetchAssignments();
    } catch (error) {
      console.error('Error deleting homework:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa bài tập');
    }
  };

  const handleTabSelect = (tab) => {
    navigate(`/teacher/classes/${classId}/${tab}`);
  };

  const handleViewStudentDetail = (student) => {
    setSelectedStudent(student);
    setShowStudentDetail(true);
  };

  const handleUpdateMocktestScore = async (studentId, scheduleId, scores) => {
    try {
      console.log('📤 API Request - Update Mocktest Score:', {
        studentId,
        scheduleId,
        scores,
        apiUrl: `/api/teachers/me/mocktest/${scheduleId}/student/${studentId}`
      });
      
      if (!scheduleId) {
        throw new Error('Không tìm thấy buổi học mocktest');
      }

      const response = await teacherService.updateMocktestScore(
        scheduleId,
        studentId,
        scores
      );
      
      console.log('📥 API Response:', response);

      alert('Cập nhật điểm thành công!');
      // Refresh students list to update table and modal
      await fetchStudents();
      
      // Update selected student in modal with new data
      if (selectedStudent) {
        const response = await teacherService.getMyClassDetail(classId);
        if (response.success) {
          const updatedStudent = response.data.students.find(
            s => (s.id || s._id) === (selectedStudent.id || selectedStudent._id)
          );
          if (updatedStudent) {
            setSelectedStudent(updatedStudent);
          }
        }
      }
    } catch (error) {
      console.error('Error updating mocktest score:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật điểm');
    }
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
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={fetchClassDetails}>
              <i className="fas fa-redo me-2"></i>
              Thử lại
            </Button>
            <Link to="/teacher/classes">
              <Button variant="outline-secondary">
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại danh sách
              </Button>
            </Link>
          </div>
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
            <Link to="/teacher/classes">
              <Button variant="primary">
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại danh sách
              </Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Breadcrumb */}
      <div className="mb-16">
        <Link to="/teacher/classes" className="text-neutral-600 text-13 text-decoration-none">
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách lớp
        </Link>
      </div>

      {/* Class Header */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24"
            style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)' }}>
        <Card.Body className="p-24">
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex align-items-center gap-12 mb-12">
                <h4 className="text-white fw-bold mb-0">{classInfo.name}</h4>
                <Badge className="bg-white text-main-600 px-12 py-6">{classInfo.level}</Badge>
              </div>
              <div className="text-white mb-12" style={{ opacity: 0.95 }}>
                <i className="fas fa-book me-2"></i>
                {classInfo.subject}
              </div>
              <div className="text-white d-flex gap-20" style={{ opacity: 0.9 }}>
                <span><i className="fas fa-calendar me-2"></i>{classInfo.schedule}</span>
                <span><i className="fas fa-door-open me-2"></i>{classInfo.room}</span>
                <span><i className="fas fa-users me-2"></i>{classInfo.activeStudents}/{classInfo.totalStudents} học viên</span>
              </div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="text-white mb-8" style={{ opacity: 0.8 }}>Buổi tiếp theo</div>
              <div className="text-white fw-bold text-18 mb-4">
                {new Date(classInfo.nextLesson.date).toLocaleDateString('vi-VN')}
              </div>
              <div className="text-white" style={{ opacity: 0.9 }}>
                {classInfo.nextLesson.time} - {classInfo.nextLesson.topic}
              </div>
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
                  <i className="fas fa-chart-line me-2"></i>
                  Tổng quan
                </span>
              }
            >
              <ClassOverview 
                classInfo={classInfo}
                assignments={assignments}
                materials={materials}
                setShowMaterialModal={setShowMaterialModal}
              />
            </Tab>

            <Tab 
              eventKey="students" 
              title={
                <span className="px-8">
                  <i className="fas fa-users me-2"></i>
                  Học viên
                </span>
              }
            >
              <ClassStudents 
                students={students}
                onViewStudentDetail={handleViewStudentDetail}
              />
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
              <ClassLessons 
                lessons={lessons} 
                getLessonStatusBadge={getLessonStatusBadge}
              />
            </Tab>

            <Tab 
              eventKey="materials" 
              title={
                <span className="px-8">
                  <i className="fas fa-folder-open me-2"></i>
                  Tài liệu ({materials.length})
                </span>
              }
            >
              <ClassMaterials 
                materials={materials}
                setShowMaterialModal={setShowMaterialModal}
                getFileIcon={getFileIcon}
                getFileIconColor={getFileIconColor}
              />
            </Tab>

            <Tab 
              eventKey="assignments" 
              title={
                <span className="px-8">
                  <i className="fas fa-tasks me-2"></i>
                  Bài tập ({assignments.length})
                </span>
              }
            >
              <ClassAssignments 
                assignments={assignments}
                handleViewAssignment={handleViewAssignment}
                handleDeleteHomework={handleDeleteHomework}
                handleAddHomeworkClick={handleAddHomeworkClick}
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Modals */}
      <MaterialModal 
        show={showMaterialModal}
        onHide={() => setShowMaterialModal(false)}
      />

      <AssignmentDetailModal 
        show={showAssignmentDetail}
        onHide={() => setShowAssignmentDetail(false)}
        assignment={selectedAssignment}
        handleUpdateAssignmentFile={handleUpdateAssignmentFile}
        handleDeleteAssignmentFile={handleDeleteAssignmentFile}
        handleDeleteHomework={handleDeleteHomework}
        handleGradeSubmission={handleGradeSubmission}
        handleDownloadSubmission={handleDownloadSubmission}
        handleDownloadAllSubmissions={handleDownloadAllSubmissions}
        uploadingFiles={uploadingFiles}
      />

      <GradingModal 
        show={showGradingModal}
        onHide={() => setShowGradingModal(false)}
        submission={selectedSubmission}
        gradeScore={gradeScore}
        setGradeScore={setGradeScore}
        gradeComment={gradeComment}
        setGradeComment={setGradeComment}
        handleSaveGrade={handleSaveGrade}
      />

      <AddHomeworkModal 
        show={showAddHomeworkModal}
        onHide={() => setShowAddHomeworkModal(false)}
        lessons={lessons}
        homeworkFormData={homeworkFormData}
        handleHomeworkFormChange={handleHomeworkFormChange}
        handleHomeworkFileChange={handleHomeworkFileChange}
        handleRemoveFileFromForm={handleRemoveFileFromForm}
        handleSubmitHomework={handleSubmitHomework}
        submitting={submitting}
      />

      <StudentDetailModal 
        show={showStudentDetail}
        onHide={() => setShowStudentDetail(false)}
        student={selectedStudent}
        lessons={lessons}
        onUpdateMocktestScore={handleUpdateMocktestScore}
      />
    </Container>
  );
};

export default TeacherClassDetailLayout;
