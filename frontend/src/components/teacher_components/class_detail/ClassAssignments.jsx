<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Spinner } from 'react-bootstrap';
import homeworkService from '../../../services/homeworkService';
import CreateHomeworkModal from '../CreateHomeworkModal';
import AssignmentDetailModal from './modals/AssignmentDetailModal';

const ClassAssignments = ({ classId, onAssignmentUpdate }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({ assignment: false, answer: false });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await homeworkService.getTeacherAssignments();
      
      if (response.success) {
        // Filter assignments for this class only
        const classAssignments = response.assignments.filter(a => 
          a.classId?.toString() === classId?.toString() || 
          a.scheduleId // If scheduleId exists, we can use it
        );
        setAssignments(classAssignments);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleCreateSuccess = () => {
    fetchAssignments();
    if (onAssignmentUpdate) onAssignmentUpdate();
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      setLoading(true);
      const response = await homeworkService.getHomeworkSubmissions(
        assignment._id, 
        assignment.scheduleId
      );
      
      if (response.success) {
        // Transform data to match AssignmentDetailModal structure
        const transformedAssignment = {
          ...assignment,
          sessionTitle: assignment.lessonTitle,
          sessionOrder: assignment.lessonNumber,
          dueDate: assignment.deadline,
          total: assignment.totalStudents,
          submissionRate: assignment.totalStudents > 0 
            ? Math.round((assignment.submitted / assignment.totalStudents) * 100) 
            : 0,
          late: 0, // Calculate from submissions if needed
          notSubmitted: assignment.pending,
          files: assignment.assignmentFiles || [],
          answerFiles: assignment.answerFiles || [],
          submissions: (response.submissions || []).map(sub => ({
            studentId: sub.student?._id,
            studentName: sub.student?.username || sub.student?.email,
            submittedAt: sub.submittedAt,
            score: sub.score,
            status: sub.status,
            files: sub.submittedFiles || sub.files || []
          }))
        };
        
        setSelectedAssignment(transformedAssignment);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      alert('Không thể tải thông tin bài tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignmentFile = async (fileType) => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar';
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Max 5 files
      if (files.length > 5) {
        alert('Tối đa 5 files mỗi lần upload');
        return;
      }

      try {
        setUploadingFiles(prev => ({ ...prev, [fileType]: true }));
        
        const newAssignmentFiles = fileType === 'assignment' ? files : [];
        const newAnswerFiles = fileType === 'answer' ? files : [];
        
        const response = await homeworkService.updateHomework(
          selectedAssignment.scheduleId,
          selectedAssignment._id,
          {}, // No title/deadline changes
          newAssignmentFiles,
          newAnswerFiles,
          [], // No files to delete
          []
        );

        if (response.success) {
          // Refresh the assignment detail
          await handleViewSubmissions(selectedAssignment);
          alert('Thêm file thành công!');
        }
      } catch (err) {
        console.error('Error uploading files:', err);
        alert('Không thể upload file. Vui lòng thử lại.');
      } finally {
        setUploadingFiles(prev => ({ ...prev, [fileType]: false }));
      }
    };

    input.click();
  };

  const handleDeleteAssignmentFile = async (fileType, file) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
      return;
    }

    try {
      setUploadingFiles(prev => ({ ...prev, [fileType]: true }));
      
      const deleteAssignmentFiles = fileType === 'assignment' ? [file] : [];
      const deleteAnswerFiles = fileType === 'answer' ? [file] : [];
      
      const response = await homeworkService.updateHomework(
        selectedAssignment.scheduleId,
        selectedAssignment._id,
        {}, // No title/deadline changes
        [], // No new files
        [],
        deleteAssignmentFiles,
        deleteAnswerFiles
      );

      if (response.success) {
        // Refresh the assignment detail
        await handleViewSubmissions(selectedAssignment);
        alert('Xóa file thành công!');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Không thể xóa file. Vui lòng thử lại.');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fileType]: false }));
    }
  };

  const handleDeleteClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };

  const handleDeleteHomework = async (assignment) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${assignment.title}"?`)) {
      return;
    }

    try {
      await homeworkService.deleteHomework(
        assignment.scheduleId, 
        assignment._id
      );
      
      setShowDetailModal(false);
      setSelectedAssignment(null);
      fetchAssignments();
      if (onAssignmentUpdate) onAssignmentUpdate();
    } catch (err) {
      console.error('Error deleting homework:', err);
      alert('Không thể xóa bài tập. Vui lòng thử lại.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAssignment) return;

    try {
      await homeworkService.deleteHomework(
        selectedAssignment.scheduleId, 
        selectedAssignment._id
      );
      
      setShowDeleteModal(false);
      setSelectedAssignment(null);
      fetchAssignments();
      if (onAssignmentUpdate) onAssignmentUpdate();
    } catch (err) {
      console.error('Error deleting homework:', err);
      alert('Không thể xóa bài tập. Vui lòng thử lại.');
    }
  };

  const handleDownloadSubmission = (submission) => {
    if (!submission.files || submission.files.length === 0) {
      alert('Học viên chưa nộp file nào');
      return;
    }

    // Download all files from this submission
    submission.files.forEach((fileUrl, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileUrl.split('/').pop();
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200); // Delay to avoid browser blocking multiple downloads
    });
  };

  const handleDownloadAllSubmissions = () => {
    if (!selectedAssignment || !selectedAssignment.submissions) {
      alert('Không có bài nộp nào');
      return;
    }

    const submittedFiles = selectedAssignment.submissions.filter(
      sub => sub.files && sub.files.length > 0
    );

    if (submittedFiles.length === 0) {
      alert('Không có file nào để tải');
      return;
    }

    let fileIndex = 0;
    submittedFiles.forEach((submission) => {
      submission.files.forEach((fileUrl) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = `${submission.studentName}_${fileUrl.split('/').pop()}`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, fileIndex * 200);
        fileIndex++;
      });
    });

    alert(`Đang tải ${fileIndex} file từ ${submittedFiles.length} học viên...`);
