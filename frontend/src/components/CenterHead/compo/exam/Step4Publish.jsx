import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const Step4Publish = ({
  examData,
  totalDuration,
  totalQuestions,
  totalScore,
  onSave,
  examId
}) => {
  const getSectionLabel = (type) => {
    const labels = {
      reading: 'Reading',
      listening: 'Listening',
      writing: 'Writing',
      speaking: 'Speaking'
    };
    return labels[type] || type;
  };

  const getExamTypeLabel = (examType) => {
    const labels = {
      cambridge: 'Cambridge',
      ielts: 'IELTS',
      toeic: 'TOEIC'
    };
    return labels[examType] || examType;
  };

  // Check if exam is complete
  const isExamComplete = () => {
    // Basic info complete
    const hasBasicInfo = examData.title && examData.totalDuration > 0;

    // At least one section
    const hasSections = examData.sections.length > 0;

    // Sections that need answer keys have them
    const answersComplete = examData.sections.every(section => {
      if (section.type === 'reading' || section.type === 'listening') {
        return section.answerKey && section.answerKey.length > 0;
      }
      return true;
    });

    return hasBasicInfo && hasSections && answersComplete;
  };

  const examComplete = isExamComplete();

  return (
    <div className="row g-3">
      {/* Review Instructions */}
      <div className="col-12">
        <div className="alert alert-info border-0 bg-blue-50">
          <div className="d-flex align-items-start gap-2">
            <i className="ph ph-info text-blue-600 mt-1" style={{ fontSize: '20px' }}></i>
            <div>
              <p className="fw-semibold mb-2 text-blue-900">Xem lại thông tin đề thi</p>
              <p className="text-sm mb-0 text-blue-700">
                Vui lòng kiểm tra kỹ thông tin đề thi trước khi hoàn tất. Sau khi lưu, bạn có thể Publish hoặc Submit để duyệt từ danh sách đề thi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Verification */}
      <div className="col-12">
        <h6 className="text-neutral-900 fw-semibold mb-3">Kiểm tra đề thi</h6>

        <div className="d-flex flex-column gap-2">
          {/* Basic Information */}
          <div className="d-flex align-items-center gap-3">
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle ${
                examData.title ? 'bg-success-600' : 'bg-neutral-300'
              }`}
              style={{ width: '24px', height: '24px', minWidth: '24px' }}
            >
              {examData.title && <i className="ph ph-check text-white" style={{ fontSize: '14px' }}></i>}
            </div>
            <span className="text-sm text-neutral-700">Thông tin cơ bản đã hoàn thành</span>
          </div>

          {/* Sections Added */}
          <div className="d-flex align-items-center gap-3">
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle ${
                examData.sections.length > 0 ? 'bg-success-600' : 'bg-neutral-300'
              }`}
              style={{ width: '24px', height: '24px', minWidth: '24px' }}
            >
              {examData.sections.length > 0 && <i className="ph ph-check text-white" style={{ fontSize: '14px' }}></i>}
            </div>
            <span className="text-sm text-neutral-700">
              Đã thêm sections: {examData.sections.length} section(s)
            </span>
          </div>

          {/* Answer Keys */}
          <div className="d-flex align-items-center gap-3">
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle ${
                examData.sections.every(s =>
                  s.type === 'reading' || s.type === 'listening'
                    ? s.answerKey && s.answerKey.length > 0
                    : true
                )
                  ? 'bg-success-600'
                  : 'bg-neutral-300'
              }`}
              style={{ width: '24px', height: '24px', minWidth: '24px' }}
            >
              {examData.sections.every(s =>
                s.type === 'reading' || s.type === 'listening'
                  ? s.answerKey && s.answerKey.length > 0
                  : true
              ) && <i className="ph ph-check text-white" style={{ fontSize: '14px' }}></i>}
            </div>
            <span className="text-sm text-neutral-700">
              Đã upload đáp án:{' '}
              {examData.sections.filter(s =>
                (s.type === 'reading' || s.type === 'listening') && s.answerKey && s.answerKey.length > 0
              ).length}{' '}
              section(s)
            </span>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="col-12">
        {examComplete ? (
          <div className="alert alert-success mb-0">
            <div className="d-flex align-items-start gap-2">
              <i className="ph ph-check-circle text-success-600 mt-1" style={{ fontSize: '20px' }}></i>
              <div>
                <p className="fw-semibold mb-2">Đề thi hoàn tất</p>
                <p className="text-sm mb-0">
                  Đề thi của bạn đã được cấu hình đầy đủ. Nhấn "Hoàn tất" để lưu và quay về danh sách đề thi.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning mb-0">
            <div className="d-flex align-items-start gap-2">
              <i className="ph ph-warning text-warning-600 mt-1" style={{ fontSize: '20px' }}></i>
              <div>
                <p className="fw-semibold mb-2">Thông tin chưa đầy đủ</p>
                <p className="text-sm mb-0">
                  Vui lòng hoàn thành tất cả các trường bắt buộc và thêm đáp án trước khi hoàn tất.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exam Summary Detail */}
      <div className="col-12">
        <div className="border border-neutral-200 rounded p-3">
          <h6 className="text-neutral-900 fw-semibold mb-3">Chi tiết đề thi</h6>

          {/* Title and Description */}
          <div className="mb-3 pb-3 border-bottom border-neutral-200">
            <div className="mb-2">
              <span className="text-neutral-500 text-xs d-block mb-1">Tên đề thi</span>
              <span className="text-neutral-900 fw-medium">
                {examData.title || <span className="text-neutral-400 fst-italic">Chưa đặt tên</span>}
              </span>
            </div>
            {examData.description && (
              <div>
                <span className="text-neutral-500 text-xs d-block mb-1">Mô tả</span>
                <span className="text-neutral-700 text-sm">{examData.description}</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="row g-2 mb-3 pb-3 border-bottom border-neutral-200">
            <div className="col-6">
              <span className="text-neutral-500 text-xs d-block mb-1">Loại đề thi</span>
              <span className="text-neutral-900 fw-medium text-sm">
                {getExamTypeLabel(examData.examType)}
              </span>
            </div>
            <div className="col-6">
              <span className="text-neutral-500 text-xs d-block mb-1">Cấp độ</span>
              <span className="text-neutral-900 fw-medium text-sm">{examData.level}</span>
            </div>
            <div className="col-6">
              <span className="text-neutral-500 text-xs d-block mb-1">Hiển thị</span>
              <span className={`badge ${examData.isPublished ? 'bg-success' : 'bg-primary'}`}>
                {examData.isPublished ? 'Public' : 'Private'}
              </span>
            </div>
            <div className="col-6">
              <span className="text-neutral-500 text-xs d-block mb-1">Sections</span>
              <span className="text-neutral-900 fw-bold">{examData.sections.length}</span>
            </div>
            <div className="col-6">
              <span className="text-neutral-500 text-xs d-block mb-1">Tổng câu hỏi</span>
              <span className="text-neutral-900 fw-bold">{totalQuestions}</span>
            </div>
            <div className="col-6">
              <span className="text-neutral-500 text-xs d-block mb-1">Thời gian</span>
              <span className="text-neutral-900 fw-bold">
                {totalDuration || examData.totalDuration} <span className="fw-normal">phút</span>
              </span>
            </div>
            <div className="col-6">
              <span className="text-neutral-500 text-xs d-block mb-1">Tổng điểm</span>
              <span className="text-neutral-900 fw-bold">
                {totalScore} <span className="fw-normal">điểm</span>
              </span>
            </div>
          </div>

          {/* Sections Detail */}
          <div>
            <span className="text-neutral-700 fw-semibold text-sm d-block mb-2">Chi tiết Sections</span>
            <div className="d-flex flex-column gap-2">
              {examData.sections.length > 0 ? (
                examData.sections.map((section, index) => (
                  <div
                    key={section.id || index}
                    className="d-flex justify-content-between align-items-center p-2 bg-neutral-50 rounded"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary">Part {section.part || index + 1}</span>
                      <span className="text-neutral-900 fw-medium text-sm">
                        {getSectionLabel(section.type)}
                      </span>
                    </div>
                    <div className="d-flex gap-3 text-xs text-neutral-600">
                      <span>{section.duration || 0} phút</span>
                      <span>{section.answerKey?.length || 0} câu hỏi</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-400 text-sm mb-0 fst-italic">Chưa có section nào</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Publish;
