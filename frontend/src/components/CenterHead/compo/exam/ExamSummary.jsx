import React from 'react';

const ExamSummary = ({ examData, totalDuration, totalQuestions, totalScore, onSave, onCreate }) => {
  return (
    <div className="bg-white rounded-16 border border-neutral-200 p-24">
      <h6 className="text-neutral-900 fw-semibold mb-24 text-md">Tóm Tắt Đề Thi</h6>

      {/* Exam Title */}
      <div className="mb-20">
        <div className="text-neutral-500 mb-8 text-xs">Tên Đề Thi</div>
        <div className="text-neutral-900 fw-medium text-sm">
          {examData.title || <span className="text-neutral-400 fst-italic">(Chưa nhập)</span>}
        </div>
      </div>

      {/* Level */}
      <div className="mb-20">
        <div className="text-neutral-500 mb-8 text-xs">Cấp Độ</div>
        <div className="text-neutral-900 fw-medium text-sm">{examData.level}</div>
      </div>

      {/* Type */}
      <div className="mb-20">
        <div className="text-neutral-500 mb-8 text-xs">Loại Đề</div>
        <div className="text-neutral-900 fw-medium text-sm">
          {examData.examType === 'practice' ? 'Luyện Tập' : 'Chính Thức'}
        </div>
      </div>

      {/* Statistics */}
      <div className="border-top border-neutral-200 pt-20 mb-20">
        <div className="row g-3 text-center">
          <div className="col-6">
            <div className="text-neutral-500 mb-8 text-xs">Số Sections</div>
            <div className="text-main-600 fw-bold text-24">{examData.sections.length}</div>
          </div>
          <div className="col-6">
            <div className="text-neutral-500 mb-8 text-xs">Tổng Thời Gian</div>
            <div className="text-neutral-900 fw-bold text-24">{totalDuration} <span className="text-xs fw-normal">phút</span></div>
          </div>
          <div className="col-6">
            <div className="text-neutral-500 mb-8 text-xs">Tổng Điểm</div>
            <div className="text-neutral-900 fw-bold text-24">{totalScore} <span className="text-xs fw-normal">điểm</span></div>
          </div>
          <div className="col-6">
            <div className="text-neutral-500 mb-8 text-xs">Tổng Câu Hỏi</div>
            <div className="text-neutral-900 fw-bold text-24">{totalQuestions} <span className="text-xs fw-normal">câu</span></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-top border-neutral-200 pt-20">
        <button
          className="btn btn-main w-100 mb-12 py-12 radius-8 text-sm fw-semibold"
          onClick={onCreate}
          disabled={!examData.title || examData.sections.length === 0}
        >
          <i className="fas fa-file-export me-8"></i>
          Tạo Đề Thi
        </button>
        <button
          className="btn btn-outline-main w-100 py-12 radius-8 text-sm fw-medium"
          onClick={onSave}
          disabled={!examData.title}
        >
          Lưu Nháp
        </button>
      </div>
    </div>
  );
};

export default ExamSummary;