=======
import React, { useState } from 'react';
import { Button, Badge, Spinner } from 'react-bootstrap';
// import homeworkService from '../../../services/homeworkService';
import CreateHomeworkModal from './modals/CreateHomeworkModal';
import AssignmentDetail from './AssignmentDetail';

const ClassAssignments = ({ classId, lessons = [], onAssignmentUpdate }) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState('by-lesson'); // 'by-lesson', 'upcoming'

  // Extract assignments from lessons data (already filtered by class from parent)
  const assignments = lessons
    .filter(lesson => lesson.homework && lesson.homework.length > 0)
    .flatMap(lesson => 
      lesson.homework.map(hw => ({
        _id: hw._id,
        classScheduleId: lesson._id,
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.topic,
        lessonDate: lesson.date,
        sessionOrder: lesson.sessionOrder,
        title: hw.assignment?.title || hw.title,
        assignmentFiles: hw.assignment?.files || [],
        answerFiles: hw.answerFiles || [],
        deadline: hw.deadline,
        totalStudents: lesson.totalStudents || 0,
        submitted: hw.submitted || 0,
        pending: (lesson.totalStudents || 0) - (hw.submitted || 0)
      }))
    );

  const handleCreateSuccess = () => {
    // Refresh parent to get updated lessons with new homework
    if (onAssignmentUpdate) onAssignmentUpdate();
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignmentId(assignment._id);
    setShowAssignmentDetail(true);
>>>>>>> origin/Namvv-teacher-class-management
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    
    if (assignment.submitted === assignment.totalStudents) {
      return <Badge bg="success">Đã nộp đủ</Badge>;
    }
    if (now > deadline) {
      return <Badge bg="danger">Quá hạn</Badge>;
    }
    return <Badge bg="primary">Đang mở</Badge>;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

<<<<<<< HEAD
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-neutral-600">Đang tải danh sách bài tập...</p>
      </div>
    );
  }

