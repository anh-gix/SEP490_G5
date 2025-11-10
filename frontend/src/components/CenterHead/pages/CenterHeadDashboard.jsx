import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../compo/StatCard';
import PendingRequestCard from '../compo/PendingRequestCard';
import QuickActionCard from '../compo/QuickActionCard';
import Button from '../compo/Button';
import Badge from '../compo/Badge';
import { mockDashboardStats, simulateApiDelay } from '../../../helper/mockdata';

const CenterHeadDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    todayClasses: 0,
    completionRate: 0,
    pendingCourses: 0,
    pendingSchedules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(500);

      // Mock data - replace with real API call
      setStats({
        totalStudents: 1250,
        activeCourses: 24,
        todayClasses: 18,
        completionRate: 92,
        pendingCourses: mockDashboardStats.pendingCourses,
        pendingSchedules: mockDashboardStats.pendingSchedules,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-main-600" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="mb-32">
        <h3 className="text-neutral-900 fw-bold mb-8">Bảng Điều Khiển</h3>
        <p className="text-neutral-600 mb-0">Quản lý trung tâm đào tạo của bạn</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-24" role="alert">
          <i className="ph ph-warning-circle me-2 fs-20"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="row g-4 mb-32">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Tổng Học Viên"
            value={stats.totalStudents.toLocaleString()}
            change="+12% so với tháng trước"
            changeType="increase"
            icon="ph ph-users"
            iconBgColor="bg-main-600"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Khóa Học Hoạt Động"
            value={stats.activeCourses}
            change="+3 so với tháng trước"
            changeType="increase"
            icon="ph ph-book-open"
            iconBgColor="bg-success-600"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Lớp Học Hôm Nay"
            value={stats.todayClasses}
            change="+5 so với tuần trước"
            changeType="increase"
            icon="ph ph-calendar"
            iconBgColor="bg-warning-600"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Tỷ Lệ Hoàn Thành"
            value={`${stats.completionRate}%`}
            change="+2% so với tháng trước"
            changeType="increase"
            icon="ph ph-trophy"
            iconBgColor="bg-info-500"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-12 col-lg-8">
          {/* Pending Requests Section */}
          <div className="bg-white rounded-3 p-24 border border-neutral-40 mb-24">
            <div className="d-flex align-items-center justify-content-between mb-20">
              <h5 className="text-neutral-900 fw-semibold mb-0">Yêu Cầu Cần Duyệt</h5>
              <Badge variant="danger" size="md">
                {stats.pendingCourses + stats.pendingSchedules} mới
              </Badge>
            </div>

            <div className="d-flex flex-column gap-3">
              <PendingRequestCard
                title="Tạo Khóa Học"
                subtitle="Trưởng Môn - Anh Văn"
                count={stats.pendingCourses}
                link="/courses/pending"
                icon="ph ph-book-open"
                iconBg="bg-warning-600"
                actionLabel="Chờ Duyệt"
                actions={
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/courses/pending');
                      }}
                    >
                      <i className="ph ph-check"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="ph ph-x"></i>
                    </Button>
                  </>
                }
              />

              <PendingRequestCard
                title="Lịch Học Đặc Biệt Chờ Duyệt"
                subtitle="Từ Giáo vụ"
                count={stats.pendingSchedules}
                link="/schedules/pending"
                icon="ph ph-calendar"
                iconBg="bg-success-600"
                actionLabel="Chờ Duyệt"
                actions={
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/schedules/pending');
                      }}
                    >
                      <i className="ph ph-check"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="ph ph-x"></i>
                    </Button>
                  </>
                }
              />
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-3 p-24 border border-neutral-40">
            <h5 className="text-neutral-900 fw-semibold mb-20">Hành Động Nhanh</h5>

            <div className="row g-3">
              <div className="col-6 col-md-4">
                <QuickActionCard
                  title="Tạo Khóa Học"
                  icon="ph ph-plus-circle"
                  iconBg="bg-success-600"
                  link="/center-head/courses/create"
                />
              </div>
              <div className="col-6 col-md-4">
                <QuickActionCard
                  title="Nhập Học Viên"
                  icon="ph ph-user-plus"
                  iconBg="bg-main-600"
                  link="/center-head/students/import"
                />
              </div>
              <div className="col-6 col-md-4">
                <QuickActionCard
                  title="Xem Báo Cáo"
                  icon="ph ph-chart-line"
                  iconBg="bg-info-500"
                  link="/center-head/reports"
                />
              </div>
              <div className="col-6 col-md-4">
                <QuickActionCard
                  title="Quản Lý Lịch"
                  icon="ph ph-calendar-check"
                  iconBg="bg-warning-600"
                  link="/center-head/schedules"
                />
              </div>
              <div className="col-6 col-md-4">
                <QuickActionCard
                  title="Xem Học Viên"
                  icon="ph ph-users"
                  iconBg="bg-purple-600"
                  link="/center-head/students"
                />
              </div>
              <div className="col-6 col-md-4">
                <QuickActionCard
                  title="Cài Đặt"
                  icon="ph ph-gear"
                  iconBg="bg-neutral-600"
                  link="/center-head/settings"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-12 col-lg-4">
          {/* Quick Stats */}
          <div className="bg-white rounded-3 p-24 border border-neutral-40 mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-20">Thống Kê Nhanh</h5>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-between p-16 bg-light-50 rounded-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="ph ph-check-circle text-success-600 fs-20"></i>
                  <span className="text-neutral-700 fw-medium" style={{ fontSize: '14px' }}>
                    Đã duyệt hôm nay
                  </span>
                </div>
                <span className="text-neutral-900 fw-bold" style={{ fontSize: '16px' }}>12</span>
              </div>

              <div className="d-flex align-items-center justify-content-between p-16 bg-light-50 rounded-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="ph ph-clock text-warning-600 fs-20"></i>
                  <span className="text-neutral-700 fw-medium" style={{ fontSize: '14px' }}>
                    Chờ xử lý
                  </span>
                </div>
                <span className="text-neutral-900 fw-bold" style={{ fontSize: '16px' }}>
                  {stats.pendingCourses + stats.pendingSchedules}
                </span>
              </div>

              <div className="d-flex align-items-center justify-content-between p-16 bg-light-50 rounded-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="ph ph-calendar-check text-main-600 fs-20"></i>
                  <span className="text-neutral-700 fw-medium" style={{ fontSize: '14px' }}>
                    Sự kiện sắp tới
                  </span>
                </div>
                <span className="text-neutral-900 fw-bold" style={{ fontSize: '16px' }}>5</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-3 p-24 border border-neutral-40">
            <h5 className="text-neutral-900 fw-semibold mb-20">Trạng Thái Hệ Thống</h5>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-neutral-600" style={{ fontSize: '14px' }}>
                  Hiệu suất server
                </span>
                <Badge variant="success" size="sm">Tốt</Badge>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success-600"
                  role="progressbar"
                  style={{ width: '92%' }}
                  aria-valuenow="92"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>

              <div className="d-flex align-items-center justify-content-between mt-2">
                <span className="text-neutral-600" style={{ fontSize: '14px' }}>
                  Dung lượng lưu trữ
                </span>
                <Badge variant="warning" size="sm">68%</Badge>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-warning-600"
                  role="progressbar"
                  style={{ width: '68%' }}
                  aria-valuenow="68"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>

              <div className="d-flex align-items-center justify-content-between mt-2">
                <span className="text-neutral-600" style={{ fontSize: '14px' }}>
                  Kết nối database
                </span>
                <Badge variant="success" size="sm">Hoạt động</Badge>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success-600"
                  role="progressbar"
                  style={{ width: '100%' }}
                  aria-valuenow="100"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterHeadDashboard;