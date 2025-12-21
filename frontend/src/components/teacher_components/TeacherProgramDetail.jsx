import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumb from '../CenterHead/compo/Breadcrumb';
import Card from '../CenterHead/compo/Card';
import Button from '../CenterHead/compo/Button';
import StatusBadge from '../CenterHead/compo/StatusBadge';
import Table from '../CenterHead/compo/Table';
import FilterBar from '../CenterHead/compo/FilterBar';
import programService from '../../services/programService';
import { courseService } from '../../services/courseService';
import approvalRequestService from '../../services/approvalRequestService';
import workRequestService from '../../services/workRequestService';
import { formatDate } from '../../helper/helper';

/**
 * TeacherProgramDetail - Trang chi tiết Program cho Teacher/Subject Leader
 * Có đầy đủ quyền: view, edit, create course, delete course, submit
 */
const TeacherProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseFilterValues, setCourseFilterValues] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawNote, setWithdrawNote] = useState('');

  const basePath = '/teacher';

  useEffect(() => {
    fetchProgramDetail();
  }, [id]);

  // Filter courses based on learningType
  useEffect(() => {
    let filtered = [...courses];

    if (courseFilterValues.learningType && courseFilterValues.learningType !== "all") {
      filtered = filtered.filter(course => course.learningType === courseFilterValues.learningType);
    }

    setFilteredCourses(filtered);
  }, [courses, courseFilterValues]);

  const fetchProgramDetail = async () => {
    try {
      setLoading(true);

      const response = await programService.getProgramById(id);
      const programData = response.data;

      if (programData) {
        setProgram(programData);
        const programCourses = programData.courses || [];
        setCourses(programCourses);
      }

    } catch (err) {
      console.error('Error fetching program detail:', err);
      toast.error('Không thể tải thông tin chương trình!', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  // ===== COURSE DELETE HANDLER =====
  const handleDeleteCourse = async (courseId, courseName) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc chắn muốn xóa khóa học "${courseName}"? Hành động này không thể hoàn tác.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await courseService.deleteCourse(courseId);

      if (response.success) {
        toast.success('Xóa khóa học thành công!', { position: 'top-right' });
        setCourses(courses.filter(c => c._id !== courseId));
      } else {
        toast.error(response.message || 'Xóa khóa học thất bại!', { position: 'top-right' });
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.message || 'Không thể xóa khóa học. Vui lòng thử lại sau.', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  // ===== PROGRAM WORKFLOW HANDLERS =====
  const handleSubmitProgram = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmitProgram = async () => {
    try {
      setActionLoading(true);
      const response = await approvalRequestService.submitProgram(id, {
        note: submissionNote.trim() || undefined
      });

      if (response.success) {
        toast.success('Đã nộp chương trình thành công! Chờ Center Head phê duyệt.', { position: 'top-right' });
        setShowSubmitModal(false);
        setSubmissionNote('');
        fetchProgramDetail();
      }
    } catch (err) {
      console.error('Error submitting program:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi nộp chương trình', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  // ===== WITHDRAW SUBMISSION HANDLER =====
  const handleWithdrawSubmission = () => {
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async () => {
    try {
      setActionLoading(true);
      const response = await workRequestService.withdrawProgramSubmission(id, {
        note: withdrawNote.trim() || undefined
      });

      if (response.success) {
        toast.success('Đã hủy nộp thành công! Bạn có thể chỉnh sửa và nộp lại sau.', { position: 'top-right' });
        setShowWithdrawModal(false);
        setWithdrawNote('');
        fetchProgramDetail();
      }
    } catch (err) {
      console.error('Error withdrawing submission:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi hủy nộp', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  if (!program) {
    return (
      <Card>
        <div className="text-center py-5">
          <i className="ph ph-warning-circle text-warning-500" style={{ fontSize: '64px' }}></i>
          <h5 className="text-neutral-600 mt-3 mb-3">Không tìm thấy chương trình</h5>
          <Button
            variant="primary"
            onClick={() => navigate(`${basePath}/programs`)}
          >
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  // Có thể edit khi program đang draft hoặc needs_revision
  const canEdit = program.status === 'draft' || program.status === 'needs_revision';

  const breadcrumbItems = [
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Chương trình đào tạo', path: `${basePath}/programs` },
    { label: program.program_name },
  ];

  const courseColumns = [
    {
      header: 'Tên khóa học',
      field: 'name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-1">{row.name}</div>
          <div className="text-sm text-neutral-600 d-none d-md-block">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Buổi học',
      field: 'sessions',
      hideOnMobile: true,
      render: (row) => (
        <span className="text-neutral-700">{row.sessions?.length || 0} buổi</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Cập nhật',
      field: 'updatedAt',
      hideOnMobile: true,
      render: (row) => (
        <span className="text-neutral-700">{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex flex-wrap gap-2">
          {/* Draft: Show "Continue" button to continue wizard */}
          {row.status === 'draft' && (
            <Button
              variant="primary"
              size="sm"
              icon="ph ph-play-circle"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${basePath}/programs/${id}/courses/${row._id}/edit`);
              }}
            >
              Tiếp tục
            </Button>
          )}

          {/* View button for all statuses */}
          <Button
            variant="outline"
            size="sm"
            icon="ph ph-eye"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${basePath}/programs/${id}/courses/${row._id}/details`);
            }}
          >
            Xem
          </Button>

          {/* Delete button - only when program is editable */}
          {canEdit && (
            <Button
              variant="danger"
              size="sm"
              icon="ph ph-trash"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCourse(row._id, row.name);
              }}
            >
              Xóa
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="program-detail-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-24 gap-3">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-3 mb-12">
            <Button
              variant="ghost"
              icon="ph ph-arrow-left"
              onClick={() => navigate(`${basePath}/programs`)}
            >
              Quay lại
            </Button>
          </div>
          <h4 className="mb-8 text-neutral-900 fw-bold">{program.program_name}</h4>
          <div className="mb-12">
            {program.description && program.description.length > 300 ? (
              <>
                <p className="text-neutral-600 mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {showFullDescription ? program.description : `${program.description.substring(0, 300)}...`}
                </p>
                <button
                  className="btn btn-link p-0 text-main-600"
                  style={{ textDecoration: 'none', fontSize: '14px' }}
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                </button>
              </>
            ) : (
              <p className="text-neutral-600" style={{ whiteSpace: 'pre-wrap' }}>{program.description}</p>
            )}
          </div>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <StatusBadge status={program.status} />
            <span className="text-neutral-600">Mã: <strong>{program.code}</strong></span>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {/* Draft or Needs Revision: Subject Leader can submit */}
          {canEdit && (
            <Button
              variant="primary"
              icon="ph ph-paper-plane-tilt"
              onClick={handleSubmitProgram}
              disabled={actionLoading}
            >
              {program.status === 'needs_revision' ? 'Nộp lại Program' : 'Nộp Program'}
            </Button>
          )}

          {/* Pending Approval: Subject Leader can withdraw submission */}
          {program.status === 'pending_approval' && (
            <Button
              variant="warning"
              icon="ph ph-arrow-u-up-left"
              onClick={handleWithdrawSubmission}
              disabled={actionLoading}
            >
              Hủy nộp
            </Button>
          )}

          {/* Edit button - only when program is editable */}
          {canEdit && (
            <Button
              variant="outline"
              icon="ph ph-pencil-simple"
              onClick={() => navigate(`${basePath}/programs/${id}/edit`)}
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Program Pending Approval Info */}
      {program.status === 'pending_approval' && (
        <div className="alert alert-info mb-24" role="alert" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="d-flex align-items-start">
            <i className="ph ph-clock" style={{ fontSize: '24px', marginRight: '12px', color: '#3b82f6' }}></i>
            <div>
              <h6 className="mb-2 fw-bold">Đang chờ phê duyệt</h6>
              <p className="mb-0">
                Chương trình đang chờ Center Head phê duyệt. Nếu bạn cần chỉnh sửa, hãy nhấn nút <strong>"Hủy nộp"</strong> để rút lại yêu cầu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 g-md-4 mb-24">
        <div className="col-6 col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Tổng PLOs</h6>
            <h4 className="text-main-600 fw-bold mb-0">{program.plos?.length || 0}</h4>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Tổng Courses</h6>
            <h4 className="text-success-600 fw-bold mb-0">{courses.length}</h4>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Người tạo</h6>
            <h6 className="text-neutral-900 fw-bold mb-0">{program.createdBy?.username || 'N/A'}</h6>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Cập nhật lần cuối</h6>
            <h6 className="text-neutral-600 fw-bold mb-0">{formatDate(program.updatedAt)}</h6>
          </Card>
        </div>
      </div>

      {/* Program Learning Outcomes (PLOs) */}
      <Card variant="shadow" className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-20">
          <h5 className="mb-0 text-neutral-900 fw-bold">Program Learning Outcomes (PLOs)</h5>
          <span className="text-neutral-600 text-sm">{program.plos?.length || 0} PLO(s) found</span>
        </div>

        {program.plos && program.plos.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover border border-neutral-40">
              <thead className="bg-neutral-20">
                <tr>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '10%' }}>#</th>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '15%' }}>PLO Name</th>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '75%' }}>PLO Description</th>
                </tr>
              </thead>
              <tbody>
                {program.plos.map((plo, index) => (
                  <tr key={plo._id}>
                    <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                      <span className="fw-semibold text-neutral-900">{index + 1}</span>
                    </td>
                    <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                      <span className="fw-semibold text-neutral-900">{plo.code}</span>
                    </td>
                    <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                      {plo.detail || plo.description || plo.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-neutral-600">
            <i className="ph ph-books text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="mt-3 mb-0">Chưa có PLO nào được liên kết</p>
          </div>
        )}
      </Card>

      {/* Courses List */}
      <Card variant="shadow">
        <div className="d-flex justify-content-between align-items-center mb-20">
          <div>
            <h5 className="mb-4 text-neutral-900 fw-bold">Danh sách Khóa học ({filteredCourses.length}/{courses.length})</h5>
            <p className="text-neutral-600 mb-0 text-sm">
              Các khóa học thuộc chương trình này
            </p>
          </div>
          {/* Show Create Course button only when program is editable */}
          {canEdit && (
            <Button
              variant="primary"
              onClick={() => navigate(`${basePath}/programs/${id}/courses/create`)}
            >
              <i className="ph ph-plus me-2"></i>
              Tạo khóa học mới
            </Button>
          )}
        </div>

        {/* Course Filters */}
        {courses.length > 0 && (
          <div className="mb-20">
            <FilterBar
              filters={[
                {
                  key: "learningType",
                  label: "Loại khóa học",
                  options: [
                    { value: "online", label: "Online" },
                    { value: "offline", label: "Offline" },
                  ]
                }
              ]}
              values={courseFilterValues}
              onChange={(key, value) => setCourseFilterValues({ ...courseFilterValues, [key]: value })}
              onReset={() => setCourseFilterValues({})}
            />
          </div>
        )}

        {courses.length > 0 ? (
          filteredCourses.length > 0 ? (
            <Table
              columns={courseColumns}
              data={filteredCourses}
              onRowClick={(row) => navigate(`${basePath}/programs/${id}/courses/${row._id}/details`)}
            />
          ) : (
            <div className="text-center py-5 text-neutral-600">
              <i className="ph ph-funnel text-neutral-400" style={{ fontSize: '48px' }}></i>
              <p className="mt-3 mb-0">Không tìm thấy khóa học nào với bộ lọc đã chọn</p>
            </div>
          )
        ) : (
          <div className="text-center py-5 text-neutral-600">
            <i className="ph ph-book text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="mt-3 mb-0">Chưa có khóa học nào trong chương trình này</p>
          </div>
        )}
      </Card>

      {/* Submit Program Modal */}
      {showSubmitModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nộp chương trình để phê duyệt</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSubmissionNote('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-neutral-600 mb-3">
                  Bạn đang nộp chương trình <strong>{program?.program_name}</strong> để chờ phê duyệt.
                </p>
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập ghi chú khi nộp chương trình (nếu có)..."
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSubmissionNote('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmSubmitProgram}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận nộp'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Submission Modal */}
      {showWithdrawModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '3px solid #f59e0b' }}>
                <h5 className="modal-title">
                  <i className="ph ph-arrow-u-up-left me-2" style={{ color: '#f59e0b' }}></i>
                  Hủy nộp chương trình
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawNote('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning mb-3" role="alert">
                  <i className="ph ph-warning me-2"></i>
                  Sau khi hủy nộp, chương trình sẽ quay về trạng thái <strong>Draft</strong> và bạn có thể chỉnh sửa lại trước khi nộp lại.
                </div>
                <p className="text-neutral-600 mb-3">
                  Bạn đang hủy nộp chương trình <strong>{program?.program_name}</strong>.
                </p>
                <label className="form-label">Lý do hủy nộp (tùy chọn)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Nhập lý do hủy nộp (nếu có)..."
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawNote('');
                  }}
                  disabled={actionLoading}
                >
                  Đóng
                </Button>
                <Button
                  variant="warning"
                  onClick={handleConfirmWithdraw}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận hủy nộp'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default TeacherProgramDetail;
