import React, { useState } from 'react';

const AnswerKeyForm = ({ answerKey, onAnswerKeyChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addQuestion = () => {
    const newQuestion = {
      questionNumber: (answerKey.length || 0) + 1,
      questionType: 'single_choice', // default to single_choice for better UX
      correctAnswer: '',
      options: ['A', 'B', 'C', 'D'], // default 4 options for multiple/single choice
      maxScore: 1
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
    single_choice: 'Trắc nghiệm (1 đáp án)',
    multiple_choice: 'Trắc nghiệm (nhiều đáp án)',
    true_false: 'Đúng/Sai',
    writing: 'Tự luận'
  };

  // Generate option labels based on index
  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // 65 is 'A' in ASCII
  };

  // Add new option to a question
  const addOption = (questionIndex) => {
    const answer = answerKey[questionIndex];
    const currentOptions = answer.options || ['A', 'B', 'C', 'D'];
    const newOptions = [...currentOptions, getOptionLabel(currentOptions.length)];
    updateQuestion(questionIndex, 'options', newOptions);
  };

  // Remove option from a question
  const removeOption = (questionIndex, optionToRemove) => {
    const answer = answerKey[questionIndex];
    const currentOptions = answer.options || ['A', 'B', 'C', 'D'];

    if (currentOptions.length <= 2) {
      alert('Phải có ít nhất 2 đáp án!');
      return;
    }

    // Remove the option
    const newOptions = currentOptions.filter(opt => opt !== optionToRemove);

    // Update correct answers if needed
    let correctAnswers = answer.correctAnswer ? answer.correctAnswer.split(',') : [];
    correctAnswers = correctAnswers.filter(ans => ans !== optionToRemove);

    updateQuestion(questionIndex, 'options', newOptions);
    updateQuestion(questionIndex, 'correctAnswer', correctAnswers.join(','));
  };

  // Render answer input based on question type
  const renderAnswerInput = (answer, index) => {
    const questionType = answer.questionType;
    const options = answer.options || ['A', 'B', 'C', 'D'];

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
      case 'single_choice':
        return (
          <div>
            <select
              className="form-select radius-8 bg-neutral-50 border-neutral-200 text-xs px-12 py-8 mb-8"
              value={answer.correctAnswer}
              onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
            >
              <option value="">Chọn đáp án</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  Đáp án {option}
                </option>
              ))}
            </select>

            {/* Options manager */}
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="text-neutral-600 text-xs me-2">Số đáp án: {options.length}</span>
              {options.map((option) => (
                <div key={option} className="d-flex align-items-center gap-1 bg-neutral-100 px-8 py-4 rounded-6">
                  <span className="text-xs">{option}</span>
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="bg-transparent border-0 text-danger-600 p-0 d-flex align-items-center"
                      onClick={() => removeOption(index, option)}
                      title="Xóa đáp án"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="bg-transparent border-0 text-main-600 p-0 d-flex align-items-center gap-1 text-xs"
                onClick={() => addOption(index)}
                title="Thêm đáp án"
              >
                <i className="fas fa-plus-circle"></i>
                <span>Thêm</span>
              </button>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div>
            <div className="d-flex flex-wrap gap-2 mb-8">
              {options.map((option) => {
                const selectedAnswers = answer.correctAnswer ? answer.correctAnswer.split(',') : [];
                const isSelected = selectedAnswers.includes(option);

                return (
                  <label
                    key={option}
                    className={`px-12 py-6 rounded-6 border cursor-pointer text-xs position-relative ${
                      isSelected
                        ? 'bg-main-600 text-white border-main-600'
                        : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="d-none"
                      checked={isSelected}
                      onChange={(e) => {
                        let newAnswers = [...selectedAnswers];
                        if (e.target.checked) {
                          newAnswers.push(option);
                        } else {
                          newAnswers = newAnswers.filter(a => a !== option);
                        }
                        updateQuestion(index, 'correctAnswer', newAnswers.join(','));
                      }}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>

            {/* Options manager */}
            <div className="d-flex flex-wrap gap-2 align-items-center pt-8 border-top border-neutral-200">
              <span className="text-neutral-600 text-xs me-2">Quản lý đáp án:</span>
              {options.map((option) => (
                <div key={option} className="d-flex align-items-center gap-1 bg-neutral-100 px-8 py-4 rounded-6">
                  <span className="text-xs">{option}</span>
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="bg-transparent border-0 text-danger-600 p-0 d-flex align-items-center"
                      onClick={() => removeOption(index, option)}
                      title="Xóa đáp án"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="bg-transparent border-0 text-main-600 p-0 d-flex align-items-center gap-1 text-xs"
                onClick={() => addOption(index)}
                title="Thêm đáp án"
              >
                <i className="fas fa-plus-circle"></i>
                <span>Thêm</span>
              </button>
            </div>
          </div>
        );

      case 'true_false':
        return (
          <select
            className="form-select radius-8 bg-neutral-50 border-neutral-200 text-xs px-12 py-8"
            value={answer.correctAnswer}
            onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
          >
            <option value="">Chọn đáp án</option>
            <option value="TRUE">Đúng (TRUE)</option>
            <option value="FALSE">Sai (FALSE)</option>
          </select>
        );

      case 'writing':
        return (
          <div>
            <textarea
              className="form-control radius-8 bg-neutral-50 border-neutral-200 text-xs px-12 py-8"
              rows="3"
              placeholder="Nhập đáp án mẫu (sẽ tự động chuyển thành chữ thường để so sánh)..."
              value={answer.correctAnswer}
              onChange={(e) => {
                // Convert to lowercase for consistency
                const normalizedAnswer = e.target.value.toLowerCase().trim();
                updateQuestion(index, 'correctAnswer', normalizedAnswer);
              }}
            />
            <div className="mt-8 bg-info-50 border border-info-200 rounded-8 p-8 text-xs text-info-700">
              <i className="fas fa-info-circle me-2"></i>
              Đáp án sẽ được chuyển về chữ thường để dễ so sánh
            </div>
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
                                  correctAnswer: '', // Reset answer when changing type
                                };

                                // Reset options to default for choice types
                                if (newType === 'single_choice' || newType === 'multiple_choice') {
                                  updatedAnswer.options = ['A', 'B', 'C', 'D'];
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

                      {/* Answer Input */}
                      <div className="mb-12">
                        <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                          Đáp án {answer.questionType !== 'writing' && <span className="text-danger-600">*</span>}
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
