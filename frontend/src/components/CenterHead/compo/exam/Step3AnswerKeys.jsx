import React, { useState } from 'react';
import QuestionListView from './QuestionListView';
import AddQuestionModal from './AddQuestionModal';

const Step3AnswerKeys = ({ examData, updateExamData }) => {
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  // Filter sections that need answer keys (reading/listening) và nhóm theo skill type
  const sectionsNeedingAnswers = examData.sections.filter(
    section => section.type === 'reading' || section.type === 'listening'
  );

  // Nhóm sections theo skill type
  const groupedSections = {};
  sectionsNeedingAnswers.forEach(section => {
    if (!groupedSections[section.type]) {
      groupedSections[section.type] = [];
    }
    groupedSections[section.type].push(section);
  });

  // Sắp xếp sections trong mỗi group theo part
  Object.keys(groupedSections).forEach(type => {
    groupedSections[type].sort((a, b) => (a.part || 1) - (b.part || 1));
  });

  // Chọn section đầu tiên nếu chưa chọn
  const currentSection = selectedSectionId
    ? examData.sections.find(s => s.id === selectedSectionId)
    : sectionsNeedingAnswers[0];

  const updateSectionAnswers = (answers) => {
    const updatedSections = examData.sections.map(section =>
      section.id === currentSection.id
        ? { ...section, answerKey: answers }
        : section
    );
    updateExamData({ sections: updatedSections });
  };

  const handleAddQuestionFromModal = (newQuestion) => {
    const currentAnswers = currentSection.answerKey || [];

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedAnswers = currentAnswers.map((q, i) =>
        i === editingQuestionIndex ? newQuestion : q
      );
      updateSectionAnswers(updatedAnswers);
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      updateSectionAnswers([...currentAnswers, newQuestion]);
    }
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedAnswers = currentSection.answerKey.filter((_, i) => i !== index);
      // Re-number questions
      const renumbered = updatedAnswers.map((answer, i) => ({
        ...answer,
        questionNumber: i + 1
      }));
      updateSectionAnswers(renumbered);
    }
  };

  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setIsAddQuestionModalOpen(true);
  };

  const handleImportFromFile = () => {
    // Trigger file input
    document.getElementById('csv-file-upload')?.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(fileExt)) {
      alert('Chỉ chấp nhận file CSV hoặc Excel');
      return;
    }

    // Read CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim());

      // Skip header row
      const dataRows = rows.slice(1);

      const parsedQuestions = dataRows.map((row, index) => {
        const columns = row.split(',').map(col => col.trim().replace(/^"|"$/g, ''));

        const questionNumber = parseInt(columns[0]) || index + 1;
        const questionTitle = columns[1] || '';
        const questionType = columns[2] || 'multiple_choice';
        const questionAnswerText = columns[3] || '';
        const correctAnswerText = columns[4] || '';
        const maxScore = parseFloat(columns[5]) || 1;
        const tagsText = columns[6] || '';

        // Parse questionAnswer - split by | and auto-assign keys A, B, C...
        let questionAnswer = [];
        if (questionType === 'multiple_choice' && questionAnswerText) {
          const answers = questionAnswerText.split('|').map(a => a.trim());
          questionAnswer = answers.map((text, idx) => ({
            key: String.fromCharCode(65 + idx), // A, B, C, D...
            text: text
          }));
        }

        // Parse correctAnswer
        let correctAnswer = [];
        if (questionType === 'true_false') {
          correctAnswer = [correctAnswerText.toUpperCase()];
        } else if (questionType === 'input') {
          correctAnswer = correctAnswerText.split('|').map(a => a.trim());
        } else {
          // multiple_choice - split by |
          correctAnswer = correctAnswerText.includes('|')
            ? correctAnswerText.split('|').map(a => a.trim())
            : [correctAnswerText.trim()];
        }

        // Parse tags
        const tags = tagsText ? tagsText.split('|').map(t => t.trim()) : [];

        return {
          questionNumber,
          questionTitle,
          questionType,
          questionAnswer,
          correctAnswer,
          maxScore,
          tags
        };
      });

      // Add parsed questions to current section
      updateSectionAnswers([...(currentSection.answerKey || []), ...parsedQuestions]);
      alert(`Đã import thành công ${parsedQuestions.length} câu hỏi!`);

      // Reset file input
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = `Question#,QuestionTitle,QuestionType,QuestionAnswer,CorrectAnswer,Score,Tags
1,What is the capital of France?,multiple_choice,Paris|London|Berlin|Rome,A,1,vocabulary|reading_comprehension
2,Select all prime numbers,multiple_choice,2|4|5|6|7,"A|C|E",2,grammar
3,Paris is the capital of France,true_false,,TRUE,1,reading_comprehension
4,Fill in the blank: The ___ is blue,input,,sky|ocean,1,vocabulary|grammar
5,Which continent is largest?,multiple_choice,Asia|Africa|Europe|America|Australia,A,1,reading_comprehension`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answer_key_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (sectionsNeedingAnswers.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="ph ph-info text-neutral-300" style={{ fontSize: '48px' }}></i>
        <p className="text-neutral-600 mt-3 mb-2">Không có section nào cần đáp án</p>
        <p className="text-sm text-neutral-500 mb-0">
          Chỉ có Reading và Listening sections cần đáp án. Writing và Speaking sẽ được chấm thủ công.
        </p>
      </div>
    );
  }

  const getSectionIcon = (type) => {
    const icons = {
      reading: 'ph-book-open',
      listening: 'ph-headphones'
    };
    return icons[type] || 'ph-file';
  };

  return (
    <div className="container-fluid px-0" style={{ backgroundColor: '#f5f5f5', padding: '2rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Section Selector Card - Nhóm theo Skill */}
        <div className="card shadow border mb-4" style={{
          borderColor: '#dee2e6',
          borderWidth: '1px',
          borderRadius: '0.5rem'
        }}>
          <div className="card-body" style={{ padding: '1.5rem' }}>
            <h6 className="mb-3 fw-bold">
              <i className="ph ph-folder-open me-2 text-primary"></i>
              Chọn Part để thêm đáp án
            </h6>

            {/* Hiển thị theo Skill Groups */}
            <div className="d-flex flex-column gap-3">
              {Object.keys(groupedSections).map(skillType => (
                <div key={skillType} className="border rounded p-3 bg-light">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className={`ph ${getSectionIcon(skillType)} text-primary`} style={{ fontSize: '20px' }}></i>
                    <h6 className="mb-0 fw-semibold text-capitalize">{skillType}</h6>
                    <span className="badge bg-primary ms-auto">{groupedSections[skillType].length} part(s)</span>
                  </div>

                  {/* Parts trong skill */}
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {groupedSections[skillType].map((section) => {
                      const isSelected = currentSection?.id === section.id;
                      const hasAnswers = section.answerKey && section.answerKey.length > 0;

                      return (
                        <button
                          key={section.id}
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} btn-sm d-flex align-items-center gap-2`}
                          onClick={() => setSelectedSectionId(section.id)}
                          style={{ minWidth: '120px' }}
                        >
                          <div className="d-flex align-items-center justify-content-center rounded-circle bg-white text-primary fw-bold"
                            style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                            {section.part || 1}
                          </div>
                          <span>
                            Part {section.part || 1}
                          </span>
                          {hasAnswers && (
                            <span className="badge bg-success ms-auto">{section.answerKey.length}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legacy dropdown - giữ lại để fallback */}
            <div className="row align-items-center mt-3 d-none">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-2">
                  <i className="ph ph-folder-open me-2 text-primary"></i>
                  Select Section (Legacy)
                </label>
                <select
                  className="form-select form-select-lg"
                  value={currentSection?.id || ''}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  style={{
                    cursor: 'pointer',
                    border: '2px solid #dee2e6',
                    borderRadius: '0.5rem'
                  }}
                >
                  {sectionsNeedingAnswers.map((section) => {
                    const sectionNumber = examData.sections.indexOf(section) + 1;
                    return (
                      <option key={section.id} value={section.id}>
                        Section {sectionNumber} - Part {section.part || 1} - {section.type.charAt(0).toUpperCase() + section.type.slice(1)} ({section.answerKey?.length || 0} questions)
                      </option>
                    );
                  })}
                </select>
              </div>
              
            </div>
          </div>
        </div>

        {/* Question List View Card */}
        <div className="card shadow border mb-5" style={{
          borderColor: '#dee2e6',
          borderWidth: '1px',
          borderRadius: '0.5rem'
        }}>
          <div className="card-body p-0">
            <QuestionListView
              questions={currentSection.answerKey || []}
              onUpdateQuestions={updateSectionAnswers}
              onDeleteQuestion={handleDeleteQuestion}
              onEditQuestion={handleEditQuestion}
              onImportFromFile={handleImportFromFile}
              onAddQuestion={() => {
                setEditingQuestionIndex(null);
                setIsAddQuestionModalOpen(true);
              }}
            />
          </div>
        </div>

        {/* Hidden file input */}
        <input
          id="csv-file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="d-none"
        />

        {/* CSV Template Download Helper */}
        <div className="card shadow border" style={{
          borderColor: '#dee2e6',
          borderWidth: '1px',
          borderRadius: '0.5rem'
        }}>
          <div className="card-body" style={{ padding: '1.5rem' }}>
            <div className="alert alert-info mb-0 border-0">
              <div className="d-flex align-items-start gap-3">
                <i className="ph ph-info-circle fs-4 text-info"></i>
                <div className="flex-grow-1">
                  <h6 className="fw-semibold mb-2">CSV File Format</h6>
                  <p className="text-sm mb-3 text-muted">
                    Download the CSV template to see the correct format for importing questions.
                  </p>
                  <button
                    className="btn btn-sm btn-info shadow-sm"
                    onClick={downloadTemplate}
                    style={{ transition: 'all 0.2s' }}
                  >
                    <i className="ph ph-download me-2"></i>
                    Download CSV Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Question Modal */}
        <AddQuestionModal
          isOpen={isAddQuestionModalOpen}
          onClose={() => {
            setIsAddQuestionModalOpen(false);
            setEditingQuestionIndex(null);
          }}
          onAddQuestion={handleAddQuestionFromModal}
          questionNumber={
            editingQuestionIndex !== null
              ? currentSection.answerKey[editingQuestionIndex].questionNumber
              : (currentSection.answerKey?.length || 0) + 1
          }
          initialData={
            editingQuestionIndex !== null
              ? currentSection.answerKey[editingQuestionIndex]
              : null
          }
          isEditing={editingQuestionIndex !== null}
        />
      </div>
    </div>
  );
};

export default Step3AnswerKeys;
