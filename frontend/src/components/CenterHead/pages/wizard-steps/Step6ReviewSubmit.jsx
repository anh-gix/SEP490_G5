import { useState } from 'react';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import programService from '../../../../services/programService';

const Step6ReviewSubmit = ({ programData, onPrevious, navigate }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmitForApproval = async () => {
    if (!window.confirm('Bạn có chắc muốn nộp chương trình này để Center Head duyệt?')) {
      return;
    }

    try {
      setLoading(true);

      // Get user ID
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Không tìm thấy thông tin user!');
        return;
      }
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;

      // Submit program for approval
      await programService.submitProgram(programData._id, {
        submittedBy: userId
      });

      alert('Nộp chương trình thành công! Vui lòng chờ Center Head duyệt.');
      navigate('/center-head/programs');
    } catch (error) {
      console.error('Error submitting program:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi nộp chương trình!';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    alert('Chương trình đã được lưu dưới dạng bản nháp!');
    navigate('/center-head/programs');
  };

  return (
    <div>
      <div className="alert alert-warning mb-24">
        <i className="ph ph-warning me-2"></i>
        Vui lòng kiểm tra kỹ thông tin trước khi nộp. Sau khi nộp, bạn sẽ không thể chỉnh sửa cho đến khi Center Head phản hồi.
      </div>

      {/* Program Info */}
      <div className="mb-24">
        <h6 className="text-md fw-semibold mb-16 d-flex align-items-center gap-2">
          <i className="ph ph-info text-primary-600"></i>
          Thông tin chương trình
        </h6>
        <div className="card border">
          <div className="card-body">
            <div className="row gy-3">
              <div className="col-md-6">
                <div className="text-neutral-600">Mã chương trình:</div>
                <div className="fw-semibold">{programData.code}</div>
              </div>
              <div className="col-md-6">
                <div className="text-neutral-600">Tên chương trình:</div>
                <div className="fw-semibold">{programData.program_name}</div>
              </div>
              <div className="col-md-4">
                <div className="text-neutral-600">Loại:</div>
                <Badge variant="primary">{programData.type}</Badge>
              </div>
              <div className="col-md-4">
                <div className="text-neutral-600">Cấp độ:</div>
                <Badge variant="secondary">{programData.level}</Badge>
              </div>
              <div className="col-md-4">
                <div className="text-neutral-600">Band:</div>
                <div className="fw-semibold">{programData.band || 'N/A'}</div>
              </div>
              <div className="col-12">
                <div className="text-neutral-600">Mô tả:</div>
                <div className="text-neutral-900">{programData.description || 'Không có mô tả'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PLOs */}
      <div className="mb-24">
        <h6 className="text-md fw-semibold mb-16 d-flex align-items-center gap-2">
          <i className="ph ph-target text-primary-600"></i>
          Program Learning Outcomes ({(programData.plos || []).length} PLO)
        </h6>
        {(programData.plos || []).length === 0 ? (
          <div className="alert alert-danger">
            <i className="ph ph-warning-circle me-2"></i>
            Chưa có PLO nào! Vui lòng quay lại bước 2 để thêm PLO.
          </div>
        ) : (
          <div className="card border">
            <div className="card-body">
              <div className="row">
                {programData.plos.map((plo, index) => (
                  <div key={typeof plo === 'string' ? plo : plo._id} className="col-md-6 mb-2">
                    <Badge variant="primary" className="me-2">{typeof plo === 'object' ? plo.code : `PLO${index + 1}`}</Badge>
                    <span>{typeof plo === 'object' ? plo.name : plo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Courses */}
      <div className="mb-24">
        <h6 className="text-md fw-semibold mb-16 d-flex align-items-center gap-2">
          <i className="ph ph-books text-primary-600"></i>
          Các học phần ({(programData.courses || []).length} học phần)
        </h6>
        {(programData.courses || []).length === 0 ? (
          <div className="alert alert-warning">
            <i className="ph ph-info me-2"></i>
            Chưa có học phần nào. Chương trình có thể được nộp nhưng chưa có nội dung giảng dạy.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-16 py-12">#</th>
                  <th className="px-16 py-12">Mã học phần</th>
                  <th className="px-16 py-12">Tên học phần</th>
                  <th className="px-16 py-12 text-center">Số buổi</th>
                  <th className="px-16 py-12 text-center">CLOs</th>
                  <th className="px-16 py-12 text-center">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {programData.courses.map((course, index) => (
                  <tr key={course._id}>
                    <td className="px-16 py-12">{index + 1}</td>
                    <td className="px-16 py-12">
                      <Badge variant="primary">{course.courseCode}</Badge>
                    </td>
                    <td className="px-16 py-12 fw-semibold">{course.name}</td>
                    <td className="px-16 py-12 text-center">{course.numberOfSessions || 0}</td>
                    <td className="px-16 py-12 text-center">
                      <Badge variant="success">{(course.clos || []).length}</Badge>
                    </td>
                    <td className="px-16 py-12 text-center">
                      <Badge variant="secondary">{(course.sessions || []).length}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="mb-24">
        <h6 className="text-md fw-semibold mb-16">Tóm tắt trạng thái</h6>
        <div className="card border">
          <div className="card-body">
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                {(programData.plos || []).length > 0 ? (
                  <i className="ph ph-check-circle text-success-600"></i>
                ) : (
                  <i className="ph ph-x-circle text-danger-600"></i>
                )}
                <span>
                  PLOs: {(programData.plos || []).length > 0 ? (
                    <span className="text-success-600">Đã hoàn thành</span>
                  ) : (
                    <span className="text-danger-600">Chưa có PLO</span>
                  )}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {(programData.courses || []).length > 0 ? (
                  <i className="ph ph-check-circle text-success-600"></i>
                ) : (
                  <i className="ph ph-warning-circle text-warning-600"></i>
                )}
                <span>
                  Học phần: {(programData.courses || []).length > 0 ? (
                    <span className="text-success-600">{programData.courses.length} học phần</span>
                  ) : (
                    <span className="text-warning-600">Chưa có học phần</span>
                  )}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="ph ph-info-circle text-info-600"></i>
                <span>Trạng thái: <Badge variant="warning">{programData.status || 'draft'}</Badge></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          icon="ph ph-arrow-left"
        >
          Quay lại
        </Button>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveAsDraft}
          >
            Lưu bản nháp
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitForApproval}
            disabled={loading || (programData.plos || []).length === 0}
            icon={loading ? 'ph ph-spinner-gap spinner' : 'ph ph-paper-plane-tilt'}
            iconPosition="right"
          >
            {loading ? 'Đang nộp...' : 'Nộp để duyệt'}
          </Button>
        </div>
      </div>

      {(programData.plos || []).length === 0 && (
        <div className="alert alert-danger mt-24">
          <i className="ph ph-warning me-2"></i>
          Không thể nộp chương trình khi chưa có PLO. Vui lòng quay lại bước 2 để thêm PLO.
        </div>
      )}

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Step6ReviewSubmit;
