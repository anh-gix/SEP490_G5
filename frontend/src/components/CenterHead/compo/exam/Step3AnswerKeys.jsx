import React, { useState } from 'react';
import Button from '../Button';

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
      alert('Chỉ chấp nhận file CSV hoặc Excel');
      return;
    }

    // TODO: Parse CSV/Excel file and extract answer keys
    alert('Tính năng upload file sẽ được thêm sau khi tích hợp backend');
  };

  const addAnswer = () => {
    if (!currentSection) return;

    const newAnswer = {
      questionNumber: (currentSection.answerKey?.length || 0) + 1,
      questionType: 'multiple_choice',
      numberOfChoices: 4, // Default to 4 choices
      correctAnswer: [''],
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

  const updateAnswerMultipleFields = (answerIndex, updates) => {
    if (!currentSection) return;

    const updatedAnswers = currentSection.answerKey.map((answer, index) =>
      index === answerIndex ? { ...answer, ...updates } : answer
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
    // Create CSV template with numberOfChoices field
    const csvContent = 'Question#,QuestionType,NumberOfChoices,Answers,Score\n1,multiple_choice,4,A,1\n2,multiple_choice,4,"A|B",1\n3,true_false,2,True,1\n4,input,,"answer1|answer2",1\n5,multiple_choice,5,C,1';
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

  return (
    <div className="row g-3">
      {/* Section Selector */}
      <div className="col-12">
        <label className="form-label fw-semibold text-neutral-900">
          Chọn Section
        </label>
        <select
          className="form-select"
          value={selectedSectionIndex}
          onChange={(e) => setSelectedSectionIndex(parseInt(e.target.value))}
        >
          {sectionsNeedingAnswers.map((section, index) => {
            const sectionNumber = examData.sections.indexOf(section) + 1;
            return (
              <option key={section.id} value={index}>
                Section {sectionNumber} - {section.type.charAt(0).toUpperCase() + section.type.slice(1)} ({section.answerKey?.length || 0} câu hỏi)
              </option>
            );
          })}
        </select>
      </div>

      {/* Upload Method Toggle */}
      <div className="col-12">
        <div className="d-flex gap-2 p-2 bg-neutral-100 rounded">
          <button
            className={`flex-grow-1 px-3 py-2 rounded text-sm fw-medium border-0 ${
              uploadMethod === 'file'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'bg-transparent text-neutral-600'
            }`}
            onClick={() => setUploadMethod('file')}
          >
            <i className="ph ph-upload me-2"></i>
            Upload File
          </button>
          <button
            className={`flex-grow-1 px-3 py-2 rounded text-sm fw-medium border-0 ${
              uploadMethod === 'manual'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'bg-transparent text-neutral-600'
            }`}
            onClick={() => setUploadMethod('manual')}
          >
            <i className="ph ph-pencil-simple me-2"></i>
            Nhập thủ công
          </button>
        </div>
      </div>

      {/* File Upload Method */}
      {uploadMethod === 'file' && (
        <div className="col-12">
          <div className="border border-neutral-200 rounded p-3">
            {/* Upload Area */}
            <div className="mb-3">
              <label
                htmlFor={`file-upload-${currentSection.id}`}
                className="d-block border border-neutral-300 border-dashed rounded p-4 text-center cursor-pointer bg-neutral-50"
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex flex-column align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-main-50 mb-3" style={{ width: '64px', height: '64px' }}>
                    <i className="ph ph-cloud-arrow-up text-main-600" style={{ fontSize: '28px' }}></i>
                  </div>
                  <p className="text-neutral-900 fw-medium mb-2 text-sm">
                    Chọn file Excel hoặc CSV
                  </p>
                  <p className="text-neutral-500 text-xs mb-0">
                    Định dạng: Câu hỏi | Đáp án | Điểm
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
            <div className="text-center mb-3">
              <Button
                variant="outline"
                size="sm"
                icon="ph ph-download"
                onClick={downloadTemplate}
              >
                Tải Template CSV
              </Button>
            </div>

            {/* Answer Key Format Info */}
            <div className="alert alert-info mb-0">
              <div className="d-flex gap-2">
                <i className="ph ph-info mt-1"></i>
                <div>
                  <p className="fw-semibold mb-2 text-sm">Định dạng file đáp án</p>
                  <ul className="text-sm mb-0 ps-3">
                    <li><strong>Câu hỏi:</strong> Số thứ tự (1, 2, 3...)</li>
                    <li><strong>Loại câu hỏi:</strong> multiple_choice (trắc nghiệm), true_false (đúng/sai), input (điền từ)</li>
                    <li><strong>Số lựa chọn:</strong> 2-10 (bắt buộc cho multiple_choice, để trống cho các loại khác)</li>
                    <li><strong>Đáp án đúng:</strong> Một đáp án (A) hoặc nhiều đáp án cách nhau bởi | (A|B|C)</li>
                    <li><strong>Điểm:</strong> Điểm cho câu hỏi (VD: 1, 0.5, 2)</li>
                  </ul>
                  <div className="text-sm mb-0 mt-2">
                    <strong>Ví dụ:</strong>
                    <ul className="ps-3 mb-0 mt-1">
                      <li>1,multiple_choice,4,A,1 (câu trắc nghiệm 4 đáp án, đáp án đúng là A)</li>
                      <li>2,multiple_choice,4,"A|B",1 (câu trắc nghiệm 4 đáp án, đáp án đúng là A và B)</li>
                      <li>3,true_false,2,True,1 (câu đúng/sai, đáp án là True)</li>
                      <li>4,input,,"answer",1 (câu điền từ, đáp án là "answer")</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Method */}
      {uploadMethod === 'manual' && (
        <div className="col-12">
          {/* Answer List */}
          {currentSection.answerKey && currentSection.answerKey.length > 0 ? (
            <div className="mb-3">
              {currentSection.answerKey.map((answer, index) => (
                <div
                  key={index}
                  className="border border-neutral-200 rounded p-3 mb-2"
                >
                  <div className="d-flex align-items-start gap-3">
                    {/* Question Number */}
                    <div className="d-flex align-items-center justify-content-center rounded bg-main-50 text-main-600 fw-bold flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                      {answer.questionNumber}
                    </div>

                    {/* Answer Fields */}
                    <div className="flex-grow-1">
                      <div className="row g-2 mb-2">
                        <div className="col-md-5">
                          <label className="form-label text-neutral-700 fw-medium text-xs mb-1">
                            Loại câu hỏi <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select form-select-sm"
                            value={answer.questionType || 'multiple_choice'}
                            onChange={(e) => {
                              const newType = e.target.value;

                              // Update questionType and numberOfChoices together
                              const updates = { questionType: newType };

                              if (newType === 'true_false') {
                                updates.numberOfChoices = 2;
                              } else if (newType === 'input') {
                                updates.numberOfChoices = null;
                              } else if (newType === 'multiple_choice') {
                                updates.numberOfChoices = answer.numberOfChoices || 4;
                              }

                              updateAnswerMultipleFields(index, updates);
                            }}
                          >
                            <option value="multiple_choice">Trắc nghiệm</option>
                            <option value="true_false">Đúng/Sai</option>
                            <option value="input">Điền từ</option>
                          </select>
                        </div>

                        {/* Number of Choices - Only show for multiple_choice */}
                        {answer.questionType === 'multiple_choice' && (
                          <div className="col-md-3">
                            <label className="form-label text-neutral-700 fw-medium text-xs mb-1">
                              Số đáp án <span className="text-danger">*</span>
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="4"
                              min="2"
                              max="10"
                              value={answer.numberOfChoices || 4}
                              onChange={(e) => updateAnswer(index, 'numberOfChoices', parseInt(e.target.value) || 4)}
                            />
                          </div>
                        )}

                        {/* Show numberOfChoices as read-only for true_false */}
                        {answer.questionType === 'true_false' && (
                          <div className="col-md-3">
                            <label className="form-label text-neutral-700 fw-medium text-xs mb-1">
                              Số đáp án
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value="2 (True/False)"
                              disabled
                            />
                          </div>
                        )}

                        <div className={answer.questionType === 'input' ? 'col-md-7' : 'col-md-4'}>
                          <label className="form-label text-neutral-700 fw-medium text-xs mb-1">
                            Điểm <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="1"
                            min="0"
                            step="0.5"
                            value={answer.maxScore}
                            onChange={(e) => updateAnswer(index, 'maxScore', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      {/* Multiple Correct Answers */}
                      <div className="mb-2">
                        <label className="form-label text-neutral-700 fw-medium text-xs mb-1">
                          Đáp án đúng <span className="text-danger">*</span>
                          <span className="text-neutral-500 fw-normal ms-1">
                            {answer.questionType === 'multiple_choice' &&
                              `(Nhập A, B, C, D... tùy theo số đáp án. Có thể có nhiều đáp án đúng)`}
                            {answer.questionType === 'true_false' &&
                              `(Nhập True hoặc False)`}
                            {answer.questionType === 'input' &&
                              `(Nhập từ/cụm từ đúng. Có thể có nhiều cách trả lời)`}
                          </span>
                        </label>

                        {/* Helper text for number of choices */}
                        {answer.questionType === 'multiple_choice' && answer.numberOfChoices && (
                          <div className="alert alert-light p-2 mb-2 text-xs">
                            <i className="ph ph-info me-1"></i>
                            Câu hỏi có {answer.numberOfChoices} đáp án (
                            {Array.from({ length: answer.numberOfChoices }, (_, i) =>
                              String.fromCharCode(65 + i) // A, B, C, D, E...
                            ).join(', ')})
                          </div>
                        )}

                        {Array.isArray(answer.correctAnswer) && answer.correctAnswer.map((ans, ansIdx) => (
                          <div key={ansIdx} className="d-flex gap-2 mb-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder={
                                answer.questionType === 'multiple_choice'
                                  ? 'A, B, C, D...'
                                  : answer.questionType === 'true_false'
                                  ? 'True hoặc False'
                                  : 'Nhập từ/cụm từ đúng'
                              }
                              value={ans}
                              onChange={(e) => {
                                const newAnswers = [...answer.correctAnswer];
                                newAnswers[ansIdx] = e.target.value;
                                updateAnswer(index, 'correctAnswer', newAnswers);
                              }}
                            />
                            {answer.correctAnswer.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  const newAnswers = answer.correctAnswer.filter((_, i) => i !== ansIdx);
                                  updateAnswer(index, 'correctAnswer', newAnswers);
                                }}
                                title="Xóa đáp án này"
                              >
                                <i className="ph ph-x"></i>
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            const newAnswers = [...(answer.correctAnswer || ['']), ''];
                            updateAnswer(index, 'correctAnswer', newAnswers);
                          }}
                        >
                          <i className="ph ph-plus me-1"></i>
                          Thêm đáp án đúng khác
                        </button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '40px', height: '40px', padding: '0' }}
                      onClick={() => deleteAnswer(index)}
                      title="Xóa đáp án"
                    >
                      <i className="ph ph-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 mb-3">
              <i className="ph ph-clipboard-text text-neutral-400" style={{ fontSize: '32px' }}></i>
              <p className="text-neutral-500 text-sm mt-2 mb-0">
                Chưa có đáp án nào. Nhấn nút bên dưới để thêm.
              </p>
            </div>
          )}

          {/* Add Answer Button */}
          <Button
            variant="outline"
            icon="ph ph-plus"
            onClick={addAnswer}
            className="w-100"
          >
            Thêm đáp án
          </Button>
        </div>
      )}

      {/* Display current answers summary */}
      {currentSection.answerKey && currentSection.answerKey.length > 0 && (
        <div className="col-12">
          <div className="alert alert-success mb-0">
            <div className="d-flex align-items-center gap-2">
              <i className="ph ph-check-circle"></i>
              <div>
                <p className="fw-semibold mb-1 text-sm">
                  Đã tải lên đáp án: {currentSection.answerKey.length} section(s)
                </p>
                <p className="text-xs mb-0">
                  Tổng số đáp án cho section này: {currentSection.answerKey.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3AnswerKeys;
