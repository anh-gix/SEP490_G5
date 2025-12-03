import React, { useState } from 'react';
import AddQuestionModal from './AddQuestionModal_New';
import QuestionListView from './QuestionListView_New';
import '../../../../assets/css/exam-answer-keys.css';

const Step3AnswerKeys = ({ examData, updateExamData }) => {
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Get sections that need answer keys
  const sectionsNeedingAnswers = examData.sections.filter(
    section => section.type === 'reading' || section.type === 'listening'
  );

  // Group sections by type
  const groupedSections = {};
  sectionsNeedingAnswers.forEach(section => {
    if (!groupedSections[section.type]) {
      groupedSections[section.type] = [];
    }
    groupedSections[section.type].push(section);
  });

  // Sort sections by part
  Object.keys(groupedSections).forEach(type => {
    groupedSections[type].sort((a, b) => (a.part || 1) - (b.part || 1));
  });

  // Select first section if none selected
  const currentSection = selectedSectionId
    ? examData.sections.find(s => s.id === selectedSectionId)
    : sectionsNeedingAnswers[0];

  if (!selectedSectionId && currentSection) {
    setSelectedSectionId(currentSection.id);
  }

  const updateSectionAnswers = (answers) => {
    const updatedSections = examData.sections.map(section =>
      section.id === currentSection.id
        ? { ...section, answerKey: answers }
        : section
    );
    updateExamData({ sections: updatedSections });
  };

  const handleAddQuestion = (newQuestion) => {
    const currentAnswers = currentSection?.answerKey || [];

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedAnswers = [...currentAnswers];
      updatedAnswers[editingQuestionIndex] = {
        ...newQuestion,
        questionNumber: editingQuestionIndex + 1
      };
      updateSectionAnswers(updatedAnswers);
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      const updatedAnswers = [
        ...currentAnswers,
        { ...newQuestion, questionNumber: currentAnswers.length + 1 }
      ];
      updateSectionAnswers(updatedAnswers);
    }
  };

  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setShowAddQuestionModal(true);
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      const currentAnswers = currentSection?.answerKey || [];
      const updatedAnswers = currentAnswers
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, questionNumber: i + 1 }));
      updateSectionAnswers(updatedAnswers);
    }
  };

  const handleUpdateQuestions = (updatedQuestions) => {
    updateSectionAnswers(updatedQuestions);
  };

  const getSectionTypeIcon = (type) => {
    const icons = {
      reading: 'ph-book-open',
      listening: 'ph-headphones'
    };
    return icons[type] || 'ph-file-text';
  };

  const getSectionTypeLabel = (type) => {
    const labels = {
      reading: 'Reading',
      listening: 'Listening'
    };
    return labels[type] || type;
  };

  if (sectionsNeedingAnswers.length === 0) {
    return (
      <div className="questions-empty-state">
        <div className="empty-state-icon">
          <i className="ph ph-warning"></i>
        </div>
        <h3 className="empty-state-title">No Sections Available</h3>
        <p className="empty-state-description">
          Please add Reading or Listening sections in Step 2 before adding answer keys.
        </p>
      </div>
    );
  }

  const currentQuestions = currentSection?.answerKey || [];
  const totalQuestions = currentQuestions.length;
  const totalScore = currentQuestions.reduce((sum, q) => sum + (q.maxScore || 0), 0);

  return (
    <div className="answer-keys-container">
      {/* Sidebar - Section Navigation */}
      <aside className="section-sidebar">
        <div className="section-sidebar-card">
          <div className="section-sidebar-header">
            <h4 className="section-sidebar-title">
              <i className="ph ph-list-bullets"></i>
              Sections
            </h4>
          </div>
          <div className="section-sidebar-body">
            {Object.entries(groupedSections).map(([type, sections]) => (
              <div key={type} className="section-group">
                <div className="section-group-title">
                  <i className={`ph ${getSectionTypeIcon(type)}`}></i>
                  {getSectionTypeLabel(type)}
                </div>
                {sections.map((section) => {
                  const isSelected = section.id === currentSection?.id;
                  const questionsCount = section.answerKey?.length || 0;

                  return (
                    <div
                      key={section.id}
                      className={`section-nav-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <div className="section-nav-icon">
                        {section.part || 1}
                      </div>
                      <div className="section-nav-content">
                        <div className="section-nav-label">
                          Part {section.part || 1}
                        </div>
                        <div className="section-nav-meta">
                          <i className="ph ph-clock" style={{ fontSize: '0.7rem' }}></i>
                          {section.duration || 0} min
                        </div>
                      </div>
                      {questionsCount > 0 && (
                        <div className="section-nav-badge">
                          {questionsCount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content - Question Management */}
      <main className="answer-keys-main">
        {/* Header with Current Section Info */}
        <div className="answer-keys-header">
          <div className="answer-keys-header-title">
            <div className="answer-keys-header-icon">
              <i className={`ph ${getSectionTypeIcon(currentSection?.type)}`}></i>
            </div>
            <div className="answer-keys-header-text">
              <h3>
                {getSectionTypeLabel(currentSection?.type)} - Part {currentSection?.part || 1}
              </h3>
              <p>
                Add and manage questions for this section
              </p>
            </div>
          </div>

          <div className="answer-keys-stats">
            <div className="stat-item">
              <div className="stat-value">{totalQuestions}</div>
              <div className="stat-label">Questions</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{totalScore}</div>
              <div className="stat-label">Total Marks</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{currentSection?.duration || 0}</div>
              <div className="stat-label">Minutes</div>
            </div>
          </div>
        </div>

        {/* Question List */}
        <QuestionListView
          questions={currentQuestions}
          onUpdateQuestions={handleUpdateQuestions}
          onDeleteQuestion={handleDeleteQuestion}
          onEditQuestion={handleEditQuestion}
          onImportFromFile={() => setShowImportModal(true)}
          onAddQuestion={() => {
            setEditingQuestionIndex(null);
            setShowAddQuestionModal(true);
          }}
        />
      </main>

      {/* Add/Edit Question Modal */}
      {showAddQuestionModal && (
        <AddQuestionModal
          isOpen={showAddQuestionModal}
          onClose={() => {
            setShowAddQuestionModal(false);
            setEditingQuestionIndex(null);
          }}
          onAddQuestion={handleAddQuestion}
          questionNumber={
            editingQuestionIndex !== null
              ? editingQuestionIndex + 1
              : currentQuestions.length + 1
          }
          initialData={
            editingQuestionIndex !== null
              ? currentQuestions[editingQuestionIndex]
              : null
          }
          isEditing={editingQuestionIndex !== null}
        />
      )}
    </div>
  );
};

export default Step3AnswerKeys;
