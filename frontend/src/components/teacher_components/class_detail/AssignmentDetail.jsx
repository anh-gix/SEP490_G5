import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Table, Badge, Spinner, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import homeworkService from '../../../services/homeworkService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AssignmentDetail = ({ assignmentId, onBack, onDelete }) => {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState({ assignment: false, answer: false });
  const [editingFiles, setEditingFiles] = useState({ assignment: false, answer: false });
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchAssignmentDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const fetchAssignmentDetail = async () => {
    try {
      setLoading(true);
      
      // Get assignment from teacher assignments list
      const assignmentsResponse = await homeworkService.getTeacherAssignments();
      
      if (assignmentsResponse.success) {
        const foundAssignment = assignmentsResponse.assignments.find(
          a => a._id === assignmentId
        );
        
        console.log('📋 Found Assignment:', foundAssignment); // Debug log
        
        if (!foundAssignment) {
          toast.error('Không tìm thấy bài tập');
          if (onBack) onBack();
          return;
        }

        // Get submissions
        const submissionsResponse = await homeworkService.getHomeworkSubmissions(
          foundAssignment._id,
          foundAssignment.scheduleId
        );

        if (submissionsResponse.success) {
          const transformedAssignment = {
            ...foundAssignment,
            sessionTitle: foundAssignment.lessonTitle || foundAssignment.courseName,
            sessionOrder: foundAssignment.lessonNumber || foundAssignment.lessonOrder,
            lessonDate: foundAssignment.lessonDate || foundAssignment.sessionDate || foundAssignment.createdAt,
            dueDate: foundAssignment.deadline,
            total: foundAssignment.totalStudents,
            submissionRate: foundAssignment.totalStudents > 0 
              ? Math.round((foundAssignment.submitted / foundAssignment.totalStudents) * 100) 
              : 0,
            late: 0,
            notSubmitted: foundAssignment.pending,
            files: foundAssignment.assignmentFiles || [],
            answerFiles: foundAssignment.answerFiles || [],
            submissions: (submissionsResponse.submissions || []).map(sub => ({
              studentId: sub.student?._id,
              studentName: sub.student?.username || sub.student?.email,
              submittedAt: sub.submittedAt,
              score: sub.score,
              status: sub.status,
              files: sub.submittedFiles || sub.files || []
            }))
          };

          console.log('🔄 Transformed Assignment:', transformedAssignment); // Debug transformed data
          setAssignment(transformedAssignment);
        }
      }
    } catch (err) {
      console.error('Error fetching assignment:', err);
      toast.error('Không thể tải thông tin bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignmentFile = async (fileType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar';
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      if (files.length > 5) {
        toast.warning('Tối đa 5 files mỗi lần upload');
        return;
      }

      try {
        setUploadingFiles(prev => ({ ...prev, [fileType]: true }));
        
        const newAssignmentFiles = fileType === 'assignment' ? files : [];
        const newAnswerFiles = fileType === 'answer' ? files : [];
        
        const response = await homeworkService.updateHomework(
          assignment.scheduleId,
          assignment._id,
          {},
          newAssignmentFiles,
          newAnswerFiles,
          [],
          []
        );

        if (response.success) {
          await fetchAssignmentDetail();
          toast.success('Thêm file thành công!');
        }
      } catch (err) {
        console.error('Error uploading files:', err);
        toast.error('Không thể upload file. Vui lòng thử lại.');
      } finally {
        setUploadingFiles(prev => ({ ...prev, [fileType]: false }));
      }
    };

    input.click();
  };

  const handleDeleteAssignmentFile = async (fileType, file) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa file',
      text: 'Bạn có chắc chắn muốn xóa file này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      setUploadingFiles(prev => ({ ...prev, [fileType]: true }));
      
      const deleteAssignmentFiles = fileType === 'assignment' ? [file] : [];
      const deleteAnswerFiles = fileType === 'answer' ? [file] : [];
      
      const response = await homeworkService.updateHomework(
        assignment.scheduleId,
        assignment._id,
        {},
        [],
        [],
        deleteAssignmentFiles,
        deleteAnswerFiles
      );

      if (response.success) {
        await fetchAssignmentDetail();
        toast.success('Xóa file thành công!');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Không thể xóa file. Vui lòng thử lại.');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fileType]: false }));
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) {
      toast.warning('Tiêu đề không được để trống');
      return;
    }

    if (newTitle.trim() === assignment.title) {
      setEditingTitle(false);
      return;
    }

    try {
      const response = await homeworkService.updateHomework(
        assignment.scheduleId,
        assignment._id,
        { title: newTitle.trim() },
        [], [], [], []
      );

      if (response.success) {
        await fetchAssignmentDetail();
        setEditingTitle(false);
        toast.success('Cập nhật tiêu đề thành công!');
      }
    } catch (err) {
      console.error('Error updating title:', err);
      toast.error('Không thể cập nhật tiêu đề. Vui lòng thử lại.');
    }
  };

  const handleDeleteHomework = async () => {
    const result = await Swal.fire({
      title: 'Xóa bài tập',
      html: `
        <p>Bạn có chắc chắn muốn xóa bài tập <strong>"${assignment.title}"</strong>?</p>
        <p class="text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Hành động này không thể hoàn tác và sẽ xóa tất cả bài nộp của học viên.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xóa bài tập',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      await homeworkService.deleteHomework(assignment.scheduleId, assignment._id);
      toast.success('Xóa bài tập thành công!');
      if (onDelete) onDelete(); // Use onDelete for data changes
      else if (onBack) onBack(); // Fallback to onBack
    } catch (err) {
      console.error('Error deleting homework:', err);
      toast.error('Không thể xóa bài tập. Vui lòng thử lại.');
    }
  };

  const handleDownloadSubmission = (submission) => {
    if (!submission.files || submission.files.length === 0) {
      toast.info('Học viên chưa nộp file nào');
      return;
    }

    submission.files.forEach((fileUrl, index) => {
      setTimeout(() => {
        window.open(`${API_URL}${fileUrl}`, '_blank');
      }, index * 200);
    });

    toast.success(`Đang mở ${submission.files.length} file...`);
  };

  const handleDownloadAllSubmissions = () => {
    if (!assignment || !assignment.submissions) {
      toast.info('Không có bài nộp nào');
      return;
    }

    const submittedFiles = assignment.submissions.filter(
      sub => sub.files && sub.files.length > 0
    );

    if (submittedFiles.length === 0) {
      toast.info('Không có file nào để tải');
      return;
    }

    let fileIndex = 0;
    submittedFiles.forEach((submission) => {
      submission.files.forEach((fileUrl) => {
        setTimeout(() => {
          window.open(`${API_URL}${fileUrl}`, '_blank');
        }, fileIndex * 200);
        fileIndex++;
      });
    });

    toast.success(`Đang mở ${fileIndex} file từ ${submittedFiles.length} học viên...`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-neutral-600">Đang tải thông tin bài tập...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: '48px' }}></i>
          <h5>Không tìm thấy bài tập</h5>
          <Button variant="outline-primary" onClick={() => onBack && onBack()}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Header */}
      <div className="p-20 border-bottom">
        <Button 
          variant="link" 
          className="text-neutral-600 p-0 mb-2 text-decoration-none" 
          onClick={() => onBack && onBack()}
          style={{ fontSize: '14px' }}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Quay Lại
        </Button>
        
        <div className="d-flex justify-content-between align-items-start mt-3">
          <div className="flex-grow-1 me-3">
            {editingTitle ? (
              <div className="d-flex align-items-center gap-2 mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài tập"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle();
                    if (e.key === 'Escape') {
                      setEditingTitle(false);
                      setNewTitle(assignment.title);
                    }
                  }}
                  style={{ fontSize: '20px', fontWeight: 'bold' }}
                />
                <Button
                  variant="success"
                  size="sm"
                  className="px-12 py-6"
                  onClick={handleUpdateTitle}
                >
                  <i className="fas fa-check"></i>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="px-12 py-6"
                  onClick={() => {
                    setEditingTitle(false);
                    setNewTitle(assignment.title);
                  }}
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 mb-2">
                <h4 className="mb-0 fw-bold">{assignment.title}</h4>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-primary"
                  onClick={() => {
                    setEditingTitle(true);
                    setNewTitle(assignment.title);
                  }}
                >
                  <i className="fas fa-edit"></i>
                </Button>
              </div>
            )}
            <div className="text-neutral-600" style={{ fontSize: '14px' }}>
              <span>Buổi {assignment.sessionOrder || ''}: {assignment.sessionTitle || assignment.courseName || ''}</span>
            </div>
            <div className="text-neutral-500 mt-1" style={{ fontSize: '13px' }}>
              {assignment.teacherName && (
                <>
                  <span>Giáo viên: {assignment.teacherName}</span>
                  <span className="mx-2">|</span>
                </>
              )}
              <span>Ngày học: {assignment.lessonDate 
                ? new Date(assignment.lessonDate).toLocaleDateString('vi-VN')
                : new Date(assignment.createdAt).toLocaleDateString('vi-VN')
              }</span>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" className='text-14 px-12 py-6'>
              <i className="fas fa-download me-2"></i>
              Xuất Báo Cáo
            </Button>
            <Button variant="danger" size="sm" className='text-14 px-12 py-6' onClick={handleDeleteHomework}>
              <i className="fas fa-trash me-2"></i>
              Xóa Bài Tập
            </Button>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="px-20 py-3">
        <Row className="g-3">
          <Col md={6}>
            <Card className="border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold">File đề bài</span>
                  </div>
                  <Button 
                    variant={editingFiles.assignment ? "secondary" : "outline-primary"}
                    size="sm"
                    className='text-14 px-12 py-6'
                    onClick={() => setEditingFiles(prev => ({ ...prev, assignment: !prev.assignment }))}
                  >
                    <i className={`fas fa-${editingFiles.assignment ? 'times' : 'edit'} me-1`}></i>
                    {editingFiles.assignment ? 'Đóng' : 'Chỉnh Sửa'}
                  </Button>
                </div>
                <div className="text-neutral-500 mb-4" style={{ fontSize: '12px' }}>Bắt buộc</div>
                
                {editingFiles.assignment && (
                  <div className="mb-3">
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateAssignmentFile('assignment')}
                      disabled={uploadingFiles.assignment}
                      className=" w-100 text-14 px-12 py-6"
                    >
                      {uploadingFiles.assignment ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <i className="fas fa-plus me-1"></i>
                          Thêm File
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {assignment.files && assignment.files.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {assignment.files.map((file, index) => (
                      <div key={index} className="d-flex align-items-center justify-content-between p-3 border rounded" style={{ backgroundColor: '#F8F9FA' }}>
                        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                          <i className="fas fa-file-pdf text-primary"></i>
                          <span className="text-truncate" style={{ fontSize: '14px' }}>
                            {file.split('/').pop()}
                          </span>
                        </div>
                        <div className="d-flex gap-1 ms-2">
                          <a 
                            href={`${API_URL}${file}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            <i className="fas fa-download text-primary"></i>
                          </a>
                          {editingFiles.assignment && (
                            <Button 
                              variant="link"
                              size="sm"
                              onClick={() => handleDeleteAssignmentFile('assignment', file)}
                              disabled={uploadingFiles.assignment}
                              className="p-0"
                              style={{ padding: '4px 8px' }}
                            >
                              <i className="fas fa-trash text-danger"></i>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-neutral-400 py-3">
                    <p className="mb-0" style={{ fontSize: '13px' }}>Chưa có file đề bài</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold">File đáp án</span>
                  </div>
                  <Button 
                    variant={editingFiles.answer ? "secondary" : "outline-primary"}
                    size="sm"
                    className='text-14 px-12 py-6'
                    onClick={() => setEditingFiles(prev => ({ ...prev, answer: !prev.answer }))}
                  >
                    <i className={`fas fa-${editingFiles.answer ? 'times' : 'edit'} me-1`}></i>
                    {editingFiles.answer ? 'Đóng' : 'Chỉnh Sửa'}
                  </Button>
                </div>
                <div className="text-neutral-500 mb-4" style={{ fontSize: '12px' }}>Tùy chọn</div>
                
                {editingFiles.answer && (
                  <div className="mb-3">
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateAssignmentFile('answer')}
                      disabled={uploadingFiles.answer}
                      className="w-100 text-14 px-12 py-6"
                    >
                      {uploadingFiles.answer ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <i className="fas fa-plus me-1"></i>
                          Thêm File
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {assignment.answerFiles && assignment.answerFiles.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {assignment.answerFiles.map((file, index) => (
                      <div key={index} className="d-flex align-items-center justify-content-between p-3 border rounded" style={{ backgroundColor: '#F8F9FA' }}>
                        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                          <i className="fas fa-file-pdf text-primary"></i>
                          <span className="text-truncate" style={{ fontSize: '14px' }}>
                            {file.split('/').pop()}
                          </span>
                        </div>
                        <div className="d-flex gap-1 ms-2">
                          <a 
                            href={`${API_URL}${file}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            <i className="fas fa-download text-primary"></i>
                          </a>
                          {editingFiles.answer && (
                            <Button 
                              variant="link"
                              size="sm"
                              onClick={() => handleDeleteAssignmentFile('answer', file)}
                              disabled={uploadingFiles.answer}
                              className="p-0"
                              style={{ padding: '4px 8px' }}
                            >
                              <i className="fas fa-trash text-danger"></i>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-neutral-400 py-3">
                    <p className="mb-0" style={{ fontSize: '13px' }}>Chưa có file đáp án</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Submissions Section */}
      <div className="px-20 py-3">
        {/* Submissions Table */}
        <Card className="border">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <i className="fas fa-list text-primary" style={{ fontSize: '18px' }}></i>
                <span className="fw-semibold">Danh sách nộp bài</span>
                <div className="d-flex gap-2 ms-3">
                  <Badge bg="success" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    Đã nộp: {assignment.submitted}/{assignment.total}
                  </Badge>
                  {assignment.notSubmitted > 0 && (
                    <Badge bg="secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>
                      Chưa nộp: {assignment.notSubmitted}
                    </Badge>
                  )}
                </div>
              </div>
              {assignment.submitted > 0 && (
                <Button 
                  variant="primary"
                  size="sm"
                  className='text-14 px-12 py-6'
                  onClick={handleDownloadAllSubmissions}
                >
                  <i className="fas fa-download me-2"></i>
                  Tải Hết Bài Tập
                </Button>
              )}
            </div>

            <Table hover className="mb-0" style={{ marginTop: '1rem' }}>
              <thead style={{ backgroundColor: '#F8F9FA' }}>
                <tr>
                  <th className="border-0 py-3 px-4" style={{ fontSize: '13px', fontWeight: '600' }}>STT</th>
                  <th className="border-0 py-3 px-4" style={{ fontSize: '13px', fontWeight: '600' }}>Học viên</th>
                  <th className="border-0 py-3 px-4" style={{ fontSize: '13px', fontWeight: '600' }}>Thời gian nộp</th>
                  <th className="border-0 py-3 px-4 text-center" style={{ fontSize: '13px', fontWeight: '600' }}>Trạng thái</th>
                  <th className="border-0 py-3 px-4 text-center" style={{ fontSize: '13px', fontWeight: '600' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {assignment.submissions && assignment.submissions.length > 0 ? (
                  assignment.submissions.map((submission, index) => {
                    const isLate = submission.submittedAt && new Date(submission.submittedAt) > new Date(assignment.dueDate);
                    return (
                    <tr key={submission.studentId}>
                      <td className="py-3 px-4" style={{ fontSize: '13px' }}>{index + 1}</td>
                      <td className="py-3 px-4" style={{ fontSize: '13px' }}>{submission.studentName}</td>
                      <td className="py-3 px-4" style={{ fontSize: '13px' }}>
                        {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {submission.submittedAt ? (
                          <Badge 
                            bg={isLate ? 'warning' : 'success'}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            {isLate ? 'Nộp muộn' : 'Nộp đúng hạn'}
                          </Badge>
                        ) : (
                          <Badge bg="secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                            Chưa nộp
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {submission.files && submission.files.length > 0 ? (
                          <Button 
                            variant="primary"
                            size="sm"
                            onClick={() => handleDownloadSubmission(submission)}
                            className='text-14 px-12 py-6'
                          >
                            <i className="fas fa-download me-1"></i>
                            Tải Bài
                          </Button>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '12px' }}>Chưa có</span>
                        )}
                      </td>
                    </tr>
                  );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="text-neutral-500" style={{ fontSize: '13px' }}>Chưa có bài nộp nào</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentDetail;
