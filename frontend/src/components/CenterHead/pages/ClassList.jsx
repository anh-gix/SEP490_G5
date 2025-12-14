import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import StatusBadge from '../compo/StatusBadge';
import { mockClasses, mockClassStats, simulateApiDelay } from '../../../helper/mockdataExtended';

const ClassList = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, classes]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(500);
      setClasses(mockClasses);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...classes];
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(cls =>
        cls.name?.toLowerCase().includes(keyword) ||
        cls.subject?.toLowerCase().includes(keyword)
      );
    }
    setFilteredClasses(filtered);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý lớp học', path: '/center-head/classes' },
  ];

  const columns = [
    {
      header: 'Lớp học',
      field: 'name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-4">{row.name}</div>
          <div className="text-sm text-neutral-600">{row.subject}</div>
        </div>
      ),
    },
    {
      header: 'Giảng viên',
      field: 'teacher',
      render: (row) => (
        <div>
          <div className="text-neutral-900">{row.teacher?.fullname}</div>
          <div className="text-sm text-neutral-600">{row.teacher?.email}</div>
        </div>
      ),
    },
    {
      header: 'Học viên',
      field: 'studentCount',
      render: (row) => (
        <span className="text-neutral-700">{row.studentCount} học viên</span>
      ),
    },
    {
      header: 'Lịch học',
      field: 'scheduleStatus',
      render: (row) => (
        <StatusBadge
          status={row.scheduleStatus === 'scheduled' ? 'scheduled' : 'pending_schedule'}
          size="sm"
        />
      ),
    },
    {
      header: 'Điểm danh',
      field: 'attendanceRate',
      render: (row) => (
        <div>
          <div className="text-neutral-900">{row.attendanceRate}%</div>
          <div className="progress" style={{ height: '4px' }}>
            <div
              className="progress-bar bg-success-600"
              style={{ width: `${row.attendanceRate}%` }}
            ></div>
          </div>
        </div>
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
              navigate(`/center-head/classes/${row._id}`);
            }}
            title="Xem chi tiết"
          >
            <i className="ph ph-eye"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-info"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/center-head/classes/${row._id}/students`);
            }}
            title="Quản lý học viên"
          >
            <i className="ph ph-users"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/center-head/classes/${row._id}/schedules`);
            }}
            title="Xem lịch học"
          >
            <i className="ph ph-calendar"></i>
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
    <div className="class-list-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý lớp học</h4>
          <p className="text-neutral-600 mb-0">Quản lý tất cả lớp học trong trung tâm</p>
        </div>
        <Button variant="primary" icon="ph ph-plus" onClick={() => navigate('/center-head/classes/create')}>
          Tạo lớp mới
        </Button>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-24">
        <div className="col-md-4">
          <Card>
            <h6 className="text-neutral-600 mb-8">Lớp đang hoạt động</h6>
            <h4 className="text-neutral-900 fw-bold mb-0">{mockClassStats.totalActive}</h4>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng học viên</h6>
            <h4 className="text-neutral-900 fw-bold mb-0">{mockClassStats.totalStudents.toLocaleString()}</h4>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tỷ lệ điểm danh TB</h6>
            <h4 className="text-success-600 fw-bold mb-0">{mockClassStats.averageAttendance}%</h4>
          </Card>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-24">
        <SearchBox
          placeholder="Tìm kiếm lớp học..."
          value={searchKeyword}
          onChange={setSearchKeyword}
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredClasses}
          onRowClick={(row) => navigate(`/center-head/classes/${row._id}`)}
        />
      </Card>
    </div>
  );
};

export default ClassList;
