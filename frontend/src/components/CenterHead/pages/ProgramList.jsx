import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import FilterBar from '../compo/FilterBar';
import StatusBadge from '../compo/StatusBadge';
import { formatDate } from '../../../helper/helper';
import programService from '../../../services/programService';

const ProgramList = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, archived: 0 });

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterValues, programs]);

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
      alert('Không thể tải danh sách chương trình!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (programId, programName) => {
    const confirmMessage = `⚠️ CẢNH BÁO: Bạn có chắc muốn xóa chương trình "${programName}"?\n\n` +
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

      // Reload programs after deletion
      await fetchPrograms();

      alert('Đã xóa chương trình và toàn bộ dữ liệu liên quan thành công!');
    } catch (err) {
      console.error('Error deleting program:', err);
      alert(err.message || 'Có lỗi xảy ra khi xóa chương trình.');
    }
  };

  const applyFilters = () => {
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

    setFilteredPrograms(filtered);
  };

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
    }
  ];

  const columns = [
    {
      header: 'Chương trình',
      field: 'program_name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-4">{row.program_name}</div>
          <div className="text-sm text-neutral-600">Mã: {row.code}</div>
        </div>
      ),
    },
    {
      header: 'PLOs',
      field: 'plos',
      render: (row) => (
        <span className="text-neutral-700">{row.plos?.length || 0} PLOs</span>
      ),
    },
    {
      header: 'Khóa học',
      field: 'courseCount',
      render: (row) => (
        <span className="text-neutral-700">{row.courseCount} khóa học</span>
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
        <span className="text-neutral-700">{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/center-head/programs/${row._id}`);
            }}
            title="Xem chi tiết"
          >
            <i className="ph ph-eye"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/center-head/programs/${row._id}/edit`);
            }}
            title="Chỉnh sửa"
          >
            <i className="ph ph-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProgram(row._id, row.program_name);
            }}
            title="Xóa chương trình"
          >
            <i className="ph ph-trash"></i>
          </button>
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
          <p className="text-neutral-600 mb-0">Quản lý các chương trình và PLOs</p>
        </div>
        <Button
          variant="primary"
          icon="ph ph-plus"
          onClick={() => navigate('/center-head/programs/create')}
        >
          Tạo chương trình mới
        </Button>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-24">
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng Programs</h6>
            <h4 className="text-neutral-900 fw-bold mb-0">{stats.total}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Đang hoạt động</h6>
            <h4 className="text-success-600 fw-bold mb-0">{stats.active}</h4>
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
            <h6 className="text-neutral-600 mb-8">Đã lưu trữ</h6>
            <h4 className="text-neutral-600 fw-bold mb-0">{stats.archived}</h4>
          </Card>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-24">
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
      <Card>
        <Table
          columns={columns}
          data={filteredPrograms}
          onRowClick={(row) => navigate(`/center-head/programs/${row._id}`)}
        />
      </Card>
    </div>
  );
};

export default ProgramList;
