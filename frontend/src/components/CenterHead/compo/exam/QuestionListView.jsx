import React, { useState } from 'react';

const QuestionListView = ({ questions, onUpdateQuestions, onDeleteQuestion, onEditQuestion, onImportFromFile, onAddQuestion }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedQuestions(questions.map((_, index) => index));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectQuestion = (index) => {
    if (selectedQuestions.includes(index)) {
      setSelectedQuestions(selectedQuestions.filter(i => i !== index));
    } else {
      setSelectedQuestions([...selectedQuestions, index]);
    }
  };

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

  const totalQuestions = questions.length;
  const totalMarks = questions.reduce((sum, q) => sum + (q.maxScore || 0), 0);

  return (
    <div className="question-list-view">
      {/* Header with Actions */}
      <div className="d-flex align-items-center justify-content-between p-3 bg-light border-bottom">
        <div className="d-flex align-items-center gap-4">
          <div className="d-flex align-items-center gap-1">
            <i className="ph ph-list-bullets text-primary"></i>
            <span className="text-muted small">
              <strong className="text-dark">{totalQuestions}</strong> Questions
            </span>
          </div>
          <div className="vr"></div>
          <div className="d-flex align-items-center gap-1">
            <i className="ph ph-chart-line text-success"></i>
            <span className="text-muted small">
              <strong className="text-dark">{totalMarks}</strong> Marks
            </span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-success d-flex align-items-center gap-1 px-3"
            onClick={onImportFromFile}
            style={{ transition: 'all 0.2s', fontSize: '0.875rem' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <i className="ph ph-upload-simple"></i>
            <span>Upload CSV</span>
          </button>
          <button
            className="btn btn-sm btn-primary d-flex align-items-center gap-1 px-3"
            onClick={onAddQuestion}
            style={{ transition: 'all 0.2s', fontSize: '0.875rem' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <i className="ph ph-plus-circle"></i>
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-white border-bottom py-3 px-3" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="row g-2 text-muted text-uppercase fw-semibold align-items-center" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
          <div className="col-auto" style={{ width: '50px' }}>#</div>
          <div className="col">Question Title</div>
          <div className="col-auto text-center" style={{ width: '150px' }}>Type</div>
          <div className="col-auto text-center" style={{ width: '100px' }}>Marks</div>
          <div className="col-auto text-center" style={{ width: '120px' }}>Actions</div>
        </div>
      </div>

      {/* Question List */}
      <div className="question-list bg-white">
        {questions.length === 0 ? (
          <div className="text-center py-5">
            <i className="ph ph-clipboard-text text-muted" style={{ fontSize: '64px', opacity: '0.3' }}></i>
            <p className="text-muted mt-4 mb-1 fw-semibold">No questions yet</p>
            <p className="text-muted small mb-0">
              Click "Add Question" or "Upload CSV" to get started.
            </p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={index}
              className="border-bottom bg-white"
              style={{
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div className="row g-2 align-items-center py-3 px-3">
                {/* Drag Handle + Number */}
                <div className="col-auto d-flex align-items-center gap-2" style={{ width: '50px' }}>
                  <i className="ph ph-dots-six-vertical text-muted" style={{ cursor: 'grab', fontSize: '1.1rem' }}></i>
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{index + 1}</span>
                </div>

                {/* Question Title */}
                <div className="col">
                  <div style={{ fontSize: '0.9rem' }} className="text-dark">
                    {question.questionTitle || `Question ${question.questionNumber}`}
                  </div>
                  {question.tags && question.tags.length > 0 && (
                    <div className="d-flex gap-1 mt-1">
                      {question.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '0.7rem', fontWeight: '500' }}>
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 3 && (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '0.7rem', fontWeight: '500' }}>
                          +{question.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Question Type */}
                <div className="col-auto text-center" style={{ width: '150px' }}>
                  <span className={`badge text-xs fw-semibold ${
                    question.questionType === 'multiple_choice' ? 'bg-primary bg-opacity-10 text-primary' :
                    question.questionType === 'true_false' ? 'bg-success bg-opacity-10 text-success' :
                    'bg-info bg-opacity-10 text-info'
                  }`} style={{ padding: '0.4rem 0.8rem' }}>
                    {getQuestionTypeLabel(question.questionType)}
                  </span>
                </div>

                {/* Marks Input */}
                <div className="col-auto text-center" style={{ width: '100px' }}>
                  <input
                    type="number"
                    className="form-control form-control-sm text-center fw-semibold"
                    min="0"
                    step="0.5"
                    value={question.maxScore || 0}
                    onChange={(e) => handleUpdateMaxScore(index, e.target.value)}
                    style={{ borderRadius: '0.375rem' }}
                  />
                </div>

                {/* Actions */}
                <div className="col-auto text-center" style={{ width: '120px' }}>
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEditQuestion(index)}
                      title="Edit question"
                      style={{ transition: 'all 0.2s' }}
                    >
                      <i className="ph ph-pencil-simple"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDeleteQuestion(index)}
                      title="Delete question"
                      style={{ transition: 'all 0.2s' }}
                    >
                      <i className="ph ph-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionListView;
