import { useEffect, useState } from 'react';
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
import examService from '../../../services/examService';
import { formatDate } from '../../../helper/helper';

const ExamList = ({ viewMode = 'center-head' }) => {
  const navigate = useNavigate();

  // Determine base path
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';
  const isViewOnly = viewMode === 'center-head';
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterValues, exams]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllExamsForManagement();

      if (response.success) {
        setExams(response.data || []);
      } else {
        console.error('Failed to fetch exams:', response.message);
        toast.error(response.message || 'Không thể tải danh sách đề thi', { position: 'top-right' });
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Không thể tải danh sách đề thi', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...exams];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(exam =>
        exam.title?.toLowerCase().includes(keyword)
      );
    }

    if (filterValues.published && filterValues.published !== "all") {
      const isPublished = filterValues.published === "published";
      filtered = filtered.filter(exam => exam.isPublished === isPublished);
    }

    if (filterValues.level && filterValues.level !== "all") {
      filtered = filtered.filter(exam => exam.level === filterValues.level);
    }

    setFilteredExams(filtered);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý đề thi', path: '/center-head/exams' },
  ];

  const filters = [
    {
      key: "published",
      label: "Xuất bản",
      options: [
        { value: "published", label: "Đã xuất bản" },
        { value: "draft", label: "Bản nháp" },
      ]
    },
    {
      key: "level",
      label: "Level",
      options: [
        { value: "Academic", label: "Academic" },
        { value: "General", label: "General" },
      ]
    }
  ];

  const columns = [
    {
      header: 'Đề thi',
      field: 'title',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-4">{row.title}</div>
          <div className="text-sm text-neutral-600">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Loại / Level',
      field: 'examType',
      render: (row) => (
        <div>
          <div className="text-neutral-900 text-capitalize">{row.examType}</div>
          <div className="text-sm text-neutral-600">{row.level}</div>
        </div>
      ),
    },
    {
      header: 'Thời gian',
      field: 'totalDuration',
      render: (row) => (
        <span className="text-neutral-700">{row.totalDuration} phút</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'isPublished',
      render: (row) => (
        <StatusBadge
          status={row.isPublished ? 'published' : 'draft'}
          size="sm"
        />
      ),
    },
    {
      header: 'Người tạo',
      field: 'createdBy',
      render: (row) => (
        <span className="text-neutral-700">{row.createdBy?.username || 'N/A'}</span>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          {/* Nút Xem */}
          <Button
            variant="outline"
            size="sm"
            icon="ph ph-eye"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${basePath}/exams/${row._id}`);
            }}
          >
            Xem
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
    <div className="exam-list-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">{isViewOnly ? 'Danh sách đề thi' : 'Quản lý đề thi'}</h4>
          <p className="text-neutral-600 mb-0">{isViewOnly ? 'Xem tất cả các đề thi trong hệ thống' : 'Quản lý đề thi và bài làm'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-24">
        <div className="col-md-4">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng đề thi</h6>
            <h4 className="text-neutral-900 fw-bold mb-0">{exams.length}</h4>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <h6 className="text-neutral-600 mb-8">Đã xuất bản</h6>
            <h4 className="text-success-600 fw-bold mb-0">
              {exams.filter(exam => exam.isPublished).length}
            </h4>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <h6 className="text-neutral-600 mb-8">Bản nháp</h6>
            <h4 className="text-warning-600 fw-bold mb-0">
              {exams.filter(exam => !exam.isPublished).length}
            </h4>
          </Card>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-24">
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
      <Card>
        <Table
          columns={columns}
          data={filteredExams}
          onRowClick={(row) => navigate(`${basePath}/exams/${row._id}`)}
        />
      </Card>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default ExamList;
