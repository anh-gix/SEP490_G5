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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-neutral-600">Đang tải danh sách bài tập...</p>
      </div>
    );
  }

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

      {/* Create Homework Modal */}
      <CreateHomeworkModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        classId={classId}
      />

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
    </div>
  );
};

export default ClassAssignments;
