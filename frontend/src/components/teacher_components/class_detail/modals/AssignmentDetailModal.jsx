import React from 'react';
import { Modal, Button, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';

const AssignmentDetailModal = ({ 
  show, 
  onHide, 
  assignment,
  handleUpdateAssignmentFile,
  handleDeleteAssignmentFile,
  handleDeleteHomework,
  handleDownloadSubmission,
  handleDownloadAllSubmissions,
  uploadingFiles
}) => {
  if (!assignment) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{assignment.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Assignment Info */}
        <Row className="mb-20">
          <Col md={6}>
            <div className="text-neutral-600 text-12 mb-4">Buổi học</div>
            <div className="text-neutral-900 fw-medium text-13">
              {assignment.sessionTitle || `Buổi ${assignment.sessionOrder}`}
            </div>
            <div className="text-neutral-500 text-11">
              {new Date(assignment.lessonDate).toLocaleDateString('vi-VN')}
            </div>
          </Col>
          <Col md={6}>
            <div className="text-neutral-600 text-12 mb-4">Hạn nộp</div>
            <div className="text-neutral-900 fw-medium text-13">
              {new Date(assignment.dueDate).toLocaleDateString('vi-VN')} {new Date(assignment.dueDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </Col>
        </Row>

        {/* Statistics */}
        <Row className="mb-20">
          <Col md={4}>
            <div className="text-neutral-600 text-12 mb-4">Đã nộp</div>
            <div className="text-success-600 fw-bold text-16">
              {assignment.submitted}/{assignment.total}
              <span className="text-neutral-500 fw-normal text-12 ms-1">
                ({assignment.submissionRate}%)
              </span>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-neutral-600 text-12 mb-4">Nộp muộn</div>
            <div className="text-warning-600 fw-bold text-16">
              {assignment.late}
            </div>
          </Col>
          <Col md={4}>
            <div className="text-neutral-600 text-12 mb-4">Chưa nộp</div>
            <div className="text-danger-600 fw-bold text-16">
              {assignment.notSubmitted}
            </div>
          </Col>
        </Row>

        {/* Assignment Files */}
        <div className="mb-20">
          <div className="d-flex justify-content-between align-items-center mb-8">
            <div className="text-neutral-600 text-12">File đề bài</div>
            <Button 
              className="btn-primary text-11 px-12 py-6 radius-6"
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
          </div>
          {assignment.files && assignment.files.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {assignment.files.map((file, index) => (
                <div key={index} className="d-flex align-items-center justify-content-between p-2 bg-neutral-50 rounded">
                  <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                    <i className="fas fa-file text-main-600"></i>
                    <span className="text-neutral-900 text-12" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.split('/').pop()}
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <a 
                      href={file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary text-11 px-8 py-4 radius-6"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                    <Button 
                      className="btn-danger text-11 px-8 py-4 radius-6"
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
            <div className="text-neutral-400 text-12 text-center p-3 bg-neutral-25 rounded">
              <i className="fas fa-inbox me-1"></i>
              Chưa có file đề bài
            </div>
          )}
        </div>

        {/* Answer Files */}
        <div className="mb-20">
          <div className="d-flex justify-content-between align-items-center mb-8">
            <div className="text-neutral-600 text-12">File đáp án (Tùy chọn)</div>
            <Button 
              className="btn-primary text-11 px-12 py-6 radius-6"
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
          </div>
          {assignment.answerFiles && assignment.answerFiles.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {assignment.answerFiles.map((file, index) => (
                <div key={index} className="d-flex align-items-center justify-content-between p-2 bg-info-25 rounded">
                  <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                    <i className="fas fa-file text-primary"></i>
                    <span className="text-primary text-12" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.split('/').pop()}
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <a 
                      href={file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary text-11 px-8 py-4 radius-6"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                    <Button 
                      className="btn-danger text-11 px-8 py-4 radius-6"
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
            <div className="text-neutral-400 text-12 text-center p-3 bg-neutral-25 rounded">
              <i className="fas fa-inbox me-1"></i>
              Chưa có file đáp án
            </div>
          )}
        </div>

        {/* Submissions List */}
        <div className="border-top pt-20">
          <div className="d-flex justify-content-between align-items-center mb-16">
            <h6 className="text-neutral-900 fw-semibold mb-0">
              Danh sách nộp bài
            </h6>
            {assignment.submitted > 0 && (
              <Button 
                className="btn-success text-12 px-16 py-8 radius-8"
                onClick={handleDownloadAllSubmissions}
              >
                <i className="fas fa-download me-2"></i>
                Tải hết bài tập
              </Button>
            )}
          </div>
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
                      {new Date(submission.submittedAt).toLocaleString('vi-VN')}
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
                      <Button 
                        className="btn-success text-11 px-12 py-6 radius-6"
                        onClick={() => handleDownloadSubmission(submission)}
                        title="Tải bài"
                      >
                        <i className="fas fa-download me-1"></i>
                        Tải bài
                      </Button>
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

          {/* Warning for not submitted */}
          {assignment.notSubmitted > 0 && (
            <div className="mt-16 p-12 bg-warning-25 border border-warning-200 rounded-8">
              <div className="text-warning-700 text-12">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>{assignment.notSubmitted} học viên</strong> chưa nộp bài
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <Button 
            className="btn-danger"
            onClick={() => handleDeleteHomework(assignment)}
          >
            <i className="fas fa-trash me-2"></i>
            Xóa bài tập
          </Button>
          <div className="d-flex gap-2">
            <Button className="btn-secondary" onClick={onHide}>
              Đóng
            </Button>
            <Button className="btn-primary">
              <i className="fas fa-file-export me-2"></i>
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignmentDetailModal;