=======
  // Show AssignmentDetail if an assignment is selected
  if (showAssignmentDetail && selectedAssignmentId) {
    return (
      <AssignmentDetail 
        assignmentId={selectedAssignmentId}
        onBack={() => {
          setShowAssignmentDetail(false);
          setSelectedAssignmentId(null);
          // Refresh parent to get updated homework stats
          if (onAssignmentUpdate) onAssignmentUpdate();
        }}
        onDelete={() => {
          setShowAssignmentDetail(false);
          setSelectedAssignmentId(null);
          // Refresh parent when assignment deleted
          if (onAssignmentUpdate) onAssignmentUpdate();
        }}
      />
    );
  }

  // Group assignments by lesson
  const groupAssignmentsByLesson = (assignmentsList) => {
    const grouped = {};
    assignmentsList.forEach(assignment => {
      const key = `${assignment.lessonNumber || 0}-${assignment.lessonTitle || 'Không xác định'}`;
      if (!grouped[key]) {
        grouped[key] = {
          lessonNumber: assignment.lessonNumber || 0,
          lessonTitle: assignment.lessonTitle || 'Không xác định',
          assignments: []
        };
      }
      grouped[key].assignments.push(assignment);
    });
    return Object.values(grouped).sort((a, b) => (b.lessonNumber || 0) - (a.lessonNumber || 0));
  };

  // Filter and sort assignments
  const getFilteredAssignments = () => {
    let filtered = [...assignments];
    
    if (filterType === 'upcoming') {
      // Lọc bài tập sắp đến hạn (trong vòng 3 ngày) và chưa nộp đủ
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      filtered = filtered.filter(assignment => {
        const deadline = new Date(assignment.deadline);
        return assignment.submitted < assignment.totalStudents && deadline <= threeDaysFromNow && deadline > new Date();
      });
    }
    
    if (filterType === 'by-lesson') {
      // Sắp xếp theo buổi học (lessonNumber)
      filtered.sort((a, b) => (b.lessonNumber || 0) - (a.lessonNumber || 0));
    } else {
      // Mặc định sắp xếp theo deadline gần nhất
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    
    return filtered;
  };

  const renderAssignmentCard = (assignment) => {
    const isDeadlinePassed = new Date() > new Date(assignment.deadline);
    const submissionRate = assignment.totalStudents > 0 
      ? Math.round((assignment.submitted / assignment.totalStudents) * 100) 
      : 0;
    
    return (
      <div 
        key={assignment._id}
        className="bg-white border-0 rounded-12 p-16 transition-all"
        style={{ 
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.12)';
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.backgroundColor = '#ffffff';
        }}
        onClick={() => handleViewSubmissions(assignment)}
      >
        <div className="d-flex justify-content-between align-items-center">
          {/* Left: Title and File Info */}
          <div className="flex-grow-1 me-4">
            <h6 className="text-neutral-900 fw-bold mb-2 text-15">{assignment.title}</h6>
            <div className="d-flex gap-3 align-items-center">
              {assignment.assignmentFiles && assignment.assignmentFiles.length > 0 && (
                <div className="text-main-600 text-11">
                  <i className="fas fa-file-download me-1"></i>
                  {assignment.assignmentFiles.length} file đề bài
                </div>
              )}
              {assignment.answerFiles && assignment.answerFiles.length > 0 && (
                <div className="text-success-600 text-11">
                  <i className="fas fa-file-check me-1"></i>
                  {assignment.answerFiles.length} file đáp án
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Deadline, Stats, Delete Button */}
          <div className="d-flex align-items-center gap-4 flex-shrink-0">
            {/* Deadline */}
            <div className={`text-15 fw-medium ${isDeadlinePassed ? 'text-danger-600' : 'text-neutral-700'}`}>
              <i className="fas fa-clock me-2"></i>
              {new Date(assignment.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {formatDate(assignment.deadline)}
            </div>

            {/* Status and Stats */}
            <div className="d-flex flex-column align-items-end gap-1">
              {getStatusBadge(assignment)}
              <div className="d-flex gap-2 align-items-center">
                <Badge bg="success" className="px-8 py-4 text-10">
                  <i className="fas fa-check me-1"></i>
                  Đã nộp: {assignment.submitted}/{assignment.totalStudents} ({submissionRate}%)
                </Badge>
                {assignment.pending > 0 && (
                  <Badge bg="secondary" className="px-8 py-4 text-10">
                    Chưa nộp: {assignment.pending}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

>>>>>>> origin/Namvv-teacher-class-management
  return (
    <div className="p-0">
      {/* Header */}
      <div className="p-20 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-1">Bài tập của lớp</h6>
          <p className="text-neutral-500 text-sm mb-0">
            Tổng số: {assignments.length} bài tập
          </p>
        </div>
        <Button 
          className="btn-main px-16 py-8 radius-8"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Giao bài tập mới
        </Button>
      </div>

<<<<<<< HEAD
      {/* Assignments Table */}
      {assignments.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-clipboard-list text-neutral-300 mb-3" style={{ fontSize: '48px' }}></i>
          <p className="text-neutral-500">Chưa có bài tập nào</p>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Giao bài tập đầu tiên
          </Button>
        </div>
      ) : (
        <Table hover className="mb-0">
          <thead>
            <tr className="bg-neutral-25">
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Bài tập</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Hạn nộp</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Đã nộp</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Chưa nộp</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => {
              const submissionRate = assignment.totalStudents > 0 
                ? Math.round((assignment.submitted / assignment.totalStudents) * 100) 
                : 0;
              
              return (
                <tr key={assignment._id}>
                  <td className="px-20 py-16">
                    <div className="text-neutral-900 fw-semibold text-14">{assignment.title}</div>
                    {assignment.assignmentFiles && assignment.assignmentFiles.length > 0 && (
                      <div className="text-main-600 text-11 mt-1">
                        <i className="fas fa-file-download me-1"></i>
                        {assignment.assignmentFiles.length} file đề bài
                      </div>
                    )}
                    {assignment.answerFiles && assignment.answerFiles.length > 0 && (
                      <div className="text-success-600 text-11">
                        <i className="fas fa-file-check me-1"></i>
                        {assignment.answerFiles.length} file đáp án
                      </div>
                    )}
                  </td>
                  <td className="px-20 py-16">
                    <div className="text-neutral-700 text-13">
                      {formatDate(assignment.deadline)}
                    </div>
                    <div className="text-neutral-500 text-11">
                      {new Date(assignment.deadline).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-20 py-16 text-center">
                    <div className="text-success-600 fw-semibold text-14">
                      {assignment.submitted}/{assignment.totalStudents}
                    </div>
                    <div className="text-neutral-500 text-11">
                      {submissionRate}%
                    </div>
                  </td>
                  <td className="px-20 py-16 text-center">
                    {assignment.pending > 0 ? (
                      <span className="text-danger-600 fw-medium text-13">
                        {assignment.pending}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-13">0</span>
                    )}
                  </td>
                  <td className="px-20 py-16">
                    {getStatusBadge(assignment)}
                  </td>
                  <td className="px-20 py-16 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Button 
                        size="sm"
                        variant="outline-primary"
                        className="text-12 px-12 py-6 radius-6"
                        onClick={() => handleViewSubmissions(assignment)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        Chi tiết
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline-danger"
                        className="text-12 px-12 py-6 radius-6"
                        onClick={() => handleDeleteClick(assignment)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
=======
      {/* Content Container - 70% width, centered */}
      <div className="p-24">
        {/* Filter Buttons */}
        <div className="d-flex gap-2 mb-20">
          <Button
            variant={filterType === 'by-lesson' ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setFilterType('by-lesson')}
            className="px-16 py-8 text-13"
          >
            <i className="fas fa-book-reader me-2"></i>
            Theo buổi học
          </Button>
          <Button
            variant={filterType === 'upcoming' ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setFilterType('upcoming')}
            className="px-16 py-8 text-13"
          >
            <i className="fas fa-clock me-2"></i>
            Sắp đến hạn
          </Button>
        </div>

        <div className="d-flex justify-content-center">
          <div style={{ width: '70%', minWidth: '700px' }}>
            {getFilteredAssignments().length === 0 ? (
              <div className="bg-white border-0 rounded-12 text-center py-60" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
                <i className="fas fa-clipboard-list text-neutral-300 mb-3" style={{ fontSize: '48px' }}></i>
                <p className="text-neutral-500 mb-0">
                  {filterType === 'upcoming' ? 'Không có bài tập sắp đến hạn' : 'Chưa có bài tập nào'}
                </p>
                <p className="text-neutral-400 text-13 mt-2 mb-3">
                  {filterType === 'upcoming' ? 'Các bài tập trong vòng 3 ngày tới sẽ hiển thị ở đây' : 'Bắt đầu giao bài tập cho học viên'}
                </p>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Giao bài tập đầu tiên
                </Button>
              </div>
            ) : (
              filterType === 'by-lesson' ? (
                // Grouped by lesson view
                <div className="d-flex flex-column gap-4 mt-10 mb-10">
                  {groupAssignmentsByLesson(getFilteredAssignments()).map(group => (
                    <div key={`lesson-${group.lessonNumber}`} className="mt-14 mb-14">
                      <h6 className="text-neutral-700 fw-bold mb-12 text-15">
                        <i className="fas fa-book-reader me-2 text-primary-600"></i>
                        {group.lessonTitle}
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        {group.assignments.map(assignment => renderAssignmentCard(assignment))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Regular list view for upcoming
                <div className="d-flex flex-column gap-3 mt-10 mb-10">
                  {getFilteredAssignments().map(assignment => (
                    <div key={assignment._id}>
                      <div className="text-neutral-600 fw-semibold mb-8 text-13">
                        <i className="fas fa-book-reader me-2"></i>
                        {assignment.lessonTitle || 'Không xác định'}
                      </div>
                      {renderAssignmentCard(assignment)}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
>>>>>>> origin/Namvv-teacher-class-management

      {/* Create Homework Modal */}
      <CreateHomeworkModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        classId={classId}
      />
<<<<<<< HEAD

      {/* Assignment Detail Modal */}
      <AssignmentDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        assignment={selectedAssignment}
        handleUpdateAssignmentFile={handleUpdateAssignmentFile}
        handleDeleteAssignmentFile={handleDeleteAssignmentFile}
        handleDeleteHomework={handleDeleteHomework}
        handleDownloadSubmission={handleDownloadSubmission}
        handleDownloadAllSubmissions={handleDownloadAllSubmissions}
        uploadingFiles={uploadingFiles}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle text-danger me-2"></i>
            Xác nhận xóa
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Bạn có chắc chắn muốn xóa bài tập <strong>"{selectedAssignment?.title}"</strong>?
          </p>
          <p className="text-danger text-sm mt-2 mb-0">
            <i className="fas fa-info-circle me-1"></i>
            Hành động này không thể hoàn tác và sẽ xóa tất cả bài nộp của học viên.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            <i className="fas fa-trash me-2"></i>
            Xóa bài tập
          </Button>
        </Modal.Footer>
      </Modal>
=======
>>>>>>> origin/Namvv-teacher-class-management
    </div>
  );
};

export default ClassAssignments;
