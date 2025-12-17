import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Tabs, Tab, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import camSessionService from '../../../services/camSessionService';
import {
  QUIZ_TYPES,
  SESSION_TYPES,
  validateQuiz,
  validateVocabulary,
  emptyQuiz,
  emptyVocabularyItem,
} from './camSessionHelpers';
import {
  MultipleChoiceQuizForm,
  YesNoQuizForm,
  SpellQuizForm,
  WordFromBoxQuizForm,
} from './QuizEditModals';

const CamSessionEdit = ({ viewMode = 'center-head' }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Determine permissions
  const canEdit = viewMode === 'teacher'; // Only teacher can edit

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [videoFile, setVideoFile] = useState(null);

  // Quiz Type Selection Modal
  const [showQuizTypeModal, setShowQuizTypeModal] = useState(false);

  // Preview tracking
  const [previewQuizIndex, setPreviewQuizIndex] = useState(null);
  const [previewVocabIndex, setPreviewVocabIndex] = useState(null);

  const [editModal, setEditModal] = useState({
    show: false,
    type: null, // 'quiz' | 'vocab'
    index: null,
  });
  const [editItemData, setEditItemData] = useState(null);

  const loadCamSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await camSessionService.getCamSessionById(sessionId);
      const sessionPayload = response?.data || response;

      setFormData({
        title: sessionPayload?.title || '',
        sessionType: sessionPayload?.sessionType || 'reading',
        description: sessionPayload?.description || '',
        order: sessionPayload?.order || 1,
        videoURL: sessionPayload?.videoURL || '',
        quizzes: {
          quiz: Array.isArray(sessionPayload?.quizzes?.quiz)
            ? sessionPayload.quizzes.quiz.map((quiz) => ({
                ...emptyQuiz(),
                ...quiz,
                Answer: Array.isArray(quiz?.Answer) && quiz.Answer.length ? quiz.Answer : [''],
                AnswerKey: Array.isArray(quiz?.AnswerKey) && quiz.AnswerKey.length ? quiz.AnswerKey : [''],
              }))
            : [],
        },
        vocabulary: {
          items: Array.isArray(sessionPayload?.vocabulary?.items)
            ? sessionPayload.vocabulary.items.map((item) => ({ ...emptyVocabularyItem(), ...item }))
            : [],
        },
      });
    } catch (error) {
      console.error('Error loading cam session:', error);
      alert(error.response?.data?.message || 'Không thể tải CAM Session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      loadCamSession();
    }
  }, [sessionId, loadCamSession]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error for this field
    setValidationErrors((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const handleVideoFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn file video hợp lệ (mp4, webm, ...)!', { position: 'top-right' });
      event.target.value = '';
      return;
    }

    // Create local URL for preview
    const localUrl = URL.createObjectURL(file);
    setVideoFile(file);
    handleFieldChange('videoURL', localUrl);

    // TODO: Upload to server
    // const formData = new FormData();
    // formData.append('video', file);
    // await camSessionService.uploadVideo(formData);
  };

  const handleAddQuiz = () => {
    setShowQuizTypeModal(true);
  };

  const handleQuizTypeSelected = (quizType) => {
    const newQuiz = {
      ...emptyQuiz(),
      Type: quizType,
      Answer: QUIZ_TYPES[quizType].multipleQuestions ? [''] : [''],
      AnswerKey: [''],
    };
    
    setFormData((prev) => ({
      ...prev,
      quizzes: { quiz: [...(prev?.quizzes?.quiz || []), newQuiz] },
    }));
    
    setShowQuizTypeModal(false);
    toast.success(`Đã thêm quiz ${QUIZ_TYPES[quizType].label}!`, { position: 'top-right', autoClose: 2000 });
    
    // Mở modal edit ngay
    setTimeout(() => {
      openQuizModal((formData?.quizzes?.quiz?.length || 0));
    }, 100);
  };

  const handleRemoveQuiz = async (index) => {
    const result = await Swal.fire({
      title: 'Xóa quiz?',
      text: `Bạn có chắc muốn xóa quiz #${index + 1}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      setFormData((prev) => ({
        ...prev,
        quizzes: { quiz: (prev?.quizzes?.quiz || []).filter((_, i) => i !== index) },
      }));
      toast.success('Đã xóa quiz!', { position: 'top-right', autoClose: 2000 });
    }
  };

  const handleAddVocabulary = () => {
    setFormData((prev) => ({
      ...prev,
      vocabulary: { items: [...(prev?.vocabulary?.items || []), emptyVocabularyItem()] },
    }));
  };

  const handleRemoveVocabulary = async (index) => {
    const result = await Swal.fire({
      title: 'Xóa từ vựng?',
      text: `Bạn có chắc muốn xóa từ vựng #${index + 1}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      setFormData((prev) => ({
        ...prev,
        vocabulary: { items: (prev?.vocabulary?.items || []).filter((_, i) => i !== index) },
      }));
      toast.success('Đã xóa từ vựng!', { position: 'top-right', autoClose: 2000 });
    }
  };

  const openQuizModal = (index) => {
    const quiz = formData?.quizzes?.quiz?.[index];
    if (!quiz) return;
    setPreviewQuizIndex(index); // Set preview
    setEditModal({ show: true, type: 'quiz', index });
    setEditItemData({
      ...quiz,
      Answer: Array.isArray(quiz.Answer) && quiz.Answer.length ? [...quiz.Answer] : [''],
      AnswerKey: Array.isArray(quiz.AnswerKey) && quiz.AnswerKey.length ? [...quiz.AnswerKey] : [''],
    });
  };

  const openVocabModal = (index) => {
    const vocab = formData?.vocabulary?.items?.[index];
    if (!vocab) return;
    setPreviewVocabIndex(index); // Set preview
    setEditModal({ show: true, type: 'vocab', index });
    setEditItemData({ ...vocab });
  };

  const closeEditModal = () => {
    setEditModal({ show: false, type: null, index: null });
    setEditItemData(null);
    // Keep preview state
  };

  const handlePreviewQuiz = (index) => {
    setPreviewQuizIndex(index);
    setActiveTab('quiz'); // Switch to quiz tab
  };

  const handlePreviewVocab = (index) => {
    setPreviewVocabIndex(index);
    setActiveTab('vocab'); // Switch to vocab tab
  };

  const handleModalFieldChange = (field, value) => {
    setEditItemData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModalImageFileChange = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ (png, jpg, jpeg, webp, ...)!', { position: 'top-right' });
      event.target.value = '';
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setEditItemData((prev) => ({
      ...prev,
      [field]: localUrl,
    }));
    toast.success('Đã chọn ảnh!', { position: 'top-right', autoClose: 1500 });
  };

  const handleModalAnswerList = (field, answerIndex, value) => {
    setEditItemData((prev) => {
      const list = Array.isArray(prev?.[field]) ? [...prev[field]] : [];
      list[answerIndex] = value;
      return { ...prev, [field]: list };
    });
  };

  const handleModalAddAnswer = (field) => {
    setEditItemData((prev) => {
      const list = Array.isArray(prev?.[field]) ? [...prev[field]] : [];
      list.push('');
      return { ...prev, [field]: list };
    });
  };

  const handleModalRemoveAnswer = (field, index) => {
    setEditItemData((prev) => {
      const list = Array.isArray(prev?.[field]) ? [...prev[field]] : [];
      list.splice(index, 1);
      if (!list.length) list.push('');
      return { ...prev, [field]: list };
    });
  };

  const handleSaveModal = () => {
    // Validate before saving
    if (editModal.type === 'quiz') {
      const errors = validateQuiz(editItemData);
      if (errors.length > 0) {
        Swal.fire({
          title: 'Lỗi validation!',
          html: errors.map(err => `• ${err}`).join('<br>'),
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }

      setFormData((prev) => {
        const quizList = prev?.quizzes?.quiz ? [...prev.quizzes.quiz] : [];
        quizList[editModal.index] = { ...editItemData };
        return { ...prev, quizzes: { quiz: quizList } };
      });
      toast.success('Đã lưu quiz!', { position: 'top-right', autoClose: 2000 });
    } else if (editModal.type === 'vocab') {
      const errors = validateVocabulary(editItemData);
      if (errors.length > 0) {
        Swal.fire({
          title: 'Lỗi validation!',
          html: errors.map(err => `• ${err}`).join('<br>'),
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }

      setFormData((prev) => {
        const vocabList = prev?.vocabulary?.items ? [...prev.vocabulary.items] : [];
        vocabList[editModal.index] = { ...editItemData };
        return { ...prev, vocabulary: { items: vocabList } };
      });
      toast.success('Đã lưu từ vựng!', { position: 'top-right', autoClose: 2000 });
    }
    closeEditModal();
  };

  const handleDeleteFromModal = () => {
    if (editModal.type === 'quiz') {
      handleRemoveQuiz(editModal.index);
    } else if (editModal.type === 'vocab') {
      handleRemoveVocabulary(editModal.index);
    }
    closeEditModal();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData?.title?.trim()) {
      errors.title = 'Tiêu đề không được để trống';
    }

    if (!formData?.videoURL?.trim()) {
      errors.videoURL = 'Video URL không được để trống';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // 1. Validate basic form
    if (!validateForm()) {
      Swal.fire({
        title: 'Thiếu thông tin!',
        text: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      setActiveTab('basic');
      return;
    }

    // 2. Validate all quizzes
    const quizErrors = (formData?.quizzes?.quiz || [])
      .map((quiz, idx) => ({
        index: idx,
        errors: validateQuiz(quiz),
      }))
      .filter((q) => q.errors.length > 0);

    if (quizErrors.length > 0) {
      const errorHtml = quizErrors
        .map((q) => `<strong>Quiz #${q.index + 1}:</strong><br>${q.errors.map(e => `• ${e}`).join('<br>')}`)
        .join('<br><br>');
      Swal.fire({
        title: 'Lỗi trong các quiz!',
        html: errorHtml,
        icon: 'error',
        confirmButtonText: 'OK',
      });
      setActiveTab('quiz');
      return;
    }

    // 3. Validate all vocabulary
    const vocabErrors = (formData?.vocabulary?.items || [])
      .map((item, idx) => ({
        index: idx,
        errors: validateVocabulary(item),
      }))
      .filter((v) => v.errors.length > 0);

    if (vocabErrors.length > 0) {
      Swal.fire({
        title: 'Lỗi trong từ vựng!',
        text: 'Có lỗi trong từ vựng. Vui lòng kiểm tra lại.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      setActiveTab('vocab');
      return;
    }

    // 4. Save
    try {
      setSaving(true);
      await camSessionService.updateCamSession(sessionId, {
        title: formData.title.trim(),
        sessionType: formData.sessionType,
        description: formData.description?.trim(),
        order: formData.order,
        videoURL: formData.videoURL,
        quizzes: { quiz: formData?.quizzes?.quiz || [] },
        vocabulary: { items: formData?.vocabulary?.items || [] },
      });
      
      await Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật CAM Session thành công',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      navigate(-1);
    } catch (error) {
      console.error('Error updating cam session:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Không thể cập nhật CAM Session',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setSaving(false);
    }
  };

  // const handleBack = () => {
  //   // Navigate back based on context
  //   if (courseId && programId) {
  //     // If came from course wizard, go back to course wizard
  //     navigate(`${basePath}/programs/${programId}/courses/${courseId}/edit`);
  //   } else if (courseId) {
  //     // If only courseId is available, go to course detail
  //     navigate(`${basePath}/courses/${courseId}/details`);
  //   } else {
  //     // Otherwise go back to programs list
  //     navigate(`${basePath}/programs`);
  //   }
  // };

  if (loading || !formData) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#F5F7FA' }}>
      <Container fluid className="py-4 px-4">
        {/* Header Card */}
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-1 fw-bold">
                  {canEdit ? 'Chỉnh sửa Cambridge Session' : 'Xem chi tiết Cambridge Session'}
                </h5>
                <p className="text-muted mb-0 small">
                  {formData.title || 'Chưa có tiêu đề'}
                  {formData.sessionType && (
                    <Badge bg={SESSION_TYPES[formData.sessionType]?.color || 'secondary'} className="ms-2">
                      <i className={`ph ${SESSION_TYPES[formData.sessionType]?.icon} me-1`}></i>
                      {SESSION_TYPES[formData.sessionType]?.label}
                    </Badge>
                  )}
                </p>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" >
                    <i className="ph ph-arrow-left me-2"></i>
                    Quay lại
                  </Button>
                  {canEdit && (
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <i className="ph ph-check me-2"></i>
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Main Content - 2 Columns */}
        <Row className="g-3">
          {/* Left Column - Form with Tabs */}
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="border-bottom px-3">
                  {/* Tab 1: Basic Info */}
                  <Tab eventKey="basic" title={<><i className="ph ph-info me-2"></i>Thông tin cơ bản</>}>
                    <div className="p-3">
                      <Row className="g-3">
                        <Col md={8}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Tiêu đề <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              value={formData.title}
                              onChange={(e) => handleFieldChange('title', e.target.value)}
                              placeholder="Nhập tiêu đề session"
                              disabled={!canEdit}
                              isInvalid={!!validationErrors.title}
                            />
                            <Form.Control.Feedback type="invalid">{validationErrors.title}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Thứ tự</Form.Label>
                            <Form.Control
                              type="number"
                              value={formData.order}
                              onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 1)}
                              min="1"
                              disabled={!canEdit}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={12}>
                          <Form.Label className="fw-semibold">Loại session</Form.Label>
                          <div className="d-flex gap-2 flex-wrap">
                            {Object.entries(SESSION_TYPES).map(([key, type]) => (
                              <Button
                                key={key}
                                variant={formData.sessionType === key ? type.color : 'outline-secondary'}
                                size="sm"
                                onClick={() => canEdit && handleFieldChange('sessionType', key)}
                                disabled={!canEdit}
                              >
                                <i className={`ph ${type.icon} me-2`}></i>
                                {type.label}
                              </Button>
                            ))}
                          </div>
                          <Form.Text className="text-muted small">
                            {SESSION_TYPES[formData.sessionType]?.description}
                          </Form.Text>
                        </Col>

                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Mô tả</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={formData.description}
                              onChange={(e) => handleFieldChange('description', e.target.value)}
                              placeholder="Nhập mô tả về nội dung session"
                              disabled={!canEdit}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </Tab>

                  {/* Tab 2: Video */}
                  <Tab
                    eventKey="video"
                    title={
                      <>
                        <i className="ph ph-video-camera me-2"></i>Video
                        {formData.videoURL && <i className="ph ph-check-circle text-success ms-2"></i>}
                      </>
                    }
                  >
                    <div className="p-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          Video URL <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          value={formData.videoURL}
                          onChange={(e) => handleFieldChange('videoURL', e.target.value)}
                          placeholder="https://example.com/video.mp4"
                          disabled={!canEdit}
                          isInvalid={!!validationErrors.videoURL}
                        />
                        <Form.Control.Feedback type="invalid">{validationErrors.videoURL}</Form.Control.Feedback>
                        <Form.Text className="text-muted small">
                          URL trực tiếp đến file video (hỗ trợ mp4, webm)
                        </Form.Text>
                      </Form.Group>

                      {canEdit && (
                        <Form.Group>
                          <Form.Label className="fw-semibold">Hoặc tải lên file video</Form.Label>
                          <Form.Control
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                          />
                          <Form.Text className="text-muted small">
                            File video sẽ được upload và URL sẽ tự động cập nhật
                          </Form.Text>
                        </Form.Group>
                      )}

                      {formData.videoURL && (
                        <div className="mt-3">
                          <p className="fw-semibold small mb-2">Preview:</p>
                          <video
                            src={formData.videoURL}
                            controls
                            className="w-100 rounded"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      )}
                    </div>
                  </Tab>

                  {/* Tab 3: Quiz */}
                  <Tab
                    eventKey="quiz"
                    title={
                      <>
                        <i className="ph ph-question me-2"></i>Quiz ({formData?.quizzes?.quiz?.length || 0})
                      </>
                    }
                  >
                    <div className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">Danh sách Quiz</h6>
                          <p className="text-muted small mb-0">Tạo câu hỏi kiểm tra kiến thức cho học viên</p>
                        </div>
                        {canEdit && (
                          <Button variant="primary" size="sm" onClick={handleAddQuiz}>
                            <i className="ph ph-plus me-2"></i>
                            Thêm Quiz
                          </Button>
                        )}
                      </div>

                      {(formData?.quizzes?.quiz || []).length === 0 ? (
                        <div className="text-center py-5">
                          <i className="ph ph-question display-1 text-muted opacity-25"></i>
                          <p className="text-muted mt-2">Chưa có quiz nào. {canEdit && 'Nhấn "Thêm Quiz" để tạo mới.'}</p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {formData.quizzes.quiz.map((quiz, index) => {
                            const quizType = QUIZ_TYPES[quiz.Type];
                            const errors = validateQuiz(quiz);
                            const hasErrors = errors.length > 0;
                            const isSelected = previewQuizIndex === index; // Check if selected for preview

                            return (
                              <Card
                                key={index}
                                className={`border-0 ${
                                  hasErrors ? 'border-start border-danger border-3' : 
                                  isSelected ? 'border-start border-primary border-3 shadow-sm' : ''
                                }`}
                                style={{
                                  backgroundColor: hasErrors ? '#FEF2F2' : isSelected ? '#EEF2FF' : '#F8FAFE',
                                }}
                              >
                                <Card.Body className="p-3">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center gap-2 mb-2">
                                        <Badge bg={quizType.color}>
                                          <i className={`ph ${quizType.icon} me-1`}></i>
                                          {quizType.label}
                                        </Badge>
                                        <span className="fw-bold small">Quiz #{index + 1}</span>
                                        {hasErrors && (
                                          <Badge bg="danger" className="small">
                                            {errors.length} lỗi
                                          </Badge>
                                        )}
                                        {isSelected && (
                                          <Badge bg="primary" className="small">
                                            <i className="ph ph-eye me-1"></i>Previewing
                                          </Badge>
                                        )}
                                      </div>

                                      <p className="small mb-1">
                                        {quiz.Question || <span className="text-muted fst-italic">Chưa có câu hỏi</span>}
                                      </p>

                                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {quiz.Answer?.filter((a) => a?.trim()).length || 0} đáp án •{' '}
                                        {quiz.AnswerKey?.filter((k) => k?.trim()).length || 0} đáp án đúng
                                      </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                      <Button
                                        variant={isSelected ? 'primary' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => handlePreviewQuiz(index)}
                                        title="Xem preview"
                                      >
                                        <i className="ph ph-eye"></i>
                                      </Button>
                                      <Button
                                        variant={hasErrors ? 'danger' : 'outline-primary'}
                                        size="sm"
                                        onClick={() => openQuizModal(index)}
                                      >
                                        <i className={`ph ${canEdit ? 'ph-pencil' : 'ph-eye'}`}></i>
                                        {canEdit ? ' Sửa' : ' Xem'}
                                      </Button>
                                    </div>
                                  </div>

                                  {hasErrors && (
                                    <Alert variant="danger" className="mt-2 mb-0 py-2 px-2" style={{ fontSize: '0.75rem' }}>
                                      <i className="ph ph-warning-circle me-1"></i>
                                      {errors.join(' • ')}
                                    </Alert>
                                  )}
                                </Card.Body>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Tab>

                  {/* Tab 4: Vocabulary */}
                  <Tab
                    eventKey="vocab"
                    title={
                      <>
                        <i className="ph ph-book-bookmark me-2"></i>Từ vựng ({formData?.vocabulary?.items?.length || 0})
                      </>
                    }
                  >
                    <div className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">Flashcard từ vựng</h6>
                          <p className="text-muted small mb-0">Tạo flashcard giúp học viên ghi nhớ từ vựng</p>
                        </div>
                        {canEdit && (
                          <Button variant="primary" size="sm" onClick={handleAddVocabulary}>
                            <i className="ph ph-plus me-2"></i>
                            Thêm từ vựng
                          </Button>
                        )}
                      </div>

                      {(formData?.vocabulary?.items || []).length === 0 ? (
                        <div className="text-center py-5">
                          <i className="ph ph-book-bookmark display-1 text-muted opacity-25"></i>
                          <p className="text-muted mt-2">Chưa có từ vựng nào. {canEdit && 'Nhấn "Thêm từ vựng" để tạo mới.'}</p>
                        </div>
                      ) : (
                        <Row className="g-2">
                          {formData.vocabulary.items.map((item, idx) => {
                            const isSelected = previewVocabIndex === idx; // Check if selected for preview
                            
                            return (
                              <Col md={6} lg={4} key={idx}>
                                <Card 
                                  className={`border-0 h-100 ${isSelected ? 'border border-primary border-2 shadow-sm' : ''}`}
                                  style={{ backgroundColor: isSelected ? '#EEF2FF' : '#F8FAFE' }}
                                >
                                  <Card.Body className="p-3">
                                    {item.img && (
                                      <div className="mb-2">
                                        <img
                                          src={item.img}
                                          alt={item.word}
                                          className="w-100 rounded"
                                          style={{ height: '120px', objectFit: 'cover' }}
                                        />
                                      </div>
                                    )}
                                    <div className="text-center mb-2">
                                      <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>
                                        {item.word || <span className="text-muted fst-italic">Chưa có từ</span>}
                                      </h6>
                                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>
                                        Từ #{idx + 1}
                                        {isSelected && <Badge bg="primary" className="ms-2 small">Previewing</Badge>}
                                      </p>
                                    </div>
                                    <div className="d-flex gap-1">
                                      <Button
                                        variant={isSelected ? 'primary' : 'outline-secondary'}
                                        size="sm"
                                        className="flex-grow-1"
                                        onClick={() => handlePreviewVocab(idx)}
                                        title="Xem preview"
                                      >
                                        <i className="ph ph-eye"></i>
                                      </Button>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="flex-grow-1"
                                        onClick={() => openVocabModal(idx)}
                                      >
                                        <i className={`ph ${canEdit ? 'ph-pencil' : 'ph-eye'} me-1`}></i>
                                        {canEdit ? 'Sửa' : 'Xem'}
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            );
                          })}
                        </Row>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Preview Panel */}
          <Col lg={4}>
            <Card className="shadow-sm position-sticky" style={{ top: '20px' }}>
              <Card.Header className="bg-primary bg-gradient text-white">
                <i className="ph ph-eye me-2"></i>
                Preview - Student View
              </Card.Header>

              <Card.Body>
                {/* Video Preview */}
                {activeTab === 'video' && formData.videoURL && (
                  <div>
                    <p className="fw-semibold small mb-2">Video bài giảng:</p>
                    <video
                      src={formData.videoURL}
                      controls
                      className="w-100 rounded"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}

                {activeTab === 'video' && !formData.videoURL && (
                  <div className="text-center py-4 text-muted">
                    <i className="ph ph-video-camera display-4 opacity-25"></i>
                    <p className="small mt-2">Chưa có video</p>
                  </div>
                )}

                {/* Quiz Preview */}
                {activeTab === 'quiz' && previewQuizIndex !== null && formData?.quizzes?.quiz?.[previewQuizIndex] && (() => {
                  const quiz = formData.quizzes.quiz[previewQuizIndex];
                  const quizType = QUIZ_TYPES[quiz.Type];
                  
                  return (
                    <div>
                      <p className="fw-semibold small mb-2">
                        <Badge bg={quizType.color} className="me-2">
                          <i className={`ph ${quizType.icon} me-1`}></i>
                          {quizType.label}
                        </Badge>
                        Preview Quiz #{previewQuizIndex + 1}
                      </p>
                      
                      <Card className="border shadow-sm">
                        <Card.Body className="p-3">
                          {/* Image - no height limit */}
                          {quiz.Img && (
                            <div className="mb-3">
                              <img
                                src={quiz.Img}
                                className="w-100 rounded"
                                style={{ objectFit: 'cover' }}
                                alt="Quiz"
                              />
                            </div>
                          )}

                          {/* Question */}
                          <div className="mb-3">
                            <Badge bg="primary" className="mb-2">Question</Badge>
                            <p className="fw-semibold mb-0">{quiz.Question || 'Chưa có câu hỏi'}</p>
                          </div>

                          {/* Multiple Choice Preview */}
                          {quiz.Type === 'multiple-choice' && (
                            <div>
                              <p className="small text-muted mb-2">Lựa chọn:</p>
                              <ul className="list-unstyled d-flex flex-column gap-2">
                                {(quiz.Answer || []).map((ans, idx) => {
                                  const isCorrect = quiz.AnswerKey?.includes(ans);
                                  const letterLabel = String.fromCharCode(65 + idx);
                                  
                                  return (
                                    <li
                                      key={idx}
                                      className={`border rounded-pill px-3 py-2 d-flex align-items-center gap-2 ${
                                        isCorrect
                                          ? 'border-success bg-success bg-opacity-10 text-success fw-semibold'
                                          : 'border-secondary bg-light'
                                      }`}
                                      style={{ fontSize: '0.85rem' }}
                                    >
                                      <span className="fw-bold">{letterLabel}.</span>
                                      <span className="flex-grow-1">{ans || `Đáp án ${idx + 1}`}</span>
                                      {isCorrect && <i className="ph-fill ph-check-circle"></i>}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}

                          {/* Yes/No Preview */}
                          {quiz.Type === 'yes-no' && (
                            <div>
                              <p className="small text-muted mb-2">Câu hỏi Yes/No:</p>
                              <div className="d-flex flex-column gap-3">
                                {(quiz.Answer || []).map((statement, idx) => {
                                  const answer = quiz.AnswerKey?.[idx];
                                  
                                  return (
                                    <div key={idx}>
                                      <p className="mb-2 small fw-medium">{idx + 1}. {statement}</p>
                                      <div className="d-flex gap-2">
                                        <div
                                          className={`flex-grow-1 p-2 rounded border text-center small ${
                                            answer === 'Yes'
                                              ? 'bg-success bg-opacity-10 border-success text-success fw-semibold'
                                              : 'border-secondary bg-light'
                                          }`}
                                        >
                                          ✓ Yes
                                          {answer === 'Yes' && <i className="ph-fill ph-check-circle ms-1"></i>}
                                        </div>
                                        <div
                                          className={`flex-grow-1 p-2 rounded border text-center small ${
                                            answer === 'No'
                                              ? 'bg-success bg-opacity-10 border-success text-success fw-semibold'
                                              : 'border-secondary bg-light'
                                          }`}
                                        >
                                          ✗ No
                                          {answer === 'No' && <i className="ph-fill ph-check-circle ms-1"></i>}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Spell Preview */}
                          {quiz.Type === 'spell' && (
                            <div>
                              <p className="small text-muted mb-2">Spell the words based on the questions:</p>
                              <div className="d-flex flex-column gap-3">
                                {(quiz.Answer || []).map((question, idx) => {
                                  const word = quiz.AnswerKey?.[idx] || '';
                                  
                                  return (
                                    <div key={idx}>
                                      <p className="mb-2 small fw-medium">
                                        {idx + 1}. {question || '(No question)'}
                                      </p>
                                      <div className="d-flex gap-1 justify-content-center">
                                        {Array.from({ length: word.length || 3 }).map((_, letterIdx) => (
                                          <div
                                            key={letterIdx}
                                            className="border border-2 border-secondary rounded text-center fw-bold bg-light"
                                            style={{
                                              width: '32px',
                                              height: '32px',
                                              lineHeight: '28px',
                                              fontSize: '1rem',
                                            }}
                                          >
                                            {word[letterIdx] || ''}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Word from Box Preview */}
                          {quiz.Type === 'word-from-box' && (
                            <div>
                              {/* Word Box */}
                              <div className="p-2 bg-primary bg-opacity-10 border border-primary rounded mb-3">
                                <p className="small fw-semibold mb-1 text-primary">
                                  <i className="ph ph-package me-1"></i>Word Box:
                                </p>
                                <div className="d-flex flex-wrap gap-1">
                                  {(quiz.AnswerKey || []).map((word, idx) => (
                                    <Badge key={idx} bg="primary" className="px-2 py-1">
                                      {word || `Từ ${idx + 1}`}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Sentences */}
                              <p className="small text-muted mb-2">Điền vào chỗ trống:</p>
                              <div className="d-flex flex-column gap-2">
                                {(quiz.Answer || []).map((sentence, idx) => {
                                  const parts = sentence.split('___');
                                  
                                  return (
                                    <div key={idx} className="small">
                                      <span className="fw-medium text-muted me-1">{idx + 1}.</span>
                                      {parts.map((part, partIdx) => (
                                        <span key={partIdx}>
                                          {part}
                                          {partIdx < parts.length - 1 && (
                                            <span className="border-bottom border-2 border-primary px-2 mx-1">___</span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </div>
                  );
                })()}

                {activeTab === 'quiz' && previewQuizIndex === null && (
                  <div className="text-center py-5 text-muted">
                    <i className="ph ph-question display-4 opacity-25"></i>
                    <p className="small mt-2">Nhấn nút <i className="ph ph-eye"></i> để xem preview</p>
                  </div>
                )}

                {/* Vocab Preview */}
                {activeTab === 'vocab' && previewVocabIndex !== null && formData?.vocabulary?.items?.[previewVocabIndex] && (() => {
                  const vocab = formData.vocabulary.items[previewVocabIndex];
                  
                  return (
                    <div>
                      <p className="fw-semibold small mb-2">
                        Preview Flashcard #{previewVocabIndex + 1}
                      </p>
                      
                      {/* Front side */}
                      <Card className="border-0 shadow-sm mb-3">
                        <Card.Body className="p-0">
                          {vocab.img && (
                            <div className="bg-gradient-primary d-flex align-items-center justify-content-center p-3">
                              <img
                                src={vocab.img}
                                className="w-100 rounded"
                                style={{ objectFit: 'cover' }}
                                alt="Vocabulary"
                              />
                            </div>
                          )}
                          <div className="p-3 text-center bg-light">
                            <p className="small text-muted mb-1">FRONT</p>
                            <p className="small text-muted mb-0">
                              <i className="ph ph-hand-pointing me-1"></i>
                              Click to flip
                            </p>
                          </div>
                        </Card.Body>
                      </Card>

                      {/* Back side */}
                      <Card className="border-0 shadow-sm bg-primary text-white">
                        <Card.Body className="p-4 text-center">
                          <p className="small text-white-50 mb-2">BACK</p>
                          <h4 className="fw-bold mb-0">{vocab.word || 'word'}</h4>
                        </Card.Body>
                      </Card>
                    </div>
                  );
                })()}

                {activeTab === 'vocab' && previewVocabIndex === null && (
                  <div className="text-center py-5 text-muted">
                    <i className="ph ph-book-bookmark display-4 opacity-25"></i>
                    <p className="small mt-2">Nhấn nút <i className="ph ph-eye"></i> để xem preview</p>
                  </div>
                )}

                {/* Default Session Info */}
                {activeTab === 'basic' && (
                  <div>
                    <p className="fw-semibold small mb-2">Thông tin Session:</p>
                    <div className="p-3 rounded" style={{ backgroundColor: '#F8FAFE' }}>
                      <h6 className="fw-bold mb-2">{formData.title || 'Tiêu đề session'}</h6>
                      {formData.sessionType && (
                        <Badge bg={SESSION_TYPES[formData.sessionType]?.color || 'secondary'} className="mb-2">
                          <i className={`ph ${SESSION_TYPES[formData.sessionType]?.icon} me-1`}></i>
                          {SESSION_TYPES[formData.sessionType]?.label}
                        </Badge>
                      )}
                      <p className="text-muted small mb-2">
                        {formData.description || 'Chưa có mô tả'}
                      </p>
                      <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                        <span>
                          <i className="ph ph-question me-1"></i>
                          {formData?.quizzes?.quiz?.length || 0} quiz
                        </span>
                        <span>
                          <i className="ph ph-book-bookmark me-1"></i>
                          {formData?.vocabulary?.items?.length || 0} từ vựng
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal for Quiz/Vocab Edit */}
      {editModal.show && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editModal.type === 'quiz' ? (
                    <>
                      <i className="ph ph-question me-2"></i>
                      {canEdit ? 'Chỉnh sửa Quiz' : 'Xem Quiz'} #{editModal.index + 1}
                    </>
                  ) : (
                    <>
                      <i className="ph ph-book-bookmark me-2"></i>
                      {canEdit ? 'Chỉnh sửa Từ vựng' : 'Xem Từ vựng'} #{editModal.index + 1}
                    </>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>

              <div className="modal-body">
                {editModal.type === 'quiz' && editItemData && (
                  <div>
                    {/* Quiz Type Display (Read-only) */}
                    <div className="mb-3">
                      <Form.Label className="fw-semibold small text-muted">Loại Quiz</Form.Label>
                      <div>
                        <Badge bg={QUIZ_TYPES[editItemData.Type].color} className="px-3 py-2">
                          <i className={`ph ${QUIZ_TYPES[editItemData.Type].icon} me-2`}></i>
                          {QUIZ_TYPES[editItemData.Type].label}
                        </Badge>
                        <span className="ms-2 small text-muted">{QUIZ_TYPES[editItemData.Type].description}</span>
                      </div>
                    </div>

                    {/* Quiz Type Specific Form */}
                    {editItemData.Type === 'multiple-choice' && (
                      <MultipleChoiceQuizForm
                        editItemData={editItemData}
                        canEdit={canEdit}
                        handleModalFieldChange={handleModalFieldChange}
                        handleModalImageFileChange={handleModalImageFileChange}
                        handleModalAnswerList={handleModalAnswerList}
                        handleModalAddAnswer={handleModalAddAnswer}
                        handleModalRemoveAnswer={handleModalRemoveAnswer}
                      />
                    )}
                    
                    {editItemData.Type === 'yes-no' && (
                      <YesNoQuizForm
                        editItemData={editItemData}
                        canEdit={canEdit}
                        handleModalFieldChange={handleModalFieldChange}
                        handleModalImageFileChange={handleModalImageFileChange}
                        handleModalAnswerList={handleModalAnswerList}
                        handleModalAddAnswer={handleModalAddAnswer}
                        handleModalRemoveAnswer={handleModalRemoveAnswer}
                      />
                    )}
                    
                    {editItemData.Type === 'spell' && (
                      <SpellQuizForm
                        editItemData={editItemData}
                        canEdit={canEdit}
                        handleModalFieldChange={handleModalFieldChange}
                        handleModalImageFileChange={handleModalImageFileChange}
                        handleModalAnswerList={handleModalAnswerList}
                        handleModalAddAnswer={handleModalAddAnswer}
                        handleModalRemoveAnswer={handleModalRemoveAnswer}
                      />
                    )}
                    
                    {editItemData.Type === 'word-from-box' && (
                      <WordFromBoxQuizForm
                        editItemData={editItemData}
                        canEdit={canEdit}
                        handleModalFieldChange={handleModalFieldChange}
                        handleModalImageFileChange={handleModalImageFileChange}
                        handleModalAnswerList={handleModalAnswerList}
                        handleModalAddAnswer={handleModalAddAnswer}
                        handleModalRemoveAnswer={handleModalRemoveAnswer}
                      />
                    )}
                  </div>
                )}

                {editModal.type === 'vocab' && editItemData && (
                  <div>
                    {/* Vocabulary Word */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Từ vựng <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        value={editItemData.word}
                        onChange={(e) => handleModalFieldChange('word', e.target.value)}
                        placeholder="Nhập từ vựng"
                        disabled={!canEdit}
                      />
                    </Form.Group>

                    {/* Vocabulary Image */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Ảnh minh họa (URL)</Form.Label>
                      <Form.Control
                        value={editItemData.img}
                        onChange={(e) => handleModalFieldChange('img', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        disabled={!canEdit}
                      />
                      {canEdit && (
                        <>
                          <Form.Text className="text-muted small d-block mb-2">
                            Hoặc tải lên file ảnh:
                          </Form.Text>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleModalImageFileChange(e, 'img')}
                          />
                        </>
                      )}
                      {editItemData.img && (
                        <div className="mt-2">
                          <img
                            src={editItemData.img}
                            alt="Preview"
                            className="w-100 rounded"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </Form.Group>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                {canEdit && (
                  <Button variant="danger" onClick={handleDeleteFromModal}>
                    <i className="ph ph-trash me-2"></i>
                    Xóa
                  </Button>
                )}
                <Button variant="secondary" onClick={closeEditModal}>
                  {canEdit ? 'Hủy' : 'Đóng'}
                </Button>
                {canEdit && (
                  <Button variant="primary" onClick={handleSaveModal}>
                    <i className="ph ph-check me-2"></i>
                    Lưu
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Type Selection Modal */}
      <Modal show={showQuizTypeModal} onHide={() => setShowQuizTypeModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ph ph-plus-circle me-2"></i>
            Chọn loại Quiz
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Chọn loại quiz bạn muốn tạo. Mỗi loại có cấu trúc và mục đích khác nhau.
          </p>
          <Row className="g-3">
            {Object.entries(QUIZ_TYPES).map(([key, type]) => (
              <Col md={6} key={key}>
                <Card
                  className="h-100 border-2 cursor-pointer hover-shadow"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onClick={() => handleQuizTypeSelected(key)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `var(--bs-${type.color})`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-start gap-3">
                      <div 
                        className={`bg-${type.color} bg-opacity-10 rounded-circle p-3 d-flex align-items-center justify-content-center`}
                        style={{ width: '60px', height: '60px' }}
                      >
                        <i 
                          className={`ph ${type.icon} text-${type.color}`} 
                          style={{ fontSize: '28px' }}
                        ></i>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="fw-bold mb-2">{type.label}</h5>
                        <p className="text-muted small mb-0">{type.description}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuizTypeModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default CamSessionEdit;

