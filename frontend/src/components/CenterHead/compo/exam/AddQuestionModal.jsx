import React, { useState, useEffect } from 'react';

const AddQuestionModal = ({ isOpen, onClose, onAddQuestion, questionNumber, initialData, isEditing }) => {
  const getInitialQuestion = () => ({
    questionNumber: questionNumber,
    questionTitle: '',
    questionType: 'multiple_choice',
    questionAnswer: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ],
    correctAnswer: [],
    maxScore: 1,
    negativeMark: 0,
    tags: []
  });

  const [question, setQuestion] = useState(getInitialQuestion());

  // Update question when modal opens with initialData
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setQuestion(initialData);
      } else {
        setQuestion(getInitialQuestion());
      }
    }
  }, [isOpen, initialData, questionNumber]);

  const tagOptions = [
    { value: 'grammar', label: 'Grammar' },
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'listening', label: 'Listening' },
    { value: 'reading_comprehension', label: 'Reading Comprehension' },
    { value: 'writing', label: 'Writing' },
    { value: 'speaking', label: 'Speaking' }
  ];

  const handleQuestionTypeChange = (newType) => {
    const updates = {
      ...question,
      questionType: newType,
      correctAnswer: newType === 'input' ? [''] : []
    };

    if (newType === 'multiple_choice') {
      updates.questionAnswer = [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ];
    } else {
      updates.questionAnswer = [];
    }

    setQuestion(updates);
  };

  const handleAddOption = () => {
    const newKey = String.fromCharCode(65 + question.questionAnswer.length);
    setQuestion({
      ...question,
      questionAnswer: [...question.questionAnswer, { key: newKey, text: '' }]
    });
  };

  const handleRemoveOption = (keyToRemove) => {
    if (question.questionAnswer.length <= 2) {
      alert('Phải có ít nhất 2 đáp án!');
      return;
    }

    const newAnswers = question.questionAnswer
      .filter(opt => opt.key !== keyToRemove)
      .map((opt, idx) => ({
        key: String.fromCharCode(65 + idx),
        text: opt.text
      }));

    const newCorrectAnswers = question.correctAnswer.filter(ans => ans !== keyToRemove);

    setQuestion({
      ...question,
      questionAnswer: newAnswers,
      correctAnswer: newCorrectAnswers
    });
  };

  const handleUpdateOptionText = (key, text) => {
    setQuestion({
      ...question,
      questionAnswer: question.questionAnswer.map(opt =>
        opt.key === key ? { ...opt, text } : opt
      )
    });
  };

  const handleToggleCorrectAnswer = (key) => {
    const correctAnswers = [...question.correctAnswer];
    if (correctAnswers.includes(key)) {
      setQuestion({
        ...question,
        correctAnswer: correctAnswers.filter(a => a !== key)
      });
    } else {
      setQuestion({
        ...question,
        correctAnswer: [...correctAnswers, key]
      });
    }
  };

  const handleToggleTag = (tagValue) => {
    const tags = [...question.tags];
    if (tags.includes(tagValue)) {
      setQuestion({
        ...question,
        tags: tags.filter(t => t !== tagValue)
      });
    } else {
      setQuestion({
        ...question,
        tags: [...tags, tagValue]
      });
    }
  };

  const handleAddInputAnswer = () => {
    setQuestion({
      ...question,
      correctAnswer: [...question.correctAnswer, '']
    });
  };

  const handleRemoveInputAnswer = (index) => {
    setQuestion({
      ...question,
      correctAnswer: question.correctAnswer.filter((_, i) => i !== index)
    });
  };

  const handleUpdateInputAnswer = (index, value) => {
    const newAnswers = [...question.correctAnswer];
    newAnswers[index] = value;
    setQuestion({
      ...question,
      correctAnswer: newAnswers
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!question.questionTitle.trim()) {
      alert('Vui lòng nhập tiêu đề câu hỏi!');
      return;
    }

    if (question.questionType === 'multiple_choice') {
      const hasEmptyAnswers = question.questionAnswer.some(opt => !opt.text.trim());
      if (hasEmptyAnswers) {
        alert('Vui lòng điền đầy đủ nội dung các đáp án!');
        return;
      }
      if (question.correctAnswer.length === 0) {
        alert('Vui lòng chọn ít nhất một đáp án đúng!');
        return;
      }
    }

    if (question.questionType === 'true_false' && question.correctAnswer.length === 0) {
      alert('Vui lòng chọn đáp án đúng!');
      return;
    }

    if (question.questionType === 'input' && !question.correctAnswer.some(ans => ans.trim())) {
      alert('Vui lòng nhập ít nhất một đáp án đúng!');
      return;
    }

    onAddQuestion(question);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setQuestion({
      questionNumber: questionNumber,
      questionTitle: '',
      questionType: 'multiple_choice',
      questionAnswer: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      correctAnswer: [],
      maxScore: 1,
      negativeMark: 0,
      tags: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: '0.5rem' }}>
          {/* Modal Header */}
          <div className="modal-header border-bottom-0 pb-2" style={{ backgroundColor: '#f8f9fa' }}>
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <i className={`ph ph-${isEditing ? 'pencil-simple' : 'plus-circle'} me-2 ${isEditing ? 'text-warning' : 'text-primary'}`} style={{ fontSize: '1.5rem' }}></i>
              <span>{isEditing ? 'Edit Question' : 'Add New Question'}</span>
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body" style={{ backgroundColor: '#ffffff' }}>
            {/* Question Title */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-dark mb-2">
                <i className="ph ph-text-align-left me-2 text-primary"></i>
                Question Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter question title or content..."
                value={question.questionTitle}
                onChange={(e) => setQuestion({ ...question, questionTitle: e.target.value })}
                style={{ borderRadius: '0.5rem' }}
              />
            </div>

            {/* Question Type & Scores */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Question Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={question.questionType}
                  onChange={(e) => handleQuestionTypeChange(e.target.value)}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="input">Fill in the blank</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-medium">
                  Max Score <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.5"
                  value={question.maxScore}
                  onChange={(e) => setQuestion({ ...question, maxScore: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-medium">Negative Mark</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.5"
                  value={question.negativeMark}
                  onChange={(e) => setQuestion({ ...question, negativeMark: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mb-3">
              <label className="form-label fw-medium">Tags</label>
              <div className="d-flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <label
                    key={tag.value}
                    className={`px-3 py-2 rounded border cursor-pointer ${
                      question.tags.includes(tag.value)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-dark border-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      className="d-none"
                      checked={question.tags.includes(tag.value)}
                      onChange={() => handleToggleTag(tag.value)}
                    />
                    <span className="text-sm">{tag.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Answer Options - Multiple Choice */}
            {question.questionType === 'multiple_choice' && (
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Answer Options <span className="text-danger">*</span>
                  <span className="text-muted fw-normal ms-2">(Tick ✓ to mark as correct)</span>
                </label>
                {question.questionAnswer.map((opt, index) => {
                  const isCorrect = question.correctAnswer.includes(opt.key);
                  return (
                    <div key={opt.key} className="d-flex gap-2 mb-2 align-items-center">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isCorrect}
                          onChange={() => handleToggleCorrectAnswer(opt.key)}
                          title="Mark as correct answer"
                        />
                      </div>
                      <span className={`badge ${isCorrect ? 'bg-success' : 'bg-primary'}`} style={{ width: '28px' }}>
                        {opt.key}
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Answer ${opt.key} content`}
                        value={opt.text}
                        onChange={(e) => handleUpdateOptionText(opt.key, e.target.value)}
                      />
                      {question.questionAnswer.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveOption(opt.key)}
                        >
                          <i className="ph ph-x"></i>
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleAddOption}
                >
                  <i className="ph ph-plus me-1"></i>
                  Add Option
                </button>
              </div>
            )}

            {/* True/False */}
            {question.questionType === 'true_false' && (
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Correct Answer <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={question.correctAnswer[0] || ''}
                  onChange={(e) => setQuestion({ ...question, correctAnswer: [e.target.value] })}
                >
                  <option value="">Select answer</option>
                  <option value="TRUE">TRUE</option>
                  <option value="FALSE">FALSE</option>
                </select>
              </div>
            )}

            {/* Input Type */}
            {question.questionType === 'input' && (
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Correct Answers <span className="text-danger">*</span>
                  <span className="text-muted fw-normal ms-2">(Multiple answers allowed)</span>
                </label>
                {question.correctAnswer.map((ans, index) => (
                  <div key={index} className="d-flex gap-2 mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter correct answer"
                      value={ans}
                      onChange={(e) => handleUpdateInputAnswer(index, e.target.value)}
                    />
                    {question.correctAnswer.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveInputAnswer(index)}
                      >
                        <i className="ph ph-x"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleAddInputAnswer}
                >
                  <i className="ph ph-plus me-1"></i>
                  Add Another Answer
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-top-0 pt-3" style={{ backgroundColor: '#f8f9fa' }}>
            <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
              <i className="ph ph-x me-2"></i>
              Cancel
            </button>
            <button type="button" className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'} px-4 shadow-sm`} onClick={handleSubmit}>
              <i className={`ph ph-${isEditing ? 'check-circle' : 'plus-circle'} me-2`}></i>
              {isEditing ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal;
