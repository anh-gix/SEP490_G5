import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumb from '../../compo/Breadcrumb';
import Card from '../../compo/Card';
import Table from '../../compo/Table';
import Button from '../../compo/Button';
import SearchBox from '../../compo/SearchBox';
import FilterBar from '../../compo/FilterBar';
import StatusBadge from '../../compo/StatusBadge';
import { formatDate } from '../../../../helper/helper';
import examService from '../../../../services/examService';

/**
 * CenterHeadExamList - Danh sách đề thi cho Center Head
 * - Tab "Tất cả đề thi": Hiển thị tất cả đề thi đã approved
 * - Tab "Đề của tôi": Hiển thị đề do CenterHead tạo (bao gồm draft)
 * - CenterHead có toàn quyền CRUD đề thi
 */
const CenterHeadExamList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state - default to 'my-exams' if coming from create, otherwise 'all'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');

  const [exams, setExams] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [stats, setStats] = useState({
    total: 0, approved: 0, draft: 0, published: 0,
    myExams: 0, myApproved: 0, myDraft: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const basePath = '/center-head';

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch both all exams and my exams in parallel
      const [allResponse, myResponse] = await Promise.all([
        examService.getAllExamsForManagement(),
        examService.getMyExams()
      ]);

      const allExamsData = allResponse.data || [];
      const myExamsData = myResponse.data || [];

      setExams(allExamsData);
      setMyExams(myExamsData);

      // Calculate stats
      const calculatedStats = {
        total: allExamsData.length,
        approved: allExamsData.filter(e => e.status === 'approved').length,
        draft: myExamsData.filter(e => e.status === 'draft').length,
        published: allExamsData.filter(e => e.isPublished === true).length,
        myExams: myExamsData.length,
        myApproved: myExamsData.filter(e => e.status === 'approved').length,
        myDraft: myExamsData.filter(e => e.status === 'draft').length
      };
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error fetching exams:', err);
      toast.error('Không thể tải danh sách đề thi!', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    // Use myExams for "my-exams" tab, otherwise use all exams
    let filtered = activeTab === 'my-exams' ? [...myExams] : [...exams];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(exam =>
        exam.title?.toLowerCase().includes(keyword) ||
        exam.description?.toLowerCase().includes(keyword)
      );
    }

    // Filter by status
    if (filterValues.status && filterValues.status !== "all") {
      filtered = filtered.filter(exam => exam.status === filterValues.status);
    }

    // Filter by exam type
    if (filterValues.examType && filterValues.examType !== "all") {
      filtered = filtered.filter(exam => exam.examType === filterValues.examType);
    }

    return filtered;
  }, [exams, myExams, searchKeyword, filterValues, activeTab]);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setSearchKeyword('');
    setFilterValues({});
    setCurrentPage(1);
  };

  const handleTogglePublish = async (examId, currentIsPublished, e) => {
    e.stopPropagation();

    try {
      const newIsPublished = !currentIsPublished;

      if (newIsPublished) {
        await examService.publishExamForManagement(examId);
        toast.success('Đã mở đề thi cho học viên!', { position: 'top-right' });
      } else {
        await examService.unpublishExamForManagement(examId);
        toast.success('Đã đóng đề thi!', { position: 'top-right' });
      }

      await fetchExams();
    } catch (error) {
      console.error('Error toggling publish state:', error);
      toast.error(error.message || 'Không thể thay đổi trạng thái công khai!', { position: 'top-right' });
    }
  };

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, filterValues, activeTab]);

  const breadcrumbItems = [
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Quản lý đề luyện thi', path: `${basePath}/exams` },
  ];

  const filters = [
    {
      key: "status",
      label: "Trạng thái",
      options: activeTab === 'my-exams'
        ? [
            { value: "draft", label: "Bản nháp" },
            { value: "approved", label: "Hoàn thành" },
          ]
        : [
            { value: "approved", label: "Hoàn thành" },
          ]
    },
    {
      key: "examType",
      label: "Loại đề thi",
      options: [
        { value: "ielts", label: "IELTS" },
        { value: "toeic", label: "TOEIC" },
        { value: "cambridge", label: "Cambridge" },
      ]
    }
  ];

  const columns = [
    {
      header: 'Đề thi',
      field: 'title',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-1">{row.title}</div>
          <div className="text-sm text-neutral-600 d-none d-md-block">
            {row.description ? (row.description.length > 60 ? row.description.substring(0, 60) + '...' : row.description) : 'Không có mô tả'}
          </div>
        </div>
      ),
    },
    {
      header: 'Loại',
      field: 'examType',
      render: (row) => {
        const typeLabels = {
          'ielts': 'IELTS',
          'toeic': 'TOEIC',
          'cambridge': 'Cambridge'
        };
        return (
          <span className="badge bg-info-600 text-white">
            {typeLabels[row.examType] || row.examType?.toUpperCase() || 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Sections',
      field: 'sections',
      hideOnMobile: true,
      render: (row) => (
        <span className="text-neutral-700">{row.sections?.length || 0} phần</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => {
        // Show progress for incomplete drafts in my-exams tab
        const isIncomplete = row.status === 'draft' && (row.lastCompletedStep || 0) < 4;

        if (activeTab === 'my-exams' && isIncomplete) {
          const step = row.lastCompletedStep || 0;
          const stepLabels = ['Chưa bắt đầu', 'Thông tin cơ bản', 'Sections', 'Đáp án', 'Hoàn tất'];
          return (
            <div>
              <StatusBadge status={row.status} size="sm" />
              <div className="mt-1">
                <small className="text-warning-600">
                  <i className="ph ph-clock me-1"></i>
                  Bước {step}/4: {stepLabels[step]}
                </small>
              </div>
            </div>
          );
        }

        return <StatusBadge status={row.status} size="sm" />;
      },
    },
    {
      header: 'Công khai',
      field: 'isPublished',
      render: (row) => {
        // Only show toggle for approved exams
        if (row.status !== 'approved') {
          return (
            <span className="text-neutral-500 text-sm">N/A</span>
          );
        }

        return (
          <div className="form-check form-switch d-flex justify-content-center align-items-center">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={row.isPublished || false}
              onChange={(e) => handleTogglePublish(row._id, row.isPublished, e)}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer' }}
              title={row.isPublished ? 'Đóng đề thi' : 'Mở cho học viên'}
            />
          </div>
        );
      },
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
      render: (row) => {
        // Check if exam is incomplete (draft with lastCompletedStep < 4)
        const isIncomplete = row.status === 'draft' && (row.lastCompletedStep || 0) < 4;

        return (
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="ph ph-eye"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${basePath}/exams/${row._id}/details`);
              }}
            >
              Xem
            </Button>
            {/* Continue button - for incomplete draft exams in my-exams tab */}
            {activeTab === 'my-exams' && isIncomplete && (
              <Button
                variant="primary"
                size="sm"
                icon="ph ph-play"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${basePath}/exams/${row._id}/edit`);
                }}
                title={`Tiếp tục từ bước ${(row.lastCompletedStep || 0) + 1}`}
              >
                Tiếp tục
              </Button>
            )}
            {/* Edit button - only for completed draft exams in my-exams tab */}
            {activeTab === 'my-exams' && row.status === 'draft' && !isIncomplete && (
              <Button
                variant="outline"
                size="sm"
                icon="ph ph-pencil-simple"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${basePath}/exams/${row._id}/edit`);
                }}
              >
                Sửa
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  return (
    <div className="exam-list-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-24 gap-3">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý đề luyện thi</h4>
          <p className="text-neutral-600 mb-0">
            {activeTab === 'my-exams'
              ? 'Quản lý các đề thi do bạn tạo'
              : 'Tất cả đề thi trong hệ thống'}
          </p>
        </div>
        {/* Create button - only in my-exams tab */}
        {activeTab === 'my-exams' && (
          <Button
            variant="primary"
            icon="ph ph-plus"
            onClick={() => navigate(`${basePath}/exams/create`)}
          >
            Tạo đề thi mới
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-24">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              <i className="ph ph-list me-2"></i>
              Tất cả đề thi
              <span className="badge bg-secondary ms-2">{stats.total}</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'my-exams' ? 'active' : ''}`}
              onClick={() => handleTabChange('my-exams')}
            >
              <i className="ph ph-user me-2"></i>
              Đề của tôi
              <span className="badge bg-secondary ms-2">{stats.myExams}</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-24">
        <div className="col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">
              {activeTab === 'my-exams' ? 'Đề của tôi' : 'Tổng đề thi'}
            </h6>
            <h4 className="text-neutral-900 fw-bold mb-0">
              {activeTab === 'my-exams' ? stats.myExams : stats.total}
            </h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Hoàn thành</h6>
            <h4 className="text-success-600 fw-bold mb-0">
              {activeTab === 'my-exams' ? stats.myApproved : stats.approved}
            </h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Bản nháp</h6>
            <h4 className="text-warning-600 fw-bold mb-0">
              {activeTab === 'my-exams' ? stats.myDraft : stats.draft}
            </h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Đã mở cho học viên</h6>
            <h4 className="text-info-600 fw-bold mb-0">{stats.published}</h4>
          </Card>
        </div>
      </div>

      {/* Search & Filter */}
      <Card variant="shadow" className="mb-24">
        <div className="d-flex gap-3 align-items-center justify-content-between flex-wrap">
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
        {paginationInfo.data.length > 0 ? (
          <Table
            columns={columns}
            data={paginationInfo.data}
            onRowClick={(row) => navigate(`${basePath}/exams/${row._id}/details`)}
          />
        ) : (
          <div className="text-center py-5 text-neutral-600">
            <i className="ph ph-file-dashed text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="mt-3 mb-0">
              {activeTab === 'my-exams'
                ? 'Bạn chưa tạo đề thi nào. Bấm "Tạo đề thi mới" để bắt đầu.'
                : 'Không tìm thấy đề thi nào.'}
            </p>
          </div>
        )}
      </Card>

      {/* Pagination Controls */}
      {paginationInfo.totalPages > 1 && (
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
            <span className="text-sm text-neutral-600">bản ghi trên trang</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="text-sm text-neutral-600">
              Trang {currentPage} / {paginationInfo.totalPages} ({filteredData.length} bản ghi)
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

              {Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const distance = Math.abs(page - currentPage);
                  return distance === 0 || distance === 1 || page === 1 || page === paginationInfo.totalPages;
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
                disabled={currentPage === paginationInfo.totalPages}
                title="Trang sau"
              >
                <i className="ph ph-caret-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default CenterHeadExamList;
