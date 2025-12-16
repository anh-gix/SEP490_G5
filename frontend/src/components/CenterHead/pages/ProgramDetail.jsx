import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StatusBadge from '../compo/StatusBadge';
import Table from '../compo/Table';
import programService from '../../../services/programService';
import { courseService } from '../../../services/courseService';
import approvalRequestService from '../../../services/approvalRequestService';
import { formatDate } from '../../../helper/helper';

<<<<<<< HEAD
const ProgramDetail = () => {
=======
const ProgramDetail = ({ viewMode = 'center-head' }) => {
>>>>>>> origin/Namvv-teacher-class-management
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectProgramModal, setShowRejectProgramModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.roleId?.name || user.role;

<<<<<<< HEAD
=======
  // Determine base path based on viewMode
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';

  // Center Head should not see edit/delete buttons
  const isViewOnly = viewMode === 'center-head' || userRole === 'Center Head';

>>>>>>> origin/Namvv-teacher-class-management
  useEffect(() => {
    fetchProgramDetail();
  }, [id]);

  const fetchProgramDetail = async () => {
    try {
      setLoading(true);

      const response = await programService.getProgramById(id);
      const programData = response.data;

      if (programData) {
        setProgram(programData);

        // Courses are included in the program response
        const programCourses = programData.courses || [];
        setCourses(programCourses);

        console.log('Program detail loaded from API:', programData);
      }

    } catch (err) {
      console.error('Error fetching program detail:', err);
      alert('Không thể tải thông tin chương trình!');
    } finally {
      setLoading(false);
    }
  };


  // ===== COURSE DELETE HANDLER =====
  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa môn học "${courseName}"?\n\nHành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await courseService.deleteCourse(courseId);

      if (response.success) {
        alert('Xóa môn học thành công!');
        // Refresh the courses list
        setCourses(courses.filter(c => c._id !== courseId));
      } else {
        alert(response.message || 'Xóa môn học thất bại!');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(error.message || 'Không thể xóa môn học. Vui lòng thử lại sau.');
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
        alert('Đã nộp chương trình thành công! Chờ Center Head phê duyệt.');
        setShowSubmitModal(false);
        setSubmissionNote('');
        fetchProgramDetail();
      }
    } catch (err) {
      console.error('Error submitting program:', err);
      alert(err.message || 'Có lỗi xảy ra khi nộp chương trình');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveProgram = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt chương trình này?\n\nLưu ý: Tất cả các môn học trong chương trình sẽ được duyệt cùng lúc.')) {
      return;
    }

    try {
      setActionLoading(true);
      await programService.approveProgram(id, {
        approvalNote: 'Đã được phê duyệt bởi Center Head'
      });
      alert('Đã duyệt chương trình và toàn bộ môn học thành công!');
      fetchProgramDetail();
    } catch (err) {
      console.error('Error approving program:', err);
      alert(err.message || 'Có lỗi xảy ra khi duyệt chương trình');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProgram = () => {
    setShowRejectProgramModal(true);
  };

  const handleConfirmRejectProgram = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setActionLoading(true);
      await programService.rejectProgram(id, {
        rejectionReason
      });
      alert('Đã từ chối chương trình thành công!');
      setShowRejectProgramModal(false);
      setRejectionReason('');
      fetchProgramDetail();
    } catch (err) {
      console.error('Error rejecting program:', err);
      alert(err.message || 'Có lỗi xảy ra khi từ chối chương trình');
    } finally {
      setActionLoading(false);
    }
  };

  // ===== COURSE WORKFLOW HANDLERS =====
  // Course không có workflow phê duyệt riêng, chỉ có draft và completed
  // Workflow phê duyệt chỉ áp dụng cho Program level

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
            onClick={() => navigate('/center-head/programs')}
          >
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  const breadcrumbItems = [
<<<<<<< HEAD
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Chương trình đào tạo', path: '/center-head/programs' },
    { label: program.program_name, path: `/center-head/programs/${id}` },
=======
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Chương trình đào tạo', path: `${basePath}/programs` },
    { label: program.program_name, path: `${basePath}/programs/${id}` },
>>>>>>> origin/Namvv-teacher-class-management
  ];

  const courseColumns = [
    {
      header: 'Tên môn học',
      field: 'name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-1">{row.name}</div>
          <div className="text-sm text-neutral-600 d-none d-md-block">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'CLOs',
      field: 'clos',
      hideOnMobile: true,
      render: (row) => (
        <span className="text-neutral-700">{row.clos?.length || 0} CLOs</span>
      ),
    },
    {
      header: 'Sessions',
      field: 'sessions',
      hideOnMobile: true,
      render: (row) => (
        <span className="text-neutral-700">{row.sessions?.length || 0} buổi học</span>
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
          {/* Draft: Show "Continue" button to continue wizard - only for non-Center Head */}
          {row.status === 'draft' && userRole !== 'Center Head' && (
            <Button
              variant="primary"
              size="sm"
              icon="ph ph-play-circle"
              onClick={(e) => {
                e.stopPropagation();
<<<<<<< HEAD
                navigate(`/center-head/programs/${id}/courses/${row._id}/edit`);
=======
                navigate(`${basePath}/programs/${id}/courses/${row._id}/edit`);
>>>>>>> origin/Namvv-teacher-class-management
              }}
            >
              <span className="d-none d-md-inline">Tiếp tục</span>
              <span className="d-inline d-md-none">▶</span>
            </Button>
          )}

<<<<<<< HEAD
          {/* Completed: Show "Edit" button to edit via form - only for non-Center Head */}
          {row.status === 'completed' && userRole !== 'Center Head' && (
=======
          {/* Completed: Show "Edit" button to edit via form - only for non-view-only */}
          {row.status === 'completed' && !isViewOnly && (
>>>>>>> origin/Namvv-teacher-class-management
            <Button
              variant="outline"
              size="sm"
              icon="ph ph-pencil"
              onClick={(e) => {
                e.stopPropagation();
<<<<<<< HEAD
                navigate(`/center-head/programs/${id}/courses/${row._id}/edit-form`);
=======
                navigate(`${basePath}/programs/${id}/courses/${row._id}/edit-form`);
>>>>>>> origin/Namvv-teacher-class-management
              }}
            >
              <span className="d-none d-md-inline">Sửa</span>
              <span className="d-inline d-md-none">✏</span>
            </Button>
          )}

          {/* View button for all statuses */}
          <Button
            variant="outline"
            size="sm"
            icon="ph ph-eye"
            onClick={(e) => {
              e.stopPropagation();
<<<<<<< HEAD
              navigate(`/center-head/courses/${row._id}/details`);
=======
              navigate(`${basePath}/courses/${row._id}/details`);
>>>>>>> origin/Namvv-teacher-class-management
            }}
          >
            <span className="d-none d-md-inline">Xem</span>
            <span className="d-inline d-md-none">👁</span>
          </Button>

<<<<<<< HEAD
          {/* Delete button - only for non-Center Head */}
          {userRole !== 'Center Head' && (
=======
          {/* Delete button - only for non-view-only */}
          {!isViewOnly && (
>>>>>>> origin/Namvv-teacher-class-management
            <Button
              variant="danger"
              size="sm"
              icon="ph ph-trash"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCourse(row._id, row.name);
              }}
            >
              <span className="d-none d-md-inline">Xóa</span>
              <span className="d-inline d-md-none">🗑</span>
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
              onClick={() => navigate('/center-head/programs')}
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
          {(program.status === 'draft' || program.status === 'needs_revision') && userRole !== 'Center Head' && (
            <Button
              variant="primary"
              icon="ph ph-paper-plane-tilt"
              onClick={handleSubmitProgram}
              disabled={actionLoading}
            >
              {program.status === 'needs_revision' ? 'Nộp lại Program' : 'Nộp Program'}
            </Button>
          )}

          {/* Pending Approval: Center Head can approve/reject */}
          {program.status === 'pending_approval' && userRole === 'Center Head' && (
            <>
              <button
                className="btn"
                onClick={handleApproveProgram}
                disabled={actionLoading}
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: '#10b981',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!actionLoading) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!actionLoading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#10b981';
                  }
                }}
              >
                <i className="ph ph-check"></i>
                Duyệt Program
              </button>
              <button
                className="btn"
                onClick={handleRejectProgram}
                disabled={actionLoading}
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  backgroundColor: 'transparent',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!actionLoading) {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!actionLoading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ef4444';
                  }
                }}
              >
                <i className="ph ph-x"></i>
                Từ chối Program
              </button>
            </>
          )}

