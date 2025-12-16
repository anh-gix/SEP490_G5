import React, { useState } from 'react';
import ExamBasicInfo from '../compo/exam/ExamBasicInfo';
import SectionForm from '../compo/exam/SectionForm';
import ExamSummary from '../compo/exam/ExamSummary';

const ExamCreate = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    examType: 'practice',
    level: 'Academic',
    totalDuration: 0,
    sections: []
  });

  // Calculate totals from sections
  const calculateTotals = (sections) => {
    const totalDuration = sections.reduce((sum, section) => sum + (parseInt(section.duration) || 0), 0);
    const totalQuestions = sections.reduce((sum, section) => sum + (section.answerKey?.length || 0), 0);
    const totalScore = sections.reduce((sum, section) => {
      const sectionScore = section.answerKey?.reduce((sSum, answer) => sSum + (parseFloat(answer.maxScore) || 0), 0) || 0;
      return sum + sectionScore;
    }, 0);

    return { totalDuration, totalQuestions, totalScore };
  };

  const updateExamBasicInfo = (field, value) => {
    setExamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      type: 'reading',
      fileUrl: '',
      audioUrl: '', // For listening section audio file
      instructions: '',
      duration: 0,
      questionCount: 0,
      answerKey: [],
      maxScore: 0
    };

    setExamData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionId, updatedSection) => {
    setExamData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? updatedSection : section
      )
    }));
  };

  const deleteSection = (sectionId) => {
    setExamData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const handleSaveExam = async () => {
    try {
      const { totalDuration } = calculateTotals(examData.sections);

      const examToSave = {
        ...examData,
        totalDuration,
        isPublished: false
      };

      console.log('Saving exam:', examToSave);
      alert('Đề thi đã được lưu thành công!');
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Có lỗi xảy ra khi lưu đề thi!');
    }
  };

  const handleCreateExam = async () => {
    try {
      const { totalDuration } = calculateTotals(examData.sections);

      const examToCreate = {
        ...examData,
        totalDuration,
        isPublished: true,
        publishedAt: new Date()
      };

      console.log('Creating exam:', examToCreate);
      alert('Đề thi đã được tạo và xuất bản thành công!');
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Có lỗi xảy ra khi tạo đề thi!');
    }
  };

  const { totalDuration, totalQuestions, totalScore } = calculateTotals(examData.sections);

  return (
    <div className="min-h-screen bg-neutral-50 py-32 px-24">
      <div className="container-xxl">
        <div className="row g-24">
          {/* Left Column - Forms */}
          <div className="col-12 col-lg-8">
            {/* Tabs */}
            <div className="bg-white rounded-16 border border-neutral-200 mb-24 overflow-hidden">
              <div className="d-flex">
                <button
                  className={`flex-grow-1 px-24 py-16 border-0 text-sm fw-medium position-relative ${
                    activeTab === 'info'
                      ? 'bg-white text-neutral-900'
                      : 'bg-neutral-50 text-neutral-500'
                  }`}
                  onClick={() => setActiveTab('info')}
                >
                  Thông Tin Chung
                  {activeTab === 'info' && (
                    <div className="position-absolute bottom-0 start-0 end-0 bg-main-600" style={{ height: '3px' }}></div>
                  )}
                </button>
                <button
                  className={`flex-grow-1 px-24 py-16 border-0 text-sm fw-medium position-relative ${
                    activeTab === 'sections'
                      ? 'bg-white text-neutral-900'
                      : 'bg-neutral-50 text-neutral-500'
                  }`}
                  onClick={() => setActiveTab('sections')}
                >
                  Sections ({examData.sections.length})
                  {activeTab === 'sections' && (
                    <div className="position-absolute bottom-0 start-0 end-0 bg-main-600" style={{ height: '3px' }}></div>
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'info' ? (
                <ExamBasicInfo examData={examData} updateExamBasicInfo={updateExamBasicInfo} />
              ) : (
                <div>
                  {/* Sections List */}
                  {examData.sections.length === 0 ? (
                    <div className="bg-white rounded-16 border border-neutral-200 p-48 text-center mb-24">
                      <div className="text-neutral-400 mb-20">
                        <i className="fas fa-inbox text-48"></i>
                      </div>
                      <h5 className="text-neutral-700 fw-semibold mb-12 text-lg">Chưa có section nào</h5>
                      <p className="text-neutral-500 mb-24 text-sm">Bắt đầu bằng cách thêm section đầu tiên cho đề thi của bạn</p>
                      <button
                        className="btn btn-outline-main px-24 py-12 radius-8 text-sm fw-medium"
                        onClick={addSection}
                      >
                        <i className="fas fa-plus me-8"></i>
                        Thêm Section Đầu Tiên
                      </button>
                    </div>
                  ) : (
                    <>
                      {examData.sections.map((section, index) => (
                        <div key={section.id} className="mb-20">
                          <SectionForm
                            section={section}
                            sectionIndex={index}
                            updateSection={updateSection}
                            deleteSection={deleteSection}
                          />
                        </div>
                      ))}

                      {/* Add Section Button */}
                      <div className="text-center mt-20">
                        <button
                          className="btn bg-transparent border-0 text-main-600 hover-text-main-700 text-sm fw-medium d-inline-flex align-items-center gap-8"
                          onClick={addSection}
                        >
                          <i className="fas fa-plus-circle"></i>
                          <span>Thêm Section Mới</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-12 col-lg-4">
            <div className="sticky-top" style={{ top: '24px' }}>
              <ExamSummary
                examData={examData}
                totalDuration={totalDuration}
                totalQuestions={totalQuestions}
                totalScore={totalScore}
                onSave={handleSaveExam}
                onCreate={handleCreateExam}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreate;
