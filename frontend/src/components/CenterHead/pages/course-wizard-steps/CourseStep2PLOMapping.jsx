import { useState, useEffect } from 'react';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import courseService from '../../../../services/courseService';

const CourseStep2PLOMapping = ({ courseData, setCourseData, program, onNext, onPrevious }) => {
  const [loading, setLoading] = useState(false);
  const [programPLOs, setProgramPLOs] = useState([]);
  const [selectedPLOs, setSelectedPLOs] = useState([]);

  useEffect(() => {
    if (courseData._id) {
      fetchProgramPLOs();
      // Load existing mappedPLOs
      if (courseData.mappedPLOs) {
        setSelectedPLOs(courseData.mappedPLOs.map(plo =>
          typeof plo === 'object' ? plo._id : plo
        ));
      }
    }
  }, [courseData._id]);

  const fetchProgramPLOs = async () => {
    try {
      setLoading(true);
      const response = await courseService.getProgramPLOs(courseData._id);
      setProgramPLOs(response.data.plos || []);
    } catch (error) {
      console.error('Error loading program PLOs:', error);
      alert(error.message || 'Không thể tải danh sách PLO của chương trình!');
    } finally {
      setLoading(false);
    }
  };

  const handlePLOCheckbox = (ploId) => {
    setSelectedPLOs(prev => {
      if (prev.includes(ploId)) {
        return prev.filter(id => id !== ploId);
      } else {
        return [...prev, ploId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPLOs.length === programPLOs.length) {
      setSelectedPLOs([]);
    } else {
      setSelectedPLOs(programPLOs.map(plo => plo._id));
    }
  };

  const handleSaveAndNext = async () => {
    if (selectedPLOs.length === 0) {
      alert('Vui lòng chọn ít nhất 1 PLO để mapping!');
      return;
    }

    try {
      setLoading(true);
      const response = await courseService.updateCoursePLOMapping(courseData._id, selectedPLOs);

      // Also update lastCompletedStep to mark step 2 as completed
      await courseService.updateCourse(courseData._id, {
        lastCompletedStep: 2
      });

      // Update courseData with mappedPLOs and lastCompletedStep
      setCourseData(prev => ({
        ...prev,
        mappedPLOs: response.data.mappedPLOs || selectedPLOs,
        lastCompletedStep: 2
      }));

      alert('Cập nhật PLO mapping thành công!');
      onNext();
    } catch (error) {
      console.error('Error saving PLO mapping:', error);
      alert(error.message || 'Lỗi khi lưu PLO mapping!');
    } finally {
      setLoading(false);
    }
  };

  if (!courseData._id) {
    return (
      <div className="alert alert-warning">
        <i className="ph ph-warning me-2"></i>
        Vui lòng hoàn thành Bước 1 trước khi mapping PLO.
      </div>
    );
  }

  return (
    <div>
      {/* Info Alert */}
      <div className="alert alert-info mb-24">
        <i className="ph ph-info me-2"></i>
        Chọn các PLO (Program Learning Outcomes) mà học phần này sẽ ánh xạ tới.
        Đây là bảng mapping giữa <strong>Khóa học</strong> và <strong>PLO của Chương trình</strong>.
      </div>

      {/* Select All Button */}
      <div className="d-flex justify-content-between align-items-center mb-16">
        <h6 className="text-md fw-semibold mb-0">
          Danh sách PLO của chương trình ({selectedPLOs.length}/{programPLOs.length} đã chọn)
        </h6>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          icon={selectedPLOs.length === programPLOs.length ? 'ph ph-check-square' : 'ph ph-square'}
        >
          {selectedPLOs.length === programPLOs.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </Button>
      </div>

      {/* PLO List */}
      {loading ? (
        <div className="text-center py-32">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : programPLOs.length === 0 ? (
        <div className="text-center py-32 bg-neutral-50 radius-8">
          <i className="ph ph-list-dashes text-neutral-400" style={{ fontSize: '48px' }}></i>
          <p className="text-neutral-600 mt-3 mb-0">Chương trình chưa có PLO nào</p>
        </div>
      ) : (
        <div className="row gy-3 mb-24">
          {programPLOs.map((plo) => (
            <div key={plo._id} className="col-12">
              <div
                className={`border radius-8 p-16 cursor-pointer transition-all ${
                  selectedPLOs.includes(plo._id)
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 bg-white hover-border-primary-300'
                }`}
                onClick={() => handlePLOCheckbox(plo._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-start gap-3">
                  <div className="form-check mt-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedPLOs.includes(plo._id)}
                      onChange={() => handlePLOCheckbox(plo._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Badge variant={selectedPLOs.includes(plo._id) ? 'primary' : 'primary'}>
                        {plo.code}
                      </Badge>
                      <h6 className="text-sm fw-semibold mb-0">{plo.name}</h6>
                    </div>
                    <p className="text-neutral-600 text-sm mb-0">{plo.detail}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-between gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          icon="ph ph-arrow-left"
        >
          Quay lại
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveAndNext}
          disabled={loading || selectedPLOs.length === 0}
          icon={loading ? 'ph ph-spinner-gap spinner' : 'ph ph-arrow-right'}
          iconPosition="right"
        >
          {loading ? 'Đang lưu...' : 'Lưu & Tiếp tục'}
        </Button>
      </div>

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hover-border-primary-300:hover {
          border-color: var(--primary-300) !important;
        }
      `}</style>
    </div>
  );
};

export default CourseStep2PLOMapping;