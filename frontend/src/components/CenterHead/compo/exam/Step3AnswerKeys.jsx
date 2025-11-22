import React, { useState } from 'react';

const Step3AnswerKeys = ({ examData, updateExamData }) => {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual' or 'file'

  // Filter sections that need answer keys (reading/listening)
  const sectionsNeedingAnswers = examData.sections.filter(
    section => section.type === 'reading' || section.type === 'listening'
  );

  const currentSection = sectionsNeedingAnswers[selectedSectionIndex];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(fileExt)) {
      alert('Please upload CSV or Excel file only');
      return;
    }

    // TODO: Parse CSV/Excel file and extract answer keys
    // For now, just show a message
    alert('File upload functionality will be implemented with backend integration');
  };

  const addAnswer = () => {
    if (!currentSection) return;

    const newAnswer = {
      questionNumber: (currentSection.answerKey?.length || 0) + 1,
      correctAnswer: '',
      maxScore: 1
    };

    updateSectionAnswers([...(currentSection.answerKey || []), newAnswer]);
  };

  const updateAnswer = (answerIndex, field, value) => {
    if (!currentSection) return;

    const updatedAnswers = currentSection.answerKey.map((answer, index) =>
      index === answerIndex ? { ...answer, [field]: value } : answer
    );

    updateSectionAnswers(updatedAnswers);
  };

  const deleteAnswer = (answerIndex) => {
    if (!currentSection) return;

    const updatedAnswers = currentSection.answerKey.filter((_, index) => index !== answerIndex);

    // Re-number questions
    const renumbered = updatedAnswers.map((answer, index) => ({
      ...answer,
      questionNumber: index + 1
    }));

    updateSectionAnswers(renumbered);
  };

  const updateSectionAnswers = (answers) => {
    const updatedSections = examData.sections.map(section =>
      section.id === currentSection.id
        ? { ...section, answerKey: answers }
        : section
    );
    updateExamData({ sections: updatedSections });
  };

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = 'Question#,Answer,Score\n1,A,1\n2,B,1\n3,C,1';
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
      <div className="bg-neutral-50 border border-neutral-200 border-dashed rounded-12 p-48 text-center">
        <div className="text-neutral-400 mb-16">
          <i className="fas fa-info-circle" style={{ fontSize: '48px' }}></i>
        </div>
        <h6 className="text-neutral-700 fw-semibold mb-12">No sections require answer keys</h6>
        <p className="text-neutral-500 text-sm mb-0">
          Only Reading and Listening sections require answer keys. Writing and Speaking sections are manually graded.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Upload Answer Keys Header */}
      <div className="mb-24">
        <h5 className="text-neutral-900 fw-semibold mb-8">Upload Answer Keys</h5>
        <p className="text-neutral-600 text-sm mb-0">
          Upload CSV or Excel file with answer keys for each section
        </p>
      </div>

      {/* Section Selector */}
      <div className="mb-24">
        <label className="text-neutral-900 fw-semibold mb-12 d-block text-sm">
          Select Section
        </label>
        <select
          className="form-select radius-8 bg-neutral-50 border-neutral-200 px-16 py-12 text-sm"
          value={selectedSectionIndex}
          onChange={(e) => setSelectedSectionIndex(parseInt(e.target.value))}
        >
          {sectionsNeedingAnswers.map((section, index) => {
            const sectionNumber = examData.sections.indexOf(section) + 1;
            return (
              <option key={section.id} value={index}>
                {section.type.charAt(0).toUpperCase() + section.type.slice(1)} ({section.answerKey?.length || 0} questions)
              </option>
            );
          })}
        </select>
      </div>

      {/* Upload Method Toggle */}
      <div className="mb-24">
        <div className="d-flex gap-12 p-4 bg-neutral-100 rounded-8">
          <button
            className={`flex-grow-1 px-16 py-10 radius-6 text-sm fw-medium border-0 ${
              uploadMethod === 'file'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'bg-transparent text-neutral-600'
            }`}
            onClick={() => setUploadMethod('file')}
          >
            <i className="fas fa-upload me-8"></i>
            Upload File
          </button>
          <button
            className={`flex-grow-1 px-16 py-10 radius-6 text-sm fw-medium border-0 ${
              uploadMethod === 'manual'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'bg-transparent text-neutral-600'
            }`}
            onClick={() => setUploadMethod('manual')}
          >
            <i className="fas fa-edit me-8"></i>
            Manual Entry
          </button>
        </div>
      </div>

      {/* File Upload Method */}
      {uploadMethod === 'file' && (
        <div className="mb-24">
          <div className="border border-neutral-200 rounded-12 p-24 bg-white">
            {/* Upload Area */}
            <div className="mb-20">
              <label
                htmlFor={`file-upload-${currentSection.id}`}
                className="d-block border border-neutral-300 border-dashed rounded-12 p-32 text-center cursor-pointer bg-neutral-50 hover-bg-neutral-100 transition-all"
              >
                <div className="d-flex flex-column align-items-center">
                  <div className="w-64 h-64 d-flex align-items-center justify-content-center rounded-circle bg-main-50 mb-16">
                    <i className="fas fa-cloud-upload-alt text-main-600 text-28"></i>
                  </div>
                  <p className="text-neutral-900 fw-medium mb-8 text-sm">
                    Choose Excel or CSV file
                  </p>
                  <p className="text-neutral-500 text-xs mb-0">
                    Format: Question# | Answer | Score
                  </p>
                </div>
                <input
                  id={`file-upload-${currentSection.id}`}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="d-none"
                />
              </label>
            </div>

            {/* Download Template */}
            <div className="text-center">
              <button
                className="btn btn-outline-main px-20 py-10 radius-8 text-sm fw-medium d-inline-flex align-items-center gap-8"
                onClick={downloadTemplate}
              >
                <i className="fas fa-download"></i>
                Download Answer Key Template (CSV)
              </button>
            </div>

            {/* Answer Key Format Info */}
            <div className="mt-20 bg-info-50 border border-info-200 rounded-12 p-16">
              <div className="d-flex gap-12">
                <i className="fas fa-info-circle text-info-600 mt-2"></i>
                <div>
                  <p className="text-info-900 fw-medium mb-8 text-sm">Answer Key Format</p>
                  <ul className="text-info-700 text-xs mb-0 ps-16">
                    <li><strong>Question Number:</strong> The sequence number of the question (1, 2, 3, etc.)</li>
                    <li><strong>Correct Answer:</strong> The correct answer option (A, B, C, or D)</li>
                    <li><strong>Max Score:</strong> Points assigned to this question (usually 1)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Method */}
      {uploadMethod === 'manual' && (
        <div>
          {/* Answer List */}
          {currentSection.answerKey && currentSection.answerKey.length > 0 ? (
            <div className="mb-20">
              {currentSection.answerKey.map((answer, index) => (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-12 p-20 mb-12"
                >
                  <div className="d-flex align-items-start gap-16">
                    {/* Question Number */}
                    <div className="w-48 h-48 d-flex align-items-center justify-content-center rounded-8 bg-main-50 text-main-600 fw-bold flex-shrink-0">
                      {answer.questionNumber}
                    </div>

                    {/* Answer Fields */}
                    <div className="flex-grow-1 row g-3">
                      <div className="col-md-8">
                        <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                          Correct Answer <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8 bg-neutral-50 border-neutral-200 px-12 py-10 text-sm"
                          placeholder="e.g., A, B, C, D or text answer"
                          value={answer.correctAnswer}
                          onChange={(e) => updateAnswer(index, 'correctAnswer', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="text-neutral-700 fw-medium mb-8 d-block text-xs">
                          Score <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control radius-8 bg-neutral-50 border-neutral-200 px-12 py-10 text-sm"
                          placeholder="1"
                          min="0"
                          step="0.5"
                          value={answer.maxScore}
                          onChange={(e) => updateAnswer(index, 'maxScore', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      className="w-40 h-40 d-flex align-items-center justify-content-center border border-danger-600 text-danger-600 rounded-8 hover-bg-danger-50 flex-shrink-0 bg-transparent"
                      onClick={() => deleteAnswer(index)}
                      title="Delete answer"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 border-dashed rounded-12 p-32 mb-20 text-center">
              <i className="fas fa-clipboard-list text-neutral-400 mb-12" style={{ fontSize: '32px' }}></i>
              <p className="text-neutral-500 text-sm mb-0">
                No answers added yet. Click the button below to add answers.
              </p>
            </div>
          )}

          {/* Add Answer Button */}
          <button
            className="btn btn-outline-main w-100 d-flex align-items-center justify-content-center gap-8 py-12 radius-8 text-sm fw-medium"
            onClick={addAnswer}
          >
            <i className="fas fa-plus-circle"></i>
            Add Answer
          </button>
        </div>
      )}

      {/* Display current answers summary */}
      {currentSection.answerKey && currentSection.answerKey.length > 0 && (
        <div className="mt-24 bg-success-50 border border-success-200 rounded-12 p-16">
          <div className="d-flex align-items-center gap-12">
            <i className="fas fa-check-circle text-success-600"></i>
            <div>
              <p className="text-success-900 fw-medium mb-4 text-sm">
                Answer keys uploaded: {currentSection.answerKey.length} section(s)
              </p>
              <p className="text-success-700 text-xs mb-0">
                Total answers for this section: {currentSection.answerKey.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3AnswerKeys;
