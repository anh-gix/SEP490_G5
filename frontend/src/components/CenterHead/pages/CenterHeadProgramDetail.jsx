import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StatusBadge from '../compo/StatusBadge';
import Table from '../compo/Table';
import FilterBar from '../compo/FilterBar';
import programService from '../../../services/programService';
import centerHeadService from '../../../services/centerHeadService';
import { formatDate } from '../../../helper/helper';

/**
 * CenterHeadProgramDetail - Trang chi tiết Program cho Center Head
 * Chỉ có quyền xem, duyệt/từ chối, toggle active
 * Không có quyền edit/create/delete
 */
const CenterHeadProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseFilterValues, setCourseFilterValues] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectProgramModal, setShowRejectProgramModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [togglingCourseId, setTogglingCourseId] = useState(null);

  const basePath = '/center-head';

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

  // ===== PROGRAM WORKFLOW HANDLERS =====
  const handleApproveProgram = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận duyệt chương trình',
      html: 'Bạn có chắc chắn muốn duyệt chương trình này?<br><br><strong>Lưu ý:</strong> Tất cả các khóa học trong chương trình sẽ được duyệt cùng lúc.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Duyệt',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      await programService.approveProgram(id, {
        approvalNote: 'Đã được phê duyệt bởi Center Head'
      });
      toast.success('Đã duyệt chương trình và toàn bộ khóa học thành công!', { position: 'top-right' });
      fetchProgramDetail();
    } catch (err) {
      console.error('Error approving program:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi duyệt chương trình', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProgram = () => {
    setShowRejectProgramModal(true);
  };

  const handleConfirmRejectProgram = async () => {
    if (!rejectionReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối', { position: 'top-right' });
      return;
    }

    try {
      setActionLoading(true);
      await programService.rejectProgram(id, {
        rejectionReason
      });
      toast.success('Đã từ chối chương trình thành công!', { position: 'top-right' });
      setShowRejectProgramModal(false);
      setRejectionReason('');
      fetchProgramDetail();
    } catch (err) {
      console.error('Error rejecting program:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi từ chối chương trình', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function để format ngày
  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // ===== TOGGLE ACTIVE HANDLER =====
  const handleToggleActive = async () => {
    const newIsActive = !program.isActive;

    try {
      setActionLoading(true);

      // Nếu đang tắt (deactivate), kiểm tra trước
      if (!newIsActive) {
        const checkResult = await centerHeadService.canDeactivateProgram(id);

        if (!checkResult.canDeactivate) {
          // Hiển thị cảnh báo chi tiết về các course đang active
          const activeCourses = checkResult.activeCourses || [];

          let warningMessage = `Không thể tạm dừng chương trình!\n\n`;
          warningMessage += `Còn ${activeCourses.length} khóa học đang hoạt động:\n`;

          activeCourses.forEach((course, index) => {
            if (index < 3) {
              warningMessage += `• ${course.name || course.courseCode}`;
              if (course.activeClassCount > 0) {
                warningMessage += ` (${course.activeClassCount} lớp`;
                if (course.estimatedEndDate) {
                  warningMessage += ` - đến ${formatDateShort(course.estimatedEndDate)}`;
                }
                warningMessage += `)`;
              }
              warningMessage += `\n`;
            }
          });

          if (activeCourses.length > 3) {
            warningMessage += `... và ${activeCourses.length - 3} khóa học khác`;
          }

          toast.warning(warningMessage, {
            position: 'top-right',
            autoClose: 8000,
            style: { whiteSpace: 'pre-line' }
          });

          setActionLoading(false);
          return;
        }

        await centerHeadService.deactivateProgram(id);
      } else {
        await centerHeadService.activateProgram(id);
      }

      setProgram(prev => ({ ...prev, isActive: newIsActive }));

      toast.success(
        newIsActive
          ? 'Đã kích hoạt chương trình thành công'
          : 'Đã vô hiệu hóa chương trình thành công',
        { position: 'top-right' }
      );
    } catch (error) {
      console.error('Error toggling program active status:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Không thể thay đổi trạng thái hoạt động',
        { position: 'top-right' }
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ===== TOGGLE COURSE ACTIVE HANDLER =====
  const handleToggleCourseActive = async (courseId, currentIsActive, e) => {
    e.stopPropagation();

    if (togglingCourseId === courseId) return;

    try {
      setTogglingCourseId(courseId);
      const newIsActive = !currentIsActive;

      // Nếu đang tắt (deactivate), kiểm tra trước
      if (!newIsActive) {
        const checkResult = await centerHeadService.canDeactivateCourse(courseId);

        if (!checkResult.canDeactivate) {
          // Hiển thị cảnh báo chi tiết về các class đang active
          const activeClasses = checkResult.activeClasses || [];
          const upcomingSchedules = checkResult.upcomingSchedules || [];

          let warningMessage = `Không thể tạm dừng khóa học!\n\n`;

          if (activeClasses.length > 0) {
            warningMessage += `Còn ${activeClasses.length} lớp đang học:\n`;
            activeClasses.forEach((cls, index) => {
              if (index < 3) {
                warningMessage += `• ${cls.name}\n`;
              }
            });
            if (activeClasses.length > 3) {
              warningMessage += `... và ${activeClasses.length - 3} lớp khác\n`;
            }
          }

          if (upcomingSchedules.length > 0) {
            warningMessage += `\nLịch học sắp tới:\n`;
            upcomingSchedules.slice(0, 3).forEach(schedule => {
              warningMessage += `• ${schedule.className}: ${formatDateShort(schedule.date)} (${schedule.startTime} - ${schedule.endTime})\n`;
            });
          }

          if (checkResult.estimatedEndDate) {
            warningMessage += `\nDự kiến kết thúc: ${formatDateShort(checkResult.estimatedEndDate)}`;
          }

          if (checkResult.totalFutureSchedules) {
            warningMessage += `\nTổng: ${checkResult.totalFutureSchedules} buổi học còn lại`;
          }

          toast.warning(warningMessage, {
            position: 'top-right',
            autoClose: 10000,
            style: { whiteSpace: 'pre-line' }
          });

          setTogglingCourseId(null);
          return;
        }

        await centerHeadService.deactivateCourse(courseId);
      } else {
        await centerHeadService.activateCourse(courseId);
      }

      setCourses(prevCourses =>
        prevCourses.map(course =>
          course._id === courseId
            ? { ...course, isActive: newIsActive }
            : course
        )
      );

      toast.success(
        newIsActive
          ? 'Đã kích hoạt khóa học thành công'
          : 'Đã vô hiệu hóa khóa học thành công',
        { position: 'top-right' }
      );
    } catch (error) {
      console.error('Error toggling course active status:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Không thể thay đổi trạng thái hoạt động',
        { position: 'top-right' }
      );
    } finally {
      setTogglingCourseId(null);
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
    // Cột Hoạt động
    {
      header: 'Hoạt động',
      field: 'isActive',
      render: (row) => {
        // Chỉ hiển thị toggle cho course có status completed
        if (row.status !== 'completed') {
          return (
            <span className="text-neutral-500" style={{ fontSize: '0.75rem' }}>
              N/A
            </span>
          );
        }

        const isToggling = togglingCourseId === row._id;

        return (
          <div className="form-check form-switch d-flex justify-content-center align-items-center">
            {isToggling ? (
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={row.isActive || false}
                onChange={(e) => handleToggleCourseActive(row._id, row.isActive, e)}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer' }}
                title={row.isActive ? 'Tạm dừng khóa học' : 'Kích hoạt khóa học'}
              />
            )}
          </div>
        );
      },
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex flex-wrap gap-2">
          {/* View button only */}
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

            {/* Toggle Active - Only for Approved programs */}
            {program.status === 'approved' && (
              <div className="d-flex align-items-center gap-2 ms-auto">
                <span className="text-neutral-700" style={{ fontSize: '0.875rem' }}>
                  {program.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </span>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={program.isActive || false}
                    onChange={handleToggleActive}
                    disabled={actionLoading}
                    style={{ cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                    title={program.isActive ? 'Tạm dừng chương trình' : 'Mở chương trình cho đăng ký'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {/* Pending Approval: Center Head can approve/reject */}
          {program.status === 'pending_approval' && (
            <>
              <Button
                variant="success"
                icon="ph ph-check"
                onClick={handleApproveProgram}
                disabled={actionLoading}
              >
                Duyệt Program
              </Button>
              <Button
                variant="danger"
                icon="ph ph-x"
                onClick={handleRejectProgram}
                disabled={actionLoading}
              >
                Từ chối Program
              </Button>
            </>
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

      {/* Sticky Action Bar - Only for Pending Approval */}
      {program.status === 'pending_approval' && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: '280px',
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
            <Button
              variant="danger"
              icon="ph ph-x"
              onClick={handleRejectProgram}
              disabled={actionLoading}
              style={{ padding: '10px 24px' }}
            >
              Từ chối
            </Button>
            <Button
              variant="success"
              icon="ph ph-check"
              onClick={handleApproveProgram}
              disabled={actionLoading}
              style={{ padding: '10px 24px' }}
            >
              Duyệt chương trình
            </Button>
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

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default CenterHeadProgramDetail;
