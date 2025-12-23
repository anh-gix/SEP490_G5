import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import FilterBar from '../compo/FilterBar';
import StatusBadge from '../compo/StatusBadge';
import { formatDate } from '../../../helper/helper';
import programService from '../../../services/programService';
import centerHeadService from '../../../services/centerHeadService';

const ProgramList = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [paginatedPrograms, setPaginatedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, archived: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [togglingId, setTogglingId] = useState(null); // Track which program is being toggled

  const applyFilters = useCallback(() => {
    let filtered = [...programs];

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
    setCurrentPage(1); // Reset to first page when filters change
  }, [programs, searchKeyword, filterValues]);

  const applyPagination = useCallback(() => {
    const totalItems = filteredPrograms.length;
    const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
    setTotalPages(totalPagesCount);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredPrograms.slice(startIndex, endIndex);

    setPaginatedPrograms(paginatedData);
  }, [filteredPrograms, currentPage, itemsPerPage]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);

      const response = await programService.getAllPrograms();
      const programsData = response.data || [];

      setPrograms(programsData);

      // Set stats from API response
      if (response.stats) {
        setStats(response.stats);
      } else {
        // Calculate stats if not provided by API
        const calculatedStats = {
          total: programsData.length,
          active: programsData.filter(p => p.status === 'active').length,
          draft: programsData.filter(p => p.status === 'draft').length,
          archived: programsData.filter(p => p.status === 'archived').length
        };
        setStats(calculatedStats);
      }

      console.log('Programs loaded from API:', programsData);
    } catch (err) {
      console.error('Error fetching programs:', err);
      toast.error('Không thể tải danh sách chương trình!', { position: 'top-right' });
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
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Helper function để format ngày
  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleToggleActive = async (programId, currentIsActive, e) => {
    e.stopPropagation(); // Prevent row click navigation

    // Prevent double click
    if (togglingId === programId) return;

    try {
      setTogglingId(programId);
      const newIsActive = !currentIsActive;

      // Nếu đang tắt (deactivate), kiểm tra trước
      if (!newIsActive) {
        // Check xem có thể deactivate không
        const checkResult = await centerHeadService.canDeactivateProgram(programId);

        if (!checkResult.canDeactivate) {
          // Hiển thị cảnh báo chi tiết về các course đang active
          const activeCourses = checkResult.activeCourses || [];

          // Tạo message chi tiết
          let warningMessage = `Không thể tạm dừng chương trình!\n\n`;
          warningMessage += `Còn ${activeCourses.length} khóa học đang hoạt động:\n`;

          activeCourses.forEach((course, index) => {
            if (index < 3) { // Chỉ hiển thị 3 course đầu
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

          setTogglingId(null);
          return;
        }

        // Có thể deactivate, tiến hành
        await centerHeadService.deactivateProgram(programId);
      } else {
        // Activate program
        await centerHeadService.activateProgram(programId);
      }

      // Cập nhật state trực tiếp thay vì fetch lại toàn bộ
      setPrograms(prevPrograms =>
        prevPrograms.map(program =>
          program._id === programId
            ? { ...program, isActive: newIsActive }
            : program
        )
      );

      // Cập nhật stats
      setStats(prevStats => ({
        ...prevStats,
        active: newIsActive ? prevStats.active + 1 : prevStats.active - 1
      }));

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
      setTogglingId(null);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterValues, programs, applyFilters]);

  useEffect(() => {
    applyPagination();
  }, [filteredPrograms, currentPage, itemsPerPage, applyPagination]);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Chương trình đào tạo', path: '/center-head/programs' },
  ];

  const filters = [
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

  const columns = [
    {
      header: 'Chương trình',
      field: 'program_name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-1" style={{ fontSize: '0.875rem' }}>{row.program_name}</div>
          <div className="text-neutral-600" style={{ fontSize: '0.75rem' }}>Mã: {row.code}</div>
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
          <span className="badge bg-info-600 text-white" style={{ fontSize: '0.75rem' }}>
            {typeLabels[row.type] || row.type?.toUpperCase() || 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Khóa học',
      field: 'courseCount',
      render: (row) => (
        <span className="text-neutral-700" style={{ fontSize: '0.875rem' }}>{row.courseCount} khóa học</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Người tạo',
      field: 'createdBy',
      render: (row) => (
        <span className="text-neutral-700" style={{ fontSize: '0.875rem' }}>{row.createdBy?.username || 'N/A'}</span>
      ),
    },
    {
      header: 'Cập nhật',
      field: 'updatedAt',
      render: (row) => (
        <span className="text-neutral-700" style={{ fontSize: '0.875rem' }}>{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      header: 'Hoạt động',
      field: 'isActive',
      render: (row) => {
        // Only show toggle for approved programs
        if (row.status !== 'approved') {
          return (
            <span className="text-neutral-500" style={{ fontSize: '0.75rem' }}>
              N/A
            </span>
          );
        }

        const isToggling = togglingId === row._id;

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
                onChange={(e) => handleToggleActive(row._id, row.isActive, e)}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer' }}
                title={row.isActive ? 'Tạm dừng chương trình' : 'Mở chương trình'}
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
        <div className="d-flex gap-2 justify-content-center">
          <Button
            variant="outline"
            size="sm"
            icon="ph ph-eye"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/center-head/programs/${row._id}`);
            }}
          >
            <span className="d-none d-md-inline">Xem</span>
            <span className="d-inline d-md-none">👁</span>
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
    <div className="program-list-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Chương trình đào tạo</h4>
          <p className="text-neutral-600 mb-0">Xem tất cả các chương trình trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Search & Filter */}
      <Card variant="shadow" className="mb-24">
        <div className="d-flex gap-3 align-items-center justify-content-between">
          <SearchBox
            placeholder="Tìm kiếm chương trình..."
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
          data={paginatedPrograms}
          onRowClick={(row) => navigate(`/center-head/programs/${row._id}`)}
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
              Trang {currentPage} / {totalPages} ({filteredPrograms.length} bản ghi)
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

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default ProgramList;
