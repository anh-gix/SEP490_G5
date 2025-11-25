import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const GradingModal = ({ 
  show, 
  onHide, 
  submission, 
  gradeScore, 
  setGradeScore, 
  gradeComment, 
  setGradeComment, 
  handleSaveGrade 
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Chấm điểm bài tập</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submission && (
          <>
            <div className="mb-20 p-16 bg-neutral-50 rounded-8">
              <div className="d-flex justify-content-between align-items-center mb-8">
                <span className="text-neutral-600 text-12">Học viên</span>
                <span className="text-neutral-900 fw-semibold text-14">{submission.studentName}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-neutral-600 text-12">Thời gian nộp</span>
                <span className="text-neutral-700 text-13">
                  {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            <Form>
              <Form.Group className="mb-16">
                <Form.Label className="text-neutral-900 fw-semibold text-13">
                  Điểm số <span className="text-danger-600">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Nhập điểm (0-10)"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="radius-8"
                />
                <Form.Text className="text-muted">
                  Nhập điểm từ 0 đến 10
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-16">
                <Form.Label className="text-neutral-900 fw-semibold text-13">Nhận xét</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Nhận xét về bài làm của học viên..."
                  value={gradeComment}
                  onChange={(e) => setGradeComment(e.target.value)}
                  className="radius-8"
                />
              </Form.Group>

              <div className="p-12 bg-info-25 border border-info-200 rounded-8">
                <div className="text-info-700 text-12">
                  <i className="fas fa-info-circle me-2"></i>
                  Điểm số và nhận xét sẽ được gửi đến học viên sau khi lưu
                </div>
              </div>
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-outline-neutral" onClick={onHide}>
          Hủy
        </Button>
        <Button 
          className="btn-main"
          onClick={handleSaveGrade}
          disabled={!gradeScore || gradeScore < 0 || gradeScore > 10}
        >
          <i className="fas fa-save me-2"></i>
          Lưu điểm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GradingModal;
