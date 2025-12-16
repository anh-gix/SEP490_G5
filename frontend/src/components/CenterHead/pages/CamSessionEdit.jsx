import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Tabs, Tab } from 'react-bootstrap';
import camSessionService from '../../../services/camSessionService';
import {
  QUIZ_TYPES,
  SESSION_TYPES,
  validateQuiz,
  validateVocabulary,
  getAnswerPlaceholder,
  getAnswerKeyPlaceholder,
} from './camSessionHelpers';

const emptyQuiz = () => ({
  Type: 'multiple-choice',
  Img: '',
  Question: '',
  Answer: [''],
  AnswerKey: [''],
});

const emptyVocabularyItem = () => ({
  word: '',
  img: '',
});

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
      alert('Vui lòng chọn file video hợp lệ (mp4, webm, ...).');
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
    setFormData((prev) => ({
      ...prev,
      quizzes: { quiz: [...(prev?.quizzes?.quiz || []), emptyQuiz()] },
    }));
  };

  const handleRemoveQuiz = (index) => {
    if (!confirm('Bạn có chắc muốn xóa quiz này?')) return;
    setFormData((prev) => ({
      ...prev,
      quizzes: { quiz: (prev?.quizzes?.quiz || []).filter((_, i) => i !== index) },
    }));
  };

  const handleAddVocabulary = () => {
    setFormData((prev) => ({
      ...prev,
      vocabulary: { items: [...(prev?.vocabulary?.items || []), emptyVocabularyItem()] },
    }));
  };

  const handleRemoveVocabulary = (index) => {
    if (!confirm('Bạn có chắc muốn xóa từ vựng này?')) return;
    setFormData((prev) => ({
      ...prev,
      vocabulary: { items: (prev?.vocabulary?.items || []).filter((_, i) => i !== index) },
    }));
  };

  const openQuizModal = (index) => {
    const quiz = formData?.quizzes?.quiz?.[index];
    if (!quiz) return;
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
    setEditModal({ show: true, type: 'vocab', index });
    setEditItemData({ ...vocab });
  };

  const closeEditModal = () => {
    setEditModal({ show: false, type: null, index: null });
    setEditItemData(null);
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
      alert('Vui lòng chọn file ảnh hợp lệ (png, jpg, jpeg, webp, ...).');
      event.target.value = '';
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setEditItemData((prev) => ({
      ...prev,
      [field]: localUrl,
    }));
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
        alert('Vui lòng sửa các lỗi:\n\n' + errors.join('\n'));
        return;
      }

      setFormData((prev) => {
        const quizList = prev?.quizzes?.quiz ? [...prev.quizzes.quiz] : [];
        quizList[editModal.index] = { ...editItemData };
        return { ...prev, quizzes: { quiz: quizList } };
      });
    } else if (editModal.type === 'vocab') {
      const errors = validateVocabulary(editItemData);
      if (errors.length > 0) {
        alert('Vui lòng sửa các lỗi:\n\n' + errors.join('\n'));
        return;
      }

      setFormData((prev) => {
        const vocabList = prev?.vocabulary?.items ? [...prev.vocabulary.items] : [];
        vocabList[editModal.index] = { ...editItemData };
        return { ...prev, vocabulary: { items: vocabList } };
      });
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
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
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
      const errorMsg = quizErrors
        .map((q) => `Quiz #${q.index + 1}:\n${q.errors.join('\n')}`)
        .join('\n\n');
      alert('Có lỗi trong các quiz:\n\n' + errorMsg);
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
      alert('Có lỗi trong từ vựng. Vui lòng kiểm tra lại.');
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
      alert('Cập nhật CAM Session thành công');
      navigate(-1);
    } catch (error) {
      console.error('Error updating cam session:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật CAM Session');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

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
                  <Button variant="outline-secondary" onClick={handleBack}>
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

                            return (
                              <Card
                                key={index}
                                className={`border-0 ${hasErrors ? 'border-start border-danger border-3' : ''}`}
                                style={{
                                  backgroundColor: hasErrors ? '#FEF2F2' : '#F8FAFE',
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
                                      </div>

                                      <p className="small mb-1">
                                        {quiz.Question || <span className="text-muted fst-italic">Chưa có câu hỏi</span>}
                                      </p>

                                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {quiz.Answer?.filter((a) => a?.trim()).length || 0} đáp án •{' '}
                                        {quiz.AnswerKey?.filter((k) => k?.trim()).length || 0} đáp án đúng
                                      </div>
                                    </div>

                                    <Button
                                      variant={hasErrors ? 'danger' : 'outline-primary'}
                                      size="sm"
                                      onClick={() => openQuizModal(index)}
                                    >
                                      <i className={`ph ${canEdit ? 'ph-pencil' : 'ph-eye'}`}></i>
                                      {canEdit ? ' Sửa' : ' Xem'}
                                    </Button>
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
                          {formData.vocabulary.items.map((item, idx) => (
                            <Col md={6} lg={4} key={idx}>
                              <Card className="border-0 h-100" style={{ backgroundColor: '#F8FAFE' }}>
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
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="w-100"
                                    onClick={() => openVocabModal(idx)}
                                  >
                                    <i className={`ph ${canEdit ? 'ph-pencil' : 'ph-eye'} me-1`}></i>
                                    {canEdit ? 'Sửa' : 'Xem'}
                                  </Button>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
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
                {activeTab === 'quiz' && editModal.show && editModal.type === 'quiz' && editItemData && (
                  <div>
                    <p className="fw-semibold small mb-2">Preview Quiz:</p>
                    <Card className="border-0" style={{ backgroundColor: '#F8FAFE' }}>
                      <Card.Body className="p-3">
                        {editItemData.Img && (
                          <img
                            src={editItemData.Img}
                            className="w-100 rounded mb-2"
                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                            alt="Quiz"
                          />
                        )}

                        <p className="fw-semibold small mb-2">{editItemData.Question || 'Câu hỏi...'}</p>

                        {editItemData.Type === 'multiple-choice' && (
                          <div className="d-flex flex-column gap-2">
                            {(editItemData.Answer || ['']).map((ans, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded border ${
                                  editItemData.AnswerKey?.[0] === ans
                                    ? 'bg-success bg-opacity-10 border-success'
                                    : 'bg-white border-secondary'
                                }`}
                                style={{ fontSize: '0.8rem' }}
                              >
                                {ans || `Đáp án ${idx + 1}`}
                                {editItemData.AnswerKey?.[0] === ans && (
                                  <i className="ph ph-check-circle text-success float-end"></i>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {editItemData.Type === 'yes-no' && (
                          <div className="d-flex gap-2">
                            <div
                              className={`flex-grow-1 p-2 rounded border text-center ${
                                editItemData.AnswerKey?.includes('Yes')
                                  ? 'bg-success bg-opacity-10 border-success'
                                  : 'bg-white border-secondary'
                              }`}
                              style={{ fontSize: '0.8rem' }}
                            >
                              Yes
                              {editItemData.AnswerKey?.includes('Yes') && (
                                <i className="ph ph-check-circle text-success ms-2"></i>
                              )}
                            </div>
                            <div
                              className={`flex-grow-1 p-2 rounded border text-center ${
                                editItemData.AnswerKey?.includes('No')
                                  ? 'bg-success bg-opacity-10 border-success'
                                  : 'bg-white border-secondary'
                              }`}
                              style={{ fontSize: '0.8rem' }}
                            >
                              No
                              {editItemData.AnswerKey?.includes('No') && (
                                <i className="ph ph-check-circle text-success ms-2"></i>
                              )}
                            </div>
                          </div>
                        )}

                        {editItemData.Type === 'spell' && (
                          <div className="text-center py-3">
                            <Form.Control
                              placeholder="Nhập câu trả lời..."
                              disabled
                              className="text-center"
                              style={{ fontSize: '0.9rem' }}
                            />
                            <p className="text-muted small mt-2">
                              Đáp án: {editItemData.AnswerKey?.[0] || '___'}
                            </p>
                          </div>
                        )}

                        {editItemData.Type === 'word-from-box' && (
                          <div>
                            <div className="p-2 bg-light rounded mb-2">
                              <p className="small fw-semibold mb-1">Hộp từ:</p>
                              <div className="d-flex flex-wrap gap-1">
                                {(editItemData.Answer || ['']).map((word, idx) => (
                                  <Badge key={idx} bg="secondary">
                                    {word || `Từ ${idx + 1}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <p className="small">
                              {editItemData.Question?.split('___').map((part, idx, arr) => (
                                <span key={idx}>
                                  {part}
                                  {idx < arr.length - 1 && (
                                    <span className="text-primary fw-bold">___</span>
                                  )}
                                </span>
                              )) || 'Câu với chỗ trống ___'}
                            </p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                )}

                {activeTab === 'quiz' && !editModal.show && (
                  <div className="text-center py-4 text-muted">
                    <i className="ph ph-question display-4 opacity-25"></i>
                    <p className="small mt-2">Chọn quiz để xem preview</p>
                  </div>
                )}

                {/* Vocab Preview */}
                {activeTab === 'vocab' && editModal.show && editModal.type === 'vocab' && editItemData && (
                  <div>
                    <p className="fw-semibold small mb-2">Preview Flashcard:</p>
                    <Card className="border-0 bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <Card.Body className="p-4 text-center">
                        {editItemData.img && (
                          <img
                            src={editItemData.img}
                            className="w-100 rounded mb-3"
                            style={{ maxHeight: '180px', objectFit: 'cover' }}
                            alt="Vocabulary"
                          />
                        )}
                        <h4 className="fw-bold">{editItemData.word || 'word'}</h4>
                      </Card.Body>
                    </Card>
                  </div>
                )}

                {activeTab === 'vocab' && !editModal.show && (
                  <div className="text-center py-4 text-muted">
                    <i className="ph ph-book-bookmark display-4 opacity-25"></i>
                    <p className="small mt-2">Chọn từ vựng để xem preview</p>
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
                    {/* Quiz Type Selection */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Loại Quiz <span className="text-danger">*</span>
                      </Form.Label>
                      <Row className="g-2">
                        {Object.entries(QUIZ_TYPES).map(([key, type]) => (
                          <Col md={6} key={key}>
                            <Card
                              className={`cursor-pointer border-2 ${
                                editItemData.Type === key
                                  ? `border-${type.color} bg-${type.color} bg-opacity-10`
                                  : 'border-secondary border-opacity-25'
                              }`}
                              onClick={() => canEdit && handleModalFieldChange('Type', key)}
                              style={{ cursor: canEdit ? 'pointer' : 'default' }}
                            >
                              <Card.Body className="p-2">
                                <div className="d-flex align-items-start gap-2">
                                  <i className={`ph ${type.icon} text-${type.color}`} style={{ fontSize: '1.5rem' }}></i>
                                  <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-1 small">{type.label}</h6>
                                    <p className="mb-0" style={{ fontSize: '0.75rem' }}>
                                      {type.description}
                                    </p>
                                  </div>
                                  {editItemData.Type === key && (
                                    <i className={`ph ph-check-circle text-${type.color}`}></i>
                                  )}
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>

                      {editItemData.Type && (
                        <Alert variant={QUIZ_TYPES[editItemData.Type].color} className="mt-2 small">
                          <strong>Hướng dẫn:</strong>
                          <br />
                          Answer: {QUIZ_TYPES[editItemData.Type].answerFormat}
                          <br />
                          AnswerKey: {QUIZ_TYPES[editItemData.Type].answerKeyFormat}
                        </Alert>
                      )}
                    </Form.Group>

                    {/* Image URL */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Ảnh minh họa (URL)</Form.Label>
                      <Form.Control
                        value={editItemData.Img}
                        onChange={(e) => handleModalFieldChange('Img', e.target.value)}
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
                            onChange={(e) => handleModalImageFileChange(e, 'Img')}
                          />
                        </>
                      )}
                      {editItemData.Img && (
                        <div className="mt-2">
                          <img
                            src={editItemData.Img}
                            alt="Preview"
                            className="w-100 rounded"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </Form.Group>

                    {/* Question */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Câu hỏi <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={editItemData.Question}
                        onChange={(e) => handleModalFieldChange('Question', e.target.value)}
                        placeholder={
                          editItemData.Type === 'word-from-box'
                            ? 'Nhập câu với chỗ trống, dùng ___ để đánh dấu. Ví dụ: The ___ is blue.'
                            : 'Nhập câu hỏi'
                        }
                        disabled={!canEdit}
                      />
                    </Form.Group>

                    {/* Answer */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Answer (Các đáp án) <span className="text-danger">*</span>
                      </Form.Label>
                      {(editItemData.Answer || ['']).map((ans, idx) => (
                        <div key={idx} className="d-flex gap-2 mb-2">
                          <Form.Control
                            value={ans}
                            onChange={(e) => handleModalAnswerList('Answer', idx, e.target.value)}
                            placeholder={getAnswerPlaceholder(editItemData.Type, idx)}
                            disabled={!canEdit}
                          />
                          {canEdit && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleModalRemoveAnswer('Answer', idx)}
                            >
                              <i className="ph ph-x"></i>
                            </Button>
                          )}
                        </div>
                      ))}
                      {canEdit && (
                        <Button variant="outline-primary" size="sm" onClick={() => handleModalAddAnswer('Answer')}>
                          <i className="ph ph-plus me-2"></i>
                          Thêm đáp án
                        </Button>
                      )}
                    </Form.Group>

                    {/* AnswerKey */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        AnswerKey (Đáp án đúng) <span className="text-danger">*</span>
                      </Form.Label>
                      {(editItemData.AnswerKey || ['']).map((key, idx) => (
                        <div key={idx} className="d-flex gap-2 mb-2">
                          {editItemData.Type === 'yes-no' ? (
                            <Form.Select
                              value={key}
                              onChange={(e) => handleModalAnswerList('AnswerKey', idx, e.target.value)}
                              disabled={!canEdit}
                            >
                              <option value="">-- Chọn --</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </Form.Select>
                          ) : (
                            <Form.Control
                              value={key}
                              onChange={(e) => handleModalAnswerList('AnswerKey', idx, e.target.value)}
                              placeholder={getAnswerKeyPlaceholder(editItemData.Type, idx)}
                              disabled={!canEdit}
                            />
                          )}
                          {canEdit && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleModalRemoveAnswer('AnswerKey', idx)}
                            >
                              <i className="ph ph-x"></i>
                            </Button>
                          )}
                        </div>
                      ))}
                      {canEdit && (
                        <Button variant="outline-primary" size="sm" onClick={() => handleModalAddAnswer('AnswerKey')}>
                          <i className="ph ph-plus me-2"></i>
                          Thêm đáp án đúng
                        </Button>
                      )}
                    </Form.Group>
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
    </div>
  );
};

export default CamSessionEdit;

