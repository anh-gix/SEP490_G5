import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../CenterHead/compo/Card';
import Table from '../CenterHead/compo/Table';
import Button from '../CenterHead/compo/Button';
import SearchBox from '../CenterHead/compo/SearchBox';
import FilterBar from '../CenterHead/compo/FilterBar';
import StatusBadge from '../CenterHead/compo/StatusBadge';
import { formatDate } from '../../helper/helper';
import programService from '../../services/programService';
import workRequestService from '../../services/workRequestService';
import ViewRequestModal from './ViewRequestModal';

const TeacherProgramList = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [myPrograms, setMyPrograms] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [paginatedPrograms, setPaginatedPrograms] = useState([]);
  const [paginatedRequests, setPaginatedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, archived: 0 });
  const [requestStats, setRequestStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('my-programs'); // 'my-programs', 'all-programs', 'work-requests'

  // View Request Modal
  const [showViewRequestModal, setShowViewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const applyFilters = useCallback(() => {
    if (activeTab === 'work-requests') {
      // Filter work requests
      let filtered = [...workRequests];

      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(req =>
          req.requestNote?.toLowerCase().includes(keyword) ||
          req.requestedBy?.username?.toLowerCase().includes(keyword)
        );
      }

      if (filterValues.status && filterValues.status !== "all") {
        filtered = filtered.filter(req => req.status === filterValues.status);
      }

      setFilteredRequests(filtered);
    } else {
      // Filter programs
      const sourceData = activeTab === 'my-programs' ? myPrograms : programs;
      let filtered = [...sourceData];

      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(program =>
          program.program_name?.toLowerCase().includes(keyword) ||
          program.code?.toLowerCase().includes(keyword)
        );
      }

      if (filterValues.status && filterValues.status !== "all") {
        filtered = filtered.filter(program => program.status === filterValues.status);
      }

      if (filterValues.type && filterValues.type !== "all") {
        filtered = filtered.filter(program => program.type === filterValues.type);
      }

      setFilteredPrograms(filtered);
    }
    setCurrentPage(1);
  }, [programs, myPrograms, workRequests, searchKeyword, filterValues, activeTab]);

  const applyPagination = useCallback(() => {
    if (activeTab === 'work-requests') {
      const totalItems = filteredRequests.length;
      const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(totalPagesCount);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filteredRequests.slice(startIndex, endIndex);

      setPaginatedRequests(paginatedData);
    } else {
      const totalItems = filteredPrograms.length;
      const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(totalPagesCount);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filteredPrograms.slice(startIndex, endIndex);

      setPaginatedPrograms(paginatedData);
    }
  }, [filteredPrograms, filteredRequests, currentPage, itemsPerPage, activeTab]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);

      // Fetch all programs
      const allResponse = await programService.getAllPrograms();
      const allProgramsData = allResponse.data || [];
      setPrograms(allProgramsData);

      // Fetch my programs (created by current teacher)
      let myProgramsData = [];
      try {
        const myResponse = await programService.getMyPrograms();
        myProgramsData = myResponse.data || [];
        setMyPrograms(myProgramsData);
      } catch (myError) {
        console.error('Error fetching my programs:', myError);
        // If getMyPrograms fails, set empty array
        setMyPrograms([]);
      }

      // Calculate stats based on active tab
      const sourceData = activeTab === 'my-programs' ? myProgramsData : allProgramsData;
      const calculatedStats = {
        total: sourceData.length,
        active: sourceData.filter(p => p.status === 'active').length,
        draft: sourceData.filter(p => p.status === 'draft').length,
        archived: sourceData.filter(p => p.status === 'archived').length
      };
      setStats(calculatedStats);

      console.log('Programs loaded from API:', allProgramsData);
      console.log('My Programs loaded from API:', myProgramsData);
    } catch (err) {
      console.error('Error fetching programs:', err);
      alert('Không thể tải danh sách chương trình!');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkRequests = async () => {
    try {
      setLoading(true);

      // Fetch both create_program and edit_program work requests assigned to current user
      const [createResponse, editResponse] = await Promise.all([
        workRequestService.getAssignedToMe({ requestType: 'create_program' }),
        workRequestService.getAssignedToMe({ requestType: 'edit_program' })
      ]);

      const createRequests = createResponse.data || [];
      const editRequests = editResponse.data || [];
      const requestsData = [...createRequests, ...editRequests].sort(
        (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
      );

      setWorkRequests(requestsData);

      // Calculate request stats
      const calculatedRequestStats = {
        total: requestsData.length,
        pending: requestsData.filter(r => r.status === 'pending').length,
        in_progress: requestsData.filter(r => r.status === 'in_progress').length,
        pending_approval: requestsData.filter(r => r.status === 'pending_approval').length,
        completed: requestsData.filter(r => r.status === 'completed').length
      };
      setRequestStats(calculatedRequestStats);

      console.log('Work Requests loaded from API:', requestsData);
    } catch (err) {
      console.error('Error fetching work requests:', err);
      alert('Không thể tải danh sách yêu cầu công việc!');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleDeleteProgram = async (programId, programName) => {
    const confirmMessage = `CẢNH BÁO: Bạn có chắc muốn xóa chương trình "${programName}"?\n\n` +
      `Hành động này sẽ XÓA TOÀN BỘ:\n` +
      `• Tất cả PLO trong chương trình\n` +
      `• Tất cả Course (học phần)\n` +
      `• Tất cả CLO trong các course\n` +
      `• Tất cả Session trong các course\n` +
      `• Tất cả Materials trong các course\n\n` +
      `Hành động này KHÔNG THỂ HOÀN TÁC!\n\n` +
      `Nhấn OK để xác nhận xóa.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await programService.deleteProgram(programId);
      await fetchPrograms();
      alert('Đã xóa chương trình và toàn bộ dữ liệu liên quan thành công!');
    } catch (err) {
      console.error('Error deleting program:', err);
      alert(err.message || 'Có lỗi xảy ra khi xóa chương trình.');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchKeyword('');
    setFilterValues({});
    setCurrentPage(1);

    // Fetch work requests when switching to work-requests tab
    if (tab === 'work-requests' && workRequests.length === 0) {
      fetchWorkRequests();
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowViewRequestModal(true);
  };

  const handleStartProcessing = async (request) => {
    try {
      // Call API to start processing - sẽ tự động tạo program draft
      const response = await workRequestService.startProcessing(request._id);

      console.log('Start processing response:', response);

      // Refresh work requests
      await fetchWorkRequests();

      // Nếu API trả về programId, navigate đến trang edit program đó
      if (response.programId) {
        navigate(`/teacher/programs/${response.programId}/edit`);
      } else {
        // Fallback: navigate to create page (không nên xảy ra)
        console.warn('No programId returned, navigating to create page');
        navigate('/teacher/programs/create');
      }
    } catch (error) {
      console.error('Error starting processing:', error);
      alert(error.message || 'Không thể bắt đầu xử lý yêu cầu!');
    }
  };

  // Handle start edit program request
  const handleStartEditProgram = async (request) => {
    try {
      const response = await workRequestService.startEditProgram(request._id);
      console.log('Start edit program response:', response);

      // Refresh work requests
      await fetchWorkRequests();

      // Navigate to program detail page
      const programId = response.programId || request.entityId?._id || request.entityId;
      if (programId) {
        navigate(`/teacher/programs/${programId}`);
      }
    } catch (error) {
      console.error('Error starting edit program:', error);
      alert(error.message || 'Không thể bắt đầu xử lý yêu cầu!');
    }
  };

  // Handle submit edit program for approval
  const handleSubmitEditProgram = async (request) => {
    const confirmSubmit = window.confirm(
      'Xác nhận nộp yêu cầu chỉnh sửa chương trình?\n\n' +
      'Sau khi nộp, Center Head sẽ xem xét và duyệt các thay đổi của bạn.'
    );

    if (!confirmSubmit) return;

    try {
      await workRequestService.submitEditProgram(request._id, {
        note: 'Đã hoàn thành chỉnh sửa chương trình'
      });

      alert('Đã nộp yêu cầu chỉnh sửa thành công! Chờ Center Head duyệt.');
      await fetchWorkRequests();
    } catch (error) {
      console.error('Error submitting edit program:', error);
      alert(error.message || 'Không thể nộp yêu cầu!');
    }
  };

  const handleRequestUpdated = () => {
    // Refresh work requests after update
    fetchWorkRequests();
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterValues, programs, myPrograms, workRequests, activeTab, applyFilters]);

  useEffect(() => {
    applyPagination();
  }, [filteredPrograms, filteredRequests, currentPage, itemsPerPage, applyPagination]);

  useEffect(() => {
    // Recalculate stats when tab changes
    if (activeTab === 'work-requests') {
      const calculatedRequestStats = {
        total: workRequests.length,
        pending: workRequests.filter(r => r.status === 'pending').length,
        in_progress: workRequests.filter(r => r.status === 'in_progress').length,
        completed: workRequests.filter(r => r.status === 'completed').length
      };
      setRequestStats(calculatedRequestStats);
    } else {
      const sourceData = activeTab === 'my-programs' ? myPrograms : programs;
      const calculatedStats = {
        total: sourceData.length,
        active: sourceData.filter(p => p.status === 'active').length,
        draft: sourceData.filter(p => p.status === 'draft').length,
        archived: sourceData.filter(p => p.status === 'archived').length
      };
      setStats(calculatedStats);
    }
  }, [activeTab, programs, myPrograms, workRequests]);

  const programFilters = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { value: "active", label: "Đang hoạt động" },
        { value: "draft", label: "Bản nháp" },
        { value: "archived", label: "Đã lưu trữ" },
      ]
    },
    {
      key: "type",
      label: "Loại chương trình",
      options: [
        { value: "ielts", label: "IELTS" },
        { value: "toeic", label: "TOEIC" },
        { value: "cam", label: "Cambridge" },
      ]
    }
  ];

  const requestFilters = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { value: "pending", label: "Chờ xử lý" },
        { value: "in_progress", label: "Đang xử lý" },
        { value: "pending_approval", label: "Chờ duyệt" },
        { value: "completed", label: "Hoàn thành" },
      ]
    }
  ];

  const filters = activeTab === 'work-requests' ? requestFilters : programFilters;

  const columns = [
    {
      header: 'Chương trình',
      field: 'program_name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-1" style={{ fontSize: '0.8125rem' }}>{row.program_name}</div>
          <div className="text-neutral-600" style={{ fontSize: '0.6875rem' }}>Mã: {row.code}</div>
        </div>
      ),
    },
    {
      header: 'Loại chương trình',
      field: 'type',
      render: (row) => {
        const typeLabels = {
          'ielts': 'IELTS',
          'toeic': 'TOEIC',
          'cam': 'Cambridge'
        };
        return (
          <span className="badge bg-info-600 text-white" style={{ fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>
            {typeLabels[row.type] || row.type?.toUpperCase() || 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Khóa học',
      field: 'courseCount',
      render: (row) => (
        <span className="text-neutral-700" style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{row.courseCount} khóa học</span>
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
      render: (row) => (
        <span className="text-neutral-700" style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex gap-1 justify-content-center" style={{ whiteSpace: 'nowrap' }}>
          <Button
            variant="outline"
            size="sm"
            icon="ph ph-eye"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teacher/programs/${row._id}`);
            }}
            className="px-2 py-1"
          >
            <span className="d-none d-lg-inline" style={{ fontSize: '0.75rem' }}>Xem</span>
            <span className="d-inline d-lg-none">👁</span>
          </Button>
          {activeTab === 'my-programs' && row.status === 'draft' && (
            <Button
              variant="danger"
              size="sm"
              icon="ph ph-trash"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProgram(row._id, row.program_name);
              }}
              className="px-2 py-1"
              title="Chỉ có thể xóa chương trình ở trạng thái Bản nháp"
            >
              <span className="d-none d-lg-inline" style={{ fontSize: '0.75rem' }}>Xóa</span>
              <span className="d-inline d-lg-none">🗑️</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  const getRequestTypeLabel = (requestType) => {
    const labels = {
      'create_program': { text: 'Tạo chương trình mới', color: 'success' },
      'edit_program': { text: 'Chỉnh sửa chương trình', color: 'warning' }
    };
    return labels[requestType] || { text: requestType, color: 'secondary' };
  };

  const requestColumns = [
    {
      header: 'Yêu cầu',
      field: 'requestNote',
      render: (row) => {
        const typeInfo = getRequestTypeLabel(row.requestType);
        return (
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={`badge bg-${typeInfo.color}`} style={{ fontSize: '0.6875rem' }}>
                {typeInfo.text}
              </span>
            </div>
            {row.requestType === 'edit_program' && row.entityId && (
              <div className="text-neutral-900 fw-semibold mb-1" style={{ fontSize: '0.8125rem' }}>
                {row.entityId.program_name || row.entityId.code || 'Chương trình'}
              </div>
            )}
            <div className="text-sm text-neutral-600" style={{ maxWidth: '300px' }}>
              {row.requestNote || 'Không có ghi chú'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Người giao',
      field: 'requestedBy',
      render: (row) => (
        <div>
          <div className="text-neutral-900">{row.requestedBy?.username || 'N/A'}</div>
          <div className="text-sm text-neutral-600">{row.requestedBy?.email || ''}</div>
        </div>
      ),
    },
    {
      header: 'Ngày giao',
      field: 'requestedAt',
      render: (row) => (
        <span className="text-neutral-700">{formatDate(row.requestedAt)}</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              handleViewRequest(row);
            }}
            title="Xem chi tiết"
          >
            <i className="ph ph-eye"></i>
            <span className="d-none d-md-inline">Xem</span>
          </button>

          {/* Pending: Bắt đầu xử lý */}
          {row.status === 'pending' && row.requestType === 'create_program' && (
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handleStartProcessing(row);
              }}
              title="Bắt đầu xử lý"
            >
              <i className="ph ph-play"></i>
              <span className="d-none d-md-inline">Bắt đầu</span>
            </button>
          )}

          {/* Pending edit_program: Nhận việc */}
          {row.status === 'pending' && row.requestType === 'edit_program' && (
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEditProgram(row);
              }}
              title="Nhận việc chỉnh sửa"
            >
              <i className="ph ph-play"></i>
              <span className="d-none d-md-inline">Nhận việc</span>
            </button>
          )}

          {/* In progress create_program: Tiếp tục */}
          {row.status === 'in_progress' && row.requestType === 'create_program' && row.entityId && (
            <button
              className="btn btn-sm btn-info d-flex align-items-center gap-1"
              onClick={async (e) => {
                e.stopPropagation();
                const programId = typeof row.entityId === 'object' ? row.entityId._id : row.entityId;

                // Kiểm tra program có tồn tại không trước khi navigate
                try {
                  await programService.getProgramById(programId);
                  navigate(`/teacher/programs/${programId}/edit`);
                } catch {
                  // Program đã bị xóa - refresh để cập nhật UI
                  alert('Chương trình đã bị xóa. Vui lòng ấn "Tạo lại" để tạo chương trình mới.');
                  await fetchWorkRequests();
                }
              }}
              title="Tiếp tục tạo chương trình"
            >
              <i className="ph ph-pencil"></i>
              <span className="d-none d-md-inline">Tiếp tục</span>
            </button>
          )}

          {/* In progress edit_program: Chỉnh sửa và Nộp */}
          {row.status === 'in_progress' && row.requestType === 'edit_program' && row.entityId && (
            <>
              <button
                className="btn btn-sm btn-info d-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  const programId = typeof row.entityId === 'object' ? row.entityId._id : row.entityId;
                  navigate(`/teacher/programs/${programId}`);
                }}
                title="Xem và chỉnh sửa chương trình"
              >
                <i className="ph ph-pencil"></i>
                <span className="d-none d-md-inline">Chỉnh sửa</span>
              </button>
              <button
                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmitEditProgram(row);
                }}
                title="Nộp để Center Head duyệt"
              >
                <i className="ph ph-paper-plane-tilt"></i>
                <span className="d-none d-md-inline">Nộp duyệt</span>
              </button>
            </>
          )}

          {/* Pending approval: Đang chờ duyệt */}
          {row.status === 'pending_approval' && (
            <span className="badge bg-purple-100 text-purple-600" style={{ fontSize: '0.75rem' }}>
              Đang chờ duyệt
            </span>
          )}
          {row.status === 'in_progress' && !row.entityId && (
            <button
              className="btn btn-sm btn-warning d-flex align-items-center gap-1"
              onClick={async (e) => {
                e.stopPropagation();

                const confirmRecreate = window.confirm(
                  'Lưu ý: Chương trình liên kết với yêu cầu này đã bị xóa.\n\n' +
                  'Bạn có muốn tạo chương trình mới để tiếp tục?\n\n' +
                  'Ấn OK để tạo chương trình mới.'
                );

                if (confirmRecreate) {
                  try {
                    const response = await workRequestService.recreateEntity(row._id, {
                      programName: `Program for ${row.requestType}`,
                      programType: 'ielts'
                    });

                    console.log('Recreated program:', response);

                    // Refresh work requests
                    await fetchWorkRequests();

                    // Navigate to new program
                    if (response.entityId) {
                      alert('Đã tạo lại chương trình thành công!');
                      navigate(`/teacher/programs/${response.entityId}/edit`);
                    }
                  } catch (recreateError) {
                    console.error('Error recreating program:', recreateError);
                    alert(recreateError.message || 'Không thể tạo lại chương trình. Vui lòng thử lại sau.');
                  }
                }
              }}
              title="Tạo lại chương trình đã bị xóa"
            >
              <i className="ph ph-plus-circle"></i>
              <span className="d-none d-md-inline">Tạo lại</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  return (
    <div className="program-list-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Chương trình đào tạo</h4>
          <p className="text-neutral-600 mb-0">Quản lý các chương trình và PLOs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-24">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'my-programs' ? 'active' : ''}`}
              onClick={() => handleTabChange('my-programs')}
            >
              <i className="ph ph-folder-user me-2"></i>
              Chương trình phụ trách ({myPrograms.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'all-programs' ? 'active' : ''}`}
              onClick={() => handleTabChange('all-programs')}
            >
              <i className="ph ph-list me-2"></i>
              Tất cả chương trình ({programs.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'work-requests' ? 'active' : ''}`}
              onClick={() => handleTabChange('work-requests')}
            >
              <i className="ph ph-clipboard-text me-2"></i>
              Yêu cầu được giao ({workRequests.length})
            </button>
          </li>
        </ul>
      </div>

      {/* Stats */}
      {activeTab === 'work-requests' ? (
        <div className="row g-4 mb-24">
          <div className="col-md-3">
            <Card variant="shadow">
              <h6 className="text-neutral-600 mb-8">Tổng yêu cầu</h6>
              <h4 className="text-neutral-900 fw-bold mb-0">{requestStats.total}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <h6 className="text-neutral-600 mb-8">Chờ xử lý</h6>
              <h4 className="text-warning-600 fw-bold mb-0">{requestStats.pending}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <h6 className="text-neutral-600 mb-8">Đang xử lý</h6>
              <h4 className="text-info-600 fw-bold mb-0">{requestStats.in_progress}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <h6 className="text-neutral-600 mb-8">Hoàn thành</h6>
              <h4 className="text-success-600 fw-bold mb-0">{requestStats.completed}</h4>
            </Card>
          </div>
        </div>
      ) : (
        <div className="row g-4 mb-24">
          <div className="col-md-3">
            <Card variant="shadow">
              <h6 className="text-neutral-600 mb-8">Tổng Programs</h6>
              <h4 className="text-neutral-900 fw-bold mb-0">{stats.total}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <h6 className="text-neutral-600 mb-8">Đang hoạt động</h6>
              <h4 className="text-success-600 fw-bold mb-0">{stats.active}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <h6 className="text-neutral-600 mb-8">Bản nháp</h6>
              <h4 className="text-warning-600 fw-bold mb-0">{stats.draft}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <h6 className="text-neutral-600 mb-8">Đã lưu trữ</h6>
              <h4 className="text-neutral-600 fw-bold mb-0">{stats.archived}</h4>
            </Card>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <Card variant="shadow" className="mb-24">
        <div className="d-flex gap-3 align-items-center justify-content-between">
          <SearchBox
            placeholder={activeTab === 'work-requests' ? "Tìm kiếm yêu cầu..." : "Tìm kiếm chương trình..."}
            value={searchKeyword}
            onChange={setSearchKeyword}
          />
          <FilterBar
            filters={filters}
            values={filterValues}
            onChange={(key, value) => setFilterValues({ ...filterValues, [key]: value })}
            onReset={() => setFilterValues({})}
          />
        </div>
      </Card>

      {/* Table */}
      <Card variant="shadow">
        <Table
          columns={activeTab === 'work-requests' ? requestColumns : columns}
          data={activeTab === 'work-requests' ? paginatedRequests : paginatedPrograms}
          onRowClick={activeTab === 'work-requests'
            ? null
            : (row) => navigate(`/teacher/programs/${row._id}`)
          }
        />
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="d-flex align-items-center gap-3">
            <span className="text-sm text-neutral-600">Hiển thị</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-neutral-600">
              bản ghi trên trang
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="text-sm text-neutral-600">
              Trang {currentPage} / {totalPages} ({activeTab === 'work-requests' ? filteredRequests.length : filteredPrograms.length} bản ghi)
            </span>

            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Trang trước"
              >
                <i className="ph ph-caret-left"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const distance = Math.abs(page - currentPage);
                  return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                })
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="d-flex">
                      {showEllipsis && (
                        <span className="px-2 py-1 text-neutral-600">...</span>
                      )}
                      <button
                        className={`btn btn-sm ${
                          page === currentPage
                            ? 'btn-primary'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Trang sau"
              >
                <i className="ph ph-caret-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      <ViewRequestModal
        show={showViewRequestModal}
        onClose={() => {
          setShowViewRequestModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onRequestUpdated={handleRequestUpdated}
      />
    </div>
  );
};

export default TeacherProgramList;
