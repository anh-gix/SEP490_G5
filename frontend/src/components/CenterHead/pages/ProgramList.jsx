import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import FilterBar from '../compo/FilterBar';
import StatusBadge from '../compo/StatusBadge';
import ActionMenu from '../compo/ActionMenu';
import { programService } from '../../../services/programService';
import { formatDate } from '../../../helper/helper';

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

      if (response.success) {
        setPrograms(response.data || []);
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
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
        <ActionMenu
          actions={[
            {
              label: "Xem chi tiết",
              icon: "ph ph-eye",
              onClick: () => navigate(`/center-head/programs/${row._id}`)
            },
            {
              label: "Chỉnh sửa",
              icon: "ph ph-pencil-simple",
              onClick: () => navigate(`/center-head/programs/${row._id}/edit`)
            },
            {
              label: "Xem PLOs",
              icon: "ph ph-list-bullets",
              onClick: () => navigate(`/center-head/programs/${row._id}/plos`)
            },
          ]}
        />
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
        <Button variant="primary" icon="ph ph-plus" onClick={() => navigate('/center-head/programs/create')}>
          Thêm chương trình
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
