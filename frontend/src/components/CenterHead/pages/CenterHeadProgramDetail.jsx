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
import workRequestService from '../../../services/workRequestService';
import { userService } from '../../../services/userService';
import { formatDate } from '../../../helper/helper';

/**
 * CenterHeadProgramDetail - Trang chi tiết Program cho Center Head
 * - Nếu program đang draft: có quyền edit thông tin, CRUD course, hoàn thành
 * - Nếu program đã approved: có quyền xem, toggle active, yêu cầu chỉnh sửa
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
  const [currentUserId, setCurrentUserId] = useState(null);

  // Edit Program Request states (for programs NOT created by current user)
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editRequestNote, setEditRequestNote] = useState('');
  const [selectedSubjectLeader, setSelectedSubjectLeader] = useState('');
  const [subjectLeaders, setSubjectLeaders] = useState([]);
  const [loadingSubjectLeaders, setLoadingSubjectLeaders] = useState(false);
  const [activeEditRequest, setActiveEditRequest] = useState(null);
  const [showApproveEditModal, setShowApproveEditModal] = useState(false);
  const [showRejectEditModal, setShowRejectEditModal] = useState(false);
  const [editApprovalNote, setEditApprovalNote] = useState('');
  const [editRejectionReason, setEditRejectionReason] = useState('');

  const basePath = '/center-head';

  // Get current user ID from cookie
  useEffect(() => {
    try {
      const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
      if (userCookie) {
        const userStr = decodeURIComponent(userCookie.split('=')[1]);
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }, []);

  // Check if program is created by current user
  const isMyProgram = program?.createdBy?._id === currentUserId || program?.createdBy === currentUserId;

  useEffect(() => {
    fetchProgramDetail();
  }, [id]);

  // Fetch edit request status when program is loaded (only for non-owned approved programs)
  useEffect(() => {
    if (program && program.status === 'approved' && !isMyProgram) {
      fetchEditRequestStatus();
    }
  }, [program?.status, isMyProgram]);

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

  // Hoàn thành program (chuyển từ draft sang approved) - CenterHead có toàn quyền
  // Đồng thời approve và active tất cả courses trong program
  const handleCompleteProgram = async () => {
    // PLO không bắt buộc - có thể hoàn thành chương trình mà không cần PLO

    const courseCount = courses.length;
    const result = await Swal.fire({
      title: 'Hoàn thành chương trình',
      html: `Bạn có chắc chắn muốn hoàn thành chương trình này?<br><br>
        <strong>Lưu ý:</strong> Sau khi hoàn thành:
        <ul style="text-align: left; margin-top: 10px;">
          <li>Chương trình sẽ được kích hoạt</li>
          ${courseCount > 0 ? `<li><strong>${courseCount}</strong> khóa học sẽ được kích hoạt</li>` : ''}
          <li>Có thể sử dụng ngay</li>
        </ul>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hoàn thành',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await programService.completeProgram(id);

      // Hiển thị thông báo thành công với số courses đã được kích hoạt
      const coursesUpdated = response.data?.coursesUpdated || 0;
      let successMessage = 'Hoàn thành chương trình thành công!';
      if (coursesUpdated > 0) {
        successMessage += ` Đã kích hoạt ${coursesUpdated} khóa học.`;
      }

      toast.success(successMessage, {
        position: 'top-right',
        autoClose: 5000
      });

      fetchProgramDetail();
    } catch (err) {
      console.error('Error completing program:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi hoàn thành chương trình', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  // Xóa program draft
  const handleDeleteProgram = async () => {
    const result = await Swal.fire({
      title: 'Xóa chương trình',
      html: 'Bạn có chắc chắn muốn xóa chương trình này?<br><br><strong class="text-danger">Lưu ý:</strong> Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      await programService.deleteProgram(id);
      toast.success('Đã xóa chương trình thành công!', { position: 'top-right' });
      navigate(`${basePath}/programs?tab=my-programs`);
    } catch (err) {
      console.error('Error deleting program:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi xóa chương trình', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

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
        note: 'Đã được phê duyệt bởi Center Head'
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
        reason: rejectionReason
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

  // ===== EDIT PROGRAM REQUEST HANDLERS (for programs NOT created by current user) =====
  const fetchEditRequestStatus = async () => {
    try {
      const result = await workRequestService.checkProgramEditStatus(id);
      if (result.hasActiveEditRequest) {
        setActiveEditRequest(result.activeRequest);
      } else {
        setActiveEditRequest(null);
      }
    } catch (error) {
      console.error('Error fetching edit request status:', error);
    }
  };

  const fetchSubjectLeaders = async () => {
    try {
      setLoadingSubjectLeaders(true);
      const result = await userService.getUsersByRoles(['Subject Leader']);
      setSubjectLeaders(result.data || []);
    } catch (error) {
      console.error('Error fetching subject leaders:', error);
      toast.error('Không thể lấy danh sách Subject Leader', { position: 'top-right' });
    } finally {
      setLoadingSubjectLeaders(false);
    }
  };

  const handleOpenEditRequestModal = () => {
    fetchSubjectLeaders();
    setShowEditRequestModal(true);
  };

  const handleCreateEditRequest = async () => {
    if (!selectedSubjectLeader) {
      toast.warning('Vui lòng chọn Subject Leader', { position: 'top-right' });
      return;
    }

    if (!editRequestNote.trim()) {
      toast.warning('Vui lòng nhập nội dung yêu cầu', { position: 'top-right' });
      return;
    }

    try {
      setActionLoading(true);
      await workRequestService.createEditProgramRequest({
        entityId: id,
        assignedTo: selectedSubjectLeader,
        requestNote: editRequestNote
      });

      toast.success('Đã tạo yêu cầu chỉnh sửa chương trình thành công!', { position: 'top-right' });
      setShowEditRequestModal(false);
      setEditRequestNote('');
      setSelectedSubjectLeader('');
      fetchEditRequestStatus();
    } catch (error) {
      console.error('Error creating edit request:', error);
      toast.error(error.message || 'Không thể tạo yêu cầu chỉnh sửa', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEditRequest = async () => {
    if (!activeEditRequest) return;

    const result = await Swal.fire({
      title: 'Xác nhận hủy yêu cầu',
      text: 'Bạn có chắc chắn muốn hủy yêu cầu chỉnh sửa này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hủy yêu cầu',
      cancelButtonText: 'Đóng'
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(true);
      await workRequestService.cancelRequest(activeEditRequest._id);
      toast.success('Đã hủy yêu cầu chỉnh sửa', { position: 'top-right' });
      setActiveEditRequest(null);
    } catch (error) {
      console.error('Error canceling edit request:', error);
      toast.error(error.message || 'Không thể hủy yêu cầu', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveEditRequest = async () => {
    if (!activeEditRequest) return;

    try {
      setActionLoading(true);
      await workRequestService.approveEditProgram(activeEditRequest._id, {
        note: editApprovalNote
      });
      toast.success('Đã duyệt yêu cầu chỉnh sửa chương trình!', { position: 'top-right' });
      setShowApproveEditModal(false);
      setEditApprovalNote('');
      setActiveEditRequest(null);
      fetchProgramDetail();
    } catch (error) {
      console.error('Error approving edit request:', error);
      toast.error(error.message || 'Không thể duyệt yêu cầu', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectEditRequest = async () => {
    if (!activeEditRequest) return;

    if (!editRejectionReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối', { position: 'top-right' });
      return;
    }

    try {
      setActionLoading(true);
      await workRequestService.rejectEditProgram(activeEditRequest._id, {
        rejectionReason: editRejectionReason
      });
      toast.success('Đã từ chối yêu cầu chỉnh sửa. Subject Leader có thể sửa và nộp lại.', { position: 'top-right' });
      setShowRejectEditModal(false);
      setEditRejectionReason('');
      fetchEditRequestStatus();
    } catch (error) {
      console.error('Error rejecting edit request:', error);
      toast.error(error.message || 'Không thể từ chối yêu cầu', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  const getEditRequestStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7' },
      in_progress: { label: 'Đang xử lý', color: '#3b82f6', bg: '#dbeafe' },
      pending_approval: { label: 'Chờ duyệt', color: '#8b5cf6', bg: '#ede9fe' }
    };
    const config = statusConfig[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        color: config.color,
        backgroundColor: config.bg
      }}>
        {config.label}
      </span>
    );
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
        // Hiển thị toggle cho tất cả course (isActive không liên quan đến status course)
        // Logic kiểm tra có thể deactivate hay không sẽ được thực hiện khi toggle

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
          {/* Edit & Delete buttons - chỉ hiển thị khi program đang draft */}
          {program?.status === 'draft' && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon="ph ph-pencil-simple"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${basePath}/programs/${id}/courses/${row._id}/edit`);
                }}
              >
                Sửa
              </Button>
            </>
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
          {/* Draft: CenterHead can edit, delete, complete */}
          {program.status === 'draft' && (
            <>
              <Button
                variant="outline"
                icon="ph ph-pencil-simple"
                onClick={() => navigate(`${basePath}/programs/${id}/edit`)}
                disabled={actionLoading}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="danger"
                icon="ph ph-trash"
                onClick={handleDeleteProgram}
                disabled={actionLoading}
              >
                Xóa
              </Button>
              <Button
                variant="success"
                icon="ph ph-check-circle"
                onClick={handleCompleteProgram}
                disabled={actionLoading}
              >
                Hoàn thành
              </Button>
            </>
          )}

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

          {/* Edit Button - For Approved programs */}
          {/* isMyProgram: Direct edit (no approval needed) */}
          {/* !isMyProgram: Request edit (need Subject Leader to handle) */}
          {program.status === 'approved' && isMyProgram && (
            <Button
              variant="outline"
              icon="ph ph-pencil-simple"
              onClick={() => navigate(`${basePath}/programs/${id}/edit`)}
              disabled={actionLoading}
            >
              Chỉnh sửa
            </Button>
          )}
          {program.status === 'approved' && !isMyProgram && !activeEditRequest && (
            <Button
              variant="outline"
              icon="ph ph-paper-plane-tilt"
              onClick={handleOpenEditRequestModal}
              disabled={actionLoading}
            >
              Yêu cầu chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Draft Program Alert */}
      {program.status === 'draft' && (
        <div className="alert alert-info mb-24" role="alert" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="d-flex align-items-start">
            <i className="ph ph-pencil-circle" style={{ fontSize: '24px', marginRight: '12px', color: '#3b82f6' }}></i>
            <div>
              <h6 className="mb-2 fw-bold">Chương trình đang ở trạng thái Bản nháp</h6>
              <p className="mb-0">
                Bạn có thể chỉnh sửa thông tin chương trình, thêm/sửa khóa học.
                Khi hoàn tất, nhấn <strong>"Hoàn thành"</strong> để kích hoạt chương trình.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Active Edit Request Alert - For programs NOT created by current user */}
      {!isMyProgram && activeEditRequest && (
        <div className="alert alert-info mb-24" role="alert" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-start">
              <i className="ph ph-pencil-circle" style={{ fontSize: '24px', marginRight: '12px', color: '#8b5cf6' }}></i>
              <div>
                <h6 className="mb-2 fw-bold d-flex align-items-center gap-2">
                  Yêu cầu chỉnh sửa đang xử lý
                  {getEditRequestStatusBadge(activeEditRequest.status)}
                </h6>
                <p className="mb-1"><strong>Giao cho:</strong> {activeEditRequest.assignedTo?.name || activeEditRequest.assignedTo?.username || 'N/A'}</p>
                <p className="mb-1"><strong>Nội dung:</strong> {activeEditRequest.requestNote || 'Không có nội dung'}</p>
                <p className="mb-0 text-sm text-muted">
                  Tạo ngày: {formatDate(activeEditRequest.createdAt)}
                </p>
              </div>
            </div>
            <div className="d-flex gap-2">
              {/* Show Approve/Reject buttons if status is pending_approval */}
              {activeEditRequest.status === 'pending_approval' && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    icon="ph ph-check"
                    onClick={() => setShowApproveEditModal(true)}
                    disabled={actionLoading}
                  >
                    Duyệt
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon="ph ph-x"
                    onClick={() => setShowRejectEditModal(true)}
                    disabled={actionLoading}
                  >
                    Từ chối
                  </Button>
                </>
              )}
              {/* Show Cancel button if status is pending or in_progress */}
              {(activeEditRequest.status === 'pending' || activeEditRequest.status === 'in_progress') && (
                <Button
                  variant="outline"
                  size="sm"
                  icon="ph ph-x-circle"
                  onClick={handleCancelEditRequest}
                  disabled={actionLoading}
                >
                  Hủy yêu cầu
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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
          {/* Nút thêm khóa học - chỉ hiển thị khi program đang draft */}
          {program.status === 'draft' && (
            <Button
              variant="primary"
              icon="ph ph-plus"
              onClick={() => navigate(`${basePath}/programs/${id}/courses/create`)}
            >
              Thêm khóa học
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

      {/* Edit Request Modal - Create new edit request */}
      {showEditRequestModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Yêu cầu chỉnh sửa chương trình</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditRequestModal(false);
                    setEditRequestNote('');
                    setSelectedSubjectLeader('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Chương trình</label>
                  <div className="p-3 bg-light rounded">
                    <strong>{program.program_name}</strong>
                    <span className="text-muted ms-2">({program.code})</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Giao cho Subject Leader *</label>
                  {loadingSubjectLeaders ? (
                    <div className="d-flex align-items-center gap-2">
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      <span>Đang tải...</span>
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={selectedSubjectLeader}
                      onChange={(e) => setSelectedSubjectLeader(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="">-- Chọn Subject Leader --</option>
                      {subjectLeaders.map((sl) => (
                        <option key={sl._id} value={sl._id}>
                          {sl.name || sl.username} ({sl.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Nội dung yêu cầu *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Mô tả yêu cầu chỉnh sửa (VD: Thêm course mới thay thế cho course ABC đã bị vô hiệu hóa...)"
                    value={editRequestNote}
                    onChange={(e) => setEditRequestNote(e.target.value)}
                    disabled={actionLoading}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditRequestModal(false);
                    setEditRequestNote('');
                    setSelectedSubjectLeader('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  icon="ph ph-paper-plane-tilt"
                  onClick={handleCreateEditRequest}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Edit Request Modal */}
      {showApproveEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Duyệt yêu cầu chỉnh sửa</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowApproveEditModal(false);
                    setEditApprovalNote('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-neutral-700 mb-3">
                  Xác nhận duyệt yêu cầu chỉnh sửa chương trình từ <strong>{activeEditRequest?.assignedTo?.name || activeEditRequest?.assignedTo?.username}</strong>?
                </p>
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Nhập ghi chú..."
                  value={editApprovalNote}
                  onChange={(e) => setEditApprovalNote(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApproveEditModal(false);
                    setEditApprovalNote('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="success"
                  onClick={handleApproveEditRequest}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận duyệt'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Edit Request Modal */}
      {showRejectEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Từ chối yêu cầu chỉnh sửa</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRejectEditModal(false);
                    setEditRejectionReason('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-neutral-700 mb-3">
                  Subject Leader có thể chỉnh sửa và nộp lại sau khi bạn từ chối.
                </p>
                <label className="form-label">Lý do từ chối *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập lý do từ chối..."
                  value={editRejectionReason}
                  onChange={(e) => setEditRejectionReason(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectEditModal(false);
                    setEditRejectionReason('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleRejectEditRequest}
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
