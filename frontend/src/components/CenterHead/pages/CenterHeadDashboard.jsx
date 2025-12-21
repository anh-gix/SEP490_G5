import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../compo/Badge";
import centerHeadService from "../../../services/centerHeadService";
import {
  // Mock data for fallback
  mockDashboardStats,
  mockPendingWorkRequests,
  mockPendingActivation,
  mockRecentActivities,
  // Helper functions
  getRequestTypeLabel,
  getRequestTypeIcon,
  getRequestTypeBgColor,
  getDirectionBadgeVariant,
  getEntityTypeIcon,
  getEntityTypeBgColor,
  getActionLabel,
  getActionColor,
  formatRelativeTime,
} from "../../../helper/centerHeadDashboardMockData";

const CenterHeadDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingActivation, setPendingActivation] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Try to fetch from API first
      const response = await centerHeadService.getDashboard();

      if (response.success) {
        setStats(response.data.stats);
        setPendingRequests(response.data.pendingRequests || []);
        setPendingActivation(response.data.pendingActivation || []);
        setRecentActivities(response.data.recentActivities || []);
      } else {
        throw new Error(response.message || "Failed to fetch dashboard data");
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Fallback to mock data if API fails
      console.log("Falling back to mock data...");
      setStats(mockDashboardStats);
      setPendingRequests(mockPendingWorkRequests);
      setPendingActivation(mockPendingActivation);
      setRecentActivities(mockRecentActivities);
      // Don't show error to user when using mock data
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Lấy tên entity để hiển thị
  const getEntityName = (request) => {
    if (request.entityId) {
      return (
        request.entityId.program_name ||
        request.entityId.title ||
        request.entityId.name ||
        request.entityId.code ||
        "N/A"
      );
    }
    return "N/A";
  };

  // Lấy người thực hiện (người hoàn thành công việc)
  const getSubmitter = (request) => {
    if (request.direction === "top_down") {
      // Top-down: người được giao việc hoàn thành
      return request.assignedTo?.name || request.processedBy?.name || "N/A";
    } else {
      // Bottom-up: người tạo request
      return request.requestedBy?.name || "N/A";
    }
  };

  // Handle activate/publish item
  const handleActivatePublish = async (item) => {
    try {
      let response;
      if (item.type === "exam") {
        response = await centerHeadService.publishExam(item._id);
      } else if (item.type === "course") {
        response = await centerHeadService.activateCourse(item._id);
      } else {
        response = await centerHeadService.activateProgram(item._id);
      }

      if (response.success) {
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        console.error("Failed to activate/publish:", response.message);
      }
    } catch (err) {
      console.error("Error activating/publishing:", err);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
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
        <p className="text-neutral-600 mb-0">
          Xin chào! Đây là tổng quan hoạt động của trung tâm.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center mb-24"
          role="alert"
        >
          <i className="ph ph-warning-circle me-2 fs-20"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="row g-4 mb-32">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="bg-white rounded-3 p-24 border border-neutral-40 h-100">
            <div className="d-flex align-items-start justify-content-between">
              <div className="flex-grow-1">
                <p
                  className="text-neutral-600 mb-8 fw-medium"
                  style={{ fontSize: "14px" }}
                >
                  Chương Trình
                </p>
                <h2
                  className="text-neutral-900 fw-bold mb-0"
                  style={{ fontSize: "32px" }}
                >
                  {stats?.programs?.active || 0}
                  <span
                    className="text-neutral-400 fw-normal"
                    style={{ fontSize: "16px" }}
                  >
                    /{stats?.programs?.total || 0}
                  </span>
                </h2>
                <p
                  className="text-neutral-500 mb-0 mt-8"
                  style={{ fontSize: "13px" }}
                >
                  đang hoạt động
                </p>
              </div>
              <div
                className="bg-main-600 d-flex align-items-center justify-content-center rounded-2"
                style={{ width: "56px", height: "56px", flexShrink: 0 }}
              >
                <i
                  className="ph ph-graduation-cap text-white"
                  style={{ fontSize: "28px" }}
                ></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="bg-white rounded-3 p-24 border border-neutral-40 h-100">
            <div className="d-flex align-items-start justify-content-between">
              <div className="flex-grow-1">
                <p
                  className="text-neutral-600 mb-8 fw-medium"
                  style={{ fontSize: "14px" }}
                >
                  Khóa Học
                </p>
                <h2
                  className="text-neutral-900 fw-bold mb-0"
                  style={{ fontSize: "32px" }}
                >
                  {stats?.courses?.active || 0}
                  <span
                    className="text-neutral-400 fw-normal"
                    style={{ fontSize: "16px" }}
                  >
                    /{stats?.courses?.total || 0}
                  </span>
                </h2>
                <p
                  className="text-neutral-500 mb-0 mt-8"
                  style={{ fontSize: "13px" }}
                >
                  đang hoạt động
                </p>
              </div>
              <div
                className="bg-success-600 d-flex align-items-center justify-content-center rounded-2"
                style={{ width: "56px", height: "56px", flexShrink: 0 }}
              >
                <i
                  className="ph ph-book-open text-white"
                  style={{ fontSize: "28px" }}
                ></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="bg-white rounded-3 p-24 border border-neutral-40 h-100">
            <div className="d-flex align-items-start justify-content-between">
              <div className="flex-grow-1">
                <p
                  className="text-neutral-600 mb-8 fw-medium"
                  style={{ fontSize: "14px" }}
                >
                  Đề Thi
                </p>
                <h2
                  className="text-neutral-900 fw-bold mb-0"
                  style={{ fontSize: "32px" }}
                >
                  {stats?.exams?.published || 0}
                  <span
                    className="text-neutral-400 fw-normal"
                    style={{ fontSize: "16px" }}
                  >
                    /{stats?.exams?.total || 0}
                  </span>
                </h2>
                <p
                  className="text-neutral-500 mb-0 mt-8"
                  style={{ fontSize: "13px" }}
                >
                  đã xuất bản
                </p>
              </div>
              <div
                className="bg-purple-600 d-flex align-items-center justify-content-center rounded-2"
                style={{ width: "56px", height: "56px", flexShrink: 0 }}
              >
                <i
                  className="ph ph-exam text-white"
                  style={{ fontSize: "28px" }}
                ></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="bg-white rounded-3 p-24 border border-neutral-40 h-100">
            <div className="d-flex align-items-start justify-content-between">
              <div className="flex-grow-1">
                <p
                  className="text-neutral-600 mb-8 fw-medium"
                  style={{ fontSize: "14px" }}
                >
                  Chờ Duyệt
                </p>
                <h2
                  className="text-warning-600 fw-bold mb-0"
                  style={{ fontSize: "32px" }}
                >
                  {pendingRequests.length || 0}
                </h2>
                <p
                  className="text-neutral-500 mb-0 mt-8"
                  style={{ fontSize: "13px" }}
                >
                  yêu cầu đang chờ
                </p>
              </div>
              <div
                className="bg-warning-600 d-flex align-items-center justify-content-center rounded-2"
                style={{ width: "56px", height: "56px", flexShrink: 0 }}
              >
                <i
                  className="ph ph-clock text-white"
                  style={{ fontSize: "28px" }}
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Left Column - Pending Requests */}
        <div className="col-12 col-lg-8">
          {/* Pending Work Requests */}
          <div className="bg-white rounded-3 p-24 border border-neutral-40 mb-24">
            <div className="d-flex align-items-center justify-content-between mb-20">
              <div className="d-flex align-items-center gap-12">
                <h5 className="text-neutral-900 fw-semibold mb-0">
                  Yêu Cầu Chờ Duyệt
                </h5>
                <Badge variant="warning" size="sm">
                  {pendingRequests.length} yêu cầu
                </Badge>
              </div>
              <button
                className="btn btn-link text-main-600 fw-medium p-0 text-decoration-none"
                onClick={() => navigate("/center-head/approval-requests")}
                style={{ fontSize: "14px" }}
              >
                Xem tất cả <i className="ph ph-arrow-right ms-1"></i>
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-32">
                <i
                  className="ph ph-check-circle text-success-600 mb-12"
                  style={{ fontSize: "48px" }}
                ></i>
                <p className="text-neutral-600 mb-0">
                  Không có yêu cầu nào đang chờ duyệt
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div
                    key={request._id}
                    className="d-flex align-items-center gap-16 p-16 bg-light-50 rounded-2 border border-neutral-40"
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() =>
                      navigate(
                        `/center-head/approval-requests/${request._id}`
                      )
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.08)";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "";
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`${getRequestTypeBgColor(
                        request.requestType
                      )} d-flex align-items-center justify-content-center rounded-2`}
                      style={{
                        width: "44px",
                        height: "44px",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`ph ${getRequestTypeIcon(
                          request.requestType
                        )} text-white`}
                        style={{ fontSize: "20px" }}
                      ></i>
                    </div>

                    {/* Content */}
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex align-items-center gap-8 mb-4 flex-wrap">
                        <h6
                          className="text-neutral-900 fw-semibold mb-0 text-truncate"
                          style={{ fontSize: "14px", maxWidth: "250px" }}
                        >
                          {getEntityName(request)}
                        </h6>
                        <Badge
                          variant={getDirectionBadgeVariant(request.direction)}
                          size="sm"
                        >
                          {request.direction === "top_down"
                            ? "Đã giao"
                            : "Đề xuất"}
                        </Badge>
                      </div>
                      <div className="d-flex align-items-center gap-8 flex-wrap">
                        <span
                          className="text-neutral-500"
                          style={{ fontSize: "13px" }}
                        >
                          {getRequestTypeLabel(request.requestType)}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span
                          className="text-neutral-500"
                          style={{ fontSize: "13px" }}
                        >
                          {getSubmitter(request)}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span
                          className="text-neutral-400"
                          style={{ fontSize: "13px" }}
                        >
                          {formatRelativeTime(
                            request.processedAt || request.requestedAt
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle approve
                          console.log("Approve:", request._id);
                        }}
                        title="Duyệt"
                      >
                        <i className="ph ph-check"></i>
                      </button>
                      <button
                        className="btn btn-danger btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle reject
                          console.log("Reject:", request._id);
                        }}
                        title="Từ chối"
                      >
                        <i className="ph ph-x"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Activation/Publish */}
          <div className="bg-white rounded-3 p-24 border border-neutral-40">
            <div className="d-flex align-items-center justify-content-between mb-20">
              <div className="d-flex align-items-center gap-12">
                <h5 className="text-neutral-900 fw-semibold mb-0">
                  Chờ Kích Hoạt / Xuất Bản
                </h5>
                <Badge variant="info" size="sm">
                  {pendingActivation.length}
                </Badge>
              </div>
            </div>

            {pendingActivation.length === 0 ? (
              <div className="text-center py-32">
                <i
                  className="ph ph-check-circle text-success-600 mb-12"
                  style={{ fontSize: "48px" }}
                ></i>
                <p className="text-neutral-600 mb-0">
                  Tất cả đã được kích hoạt/xuất bản
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {pendingActivation.map((item) => (
                  <div key={item._id} className="col-12 col-md-6">
                    <div className="p-16 bg-light-50 rounded-2 border border-neutral-40 h-100">
                      <div className="d-flex align-items-start gap-12">
                        {/* Icon */}
                        <div
                          className={`${getEntityTypeBgColor(
                            item.type
                          )} d-flex align-items-center justify-content-center rounded-2`}
                          style={{
                            width: "40px",
                            height: "40px",
                            flexShrink: 0,
                          }}
                        >
                          <i
                            className={`ph ${getEntityTypeIcon(
                              item.type
                            )} text-white`}
                            style={{ fontSize: "18px" }}
                          ></i>
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1 min-width-0">
                          <h6
                            className="text-neutral-900 fw-semibold mb-4 text-truncate"
                            style={{ fontSize: "14px" }}
                          >
                            {item.name}
                          </h6>
                          <p
                            className="text-neutral-500 mb-8 text-truncate"
                            style={{ fontSize: "13px" }}
                          >
                            {item.code || item.description}
                          </p>
                          <div className="d-flex align-items-center gap-8">
                            <Badge variant="secondary" size="sm">
                              {item.type === "program"
                                ? "Chương trình"
                                : item.type === "course"
                                ? "Khóa học"
                                : "Đề thi"}
                            </Badge>
                            <span
                              className="text-neutral-400"
                              style={{ fontSize: "12px" }}
                            >
                              Duyệt: {formatRelativeTime(item.approvedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-12 pt-12 border-top border-neutral-100">
                        <button
                          className="btn btn-main-600 btn-sm w-100"
                          onClick={() => handleActivatePublish(item)}
                        >
                          <i
                            className={`ph ${
                              item.type === "exam" ? "ph-globe" : "ph-power"
                            } me-2`}
                          ></i>
                          {item.type === "exam" ? "Xuất bản" : "Kích hoạt"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Recent Activities */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-3 p-24 border border-neutral-40">
            <h5 className="text-neutral-900 fw-semibold mb-20">
              Hoạt Động Gần Đây
            </h5>

            {recentActivities.length === 0 ? (
              <div className="text-center py-24">
                <p
                  className="text-neutral-500 mb-0"
                  style={{ fontSize: "14px" }}
                >
                  Chưa có hoạt động nào
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-16">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity._id}
                    className={`d-flex gap-12 ${
                      index !== recentActivities.length - 1
                        ? "pb-16 border-bottom border-neutral-100"
                        : ""
                    }`}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`rounded-circle ${
                        activity.action === "approved" ||
                        activity.action === "activated" ||
                        activity.action === "published"
                          ? "bg-success-600"
                          : activity.action === "rejected"
                          ? "bg-danger-600"
                          : "bg-main-600"
                      }`}
                      style={{
                        width: "8px",
                        height: "8px",
                        marginTop: "6px",
                        flexShrink: 0,
                      }}
                    ></div>

                    {/* Content */}
                    <div className="flex-grow-1">
                      <p className="mb-4" style={{ fontSize: "13px" }}>
                        <span className={getActionColor(activity.action)}>
                          {getActionLabel(activity.action)}
                        </span>{" "}
                        <span className="text-neutral-700 fw-medium">
                          {activity.entityName}
                        </span>
                      </p>
                      <p
                        className="text-neutral-400 mb-0"
                        style={{ fontSize: "12px" }}
                      >
                        {formatRelativeTime(activity.performedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterHeadDashboard;
