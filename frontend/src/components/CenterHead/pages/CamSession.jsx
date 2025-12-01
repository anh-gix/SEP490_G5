import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Modal from '../compo/Modal';
import Tabs from '../compo/Tabs';
import Badge from '../compo/Badge';
import { camSessionService } from '../../../services/camSessionService';

const CamSession = ({ isWizardMode = false }) => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const isEdit = Boolean(sessionId);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    sessionType: 'reading',
    description: '',
    order: 1,
    videoURL: '',
    quizzes: {
      quiz: []
    },
    vocabulary: {
      items: []
    }
  });

  // Quiz Form
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuizIndex, setEditingQuizIndex] = useState(null);
  const [quizForm, setQuizForm] = useState({
    Type: 'multiple-choice',
    Img: '',
    imgFile: null,
    Question: '',
    Answer: [''],
    AnswerKey: ['']
  });

  // Vocabulary Form
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);
  const [vocabularyForm, setVocabularyForm] = useState({
    items: [{ word: '', img: '', imgFile: null }]
  });

  // Tabs configuration
  const tabs = [
    { id: 'info', label: 'Thông tin cơ bản', icon: 'ph ph-info' },
    { id: 'quizzes', label: 'Quiz', icon: 'ph ph-question' },
    { id: 'vocabulary', label: 'Từ vựng', icon: 'ph ph-book' }
  ];

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: isEdit ? 'Chỉnh sửa CAM Session' : 'Tạo CAM Session mới' }
  ];

  // Load cam session data if editing
  useEffect(() => {
    if (isEdit) {
      fetchCamSession();
    }
  }, [isEdit, sessionId]);

  const fetchCamSession = async () => {
    try {
      setLoading(true);
      const response = await camSessionService.getCamSessionById(sessionId);
      if (response.success && response.data) {
        const data = response.data;
        // Handle videoURL - could be string or object
        let videoURL = '';
        if (typeof data.videoURL === 'string') {
          videoURL = data.videoURL;
        } else if (data.videoURL && typeof data.videoURL === 'object') {
          videoURL = data.videoURL.url || data.videoURL.type || '';
        }
        
        // Handle vocabulary - convert old format to new format if needed
        let vocabulary = { items: [] };
        if (data.vocabulary) {
          if (data.vocabulary.items && Array.isArray(data.vocabulary.items)) {
            // New format
            vocabulary = { items: data.vocabulary.items };
          } else if (data.vocabulary.words && Array.isArray(data.vocabulary.words)) {
            // Old format - convert to new format
            vocabulary = {
              items: data.vocabulary.words.map((word, index) => ({
                word: word,
                img: data.vocabulary.img || ''
              }))
            };
          }
        }
        
        setFormData({
          title: data.title || '',
          sessionType: data.sessionType || 'reading',
          description: data.description || '',
          order: data.order || 1,
          videoURL: videoURL,
          quizzes: data.quizzes ? { quiz: data.quizzes.quiz || [] } : { quiz: [] },
          vocabulary: vocabulary
        });
      }
    } catch (error) {
      console.error('Error loading cam session:', error);
      alert('Không thể tải thông tin CAM Session!');
      navigate('/center-head/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'order') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 1
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // ==================== QUIZ MANAGEMENT ====================
  const handleAddQuiz = () => {
    setEditingQuizIndex(null);
    setQuizForm({
      Type: 'multiple-choice',
      Img: '',
      imgFile: null,
      Question: '',
      Answer: [''],
      AnswerKey: ['']
    });
    setShowQuizModal(true);
  };

  const handleEditQuiz = (index) => {
    setEditingQuizIndex(index);
    const quiz = formData.quizzes.quiz[index];
    setQuizForm({
      Type: quiz.Type || 'multiple-choice',
      Img: quiz.Img || '',
      imgFile: null,
      Question: quiz.Question || '',
      Answer: quiz.Answer && quiz.Answer.length > 0 ? [...quiz.Answer] : [''],
      AnswerKey: quiz.AnswerKey && quiz.AnswerKey.length > 0 ? [...quiz.AnswerKey] : ['']
    });
    setShowQuizModal(true);
  };

  const handleQuizFormChange = (e) => {
    const { name, value } = e.target;
    setQuizForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuizAnswerChange = (index, value) => {
    setQuizForm(prev => {
      const newAnswers = [...prev.Answer];
      newAnswers[index] = value;
      return { ...prev, Answer: newAnswers };
    });
  };

  const handleAddQuizAnswer = () => {
    setQuizForm(prev => ({
      ...prev,
      Answer: [...prev.Answer, '']
    }));
  };

  const handleRemoveQuizAnswer = (index) => {
    setQuizForm(prev => ({
      ...prev,
      Answer: prev.Answer.filter((_, i) => i !== index)
    }));
  };

  const handleQuizAnswerKeyChange = (index, value) => {
    setQuizForm(prev => {
      const newAnswerKeys = [...prev.AnswerKey];
      newAnswerKeys[index] = value;
      return { ...prev, AnswerKey: newAnswerKeys };
    });
  };

  const handleAddQuizAnswerKey = () => {
    setQuizForm(prev => ({
      ...prev,
      AnswerKey: [...prev.AnswerKey, '']
    }));
  };

  const handleRemoveQuizAnswerKey = (index) => {
    setQuizForm(prev => ({
      ...prev,
      AnswerKey: prev.AnswerKey.filter((_, i) => i !== index)
    }));
  };

  const handleQuizImageUpload = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được vượt quá 5MB!');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setQuizForm(prev => ({
      ...prev,
      imgFile: file,
      Img: previewUrl // Use preview URL for display
    }));
  };

  const handleRemoveQuizImage = () => {
    setQuizForm(prev => {
      // Revoke object URL if exists
      if (prev.imgFile && prev.Img) {
        URL.revokeObjectURL(prev.Img);
      }
      return {
        ...prev,
        imgFile: null,
        Img: ''
      };
    });
  };

  const handleSaveQuiz = () => {
    if (!quizForm.Question) {
      alert('Vui lòng nhập câu hỏi!');
      return;
    }

    if (quizForm.Answer.length === 0 || quizForm.Answer.every(a => !a.trim())) {
      alert('Vui lòng nhập ít nhất 1 đáp án!');
      return;
    }

    if (quizForm.AnswerKey.length === 0 || quizForm.AnswerKey.every(a => !a.trim())) {
      alert('Vui lòng nhập ít nhất 1 đáp án đúng!');
      return;
    }

    const quizzes = [...formData.quizzes.quiz];
    const cleanQuiz = {
      Type: quizForm.Type,
      Img: quizForm.Img || undefined,
      Question: quizForm.Question,
      Answer: quizForm.Answer.filter(a => a.trim()),
      AnswerKey: quizForm.AnswerKey.filter(a => a.trim()),
      imgFile: quizForm.imgFile // Keep file reference for upload on form submit
    };

    if (editingQuizIndex !== null) {
      quizzes[editingQuizIndex] = cleanQuiz;
    } else {
      quizzes.push(cleanQuiz);
    }

    setFormData(prev => ({
      ...prev,
      quizzes: {
        ...prev.quizzes,
        quiz: quizzes.map(q => ({
          Type: q.Type,
          Img: q.Img,
          Question: q.Question,
          Answer: q.Answer,
          AnswerKey: q.AnswerKey
        })),
        // Store files separately for upload
        files: quizzes
          .map((quiz, index) => quiz.imgFile ? { index, file: quiz.imgFile } : null)
          .filter(Boolean)
      }
    }));
    setShowQuizModal(false);
  };

  const handleDeleteQuiz = (index) => {
    if (window.confirm('Bạn có chắc muốn xóa quiz này?')) {
      setFormData(prev => ({
        ...prev,
        quizzes: {
          ...prev.quizzes,
          quiz: prev.quizzes.quiz.filter((_, i) => i !== index)
        }
      }));
    }
  };

  // ==================== VOCABULARY MANAGEMENT ====================
  const handleEditVocabulary = () => {
    setVocabularyForm({
      items: formData.vocabulary.items && formData.vocabulary.items.length > 0
        ? formData.vocabulary.items.map(item => ({ ...item, imgFile: null }))
        : [{ word: '', img: '', imgFile: null }]
    });
    setShowVocabularyModal(true);
  };

  const handleVocabularyItemChange = (index, field, value) => {
    setVocabularyForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      return { ...prev, items: newItems };
    });
  };

  const handleVocabularyImageUpload = (index, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được vượt quá 5MB!');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setVocabularyForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        imgFile: file,
        img: previewUrl // Use preview URL for display
      };
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveVocabularyImage = (index) => {
    setVocabularyForm(prev => {
      const newItems = [...prev.items];
      // Revoke object URL if exists
      if (newItems[index].imgFile && newItems[index].img) {
        URL.revokeObjectURL(newItems[index].img);
      }
      newItems[index] = {
        ...newItems[index],
        imgFile: null,
        img: ''
      };
      return { ...prev, items: newItems };
    });
  };

  const handleAddVocabularyItem = () => {
    setVocabularyForm(prev => ({
      ...prev,
      items: [...prev.items, { word: '', img: '', imgFile: null }]
    }));
  };

  const handleRemoveVocabularyItem = (index) => {
    setVocabularyForm(prev => {
      const itemToRemove = prev.items[index];
      // Revoke object URL if exists
      if (itemToRemove?.imgFile && itemToRemove?.img) {
        URL.revokeObjectURL(itemToRemove.img);
      }
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      };
    });
  };

  const handleSaveVocabulary = () => {
    const validItems = vocabularyForm.items.filter(item => item.word && item.word.trim());
    
    if (validItems.length === 0) {
      alert('Vui lòng nhập ít nhất 1 từ vựng!');
      return;
    }

    // Process items: keep URL or preview URL (file will be handled on form submit)
    const processedItems = validItems.map(item => ({
      word: item.word.trim(),
      img: item.img || '', // Keep URL or preview URL from file
      imgFile: item.imgFile // Keep file reference for upload on form submit
    }));

    setFormData(prev => ({
      ...prev,
      vocabulary: {
        items: processedItems.map(item => ({
          word: item.word,
          img: item.img
        })),
        // Store files separately for upload
        files: processedItems
          .map((item, index) => item.imgFile ? { index, file: item.imgFile } : null)
          .filter(Boolean)
      }
    }));
    setShowVocabularyModal(false);
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      alert('Vui lòng nhập tiêu đề!');
      return;
    }

    try {
      setLoading(true);
      
      // Handle image file uploads if any
      let finalVocabulary = formData.vocabulary;
      if (formData.vocabulary?.files && formData.vocabulary.files.length > 0) {
        // TODO: Upload files to server and get URLs
        // For now, we'll use the preview URLs (blob URLs)
        // In production, you should upload files to a storage service (S3, Cloudinary, etc.)
        // and replace preview URLs with actual URLs
        
        // Example upload logic (uncomment when API is ready):
        /*
        const uploadPromises = formData.vocabulary.files.map(async ({ index, file }) => {
          const formDataUpload = new FormData();
          formDataUpload.append('image', file);
          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formDataUpload
          });
          const data = await response.json();
          return { index, url: data.url };
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        finalVocabulary = {
          items: formData.vocabulary.items.map((item, idx) => {
            const uploadResult = uploadResults.find(r => r.index === idx);
            return {
              word: item.word,
              img: uploadResult ? uploadResult.url : item.img
            };
          })
        };
        */
      }
      
      // Prepare data for API
      const submitData = {
        ...formData,
        videoURL: formData.videoURL || undefined,
        quizzes: {
          quiz: finalQuizzes.map(quiz => ({
            Type: quiz.Type,
            Img: quiz.Img,
            Question: quiz.Question,
            Answer: quiz.Answer,
            AnswerKey: quiz.AnswerKey
          }))
        },
        vocabulary: {
          items: finalVocabulary.items.map(item => ({
            word: item.word,
            img: item.img
          }))
        }
      };
      
      if (isEdit) {
        await camSessionService.updateCamSession(sessionId, submitData);
        alert('Cập nhật CAM Session thành công!');
      } else {
        await camSessionService.createCamSession(submitData);
        alert('Tạo CAM Session thành công!');
      }

      // Only navigate in standalone mode, not in wizard mode
      if (!isWizardMode) {
        navigate('/center-head/dashboard');
      }
    } catch (error) {
      console.error('Error saving cam session:', error);
      alert(error.message || 'Có lỗi xảy ra khi lưu CAM Session!');
    } finally {
      setLoading(false);
    }
  };

  const getSessionTypeLabel = (type) => {
    const labels = {
      reading: 'Reading',
      listening: 'Listening',
      speaking: 'Speaking',
      writing: 'Writing'
    };
    return labels[type] || type;
  };

  const getQuizTypeLabel = (type) => {
    const labels = {
      'multiple-choice': 'Multiple Choice',
      'yes-no': 'Yes/No',
      'spell': 'Spell',
      'word-from-box': 'Word from Box'
    };
    return labels[type] || type;
  };

  if (loading && isEdit) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cam-session-container">
      {/* Hide breadcrumb and header in wizard mode */}
      {!isWizardMode && <Breadcrumb items={breadcrumbItems} />}

      {!isWizardMode && (
        <>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-24">
            <div>
              <h4 className="mb-8 text-neutral-900 fw-bold">
                {isEdit ? 'Chỉnh sửa CAM Session' : 'Tạo CAM Session mới'}
              </h4>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline"
                icon="ph ph-x-circle"
                onClick={() => navigate('/center-head/dashboard')}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                icon="ph ph-check-circle"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu CAM Session'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSubmit} className="mt-24">
        {/* Tab 1: Thông tin cơ bản */}
        {activeTab === 'info' && (
          <Card>
            <div className="row g-4">
              <div className="col-md-8">
                <label className="form-label fw-semibold text-neutral-900">
                  Tiêu đề <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="VD: Lesson 1: Introduction to Reading"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Loại session <span className="text-danger">*</span>
                </label>
                <select
                  name="sessionType"
                  className="form-select"
                  value={formData.sessionType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="speaking">Speaking</option>
                  <option value="writing">Writing</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold text-neutral-900">
                  Thứ tự <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="order"
                  className="form-control"
                  min="1"
                  value={formData.order}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-9">
                <label className="form-label fw-semibold text-neutral-900">
                  Video URL
                </label>
                <input
                  type="url"
                  name="videoURL"
                  className="form-control"
                  placeholder="https://..."
                  value={formData.videoURL}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-neutral-900">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  placeholder="Mô tả chi tiết về session..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: Quizzes */}
        {activeTab === 'quizzes' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Quiz</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Quản lý các câu hỏi quiz trong session
                </p>
              </div>
              <Button
                variant="primary"
                icon="ph ph-plus"
                onClick={handleAddQuiz}
              >
                Thêm Quiz
              </Button>
            </div>

            {formData.quizzes.quiz.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-question ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">Chưa có quiz nào được thêm</p>
                <Button variant="primary" icon="ph ph-plus" onClick={handleAddQuiz}>
                  Thêm quiz đầu tiên
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Loại</th>
                      <th>Câu hỏi</th>
                      <th style={{ width: '100px' }}>Số đáp án</th>
                      <th style={{ width: '100px' }}>Số đáp án đúng</th>
                      <th style={{ width: '120px' }} className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.quizzes.quiz.map((quiz, index) => (
                      <tr key={index}>
                        <td>
                          <Badge variant="info">
                            {getQuizTypeLabel(quiz.Type)}
                          </Badge>
                        </td>
                        <td>
                          <div className="fw-semibold">{quiz.Question}</div>
                          {quiz.Img && (
                            <small className="text-muted d-block mt-1">
                              <i className="ph ph-image me-1"></i>
                              Có hình ảnh
                            </small>
                          )}
                        </td>
                        <td className="text-center">
                          <Badge variant="secondary">{quiz.Answer?.length || 0}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge variant="success">{quiz.AnswerKey?.length || 0}</Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              variant="ghost"
                              icon="ph ph-pencil"
                              size="sm"
                              onClick={() => handleEditQuiz(index)}
                            />
                            <Button
                              variant="ghost"
                              icon="ph ph-trash"
                              size="sm"
                              onClick={() => handleDeleteQuiz(index)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 3: Vocabulary */}
        {activeTab === 'vocabulary' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Từ vựng</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Quản lý từ vựng và hình ảnh flashcard
                </p>
              </div>
              <Button
                variant="primary"
                icon="ph ph-pencil"
                onClick={handleEditVocabulary}
              >
                {formData.vocabulary.items.length > 0 ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng'}
              </Button>
            </div>

            {formData.vocabulary.items.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-book ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">Chưa có từ vựng nào được thêm</p>
                <Button variant="primary" icon="ph ph-plus" onClick={handleEditVocabulary}>
                  Thêm từ vựng đầu tiên
                </Button>
              </div>
            ) : (
              <div>
                <label className="form-label fw-semibold mb-3">Danh sách từ vựng</label>
                <div className="row g-3">
                  {formData.vocabulary.items.map((item, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <div className="card h-100">
                        <div className="card-body">
                          {item.img && (
                            <div className="mb-2 text-center">
                              <img
                                src={item.img}
                                alt={item.word}
                                style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                                className="border rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="text-center">
                            <Badge variant="primary" size="lg">
                              {item.word}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </form>

      {/* Modal: Quiz Form */}
      <Modal
        show={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        title={editingQuizIndex !== null ? 'Chỉnh sửa Quiz' : 'Thêm Quiz mới'}
        size="lg"
      >
        <div className="modal-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Loại Quiz <span className="text-danger">*</span>
              </label>
              <select
                name="Type"
                className="form-select"
                value={quizForm.Type}
                onChange={handleQuizFormChange}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="yes-no">Yes/No</option>
                <option value="spell">Spell</option>
                <option value="word-from-box">Word from Box</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Hình ảnh</label>
              
              {/* Upload File Option */}
              <div className="mb-2">
                <input
                  type="file"
                  accept="image/*"
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleQuizImageUpload(file);
                    }
                    e.target.value = ''; // Reset input
                  }}
                />
                <small className="text-muted">Hoặc upload file ảnh (tối đa 5MB)</small>
              </div>

              {/* URL Input Option */}
              <div className="mb-2">
                <input
                  type="url"
                  name="Img"
                  className="form-control form-control-sm"
                  placeholder="https://... (hoặc upload file ở trên)"
                  value={quizForm.imgFile ? '' : quizForm.Img}
                  onChange={(e) => {
                    if (!quizForm.imgFile) {
                      handleQuizFormChange(e);
                    }
                  }}
                  disabled={!!quizForm.imgFile}
                />
                <small className="text-muted">Nhập URL hình ảnh</small>
              </div>

              {/* Preview */}
              {quizForm.Img && (
                <div className="mt-2 text-center">
                  <div className="position-relative d-inline-block">
                    <img
                      src={quizForm.Img}
                      alt="Preview"
                      style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'contain' }}
                      className="border rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {quizForm.Img && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                        style={{ borderRadius: '50%', width: '24px', height: '24px', padding: 0 }}
                        onClick={handleRemoveQuizImage}
                        title="Xóa ảnh"
                      >
                        <i className="ph ph-x" style={{ fontSize: '12px' }}></i>
                      </button>
                    )}
                  </div>
                  {quizForm.imgFile && (
                    <div className="mt-1">
                      <small className="text-success">
                        <i className="ph ph-check-circle me-1"></i>
                        File: {quizForm.imgFile.name}
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Câu hỏi <span className="text-danger">*</span>
              </label>
              <textarea
                name="Question"
                className="form-control"
                rows="3"
                placeholder="Nhập câu hỏi..."
                value={quizForm.Question}
                onChange={handleQuizFormChange}
              />
            </div>

            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0">
                  Đáp án <span className="text-danger">*</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  icon="ph ph-plus"
                  onClick={handleAddQuizAnswer}
                >
                  Thêm đáp án
                </Button>
              </div>
              {quizForm.Answer.map((answer, index) => (
                <div key={index} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Đáp án ${index + 1}`}
                    value={answer}
                    onChange={(e) => handleQuizAnswerChange(index, e.target.value)}
                  />
                  {quizForm.Answer.length > 1 && (
                    <Button
                      variant="ghost"
                      icon="ph ph-trash"
                      onClick={() => handleRemoveQuizAnswer(index)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0">
                  Đáp án đúng <span className="text-danger">*</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  icon="ph ph-plus"
                  onClick={handleAddQuizAnswerKey}
                >
                  Thêm đáp án đúng
                </Button>
              </div>
              {quizForm.AnswerKey.map((answerKey, index) => (
                <div key={index} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Đáp án đúng ${index + 1}`}
                    value={answerKey}
                    onChange={(e) => handleQuizAnswerKeyChange(index, e.target.value)}
                  />
                  {quizForm.AnswerKey.length > 1 && (
                    <Button
                      variant="ghost"
                      icon="ph ph-trash"
                      onClick={() => handleRemoveQuizAnswerKey(index)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowQuizModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveQuiz}>
            Lưu
          </Button>
        </div>
      </Modal>

      {/* Modal: Vocabulary Form */}
      <Modal
        show={showVocabularyModal}
        onClose={() => setShowVocabularyModal(false)}
        title="Quản lý từ vựng"
        size="lg"
      >
        <div className="modal-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <label className="form-label fw-semibold mb-0">
              Từ vựng và hình ảnh <span className="text-danger">*</span>
            </label>
            <Button
              variant="outline"
              size="sm"
              icon="ph ph-plus"
              onClick={handleAddVocabularyItem}
            >
              Thêm từ vựng
            </Button>
          </div>
          
          <div className="row g-3">
            {vocabularyForm.items.map((item, index) => (
              <div key={index} className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0">
                        Từ vựng {index + 1}
                      </label>
                      {vocabularyForm.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="ph ph-trash"
                          onClick={() => handleRemoveVocabularyItem(index)}
                        />
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label text-sm">Từ vựng <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập từ vựng..."
                        value={item.word}
                        onChange={(e) => handleVocabularyItemChange(index, 'word', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label text-sm">Hình ảnh</label>
                      
                      {/* Upload File Option */}
                      <div className="mb-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-sm"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleVocabularyImageUpload(index, file);
                            }
                            e.target.value = ''; // Reset input
                          }}
                        />
                        <small className="text-muted">Hoặc upload file ảnh (tối đa 5MB)</small>
                      </div>

                      {/* URL Input Option */}
                      <div className="mb-2">
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          placeholder="https://... (hoặc upload file ở trên)"
                          value={item.imgFile ? '' : item.img}
                          onChange={(e) => {
                            if (!item.imgFile) {
                              handleVocabularyItemChange(index, 'img', e.target.value);
                            }
                          }}
                          disabled={!!item.imgFile}
                        />
                        <small className="text-muted">Nhập URL hình ảnh</small>
                      </div>

                      {/* Preview */}
                      {item.img && (
                        <div className="mt-2 text-center">
                          <div className="position-relative d-inline-block">
                            <img
                              src={item.img}
                              alt={`Preview ${item.word || index + 1}`}
                              style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'contain' }}
                              className="border rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            {item.img && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                style={{ borderRadius: '50%', width: '24px', height: '24px', padding: 0 }}
                                onClick={() => handleRemoveVocabularyImage(index)}
                                title="Xóa ảnh"
                              >
                                <i className="ph ph-x" style={{ fontSize: '12px' }}></i>
                              </button>
                            )}
                          </div>
                          {item.imgFile && (
                            <div className="mt-1">
                              <small className="text-success">
                                <i className="ph ph-check-circle me-1"></i>
                                File: {item.imgFile.name}
                              </small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowVocabularyModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveVocabulary}>
            Lưu
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CamSession;

