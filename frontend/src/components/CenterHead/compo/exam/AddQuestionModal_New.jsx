import React, { useState, useEffect } from 'react';
import '../../../../assets/css/exam-answer-keys.css';

const AddQuestionModal_New = ({
  isOpen,
  onClose,
  onAddQuestion,
  questionNumber,
  initialData,
  isEditing
}) => {
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
    { value: 'grammar', label: 'Grammar', icon: 'ph-text-t' },
    { value: 'vocabulary', label: 'Vocabulary', icon: 'ph-book' },
    { value: 'listening', label: 'Listening', icon: 'ph-headphones' },
    { value: 'reading_comprehension', label: 'Reading Comprehension', icon: 'ph-book-open' },
    { value: 'writing', label: 'Writing', icon: 'ph-pencil' },
    { value: 'speaking', label: 'Speaking', icon: 'ph-microphone' }
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-exam-question fade show d-block" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          {/* Header */}
          <div className="modal-question-header">
            <h5 className="modal-title">
              <div className="modal-header-icon">
                <i className={`ph ph-${isEditing ? 'pencil-simple' : 'plus-circle'}`}></i>
              </div>
              <span>{isEditing ? 'Edit Question' : 'Add New Question'}</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-question-body">
            {/* Basic Information Section */}
            <div className="form-section">
              <h4 className="form-section-title">
                <i className="ph ph-info"></i>
                Basic Information
              </h4>

              {/* Question Title */}
              <div className="form-group-modern">
                <label className="form-label-modern">
                  <i className="ph ph-text-align-left"></i>
                  Question Title
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control-modern"
                  placeholder="Enter question title or content..."
                  value={question.questionTitle}
                  onChange={(e) => setQuestion({ ...question, questionTitle: e.target.value })}
                />
              </div>

              {/* Question Type & Scores */}
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-group-modern">
                    <label className="form-label-modern">
                      <i className="ph ph-list-bullets"></i>
                      Question Type
                      <span className="required">*</span>
                    </label>
                    <select
                      className="form-control-modern"
                      value={question.questionType}
                      onChange={(e) => handleQuestionTypeChange(e.target.value)}
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="input">Fill in the blank</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group-modern">
                    <label className="form-label-modern">
                      <i className="ph ph-chart-line"></i>
                      Max Score
                      <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control-modern"
                      min="0"
                      step="0.5"
                      value={question.maxScore}
                      onChange={(e) => setQuestion({ ...question, maxScore: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group-modern">
                    <label className="form-label-modern">
                      <i className="ph ph-minus-circle"></i>
                      Negative Mark
                    </label>
                    <input
                      type="number"
                      className="form-control-modern"
                      min="0"
                      step="0.5"
                      value={question.negativeMark}
                      onChange={(e) => setQuestion({ ...question, negativeMark: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="form-group-modern">
                <label className="form-label-modern">
                  <i className="ph ph-tag"></i>
                  Tags (Optional)
                </label>
                <div className="tag-selection">
                  {tagOptions.map((tag) => (
                    <div key={tag.value} className="tag-checkbox">
                      <input
                        type="checkbox"
                        id={`tag-${tag.value}`}
                        checked={question.tags.includes(tag.value)}
                        onChange={() => handleToggleTag(tag.value)}
                      />
                      <label htmlFor={`tag-${tag.value}`} className="tag-label">
                        <i className={`ph ${tag.icon}`}></i>
                        {tag.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer Options Section */}
            <div className="form-section">
              <h4 className="form-section-title">
                <i className="ph ph-check-square"></i>
                Answer Options
              </h4>

              {/* Multiple Choice */}
              {question.questionType === 'multiple_choice' && (
                <div className="form-group-modern">
                  <label className="form-label-modern">
                    Options
                    <span className="required">*</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                      (Tick ✓ to mark as correct)
                    </span>
                  </label>

                  {question.questionAnswer.map((opt) => {
                    const isCorrect = question.correctAnswer.includes(opt.key);
                    return (
                      <div key={opt.key} className={`answer-option ${isCorrect ? 'correct' : ''}`}>
                        <input
                          type="checkbox"
                          className="answer-option-checkbox"
                          checked={isCorrect}
                          onChange={() => handleToggleCorrectAnswer(opt.key)}
                        />
                        <div className="answer-option-key">
                          {opt.key}
                        </div>
                        <input
                          type="text"
                          className="answer-option-input"
                          placeholder={`Answer ${opt.key} content`}
                          value={opt.text}
                          onChange={(e) => handleUpdateOptionText(opt.key, e.target.value)}
                        />
                        {question.questionAnswer.length > 2 && (
                          <button
                            type="button"
                            className="btn-remove-option"
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
                    className="btn-add-option"
                    onClick={handleAddOption}
                  >
                    <i className="ph ph-plus"></i>
                    Add Option
                  </button>
                </div>
              )}

              {/* True/False */}
              {question.questionType === 'true_false' && (
                <div className="form-group-modern">
                  <label className="form-label-modern">
                    Correct Answer
                    <span className="required">*</span>
                  </label>
                  <select
                    className="form-control-modern"
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
                <div className="form-group-modern">
                  <label className="form-label-modern">
                    Correct Answers
                    <span className="required">*</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                      (Multiple answers allowed)
                    </span>
                  </label>

                  {question.correctAnswer.map((ans, index) => (
                    <div key={index} className="answer-option">
                      <div className="answer-option-key">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        className="answer-option-input"
                        placeholder="Enter correct answer"
                        value={ans}
                        onChange={(e) => handleUpdateInputAnswer(index, e.target.value)}
                      />
                      {question.correctAnswer.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-option"
                          onClick={() => handleRemoveInputAnswer(index)}
                        >
                          <i className="ph ph-x"></i>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-add-option"
                    onClick={handleAddInputAnswer}
                  >
                    <i className="ph ph-plus"></i>
                    Add Another Answer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-question-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              <i className="ph ph-x"></i>
              Cancel
            </button>
            <button
              type="button"
              className={`btn-modal-submit ${isEditing ? 'editing' : ''}`}
              onClick={handleSubmit}
            >
              <i className={`ph ph-${isEditing ? 'check-circle' : 'plus-circle'}`}></i>
              {isEditing ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal_New;
