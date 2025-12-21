import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import FilterBar from '../compo/FilterBar';
import StatusBadge from '../compo/StatusBadge';
import { formatDate } from '../../../helper/helper';
import examService from '../../../services/examService';

const CenterHeadExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [stats, setStats] = useState({ total: 0, draft: 0, pending: 0, approved: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);


  // Removed applyFilters and applyPagination - now using memoized values

  const fetchExams = async () => {
    try {
      setLoading(true);

      // Fetch all exams
      const response = await examService.getAllExamsForManagement();
      const examsData = response.data || [];
      setExams(examsData);

      // Calculate stats
      const calculatedStats = {
        total: examsData.length,
        draft: examsData.filter(e => e.status === 'draft').length,
        pending: examsData.filter(e => e.status === 'pending_approval').length,
        approved: examsData.filter(e => e.status === 'approved').length
      };
      setStats(calculatedStats);

      console.log('Exams loaded from API:', examsData);
    } catch (err) {
      console.error('Error fetching exams:', err);
      alert('Không thể tải danh sách đề thi!');
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



  const handleTogglePublish = async (examId, currentIsPublished, e) => {
    e.stopPropagation(); // Prevent row click navigation

    try {
      const newIsPublished = !currentIsPublished;

      if (newIsPublished) {
        // Publish exam
        await examService.publishExamForManagement(examId);
      } else {
        // Unpublish exam
        await examService.unpublishExamForManagement(examId);
      }

      // Refresh exam list
      await fetchExams();
    } catch (error) {
      console.error('Error toggling publish state:', error);
      alert(error.message || 'Không thể thay đổi trạng thái công khai của đề thi!');
    }
  };

  useEffect(() => {
    fetchExams();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoized filtered data
  const filteredData = useMemo(() => {
    let filtered = [...exams];

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

    return filtered;
  }, [searchKeyword, filterValues, exams]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    const totalItems = filteredData.length;
    const totalPagesCount = Math.ceil(totalItems / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      totalPages: totalPagesCount,
      data: filteredData.slice(startIndex, endIndex)
    };
  }, [filteredData, currentPage, itemsPerPage]);

  // Update totalPages when pagination info changes
  useEffect(() => {
    setTotalPages(paginationInfo.totalPages);
  }, [paginationInfo.totalPages]);

  const paginatedData = paginationInfo.data;

  // Memoized stats calculation
  const currentStats = useMemo(() => {
    return {
      total: exams.length,
      draft: exams.filter(e => e.status === 'draft').length,
      pending: exams.filter(e => e.status === 'pending_approval').length,
      approved: exams.filter(e => e.status === 'approved').length
    };
  }, [exams]);

  // Update stats when calculated
  useEffect(() => {
    setStats(currentStats);
  }, [currentStats]);

  const filters = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { value: "draft", label: "Bản nháp" },
        { value: "pending_approval", label: "Chờ duyệt" },
        { value: "approved", label: "Đã duyệt" },
        { value: "needs_revision", label: "Cần chỉnh sửa" },
      ]
    }
  ];

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
      header: 'Công khai',
      field: 'isPublished',
      render: (row) => {
        // Only show toggle for approved exams
        if (row.status !== 'approved') {
          return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '24px' }}>
              <span className="text-neutral-500" style={{ fontSize: '0.75rem' }}>
                N/A
              </span>
            </div>
          );
        }

        return (
          <div className="form-check form-switch d-flex justify-content-center align-items-center" style={{ height: '24px' }}>
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={row.isPublished || false}
              onChange={(e) => handleTogglePublish(row._id, row.isPublished, e)}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer' }}
              title={row.isPublished ? 'Tắt chế độ công khai' : 'Bật chế độ công khai'}
            />
          </div>
        );
      },
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
              navigate(`/center-head/exams/${row._id}/details`);
            }}
            className="px-2 py-1"
            title="Xem chi tiết"
          >
            <span className="d-none d-lg-inline" style={{ fontSize: '0.75rem' }}>Xem</span>
            <span className="d-inline d-lg-none">👁</span>
          </Button>
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
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý đề luyện thi</h4>
          <p className="text-neutral-600 mb-0">Quản lý các đề thi luyện thi trong hệ thống</p>
        </div>
      </div>

      {/* Title */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý đề luyện thi</h4>
          <p className="text-neutral-600 mb-0">Danh sách tất cả đề thi trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-24">
        <div className="col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Tổng đề thi</h6>
            <h4 className="text-neutral-900 fw-bold mb-0">{stats.total}</h4>
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
            <h6 className="text-neutral-600 mb-8">Chờ duyệt</h6>
            <h4 className="text-info-600 fw-bold mb-0">{stats.pending}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Đã duyệt</h6>
            <h4 className="text-success-600 fw-bold mb-0">{stats.approved}</h4>
          </Card>
        </div>
      </div>

      {/* Search & Filter */}
      <Card variant="shadow" className="mb-24">
        <div className="d-flex gap-3 align-items-center justify-content-between">
          <SearchBox
            placeholder="Tìm kiếm đề thi..."
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
          columns={columns}
          data={paginatedData}
          onRowClick={(row) => navigate(`/center-head/exams/${row._id}`)}
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
              Trang {currentPage} / {totalPages} ({filteredData.length} bản ghi)
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

    </div>
  );
};

export default CenterHeadExamList;
