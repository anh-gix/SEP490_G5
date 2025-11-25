import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const Step4Publish = ({
  examData,
  totalDuration,
  totalQuestions,
  totalScore,
  onSave,
  onPublish,
  examId
}) => {
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
      // Save exam first (if not already saved)
      if (onSave) {
        const saved = await onSave();
        if (!saved) {
          setIsSubmitting(false);
          return;
        }
      }

      // If publish status is 'publish', call publish API
      if (publishStatus === 'publish') {
        if (!examId) {
          alert('Vui lòng lưu đề thi trước');
          setIsSubmitting(false);
          return;
        }

        if (onPublish) {
          await onPublish();
        }
      } else {
        // Just save as draft
        alert('Đề thi đã được lưu nháp thành công!');
        navigate('/center-head/exams');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Có lỗi xảy ra khi lưu đề thi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const readyToPublish = isReadyToPublish();

  return (
    <div className="row g-3">
      {/* Publication Status */}
      <div className="col-12">
        <h6 className="text-neutral-900 fw-semibold mb-3">Trạng thái xuất bản</h6>
        <p className="text-neutral-600 text-sm mb-3">
          Chọn cách xuất bản đề thi của bạn
        </p>

        <div className="d-flex flex-column gap-2">
          {/* Save as Draft */}
          <label
            className={`border rounded p-3 ${
              publishStatus === 'draft'
                ? 'border-main-600 bg-main-50'
                : 'border-neutral-200 bg-white'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-start gap-3">
              <input
                type="radio"
                name="publishStatus"
                value="draft"
                checked={publishStatus === 'draft'}
                onChange={(e) => setPublishStatus(e.target.value)}
                className="form-check-input mt-1"
              />
              <div className="flex-grow-1">
                <div className="fw-semibold text-neutral-900 mb-1">Lưu nháp</div>
                <div className="text-neutral-600 text-sm">
                  Đề thi sẽ được lưu nhưng chưa hiển thị cho học viên
                </div>
              </div>
            </div>
          </label>

          {/* Publish Now */}
          <label
            className={`border rounded p-3 ${
              publishStatus === 'publish'
                ? 'border-main-600 bg-main-50'
                : 'border-neutral-200 bg-white'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-start gap-3">
              <input
                type="radio"
                name="publishStatus"
                value="publish"
                checked={publishStatus === 'publish'}
                onChange={(e) => setPublishStatus(e.target.value)}
                className="form-check-input mt-1"
              />
              <div className="flex-grow-1">
                <div className="fw-semibold text-neutral-900 mb-1">Xuất bản ngay</div>
                <div className="text-neutral-600 text-sm">
                  Đề thi sẽ được xuất bản ngay lập tức cho học viên
                </div>
              </div>
            </div>
          </label>
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

      {/* Ready to Publish Message */}
      <div className="col-12">
        {readyToPublish ? (
          <div className="alert alert-success mb-0">
            <div className="d-flex align-items-start gap-2">
              <i className="ph ph-check-circle text-success-600 mt-1" style={{ fontSize: '20px' }}></i>
              <div>
                <p className="fw-semibold mb-2">Sẵn sàng xuất bản</p>
                <p className="text-sm mb-0">
                  Đề thi của bạn đã được cấu hình đầy đủ các sections và đáp án. Nhấn "Lưu & Xuất bản"
                  để hoàn tất tạo đề thi.
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
                  Vui lòng hoàn thành tất cả các trường bắt buộc và thêm đáp án để xuất bản đề thi.
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
                {examData.examType === 'practice' ? 'Luyện tập' : 'Chính thức'}
              </span>
            </div>
            <div className="col-6">
              <span className="text-neutral-500 text-xs d-block mb-1">Cấp độ</span>
              <span className="text-neutral-900 fw-medium text-sm">{examData.level}</span>
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
              {examData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className="d-flex justify-content-between align-items-center p-2 bg-neutral-50 rounded"
                >
                  <div>
                    <span className="text-neutral-900 fw-medium text-sm">
                      Section {index + 1}: {getSectionLabel(section.type)}
                    </span>
                  </div>
                  <div className="d-flex gap-3 text-xs text-neutral-600">
                    <span>{section.duration} phút</span>
                    <span>{section.answerKey?.length || 0} câu hỏi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="col-12">
        <Button
          variant="primary"
          size="lg"
          icon={isSubmitting ? null : 'ph ph-check-circle'}
          onClick={handleSaveAndPublish}
          disabled={isSubmitting || (publishStatus === 'publish' && !readyToPublish)}
          className="w-100"
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Đang lưu...
            </>
          ) : (
            <>
              {publishStatus === 'publish' ? 'Lưu & Xuất bản' : 'Lưu nháp'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step4Publish;
