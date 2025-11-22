import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Step4Publish = ({ examData, totalDuration, totalQuestions, totalScore }) => {
  const navigate = useNavigate();
  const [publishStatus, setPublishStatus] = useState('draft'); // 'draft' or 'publish'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSectionLabel = (type) => {
    const labels = {
      reading: 'Reading',
      listening: 'Listening',
      writing: 'Writing',
      speaking: 'Speaking'
    };
    return labels[type] || type;
  };

  // Check if exam is ready to publish
  const isReadyToPublish = () => {
    // Basic info complete
    const hasBasicInfo = examData.title && examData.totalDuration > 0;

    // At least one section
    const hasSections = examData.sections.length > 0;

    // All sections have PDFs
    const allSectionsHavePdf = examData.sections.every(section => section.fileUrl);

    // Sections that need answer keys have them
    const answersComplete = examData.sections.every(section => {
      if (section.type === 'reading' || section.type === 'listening') {
        return section.answerKey && section.answerKey.length > 0;
      }
      return true;
    });

    return hasBasicInfo && hasSections && allSectionsHavePdf && answersComplete;
  };

  const handleSaveAndPublish = async () => {
    setIsSubmitting(true);

    try {
      const examToSubmit = {
        ...examData,
        totalDuration: totalDuration || examData.totalDuration,
        isPublished: publishStatus === 'publish',
        publishedAt: publishStatus === 'publish' ? new Date() : null
      };

      // TODO: API call to save exam
      console.log('Saving exam:', examToSubmit);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(
        publishStatus === 'publish'
          ? 'Exam has been published successfully!'
          : 'Exam has been saved as draft successfully!'
      );

      // Navigate back to exam list
      navigate('/center-head/exams');
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('An error occurred while saving the exam!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const readyToPublish = isReadyToPublish();

  return (
    <div>
      {/* Publication Status */}
      <div className="mb-32">
        <h5 className="text-neutral-900 fw-semibold mb-16">Publication Status</h5>
        <p className="text-neutral-600 text-sm mb-20">
          Choose how to publish your exam to learners
        </p>

        <div className="d-flex flex-column gap-12">
          {/* Save as Draft */}
          <label
            className={`border rounded-12 p-20 cursor-pointer transition-all ${
              publishStatus === 'draft'
                ? 'border-main-600 bg-main-50'
                : 'border-neutral-200 bg-white hover-bg-neutral-50'
            }`}
          >
            <div className="d-flex align-items-start gap-12">
              <input
                type="radio"
                name="publishStatus"
                value="draft"
                checked={publishStatus === 'draft'}
                onChange={(e) => setPublishStatus(e.target.value)}
                className="form-check-input mt-4"
              />
              <div className="flex-grow-1">
                <div className="fw-semibold text-neutral-900 mb-4">Save as Draft</div>
                <div className="text-neutral-600 text-sm">
                  Exam will be saved but not visible to learners yet
                </div>
              </div>
            </div>
          </label>

          {/* Publish Now */}
          <label
            className={`border rounded-12 p-20 cursor-pointer transition-all ${
              publishStatus === 'publish'
                ? 'border-main-600 bg-main-50'
                : 'border-neutral-200 bg-white hover-bg-neutral-50'
            }`}
          >
            <div className="d-flex align-items-start gap-12">
              <input
                type="radio"
                name="publishStatus"
                value="publish"
                checked={publishStatus === 'publish'}
                onChange={(e) => setPublishStatus(e.target.value)}
                className="form-check-input mt-4"
              />
              <div className="flex-grow-1">
                <div className="fw-semibold text-neutral-900 mb-4">Publish Now</div>
                <div className="text-neutral-600 text-sm">
                  Exam will be immediately available to learners
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Exam Verification */}
      <div className="mb-32">
        <h5 className="text-neutral-900 fw-semibold mb-16">Exam Verification</h5>

        <div className="d-flex flex-column gap-12">
          {/* Basic Information */}
          <div className="d-flex align-items-center gap-12">
            <div
              className={`w-24 h-24 rounded-circle d-flex align-items-center justify-content-center ${
                examData.title ? 'bg-success-600' : 'bg-neutral-300'
              }`}
            >
              {examData.title && <i className="fas fa-check text-white text-xs"></i>}
            </div>
            <span className="text-sm text-neutral-700">Basic information complete</span>
          </div>

          {/* Sections Added */}
          <div className="d-flex align-items-center gap-12">
            <div
              className={`w-24 h-24 rounded-circle d-flex align-items-center justify-content-center ${
                examData.sections.length > 0 ? 'bg-success-600' : 'bg-neutral-300'
              }`}
            >
              {examData.sections.length > 0 && <i className="fas fa-check text-white text-xs"></i>}
            </div>
            <span className="text-sm text-neutral-700">
              Sections added: {examData.sections.length} section(s)
            </span>
          </div>

          {/* Answer Keys */}
          <div className="d-flex align-items-center gap-12">
            <div
              className={`w-24 h-24 rounded-circle d-flex align-items-center justify-content-center ${
                examData.sections.every(s =>
                  s.type === 'reading' || s.type === 'listening'
                    ? s.answerKey && s.answerKey.length > 0
                    : true
                )
                  ? 'bg-success-600'
                  : 'bg-neutral-300'
              }`}
            >
              {examData.sections.every(s =>
                s.type === 'reading' || s.type === 'listening'
                  ? s.answerKey && s.answerKey.length > 0
                  : true
              ) && <i className="fas fa-check text-white text-xs"></i>}
            </div>
            <span className="text-sm text-neutral-700">
              Answer keys uploaded:{' '}
              {examData.sections.filter(s =>
                (s.type === 'reading' || s.type === 'listening') && s.answerKey && s.answerKey.length > 0
              ).length}{' '}
              section(s)
            </span>
          </div>
        </div>
      </div>

      {/* Ready to Publish Message */}
      {readyToPublish ? (
        <div className="bg-success-50 border border-success-200 rounded-12 p-20 mb-32">
          <div className="d-flex align-items-start gap-12">
            <i className="fas fa-check-circle text-success-600 text-xl mt-2"></i>
            <div>
              <p className="text-success-900 fw-semibold mb-8">Ready to Publish</p>
              <p className="text-success-700 text-sm mb-0">
                Your exam has been configured with all required sections and answer keys. Click "Save & Publish"
                to complete the exam creation.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-warning-50 border border-warning-200 rounded-12 p-20 mb-32">
          <div className="d-flex align-items-start gap-12">
            <i className="fas fa-exclamation-triangle text-warning-600 text-xl mt-2"></i>
            <div>
              <p className="text-warning-900 fw-semibold mb-8">Incomplete Information</p>
              <p className="text-warning-700 text-sm mb-0">
                Please complete all required fields and add answer keys to publish the exam.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exam Summary Detail */}
      <div className="border border-neutral-200 rounded-12 p-24 mb-32">
        <h6 className="text-neutral-900 fw-semibold mb-20">Exam Details</h6>

        {/* Title and Description */}
        <div className="mb-20 pb-20 border-bottom border-neutral-200">
          <div className="mb-12">
            <span className="text-neutral-500 text-xs d-block mb-4">Exam Title</span>
            <span className="text-neutral-900 fw-medium">
              {examData.title || <span className="text-neutral-400 fst-italic">Not set</span>}
            </span>
          </div>
          {examData.description && (
            <div>
              <span className="text-neutral-500 text-xs d-block mb-4">Description</span>
              <span className="text-neutral-700 text-sm">{examData.description}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="row g-3 mb-20 pb-20 border-bottom border-neutral-200">
          <div className="col-6">
            <span className="text-neutral-500 text-xs d-block mb-4">Exam Type</span>
            <span className="text-neutral-900 fw-medium">
              {examData.examType === 'practice' ? 'Practice' : 'Real Exam'}
            </span>
          </div>
          <div className="col-6">
            <span className="text-neutral-500 text-xs d-block mb-4">Level</span>
            <span className="text-neutral-900 fw-medium">{examData.level}</span>
          </div>
          <div className="col-6">
            <span className="text-neutral-500 text-xs d-block mb-4">Sections</span>
            <span className="text-neutral-900 fw-bold text-lg">{examData.sections.length}</span>
          </div>
          <div className="col-6">
            <span className="text-neutral-500 text-xs d-block mb-4">Total Questions</span>
            <span className="text-neutral-900 fw-bold text-lg">{totalQuestions}</span>
          </div>
          <div className="col-6">
            <span className="text-neutral-500 text-xs d-block mb-4">Duration</span>
            <span className="text-neutral-900 fw-bold text-lg">
              {totalDuration || examData.totalDuration} <span className="text-xs fw-normal">minutes</span>
            </span>
          </div>
          <div className="col-6">
            <span className="text-neutral-500 text-xs d-block mb-4">Total Score</span>
            <span className="text-neutral-900 fw-bold text-lg">
              {totalScore} <span className="text-xs fw-normal">points</span>
            </span>
          </div>
        </div>

        {/* Sections Detail */}
        <div>
          <span className="text-neutral-700 fw-semibold text-sm d-block mb-12">Sections Breakdown</span>
          <div className="d-flex flex-column gap-8">
            {examData.sections.map((section, index) => (
              <div
                key={section.id}
                className="d-flex justify-content-between align-items-center p-12 bg-neutral-50 rounded-8"
              >
                <div className="d-flex align-items-center gap-12">
                  <span className="text-neutral-900 fw-medium text-sm">
                    Section {index + 1}: {getSectionLabel(section.type)}
                  </span>
                </div>
                <div className="d-flex gap-16 text-xs text-neutral-600">
                  <span>{section.duration} min</span>
                  <span>{section.answerKey?.length || 0} questions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        className="btn btn-main w-100 py-14 radius-8 fw-semibold"
        onClick={handleSaveAndPublish}
        disabled={isSubmitting || (publishStatus === 'publish' && !readyToPublish)}
      >
        {isSubmitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-8"></span>
            Saving...
          </>
        ) : (
          <>
            <i className="fas fa-check-circle me-8"></i>
            {publishStatus === 'publish' ? 'Save & Publish' : 'Save as Draft'}
          </>
        )}
      </button>
    </div>
  );
};

export default Step4Publish;
