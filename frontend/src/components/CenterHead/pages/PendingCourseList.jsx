import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import Badge from '../compo/Badge';
// import { courseAPI } from '../services/api';
import { mockPendingCourses, simulateApiDelay } from '../../../helper/mockData';
import { formatDate } from '../../../helper/helper';

const PendingCoursesList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      // Simulate API call with delay
      await simulateApiDelay(600);
      
      // Use mock data
      setCourses(mockPendingCourses);
      
      // Real API call (commented out)
      // const response = await courseAPI.getPendingCourses();
      // setCourses(response.data.courses || []);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching pending courses:', err);
      setError('Không thể tải danh sách giáo trình. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (course) => {
    navigate(`/courses/${course._id}/details`);
  };

  const breadcrumbItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Giáo trình chờ duyệt', path: '/courses/pending' },
  ];

  const columns = [
    {
      header: 'Tên giáo trình',
      field: 'name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-4">{row.name}</div>
          {row.program && (
            <div className="text-sm text-neutral-600">
              <i className="ph ph-folder me-1"></i>
              {row.program.program_name} ({row.program.code})
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Người tạo',
      field: 'createdBy',
      render: (row) => (
        <div>
          <div className="text-neutral-900">{row.createdBy?.fullname || 'N/A'}</div>
          <div className="text-sm text-neutral-600">{row.createdBy?.email || ''}</div>
        </div>
      ),
    },
    {
      header: 'Ngày gửi',
      field: 'updatedAt',
      render: (row) => (
        <span className="text-neutral-700">{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => (
        <Badge variant="warning" size="sm">
          <i className="ph ph-clock me-1"></i>
          Chờ duyệt
        </Badge>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <Button
          variant="primary"
          size="sm"
          icon="ph ph-eye"
          onClick={() => handleViewDetails(row)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-courses-container">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Giáo trình chờ phê duyệt</h4>
          <p className="text-neutral-600 mb-0">
            Danh sách các giáo trình đang chờ phê duyệt từ Subject Leader
          </p>
        </div>
        <Button
          variant="outline"
          icon="ph ph-arrows-clockwise"
          onClick={fetchPendingCourses}
        >
          Làm mới
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-24" role="alert">
          <i className="ph ph-warning-circle me-2 text-xl"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="row g-4 mb-24">
        <div className="col-md-4">
          <Card className="bg-main-25">
            <div className="d-flex align-items-center gap-3">
              <div className="w-48 h-48 bg-main-600 d-flex align-items-center justify-content-center radius-8">
                <i className="ph ph-book-open text-2xl text-white"></i>
              </div>
              <div>
                <h5 className="mb-0 text-neutral-900 fw-bold">{courses.length}</h5>
                <p className="mb-0 text-neutral-600 text-sm">Tổng giáo trình</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={courses}
          onRowClick={handleViewDetails}
        />
      </Card>
    </div>
  );
};

export default PendingCoursesList;