<<<<<<< HEAD
          {/* Edit button - only for non-Center Head */}
          {userRole !== 'Center Head' && (
            <Button
              variant="outline"
              icon="ph ph-pencil-simple"
              onClick={() => navigate(`/center-head/programs/${id}/edit`)}
=======
          {/* Edit button - only for non-view-only */}
          {!isViewOnly && (
            <Button
              variant="outline"
              icon="ph ph-pencil-simple"
              onClick={() => navigate(`${basePath}/programs/${id}/edit`)}
>>>>>>> origin/Namvv-teacher-class-management
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Program Rejection Warning */}
      {program.status === 'needs_revision' && program.rejectionReason && (
        <div className="alert alert-warning mb-24" role="alert" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="d-flex align-items-start">
            <i className="ph ph-warning-circle" style={{ fontSize: '24px', marginRight: '12px', color: '#f59e0b' }}></i>
            <div>
              <h6 className="mb-2 fw-bold">Program bị từ chối - Cần chỉnh sửa</h6>
              <p className="mb-1"><strong>Lý do từ chối:</strong></p>
              <p className="mb-0">{program.rejectionReason}</p>
              {program.rejectedBy && (
                <p className="mb-0 mt-2 text-sm text-muted">
                  Từ chối bởi: {program.rejectedBy.username || program.rejectedBy.email} - {formatDate(program.rejectedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 g-md-4 mb-24">
<<<<<<< HEAD
        <div className="col-6 col-md-4">
=======
        <div className="col-6 col-md-3">
>>>>>>> origin/Namvv-teacher-class-management
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng PLOs</h6>
            <h4 className="text-main-600 fw-bold mb-0">{program.plos?.length || 0}</h4>
          </Card>
        </div>
<<<<<<< HEAD
        <div className="col-6 col-md-4">
=======
        <div className="col-6 col-md-3">
>>>>>>> origin/Namvv-teacher-class-management
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng Courses</h6>
            <h4 className="text-success-600 fw-bold mb-0">{courses.length}</h4>
          </Card>
        </div>
<<<<<<< HEAD
        <div className="col-6 col-md-4">
=======
        <div className="col-6 col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Người tạo</h6>
            <h6 className="text-neutral-900 fw-bold mb-0">{program.createdBy?.username || 'N/A'}</h6>
          </Card>
        </div>
        <div className="col-6 col-md-3">
>>>>>>> origin/Namvv-teacher-class-management
          <Card>
            <h6 className="text-neutral-600 mb-8">Cập nhật lần cuối</h6>
            <h6 className="text-neutral-600 fw-bold mb-0">{formatDate(program.updatedAt)}</h6>
          </Card>
        </div>
      </div>

      {/* Program Learning Outcomes (PLOs) */}
      <Card className="mb-24">
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
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-20">
          <div>
            <h5 className="mb-4 text-neutral-900 fw-bold">Danh sách Môn học ({courses.length})</h5>
            <p className="text-neutral-600 mb-0 text-sm">
              Các môn học thuộc chương trình này
            </p>
          </div>
<<<<<<< HEAD
=======
          {/* Show Create Course button only when program is draft or needs_revision and not view-only */}
          {!isViewOnly && (program?.status === 'draft' || program?.status === 'needs_revision') && (
            <Button
              variant="primary"
              onClick={() => navigate(`${basePath}/programs/${id}/courses/create`)}
            >
              <i className="ph ph-plus me-2"></i>
              Tạo học phần mới
            </Button>
          )}
>>>>>>> origin/Namvv-teacher-class-management
        </div>

        {courses.length > 0 ? (
          <Table
            columns={courseColumns}
            data={courses}
<<<<<<< HEAD
            onRowClick={(row) => navigate(`/center-head/courses/${row._id}/details`)}
=======
            onRowClick={(row) => navigate(`${basePath}/courses/${row._id}/details`)}
>>>>>>> origin/Namvv-teacher-class-management
          />
        ) : (
          <div className="text-center py-5 text-neutral-600">
            <i className="ph ph-book text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="mt-3 mb-0">Chưa có môn học nào trong chương trình này</p>
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

      {/* Sticky Action Bar - Only for Center Head with Pending Approval */}
      {program.status === 'pending_approval' && userRole === 'Center Head' && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: '280px', // Sidebar width
            right: 0,
            backgroundColor: 'white',
            borderTop: '2px solid #e5e7eb',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                animation: 'pulse 2s infinite'
              }}
            ></div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                Chương trình đang chờ phê duyệt
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {program.program_name} - Mã: {program.code}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn"
              onClick={handleRejectProgram}
              disabled={actionLoading}
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#ef4444',
                color: '#ef4444',
                backgroundColor: 'transparent',
                padding: '10px 24px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!actionLoading) {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!actionLoading) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ef4444';
                }
              }}
            >
              <i className="ph ph-x"></i>
              Từ chối
            </button>
            <button
              className="btn"
              onClick={handleApproveProgram}
              disabled={actionLoading}
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#10b981',
                color: 'white',
                backgroundColor: '#10b981',
                padding: '10px 24px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!actionLoading) {
                  e.currentTarget.style.backgroundColor = '#059669';
                }
              }}
              onMouseLeave={(e) => {
                if (!actionLoading) {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }
              }}
            >
              <i className="ph ph-check"></i>
              Duyệt chương trình
            </button>
          </div>
        </div>
      )}

      {/* Reject Program Modal */}
      {showRejectProgramModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Từ chối chương trình</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRejectProgramModal(false);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Lý do từ chối *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập lý do từ chối chương trình..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectProgramModal(false);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmRejectProgram}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDetail;
