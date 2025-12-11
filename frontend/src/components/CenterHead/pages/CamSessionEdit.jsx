import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../compo/Button';
import Modal from '../compo/Modal';
import camSessionService from '../../../services/camSessionService';

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

  // Determine base path
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [editModal, setEditModal] = useState({
    type: null, // 'quiz' | 'vocab'
    index: null,
  });
  const [editItemData, setEditItemData] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadCamSession();
    }
  }, [sessionId]);

  const loadCamSession = async () => {
    try {
      setLoading(true);
      const response = await camSessionService.getCamSessionById(sessionId);
      const sessionPayload = response?.data || response;

      setFormData({
        title: sessionPayload?.title || '',
        sessionType: sessionPayload?.sessionType || 'reading',
        description: sessionPayload?.description || '',
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
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSetQuizCount = (count) => {
    let num = Number(count) || 0;
    if (num > 10) {
      num = 10;
      alert('Số lượng quiz không được vượt quá 10.');
    }
    const target = Math.max(0, num);
    setFormData((prev) => {
      const current = prev?.quizzes?.quiz ? [...prev.quizzes.quiz] : [];
      const resized = current.slice(0, target);
      while (resized.length < target) {
        resized.push(emptyQuiz());
      }
      return { ...prev, quizzes: { quiz: resized } };
    });
    setExpandedQuizIndex(null);
  };

  const handleAddQuiz = () => {
    setFormData((prev) => ({
      ...prev,
      quizzes: { quiz: [...(prev?.quizzes?.quiz || []), emptyQuiz()] },
    }));
  };

  const handleRemoveQuiz = (index) => {
    setFormData((prev) => ({
      ...prev,
      quizzes: { quiz: (prev?.quizzes?.quiz || []).filter((_, i) => i !== index) },
    }));
  };

  const handleSetVocabularyCount = (count) => {
    let num = Number(count) || 0;
    if (num > 10) {
      num = 10;
      alert('Số lượng từ vựng không được vượt quá 10.');
    }
    const target = Math.max(0, num);
    setFormData((prev) => {
      const current = prev?.vocabulary?.items ? [...prev.vocabulary.items] : [];
      const resized = current.slice(0, target);
      while (resized.length < target) {
        resized.push(emptyVocabularyItem());
      }
      return { ...prev, vocabulary: { items: resized } };
    });
    setExpandedVocabIndex(null);
  };

  const handleAddVocabulary = () => {
    setFormData((prev) => ({
      ...prev,
      vocabulary: { items: [...(prev?.vocabulary?.items || []), emptyVocabularyItem()] },
    }));
  };

  const handleRemoveVocabulary = (index) => {
    setFormData((prev) => ({
      ...prev,
      vocabulary: { items: (prev?.vocabulary?.items || []).filter((_, i) => i !== index) },
    }));
  };

  const openQuizModal = (index) => {
    const quiz = formData?.quizzes?.quiz?.[index];
    if (!quiz) return;
    setEditModal({ type: 'quiz', index });
    setEditItemData({
      ...quiz,
      Answer: Array.isArray(quiz.Answer) && quiz.Answer.length ? [...quiz.Answer] : [''],
      AnswerKey: Array.isArray(quiz.AnswerKey) && quiz.AnswerKey.length ? [...quiz.AnswerKey] : [''],
    });
  };

  const openVocabModal = (index) => {
    const vocab = formData?.vocabulary?.items?.[index];
    if (!vocab) return;
    setEditModal({ type: 'vocab', index });
    setEditItemData({ ...vocab });
  };

  const closeEditModal = () => {
    setEditModal({ type: null, index: null });
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
    if (editModal.type === 'quiz') {
      setFormData((prev) => {
        const quizList = prev?.quizzes?.quiz ? [...prev.quizzes.quiz] : [];
        quizList[editModal.index] = { ...quizList[editModal.index], ...editItemData };
        return { ...prev, quizzes: { quiz: quizList } };
      });
    } else if (editModal.type === 'vocab') {
      setFormData((prev) => {
        const vocabList = prev?.vocabulary?.items ? [...prev.vocabulary.items] : [];
        vocabList[editModal.index] = { ...vocabList[editModal.index], ...editItemData };
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

  const handleSave = async () => {
    if (!formData?.title?.trim()) {
      alert('Tiêu đề không được để trống');
      return;
    }

    try {
      setSaving(true);
      await camSessionService.updateCamSession(sessionId, {
        title: formData.title.trim(),
        sessionType: formData.sessionType,
        description: formData.description,
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cam-session-edit">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h5 className="mb-1">Chỉnh sửa CAM Session</h5>
          <p className="text-muted mb-0">Quản lý nội dung, quiz và từ vựng của buổi học.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline" icon="ph ph-arrow-left" onClick={handleBack}>
            Quay lại
          </Button>
          <Button
            variant="primary"
            icon="ph ph-check"
            onClick={handleSave}
            disabled={saving}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="d-flex flex-column gap-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Tiêu đề</label>
            <input
              className="form-control"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Loại</label>
            <select
              className="form-select"
              value={formData.sessionType}
              onChange={(e) => handleFieldChange('sessionType', e.target.value)}
            >
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="speaking">Speaking</option>
              <option value="writing">Writing</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Mô tả</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Video URL</label>
            <input
              className="form-control"
              value={formData.videoURL}
              onChange={(e) => handleFieldChange('videoURL', e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-3 p-3">
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Số lượng quiz</label>
              <input
                type="number"
                min="0"
                max="10"
                className="form-control"
                value={formData?.quizzes?.quiz?.length || 0}
                onChange={(e) => handleSetQuizCount(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="col-md-8 d-flex justify-content-end">
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon="ph ph-plus"
                  onClick={() => {
                    if ((formData?.quizzes?.quiz?.length || 0) >= 10) {
                      alert('Số lượng quiz không được vượt quá 10.');
                      return;
                    }
                    handleAddQuiz();
                  }}
                  disabled={saving}
                >
                  Thêm 1 quiz
                </Button>
              </div>
            </div>
          </div>
          {(formData?.quizzes?.quiz || []).length === 0 ? (
            <p className="text-muted mb-0">Chưa có quiz nào.</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-3">
              {formData.quizzes.quiz.map((quiz, index) => (
                <div key={`quiz-${index}`} className="col">
                  <div className="border rounded-3 p-3 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong>Quiz #{index + 1}</strong>
                          <p className="text-muted small mb-0">
                            {quiz.Question ? quiz.Question.slice(0, 80) : 'Chưa có nội dung câu hỏi'}
                          </p>
                        </div>
                        <span className="badge bg-neutral-100 text-neutral-700">
                          {quiz.Type || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-1 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        icon="ph ph-pencil"
                        onClick={() => openQuizModal(index)}
                        disabled={saving}
                      >
                        Xem Chi Tiết
                      </Button>                     
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-3 p-3">
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Số lượng từ vựng</label>
              <input
                type="number"
                min="0"
                max="10"
                className="form-control"
                value={formData?.vocabulary?.items?.length || 0}
                onChange={(e) => handleSetVocabularyCount(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="col-md-8 d-flex justify-content-end">
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon="ph ph-plus"
                  onClick={() => {
                    if ((formData?.vocabulary?.items?.length || 0) >= 10) {
                      alert('Số lượng từ vựng không được vượt quá 10.');
                      return;
                    }
                    handleAddVocabulary();
                  }}
                  disabled={saving}
                >
                  Thêm 1 từ vựng
                </Button>
              </div>
            </div>
          </div>
          {(formData?.vocabulary?.items || []).length === 0 ? (
            <p className="text-muted mb-0">Chưa có từ vựng nào.</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-3">
              {formData.vocabulary.items.map((item, idx) => (
                <div key={`vocab-${idx}`} className="col">
                  <div className="border rounded-3 p-3 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <strong className="d-block mb-1">Từ #{idx + 1}</strong>
                    </div>
                    <div className="d-flex gap-1 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        icon="ph ph-pencil"
                        onClick={() => openVocabModal(idx)}
                        disabled={saving}
                      >
                        Xem Chi Tiết
                      </Button>
                    
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        show={!!editModal.type}
        onClose={closeEditModal}
        title={
          editModal.type === 'quiz'
            ? `Chỉnh sửa Quiz #${(editModal.index ?? 0) + 1}`
            : editModal.type === 'vocab'
              ? `Chỉnh sửa Từ vựng #${(editModal.index ?? 0) + 1}`
              : ''
        }
        size="lg"
        footer={
          <div className="d-flex justify-content-between align-items-center w-100">
            <Button
              variant="danger"
              icon="ph ph-trash"
              onClick={handleDeleteFromModal}
              disabled={saving || editModal.index == null}
            >
              Xóa mục này
            </Button>
            <div className="d-flex gap-2">
              <Button variant="outline" onClick={closeEditModal} disabled={saving}>
                Hủy
              </Button>
              <Button
                variant="primary"
                icon="ph ph-check"
                onClick={handleSaveModal}
                disabled={saving || !editItemData}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        }
      >
        {!editItemData ? (
          <p>Đang tải dữ liệu...</p>
        ) : editModal.type === 'quiz' ? (
          <div className="d-flex flex-column gap-3">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Loại</label>
                <select
                  className="form-select"
                  value={editItemData.Type || 'multiple-choice'}
                  onChange={(e) => handleModalFieldChange('Type', e.target.value)}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="yes-no">Yes/No</option>
                  <option value="spell">Spell</option>
                  <option value="word-from-box">Word from box</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label">Ảnh</label>
                <div className="d-flex flex-column gap-2">
                  <input
                    className="form-control"
                    placeholder="Dán URL ảnh..."
                    value={editItemData.Img || ''}
                    onChange={(e) => handleModalFieldChange('Img', e.target.value)}
                  />
                  <div className="d-flex flex-column gap-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => handleModalImageFileChange(e, 'Img')}
                    />
                    <p className="text-xs text-neutral-500 mb-0">
                      <i className="ph ph-info me-1"></i>
                      Bạn có thể dán URL ảnh hoặc chọn file từ thiết bị. File sẽ được hiển thị bằng URL tạm thời.
                    </p>
                    {editItemData.Img && (
                      <div className="mt-1">
                        <img
                          src={editItemData.Img}
                          alt="Quiz preview"
                          style={{ maxHeight: '160px', borderRadius: '8px' }}
                          className="border border-neutral-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Câu hỏi</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={editItemData.Question || ''}
                  onChange={(e) => handleModalFieldChange('Question', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Đáp án</label>
              {(editItemData.Answer || ['']).map((answer, idx) => (
                <div key={`modal-answer-${idx}`} className="d-flex gap-2 mb-2">
                  <input
                    className="form-control"
                    value={answer}
                    onChange={(e) => handleModalAnswerList('Answer', idx, e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon="ph ph-x"
                    onClick={() => handleModalRemoveAnswer('Answer', idx)}
                  />
                </div>
              ))}
              <Button
                variant="secondary"
                size="xs"
                icon="ph ph-plus"
                onClick={() => handleModalAddAnswer('Answer')}
              >
                Thêm đáp án
              </Button>
            </div>

            <div>
              <label className="form-label">Đáp án đúng</label>
              {(editItemData.AnswerKey || ['']).map((answer, idx) => (
                <div key={`modal-answer-key-${idx}`} className="d-flex gap-2 mb-2">
                  <input
                    className="form-control"
                    value={answer}
                    onChange={(e) => handleModalAnswerList('AnswerKey', idx, e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon="ph ph-x"
                    onClick={() => handleModalRemoveAnswer('AnswerKey', idx)}
                  />
                </div>
              ))}
              <Button
                variant="secondary"
                size="xs"
                icon="ph ph-plus"
                onClick={() => handleModalAddAnswer('AnswerKey')}
              >
                Thêm đáp án đúng
              </Button>
            </div>
          </div>
        ) : editModal.type === 'vocab' ? (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Từ vựng</label>
              <input
                className="form-control"
                value={editItemData.word || ''}
                onChange={(e) => handleModalFieldChange('word', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Ảnh</label>
              <div className="d-flex flex-column gap-2">
                <input
                  className="form-control"
                  placeholder="Dán URL ảnh..."
                  value={editItemData.img || ''}
                  onChange={(e) => handleModalFieldChange('img', e.target.value)}
                />
                <div className="d-flex flex-column gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => handleModalImageFileChange(e, 'img')}
                  />
                  <p className="text-xs text-neutral-500 mb-0">
                    <i className="ph ph-info me-1"></i>
                    Bạn có thể dán URL ảnh hoặc chọn file từ thiết bị.
                  </p>
                  {editItemData.img && (
                    <div className="mt-1">
                      <img
                        src={editItemData.img}
                        alt="Vocabulary preview"
                        style={{ maxHeight: '120px', borderRadius: '8px' }}
                        className="border border-neutral-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CamSessionEdit;

