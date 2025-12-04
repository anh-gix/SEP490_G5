import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Table, Badge, Spinner, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import homeworkService from '../../services/homeworkService';

const AssignmentDetailPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState({ assignment: false, answer: false });

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
        
        if (!foundAssignment) {
          toast.error('Không tìm thấy bài tập');
          navigate(-1);
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
            sessionTitle: foundAssignment.lessonTitle,
            sessionOrder: foundAssignment.lessonNumber,
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
      navigate(-1);
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
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileUrl.split('/').pop();
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200);
    });

    toast.success(`Đang tải ${submission.files.length} file...`);
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

    toast.success(`Đang tải ${fileIndex} file từ ${submittedFiles.length} học viên...`);
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
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="link" className="text-neutral-600 p-0 mb-2" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
          <h3 className="mb-1">{assignment.title}</h3>
          <p className="text-neutral-500 mb-0">
            <i className="fas fa-book me-2"></i>
            {assignment.sessionTitle || `Buổi ${assignment.sessionOrder}`}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary">
            <i className="fas fa-file-export me-2"></i>
            Xuất báo cáo
          </Button>
          <Button variant="danger" onClick={handleDeleteHomework}>
            <i className="fas fa-trash me-2"></i>
            Xóa bài tập
          </Button>
        </div>
      </div>

      {/* Assignment Info Card */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <div className="text-neutral-600 text-12 mb-2">Buổi học</div>
              <div className="text-neutral-900 fw-medium text-14">
                {assignment.sessionTitle || `Buổi ${assignment.sessionOrder}`}
              </div>
              <div className="text-neutral-500 text-11">
                {new Date(assignment.lessonDate).toLocaleDateString('vi-VN')}
              </div>
            </Col>
            <Col md={3}>
              <div className="text-neutral-600 text-12 mb-2">Hạn nộp</div>
              <div className="text-neutral-900 fw-medium text-14">
                {new Date(assignment.dueDate).toLocaleDateString('vi-VN')} {new Date(assignment.dueDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </Col>
            <Col md={2}>
              <div className="text-neutral-600 text-12 mb-2">Đã nộp</div>
              <div className="text-success-600 fw-bold text-16">
                {assignment.submitted}/{assignment.total}
                <span className="text-neutral-500 fw-normal text-12 ms-1">
                  ({assignment.submissionRate}%)
                </span>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-neutral-600 text-12 mb-2">Nộp muộn</div>
              <div className="text-warning-600 fw-bold text-16">
                {assignment.late}
              </div>
            </Col>
            <Col md={2}>
              <div className="text-neutral-600 text-12 mb-2">Chưa nộp</div>
              <div className="text-danger-600 fw-bold text-16">
                {assignment.notSubmitted}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Files Section */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">File đề bài</h6>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => handleUpdateAssignmentFile('assignment')}
                disabled={uploadingFiles.assignment}
              >
                {uploadingFiles.assignment ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <i className="fas fa-plus me-1"></i>
                    Thêm file
                  </>
                )}
              </Button>
            </Card.Header>
            <Card.Body>
              {assignment.files && assignment.files.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {assignment.files.map((file, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between p-2 bg-neutral-50 rounded">
                      <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                        <i className="fas fa-file text-primary"></i>
                        <span className="text-neutral-900 text-13" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.split('/').pop()}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <a 
                          href={file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          <i className="fas fa-download"></i>
                        </a>
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAssignmentFile('assignment', file)}
                          disabled={uploadingFiles.assignment}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-neutral-400 py-3">
                  <i className="fas fa-inbox mb-2" style={{ fontSize: '24px' }}></i>
                  <p className="mb-0 text-12">Chưa có file đề bài</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">File đáp án (Tùy chọn)</h6>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => handleUpdateAssignmentFile('answer')}
                disabled={uploadingFiles.answer}
              >
                {uploadingFiles.answer ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <i className="fas fa-plus me-1"></i>
                    Thêm file
                  </>
                )}
              </Button>
            </Card.Header>
            <Card.Body>
              {assignment.answerFiles && assignment.answerFiles.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {assignment.answerFiles.map((file, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between p-2 bg-info-25 rounded">
                      <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                        <i className="fas fa-file text-primary"></i>
                        <span className="text-primary text-13" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.split('/').pop()}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <a 
                          href={file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          <i className="fas fa-download"></i>
                        </a>
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAssignmentFile('answer', file)}
                          disabled={uploadingFiles.answer}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-neutral-400 py-3">
                  <i className="fas fa-inbox mb-2" style={{ fontSize: '24px' }}></i>
                  <p className="mb-0 text-12">Chưa có file đáp án</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Submissions Table */}
      <Card>
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Danh sách nộp bài</h6>
          {assignment.submitted > 0 && (
            <Button 
              variant="success"
              size="sm"
              onClick={handleDownloadAllSubmissions}
            >
              <i className="fas fa-download me-2"></i>
              Tải hết bài tập
            </Button>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover className="mb-0">
            <thead>
              <tr className="bg-neutral-25">
                <th className="px-16 py-12 text-neutral-900 fw-semibold text-12 border-0">STT</th>
                <th className="px-16 py-12 text-neutral-900 fw-semibold text-12 border-0">Học viên</th>
                <th className="px-16 py-12 text-neutral-900 fw-semibold text-12 border-0">Thời gian nộp</th>
                <th className="px-16 py-12 text-neutral-900 fw-semibold text-12 border-0 text-center">Trạng thái</th>
                <th className="px-16 py-12 text-neutral-900 fw-semibold text-12 border-0 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {assignment.submissions && assignment.submissions.length > 0 ? (
                assignment.submissions.map((submission, index) => (
                  <tr key={submission.studentId}>
                    <td className="px-16 py-12 text-neutral-700 text-12">{index + 1}</td>
                    <td className="px-16 py-12 text-neutral-900 text-13">{submission.studentName}</td>
                    <td className="px-16 py-12 text-neutral-700 text-12">
                      {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : 'Chưa nộp'}
                    </td>
                    <td className="px-16 py-12 text-center">
                      <Badge className={
                        submission.status === 'submitted' ? 'bg-success-100 text-success-600' :
                        submission.status === 'late' ? 'bg-warning-100 text-warning-600' :
                        'bg-neutral-100 text-neutral-600'
                      }>
                        {submission.status === 'submitted' ? 'Đã nộp' :
                         submission.status === 'late' ? 'Nộp muộn' : 'Chưa nộp'}
                      </Badge>
                    </td>
                    <td className="px-16 py-12 text-center">
                      {submission.files && submission.files.length > 0 && (
                        <Button 
                          variant="success"
                          size="sm"
                          onClick={() => handleDownloadSubmission(submission)}
                        >
                          <i className="fas fa-download me-1"></i>
                          Tải bài
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-24">
                    <i className="fas fa-inbox text-neutral-300 mb-2" style={{ fontSize: '32px' }}></i>
                    <div className="text-neutral-500 text-13">Chưa có bài nộp nào</div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {assignment.notSubmitted > 0 && (
            <div className="m-3 p-3 bg-warning-25 border border-warning-200 rounded">
              <div className="text-warning-700 text-12">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>{assignment.notSubmitted} học viên</strong> chưa nộp bài
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AssignmentDetailPage;
