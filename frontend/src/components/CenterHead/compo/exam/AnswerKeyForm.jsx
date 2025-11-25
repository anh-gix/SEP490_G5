import React, { useState } from 'react';

const AnswerKeyForm = ({ answerKey, onAnswerKeyChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addQuestion = () => {
    const newQuestion = {
      questionNumber: (answerKey.length || 0) + 1,
      questionTitle: '',
      questionAnswer: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      questionType: 'multiple_choice', // Changed to match backend enum
      correctAnswer: [''],
      maxScore: 1,
      tags: []
    };
    console.log(newQuestion);
    onAnswerKeyChange([...answerKey, newQuestion]);
  };

  
  
  const updateQuestion = (index, field, value) => {
    const updatedAnswerKey = answerKey.map((answer, i) => {
      if (i === index) {
        return { ...answer, [field]: value };
      }
      return answer;
    });

    console.log('Updated answer key:', updatedAnswerKey);
    onAnswerKeyChange(updatedAnswerKey);
  };

  const deleteQuestion = (index) => {
    const updatedAnswerKey = answerKey.filter((_, i) => i !== index);

    // Re-number questions
    const renumberedAnswerKey = updatedAnswerKey.map((answer, i) => ({
      ...answer,
      questionNumber: i + 1
    }));

    onAnswerKeyChange(renumberedAnswerKey);
  };

  const questionTypes = {
    multiple_choice: 'Trắc nghiệm',
    true_false: 'Đúng/Sai',
    input: 'Điền từ'
  };

  const tagOptions = [
    { value: 'grammar', label: 'Grammar' },
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'listening', label: 'Listening' },
    { value: 'reading_comprehension', label: 'Reading Comprehension' },
    { value: 'writing', label: 'Writing' },
    { value: 'speaking', label: 'Speaking' }
  ];

  // Generate option labels based on index
  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // 65 is 'A' in ASCII
  };

  // Add new option to a question
  const addOption = (questionIndex) => {
    const answer = answerKey[questionIndex];
    const currentAnswers = answer.questionAnswer || [];
    const newKey = getOptionLabel(currentAnswers.length);
    const newAnswers = [...currentAnswers, { key: newKey, text: '' }];
    updateQuestion(questionIndex, 'questionAnswer', newAnswers);
  };

  // Remove option from a question
  const removeOption = (questionIndex, keyToRemove) => {
    const answer = answerKey[questionIndex];
    const currentAnswers = answer.questionAnswer || [];

    if (currentAnswers.length <= 2) {
      alert('Phải có ít nhất 2 đáp án!');
      return;
    }

    // Remove the option
    const newAnswers = currentAnswers.filter(opt => opt.key !== keyToRemove);

    // Update correct answers if needed
    let correctAnswers = Array.isArray(answer.correctAnswer) ? answer.correctAnswer : [];
    correctAnswers = correctAnswers.filter(ans => ans !== keyToRemove);

    updateQuestion(questionIndex, 'questionAnswer', newAnswers);
    updateQuestion(questionIndex, 'correctAnswer', correctAnswers);
  };

  // Update option text
  const updateOptionText = (questionIndex, optionKey, text) => {
    const answer = answerKey[questionIndex];
    const updatedAnswers = answer.questionAnswer.map(opt =>
      opt.key === optionKey ? { ...opt, text } : opt
    );
    updateQuestion(questionIndex, 'questionAnswer', updatedAnswers);
  };

  // Render answer input based on question type
  const renderAnswerInput = (answer, index) => {
    const questionType = answer.questionType;
    const questionAnswers = answer.questionAnswer || [];

    // If no question type selected, show placeholder
    if (!questionType) {
      return (
        <div className="bg-neutral-100 border border-neutral-200 rounded-8 p-12 text-xs text-neutral-600 text-center">
          <i className="fas fa-arrow-up me-2"></i>
          Vui lòng chọn loại câu hỏi ở trên
        </div>
      );
    }

    switch (questionType) {
      case 'multiple_choice':
        return (
          <div>
            {/* Answer options with text input and checkbox */}
            <div className="mb-12">
              <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                Các đáp án <span className="text-danger-600">*</span>
                <span className="text-neutral-500 fw-normal ms-1">(Tick ✓ để đánh dấu đáp án đúng)</span>
              </label>
              {questionAnswers.map((option, optIdx) => {
                const correctAnswers = Array.isArray(answer.correctAnswer) ? answer.correctAnswer : [];
                const isCorrect = correctAnswers.includes(option.key);

                return (
                  <div key={option.key} className="d-flex gap-2 mb-8 align-items-center">
                    {/* Checkbox to mark as correct */}
                    <div className="form-check" style={{ minWidth: '16px' }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        style={{ cursor: 'pointer' }}
                        checked={isCorrect}
                        onChange={(e) => {
                          let newCorrectAnswers = [...correctAnswers];
                          if (e.target.checked) {
                            newCorrectAnswers.push(option.key);
                          } else {
                            newCorrectAnswers = newCorrectAnswers.filter(a => a !== option.key);
                          }
                          updateQuestion(index, 'correctAnswer', newCorrectAnswers);
                        }}
                        title="Tick để đánh dấu đáp án đúng"
                      />
                    </div>

                    <div className={`d-flex align-items-center justify-content-center rounded-6 fw-bold flex-shrink-0 text-xs ${
                      isCorrect ? 'bg-success-50 text-success-600' : 'bg-main-50 text-main-600'
                    }`} style={{ width: '32px', height: '32px' }}>
                      {option.key}
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm radius-8 bg-neutral-50 border-neutral-200 text-xs"
                      placeholder={`Nội dung đáp án ${option.key}`}
                      value={option.text}
                      onChange={(e) => updateOptionText(index, option.key, e.target.value)}
                    />
                    {questionAnswers.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger flex-shrink-0"
                        style={{ width: '32px', height: '32px', padding: '0' }}
                        onClick={() => removeOption(index, option.key)}
                        title="Xóa đáp án"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                className="btn btn-sm btn-outline-main text-xs"
                onClick={() => addOption(index)}
              >
                <i className="fas fa-plus-circle me-1"></i>
                Thêm đáp án
              </button>
            </div>
          </div>
        );

      case 'true_false':
        return (
          <select
            className="form-select radius-8 bg-neutral-50 border-neutral-200 text-xs px-12 py-8"
            value={Array.isArray(answer.correctAnswer) ? answer.correctAnswer[0] : ''}
            onChange={(e) => updateQuestion(index, 'correctAnswer', [e.target.value])}
          >
            <option value="">Chọn đáp án</option>
            <option value="TRUE">Đúng (TRUE)</option>
            <option value="FALSE">Sai (FALSE)</option>
          </select>
        );

      case 'input':
        return (
          <div>
            <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
              Đáp án đúng <span className="text-danger-600">*</span>
              <span className="text-neutral-500 fw-normal ms-1">(Có thể có nhiều cách trả lời)</span>
            </label>
            {Array.isArray(answer.correctAnswer) && answer.correctAnswer.map((ans, ansIdx) => (
              <div key={ansIdx} className="d-flex gap-2 mb-8">
                <input
                  type="text"
                  className="form-control form-control-sm radius-8 bg-neutral-50 border-neutral-200 text-xs"
                  placeholder="Nhập từ/cụm từ đúng"
                  value={ans}
                  onChange={(e) => {
                    const newAnswers = [...answer.correctAnswer];
                    newAnswers[ansIdx] = e.target.value;
                    updateQuestion(index, 'correctAnswer', newAnswers);
                  }}
                />
                {answer.correctAnswer.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger flex-shrink-0"
                    style={{ width: '32px', height: '32px', padding: '0' }}
                    onClick={() => {
                      const newAnswers = answer.correctAnswer.filter((_, i) => i !== ansIdx);
                      updateQuestion(index, 'correctAnswer', newAnswers);
                    }}
                    title="Xóa đáp án này"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline-main text-xs"
              onClick={() => {
                const newAnswers = [...(answer.correctAnswer || ['']), ''];
                updateQuestion(index, 'correctAnswer', newAnswers);
              }}
            >
              <i className="fas fa-plus-circle me-1"></i>
              Thêm đáp án đúng khác
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border border-neutral-200 rounded-12 p-20 bg-neutral-25">
      <div className="d-flex align-items-center justify-content-between mb-20">
        <h6 className="text-neutral-900 fw-semibold mb-0 d-flex align-items-center gap-8 text-sm">
          <i className="fas fa-clipboard-list text-main-600"></i>
          <span>Đáp Án</span>
        </h6>
        <div className="d-flex align-items-center gap-8">
          <span className="bg-main-600 text-white px-12 py-6 rounded-6 text-xs fw-medium">
            {answerKey.length} câu
          </span>
          <button
            className="w-28 h-28 d-flex align-items-center justify-content-center border border-neutral-300 rounded-6 bg-white hover-bg-neutral-50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Questions List */}
          {answerKey.length > 0 ? (
            <div className="mb-16">
              {answerKey.map((answer, index) => (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-8 p-16 mb-12"
                >
                  <div className="d-flex align-items-start gap-12">
                    {/* Question Number */}
                    <div className="w-40 h-40 d-flex align-items-center justify-content-center rounded-8 bg-main-50 text-main-600 fw-bold flex-shrink-0 text-sm">
                      {answer.questionNumber}
                    </div>

                    {/* Answer Configuration */}
                    <div className="flex-grow-1">
                      {/* Question Title */}
                      <div className="mb-12">
                        <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                          Tiêu đề câu hỏi <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8 bg-neutral-50 border-neutral-200 text-xs px-12 py-8"
                          placeholder="Nhập tiêu đề hoặc nội dung câu hỏi..."
                          value={answer.questionTitle || ''}
                          onChange={(e) => updateQuestion(index, 'questionTitle', e.target.value)}
                        />
                      </div>

                      {/* Question Type Selector */}
                      <div className="mb-12">
                        <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                          Loại câu hỏi <span className="text-danger-600">*</span>
                        </label>
                        <select
                          className="form-select radius-8 bg-neutral-50 border-neutral-200 text-xs px-12 py-8"
                          value={answer.questionType || ''}
                          onChange={(e) => {
                            const newType = e.target.value;
                            console.log('Changing question type to:', newType);

                            // Update all fields at once to avoid batching issues
                            const updatedAnswerKey = answerKey.map((ans, i) => {
                              if (i === index) {
                                const updatedAnswer = {
                                  ...ans,
                                  questionType: newType,
                                  correctAnswer: newType === 'input' ? [''] : [], // Reset answer when changing type
                                };

                                // Reset questionAnswer to default for multiple_choice
                                if (newType === 'multiple_choice') {
                                  updatedAnswer.questionAnswer = [
                                    { key: 'A', text: '' },
                                    { key: 'B', text: '' },
                                    { key: 'C', text: '' },
                                    { key: 'D', text: '' }
                                  ];
                                } else {
                                  updatedAnswer.questionAnswer = [];
                                }

                                console.log('Updated answer:', updatedAnswer);
                                return updatedAnswer;
                              }
                              return ans;
                            });

                            console.log('All answers:', updatedAnswerKey);
                            onAnswerKeyChange(updatedAnswerKey);
                          }}
                        >
                          <option value="">-- Chọn loại câu hỏi --</option>
                          {Object.entries(questionTypes).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tags */}
                      <div className="mb-12">
                        <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                          Tags
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                          {tagOptions.map((tag) => {
                            const currentTags = answer.tags || [];
                            const isSelected = currentTags.includes(tag.value);

                            return (
                              <label
                                key={tag.value}
                                className={`px-10 py-5 rounded-6 border cursor-pointer text-xs ${
                                  isSelected
                                    ? 'bg-main-600 text-white border-main-600'
                                    : 'bg-white text-neutral-700 border-neutral-300'
                                }`}
                                style={{ cursor: 'pointer' }}
                              >
                                <input
                                  type="checkbox"
                                  className="d-none"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    let newTags = [...currentTags];
                                    if (e.target.checked) {
                                      newTags.push(tag.value);
                                    } else {
                                      newTags = newTags.filter(t => t !== tag.value);
                                    }
                                    updateQuestion(index, 'tags', newTags);
                                  }}
                                />
                                <span>{tag.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Answer Input */}
                      <div className="mb-12">
                        <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                          Đáp án {answer.questionType !== 'input' && <span className="text-danger-600">*</span>}
                        </label>
                        {renderAnswerInput(answer, index)}
                      </div>

                      {/* Score and Delete */}
                      <div className="d-flex align-items-center gap-8">
                        <div className="flex-grow-1">
                          <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                            Điểm <span className="text-danger-600">*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control radius-8 bg-neutral-50 border-neutral-200 text-xs px-12 py-8"
                            placeholder="Điểm"
                            min="0"
                            step="0.5"
                            value={answer.maxScore}
                            onChange={(e) => updateQuestion(index, 'maxScore', e.target.value)}
                          />
                        </div>
                        <div className="pt-20">
                          <button
                            className="w-32 h-32 d-flex align-items-center justify-content-center border border-danger-600 text-danger-600 rounded-6 hover-bg-danger-50 flex-shrink-0 bg-transparent"
                            onClick={() => deleteQuestion(index)}
                            title="Xóa câu hỏi"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-8 p-32 mb-16 text-center">
              <i className="fas fa-inbox text-neutral-400 mb-12 text-32 d-block"></i>
              <p className="text-neutral-500 mb-0 text-xs">
                Chưa có câu hỏi nào. Nhấn nút bên dưới để thêm.
              </p>
            </div>
          )}

          {/* Add Question Button */}
          <button
            className="btn btn-outline-main w-100 d-flex align-items-center justify-content-center gap-8 py-10 radius-8 text-sm"
            onClick={addQuestion}
          >
            <i className="fas fa-plus-circle"></i>
            <span>Thêm Câu Hỏi</span>
          </button>
        </>
      )}
    </div>
  );
};

export default AnswerKeyForm;
