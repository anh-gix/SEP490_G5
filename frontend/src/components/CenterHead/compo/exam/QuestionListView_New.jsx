import React from 'react';
import '../../../../assets/css/exam-answer-keys.css';

const QuestionListView_New = ({
  questions,
  onUpdateQuestions,
  onDeleteQuestion,
  onEditQuestion,
  onImportFromFile,
  onAddQuestion
}) => {
  const handleUpdateMaxScore = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      maxScore: parseFloat(value) || 0
    };
    onUpdateQuestions(updatedQuestions);
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      multiple_choice: 'Multiple Choice',
      true_false: 'True or False',
      input: 'Fill in the blanks'
    };
    return labels[type] || type;
  };

  const getQuestionTypeClass = (type) => {
    const classes = {
      multiple_choice: 'multiple-choice',
      true_false: 'true-false',
      input: 'input'
    };
    return classes[type] || '';
  };

  const getQuestionTypeIcon = (type) => {
    const icons = {
      multiple_choice: 'ph-check-square',
      true_false: 'ph-check-circle',
      input: 'ph-text-aa'
    };
    return icons[type] || 'ph-question';
  };

  return (
    <div className="question-list-card">
      {/* Header */}
      <div className="question-list-header">
        <h3 className="question-list-title">
          <i className="ph ph-list-bullets"></i>
          Questions ({questions.length})
        </h3>
        <div className="question-list-actions">
          <button
            className="btn-import-csv"
            onClick={onImportFromFile}
          >
            <i className="ph ph-upload-simple"></i>
            Import CSV
          </button>
          <button
            className="btn-add-question"
            onClick={onAddQuestion}
          >
            <i className="ph ph-plus-circle"></i>
            Add Question
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="question-list-body">
        {questions.length === 0 ? (
          <div className="questions-empty-state">
            <div className="empty-state-icon">
              <i className="ph ph-clipboard-text"></i>
            </div>
            <h4 className="empty-state-title">No questions added yet</h4>
            <p className="empty-state-description">
              Start building your exam by adding questions manually or importing from CSV
            </p>
            <div className="empty-state-actions">
              <button className="btn-add-option" onClick={onAddQuestion}>
                <i className="ph ph-plus-circle"></i>
                Add First Question
              </button>
              <button className="btn-import-csv" onClick={onImportFromFile} style={{ background: '#10b981', color: 'white' }}>
                <i className="ph ph-upload-simple"></i>
                Import from CSV
              </button>
            </div>
          </div>
        ) : (
          <>
            {questions.map((question, index) => (
              <div key={index} className="question-item">
                {/* Header */}
                <div className="question-item-header">
                  <div className="question-number-badge">
                    {index + 1}
                  </div>
                  <div className="question-content">
                    <h4 className="question-title">
                      {question.questionTitle || `Question ${question.questionNumber}`}
                    </h4>

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                      <div className="question-tags">
                        {question.tags.map((tag, idx) => (
                          <span key={idx} className="question-tag">
                            <i className="ph ph-tag"></i>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="question-item-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    {/* Question Type */}
                    <span className={`question-type-badge ${getQuestionTypeClass(question.questionType)}`}>
                      <i className={`ph ${getQuestionTypeIcon(question.questionType)}`}></i>
                      {getQuestionTypeLabel(question.questionType)}
                    </span>

                    {/* Score Input */}
                    <div className="question-score-input">
                      <label>Score:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={question.maxScore || 0}
                        onChange={(e) => handleUpdateMaxScore(index, e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="question-actions">
                    <button
                      className="btn-edit-question"
                      onClick={() => onEditQuestion(index)}
                      title="Edit question"
                    >
                      <i className="ph ph-pencil-simple"></i>
                    </button>
                    <button
                      className="btn-delete-question"
                      onClick={() => onDeleteQuestion(index)}
                      title="Delete question"
                    >
                      <i className="ph ph-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionListView_New;
