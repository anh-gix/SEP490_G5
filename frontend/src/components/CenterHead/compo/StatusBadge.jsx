/**
 * StatusBadge Component
 *
 * Badge hiển thị trạng thái với màu sắc tương ứng
 *
 * @param {string} status - Trạng thái: active, inactive, pending, approved, rejected, draft, etc.
 * @param {string} label - Text hiển thị (optional, sẽ dùng status nếu không có)
 * @param {string} size - Kích thước: sm, md, lg (default: md)
 */
const StatusBadge = ({ status, label, size = "md" }) => {
  const statusConfig = {
    // User & General
    active: { variant: "success", icon: "ph-check-circle", text: "Đang hoạt động" },
    inactive: { variant: "danger", icon: "ph-x-circle", text: "Không hoạt động" },
    pending: { variant: "warning", icon: "ph-clock", text: "Chờ duyệt" },

    // Course & Program
    draft: { variant: "secondary", icon: "ph-file-dashed", text: "Bản nháp" },
    pending_approval: { variant: "warning", icon: "ph-clock", text: "Chờ phê duyệt" },
    approved: { variant: "success", icon: "ph-check-circle", text: "Đã duyệt" },
    needs_revision: { variant: "danger", icon: "ph-arrow-counter-clockwise", text: "Cần chỉnh sửa" },
    archived: { variant: "neutral", icon: "ph-archive", text: "Đã lưu trữ" },
    disabled: { variant: "neutral", icon: "ph-prohibit", text: "Vô hiệu hóa" },

    // Schedule
    scheduled: { variant: "success", icon: "ph-calendar-check", text: "Đã xếp lịch" },
    pending_schedule: { variant: "warning", icon: "ph-calendar", text: "Chờ xếp lịch" },
    rejected: { variant: "danger", icon: "ph-x-circle", text: "Bị từ chối" },
    temporary: { variant: "warning", icon: "ph-clock-clockwise", text: "Buổi tạm" },
    fixed: { variant: "success", icon: "ph-calendar-check", text: "Buổi cố định" },

    // Room
    available: { variant: "success", icon: "ph-check", text: "Có sẵn" },
    in_use: { variant: "primary", icon: "ph-users", text: "Đang sử dụng" },
    maintenance: { variant: "warning", icon: "ph-wrench", text: "Bảo trì" },

    // Exam & Submission
    published: { variant: "success", icon: "ph-book-open", text: "Đã xuất bản" },
    completed: { variant: "success", icon: "ph-check-circle", text: "Hoàn thành" },
    graded: { variant: "primary", icon: "ph-star", text: "Đã chấm" },
    "in-progress": { variant: "info", icon: "ph-circle-notch", text: "Đang làm" },
    "partially-submitted": { variant: "warning", icon: "ph-warning", text: "Nộp một phần" },

    // Attendance
    present: { variant: "success", icon: "ph-check", text: "Có mặt" },
    absent: { variant: "danger", icon: "ph-x", text: "Vắng" },
    late: { variant: "warning", icon: "ph-clock", text: "Muộn" },
    excused: { variant: "info", icon: "ph-info", text: "Có phép" },
  };

  const config = statusConfig[status] || {
    variant: "secondary",
    icon: "ph-circle",
    text: status,
  };

  const displayText = label || config.text;

  const variantClass = {
    success: "bg-success-50 text-success-600 border-success-100",
    danger: "bg-danger-50 text-danger-600 border-danger-100",
    warning: "bg-warning-50 text-warning-600 border-warning-100",
    primary: "bg-main-50 text-main-600 border-main-100",
    info: "bg-info-50 text-info-600 border-info-100",
    secondary: "bg-neutral-50 text-neutral-600 border-neutral-100",
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
  }[config.variant];

  const sizeClass = {
    sm: "px-8 py-2 text-xs",
    md: "px-12 py-4 text-sm",
    lg: "px-16 py-6 text-base",
  }[size];

  return (
    <span
      className={`status-badge d-inline-flex align-items-center gap-1 rounded-pill border fw-semibold ${variantClass} ${sizeClass}`}
    >
      <i className={`${config.icon}`}></i>
      <span>{displayText}</span>
    </span>
  );
};

export default StatusBadge;
