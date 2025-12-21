import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../CenterHead/compo/Card';
import Table from '../CenterHead/compo/Table';
import Button from '../CenterHead/compo/Button';
import SearchBox from '../CenterHead/compo/SearchBox';
import FilterBar from '../CenterHead/compo/FilterBar';
import StatusBadge from '../CenterHead/compo/StatusBadge';
import { formatDate } from '../../helper/helper';
import examService from '../../services/examService';
import workRequestService from '../../services/workRequestService';
import ViewRequestModal from './ViewRequestModal';

const TeacherExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [paginatedExams, setPaginatedExams] = useState([]);
  const [paginatedRequests, setPaginatedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [stats, setStats] = useState({ total: 0, draft: 0, pending: 0, approved: 0, published: 0 });
  const [requestStats, setRequestStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('my-exams'); // 'my-exams', 'all-exams', 'work-requests'

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
      // Filter exams
      const sourceData = activeTab === 'my-exams' ? myExams : exams;
      let filtered = [...sourceData];

      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(exam =>
          exam.title?.toLowerCase().includes(keyword) ||
          exam.description?.toLowerCase().includes(keyword)
        );
      }

      if (filterValues.status && filterValues.status !== "all") {
        filtered = filtered.filter(exam => exam.status === filterValues.status);
      }

      if (filterValues.isPublished && filterValues.isPublished !== "all") {
        const isPublished = filterValues.isPublished === "true";
        filtered = filtered.filter(exam => exam.isPublished === isPublished);
      }

      setFilteredExams(filtered);
    }
    setCurrentPage(1);
  }, [exams, myExams, workRequests, searchKeyword, filterValues, activeTab]);

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
      const totalItems = filteredExams.length;
      const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(totalPagesCount);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filteredExams.slice(startIndex, endIndex);

      setPaginatedExams(paginatedData);
    }
  }, [filteredExams, filteredRequests, currentPage, itemsPerPage, activeTab]);

  const fetchExams = async () => {
    try {
      setLoading(true);

      // Fetch all exams
      const allResponse = await examService.getAllExamsForManagement();
      const allExamsData = allResponse.data || [];
      setExams(allExamsData);

      // Fetch my exams (created by current teacher)
      let myExamsData = [];
      try {
        const myResponse = await examService.getMyExams();
        myExamsData = myResponse.data || [];
        setMyExams(myExamsData);
      } catch (myError) {
        console.error('Error fetching my exams:', myError);
        setMyExams([]);
      }

      // Calculate stats based on active tab
      const sourceData = activeTab === 'my-exams' ? myExamsData : allExamsData;
      const calculatedStats = {
        total: sourceData.length,
        draft: sourceData.filter(e => e.status === 'draft').length,
        pending: sourceData.filter(e => e.status === 'pending_approval').length,
        approved: sourceData.filter(e => e.status === 'approved').length,
        published: sourceData.filter(e => e.isPublished === true).length
      };
      setStats(calculatedStats);

      console.log('Exams loaded from API:', allExamsData);
      console.log('My Exams loaded from API:', myExamsData);
    } catch (err) {
      console.error('Error fetching exams:', err);
      alert('Không thể tải danh sách đề thi!');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkRequests = async () => {
    try {
      setLoading(true);

      // Fetch work requests assigned to current user (Teacher/Subject Leader)
      // Only get top-down requests (từ Center Head giao xuống) with type create_exam
      const response = await workRequestService.getAssignedToMe({
        requestType: 'create_exam', // Only get create_exam requests
        direction: 'top_down' // Only top-down requests (Center Head -> Teacher)
      });
      const requestsData = response.data || [];

      // Filter again on client side to ensure only top_down requests
      const topDownRequests = requestsData.filter(req => req.direction === 'top_down');
      setWorkRequests(topDownRequests);

      // Calculate request stats
      const calculatedRequestStats = {
        total: topDownRequests.length,
        pending: topDownRequests.filter(r => r.status === 'pending').length,
        in_progress: topDownRequests.filter(r => r.status === 'in_progress').length,
        completed: topDownRequests.filter(r => r.status === 'completed').length
      };
      setRequestStats(calculatedRequestStats);

      console.log('Work Requests loaded from API:', topDownRequests);
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

  const handleDeleteExam = async (examId, examTitle) => {
    const confirmMessage = `⚠️ CẢNH BÁO: Bạn có chắc muốn xóa đề thi "${examTitle}"?\n\n` +
      `Hành động này KHÔNG THỂ HOÀN TÁC!\n\n` +
      `Nhấn OK để xác nhận xóa.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await examService.deleteExam(examId);
      await fetchExams();
      alert('Đã xóa đề thi thành công!');
    } catch (err) {
      console.error('Error deleting exam:', err);
      alert(err.message || 'Có lỗi xảy ra khi xóa đề thi.');
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
      // Call API to start processing - sẽ tự động tạo exam draft
      const response = await workRequestService.startProcessing(request._id);

      console.log('Start processing response:', response);

      // Refresh work requests
      await fetchWorkRequests();

      // Nếu API trả về examId, navigate đến trang edit exam đó
      if (response.examId || response.entityId) {
        const examId = response.examId || response.entityId;
        navigate(`/teacher/exams/${examId}/edit`);
      } else {
        // Fallback: navigate to create page
        console.warn('No examId returned, navigating to create page');
        navigate('/teacher/exams/create');
      }
    } catch (error) {
      console.error('Error starting processing:', error);
      alert(error.message || 'Không thể bắt đầu xử lý yêu cầu!');
    }
  };

  const handleRequestUpdated = () => {
    // Refresh work requests after update
    fetchWorkRequests();
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterValues, exams, myExams, workRequests, activeTab, applyFilters]);

  useEffect(() => {
    applyPagination();
  }, [filteredExams, filteredRequests, currentPage, itemsPerPage, applyPagination]);

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
      const sourceData = activeTab === 'my-exams' ? myExams : exams;
      const calculatedStats = {
        total: sourceData.length,
        draft: sourceData.filter(e => e.status === 'draft').length,
        pending: sourceData.filter(e => e.status === 'pending_approval').length,
        approved: sourceData.filter(e => e.status === 'approved').length,
        published: sourceData.filter(e => e.isPublished === true).length
      };
      setStats(calculatedStats);
    }
  }, [activeTab, exams, myExams, workRequests]);

  const examFilters = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { value: "draft", label: "Bản nháp" },
        { value: "pending_approval", label: "Chờ duyệt" },
        { value: "approved", label: "Đã duyệt" },
        { value: "needs_revision", label: "Cần chỉnh sửa" },
      ]
    },
    {
      key: "isPublished",
      label: "Public",
      options: [
        { value: "true", label: "Đã mở cho học viên" },
        { value: "false", label: "Chưa mở cho học viên" },
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
        { value: "completed", label: "Hoàn thành" },
      ]
    }
  ];

  const filters = activeTab === 'work-requests' ? requestFilters : examFilters;

  const columns = [
    {
      header: 'Đề thi',
      field: 'title',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-1" style={{ fontSize: '0.8125rem' }}>{row.title}</div>
          <div className="text-neutral-600" style={{ fontSize: '0.6875rem' }}>
            {row.description ? (row.description.length > 50 ? row.description.substring(0, 50) + '...' : row.description) : 'Không có mô tả'}
          </div>
        </div>
      ),
    },
    {
      header: 'Loại đề thi',
      field: 'examType',
      render: (row) => {
        const typeLabels = {
          'ielts': 'IELTS',
          'toeic': 'TOEIC',
          'cambridge': 'Cambridge'
        };
        return (
          <span className="badge bg-info-600 text-white" style={{ fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>
            {typeLabels[row.examType] || row.examType?.toUpperCase() || 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Sections',
      field: 'sections',
      render: (row) => (
        <span className="text-neutral-700" style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{row.sections?.length || 0} sections</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Public',
      field: 'isPublished',
      render: (row) => (
        <span className={`badge ${row.isPublished ? 'bg-success-600' : 'bg-secondary'} text-white`} style={{ fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>
          {row.isPublished ? 'Đã mở' : 'Chưa mở'}
        </span>
      ),
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
              navigate(`/teacher/exams/${row._id}/details`);
            }}
            className="px-2 py-1"
            title="Xem chi tiết"
          >
            <span className="d-none d-lg-inline" style={{ fontSize: '0.75rem' }}>Xem</span>
            <span className="d-inline d-lg-none">👁</span>
          </Button>
          {activeTab === 'my-exams' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon="ph ph-pencil"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/teacher/exams/${row._id}/edit`);
                }}
                className="px-2 py-1"
              >
                <span className="d-none d-lg-inline" style={{ fontSize: '0.75rem' }}>Sửa</span>
                <span className="d-inline d-lg-none">✏️</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon="ph ph-trash"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteExam(row._id, row.title);
                }}
                className="px-2 py-1"
              >
                <span className="d-none d-lg-inline" style={{ fontSize: '0.75rem' }}>Xóa</span>
                <span className="d-inline d-lg-none">🗑️</span>
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const requestColumns = [
    {
      header: 'Yêu cầu',
      field: 'requestNote',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-1">Tạo đề thi mới</div>
          <div className="text-sm text-neutral-600" style={{ maxWidth: '300px' }}>
            {row.requestNote || 'Không có ghi chú'}
          </div>
        </div>
      ),
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
        <div className="d-flex gap-2 justify-content-center">
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
          {row.status === 'pending' && (
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
          {row.status === 'in_progress' && (
            <button
              className="btn btn-sm btn-info d-flex align-items-center gap-1"
              onClick={async (e) => {
                e.stopPropagation();
                // Navigate đến exam đã được tạo
                if (row.entityId) {
                  const examId = typeof row.entityId === 'object' ? row.entityId._id : row.entityId;

                  // Kiểm tra exam có tồn tại không trước khi navigate
                  try {
                    await examService.getExamByIdForManagement(examId);
                    navigate(`/teacher/exams/${examId}/edit`);
                  } catch (error) {
                    // Exam đã bị xóa - hỏi user có muốn tạo lại không
                    const recreate = window.confirm(
                      '⚠️ Exam liên kết với request này đã bị xóa.\n\n' +
                      'Bạn có muốn tạo lại exam để tiếp tục không?\n\n' +
                      'Ấn OK để tạo lại exam mới, hoặc Cancel để hủy.'
                    );

                    if (recreate) {
                      try {
                        const response = await workRequestService.recreateEntity(row._id, {
                          title: `Exam for ${row.requestType}`,
                          examType: 'cambridge'
                        });

                        console.log('Recreated exam:', response);

                        // Refresh work requests
                        await fetchWorkRequests();

                        // Navigate to new exam
                        if (response.entityId) {
                          alert('✅ Đã tạo lại exam thành công!');
                          navigate(`/teacher/exams/${response.entityId}/edit`);
                        }
                      } catch (recreateError) {
                        console.error('Error recreating exam:', recreateError);
                        alert(recreateError.message || 'Không thể tạo lại exam. Vui lòng thử lại sau.');
                      }
                    }
                  }
                } else {
                  alert('Chưa có exam được tạo cho request này. Vui lòng ấn "Bắt đầu" trước.');
                }
              }}
              title="Tiếp tục tạo"
              disabled={!row.entityId}
            >
              <i className="ph ph-pencil"></i>
              <span className="d-none d-md-inline">Tiếp tục</span>
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
    <div className="exam-list-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Đề thi</h4>
          <p className="text-neutral-600 mb-0">Quản lý các đề thi - Chỉ có thể tạo đề thi từ yêu cầu của Center Head</p>
        </div>
        {/* Removed standalone create exam button - Teachers can only create exams from work requests */}
      </div>

      {/* Tabs */}
      <div className="mb-24">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'my-exams' ? 'active' : ''}`}
              onClick={() => handleTabChange('my-exams')}
            >
              <i className="ph ph-user me-2"></i>
              Đề thi của tôi ({myExams.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'all-exams' ? 'active' : ''}`}
              onClick={() => handleTabChange('all-exams')}
            >
              <i className="ph ph-list me-2"></i>
              Tất cả đề thi ({exams.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'work-requests' ? 'active' : ''}`}
              onClick={() => handleTabChange('work-requests')}
            >
              <i className="ph ph-clipboard-text me-2"></i>
              Yêu cầu từ Center Head ({workRequests.length})
            </button>
          </li>
        </ul>
      </div>

      {/* Stats */}
      {activeTab === 'work-requests' ? (
        <div className="row g-4 mb-24">
          <div className="col-md-3">
            <Card>
              <h6 className="text-neutral-600 mb-8">Tổng yêu cầu</h6>
              <h4 className="text-neutral-900 fw-bold mb-0">{requestStats.total}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card>
              <h6 className="text-neutral-600 mb-8">Chờ xử lý</h6>
              <h4 className="text-warning-600 fw-bold mb-0">{requestStats.pending}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card>
              <h6 className="text-neutral-600 mb-8">Đang xử lý</h6>
              <h4 className="text-info-600 fw-bold mb-0">{requestStats.in_progress}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card>
              <h6 className="text-neutral-600 mb-8">Hoàn thành</h6>
              <h4 className="text-success-600 fw-bold mb-0">{requestStats.completed}</h4>
            </Card>
          </div>
        </div>
      ) : (
        <div className="row g-4 mb-24">
          <div className="col-md-3">
            <Card>
              <h6 className="text-neutral-600 mb-8">Tổng đề thi</h6>
              <h4 className="text-neutral-900 fw-bold mb-0">{stats.total}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card>
              <h6 className="text-neutral-600 mb-8">Bản nháp</h6>
              <h4 className="text-warning-600 fw-bold mb-0">{stats.draft}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card>
              <h6 className="text-neutral-600 mb-8">Đã duyệt</h6>
              <h4 className="text-success-600 fw-bold mb-0">{stats.approved}</h4>
            </Card>
          </div>
          <div className="col-md-3">
            <Card>
              <h6 className="text-neutral-600 mb-8">Đã mở cho học viên</h6>
              <h4 className="text-info-600 fw-bold mb-0">{stats.published}</h4>
            </Card>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <Card className="mb-24">
        <div className="d-flex gap-3 align-items-center justify-content-between">
          <SearchBox
            placeholder={activeTab === 'work-requests' ? "Tìm kiếm yêu cầu..." : "Tìm kiếm đề thi..."}
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
      <Card>
        <Table
          columns={activeTab === 'work-requests' ? requestColumns : columns}
          data={activeTab === 'work-requests' ? paginatedRequests : paginatedExams}
          onRowClick={activeTab === 'work-requests'
            ? null
            : (row) => navigate(`/teacher/exams/${row._id}`)
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
              Trang {currentPage} / {totalPages} ({activeTab === 'work-requests' ? filteredRequests.length : filteredExams.length} bản ghi)
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

export default TeacherExamList;