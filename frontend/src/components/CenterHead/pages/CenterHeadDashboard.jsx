import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../compo/Card';
import Badge from '../compo/Badge';
// import { dashboardAPI } from '../services/api';
import { mockDashboardStats, simulateApiDelay } from '../../../helper/mockdata';

const Dashboard = () => {
  const [stats, setStats] = useState({
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
      // Simulate API call with delay
      await simulateApiDelay(500);
      
      // Use mock data
      setStats({
        pendingCourses: mockDashboardStats.pendingCourses,
        pendingSchedules: mockDashboardStats.pendingSchedules,
      });
      
      // Real API call (commented out)
      // const response = await dashboardAPI.getStats();
      // setStats({
      //   pendingCourses: response.data.pendingCourses || 0,
      //   pendingSchedules: response.data.pendingSchedules || 0,
      // });
      
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
      <div className="d-flex justify-content-center align-items-center min-vh-100">
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
        <h4 className="mb-8 text-neutral-900 fw-bold">Trang chủ</h4>
        <p className="text-neutral-600 mb-0">Chào mừng quay trở lại, Center Head!</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-24" role="alert">
          <i className="ph ph-warning-circle me-2 text-xl"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Pending Tasks Card */}
      <Card title="TÁC VỤ CHỜ DUYỆT" className="shadow-sm">
        <div className="row g-4">
          {/* Pending Courses */}
          <div className="col-12">
            <Link 
              to="/courses/pending" 
              className="d-flex align-items-center justify-content-between p-24 bg-main-25 hover:bg-main-50 radius-8 transition-all text-decoration-none"
            >
              <div className="d-flex align-items-center gap-3">
                <div className="w-56 h-56 bg-main-600 d-flex align-items-center justify-content-center radius-8">
                  <Badge variant="primary" size="lg" className="fs-20 fw-bold">
                    {stats.pendingCourses}
                  </Badge>
                </div>
                <div>
                  <h6 className="mb-4 text-neutral-900 fw-semibold">
                    Giáo trình chờ phê duyệt
                  </h6>
                  <p className="mb-0 text-neutral-600 text-sm">
                    (Từ Subject Leader)
                  </p>
                </div>
              </div>
              <i className="ph ph-caret-right text-2xl text-neutral-400"></i>
            </Link>
          </div>

          {/* Pending Schedules */}
          <div className="col-12">
            <Link 
              to="/schedules/pending" 
              className="d-flex align-items-center justify-content-between p-24 bg-main-two-25 hover:bg-main-two-50 radius-8 transition-all text-decoration-none"
            >
              <div className="d-flex align-items-center gap-3">
                <div className="w-56 h-56 bg-main-two-600 d-flex align-items-center justify-content-center radius-8">
                  <Badge variant="warning" size="lg" className="fs-20 fw-bold">
                    {stats.pendingSchedules}
                  </Badge>
                </div>
                <div>
                  <h6 className="mb-4 text-neutral-900 fw-semibold">
                    Lịch học đặc biệt chờ duyệt
                  </h6>
                  <p className="mb-0 text-neutral-600 text-sm">
                    (Từ Giáo vụ)
                  </p>
                </div>
              </div>
              <i className="ph ph-caret-right text-2xl text-neutral-400"></i>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="row g-4 mt-24">
        <div className="col-md-6">
          <Card className="bg-gradient-main text-white shadow-sm">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h2 className="mb-8 text-white fw-bold">{stats.pendingCourses}</h2>
                <p className="mb-0 text-white-75">Giáo trình chờ duyệt</p>
              </div>
              <div className="w-64 h-64 bg-white-10 d-flex align-items-center justify-content-center radius-circle">
                <i className="ph ph-book-open text-4xl text-white"></i>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-md-6">
          <Card className="bg-gradient-warning text-white shadow-sm">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h2 className="mb-8 text-white fw-bold">{stats.pendingSchedules}</h2>
                <p className="mb-0 text-white-75">Lịch học chờ duyệt</p>
              </div>
              <div className="w-64 h-64 bg-white-10 d-flex align-items-center justify-content-center radius-circle">
                <i className="ph ph-calendar text-4xl text-white"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;