import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const AddHomeworkModal = ({ 
  show, 
  onHide, 
  lessons,
  homeworkFormData,
  handleHomeworkFormChange,
  handleHomeworkFileChange,
  handleRemoveFileFromForm,
  handleSubmitHomework,
  submitting
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Thêm bài tập mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-16">
            <Form.Label className="text-neutral-900 fw-semibold text-13">
              Buổi học <span className="text-danger-600">*</span>
            </Form.Label>
            <Form.Select
              value={homeworkFormData.lessonId}
              onChange={(e) => handleHomeworkFormChange('lessonId', e.target.value)}
              className="radius-8"
            >
              <option value="">-- Chọn buổi học --</option>
              {lessons.map(lesson => (
                <option key={lesson._id} value={lesson._id}>
                  Buổi {lesson.lessonNumber} - {lesson.topic} ({new Date(lesson.date).toLocaleDateString('vi-VN')})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-16">
            <Form.Label className="text-neutral-900 fw-semibold text-13">
              Tên bài tập <span className="text-danger-600">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="VD: Bài tập Unit 5 - Grammar Practice"
              value={homeworkFormData.title}
              onChange={(e) => handleHomeworkFormChange('title', e.target.value)}
              className="radius-8"
            />
          </Form.Group>

          <Form.Group className="mb-16">
            <Form.Label className="text-neutral-900 fw-semibold text-13">
              Hạn nộp <span className="text-danger-600">*</span>
            </Form.Label>
            <Form.Control
              type="datetime-local"
              value={homeworkFormData.deadline}
              onChange={(e) => handleHomeworkFormChange('deadline', e.target.value)}
              className="radius-8"
            />
            <Form.Text className="text-muted">
              Chọn ngày và giờ hạn nộp bài
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-16">
            <Form.Label className="text-neutral-900 fw-semibold text-13">
              File đề bài (Tùy chọn)
            </Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => handleHomeworkFileChange('assignmentFiles', e.target.files)}
              className="radius-8"
              multiple
            />
            {homeworkFormData.assignmentFiles && homeworkFormData.assignmentFiles.length > 0 && (
              <div className="mt-2">
                {homeworkFormData.assignmentFiles.map((file, index) => (
                  <div key={index} className="d-flex align-items-center justify-content-between p-2 mb-1 bg-success-25 rounded">
                    <span className="text-success-600 text-12">
                      <i className="fas fa-file me-1"></i>
                      {file.name}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger-600 p-0"
                      onClick={() => handleRemoveFileFromForm('assignmentFiles', index)}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Form.Text className="text-muted">
              Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Tối đa 50MB mỗi file). Có thể tải nhiều file.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-16">
            <Form.Label className="text-neutral-900 fw-semibold text-13">
              File đáp án (Tùy chọn)
            </Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => handleHomeworkFileChange('answerFiles', e.target.files)}
              className="radius-8"
              multiple
            />
            {homeworkFormData.answerFiles && homeworkFormData.answerFiles.length > 0 && (
              <div className="mt-2">
                {homeworkFormData.answerFiles.map((file, index) => (
                  <div key={index} className="d-flex align-items-center justify-content-between p-2 mb-1 bg-info-25 rounded">
                    <span className="text-info-600 text-12">
                      <i className="fas fa-file me-1"></i>
                      {file.name}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger-600 p-0"
                      onClick={() => handleRemoveFileFromForm('answerFiles', index)}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Form.Text className="text-muted">
              Upload file đáp án để học viên tham khảo sau khi nộp bài. Có thể tải nhiều file.
            </Form.Text>
          </Form.Group>

          <div className="p-12 bg-warning-25 border border-warning-200 rounded-8">
            <div className="text-warning-700 text-12">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Bài tập sẽ được tự động giao cho tất cả học viên trong lớp
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          className="btn-outline-neutral" 
          onClick={onHide}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button 
          className="btn-main"
          onClick={handleSubmitHomework}
          disabled={submitting || !homeworkFormData.lessonId || !homeworkFormData.title || !homeworkFormData.deadline}
        >
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang tải lên...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>
              Thêm bài tập
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddHomeworkModal;
